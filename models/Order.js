const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: false, // Will be auto-generated in pre-save hook
        unique: true,
        sparse: true // Allow multiple null values (before order number is generated)
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            gem: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Gem',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: [1, 'Quantity must be at least 1']
            },
            price: {
                type: Number,
                required: true,
                min: [0, 'Price cannot be negative']
            },
            seller: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            gstCategory: {
                type: String,
                enum: ['rough_unworked', 'cut_polished', 'rough_diamonds', 'cut_diamonds'],
                trim: true
            },
            gstRate: {
                type: Number,
                min: [0, 'GST rate cannot be negative']
            },
            gstAmount: {
                type: Number,
                min: [0, 'GST amount cannot be negative'],
                default: 0
            },
            priceBeforeGST: {
                type: Number,
                min: [0, 'Price before GST cannot be negative']
            }
        }
    ],
    shippingAddress: {
        name: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
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
            trim: true
        },
        country: {
            type: String,
            required: true,
            trim: true
        }
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['COD', 'Online'],
        default: 'COD'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    razorpayOrderId: {
        type: String,
        trim: true
    },
    razorpayPaymentId: {
        type: String,
        trim: true
    },
    razorpaySignature: {
        type: String,
        trim: true
    },
    totalPrice: {
        type: Number,
        required: true,
        min: [0, 'Total price cannot be negative']
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    trackingNumber: {
        type: String,
        trim: true
    },
    cancelReason: {
        type: String,
        trim: true
    },
    cancelledAt: {
        type: Date
    },
    gstSummary: {
        totalGST: {
            type: Number,
            default: 0,
            min: [0, 'Total GST cannot be negative']
        },
        gstBreakdown: [{
            rate: {
                type: Number,
                required: true,
                min: [0, 'GST rate cannot be negative']
            },
            amount: {
                type: Number,
                required: true,
                min: [0, 'GST amount cannot be negative']
            }
        }]
    }
}, {
    timestamps: true
});

// Generate order number and reduce stock before saving
orderSchema.pre('save', async function (next) {
    try {
        // Generate order number if not already set
        if (!this.orderNumber) {
            const count = await mongoose.model('Order').countDocuments();
            this.orderNumber = `ORD-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;
        }

        // Note: Stock reduction is handled in payment verification, not here
        // This prevents stock reduction for pending payments
        
        next();
    } catch (error) {
        next(error);
    }
});

// Method to restore stock on cancellation
orderSchema.methods.restoreStock = async function () {
    const Gem = mongoose.model('Gem');
    for (const item of this.items) {
        await Gem.findByIdAndUpdate(item.gem, {
            $inc: {
                stock: item.quantity,
                sales: -item.quantity
            }
        });
    }
};

module.exports = mongoose.model('Order', orderSchema);