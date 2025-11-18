const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true  // Each user has only one wishlist
    },
    items: [{
        gem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Gem',
            required: true
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Indexes for faster queries
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ 'items.gem': 1 });

module.exports = mongoose.model('Wishlist', wishlistSchema);
