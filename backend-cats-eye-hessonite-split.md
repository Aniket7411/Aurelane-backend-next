# Backend Update: Split Cat's Eye & Hessonite into Separate Categories

## Overview
The frontend has been updated to treat "Cat's Eye" and "Hessonite" as **separate categories** instead of a combined "Cat's Eye & Hessonite" category. This aligns with the Navratna (nine gems) classification where they are distinct gemstones:
- **Cat's Eye (Lehsunia)** - Associated with Ketu Grah
- **Hessonite (Gomed)** - Associated with Rahu Grah

The backend needs to be updated to recognize and accept these as separate categories.

---

## Required Backend Changes

### 1. Update Category Validation/Enum

**Location**: Wherever gem categories are validated (model schema, validation middleware, enum lists, etc.)

**Action Required**:
- **Remove** `"Cat's Eye & Hessonite"` from the category enum
- **Add** `"Cat's Eye"` as a new category
- **Add** `"Hessonite"` as a new category

**Current Valid Categories** (before update):
```
Ruby
Sapphire
Emerald
Diamond
Pearl
Coral
Topaz & Quartz
Opal & Exotic
Cat's Eye & Hessonite  ← REMOVE THIS
Alexandrite
Custom
```

**Updated Valid Categories** (after update):
```
Ruby
Sapphire
Emerald
Diamond
Pearl
Coral
Topaz & Quartz
Opal & Exotic
Cat's Eye  ← ADD THIS
Hessonite  ← ADD THIS
Alexandrite
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
    "Cat's Eye",  // ← ADD THIS (replaces "Cat's Eye & Hessonite")
    'Hessonite',  // ← ADD THIS (replaces "Cat's Eye & Hessonite")
    'Alexandrite',
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
    "Cat's Eye",  // ← ADD THIS
    'Hessonite',  // ← ADD THIS
    'Alexandrite',
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
  "Cat's Eye",  // ← ADD THIS
  'Hessonite',  // ← ADD THIS
  'Alexandrite',
  'Custom'
];
```

---

### 2. Update Categories Endpoint Response

**Endpoint**: `GET /api/gems/categories`

**Action Required**: 
- Remove `"Cat's Eye & Hessonite"` from the response
- Add `"Cat's Eye"` to the response
- Add `"Hessonite"` to the response

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
    "Cat's Eye",  // ← MUST BE INCLUDED
    "Hessonite",  // ← MUST BE INCLUDED
    "Alexandrite",
    "Custom"
  ]
}
```

---

### 3. Database Migration for Existing Gems

**CRITICAL**: You need to migrate existing gems that have `category: "Cat's Eye & Hessonite"` to the appropriate new category.

**Migration Strategy**:

1. **Identify gems to migrate**: Find all gems with `category: "Cat's Eye & Hessonite"`

2. **Determine correct category** based on subcategory or name:
   - If subcategory contains "Cat's Eye", "Lehsunia", "Ketu", or "Vaidurya" → Set `category: "Cat's Eye"`
   - If subcategory contains "Gomed", "Hessonite", "Rahu", or "Cinnamon Stone" → Set `category: "Hessonite"`
   - If subcategory is unclear, check the gem name or set a default

3. **Execute migration script** (example for MongoDB):
```javascript
// Migration script example
async function migrateCatsEyeHessonite() {
  const db = await connectToDatabase();
  const gemsCollection = db.collection('gems');
  
  // Find all gems with old category
  const gemsToMigrate = await gemsCollection.find({
    category: "Cat's Eye & Hessonite"
  }).toArray();
  
  for (const gem of gemsToMigrate) {
    let newCategory = 'Hessonite'; // default
    
    // Check subcategory to determine new category
    const subcategory = gem.subcategory?.toLowerCase() || '';
    const name = gem.name?.toLowerCase() || '';
    
    if (
      subcategory.includes("cat's eye") ||
      subcategory.includes("lehsunia") ||
      subcategory.includes("ketu") ||
      subcategory.includes("vaidurya") ||
      name.includes("cat's eye") ||
      name.includes("lehsunia")
    ) {
      newCategory = "Cat's Eye";
    } else if (
      subcategory.includes("gomed") ||
      subcategory.includes("hessonite") ||
      subcategory.includes("rahu") ||
      subcategory.includes("cinnamon") ||
      name.includes("gomed") ||
      name.includes("hessonite")
    ) {
      newCategory = "Hessonite";
    }
    
    // Update the gem
    await gemsCollection.updateOne(
      { _id: gem._id },
      { $set: { category: newCategory } }
    );
    
    console.log(`Migrated gem ${gem._id}: ${gem.name} → ${newCategory}`);
  }
  
  console.log(`Migration complete. Updated ${gemsToMigrate.length} gems.`);
}
```

**For PostgreSQL**:
```sql
-- Update Cat's Eye gems
UPDATE gems 
SET category = 'Cat''s Eye'
WHERE category = 'Cat''s Eye & Hessonite'
  AND (
    LOWER(subcategory) LIKE '%cat''s eye%' OR
    LOWER(subcategory) LIKE '%lehsunia%' OR
    LOWER(subcategory) LIKE '%ketu%' OR
    LOWER(subcategory) LIKE '%vaidurya%' OR
    LOWER(name) LIKE '%cat''s eye%' OR
    LOWER(name) LIKE '%lehsunia%'
  );

