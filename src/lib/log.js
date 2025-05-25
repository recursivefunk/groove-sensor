import env from 'good-env';

const isProd = env.get('NODE_ENV') === 'PRODUCTION';
const noOp = function () {};

export default {
  info: console.log,
  debug: (isProd ? noOp : console.debug),
  warn: console.warn,
  error: console.error
};
