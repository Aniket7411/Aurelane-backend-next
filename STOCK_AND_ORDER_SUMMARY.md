# Stock & Order Management Summary

## ✅ Stock Reduction Verification

### COD Orders
**Location**: `routes/orders.js` (Lines 58-68)
- ✅ Stock is reduced **immediately** when COD order is created
- ✅ Sales count is incremented
- ✅ Code executes before order is saved

### Online Payment Orders
**Location**: `routes/payments.js` (Lines 319-328)
- ✅ Stock is **NOT** reduced when payment order is created
- ✅ Stock is reduced **only after** payment verification succeeds
- ✅ If payment fails, stock remains unchanged
- ✅ Sales count is incremented on successful payment

---

## 📊 Seller Functionality

### ✅ What Sellers Can Do

1. **View Their Orders**
   - Endpoint: `GET /api/orders/seller/orders`
   - Shows only orders containing seller's items
   - Includes buyer information
   - Shows payment status
   - Includes pagination and filters

2. **View Stock Levels**
   - Endpoint: `GET /api/gems/my-gems`
   - Shows current stock for each gem
   - Shows availability status
   - Stock updates automatically when orders are placed

3. **Update Order Status**
   - Endpoint: `PUT /api/orders/:id/status`
   - Can update: `pending`, `processing`, `shipped`, `delivered`, `cancelled`
   - Can add tracking number when shipping
   - Only for orders containing seller's items

4. **View Order Details**
   - Endpoint: `GET /api/orders/:id`
   - See full order information
   - View buyer details
   - See all items in order

---

## 👨‍💼 Admin Functionality

### ✅ What Admins Can Do

1. **View All Orders**
   - Endpoint: `GET /api/admin/orders`
   - See all orders from all buyers
   - Filter by status, search by order number
   - Pagination support

2. **View Order Details**
   - Endpoint: `GET /api/admin/orders/:orderId`
   - Complete order information
   - Buyer details
   - Seller information for each item
   - Payment details
   - Status history

3. **Update Order Status**
   - Endpoint: `PUT /api/admin/orders/:orderId/status`
   - Can update any order status
   - Can add tracking numbers
   - Full control over order lifecycle

4. **View All Sellers**
   - Endpoint: `GET /api/admin/sellers`
   - List all sellers with stats
   - Total gems, orders, revenue
   - Verification status
   - Search and filter capabilities

5. **View Seller Details**
   - Endpoint: `GET /api/admin/sellers/:sellerId`
   - Complete seller profile
   - Seller's gems list
   - Order statistics
   - Revenue information

6. **View All Products**
   - Endpoint: `GET /api/admin/products`
   - All gems in the system
   - Filter by category, seller, status
   - Stock information
   - Search functionality

7. **View All Buyers**
   - Endpoint: `GET /api/admin/buyers`
   - List all buyers
   - Order history
   - Account status

8. **Dashboard Statistics**
   - Endpoint: `GET /api/admin/dashboard/stats`
   - Total buyers, sellers, products, orders
   - Revenue statistics
   - Order status breakdown
   - Monthly revenue trends
   - Recent activity metrics

---

## 🔄 Order Status Flow

```
pending → processing → shipped → delivered
         ↓
      cancelled
```

**Status Descriptions**:
- `pending`: Order placed, awaiting processing
- `processing`: Order being prepared (after payment for online orders)
- `shipped`: Order shipped with tracking number
- `delivered`: Order delivered to buyer
- `cancelled`: Order cancelled (stock restored if applicable)

---

## 💰 Payment Status Flow

```
pending → completed (on successful payment)
       → failed (on payment failure)
```

**Payment Status Descriptions**:
- `pending`: Payment not initiated or in progress
- `completed`: Payment successful (stock reduced)
- `failed`: Payment failed (stock not reduced)
- `refunded`: Payment refunded

---

## 📦 Stock Management Rules

### When Stock is Reduced:
1. ✅ **COD Orders**: Immediately on order creation
2. ✅ **Online Payment**: After payment verification succeeds

### When Stock is NOT Reduced:
1. ❌ Payment order creation (waiting for payment)
2. ❌ Payment failure
3. ❌ Payment cancellation

### When Stock is Restored:
1. ✅ Order cancellation (if stock was already reduced)
2. ✅ Payment refund (if applicable)

---

## 🧪 Testing Checklist

### Stock Reduction
- [x] COD order reduces stock immediately
- [x] Online payment order doesn't reduce stock until payment verified
- [x] Failed payment doesn't reduce stock
- [x] Stock updates reflected in seller's gem list

### Seller Features
- [x] Seller can view their orders
- [x] Seller sees only their items in orders
- [x] Seller can update order status
- [x] Seller can add tracking number
- [x] Seller can see current stock levels

### Admin Features
- [x] Admin can view all orders
- [x] Admin can view order details
- [x] Admin can update order status
- [x] Admin can view all sellers with stats
- [x] Admin can view all products
- [x] Admin can view dashboard statistics
- [x] Admin can view all buyers

---

## 📝 Important Notes

1. **Stock Reduction Timing**:
   - COD: Immediate (at order creation)
   - Online: After payment verification (not at order creation)

2. **Seller Order View**:
   - Only shows items belonging to the seller
   - Total price calculated for seller's items only
   - Includes stock information for each gem

3. **Admin Access**:
   - Full access to all orders, sellers, buyers, products
   - Can update any order status
   - Can view complete statistics

4. **Order Cancellation**:
   - Stock is restored when order is cancelled
   - Only if stock was already reduced
   - Uses `restoreStock()` method in Order model

---

**Last Updated**: January 2024  
**Version**: 1.0.0

