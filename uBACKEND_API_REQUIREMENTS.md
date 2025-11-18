# Backend API Requirements Documentation

## Overview
This document contains all API endpoints, request/response formats, and features required for the backend implementation of the Jewel/Gems E-commerce Platform.

---

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-backend-url.com/api
```

---

## Authentication
All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 1. Authentication APIs (`/auth`)

### 1.1 User Signup/Register
- **Endpoint**: `POST /auth/signup`
- **Description**: Register a new user (buyer)
- **Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phoneNumber": "1234567890"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "1234567890",
    "role": "buyer"
  }
}
```

### 1.2 User Login
- **Endpoint**: `POST /auth/login`
- **Description**: Login user (buyer/seller/admin)
- **Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "buyer"
  }
}
```

### 1.3 Admin Login
- **Endpoint**: `POST /auth/admin/login`
- **Description**: Login admin user
- **Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "admin_password"
}
```
- **Response**: Same as User Login

### 1.4 Forgot Password
- **Endpoint**: `POST /auth/forgot-password`
- **Description**: Send password reset email
- **Request Body**:
```json
{
  "email": "john@example.com"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### 1.5 Reset Password
- **Endpoint**: `PUT /auth/reset-password/:token`
- **Description**: Reset password using token
- **Request Body**:
```json
{
  "password": "new_password123"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

### 1.6 Verify Reset Token
- **Endpoint**: `GET /auth/reset-password/:token`
- **Description**: Verify if reset token is valid
- **Response**:
```json
{
  "success": true,
  "message": "Token is valid"
}
```

### 1.7 Verify Email
- **Endpoint**: `GET /auth/verify-email/:token`
- **Description**: Verify user email
- **Response**:
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

## 2. User Profile APIs (`/user`)

### 2.1 Get Buyer Profile
- **Endpoint**: `GET /user/profile`
- **Description**: Get current buyer's profile
- **Response**:
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "1234567890",
    "address": {
      "addressLine1": "123 Main St",
      "addressLine2": "Apt 4B",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "country": "India"
    }
  }
}
```

### 2.2 Update Buyer Profile
- **Endpoint**: `PUT /user/profile`
- **Description**: Update buyer's profile
- **Request Body**:
```json
{
  "name": "John Doe",
  "phoneNumber": "1234567890",
  "address": {
    "addressLine1": "123 Main St",
    "addressLine2": "Apt 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India"
  }
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

## 3. Address Management APIs (`/user/addresses`)

### 3.1 Get All Addresses
- **Endpoint**: `GET /user/addresses`
- **Description**: Get all addresses for current user
- **Response**:
```json
{
  "success": true,
  "addresses": [
    {
      "_id": "address_id",
      "label": "Home",
      "addressLine1": "123 Main St",
      "addressLine2": "Apt 4B",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "country": "India",
      "isPrimary": true
    }
  ]
}
```

### 3.2 Add Address
- **Endpoint**: `POST /user/addresses`
- **Description**: Add a new address
- **Request Body**:
```json
{
  "label": "Home",
  "addressLine1": "123 Main St",
  "addressLine2": "Apt 4B",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "country": "India",
  "isPrimary": false
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Address added successfully",
  "address": {
    "_id": "address_id",
    "label": "Home",
    "addressLine1": "123 Main St",
    "isPrimary": false
  }
}
```

### 3.3 Update Address
- **Endpoint**: `PUT /user/addresses/:addressId`
- **Description**: Update an existing address
- **Request Body**: Same as Add Address
- **Response**:
```json
{
  "success": true,
  "message": "Address updated successfully",
  "address": {
    "_id": "address_id",
    "label": "Home",
    "addressLine1": "123 Main St"
  }
}
```

### 3.4 Delete Address
- **Endpoint**: `DELETE /user/addresses/:addressId`
- **Description**: Delete an address
- **Response**:
```json
{
  "success": true,
  "message": "Address deleted successfully"
}
```

### 3.5 Set Primary Address
- **Endpoint**: `PUT /user/addresses/:addressId/primary`
- **Description**: Set an address as primary
- **Response**:
```json
{
  "success": true,
  "message": "Primary address updated successfully"
}
```

---

## 4. Seller Profile APIs (`/seller`)

### 4.1 Get Seller Profile
- **Endpoint**: `GET /seller/profile`
- **Description**: Get current seller's profile
- **Response**:
```json
{
  "success": true,
  "seller": {
    "_id": "seller_id",
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "phoneNumber": "9876543210",
    "shopName": "Jane's Gems",
    "address": {
      "street": "456 Seller St",
      "city": "Delhi",
      "state": "Delhi",
      "pincode": "110001"
    },
    "isVerified": true,
    "status": "active"
  }
}
```

### 4.2 Update Seller Profile
- **Endpoint**: `PUT /seller/profile`
- **Description**: Update seller's profile
- **Request Body**:
```json
{
  "fullName": "Jane Smith",
  "phoneNumber": "9876543210",
  "shopName": "Jane's Gems",
  "address": {
    "street": "456 Seller St",
    "city": "Delhi",
    "state": "Delhi",
    "pincode": "110001"
  }
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "seller": {
    "_id": "seller_id",
    "fullName": "Jane Smith",
    "shopName": "Jane's Gems"
  }
}
```

### 4.3 Get Seller Dashboard Stats
- **Endpoint**: `GET /seller/dashboard/stats`
- **Description**: Get seller dashboard statistics
- **Response**:
```json
{
  "success": true,
  "stats": {
    "totalGems": 50,
    "activeGems": 45,
    "outOfStock": 5,
    "totalOrders": 120,
    "pendingOrders": 10,
    "totalRevenue": 500000
  }
}
```

---

## 5. Gem/Product APIs (`/gems`)

### 5.1 Add Gem
- **Endpoint**: `POST /gems`
- **Description**: Add a new gem/product (Seller only)
- **Request Body**:
```json
{
  "name": "Emerald Ring",
  "description": "Beautiful emerald ring",
  "category": "Emerald",
  "price": 50000,
  "stock": 10,
  "sizeWeight": "2.5",
  "sizeUnit": "carat",
  "images": ["url1", "url2"],
  "certification": "cert_url",
  "origin": "Colombia",
  "zodiacSign": "Gemini",
  "discount": 10,
  "discountType": "percentage"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Gem added successfully",
  "gem": {
    "_id": "gem_id",
    "name": "Emerald Ring",
    "price": 50000,
    "sellerId": "seller_id"
  }
}
```

### 5.2 Get All Gems
- **Endpoint**: `GET /gems`
- **Description**: Get all gems with filters
- **Query Parameters**:
  - `search`: Search term
  - `category`: Filter by category
  - `minPrice`: Minimum price
  - `maxPrice`: Maximum price
  - `page`: Page number
  - `limit`: Items per page
  - `sort`: Sort field (price, createdAt, etc.)
  - `order`: Sort order (asc, desc)
- **Response**:
```json
{
  "success": true,
  "gems": [
    {
      "_id": "gem_id",
      "name": "Emerald Ring",
      "description": "Beautiful emerald ring",
      "category": "Emerald",
      "price": 50000,
      "stock": 10,
      "images": ["url1", "url2"],
      "seller": {
        "_id": "seller_id",
        "shopName": "Jane's Gems"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "total": 100
  }
}
```

### 5.3 Get Gem by ID
- **Endpoint**: `GET /gems/:id`
- **Description**: Get gem details by ID
- **Response**:
```json
{
  "success": true,
  "gem": {
    "_id": "gem_id",
    "name": "Emerald Ring",
    "description": "Beautiful emerald ring",
    "category": "Emerald",
    "price": 50000,
    "stock": 10,
    "images": ["url1", "url2"],
    "seller": {
      "_id": "seller_id",
      "shopName": "Jane's Gems",
      "fullName": "Jane Smith"
    }
  }
}
```

### 5.4 Update Gem
- **Endpoint**: `PUT /gems/:id`
- **Description**: Update gem details (Seller only, own gems)
- **Request Body**: Same as Add Gem
- **Response**:
```json
{
  "success": true,
  "message": "Gem updated successfully",
  "gem": {
    "_id": "gem_id",
    "name": "Emerald Ring Updated"
  }
}
```

### 5.5 Delete Gem
- **Endpoint**: `DELETE /gems/:id`
- **Description**: Delete a gem (Seller only, own gems)
- **Response**:
```json
{
  "success": true,
  "message": "Gem deleted successfully"
}
```

### 5.6 Search Gems
- **Endpoint**: `POST /gems/search`
- **Description**: Advanced search for gems
- **Request Body**:
```json
{
  "query": "emerald",
  "category": "Emerald",
  "minPrice": 10000,
  "maxPrice": 100000
}
```
- **Response**: Same as Get All Gems

### 5.7 Get Gem Categories
- **Endpoint**: `GET /gems/categories`
- **Description**: Get all available gem categories
- **Response**:
```json
{
  "success": true,
  "categories": ["Emerald", "Ruby", "Sapphire", "Diamond"]
}
```

### 5.8 Get Gems by Category
- **Endpoint**: `GET /gems/category/:category`
- **Description**: Get gems filtered by category
- **Response**: Same as Get All Gems

### 5.9 Get Gems by Zodiac Sign
- **Endpoint**: `GET /gems/zodiac/:zodiacSign`
- **Description**: Get gems filtered by zodiac sign
- **Response**: Same as Get All Gems

---

## 6. Cart APIs (`/cart`)

### 6.1 Add to Cart
- **Endpoint**: `POST /cart/add`
- **Description**: Add item to cart
- **Request Body**:
```json
{
  "gemId": "gem_id",
  "quantity": 2
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Item added to cart",
  "cartItem": {
    "_id": "cart_item_id",
    "gemId": "gem_id",
    "quantity": 2
  }
}
```

### 6.2 Get Cart
- **Endpoint**: `GET /cart`
- **Description**: Get user's cart items
- **Response**:
```json
{
  "success": true,
  "cart": [
    {
      "_id": "cart_item_id",
      "gem": {
        "_id": "gem_id",
        "name": "Emerald Ring",
        "price": 50000,
        "images": ["url1"]
      },
      "quantity": 2
    }
  ],
  "total": 100000
}
```

### 6.3 Update Cart Item
- **Endpoint**: `PUT /cart/update/:gemId`
- **Description**: Update cart item quantity
- **Request Body**:
```json
{
  "quantity": 3
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Cart updated successfully"
}
```

### 6.4 Remove from Cart
- **Endpoint**: `DELETE /cart/remove/:gemId`
- **Description**: Remove item from cart
- **Response**:
```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

### 6.5 Clear Cart
- **Endpoint**: `DELETE /cart/clear`
- **Description**: Clear all cart items
- **Response**:
```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

---

## 7. Order APIs (`/orders`)

### 7.1 Create Order
- **Endpoint**: `POST /orders`
- **Description**: Create a new order
- **Request Body**:
```json
{
  "items": [
    {
      "gemId": "gem_id",
      "quantity": 2,
      "price": 50000
    }
  ],
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "address": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "paymentMethod": "cod",
  "paymentMethod": "online",
  "orderNotes": "Please handle with care"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "_id": "order_id",
    "id": "ORD123456",
    "items": [
      {
        "gemId": "gem_id",
        "name": "Emerald Ring",
        "quantity": 2,
        "price": 50000
      }
    ],
    "totalAmount": 100000,
    "status": "pending",
    "paymentMethod": "cod",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "razorpayOrderId": "order_razorpay_id" // If paymentMethod is "online"
}
```

### 7.2 Get User Orders
- **Endpoint**: `GET /orders`
- **Description**: Get all orders for current user
- **Response**:
```json
{
  "success": true,
  "orders": [
    {
      "_id": "order_id",
      "id": "ORD123456",
      "items": [
        {
          "gemId": "gem_id",
          "name": "Emerald Ring",
          "quantity": 2,
          "price": 50000,
          "image": "url1"
        }
      ],
      "totalAmount": 100000,
      "status": "pending",
      "shippingAddress": {
        "firstName": "John",
        "lastName": "Doe",
        "address": "123 Main St"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 7.3 Get Order by ID
- **Endpoint**: `GET /orders/:orderId`
- **Description**: Get order details by ID
- **Response**: Same format as order object in Get User Orders

### 7.4 Cancel Order
- **Endpoint**: `PUT /orders/:orderId/cancel`
- **Description**: Cancel an order
- **Request Body**:
```json
{
  "reason": "Found better price elsewhere"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "order": {
    "_id": "order_id",
    "status": "cancelled",
    "cancelReason": "Found better price elsewhere"
  }
}
```

### 7.5 Track Order
- **Endpoint**: `GET /orders/:orderId/track`
- **Description**: Get order tracking details
- **Response**:
```json
{
  "success": true,
  "order": {
    "_id": "order_id",
    "status": "shipped",
    "trackingNumber": "TRACK123456",
    "trackingUrl": "https://tracking-url.com",
    "estimatedDelivery": "2024-01-10",
    "trackingHistory": [
      {
        "status": "pending",
        "date": "2024-01-01T00:00:00.000Z"
      },
      {
        "status": "shipped",
        "date": "2024-01-05T00:00:00.000Z"
      }
    ]
  }
}
```

### 7.6 Get Order Invoice
- **Endpoint**: `GET /orders/:orderId/invoice`
- **Description**: Download order invoice (PDF)
- **Response**: PDF file blob

---

## 8. Seller Order APIs (`/seller/orders`)

### 8.1 Get Seller Orders
- **Endpoint**: `GET /seller/orders`
- **Description**: Get all orders for seller's products
- **Query Parameters**:
  - `status`: Filter by status (pending, processing, shipped, delivered, cancelled)
  - `page`: Page number
  - `limit`: Items per page
- **Response**:
```json
{
  "success": true,
  "orders": [
    {
      "_id": "order_id",
      "id": "ORD123456",
      "items": [
        {
          "gemId": "gem_id",
          "name": "Emerald Ring",
          "quantity": 2,
          "price": 50000
        }
      ],
      "buyer": {
        "_id": "buyer_id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "totalAmount": 100000,
      "status": "pending",
      "shippingAddress": {
        "firstName": "John",
        "lastName": "Doe",
        "address": "123 Main St"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 8.2 Get Seller Order by ID
- **Endpoint**: `GET /seller/orders/:orderId`
- **Description**: Get seller order details by ID
- **Response**: Same format as order object in Get Seller Orders

### 8.3 Update Order Status
- **Endpoint**: `PUT /seller/orders/:orderId/status`
- **Description**: Update order status and tracking info
- **Request Body**:
```json
{
  "status": "shipped",
  "trackingNumber": "TRACK123456",
  "trackingUrl": "https://tracking-url.com",
  "estimatedDelivery": "2024-01-10"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "order": {
    "_id": "order_id",
    "status": "shipped",
    "trackingNumber": "TRACK123456"
  }
}
```

### 8.4 Get Seller Order Stats
- **Endpoint**: `GET /seller/orders/stats`
- **Description**: Get seller order statistics
- **Response**:
```json
{
  "success": true,
  "stats": {
    "totalOrders": 120,
    "pendingOrders": 10,
    "processingOrders": 5,
    "shippedOrders": 15,
    "deliveredOrders": 80,
    "cancelledOrders": 10,
    "totalRevenue": 5000000
  }
}
```

---

## 9. Review APIs (`/reviews`)

### 9.1 Submit Review
- **Endpoint**: `POST /reviews/:gemId`
- **Description**: Submit a review for a gem/product
- **Request Body**:
```json
{
  "rating": 5,
  "comment": "Excellent product! Very satisfied."
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "review": {
    "_id": "review_id",
    "gemId": "gem_id",
    "userId": "user_id",
    "rating": 5,
    "comment": "Excellent product! Very satisfied.",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 9.2 Get Gem Reviews
- **Endpoint**: `GET /reviews/gem/:gemId`
- **Description**: Get all reviews for a gem
- **Query Parameters**:
  - `page`: Page number
  - `limit`: Items per page
  - `sort`: Sort by (rating, createdAt)
- **Response**:
```json
{
  "success": true,
  "reviews": [
    {
      "_id": "review_id",
      "gemId": "gem_id",
      "user": {
        "_id": "user_id",
        "name": "John Doe"
      },
      "rating": 5,
      "comment": "Excellent product!",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "averageRating": 4.5,
  "totalReviews": 25
}
```

### 9.3 Get User Reviews
- **Endpoint**: `GET /reviews/user`
- **Description**: Get current user's reviews
- **Response**:
```json
{
  "success": true,
  "reviews": [
    {
      "_id": "review_id",
      "gemId": "gem_id",
      "gem": {
        "_id": "gem_id",
        "name": "Emerald Ring"
      },
      "rating": 5,
      "comment": "Excellent product!",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 9.4 Update Review
- **Endpoint**: `PUT /reviews/:reviewId`
- **Description**: Update a review
- **Request Body**:
```json
{
  "rating": 4,
  "comment": "Good product, but could be better."
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Review updated successfully",
  "review": {
    "_id": "review_id",
    "rating": 4,
    "comment": "Good product, but could be better."
  }
}
```

### 9.5 Delete Review
- **Endpoint**: `DELETE /reviews/:reviewId`
- **Description**: Delete a review
- **Response**:
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

### 9.6 Check if User Has Reviewed
- **Endpoint**: `GET /reviews/check/:gemId`
- **Description**: Check if current user has reviewed a gem
- **Response**:
```json
{
  "success": true,
  "hasReviewed": true,
  "review": {
    "_id": "review_id",
    "rating": 5,
    "comment": "Excellent product!"
  }
}
```

---

## 10. Wishlist APIs (`/wishlist`)

### 10.1 Add to Wishlist
- **Endpoint**: `POST /wishlist/add`
- **Description**: Add item to wishlist
- **Request Body**:
```json
{
  "gemId": "gem_id"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Item added to wishlist"
}
```

### 10.2 Get Wishlist
- **Endpoint**: `GET /wishlist`
- **Description**: Get user's wishlist items
- **Response**:
```json
{
  "success": true,
  "wishlist": [
    {
      "_id": "wishlist_item_id",
      "gem": {
        "_id": "gem_id",
        "name": "Emerald Ring",
        "price": 50000,
        "images": ["url1"]
      },
      "addedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 10.3 Remove from Wishlist
- **Endpoint**: `DELETE /wishlist/remove/:gemId`
- **Description**: Remove item from wishlist
- **Response**:
```json
{
  "success": true,
  "message": "Item removed from wishlist"
}
```

### 10.4 Clear Wishlist
- **Endpoint**: `DELETE /wishlist/clear`
- **Description**: Clear all wishlist items
- **Response**:
```json
{
  "success": true,
  "message": "Wishlist cleared successfully"
}
```

### 10.5 Check if Item is in Wishlist
- **Endpoint**: `GET /wishlist/check/:gemId`
- **Description**: Check if item is in wishlist
- **Response**:
```json
{
  "success": true,
  "isInWishlist": true
}
```

---

## 11. OTP APIs (`/otp`)

### 11.1 Send OTP
- **Endpoint**: `POST /otp/send`
- **Description**: Send OTP to phone number
- **Request Body**:
```json
{
  "phoneNumber": "1234567890"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

### 11.2 Verify OTP
- **Endpoint**: `POST /otp/verify`
- **Description**: Verify OTP
- **Request Body**:
```json
{
  "phoneNumber": "1234567890",
  "otp": "123456"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "token": "jwt_token_here"
}
```

---

## 12. Admin APIs (`/admin`)

### 12.1 Get All Sellers
- **Endpoint**: `GET /admin/sellers`
- **Description**: Get all sellers (Admin only)
- **Query Parameters**:
  - `search`: Search term
  - `status`: Filter by status (active, pending, suspended, blocked)
  - `page`: Page number
  - `limit`: Items per page
- **Response**:
```json
{
  "success": true,
  "sellers": [
    {
      "_id": "seller_id",
      "fullName": "Jane Smith",
      "email": "jane@example.com",
      "phoneNumber": "9876543210",
      "shopName": "Jane's Gems",
      "status": "active",
      "isBlocked": false,
      "totalGems": 50,
      "rating": 4.5,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "total": 100
  }
}
```

### 12.2 Get Seller by ID
- **Endpoint**: `GET /admin/sellers/:sellerId`
- **Description**: Get seller details by ID (Admin only)
- **Response**: Same format as seller object in Get All Sellers

### 12.3 Update Seller Status
- **Endpoint**: `PUT /admin/sellers/:sellerId/status`
- **Description**: Update seller status (approve/reject) (Admin only)
- **Request Body**:
```json
{
  "status": "active"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Seller status updated successfully",
  "seller": {
    "_id": "seller_id",
    "status": "active"
  }
}
```

### 12.4 Block Seller
- **Endpoint**: `PUT /admin/sellers/:sellerId/block`
- **Description**: Block a seller (Admin only)
- **Response**:
```json
{
  "success": true,
  "message": "Seller blocked successfully",
  "seller": {
    "_id": "seller_id",
    "isBlocked": true,
    "status": "blocked"
  }
}
```

### 12.5 Unblock Seller
- **Endpoint**: `PUT /admin/sellers/:sellerId/unblock`
- **Description**: Unblock a seller (Admin only)
- **Response**:
```json
{
  "success": true,
  "message": "Seller unblocked successfully",
  "seller": {
    "_id": "seller_id",
    "isBlocked": false,
    "status": "active"
  }
}
```

### 12.6 Delete Seller
- **Endpoint**: `DELETE /admin/sellers/:sellerId`
- **Description**: Delete a seller (Admin only)
- **Response**:
```json
{
  "success": true,
  "message": "Seller deleted successfully"
}
```

### 12.7 Get All Buyers
- **Endpoint**: `GET /admin/buyers`
- **Description**: Get all buyers (Admin only)
- **Query Parameters**:
  - `search`: Search term
  - `status`: Filter by status (active, blocked)
  - `page`: Page number
  - `limit`: Items per page
- **Response**:
```json
{
  "success": true,
  "buyers": [
    {
      "_id": "buyer_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "1234567890",
      "isBlocked": false,
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 12.8 Get Buyer by ID
- **Endpoint**: `GET /admin/buyers/:buyerId`
- **Description**: Get buyer details by ID (Admin only)
- **Response**: Same format as buyer object in Get All Buyers

### 12.9 Block Buyer
- **Endpoint**: `PUT /admin/buyers/:buyerId/block`
- **Description**: Block a buyer (Admin only)
- **Response**:
```json
{
  "success": true,
  "message": "Buyer blocked successfully",
  "buyer": {
    "_id": "buyer_id",
    "isBlocked": true,
    "status": "blocked"
  }
}
```

### 12.10 Unblock Buyer
- **Endpoint**: `PUT /admin/buyers/:buyerId/unblock`
- **Description**: Unblock a buyer (Admin only)
- **Response**:
```json
{
  "success": true,
  "message": "Buyer unblocked successfully",
  "buyer": {
    "_id": "buyer_id",
    "isBlocked": false,
    "status": "active"
  }
}
```

### 12.11 Get All Products
- **Endpoint**: `GET /admin/products`
- **Description**: Get all products from all sellers (Admin only)
- **Query Parameters**:
  - `search`: Search term
  - `category`: Filter by category
  - `sellerId`: Filter by seller
  - `page`: Page number
  - `limit`: Items per page
- **Response**:
```json
{
  "success": true,
  "products": [
    {
      "_id": "gem_id",
      "name": "Emerald Ring",
      "description": "Beautiful emerald ring",
      "category": "Emerald",
      "price": 50000,
      "stock": 10,
      "images": ["url1", "url2"],
      "seller": {
        "_id": "seller_id",
        "shopName": "Jane's Gems"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 12.12 Get Product by ID
- **Endpoint**: `GET /admin/products/:productId`
- **Description**: Get product details by ID (Admin only)
- **Response**: Same format as product object in Get All Products

### 12.13 Delete Product
- **Endpoint**: `DELETE /admin/products/:productId`
- **Description**: Delete a product (Admin only)
- **Response**:
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

### 12.14 Get All Orders
- **Endpoint**: `GET /admin/orders`
- **Description**: Get all orders (Admin only)
- **Query Parameters**:
  - `search`: Search term
  - `status`: Filter by status
  - `page`: Page number
  - `limit`: Items per page
- **Response**:
```json
{
  "success": true,
  "orders": [
    {
      "_id": "order_id",
      "id": "ORD123456",
      "buyer": {
        "_id": "buyer_id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "items": [
        {
          "gemId": "gem_id",
          "name": "Emerald Ring",
          "quantity": 2,
          "price": 50000
        }
      ],
      "totalAmount": 100000,
      "status": "pending",
      "shippingAddress": {
        "firstName": "John",
        "lastName": "Doe",
        "address": "123 Main St"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 12.15 Get Order by ID
- **Endpoint**: `GET /admin/orders/:orderId`
- **Description**: Get order details by ID (Admin only)
- **Response**: Same format as order object in Get All Orders

### 12.16 Get Admin Dashboard Stats
- **Endpoint**: `GET /admin/dashboard/stats`
- **Description**: Get admin dashboard statistics
- **Response**:
```json
{
  "success": true,
  "stats": {
    "totalBuyers": 500,
    "totalSellers": 50,
    "totalProducts": 1000,
    "totalOrders": 5000,
    "blockedBuyers": 10,
    "blockedSellers": 2,
    "pendingOrders": 100,
    "totalRevenue": 50000000
  }
}
```

---

## 13. Health Check API

### 13.1 Health Check
- **Endpoint**: `GET /health`
- **Description**: Check API health status
- **Response**:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Additional Backend Requirements

### Address Management
Add these functions to `authAPI` in the frontend `api.js`:
```javascript
// Get all addresses
getAddresses: async () => {
  return apiClient.get('/user/addresses');
},

// Add address
addAddress: async (addressData) => {
  return apiClient.post('/user/addresses', addressData);
},

// Update address
updateAddress: async (addressId, addressData) => {
  return apiClient.put(`/user/addresses/${addressId}`, addressData);
},

// Delete address
deleteAddress: async (addressId) => {
  return apiClient.delete(`/user/addresses/${addressId}`);
},

// Set primary address
setPrimaryAddress: async (addressId) => {
  return apiClient.put(`/user/addresses/${addressId}/primary`);
}
```

### Payment Integration
- Razorpay integration for online payments
- Payment success/failure callbacks
- Order creation with Razorpay order ID

### File Upload
- Image upload for gems (multiple images)
- Certification document upload
- Support for various image formats (JPG, PNG, WebP)

### Email Notifications
- Order confirmation emails
- Order status update emails
- Password reset emails
- Email verification emails

### Order Status Flow
1. `pending` - Order placed, awaiting confirmation
2. `processing` - Order confirmed, preparing for shipment
3. `shipped` - Order shipped with tracking
4. `delivered` - Order delivered
5. `cancelled` - Order cancelled

### Security Requirements
- JWT token authentication
- Password hashing (bcrypt)
- Input validation and sanitization
- Rate limiting for API endpoints
- CORS configuration
- Environment variables for sensitive data

### Database Schema Requirements
- Users (buyers, sellers, admins)
- Gems/Products
- Cart items
- Orders
- Order items
- Addresses
- Reviews
- Wishlist items
- OTP verification

---

## Response Format Standard

All API responses should follow this format:
```json
{
  "success": true/false,
  "message": "Success or error message",
  "data": { /* response data */ }
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error message",
  "error": "Error details (optional)"
}
```

---

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Notes
1. All timestamps should be in ISO 8601 format
2. All prices should be in INR (Indian Rupees)
3. Pagination should be implemented for list endpoints
4. Search functionality should support partial matching
5. Image URLs should be fully qualified URLs
6. All IDs should be MongoDB ObjectIds or equivalent

---

## Frontend API Functions Missing in api.js

The following functions need to be added to `authAPI` in `src/services/api.js`:

```javascript
// Address Management
getAddresses: async () => {
  return apiClient.get('/user/addresses');
},

addAddress: async (addressData) => {
  return apiClient.post('/user/addresses', addressData);
},

updateAddress: async (addressId, addressData) => {
  return apiClient.put(`/user/addresses/${addressId}`, addressData);
},

deleteAddress: async (addressId) => {
  return apiClient.delete(`/user/addresses/${addressId}`);
},

setPrimaryAddress: async (addressId) => {
  return apiClient.put(`/user/addresses/${addressId}/primary`);
}
```

---

## Project Completion Checklist

### Frontend Features Implemented:
- ✅ User Authentication (Login, Register, Forgot Password, Reset Password)
- ✅ Admin Authentication
- ✅ Buyer Profile Management
- ✅ Seller Profile Management
- ✅ Address Management (Multiple addresses, Primary address)
- ✅ Product/Gem Management (Add, Edit, Delete, View)
- ✅ Product Search and Filtering
- ✅ Cart Management
- ✅ Order Management (Create, View, Cancel, Track)
- ✅ Seller Order Management
- ✅ Admin Dashboard
- ✅ Admin Buyer Management (View, Block/Unblock)
- ✅ Admin Seller Management (View, Block/Unblock)
- ✅ Admin Product Management (View, Delete)
- ✅ Admin Order Management (View)
- ✅ Review System (Submit, View, Update, Delete)
- ✅ Wishlist Management
- ✅ OTP Verification
- ✅ Payment Integration (Razorpay)
- ✅ Invoice Generation
- ✅ Order Tracking
- ✅ Responsive Design

### Backend Requirements:
- [ ] Implement all API endpoints listed above
- [ ] Database schema design
- [ ] Authentication middleware
- [ ] Role-based access control (Buyer, Seller, Admin)
- [ ] File upload handling
- [ ] Email service integration
- [ ] Payment gateway integration (Razorpay)
- [ ] Order status management
- [ ] Block/Unblock functionality
- [ ] Search and filtering
- [ ] Pagination
- [ ] Error handling
- [ ] Input validation

---

**Document Version**: 1.0  
**Last Updated**: 2024-01-01  
**Status**: Ready for Backend Implementation

