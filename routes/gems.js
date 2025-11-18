const express = require('express');
const { body, validationResult } = require('express-validator');
const Gem = require('../models/Gem');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

const router = express.Router();

// @route   POST /api/gems
// @desc    Add a new gem (SELLER ONLY)
// @access  Private (Seller)
router.post('/', protect, checkRole('seller'), [
    body('name').trim().notEmpty().withMessage('Gem name is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('hindiName').trim().notEmpty().withMessage('Hindi name is required'),
    body('planet').trim().notEmpty().withMessage('Planet is required'),
    body('planetHindi').trim().notEmpty().withMessage('Planet Hindi is required'),
    body('color').trim().notEmpty().withMessage('Color is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('benefits').isArray({ min: 1 }).withMessage('At least one benefit is required'),
    body('suitableFor').isArray({ min: 1 }).withMessage('Suitable for information is required'),
    body('contactForPrice').optional().isBoolean().withMessage('contactForPrice must be a boolean'),
    body('price')
        .custom((value, { req }) => {
            const contactForPrice = req.body.contactForPrice === true || req.body.contactForPrice === 'true';
            if (contactForPrice) {
                // price can be null/undefined when contactForPrice is true
                return true;
            }
            if (value === undefined || value === null) {
                throw new Error('Valid price is required when \'Contact for Price\' is not enabled');
            }
            const num = Number(value);
            if (Number.isNaN(num) || num < 0) {
                throw new Error('Price must be a positive number');
            }
            return true;
        }),
    body('sizeWeight').isNumeric().isFloat({ min: 0 }).withMessage('Valid size/weight is required'),
    body('sizeUnit').isIn(['carat', 'gram', 'ounce', 'ratti']).withMessage('Valid size unit is required'),
    body('birthMonth')
        .optional({ nullable: true, checkFalsy: true })
        .isIn(['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'])
        .withMessage('Invalid birth month'),
    body('certification').trim().notEmpty().withMessage('Certification is required'),
    body('origin').trim().notEmpty().withMessage('Origin is required'),
    body('deliveryDays').isInt({ min: 1 }).withMessage('Valid delivery days required'),
    body('heroImage').trim().notEmpty().withMessage('Hero image is required')
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

        // Normalize booleans
        if (typeof req.body.contactForPrice === 'string') {
            req.body.contactForPrice = req.body.contactForPrice === 'true';
        }
        // If contactForPrice is true, ensure price is null
        if (req.body.contactForPrice === true) {
            req.body.price = null;
        }

        // Normalize birthMonth: empty string or undefined becomes null
        if (req.body.birthMonth === '' || req.body.birthMonth === undefined) {
            req.body.birthMonth = null;
        }

        const gemData = { ...req.body, seller: req.user._id };
        const gem = new Gem(gemData);
        await gem.save();

        res.status(201).json({
            success: true,
            message: 'Gem added successfully',
            gem: {
                _id: gem._id,
                name: gem.name,
                hindiName: gem.hindiName,
                category: gem.category,
                contactForPrice: gem.contactForPrice,
                price: gem.price,
                heroImage: gem.heroImage,
                seller: gem.seller,
                createdAt: gem.createdAt
            }
        });

    } catch (error) {
        console.error('Add gem error:', error);
        
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.keys(error.errors).map(key => ({
                type: 'field',
                value: error.errors[key].value,
                msg: error.errors[key].message,
                path: key,
                location: 'body'
            }));
            
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }
        
        // Handle other errors
        res.status(500).json({
            success: false,
            message: 'Server error during gem creation'
        });
    }
});

