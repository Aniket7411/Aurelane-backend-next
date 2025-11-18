const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Seller = require('../models/Seller');
const Gem = require('../models/Gem');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/role');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

const router = express.Router();

// @route   GET /api/admin/sellers
// @desc    Get all sellers with stats
// @access  Private (Admin only)
router.get('/sellers', protect, checkRole('admin'), async (req, res) => {
    try {
        const { page = 1, limit = 20, search, status } = req.query;

        // Build filter
        const filter = {};
        if (search) {
            filter.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { shopName: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Status filter mapping
        if (status === 'active') {
            filter.status = { $in: ['approved', 'active'] };
            filter.isVerified = true;
        } else if (status === 'pending') {
            filter.status = 'pending';
        } else if (status === 'suspended') {
            filter.status = 'suspended';
        } else if (status === 'blocked') {
            filter.isBlocked = true;
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get sellers with user info
        const sellers = await Seller.find(filter)
            .populate('user', 'name email')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        // Get stats for each seller
        const sellersWithStats = await Promise.all(
            sellers.map(async (seller) => {
                const totalGems = await Gem.countDocuments({ seller: seller.user });

                const orders = await Order.aggregate([
                    {
                        $match: { 'items.seller': seller.user }
                    },
                    {
                        $group: {
                            _id: null,
                            count: { $sum: 1 },
                            revenue: { $sum: '$totalPrice' }
                        }
                    }
                ]);

                // Calculate rating (placeholder - can be from reviews later)
                const rating = 4.5; // Placeholder

                return {
                    _id: seller._id,
                    name: seller.user?.name || seller.fullName,
                    fullName: seller.fullName,
                    email: seller.email || seller.user?.email,
                    phone: seller.phone,
                    shopName: seller.shopName,
                    address: seller.address || {},
                    status: seller.status || (seller.isVerified ? 'approved' : 'pending'),
                    isBlocked: seller.isBlocked || false,
                    isVerified: seller.isVerified || false,
                    rating: rating,
                    totalGems,
                    createdAt: seller.createdAt,
                    registrationDate: seller.createdAt
                };
            })
        );

        // Get total count
        const count = await Seller.countDocuments(filter);
        const totalPages = Math.ceil(count / parseInt(limit));

        return sendSuccess(res, {
            data: {
                sellers: sellersWithStats,
                pagination: {
                    currentPage: parseInt(page),
                    limit: parseInt(limit),
                    total: count,
                    totalPages
                }
            },
            message: 'Sellers retrieved successfully'
        });

    } catch (error) {
        console.error('Get sellers error:', error);
        return sendError(res, {
            message: 'Server error during sellers retrieval',
            error
        });
    }
});

// @route   GET /api/admin/sellers/:sellerId
// @desc    Get seller details with gems and orders
// @access  Private (Admin only)
router.get('/sellers/:sellerId', protect, checkRole('admin'), async (req, res) => {
    try {
        const seller = await Seller.findById(req.params.sellerId)
            .populate('user', 'name email');

        if (!seller) {
            return sendError(res, {
                message: 'Seller not found',
                statusCode: 404
            });
        }

        // Get seller's gems with full details
        const gems = await Gem.find({ seller: seller.user })
            .select('name category price stock availability images sizeWeight sizeUnit')
            .sort({ createdAt: -1 })
            .limit(10);

        // Get seller's orders
        const orders = await Order.find({ 'items.seller': seller.user })
            .select('orderNumber totalPrice status createdAt')
            .sort({ createdAt: -1 })
            .limit(10);

        // Get stats
        const totalGems = await Gem.countDocuments({ seller: seller.user });
        const orderStats = await Order.aggregate([
            {
                $match: { 'items.seller': seller.user }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    revenue: { $sum: '$totalPrice' }
                }
            }
        ]);

        const sellerData = {
            _id: seller._id,
            name: seller.user?.name || seller.fullName,
            fullName: seller.fullName,
            email: seller.email || seller.user?.email,
            phone: seller.phone,
            alternatePhone: seller.alternatePhone,
            shopName: seller.shopName,
            shopType: seller.shopType,
            yearEstablished: seller.yearEstablished,
            address: seller.address || {},
            businessType: seller.businessType,
            gstNumber: seller.gstNumber,
            panNumber: seller.panNumber,
            aadharNumber: seller.aadharNumber,
            gemTypes: seller.gemTypes || [],
            specialization: seller.specialization || [],
            accountHolderName: seller.accountHolderName,
            bankName: seller.bankName,
            accountNumber: seller.accountNumber,
            ifscCode: seller.ifscCode,
            status: seller.status || (seller.isVerified ? 'approved' : 'pending'),
            isBlocked: seller.isBlocked || false,
            isVerified: seller.isVerified || false,
            rating: 4.5, // Placeholder
            totalSales: orderStats[0]?.count || 0,
            totalOrders: orderStats[0]?.count || 0,
            stats: {
                totalGems,
                totalOrders: orderStats[0]?.count || 0,
                totalRevenue: orderStats[0]?.revenue || 0
            },
            gems: gems.map(gem => ({
                _id: gem._id,
                name: gem.name,
                category: gem.category || gem.name,
                price: gem.price,
                stock: gem.stock,
                images: gem.images || [gem.heroImage],
                sizeWeight: gem.sizeWeight,
                sizeUnit: gem.sizeUnit
            })),
            createdAt: seller.createdAt,
            suspendedAt: seller.suspendedAt || null
        };

        return sendSuccess(res, {
            data: { seller: sellerData },
            message: 'Seller details retrieved successfully'
        });

    } catch (error) {
        console.error('Get seller details error:', error);
        return sendError(res, {
            message: 'Server error during seller details retrieval',
            error
        });
    }
});

// @route   PUT /api/admin/sellers/:sellerId/verify
// @desc    Update seller verification status
// @access  Private (Admin only)
router.put('/sellers/:sellerId/verify', protect, checkRole('admin'), [
    body('isVerified').isBoolean().withMessage('isVerified must be a boolean')
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

        const { isVerified } = req.body;

        const seller = await Seller.findByIdAndUpdate(
            req.params.sellerId,
            {
                isVerified,
                status: isVerified ? 'approved' : 'pending'
            },
            { new: true }
        );

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }

        res.json({
            success: true,
            message: 'Seller verification status updated',
            seller: {
                _id: seller._id,
                isVerified: seller.isVerified,
                status: seller.status,
                updatedAt: seller.updatedAt
            }
        });

    } catch (error) {
        console.error('Update seller verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during verification update'
        });
    }
});

