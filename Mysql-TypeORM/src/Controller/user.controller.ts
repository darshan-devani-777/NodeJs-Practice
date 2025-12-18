import { Request, Response } from "express";
import * as userService from "../Service/user.service";
import * as bcrypt from "bcrypt";

function sanitizeUser(user: any) {
  const { password, ...rest } = user;
  return rest;
}

// ADD USER
export const create = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await userService.createUser({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "User Created Successfully...",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      hashedPassword: hashedPassword,
    });
  } catch (error) {
    console.error("Create User Error:", error);
    res.status(500).json({ error: "Internal Server Error..." });
  }
};

// GET ALL USER
export const getAll = async (req: Request, res: Response) => {
  try {
    const users = await userService.getUsers();
    const sanitizedUsers = users.map((user) => sanitizeUser(user));
    res.status(200).json({
      success: true,
      message: "Users Fetched Successfully...",
      data: sanitizedUsers,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error...",
    });
  }
};

// GET SPECIFIC USER
export const getById = async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(+req.params.id);
    res.status(200).json({
      success: true,
      message: "User Fetched Successfully...",
      data: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error...",
    });
  }
};

// UPDATE USER
export const update = async (req: Request, res: Response) => {
  const { password, ...rest } = req.body;
  let updatedData = { ...rest };

  if (password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    updatedData.password = hashedPassword;
  }

  const user = await userService.updateUser(+req.params.id, updatedData);
  res.status(200).json({
    success: true,
    message: "User Updated Successfully...",
    data: sanitizeUser(user),
  });
};

// DELETE USER
export const remove = async (req: Request, res: Response) => {
  const user = await userService.deleteUser(+req.params.id);
  res.status(200).json({
    success: true,
    message: "User Deleted Successfully...",
    user: sanitizeUser(user),
  });
};
