const express = require("express");
const router = express.Router();

const reportController = require("../controllers/reportController");

// USERS REPORT
router.get("/users", reportController.userReport);

// PRODUCTS REPORT
router.get("/products", reportController.productReport);

// SALES REPORT
router.get("/sales", reportController.salesReport);

// ORDERS REPORT
router.get("/orders", reportController.orderReport);

// REVENUE REPORT
router.get("/revenue", reportController.revenueReport);

// EXPORT CSV
router.get("/export/csv", reportController.exportCSV);

// EXPORT PDF
router.get("/export/pdf", reportController.exportPDF);

module.exports = router;