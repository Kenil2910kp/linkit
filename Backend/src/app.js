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

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRoutes);
app.use('/links', linkRoutes);
app.use('/api-keys', apiKeyRoutes);
app.use('/extension',extensionRoutes);
app.use('/favorites',favoriteRoutes);
app.use('/collections',collectionRoutes);


app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