// @route   GET /api/gems
// @desc    Get all gems with filters, search, sort, and pagination (PUBLIC)
// @access  Public
router.get('/', async (req, res) => {
    try {
        // Extract query parameters
        const {
            page = 1,
            limit = 12,
            search = '',
            category = '',
            zodiac = '',
            planet = '',
            seller = '',
            minPrice = '',
            maxPrice = '',
            sort = 'newest',
            availability,
            inStock,
            lowStock,
            outOfStock,
            birthMonth = ''
        } = req.query;

        // Build query object
        let query = {};

        // 1. SEARCH FILTER (searches in name, hindiName, description, planet, color)
        if (search && search.trim()) {
            const searchTerm = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Sanitize regex special characters
            query.$or = [
                { name: { $regex: searchTerm, $options: 'i' } },
                { hindiName: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } },
                { planet: { $regex: searchTerm, $options: 'i' } },
                { color: { $regex: searchTerm, $options: 'i' } }
            ];
        }

        // 2. CATEGORY FILTER (multiple categories comma-separated)
        if (category) {
            const categories = category.split(',').map(cat => cat.trim());
            // Filter by category field (frontend maps Gem Name to this)
            query.category = { $in: categories };
        }

        // 3. ZODIAC FILTER (searches in suitableFor array)
        if (zodiac) {
            query.suitableFor = { $regex: zodiac, $options: 'i' };
        }

        // 4. PLANET FILTER
        if (planet) {
            query.planet = { $regex: planet, $options: 'i' };
        }

        // 4.5. BIRTH MONTH FILTER
        if (birthMonth && birthMonth.trim()) {
            const validMonths = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
            const month = birthMonth.trim();
            if (validMonths.includes(month)) {
                query.birthMonth = month;
            }
        }

        // 5. PRICE RANGE FILTER
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
            // Exclude contact-for-price items from numeric price filters
            query.contactForPrice = false;
        }

        // 6. SELLER FILTER
        if (seller) {
            query.seller = seller;
        }

        // 7. AVAILABILITY FILTER
        if (availability !== undefined) {
            query.availability = availability === 'true';
        }

        // 8. STOCK FILTERS
        if (inStock === 'true') {
            query.stock = { $gt: 0 };
        }
        if (lowStock === 'true') {
            query.stock = { $lte: 5, $gt: 0 };
        }
        if (outOfStock === 'true') {
            query.stock = 0;
        }

        // 7. BUILD SORT OPTION
        let sortOption = {};
        switch (sort) {
            case 'oldest':
                sortOption.createdAt = 1; // Ascending (oldest first)
                break;
            case 'price-low':
                // Push contactForPrice items to the end while sorting by price
                sortOption = { contactForPrice: 1, price: 1 };
                break;
            case 'price-high':
                // Push contactForPrice items to the end while sorting by price
                sortOption = { contactForPrice: 1, price: -1 };
                break;
            case 'name':
                sortOption.name = 1; // A-Z
                break;
            case 'newest':
            default:
                sortOption.createdAt = -1; // Descending (newest first)
                break;
        }

        // 8. PAGINATION
        const skip = (Number(page) - 1) * Number(limit);
        const total = await Gem.countDocuments(query);
        const totalPages = Math.ceil(total / Number(limit));

        // 9. FETCH GEMS with seller details
        const Seller = require('../models/Seller');
        const gems = await Gem.find(query)
            .populate('seller', 'name email phone')
            .sort(sortOption)
            .skip(skip)
            .limit(Number(limit));

        // 10. Get seller profiles for each gem
        const gemsWithSellerInfo = await Promise.all(
            gems.map(async (gem) => {
                // Check if seller exists
                if (!gem.seller || !gem.seller._id) {
                    return {
                        ...gem.toObject(),
                        seller: {
                            _id: null,
                            fullName: 'Unknown Seller',
                            shopName: 'Gem Store',
                            isVerified: false
                        }
                    };
                }

                const sellerProfile = await Seller.findOne({ user: gem.seller._id });
                return {
                    ...gem.toObject(),
                    seller: sellerProfile ? {
                        _id: sellerProfile._id,
                        fullName: sellerProfile.fullName,
                        shopName: sellerProfile.shopName,
                        isVerified: sellerProfile.isVerified
                    } : {
                        _id: gem.seller._id,
                        fullName: gem.seller.name || 'Seller',
                        shopName: 'Gem Store',
                        isVerified: false
                    }
                };
            })
        );

        // 11. SEND RESPONSE (match frontend expected format)
        res.json({
            success: true,
            data: {
                gems: gemsWithSellerInfo,
                pagination: {
                    currentPage: Number(page),
                    totalPages,
                    totalGems: total,
                    totalItems: total, // Alias for backward compatibility
                    limit: Number(limit),
                    hasNext: Number(page) < totalPages,
                    hasPrev: Number(page) > 1
                }
            },
            // Also include direct properties for backward compatibility
            gems: gemsWithSellerInfo,
            pagination: {
                currentPage: Number(page),
                totalPages,
                totalGems: total,
                totalItems: total,
                limit: Number(limit),
                hasNext: Number(page) < totalPages,
                hasPrev: Number(page) > 1
            }
        });

    } catch (error) {
        console.error('Get gems error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching gems',
            error: error.message
        });
    }
});

