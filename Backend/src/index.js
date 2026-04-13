const app = require('./app');
const connectDB = require('./config/db');
require('dotenv').config();

connectDB();

const PORT = Number(process.env.PORT) || 8011;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
