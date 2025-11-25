# Gem Data & Filter Contract

This document summarizes every field, taxonomy entry, and query parameter the Aurelane frontend expects when working with gem inventory. Share it with backend engineers so that the API responses match the UI filters in `app/reactcomponents/pages/Shop.js`.

---

## 1. Core Gem Schema

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `_id` / `id` | string | ✅ | Unique identifier (Mongo `_id` or UUID). Both `_id` and `id` are handled. |
| `name` | string | ✅ | Display name (e.g., `Ruby`). Used for search. |
| `hindiName` | string | ✅ | Hindi display name. |
| `category` | string | ✅ | Must match one of the entries listed in [Section 2](#2-category-taxonomy). |
| `birthMonth` | string/null | Optional | One of the 12 month names, e.g., `January`. Enables the Birth Month filter. |
| `planet` / `planetHindi` | string | Optional | Used in detail pages. |
| `color` | string | Optional | Used in search + cards. |
| `description` | string | ✅ | Rich description (HTML or text). |
| `benefits` | string[] | ✅ | Displayed as bullet list. |
| `suitableFor` | string[] | ✅ | Displayed as tags + used for search. |
| `price` | number | ✅* | Amount in **INR**. Required when `contactForPrice` is `false`. |
| `discount` | number | Optional | Either percentage or flat amount depending on `discountType`. |
| `discountType` | `"percentage" \| "flat"` | Optional | Defaults to `"percentage"`. |
| `sizeWeight` | number | ✅ | Combined with `sizeUnit` for carat/gram/ratti info. |
| `sizeUnit` | string | ✅ | e.g., `"carat"`, `"ratti"`, `"gram"`. |
| `stock` | number | Optional | Needed for cart validation. |
| `certification` | string | ✅ | e.g., `"IGI Certified"`. |
| `origin` | string | ✅ | Country/region of origin. |
| `deliveryDays` | number | ✅ | Used in delivery ETA messaging. |
| `heroImage` | string (URL) | ✅ | Primary image for `GemCard`. |
| `allImages` / `images` / `additionalImages` | string[] | Optional | Gallery & carousel. Frontend falls back gracefully. |
| `contactForPrice` | boolean | Optional | If `true`, price can be `null`; UI shows CTA instead of amount. |
| `availability` | boolean | Optional | Hide gems that are not available. |

\*The price is stored in INR on the backend. The frontend handles currency conversion + markup.

---

## 2. Category Taxonomy

The Shop page now filters **only by top-level category**. Backend responses must use one of the following strings so the checkbox list works consistently:

- Ruby
- Sapphire
- Emerald
- Diamond
- Pearl
- Coral
- Topaz & Quartz
- Opal & Exotic
- Cat's Eye & Hessonite
- Custom

`GET /gems/categories` should return this array, and `GET /gems/category/:category` must respond with all gems that belong to the requested category (e.g., “Ruby” should return every Ruby variant).

---

## 3. Shop Filters → API Query Parameters

Frontend component: `app/reactcomponents/pages/Shop.js`

Endpoint: `GET /api/gems`

| Query Param | Type | Default | Description / Backend Expectation |
| --- | --- | --- | --- |
| `page` | number | 1 | 1-based index. Backend must return pagination metadata (see Section 4). |
| `limit` | number | 12 | Items per page. |
| `search` | string | `''` | Free-text search over `name`, `hindiName`, `description`, `benefits`, `suitableFor`, `color`, `planet`, `origin`. Backend can use regex/full-text. |
| `category` | string | `''` | Comma-separated list (e.g., `Ruby,Sapphire`). Backend should split and filter where `gem.category` ∈ list. |
| `birthMonth` | string | `''` | Exact match (`January` … `December`). |
| `minPrice` | number | `''` | Inclusive lower bound (INR). |
| `maxPrice` | number | `''` | Inclusive upper bound (INR). |
| `sort` | string | `'newest'` | Accepted values: `newest` (default: `createdAt desc`), `oldest` (`createdAt asc`), `price-low` (`price asc`), `price-high` (`price desc`). |

> **Important:** The frontend memoizes filter objects and will only re-fetch when these values change. Make sure the backend accepts all of them; otherwise the UI appears “stuck”.

---

## 4. Expected Response Shape (`GET /gems`)

```jsonc
{
  "success": true,
  "data": {
    "gems": [
      {
        "_id": "65f0...",
        "name": "Ruby",
        "category": "Ruby",
        "price": 250000,
        "birthMonth": "July",
        "benefits": ["Instills courage", "..."],
        "suitableFor": ["Politicians", "Leaders"],
        "heroImage": "https://.../ruby.webp",
        "allImages": [],
        "sizeWeight": 5.2,
        "sizeUnit": "carat",
        "discount": 5,
        "discountType": "percentage",
        "contactForPrice": false,
        "...": "other schema fields"
      }
    ],
    "pagination": {
      "totalItems": 120,
      "totalPages": 10,
      "currentPage": 1,
      "hasNext": true,
      "hasPrev": false,
      "limit": 12
    }
  }
}
```

Legacy fallback (still used by some older responses):

```json
{
  "success": true,
  "gems": [ ... ],
  "pagination": { ... }
}
```

> The frontend looks for `response.data?.gems || response.gems`. Same for `pagination`.

Error format must follow the spec in `backend-gem-model-reference.md`.

---

## 5. Supporting Endpoints

| Endpoint | Purpose | Notes |
| --- | --- | --- |
| `GET /api/gems/categories` | Fetch list of categories | Should return `["Ruby","Sapphire",...]`. Frontend caches aggressively (10‑minute TTL). |
| `GET /api/gems/category/:category` | Category landing pages | Should support same pagination + filters if possible. Cached for 10 minutes. |
| `GET /api/gems/zodiac/:sign` | Zodiac-specific collections | Used by other pages; same schema as `/gems`. |
| `POST /api/gems` | Create gem | On success, return full gem object. Remember to invalidate category/zodiac caches. |
| `PUT /api/gems/:id` | Update gem | Return updated gem; backend should accept partial updates. |
| `DELETE /api/gems/:id` | Remove gem | Respond with `{ success: true }` and ensure downstream caches are cleared. |

---

## 6. Filter Troubleshooting Checklist

1. **Verify query params**: log the server-side query object and ensure every frontend parameter is read.
2. **Category match**: strings must match the canonical values (case-sensitive). Normalize using the taxonomy list.
3. **Price stored in INR**: the UI converts to other currencies on the client. Backend should not pre-convert.
4. **Pagination math**: always include `totalItems`, `totalPages`, `currentPage`, `hasNext`, `hasPrev`, `limit`. Frontend relies on these for `<Pagination />`.
5. **Null-safe fields**: if optional arrays are missing, return empty arrays instead of `null` to avoid UI guards.

---

## 7. Sample Filtered Requests

```http
GET /api/gems?category=Ruby,Sapphire&minPrice=5000&maxPrice=50000&sort=price-low&page=2&limit=12
```

```http
GET /api/gems?sort=price-high&birthMonth=January
```

---

Keep this document alongside backend changes so both teams stay aligned. Update it whenever you add new categories, filters, or schema fields. For questions, reach out to the frontend maintainers.

