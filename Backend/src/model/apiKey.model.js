const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    // 🔑 prefix for fast lookup (indexed)
    keyPrefix: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    // 🔒 bcrypt hash of the secret part only
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

// compound index for common queries
apiKeySchema.index({ userId: 1, revoked: 1 });

module.exports = mongoose.model('ApiKey', apiKeySchema);
