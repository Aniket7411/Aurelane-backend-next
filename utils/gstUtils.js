/**
 * GST Utility Functions
 * Based on Indian GST regulations for gemstones
 */

// GST Categories and Rates
const GST_CATEGORIES = {
    rough_unworked: {
        value: 'rough_unworked',
        label: 'Rough/Unworked Precious & Semi-precious Stones',
        rate: 0
    },
    cut_polished: {
        value: 'cut_polished',
        label: 'Cut & Polished Loose Gemstones (excl. diamonds)',
        rate: 2
    },
    rough_diamonds: {
        value: 'rough_diamonds',
        label: 'Rough/Unpolished Diamonds',
        rate: 0.25
    },
    cut_diamonds: {
        value: 'cut_diamonds',
        label: 'Cut & Polished Loose Diamonds',
        rate: 1
    }
};

/**
 * Get all GST categories as array
 */
const getGSTCategories = () => {
    return Object.values(GST_CATEGORIES);
};

/**
 * Get GST category by value
 */
const getGSTCategoryByValue = (value) => {
    return GST_CATEGORIES[value] || null;
};

/**
 * Get GST rate for a category
 */
const getGSTRate = (gstCategory) => {
    const category = getGSTCategoryByValue(gstCategory);
    return category ? category.rate : 0;
};

/**
 * Calculate GST amount for a given price and rate
 */
const calculateGST = (price, gstRate) => {
    if (!price || price <= 0) return 0;
    return Math.round((price * gstRate / 100) * 100) / 100; // Round to 2 decimal places
};

/**
 * Calculate price with GST included
 */
const calculatePriceWithGST = (price, gstRate) => {
    if (!price || price <= 0) return 0;
    const gstAmount = calculateGST(price, gstRate);
    return Math.round((price + gstAmount) * 100) / 100;
};

/**
 * Calculate price before GST (reverse calculation)
 * If price includes GST, this calculates the base price
 */
const calculatePriceBeforeGST = (priceWithGST, gstRate) => {
    if (!priceWithGST || priceWithGST <= 0) return 0;
    if (gstRate === 0) return priceWithGST;
    return Math.round((priceWithGST / (1 + gstRate / 100)) * 100) / 100;
};

/**
 * Calculate GST for a single item
 */
const calculateGSTForItem = (item) => {
    const { price, quantity = 1, gstCategory } = item;
    
    if (!price || price <= 0 || !gstCategory) {
        return {
            priceBeforeGST: price || 0,
            gstRate: 0,
            gstAmount: 0,
            priceWithGST: price || 0
        };
    }

    const gstRate = getGSTRate(gstCategory);
    const itemTotal = price * quantity;
    
    // If price already includes GST, calculate base price
    const priceBeforeGST = calculatePriceBeforeGST(itemTotal, gstRate);
    const gstAmount = calculateGST(priceBeforeGST, gstRate);
    const priceWithGST = priceBeforeGST + gstAmount;

    return {
        priceBeforeGST: Math.round(priceBeforeGST * 100) / 100,
        gstRate,
        gstAmount: Math.round(gstAmount * 100) / 100,
        priceWithGST: Math.round(priceWithGST * 100) / 100
    };
};

/**
 * Calculate GST summary for multiple items (cart/order)
 */
const calculateGSTSummary = (items) => {
    const gstBreakdown = {};
    let totalGST = 0;
    let subtotalBeforeGST = 0;

    items.forEach(item => {
        const gstCalc = calculateGSTForItem(item);
        const { gstRate, gstAmount, priceBeforeGST } = gstCalc;

        subtotalBeforeGST += priceBeforeGST;

        if (gstRate > 0) {
            if (!gstBreakdown[gstRate]) {
                gstBreakdown[gstRate] = {
                    rate: gstRate,
                    amount: 0,
                    items: []
                };
            }
            gstBreakdown[gstRate].amount += gstAmount;
            gstBreakdown[gstRate].items.push({
                itemId: item.gem || item._id,
                quantity: item.quantity || 1,
                price: item.price,
                gstAmount
            });
            totalGST += gstAmount;
        }
    });

    // Convert breakdown object to array
    const gstBreakdownArray = Object.values(gstBreakdown).map(breakdown => ({
        rate: breakdown.rate,
        amount: Math.round(breakdown.amount * 100) / 100
    }));

    return {
        subtotalBeforeGST: Math.round(subtotalBeforeGST * 100) / 100,
        totalGST: Math.round(totalGST * 100) / 100,
        gstBreakdown: gstBreakdownArray
    };
};

/**
 * Format GST rate for display
 */
const formatGSTRate = (rate) => {
    if (rate === 0) return '0%';
    if (rate === 0.25) return '0.25%';
    return `${rate}%`;
};

module.exports = {
    GST_CATEGORIES,
    getGSTCategories,
    getGSTCategoryByValue,
    getGSTRate,
    calculateGST,
    calculatePriceWithGST,
    calculatePriceBeforeGST,
    calculateGSTForItem,
    calculateGSTSummary,
    formatGSTRate
};

