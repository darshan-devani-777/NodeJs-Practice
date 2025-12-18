const User = require("../models/User");
const { success, error } = require('../utils/response');

exports.registerWithZod = async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return error(res, 'Email already registered', 400, { email: 'A user with this email already exists' });
    }

    const user = new User(req.body);
    await user.save();

    return success(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
      'User registered successfully...',
      201,
      { method: 'zod' }
    );
  } catch (error) {
    console.error("Error in registerWithZod:", error);
    return error(res, 'Server error while registering user', 500, undefined, error);
  }
};
