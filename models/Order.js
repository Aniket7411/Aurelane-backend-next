const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true
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
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
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
    }
}, {
    timestamps: true
});

// Generate order number and reduce stock before saving
orderSchema.pre('save', async function (next) {
    // Generate order number
    if (!this.orderNumber) {
        const count = await mongoose.model('Order').countDocuments();
        this.orderNumber = `ORD-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
    }

    // Reduce stock when order is created
    if (this.isNew) {
        const Gem = mongoose.model('Gem');
        for (const item of this.items) {
            await Gem.findByIdAndUpdate(item.gem, {
                $inc: {
                    stock: -item.quantity,
                    sales: item.quantity
                }
            });
        }
    }

    next();
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