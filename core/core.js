const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const hashPassword = async (password) => {
  try {
    const saltRounds = parseInt(Math.random() * (20 - 1) + 1);
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return { success: true, data: hash };
  } catch (error) {
    return { success: false, data: error };
  }
};

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVICE,
  port: process.env.EMAIL_PORT,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
 
  // tls: {
  //   rejectUnauthorized: false,
  // },
});

const sendMail = async (mailData) => {
  try {
    const data = await transporter.sendMail({
      from: process.env.EMAIL_USER, // sender address
      to: mailData.email, // list of receivers
      subject: mailData.subject, // Subject line
      text: mailData.text, // plain text body
      html: mailData.html, // html body
    });
    return { success: true, message: "Email sent successfully.", data: data };
  } catch (error) {
    return { success: false, data: error, message: error.message };
  }
};

const generateAccessAndRefreshToken = async (user) => {
  const accessToken = await jwt.sign(
    {
      id: user.user_id,
      email: user.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );

  const refreshToken = await jwt.sign(
    {
      id: user.user_id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
  return {
    accessToken,
    refreshToken,
  };
};

module.exports = {
  hashPassword,
  sendMail,
  generateAccessAndRefreshToken,
};
