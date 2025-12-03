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

                return {
                    gem: item.gem,
                    quantity: item.quantity,
                    price: item.price,
                    seller: gem.seller._id
                };
            })
        );

        // Reduce stock for COD orders (immediate stock reduction)
        if (paymentMethod === 'COD') {
            for (const item of orderItems) {
                await Gem.findByIdAndUpdate(item.gem, {
                    $inc: {
                        stock: -item.quantity,
                        sales: item.quantity
                    }
                });
            }
        }

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

// @route   GET /api/orders
// @desc    Get buyer's orders - alias for /my-orders (BUYER ONLY)
// @access  Private (Buyer)
router.get('/', protect, checkRole('buyer'), async (req, res) => {
    // Redirect to my-orders logic
    const { page = 1, limit = 10, status } = req.query;

    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    try {
        const orders = await Order.find(filter)
            .populate('items.gem', 'name hindiName heroImage sizeWeight sizeUnit category subcategory')
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
                paymentStatus: order.paymentStatus,
                paymentMethod: order.paymentMethod,
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
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during orders retrieval'
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
            .populate('items.gem', 'name hindiName heroImage sizeWeight sizeUnit category subcategory')
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
                paymentStatus: order.paymentStatus,
                paymentMethod: order.paymentMethod,
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
// @desc    Get seller's orders with filters (SELLER ONLY)
// @access  Private (Seller)
router.get('/seller/orders', protect, checkRole('seller'), async (req, res) => {
    try {
        const { page = 1, limit = 20, status, paymentStatus } = req.query;

        // Build filter - only orders where seller has items
        const filter = { 'items.seller': req.user._id };
        if (status) filter.status = status;
        if (paymentStatus) filter.paymentStatus = paymentStatus;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const orders = await Order.find(filter)
            .populate('user', 'name email phone')
            .populate('items.gem', 'name category subcategory heroImage price stock sizeWeight sizeUnit')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Filter items to only show seller's items
        const formattedOrders = orders.map(order => {
            // Filter items to only this seller's items
            const sellerItems = order.items.filter(item =>
                item.seller.toString() === req.user._id.toString()
            );

            // Calculate total for seller's items only
            const sellerTotal = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            return {
                _id: order._id,
                orderNumber: order.orderNumber,
                buyer: {
                    _id: order.user._id,
                    name: order.user.name,
                    email: order.user.email,
                    phone: order.user.phone || order.shippingAddress.phone
                },
                items: sellerItems.map(item => ({
                    _id: item._id,
                    gem: item.gem,
                    quantity: item.quantity,
                    price: item.price,
                    subtotal: item.price * item.quantity
                })),
                totalPrice: sellerTotal,
                status: order.status,
                paymentStatus: order.paymentStatus,
                paymentMethod: order.paymentMethod,
                shippingAddress: order.shippingAddress,
                trackingNumber: order.trackingNumber || null,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt
            };
        });

        const count = await Order.countDocuments(filter);

        res.json({
            success: true,
            count: formattedOrders.length,
            total: count,
            orders: formattedOrders,
            pagination: {
                currentPage: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / parseInt(limit)),
                total: count
            }
        });

    } catch (error) {
        console.error('Get seller orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during orders retrieval'
        });
    }
});

// @route   GET /api/orders/seller/orders/stats
// @desc    Get seller order statistics (SELLER ONLY)
// @access  Private (Seller)
router.get('/seller/orders/stats', protect, checkRole('seller'), async (req, res) => {
    try {
        // Get all orders containing seller's items
        const orders = await Order.find({ 'items.seller': req.user._id })
            .select('items status totalPrice paymentStatus');

        // Initialize stats
        const stats = {
            totalOrders: 0,
            pendingOrders: 0,
            processingOrders: 0,
            shippedOrders: 0,
            deliveredOrders: 0,
            cancelledOrders: 0,
            totalRevenue: 0,
            pendingRevenue: 0,
            completedRevenue: 0
        };

        // Calculate statistics
        orders.forEach(order => {
            // Filter to only seller's items
            const sellerItems = order.items.filter(item =>
                item.seller.toString() === req.user._id.toString()
            );

            // Calculate revenue for seller's items only
            const orderRevenue = sellerItems.reduce((sum, item) =>
                sum + (item.price * item.quantity), 0
            );

            // Update counts
            stats.totalOrders++;
            switch (order.status) {
                case 'pending':
                    stats.pendingOrders++;
                    stats.pendingRevenue += orderRevenue;
                    break;
                case 'processing':
                    stats.processingOrders++;
                    break;
                case 'shipped':
                    stats.shippedOrders++;
                    break;
                case 'delivered':
                    stats.deliveredOrders++;
                    stats.completedRevenue += orderRevenue;
                    break;
                case 'cancelled':
                    stats.cancelledOrders++;
                    break;
            }

            // Add to total revenue
            stats.totalRevenue += orderRevenue;
        });

        res.json({
            success: true,
            stats
        });

    } catch (error) {
        console.error('Get seller order stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during statistics retrieval'
        });
    }
});

