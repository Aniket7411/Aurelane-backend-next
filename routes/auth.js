const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken, protect } = require('../middleware/auth');
const nodemailer = require('nodemailer');

const router = express.Router();

// Email configuration debug (commented out for security)
// console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
// console.log('EMAIL_USER:', process.env.EMAIL_USER);

// Create nodemailer transporter
const createTransporter = () => {
    const config = {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false // Allow self-signed certificates
        }
    };

    console.log('📧 Email Configuration:');
    console.log('  Host:', config.host);
    console.log('  Port:', config.port);
    console.log('  User:', config.auth.user);
    console.log('  Has Password:', !!config.auth.pass);
    console.log('  Environment:', process.env.NODE_ENV);

    return nodemailer.createTransport(config);
};

// @route   POST /api/auth/signup
// @desc    Signup/Register new user
// @access  Public
router.post('/signup', [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('phoneNumber')
        .optional()
        .trim()
        .matches(/^\d{10}$/)
        .withMessage('Phone number must be 10 digits'),
    body('role')
        .optional()
        .isIn(['buyer', 'seller'])
        .withMessage('Role must be either buyer or seller')
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

        const { name, email, password, phoneNumber, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        // Create user
        const user = new User({
            name,
            email,
            password,
            phoneNumber: phoneNumber || '',
            phone: phoneNumber || '',
            role: role || 'buyer'
        });

        await user.save();

        // Generate JWT token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber || '',
                role: user.role
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during signup'
        });
    }
});

// @route   POST /api/auth/register
// @desc    Register user (alternative endpoint)
// @access  Public
router.post('/register', [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email'),
    body('phone')
        .optional()
        .matches(/^\+?[1-9]\d{1,14}$/)
        .withMessage('Please enter a valid phone number'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, email, phone, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { phone }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email or phone number'
            });
        }

        // Create user
        const user = new User({
            name,
            email,
            phone,
            password
        });

        await user.save();

        // Generate JWT token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});

// @route   POST /api/auth/admin/login
// @desc    Admin login
// @access  Public
router.post('/admin/login', [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
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

        const { email, password } = req.body;

        // Check if user exists and is admin
        const user = await User.findOne({ email, role: 'admin' }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials or not an admin'
            });
        }

        // Check password
        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Admin login successful',
            token,
            admin: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during admin login'
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Check if user exists and include password for comparison
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// @route   POST /api/auth/forgot-password
// @desc    Forgot password
// @access  Public
router.post('/forgot-password', [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email')
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

        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found with this email'
            });
        }

        // Generate reset token
        const resetToken = user.getResetPasswordToken();
        await user.save();

        // Send reset email
        try {
            // Check if email is configured
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                console.log('❌Email not configured. Environment variables missing:');
                console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Missing');
                console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Missing');
                console.log('NODE_ENV:', process.env.NODE_ENV);

                // In production, don't return the token for security
                if (process.env.NODE_ENV === 'production') {
                    return res.json({
                        success: true,
                        message: 'Password reset email sent successfully! Check your inbox.'
                    });
                } else {
                    return res.json({
                        success: true,
                        message: 'Password reset token generated (email not configured)',
                        resetToken: resetToken // For development only
                    });
                }
            }

            console.log('📧 Attempting to send email...');
            const transporter = createTransporter();
            const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

            console.log('🔗 Reset URL:', resetUrl);

            // Verify transporter connection
            console.log('🔍 Verifying email connection...');
            await transporter.verify();
            console.log('✅ Email connection verified successfully!');

            const mailOptions = {
                from: `"Aurelane Gems" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: '🔐 Password Reset - Aurelane Gems',
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="margin: 0; font-size: 28px;">💎 Aurelane Gems</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">Password Reset Request</p>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                        <h2 style="color: #333; margin-top: 0;">Hello!</h2>
                        <p style="color: #666; line-height: 1.6;">You requested a password reset for your Aurelane Gems account. Click the button below to reset your password:</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px;">Reset My Password</a>
                        </div>
                        
                        <p style="color: #666; font-size: 14px; margin: 20px 0;">Or copy and paste this link in your browser:</p>
                        <p style="background: #e9ecef; padding: 10px; border-radius: 5px; word-break: break-all; font-family: monospace; font-size: 12px; color: #495057;">${resetUrl}</p>
                        
                        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p style="margin: 0; color: #856404; font-size: 14px;"><strong>⏰ Important:</strong> This link will expire in 10 minutes for security reasons.</p>
                        </div>
                        
                        <p style="color: #666; font-size: 14px; margin: 20px 0 0 0;">If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
                        
                        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
                        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">© 2025 Aurelane Gems. All rights reserved.</p>
                    </div>
                </div>
                `
            };

            console.log('📤 Sending email to:', email);
            const info = await transporter.sendMail(mailOptions);
            console.log('✅ Email sent successfully! Message ID:', info.messageId);

            res.json({
                success: true,
                message: 'Password reset email sent successfully! Check your inbox.'
            });
        } catch (emailError) {
            console.error('❌ Email sending failed:', emailError);

            // Reset the token fields if email fails
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();

            // In development, still return success with token
            if (process.env.NODE_ENV === 'development') {
                console.log('🔧 Development mode: Returning token despite email failure');
                return res.json({
                    success: true,
                    message: 'Password reset token generated (email failed - check console for details)',
                    resetToken: resetToken, // For development only
                    error: emailError.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to send reset email. Please try again later.'
            });
        }

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during forgot password'
        });
    }
});

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password (POST method)
// @access  Public
router.post('/reset-password/:token', [
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
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

        const { password } = req.body;
        const resetToken = req.params.token;

        // Hash the token to compare with stored hash
        const hashedToken = require('crypto')
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Set new password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successful'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during password reset'
        });
    }
});

