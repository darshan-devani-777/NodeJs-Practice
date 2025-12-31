require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");

const connectDB = require("./src/config/db");
require("./src/crons/location.cron");

const initSocket = require("./src/sockets/socket");

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

const server = http.createServer(app);
initSocket(server);

server.listen(process.env.PORT, "0.0.0.0", () => {
  console.log(
    `🚀 Backend running on http://0.0.0.0:${process.env.PORT}`
  );
});