// @route   GET /api/orders/seller/orders/stats
// @desc    Get seller order statistics (SELLER ONLY)
// @access  Private (Seller)
// NOTE: This route must come BEFORE /seller/orders/:orderId to avoid route conflicts
router.get('/seller/orders/stats', protect, checkRole('seller'), async (req, res) => {
    try {
        // Get all orders containing seller's items
        const orders = await Order.find({ 'items.seller': req.user._id })
            .select('items status totalPrice paymentStatus');

        // Initialize stats
        const stats = {
            totalOrders: 0,
            pendingOrders: 0,
            processingOrders: 0,
            shippedOrders: 0,
            deliveredOrders: 0,
            cancelledOrders: 0,
            totalRevenue: 0,
            pendingRevenue: 0,
            completedRevenue: 0
        };

        // Calculate statistics
        orders.forEach(order => {
            // Filter to only seller's items
            const sellerItems = order.items.filter(item =>
                item.seller.toString() === req.user._id.toString()
            );

            // Calculate revenue for seller's items only
            const orderRevenue = sellerItems.reduce((sum, item) =>
                sum + (item.price * item.quantity), 0
            );

            // Update counts
            stats.totalOrders++;
            switch (order.status) {
                case 'pending':
                    stats.pendingOrders++;
                    stats.pendingRevenue += orderRevenue;
                    break;
                case 'processing':
                    stats.processingOrders++;
                    break;
                case 'shipped':
                    stats.shippedOrders++;
                    break;
                case 'delivered':
                    stats.deliveredOrders++;
                    stats.completedRevenue += orderRevenue;
                    break;
                case 'cancelled':
                    stats.cancelledOrders++;
                    break;
            }

            // Add to total revenue
            stats.totalRevenue += orderRevenue;
        });

        res.json({
            success: true,
            stats
        });

    } catch (error) {
        console.error('Get seller order stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during statistics retrieval'
        });
    }
});

