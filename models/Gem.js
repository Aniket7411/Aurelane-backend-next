const mongoose = require('mongoose');
const { GEM_CATEGORIES, VALID_BIRTH_MONTHS } = require('../constants/gemFilters');

const gemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Gem name is required'],
        trim: true,
        maxlength: [255, 'Name cannot be more than 255 characters']
    },
    hindiName: {
        type: String,
        required: [true, 'Hindi name is required'],
        trim: true,
        maxlength: [255, 'Hindi name cannot be more than 255 characters']
    },
    alternateNames: {
        type: [String],
        default: []
    },
    planet: {
        type: String,
        required: false,
        trim: true,
        maxlength: [100, 'Planet name cannot be more than 100 characters']
    },
    planetHindi: {
        type: String,
        required: false,
        trim: true,
        maxlength: [100, 'Planet Hindi name cannot be more than 100 characters']
    },
    color: {
        type: String,
        required: false,
        trim: true,
        maxlength: [100, 'Color cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    benefits: {
        type: [String],
        required: [true, 'Benefits are required'],
        default: []
    },
    suitableFor: {
        type: [String],
        required: [true, 'Suitable for information is required'],
        default: []
    },
    birthMonth: {
        type: String,
        default: null,
        required: false,
        validate: {
            validator: function(value) {
                // Allow null or undefined
                if (value === null || value === undefined || value === '') {
                    return true;
                }
                // Validate against valid months
                return VALID_BIRTH_MONTHS.includes(value);
            },
            message: 'Invalid birth month. Must be one of: January, February, March, April, May, June, July, August, September, October, November, December, or null'
        }
    },
    isCustomStone: {
        type: Boolean,
        default: false
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
        enum: GEM_CATEGORIES
    },
    subcategory: {
        type: String,
        required: [true, 'Subcategory is required'],
        trim: true,
        maxlength: [255, 'Subcategory cannot be more than 255 characters']
    },
    whomToUse: {
        type: [String],
        default: []
    },
    price: {
        type: Number,
        // Do not use Mongoose 'required' for updates; enforce via hooks instead
        required: false,
        min: [0, 'Price cannot be negative'],
        default: null
    },
    contactForPrice: {
        type: Boolean,
        default: false
    },
    discount: {
        type: Number,
        default: 0,
        min: [0, 'Discount cannot be negative']
    },
    discountType: {
        type: String,
        enum: ['percentage', 'flat'],
        default: 'percentage'
    },
    gstCategory: {
        type: String,
        required: false, // Made optional for backward compatibility with existing gems
        enum: ['rough_unworked', 'cut_polished', 'rough_diamonds', 'cut_diamonds'],
        trim: true,
        default: null
    },
    sizeWeight: {
        type: Number,
        required: [true, 'Size/Weight is required'],
        min: [0, 'Size/Weight cannot be negative']
    },
    sizeUnit: {
        type: String,
        required: [true, 'Size unit is required'],
        enum: ['carat', 'gram', 'ratti'],
        default: 'carat'
    },
    stock: {
        type: Number,
        default: 0,
        min: [0, 'Stock cannot be negative']
    },
    images: {
        type: [String],
        default: []
    },
    allImages: {
        type: [String],
        default: []
    },
    availability: {
        type: Boolean,
        default: true
    },
    certification: {
        type: String,
        required: [true, 'Certification is required'],
        trim: true,
        maxlength: [255, 'Certification cannot be more than 255 characters']
    },
    origin: {
        type: String,
        required: [true, 'Origin is required'],
        trim: true,
        maxlength: [255, 'Origin cannot be more than 255 characters']
    },
    deliveryDays: {
        type: Number,
        required: [true, 'Delivery days is required'],
        min: [1, 'Delivery days must be at least 1']
    },
    heroImage: {
        type: String,
        required: [true, 'Hero image is required'],
        trim: true
    },
    additionalImages: {
        type: [String],
        default: []
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Seller is required']
    },
    lowStockThreshold: {
        type: Number,
        default: 5
    },
    views: {
        type: Number,
        default: 0
    },
    sales: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0
    },
    reviews: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Validation rules for contactForPrice/price coordination
gemSchema.pre('validate', function (next) {
    if (this.contactForPrice && this.price !== null && this.price !== undefined) {
        // If contactForPrice is true, set price to null
        this.price = null;
    }
    if (!this.contactForPrice && (!this.price || this.price <= 0)) {
        // If contactForPrice is false, price is required
        return next(new Error('Price is required when contactForPrice is false'));
    }
    next();
});

