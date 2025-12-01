# Backend Update: Add Alexandrite Category

## Overview
The frontend has been updated to include "Alexandrite" as a valid gem category. The backend needs to be updated to recognize and accept this new category.

---

## Required Backend Changes

### 1. Update Category Validation/Enum

**Location**: Wherever gem categories are validated (model schema, validation middleware, enum lists, etc.)

**Action Required**:
- Add `"Alexandrite"` to the list of valid category values

**Current Valid Categories** (after this update):
```
Ruby
Sapphire
Emerald
Diamond
Pearl
Coral
Topaz & Quartz
Opal & Exotic
Cat's Eye & Hessonite
Alexandrite  ← ADD THIS
Custom
```

**Example Changes**:

**If using Mongoose Schema enum:**
```javascript
category: {
  type: String,
  enum: [
    'Ruby',
    'Sapphire',
    'Emerald',
    'Diamond',
    'Pearl',
    'Coral',
    'Topaz & Quartz',
    'Opal & Exotic',
    "Cat's Eye & Hessonite",
    'Alexandrite',  // ← ADD THIS LINE
    'Custom'
  ],
  required: true
}
```

**If using validation middleware (express-validator):**
```javascript
body('category')
  .isIn([
    'Ruby',
    'Sapphire',
    'Emerald',
    'Diamond',
    'Pearl',
    'Coral',
    'Topaz & Quartz',
    'Opal & Exotic',
    "Cat's Eye & Hessonite",
    'Alexandrite',  // ← ADD THIS LINE
    'Custom'
  ])
```

**If using a constants file:**
```javascript
export const VALID_CATEGORIES = [
  'Ruby',
  'Sapphire',
  'Emerald',
  'Diamond',
  'Pearl',
  'Coral',
  'Topaz & Quartz',
  'Opal & Exotic',
  "Cat's Eye & Hessonite",
  'Alexandrite',  // ← ADD THIS LINE
  'Custom'
];
```

---

### 2. Update Categories Endpoint Response

**Endpoint**: `GET /api/gems/categories`

**Action Required**: Ensure the response includes "Alexandrite" in the categories array

**Expected Response Format**:
```json
{
  "success": true,
  "data": [
    "Ruby",
    "Sapphire",
    "Emerald",
    "Diamond",
    "Pearl",
    "Coral",
    "Topaz & Quartz",
    "Opal & Exotic",
    "Cat's Eye & Hessonite",
    "Alexandrite",  // ← MUST BE INCLUDED
    "Custom"
  ]
}
```

---

### 3. Update Category Filtering Logic

**Location**: Wherever category filtering happens in queries (e.g., `GET /api/gems?category=Alexandrite`)

**Action Required**: No code change needed if using dynamic category filtering. Just ensure the filter accepts "Alexandrite" as a valid value.

**Verify**: 
- `/api/gems?category=Alexandrite` returns gems with category "Alexandrite"
- `/api/gems/category/Alexandrite` works correctly

---

### 4. Database Considerations

**If using enum constraints in database**:
- **PostgreSQL**: Update the ENUM type
  ```sql
  ALTER TYPE gem_category_enum ADD VALUE 'Alexandrite';
  ```

- **MongoDB**: No migration needed (schema validation only)

- **MySQL**: Update the ENUM column
  ```sql
  ALTER TABLE gems 
  MODIFY COLUMN category ENUM(
    'Ruby', 'Sapphire', 'Emerald', 'Diamond', 'Pearl', 
    'Coral', 'Topaz & Quartz', 'Opal & Exotic', 
    'Cat\'s Eye & Hessonite', 'Alexandrite', 'Custom'
  );
  ```

---

## Testing Checklist

- [ ] Create a gem with category "Alexandrite" - should succeed
- [ ] GET `/api/gems/categories` - should include "Alexandrite"
- [ ] GET `/api/gems?category=Alexandrite` - should return Alexandrite gems
- [ ] GET `/api/gems/category/Alexandrite` - should work correctly
- [ ] Validation errors should not occur for "Alexandrite" category

---

## Summary

**Minimal Changes Required**:
1. Add `"Alexandrite"` to category validation/enum list
2. Ensure categories endpoint returns "Alexandrite"
3. Update database enum if using strict enum constraints

**No Breaking Changes**: This is an additive change. Existing categories continue to work as before.

---

## Questions?

If you're unsure where category validation happens in your backend codebase, search for:
- `category` field validation
- Enum definitions for gem categories
- `GET /api/gems/categories` endpoint handler

