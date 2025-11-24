# Product Update - 24 Nov 2025

## Summary
The storefront UI now treats every gem as `Category → Subcategory → Name`. Sellers must capture all
three values while adding or editing inventory, and shoppers can filter by category/subcategory as
well as by free-text name search.

## Backend Changes Required

1. **Gem schema**
   - Add a required `subcategory` string field (e.g., `Burma Ruby`).
   - Keep `category` as a required field (e.g., `Ruby`).
   - Ensure both fields are returned in all gem payloads (`GET /gems`, `/gems/:id`, related items, etc.).

2. **Create / Update APIs**
   - `POST /gems` and `PUT /gems/:id` now send both `category` and `subcategory`. Persist and validate them.
   - Continue returning `category`/`subcategory` in the response body so the UI can reflect saved values.

3. **Listing & filtering**
   - `GET /gems` receives an optional `subcategory` query parameter (string). Apply it alongside existing
     filters (category, price, search, birthMonth, etc.).
   - When filtering by multiple categories (comma-separated), the subcategory filter should still narrow
     results.

4. **Ancillary endpoints**
   - Any endpoint that returns gem summaries (wishlist items, related products, seller dashboards, etc.)
     should include `subcategory` so the UI can keep showing the new hierarchy everywhere.

## Optional / Future Enhancements

- Expose available subcategories per category via `/gems/categories` (or a new endpoint) so the UI can
  stop relying on its local suggestion list.
- Support a `sort=name-asc` / `sort=name-desc` mode in `GET /gems` so alphabetical ordering can be
  delegated to the backend when needed.

