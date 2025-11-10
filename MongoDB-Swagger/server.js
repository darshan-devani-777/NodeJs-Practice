const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./Src/Routes/user.route');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./Src/Swagger/swagger');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
app.use(helmet());
app.use(cors());

// Middleware
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/UserDB', {
}).then(() => {
    console.log('✅ MongoDB Connected...');
}).catch(err => console.log(err));

// Routes
app.use('/api/users', userRoutes);

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

if (process.env.NODE_ENV !== 'test') {
    const PORT = 7777;
    app.listen(PORT, () => {
        console.log(`🚀 Server Start At http://localhost:${PORT}`);
        console.log(`📄 Swagger Docs At http://localhost:${PORT}/api-docs`);
    });
}

module.exports = app; 