// @route   GET /api/auth/reset-password/:token
// @desc    Verify reset token and redirect to frontend
// @access  Public
router.get('/reset-password/:token', async (req, res) => {
    try {
        const resetToken = req.params.token;
        console.log('🔍 Verifying reset token:', resetToken);

        // Hash the token to compare with stored hash
        const hashedToken = require('crypto')
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            console.log('❌ Invalid or expired token');
            // Redirect to frontend with error
            return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?error=invalid_token`);
        }

        console.log('✅ Valid token for user:', user.email);
        // Redirect to frontend reset password page with token
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`);

    } catch (error) {
        console.error('❌ Token verification error:', error);
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?error=server_error`);
    }
});

// @route   PUT /api/auth/reset-password/:token
// @desc    Reset password (PUT method - for frontend compatibility)
// @access  Public
router.put('/reset-password/:token', [
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
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

        const { password } = req.body;
        const resetToken = req.params.token;

        console.log('🔄 Processing password reset for token:', resetToken);

        // Hash the token to compare with stored hash
        const hashedToken = require('crypto')
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        console.log('🔍 Looking for user with hashed token:', hashedToken);

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            console.log('❌ No user found with valid token');
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        console.log('✅ User found:', user.email);

        // Set new password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        console.log('✅ Password reset successful for:', user.email);

        res.json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (error) {
        console.error('❌ Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during password reset'
        });
    }
});

// @route   GET /api/auth/verify-email/:token
// @desc    Verify email
// @access  Public
router.get('/verify-email/:token', async (req, res) => {
    try {
        const verificationToken = req.params.token;

        // Hash the token to compare with stored hash
        const hashedToken = require('crypto')
            .createHash('sha256')
            .update(verificationToken)
            .digest('hex');

        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token'
            });
        }

        // Verify email
        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpire = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Email verified successfully'
        });

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during email verification'
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        res.json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during user retrieval'
        });
    }
});

// @route   GET /api/auth/profile
// @desc    Get user profile (works for all roles)
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        // If seller, get seller profile too
        if (user.role === 'seller') {
            const Seller = require('../models/Seller');
            const sellerProfile = await Seller.findOne({ user: user._id });

            if (sellerProfile) {
                return res.json({
                    success: true,
                    data: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        role: user.role,
                        emailVerified: user.emailVerified,
                        createdAt: user.createdAt,
                        sellerProfile
                    }
                });
            }
        }

        res.json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                address: user.address,
                emailVerified: user.emailVerified,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during profile retrieval'
        });
    }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('phone')
        .optional()
        .matches(/^\+?[1-9]\d{1,14}$/)
        .withMessage('Please enter a valid phone number')
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

        const { name, phone } = req.body;
        const updateData = {};

        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                updatedAt: user.updatedAt
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during profile update'
        });
    }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', protect, [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long')
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

        const { currentPassword, newPassword } = req.body;

        // Get user with password
        const user = await User.findById(req.user._id).select('+password');

        // Check current password
        const isPasswordMatch = await user.comparePassword(currentPassword);

        if (!isPasswordMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during password change'
        });
    }
});

module.exports = router;