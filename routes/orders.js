const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Gem = require('../models/Gem');
const Cart = require('../models/Cart');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order (BUYER ONLY)
// @access  Private (Buyer)
router.post('/', protect, checkRole('buyer'), [
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('shippingAddress.name').trim().notEmpty().withMessage('Name is required'),
    body('shippingAddress.phone').trim().notEmpty().withMessage('Phone is required'),
    body('shippingAddress.addressLine1').trim().notEmpty().withMessage('Address is required'),
    body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
    body('shippingAddress.state').trim().notEmpty().withMessage('State is required'),
    body('shippingAddress.pincode').trim().notEmpty().withMessage('Pincode is required'),
    body('shippingAddress.country').trim().notEmpty().withMessage('Country is required'),
    body('paymentMethod').isIn(['COD', 'Online']).withMessage('Valid payment method required'),
    body('totalPrice').isNumeric().isFloat({ min: 0 }).withMessage('Valid total price required')
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

        const { items, shippingAddress, paymentMethod, totalPrice } = req.body;

        // Validate and get gem details
        const orderItems = await Promise.all(
            items.map(async (item) => {
                const gem = await Gem.findById(item.gem).populate('seller', '_id');
                if (!gem) {
                    throw new Error(`Gem with ID ${item.gem} not found`);
                }
                if (!gem.availability || gem.stock < item.quantity) {
                    throw new Error(`${gem.name} is not available or insufficient stock`);
                }

                // Update gem stock
                gem.stock -= item.quantity;
                await gem.save();

                return {
                    gem: item.gem,
                    quantity: item.quantity,
                    price: item.price,
                    seller: gem.seller._id
                };
            })
        );

        // Create order
        const order = new Order({
            user: req.user._id,
            items: orderItems,
            shippingAddress,
            paymentMethod,
            totalPrice
        });

        await order.save();

        // Clear user's cart
        await Cart.findOneAndUpdate(
            { user: req.user._id },
            { items: [] }
        );

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order: {
                _id: order._id,
                orderNumber: order.orderNumber,
                totalPrice: order.totalPrice,
                status: order.status,
                createdAt: order.createdAt
            }
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during order creation'
        });
    }
});

// @route   GET /api/orders/my-orders
// @desc    Get buyer's orders (BUYER ONLY)
// @access  Private (Buyer)
router.get('/my-orders', protect, checkRole('buyer'), async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        const filter = { user: req.user._id };
        if (status) filter.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const orders = await Order.find(filter)
            .populate('items.gem', 'name hindiName heroImage sizeWeight sizeUnit')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const count = await Order.countDocuments(filter);

        // Format orders with expected delivery dates
        const formattedOrders = orders.map(order => {
            const deliveryDays = order.items[0]?.gem?.deliveryDays || 7;
            const expectedDelivery = new Date(order.createdAt);
            expectedDelivery.setDate(expectedDelivery.getDate() + deliveryDays);

            return {
                _id: order._id,
                orderNumber: order.orderNumber,
                orderDate: order.createdAt,
                status: order.status,
                totalAmount: order.totalPrice,
                deliveryDays,
                expectedDelivery,
                items: order.items,
                shippingAddress: order.shippingAddress,
                createdAt: order.createdAt
            };
        });

        res.json({
            success: true,
            count,
            orders: formattedOrders
        });

    } catch (error) {
        console.error('Get my orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during orders retrieval'
        });
    }
});

// @route   GET /api/orders/seller/orders
// @desc    Get seller's orders (SELLER ONLY)
// @access  Private (Seller)
router.get('/seller/orders', protect, checkRole('seller'), async (req, res) => {
    try {
        const orders = await Order.find({ 'items.seller': req.user._id })
            .populate('user', 'name email phone')
            .populate('items.gem', 'name')
            .sort({ createdAt: -1 });

        // Format orders with buyer information
        const formattedOrders = orders.map(order => ({
            _id: order._id,
            orderNumber: order.orderNumber,
            buyer: {
                _id: order.user._id,
                name: order.user.name,
                email: order.user.email,
                phone: order.user.phone || order.shippingAddress.phone
            },
            items: order.items,
            totalPrice: order.totalPrice,
            status: order.status,
            shippingAddress: order.shippingAddress,
            createdAt: order.createdAt
        }));

        res.json({
            success: true,
            count: formattedOrders.length,
            orders: formattedOrders
        });

    } catch (error) {
        console.error('Get seller orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during orders retrieval'
        });
    }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('items.gem', 'name heroImage price')
            .populate('items.seller', 'name email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user is buyer, seller, or admin
        const isBuyer = order.user._id.toString() === req.user._id.toString();
        const isSeller = order.items.some(item => item.seller._id.toString() === req.user._id.toString());
        const isAdmin = req.user.role === 'admin';

        if (!isBuyer && !isSeller && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this order'
            });
        }

        res.json({
            success: true,
            order
        });

    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during order retrieval'
        });
    }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order (BUYER ONLY)
// @access  Private (Buyer)
router.put('/:id/cancel', protect, checkRole('buyer'), async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user owns this order
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this order'
            });
        }

        // Check if order can be cancelled
        if (['shipped', 'delivered'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel order that has been shipped or delivered'
            });
        }

        if (order.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Order is already cancelled'
            });
        }

        // Restore stock using the model method
        await order.restoreStock();

        order.status = 'cancelled';
        if (req.body.reason) {
            order.cancelReason = req.body.reason;
        }
        order.cancelledAt = new Date();
        await order.save({ validateBeforeSave: false }); // Skip pre-save hook

        res.json({
            success: true,
            message: 'Order cancelled successfully'
        });

    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during order cancellation'
        });
    }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (SELLER ONLY)
// @access  Private (Seller)
router.put('/:id/status', protect, checkRole('seller'), [
    body('status')
        .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
        .withMessage('Valid status is required')
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

        const { status } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if seller has items in this order
        const hasSellerId = order.items.some(item => item.seller.toString() === req.user._id.toString());

        if (!hasSellerId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this order'
            });
        }

        order.status = status;
        await order.save();

        res.json({
            success: true,
            message: 'Order status updated successfully',
            order: {
                _id: order._id,
                orderNumber: order.orderNumber,
                status: order.status
            }
        });

    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during status update'
        });
    }
});

module.exports = router;