// @route   GET /api/gems/categories
// @desc    Get predefined gem categories (PUBLIC)
// @access  Public
router.get('/categories', async (req, res) => {
    try {
        // Updated categories list (flat array)
        const categories = [
            // Navratna
            'Blue Sapphire (Neelam)',
            'Yellow Sapphire (Pukhraj)',
            'Ruby (Manik)',
            'Emerald (Panna)',
            'Diamond (Heera)',
            'Pearl (Moti)',
            'Cat\'s Eye (Lehsunia)',
            'Hessonite (Gomed)',
            'Coral (Moonga)',
            // Exclusive Gemstones
            'Alexandrite',
            'Basra Pearl',
            'Burma Ruby',
            'Colombian Emerald',
            'Cornflower Blue Sapphire',
            'Kashmir Blue Sapphire',
            'No-Oil Emerald',
            'Padparadscha Sapphire',
            'Panjshir Emerald',
            'Swat Emerald',
            'Pigeon Blood Ruby',
            'Royal Blue Sapphire',
            // Sapphire
            'Sapphire',
            'Bi-Colour Sapphire (Pitambari)',
            'Blue Sapphire (Neelam)',
            'Color Change Sapphire',
            'Green Sapphire',
            'Pink Sapphire',
            'Padparadscha Sapphire',
            'Peach Sapphire',
            'Purple Sapphire (Khooni Neelam)',
            'White Sapphire',
            'Yellow Sapphire (Pukhraj)',
            // More Vedic Ratna (Upratan)
            'Amethyst',
            'Aquamarine',
            'Blue Topaz',
            'Citrine Stone (Sunela)',
            'Tourmaline',
            'Opal',
            'Tanzanite',
            'Iolite (Neeli)',
            'Jasper (Mahe Mariyam)',
            'Lapis',
            // Legacy categories (for backward compatibility)
            'Emerald',
            'Ruby',
            'Pearl',
            'Red Coral',
            'Gomed (Hessonite)',
            'Diamond',
            'Cat\'s Eye',
            'Moonstone',
            'Turquoise'
        ];

        res.json({
            success: true,
            data: categories
        });

    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
});

// @route   GET /api/gems/search-suggestions
// @desc    Get search suggestions for autocomplete (PUBLIC)
// @access  Public
router.get('/search-suggestions', async (req, res) => {
    try {
        const searchTerm = req.query.q || req.query.search || '';

        if (!searchTerm || searchTerm.trim().length < 2) {
            return res.json({
                success: true,
                suggestions: []
            });
        }

        const sanitizedSearch = searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Search in name, hindiName, planet, color, and suitableFor (optimized for autocomplete)
        const gems = await Gem.find({
            $or: [
                { name: { $regex: sanitizedSearch, $options: 'i' } },
                { hindiName: { $regex: sanitizedSearch, $options: 'i' } },
                { planet: { $regex: sanitizedSearch, $options: 'i' } },
                { color: { $regex: sanitizedSearch, $options: 'i' } }
            ],
            availability: true
        })
            .select('name hindiName planet color suitableFor')
            .limit(10)
            .lean(); // Use lean() for better performance

        // Create unique suggestions
        const suggestions = [];
        const added = new Set();

        const searchLower = sanitizedSearch.toLowerCase();

        gems.forEach(gem => {
            // Add gem name
            if (gem.name.toLowerCase().includes(searchLower) && !added.has(gem.name.toLowerCase())) {
                suggestions.push({
                    type: 'name',
                    value: gem.name,
                    label: `${gem.name}${gem.hindiName ? ` (${gem.hindiName})` : ''}`,
                    gemId: gem._id
                });
                added.add(gem.name.toLowerCase());
            }

            // Add planet
            if (gem.planet && gem.planet.toLowerCase().includes(searchLower) && !added.has(gem.planet.toLowerCase())) {
                suggestions.push({
                    type: 'planet',
                    value: gem.planet,
                    label: `Planet: ${gem.planet}`,
                    icon: '🪐'
                });
                added.add(gem.planet.toLowerCase());
            }

            // Add color
            if (gem.color && gem.color.toLowerCase().includes(searchLower) && !added.has(gem.color.toLowerCase())) {
                suggestions.push({
                    type: 'color',
                    value: gem.color,
                    label: `Color: ${gem.color}`,
                    icon: '🎨'
                });
                added.add(gem.color.toLowerCase());
            }

            // Add zodiac signs from suitableFor
            if (gem.suitableFor && Array.isArray(gem.suitableFor)) {
                gem.suitableFor.forEach(zodiac => {
                    const zodiacLower = zodiac.toLowerCase();
                    const zodiacList = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
                        'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];

                    if (zodiacList.includes(zodiacLower) &&
                        zodiacLower.includes(searchLower) &&
                        !added.has(zodiacLower)) {
                        suggestions.push({
                            type: 'zodiac',
                            value: zodiac,
                            label: `Zodiac: ${zodiac}`,
                            icon: '♈'
                        });
                        added.add(zodiacLower);
                    }
                });
            }
        });

        res.json({
            success: true,
            suggestions: suggestions.slice(0, 8) // Limit to 8 suggestions
        });

    } catch (error) {
        console.error('Search suggestions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during search suggestions'
        });
    }
});

