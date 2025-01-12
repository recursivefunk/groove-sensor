const env = require('good-env');
const isProd = env === 'PRODUCTION';
const noOp = function(){};

module.exports = {
  info: console.log,
  debug: (isProd ? noOp : console.debug),
  warn: console.warn,
  error: console.error,
};