// Validation rules for custom stones vs regular gems
gemSchema.pre('validate', function (next) {
    const isCustom = this.isCustomStone === true;
    
    if (isCustom) {
        // Custom stone validation
        // Planet and planetHindi must be null or empty
        if (this.planet && this.planet.trim() !== '') {
            return next(new Error('planet must be null or empty for custom stones'));
        }
        if (this.planetHindi && this.planetHindi.trim() !== '') {
            return next(new Error('planetHindi must be null or empty for custom stones'));
        }
        // BirthMonth is required for custom stones
        if (!this.birthMonth || this.birthMonth.trim() === '') {
            return next(new Error('birthMonth is required for custom stones'));
        }
        // Ensure planet and planetHindi are set to null
        this.planet = null;
        this.planetHindi = null;
    } else {
        // Regular gem validation
        // Planet is required for regular gems
        if (!this.planet || this.planet.trim() === '') {
            return next(new Error('planet is required for regular gems'));
        }
        // PlanetHindi is required for regular gems
        if (!this.planetHindi || this.planetHindi.trim() === '') {
            return next(new Error('planetHindi is required for regular gems'));
        }
    }
    
    next();
});

// Automatic availability update based on stock
gemSchema.pre('save', function (next) {
    if (this.stock === 0) {
        this.availability = false;
    } else if (this.stock > 0 && !this.availability) {
        this.availability = true;
    }
    next();
});

// Ensure updates respect contactForPrice/price rules
gemSchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate() || {};
    const setObject = update.$set || update;
    const unsetObject = update.$unset || {};

    const contactForPriceIncoming = setObject.contactForPrice;
    const isContactForPriceTrue = contactForPriceIncoming === true || contactForPriceIncoming === 'true';
    const isContactForPriceFalse = contactForPriceIncoming === false || contactForPriceIncoming === 'false';

    if (isContactForPriceTrue) {
        // Force price to null if contactForPrice is true
        if (update.$set) {
            update.$set.price = null;
        } else {
            setObject.price = null;
        }
    } else if (isContactForPriceFalse) {
        // If explicitly turning off contactForPrice ensure price is provided and > 0 (unless explicitly unset which is invalid)
        const priceProvided = Object.prototype.hasOwnProperty.call(setObject, 'price');
        const priceUnset = Object.prototype.hasOwnProperty.call(unsetObject, 'price');
        if (!priceProvided && !priceUnset) {
            return next(new Error('Price is required and must be > 0 when contactForPrice is false'));
        }
        if (priceProvided) {
            const num = Number(setObject.price);
            if (Number.isNaN(num) || num <= 0) {
                return next(new Error('Price is required and must be > 0 when contactForPrice is false'));
            }
        }
        if (priceUnset) {
            return next(new Error('Price cannot be unset when contactForPrice is false'));
        }
    }

    next();
});

// Indexes for better search performance
// Text search index (for full-text search) - includes birthMonth for custom stones
gemSchema.index({ name: 'text', description: 'text', hindiName: 'text', planet: 'text', planetHindi: 'text', color: 'text', origin: 'text', birthMonth: 'text' });

// Single field indexes for filtering and sorting
gemSchema.index({ name: 1 }); // Case-insensitive search
gemSchema.index({ hindiName: 1 }); // Hindi name search
gemSchema.index({ planet: 1 }); // Planet filter
gemSchema.index({ color: 1 }); // Color filter
gemSchema.index({ price: 1 }); // Price sorting
gemSchema.index({ availability: 1 }); // Availability filter
gemSchema.index({ contactForPrice: 1 }); // Contact-for-price filter
gemSchema.index({ seller: 1 }); // Seller filter
gemSchema.index({ createdAt: -1 }); // Newest first sorting
gemSchema.index({ stock: 1 }); // Stock filter
gemSchema.index({ subcategory: 1 }); // Subcategory filter
gemSchema.index({ category: 1 }); // Category filter
gemSchema.index({ birthMonth: 1 }); // Birth month filter
gemSchema.index({ isCustomStone: 1 }); // Custom stone filter

// Compound indexes for common query patterns
gemSchema.index({ availability: 1, name: 1 }); // Available gems by name
gemSchema.index({ availability: 1, price: 1 }); // Available gems by price
gemSchema.index({ availability: 1, planet: 1 }); // Available gems by planet
gemSchema.index({ category: 1, subcategory: 1 }); // Category/subcategory lookup
gemSchema.index({ category: 1, availability: 1, price: 1 }); // Category filtering with price sort
gemSchema.index({ category: 1, availability: 1, createdAt: -1 }); // Category filtering with newest sort
gemSchema.index({ category: 1, availability: 1 }); // Category + availability filter
gemSchema.index({ birthMonth: 1, availability: 1 }); // Birth month filtering
gemSchema.index({ isCustomStone: 1, birthMonth: 1 }); // Custom stone by birth month
gemSchema.index({ suitableFor: 1, availability: 1 }); // Zodiac/suitableFor filtering
gemSchema.index({ contactForPrice: 1, price: 1 }); // Price sorting with contactForPrice
gemSchema.index({ seller: 1, availability: 1, createdAt: -1 }); // Seller's gems

module.exports = mongoose.model('Gem', gemSchema);