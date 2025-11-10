require("dotenv").config();
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const helmet = require("helmet");
const cors = require("cors");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const connectDB = require("./src/config/db");
const typeDefs = require("./src/schema/type");
const resolvers = require("./src/schema/resolvers");
const logger = require("./src/config/logger");

const startServer = async () => {
  const app = express();

  connectDB();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false, 
  }));
  app.use(cors());
  app.use(hpp());
  app.use(mongoSanitize());
  app.use(xss());

  // Rate limiting 
  const graphqlLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // IP to 300 requests 
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: "ERROR",
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests, please try again later.",
      data: null,
    },
  });

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req }),
    introspection: true,
  });

  await server.start();
  // Rate limiter routes
  app.use(server.graphqlPath, graphqlLimiter);
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    logger.info(`Server started at http://localhost:${PORT}${server.graphqlPath}`);
  });
};

startServer();
