import winston from "winston";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
    // winston.format.json(),
    // winston.format.align(),
    // winston.format.prettyPrint(),
    // winston.format.timestamp(),
  ),
  transports: [new winston.transports.Console()],
});
