# 💎 Gem API Endpoints - Complete Guide

## 🌐 Base URL
```
Production: https://gems-backend-zfpw.onrender.com/api
Local: http://localhost:5000/api
```

---

## 1️⃣ **ADD NEW GEM** (Seller Only)

### **Endpoint:**
```
POST /gems
```

### **Headers:**
```
Authorization: Bearer <your_seller_token>
Content-Type: application/json
```

### **Request Body (Complete Example):**
```json
{
  "name": "Emerald",
  "hindiName": "Panna (पन्ना)",
  "planet": "Mercury (Budh Grah)",
  "planetHindi": "बुध ग्रह",
  "color": "Green",
  "description": "Beautiful natural emerald with excellent clarity and vibrant green color. Perfect for Mercury strengthening and enhancing intelligence.",
  "benefits": [
    "Enhances intelligence and communication skills",
    "Improves business acumen and analytical ability",
    "Brings mental clarity and focus",
    "Strengthens Mercury planet in horoscope"
  ],
  "suitableFor": [
    "Teachers",
    "Lawyers",
    "Writers",
    "Media professionals",
    "Business people",
    "Students"
  ],
  "price": 50000,
  "sizeWeight": 5.5,
  "sizeUnit": "carat",
  "stock": 10,
  "availability": true,
  "certification": "Govt. Lab Certified",
  "origin": "Sri Lanka",
  "deliveryDays": 7,
  "heroImage": "https://res.cloudinary.com/defgskoxv/image/upload/v1234567890/gems/emerald_hero.jpg",
  "additionalImages": [
    "https://res.cloudinary.com/defgskoxv/image/upload/v1234567890/gems/emerald_1.jpg",
    "https://res.cloudinary.com/defgskoxv/image/upload/v1234567890/gems/emerald_2.jpg",
    "https://res.cloudinary.com/defgskoxv/image/upload/v1234567890/gems/emerald_3.jpg"
  ]
}
```

### **Required Fields:**
✅ `name` - Gem name (String)
✅ `hindiName` - Hindi name (String)
✅ `planet` - Associated planet (String)
✅ `color` - Gem color (String)
✅ `description` - Detailed description (String)
✅ `benefits` - Array of benefits (Array of Strings, min 1)
✅ `suitableFor` - Suitable professions (Array of Strings, min 1)
✅ `price` - Price in rupees (Number, positive)
✅ `sizeWeight` - Weight value (Number, positive)
✅ `sizeUnit` - Unit (String: "carat", "gram", or "ounce")
✅ `certification` - Certification info (String)
✅ `origin` - Country of origin (String)
✅ `deliveryDays` - Delivery time (Number, min 1)
✅ `heroImage` - Main image URL (String)

### **Optional Fields:**
- `planetHindi` - Hindi planet name
- `stock` - Available quantity (defaults to 0)
- `availability` - Is available (defaults to true)
- `additionalImages` - More images (Array of Strings)

### **Success Response (201):**
```json
{
  "success": true,
  "message": "Gem added successfully",
  "gem": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Emerald",
    "hindiName": "Panna (पन्ना)",
    "price": 50000,
    "heroImage": "https://res.cloudinary.com/defgskoxv/.../emerald_hero.jpg",
    "seller": "507f1f77bcf86cd799439012",
    "createdAt": "2024-10-09T10:30:00.000Z"
  }
}
```

