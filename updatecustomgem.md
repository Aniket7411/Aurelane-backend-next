# Backend Update Guide: Custom Gem Support (No Planet, Based on Month)

This document outlines the backend changes required to support **Custom Stones** that are not associated with any planet but are linked to birth months.

---

## Overview

The frontend now supports adding gems with an option for "Custom Stone (No Planet) - Based on Birth Month". This allows sellers to add gemstones that:
- Are **not** associated with any astrological planet
- Are **linked to a specific birth month** instead
- Can be searched and filtered by birth month

---

## 1. MongoDB Schema Changes

### Current Schema (Expected)
```javascript
{
  name: String,              // Required
  hindiName: String,         // Required
  category: String,          // Required
  subcategory: String,       // Required
  planet: String,            // Currently Required
  planetHindi: String,       // Currently Required
  birthMonth: String,        // Optional
  color: String,             // Required
  description: String,       // Required
  // ... other fields
}
```

### Updated Schema (Required)
```javascript
{
  name: String,              // Required
  hindiName: String,         // Required
  category: String,          // Required
  subcategory: String,       // Required
  planet: String,            // **NOW OPTIONAL** - Can be null for custom stones
  planetHindi: String,       // **NOW OPTIONAL** - Can be null for custom stones
  birthMonth: String,        // **NOW REQUIRED** when isCustomStone is true
  isCustomStone: Boolean,     // **NEW FIELD** - Default: false
  color: String,             // Required
  description: String,       // Required
  // ... other fields
}
```

### Schema Validation Rules

1. **For Regular Gems (isCustomStone = false or undefined)**:
   - `planet` is **REQUIRED** (cannot be null/empty)
   - `planetHindi` is **REQUIRED** (cannot be null/empty)
   - `birthMonth` is **OPTIONAL**

2. **For Custom Stones (isCustomStone = true)**:
   - `planet` must be **NULL** or **empty string**
   - `planetHindi` must be **NULL** or **empty string**
   - `birthMonth` is **REQUIRED** (must be one of: January, February, March, April, May, June, July, August, September, October, November, December)

---

## 2. API Endpoint Changes

### POST `/api/gems` - Create Gem

**Request Body Changes:**
```json
{
  "name": "Custom Birthstone",
  "hindiName": "कस्टम जन्म पत्थर",
  "category": "Custom",
  "subcategory": "Birthstone",
  "planet": null,                    // ← Can be null for custom stones
  "planetHindi": null,               // ← Can be null for custom stones
  "birthMonth": "January",           // ← Required when isCustomStone is true
  "isCustomStone": true,              // ← NEW FIELD
  "color": "Blue",
  "description": "...",
  // ... other fields
}
```

**Validation Logic:**
```javascript
// Pseudo-code for validation
if (isCustomStone === true) {
  // Custom stone validation
  if (!birthMonth || !isValidMonth(birthMonth)) {
    return error: "birthMonth is required for custom stones"
  }
  if (planet || planetHindi) {
    return error: "planet and planetHindi must be null for custom stones"
  }
} else {
  // Regular gem validation
  if (!planet || !planet.trim()) {
    return error: "planet is required for regular gems"
  }
  if (!planetHindi || !planetHindi.trim()) {
    return error: "planetHindi is required for regular gems"
  }
}
```

### PUT `/api/gems/:id` - Update Gem

Same validation rules apply when updating gems.

---

## 3. Search Implementation Updates

### Current Search Behavior

The backend should search across these fields (as per `gem-data-and-filter-spec.md`):
- `name`
- `hindiName`
- `description`
- `benefits` (array)
- `suitableFor` (array)
- `color`
- `planet`
- `origin`

### Updated Search Behavior

**For Custom Stones:**
- When searching, custom stones should be searchable by:
  - `name`
  - `hindiName`
  - `description`
  - `benefits`
  - `suitableFor`
  - `color`
  - `origin`
  - **`birthMonth`** ← Add this to searchable fields

**MongoDB Search Query Example:**
```javascript
// When search parameter is provided
const searchRegex = new RegExp(searchTerm, 'i');

const searchQuery = {
  $or: [
    { name: searchRegex },
    { hindiName: searchRegex },
    { description: searchRegex },
    { color: searchRegex },
    { origin: searchRegex },
    { planet: searchRegex },              // Only for non-custom stones
    { planetHindi: searchRegex },         // Only for non-custom stones
    { birthMonth: searchRegex },          // ← NEW: Search by birth month
    { 'benefits': { $in: [searchRegex] } },
    { 'suitableFor': { $in: [searchRegex] } }
  ]
};

// Filter out null planet searches for custom stones
if (searchTerm) {
  // The $or will naturally handle null planets
  // But you might want to explicitly handle birthMonth search
}
```

**Recommended MongoDB Text Index:**
```javascript
// Create/update text index to include birthMonth
db.gems.createIndex({
  name: "text",
  hindiName: "text",
  description: "text",
  color: "text",
  origin: "text",
  planet: "text",
  planetHindi: "text",
  birthMonth: "text",        // ← ADD THIS
  benefits: "text",
  suitableFor: "text"
});
```

---

## 4. Filtering Updates

### GET `/api/gems` Query Parameters

**Existing Parameters:**
- `search` - Text search (now includes birthMonth)
- `category` - Filter by category
- `birthMonth` - Filter by birth month (already supported)
- `minPrice`, `maxPrice` - Price range
- `sort` - Sorting options
- `page`, `limit` - Pagination

**No new query parameters needed** - the existing `birthMonth` filter already works.