// @route   GET /api/orders/seller/orders/:orderId
// @desc    Get seller order by ID (SELLER ONLY)
// @access  Private (Seller)
router.get('/seller/orders/:orderId', protect, checkRole('seller'), async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId)
            .populate('user', 'name email phone')
            .populate('items.gem', 'name category subcategory heroImage images price stock sizeWeight sizeUnit');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
                error: {
                    code: 'ORDER_NOT_FOUND',
                    description: 'Order does not exist or does not contain seller\'s items'
                }
            });
        }

        // Check if seller has items in this order
        const sellerItems = order.items.filter(item =>
            item.seller.toString() === req.user._id.toString()
        );

        if (sellerItems.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. This order does not contain your items.',
                error: {
                    code: 'FORBIDDEN',
                    description: 'Seller can only access orders containing their items'
                }
            });
        }

        // Calculate total for seller's items only
        const sellerTotal = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Build status history (simplified - can be enhanced with actual history tracking)
        const statusHistory = [
            {
                status: order.status,
                timestamp: order.updatedAt || order.createdAt
            }
        ];
        if (order.status !== 'pending') {
            statusHistory.unshift({
                status: 'pending',
                timestamp: order.createdAt
            });
        }

        const orderData = {
            _id: order._id,
            orderNumber: order.orderNumber,
            buyer: {
                _id: order.user._id,
                name: order.user.name,
                email: order.user.email,
                phone: order.user.phone || order.shippingAddress.phone
            },
            items: sellerItems.map(item => ({
                _id: item._id,
                gem: {
                    _id: item.gem._id,
                    name: item.gem.name,
                    category: item.gem.category,
                    subcategory: item.gem.subcategory,
                    heroImage: item.gem.heroImage,
                    images: item.gem.images || item.gem.allImages || [],
                    price: item.gem.price,
                    stock: item.gem.stock,
                    sizeWeight: item.gem.sizeWeight,
                    sizeUnit: item.gem.sizeUnit
                },
                quantity: item.quantity,
                price: item.price,
                subtotal: item.price * item.quantity
            })),
            totalPrice: sellerTotal,
            status: order.status,
            paymentStatus: order.paymentStatus,
            paymentMethod: order.paymentMethod,
            shippingAddress: order.shippingAddress,
            trackingNumber: order.trackingNumber || null,
            statusHistory,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
        };

        res.json({
            success: true,
            order: orderData
        });

    } catch (error) {
        console.error('Get seller order by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during order retrieval'
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
            .populate('items.gem', 'name heroImage price category subcategory')
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
        .withMessage('Valid status is required'),
    body('trackingNumber').optional().isString().withMessage('Tracking number must be a string')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                error: {
                    code: 'VALIDATION_ERROR',
                    description: errors.array()[0].msg
                },
                errors: errors.array()
            });
        }

        const { status, trackingNumber } = req.body;

        const order = await Order.findById(req.params.id)
            .populate('items.gem', 'name stock');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
                error: {
                    code: 'ORDER_NOT_FOUND',
                    description: 'Order does not exist'
                }
            });
        }

        // Check if seller has items in this order
        const hasSellerId = order.items.some(item => item.seller.toString() === req.user._id.toString());

        if (!hasSellerId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. This order does not contain your items.',
                error: {
                    code: 'FORBIDDEN',
                    description: 'Seller can only update orders containing their items'
                }
            });
        }

        // Validate status transitions (sellers cannot set to delivered)
        if (status === 'delivered') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only admin can mark orders as delivered.',
                error: {
                    code: 'FORBIDDEN',
                    description: 'Sellers cannot update order status to delivered'
                }
            });
        }

        // Check if order is in final state
        if (['delivered', 'cancelled'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status transition',
                error: {
                    code: 'INVALID_TRANSITION',
                    description: `Cannot update order that is already ${order.status}`
                }
            });
        }

        // Validate status transitions
        const validTransitions = {
            'pending': ['processing', 'cancelled'],
            'processing': ['shipped', 'cancelled'],
            'shipped': [] // Sellers cannot change shipped status
        };

        if (validTransitions[order.status] && !validTransitions[order.status].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status transition',
                error: {
                    code: 'INVALID_TRANSITION',
                    description: `Cannot transition from '${order.status}' to '${status}'`
                }
            });
        }

        // Validate tracking number for shipped status
        if (status === 'shipped' && !trackingNumber) {
            return res.status(400).json({
                success: false,
                message: 'Tracking number is required when status is \'shipped\'',
                error: {
                    code: 'VALIDATION_ERROR',
                    description: 'trackingNumber field is required for shipped status'
                }
            });
        }

        // Update order status
        order.status = status;
        if (trackingNumber) {
            order.trackingNumber = trackingNumber;
        }
        await order.save();

        res.json({
            success: true,
            message: 'Order status updated successfully',
            order: {
                _id: order._id,
                orderNumber: order.orderNumber,
                status: order.status,
                trackingNumber: order.trackingNumber,
                updatedAt: order.updatedAt
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