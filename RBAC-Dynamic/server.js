const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./src/config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/user", require("./src/routes/userRoutes"));
app.use("/api/admin", require("./src/routes/adminRoutes"));
app.use("/api/superadmin", require("./src/routes/superAdminRoutes"));
app.use("/api/dashboard", require("./src/routes/dashboardRoutes"));

const PORT = process.env.PORT || 1010;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port http://localhost:${PORT}`);
});