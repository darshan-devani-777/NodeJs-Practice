require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();                    
app.use(express.json());
const port = process.env.PORT;                                           

// ADMIN ROUTES
const adminRoutes = require('./Src/Routes/Admin/index.routes');
app.use('/api/admin', adminRoutes);

// USER ROUTES
const usersRoute = require('./Src/Routes/User/index.routes');
app.use('/api/user', usersRoute);

// DATABASE CONNECTION                                                                      
app.listen(port , async() => {                                      
    // mongoose.connect('mongodb://127.0.0.1:27017/MongoDB-Project')
    mongoose.connect(process.env.ATLAS)
    .then(() => console.log('MongoDB is Connected...'))
    .catch(err => console.log(err.message));
    console.log(`Server Start At http://localhost:${port}`);
});


