const express = require('express');
const { body, validationResult } = require('express-validator');
const Gem = require('../models/Gem');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/role');
const Seller = require('../models/Seller');
const { GEM_CATEGORIES, VALID_BIRTH_MONTHS } = require('../constants/gemFilters');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;

const CATEGORY_LIST = [...GEM_CATEGORIES];

const VALID_ZODIAC_SIGNS = [
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

const sanitizeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseBoolean = (value) => {
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    return undefined;
};

const parseIntWithDefault = (value, fallback) => {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed;
};

const normalizeLimit = (value) => Math.min(MAX_LIMIT, parseIntWithDefault(value, DEFAULT_LIMIT));

const createBadRequestError = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
};

const parseCategories = (rawCategories) => {
    if (!rawCategories || !rawCategories.trim()) {
        return [];
    }
    const categories = rawCategories
        .split(',')
        .map((cat) => cat.trim())
        .filter(Boolean);

    if (!categories.length) {
        return [];
    }

    const invalid = categories.filter((cat) => !CATEGORY_LIST.includes(cat));
    if (invalid.length) {
        throw createBadRequestError(`Invalid categories: ${invalid.join(', ')}`);
    }
    return categories;
};

const buildCategoryCondition = (categories) => {
    if (!categories.length) {
        return undefined;
    }
    return categories.length === 1 ? categories[0] : { $in: categories };
};

const parseBirthMonth = (value) => {
    if (value === undefined || value === null || value === '') {
        return null;
    }
    if (!VALID_BIRTH_MONTHS.includes(value)) {
        throw createBadRequestError(`Invalid birth month: ${value}`);
    }
    return value;
};

const parsePrice = (value) => {
    if (value === undefined || value === null || value === '') {
        return null;
    }
    const num = Number(value);
    return Number.isNaN(num) ? null : num;
};

const buildPaginationMeta = ({ total, page, limit }) => {
    const totalPages = Math.ceil(total / limit) || 0;
    return {
        totalItems: total,
        totalGems: total,
        totalPages,
        currentPage: page,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        limit
    };
};

const attachSellerProfiles = async (gems) => {
    const sellerUserIds = Array.from(new Set(
        gems
            .map((gem) => (gem.seller && gem.seller._id ? gem.seller._id.toString() : null))
            .filter(Boolean)
    ));

    const sellerProfiles = sellerUserIds.length
        ? await Seller.find({ user: { $in: sellerUserIds } })
            .select('user fullName shopName isVerified')
            .lean()
        : [];

    const sellerProfileMap = new Map(
        sellerProfiles.map((profile) => [profile.user.toString(), profile])
    );

    return gems.map((gem) => {
        const sellerUserId = gem.seller && gem.seller._id ? gem.seller._id.toString() : null;
        const sellerProfile = sellerUserId ? sellerProfileMap.get(sellerUserId) : null;
        const fallbackSeller = gem.seller && gem.seller._id ? {
            _id: gem.seller._id,
            fullName: gem.seller.name || 'Seller',
            shopName: 'Gem Store',
            isVerified: false
        } : {
            _id: null,
            fullName: 'Unknown Seller',
            shopName: 'Gem Store',
            isVerified: false
        };

        return {
            ...gem,
            seller: sellerProfile ? {
                _id: sellerProfile._id,
                fullName: sellerProfile.fullName,
                shopName: sellerProfile.shopName,
                isVerified: sellerProfile.isVerified
            } : fallbackSeller
        };
    });
};

const sendGemResponse = (res, gems, pagination) => {
    res.json({
        success: true,
        data: {
            gems,
            pagination
        },
        gems,
        pagination
    });
};

const respondWithError = (res, error, fallbackMessage) => {
    if (error.statusCode) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message
        });
    }

    console.error(fallbackMessage, error);
    return res.status(500).json({
        success: false,
        message: fallbackMessage
    });
};

