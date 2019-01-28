const Redis = require('redis'),
  util = require('util'),
  config = require('../../config/config'),
  logger = require('./log.controller.js');

const client = Redis.createClient(config.redis.url);
client.hget = util.promisify(client.hget);
client.get = util.promisify(client.get);
client.del = util.promisify(client.del);

function addToken(token) {
  client.set(`${token}`, '1', 'EX', config.jwt.expiresIn);
}

async function hasToken(token) {
  const exists = await client.get(token);
  logger.debug(`redis. hasToken. ${JSON.stringify(exists)}`);
  return (exists !== null);
}

function incrKey(key, expireSeconds) {
  return new Promise((resolve, reject) => {
    const multi = client.multi();
    multi.incr(key);
    if (expireSeconds) {
      multi.expire(key, expireSeconds);
    }
    multi.exec((err, data) => {
      if (err) {
        logger.error(`redis.controller. incrToken. Error incr key: ${JSON.stringify(err)}`);
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}

async function removeKey(key) {
  try {
    const data = await client.del(key);
    logger.debug(`redis.controller. removeKey. Data removing key: ${JSON.stringify(data)}`);
  } catch (err) {
    logger.error(`redis.controller. removeKey. Error removing key: ${JSON.stringify(err)}`);
  }
}

function close() {
  client.quit();
}

module.exports = {
  client,
  addToken,
  hasToken,
  incrKey,
  removeKey,
  close,
};
