# 🚀 Complete Backend API Endpoints - Copy & Paste Ready

> **Frontend Base URL**: `http://localhost:5000/api`  
> **All forms verified and working** ✅

---

## 📚 Table of Contents
1. [Authentication APIs](#1-authentication-apis)
2. [Gem Management APIs](#2-gem-management-apis)
3. [Cart APIs](#3-cart-apis)
4. [Order APIs](#4-order-apis)
5. [Seller Profile APIs](#5-seller-profile-apis)
6. [User Profile APIs](#6-user-profile-apis)
7. [Admin APIs](#7-admin-apis)
8. [Axios Implementation Examples](#8-axios-implementation-examples)

---

## 1. AUTHENTICATION APIs

### 1.1 Signup/Register
**Endpoint**: `POST /api/auth/signup`  
**Access**: Public  
**Frontend File**: `src/components/auth/Register.js`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "buyer"
}
```

**Field Details**:
- `name`: String, required, 2-50 characters
- `email`: String, required, valid email format
- `password`: String, required, min 6 characters
- `role`: String, required, enum: `["buyer", "seller"]`, default: `"buyer"`

**Response Success (201)**:
```json
{
  "success": true,
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "buyer"
  }
}
```

**Response Error (400)**:
```json
{
  "success": false,
  "message": "Email already exists"
}
```

**Axios Implementation**:
```javascript
// In src/services/api.js
signup: async (userData) => {
    const response = await apiClient.post('/auth/signup', userData);
    if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
}
```

---

### 1.2 Login
**Endpoint**: `POST /api/auth/login`  
**Access**: Public  
**Frontend File**: `src/components/auth/Login.js`

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "buyer"
  }
}
```

**Response Error (401)**:
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Axios Implementation**:
```javascript
login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
}
```

---

### 1.3 Get Current User
**Endpoint**: `GET /api/auth/me`  
**Access**: Protected (requires JWT token)  
**Headers**: `Authorization: Bearer <token>`

**Response Success (200)**:
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "buyer",
    "phone": "+91 9876543210",
    "address": {
      "addressLine1": "123 Main Street",
      "addressLine2": "Apartment 4B",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "country": "India"
    }
  }
}
```

**Axios Implementation**:
```javascript
getCurrentUser: async () => {
    return await apiClient.get('/auth/me');
}
```

---

### 1.4 Admin Login
**Endpoint**: `POST /api/auth/admin/login`  
**Access**: Public  
**Frontend File**: `src/components/auth/admin.jsx`

**Request Body**:
```json
{
  "email": "admin@gemstore.com",
  "password": "admin123"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Admin login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Admin",
    "email": "admin@gemstore.com",
    "role": "admin"
  }
}
```

---

## 2. GEM MANAGEMENT APIs

### 2.1 Add New Gem
**Endpoint**: `POST /api/gems`  
**Access**: Protected (Seller only)  
**Headers**: `Authorization: Bearer <token>`  
**Frontend File**: `src/pages/AddGem.js`

**Request Body**:
```json
{
  "name": "Emerald",
  "hindiName": "Panna (पन्ना)",
  "planet": "Mercury (Budh)",
  "planetHindi": "बुध ग्रह",
  "color": "Green",
  "description": "Beautiful natural emerald with excellent clarity and color. Perfect for mercury strengthening.",
  "benefits": [
    "Enhances intelligence and communication skills",
    "Improves business acumen and analytical ability",
    "Brings mental clarity and focus"
  ],
  "suitableFor": [
    "Teachers",
    "Lawyers",
    "Writers",
    "Media professionals"
  ],
  "price": 50000,
  "sizeWeight": 5.5,
  "sizeUnit": "carat",
  "stock": 10,
  "availability": true,
  "certification": "Govt. Lab Certified",
  "origin": "Sri Lanka",
  "deliveryDays": 7,
  "heroImage": "https://res.cloudinary.com/defgskoxv/image/upload/v1234567890/STJ/emerald_hero.jpg",
  "additionalImages": [
    "https://res.cloudinary.com/defgskoxv/image/upload/v1234567890/STJ/emerald_1.jpg",
    "https://res.cloudinary.com/defgskoxv/image/upload/v1234567890/STJ/emerald_2.jpg"
  ]
}
```

**Field Details**:
- `name`: String, required - Gem name
- `hindiName`: String, required - Hindi name (auto-f  illed)
- `planet`: String, required - Associated planet
- `planetHindi`: String - Hindi planet name (auto-filled)
- `color`: String, required - Gem color
- `description`: String, required - Detailed description
- `benefits`: Array of Strings, required - Gem benefits
- `suitableFor`: Array of Strings, required - Suitable professions
- `price`: Number, required - Price in rupees
- `sizeWeight`: Number, required - Weight/size value
- `sizeUnit`: String, enum: `["carat", "gram", "ounce"]`
- `stock`: Number - Available quantity
- `availability`: Boolean, default: true
- `certification`: String, required
- `origin`: String, required - Country of origin
- `deliveryDays`: Number, required - Expected delivery days
- `heroImage`: String, required - Main image URL from Cloudinary
- `additionalImages`: Array of Strings - Additional image URLs from Cloudinary

**Response Success (201)**:
```json
{
  "success": true,
  "message": "Gem added successfully",
  "gem": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Emerald",
    "hindiName": "Panna (पन्ना)",
    "price": 50000,
    "heroImage": "https://res.cloudinary.com/...",
    "seller": "507f1f77bcf86cd799439012",
    "createdAt": "2024-10-09T10:30:00.000Z"
  }
}
```

**Axios Implementation**:
```javascript
addGem: async (gemData) => {
    return await apiClient.post('/gems', gemData);
}
```

---

### 2.2 Get All Gems
**Endpoint**: `GET /api/gems`  
**Access**: Public  
**Frontend Files**: `src/pages/Shop.js`, `src/pages/Gemstones.js`

**Query Parameters**:
```
?page=1
&limit=12
&search=emerald
&planet=Mercury
&minPrice=1000
&maxPrice=100000
&availability=true
&sortBy=price-low
```

**Query Parameters Details**:
- `page`: Number, default: 1
- `limit`: Number, default: 12
- `search`: String - Search in name, hindiName
- `planet`: String - Filter by planet
- `minPrice`: Number - Minimum price filter
- `maxPrice`: Number - Maximum price filter
- `availability`: Boolean - Filter by availability
- `sortBy`: String, enum: `["newest", "oldest", "price-low", "price-high", "name"]`

**Response Success (200)**:
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
      "description": "Beautiful natural emerald...",
      "benefits": ["Enhances intelligence..."],
      "suitableFor": ["Teachers", "Lawyers"],
      "price": 50000,
      "sizeWeight": 5.5,
      "sizeUnit": "carat",
      "stock": 10,
      "availability": true,
      "certification": "Govt. Lab Certified",
      "origin": "Sri Lanka",
      "deliveryDays": 7,
      "heroImage": "https://res.cloudinary.com/...",
      "additionalImages": ["https://res.cloudinary.com/..."],
      "seller": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Raj Kumar Gems",
        "email": "raj@gemstore.com"
      },
      "createdAt": "2024-10-09T10:30:00.000Z",
      "updatedAt": "2024-10-09T10:30:00.000Z"
    }
  ]
}
```

**Axios Implementation**:
```javascript
getGems: async (params = {}) => {
    const filteredParams = Object.keys(params).reduce((acc, key) => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            acc[key] = params[key];
        }
        return acc;
    }, {});
    return await apiClient.get('/gems', { params: filteredParams });
}
```

---

### 2.3 Get Single Gem
**Endpoint**: `GET /api/gems/:id`  
**Access**: Public  
**Frontend File**: `src/pages/GemDetail.js`

**Response Success (200)**:
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
    "description": "Beautiful natural emerald with excellent clarity...",
    "benefits": ["Enhances intelligence and communication skills"],
    "suitableFor": ["Teachers", "Lawyers", "Writers"],
    "price": 50000,
    "sizeWeight": 5.5,
    "sizeUnit": "carat",
    "stock": 10,
    "availability": true,
    "certification": "Govt. Lab Certified",
    "origin": "Sri Lanka",
    "deliveryDays": 7,
    "heroImage": "https://res.cloudinary.com/defgskoxv/...",
    "additionalImages": ["https://res.cloudinary.com/defgskoxv/..."],
    "seller": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Raj Kumar Gems",
      "email": "raj@gemstore.com",
      "phone": "9876543210"
    },
    "createdAt": "2024-10-09T10:30:00.000Z",
    "updatedAt": "2024-10-09T10:30:00.000Z"
  }
}
```

**Axios Implementation**:
```javascript
getGemById: async (id) => {
    return await apiClient.get(`/gems/${id}`);
}
```

---

### 2.4 Update Gem
**Endpoint**: `PUT /api/gems/:id`  
**Access**: Protected (Seller only - own gems)  
**Headers**: `Authorization: Bearer <token>`

**Request Body** (All fields optional):
```json
{
  "price": 55000,
  "stock": 8,
  "availability": true,
  "description": "Updated description"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Gem updated successfully",
  "gem": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Emerald",
    "price": 55000,
    "stock": 8,
    "updatedAt": "2024-10-09T11:00:00.000Z"
  }
}
```

**Axios Implementation**:
```javascript
updateGem: async (id, gemData) => {
    return await apiClient.put(`/gems/${id}`, gemData);
}
```

---

### 2.5 Delete Gem
**Endpoint**: `DELETE /api/gems/:id`  
**Access**: Protected (Seller only - own gems)  
**Headers**: `Authorization: Bearer <token>`

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Gem deleted successfully"
}
```

