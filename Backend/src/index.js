const app = require('./app');
const connectDB = require('./config/db');
require('dotenv').config({ path: './src/config/.env' });

connectDB();

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
});
