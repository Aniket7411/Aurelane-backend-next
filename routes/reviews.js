const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Gem = require('../models/Gem');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

const router = express.Router();

// @route   POST /api/reviews/:gemId
// @desc    Submit a review for a gem/product
// @access  Private
router.post('/:gemId', protect, [
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
    body('comment')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Comment cannot exceed 1000 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { gemId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user._id;

        // Check if gem exists
        const gem = await Gem.findById(gemId);
        if (!gem) {
            return res.status(404).json({
                success: false,
                message: 'Gem not found'
            });
        }

        // Check if user has already reviewed this gem
        const existingReview = await Review.findOne({ gemId, userId });
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this gem'
            });
        }

        // Create review
        const review = new Review({
            gemId,
            userId,
            rating,
            comment: comment || ''
        });

        await review.save();

        // Populate user info
        await review.populate('userId', 'name email');

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            review: {
                _id: review._id,
                gemId: review.gemId,
                userId: review.userId._id,
                rating: review.rating,
                comment: review.comment,
                createdAt: review.createdAt
            }
        });

    } catch (error) {
        console.error('Submit review error:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this gem'
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during review submission'
        });
    }
});

// @route   GET /api/reviews/gem/:gemId
// @desc    Get all reviews for a gem
// @access  Public
router.get('/gem/:gemId', async (req, res) => {
    try {
        const { gemId } = req.params;
        const { page = 1, limit = 10, sort = 'createdAt' } = req.query;

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(gemId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid gem ID format'
            });
        }

        // Validate gem exists
        const gem = await Gem.findById(gemId);
        if (!gem) {
            return res.status(404).json({
                success: false,
                message: 'Gem not found'
            });
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build sort object
        const sortObj = {};
        if (sort === 'rating') {
            sortObj.rating = -1;
        } else {
            sortObj.createdAt = -1;
        }

        // Get reviews with pagination
        const reviews = await Review.find({ gemId })
            .populate('userId', 'name email')
            .sort(sortObj)
            .skip(skip)
            .limit(limitNum)
            .lean();

        // Get total count
        const totalReviews = await Review.countDocuments({ gemId });

        // Calculate average rating
        const ObjectId = mongoose.Types.ObjectId;
        const ratingStats = await Review.aggregate([
            { $match: { gemId: new ObjectId(gemId) } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalRatings: { $sum: 1 }
                }
            }
        ]);

        const averageRating = ratingStats.length > 0 ? ratingStats[0].averageRating : 0;

        res.status(200).json({
            success: true,
            reviews: reviews.map(review => ({
                _id: review._id,
                gemId: review.gemId,
                user: {
                    _id: review.userId._id,
                    name: review.userId.name
                },
                rating: review.rating,
                comment: review.comment,
                createdAt: review.createdAt
            })),
            averageRating: Math.round(averageRating * 10) / 10,
            totalReviews
        });

    } catch (error) {
        console.error('Get gem reviews error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during reviews retrieval'
        });
    }
});

// @route   GET /api/reviews/user
// @desc    Get current user's reviews
// @access  Private
router.get('/user', protect, async (req, res) => {
    try {
        const reviews = await Review.find({ userId: req.user._id })
            .populate('gemId', 'name images price')
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            reviews: reviews.map(review => ({
                _id: review._id,
                gemId: review.gemId._id,
                gem: {
                    _id: review.gemId._id,
                    name: review.gemId.name
                },
                rating: review.rating,
                comment: review.comment,
                createdAt: review.createdAt
            }))
        });

    } catch (error) {
        console.error('Get user reviews error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during reviews retrieval'
        });
    }
});

// @route   PUT /api/reviews/:reviewId
// @desc    Update a review
// @access  Private
router.put('/:reviewId', protect, [
    body('rating')
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
    body('comment')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Comment cannot exceed 1000 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { reviewId } = req.params;
        const { rating, comment } = req.body;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if user owns this review
        if (review.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this review'
            });
        }

        // Update review
        if (rating !== undefined) review.rating = rating;
        if (comment !== undefined) review.comment = comment;

        await review.save();

        res.status(200).json({
            success: true,
            message: 'Review updated successfully',
            review: {
                _id: review._id,
                rating: review.rating,
                comment: review.comment,
                updatedAt: review.updatedAt
            }
        });

    } catch (error) {
        console.error('Update review error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during review update'
        });
    }
});

// @route   DELETE /api/reviews/:reviewId
// @desc    Delete a review
// @access  Private
router.delete('/:reviewId', protect, async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if user owns this review
        if (review.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this review'
            });
        }

        await Review.findByIdAndDelete(reviewId);

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });

    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during review deletion'
        });
    }
});

// @route   GET /api/reviews/check/:gemId
// @desc    Check if current user has reviewed a gem
// @access  Private
router.get('/check/:gemId', protect, async (req, res) => {
    try {
        const { gemId } = req.params;
        const userId = req.user._id;

        const review = await Review.findOne({ gemId, userId }).lean();

        res.status(200).json({
            success: true,
            hasReviewed: !!review,
            review: review ? {
                _id: review._id,
                rating: review.rating,
                comment: review.comment
            } : null
        });

    } catch (error) {
        console.error('Check review error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during review check'
        });
    }
});

module.exports = router;
