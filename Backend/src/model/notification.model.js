const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // recipient (collection owner)
        type: { type: String, enum: ['access_request', 'access_approved', 'access_rejected'], required: true },
        read: { type: Boolean, default: false },
        data: {
            requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'AccessRequest' },
            collectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection' },
            collectionName: String,
            requesterEmail: String,
            message: String,
        },
    },
    { timestamps: true }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
