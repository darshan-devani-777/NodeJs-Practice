const pool = require('../database/db');

// CREATE USER
const createUser = async (name, email, image) => {
  const result = await pool.query(
    'INSERT INTO users (name, email, image) VALUES ($1, $2, $3) RETURNING *',
    [name, email, image]
  );
  return result.rows[0];
};

// GET ALL USER
const getAllUsers = async () => {
  const result = await pool.query('SELECT * FROM users ORDER BY id DESC');
  return result.rows;
};

// DELETE USER
const deleteUserById = async (id) => {
  return await pool.query('DELETE FROM users WHERE id = $1', [id]);
};

// GET USER IMAGE BY ID
const getUserImageById = async (id) => {
  const result = await pool.query('SELECT image FROM users WHERE id = $1', [id]);
  return result.rows[0]?.image;
};

module.exports = {
  getAllUsers,
  createUser,
  deleteUserById,
  getUserImageById,
};
