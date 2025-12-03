# Complete API Documentation - Auralane Backend

## 📋 Table of Contents

1. [Base Configuration](#base-configuration)
2. [Authentication](#authentication)
3. [Orders & Stock Management](#orders--stock-management)
4. [Seller Endpoints](#seller-endpoints)
5. [Admin Endpoints](#admin-endpoints)
6. [Payment Endpoints](#payment-endpoints)
7. [Stock Reduction Flow](#stock-reduction-flow)

---

## Base Configuration

**Base URL**: `http://localhost:5000/api` (Development)  
**Content-Type**: `application/json`  
**Authentication**: Bearer Token (JWT) in `Authorization` header

```javascript
Authorization: Bearer <your_jwt_token>
```

---

## Authentication

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "buyer" | "seller" | "admin"
  }
}
```

---

## Orders & Stock Management

### Stock Reduction Rules

**✅ COD Orders**: Stock is reduced **immediately** when order is created
**✅ Online Payment Orders**: Stock is reduced **only after payment verification**

### Create Order (COD)

```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "gem": "gem_id_here",
      "quantity": 1,
      "price": 50000
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "phone": "9876543210",
    "addressLine1": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India"
  },
  "paymentMethod": "COD",
  "totalPrice": 50000
}
```

**Response**:
```json
{
  "success": true,
  "message": "Order placed successfully",
  "order": {
    "_id": "order_id",
    "orderNumber": "ORD-2024-000001",
    "totalPrice": 50000,
    "status": "pending",
    "paymentStatus": "pending",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**⚠️ Stock Impact**: Stock is reduced immediately for COD orders

---

### Create Payment Order (Online)

```http
POST /api/payments/create-order
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "gem": "gem_id_here",
      "quantity": 1,
      "price": 50000
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "phone": "9876543210",
    "addressLine1": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India"
  },
  "totalPrice": 50000
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payment order created successfully",
  "order": {
    "_id": "order_id",
    "orderNumber": "ORD-2024-000001",
    "totalPrice": 50000,
    "status": "pending",
    "paymentStatus": "pending"
  },
  "razorpayOrder": {
    "id": "order_IluGWxBm9U8zJ8",
    "amount": 5000000,
    "currency": "INR"
  },
  "keyId": "rzp_test_xxxxxxxxxxxxx"
}
```

**⚠️ Stock Impact**: Stock is **NOT** reduced yet (waiting for payment)

---

### Verify Payment

```http
POST /api/payments/verify-payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "razorpay_order_id": "order_IluGWxBm9U8zJ8",
  "razorpay_payment_id": "pay_xxxxxxxxxxxxx",
  "razorpay_signature": "signature_here",
  "orderId": "order_id_from_database"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "order": {
    "_id": "order_id",
    "orderNumber": "ORD-2024-000001",
    "status": "processing",
    "paymentStatus": "completed"
  }
}
```

**✅ Stock Impact**: Stock is reduced **after successful payment verification**

---

### Get Buyer's Orders

```http
GET /api/orders
Authorization: Bearer <token>
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (`pending`, `processing`, `shipped`, `delivered`, `cancelled`)

**Response**:
```json
{
  "success": true,
  "count": 5,
  "orders": [
    {
      "_id": "order_id",
      "orderNumber": "ORD-2024-000001",
      "orderDate": "2024-01-15T10:30:00.000Z",
      "status": "processing",
      "paymentStatus": "completed",
      "paymentMethod": "Online",
      "totalAmount": 50000,
      "deliveryDays": 7,
      "expectedDelivery": "2024-01-22T10:30:00.000Z",
      "items": [...],
      "shippingAddress": {...}
    }
  ]
}
```

---

## Seller Endpoints

### Get Seller's Orders

```http
GET /api/orders/seller/orders
Authorization: Bearer <token>
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by order status
- `paymentStatus` (optional): Filter by payment status (`pending`, `completed`, `failed`)

**Response**:
```json
{
  "success": true,
  "count": 10,
  "total": 25,
  "orders": [
    {
      "_id": "order_id",
      "orderNumber": "ORD-2024-000001",
      "buyer": {
        "_id": "buyer_id",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "9876543210"
      },
      "items": [
        {
          "_id": "item_id",
          "gem": {
            "_id": "gem_id",
            "name": "Ruby",
            "category": "Ruby",
            "heroImage": "image_url",
            "price": 50000,
            "stock": 5
          },
          "quantity": 1,
          "price": 50000,
          "subtotal": 50000
        }
      ],
      "totalPrice": 50000,
      "status": "processing",
      "paymentStatus": "completed",
      "paymentMethod": "Online",
      "shippingAddress": {...},
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "limit": 20,
    "totalPages": 2
  }
}
```

**Features**:
- ✅ Shows only items belonging to the seller
- ✅ Calculates total for seller's items only
- ✅ Includes gem stock information
- ✅ Shows payment status

---

### Update Order Status (Seller)

```http
PUT /api/orders/:orderId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "shipped",
  "trackingNumber": "TRACK123456789"
}
```

**Status Values**:
- `pending` - Order placed, not yet processed
- `processing` - Order being prepared
- `shipped` - Order shipped (tracking number required)
- `delivered` - Order delivered
- `cancelled` - Order cancelled

**Response**:
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "order": {
    "_id": "order_id",
    "orderNumber": "ORD-2024-000001",
    "status": "shipped",
    "trackingNumber": "TRACK123456789",
    "updatedAt": "2024-01-16T10:30:00.000Z"
  }
}
```

**Validation**:
- ✅ Seller can only update orders containing their items
- ✅ Tracking number required when status is `shipped`
- ✅ Status must be valid enum value

---

### Get Seller's Gems (with Stock)

```http
GET /api/gems/my-gems
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "count": 15,
  "gems": [
    {
      "_id": "gem_id",
      "name": "Ruby",
      "hindiName": "माणिक",
      "category": "Ruby",
      "subcategory": "Burma Ruby",
      "price": 50000,
      "discount": 5,
      "discountType": "percentage",
      "sizeWeight": 5.2,
      "sizeUnit": "carat",
      "stock": 10,
      "availability": true,
      "heroImage": "image_url",
      "contactForPrice": false,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Stock Information**:
- `stock`: Current stock quantity
- `availability`: Boolean (automatically set based on stock)
- Stock is updated when orders are placed/verified

---

## Admin Endpoints

### Get All Orders (Admin)

```http
GET /api/admin/orders
Authorization: Bearer <token>
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status
- `search` (optional): Search by order number

**Response**:
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "_id": "order_id",
        "id": "order_id",
        "buyer": {
          "_id": "buyer_id",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "items": [
          {
            "_id": "item_id",
            "product": {
              "_id": "gem_id",
              "name": "Ruby",
              "image": "image_url",
              "category": "Ruby",
              "subcategory": "Burma Ruby"
            },
            "quantity": 1,
            "price": 50000
          }
        ],
        "shippingAddress": {...},
        "totalAmount": 50000,
        "total": 50000,
        "status": "processing",
        "trackingNumber": null,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  },
  "message": "Orders retrieved successfully"
}
```

---

### Get Order Details (Admin)

```http
GET /api/admin/orders/:orderId
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "order_id",
      "buyer": {
        "_id": "buyer_id",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "9876543210"
      },
      "items": [
        {
          "_id": "item_id",
          "product": {
            "_id": "gem_id",
            "name": "Ruby",
            "image": "image_url",
            "price": 50000,
            "category": "Ruby",
            "subcategory": "Burma Ruby"
          },
          "quantity": 1,
          "price": 50000,
          "seller": {
            "_id": "seller_id",
            "name": "Seller Name",
            "shopName": "Gem Store"
          }
        }
      ],
      "shippingAddress": {...},
      "paymentDetails": {
        "method": "Online",
        "status": "completed",
        "total": 50000
      },
      "totalAmount": 50000,
      "status": "processing",
      "trackingNumber": null,
      "statusHistory": [
        {
          "status": "processing",
          "timestamp": "2024-01-15T10:30:00.000Z"
        }
      ],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  },
  "message": "Order details retrieved successfully"
}
```

---

### Update Order Status (Admin)

```http
PUT /api/admin/orders/:orderId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "shipped",
  "trackingNumber": "TRACK123456789"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "order_id",
      "orderNumber": "ORD-2024-000001",
      "status": "shipped",
      "trackingNumber": "TRACK123456789"
    }
  },
  "message": "Order status updated successfully"
}
```

---

### Get Dashboard Statistics (Admin)

```http
GET /api/admin/dashboard/stats
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "stats": {
    "totalBuyers": 150,
    "totalSellers": 25,
    "totalProducts": 500,
    "totalOrders": 1200,
    "blockedBuyers": 5,
    "blockedSellers": 2,
    "pendingOrders": 15,
    "totalRevenue": 50000000,
    "ordersByStatus": {
      "pending": 15,
      "processing": 30,
      "shipped": 25,
      "delivered": 1100,
      "cancelled": 30
    },
    "recentActivity": {
      "buyers": 10,
      "sellers": 2,
      "orders": 50,
      "revenue": 2500000
    },
    "monthlyRevenue": [
      {
        "month": "Aug 2024",
        "revenue": 5000000,
        "orders": 100
      },
      ...
    ],
    "averageOrderValue": 41666.67
  }
}
```

---

### Get All Sellers (Admin)

```http
GET /api/admin/sellers
Authorization: Bearer <token>
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search by name, email, or shop name
- `status` (optional): Filter by status (`active`, `pending`, `suspended`, `blocked`)

**Response**:
```json
{
  "success": true,
  "data": {
    "sellers": [
      {
        "_id": "seller_id",
        "name": "Seller Name",
        "fullName": "Seller Full Name",
        "email": "seller@example.com",
        "phone": "9876543210",
        "shopName": "Gem Store",
        "status": "approved",
        "isBlocked": false,
        "isVerified": true,
        "rating": 4.5,
        "totalGems": 25,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "registrationDate": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "limit": 20,
      "total": 25,
      "totalPages": 2
    }
  },
  "message": "Sellers retrieved successfully"
}
```

---

### Get Seller Details (Admin)

```http
GET /api/admin/sellers/:sellerId
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "seller": {
      "_id": "seller_id",
      "name": "Seller Name",
      "fullName": "Seller Full Name",
      "email": "seller@example.com",
      "phone": "9876543210",
      "shopName": "Gem Store",
      "status": "approved",
      "isVerified": true,
      "stats": {
        "totalGems": 25,
        "totalOrders": 50,
        "totalRevenue": 2500000
      },
      "gems": [
        {
          "_id": "gem_id",
          "name": "Ruby",
          "category": "Ruby",
          "subcategory": "Burma Ruby",
          "price": 50000,
          "stock": 10,
          "images": ["image_url"],
          "sizeWeight": 5.2,
          "sizeUnit": "carat"
        }
      ],
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  },
  "message": "Seller details retrieved successfully"
}
```

---

### Get All Products/Gems (Admin)

```http
GET /api/admin/products
Authorization: Bearer <token>
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search by name or description
- `category` (optional): Filter by category
- `subcategory` (optional): Filter by subcategory
- `sellerId` (optional): Filter by seller
- `status` (optional): Filter by status (`active`, `inactive`)

**Response**:
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "gem_id",
        "name": "Ruby",
        "category": "Ruby",
        "subcategory": "Burma Ruby",
        "price": 50000,
        "stock": 10,
        "images": ["image_url"],
        "description": "Beautiful ruby gemstone",
        "seller": {
          "_id": "seller_id",
          "name": "Seller Name",
          "shopName": "Gem Store"
        },
        "status": "active",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "limit": 20,
      "total": 500,
      "totalPages": 25
    }
  },
  "message": "Products retrieved successfully"
}
```

---

### Get All Buyers (Admin)

```http
GET /api/admin/buyers
Authorization: Bearer <token>
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search by name, email, or phone
- `status` (optional): Filter by status (`active`, `blocked`)

**Response**:
```json
{
  "success": true,
  "data": {
    "buyers": [
      {
        "_id": "buyer_id",
        "name": "Buyer Name",
        "fullName": "Buyer Full Name",
        "email": "buyer@example.com",
        "phone": "9876543210",
        "phoneNumber": "9876543210",
        "isBlocked": false,
        "status": "active",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "registrationDate": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  },
  "message": "Buyers retrieved successfully"
}
```

---

## Stock Reduction Flow

### Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    ORDER CREATION                       │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │   Payment Method?             │
        └───────────────────────────────┘
                │              │
        ┌───────┴───────┐  ┌───┴────────────┐
        │      COD      │  │  Online Payment│
        └───────┬───────┘  └───┬────────────┘
                │              │
        ┌───────▼───────┐  ┌───▼────────────┐
        │ Stock Reduced │  │ Order Created  │
        │ Immediately   │  │ (Pending)      │
        └───────────────┘  └───┬────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Payment Verification│
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │ Payment Successful?  │
                    └──────────┬───────────┘
                    │          │
            ┌───────▼────┐ ┌───▼────────┐
            │   YES      │ │    NO      │
            └───────┬────┘ └───┬────────┘
                    │          │
        ┌───────────▼──┐  ┌────▼──────────┐
        │ Stock Reduced│  │ Order Failed  │
        │ Status:       │  │ No Stock      │
        │ Processing    │  │ Reduction     │
        └───────────────┘  └───────────────┘
```

### Code Locations

**COD Orders** (`routes/orders.js`):
```javascript
// Lines 58-68: Stock reduction for COD
if (paymentMethod === 'COD') {
    for (const item of orderItems) {
        await Gem.findByIdAndUpdate(item.gem, {
            $inc: {
                stock: -item.quantity,
                sales: item.quantity
            }
        });
    }
}
```

**Online Payment** (`routes/payments.js`):
```javascript
// Lines 290-300: Stock reduction after payment verification
if (payment.status === 'captured' || payment.status === 'authorized') {
    // Reduce stock when payment is confirmed
    for (const item of order.items) {
        await Gem.findByIdAndUpdate(item.gem, {
            $inc: {
                stock: -item.quantity,
                sales: item.quantity
            }
        });
    }
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "description": "Detailed error description"
  }
}
```

**Common Status Codes**:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Testing Checklist

### Stock Reduction
- [ ] COD order reduces stock immediately
- [ ] Online payment order doesn't reduce stock until payment verified
- [ ] Failed payment doesn't reduce stock
- [ ] Cancelled order restores stock (if stock was reduced)

### Seller Functionality
- [ ] Seller can view their orders
- [ ] Seller can see only their items in orders
- [ ] Seller can update order status
- [ ] Seller can add tracking number when shipping
- [ ] Seller can see current stock levels

### Admin Functionality
- [ ] Admin can view all orders
- [ ] Admin can view order details
- [ ] Admin can update order status
- [ ] Admin can view all sellers with stats
- [ ] Admin can view all products
- [ ] Admin can view dashboard statistics

---

**Last Updated**: January 2024  
**Version**: 1.0.0