// @route   PUT /api/admin/sellers/:sellerId/status
// @desc    Update seller status (approve/reject/suspend)
// @access  Private (Admin only)
router.put('/sellers/:sellerId/status', protect, checkRole('admin'), [
    body('status').isIn(['pending', 'approved', 'rejected', 'suspended', 'active']).withMessage('Valid status required'),
    body('suspensionReason').optional().isString().withMessage('Suspension reason must be a string')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendError(res, {
                message: 'Validation failed',
                statusCode: 400,
                errors: errors.array()
            });
        }

        const { status, suspensionReason } = req.body;

        const updateData = {
            status,
            isVerified: status === 'approved' || status === 'active'
        };

        if (status === 'suspended') {
            updateData.suspensionReason = suspensionReason;
            updateData.suspendedAt = new Date();
            updateData.suspendedBy = req.user._id;
        }

        const seller = await Seller.findByIdAndUpdate(
            req.params.sellerId,
            updateData,
            { new: true }
        ).populate('user', 'name email');

        if (!seller) {
            return sendError(res, {
                message: 'Seller not found',
                statusCode: 404
            });
        }

        return sendSuccess(res, {
            data: { seller },
            message: `Seller ${status} successfully`
        });

    } catch (error) {
        console.error('Update seller status error:', error);
        return sendError(res, {
            message: 'Server error during status update',
            error
        });
    }
});

