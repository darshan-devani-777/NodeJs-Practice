const express = require("express");
const dotenv = require("dotenv");
const chatRoutes = require("./src/routes/chatRoutes");
const path = require("path");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(express.json());

const allowedOrigins = ["http://localhost:9090", "http://192.168.29.23:9090"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.use("/api", chatRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
