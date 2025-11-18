const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

const router = express.Router();

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password').lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber || user.phone || '',
                role: user.role,
                address: user.address || {},
                isEmailVerified: user.emailVerified || false,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });

    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during profile retrieval'
        });
    }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const { name, phoneNumber, phone, address } = req.body;

        // Validation
        if (name !== undefined && (!name || name.trim() === '')) {
            return res.status(400).json({
                success: false,
                message: 'Name is required'
            });
        }

        if (name && name.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Name must be at least 2 characters'
            });
        }

        // Validate phone number format if provided
        const phoneValue = phoneNumber || phone;
        if (phoneValue && !/^\d{10}$/.test(phoneValue.replace(/\D/g, ''))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone number format (must be 10 digits)'
            });
        }

        // Validate pincode if provided
        if (address?.pincode && !/^\d{6}$/.test(address.pincode)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid pincode format (must be 6 digits)'
            });
        }

        const updateData = {};
        if (name) updateData.name = name.trim();
        if (phoneValue) {
            updateData.phoneNumber = phoneValue;
            updateData.phone = phoneValue; // Keep both fields in sync
        }
        if (address) updateData.address = address;
        updateData.updatedAt = new Date();

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber || user.phone || '',
                role: user.role,
                address: user.address || {},
                isEmailVerified: user.emailVerified || false,
                updatedAt: user.updatedAt
            }
        });

    } catch (error) {
        console.error('Update user profile error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during profile update'
        });
    }
});

// @route   GET /api/user/addresses
// @desc    Get all addresses for current user
// @access  Private
router.get('/addresses', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('addresses');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            addresses: user.addresses || []
        });

    } catch (error) {
        console.error('Get addresses error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during addresses retrieval'
        });
    }
});

// @route   POST /api/user/addresses
// @desc    Add a new address
// @access  Private
router.post('/addresses', protect, [
    body('label').optional().trim(),
    body('addressLine1').trim().notEmpty().withMessage('Address line 1 is required'),
    body('addressLine2').optional().trim(),
    body('city').trim().notEmpty().withMessage('City is required'),
    body('state').trim().notEmpty().withMessage('State is required'),
    body('pincode').trim().matches(/^\d{6}$/).withMessage('Pincode must be 6 digits'),
    body('country').optional().trim(),
    body('isPrimary').optional().isBoolean()
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

        const { label, addressLine1, addressLine2, city, state, pincode, country, isPrimary } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // If setting as primary, unset other primary addresses
        if (isPrimary) {
            user.addresses.forEach(addr => {
                addr.isPrimary = false;
            });
        }

        const newAddress = {
            label: label || 'Home',
            addressLine1,
            addressLine2: addressLine2 || '',
            city,
            state,
            pincode,
            country: country || 'India',
            isPrimary: isPrimary || false
        };

        // If this is the first address, make it primary
        if (user.addresses.length === 0) {
            newAddress.isPrimary = true;
        }

        user.addresses.push(newAddress);
        await user.save();

        const addedAddress = user.addresses[user.addresses.length - 1];

        res.status(201).json({
            success: true,
            message: 'Address added successfully',
            address: addedAddress
        });

    } catch (error) {
        console.error('Add address error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during address addition'
        });
    }
});

// @route   PUT /api/user/addresses/:addressId
// @desc    Update an existing address
// @access  Private
router.put('/addresses/:addressId', protect, [
    body('label').optional().trim(),
    body('addressLine1').optional().trim(),
    body('addressLine2').optional().trim(),
    body('city').optional().trim(),
    body('state').optional().trim(),
    body('pincode').optional().trim().matches(/^\d{6}$/).withMessage('Pincode must be 6 digits'),
    body('country').optional().trim(),
    body('isPrimary').optional().isBoolean()
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

        const { addressId } = req.params;
        const updates = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const addressIndex = user.addresses.findIndex(
            addr => addr._id.toString() === addressId
        );

        if (addressIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        // If setting as primary, unset other primary addresses
        if (updates.isPrimary === true) {
            user.addresses.forEach(addr => {
                addr.isPrimary = false;
            });
        }

        // Update address fields
        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined) {
                user.addresses[addressIndex][key] = updates[key];
            }
        });

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Address updated successfully',
            address: user.addresses[addressIndex]
        });

    } catch (error) {
        console.error('Update address error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during address update'
        });
    }
});

// @route   DELETE /api/user/addresses/:addressId
// @desc    Delete an address
// @access  Private
router.delete('/addresses/:addressId', protect, async (req, res) => {
    try {
        const { addressId } = req.params;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const addressIndex = user.addresses.findIndex(
            addr => addr._id.toString() === addressId
        );

        if (addressIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        user.addresses.splice(addressIndex, 1);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Address deleted successfully'
        });

    } catch (error) {
        console.error('Delete address error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during address deletion'
        });
    }
});

// @route   PUT /api/user/addresses/:addressId/primary
// @desc    Set an address as primary
// @access  Private
router.put('/addresses/:addressId/primary', protect, async (req, res) => {
    try {
        const { addressId } = req.params;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const addressIndex = user.addresses.findIndex(
            addr => addr._id.toString() === addressId
        );

        if (addressIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        // Unset all primary addresses
        user.addresses.forEach(addr => {
            addr.isPrimary = false;
        });

        // Set selected address as primary
        user.addresses[addressIndex].isPrimary = true;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Primary address updated successfully'
        });

    } catch (error) {
        console.error('Set primary address error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during primary address update'
        });
    }
});

module.exports = router;