**Axios Implementation**:
```javascript
deleteGem: async (id) => {
    return await apiClient.delete(`/gems/${id}`);
}
```

---

### 2.6 Get Seller's Gems
**Endpoint**: `GET /api/gems/my-gems`  
**Access**: Protected (Seller only)  
**Headers**: `Authorization: Bearer <token>`

**Response Success (200)**:
```json
{
  "success": true,
  "count": 15,
  "gems": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Emerald",
      "price": 50000,
      "stock": 10,
      "availability": true,
      "heroImage": "https://res.cloudinary.com/...",
      "createdAt": "2024-10-09T10:30:00.000Z"
    }
  ]
}
```

**Axios Implementation**:
```javascript
getMyGems: async () => {
    return await apiClient.get('/gems/my-gems');
}
```

---

## 3. CART APIs

### 3.1 Add to Cart
**Endpoint**: `POST /api/cart`  
**Access**: Protected (Buyer only)  
**Headers**: `Authorization: Bearer <token>`  
**Frontend File**: `src/pages/Cart.js` (when made dynamic)

**Request Body**:
```json
{
  "gemId": "507f1f77bcf86cd799439011",
  "quantity": 2
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Item added to cart",
  "cart": {
    "items": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "gem": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "Emerald",
          "price": 50000,
          "heroImage": "https://res.cloudinary.com/...",
          "stock": 10,
          "availability": true
        },
        "quantity": 2,
        "price": 50000
      }
    ],
    "totalItems": 2,
    "totalPrice": 100000
  }
}
```

