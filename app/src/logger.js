const winston = require('winston')

const log = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.colorize(),
    winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss.SSS'}),
    winston.format.padLevels(),
    winston.format.printf((input) => `${input.timestamp} ${input.level}: ${input.message}`)
  ),
  transports: [new winston.transports.Console()]
})

module.exports = log
