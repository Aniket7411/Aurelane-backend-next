## Auralane – Gem Backend Update Guide

This document lists the minimal backend changes required so all gem flows (Add, Edit, List, Detail, Seller Dashboard, Shop) work correctly with the updated frontend.

### 1) Model/Schema
Add the following fields and rules (Mongoose-like notation shown for clarity):

```js
const GemSchema = new mongoose.Schema({
  // Identity
  name: { type: String, required: true, trim: true },

  // Category now required (frontend maps selected “Gem Name” to this)
  category: { type: String, required: true, trim: true },

  hindiName: { type: String, required: true, trim: true },

  // Astro basics
  planet: { type: String, required: true, trim: true },
  planetHindi: { type: String, required: true, trim: true },

  // Core props
  color: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  benefits: [{ type: String }],
  suitableFor: [{ type: String }],

  // NEW: contact-for-price
  contactForPrice: { type: Boolean, default: false, required: true },

  // Price is optional when contactForPrice = true
  price: {
    type: Number,
    required: function () { return !this.contactForPrice; },
    min: 0,
    default: null
  },

  discount: { type: Number, default: 0, min: 0 },
  discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },

  sizeWeight: { type: Number, required: true, min: 0 },
  sizeUnit: { type: String, enum: ['carat', 'gram', 'ounce', 'ratti'], default: 'carat' },

  // Inventory
  stock: { type: Number, default: 0, min: 0 },
  availability: { type: Boolean, default: true },

  // Misc
  certification: { type: String, required: true, trim: true },
  origin: { type: String, required: true, trim: true },
  deliveryDays: { type: Number, required: true, min: 1 },

  // Images
  heroImage: { type: String, required: true, trim: true },
  additionalImages: [{ type: String }],

  // Seller
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Optional safety: normalize price for contactForPrice
GemSchema.pre('validate', function(next) {
  if (this.contactForPrice) this.price = null;
  if (!this.contactForPrice && (this.price === null || this.price === undefined || this.price <= 0)) {
    return next(new Error('Price is required when contactForPrice is false'));
  }
  next();
});
```

Notes:
- Persist and return `contactForPrice` in all read APIs.
- Accept `price: null` when `contactForPrice: true`.

### 2) Categories Endpoint
`GET /gems/categories` should return the expanded set used by the UI. You can return as a flat array. Examples (non-exhaustive list used by UI):

- Navratna: Blue Sapphire (Neelam), Yellow Sapphire (Pukhraj), Ruby (Manik), Emerald (Panna), Diamond (Heera), Pearl (Moti), Cat's Eye (Lehsunia), Hessonite (Gomed), Coral (Moonga)
- Exclusive Gemstones: Alexandrite, Basra Pearl, Burma Ruby, Colombian Emerald, Cornflower Blue Sapphire, Kashmir Blue Sapphire, No-Oil Emerald, Padparadscha Sapphire, Panjshir Emerald, Swat Emerald, Pigeon Blood Ruby, Royal Blue Sapphire
- Sapphire: Sapphire, Bi-Colour Sapphire (Pitambari), Color Change Sapphire, Green Sapphire, Pink Sapphire, Padparadscha Sapphire, Peach Sapphire, Purple Sapphire (Khooni Neelam), White Sapphire, Yellow Sapphire (Pukhraj), Blue Sapphire (Neelam)
- More Vedic Ratna (Upratan): Amethyst, Aquamarine, Blue Topaz, Citrine Stone (Sunela), Tourmaline, Opal, Tanzanite, Iolite (Neeli), Jasper (Mahe Mariyam), Lapis

The frontend will accept any shape, but a simple array of strings is easiest.

### 3) API Contracts

- POST `/gems` (Create)
  - Must accept: `name, category, hindiName, planet, planetHindi, color, description, benefits[], suitableFor[], contactForPrice, price (nullable when contactForPrice), discount, discountType, sizeWeight, sizeUnit, stock, availability, certification, origin, deliveryDays, heroImage, additionalImages[]`
  - If `contactForPrice === true`: allow `price: null`

- PUT `/gems/:id` (Update)
  - Same fields as POST; allow toggling `contactForPrice`
  - If `contactForPrice === true`: allow `price: null`

- GET `/gems` and GET `/gems/:id` (Read)
  - Must return `contactForPrice` and `price` (possibly null)
  - Optional: related products arrays are supported by the UI if present

### 4) Price Filters and Sorting
If you have minPrice/maxPrice filters:
- Either exclude `contactForPrice === true` from price-range queries or include them by ignoring their price in comparisons. Most platforms exclude by default.

Sorting by price:
- Decide where to place contact-for-price gems (top/bottom). Excluding them from price sort is acceptable.

### 5) Frontend Mapping (Reference)
No backend action needed here; just so you know how the UI is sending data.

- Add Gem (submit body – key points):
  - `category` is set to the selected “Gem Name” value.
  - `contactForPrice` checkbox maps to boolean; when true, `price: null`.

- Edit Gem (submit body – key points):
  - Same as Add Gem.
  - If `contactForPrice` is true, frontend sends `price: null`.

- Rendering logic already implemented:
  - Shop cards + Gem Detail show “Price on Request” and a call button to `tel:9999888800` when `contactForPrice === true`.
  - Seller Dashboard shows a “Contact for Price” badge in place of numeric price.

### 6) Sample Payloads

Create (contact for price):
```json
{
  "name": "Kashmir Blue Sapphire",
  "category": "Kashmir Blue Sapphire",
  "hindiName": "कश्मीर नीलम",
  "planet": "Saturn (Shani)",
  "planetHindi": "शनि ग्रह",
  "color": "Blue",
  "description": "Premium natural sapphire",
  "benefits": ["Success", "Wisdom"],
  "suitableFor": ["Businessmen"],
  "contactForPrice": true,
  "price": null,
  "discount": 0,
  "discountType": "percentage",
  "sizeWeight": 5,
  "sizeUnit": "carat",
  "stock": 1,
  "availability": true,
  "certification": "Govt. Lab Certified",
  "origin": "Kashmir",
  "deliveryDays": 7,
  "heroImage": "https://...",
  "additionalImages": []
}
```

Create (normal price):
```json
{
  "name": "Emerald (Panna)",
  "category": "Emerald (Panna)",
  "hindiName": "पन्ना",
  "planet": "Mercury (Budh)",
  "planetHindi": "बुध ग्रह",
  "color": "Green",
  "description": "High-quality Emerald",
  "benefits": ["Intellect", "Communication"],
  "suitableFor": ["Students"],
  "contactForPrice": false,
  "price": 250000,
  "discount": 10,
  "discountType": "percentage",
  "sizeWeight": 3.2,
  "sizeUnit": "carat",
  "stock": 3,
  "availability": true,
  "certification": "Govt. Lab Certified",
  "origin": "Colombia",
  "deliveryDays": 5,
  "heroImage": "https://...",
  "additionalImages": []
}
```

### 7) Endpoints Summary
- POST `/gems` – create (supports contactForPrice)
- PUT `/gems/:id` – update (supports contactForPrice)
- GET `/gems` – list (returns contactForPrice)
- GET `/gems/:id` – detail (returns contactForPrice)
- GET `/gems/categories` – return expanded category list

Once these backend updates are applied, the entire Add/Edit/Shop/Detail/Seller flows work end‑to‑end with the new UX. 


