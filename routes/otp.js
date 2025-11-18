const express = require('express');
const { body, validationResult } = require('express-validator');
const OTPSession = require('../models/OTPSession');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/otp/send
// @desc    Send OTP to phone number
// @access  Public
router.post('/send', [
    body('phoneNumber')
        .trim()
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

        const { phoneNumber } = req.body;

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Check if there's an existing session for this phone number
        const existingSession = await OTPSession.findOne({ phoneNumber });

        if (existingSession) {
            // Update existing session
            existingSession.otp = otp;
            existingSession.expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
            existingSession.attempts = 0;
            existingSession.verified = false;
            await existingSession.save();
        } else {
            // Create new session
            const otpSession = new OTPSession({
                phoneNumber,
                otp,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
            });
            await otpSession.save();
        }

        // In a real application, you would send the OTP via SMS service
        // For development, we'll just log it
        console.log(`OTP for ${phoneNumber}: ${otp}`);

        // Find the session to get sessionId
        const session = await OTPSession.findOne({ phoneNumber });

        res.json({
            success: true,
            message: 'OTP sent successfully',
            data: {
                sessionId: session.sessionId,
                expiresAt: session.expiresAt
            }
        });

    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during OTP sending'
        });
    }
});

// @route   POST /api/otp/verify
// @desc    Verify OTP and create temporary session
// @access  Public
router.post('/verify', [
    body('phoneNumber')
        .trim()
        .matches(/^\+?[1-9]\d{1,14}$/)
        .withMessage('Please enter a valid phone number'),
    body('otp')
        .trim()
        .isLength({ min: 6, max: 6 })
        .isNumeric()
        .withMessage('OTP must be 6 digits'),
    body('sessionId')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Session ID is required')
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

        const { phoneNumber, otp, sessionId } = req.body;

        // Find the OTP session
        const otpSession = await OTPSession.findOne({
            phoneNumber,
            sessionId,
            expiresAt: { $gt: new Date() }
        });

        if (!otpSession) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP session'
            });
        }

        // Check if already verified
        if (otpSession.verified) {
            return res.status(400).json({
                success: false,
                message: 'OTP already verified'
            });
        }

        // Check attempts limit
        if (otpSession.attempts >= 3) {
            return res.status(400).json({
                success: false,
                message: 'Maximum verification attempts exceeded'
            });
        }

        // Verify OTP
        if (otpSession.otp !== otp) {
            otpSession.attempts += 1;
            await otpSession.save();

            return res.status(400).json({
                success: false,
                message: 'Invalid OTP',
                attemptsLeft: 3 - otpSession.attempts
            });
        }

        // Mark as verified
        otpSession.verified = true;
        await otpSession.save();

        // Generate temporary token (expires in 30 minutes)
        const tempToken = generateToken({ phoneNumber, temp: true }, '30m');

        res.json({
            success: true,
            message: 'OTP verified successfully',
            data: {
                tempToken,
                expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
            }
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during OTP verification'
        });
    }
});

module.exports = router;