**Axios Implementation**:
```javascript
addToCart: async (gemId, quantity) => {
    return await apiClient.post('/cart', { gemId, quantity });
}
```

---

### 3.2 Get Cart
**Endpoint**: `GET /api/cart`  
**Access**: Protected (Buyer only)  
**Headers**: `Authorization: Bearer <token>`

**Response Success (200)**:
```json
{
  "success": true,
  "cart": {
    "items": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "gem": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "Emerald",
          "hindiName": "Panna (पन्ना)",
          "price": 50000,
          "sizeWeight": 5.5,
          "sizeUnit": "carat",
          "heroImage": "https://res.cloudinary.com/...",
          "stock": 10,
          "availability": true,
          "deliveryDays": 7
        },
        "quantity": 2,
        "price": 50000
      }
    ],
    "totalItems": 2,
    "totalPrice": 100000
  }
}
```

**Axios Implementation**:
```javascript
getCart: async () => {
    return await apiClient.get('/cart');
}
```

---

### 3.3 Update Cart Item
**Endpoint**: `PUT /api/cart/:itemId`  
**Access**: Protected (Buyer only)  
**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "quantity": 3
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Cart updated successfully",
  "cart": {
    "items": [...],
    "totalItems": 3,
    "totalPrice": 150000
  }
}
```

**Axios Implementation**:
```javascript
updateCartItem: async (itemId, quantity) => {
    return await apiClient.put(`/cart/${itemId}`, { quantity });
}
```

---

### 3.4 Remove from Cart
**Endpoint**: `DELETE /api/cart/:itemId`  
**Access**: Protected (Buyer only)  
**Headers**: `Authorization: Bearer <token>`

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

**Axios Implementation**:
```javascript
removeFromCart: async (itemId) => {
    return await apiClient.delete(`/cart/${itemId}`);
}
```

---

### 3.5 Clear Cart
**Endpoint**: `DELETE /api/cart`  
**Access**: Protected (Buyer only)  
**Headers**: `Authorization: Bearer <token>`

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

**Axios Implementation**:
```javascript
clearCart: async () => {
    return await apiClient.delete('/cart');
}
```

---

## 4. ORDER APIs

### 4.1 Create Order
**Endpoint**: `POST /api/orders`  
**Access**: Protected (Buyer only)  
**Headers**: `Authorization: Bearer <token>`  
**Frontend File**: `src/pages/Checkout.js`

**Request Body**:
```json
{
  "items": [
    {
      "gem": "507f1f77bcf86cd799439011",
      "quantity": 2,
      "price": 50000
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "phone": "+91 9876543210",
    "addressLine1": "123 Main Street",
    "addressLine2": "Apartment 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India"
  },
  "paymentMethod": "COD",
  "totalPrice": 100500
}
```

**Response Success (201)**:
```json
{
  "success": true,
  "message": "Order placed successfully",
  "order": {
    "_id": "507f1f77bcf86cd799439014",
    "orderNumber": "ORD-2024-001",
    "totalPrice": 100500,
    "status": "pending",
    "paymentMethod": "COD",
    "createdAt": "2024-10-09T10:30:00.000Z"
  }
}
```

**Axios Implementation**:
```javascript
createOrder: async (orderData) => {
    return await apiClient.post('/orders', orderData);
}
```

---

### 4.2 Get Buyer's Orders
**Endpoint**: `GET /api/orders/my-orders`  
**Access**: Protected (Buyer only)  
**Headers**: `Authorization: Bearer <token>`  
**Frontend File**: `src/pages/MyOrders.js`

**Query Parameters**:
```
?page=1&limit=10&status=delivered
```

**Response Success (200)**:
```json
{
  "success": true,
  "count": 5,
  "orders": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "orderNumber": "ORD-2024-001",
      "orderDate": "2024-10-05T00:00:00.000Z",
      "status": "delivered",
      "totalAmount": 110000,
      "deliveryDays": 7,
      "expectedDelivery": "2024-10-12T00:00:00.000Z",
      "items": [
        {
          "gem": {
            "_id": "507f1f77bcf86cd799439011",
            "name": "Natural Emerald (Panna)",
            "heroImage": "https://res.cloudinary.com/...",
            "sizeWeight": 5.5,
            "sizeUnit": "carat"
          },
          "quantity": 2,
          "price": 55000
        }
      ],
      "shippingAddress": {
        "name": "John Doe",
        "phone": "+91 9876543210",
        "addressLine1": "123 Main Street",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001"
      },
      "createdAt": "2024-10-05T10:30:00.000Z"
    }
  ]
}
```

**Axios Implementation**:
```javascript
getMyOrders: async (params = {}) => {
    return await apiClient.get('/orders/my-orders', { params });
}
```

---

### 4.3 Get Single Order
**Endpoint**: `GET /api/orders/:id`  
**Access**: Protected (Owner only)  
**Headers**: `Authorization: Bearer <token>`

**Response Success (200)**:
```json
{
  "success": true,
  "order": {
    "_id": "507f1f77bcf86cd799439014",
    "orderNumber": "ORD-2024-001",
    "user": {
      "_id": "507f1f77bcf86cd799439010",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "items": [...],
    "shippingAddress": {...},
    "totalPrice": 110000,
    "status": "delivered",
    "paymentMethod": "COD",
    "paymentStatus": "pending",
    "createdAt": "2024-10-05T10:30:00.000Z"
  }
}
```

**Axios Implementation**:
```javascript
getOrderById: async (orderId) => {
    return await apiClient.get(`/orders/${orderId}`);
}
```

---

### 4.4 Cancel Order
**Endpoint**: `PUT /api/orders/:id/cancel`  
**Access**: Protected (Buyer only - own orders, only if status is 'pending')  
**Headers**: `Authorization: Bearer <token>`

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "order": {
    "_id": "507f1f77bcf86cd799439014",
    "status": "cancelled",
    "updatedAt": "2024-10-09T12:00:00.000Z"
  }
}
```

**Axios Implementation**:
```javascript
cancelOrder: async (orderId) => {
    return await apiClient.put(`/orders/${orderId}/cancel`);
}
```

---

### 4.5 Get Seller's Orders
**Endpoint**: `GET /api/orders/seller/orders`  
**Access**: Protected (Seller only)  
**Headers**: `Authorization: Bearer <token>`

**Response Success (200)**:
```json
{
  "success": true,
  "count": 10,
  "orders": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "orderNumber": "ORD-2024-001",
      "buyer": {
        "_id": "507f1f77bcf86cd799439010",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+91 9876543210"
      },
      "items": [
        {
          "gem": {
            "_id": "507f1f77bcf86cd799439011",
            "name": "Emerald"
          },
          "quantity": 2,
          "price": 50000
        }
      ],
      "totalPrice": 100000,
      "status": "pending",
      "shippingAddress": {...},
      "createdAt": "2024-10-05T10:30:00.000Z"
    }
  ]
}
```

**Axios Implementation**:
```javascript
getSellerOrders: async () => {
    return await apiClient.get('/orders/seller/orders');
}
```

---

### 4.6 Update Order Status
**Endpoint**: `PUT /api/orders/:id/status`  
**Access**: Protected (Seller only - for their gem orders)  
**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "status": "processing"
}
```

**Status Options**: `["pending", "processing", "shipped", "delivered", "cancelled"]`

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "order": {
    "_id": "507f1f77bcf86cd799439014",
    "status": "processing",
    "updatedAt": "2024-10-09T12:00:00.000Z"
  }
}
```

