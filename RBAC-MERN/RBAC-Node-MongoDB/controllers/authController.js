const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, contact, address } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.json({
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        message: "User already exists",
      });

    let assignedRole = "user";

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const caller = await User.findById(decoded.id);

        if (!caller) {
          return res.json({
            statusCode: StatusCodes.UNAUTHORIZED,
            success: false,
            message: "Invalid token user",
          });
        }

        if (role && role !== "user") {
          if (caller.role !== "superadmin") {
            return res.json({
              statusCode: StatusCodes.FORBIDDEN,
              success: false,
              message: "Only superadmin can assign roles other than 'user'",
            });
          }
          assignedRole = role;
        }
      } catch (err) {
        return res.json({
          statusCode: StatusCodes.UNAUTHORIZED,
          success: false,
          message: "Invalid or expired token",
        });
      }
    }

    // Validate contact
    const contactRegex = /^\+(\d{2})\s?(\d{2})\s?(\d{2})\s?(\d{2})\s?(\d{2})\s?(\d{2})$/;
    if (!contactRegex.test(contact)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid contact number. Please provide a 12-digit number.",
      });
    }

    // Validate the address
    if (
      !address ||
      !address.street ||
      !address.city ||
      !address.state ||
      !address.country
    ) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Complete address is required.",
      });
    }

    // Handle image file
    let imagePath = null;
    if (req.file) {
      imagePath = req.file.path;
    }

    // Create the new user
    const user = new User({
      name: name.trim(),
      email: email.trim(),
      password,
      role: assignedRole,
      contact,
      address,
      image: imagePath?.trim(),
    });

    await user.save();

    // Generate JWT token 
    const token = generateToken(user);

    return res.json({
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "User Registered Successfully...",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        contact: user.contact,
        address: user.address,
        image: user.image,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.json({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      message: "Server error",
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res
        .json({ statusCode:StatusCodes.UNAUTHORIZED , success: false, message: "Invalid email or password" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res
        .json({ statusCode:StatusCodes.UNAUTHORIZED , success: false, message: "Invalid email or password" });

    const token = generateToken(user);

    res.json({
      statusCode:StatusCodes.OK,
      success: true,
      message: "User Login Successfully...",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image, 
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.json({ statusCode:StatusCodes.INTERNAL_SERVER_ERROR , success: false, message: "Server error" });
  }
};
