const bcrypt = require('bcrypt');
const ApiKey = require('../model/apiKey.model');
module.exports = async function apiKeyAuth(req, res, next) {
    const header = req.headers.authorization;
  
    if (!header || !header.startsWith('ApiKey ')) {
      return res.status(401).json({ error: 'API key missing' });
    }
  
    const rawKey = header.replace('ApiKey ', '').trim();
    const [prefix, secret] = rawKey.split('.');
  
    if (!prefix || !secret) {
      return res.status(401).json({ error: 'Invalid API key format' });
    }
  
    const key = await ApiKey.findOne({ keyPrefix: prefix, revoked: false });
    if (!key) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
  
    const isMatch = await bcrypt.compare(secret, key.keyHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
  
    key.lastUsedAt = new Date();
    await key.save();
  
    req.userId = key.userId;
    next();
  };
  
