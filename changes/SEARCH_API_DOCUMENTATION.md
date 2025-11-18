# Search API Documentation for Gems Header

## Overview
This document describes the search functionality requirements for the gem search feature in the header (both desktop and mobile views).

## Frontend Implementation Summary

### Changes Made to `src/components/layout/Header.js`:

1. **Imported `gemAPI`** from services to fetch real gem data
2. **Added `isSearching` state** to show loading indicator
3. **Updated `handleSearchChange`** to fetch from API instead of dummy data
4. **Added `handleSearchSubmit`** to handle form submission (Enter key)
5. **Modified search inputs** to use forms with `onSubmit` handlers
6. **Added loading indicator** in suggestions dropdown

### Changes Made to `src/pages/Shop.js`:

1. **Imported `useSearchParams`** from react-router-dom
2. **Read URL query parameter** to initialize search filter
3. **Auto-populate search field** when navigating from header with search query

### Key Features:
- Search triggers after 2+ characters typed
- Shows "Searching..." while fetching
- Fetches up to 5 suggestions from API
- Auto-completes gem names
- Click suggestion or press Enter to navigate to shop page
- Closes mobile menu on selection
- URL encodes search terms

---

## Backend API Requirements

### Endpoint: `GET /api/gems`

**Purpose:** Fetch gems with optional search parameter for autocomplete suggestions

**Request:**
```http
GET /api/gems?search={query}&limit=5
```

**Query Parameters:**
- `search` (string, optional): Search term to filter gems by name
- `limit` (number, optional): Maximum number of results (default: 12, used: 5 for autocomplete)
- `page` (number, optional): Page number for pagination
- `category` (string, optional): Filter by category (comma-separated)
- `minPrice` (number, optional): Minimum price filter
- `maxPrice` (number, optional): Maximum price filter
- `sort` (string, optional): Sort order (newest, price_low, price_high)

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "gems": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "price": "number",
        "category": "string",
        "image": "string",
        "stock": "number",
        "sellerId": "string",
        // ... other gem fields
      }
    ],
    "pagination": {
      "currentPage": "number",
      "totalPages": "number",
      "totalGems": "number",
      "hasNext": "boolean",
      "hasPrev": "boolean"
    }
  }
}
```

**Response (Error - 400/500):**
```json
{
  "success": false,
  "message": "Error message"
}
```

---

## Backend Implementation Guide

### For `/api/gems` Endpoint:

#### Expected Behavior:
1. **Search Functionality:**
   - When `search` parameter is provided, filter gems by name (case-insensitive partial matching)
   - Should match gems where name contains the search term
   - Example: `search=rub` should match "Ruby", "Blue Ruby", etc.

2. **Limit Parameter:**
   - When `limit=5` is provided, return only 5 results (for header autocomplete)
   - Default limit should be higher for main shop page

3. **Performance:**
   - Add database index on `name` field for faster searches
   - Consider implementing debounce on backend if query is too expensive
   - Response should be fast (< 200ms for good UX)

#### Database Query Example (pseudo-code):
```javascript
// Example query structure
const gems = await Gem.find({
  name: { $regex: searchTerm, $options: 'i' } // MongoDB
})
  .limit(limit || 12)
  .skip((page - 1) * limit)
  .sort(sortOptions);

const totalGems = await Gem.countDocuments({
  name: { $regex: searchTerm, $options: 'i' }
});

const pagination = {
  currentPage: page,
  totalPages: Math.ceil(totalGems / limit),
  totalGems: totalGems,
  hasNext: page * limit < totalGems,
  hasPrev: page > 1
};
```

#### SQL Alternative (PostgreSQL/MySQL):
```sql
SELECT * FROM gems 
WHERE LOWER(name) LIKE LOWER('%searchTerm%')
ORDER BY created_at DESC
LIMIT 5
OFFSET (page - 1) * limit;
```

---

## Testing Checklist

### Frontend Tests:
- [ ] Search shows suggestions after typing 2+ characters
- [ ] "Searching..." indicator appears while fetching
- [ ] Suggestions dropdown appears below search bar
- [ ] Clicking suggestion navigates to shop page with correct query
- [ ] Pressing Enter in search bar navigates to shop page
- [ ] Mobile menu closes when suggestion is selected
- [ ] URL encoding works for special characters in search terms
- [ ] Empty search term clears suggestions
- [ ] API errors are handled gracefully (no crash)

### Backend Tests:
- [ ] Search by exact name returns correct results
- [ ] Search by partial name returns correct results
- [ ] Case-insensitive search works
- [ ] Limit parameter properly restricts results
- [ ] Pagination works correctly with search
- [ ] Empty search returns all gems (or reasonable default)
- [ ] Special characters in search term are handled
- [ ] Response time is acceptable (< 500ms)

---

## Edge Cases

### Frontend:
1. **Network failure:** Show empty suggestions, don't crash
2. **Slow network:** Cancel previous request if user types faster
3. **Empty results:** Show no suggestions
4. **Special characters:** Properly encode in URL

### Backend:
1. **Empty search:** Return all gems or return empty array with message
2. **No results:** Return empty array with `success: true`
3. **Invalid characters:** Sanitize or handle gracefully
4. **Very long search terms:** Limit length or handle appropriately

---

## Performance Optimization Suggestions

1. **Debouncing:** Frontend debounces after 300ms to reduce API calls
2. **Caching:** Consider caching frequent searches on backend (Redis)
3. **Database Indexing:** Add index on `name` field
4. **Limit Results:** Always use `limit=5` for autocomplete to reduce data transfer
5. **Pagination:** Ensure pagination works correctly with search

---

## API Integration Details

### Current Frontend Code:
```javascript
// Search function
const handleSearchChange = async (e) => {
  const value = e.target.value;
  setSearchTerm(value);

  if (value.trim() && value.length >= 2) {
    setIsSearching(true);
    try {
      const response = await gemAPI.getGems({ search: value, limit: 5 });
      if (response.success) {
        const gems = response.data?.gems || response.gems || [];
        const gemNames = gems.map(gem => gem.name);
        setSuggestions(gemNames);
      }
    } catch (error) {
      console.error('Error fetching gem suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  } else {
    setSuggestions([]);
  }
};

// Navigation function
const handleSearchSelect = (gem) => {
  setSearchTerm(gem);
  setSuggestions([]);
  setMobileMenuOpen(false);
  navigate(`/shop?query=${encodeURIComponent(gem)}`);
};
```

---

## Summary

**No new backend endpoint is required.** The existing `GET /api/gems` endpoint already supports the `search` query parameter. You just need to ensure:

1. The backend properly filters gems by name using the `search` parameter
2. Case-insensitive partial matching works
3. The `limit` parameter is respected
4. Response format matches the expected structure

The frontend will automatically use the API for live search suggestions instead of the hardcoded dummy data.

