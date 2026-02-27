const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const bodyParser = require("body-parser");
const path = require("path");
const cookieParser = require("cookie-parser");

dotenv.config();
connectDB();

const app = express();

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));
app.locals.basedir = path.join(__dirname, 'src/views'); 

app.use((req, res, next) => {
  res.locals.error = req.query.error || null;
  res.locals.success = req.query.success || null;
  res.locals.currentPath = req.path;
  res.locals.user = null;
  next();
});

app.use("/", require("./src/routes/pageRoutes"));
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/blogs", require("./src/routes/blogRoutes"));
app.use("/api/products", require("./src/routes/productRoutes"));
app.use("/api/faqs" , require("./src/routes/faqRoutes"));
app.use("/api/privacypolicy" , require("./src/routes/privacypolicyRoutes"));
app.use("/api/carts" , require("./src/routes/cartRoutes"));
app.use("/api/orders" , require("./src/routes/orderRoutes"));

// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR CAUGHT:");
  console.error(err);

  if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.code}`,
    });
  }

  if (err.message === "Unexpected field") {
    return res.status(400).json({
      success: false,
      message: "File field name must be 'upload'",
    });
  }

  if (err.message === "Only CSV files allowed") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  res.status(500).json({
    success: false,
    message: err.message || "Server error",
  });
});

const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () =>
  console.log(`Server running → http://${HOST}:${PORT}`)
);