// @route   GET /api/gems/my-gems
// @desc    Get seller's own gems (SELLER ONLY)
// @access  Private (Seller)
router.get('/my-gems', protect, checkRole('seller'), async (req, res) => {
    try {
        const gems = await Gem.find({ seller: req.user._id })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: gems.length,
            gems
        });

    } catch (error) {
        console.error('Get my gems error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during gems retrieval'
        });
    }
});

// @route   GET /api/gems/:id
// @desc    Get single gem by ID with full details including seller info (PUBLIC)
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ObjectID
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid gem ID format'
            });
        }

        // Fetch gem with basic seller info
        const gem = await Gem.findById(id)
            .populate('seller', 'name email phone');

        if (!gem) {
            return res.status(404).json({
                success: false,
                message: 'Gem not found'
            });
        }

        // Get full seller profile
        const Seller = require('../models/Seller');
        const sellerProfile = await Seller.findOne({ user: gem.seller._id });

        // Fetch related products
        // Priority: 1. Same name, 2. Same planet, 3. Same color, 4. Similar price range
        const relatedProductsQuery = {
            _id: { $ne: gem._id }, // Exclude current gem
            availability: true // Only available products
        };

        // Build query for related products with priority
        let priceCriteria = null;
        if (gem.price !== null && gem.price !== undefined) {
            const priceRange = gem.price * 0.3; // 30% price range
            const minPrice = gem.price - priceRange;
            const maxPrice = gem.price + priceRange;
            priceCriteria = { price: { $gte: minPrice, $lte: maxPrice } };
        }

        // Try to find related products with multiple criteria
        let relatedProducts = await Gem.find({
            ...relatedProductsQuery,
            $or: [
                { name: gem.name }, // Same gem name (highest priority)
                { planet: gem.planet }, // Same planet
                { color: gem.color }, // Same color
                ...(priceCriteria ? [priceCriteria] : [])
            ]
        })
            .populate('seller', 'name email phone')
            .sort({ createdAt: -1 })
            .limit(8)
            .lean();

        // If we don't have enough related products, fill with any available gems
        if (relatedProducts.length < 6) {
            const additionalProducts = await Gem.find({
                ...relatedProductsQuery,
                _id: { $nin: [...relatedProducts.map(p => p._id), gem._id] }
            })
                .populate('seller', 'name email phone')
                .sort({ createdAt: -1 })
                .limit(8 - relatedProducts.length)
                .lean();

            relatedProducts = [...relatedProducts, ...additionalProducts];
        }

        // Format related products with seller info (similar to main gem format)
        const relatedProductsFormatted = await Promise.all(
            relatedProducts.map(async (relatedGem) => {
                const relatedSellerProfile = await Seller.findOne({ user: relatedGem.seller._id });
                return {
                    _id: relatedGem._id,
                    name: relatedGem.name,
                    hindiName: relatedGem.hindiName,
                    planet: relatedGem.planet,
                    color: relatedGem.color,
                    price: relatedGem.price,
                    discount: relatedGem.discount,
                    discountType: relatedGem.discountType,
                    heroImage: relatedGem.heroImage,
                    images: relatedGem.images,
                    stock: relatedGem.stock,
                    availability: relatedGem.availability,
                    rating: relatedGem.rating,
                    reviews: relatedGem.reviews,
                    seller: relatedSellerProfile ? {
                        _id: relatedSellerProfile._id,
                        fullName: relatedSellerProfile.fullName,
                        shopName: relatedSellerProfile.shopName,
                        isVerified: relatedSellerProfile.isVerified
                    } : {
                        _id: relatedGem.seller._id,
                        fullName: relatedGem.seller.name || 'Seller',
                        shopName: 'Gem Store',
                        isVerified: false
                    },
                    createdAt: relatedGem.createdAt
                };
            })
        );

        // Build gem response with full seller details
        const gemResponse = {
            ...gem.toObject(),
            seller: sellerProfile ? {
                _id: sellerProfile._id,
                fullName: sellerProfile.fullName,
                email: sellerProfile.email,
                phone: sellerProfile.phone,
                shopName: sellerProfile.shopName,
                isVerified: sellerProfile.isVerified,
                rating: 4.8 // Placeholder - can be calculated from reviews later
            } : {
                _id: gem.seller._id,
                fullName: gem.seller.name,
                email: gem.seller.email,
                phone: gem.seller.phone,
                shopName: 'Gem Store',
                isVerified: false,
                rating: 0
            },
            reviews: [], // Placeholder for future review implementation
            averageRating: 0, // Placeholder
            totalReviews: 0 // Placeholder
        };

        res.json({
            success: true,
            gem: gemResponse,
            relatedProducts: relatedProductsFormatted
        });

    } catch (error) {
        console.error('Get gem error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during gem retrieval',
            error: error.message
        });
    }
});

