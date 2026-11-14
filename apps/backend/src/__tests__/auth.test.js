/**
 * Tests for token verification on protected routes, against a local stand-in
 * for Auth0 (see helpers/issuer.js), so no network or Auth0 account is needed.
 */

import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { createApp } from "../app.js";
import { createRequireAuth } from "../auth.js";
import { AUDIENCE, close, encode, now, otherKey, startIssuer } from "./helpers/issuer.js";

let issuer, makeToken, issuerServer, appUrl, appServer;

const getMe = (token, path = "/v1/me") =>
  fetch(appUrl + path, token ? { headers: { Authorization: `Bearer ${token}` } } : {});

before(async () => {
  ({ issuer, makeToken, server: issuerServer } = await startIssuer());

  const requireAuth = createRequireAuth({ issuerBaseURL: issuer, audience: AUDIENCE });
  appServer = createApp({ requireAuth }).listen(0);
  await new Promise((resolve) => appServer.once("listening", resolve));
  appUrl = `http://localhost:${appServer.address().port}`;
});

after(() => close(appServer, issuerServer));

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
    assert.equal(res.headers.get("access-control-allow-headers"), "Authorization, Content-Type");
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

  after(() => close(server));

  it("returns 503 on protected routes", async () => {
    const res = await fetch(`${url}/v1/me`);
    assert.equal(res.status, 503);
  });

  it("keeps public routes working", async () => {
    const res = await fetch(`${url}/health`);
    assert.equal(res.status, 200);
  });
});
