const express = require("express");
require("dotenv").config();
const userRoutes = require("./src/routes/userRoutes");
const postRoutes = require("./src/routes/postRoutes");

const app = express();
app.use(express.json());

app.use("/users", userRoutes);
app.use("/posts", postRoutes);

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