// @route   PUT /api/admin/sellers/:sellerId/block
// @desc    Block seller
// @access  Private (Admin only)
router.put('/sellers/:sellerId/block', protect, checkRole('admin'), async (req, res) => {
    try {
        const seller = await Seller.findByIdAndUpdate(
            req.params.sellerId,
            { isBlocked: true, status: 'suspended' },
            { new: true }
        ).populate('user', 'name email');

        if (!seller) {
            return sendError(res, {
                message: 'Seller not found',
                statusCode: 404
            });
        }

        // Also block the user account
        await User.findByIdAndUpdate(seller.user, { isActive: false });

        return sendSuccess(res, {
            data: { seller },
            message: 'Seller blocked successfully'
        });

    } catch (error) {
        console.error('Block seller error:', error);
        return sendError(res, {
            message: 'Server error during seller blocking',
            error
        });
    }
});

// @route   PUT /api/admin/sellers/:sellerId/unblock
// @desc    Unblock seller
// @access  Private (Admin only)
router.put('/sellers/:sellerId/unblock', protect, checkRole('admin'), async (req, res) => {
    try {
        const seller = await Seller.findByIdAndUpdate(
            req.params.sellerId,
            { isBlocked: false, status: 'approved' },
            { new: true }
        ).populate('user', 'name email');

        if (!seller) {
            return sendError(res, {
                message: 'Seller not found',
                statusCode: 404
            });
        }

        // Also unblock the user account
        await User.findByIdAndUpdate(seller.user, { isActive: true });

        return sendSuccess(res, {
            data: { seller },
            message: 'Seller unblocked successfully'
        });

    } catch (error) {
        console.error('Unblock seller error:', error);
        return sendError(res, {
            message: 'Server error during seller unblocking',
            error
        });
    }
});

// @route   DELETE /api/admin/sellers/:sellerId
// @desc    Delete seller and their gems
// @access  Private (Admin only)
router.delete('/sellers/:sellerId', protect, checkRole('admin'), async (req, res) => {
    try {
        const seller = await Seller.findById(req.params.sellerId);

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }

        // Delete seller's gems
        await Gem.deleteMany({ seller: seller.user });

        // Delete seller profile
        await Seller.findByIdAndDelete(req.params.sellerId);

        // Optionally delete user account
        await User.findByIdAndDelete(seller.user);

        res.json({
            success: true,
            message: 'Seller deleted successfully'
        });

    } catch (error) {
        console.error('Delete seller error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during seller deletion'
        });
    }
});

