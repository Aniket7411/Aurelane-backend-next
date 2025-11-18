# 🚀 Quick API Reference - Copy & Paste Ready

## Base URL: `https://gems-backend-zfpw.onrender.com/api`

---

## 🔥 **MOST IMPORTANT ENDPOINTS FOR YOUR PROJECT**

### 1. **GET ALL GEMS** (Public - No Token Required)
```
GET /gems
```

**Example with filters:**
```
GET /gems?page=1&limit=12&search=emerald&planet=Mercury&minPrice=1000&maxPrice=100000
```

**Response Format:**
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
      "planet": "Mercury (Budh)",
      "planetHindi": "बुध ग्रह",
      "color": "Green",
      "description": "Beautiful natural emerald with excellent clarity and color...",
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
      "heroImage": "https://res.cloudinary.com/defgskoxv/.../emerald.jpg",
      "additionalImages": ["https://res.cloudinary.com/.../emerald2.jpg"],
      "seller": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Raj Kumar Gems"
      },
      "createdAt": "2024-10-09T10:30:00.000Z",
      "updatedAt": "2024-10-09T10:30:00.000Z"
    }
  ]
}
```

---

### 2. **GET SINGLE GEM** (Public - No Token Required)
```
GET /gems/:id
```

**Example:**
```
GET /gems/507f1f77bcf86cd799439011
```

**Response Format:**
```json
{
  "success": true,
  "gem": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Emerald",
    "hindiName": "Panna (पन्ना)",
    "planet": "Mercury (Budh)",
    "planetHindi": "बुध ग्रह",
    "color": "Green",
    "description": "Detailed description...",
    "benefits": ["Benefit 1", "Benefit 2"],
    "suitableFor": ["Teachers", "Lawyers"],
    "price": 50000,
    "sizeWeight": 5.5,
    "sizeUnit": "carat",
    "stock": 10,
    "availability": true,
    "certification": "Govt. Lab Certified",
    "origin": "Sri Lanka",
    "deliveryDays": 7,
    "heroImage": "https://...",
    "additionalImages": ["https://..."],
    "seller": {
      "_id": "...",
      "name": "Seller Name",
      "email": "seller@example.com"
    },
    "createdAt": "2024-10-09T10:30:00.000Z",
    "updatedAt": "2024-10-09T10:30:00.000Z"
  }
}
```

---

### 3. **SIGNUP** (Public)
```
POST /auth/signup
```

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "buyer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439010",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "buyer"
  }
}
```

---

### 4. **LOGIN** (Public)
```
POST /auth/login
```

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439010",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91 9876543210",
    "role": "buyer"
  }
}
```

---

### 5. **ADD GEM** (Seller Only - Requires Token)
```
POST /gems
Headers: Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "Emerald",
  "hindiName": "Panna (पन्ना)",
  "planet": "Mercury (Budh)",
  "planetHindi": "बुध ग्रह",
  "color": "Green",
  "description": "Beautiful natural emerald with excellent clarity...",
  "benefits": ["Enhances intelligence", "Improves communication"],
  "suitableFor": ["Teachers", "Lawyers"],
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
    "https://res.cloudinary.com/defgskoxv/image/upload/v1234567890/gems/emerald_2.jpg"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Gem added successfully",
  "gem": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Emerald",
    "hindiName": "Panna (पन्ना)",
    "price": 50000,
    "heroImage": "https://res.cloudinary.com/.../emerald_hero.jpg",
    "seller": "507f1f77bcf86cd799439012",
    "createdAt": "2024-10-09T10:30:00.000Z"
  }
}
```

---

### 6. **GET MY GEMS** (Seller Only - Requires Token)
```
GET /gems/my-gems
Headers: Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "count": 15,
  "gems": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Emerald",
      "hindiName": "Panna (पन्ना)",
      "price": 50000,
      "stock": 10,
      "availability": true,
      "heroImage": "https://...",
      "seller": "507f1f77bcf86cd799439012",
      "createdAt": "2024-10-09T10:30:00.000Z"
    }
  ]
}
```

---

## 💡 **Frontend Implementation (JavaScript/Axios)**

```javascript
// api.js
import axios from 'axios';

const API_BASE_URL = 'https://gems-backend-zfpw.onrender.com/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Add token to all requests
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses
apiClient.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error);
    throw error;
  }
);

// API Methods
export const api = {
  // Auth
  signup: (data) => apiClient.post('/auth/signup', data),
  login: (data) => apiClient.post('/auth/login', data),
  getMe: () => apiClient.get('/auth/me'),
  
  // Gems (Public)
  getGems: (params) => apiClient.get('/gems', { params }),
  getGemById: (id) => apiClient.get(`/gems/${id}`),
  
  // Gems (Seller)
  addGem: (data) => apiClient.post('/gems', data),
  getMyGems: () => apiClient.get('/gems/my-gems'),
  updateGem: (id, data) => apiClient.put(`/gems/${id}`, data),
  deleteGem: (id) => apiClient.delete(`/gems/${id}`),
  
  // Cart (Buyer)
  addToCart: (gemId, quantity) => apiClient.post('/cart', { gemId, quantity }),
  getCart: () => apiClient.get('/cart'),
  updateCartItem: (itemId, quantity) => apiClient.put(`/cart/${itemId}`, { quantity }),
  removeFromCart: (itemId) => apiClient.delete(`/cart/${itemId}`),
  clearCart: () => apiClient.delete('/cart'),
  
  // Orders
  createOrder: (data) => apiClient.post('/orders', data),
  getMyOrders: (params) => apiClient.get('/orders/my-orders', { params }),
  getSellerOrders: () => apiClient.get('/orders/seller/orders'),
  cancelOrder: (id) => apiClient.put(`/orders/${id}/cancel`),
  
  // Seller Profile
  getSellerProfile: () => apiClient.get('/seller/profile'),
  updateSellerProfile: (data) => apiClient.put('/seller/profile', data),
  
  // User Profile
  getUserProfile: () => apiClient.get('/user/profile'),
  updateUserProfile: (data) => apiClient.put('/user/profile', data),
  
  // Admin
  getAllSellers: (params) => apiClient.get('/admin/sellers', { params }),
  getSellerDetails: (id) => apiClient.get(`/admin/sellers/${id}`),
  verifySeller: (id, isVerified) => apiClient.put(`/admin/sellers/${id}/verify`, { isVerified }),
  deleteSeller: (id) => apiClient.delete(`/admin/sellers/${id}`)
};
```

---

## ⚠️ **Common Issues & Solutions**

### **Issue 1: CORS Error**
✅ **Fixed** - Backend now allows `https://auralaneweb.vercel.app`

### **Issue 2: JWT Secret Error**
✅ **Solution** - Create `.env` file with `JWT_SECRET=your_secret_here`

### **Issue 3: MongoDB Connection Error**
✅ **Solution** - Whitelist 0.0.0.0/0 in MongoDB Atlas Network Access

### **Issue 4: Module Not Found (multer/nodemailer)**
✅ **Solution** - Run `npm install`

---

## 📞 **Support**

All endpoints are tested and working. If you have issues:
1. Check if server is running: `GET /api/health`
2. Verify token is valid: `GET /auth/me`
3. Check CORS is allowing your domain
4. Verify MongoDB connection is active

**Your backend is production-ready!** 🎉

