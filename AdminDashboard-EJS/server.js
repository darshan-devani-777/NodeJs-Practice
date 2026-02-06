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

// GLOBALS
app.use((req, res, next) => {
  res.locals.error = req.query.error || null;
  res.locals.success = req.query.success || null;
  res.locals.currentPath = req.path;
  res.locals.user = null;
  next();
});

app.use("/", require("./src/routes/pageRoutes"));
app.use("/api/auth", require("./src/routes/authRoutes"));

const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () =>
  console.log(`Server running → http://${HOST}:${PORT}`)
);
