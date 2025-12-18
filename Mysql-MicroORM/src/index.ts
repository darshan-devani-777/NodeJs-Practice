import { MikroORM } from "@mikro-orm/core";
import { User } from "./entities/User";
import express, { Request, Response } from "express";
import * as dotenv from "dotenv";
import mikroOrmConfig from "./config/mikro-orm.config";

dotenv.config();

const app = express();
app.use(express.json());

const startServer = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  const em = orm.em.fork();

  app.post("/register", async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = new User();
    user.name = name;
    user.email = email;
    user.password = password;

    await em.persistAndFlush(user);
    res.status(201).json({ message: "User created successfully", user });
  });

  app.post("/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await em.findOne(User, { email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.json({ message: "Login successful", user });
  });

  app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
};

startServer().catch((err) => console.error(err));
