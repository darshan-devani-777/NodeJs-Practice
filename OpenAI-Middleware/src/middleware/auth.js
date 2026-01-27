require("dotenv").config();

/**
 * `x-api-key` = `API_GATEWAY_KEY` env 
 */
function authMiddleware(req, res, next) {
  console.log("🛡️ [AUTH] Incoming request", {
    path: req.path,
    method: req.method,
    hasApiKeyHeader: !!req.header("x-api-key"),
  });

  const configuredKey = process.env.API_GATEWAY_KEY;

  if (!configuredKey) {
    console.log("🛡️ [AUTH] No API_GATEWAY_KEY configured, skipping auth");
    return next();
  }

  const apiKey = req.header("x-api-key");

  if (!apiKey || apiKey !== configuredKey) {
    console.warn("🛡️ [AUTH] Unauthorized request", {
      path: req.path,
      method: req.method,
    });
    return res.status(401).json({
      status: false,
      message: "Unauthorized: invalid API key",
    });
  }

  console.log("🛡️ [AUTH] Authenticated request", {
    path: req.path,
    method: req.method,
  });

  return next();
}

module.exports = authMiddleware;


