const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const collectionSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        extensionEnabled: { type: Boolean, default: false, index: true },

        // ── Visibility ──────────────────────────────────────────────
        visibility: {
            type: String,
            enum: ['private', 'protected', 'public'],
            default: 'private',
        },
        sharedToken: { type: String, unique: true, sparse: true }, // auto-generated for protected
        allowedEmails: [{ type: String, lowercase: true, trim: true }], // protected access list

        // ── Social ──────────────────────────────────────────────────
        likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        likeCount: { type: Number, default: 0 },
        savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        saveCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

collectionSchema.index({ userId: 1, name: 1 }, { unique: true });
collectionSchema.index({ visibility: 1, createdAt: -1 });
collectionSchema.index({ sharedToken: 1 });

module.exports = mongoose.model('Collection', collectionSchema);