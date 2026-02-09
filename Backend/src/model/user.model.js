const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username:{
        type: String,
        required: true
    },
    email: {
      type: String,
      unique: true,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    emailVerified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
