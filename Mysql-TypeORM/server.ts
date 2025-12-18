import "reflect-metadata";
import express from "express";
import bodyParser from "body-parser";
import { AppDataSource } from "./src/Database/db";
import userRoutes from "./src/Routes/user.routes";
import * as dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(bodyParser.json());
app.use("/users", userRoutes);

AppDataSource.initialize()
  .then(() => {
    console.log("✅ MYSQL Connected...");
    app.listen(PORT, () => {
      console.log(`🚀 Server Start At http://localhost:${PORT}`);
    });
  })
  .catch((error) => console.error("❌ DB Connection Error:", error));
