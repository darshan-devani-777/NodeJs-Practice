const User = require('../models/User');
const { success, error } = require('../utils/response');

exports.registerWithYup = async (req, res) => {
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
      { method: 'yup' }
    );

  } catch (err) {
    console.error('Error in registerWithYup:', err.message);
    return error(res, 'Server error while registering user', 500, undefined, err);
  }
};