const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    keyPrefix: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    keyHash: {
      type: String,
      required: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    revoked: {
      type: Boolean,
      default: false,
      index: true
    },

    lastUsedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

apiKeySchema.index({ userId: 1, revoked: 1 });

module.exports = mongoose.model('ApiKey', apiKeySchema);
