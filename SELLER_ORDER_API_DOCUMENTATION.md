# Seller Order Management API Documentation

## 📋 Table of Contents

1. [Base Configuration](#base-configuration)
2. [Authentication](#authentication)
3. [Order Flow Overview](#order-flow-overview)
4. [Get Seller's Orders](#get-sellers-orders)
5. [Get Seller Order by ID](#get-seller-order-by-id)
6. [Update Order Status](#update-order-status)
7. [Get Seller Order Statistics](#get-seller-order-statistics)
8. [Order Status Flow](#order-status-flow)
9. [Stock Management Rules](#stock-management-rules)
10. [Error Handling](#error-handling)

---

## Base Configuration

**Base URL**: `http://localhost:5000/api` (Development)  
**Production URL**: `https://aurelane-backend-next.onrender.com/api`  
**Content-Type**: `application/json`  
**Authentication**: Bearer Token (JWT) in `Authorization` header

```javascript
Authorization: Bearer <your_jwt_token>
```

---

## Authentication

All seller endpoints require:
- Valid JWT token in `Authorization` header
- User role must be `seller`
- Seller account must be approved/active

---

## Order Flow Overview

### Complete Order Lifecycle

```
┌─────────────────────────────────────────────────────────┐
│              ORDER CREATION (Buyer)                      │
│  - COD: Stock reduced immediately                        │
│  - Online: Stock reduced after payment verification      │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │   Order Status: PENDING       │
        │   Seller sees order in list    │
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │   Seller Updates Status        │
        │   Status: PROCESSING           │
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │   Seller Marks as SHIPPED     │
        │   Tracking Number Required     │
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │   Order Status: DELIVERED     │
        │   (Updated by Admin/Buyer)     │
        └───────────────────────────────┘
```

### Status Transitions (Seller)

**Allowed Transitions:**
- `pending` → `processing` ✅
- `pending` → `cancelled` ✅
- `processing` → `shipped` ✅ (requires tracking number)
- `processing` → `cancelled` ✅
- `shipped` → `delivered` ❌ (Admin only)
- `delivered` → ❌ (Final state)
- `cancelled` → ❌ (Final state)

---

## Get Seller's Orders

Retrieve all orders containing items belonging to the authenticated seller.

### Endpoint

```http
GET /api/orders/seller/orders
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number for pagination |
| `limit` | number | No | 20 | Number of items per page |
| `status` | string | No | - | Filter by order status (`pending`, `processing`, `shipped`, `delivered`, `cancelled`) |
| `paymentStatus` | string | No | - | Filter by payment status (`pending`, `completed`, `failed`) |

### Request Example

```http
GET /api/orders/seller/orders?status=processing&page=1&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response Structure

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
            "subcategory": "Burma Ruby",
            "heroImage": "https://example.com/image.jpg",
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
      "shippingAddress": {
        "name": "John Doe",
        "phone": "9876543210",
        "addressLine1": "123 Main Street",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001",
        "country": "India"
      },
      "trackingNumber": null,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "limit": 20,
    "totalPages": 2,
    "total": 25
  }
}
```

### Response Fields

**Order Object:**
- `_id`: Order unique identifier
- `orderNumber`: Human-readable order number (e.g., "ORD-2024-000001")
- `buyer`: Buyer information object
- `items`: Array of order items (only items belonging to this seller)
- `totalPrice`: Total price for seller's items only
- `status`: Current order status
- `paymentStatus`: Payment status (`pending`, `completed`, `failed`)
- `paymentMethod`: Payment method (`COD`, `Online`)
- `shippingAddress`: Shipping address object
- `trackingNumber`: Tracking number (null if not shipped)
- `createdAt`: Order creation timestamp
- `updatedAt`: Last update timestamp

**Item Object:**
- `_id`: Item unique identifier
- `gem`: Gem/product details object
- `quantity`: Quantity ordered
- `price`: Unit price
- `subtotal`: Quantity × Price

**Gem Object:**
- `_id`: Gem unique identifier
- `name`: Gem name
- `category`: Gem category
- `subcategory`: Gem subcategory
- `heroImage`: Primary image URL
- `price`: Current price
- `stock`: Current stock level

### Features

- ✅ Returns only orders containing seller's items
- ✅ Calculates total for seller's items only
- ✅ Includes current gem stock information
- ✅ Shows payment status and method
- ✅ Supports pagination
- ✅ Supports filtering by status and payment status

### Error Responses

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Unauthorized. Please login.",
  "error": {
    "code": "UNAUTHORIZED",
    "description": "Invalid or missing authentication token"
  }
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Access denied. Seller role required.",
  "error": {
    "code": "FORBIDDEN",
    "description": "User does not have seller permissions"
  }
}
```

---

## Get Seller Order by ID

Retrieve detailed information about a specific order.

### Endpoint

```http
GET /api/orders/seller/orders/:orderId
Authorization: Bearer <token>
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `orderId` | string | Yes | Order unique identifier (`_id`) |

### Request Example

```http
GET /api/orders/seller/orders/507f1f77bcf86cd799439011
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response Structure

```json
{
  "success": true,
  "order": {
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
          "subcategory": "Burma Ruby",
          "heroImage": "https://example.com/image.jpg",
          "images": ["url1", "url2"],
          "price": 50000,
          "stock": 5,
          "sizeWeight": 5.2,
          "sizeUnit": "carat"
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
    "shippingAddress": {
      "name": "John Doe",
      "phone": "9876543210",
      "addressLine1": "123 Main Street",
      "addressLine2": "Apt 4B",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "country": "India"
    },
    "trackingNumber": null,
    "statusHistory": [
      {
        "status": "pending",
        "timestamp": "2024-01-15T10:30:00.000Z"
      },
      {
        "status": "processing",
        "timestamp": "2024-01-15T11:00:00.000Z"
      }
    ],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

### Error Responses

**404 Not Found:**
```json
{
  "success": false,
  "message": "Order not found",
  "error": {
    "code": "ORDER_NOT_FOUND",
    "description": "Order does not exist or does not contain seller's items"
  }
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Access denied. This order does not contain your items.",
  "error": {
    "code": "FORBIDDEN",
    "description": "Seller can only access orders containing their items"
  }
}
```

---

## Update Order Status

Update the status of an order. Seller can only update orders containing their items.

### Endpoint

```http
PUT /api/orders/:orderId/status
Authorization: Bearer <token>
Content-Type: application/json
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `orderId` | string | Yes | Order unique identifier (`_id`) |

### Request Body

```json
{
  "status": "shipped",
  "trackingNumber": "TRACK123456789"
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | Yes | New order status (see Status Values below) |
| `trackingNumber` | string | Conditional | Required when status is `shipped` |

### Status Values

| Status | Description | Tracking Required | Can Transition From |
|--------|-------------|-------------------|---------------------|
| `pending` | Order placed, not yet processed | No | - |
| `processing` | Order being prepared | No | `pending` |
| `shipped` | Order shipped | **Yes** | `processing` |
| `delivered` | Order delivered | No | `shipped` (Admin only) |
| `cancelled` | Order cancelled | No | `pending`, `processing` |

### Request Examples

**Update to Processing:**
```http
PUT /api/orders/507f1f77bcf86cd799439011/status
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "status": "processing"
}
```

**Update to Shipped (with tracking):**
```http
PUT /api/orders/507f1f77bcf86cd799439011/status
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "status": "shipped",
  "trackingNumber": "TRACK123456789"
}
```

**Cancel Order:**
```http
PUT /api/orders/507f1f77bcf86cd799439011/status
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "status": "cancelled"
}
```

### Response Structure

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

### Validation Rules

1. ✅ Seller can only update orders containing their items
2. ✅ Tracking number is **required** when status is `shipped`
3. ✅ Status must be a valid enum value
4. ✅ Status transition must be valid (see Status Flow section)
5. ✅ Cannot update orders that are already `delivered` or `cancelled`
6. ✅ Cannot update to `delivered` (Admin only)

### Error Responses

**400 Bad Request - Missing Tracking Number:**
```json
{
  "success": false,
  "message": "Tracking number is required when status is 'shipped'",
  "error": {
    "code": "VALIDATION_ERROR",
    "description": "trackingNumber field is required for shipped status"
  }
}
```

**400 Bad Request - Invalid Status:**
```json
{
  "success": false,
  "message": "Invalid status value",
  "error": {
    "code": "VALIDATION_ERROR",
    "description": "Status must be one of: pending, processing, shipped, delivered, cancelled"
  }
}
```

**400 Bad Request - Invalid Status Transition:**
```json
{
  "success": false,
  "message": "Invalid status transition",
  "error": {
    "code": "INVALID_TRANSITION",
    "description": "Cannot transition from 'delivered' to 'processing'"
  }
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Access denied. This order does not contain your items.",
  "error": {
    "code": "FORBIDDEN",
    "description": "Seller can only update orders containing their items"
  }
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Order not found",
  "error": {
    "code": "ORDER_NOT_FOUND",
    "description": "Order does not exist"
  }
}
```

---

## Get Seller Order Statistics

Get aggregated statistics for seller's orders.

### Endpoint

```http
GET /api/orders/seller/orders/stats
Authorization: Bearer <token>
```

### Request Example

```http
GET /api/orders/seller/orders/stats
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response Structure

```json
{
  "success": true,
  "stats": {
    "totalOrders": 150,
    "pendingOrders": 15,
    "processingOrders": 30,
    "shippedOrders": 25,
    "deliveredOrders": 70,
    "cancelledOrders": 10,
    "totalRevenue": 7500000,
    "pendingRevenue": 500000,
    "completedRevenue": 7000000
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `totalOrders` | number | Total number of orders (all statuses) |
| `pendingOrders` | number | Orders with status `pending` |
| `processingOrders` | number | Orders with status `processing` |
| `shippedOrders` | number | Orders with status `shipped` |
| `deliveredOrders` | number | Orders with status `delivered` |
| `cancelledOrders` | number | Orders with status `cancelled` |
| `totalRevenue` | number | Total revenue from all orders (in paise/100 = rupees) |
| `pendingRevenue` | number | Revenue from pending orders |
| `completedRevenue` | number | Revenue from delivered orders |

### Notes

- Revenue is calculated only for seller's items in each order
- Revenue values are in the smallest currency unit (paise for INR)
- Statistics are calculated in real-time from database
- Only includes orders containing seller's items

---

## Order Status Flow

### Status Transition Diagram

```
                    ┌─────────┐
                    │ PENDING │
                    └────┬────┘
                         │
            ┌────────────┼────────────┐
            │                         │
            ▼                         ▼
    ┌───────────────┐         ┌──────────────┐
    │  PROCESSING   │         │  CANCELLED   │
    └───────┬───────┘         └──────────────┘
            │
            │ (with tracking)
            ▼
    ┌───────────────┐
    │   SHIPPED     │
    └───────┬───────┘
            │
            │ (Admin only)
            ▼
    ┌───────────────┐
    │  DELIVERED    │
    └───────────────┘
```

### Status Descriptions

**Pending:**
- Initial state when order is created
- Order is waiting to be processed
- Seller can update to `processing` or `cancelled`

**Processing:**
- Order is being prepared by seller
- Items are being packed
- Seller can update to `shipped` or `cancelled`

**Shipped:**
- Order has been shipped
- Tracking number is required and stored
- Only Admin can update to `delivered`

**Delivered:**
- Order has been delivered to buyer
- Final state (cannot be changed)
- Revenue is counted in completed revenue

**Cancelled:**
- Order has been cancelled
- Final state (cannot be changed)
- Stock may need to be restored (if applicable)

---

## Stock Management Rules

### Stock Reduction Flow

**COD Orders:**
- Stock is reduced **immediately** when order is created
- If order is cancelled, stock should be restored

**Online Payment Orders:**
- Stock is **NOT** reduced when order is created
- Stock is reduced **only after payment verification**
- If payment fails, stock remains unchanged

### Stock Restoration

When an order is cancelled:
1. Check if stock was already reduced
2. If yes, restore the stock quantity
3. Update gem availability if stock becomes > 0

### Implementation Notes

```javascript
// COD Order - Stock reduced immediately
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

// Online Payment - Stock reduced after verification
if (payment.status === 'captured' || payment.status === 'authorized') {
    for (const item of order.items) {
        await Gem.findByIdAndUpdate(item.gem, {
            $inc: {
                stock: -item.quantity,
                sales: item.quantity
            }
        });
    }
}

// Order Cancellation - Restore stock
if (newStatus === 'cancelled' && order.status !== 'cancelled') {
    // Check if stock was reduced (payment completed or COD)
    if (order.paymentStatus === 'completed' || order.paymentMethod === 'COD') {
        for (const item of order.items) {
            await Gem.findByIdAndUpdate(item.gem, {
                $inc: {
                    stock: item.quantity,
                    sales: -item.quantity
                }
            });
        }
    }
}
```

---

## Error Handling

### Standard Error Response Format

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

### Common HTTP Status Codes

| Code | Description | When It Occurs |
|------|-------------|----------------|
| `200` | Success | Request completed successfully |
| `400` | Bad Request | Validation error, invalid parameters |
| `401` | Unauthorized | Missing or invalid authentication token |
| `403` | Forbidden | User doesn't have seller role or order doesn't belong to seller |
| `404` | Not Found | Order not found |
| `500` | Internal Server Error | Server-side error |

### Common Error Codes

| Error Code | Description | Solution |
|------------|-------------|----------|
| `UNAUTHORIZED` | Missing or invalid token | Include valid JWT token in Authorization header |
| `FORBIDDEN` | Access denied | Ensure user has seller role and order contains seller's items |
| `ORDER_NOT_FOUND` | Order doesn't exist | Verify order ID is correct |
| `VALIDATION_ERROR` | Invalid request data | Check required fields and data types |
| `INVALID_TRANSITION` | Invalid status change | Follow allowed status transitions |
| `MISSING_TRACKING` | Tracking number required | Provide tracking number when status is `shipped` |

---

## Testing Checklist

### Get Seller Orders
- [ ] Returns only orders with seller's items
- [ ] Pagination works correctly
- [ ] Status filter works
- [ ] Payment status filter works
- [ ] Returns correct total for seller's items only

### Get Order by ID
- [ ] Returns order details if contains seller's items
- [ ] Returns 403 if order doesn't contain seller's items
- [ ] Returns 404 if order doesn't exist
- [ ] Includes all required fields

### Update Order Status
- [ ] Can update from `pending` to `processing`
- [ ] Can update from `processing` to `shipped` (with tracking)
- [ ] Requires tracking number for `shipped` status
- [ ] Cannot update to `delivered` (admin only)
- [ ] Cannot update orders that don't contain seller's items
- [ ] Cannot update final states (`delivered`, `cancelled`)
- [ ] Status history is updated correctly

### Get Order Statistics
- [ ] Returns correct counts for each status
- [ ] Revenue calculated correctly (seller's items only)
- [ ] Statistics are real-time and accurate

### Stock Management
- [ ] COD orders reduce stock immediately
- [ ] Online orders reduce stock after payment
- [ ] Cancelled orders restore stock (if applicable)
- [ ] Stock updates reflect in gem availability

---

## API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/orders/seller/orders` | Get seller's orders | ✅ Seller |
| `GET` | `/api/orders/seller/orders/:orderId` | Get order details | ✅ Seller |
| `PUT` | `/api/orders/:orderId/status` | Update order status | ✅ Seller |
| `GET` | `/api/orders/seller/orders/stats` | Get order statistics | ✅ Seller |

---

## Implementation Notes for Backend

### Database Schema Considerations

**Order Model:**
- Store `seller` reference in order items
- Track status history in `statusHistory` array
- Store `trackingNumber` when status is `shipped`
- Include `paymentStatus` and `paymentMethod`

**Order Item Model:**
- Reference to `gem` (product)
- Reference to `seller` (who owns the gem)
- Store `quantity`, `price`, `subtotal`

### Authorization Middleware

```javascript
// Verify seller can access order
const verifySellerOrder = async (req, res, next) => {
    const order = await Order.findById(req.params.orderId)
        .populate('items.gem');
    
    const sellerId = req.user._id;
    const hasSellerItems = order.items.some(
        item => item.gem.seller.toString() === sellerId.toString()
    );
    
    if (!hasSellerItems) {
        return res.status(403).json({
            success: false,
            message: "Access denied. This order does not contain your items."
        });
    }
    
    req.order = order;
    next();
};
```

### Status Update Validation

```javascript
const validateStatusUpdate = (currentStatus, newStatus, trackingNumber) => {
    // Check if status transition is valid
    const validTransitions = {
        'pending': ['processing', 'cancelled'],
        'processing': ['shipped', 'cancelled'],
        'shipped': ['delivered'], // Admin only
        'delivered': [], // Final state
        'cancelled': [] // Final state
    };
    
    if (!validTransitions[currentStatus]?.includes(newStatus)) {
        throw new Error('Invalid status transition');
    }
    
    // Check tracking number requirement
    if (newStatus === 'shipped' && !trackingNumber) {
        throw new Error('Tracking number is required for shipped status');
    }
};
```

### Statistics Calculation

```javascript
const calculateSellerStats = async (sellerId) => {
    const orders = await Order.find({
        'items.gem.seller': sellerId
    });
    
    const stats = {
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        processingOrders: orders.filter(o => o.status === 'processing').length,
        shippedOrders: orders.filter(o => o.status === 'shipped').length,
        deliveredOrders: orders.filter(o => o.status === 'delivered').length,
        cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
        totalRevenue: 0,
        pendingRevenue: 0,
        completedRevenue: 0
    };
    
    orders.forEach(order => {
        // Calculate revenue for seller's items only
        const sellerItems = order.items.filter(
            item => item.gem.seller.toString() === sellerId.toString()
        );
        const orderRevenue = sellerItems.reduce(
            (sum, item) => sum + (item.price * item.quantity), 0
        );
        
        stats.totalRevenue += orderRevenue;
        
        if (order.status === 'pending') {
            stats.pendingRevenue += orderRevenue;
        } else if (order.status === 'delivered') {
            stats.completedRevenue += orderRevenue;
        }
    });
    
    return stats;
};
```

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**API Base URL**: `http://localhost:5000/api` (Development)