**Filter Query Example:**
```javascript
// When birthMonth filter is applied
const filterQuery = {};

if (birthMonth) {
  filterQuery.birthMonth = birthMonth;
  // This will match both:
  // 1. Regular gems with that birthMonth
  // 2. Custom stones with that birthMonth
}

// When searching for custom stones specifically
if (includeCustomStones) {
  filterQuery.$or = [
    { planet: { $ne: null } },           // Regular gems
    { isCustomStone: true }              // Custom stones
  ];
}
```

---

## 5. Migration Script (If Needed)

If you have existing gems in the database, you may need to:

1. **Add `isCustomStone` field** to all existing gems (default: `false`)
2. **Ensure existing gems have valid planet values** (if they're not custom stones)

**Migration Script Example:**
```javascript
// MongoDB migration script
db.gems.updateMany(
  { isCustomStone: { $exists: false } },
  { $set: { isCustomStone: false } }
);

// Optional: Validate that all non-custom stones have planets
db.gems.find({
  isCustomStone: { $ne: true },
  $or: [
    { planet: null },
    { planet: "" },
    { planet: { $exists: false } }
  ]
}).forEach(function(gem) {
  print("Warning: Gem " + gem._id + " is missing planet but isCustomStone is not true");
});
```

---

## 6. Response Format

### GET `/api/gems` Response

The response format remains the same, but gems may now have:
```json
{
  "success": true,
  "data": {
    "gems": [
      {
        "_id": "...",
        "name": "Custom January Birthstone",
        "planet": null,              // ← Can be null
        "planetHindi": null,         // ← Can be null
        "birthMonth": "January",     // ← Required for custom stones
        "isCustomStone": true,       // ← NEW FIELD
        // ... other fields
      },
      {
        "_id": "...",
        "name": "Ruby",
        "planet": "Sun (Surya)",     // ← Required for regular gems
        "planetHindi": "सूर्य ग्रह",
        "birthMonth": "July",         // ← Optional
        "isCustomStone": false,       // ← Default
        // ... other fields
      }
    ],
    "pagination": { ... }
  }
}
```

---

## 7. Validation Checklist

Before deploying, ensure:

- [ ] MongoDB schema allows `planet` and `planetHindi` to be `null`
- [ ] `isCustomStone` field is added to schema (default: `false`)
- [ ] Validation logic enforces:
  - [ ] Custom stones must have `birthMonth` and `planet` = null
  - [ ] Regular gems must have `planet` and cannot have `isCustomStone = true` with null planet
- [ ] Search includes `birthMonth` in searchable fields
- [ ] Text index includes `birthMonth` field
- [ ] Existing gems are migrated (if needed)
- [ ] API documentation is updated
- [ ] Frontend and backend validation rules are aligned

---

## 8. Testing Scenarios

### Test Case 1: Create Custom Stone
```http
POST /api/gems
Content-Type: application/json

{
  "name": "Custom January Stone",
  "hindiName": "कस्टम जनवरी पत्थर",
  "category": "Custom",
  "subcategory": "Birthstone",
  "planet": null,
  "planetHindi": null,
  "birthMonth": "January",
  "isCustomStone": true,
  "color": "Blue",
  "description": "A custom birthstone for January",
  "price": 50000,
  // ... other required fields
}
```
**Expected:** Success (201)

### Test Case 2: Create Custom Stone Without Birth Month (Should Fail)
```http
POST /api/gems
{
  "isCustomStone": true,
  "birthMonth": null,
  // ... other fields
}
```
**Expected:** Validation error (400) - "birthMonth is required for custom stones"

### Test Case 3: Create Custom Stone With Planet (Should Fail)
```http
POST /api/gems
{
  "isCustomStone": true,
  "planet": "Sun (Surya)",
  "birthMonth": "January",
  // ... other fields
}
```
**Expected:** Validation error (400) - "planet must be null for custom stones"

### Test Case 4: Search by Birth Month
```http
GET /api/gems?search=January
```
**Expected:** Returns gems with birthMonth containing "January" (including custom stones)

### Test Case 5: Filter by Birth Month
```http
GET /api/gems?birthMonth=January
```
**Expected:** Returns all gems (regular and custom) with birthMonth = "January"

---

## 9. Backward Compatibility

- **Existing gems** without `isCustomStone` field should default to `false`
- **Existing gems** with `planet` values should continue to work
- **API responses** should handle both old and new formats gracefully
- **Frontend** already handles null values for `planet` and `planetHindi`

---

## 10. Summary of Changes

| Component | Change | Priority |
|-----------|--------|----------|
| MongoDB Schema | Add `isCustomStone` field (Boolean, default: false) | **HIGH** |
| MongoDB Schema | Make `planet` and `planetHindi` nullable | **HIGH** |
| Validation | Enforce custom stone rules (planet=null, birthMonth required) | **HIGH** |
| Validation | Enforce regular gem rules (planet required when not custom) | **HIGH** |
| Search | Include `birthMonth` in searchable fields | **MEDIUM** |
| Index | Add `birthMonth` to text index | **MEDIUM** |
| Migration | Add `isCustomStone: false` to existing gems | **LOW** |

---

## Questions or Issues?

If you encounter any issues implementing these changes, please:
1. Check the frontend validation in `app/reactcomponents/pages/AddGem.js`
2. Verify the search implementation matches the spec in `docs/gem-data-and-filter-spec.md`
3. Ensure MongoDB indexes are updated for performance

---

**Last Updated:** Based on frontend changes in `AddGem.js`  
**Related Files:**
- Frontend: `app/reactcomponents/pages/AddGem.js`
- Spec: `docs/gem-data-and-filter-spec.md`
- API: `app/reactcomponents/services/api.js`

