const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Wishlist = require('../models/Wishlist');
const Gem = require('../models/Gem');

// @route   POST /api/wishlist/add
// @desc    Add item to wishlist
// @access  Private
router.post('/add', protect, async (req, res) => {
    try {
        const { gemId } = req.body;
        const userId = req.user._id || req.user.id;

        console.log('Add to wishlist:', { userId, gemId });

        if (!gemId) {
            return res.status(400).json({
                success: false,
                message: 'Gem ID is required'
            });
        }

        // Check if gem exists
        const gem = await Gem.findById(gemId);
        if (!gem) {
            return res.status(404).json({
                success: false,
                message: 'Gem not found'
            });
        }

        // Find or create wishlist
        let wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            wishlist = new Wishlist({
                user: userId,
                items: [{ gem: gemId }]
            });
        } else {
            // Check if already exists
            const exists = wishlist.items.some(
                item => item.gem.toString() === gemId
            );

            if (exists) {
                return res.status(400).json({
                    success: false,
                    message: 'Item already in wishlist'
                });
            }

            wishlist.items.push({ gem: gemId });
        }

        await wishlist.save();

        res.status(200).json({
            success: true,
            message: 'Item added to wishlist',
            wishlist: wishlist
        });

    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add item to wishlist',
            error: error.message
        });
    }
});

// @route   GET /api/wishlist
// @desc    Get user's wishlist
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;

        const wishlist = await Wishlist.findOne({ user: userId })
            .populate({
                path: 'items.gem',
                select: 'name hindiName price discount discountType heroImage category sizeWeight sizeUnit stock availability'
            });

        if (!wishlist) {
            return res.status(200).json({
                success: true,
                items: [],
                message: 'Wishlist is empty'
            });
        }

        // Filter out deleted gems
        const validItems = wishlist.items.filter(item => item.gem !== null);

        res.status(200).json({
            success: true,
            items: validItems,
            totalItems: validItems.length
        });

    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch wishlist',
            error: error.message
        });
    }
});

// @route   DELETE /api/wishlist/remove/:gemId
// @desc    Remove item from wishlist
// @access  Private
router.delete('/remove/:gemId', protect, async (req, res) => {
    try {
        const { gemId } = req.params;
        const userId = req.user._id || req.user.id;

        const wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist not found'
            });
        }

        const initialLength = wishlist.items.length;
        wishlist.items = wishlist.items.filter(
            item => item.gem.toString() !== gemId
        );

        if (wishlist.items.length === initialLength) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in wishlist'
            });
        }

        await wishlist.save();

        res.status(200).json({
            success: true,
            message: 'Item removed from wishlist'
        });

    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove item',
            error: error.message
        });
    }
});

// @route   GET /api/wishlist/check/:gemId
// @desc    Check if item is in wishlist
// @access  Private
router.get('/check/:gemId', protect, async (req, res) => {
    try {
        const { gemId } = req.params;
        const userId = req.user._id || req.user.id;

        const wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            return res.status(200).json({
                success: true,
                isInWishlist: false
            });
        }

        const isInWishlist = wishlist.items.some(
            item => item.gem.toString() === gemId
        );

        res.status(200).json({
            success: true,
            isInWishlist: isInWishlist
        });

    } catch (error) {
        console.error('Error checking wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check wishlist',
            error: error.message
        });
    }
});

// @route   DELETE /api/wishlist/clear
// @desc    Clear wishlist
// @access  Private
router.delete('/clear', protect, async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;

        const wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist not found'
            });
        }

        wishlist.items = [];
        await wishlist.save();

        res.status(200).json({
            success: true,
            message: 'Wishlist cleared'
        });

    } catch (error) {
        console.error('Error clearing wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear wishlist',
            error: error.message
        });
    }
});

// @route   GET /api/wishlist/count
// @desc    Get wishlist count
// @access  Private
router.get('/count', protect, async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const wishlist = await Wishlist.findOne({ user: userId });
        const count = wishlist ? wishlist.items.length : 0;

        res.status(200).json({
            success: true,
            count: count
        });

    } catch (error) {
        console.error('Error getting wishlist count:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get count',
            error: error.message
        });
    }
});

module.exports = router;
