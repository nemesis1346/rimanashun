import { auth } from "express-oauth2-jwt-bearer";

function optionsFromEnv() {
  const { AUTH0_DOMAIN, AUTH0_AUDIENCE } = process.env;
  if (!AUTH0_DOMAIN || !AUTH0_AUDIENCE) return null;
  return { issuerBaseURL: `https://${AUTH0_DOMAIN}/`, audience: AUTH0_AUDIENCE };
}

// `auth()` throws at startup when its config is missing. Public content routes
// shouldn't go down with it, so only the protected routes fail in that case.
export function createRequireAuth(options = optionsFromEnv()) {
  if (options) return auth(options);

  console.warn("[backend] AUTH0_DOMAIN/AUTH0_AUDIENCE not set; protected routes will return 503");
  return (req, res) => {
    res.status(503).json({ error: "Auth not configured" });
  };
}
