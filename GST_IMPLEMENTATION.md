# GST Implementation Documentation

## Overview

This document describes the implementation of Goods and Services Tax (GST) functionality for gemstones in the Aurelane Next application. The implementation follows Indian GST regulations for gemstones and precious stones.

## GST Categories and Rates

The following GST categories are implemented based on Indian tax regulations:

| Gemstone Type | GST Rate | Category Value |
|--------------|----------|----------------|
| Rough/Unworked Precious & Semi-precious Stones | 0% | `rough_unworked` |
| Cut & Polished Loose Gemstones (excl. diamonds) | 2% | `cut_polished` |
| Rough/Unpolished Diamonds | 0.25% | `rough_diamonds` |
| Cut & Polished Loose Diamonds | 1% | `cut_diamonds` |

## Implementation Details

### 1. GST Utility Functions (`app/reactcomponents/utils/gstUtils.js`)

This file contains all GST-related utility functions:

#### Key Functions:

- **`GST_CATEGORIES`**: Object containing all GST category definitions with rates and descriptions
- **`getGSTCategories()`**: Returns all GST categories as an array for dropdowns
- **`getGSTCategoryByValue(value)`**: Retrieves a GST category by its value
- **`calculateGST(price, gstRate)`**: Calculates GST amount for a given price and rate
- **`calculatePriceWithGST(price, gstRate)`**: Calculates total price including GST
- **`calculateGSTForItem(item, quantity)`**: Calculates GST for a single gem item
- **`calculateGSTSummary(items)`**: Calculates GST summary for multiple items (cart)
- **`formatGSTRate(rate)`**: Formats GST rate for display

### 2. Add Gem Form (`app/reactcomponents/pages/AddGem.js`)

#### Changes Made:

- Added `gstCategory` field to the form state
- Added GST category dropdown in the form (required field)
- GST category is validated and included when submitting gem data
- Dropdown shows category label with GST rate percentage

#### Form Field:

```javascript
<select name="gstCategory" value={formData.gstCategory} onChange={handleInputChange}>
    <option value="">Select GST Category</option>
    {gstCategories.map(category => (
        <option key={category.value} value={category.value}>
            {category.label} ({category.rate}% GST)
        </option>
    ))}
</select>
```

### 3. Cart Context (`app/reactcomponents/contexts/CartContext.js`)

#### Changes Made:

- Updated `getCartSummary()` to include GST calculations
- Uses `calculateGSTSummary()` from GST utils
- Returns GST breakdown grouped by rate
- Total includes: base subtotal + GST + shipping

#### Cart Summary Structure:

```javascript
{
    itemCount: number,
    subtotal: number,        // Base price before GST
    gst: number,             // Total GST amount
    gstBreakdown: [          // GST breakdown by rate
        {
            rate: number,
            amount: number,
            items: [...]
        }
    ],
    shipping: number,
    total: number,           // Subtotal + GST + Shipping
    discount: number
}
```

### 4. Cart Page (`app/reactcomponents/pages/Cart.js`)

#### Changes Made:

- Displays GST breakdown in the order summary
- Shows GST grouped by rate (if multiple rates exist)
- GST is displayed between subtotal and shipping

#### Display Format:

```
Subtotal: ₹X,XXX
GST (2%): ₹XX
GST (1%): ₹XX
Shipping: Free / ₹XXX
─────────────────
Total: ₹X,XXX
```

### 5. Checkout Page (`app/reactcomponents/pages/Checkout.js`)

#### Changes Made:

- Displays GST breakdown in the order summary sidebar
- Shows GST grouped by rate
- GST is included in the total calculation
- Order data sent to backend includes GST information

### 6. Gem Detail Page (`app/reactcomponents/pages/GemDetail.js`)

#### Changes Made:

- Displays GST information below the price
- Shows GST rate and amount for the selected quantity
- Includes `gstCategory` when adding items to cart
- GST amount is shown as "included in price"

#### Display Format:

```
Price: ₹X,XXX
GST (2%): ₹XX (included in price)
```

## Data Flow

### Adding a Gem:

1. Seller selects GST category from dropdown in AddGem form
2. GST category is validated (required field)
3. Gem data including `gstCategory` is sent to backend via `gemAPI.addGem()`

