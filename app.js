const config = require('./config/config');

const app = require('./config/express')();
const logger = require('./app/controllers/log.controller.js');

// Set up port
app.set('port', config.port);

process.on('SIGINT', () => {
  process.exit(0);
});

app.listen(config.port);
logger.info(`server is on port ${app.get('port')}`);

module.exports.getApp = app;
