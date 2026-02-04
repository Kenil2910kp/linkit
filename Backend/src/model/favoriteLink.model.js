const mongoose = require('mongoose');

const favoriteLinkSchema = new mongoose.Schema(
  {
    favoriteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Favorite',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

favoriteLinkSchema.index({ favoriteId: 1, createdAt: -1 });

module.exports = mongoose.model('FavoriteLink', favoriteLinkSchema);

