

module.exports = {
  redis: process.env.REDIS_DEV
  || 'redis://localhost:6379',
};
