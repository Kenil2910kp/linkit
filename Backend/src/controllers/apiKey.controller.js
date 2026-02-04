const crypto = require('crypto');
const bycrypt = require('bcrypt');
const ApiKey = require('../model/apiKey.model');
const generateApiKey = require('../utilites/generateApiKey');

exports.createApiKey = async (req, res) => {
    try {
      const { name } = req.body;
      const userId = req.userId;
  
      if (!name) {
        return res.status(400).json({ error: 'Name required' });
      }
  
      // 🔑 generate prefix + secret
      const { fullKey, prefix, secret } = generateApiKey();
  
      // 🔒 hash ONLY the secret
      const keyHash = await bycrypt.hash(secret, 12);
  
      const apiKey = await ApiKey.create({
        name,
        keyPrefix: prefix,
        keyHash,
        userId
      });
  
      res.status(201).json({
        id: apiKey._id,
        name: apiKey.name,
        key: fullKey,
        createdAt: apiKey.createdAt,
        warning: 'Store this key securely. You will not be able to see it again.'
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create API key' });
    }
  };

  exports.getApiKeys = async (req, res) => {
    const userId = req.userId;
  
    const keys = await ApiKey.find({ userId, revoked: false })
      .select('_id name createdAt lastUsedAt');
  
    res.json(keys);
  };

  exports.deleteApiKey = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
  
    await ApiKey.updateOne(
      { _id: id, userId },
      { revoked: true }
    );
  
    res.json({ success: true });
  };