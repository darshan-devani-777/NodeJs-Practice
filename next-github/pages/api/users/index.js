import dbConnect from "@/database/mongodb";
import User from "@/models/user";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    const users = await User.find({});
    return res.status(200).json(users);
  }

  if (req.method === "POST") {
    const { name, email, password } = req.body;
    const newUser = await User.create({ name, email, password });
    return res.status(201).json(newUser);
  }
  res.status(405).end();
}