-- Update Hessonite gems
UPDATE gems 
SET category = 'Hessonite'
WHERE category = 'Cat''s Eye & Hessonite'
  AND (
    LOWER(subcategory) LIKE '%gomed%' OR
    LOWER(subcategory) LIKE '%hessonite%' OR
    LOWER(subcategory) LIKE '%rahu%' OR
    LOWER(subcategory) LIKE '%cinnamon%' OR
    LOWER(name) LIKE '%gomed%' OR
    LOWER(name) LIKE '%hessonite%'
  );
```

**For MySQL**:
```sql
-- Update Cat's Eye gems
UPDATE gems 
SET category = 'Cat\'s Eye'
WHERE category = 'Cat\'s Eye & Hessonite'
  AND (
    LOWER(subcategory) LIKE '%cat\'s eye%' OR
    LOWER(subcategory) LIKE '%lehsunia%' OR
    LOWER(subcategory) LIKE '%ketu%' OR
    LOWER(name) LIKE '%cat\'s eye%' OR
    LOWER(name) LIKE '%lehsunia%'
  );

-- Update Hessonite gems
UPDATE gems 
SET category = 'Hessonite'
WHERE category = 'Cat\'s Eye & Hessonite'
  AND (
    LOWER(subcategory) LIKE '%gomed%' OR
    LOWER(subcategory) LIKE '%hessonite%' OR
    LOWER(subcategory) LIKE '%rahu%' OR
    LOWER(name) LIKE '%gomed%' OR
    LOWER(name) LIKE '%hessonite%'
  );
```

---

### 4. Update Category Filtering Logic

**Location**: Wherever category filtering happens in queries (e.g., `GET /api/gems?category=Cat's Eye`)

**Action Required**: 
- Ensure filters accept `"Cat's Eye"` as a valid value
- Ensure filters accept `"Hessonite"` as a valid value
- Remove support for `"Cat's Eye & Hessonite"` (or map it to both categories for backward compatibility during transition)

**Backward Compatibility Consideration**:
During the transition period, you may want to handle the old category name:
```javascript
// Example: Map old category to new categories
function normalizeCategory(category) {
  if (category === "Cat's Eye & Hessonite") {
    // Return both categories for filtering
    return ["Cat's Eye", "Hessonite"];
  }
  return [category];
}
```