// @route   PUT /api/gems/:id
// @desc    Update gem (SELLER ONLY - Own gems)
// @access  Private (Seller)
router.put('/:id', protect, checkRole('seller'), [
    body('contactForPrice').optional().isBoolean().withMessage('contactForPrice must be a boolean'),
    body('price')
        .optional({ nullable: true })
        .custom((value, { req }) => {
            const contactForPrice = req.body.contactForPrice === true || req.body.contactForPrice === 'true';
            if (contactForPrice) {
                return true; // allow null/undefined
            }
            if (value === undefined || value === null) {
                throw new Error('Valid price is required when \'Contact for Price\' is not enabled');
            }
            const num = Number(value);
            if (Number.isNaN(num) || num < 0) {
                throw new Error('Price must be a positive number');
            }
            return true;
        }),
    body('sizeUnit').optional().isIn(['carat', 'gram', 'ounce', 'ratti']).withMessage('Valid size unit is required'),
    body('birthMonth')
        .optional({ nullable: true, checkFalsy: true })
        .isIn(['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'])
        .withMessage('Invalid birth month')
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
        // Find gem and check ownership
        const gem = await Gem.findById(req.params.id);

        if (!gem) {
            return res.status(404).json({
                success: false,
                message: 'Gem not found'
            });
        }

        // Check if user owns this gem
        if (gem.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this gem'
            });
        }

        // Normalize contactForPrice for update logic
        if (typeof req.body.contactForPrice === 'string') {
            req.body.contactForPrice = req.body.contactForPrice === 'true';
        }
        // If contactForPrice is true, ensure price is null
        if (req.body.contactForPrice === true) {
            req.body.price = null;
        }

        // Normalize birthMonth: empty string or undefined becomes null
        if (req.body.birthMonth === '' || req.body.birthMonth === undefined) {
            req.body.birthMonth = null;
        }

        // Update gem
        const updatedGem = await Gem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Gem updated successfully',
            gem: updatedGem
        });

    } catch (error) {
        console.error('Update gem error:', error);
        
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.keys(error.errors).map(key => ({
                type: 'field',
                value: error.errors[key].value,
                msg: error.errors[key].message,
                path: key,
                location: 'body'
            }));
            
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }
        
        // Handle cast errors
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: `Invalid ${error.path}: ${error.message}`
            });
        }
        
        // Handle other errors
        res.status(500).json({
            success: false,
            message: 'Server error during gem update'
        });
    }
});

