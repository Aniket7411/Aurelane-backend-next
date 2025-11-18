# 📡 Admin API Response Format Documentation

## Overview
This document provides the complete API response formats for all admin endpoints as required by the frontend. All responses follow a standardized format for consistent frontend handling.

**Base URL:** `http://localhost:5000/api/admin`

---

## 🔐 Authentication

All admin endpoints require:
- **Header:** `Authorization: Bearer <admin_token>`
- **Role:** User must have `role: "admin"`

---

## 📊 Dashboard

### GET `/api/admin/dashboard/stats`

**Response (200):**
```json
{
  "success": true,
  "stats": {
    "totalBuyers": 150,
    "totalSellers": 45,
    "totalProducts": 1200,
    "totalOrders": 850,
    "blockedBuyers": 5,
    "blockedSellers": 2,
    "pendingOrders": 12,
    "totalRevenue": 2500000,
    "ordersByStatus": {
      "pending": 12,
      "processing": 25,
      "shipped": 50,
      "delivered": 750,
      "cancelled": 13
    },
    "recentActivity": {
      "buyers": 10,
      "sellers": 3,
      "orders": 45,
      "revenue": 500000
    },
    "monthlyRevenue": [
      {
        "month": "Jan 2024",
        "revenue": 500000,
        "orders": 120
      }
    ],
    "averageOrderValue": 2941.18
  }
}
```

---

## 👨‍💼 Seller Management

### GET `/api/admin/sellers`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `search` (string) - Search by name, email, or shop name
- `status` (string) - Filter: `active`, `pending`, `suspended`, `blocked`

