const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema(
    {
        name: {
        type: String,
        required: true
        },
        description: {
        type: String
        },
        userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
        },
        extensionEnabled: {
            type: Boolean,
            default: false,
            index: true
        }
    },
    { timestamps: true }
    );

    collectionSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Collection', collectionSchema);