// @route   DELETE /api/gems/:id
// @desc    Delete gem (SELLER ONLY - Own gems)
// @access  Private (Seller)
router.delete('/:id', protect, checkRole('seller'), async (req, res) => {
    try {
        // Find gem and check ownership
        const gem = await Gem.findById(req.params.id);

        if (!gem) {
            return res.status(404).json({
                success: false,
                message: 'Gem not found'
            });
        }

        // Check if user owns this gem
        if (gem.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this gem'
            });
        }

        await Gem.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Gem deleted successfully'
        });

    } catch (error) {
        console.error('Delete gem error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during gem deletion'
        });
    }
});

// @route   GET /api/gems/filter/zodiac/:zodiacSign
// @desc    Get gems by zodiac sign (PUBLIC)
// @access  Public
router.get('/filter/zodiac/:zodiacSign', async (req, res) => {
    try {
        const { zodiacSign } = req.params;
        const { page = 1, limit = 12 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const gems = await Gem.find({
            suitableFor: { $regex: zodiacSign, $options: 'i' },
            availability: true
        })
            .populate('seller', 'name')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const count = await Gem.countDocuments({
            suitableFor: { $regex: zodiacSign, $options: 'i' },
            availability: true
        });

        const totalPages = Math.ceil(count / parseInt(limit));

        res.json({
            success: true,
            count,
            totalPages,
            currentPage: parseInt(page),
            zodiacSign,
            gems
        });

    } catch (error) {
        console.error('Get gems by zodiac error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during gems retrieval'
        });
    }
});

// @route   GET /api/gems/filter/planet/:planet
// @desc    Get gems by planet (PUBLIC)
// @access  Public
router.get('/filter/planet/:planet', async (req, res) => {
    try {
        const { planet } = req.params;
        const { page = 1, limit = 12 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const gems = await Gem.find({
            planet: { $regex: planet, $options: 'i' },
            availability: true
        })
            .populate('seller', 'name')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const count = await Gem.countDocuments({
            planet: { $regex: planet, $options: 'i' },
            availability: true
        });

        const totalPages = Math.ceil(count / parseInt(limit));

        res.json({
            success: true,
            count,
            totalPages,
            currentPage: parseInt(page),
            planet,
            gems
        });

    } catch (error) {
        console.error('Get gems by planet error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during gems retrieval'
        });
    }
});

module.exports = router;