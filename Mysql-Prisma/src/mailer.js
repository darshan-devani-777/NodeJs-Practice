const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendOrderConfirmationEmail = async (to, orderId, totalPrice) => {
  const mailOptions = {
    from: `"My Shop" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Order Confirmation",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 9px; background-color: #f9f9f9;">
        <h2 style="color: #2c3e50;">Order Confirmation</h2>
        <p style="font-size: 16px;">Thank you for your order!</p>
        <p style="font-size: 16px;"><strong>Order ID:</strong> ${orderId}</p>
        <p style="font-size: 16px;"><strong>Total Price:</strong> ₹${totalPrice}</p>
        <p style="margin-top: 20px; font-size: 14px; color: #888;">If you have any questions, contact us at support@myshop.com</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

