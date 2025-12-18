import express from "express";
import dotenv from "dotenv";
import userRoutes from "./Routes/user.route";

dotenv.config();

const app = express();
app.use(express.json()); 
app.use("/api/users", userRoutes);

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server Start At http://localhost:${PORT}`);
});

export default app;