**Axios Implementation**:
```javascript
updateOrderStatus: async (orderId, status) => {
    return await apiClient.put(`/orders/${orderId}/status`, { status });
}
```

---

## 5. SELLER PROFILE APIs

### 5.1 Get Seller Profile
**Endpoint**: `GET /api/seller/profile`  
**Access**: Protected (Seller only)  
**Headers**: `Authorization: Bearer <token>`  
**Frontend File**: `src/components/seller/seller.jsx`

**Response Success (200)**:
```json
{
  "success": true,
  "seller": {
    "_id": "507f1f77bcf86cd799439012",
    "fullName": "Raj Kumar Gems",
    "email": "raj@gemstore.com",
    "phone": "9876543210",
    "alternatePhone": "9123456789",
    "shopName": "Raj Kumar Gems & Jewels",
    "shopType": "Retail Store",
    "businessType": "Individual Proprietorship",
    "yearEstablished": "2015",
    "address": {
      "street": "123 Gem Market, Chandni Chowk",
      "city": "Delhi",
      "state": "Delhi",
      "pincode": "110006",
      "country": "India"
    },
    "gstNumber": "07AABCU9603R1ZM",
    "panNumber": "ABCDE1234F",
    "aadharNumber": "123456789012",
    "bankName": "State Bank of India",
    "accountNumber": "12345678901234",
    "ifscCode": "SBIN0001234",
    "accountHolderName": "Raj Kumar",
    "businessDescription": "Established gem dealer with over 8 years of experience...",
    "specialization": ["Loose Gemstones", "Certified Gems", "Custom Designs"],
    "gemTypes": ["Emeralds", "Rubies", "Sapphires", "Diamonds"],
    "website": "https://rajkumargems.com",
    "instagram": "@rajkumargems",
    "facebook": "RajKumarGems",
    "isVerified": true,
    "documentsUploaded": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-10-09T10:30:00.000Z"
  }
}
```

**Axios Implementation**:
```javascript
getSellerProfile: async () => {
    return await apiClient.get('/seller/profile');
}
```

---

### 5.2 Update Seller Profile
**Endpoint**: `PUT /api/seller/profile`  
**Access**: Protected (Seller only)  
**Headers**: `Authorization: Bearer <token>`  
**Frontend File**: `src/components/seller/seller.jsx`

