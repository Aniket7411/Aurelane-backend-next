const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    gemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gem',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
        default: 1
    }
}, {
    timestamps: true
});

// Ensure one cart item per user per gem
cartItemSchema.index({ userId: 1, gemId: 1 }, { unique: true });

module.exports = mongoose.model('CartItem', cartItemSchema);
