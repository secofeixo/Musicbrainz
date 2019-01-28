const logger = require('./log.controller.js');

exports.status = (req, res) => {
  res.status(200).send({ msg: `Server is up - ${new Date()}` });
};

exports.unsetBodyFields = (req, res, next) => {
  // logger.debug(`keyword.model.js. preUpdate. ${JSON.stringify(req.body, null, 2)}`);
  Object.keys(req.body).forEach(key => {
    if (req.body[key] === 'unset') {
      req.body[key] = undefined;
    }
  });
  next();
};

exports.unsetField = (req, res, next, opts) => {
  logger.debug(`utils.controller. unsetField. Object: ${JSON.stringify(opts)}`);
  if (opts.Model && opts.obj && opts.obj._id && opts.fields && opts.fields.length) {
    const unsetObj = {};
    opts.fields.forEach(field => {
      unsetObj[field] = 1;
    });
    logger.debug(`utils.controller. unsetField. UnsetObj: ${JSON.stringify(unsetObj)}`);
    opts.Model.findOneAndUpdate({ _id: opts.obj._id },
      { $unset: unsetObj },
      { new: true }).exec();
  }
  next();
};

exports.internalError = (err, res) => {
  logger.error('Internal error');
  if (err) logger.error(err);
  res.status(500).send({ msg: 'Internal Error' });
};

exports.badQuery = (res, missingFields) => {
  if (Array.isArray(missingFields)) {
    res.status(400).send({ msg: 'Bad query', missingFields });
  } else if (typeof (missingFields) === 'string') {
    res.status(400).send({ msg: 'Bad query', error: missingFields });
  }
};

exports.missingBodyFields = (req, ...fields) => {
  const missing = [];
  fields.forEach(field => {
    if (!req.body[field]) missing.push(field);
  });
  return missing;
};

exports.missingObjectFields = (obj, ...fields) => {
  const missing = [];
  fields.forEach(field => {
    if (!obj[field]) missing.push(field);
  });
  return missing;
};

exports.missingQueryFields = (req, ...fields) => {
  const missing = [];
  fields.forEach(field => {
    if (!req.query[field]) missing.push(field);
  });
  return missing;
};

function formattedNumber(num) {
  return num < 10 ? `0${num}` : num;
}

exports.getTimeStamp = () => {
  const date = new Date();
  const year = formattedNumber(date.getUTCFullYear());
  const month = formattedNumber(date.getUTCMonth() + 1);
  const day = formattedNumber(date.getUTCDate());
  const hours = formattedNumber(date.getUTCHours());
  const minutes = formattedNumber(date.getUTCMinutes());
  const seconds = formattedNumber(date.getUTCSeconds());

  const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
  return timestamp;
};