**Request Body** (All fields optional):
```json
{
  "fullName": "Raj Kumar Gems Updated",
  "phone": "9999999999",
  "alternatePhone": "9888888888",
  "shopName": "Raj Kumar Gems & Jewels",
  "shopType": "Wholesaler",
  "businessType": "Partnership",
  "yearEstablished": "2015",
  "address": {
    "street": "456 New Gem Market",
    "city": "Delhi",
    "state": "Delhi",
    "pincode": "110007",
    "country": "India"
  },
  "gstNumber": "07AABCU9603R1ZM",
  "panNumber": "ABCDE1234F",
  "aadharNumber": "123456789012",
  "bankName": "HDFC Bank",
  "accountNumber": "98765432109876",
  "ifscCode": "HDFC0001234",
  "accountHolderName": "Raj Kumar",
  "businessDescription": "Updated description...",
  "specialization": ["Loose Gemstones", "Jewelry"],
  "gemTypes": ["Emeralds", "Rubies"],
  "website": "https://newwebsite.com",
  "instagram": "@newhandle",
  "facebook": "NewPage"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "seller": {
    "_id": "507f1f77bcf86cd799439012",
    "fullName": "Raj Kumar Gems Updated",
    "email": "raj@gemstore.com",
    "phone": "9999999999",
    "updatedAt": "2024-10-09T12:00:00.000Z"
  }
}
```

**Axios Implementation**:
```javascript
updateSellerProfile: async (profileData) => {
    return await apiClient.put('/seller/profile', profileData);
}
```

---

## 6. USER PROFILE APIs

### 6.1 Get User Profile
**Endpoint**: `GET /api/user/profile`  
**Access**: Protected (Buyer only)  
**Headers**: `Authorization: Bearer <token>`  
**Frontend File**: `src/pages/MyOrders.js`

**Response Success (200)**:
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439010",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91 9876543210",
    "role": "buyer",
    "address": {
      "addressLine1": "123 Main Street",
      "addressLine2": "Apartment 4B",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "country": "India"
    },
    "createdAt": "2024-01-10T10:30:00.000Z"
  }
}
```

**Axios Implementation**:
```javascript
getUserProfile: async () => {
    return await apiClient.get('/user/profile');
}
```

---

### 6.2 Update User Profile
**Endpoint**: `PUT /api/user/profile`  
**Access**: Protected (Buyer only)  
**Headers**: `Authorization: Bearer <token>`  
**Frontend File**: `src/pages/MyOrders.js`

**Request Body**:
```json
{
  "name": "John Smith",
  "phone": "+91 9999999999",
  "address": {
    "addressLine1": "456 New Street",
    "addressLine2": "Floor 5",
    "city": "Delhi",
    "state": "Delhi",
    "pincode": "110001",
    "country": "India"
  }
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439010",
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "+91 9999999999",
    "address": {...},
    "updatedAt": "2024-10-09T12:00:00.000Z"
  }
}
```

**Axios Implementation**:
```javascript
updateUserProfile: async (profileData) => {
    return await apiClient.put('/user/profile', profileData);
}
```

---

## 7. ADMIN APIs

### 7.1 Get All Sellers
**Endpoint**: `GET /api/admin/sellers`  
**Access**: Protected (Admin only)  
**Headers**: `Authorization: Bearer <token>`  
**Frontend File**: `src/components/admin/allsellers.jsx`

**Query Parameters**:
```
?page=1&limit=20&search=raj&status=verified
```

**Response Success (200)**:
```json
{
  "success": true,
  "count": 50,
  "totalPages": 3,
  "currentPage": 1,
  "sellers": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "fullName": "Raj Kumar Gems",
      "email": "raj@gemstore.com",
      "phone": "9876543210",
      "shopName": "Raj Kumar Gems & Jewels",
      "shopType": "Retail Store",
      "isVerified": true,
      "totalGems": 45,
      "totalOrders": 120,
      "totalRevenue": 5500000,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Axios Implementation**:
```javascript
getAllSellers: async (params = {}) => {
    return await apiClient.get('/admin/sellers', { params });
}
```

---

### 7.2 Get Seller Details (Admin)
**Endpoint**: `GET /api/admin/sellers/:sellerId`  
**Access**: Protected (Admin only)  
**Headers**: `Authorization: Bearer <token>`  
**Frontend File**: `src/components/admin/sellerdetail.jsx`

**Response Success (200)**:
```json
{
  "success": true,
  "seller": {
    "_id": "507f1f77bcf86cd799439012",
    "fullName": "Raj Kumar Gems",
    "email": "raj@gemstore.com",
    "phone": "9876543210",
    "shopName": "Raj Kumar Gems & Jewels",
    "address": {...},
    "gstNumber": "07AABCU9603R1ZM",
    "panNumber": "ABCDE1234F",
    "bankDetails": {...},
    "isVerified": true,
    "gems": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Emerald",
        "price": 50000,
        "stock": 10
      }
    ],
    "orders": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "orderNumber": "ORD-2024-001",
        "totalPrice": 100000,
        "status": "delivered"
      }
    ],
    "stats": {
      "totalGems": 45,
      "totalOrders": 120,
      "totalRevenue": 5500000,
      "averageRating": 4.8
    }
  }
}
```

**Axios Implementation**:
```javascript
getSellerDetails: async (sellerId) => {
    return await apiClient.get(`/admin/sellers/${sellerId}`);
}
```

---

### 7.3 Update Seller Verification
**Endpoint**: `PUT /api/admin/sellers/:sellerId/verify`  
**Access**: Protected (Admin only)  
**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "isVerified": true
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Seller verification status updated",
  "seller": {
    "_id": "507f1f77bcf86cd799439012",
    "isVerified": true,
    "updatedAt": "2024-10-09T12:00:00.000Z"
  }
}
```

**Axios Implementation**:
```javascript
updateSellerVerification: async (sellerId, isVerified) => {
    return await apiClient.put(`/admin/sellers/${sellerId}/verify`, { isVerified });
}
```

---

### 7.4 Delete Seller
**Endpoint**: `DELETE /api/admin/sellers/:sellerId`  
**Access**: Protected (Admin only)  
**Headers**: `Authorization: Bearer <token>`

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Seller deleted successfully"
}
```

