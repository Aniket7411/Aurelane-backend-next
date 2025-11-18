# Admin Features Documentation

## Overview
This document provides a comprehensive guide to all admin features, API endpoints, and routes for the Aurelane Next e-commerce platform. This documentation is intended for backend developers to implement the required APIs.

---

## Table of Contents
1. [Authentication & Authorization](#authentication--authorization)
2. [Admin Dashboard](#admin-dashboard)
3. [Seller Management](#seller-management)
4. [Buyer Management](#buyer-management)
5. [Product Management](#product-management)
6. [Order Management](#order-management)
7. [Frontend Routes](#frontend-routes)
8. [API Response Formats](#api-response-formats)
9. [Error Handling](#error-handling)

---

## Authentication & Authorization

### Admin Login
- **Route**: `/admin`
- **Component**: `AdminLogin` (`app/reactcomponents/components/auth/admin.jsx`)
- **API Endpoint**: `POST /api/auth/admin/login`
- **Request Body**:
  ```json
  {
    "email": "admin@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "token": "jwt_token_here",
    "user": {
      "id": "admin_id",
      "email": "admin@example.com",
      "role": "admin",
      "name": "Admin Name"
    }
  }
  ```

### Authorization
- All admin routes require:
  - Valid JWT token in Authorization header: `Bearer <token>`
  - User role must be `"admin"`
- Protected routes automatically redirect to `/login` if not authenticated
- Protected routes redirect to `/` if user role is not `"admin"`

---

## Admin Dashboard

### Dashboard Overview
- **Route**: `/admin-dashboard`
- **Component**: `AdminDashboard` (`app/reactcomponents/pages/AdminDashboard.js`)
- **Features**:
  - Total Buyers count
  - Total Sellers count
  - Total Products count
  - Total Orders count
  - Blocked Buyers count
  - Blocked Sellers count
  - Pending Orders count
  - Total Revenue

### API Endpoint: Get Dashboard Stats
- **Method**: `GET`
- **Endpoint**: `/api/admin/dashboard/stats`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
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
      "totalRevenue": 2500000
    }
  }
  ```
- **Fallback**: If this endpoint is not available, the frontend will fetch individual stats from:
  - `/api/admin/buyers`
  - `/api/admin/sellers`
  - `/api/admin/products`
  - `/api/admin/orders`

---

## Seller Management

### List All Sellers
- **Route**: `/admin/sellers`
- **Component**: `AdminSellers` (`app/reactcomponents/components/admin/allsellers.jsx`)
- **API Endpoint**: `GET /api/admin/sellers`
- **Query Parameters**:
  - `page` (number, optional): Page number (default: 1)
  - `limit` (number, optional): Items per page (default: 20)
  - `search` (string, optional): Search by name, email, or shop name
  - `status` (string, optional): Filter by status (`active`, `pending`, `suspended`, `blocked`)
- **Response**:
  ```json
  {
    "success": true,
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
  ```

### Get Seller by ID
- **Route**: `/admin/sellers/:sellerId`
- **Component**: `SellerDetails` (`app/reactcomponents/components/admin/sellerdetail.jsx`)
- **API Endpoint**: `GET /api/admin/sellers/:sellerId`
- **Response**:
  ```json
  {
    "success": true,
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
  ```

### Update Seller Status
- **API Endpoint**: `PUT /api/admin/sellers/:sellerId/status`
- **Request Body**:
  ```json
  {
    "status": "approved" | "suspended" | "rejected"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Seller status updated successfully",
    "seller": { /* updated seller object */ }
  }
  ```

### Block Seller
- **API Endpoint**: `PUT /api/admin/sellers/:sellerId/block`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Seller blocked successfully",
    "seller": { /* updated seller object */ }
  }
  ```

### Unblock Seller
- **API Endpoint**: `PUT /api/admin/sellers/:sellerId/unblock`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Seller unblocked successfully",
    "seller": { /* updated seller object */ }
  }
  ```

### Delete Seller
- **API Endpoint**: `DELETE /api/admin/sellers/:sellerId`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Seller deleted successfully"
  }
  ```
- **Note**: This should also delete all associated gems/products

---

## Buyer Management

### List All Buyers
- **Route**: `/admin/buyers`
- **Component**: `AdminBuyers` (`app/reactcomponents/pages/AdminBuyers.js`)
- **API Endpoint**: `GET /api/admin/buyers`
- **Query Parameters**:
  - `search` (string, optional): Search by name, email, or phone
  - `status` (string, optional): Filter by status (`active`, `blocked`)
- **Response**:
  ```json
  {
    "success": true,
    "buyers": [
      {
        "_id": "buyer_id",
        "name": "Buyer Name",
        "fullName": "Full Buyer Name",
        "email": "buyer@example.com",
        "phone": "1234567890",
        "phoneNumber": "1234567890",
        "isBlocked": false,
        "status": "active",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "registrationDate": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
  ```

### Get Buyer by ID
- **API Endpoint**: `GET /api/admin/buyers/:buyerId`
- **Response**:
  ```json
  {
    "success": true,
    "buyer": {
      "_id": "buyer_id",
      "name": "Buyer Name",
      "email": "buyer@example.com",
      "phone": "1234567890",
      "addresses": [/* address objects */],
      "orders": [/* order objects */],
      "isBlocked": false,
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### Block Buyer
- **API Endpoint**: `PUT /api/admin/buyers/:buyerId/block`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Buyer blocked successfully",
    "buyer": { /* updated buyer object */ }
  }
  ```

### Unblock Buyer
- **API Endpoint**: `PUT /api/admin/buyers/:buyerId/unblock`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Buyer unblocked successfully",
    "buyer": { /* updated buyer object */ }
  }
  ```

---

## Product Management

### List All Products
- **Route**: `/admin/products`
- **Component**: `AdminProducts` (`app/reactcomponents/pages/AdminProducts.js`)
- **API Endpoint**: `GET /api/admin/products`
- **Query Parameters**:
  - `page` (number, optional): Page number
  - `limit` (number, optional): Items per page
  - `search` (string, optional): Search by product name, category, or seller
  - `category` (string, optional): Filter by category
  - `sellerId` (string, optional): Filter by seller ID
  - `status` (string, optional): Filter by status
- **Response**:
  ```json
  {
    "success": true,
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
  ```

### Get Product by ID
- **API Endpoint**: `GET /api/admin/products/:productId`
- **Response**:
  ```json
  {
    "success": true,
    "product": {
      "_id": "product_id",
      "name": "Product Name",
      "category": "Diamond",
      "price": 50000,
      "stock": 10,
      "images": ["image_url"],
      "description": "Product description",
      "seller": { /* seller object */ },
      "specifications": { /* specifications object */ },
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### Delete Product
- **API Endpoint**: `DELETE /api/admin/products/:productId`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Product deleted successfully"
  }
  ```

---

## Order Management

### List All Orders
- **Route**: `/admin/orders`
- **Component**: `AdminOrders` (`app/reactcomponents/pages/AdminOrders.js`)
- **API Endpoint**: `GET /api/admin/orders`
- **Query Parameters**:
  - `search` (string, optional): Search by order ID, buyer name, or email
  - `status` (string, optional): Filter by status (`pending`, `processing`, `shipped`, `delivered`, `cancelled`)
- **Response**:
  ```json
  {
    "success": true,
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
    ]
  }
  ```

### Get Order by ID
- **API Endpoint**: `GET /api/admin/orders/:orderId`
- **Response**:
  ```json
  {
    "success": true,
    "order": {
      "_id": "order_id",
      "buyer": { /* buyer object */ },
      "items": [/* items array */],
      "shippingAddress": { /* address object */ },
      "paymentDetails": { /* payment object */ },
      "totalAmount": 50000,
      "status": "pending",
      "trackingNumber": "TRACK123456",
      "statusHistory": [
        {
          "status": "pending",
          "timestamp": "2024-01-01T00:00:00.000Z"
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### Update Order Status
- **API Endpoint**: `PUT /api/admin/orders/:orderId/status`
- **Request Body**:
  ```json
  {
    "status": "pending" | "processing" | "shipped" | "delivered" | "cancelled",
    "trackingNumber": "TRACK123456" // Required if status is "shipped"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Order status updated successfully",
    "order": { /* updated order object */ }
  }
  ```
- **Note**: When status is set to `"shipped"`, `trackingNumber` is required

---

## Frontend Routes

### Admin Routes
All admin routes are protected and require admin authentication:

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin` | `AdminLogin` | Admin login page |
| `/admin-dashboard` | `AdminDashboard` | Main admin dashboard with stats |
| `/admin/sellers` | `AdminSellers` | List all sellers |
| `/admin/sellers/:sellerId` | `SellerDetails` | View seller details |
| `/admin/buyers` | `AdminBuyers` | List all buyers |
| `/admin/products` | `AdminProducts` | List all products |
| `/admin/orders` | `AdminOrders` | List all orders |

### Route Protection
- All admin routes use `ProtectedRoute` component
- Checks for authentication and admin role
- Redirects to `/login` if not authenticated
- Redirects to `/` if user is not an admin

---

## API Response Formats

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information (optional)"
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [/* array of items */],
  "pagination": {
    "currentPage": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## Error Handling

### HTTP Status Codes
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions (not admin)
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

### Error Messages
All error responses should include a clear `message` field explaining what went wrong.

---

## Additional Features

### Search Functionality
- All list endpoints support search via `search` query parameter
- Search should be case-insensitive
- Search should work across multiple fields (name, email, etc.)

### Filtering
- Status filters: `active`, `pending`, `suspended`, `blocked`, `cancelled`
- Category filters for products
- Date range filters (optional, for future implementation)

### Sorting
- Default sorting: Most recent first (`createdAt` descending)
- Optional sorting parameters (for future implementation):
  - `sortBy`: Field to sort by
  - `sortOrder`: `asc` or `desc`

---

## Implementation Notes

### Authentication
- JWT tokens should be stored in localStorage or httpOnly cookies
- Token expiration should be handled gracefully
- Refresh token mechanism (if implemented) should be transparent

### Data Consistency
- When blocking/unblocking users, ensure all related data is updated
- When deleting sellers, cascade delete their products
- When updating order status, maintain status history

### Performance
- Implement pagination for all list endpoints
- Use database indexes for search and filter operations
- Consider caching for dashboard stats

### Security
- Validate all input data
- Sanitize user inputs
- Implement rate limiting
- Log all admin actions for audit trail

---

## Testing Checklist

### Seller Management
- [ ] List sellers with pagination
- [ ] Search sellers by name/email/shop
- [ ] Filter sellers by status
- [ ] View seller details
- [ ] Approve seller
- [ ] Suspend seller
- [ ] Reject seller
- [ ] Block seller
- [ ] Unblock seller
- [ ] Delete seller (with cascade delete)

### Buyer Management
- [ ] List buyers
- [ ] Search buyers
- [ ] Filter buyers by status
- [ ] View buyer details
- [ ] Block buyer
- [ ] Unblock buyer

### Product Management
- [ ] List all products
- [ ] Search products
- [ ] Filter products by category/seller
- [ ] View product details
- [ ] Delete product

### Order Management
- [ ] List all orders
- [ ] Search orders
- [ ] Filter orders by status
- [ ] View order details
- [ ] Update order status
- [ ] Add tracking number for shipped orders

### Dashboard
- [ ] Fetch dashboard stats
- [ ] Fallback to individual stats if dashboard endpoint unavailable
- [ ] Display all metrics correctly

---

## Future Enhancements

### Analytics
- Sales reports
- Revenue charts
- User growth metrics
- Product performance analytics

### Advanced Features
- Bulk operations (bulk block/unblock)
- Export data (CSV/Excel)
- Email notifications for admin actions
- Activity logs and audit trail
- Admin user management
- Role-based permissions

---

## Contact & Support

For questions or clarifications about this documentation, please contact the frontend development team.

**Last Updated**: 2024-01-XX
**Version**: 1.0.0

