var { db } = require("../models/dbconfig");
var { Sequelize, Op } = require("sequelize");
var { sendMail, generateAccessAndRefreshToken } = require("../core/core");
var { generate } = require("otp-generator");
const { asyncHandler } = require("../utils/asyncHandler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  uploadOnCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinary");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");

const createUser = asyncHandler(async (req, res) => {
  const {
    email,
    password,
    first_name,
    last_name,
    bio,
    email_subscription,
    country,
  } = req.body;
  const { file } = req;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and Password are required.",
      success: false,
    });
  }

  try {
    const existingUser = await db.users.findOne({ where: { email } });

    if (existingUser) {
      return res.status(403).json({
        message: "User with this email already exists!",
        success: false,
      });
    }

    // Generate OTP and expiration
    const otp = generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      digits: true,
      lowerCaseAlphabets: false,
    });
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    let profileImageUrl = "";
    let imageName = "";

    // Handle image upload
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        return res.status(400).json({
          message: "File size exceeded! Maximum 20MB allowed.",
          success: false,
        });
      }

      const uploadedImage = await uploadOnCloudinary(file.path);
      if (uploadedImage?.url) {
        profileImageUrl = uploadedImage.url;
        imageName = file.originalname;
      }

      // Clean up local temp file after upload
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }

    // Create user with unverified status
    const user = await db.users.create({
      email,
      password,
      first_name,
      last_name,
      image_name: imageName,
      profile_image: profileImageUrl,
      bio,
      country,
      email_subscription,
      signup_otp: otp,
      otp_expires_at: otpExpiresAt,
      is_verified: false,
      is_active: false, // inactive until verified
    });

    // Send OTP email
    await sendMail({
      email: email,
      subject: `Welcome to PregaCenter - Verify Your Email`,
      text: `Email Verification`,
      html: `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>PregaCenter Email Verification</title>
          <link
            href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100..700;1,100..700&family=Metrophobic&family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap"
            rel="stylesheet"
          />
          <style>
            body {
              margin: 0px;
            }
            p {
              margin-top: 0px;
              margin-bottom: 0px;
              padding-top: 8px;
              font-family: Nunito, Arial, sans-serif;
            }
            @media screen and (max-width: 1280px) {
              .main-table {
                margin-inline: 80px !important;
              }
            }
            @media screen and (max-width: 992px) {
              .main-table {
                margin-inline: 50px !important;
                margin-block: 40px !important;
                padding-block: 40px !important;
              }
              .welcome-text {
                font-size: 25px !important;
              }
              .logo-text {
                font-size: 18px !important;
              }
            }
            @media screen and (max-width: 768px) {
              .main-table {
                margin-inline: 30px !important;
                margin-block: 30px !important;
                padding-inline: 35px !important;
              }
              .content {
                font-size: 14px !important;
                padding-top: 10px !important;
              }
              .otp {
                font-size: 18px !important;
              }
              .reciever-name {
                padding-top: 20px !important;
              }
            }
            @media screen and (max-width: 640px) {
              .main-table {
                margin-inline: 20px !important;
              }
              .welcome-text {
                font-size: 22px !important;
              }
            }
            @media screen and (max-width: 400px) {
              .main-table {
                margin-inline: 10px !important;
                margin-block: 20px !important;
                padding-inline: 10px !important;
                padding-block: 25px !important;
              }
    
              .reciever-name {
                padding-top: 14px !important;
              }
              .welcome-text {
                font-size: 20px !important;
              }
              .logo-text {
                font-size: 16px !important;
              }
            }
          </style>
        </head>
        <body style="display: flex; justify-content: center; align-items: center">
          <table style="background-color: rgb(252, 252, 252); width: 100%">
            <td>
              <table
                class="main-table"
                cellspacing="0"
                style="
                  border-radius: 10px;
                  background-color: rgba(244, 249, 252, 1);
                  margin-block: 60px;
                  margin-inline: 100px;
                  display: flex;
                  padding: 50px;
                "
              >
                <tr style="display: flex; gap: 10px; align-items: center">
                 <td>
  <img
    src="https://res.cloudinary.com/dfciwmday/image/upload/f_png/v1760604592/prega_center/images/logo_oizdiw.svg"
    alt="PregaCenter Logo"
  />
</td>
<td>
                    <p class="logo-text" style="font-size: 20px; padding-top: 0px">
                      PregaCenter
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p
                      class="welcome-text"
                      style="font-size: 30px; font-weight: 600; font-family: Nunito"
                    >
                      Welcome to PregaCenter!
                    </p>
                  </td>
                </tr>
                <tr>
                  <td
                    class="reciever-name"
                    style="padding-top: 25px; font-family: Nunito"
                  >
                    Dear ${first_name || "User"},
                  </td>
                </tr>
                <tr>
                  <td>
                    <p class="content">
                      Thank you for registering with PregaCenter. To complete your
                      registration, please verify your email address using the OTP
                      below
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p class="otp" style="font-weight: 700; font-size: 20px; text-align: left;">
                      ${otp}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p class="content">
                      This OTP is valid for the next 5 minutes. For your security,
                      please do not share this code with anyone.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p class="content">
                      If you did not request this registration, please ignore this
                      email.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p class="content">
                      If you have any questions, please contact our support team at
                      <a href="mailto:support@pregacenter.io">support@pregacenter.io</a>.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p class="content">Best Regards,</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p class="content">The PregaCenter Team</p>
                  </td>
                </tr>
              </table>
            </td>
          </table>
        </body>
      </html>`,
    });

    return res.status(200).json({
      message:
        "Registration successful! Please check your email for verification OTP.",
      success: true,
      data: {
        user_id: user.user_id,
        email: user.email,
        requires_verification: true,
      },
    });
  } catch (error) {
    console.error("❌ createUser error:", error);
    return res.status(500).json({
      message: error.message || "Something went wrong during registration.",
      success: false,
    });
  }
});

const verifySignupOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      message: "Email and OTP are required.",
      success: false,
    });
  }

  try {
    const user = await db.users.findOne({
      where: {
        email: email,
        is_verified: false,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found or already verified.",
        success: false,
      });
    }

    if (new Date() > user.otp_expires_at) {
      return res.status(400).json({
        message: "OTP has expired. Please request a new one.",
        success: false,
      });
    }

    if (user.signup_otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP. Please try again.",
        success: false,
      });
    }

    await db.users.update(
      {
        is_verified: true,
        is_active: true,
        signup_otp: null,
        otp_expires_at: null,
      },
      {
        where: { email: email },
      }
    );

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user
    );

    user.refreshToken = refreshToken;
    await user.save();

    const options = {
      secure: true,
    };

    const verifiedUser = await db.users.findOne({
      where: { email: email },
      attributes: { exclude: ["password", "password_otp", "signup_otp"] },
    });

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        message: "Email verified successfully! Welcome to PregaCenter.",
        success: true,
        data: { ...verifiedUser.toJSON(), accessToken },
      });
  } catch (error) {
    console.log("🚀 ~ verifySignupOtp ~ error:", error);
    return res.status(500).json({
      error: error.message ?? "Something went wrong during OTP verification.",
      success: false,
    });
  }
});

const resendSignupOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email is required.",
      success: false,
    });
  }

  try {
    const user = await db.users.findOne({
      where: {
        email: email,
        is_verified: false,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found or already verified.",
        success: false,
      });
    }

    // Generate new OTP
    const otp = generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      digits: true,
      lowerCaseAlphabets: false,
    });

    // Set new OTP expiration
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Update user with new OTP
    await db.users.update(
      {
        signup_otp: otp,
        otp_expires_at: otpExpiresAt,
      },
      {
        where: { email: email },
      }
    );

    // Send OTP email
    await sendMail({
      email: email,
      subject: `PregaCenter - New Verification OTP`,
      text: `New Verification OTP`,
      html: `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>PregaCenter - New OTP</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background-color: #fff;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .otp-code {
              font-size: 24px;
              font-weight: bold;
              color: rgb(253, 51, 126);
              text-align: center;
              padding: 20px;
              background-color: #f9f9f9;
              border-radius: 8px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div style="text-align: center;">
              <h2>New Verification OTP</h2>
            </div>
            <div>
              <div>Dear ${user.first_name || "User"},</div><br>
              <div>Here is your new verification OTP:</div><br>
              <div class="otp-code">${otp}</div>
              <div>This OTP is valid for the next 5 minutes.</div><br>
              <div>Best Regards,<br>The PregaCenter Team</div>
            </div>
          </div>
        </body>
        </html>`,
    });

    return res.status(200).json({
      message: "New OTP sent successfully! Please check your email.",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while resending OTP.",
      success: false,
    });
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and Password are required.",
      success: false,
    });
  }

  try {
    const user = await db.users.findOne({
      attributes: [
        "user_id",
        "first_name",
        "last_name",
        "email",
        "is_active",
        "is_verified",
        "password",
      ],
      where: { email: email },
    });

    if (!user) {
      return res.status(404).json({
        message: "User with this email does not exist.",
        success: false,
      });
    }

    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) {
      return res.status(400).json({
        message: "Incorrect Email or Password!",
        success: false,
      });
    }

    if (!user.is_verified) {
      const otp = generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        digits: true,
        lowerCaseAlphabets: false,
      });

      const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await db.users.update(
        {
          signup_otp: otp,
          otp_expires_at: otpExpiresAt,
        },
        { where: { email: email } }
      );

      await sendMail({
        email: email,
        subject: `PregaCenter - Complete Your Registration`,
        text: `Complete Your Registration`,
        html: `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>PregaCenter - Complete Your Registration</title>
            <link
              href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100..700;1,100..700&family=Metrophobic&family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap"
              rel="stylesheet"
            />
            <style>
              body {
                margin: 0px;
              }
              p {
                margin-top: 0px;
                margin-bottom: 0px;
                padding-top: 8px;
                font-family: Nunito, Arial, sans-serif;
              }
              @media screen and (max-width: 1280px) {
                .main-table {
                  margin-inline: 80px !important;
                }
              }
              @media screen and (max-width: 992px) {
                .main-table {
                  margin-inline: 50px !important;
                  margin-block: 40px !important;
                  padding-block: 40px !important;
                }
                .welcome-text {
                  font-size: 25px !important;
                }
                .logo-text {
                  font-size: 18px !important;
                }
              }
              @media screen and (max-width: 768px) {
                .main-table {
                  margin-inline: 30px !important;
                  margin-block: 30px !important;
                  padding-inline: 35px !important;
                }
                .content {
                  font-size: 14px !important;
                  padding-top: 10px !important;
                }
                .otp {
                  font-size: 18px !important;
                }
                .reciever-name {
                  padding-top: 20px !important;
                }
              }
              @media screen and (max-width: 640px) {
                .main-table {
                  margin-inline: 20px !important;
                }
                .welcome-text {
                  font-size: 22px !important;
                }
              }
              @media screen and (max-width: 400px) {
                .main-table {
                  margin-inline: 10px !important;
                  margin-block: 20px !important;
                  padding-inline: 10px !important;
                  padding-block: 25px !important;
                }
                .reciever-name {
                  padding-top: 14px !important;
                }
                .welcome-text {
                  font-size: 20px !important;
                }
                .logo-text {
                  font-size: 16px !important;
                }
              }
            </style>
          </head>
          <body style="display: flex; justify-content: center; align-items: center">
            <table style="background-color: rgb(252, 252, 252); width: 100%">
              <td>
                <table
                  class="main-table"
                  cellspacing="0"
                  style="
                    border-radius: 10px;
                    background-color: rgba(244, 249, 252, 1);
                    margin-block: 60px;
                    margin-inline: 100px;
                    display: flex;
                    padding: 50px;
                    flex-direction: column;
                  "
                >
                  <tr>
                    <td style="display: flex; align-items: center; gap: 10px;">
                      <img
                        src="https://res.cloudinary.com/dfciwmday/image/upload/f_png/v1760604592/prega_center/images/logo_oizdiw.svg"
                        alt="PregaCenter Logo"
                      />
                      <span class="logo-text" style="font-size: 20px; font-family: Nunito, Arial, sans-serif;">PregaCenter</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p
                        class="welcome-text"
                        style="font-size: 30px; font-weight: 600; font-family: Nunito; padding-top: 20px;"
                      >
                        Complete Your Registration
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td class="reciever-name" style="padding-top: 25px; font-family: Nunito;">
                      Dear ${user.first_name || "User"},
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p class="content">
                        We noticed you're trying to log in, but your email isn't verified yet.
                        Please use the OTP below to complete your registration:
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p class="otp" style="font-weight: 700; font-size: 20px; padding: 15px 0;">
                        ${otp}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p class="content">
                        This OTP is valid for 5 minutes. After verification, you'll be automatically logged in.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p class="content" style="padding-top: 10px;">
                        If you have any questions, please contact our support team at
                        <a href="mailto:support@pregacenter.io">support@pregacenter.io</a>.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p class="content" style="padding-top: 20px;">Best Regards,</p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p class="content">The PregaCenter Team</p>
                    </td>
                  </tr>
                </table>
              </td>
            </table>
          </body>
        </html>`,
      });

      return res.status(200).json({
        message:
          "Please verify your email to complete login. We've sent you a new OTP.",
        success: false,
        requires_verification: true,
        email: email,
        action: "verify_to_login",
      });
    }

    // if (!user.is_active) {
    //   return res.status(400).json({
    //     message: "Your account is deactivated. Please contact support.",
    //     success: false,
    //   });
    // }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user
    );
    user.refreshToken = refreshToken;
    await user.save();

    const options = { secure: true };
    const {
      password: _,
      password_otp: __,
      signup_otp: ___,
      ...safeUserData
    } = user.toJSON();

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        message: "Login successful.",
        success: true,
        data: { ...safeUserData, accessToken },
      });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while signing in.",
      success: false,
    });
  }
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    return res.status(401).json({
      message: "Token Not found please login.",
      success: false,
    });
  }

  try {
    const decodedToken = await jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await db.users.findByPk(decodedToken.id);
    if (!user) {
      return res.status(401).json({
        message: "The user does not exists any more.",
        success: false,
      });
    }
    if (user.refreshToken === incomingRefreshToken) {
      const { accessToken } = await generateAccessAndRefreshToken(user);
      res
        .status(200)
        .cookie("accessToken", accessToken, {
          // httpOnly: true,
          secure: true,
        })
        .json({
          message: "AccessToken refreshed.",
          success: true,
          data: { accessToken },
        });
    } else {
      return res.status(400).json({
        message: "Invalid Refresh token.",
        success: false,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message ?? "Failed to refresh AccessToken.",
      success: false,
    });
  }
});