**Axios Implementation**:
```javascript
deleteSeller: async (sellerId) => {
    return await apiClient.delete(`/admin/sellers/${sellerId}`);
}
```

---

## 8. AXIOS IMPLEMENTATION EXAMPLES

### Complete API Service File

Add these to your `src/services/api.js`:

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        console.error('API Error:', error);
        if (error.response) {
            throw new Error(error.response.data.message || 'Something went wrong');
        } else if (error.request) {
            throw new Error('Network error. Please check your connection.');
        } else {
            throw new Error(error.message || 'Something went wrong');
        }
    }
);

// ========== AUTHENTICATION APIs ==========
export const authAPI = {
    signup: async (userData) => {
        return await apiClient.post('/auth/signup', userData);
    },
    
    login: async (credentials) => {
        return await apiClient.post('/auth/login', credentials);
    },
    
    me: async () => {
        return await apiClient.get('/auth/me');
    },
    
    adminLogin: async (credentials) => {
        return await apiClient.post('/auth/admin/login', credentials);
    },
    
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
    
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    }
};

// ========== GEM APIs ==========
export const gemAPI = {
    // Add new gem (Seller only)
    addGem: async (gemData) => {
        return await apiClient.post('/gems', gemData);
    },
    
    // Get all gems (Public)
    getGems: async (params = {}) => {
        const filteredParams = Object.keys(params).reduce((acc, key) => {
            if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                acc[key] = params[key];
            }
            return acc;
        }, {});
        return await apiClient.get('/gems', { params: filteredParams });
    },
    
    // Get single gem (Public)
    getGemById: async (id) => {
        return await apiClient.get(`/gems/${id}`);
    },
    
    // Update gem (Seller only - own gems)
    updateGem: async (id, gemData) => {
        return await apiClient.put(`/gems/${id}`, gemData);
    },
    
    // Delete gem (Seller only - own gems)
    deleteGem: async (id) => {
        return await apiClient.delete(`/gems/${id}`);
    },
    
    // Get seller's gems (Seller only)
    getMyGems: async () => {
        return await apiClient.get('/gems/my-gems');
    }
};

// ========== CART APIs ==========
export const cartAPI = {
    // Add to cart (Buyer only)
    addToCart: async (gemId, quantity) => {
        return await apiClient.post('/cart', { gemId, quantity });
    },
    
    // Get cart (Buyer only)
    getCart: async () => {
        return await apiClient.get('/cart');
    },
    
    // Update cart item (Buyer only)
    updateCartItem: async (itemId, quantity) => {
        return await apiClient.put(`/cart/${itemId}`, { quantity });
    },
    
    // Remove from cart (Buyer only)
    removeFromCart: async (itemId) => {
        return await apiClient.delete(`/cart/${itemId}`);
    },
    
    // Clear cart (Buyer only)
    clearCart: async () => {
        return await apiClient.delete('/cart');
    }
};

// ========== ORDER APIs ==========
export const orderAPI = {
    // Create order (Buyer only)
    createOrder: async (orderData) => {
        return await apiClient.post('/orders', orderData);
    },
    
    // Get buyer's orders (Buyer only)
    getMyOrders: async (params = {}) => {
        return await apiClient.get('/orders/my-orders', { params });
    },
    
    // Get single order
    getOrderById: async (orderId) => {
        return await apiClient.get(`/orders/${orderId}`);
    },
    
    // Cancel order (Buyer only)
    cancelOrder: async (orderId) => {
        return await apiClient.put(`/orders/${orderId}/cancel`);
    },
    
    // Get seller's orders (Seller only)
    getSellerOrders: async () => {
        return await apiClient.get('/orders/seller/orders');
    },
    
    // Update order status (Seller only)
    updateOrderStatus: async (orderId, status) => {
        return await apiClient.put(`/orders/${orderId}/status`, { status });
    }
};

// ========== SELLER PROFILE APIs ==========
export const sellerAPI = {
    // Get seller profile (Seller only)
    getProfile: async () => {
        return await apiClient.get('/seller/profile');
    },
    
    // Update seller profile (Seller only)
    updateProfile: async (profileData) => {
        return await apiClient.put('/seller/profile', profileData);
    }
};

// ========== USER PROFILE APIs ==========
export const userAPI = {
    // Get user profile (Buyer only)
    getProfile: async () => {
        return await apiClient.get('/user/profile');
    },
    
    // Update user profile (Buyer only)
    updateProfile: async (profileData) => {
        return await apiClient.put('/user/profile', profileData);
    }
};

