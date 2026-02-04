const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, 
      index: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Favorite', favoriteSchema);
