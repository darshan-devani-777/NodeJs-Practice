const { createLogger, format, transports } = require("winston");

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD hh:mm:ss A' }),
    format.simple()
  ),
  transports: [
    new transports.Console(),
  ],
});

module.exports = logger;


