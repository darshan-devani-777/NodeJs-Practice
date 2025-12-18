const jwt = require("jsonwebtoken");
const User = require("../Model/user.model");
const response = require("../Helpers/response");

const handleError = (res) => {
    return response.reply(res, 500, true, 'Internal Server Error...');
};

// ADMIN VERIFY TOKEN
exports.adminVerifyToken = async (req, res, next) => {
  try {
    const authorization = req.headers["authorization"];
    if (authorization === undefined) {
      return response.reply(res , 401 , true , 'Invalid Authorization...');
    }
    let token = authorization.split(" ")[1];
    // console.log(token);
    if (token === undefined) {
      return response.reply(res , 401 , true , 'Unauthorize Token...');
    } else {
      let { adminId } = jwt.verify(token, "Admin");
      // console.log(adminId);
      let admin = await User.findById(adminId);
      // console.log(admin);
      if (admin) {
        req.admin = admin;
        next();
      } else {
        return response.reply(res , 401 , true , 'Invalid Admin (Token)');
      }
    }
  } catch (error) {
    return handleError(res, error);
  }
};

// USER VERIFY TOKEN
exports.userVerifyToken = async (req, res, next) => {
  try {
    const authorization = req.headers["authorization"];
    if (authorization === undefined) {
      return response.reply(res , 401 , true , 'Invalid Authorization...');
    }
    let token = authorization.split(" ")[1];
    //    console.log(token);
    if (token === undefined) {
      return response.reply(res , 401 , true , 'Unauthorize Token...');
    } else {
      let { userId } = jwt.verify(token, "User");
      // console.log(userId);
      let user = await User.findById(userId);
      // console.log(user);
      if (user) {
        req.user = user;
        next();
      } else {
        return response.reply(res , 401 , true , 'Invalid Admin (Token)');
      }
    }
  } catch (error) {
    return handleError(res, error);
  }
};
