

const express = require('express'),
  bodyParser = require('body-parser'),
  compression = require('compression'),
  methodOverride = require('method-override'),
  path = require('path'),
  helmet = require('helmet'),
  cors = require('cors'),
  config = require('./config'),
  logger = require('../app/controllers/log.controller.js');

module.exports = () => {
  const app = express();

  app.use(cors({ credentials: true, origin: true }));

  const router = express.Router();

  app.use(helmet({ hsts: false }));

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json({ limit: '50mb' }));
  // app.use(fileUpload());

  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      return res.status(400).send({ msg: 'Malformed JSON' });
    }
    return next();
  });

  app.use(compression());
  app.use(methodOverride());

  app.use(express.static(path.resolve('./public')));

  app.use(require('morgan')('combined', { stream: logger.stream }));

  if (app.get('env') === 'production') {
    app.set('trust proxy', 1); // trust first proxy
  }

  // Globbing model files
  config.getGlobbedFiles('./app/models/**/*.js').forEach(modelPath => {
    require(path.resolve(modelPath));
  });

  require('../app/middlewares/middlewares.js')(app);

  // Globbing routing files
  config.getGlobbedFiles('./app/routes/**/*.js').forEach(routePath => {
    require(path.resolve(routePath))(app);
  });

  app.use(router);

  return app;
};