**Verify**: 
- `/api/gems?category=Cat's Eye` returns gems with category "Cat's Eye"
- `/api/gems?category=Hessonite` returns gems with category "Hessonite"
- `/api/gems/category/Cat's Eye` works correctly
- `/api/gems/category/Hessonite` works correctly

---

### 5. Database Schema Updates

**If using enum constraints in database**:

- **PostgreSQL**: Update the ENUM type
  ```sql
  -- Remove old value and add new values
  ALTER TYPE gem_category_enum DROP VALUE 'Cat''s Eye & Hessonite';
  ALTER TYPE gem_category_enum ADD VALUE 'Cat''s Eye';
  ALTER TYPE gem_category_enum ADD VALUE 'Hessonite';
  ```

- **MongoDB**: No migration needed (schema validation only), but update validation schema

- **MySQL**: Update the ENUM column
  ```sql
  ALTER TABLE gems 
  MODIFY COLUMN category ENUM(
    'Ruby', 'Sapphire', 'Emerald', 'Diamond', 'Pearl', 
    'Coral', 'Topaz & Quartz', 'Opal & Exotic', 
    'Cat\'s Eye', 'Hessonite', 'Alexandrite', 'Custom'
  );
  ```

---

## Subcategory Mapping

The frontend now uses these subcategories:

**For "Cat's Eye" category:**
- Cat's Eye (Lehsunia)
- Chrysoberyl Cat's Eye
- Ketu Stone
- Vaidurya
- Other Cat's Eye

**For "Hessonite" category:**
- Gomed (Hessonite)
- Cinnamon Stone
- Rahu Stone
- Gomedh
- Other Hessonite

Ensure your backend accepts these subcategories under their respective categories.

---

## Testing Checklist

- [ ] Create a gem with category "Cat's Eye" - should succeed
- [ ] Create a gem with category "Hessonite" - should succeed
- [ ] Attempt to create a gem with category "Cat's Eye & Hessonite" - should fail validation
- [ ] GET `/api/gems/categories` - should include "Cat's Eye" and "Hessonite", should NOT include "Cat's Eye & Hessonite"
- [ ] GET `/api/gems?category=Cat's Eye` - should return Cat's Eye gems
- [ ] GET `/api/gems?category=Hessonite` - should return Hessonite gems
- [ ] GET `/api/gems/category/Cat's Eye` - should work correctly
- [ ] GET `/api/gems/category/Hessonite` - should work correctly
- [ ] Database migration completed - all existing gems migrated correctly
- [ ] Validation errors should not occur for "Cat's Eye" or "Hessonite" categories
- [ ] Verify no gems remain with category "Cat's Eye & Hessonite"

---

## Migration Timeline Recommendation

1. **Phase 1**: Update backend code to accept new categories (but still accept old one)
2. **Phase 2**: Run database migration script
3. **Phase 3**: Remove support for "Cat's Eye & Hessonite" from validation
4. **Phase 4**: Verify all gems are correctly categorized

---

## Summary

**Changes Required**:
1. Remove `"Cat's Eye & Hessonite"` from category validation/enum list
2. Add `"Cat's Eye"` to category validation/enum list
3. Add `"Hessonite"` to category validation/enum list
4. Update categories endpoint to return new categories
5. **CRITICAL**: Migrate existing gems from old category to new categories
6. Update database enum if using strict enum constraints
7. Update category filtering logic

**Breaking Changes**: 
- This is a **breaking change** for existing gems with category "Cat's Eye & Hessonite"
- Database migration is **required** before removing the old category
- API responses will change (old category name will no longer appear)

---

## Questions?

If you're unsure where category validation happens in your backend codebase, search for:
- `category` field validation
- Enum definitions for gem categories
- `GET /api/gems/categories` endpoint handler
- Database schema definitions for gems collection/table

For migration assistance, check:
- Existing gems with `category: "Cat's Eye & Hessonite"`
- Subcategory values to determine correct new category
- Gem names that might indicate which category they belong to

