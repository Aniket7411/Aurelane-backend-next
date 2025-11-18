const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    gemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gem',
        required: [true, 'Gem ID is required'],
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },
    comment: {
        type: String,
        trim: true,
        maxlength: [1000, 'Comment cannot exceed 1000 characters']
    }
}, {
    timestamps: true
});

// Prevent duplicate reviews - one user can only review a gem once
reviewSchema.index({ gemId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