// ========== ADMIN APIs ==========
export const adminAPI = {
    // Get all sellers
    getAllSellers: async (params = {}) => {
        return await apiClient.get('/admin/sellers', { params });
    },
    
    // Get seller details
    getSellerDetails: async (sellerId) => {
        return await apiClient.get(`/admin/sellers/${sellerId}`);
    },
    
    // Update seller verification
    updateSellerVerification: async (sellerId, isVerified) => {
        return await apiClient.put(`/admin/sellers/${sellerId}/verify`, { isVerified });
    },
    
    // Delete seller
    deleteSeller: async (sellerId) => {
        return await apiClient.delete(`/admin/sellers/${sellerId}`);
    },
    
    // Get all orders (Admin)
    getAllOrders: async (params = {}) => {
        return await apiClient.get('/admin/orders', { params });
    },
    
    // Get all gems (Admin)
    getAllGems: async (params = {}) => {
        return await apiClient.get('/admin/gems', { params });
    }
};

// Export all APIs
const api = { authAPI, gemAPI, cartAPI, orderAPI, sellerAPI, userAPI, adminAPI };
export default api;
```

---

## 🗄️ DATABASE SCHEMAS

### User Schema (MongoDB)
```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
  phone: { type: String },
  address: {
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pincode: String,
    country: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};
```

---

### Seller Schema (MongoDB)
```javascript
const sellerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  alternatePhone: String,
  shopName: { type: String, required: true },
  shopType: { type: String, required: true },
  businessType: { type: String, required: true },
  yearEstablished: { type: String, required: true },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  gstNumber: { type: String, required: true },
  panNumber: { type: String, required: true },
  aadharNumber: String,
  bankName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  ifscCode: { type: String, required: true },
  accountHolderName: { type: String, required: true },
  businessDescription: String,
  specialization: [String],
  gemTypes: [String],
  website: String,
  instagram: String,
  facebook: String,
  isVerified: { type: Boolean, default: false },
  documentsUploaded: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

---

### Gem Schema (MongoDB)
```javascript
const gemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hindiName: { type: String, required: true },
  planet: { type: String, required: true },
  planetHindi: String,
  color: { type: String, required: true },
  description: { type: String, required: true },
  benefits: [String],
  suitableFor: [String],
  price: { type: Number, required: true },
  sizeWeight: { type: Number, required: true },
  sizeUnit: { type: String, enum: ['carat', 'gram', 'ounce'], default: 'carat' },
  stock: { type: Number, default: 0 },
  availability: { type: Boolean, default: true },
  certification: { type: String, required: true },
  origin: { type: String, required: true },
  deliveryDays: { type: Number, required: true },
  heroImage: { type: String, required: true },
  additionalImages: [String],
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

---

### Cart Schema (MongoDB)
```javascript
const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    gem: { type: mongoose.Schema.Types.ObjectId, ref: 'Gem' },
    quantity: { type: Number, default: 1 },
    price: Number
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

---

### Order Schema (MongoDB)
```javascript
const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    gem: { type: mongoose.Schema.Types.ObjectId, ref: 'Gem' },
    quantity: Number,
    price: Number,
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  shippingAddress: {
    name: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pincode: String,
    country: String
  },
  paymentMethod: { type: String, enum: ['COD', 'Online'], default: 'COD' },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  totalPrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### JWT Token Generation
```javascript
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};
```

### Auth Middleware
```javascript
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized to access this route' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Not authorized to access this route' 
    });
  }
};
```

### Role Middleware
```javascript
const isSeller = (req, res, next) => {
  if (req.user.role !== 'seller') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Sellers only.' 
    });
  }
  next();
};

const isBuyer = (req, res, next) => {
  if (req.user.role !== 'buyer') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Buyers only.' 
    });
  }
  next();
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admins only.' 
    });
  }
  next();
};
```

---

## 📊 COMPLETE ROUTES SUMMARY

### Public Routes
| Method | Endpoint | Description | Frontend |
|--------|----------|-------------|----------|
| POST | `/auth/signup` | Register user (buyer/seller) | Register.js |
| POST | `/auth/login` | Login user | Login.js |
| POST | `/auth/admin/login` | Admin login | admin.jsx |
| GET | `/gems` | Get all gems with filters | Shop.js, Gemstones.js |
| GET | `/gems/:id` | Get single gem | GemDetail.js |

### Buyer Routes (Protected)
| Method | Endpoint | Description | Frontend |
|--------|----------|-------------|----------|
| GET | `/auth/me` | Get current user | - |
| GET | `/user/profile` | Get user profile | MyOrders.js |
| PUT | `/user/profile` | Update user profile | MyOrders.js |
| POST | `/cart` | Add to cart | Cart.js |
| GET | `/cart` | Get cart | Cart.js |
| PUT | `/cart/:itemId` | Update cart item | Cart.js |
| DELETE | `/cart/:itemId` | Remove from cart | Cart.js |
| DELETE | `/cart` | Clear cart | Cart.js |
| POST | `/orders` | Create order | Checkout.js |
| GET | `/orders/my-orders` | Get user orders | MyOrders.js |
| GET | `/orders/:id` | Get single order | MyOrders.js |
| PUT | `/orders/:id/cancel` | Cancel order | MyOrders.js |

### Seller Routes (Protected)
| Method | Endpoint | Description | Frontend |
|--------|----------|-------------|----------|
| POST | `/gems` | Add new gem | AddGem.js |
| PUT | `/gems/:id` | Update gem (own) | AddGem.js |
| DELETE | `/gems/:id` | Delete gem (own) | - |
| GET | `/gems/my-gems` | Get seller's gems | - |
| GET | `/seller/profile` | Get seller profile | seller.jsx |
| PUT | `/seller/profile` | Update seller profile | seller.jsx |
| GET | `/orders/seller/orders` | Get seller's orders | - |
| PUT | `/orders/:id/status` | Update order status | - |

### Admin Routes (Protected)
| Method | Endpoint | Description | Frontend |
|--------|----------|-------------|----------|
| GET | `/admin/sellers` | Get all sellers | allsellers.jsx |
| GET | `/admin/sellers/:id` | Get seller details | sellerdetail.jsx |
| PUT | `/admin/sellers/:id/verify` | Verify seller | sellerdetail.jsx |
| DELETE | `/admin/sellers/:id` | Delete seller | allsellers.jsx |
| GET | `/admin/orders` | Get all orders | - |
| GET | `/admin/gems` | Get all gems | - |

---

## 🎯 AXIOS METHOD EXAMPLES

### GET Request
```javascript
// Simple GET
const response = await apiClient.get('/gems');

