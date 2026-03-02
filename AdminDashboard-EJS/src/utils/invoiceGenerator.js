const PDFDocument = require("pdfkit");

const generateInvoicePDF = (order, res) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice-${order.invoiceNumber}.pdf`
  );

  doc.pipe(res);

  // Company Info
  doc.fontSize(20).text("INVOICE", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text("Your Company Name");
  doc.text("Address Line 1");
  doc.text("City, State - 123456");
  doc.text("Email: support@company.com");
  doc.moveDown();

  // Invoice Info
  doc.text(`Invoice Number: ${order.invoiceNumber}`);
  doc.text(`Invoice Date: ${order.invoiceDate.toDateString()}`);
  doc.text(`Order Number: ${order.orderNumber}`);
  doc.moveDown();

  // Customer Info
  doc.text("Bill To:");
  doc.text(order.shippingAddress.fullName);
  doc.text(order.shippingAddress.address);
  doc.text(
    `${order.shippingAddress.city}, ${order.shippingAddress.state}`
  );
  doc.text(order.shippingAddress.postalCode);
  doc.moveDown();

  // Table Header
  doc.text("Items:");
  doc.moveDown();

  order.items.forEach((item, index) => {
    doc.text(
      `${index + 1}. ${item.product.title} - Qty: ${item.quantity} - ₹${item.price}`
    );
  });

  doc.moveDown();
  doc.text(`Total Items: ${order.totalItems}`);
  doc.text(`Total Amount: ₹${order.totalAmount}`, {
    align: "right",
  });

  doc.end();
};

module.exports = generateInvoicePDF;