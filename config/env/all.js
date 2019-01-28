

module.exports = {
  port: process.env.PORT || 1337,
  debugLevel: {
    console: 'debug',
    file: 'info',
  },
  redis: {
    url: 'redis://localhost:6379',
  },
};
