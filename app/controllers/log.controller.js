const winston = require('winston'),
  config = require('../../config/config');

// winston.emitErrs = true;

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
  ),
  transports: [
    new winston.transports.File({
      level: config.debugLevel.file,
      filename: './logs/all-logs.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      handleExceptions: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(nfo => `${nfo.timestamp} ${nfo.level}: ${nfo.message}`),
      ),
      level: config.debugLevel.console,
      handleExceptions: true,
    }),
  ],
  exitOnError: false,
});

module.exports = logger;
module.exports.stream = {
  write(message) {
    logger.info(message);
  },
};
