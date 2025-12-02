const express = require('express');
const { body, validationResult } = require('express-validator');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Gem = require('../models/Gem');
const Cart = require('../models/Cart');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

const router = express.Router();

// Validate Razorpay configuration
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn('⚠️  Razorpay keys not found in environment variables. Payment features will not work.');
    console.warn('   Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file');
}

// Initialize Razorpay instance (only if keys are available)
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    try {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        console.log('✅ Razorpay initialized successfully');
    } catch (error) {
        console.error('❌ Razorpay initialization failed:', error.message);
    }
}

// Helper function to check if Razorpay is configured
const isRazorpayConfigured = () => {
    if (!razorpay) {
        throw new Error('Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file');
    }
    return true;
};

// @route   POST /api/payments/create-order
// @desc    Create Razorpay order for payment (BUYER ONLY)
// @access  Private (Buyer)
router.post('/create-order', protect, checkRole('buyer'), [
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('shippingAddress.name').trim().notEmpty().withMessage('Name is required'),
    body('shippingAddress.phone').trim().notEmpty().withMessage('Phone is required'),
    body('shippingAddress.addressLine1').trim().notEmpty().withMessage('Address is required'),
    body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
    body('shippingAddress.state').trim().notEmpty().withMessage('State is required'),
    body('shippingAddress.pincode').trim().notEmpty().withMessage('Pincode is required'),
    body('shippingAddress.country').trim().notEmpty().withMessage('Country is required'),
    body('totalPrice').isNumeric().isFloat({ min: 1 }).withMessage('Valid total price required (minimum ₹1)')
], async (req, res) => {
    try {
        // Check if Razorpay is configured
        isRazorpayConfigured();

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { items, shippingAddress, totalPrice } = req.body;

        // Validate minimum amount (Razorpay minimum is ₹1, but we'll use ₹100 for practical purposes)
        const amountInPaise = Math.round(totalPrice * 100); // Convert to paise
        if (amountInPaise < 100) {
            return res.status(400).json({
                success: false,
                message: 'Order amount must be at least ₹1.00',
                error: {
                    code: 'MIN_AMOUNT_ERROR',
                    description: 'Order amount less than minimum amount allowed',
                    field: 'totalPrice'
                }
            });
        }

        // Check for existing failed/pending payment orders for this user
        // Clean up old failed payment orders (older than 1 hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        await Order.deleteMany({
            user: req.user._id,
            paymentMethod: 'Online',
            paymentStatus: { $in: ['pending', 'failed'] },
            createdAt: { $lt: oneHourAgo }
        });

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

        // Create order in database first (with pending payment status)
        const order = new Order({
            user: req.user._id,
            items: orderItems,
            shippingAddress,
            paymentMethod: 'Online',
            paymentStatus: 'pending',
            totalPrice
        });

        await order.save();

        // Create Razorpay order
        const razorpayOrderOptions = {
            amount: amountInPaise,
            currency: 'INR',
            receipt: order.orderNumber,
            notes: {
                orderId: order._id.toString(),
                userId: req.user._id.toString(),
                orderNumber: order.orderNumber
            }
        };

        const razorpayOrder = await razorpay.orders.create(razorpayOrderOptions);

        // Update order with Razorpay order ID
        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        res.status(201).json({
            success: true,
            message: 'Payment order created successfully',
            order: {
                _id: order._id,
                orderNumber: order.orderNumber,
                totalPrice: order.totalPrice,
                status: order.status,
                paymentStatus: order.paymentStatus,
                createdAt: order.createdAt
            },
            razorpayOrder: {
                id: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                receipt: razorpayOrder.receipt,
                status: razorpayOrder.status
            },
            keyId: process.env.RAZORPAY_KEY_ID // Send key ID to frontend for payment
        });

    } catch (error) {
        console.error('Create payment order error:', error);

        // Handle MongoDB duplicate key errors
        if (error.code === 11000) {
            // If duplicate key error on orderId (old index issue)
            if (error.keyPattern && error.keyPattern.orderId) {
                console.warn('⚠️  Duplicate orderId detected - old database index issue');
                console.warn('   Run: node fix-order-index.js to fix this');

                // Try to clean up and retry once
                try {
                    await Order.deleteMany({
                        user: req.user._id,
                        paymentMethod: 'Online',
                        paymentStatus: { $in: ['pending', 'failed'] }
                    });

                    return res.status(409).json({
                        success: false,
                        message: 'Database index issue detected. Please try again in a moment, or contact support.',
                        error: {
                            code: 'DATABASE_INDEX_ERROR',
                            description: 'There is an old database index causing conflicts. The system will attempt to clean this up automatically.'
                        }
                    });
                } catch (cleanupError) {
                    return res.status(500).json({
                        success: false,
                        message: 'Database configuration issue. Please contact support.',
                        error: {
                            code: 'DATABASE_ERROR',
                            description: 'Please run the database fix script: node fix-order-index.js'
                        }
                    });
                }
            }

            // If duplicate key error on orderNumber
            if (error.keyPattern && error.keyPattern.orderNumber) {
                // Clean up and suggest retry
                await Order.deleteMany({
                    user: req.user._id,
                    paymentMethod: 'Online',
                    paymentStatus: { $in: ['pending', 'failed'] },
                    orderNumber: null // Clean up orders without order numbers
                });

                return res.status(409).json({
                    success: false,
                    message: 'A pending payment order already exists. Please try again.',
                    error: {
                        code: 'DUPLICATE_ORDER',
                        description: 'Cleaned up old orders. Please try creating the order again.'
                    }
                });
            }
        }

        // Handle Razorpay specific errors
        if (error.error && error.error.code) {
            return res.status(400).json({
                success: false,
                message: error.error.description || 'Payment order creation failed',
                error: error.error
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Server error during payment order creation'
        });
    }
});

