import { Request, Response } from "express";
import { users, User } from "../Model/user.model";

// CREATE USER
export const createUser = (req: Request, res: Response): Response => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({
            success: false,
            message: "Name and Email are required",
        });
    }

    const newUser = new User(users.length + 1, name, email);
    users.push(newUser);

    return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: newUser,
    });
};

// GET ALL USERS
export const getAllUsers = (req: Request, res: Response): Response => {
    return res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        data: users,
    });
};

// GET SPECIFIC USER
export const getUserById = (req: Request, res: Response): Response => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }
    return res.status(200).json({
        success: true,
        message: "User fetched successfully",
        data: user,
    });
};

// UPDATE USER
export const updateUser = (req: Request, res: Response): Response => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    const { name, email } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;

    return res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: user,
    });
};

// DELETE USER
export const deleteUser = (req: Request, res: Response): Response => {
    const index = users.findIndex(u => u.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    const deletedUser = users.splice(index, 1)[0];

    return res.status(200).json({
        success: true,
        message: "User deleted successfully",
        data: deletedUser,
    });
};
