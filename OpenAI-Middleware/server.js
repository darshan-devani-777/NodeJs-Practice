const express = require("express");
const dotenv = require("dotenv");
const chatRoutes = require("./src/routes/chatRoutes");

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api", chatRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
