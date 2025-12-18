const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const userRoutes = require('./route/user.route');
require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/users', userRoutes);
module.exports = app;

app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server Start At http://localhost:${PORT}`);
});
