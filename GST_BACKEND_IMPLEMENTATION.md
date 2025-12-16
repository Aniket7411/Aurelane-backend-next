# GST Backend Implementation Summary

## Overview
This document summarizes the backend implementation of GST (Goods and Services Tax) functionality for gemstones according to Indian GST regulations.

## Changes Made

### 1. GST Utility Functions (`utils/gstUtils.js`)
Created a new utility file with GST calculation functions:
- `GST_CATEGORIES`: Object containing all GST category definitions
- `getGSTCategories()`: Returns all GST categories as array
- `getGSTCategoryByValue(value)`: Retrieves GST category by value
- `getGSTRate(gstCategory)`: Gets GST rate for a category
- `calculateGST(price, gstRate)`: Calculates GST amount
- `calculatePriceWithGST(price, gstRate)`: Calculates price with GST
- `calculatePriceBeforeGST(priceWithGST, gstRate)`: Reverse calculates base price
- `calculateGSTForItem(item)`: Calculates GST for a single item
- `calculateGSTSummary(items)`: Calculates GST summary for multiple items
- `formatGSTRate(rate)`: Formats GST rate for display

### 2. Gem Model (`models/Gem.js`)
**Added Field:**
```javascript
gstCategory: {
    type: String,
    required: false, // Optional for backward compatibility with existing gems
    enum: ['rough_unworked', 'cut_polished', 'rough_diamonds', 'cut_diamonds'],
    trim: true,
    default: null
}
```

**Note**: `gstCategory` is optional to allow existing gems to work without breaking. Sellers can update it later using the PUT endpoint.

**GST Categories:**
- `rough_unworked`: Rough/Unworked Precious & Semi-precious Stones (0% GST)
- `cut_polished`: Cut & Polished Loose Gemstones (excl. diamonds) (2% GST)
- `rough_diamonds`: Rough/Unpolished Diamonds (0.25% GST)
- `cut_diamonds`: Cut & Polished Loose Diamonds (1% GST)

### 3. Order Model (`models/Order.js`)
**Added Fields to Order Items:**
```javascript
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
```

**Added GST Summary to Order:**
```javascript
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
```

### 4. Gem Routes (`routes/gems.js`)

#### POST `/api/gems` - Add Gem
- Added validation for `gstCategory` field (optional but recommended)
- Validates enum values: `['rough_unworked', 'cut_polished', 'rough_diamonds', 'cut_diamonds']`
- Returns `gstCategory` in response

#### PUT `/api/gems/:id` - Update Gem
- Added optional validation for `gstCategory` field
- **Allows updating GST category for existing gems**
- Can update just `gstCategory` or along with other fields
- Example: `PUT /api/gems/:id` with body `{"gstCategory": "cut_polished"}`

#### GET `/api/gems` - Get Gems List
- Added `gstCategory` to select fields
- Returns `gstCategory` for each gem in response

#### GET `/api/gems/:id` - Get Gem Details
- Returns `gstCategory` in gem response (full gem object is returned)

#### GET `/api/gems/my-gems` - Get Seller's Gems
- Added `gstCategory` to select fields
- Returns `gstCategory` for each gem

### 5. Order Routes (`routes/orders.js`)

#### POST `/api/orders` - Create Order (COD)
**Changes:**
- Imports GST utility functions
- Calculates GST for each order item using `calculateGSTForItem()`
- Stores GST information in order items:
  - `gstCategory`: From item or gem
  - `gstRate`: Calculated GST rate
  - `gstAmount`: Calculated GST amount
  - `priceBeforeGST`: Base price before GST
- Calculates GST summary using `calculateGSTSummary()`
- Stores GST summary in order:
  - `totalGST`: Total GST amount
  - `gstBreakdown`: Array of GST breakdown by rate

### 6. Payment Routes (`routes/payments.js`)

#### POST `/api/payments/create-order` - Create Payment Order
**Changes:**
- Imports GST utility functions
- Calculates GST for each order item (same as COD orders)
- Stores GST information in order items
- Calculates and stores GST summary
- Total price includes GST (as calculated by frontend)

