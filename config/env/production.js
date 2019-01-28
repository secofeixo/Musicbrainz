

module.exports = {
  redis: process.env.REDIS_PROD
  || 'redis://localhost:6379',
};
