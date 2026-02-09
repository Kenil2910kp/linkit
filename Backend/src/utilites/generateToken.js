const crypto = require('crypto');

exports.generateRawToken = () => {
  return crypto.randomBytes(32).toString('hex');
};
