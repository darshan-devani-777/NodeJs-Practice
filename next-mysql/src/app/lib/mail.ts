import nodemailer from "nodemailer";

export const sendEmail = async (
  email: string,
  subject: string,
  html: string
) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Admin Dashboard" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html,
  });
};