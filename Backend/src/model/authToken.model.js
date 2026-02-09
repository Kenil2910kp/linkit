const mongoose = require('mongoose');

const authTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    tokenHash: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: ['EMAIL_VERIFY', 'PASSWORD_RESET'],
      required: true,
      index: true
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

authTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('AuthToken', authTokenSchema);
