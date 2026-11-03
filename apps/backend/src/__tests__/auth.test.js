/**
 * Tests for token verification on protected routes. Tokens are signed with
 * locally generated keys, and a small local server stands in for Auth0's
 * discovery and key endpoints, so no network or Auth0 account is needed.
 */

import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { createPublicKey, createSign, generateKeyPairSync, randomUUID } from "node:crypto";
import http from "node:http";
import { createApp } from "../app.js";
import { createRequireAuth } from "../auth.js";

const AUDIENCE = "https://api.test";
const KID = "test-key";

const signingKey = generateKeyPairSync("rsa", { modulusLength: 2048 }).privateKey;
const otherKey = generateKeyPairSync("rsa", { modulusLength: 2048 }).privateKey;

const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
const now = () => Math.floor(Date.now() / 1000);

let issuer, issuerServer, appUrl, appServer;

function makeToken({ claims = {}, key = signingKey } = {}) {
  const header = encode({ alg: "RS256", typ: "JWT", kid: KID });
  const payload = encode({
    iss: issuer,
    aud: AUDIENCE,
    sub: "auth0|alice",
    iat: now(),
    exp: now() + 3600,
    jti: randomUUID(),
    ...claims,
  });
  const signature = createSign("RSA-SHA256").update(`${header}.${payload}`).sign(key, "base64url");
  return `${header}.${payload}.${signature}`;
}

const getMe = (token, path = "/v1/me") =>
  fetch(appUrl + path, token ? { headers: { Authorization: `Bearer ${token}` } } : {});

const listen = (server) =>
  new Promise((resolve) => {
    server.listen(0, () => resolve(`http://localhost:${server.address().port}`));
  });

before(async () => {
  issuerServer = http.createServer((req, res) => {
    res.setHeader("Content-Type", "application/json");
    if (req.url === "/.well-known/openid-configuration") {
      res.end(JSON.stringify({ issuer, jwks_uri: `${issuer}jwks.json` }));
    } else {
      const jwk = { ...createPublicKey(signingKey).export({ format: "jwk" }), kid: KID, alg: "RS256", use: "sig" };
      res.end(JSON.stringify({ keys: [jwk] }));
    }
  });
  issuer = `${await listen(issuerServer)}/`;

  const requireAuth = createRequireAuth({ issuerBaseURL: issuer, audience: AUDIENCE });
  appServer = createApp({ requireAuth }).listen(0);
  await new Promise((resolve) => appServer.once("listening", resolve));
  appUrl = `http://localhost:${appServer.address().port}`;
});

after(() => {
  appServer.close();
  issuerServer.close();
  appServer.closeAllConnections();
  issuerServer.closeAllConnections();
});

describe("GET /v1/me", () => {
  it("returns the user from a valid token", async () => {
    const res = await getMe(makeToken());
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { sub: "auth0|alice" });
  });

  it("ignores a user supplied in the request", async () => {
    const res = await getMe(makeToken(), "/v1/me?sub=auth0|mallory");
    assert.deepEqual(await res.json(), { sub: "auth0|alice" });
  });

  it("rejects a missing token, and says how to authenticate", async () => {
    const res = await getMe();
    assert.equal(res.status, 401);
    assert.match(res.headers.get("www-authenticate"), /^Bearer/);
    assert.deepEqual(await res.json(), { error: "unauthorized" });
  });

  const rejected = {
    "a malformed token": () => "not-a-token",
    "a token signed with the wrong key": () => makeToken({ key: otherKey }),
    "an expired token": () => makeToken({ claims: { iat: now() - 7200, exp: now() - 3600 } }),
    "a token for another API": () => makeToken({ claims: { aud: "https://other.test" } }),
    "a token from another issuer": () => makeToken({ claims: { iss: "https://evil.test/" } }),
    "an unsigned token": () =>
      `${encode({ alg: "none", typ: "JWT" })}.${encode({ iss: issuer, aud: AUDIENCE, sub: "auth0|alice", exp: now() + 3600 })}.`,
  };

  for (const [name, token] of Object.entries(rejected)) {
    it(`rejects ${name}`, async () => {
      const res = await getMe(token());
      assert.equal(res.status, 401);
      assert.deepEqual(await res.json(), { error: "invalid_token" });
    });
  }
});

describe("the rest of the API", () => {
  it("keeps public routes open without a token", async () => {
    const res = await fetch(`${appUrl}/health`);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true });
  });

  it("lets browsers send an Authorization header", async () => {
    const res = await fetch(`${appUrl}/v1/me`, { method: "OPTIONS" });
    assert.equal(res.status, 204);
    assert.equal(res.headers.get("access-control-allow-origin"), "*");
    assert.equal(res.headers.get("access-control-allow-headers"), "Authorization");
  });

  it("still returns the 404 shape for unknown routes", async () => {
    const res = await fetch(`${appUrl}/nope`);
    assert.equal(res.status, 404);
    assert.deepEqual(await res.json(), { error: "Not Found" });
  });
});

describe("without Auth0 configured", () => {
  let server, url;

  before(async () => {
    server = createApp({ requireAuth: createRequireAuth(null) }).listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    url = `http://localhost:${server.address().port}`;
  });

  after(() => {
    server.close();
    server.closeAllConnections();
  });

  it("returns 503 on protected routes", async () => {
    const res = await fetch(`${url}/v1/me`);
    assert.equal(res.status, 503);
  });

  it("keeps public routes working", async () => {
    const res = await fetch(`${url}/health`);
    assert.equal(res.status, 200);
  });
});
