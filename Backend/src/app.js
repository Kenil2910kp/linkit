const express = require('express');
const cors = require('cors');
require('dotenv').config();


const authRoutes = require('./routes/auth.routes');
const collectionRoutes = require('./routes/collection.routes');
// const apiKeyRoutes = require('./routes/apiKey.routes');
const linkRoutes = require('./routes/link.routes');
const apiKeyRoutes = require('./routes/apiKey.routes');
const extensionRoutes= require('./routes/extension.routes');
const favoriteRoutes= require ('./routes/favorite.routes');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS blocked for this origin'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRoutes);
app.use('/links', linkRoutes);
app.use('/api-keys', apiKeyRoutes);
app.use('/extension',extensionRoutes);
app.use('/favorites',favoriteRoutes);
app.use('/collections',collectionRoutes);


app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'linkit-backend' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