// @route   GET /api/admin/orders
// @desc    Get all orders (Admin)
// @access  Private (Admin only)
router.get('/orders', protect, checkRole('admin'), async (req, res) => {
    try {
        const { page = 1, limit = 20, search, status } = req.query;

        const filter = {};
        if (status) filter.status = status;

        // Search filter
        if (search) {
            const searchRegex = { $regex: search, $options: 'i' };
            filter.$or = [
                { orderNumber: searchRegex }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const orders = await Order.find(filter)
            .populate('user', 'name email')
            .populate('items.gem', 'name heroImage')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        // Format orders to match frontend expectations
        const ordersFormatted = orders.map(order => ({
            _id: order._id,
            id: order._id,
            buyer: {
                _id: order.user?._id || order.user,
                name: order.user?.name || 'Unknown',
                email: order.user?.email || ''
            },
            items: order.items.map(item => ({
                _id: item._id,
                product: {
                    _id: item.gem?._id || item.gem,
                    name: item.gem?.name || 'Product',
                    image: item.gem?.heroImage || ''
                },
                quantity: item.quantity,
                price: item.price
            })),
            shippingAddress: order.shippingAddress,
            totalAmount: order.totalPrice,
            total: order.totalPrice,
            status: order.status,
            trackingNumber: order.trackingNumber || null,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
        }));

        const count = await Order.countDocuments(filter);
        const totalPages = Math.ceil(count / parseInt(limit));

        return sendSuccess(res, {
            data: {
                orders: ordersFormatted,
                pagination: {
                    currentPage: parseInt(page),
                    limit: parseInt(limit),
                    total: count,
                    totalPages
                }
            },
            message: 'Orders retrieved successfully'
        });

    } catch (error) {
        console.error('Get admin orders error:', error);
        return sendError(res, {
            message: 'Server error during orders retrieval',
            error
        });
    }
});

// @route   GET /api/admin/orders/:orderId
// @desc    Get order details by ID
// @access  Private (Admin only)
router.get('/orders/:orderId', protect, checkRole('admin'), async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId)
            .populate('user', 'name email phone')
            .populate('items.gem', 'name heroImage price')
            .populate('items.seller', 'name email shopName');

        if (!order) {
            return sendError(res, {
                message: 'Order not found',
                statusCode: 404
            });
        }

        // Build status history (placeholder - can be enhanced)
        const statusHistory = [
            {
                status: order.status,
                timestamp: order.updatedAt || order.createdAt
            }
        ];

        const orderData = {
            _id: order._id,
            buyer: {
                _id: order.user._id,
                name: order.user.name,
                email: order.user.email,
                phone: order.user.phone
            },
            items: order.items.map(item => ({
                _id: item._id,
                product: {
                    _id: item.gem._id,
                    name: item.gem.name,
                    image: item.gem.heroImage,
                    price: item.gem.price
                },
                quantity: item.quantity,
                price: item.price,
                seller: item.seller ? {
                    _id: item.seller._id,
                    name: item.seller.name,
                    shopName: item.seller.shopName
                } : null
            })),
            shippingAddress: order.shippingAddress,
            paymentDetails: {
                method: order.paymentMethod,
                status: order.paymentStatus,
                total: order.totalPrice
            },
            totalAmount: order.totalPrice,
            status: order.status,
            trackingNumber: order.trackingNumber || null,
            statusHistory,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
        };

        return sendSuccess(res, {
            data: { order: orderData },
            message: 'Order details retrieved successfully'
        });

    } catch (error) {
        console.error('Get order details error:', error);
        return sendError(res, {
            message: 'Server error during order details retrieval',
            error
        });
    }
});

// @route   PUT /api/admin/orders/:orderId/status
// @desc    Update order status (Admin)
// @access  Private (Admin only)
router.put('/orders/:orderId/status', protect, checkRole('admin'), [
    body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Valid status required'),
    body('trackingNumber').optional().isString().withMessage('Tracking number must be a string')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendError(res, {
                message: 'Validation failed',
                statusCode: 400,
                errors: errors.array()
            });
        }

        const { status, trackingNumber } = req.body;

        // Validate tracking number for shipped status
        if (status === 'shipped' && !trackingNumber) {
            return sendError(res, {
                message: 'Tracking number is required when status is shipped',
                statusCode: 400
            });
        }

        const updateData = { status };
        if (trackingNumber) {
            updateData.trackingNumber = trackingNumber;
        }

        const order = await Order.findByIdAndUpdate(
            req.params.orderId,
            updateData,
            { new: true }
        )
            .populate('user', 'name email')
            .populate('items.gem', 'name');

        if (!order) {
            return sendError(res, {
                message: 'Order not found',
                statusCode: 404
            });
        }

        return sendSuccess(res, {
            data: { order },
            message: 'Order status updated successfully'
        });

    } catch (error) {
        console.error('Update order status error:', error);
        return sendError(res, {
            message: 'Server error during order status update',
            error
        });
    }
});

// @route   GET /api/admin/gems
// @desc    Get all gems (Admin)
// @access  Private (Admin only)
router.get('/gems', protect, checkRole('admin'), async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;

        const filter = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { hindiName: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const gems = await Gem.find(filter)
            .populate('seller', 'name email')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const count = await Gem.countDocuments(filter);

        return sendPaginated(res, {
            items: gems,
            page: parseInt(page),
            limit: parseInt(limit),
            total: count,
            message: 'Gems retrieved successfully'
        });

    } catch (error) {
        console.error('Get admin gems error:', error);
        return sendError(res, {
            message: 'Server error during gems retrieval',
            error
        });
    }
});

