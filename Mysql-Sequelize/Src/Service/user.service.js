const { User } = require('../Model/user.model');
const bcrypt = require('bcrypt');

exports.createUser = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  return await User.create({
    name: data.name,
    email: data.email,
    password: hashedPassword
  });
};

exports.getAllUsers = async () => {
  return await User.findAll();
};

exports.getUserById = async (id) => {
  return await User.findByPk(id);
};

exports.updateUser = async (id, data) => {
  const user = await User.findByPk(id);
  if (!user) return null;

  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
  return await user.update(data);
};

exports.deleteUser = async (id) => {
  const user = await User.findByPk(id);
  if (user) {
    await user.destroy();
    return true;
  }
  return false;
};
