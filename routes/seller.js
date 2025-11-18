const express = require('express');
const { body, validationResult } = require('express-validator');
const Seller = require('../models/Seller');
const User = require('../models/User');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

const router = express.Router();

// @route   GET /api/seller/profile
// @desc    Get seller profile
// @access  Private (Seller only)
router.get('/profile', protect, checkRole('seller'), async (req, res) => {
  try {
    let seller = await Seller.findOne({ user: req.user._id });

    if (!seller) {
      // Return empty profile structure if not found
      return res.json({
        success: true,
        seller: {
          user: req.user._id,
          fullName: req.user.name || '',
          email: req.user.email,
          phone: '',
          alternatePhone: '',
          shopName: '',
          shopType: '',
          businessType: '',
          yearEstablished: '',
          address: {
            street: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India'
          },
          gstNumber: '',
          panNumber: '',
          aadharNumber: '',
          bankName: '',
          accountNumber: '',
          ifscCode: '',
          accountHolderName: '',
          businessDescription: '',
          specialization: [],
          gemTypes: [],
          website: '',
          instagram: '',
          facebook: '',
          isVerified: false,
          documentsUploaded: false
        }
      });
    }

    res.json({
      success: true,
      seller
    });

  } catch (error) {
    console.error('Get seller profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile retrieval'
    });
  }
});

// @route   PUT /api/seller/profile
// @desc    Create or Update seller profile
// @access  Private (Seller only)
router.put('/profile', protect, checkRole('seller'), async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      alternatePhone,
      shopName,
      shopType,
      businessType,
      yearEstablished,
      address,
      gstNumber,
      panNumber,
      aadharNumber,
      bankName,
      accountNumber,
      ifscCode,
      accountHolderName,
      businessDescription,
      specialization,
      gemTypes,
      website,
      instagram,
      facebook,
      documentsUploaded,
      isVerified
    } = req.body;

    // Find existing seller profile
    let seller = await Seller.findOne({ user: req.user._id });

    if (!seller) {
      // Create new seller profile
      seller = new Seller({
        user: req.user._id,
        fullName: fullName || req.user.name,
        email: email || req.user.email,
        phone,
        alternatePhone,
        shopName,
        shopType,
        businessType,
        yearEstablished,
        address,
        gstNumber,
        panNumber,
        aadharNumber,
        bankName,
        accountNumber,
        ifscCode,
        accountHolderName,
        businessDescription,
        specialization,
        gemTypes,
        website,
        instagram,
        facebook,
        documentsUploaded: documentsUploaded || false,
        isVerified: isVerified || false
      });

      await seller.save();

      return res.json({
        success: true,
        message: 'Seller profile created successfully',
        seller
      });
    }

    // Update existing seller profile
    const updateData = {
      fullName,
      email,
      phone,
      alternatePhone,
      shopName,
      shopType,
      businessType,
      yearEstablished,
      address,
      gstNumber,
      panNumber,
      aadharNumber,
      bankName,
      accountNumber,
      ifscCode,
      accountHolderName,
      businessDescription,
      specialization,
      gemTypes,
      website,
      instagram,
      facebook,
      documentsUploaded
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const updatedSeller = await Seller.findByIdAndUpdate(
      seller._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Seller profile updated successfully',
      seller: updatedSeller
    });

  } catch (error) {
    console.error('Update seller profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during profile update'
    });
    }
});

// @route   GET /api/seller/orders
// @desc    Get seller's orders with pagination and filtering
// @access  Private (Seller only)
router.get('/orders', protect, checkRole('seller'), async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        
        // Build filter for seller's orders
        const filter = { 'items.seller': req.user._id };
        if (status) {
            filter.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get orders with pagination
        const orders = await Order.find(filter)
            .populate('user', 'name email phone')
            .populate('items.gem', 'name hindiName heroImage sizeWeight sizeUnit price')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalOrders = await Order.countDocuments(filter);
        const totalPages = Math.ceil(totalOrders / parseInt(limit));

        // Format orders with buyer information
        const formattedOrders = orders.map(order => {
            // Filter items to only show seller's items
            const sellerItems = order.items.filter(item => 
                item.seller.toString() === req.user._id.toString()
            );

            // Calculate subtotal for seller's items
            const subtotal = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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
                subtotal,
                totalPrice: order.totalPrice,
                status: order.status,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                shippingAddress: order.shippingAddress,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt
            };
        });

        res.json({
            success: true,
            count: formattedOrders.length,
            totalOrders,
            currentPage: parseInt(page),
            totalPages,
            orders: formattedOrders
        });

    } catch (error) {
        console.error('Get seller orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during orders retrieval',
            error: error.message
        });
    }
});

// @route   GET /api/seller/orders/stats
// @desc    Get seller's order statistics
// @access  Private (Seller only)
router.get('/orders/stats', protect, checkRole('seller'), async (req, res) => {
    try {
        const sellerId = req.user._id;

        // Get all orders for this seller
        const allOrders = await Order.find({ 'items.seller': sellerId });

        // Calculate statistics
        const stats = {
            totalOrders: allOrders.length,
            totalRevenue: 0,
            ordersByStatus: {
                pending: 0,
                processing: 0,
                shipped: 0,
                delivered: 0,
                cancelled: 0
            },
            revenueByStatus: {
                pending: 0,
                processing: 0,
                shipped: 0,
                delivered: 0,
                cancelled: 0
            },
            recentOrders: 0, // Orders in last 30 days
            recentRevenue: 0
        };

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        allOrders.forEach(order => {
            // Filter items to only seller's items
            const sellerItems = order.items.filter(item => 
                item.seller.toString() === sellerId.toString()
            );

            // Calculate subtotal for seller's items
            const orderSubtotal = sellerItems.reduce((sum, item) => 
                sum + (item.price * item.quantity), 0
            );

            // Update stats
            stats.totalRevenue += orderSubtotal;
            stats.ordersByStatus[order.status] = (stats.ordersByStatus[order.status] || 0) + 1;
            stats.revenueByStatus[order.status] = (stats.revenueByStatus[order.status] || 0) + orderSubtotal;

            // Recent orders (last 30 days)
            if (new Date(order.createdAt) >= thirtyDaysAgo) {
                stats.recentOrders += 1;
                stats.recentRevenue += orderSubtotal;
            }
        });

        // Get monthly revenue (last 6 months)
        const monthlyRevenue = [];
        for (let i = 5; i >= 0; i--) {
            const monthStart = new Date();
            monthStart.setMonth(monthStart.getMonth() - i);
            monthStart.setDate(1);
            monthStart.setHours(0, 0, 0, 0);

            const monthEnd = new Date(monthStart);
            monthEnd.setMonth(monthEnd.getMonth() + 1);

            const monthOrders = allOrders.filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate >= monthStart && orderDate < monthEnd;
            });

            const monthRevenueValue = monthOrders.reduce((sum, order) => {
                const sellerItems = order.items.filter(item => 
                    item.seller.toString() === sellerId.toString()
                );
                return sum + sellerItems.reduce((itemSum, item) => 
                    itemSum + (item.price * item.quantity), 0
                );
            }, 0);

            monthlyRevenue.push({
                month: monthStart.toLocaleString('default', { month: 'short', year: 'numeric' }),
                revenue: monthRevenueValue,
                orders: monthOrders.length
            });
        }

        res.json({
            success: true,
            stats: {
                ...stats,
                monthlyRevenue,
                averageOrderValue: stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0
            }
        });

    } catch (error) {
        console.error('Get seller order stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during stats retrieval',
            error: error.message
        });
    }
});

module.exports = router;