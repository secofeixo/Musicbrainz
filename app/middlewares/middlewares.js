
const logger = require('../../app/controllers/log.controller.js');

module.exports = app => {
  app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
      // res.setHeader('Access-Control-Allow-Origin', 'http://bmattest.musicbrainz');
    } else if (process.env.NODE_ENV === 'production') {
      // res.setHeader('Access-Control-Allow-Origin', 'http://bmattest.musicbrainz');
    } else {
      // (process.env.NODE_ENV === 'local')
      logger.info('middlewares.js No CORS setting');
    }
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Origin, Authorization, Origin, x-requested-with, Content-Type, Content-Range, Content-Disposition, Content-Description');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, PATCH, DELETE');
    next();
  });
};