## GST Calculation Logic

### Price Handling
- **Frontend sends price WITH GST included** (as per GST_IMPLEMENTATION.md)
- Backend calculates base price before GST using reverse calculation
- Formula: `priceBeforeGST = priceWithGST / (1 + gstRate / 100)`
- GST amount is calculated on base price: `gstAmount = priceBeforeGST * gstRate / 100`

### Example Calculation
**Item:** Cut & Polished Gemstone (2% GST)
- Price with GST: ₹10,200
- Base price: ₹10,200 / 1.02 = ₹10,000
- GST amount: ₹10,000 * 0.02 = ₹200
- Verification: ₹10,000 + ₹200 = ₹10,200 ✓

## API Request/Response Examples

### Add Gem with GST
**Request:**
```json
POST /api/gems
{
  "name": "Emerald",
  "gstCategory": "cut_polished",
  "price": 50000,
  ...
}
```

**Response:**
```json
{
  "success": true,
  "gem": {
    "_id": "...",
    "name": "Emerald",
    "gstCategory": "cut_polished",
    "price": 50000,
    ...
  }
}
```

### Create Order with GST
**Request:**
```json
POST /api/orders
{
  "items": [
    {
      "gem": "gem_id",
      "quantity": 1,
      "price": 10200,
      "gstCategory": "cut_polished"
    }
  ],
  "totalPrice": 10200,
  ...
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "_id": "...",
    "items": [
      {
        "gem": "gem_id",
        "quantity": 1,
        "price": 10200,
        "gstCategory": "cut_polished",
        "gstRate": 2,
        "gstAmount": 200,
        "priceBeforeGST": 10000
      }
    ],
    "gstSummary": {
      "totalGST": 200,
      "gstBreakdown": [
        {
          "rate": 2,
          "amount": 200
        }
      ]
    },
    "totalPrice": 10200
  }
}
```

## Testing Checklist

### Backend Testing:
- [x] Gem creation accepts and stores `gstCategory`
- [x] Gem retrieval returns `gstCategory`
- [x] Order creation includes GST breakdown
- [x] Payment orders include GST in total amount
- [x] GST calculations are accurate
- [x] Multiple items with different GST rates calculate correctly

### Integration Testing:
- [ ] Test with frontend to ensure GST data flows correctly
- [ ] Verify GST breakdown in order responses
- [ ] Test order creation with mixed GST categories
- [ ] Verify GST summary calculations

## Notes

1. **GST is included in displayed price** - The price sent from frontend already includes GST
2. **Backward compatibility** - Existing gems without `gstCategory` will still work, but GST won't be calculated for orders
3. **GST calculation** - All calculations are rounded to 2 decimal places
4. **Optional field** - `gstCategory` is optional but recommended for new gems
5. **Order items** - GST information is stored per item for accurate record keeping
6. **Updating existing gems** - Use `PUT /api/gems/:id` to update GST category for existing gems

## Updating GST for Existing Gems

### Using API:
```http
PUT /api/gems/:gemId
Authorization: Bearer <seller_token>
Content-Type: application/json

{
  "gstCategory": "cut_polished"
}
```

### GST Category Selection:
- **Diamonds**: Use `cut_diamonds` (1% GST) or `rough_diamonds` (0.25% GST)
- **Other Gemstones**: Use `cut_polished` (2% GST) or `rough_unworked` (0% GST)

See `UPDATE_GST_FOR_EXISTING_GEMS.md` for detailed instructions and examples.

## Future Enhancements

1. **GST Invoice Generation**: Generate GST-compliant invoices with HSN codes
2. **GST Reports**: Generate GST reports for sellers and admin
3. **GST Exemption**: Handle GST exemption cases (export, etc.)
4. **HSN Code Integration**: Add HSN codes for each gem category
5. **GST Return Filing**: Integration with GST portal for return filing

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Status**: ✅ Implementation Complete

