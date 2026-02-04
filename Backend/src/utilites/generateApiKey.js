const crypto = require('crypto');

module.exports = function generateApiKey() {
  const prefix = 'ck_live_' + crypto.randomBytes(4).toString('hex');
  const secret = crypto.randomBytes(32).toString('hex');

  return {
    fullKey: `${prefix}.${secret}`,
    prefix,
    secret
  };
};