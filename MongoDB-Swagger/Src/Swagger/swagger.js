const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'User API',
            version: '1.0.0',
            description: 'Simple CRUD API using Node.js, MongoDB, and Swagger'
        },
        servers: [
            {
                url: 'http://localhost:7777'
            }
        ]
    },
    apis: ['./Src/Routes/*.js'] 
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
