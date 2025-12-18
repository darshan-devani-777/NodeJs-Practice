const { UserInputError } = require("apollo-server-express");

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    throw new UserInputError("Invalid email format");
  }
  return email;
};

const validatePassword = (password) => {
  if (!password || password.length < 6) {
    throw new UserInputError("Password must be at least 6 characters long");
  }
  return password;
};

const validateName = (name) => {
  if (!name || name.trim().length < 3) {
    throw new UserInputError("Name must be at least 3 characters long");
  }
  return name.trim();
};

const validateRole = (role) => {
  const validRoles = ['user', 'admin'];
  if (!role || !validRoles.includes(role.toLowerCase())) {
    throw new UserInputError("Role must be either 'user' or 'admin'");
  }
  return role.toLowerCase();
};

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  validateRole,
};