// @route   POST /api/payments/verify-payment
// @desc    Verify Razorpay payment and update order (BUYER ONLY)
// @access  Private (Buyer)
router.post('/verify-payment', protect, checkRole('buyer'), [
    body('razorpay_order_id').trim().notEmpty().withMessage('Razorpay order ID is required'),
    body('razorpay_payment_id').trim().notEmpty().withMessage('Razorpay payment ID is required'),
    body('razorpay_signature').trim().notEmpty().withMessage('Razorpay signature is required'),
    body('orderId').trim().notEmpty().withMessage('Order ID is required')
], async (req, res) => {
    try {
        // Check if Razorpay is configured
        isRazorpayConfigured();

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

        // Find order
        const order = await Order.findById(orderId);

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
                message: 'Not authorized to verify this payment'
            });
        }

        // Check if order is already paid
        if (order.paymentStatus === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Payment already verified for this order'
            });
        }

        // Verify Razorpay signature
        const text = `${razorpay_order_id}|${razorpay_payment_id}`;
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(text)
            .digest('hex');

        if (generatedSignature !== razorpay_signature) {
            // Payment verification failed
            order.paymentStatus = 'failed';
            await order.save();

            return res.status(400).json({
                success: false,
                message: 'Payment verification failed - Invalid signature'
            });
        }

        // Verify with Razorpay API
        try {
            const payment = await razorpay.payments.fetch(razorpay_payment_id);

            if (payment.status === 'captured' || payment.status === 'authorized') {
                // Payment successful - update order
                order.paymentStatus = 'completed';
                order.razorpayPaymentId = razorpay_payment_id;
                order.razorpaySignature = razorpay_signature;
                order.status = 'processing'; // Move order to processing after payment

                // Reduce stock when payment is confirmed
                for (const item of order.items) {
                    await Gem.findByIdAndUpdate(item.gem, {
                        $inc: {
                            stock: -item.quantity,
                            sales: item.quantity
                        }
                    });
                }

                await order.save();

                // Clear user's cart
                await Cart.findOneAndUpdate(
                    { user: req.user._id },
                    { items: [] }
                );

                res.json({
                    success: true,
                    message: 'Payment verified successfully',
                    order: {
                        _id: order._id,
                        orderNumber: order.orderNumber,
                        totalPrice: order.totalPrice,
                        status: order.status,
                        paymentStatus: order.paymentStatus,
                        createdAt: order.createdAt
                    }
                });
            } else {
                // Payment not captured
                order.paymentStatus = 'failed';
                await order.save();

                res.status(400).json({
                    success: false,
                    message: 'Payment not captured',
                    paymentStatus: payment.status
                });
            }
        } catch (razorpayError) {
            console.error('Razorpay payment fetch error:', razorpayError);
            order.paymentStatus = 'failed';
            await order.save();

            res.status(500).json({
                success: false,
                message: 'Error verifying payment with Razorpay'
            });
        }

    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during payment verification'
        });
    }
});

