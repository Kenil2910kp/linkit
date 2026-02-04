const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

linkSchema.index({ collectionId: 1 });
linkSchema.index({ userId: 1, collectionId: 1 });


module.exports = mongoose.model('Link', linkSchema);
