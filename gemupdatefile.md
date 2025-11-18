## Backend Update Guide for Gems

This guide lists the backend changes needed to support:
- Full category set (Navratna, Exclusive Gemstones, Sapphire variants, More Vedic Ratna)
- “Contact for Price” flow (no price stored; show a dialer button on frontend)

### 1) Schema changes
Add a boolean flag and relax `price` when the flag is true.

Example (Mongoose-like):

```js
const GemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  hindiName: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  planet: { type: String, required: true },
  planetHindi: { type: String, required: true },
  color: { type: String, required: true },
  description: { type: String, required: true },
  benefits: [{ type: String }],
  suitableFor: [{ type: String }],

  // NEW: Contact-for-price flag
  contactForPrice: { type: Boolean, required: true, default: false },

  // Price is optional when contactForPrice is true
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

  stock: { type: Number, default: 0, min: 0 },
  availability: { type: Boolean, default: true },
  certification: { type: String, required: true },
  origin: { type: String, required: true },
  deliveryDays: { type: Number, required: true, min: 1 },

  heroImage: { type: String, required: true },
  additionalImages: [{ type: String }],

  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Optional extra safety:
GemSchema.pre('validate', function (next) {
  if (this.contactForPrice) this.price = null;
  if (!this.contactForPrice && (!this.price || this.price <= 0)) {
    return next(new Error('Price is required when contactForPrice is false'));
  }
  next();
});
```

Notes:
- Persist and return `contactForPrice` in all API responses.
- Allow `price: null` when `contactForPrice: true`.

### 2) Categories endpoint
Update `/gems/categories` to return the following list:

- Navratna
  - Blue Sapphire (Neelam)
  - Yellow Sapphire (Pukhraj)
  - Ruby (Manik)
  - Emerald (Panna)
  - Diamond (Heera)
  - Pearl (Moti)
  - Cat's Eye (Lehsunia)
  - Hessonite (Gomed)
  - Coral (Moonga)

- Exclusive Gemstones
  - Alexandrite
  - Basra Pearl
  - Burma Ruby
  - Colombian Emerald
  - Cornflower Blue Sapphire
  - Kashmir Blue Sapphire
  - No-Oil Emerald
  - Padparadscha Sapphire
  - Panjshir Emerald
  - Swat Emerald
  - Pigeon Blood Ruby
  - Royal Blue Sapphire

- Sapphire
  - Sapphire
  - Bi-Colour Sapphire (Pitambari)
  - Color Change Sapphire
  - Green Sapphire
  - Pink Sapphire
  - Padparadscha Sapphire
  - Peach Sapphire
  - Purple Sapphire (Khooni Neelam)
  - White Sapphire
  - Yellow Sapphire (Pukhraj)

- More Vedic Ratna (Upratan)
  - Amethyst
  - Aquamarine
  - Blue Topaz
  - Citrine Stone (Sunela)
  - Tourmaline
  - Opal
  - Tanzanite
  - Iolite (Neeli)
  - Jasper (Mahe Mariyam)
  - Lapis

Implementation options:
- Return as a flat array (simpler) or structured by groups.
- Frontend `Shop.js` reads from this endpoint, so ensure it returns the updated set.

### 3) API changes
Ensure these endpoints accept/return the new field:

- POST `/gems`
  - Accept `contactForPrice: boolean`
  - If true: allow `price: null`

- PUT `/gems/:id`
  - Accept updates to `contactForPrice` and `price`
  - Same validations as POST

- GET `/gems` and GET `/gems/:id`
  - Return `contactForPrice` in each gem
  - Return `price: null` (when contactForPrice is true)

### 4) Filters and sorting
If you have price filters (`minPrice`, `maxPrice`):
- Option A: Exclude `contactForPrice=true` gems from price filter results
- Option B: Include them but don’t count them in range checks (most common is Option A)

Sorting:
- When sorting by price, decide where `contactForPrice` gems appear (e.g., bottom).

### 5) Seller’s end
- Responses that power seller pages should include `contactForPrice`
- Frontend already shows a “Contact for Price” badge in place of a numeric price

### 6) Frontend status (already implemented)
- AddGem: checkbox to mark “Contact for Price”, price disabled, sent as `null`
- EditGem: supports toggling “Contact for Price”
- Shop (cards): shows “Contact for Price” button that dials `9999888800`
- Gem detail: shows “Price on Request” + call button
- Seller dashboard: badge for “Contact for Price”

### 7) Sample payloads

Create (contact for price):
```json
{
  "name": "Kashmir Blue Sapphire",
  "hindiName": "कश्मीर नीलम",
  "category": "Kashmir Blue Sapphire",
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
  "hindiName": "पन्ना",
  "category": "Emerald (Panna)",
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

---

Once the above changes are applied on the backend, the frontend is already compatible and will reflect the new behavior automatically.