// @route   POST /api/payments/webhook
// @desc    Razorpay webhook handler for payment events
// @access  Public (Razorpay calls this)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        // Check if Razorpay is configured
        if (!razorpay) {
            return res.status(503).json({
                success: false,
                message: 'Razorpay is not configured'
            });
        }

        const signature = req.headers['x-razorpay-signature'];
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

        // Verify webhook signature
        const text = req.body.toString();
        const generatedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(text)
            .digest('hex');

        if (generatedSignature !== signature) {
            console.error('Webhook signature verification failed');
            return res.status(400).json({ success: false, message: 'Invalid signature' });
        }

        const event = JSON.parse(req.body);
        const { event: eventType, payload } = event;

        // Handle payment.captured event
        if (eventType === 'payment.captured') {
            const payment = payload.payment.entity;
            const orderId = payment.notes?.orderId;

            if (orderId) {
                const order = await Order.findById(orderId);
                if (order && order.paymentStatus !== 'completed') {
                    order.paymentStatus = 'completed';
                    order.razorpayPaymentId = payment.id;
                    order.status = 'processing';

                    // Reduce stock
                    for (const item of order.items) {
                        await Gem.findByIdAndUpdate(item.gem, {
                            $inc: {
                                stock: -item.quantity,
                                sales: item.quantity
                            }
                        });
                    }

                    await order.save();
                    console.log(`Order ${order.orderNumber} payment confirmed via webhook`);
                }
            }
        }

        // Handle payment.failed event
        if (eventType === 'payment.failed') {
            const payment = payload.payment.entity;
            const orderId = payment.notes?.orderId;

            if (orderId) {
                const order = await Order.findById(orderId);
                if (order && order.paymentStatus === 'pending') {
                    order.paymentStatus = 'failed';
                    await order.save();
                    console.log(`Order ${order.orderNumber} payment failed via webhook`);
                }
            }
        }

        res.json({ success: true, message: 'Webhook processed' });

    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ success: false, message: 'Webhook processing failed' });
    }
});

// @route   DELETE /api/payments/cancel-pending-order
// @desc    Cancel pending payment order (BUYER ONLY)
// @access  Private (Buyer)
router.delete('/cancel-pending-order', protect, checkRole('buyer'), async (req, res) => {
    try {
        // Find and delete pending payment orders for this user
        const deletedOrders = await Order.deleteMany({
            user: req.user._id,
            paymentMethod: 'Online',
            paymentStatus: { $in: ['pending', 'failed'] }
        });

        res.json({
            success: true,
            message: 'Pending payment orders cancelled successfully',
            deletedCount: deletedOrders.deletedCount
        });

    } catch (error) {
        console.error('Cancel pending order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during order cancellation'
        });
    }
});

// @route   GET /api/payments/order-status/:orderId
// @desc    Get payment status for an order (BUYER ONLY)
// @access  Private (Buyer)
router.get('/order-status/:orderId', protect, checkRole('buyer'), async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId)
            .select('_id orderNumber paymentStatus razorpayOrderId razorpayPaymentId status totalPrice createdAt');

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
                message: 'Not authorized to view this order'
            });
        }

        res.json({
            success: true,
            order: {
                _id: order._id,
                orderNumber: order.orderNumber,
                paymentStatus: order.paymentStatus,
                status: order.status,
                razorpayOrderId: order.razorpayOrderId,
                razorpayPaymentId: order.razorpayPaymentId,
                totalPrice: order.totalPrice,
                createdAt: order.createdAt
            }
        });

    } catch (error) {
        console.error('Get order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during order status retrieval'
        });
    }
});

module.exports = router;

