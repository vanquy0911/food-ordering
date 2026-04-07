const mongoose = require('mongoose');

/**
 * Idempotency Key Model
 * Stores unique request identifiers to prevent duplicate processing of critical operations.
 */
const idempotencySchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true, // Prevents duplicate keys globally
        trim: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requestPath: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['processing', 'completed', 'failed'],
        default: 'processing'
    },
    responseStatus: {
        type: Number,
        default: null
    },
    responseBody: {
        type: Object,
        default: null
    },
    // TTL index: record will be deleted 24 hours (86400 seconds) after creation
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400
    }
}, { timestamps: true });

// Key uniqueness is handled by the 'unique: true' property in the field definition

module.exports = mongoose.model('IdempotencyKey', idempotencySchema);