const getUser = asyncHandler(async (req, res) => {
  try {
    let user_id;
    if (req.params.user_id) {
      user_id = req.params.user_id;
    } else {
      user_id = req.body.logged_in_user.user_id;
    }
    const user = await db.users.findByPk(user_id);
    if (!user) {
      return res.status(404).json({
        message: "user with this email does not exists!",
        success: false,
      });
    }
    const { password: _, password_otp: __, ...safeUserData } = user.toJSON();
    return res.status(200).json({
      message: "Get profile successfully.",
      success: true,
      data: safeUserData,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message ?? "Something went wrong while update user.",
    });
  }
});

const updateProfile = asyncHandler(async (req, res) => {
  const {
    first_name,
    last_name,
    bio,
    email_subscription = [],
    email,
    is_active,
    country,
  } = req.body;

  let user_id =
    req.body.user_id ||
    req.params.user_id ||
    req.body.logged_in_user?.user_id ||
    "";
  const { file } = req; // multer adds this

  try {
    if (!user_id) {
      return res.status(400).json({
        message: "User ID is required.",
        success: false,
      });
    }

    const user = await db.users.findByPk(user_id);
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }

    // Handle uploaded file
    if (file && file.path) {
      const tempPath = file.path;

      if (!fs.existsSync(tempPath)) {
        return res.status(400).json({
          message: "Uploaded file not found on disk.",
          success: false,
        });
      }

      const stats = fs.statSync(tempPath);
      if (stats.size > 20 * 1024 * 1024) {
        fs.unlinkSync(tempPath);
        return res.status(400).json({
          message: "File size exceeded 20MB limit.",
          success: false,
        });
      }

      // Detect file type (image or video)
      const fileType = file.mimetype.startsWith("video") ? "video" : "image";

      // Upload to Cloudinary
      const uploadedImage = await uploadOnCloudinary(tempPath, fileType);

      if (uploadedImage?.url) {
        // Delete old Cloudinary image
        if (user.profile_image) {
          await deleteFromCloudinary(user.profile_image, fileType);
        }

        user.image_name = file.originalname;
        user.profile_image = uploadedImage.url;
      }
    }

    // Update user fields
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (email) user.email = email;
    if (bio) user.bio = bio;
    if (country) user.country = country;
    if (typeof is_active !== "undefined") user.is_active = Number(is_active);
    if (email_subscription?.length > 0)
      user.email_subscription = email_subscription;

    await user.save();

    if (req.session && req.session.logged_in_user) {
      req.session.logged_in_user = user;
    }

    // Update the logged_in_user cookie with latest data
    res.cookie("logged_in_user", JSON.stringify(user), {
      httpOnly: false, // Allow JavaScript to read it
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user,
    });
  } catch (error) {
    console.error("❌ Profile Update Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message ?? "Something went wrong while updating profile.",
    });
  }
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmNewPassword } = req.body;

  try {
    if (newPassword != confirmNewPassword) {
      return res.status(400).json({
        message:
          "Your new password and confirm password doesn't match please try again.",
        success: false,
      });
    }
    if (newPassword == oldPassword) {
      return res.status(400).json({
        message: "New password can't be same as old password.",
        success: false,
      });
    }

    const user = await db.users.findByPk(req.body.logged_in_user.user_id);
    if (!user) {
      return res.status(404).json({
        message: "User does not exist anymore!",
        success: false,
      });
    }
    const isMatched = await bcrypt.compare(oldPassword, user.password);
    if (!isMatched) {
      return res.status(400).json({
        message: "Incorrect password.",
        success: false,
      });
    }

    await db.users.update(
      { password: newPassword },
      {
        where: { user_id: req.body.logged_in_user.user_id },
        individualHooks: true,
      }
    );

    return res.status(200).json({
      message: "Password updated successfully.",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message ?? "Failed to update password.",
      success: false,
    });
  }
});

const forgetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  try {
    const user = await db.users.findOne({
      where: {
        email: email,
      },
    });
    if (!user) {
      return res.status(404).json({
        message: "User with this email not found!",
        success: false,
      });
    }

    const otp = generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      digits: true,
      lowerCaseAlphabets: false,
    });

    await sendMail({
      email: email,
      subject: `Reset Password - Verify your email`,
      text: `Reset password`,
      html: `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Proxe-E Email Verification</title>
          <style>
            /* Add your custom styles here */
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background-color: #fff;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .logo {
              text-align: center;
              margin-bottom: 20px;
            }
            .content {
              text-align: left;
            }
            .button {
              display: inline-block;
              padding: 10px 20px !important;
              margin-top: 20px !important;
              background-color: rgb(253, 51, 126);
              color: #000000;
              text-decoration: none;
              border-radius: 5px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo" style="text-align:center;">
              <h2>Verify Your Email</h2>
            </div>
            <div class="content">
              <div>Dear ${email},</div><br>
              <div>Reset Password.</div><br>
              <div>To verify your email address, please use the following One-Time Password (OTP):</div><br>
              <div style="font-size: large; font-weight: 800;">${otp}</div><br>
              <div>This OTP is valid for the next 5 minutes. For your security, please do not share this code with anyone.<br>
              If you did not request this , please ignore this email or contact our support team immediately.</div><br>
              <div>If you have any questions or need assistance, please feel free to reach out to our support team at <a href='mailto:support@pregacenter.io'>pregacenter@yopmail.com</a></div><br>
              <div>Best Regards,<br>The Pregacenter Team</div>
              </div>
          </div>
        </body>
        </html>`,
    });

    await db.users.update(
      {
        password_otp: otp,
        otp_expires_at: new Date(Date.now() + 5 * 60 * 1000),
      },
      {
        where: {
          email,
        },
      }
    );

    const options = {
      // httpOnly: true,
      secure: true,
    };

    return res.cookie("email", email, options).status(200).json({
      message: "Otp is sent to your email address, please check!",

      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message ?? "Failed to proceed for reset password.",
      success: false,
    });
  }
});

