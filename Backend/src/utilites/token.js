const jwt = require('jsonwebtoken');
require('dotenv').config({path: './src/db/.env'});

exports.generateToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

