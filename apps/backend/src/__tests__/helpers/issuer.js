/**
 * A local stand-in for Auth0 in tests: serves the discovery document and
 * signing keys, and signs tokens with locally generated keys, so no network
 * or Auth0 account is needed. (Not matched by `node --test`'s file patterns,
 * so it only runs when a test imports it.)
 */

import { createPublicKey, createSign, generateKeyPairSync, randomUUID } from "node:crypto";
import http from "node:http";

export const AUDIENCE = "https://api.test";
const KID = "test-key";

const signingKey = generateKeyPairSync("rsa", { modulusLength: 2048 }).privateKey;
export const otherKey = generateKeyPairSync("rsa", { modulusLength: 2048 }).privateKey;

export const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
export const now = () => Math.floor(Date.now() / 1000);

export const listen = (server) =>
  new Promise((resolve) => {
    server.listen(0, () => resolve(`http://localhost:${server.address().port}`));
  });

export function close(...servers) {
  for (const server of servers) {
    server.close();
    server.closeAllConnections();
  }
}

// Starts the fake issuer. Returns its URL (with trailing slash, as Auth0's
// `iss` has), a token signer bound to it, and the server to close afterwards.
export async function startIssuer() {
  let issuer;
  const server = http.createServer((req, res) => {
    res.setHeader("Content-Type", "application/json");
    if (req.url === "/.well-known/openid-configuration") {
      res.end(JSON.stringify({ issuer, jwks_uri: `${issuer}jwks.json` }));
    } else {
      const jwk = { ...createPublicKey(signingKey).export({ format: "jwk" }), kid: KID, alg: "RS256", use: "sig" };
      res.end(JSON.stringify({ keys: [jwk] }));
    }
  });
  issuer = `${await listen(server)}/`;

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

  return { issuer, makeToken, server };
}