### Adding to Cart:

1. When gem is added to cart, `gstCategory` is included in cart item
2. Cart context calculates GST for each item using `calculateGSTForItem()`
3. Cart summary includes GST breakdown

### Checkout:

1. Cart summary is displayed with GST breakdown
2. Order data includes GST information
3. Payment amount includes GST

## Backend Integration Requirements

### API Endpoints to Update:

1. **POST `/api/gems`** - Add Gem
   - Accept `gstCategory` field in request body
   - Store `gstCategory` in gem document

2. **GET `/api/gems/:id`** - Get Gem Details
   - Return `gstCategory` in response

3. **GET `/api/gems`** - Get Gems List
   - Return `gstCategory` for each gem in response

4. **POST `/api/orders`** - Create Order
   - Accept GST breakdown in order items
   - Store GST information in order document

5. **POST `/api/payments/create-order`** - Create Payment Order
   - Include GST in total amount calculation
   - Store GST breakdown in payment/order data

### Database Schema Updates:

#### Gem Model:
```javascript
{
    // ... existing fields
    gstCategory: {
        type: String,
        enum: ['rough_unworked', 'cut_polished', 'rough_diamonds', 'cut_diamonds'],
        required: true
    }
}
```

#### Order Model:
```javascript
{
    // ... existing fields
    items: [{
        // ... existing item fields
        gstCategory: String,
        gstRate: Number,
        gstAmount: Number,
        priceBeforeGST: Number
    }],
    gstSummary: {
        totalGST: Number,
        gstBreakdown: [{
            rate: Number,
            amount: Number
        }]
    }
}
```

## Testing Checklist

### Frontend Testing:

- [ ] Add gem form validates GST category selection
- [ ] GST category dropdown shows all 4 options with correct rates
- [ ] Cart calculates GST correctly for different categories
- [ ] Cart summary displays GST breakdown correctly
- [ ] Checkout page shows GST in order summary
- [ ] Gem detail page displays GST information
- [ ] Multiple items with different GST rates calculate correctly
- [ ] GST is included in total price calculations

### Backend Testing (To be implemented):

- [ ] Gem creation accepts and stores `gstCategory`
- [ ] Gem retrieval returns `gstCategory`
- [ ] Order creation includes GST breakdown
- [ ] Payment orders include GST in total amount
- [ ] Invoice generation includes GST details

## GST Calculation Examples

### Example 1: Single Item (Cut & Polished Gemstone - 2% GST)
- Base Price: ₹10,000
- GST Rate: 2%
- GST Amount: ₹200
- Total Price: ₹10,200

### Example 2: Single Item (Cut Diamond - 1% GST)
- Base Price: ₹50,000
- GST Rate: 1%
- GST Amount: ₹500
- Total Price: ₹50,500

### Example 3: Cart with Multiple Items
- Item 1 (Cut Gemstone, 2%): ₹10,000 → GST: ₹200
- Item 2 (Cut Diamond, 1%): ₹50,000 → GST: ₹500
- Subtotal: ₹60,000
- Total GST: ₹700
- Shipping: ₹500 (if subtotal < ₹50,000)
- **Grand Total: ₹61,200**

## Notes

1. **GST is included in the displayed price** - The price shown to customers already includes GST
2. **Shipping is calculated on base subtotal** - Free shipping threshold (₹50,000) is based on subtotal before GST
3. **GST breakdown is grouped by rate** - If cart has items with different GST rates, they are shown separately
4. **Rounding** - All GST calculations are rounded to 2 decimal places
5. **Required Field** - GST category is mandatory when adding a gem

## Future Enhancements

1. **GST Invoice Generation**: Generate GST-compliant invoices with HSN codes
2. **GST Reports**: Generate GST reports for sellers and admin
3. **GST Exemption**: Handle GST exemption cases (export, etc.)
4. **HSN Code Integration**: Add HSN codes for each gem category
5. **GST Return Filing**: Integration with GST portal for return filing

## Support

For questions or issues related to GST implementation, please contact the development team.

---

**Last Updated**: [Current Date]
**Version**: 1.0.0