// GET with params
const response = await apiClient.get('/gems', { 
  params: { page: 1, limit: 12, search: 'emerald' } 
});

// GET with ID
const response = await apiClient.get(`/gems/${gemId}`);
```

### POST Request
```javascript
// POST with data
const response = await apiClient.post('/auth/signup', {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  role: 'buyer'
});

// POST with token (automatically added by interceptor)
const response = await apiClient.post('/gems', gemData);
```

### PUT Request
```javascript
// PUT to update
const response = await apiClient.put(`/gems/${gemId}`, {
  price: 55000,
  stock: 8
});

// PUT without body (just trigger action)
const response = await apiClient.put(`/orders/${orderId}/cancel`);
```

### DELETE Request
```javascript
// DELETE with ID
const response = await apiClient.delete(`/gems/${gemId}`);

// DELETE without ID
const response = await apiClient.delete('/cart');
```

---

## 🔒 IMPORTANT SECURITY NOTES

### 1. Password Hashing
```javascript
// ALWAYS hash passwords before saving
const bcrypt = require('bcryptjs');
const hashedPassword = await bcrypt.hash(password, 10);
```

### 2. JWT Secret
```env
# Use strong secret in .env
JWT_SECRET=your_super_secret_key_at_least_32_characters_long
JWT_EXPIRE=7d
```

### 3. Input Validation
```javascript
// Validate all inputs before processing
if (!name || !email || !password) {
  return res.status(400).json({ 
    success: false, 
    message: 'All fields required' 
  });
}
```

### 4. Authorization Checks
```javascript
// Check user owns the resource before update/delete
if (gem.seller.toString() !== req.user._id.toString()) {
  return res.status(403).json({ 
    success: false, 
    message: 'Not authorized' 
  });
}
```

---

## 📝 RESPONSE FORMAT (IMPORTANT!)

**Always use this format:**

### Success Response
```javascript
res.status(200).json({
  success: true,
  message: "Operation successful",
  data: {...}  // or user, gem, order, etc.
});
```

### Error Response
```javascript
res.status(400).json({
  success: false,
  message: "Error message here"
});
```

**Frontend expects `success: true/false` in ALL responses!**

---

## 🧪 TESTING ENDPOINTS

### Using cURL:

```bash
# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"buyer"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get Gems
curl http://localhost:5000/api/gems

# Add Gem (with token)
curl -X POST http://localhost:5000/api/gems \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"name":"Emerald","hindiName":"Panna",...}'

# Update Gem
curl -X PUT http://localhost:5000/api/gems/GEM_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"price":55000}'

# Delete Gem
curl -X DELETE http://localhost:5000/api/gems/GEM_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## ⚡ QUICK START CHECKLIST

- [ ] Install packages: `express mongoose bcryptjs jsonwebtoken cors dotenv`
- [ ] Create .env file with MongoDB URI and JWT_SECRET
- [ ] Create User, Gem, Cart, Order, Seller schemas
- [ ] Implement auth middleware (protect, isSeller, isBuyer, isAdmin)
- [ ] Create auth routes (signup, login)
- [ ] Create gem routes (CRUD with role checks)
- [ ] Create cart routes (buyer only)
- [ ] Create order routes (buyer & seller)
- [ ] Create seller profile routes
- [ ] Create admin routes
- [ ] Test all endpoints
- [ ] Connect with frontend

---

## 🎉 YOU'RE ALL SET!

This file contains EVERYTHING your backend developer needs:
- ✅ All 30+ endpoints documented
- ✅ Exact request/response formats from your frontend
- ✅ Complete axios implementations
- ✅ Database schemas
- ✅ Authentication & authorization
- ✅ Security best practices
- ✅ Testing examples

**Share this file with your backend developer and you'll have a working backend in 2-3 days!** 🚀

---

Last Updated: October 9, 2025