### **Error Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Name is required",
      "param": "name",
      "location": "body"
    }
  ]
}
```

### **Error Response (403):**
```json
{
  "success": false,
  "message": "Access denied. seller role required."
}
```

---

## 2️⃣ **GET ALL GEMS** (Public)

### **Endpoint:**
```
GET /gems
```

### **No Authentication Required** ✅

### **Query Parameters (All Optional):**
```
?page=1              // Page number (default: 1)
&limit=12            // Items per page (default: 12)
&search=emerald      // Search in name, hindiName, description
&planet=Mercury      // Filter by planet
&minPrice=1000       // Minimum price
&maxPrice=100000     // Maximum price
&availability=true   // Filter by availability
```

### **Example Request:**
```
GET /gems?page=1&limit=12&planet=Mercury&minPrice=10000&maxPrice=100000
```

### **Success Response (200):**
```json
{
  "success": true,
  "count": 45,
  "totalPages": 4,
  "currentPage": 1,
  "gems": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Emerald",
      "hindiName": "Panna (पन्ना)",
      "planet": "Mercury (Budh Grah)",
      "planetHindi": "बुध ग्रह",
      "color": "Green",
      "description": "Beautiful natural emerald...",
      "benefits": ["Enhances intelligence", "Improves communication"],
      "suitableFor": ["Teachers", "Lawyers", "Writers"],
      "price": 50000,
      "sizeWeight": 5.5,
      "sizeUnit": "carat",
      "stock": 10,
      "availability": true,
      "certification": "Govt. Lab Certified",
      "origin": "Sri Lanka",
      "deliveryDays": 7,
      "heroImage": "https://res.cloudinary.com/.../emerald_hero.jpg",
      "additionalImages": ["https://res.cloudinary.com/.../emerald_1.jpg"],
      "seller": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Raj Kumar Gems"
      },
      "createdAt": "2024-10-09T10:30:00.000Z",
      "updatedAt": "2024-10-09T10:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439021",
      "name": "Ruby",
      "hindiName": "Manik (माणिक)",
      "planet": "Sun (Surya)",
      "planetHindi": "सूर्य",
      "color": "Red",
      "description": "Premium quality ruby...",
      "benefits": ["Boosts confidence", "Enhances leadership"],
      "suitableFor": ["Leaders", "Politicians", "Managers"],
      "price": 75000,
      "sizeWeight": 4.2,
      "sizeUnit": "carat",
      "stock": 5,
      "availability": true,
      "certification": "GIA Certified",
      "origin": "Myanmar",
      "deliveryDays": 5,
      "heroImage": "https://res.cloudinary.com/.../ruby_hero.jpg",
      "additionalImages": ["https://res.cloudinary.com/.../ruby_1.jpg"],
      "seller": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Raj Kumar Gems"
      },
      "createdAt": "2024-10-08T10:30:00.000Z",
      "updatedAt": "2024-10-08T10:30:00.000Z"
    }
  ]
}
```

---

## 3️⃣ **GET SELLER'S GEMS** (Seller Only)

### **Endpoint:**
```
GET /gems/my-gems
```

### **Headers:**
```
Authorization: Bearer <your_seller_token>
```

### **Success Response (200):**
```json
{
  "success": true,
  "count": 15,
  "gems": [
    // Array of all gems posted by this seller
    // Same structure as GET ALL GEMS
  ]
}
```

---

## 4️⃣ **UPDATE GEM** (Seller Only - Own Gems)

### **Endpoint:**
```
PUT /gems/:id
```

### **Headers:**
```
Authorization: Bearer <your_seller_token>
```

### **Request Body (All fields optional):**
```json
{
  "price": 55000,
  "stock": 8,
  "availability": true,
  "description": "Updated description..."
}
```

### **Success Response (200):**
```json
{
  "success": true,
  "message": "Gem updated successfully",
  "gem": {
    // Updated gem object
  }
}
```

---

## 5️⃣ **DELETE GEM** (Seller Only - Own Gems)

### **Endpoint:**
```
DELETE /gems/:id
```

### **Headers:**
```
Authorization: Bearer <your_seller_token>
```

### **Success Response (200):**
```json
{
  "success": true,
  "message": "Gem deleted successfully"
}
```

---

## 📋 **Field Descriptions**

### **Gem Fields:**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `name` | String | ✅ | English gem name | "Emerald" |
| `hindiName` | String | ✅ | Hindi name with transliteration | "Panna (पन्ना)" |
| `planet` | String | ✅ | Associated planet (English) | "Mercury (Budh Grah)" |
| `planetHindi` | String | ❌ | Planet in Hindi | "बुध ग्रह" |
| `color` | String | ✅ | Gem color | "Green" |
| `description` | String | ✅ | Detailed description | "Beautiful natural emerald..." |
| `benefits` | Array | ✅ | List of benefits | ["Enhances intelligence", ...] |
| `suitableFor` | Array | ✅ | Suitable professions | ["Teachers", "Lawyers"] |
| `price` | Number | ✅ | Price in INR | 50000 |
| `sizeWeight` | Number | ✅ | Weight value | 5.5 |
| `sizeUnit` | String | ✅ | Unit ("carat"/"gram"/"ounce") | "carat" |
| `stock` | Number | ❌ | Available quantity | 10 |
| `availability` | Boolean | ❌ | Is available for sale | true |
| `certification` | String | ✅ | Certification details | "Govt. Lab Certified" |
| `origin` | String | ✅ | Country of origin | "Sri Lanka" |
| `deliveryDays` | Number | ✅ | Expected delivery days | 7 |
| `heroImage` | String | ✅ | Main display image URL | "https://..." |
| `additionalImages` | Array | ❌ | Additional image URLs | ["https://...", ...] |

---

## 🧪 **Testing Examples**

### **Using cURL:**

```bash
# 1. Login as seller
curl -X POST https://gems-backend-zfpw.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seller@test.com","password":"123456"}'

# Save the token from response

# 2. Add a gem
curl -X POST https://gems-backend-zfpw.onrender.com/api/gems \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Emerald",
    "hindiName":"Panna",
    "planet":"Mercury",
    "color":"Green",
    "description":"Beautiful gem",
    "benefits":["Intelligence"],
    "suitableFor":["Teachers"],
    "price":50000,
    "sizeWeight":5.5,
    "sizeUnit":"carat",
    "certification":"Certified",
    "origin":"Sri Lanka",
    "deliveryDays":7,
    "heroImage":"https://example.com/image.jpg"
  }'

# 3. Get all gems (no token needed)
curl https://gems-backend-zfpw.onrender.com/api/gems