**Response (200):**
```json
{
  "success": true,
  "message": "Sellers retrieved successfully",
  "data": {
    "sellers": [
      {
        "_id": "seller_id",
        "name": "Seller Name",
        "fullName": "Full Seller Name",
        "email": "seller@example.com",
        "phone": "+1234567890",
        "shopName": "Gem Shop",
        "address": {
          "street": "123 Main St",
          "city": "City",
          "state": "State",
          "pincode": "123456"
        },
        "status": "active",
        "isBlocked": false,
        "isVerified": true,
        "rating": 4.5,
        "totalGems": 50,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "registrationDate": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### GET `/api/admin/sellers/:sellerId`

**Response (200):**
```json
{
  "success": true,
  "message": "Seller details retrieved successfully",
  "data": {
    "seller": {
      "_id": "seller_id",
      "name": "Seller Name",
      "fullName": "Full Seller Name",
      "email": "seller@example.com",
      "phone": "1234567890",
      "alternatePhone": "0987654321",
      "shopName": "Gem Shop",
      "shopType": "Retail",
      "yearEstablished": 2020,
      "address": {
        "street": "123 Main St",
        "city": "City",
        "state": "State",
        "pincode": "123456"
      },
      "businessType": "Sole Proprietorship",
      "gstNumber": "GST123456",
      "panNumber": "PAN123456",
      "aadharNumber": "123456789012",
      "gemTypes": ["Diamond", "Ruby", "Sapphire"],
      "specialization": ["Certified Gems", "Custom Jewelry"],
      "accountHolderName": "Seller Name",
      "bankName": "Bank Name",
      "accountNumber": "1234567890",
      "ifscCode": "IFSC123456",
      "status": "approved",
      "isBlocked": false,
      "isVerified": true,
      "rating": 4.5,
      "totalSales": 100,
      "totalOrders": 150,
      "stats": {
        "totalGems": 50,
        "totalOrders": 150,
        "totalRevenue": 500000
      },
      "gems": [
        {
          "_id": "gem_id",
          "name": "Gem Name",
          "category": "Diamond",
          "price": 50000,
          "stock": 10,
          "images": ["image_url"],
          "sizeWeight": 1,
          "sizeUnit": "carat"
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "suspendedAt": null
    }
  }
}
```

### PUT `/api/admin/sellers/:sellerId/status`

**Request Body:**
```json
{
  "status": "approved" | "suspended" | "rejected"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Seller approved successfully",
  "data": {
    "seller": { /* updated seller object */ }
  }
}
```

### PUT `/api/admin/sellers/:sellerId/block`

**Response (200):**
```json
{
  "success": true,
  "message": "Seller blocked successfully",
  "data": {
    "seller": { /* updated seller object */ }
  }
}
```

### PUT `/api/admin/sellers/:sellerId/unblock`

**Response (200):**
```json
{
  "success": true,
  "message": "Seller unblocked successfully",
  "data": {
    "seller": { /* updated seller object */ }
  }
}
```

### DELETE `/api/admin/sellers/:sellerId`

**Response (200):**
```json
{
  "success": true,
  "message": "Seller deleted successfully"
}
```

---

## 👤 Buyer Management

### GET `/api/admin/buyers`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `search` (string) - Search by name, email, or phone
- `status` (string) - Filter: `active`, `blocked`

**Response (200):**
```json
{
  "success": true,
  "message": "Buyers retrieved successfully",
  "data": {
    "buyers": [
      {
        "_id": "buyer_id",
        "name": "Buyer Name",
        "fullName": "Buyer Name",
        "email": "buyer@example.com",
        "phone": "1234567890",
        "phoneNumber": "1234567890",
        "isBlocked": false,
        "status": "active",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "registrationDate": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### GET `/api/admin/buyers/:buyerId`

**Response (200):**
```json
{
  "success": true,
  "message": "Buyer details retrieved successfully",
  "data": {
    "buyer": {
      "_id": "buyer_id",
      "name": "Buyer Name",
      "email": "buyer@example.com",
      "phone": "1234567890",
      "addresses": [],
      "orders": [
        {
          "_id": "order_id",
          "orderNumber": "ORD-2024-001",
          "items": [],
          "totalAmount": 50000,
          "status": "pending",
          "createdAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "isBlocked": false,
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### PUT `/api/admin/buyers/:buyerId/block`

**Response (200):**
```json
{
  "success": true,
  "message": "Buyer blocked successfully",
  "data": {
    "buyer": { /* updated buyer object */ }
  }
}
```

### PUT `/api/admin/buyers/:buyerId/unblock`

**Response (200):**
```json
{
  "success": true,
  "message": "Buyer unblocked successfully",
  "data": {
    "buyer": { /* updated buyer object */ }
  }
}
```

---

## 📦 Product Management

### GET `/api/admin/products`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `search` (string) - Search by product name, category, or seller
- `category` (string) - Filter by category
- `sellerId` (string) - Filter by seller ID
- `status` (string) - Filter: `active`, `inactive`

**Response (200):**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "products": [
      {
        "_id": "product_id",
        "name": "Product Name",
        "category": "Diamond",
        "price": 50000,
        "stock": 10,
        "images": ["image_url"],
        "description": "Product description",
        "seller": {
          "_id": "seller_id",
          "name": "Seller Name",
          "shopName": "Shop Name"
        },
        "status": "active",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "limit": 20,
      "total": 1200,
      "totalPages": 60
    }
  }
}
```

### GET `/api/admin/products/:productId`

**Response (200):**
```json
{
  "success": true,
  "message": "Product details retrieved successfully",
  "data": {
    "product": {
      "_id": "product_id",
      "name": "Product Name",
      "category": "Diamond",
      "price": 50000,
      "stock": 10,
      "images": ["image_url"],
      "description": "Product description",
      "seller": {
        "_id": "seller_id",
        "name": "Seller Name",
        "shopName": "Shop Name"
      },
      "specifications": {
        "sizeWeight": 1,
        "sizeUnit": "carat",
        "origin": "India",
        "certification": "GIA Certified",
        "planet": "Venus",
        "color": "White"
      },
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### DELETE `/api/admin/products/:productId`

**Response (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## 📋 Order Management

### GET `/api/admin/orders`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `search` (string) - Search by order ID, buyer name, or email
- `status` (string) - Filter: `pending`, `processing`, `shipped`, `delivered`, `cancelled`

**Response (200):**
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": {
    "orders": [
      {
        "_id": "order_id",
        "id": "order_id",
        "buyer": {
          "_id": "buyer_id",
          "name": "Buyer Name",
          "email": "buyer@example.com"
        },
        "items": [
          {
            "_id": "item_id",
            "product": {
              "_id": "product_id",
              "name": "Product Name",
              "image": "image_url"
            },
            "quantity": 1,
            "price": 50000
          }
        ],
        "shippingAddress": {
          "firstName": "First",
          "lastName": "Last",
          "email": "buyer@example.com",
          "phone": "1234567890",
          "address": "123 Main St",
          "addressLine1": "123 Main St",
          "city": "City",
          "state": "State",
          "pincode": "123456"
        },
        "totalAmount": 50000,
        "total": 50000,
        "status": "pending",
        "trackingNumber": "TRACK123456",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "limit": 20,
      "total": 850,
      "totalPages": 43
    }
  }
}
```

### GET `/api/admin/orders/:orderId`

**Response (200):**
```json
{
  "success": true,
  "message": "Order details retrieved successfully",
  "data": {
    "order": {
      "_id": "order_id",
      "buyer": {
        "_id": "buyer_id",
        "name": "Buyer Name",
        "email": "buyer@example.com",
        "phone": "1234567890"
      },
      "items": [
        {
          "_id": "item_id",
          "product": {
            "_id": "product_id",
            "name": "Product Name",
            "image": "image_url",
            "price": 50000
          },
          "quantity": 1,
          "price": 50000,
          "seller": {
            "_id": "seller_id",
            "name": "Seller Name",
            "shopName": "Shop Name"
          }
        }
      ],
      "shippingAddress": {
        "name": "Buyer Name",
        "phone": "1234567890",
        "addressLine1": "123 Main St",
        "city": "City",
        "state": "State",
        "pincode": "123456",
        "country": "India"
      },
      "paymentDetails": {
        "method": "COD",
        "status": "pending",
        "total": 50000
      },
      "totalAmount": 50000,
      "status": "pending",
      "trackingNumber": "TRACK123456",
      "statusHistory": [
        {
          "status": "pending",
          "timestamp": "2024-01-01T00:00:00.000Z"
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### PUT `/api/admin/orders/:orderId/status`

**Request Body:**
```json
{
  "status": "pending" | "processing" | "shipped" | "delivered" | "cancelled",
  "trackingNumber": "TRACK123456"  // Required if status is "shipped"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "order": { /* updated order object */ }
  }
}
```

**Error (400) - Missing tracking number:**
```json
{
  "success": false,
  "message": "Tracking number is required when status is shipped"
}
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Status is required",
      "param": "status",
      "location": "body"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access forbidden"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Server error during operation",
  "error": "Detailed error message (development only)"
}
```

---

## 📝 Response Format Standards

### Success Response Structure
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  },
  "meta": {
    // Optional metadata (pagination, etc.)
  }
}
```

### Pagination Format
```json
{
  "pagination": {
    "currentPage": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## 🔄 Status Values

### Seller Status
- `pending` - Awaiting approval
- `approved` - Approved and active
- `rejected` - Application rejected
- `suspended` - Temporarily suspended
- `active` - Active and verified

### Buyer Status
- `active` - Account is active
- `blocked` - Account is blocked

### Product Status
- `active` - Product is available
- `inactive` - Product is unavailable

### Order Status
- `pending` - Order placed, awaiting confirmation
- `processing` - Order confirmed, preparing for shipment
- `shipped` - Order shipped with tracking
- `delivered` - Order delivered
- `cancelled` - Order cancelled

---

## 🎯 Frontend Integration Notes

1. **Always check `success` field first** before accessing data
2. **Handle pagination** from `data.pagination` or `meta.pagination`
3. **Error handling** - Check for `success: false` and display `message`
4. **Loading states** - Show loading while fetching data
5. **Empty states** - Handle empty arrays gracefully

---

## 📞 Support

For questions or issues, refer to `ADMIN_FEATURES.md` for complete feature documentation.

**Last Updated:** 2024-01-XX  
**Version:** 1.0.0