const verifyOtp = asyncHandler(async (req, res) => {
  try {
    const { otp } = req.body;
    const email = req.cookies.email || req.body.email;

    if (!otp) {
      return res.status(400).json({
        message: "OTP is required.",
        success: false,
      });
    }

    const user = await db.users.findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User with this email does not exists.",
        success: false,
      });
    }
    if (new Date() > user.otp_expires_at) {
      return res.status(400).json({
        message: "OTP has expired. Please request a new one.",
        success: false,
      });
    }

    if (user.password_otp == otp) {
      // Clear the OTP and expiration time
      await db.users.update(
        {
          password_otp: null,
          otp_expires_at: null,
        },
        {
          where: { email: email },
        }
      );
    }

    if (user.password_otp == otp) {
      return res.status(200).json({
        message: "Sucessfully verified.",
        success: true,
      });
    } else {
      return res.status(400).json({
        message: "Invalid otp, please try again!",
        success: false,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while verify otp.",
      success: false,
    });
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password, confirmPassword, email } = req.body;

  try {
    if (password != confirmPassword) {
      return res.status(400).json({
        message:
          "Your new password and confirm password doesn't match please try again.",
        success: false,
      });
    }

    const user = await db.users.findOne({
      where: {
        email: email,
      },
    });
    if (!user) {
      return res.status(404).json({
        message: "User does not exist anymore!",
        success: false,
      });
    }

    await db.users.update(
      { password: password },
      {
        where: { email: email },
        individualHooks: true,
      }
    );

    return res.clearCookie("email").status(200).json({
      message: "Password updated successfully.",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message ?? "Failed to reset password.",
      success: false,
    });
  }
});

const deleteAccount = asyncHandler(async (req, res) => {
  try {
    const { password } = req.body;

    const user = await db.users.findOne({
      where: {
        email: req.body.logged_in_user.email,
      },
    });

    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) {
      return res.status(400).json({
        message: "Password is incorrect.",
        success: false,
      });
    }

    // Soft delete the user account
    await db.users.destroy({
      where: {
        email: req.body.logged_in_user.email,
      },
    });

    return res.status(200).json({
      message: "Account deleted successfully.",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message:
        error.message ??
        "Failed to delete account please try again or after sometime.",
      success: false,
    });
  }
});

const authenticateUser = asyncHandler(async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Authentication token is missing" });
    }
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const user = await db.users.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    req.user = user;
    return res.status(200).json({
      message: "User profile fetched successfully.",
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message ?? "Failed to authenticate user",
      success: false,
    });
  }
});

