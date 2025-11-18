# Birth Month Feature - Backend Update Documentation

## Overview
This document outlines the minimal backend changes required to support the optional birth month feature for gems. This feature allows sellers to optionally associate gems with specific birth months, and users can filter gems based on their birth month.

## Database Schema Update

### Gem Model
Add the following field to the Gem schema:

```javascript
birthMonth: {
    type: String,
    enum: ['January', 'February', 'March', 'April', 'May', 'June', 
           'July', 'August', 'September', 'October', 'November', 'December'],
    default: null,
    required: false
}
```

**Note:** This field is optional (`required: false`) and can be `null` or empty.

## API Endpoints Updates

### 1. Create Gem Endpoint (`POST /api/gems`)
**No changes required** - The endpoint should already accept `birthMonth` in the request body if provided. Ensure it's saved to the database.

**Request Body Example:**
```json
{
    "name": "Emerald",
    "birthMonth": "May",  // Optional field
    // ... other gem fields
}
```

### 2. Update Gem Endpoint (`PUT /api/gems/:id`)
**No changes required** - The endpoint should accept `birthMonth` in the request body for updates.

**Request Body Example:**
```json
{
    "birthMonth": "June",  // Optional field, can be null or empty string to remove
    // ... other gem fields
}
```

### 3. Get Gems Endpoint (`GET /api/gems`)
**Update required** - Add support for filtering by birth month.

**Query Parameters:**
- `birthMonth` (optional): Filter gems by birth month (e.g., `?birthMonth=May`)

**Implementation Example:**
```javascript
// In your getGems controller
const { birthMonth, ...otherFilters } = req.query;

const filter = { ...otherFilters };
if (birthMonth) {
    filter.birthMonth = birthMonth;
}

const gems = await Gem.find(filter)
    .populate('seller', 'fullName shopName')
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);
```

**Response:** No changes needed - just include `birthMonth` in the returned gem objects.

## Validation

### Birth Month Values
Accept only these 12 values:
- `January`
- `February`
- `March`
- `April`
- `May`
- `June`
- `July`
- `August`
- `September`
- `October`
- `November`
- `December`

### Optional Field Handling
- If `birthMonth` is not provided, set it to `null`
- If `birthMonth` is an empty string `""`, set it to `null`
- If `birthMonth` is provided, validate it's one of the 12 valid months

## Migration (If Needed)

If you need to add this field to existing gems:

```javascript
// Migration script (run once)
db.gems.updateMany(
    { birthMonth: { $exists: false } },
    { $set: { birthMonth: null } }
);
```

## Summary

**Minimal Changes Required:**
1. ✅ Add `birthMonth` field to Gem schema (optional, enum of 12 months)
2. ✅ Update GET `/api/gems` endpoint to accept `birthMonth` query parameter for filtering
3. ✅ Ensure POST and PUT endpoints accept `birthMonth` in request body (likely already supported)
4. ✅ Include `birthMonth` in API responses

**No Changes Required:**
- Authentication/Authorization
- Other endpoints
- Database indexes (unless you want to optimize birth month queries)

## Testing Checklist

- [ ] Create gem without birthMonth (should work)
- [ ] Create gem with birthMonth (should save correctly)
- [ ] Update gem to add birthMonth
- [ ] Update gem to remove birthMonth (set to null)
- [ ] Filter gems by birthMonth (GET /api/gems?birthMonth=May)
- [ ] Filter gems without birthMonth parameter (should return all)
- [ ] Invalid birthMonth value should be rejected

