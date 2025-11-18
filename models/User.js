const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please enter a valid email'
        ]
    },
    phone: {
        type: String,
        required: false,
        match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    address: {
        street: {
            type: String,
            trim: true
        },
        addressLine1: {
            type: String,
            trim: true
        },
        addressLine2: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            trim: true
        },
        state: {
            type: String,
            trim: true
        },
        pincode: {
            type: String,
            trim: true
        },
        country: {
            type: String,
            trim: true,
            default: 'India'
        }
    },
    // Multiple addresses support
    addresses: [{
        label: {
            type: String,
            trim: true,
            default: 'Home'
        },
        addressLine1: {
            type: String,
            required: true,
            trim: true
        },
        addressLine2: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        state: {
            type: String,
            required: true,
            trim: true
        },
        pincode: {
            type: String,
            required: true,
            trim: true,
            match: [/^\d{6}$/, 'Pincode must be 6 digits']
        },
        country: {
            type: String,
            trim: true,
            default: 'India'
        },
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't include password in queries by default
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    role: {
        type: String,
        enum: ['buyer', 'seller', 'admin'],
        default: 'buyer'
    },
    lastLogin: {
        type: Date
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    emailVerificationToken: String,
    emailVerificationExpire: Date
}, {
    timestamps: true
});

// Encrypt password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
    const resetToken = require('crypto').randomBytes(20).toString('hex');

    this.resetPasswordToken = require('crypto')
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

// Generate email verification token
userSchema.methods.getEmailVerificationToken = function () {
    const verificationToken = require('crypto').randomBytes(20).toString('hex');

    this.emailVerificationToken = require('crypto')
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

    this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    return verificationToken;
};

module.exports = mongoose.model('User', userSchema);