# 4. Get single gem (no token needed)
curl https://gems-backend-zfpw.onrender.com/api/gems/GEM_ID_HERE

# 5. Get my gems (seller only)
curl https://gems-backend-zfpw.onrender.com/api/gems/my-gems \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## ✅ **What Your Frontend Receives**

### **When you call GET /gems:**
You get an array of gem objects with:
- All gem details (name, price, description, etc.)
- `heroImage` for display
- `seller.name` - who's selling it
- `availability` and `stock` - to show if available
- `deliveryDays` - to show delivery time

### **When you call POST /gems:**
You send the gem data and get back:
- Confirmation of creation
- The created gem's ID
- Timestamp of creation

---

## 🎯 **Frontend Usage Example**

```javascript
// In your React component

// Get all gems
const fetchGems = async () => {
  try {
    const response = await api.getGems({ page: 1, limit: 12 });
    console.log(response.gems); // Array of gems
    setGems(response.gems);
    setTotalPages(response.totalPages);
  } catch (error) {
    console.error('Error fetching gems:', error);
  }
};

// Add new gem (seller)
const addNewGem = async (gemData) => {
  try {
    const response = await api.addGem(gemData);
    alert(response.message); // "Gem added successfully"
    navigate('/seller/dashboard');
  } catch (error) {
    console.error('Error adding gem:', error);
  }
};

// Get single gem
const fetchGemDetails = async (gemId) => {
  try {
    const response = await api.getGemById(gemId);
    console.log(response.gem); // Complete gem object
    setGem(response.gem);
  } catch (error) {
    console.error('Error fetching gem:', error);
  }
};
```

---

## 📊 **Gem Schema Summary**

```javascript
{
  // Basic Info
  name: "Emerald",
  hindiName: "Panna (पन्ना)",
  planet: "Mercury (Budh Grah)",
  planetHindi: "बुध ग्रह",
  color: "Green",
  
  // Description
  description: "Detailed description text...",
  benefits: ["Benefit 1", "Benefit 2", "Benefit 3"],
  suitableFor: ["Profession 1", "Profession 2"],
  
  // Pricing & Stock
  price: 50000,
  sizeWeight: 5.5,
  sizeUnit: "carat",
  stock: 10,
  availability: true,
  
  // Verification
  certification: "Govt. Lab Certified",
  origin: "Sri Lanka",
  
  // Delivery
  deliveryDays: 7,
  
  // Images (Cloudinary URLs)
  heroImage: "https://res.cloudinary.com/.../image.jpg",
  additionalImages: ["https://...jpg", "https://...jpg"],
  
  // Auto-filled
  seller: ObjectId,  // Auto-filled from JWT token
  createdAt: Date,   // Auto-filled
  updatedAt: Date    // Auto-filled
}
```

---

## 🎨 **Image Upload Guide**

### **For Cloudinary:**
1. Upload image to Cloudinary first
2. Get the image URL from Cloudinary
3. Use that URL in `heroImage` and `additionalImages` fields

### **Example Cloudinary URLs:**
```
https://res.cloudinary.com/defgskoxv/image/upload/v1234567890/gems/emerald.jpg
https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/folder/image.jpg
```

---

## 🔑 **Authorization**

### **How to Get Token:**
1. Login or signup
2. Save the `token` from response
3. Include in all protected requests

### **Example:**
```javascript
// After login
const response = await api.login({ email, password });
localStorage.setItem('token', response.token);

// For protected requests
// Token is automatically added by axios interceptor
```

---

## ⚡ **Quick Test**

### **Test GET ALL GEMS (No Auth Required):**
```
Open in browser:
https://gems-backend-zfpw.onrender.com/api/gems

You should see:
{
  "success": true,
  "count": 0,  // or number of gems
  "totalPages": 0,
  "currentPage": 1,
  "gems": []  // array of gems
}
```

### **Test Health Check:**
```
https://gems-backend-zfpw.onrender.com/api/health

You should see:
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-10-09T10:30:00.000Z"
}
```

---

## 📝 **Complete Workflow**

### **For Sellers:**
1. Signup as seller: `POST /auth/signup` (role: "seller")
2. Login: `POST /auth/login`
3. Add gem: `POST /gems` (with token)
4. View my gems: `GET /gems/my-gems` (with token)
5. Update profile: `PUT /seller/profile` (with token)
6. View orders: `GET /orders/seller/orders` (with token)

### **For Buyers:**
1. Browse gems: `GET /gems` (no token)
2. View gem details: `GET /gems/:id` (no token)
3. Signup/Login: `POST /auth/signup` or `/auth/login`
4. Add to cart: `POST /cart` (with token)
5. Checkout: `POST /orders` (with token)
6. View orders: `GET /orders/my-orders` (with token)

---

## 🎉 **YOU'RE ALL SET!**

**Main Endpoints to Use:**
- **GET /gems** - Fetch all gems for display
- **POST /gems** - Add new gem (seller)
- **GET /gems/:id** - Get single gem details

These endpoints match the `newbackendendpoints.md` specification exactly and are ready for production use! 🚀

