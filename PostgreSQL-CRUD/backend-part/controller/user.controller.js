const pool = require("../database/db");
const fs = require("fs");
const path = require("path");

// CREATE USER
exports.createUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const image = req.file?.filename;

    const availableDaysArray = JSON.parse(req.body.availableDays);
    const availableDaysString = JSON.stringify(availableDaysArray);

    const result = await pool.query(
      "INSERT INTO users (name, email, image, available_days) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, image, availableDaysString]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating user:", error.message);
    res.status(500).json({ error: "Failed to create user" });
  }
};

// GET USER
exports.getUsers = async (req, res) => {
  const result = await pool.query("SELECT * FROM users");
  res.json(result.rows);
};

// UPDATE USER
exports.updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, email } = req.body;
    const newImage = req.file?.filename;

    console.log("req.body:", req.body);
    console.log("req.file:", req.file);

    let availableDaysParsed = null;

    if (req.body.available_days) {
      try {
        availableDaysParsed = JSON.parse(req.body.available_days);
        console.log("Parsed availableDays:", availableDaysParsed);
      } catch (e) {
        console.error("Error parsing available_days JSON:", e);
        return res.status(400).json({ message: "Invalid JSON format for available_days" });
      }
    } else {
      console.log("No available_days provided or empty/null");
    }

    // Fetch existing user
    const existingUserRes = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [id]
    );
    if (existingUserRes.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const existingUser = existingUserRes.rows[0];

    // Delete old image if new image provided
    if (newImage && existingUser.image) {
      const oldImagePath = path.join(
        __dirname,
        "..",
        "uploads",
        existingUser.image
      );
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    const imageToUpdate = newImage || existingUser.image;

    // Prepare query and values
    const updateQuery = `
      UPDATE users
      SET name = $1, email = $2, image = $3,
          available_days = COALESCE($4::json, available_days)
      WHERE id = $5
      RETURNING *
    `;

    const updateValues = [
      name,
      email,
      imageToUpdate,
      availableDaysParsed ? JSON.stringify(availableDaysParsed) : null,
      id
    ];

    const updatedUserRes = await pool.query(updateQuery, updateValues);

    res.json(updatedUserRes.rows[0]);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
  const id = req.params.id;

  const imgRes = await pool.query("SELECT image FROM users WHERE id = $1", [
    id,
  ]);
  if (imgRes.rows.length) {
    const img = imgRes.rows[0].image;
    if (img) {
      const imgPath = path.join(__dirname, "..", "uploads", img);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
  }
  await pool.query("DELETE FROM users WHERE id = $1", [id]);
  res.json({ message: "User deleted" });
};