const buildGemQueryOptions = (queryParams = {}, baseQuery = {}) => {
    const {
        page = DEFAULT_PAGE,
        limit = DEFAULT_LIMIT,
        search = '',
        category = '',
        subcategory = '',
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
    } = queryParams;

    const pageNumber = parseIntWithDefault(page, DEFAULT_PAGE);
    const limitNumber = normalizeLimit(limit);

    const query = { ...baseQuery };

    // Search filter
    if (search && search.trim()) {
        const searchTerm = sanitizeRegex(search.trim());
        query.$or = [
            { name: { $regex: searchTerm, $options: 'i' } },
            { hindiName: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } },
            { planet: { $regex: searchTerm, $options: 'i' } },
            { planetHindi: { $regex: searchTerm, $options: 'i' } },
            { color: { $regex: searchTerm, $options: 'i' } },
            { origin: { $regex: searchTerm, $options: 'i' } },
            { benefits: { $regex: searchTerm, $options: 'i' } },
            { suitableFor: { $regex: searchTerm, $options: 'i' } }
        ];
    }

    // Category filter (query param only if no base override)
    if (!query.category && category) {
        const categories = parseCategories(category);
        const condition = buildCategoryCondition(categories);
        if (condition) {
            query.category = condition;
        }
    }

    // Subcategory filter
    if (subcategory && subcategory.trim()) {
        const subcategories = subcategory
            .split(',')
            .map((sub) => sub.trim())
            .filter(Boolean);
        if (subcategories.length === 1) {
            query.subcategory = subcategories[0];
        } else if (subcategories.length > 1) {
            query.subcategory = { $in: subcategories };
        }
    }

    // Zodiac filter (query param) only when not overridden
    if (!query.suitableFor && zodiac) {
        query.suitableFor = { $regex: sanitizeRegex(zodiac), $options: 'i' };
    }

    // Planet filter
    if (planet) {
        query.planet = { $regex: sanitizeRegex(planet), $options: 'i' };
    }

    // Birth month filter (exact match)
    if (!query.birthMonth && birthMonth) {
        query.birthMonth = parseBirthMonth(birthMonth.trim());
    }

    // Price range filter
    const parsedMinPrice = parsePrice(minPrice);
    const parsedMaxPrice = parsePrice(maxPrice);
    if (parsedMinPrice !== null || parsedMaxPrice !== null) {
        query.price = query.price || {};
        if (parsedMinPrice !== null) {
            query.price.$gte = parsedMinPrice;
        }
        if (parsedMaxPrice !== null) {
            query.price.$lte = parsedMaxPrice;
        }
        query.contactForPrice = false;
    }

    // Seller filter (allow overriding base only if not preset)
    if (!Object.prototype.hasOwnProperty.call(query, 'seller') && seller) {
        query.seller = seller;
    }

    // Availability filter
    const availabilityFilter = parseBoolean(availability);
    if (!Object.prototype.hasOwnProperty.call(query, 'availability') && availabilityFilter !== undefined) {
        query.availability = availabilityFilter;
    }

    // Stock filters (priority: outOfStock > lowStock > inStock)
    if (!Object.prototype.hasOwnProperty.call(query, 'stock')) {
        if (outOfStock === 'true') {
            query.stock = 0;
        } else if (lowStock === 'true') {
            query.stock = { $lte: 5, $gt: 0 };
        } else if (inStock === 'true') {
            query.stock = { $gt: 0 };
        }
    }

    const sortOption = (() => {
        switch (sort) {
            case 'oldest':
                return { createdAt: 1 };
            case 'price-low':
                return { contactForPrice: 1, price: 1 };
            case 'price-high':
                return { contactForPrice: 1, price: -1 };
            case 'name':
                return { name: 1 };
            case 'newest':
            default:
                return { createdAt: -1 };
        }
    })();

    return {
        query,
        sortOption,
        page: pageNumber,
        limit: limitNumber
    };
};

const fetchGemsWithFilters = async (queryParams, baseQuery = {}) => {
    const { query, sortOption, page, limit } = buildGemQueryOptions(queryParams, baseQuery);
    const skip = (page - 1) * limit;

    const [total, gems] = await Promise.all([
        Gem.countDocuments(query),
        Gem.find(query)
            .populate('seller', 'name email phone')
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .lean()
    ]);

    const gemsWithSellerInfo = await attachSellerProfiles(gems);
    const pagination = buildPaginationMeta({ total, page, limit });

    return { gems: gemsWithSellerInfo, pagination };
};

const handleZodiacListing = async (sign, req, res, baseQueryOverrides = {}) => {
    try {
        const normalizedSign = (sign || '').toLowerCase();
        if (!normalizedSign || !VALID_ZODIAC_SIGNS.includes(normalizedSign)) {
            return res.status(400).json({
                success: false,
                message: `Invalid zodiac sign: ${sign}`
            });
        }

        const regex = { $regex: sanitizeRegex(sign), $options: 'i' };
        const baseQuery = { ...baseQueryOverrides, suitableFor: regex };
        const { gems, pagination } = await fetchGemsWithFilters(req.query, baseQuery);
        sendGemResponse(res, gems, pagination);
    } catch (error) {
        respondWithError(res, error, 'Error fetching zodiac gems');
    }
};

const router = express.Router();

