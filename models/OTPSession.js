const mongoose = require('mongoose');

const otpSessionSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    otp: {
        type: String,
        required: true
    },
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires: 300 // 5 minutes
    },
    attempts: {
        type: Number,
        default: 0,
        max: 3
    },
    verified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Generate session ID before saving
otpSessionSchema.pre('save', function (next) {
    if (!this.sessionId) {
        this.sessionId = 'SESS' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
    next();
});

module.exports = mongoose.model('OTPSession', otpSessionSchema);
