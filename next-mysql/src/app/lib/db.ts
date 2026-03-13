import mysql from "mysql2/promise"
import dotenv from "dotenv"
import path from "path"

dotenv.config({
  path: path.resolve(process.cwd(), ".env")
})

export const db = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});