// @route   GET /api/admin/products
// @desc    Get all products/gems (Alias for /gems)
// @access  Private (Admin only)
router.get('/products', protect, checkRole('admin'), async (req, res) => {
    try {
        const { page = 1, limit = 20, search, category, sellerId, status } = req.query;

        const filter = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { hindiName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        if (category) {
            filter.category = category;
        }
        if (sellerId) {
            filter.seller = sellerId;
        }
        if (status === 'active') {
            filter.availability = true;
        } else if (status === 'inactive') {
            filter.availability = false;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const gems = await Gem.find(filter)
            .populate('seller', 'name shopName')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        // Format products to match frontend expectations
        const productsFormatted = gems.map(gem => ({
            _id: gem._id,
            name: gem.name,
            category: gem.category || gem.name,
            price: gem.price,
            stock: gem.stock,
            images: gem.images && gem.images.length > 0 ? gem.images : [gem.heroImage],
            description: gem.description,
            seller: {
                _id: gem.seller?._id || gem.seller,
                name: gem.seller?.name || 'Unknown',
                shopName: gem.seller?.shopName || 'Shop'
            },
            status: gem.availability ? 'active' : 'inactive',
            createdAt: gem.createdAt
        }));

        const count = await Gem.countDocuments(filter);
        const totalPages = Math.ceil(count / parseInt(limit));

        return sendSuccess(res, {
            data: {
                products: productsFormatted,
                pagination: {
                    currentPage: parseInt(page),
                    limit: parseInt(limit),
                    total: count,
                    totalPages
                }
            },
            message: 'Products retrieved successfully'
        });

    } catch (error) {
        console.error('Get admin products error:', error);
        return sendError(res, {
            message: 'Server error during products retrieval',
            error
        });
    }
});

// @route   GET /api/admin/products/:productId
// @desc    Get product details by ID
// @access  Private (Admin only)
router.get('/products/:productId', protect, checkRole('admin'), async (req, res) => {
    try {
        const gem = await Gem.findById(req.params.productId)
            .populate('seller', 'name email shopName');

        if (!gem) {
            return sendError(res, {
                message: 'Product not found',
                statusCode: 404
            });
        }

        const productData = {
            _id: gem._id,
            name: gem.name,
            category: gem.category || gem.name,
            price: gem.price,
            stock: gem.stock,
            images: gem.images && gem.images.length > 0 ? gem.images : [gem.heroImage],
            description: gem.description,
            seller: gem.seller ? {
                _id: gem.seller._id,
                name: gem.seller.name,
                shopName: gem.seller.shopName
            } : null,
            specifications: {
                sizeWeight: gem.sizeWeight,
                sizeUnit: gem.sizeUnit,
                origin: gem.origin,
                certification: gem.certification,
                planet: gem.planet,
                color: gem.color
            },
            status: gem.availability ? 'active' : 'inactive',
            createdAt: gem.createdAt
        };

        return sendSuccess(res, {
            data: { product: productData },
            message: 'Product details retrieved successfully'
        });

    } catch (error) {
        console.error('Get product details error:', error);
        return sendError(res, {
            message: 'Server error during product details retrieval',
            error
        });
    }
});

// @route   DELETE /api/admin/products/:productId
// @desc    Delete product
// @access  Private (Admin only)
router.delete('/products/:productId', protect, checkRole('admin'), async (req, res) => {
    try {
        const gem = await Gem.findById(req.params.productId);

        if (!gem) {
            return sendError(res, {
                message: 'Product not found',
                statusCode: 404
            });
        }

        await Gem.findByIdAndDelete(req.params.productId);

        return sendSuccess(res, {
            message: 'Product deleted successfully'
        });

    } catch (error) {
        console.error('Delete product error:', error);
        return sendError(res, {
            message: 'Server error during product deletion',
            error
        });
    }
});

// @route   GET /api/admin/buyers
// @desc    Get all buyers/users
// @access  Private (Admin only)
router.get('/buyers', protect, checkRole('admin'), async (req, res) => {
    try {
        const { page = 1, limit = 20, search, status } = req.query;

        // Build filter for buyers only
        const filter = { role: 'buyer' };
        
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        if (status === 'active') {
            filter.isActive = true;
        } else if (status === 'blocked') {
            filter.isActive = false;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const buyers = await User.find(filter)
            .select('-password')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        // Format buyers to match frontend expectations
        const buyersFormatted = buyers.map(buyer => ({
            _id: buyer._id,
            name: buyer.name,
            fullName: buyer.name,
            email: buyer.email,
            phone: buyer.phone,
            phoneNumber: buyer.phone,
            isBlocked: buyer.isActive === false,
            status: buyer.isActive !== false ? 'active' : 'blocked',
            createdAt: buyer.createdAt,
            registrationDate: buyer.createdAt
        }));

        const count = await User.countDocuments(filter);
        const totalPages = Math.ceil(count / parseInt(limit));

        return sendSuccess(res, {
            data: {
                buyers: buyersFormatted,
                pagination: {
                    currentPage: parseInt(page),
                    limit: parseInt(limit),
                    total: count,
                    totalPages
                }
            },
            message: 'Buyers retrieved successfully'
        });

    } catch (error) {
        console.error('Get buyers error:', error);
        return sendError(res, {
            message: 'Server error during buyers retrieval',
            error
        });
    }
});

// @route   GET /api/admin/buyers/:buyerId
// @desc    Get buyer details by ID
// @access  Private (Admin only)
router.get('/buyers/:buyerId', protect, checkRole('admin'), async (req, res) => {
    try {
        const buyer = await User.findById(req.params.buyerId)
            .select('-password');

        if (!buyer || buyer.role !== 'buyer') {
            return sendError(res, {
                message: 'Buyer not found',
                statusCode: 404
            });
        }

        // Get buyer's orders
        const orders = await Order.find({ user: buyer._id })
            .populate('items.gem', 'name heroImage')
            .sort({ createdAt: -1 })
            .limit(10);

        const buyerData = {
            _id: buyer._id,
            name: buyer.name,
            email: buyer.email,
            phone: buyer.phone,
            addresses: [], // Placeholder - can be added if address model exists
            orders: orders.map(order => ({
                _id: order._id,
                orderNumber: order.orderNumber,
                items: order.items,
                totalAmount: order.totalPrice,
                status: order.status,
                createdAt: order.createdAt
            })),
            isBlocked: buyer.isActive === false,
            status: buyer.isActive !== false ? 'active' : 'blocked',
            createdAt: buyer.createdAt
        };

        return sendSuccess(res, {
            data: { buyer: buyerData },
            message: 'Buyer details retrieved successfully'
        });

    } catch (error) {
        console.error('Get buyer details error:', error);
        return sendError(res, {
            message: 'Server error during buyer details retrieval',
            error
        });
    }
});

// @route   PUT /api/admin/buyers/:buyerId/block
// @desc    Block buyer
// @access  Private (Admin only)
router.put('/buyers/:buyerId/block', protect, checkRole('admin'), async (req, res) => {
    try {
        const buyer = await User.findByIdAndUpdate(
            req.params.buyerId,
            { isActive: false },
            { new: true }
        ).select('-password');

        if (!buyer || buyer.role !== 'buyer') {
            return sendError(res, {
                message: 'Buyer not found',
                statusCode: 404
            });
        }

        return sendSuccess(res, {
            data: { buyer },
            message: 'Buyer blocked successfully'
        });

    } catch (error) {
        console.error('Block buyer error:', error);
        return sendError(res, {
            message: 'Server error during buyer blocking',
            error
        });
    }
});

// @route   PUT /api/admin/buyers/:buyerId/unblock
// @desc    Unblock buyer
// @access  Private (Admin only)
router.put('/buyers/:buyerId/unblock', protect, checkRole('admin'), async (req, res) => {
    try {
        const buyer = await User.findByIdAndUpdate(
            req.params.buyerId,
            { isActive: true },
            { new: true }
        ).select('-password');

        if (!buyer || buyer.role !== 'buyer') {
            return sendError(res, {
                message: 'Buyer not found',
                statusCode: 404
            });
        }

        return sendSuccess(res, {
            data: { buyer },
            message: 'Buyer unblocked successfully'
        });

    } catch (error) {
        console.error('Unblock buyer error:', error);
        return sendError(res, {
            message: 'Server error during buyer unblocking',
            error
        });
    }
});

// @route   GET /api/admin/dashboard/stats
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard/stats', protect, checkRole('admin'), async (req, res) => {
    try {
        // Get all counts
        const [
            totalBuyers,
            totalSellers,
            totalProducts,
            totalOrders,
            blockedBuyers,
            blockedSellers
        ] = await Promise.all([
            User.countDocuments({ role: 'buyer' }),
            Seller.countDocuments(),
            Gem.countDocuments(),
            Order.countDocuments(),
            User.countDocuments({ role: 'buyer', isActive: false }),
            Seller.countDocuments({ isBlocked: true })
        ]);

        // Get order statistics
        const orderStats = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    revenue: { $sum: '$totalPrice' }
                }
            }
        ]);

        // Calculate revenue and order status breakdown
        let totalRevenue = 0;
        const ordersByStatus = {
            pending: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0
        };

        orderStats.forEach(stat => {
            totalRevenue += stat.revenue || 0;
            if (ordersByStatus.hasOwnProperty(stat._id)) {
                ordersByStatus[stat._id] = stat.count;
            }
        });

        // Get recent activity (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [
            recentBuyers,
            recentSellers,
            recentOrders,
            recentRevenue
        ] = await Promise.all([
            User.countDocuments({ 
                role: 'buyer', 
                createdAt: { $gte: thirtyDaysAgo } 
            }),
            Seller.countDocuments({ 
                createdAt: { $gte: thirtyDaysAgo } 
            }),
            Order.countDocuments({ 
                createdAt: { $gte: thirtyDaysAgo } 
            }),
            Order.aggregate([
                { $match: { createdAt: { $gte: thirtyDaysAgo } } },
                { $group: { _id: null, revenue: { $sum: '$totalPrice' } } }
            ])
        ]);

        // Get monthly revenue (last 6 months)
        const monthlyRevenue = [];
        for (let i = 5; i >= 0; i--) {
            const monthStart = new Date();
            monthStart.setMonth(monthStart.getMonth() - i);
            monthStart.setDate(1);
            monthStart.setHours(0, 0, 0, 0);

            const monthEnd = new Date(monthStart);
            monthEnd.setMonth(monthEnd.getMonth() + 1);

            const monthOrders = await Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: monthStart, $lt: monthEnd }
                    }
                },
                {
                    $group: {
                        _id: null,
                        revenue: { $sum: '$totalPrice' },
                        orders: { $sum: 1 }
                    }
                }
            ]);

            monthlyRevenue.push({
                month: monthStart.toLocaleString('default', { month: 'short', year: 'numeric' }),
                revenue: monthOrders[0]?.revenue || 0,
                orders: monthOrders[0]?.orders || 0
            });
        }

        const stats = {
            totalBuyers,
            totalSellers,
            totalProducts,
            totalOrders,
            blockedBuyers,
            blockedSellers,
            pendingOrders: ordersByStatus.pending,
            totalRevenue,
            ordersByStatus,
            recentActivity: {
                buyers: recentBuyers,
                sellers: recentSellers,
                orders: recentOrders,
                revenue: recentRevenue[0]?.revenue || 0
            },
            monthlyRevenue,
            averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
        };

        // Frontend expects stats directly in response (not nested in data)
        return res.json({
            success: true,
            stats
        });

    } catch (error) {
        console.error('Get dashboard stats error:', error);
        return sendError(res, {
            message: 'Server error during dashboard statistics retrieval',
            error
        });
    }
});

module.exports = router;