const updateAccountStatus = asyncHandler(async (req, res) => {
  const { password } = req.body;

  try {
    const user = await db.users.findOne({
      where: {
        email: req.body.logged_in_user.email,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }

    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) {
      return res.status(400).json({
        message: "Password is incorrect.",
        success: false,
      });
    }

    const updatedStatus = !user.is_active;

    await db.users.update(
      { is_active: updatedStatus },
      { where: { email: req.body.logged_in_user.email } }
    );

    return res.status(200).json({
      message: updatedStatus
        ? "Account activated successfully."
        : "Account deactivated successfully.",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message:
        error.message ??
        "Failed to update account status. Please try again later.",
      success: false,
    });
  }
});

const logOut = asyncHandler(async (req, res) => {
  return res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .clearCookie("user")
    .status(200)
    .json({
      message: "Logged out successfully.",
      success: true,
    });
});

const getUsers = asyncHandler(async (req, res) => {
  try {
    const {
      order,
      columns,
      search: searchParam,
      length = 10,
      start = 0,
      draw = 10,
      is_admin, // optional query filter
    } = req.query;

    let sort_column = "user_id";
    let sort_order = "desc";

    if (order && columns) {
      const sort_index = order?.[0]?.column;
      sort_column = columns?.[sort_index]?.data || "user_id";
      sort_order = order?.[0]?.dir || "desc";
    }

    const searchValue = searchParam?.value ? `%${searchParam.value}%` : "";

    let userCondition = { deleted_at: null };

    // Optional filter for admin/user
    if (typeof is_admin !== "undefined") {
      userCondition.is_admin = Number(is_admin);
    }

    // Add search filters
    if (searchValue) {
      userCondition[Op.or] = [
        { first_name: { [Op.like]: searchValue } },
        { last_name: { [Op.like]: searchValue } },
        Sequelize.literal(
          `CONCAT(first_name, ' ', last_name) LIKE '%${searchParam.value}%'`
        ),
        { email: { [Op.like]: searchValue } },
        { bio: { [Op.like]: searchValue } },
      ];
    }

    const data = await db.users.findAndCountAll({
      where: userCondition,
      order: [[sort_column, sort_order]],
      limit: Number(length),
      offset: Number(start),
    });

    return res.status(200).json({
      success: true,
      draw,
      recordsTotal: data.count,
      recordsFiltered: data.count,
      data: data.rows,
    });
  } catch (error) {
    console.error("❌ getUsers error:", error);
    return res.status(500).json({
      success: false,
      draw: req?.query?.draw || 10,
      recordsTotal: 0,
      recordsFiltered: 0,
      data: [],
    });
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  try {
    const { user_id } = req.params;

    // Soft delete the user
    await db.users.destroy({
      where: {
        user_id: user_id,
      },
    });

    return res.status(200).json({
      message: "User deleted successfully.",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message:
        error.message ??
        "Failed to delete user please try again or after sometime.",
      success: false,
    });
  }
});

const getDeletedUsers = asyncHandler(async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user?.is_admin) {
      return res.status(403).json({
        message: "Access denied. Admin privileges required.",
        success: false,
      });
    }

    const deletedUsers = await db.users.findAll({
      where: {},
      paranoid: false, // Include soft-deleted records
      order: [["deletedAt", "DESC"]],
    });

    return res.status(200).json({
      message: "Deleted users fetched successfully.",
      success: true,
      data: deletedUsers,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message ?? "Failed to fetch deleted users.",
      success: false,
    });
  }
});

const restoreUser = asyncHandler(async (req, res) => {
  try {
    const { user_id } = req.params;

    // Check if user is admin
    if (!req.user?.is_admin) {
      return res.status(403).json({
        message: "Access denied. Admin privileges required.",
        success: false,
      });
    }

    const deletedUser = await db.users.findOne({
      where: { user_id },
      paranoid: false, // Include soft-deleted records
    });

    if (!deletedUser) {
      return res.status(404).json({
        message: "Deleted user not found.",
        success: false,
      });
    }

    if (!deletedUser.deletedAt) {
      return res.status(400).json({
        message: "User is not deleted.",
        success: false,
      });
    }

    // Restore the user
    await deletedUser.restore();

    return res.status(200).json({
      message: "User restored successfully.",
      success: true,
      data: {
        user_id: deletedUser.user_id,
        email: deletedUser.email,
        first_name: deletedUser.first_name,
        last_name: deletedUser.last_name,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message ?? "Failed to restore user.",
      success: false,
    });
  }
});

module.exports = {
  createUser,
  verifyOtp,
  loginUser,
  refreshAccessToken,
  updateProfile,
  changePassword,
  forgetPassword,
  resetPassword,
  deleteAccount,
  updateAccountStatus,
  authenticateUser,
  logOut,
  getUser,
  getUsers,
  deleteUser,
  getDeletedUsers,
  restoreUser,
  verifySignupOtp,
  resendSignupOtp,
};
