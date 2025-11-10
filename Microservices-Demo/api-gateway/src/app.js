const express = require("express");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");

const app = express();

app.use(cors());

app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:3000";
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || "http://localhost:4000";

const commonProxyOptions = {
  changeOrigin: true,
  onError(err, req, res) {
    console.error("Proxy error:", err.code || err.message);
    res.status(502).json({
      error: "Bad Gateway",
      message: err.code || err.message,
      path: req.originalUrl,
    });
  },
};

app.use(
    "/api/users",
    createProxyMiddleware({
      target: USER_SERVICE_URL,
      pathRewrite: { "^/api/users": "" }, 
      logLevel: "debug",
      ...commonProxyOptions,
    })
  );
  
  app.use(
    "/api/products",
    createProxyMiddleware({
      target: PRODUCT_SERVICE_URL,
      pathRewrite: { "^/api/products": "" }, 
      logLevel: "debug",
      ...commonProxyOptions,
    })
  );
  

app.get("/_echo/*", (req, res) => {
  res.json({ path: req.originalUrl });
});

app.use((req, res) => {
  res.status(404).json({ error: "Not Found", path: req.originalUrl });
});

module.exports = app;


