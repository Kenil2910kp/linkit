const mongoose = require('mongoose');

const accessRequestSchema = new mongoose.Schema(
    {
        collectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection', required: true },
        requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null if unauthenticated
        requesterEmail: { type: String, required: true },
        message: { type: String, default: '' },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    },
    { timestamps: true }
);

accessRequestSchema.index({ collectionId: 1, requesterEmail: 1 });

module.exports = mongoose.model('AccessRequest', accessRequestSchema);
