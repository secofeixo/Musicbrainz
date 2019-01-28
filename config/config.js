

const _ = require('lodash'),
  glob = require('glob');

module.exports = _.extend(
  require('./env/all'),
  require(`./env/${process.env.NODE_ENV}` || 'development') || {},
);

module.exports.getGlobbedFiles = (globPatterns, removeRoot) => {
  const thisObject = this;

  // URL paths regex
  const urlRegex = new RegExp('^(?:[a-z]+:)?\s/\/', 'i');

  // The output array
  let output = [];

  // If glob pattern is array so we use each pattern in a recursive way, otherwise we use glob
  if (_.isArray(globPatterns)) {
    globPatterns.forEach(globPattern => {
      output = _.union(output, thisObject.getGlobbedFiles(globPattern, removeRoot));
    });
  } else if (_.isString(globPatterns)) {
    if (urlRegex.test(globPatterns)) {
      output.push(globPatterns);
    } else {
      let files = glob.sync(globPatterns);
      if (removeRoot) {
        files = files.map(file => file.replace(removeRoot, ''));
      }
      output = _.union(output, files);
    }
  }

  return output;
};
