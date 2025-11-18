const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: [true, 'Phone is required'],
        trim: true
    },
    alternatePhone: {
        type: String,
        trim: true
    },
    shopName: {
        type: String,
        required: [true, 'Shop name is required'],
        trim: true
    },
    shopType: {
        type: String,
        required: [true, 'Shop type is required'],
        trim: true
    },
    businessType: {
        type: String,
        required: [true, 'Business type is required'],
        trim: true
    },
    yearEstablished: {
        type: String,
        required: [true, 'Year established is required'],
        trim: true
    },
    address: {
        street: {
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
            default: 'India',
            trim: true
        }
    },
    gstNumber: {
        type: String,
        required: [true, 'GST number is required'],
        trim: true,
        uppercase: true
    },
    panNumber: {
        type: String,
        required: [true, 'PAN number is required'],
        trim: true,
        uppercase: true
    },
    aadharNumber: {
        type: String,
        trim: true
    },
    bankName: {
        type: String,
        required: [true, 'Bank name is required'],
        trim: true
    },
    accountNumber: {
        type: String,
        required: [true, 'Account number is required'],
        trim: true
    },
    ifscCode: {
        type: String,
        required: [true, 'IFSC code is required'],
        trim: true,
        uppercase: true
    },
    accountHolderName: {
        type: String,
        required: [true, 'Account holder name is required'],
        trim: true
    },
    businessDescription: {
        type: String,
        trim: true
    },
    specialization: {
        type: [String],
        default: []
    },
    gemTypes: {
        type: [String],
        default: []
    },
    website: {
        type: String,
        trim: true
    },
    instagram: {
        type: String,
        trim: true
    },
    facebook: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'suspended', 'active'],
        default: 'pending'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    documentsUploaded: {
        type: Boolean,
        default: false
    },
    suspensionReason: {
        type: String,
        trim: true
    },
    suspendedAt: {
        type: Date
    },
    suspendedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    totalSales: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Seller', sellerSchema);
