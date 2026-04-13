const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.generateToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing. Set it in environment variables.');
  }

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