// @route   POST /api/gems
// @desc    Add a new gem (SELLER ONLY)
// @access  Private (Seller)
router.post('/', protect, checkRole('seller'), [
    body('name').trim().notEmpty().withMessage('Gem name is required'),
    body('category')
        .trim()
        .notEmpty().withMessage('Category is required')
        .isIn(CATEGORY_LIST).withMessage('Invalid category'),
    body('subcategory').trim().notEmpty().withMessage('Subcategory is required'),
    body('hindiName').trim().notEmpty().withMessage('Hindi name is required'),
    body('planet')
        .optional({ checkFalsy: true })
        .isLength({ max: 100 }).withMessage('Planet cannot exceed 100 characters'),
    body('planetHindi')
        .optional({ checkFalsy: true })
        .isLength({ max: 100 }).withMessage('Planet Hindi cannot exceed 100 characters'),
    body('color')
        .optional({ checkFalsy: true })
        .isLength({ max: 100 }).withMessage('Color cannot exceed 100 characters'),
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
    body('sizeUnit').isIn(['carat', 'gram', 'ratti']).withMessage('Valid size unit is required'),
    body('birthMonth')
        .optional({ nullable: true, checkFalsy: true })
        .isIn(VALID_BIRTH_MONTHS)
        .withMessage('Invalid birth month'),
    body('discountType')
        .optional({ checkFalsy: true })
        .isIn(['percentage', 'flat'])
        .withMessage('Invalid discount type'),
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
                subcategory: gem.subcategory,
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
        const { gems, pagination } = await fetchGemsWithFilters(req.query);
        sendGemResponse(res, gems, pagination);
    } catch (error) {
        respondWithError(res, error, 'Error fetching gems');
    }
});

// @route   GET /api/gems/categories
// @desc    Get predefined gem categories (PUBLIC)
// @access  Public
router.get('/categories', async (req, res) => {
    try {
        res.json({
            success: true,
            data: CATEGORY_LIST,
            categories: CATEGORY_LIST
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

// @route   GET /api/gems/category/:categoryName
// @desc    Category landing pages with shared filters/pagination
// @access  Public
router.get('/category/:categoryName', async (req, res) => {
    try {
        const { categoryName } = req.params;
        if (!CATEGORY_LIST.includes(categoryName)) {
            return res.status(400).json({
                success: false,
                message: `Invalid category: ${categoryName}`
            });
        }

        const { gems, pagination } = await fetchGemsWithFilters(req.query, { category: categoryName });
        sendGemResponse(res, gems, pagination);
    } catch (error) {
        respondWithError(res, error, 'Error fetching category gems');
    }
});

// @route   GET /api/gems/zodiac/:sign
// @desc    Zodiac collections with shared filters/pagination
// @access  Public
router.get('/zodiac/:sign', async (req, res) => handleZodiacListing(req.params.sign, req, res));

// Legacy: /filter/zodiac/:zodiacSign still supported (defaults to available gems)
router.get('/filter/zodiac/:zodiacSign', async (req, res) =>
    handleZodiacListing(req.params.zodiacSign, req, res, { availability: true })
);

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
            .select('name hindiName planet color suitableFor category subcategory')
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

                    if (VALID_ZODIAC_SIGNS.includes(zodiacLower) &&
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
                { subcategory: gem.subcategory },
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

        // Batch fetch seller profiles for related products
        const relatedSellerUserIds = Array.from(new Set(
            relatedProducts
                .map(product => product.seller && product.seller._id ? product.seller._id.toString() : null)
                .filter(Boolean)
        ));

        const relatedSellerProfiles = relatedSellerUserIds.length > 0
            ? await Seller.find({ user: { $in: relatedSellerUserIds } })
                .select('user fullName shopName isVerified')
                .lean()
            : [];

        const relatedSellerProfileMap = new Map(
            relatedSellerProfiles.map(profile => [profile.user.toString(), profile])
        );

        // Format related products with seller info (similar to main gem format)
        const relatedProductsFormatted = relatedProducts.map((relatedGem) => {
            const sellerUserId = relatedGem.seller && relatedGem.seller._id ? relatedGem.seller._id.toString() : null;
            const relatedSellerProfile = sellerUserId ? relatedSellerProfileMap.get(sellerUserId) : null;

            return {
                _id: relatedGem._id,
                name: relatedGem.name,
                hindiName: relatedGem.hindiName,
                category: relatedGem.category,
                subcategory: relatedGem.subcategory,
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
                    _id: relatedGem.seller?._id || null,
                    fullName: relatedGem.seller?.name || 'Seller',
                    shopName: 'Gem Store',
                    isVerified: false
                },
                createdAt: relatedGem.createdAt
            };
        });

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
    body('category')
        .optional({ checkFalsy: true })
        .trim()
        .isIn(CATEGORY_LIST).withMessage('Invalid category'),
    body('subcategory').optional().trim().notEmpty().withMessage('Subcategory cannot be empty'),
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
    body('sizeUnit').optional().isIn(['carat', 'gram', 'ratti']).withMessage('Valid size unit is required'),
    body('birthMonth')
        .optional({ nullable: true, checkFalsy: true })
        .isIn(VALID_BIRTH_MONTHS)
        .withMessage('Invalid birth month'),
    body('discountType')
        .optional({ checkFalsy: true })
        .isIn(['percentage', 'flat'])
        .withMessage('Invalid discount type')
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