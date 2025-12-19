const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const postModel = require("../models/postModel");

const JWT_SECRET = process.env.JWT_SECRET || "admin";

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization token missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

async function registerUser(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email and password are required" });
  }

  try {
    const existing = await userModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
      data: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to register user" });
  }
}

async function loginUser(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to login" });
  }
}

async function getAllUsers(req, res) {
  try {
    const { page, limit, search, sortBy, order, fields } = req.query;

    let fieldsArray = null;
    if (fields) {
      fieldsArray =
        typeof fields === "string"
          ? fields.split(",").map((f) => f.trim())
          : fields;
    }

    const users = await userModel.findAll({
      page,
      limit,
      search,
      sortBy,
      order,
      fields: fieldsArray,
    });

    const sanitized = users.map((user) => {
      const { password, ...rest } = user;
      return rest;
    });

    res
      .status(200)
      .json({ message: "Fetched users successfully", data: sanitized });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
}

async function getUserById(req, res) {
  const userId = parseInt(req.params.id, 10);
  try {
    const user = await userModel.findOne(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { password, ...rest } = user;
    res.status(200).json({ message: "Fetched user successfully", data: rest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
}

async function updateUser(req, res) {
  const userId = parseInt(req.params.id, 10);
  const { name, email } = req.body;

  if (!Number.isFinite(userId)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  if (!name && !email) {
    return res
      .status(400)
      .json({ message: "At least one field (name or email) is required" });
  }

  if (email) {
    try {
      const existing = await userModel.findByEmail(email);
      if (existing && existing.id !== userId) {
        return res.status(409).json({ message: "Email already registered" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to check email" });
    }
  }

  try {
    const user = await userModel.findOne(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await userModel.update(userId, { name, email });
    const { password, ...rest } = updatedUser;

    res.status(200).json({
      message: "User updated successfully",
      data: rest,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update user" });
  }
}

async function deleteUser(req, res) {
  const userId = parseInt(req.params.id, 10);

  if (!Number.isFinite(userId)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  try {
    const user = await userModel.findOne(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await userModel.softDelete(userId);

    res.status(200).json({ message: "User soft-deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete user" });
  }
}

async function getUserStats(req, res) {
  try {
    const stats = await userModel.getStats();
    res.status(200).json({
      message: "User stats fetched successfully",
      data: stats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
}

async function getUserCount(req, res) {
  try {
    const { search } = req.query;
    const count = await userModel.count({ search });
    res.status(200).json({
      message: "User count fetched successfully",
      data: { count },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch count" });
  }
}

async function batchCreateUsers(req, res) {
  const { users: usersData } = req.body;

  if (!Array.isArray(usersData) || usersData.length === 0) {
    return res.status(400).json({ message: "Users array is required" });
  }

  try {
    const hashedUsers = await Promise.all(
      usersData.map(async (user) => {
        if (!user.name || !user.email || !user.password) {
          throw new Error(
            "Name, email and password are required for each user"
          );
        }
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return {
          name: user.name,
          email: user.email,
          password: hashedPassword,
        };
      })
    );

    const results = await userModel.batchCreate(hashedUsers);
    res.status(201).json({
      message: "Users created successfully",
      data: { insertedCount: hashedUsers.length },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create users" });
  }
}

async function registerUserWithPost(req, res) {
  const { name, email, password, createDefaultPost = false } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email and password are required" });
  }

  try {
    const existing = await userModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.createWithTransaction({
      name,
      email,
      password: hashedPassword,
      createDefaultPost,
    });

    res.status(201).json({
      message: "User registered successfully",
      data: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to register user" });
  }
}

async function getUserPosts(req, res) {
  const userId = parseInt(req.params.id, 10);
  const { page, limit, sortBy, order } = req.query;

  if (!Number.isFinite(userId)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  try {
    const user = await userModel.findOne(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const posts = await postModel.findByUserId(userId, {
      page,
      limit,
      sortBy,
      order,
    });

    res.status(200).json({
      message: "User posts fetched successfully",
      data: posts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch user posts" });
  }
}

async function getPostsGroupedByUser(req, res) {
  try {
    const groupedPosts = await postModel.getPostsGroupedByUser();
    res.status(200).json({
      message: "Posts grouped by user fetched successfully",
      data: groupedPosts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch grouped posts" });
  }
}

async function getUsersGroupedByDate(req, res) {
  try {
    const groupedUsers = await userModel.getUsersGroupedByCreationDate();

    const response = groupedUsers.map((group) => ({
      date: group.date,
      userCount: group.userCount,
      users: group.userIds.split(",").map((id, index) => ({
        id: parseInt(id),
        name: group.userNames.split(",")[index],
        email: group.userEmails.split(",")[index],
      })),
    }));

    res.status(200).json({
      message: "Users grouped by creation date fetched successfully",
      data: response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch grouped users" });
  }
}

module.exports = {
  verifyToken,
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
  getUserCount,
  batchCreateUsers,
  registerUserWithPost,
  getUserPosts,
  getPostsGroupedByUser,
  getUsersGroupedByDate,
};
