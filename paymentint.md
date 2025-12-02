# Razorpay Payment Integration Guide

This document provides complete reference for integrating Razorpay payment gateway with the Auralane backend API.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Backend API Endpoints](#backend-api-endpoints)
3. [Payment Flow](#payment-flow)
4. [Frontend Integration Steps](#frontend-integration-steps)
5. [Request/Response Examples](#requestresponse-examples)
6. [Error Handling](#error-handling)
7. [Testing Guide](#testing-guide)
8. [Webhook Configuration](#webhook-configuration)

---

## Overview

The backend has been integrated with Razorpay payment gateway. The payment flow consists of:

1. **Create Payment Order**: Frontend requests payment order creation
2. **Initialize Razorpay**: Frontend initializes Razorpay checkout with order details
3. **User Payment**: User completes payment on Razorpay checkout
4. **Verify Payment**: Frontend verifies payment signature and updates order
5. **Webhook (Optional)**: Backend receives payment confirmation via webhook

---

## Backend API Endpoints

### Base URL
```
/api/payments
```

### 1. Create Payment Order

**Endpoint**: `POST /api/payments/create-order`

**Authentication**: Required (Bearer Token - Buyer role)

**Request Body**:
```json
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
    "addressLine2": "Apartment 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India"
  },
  "totalPrice": 50000
}
```

**Success Response** (201):
```json
{
  "success": true,
  "message": "Payment order created successfully",
  "order": {
    "_id": "order_id_here",
    "orderNumber": "ORD-2024-001",
    "totalPrice": 50000,
    "status": "pending",
    "paymentStatus": "pending",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "razorpayOrder": {
    "id": "order_IluGWxBm9U8zJ8",
    "amount": 5000000,
    "currency": "INR",
    "receipt": "ORD-2024-001",
    "status": "created"
  },
  "keyId": "rzp_test_xxxxxxxxxxxxx"
}
```

**Error Response** (400):
```json
{
  "success": false,
  "message": "Order amount must be at least ₹1.00",
  "error": {
    "code": "MIN_AMOUNT_ERROR",
    "description": "Order amount less than minimum amount allowed",
    "field": "totalPrice"
  }
}
```

**Notes**:
- `amount` in Razorpay response is in **paise** (multiply by 100)
- Minimum order amount: ₹1.00 (100 paise)
- The `keyId` is returned for frontend Razorpay initialization

---

### 2. Verify Payment

**Endpoint**: `POST /api/payments/verify-payment`

**Authentication**: Required (Bearer Token - Buyer role)

**Request Body**:
```json
{
  "razorpay_order_id": "order_IluGWxBm9U8zJ8",
  "razorpay_payment_id": "pay_xxxxxxxxxxxxx",
  "razorpay_signature": "signature_here",
  "orderId": "order_id_from_database"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "order": {
    "_id": "order_id_here",
    "orderNumber": "ORD-2024-001",
    "totalPrice": 50000,
    "status": "processing",
    "paymentStatus": "completed",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response** (400):
```json
{
  "success": false,
  "message": "Payment verification failed - Invalid signature"
}
```

**Notes**:
- Payment signature verification is done on both frontend and backend
- Order status changes to `processing` after successful payment
- Stock is reduced only after payment verification

---

### 3. Get Order Payment Status

**Endpoint**: `GET /api/payments/order-status/:orderId`

**Authentication**: Required (Bearer Token - Buyer role)

**Success Response** (200):
```json
{
  "success": true,
  "order": {
    "_id": "order_id_here",
    "orderNumber": "ORD-2024-001",
    "paymentStatus": "completed",
    "status": "processing",
    "razorpayOrderId": "order_IluGWxBm9U8zJ8",
    "razorpayPaymentId": "pay_xxxxxxxxxxxxx",
    "totalPrice": 50000,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Payment Status Values**:
- `pending`: Payment not initiated or in progress
- `completed`: Payment successful
- `failed`: Payment failed
- `refunded`: Payment refunded

---

## Payment Flow

### Complete Payment Flow Diagram

```
1. User clicks "Pay Now"
   ↓
2. Frontend: POST /api/payments/create-order
   ↓
3. Backend: Creates order + Razorpay order
   ↓
4. Frontend: Receives razorpayOrder + keyId
   ↓
5. Frontend: Initialize Razorpay Checkout
   ↓
6. User: Completes payment on Razorpay
   ↓
7. Razorpay: Returns payment details
   ↓
8. Frontend: POST /api/payments/verify-payment
   ↓
9. Backend: Verifies signature + Updates order
   ↓
10. Frontend: Shows success/error message
```

---

## Frontend Integration Steps

### Step 1: Install Razorpay SDK

```bash
npm install razorpay
# or
yarn add razorpay
```

### Step 2: Include Razorpay Script (Alternative)

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### Step 3: Create Payment Order

```javascript
// Create payment order
const createPaymentOrder = async (orderData) => {
  try {
    const response = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    const data = await response.json();
    
    if (data.success) {
      return data; // Contains razorpayOrder and keyId
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error creating payment order:', error);
    throw error;
  }
};
```

### Step 4: Initialize Razorpay Checkout

```javascript
// Initialize Razorpay
const initializeRazorpay = (razorpayOrder, keyId, orderId) => {
  const options = {
    key: keyId, // From backend response
    amount: razorpayOrder.amount, // Amount in paise
    currency: razorpayOrder.currency,
    name: 'Auralane',
    description: `Order ${razorpayOrder.receipt}`,
    order_id: razorpayOrder.id, // Razorpay order ID
    handler: async function (response) {
      // Payment successful - verify payment
      await verifyPayment(response, orderId);
    },
    prefill: {
      name: user.name,
      email: user.email,
      contact: user.phone
    },
    theme: {
      color: '#3399cc'
    },
    modal: {
      ondismiss: function() {
        // User closed the payment modal
        console.log('Payment cancelled');
      }
    }
  };

  const razorpay = new Razorpay(options);
  razorpay.open();
};
```

### Step 5: Verify Payment

```javascript
// Verify payment after successful Razorpay payment
const verifyPayment = async (razorpayResponse, orderId) => {
  try {
    const response = await fetch('/api/payments/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_signature: razorpayResponse.razorpay_signature,
        orderId: orderId
      })
    });

    const data = await response.json();
    
    if (data.success) {
      // Payment verified successfully
      showSuccessMessage('Payment successful!');
      // Redirect to order confirmation page
      window.location.href = `/orders/${orderId}`;
    } else {
      showErrorMessage(data.message || 'Payment verification failed');
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    showErrorMessage('Error verifying payment. Please contact support.');
  }
};
```

### Step 6: Complete Integration Example

```javascript
// Complete payment flow
const handlePayment = async () => {
  try {
    // 1. Prepare order data
    const orderData = {
      items: cartItems.map(item => ({
        gem: item.gem._id,
        quantity: item.quantity,
        price: item.gem.price
      })),
      shippingAddress: {
        name: shippingForm.name,
        phone: shippingForm.phone,
        addressLine1: shippingForm.addressLine1,
        addressLine2: shippingForm.addressLine2,
        city: shippingForm.city,
        state: shippingForm.state,
        pincode: shippingForm.pincode,
        country: shippingForm.country
      },
      totalPrice: calculateTotal()
    };

    // 2. Create payment order
    const paymentOrderResponse = await createPaymentOrder(orderData);
    
    // 3. Initialize Razorpay
    initializeRazorpay(
      paymentOrderResponse.razorpayOrder,
      paymentOrderResponse.keyId,
      paymentOrderResponse.order._id
    );

  } catch (error) {
    console.error('Payment error:', error);
    showErrorMessage(error.message || 'Failed to initiate payment');
  }
};
```

---

## Request/Response Examples

### Example 1: Create Payment Order

**Request**:
```http
POST /api/payments/create-order
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "items": [
    {
      "gem": "65f0123456789abcdef01234",
      "quantity": 1,
      "price": 50000
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "phone": "9876543210",
    "addressLine1": "123 Main Street",
    "addressLine2": "Apartment 4B",
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
    "_id": "65f0abcdef01234567890123",
    "orderNumber": "ORD-2024-001",
    "totalPrice": 50000,
    "status": "pending",
    "paymentStatus": "pending",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "razorpayOrder": {
    "id": "order_IluGWxBm9U8zJ8",
    "amount": 5000000,
    "currency": "INR",
    "receipt": "ORD-2024-001",
    "status": "created"
  },
  "keyId": "rzp_test_xxxxxxxxxxxxx"
}
```

### Example 2: Verify Payment

**Request**:
```http
POST /api/payments/verify-payment
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "razorpay_order_id": "order_IluGWxBm9U8zJ8",
  "razorpay_payment_id": "pay_xxxxxxxxxxxxx",
  "razorpay_signature": "a1b2c3d4e5f6...",
  "orderId": "65f0abcdef01234567890123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "order": {
    "_id": "65f0abcdef01234567890123",
    "orderNumber": "ORD-2024-001",
    "totalPrice": 50000,
    "status": "processing",
    "paymentStatus": "completed",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Error Handling

### Common Error Codes

| Error Code | Description | Solution |
|------------|-------------|----------|
| `MIN_AMOUNT_ERROR` | Order amount less than ₹1.00 | Ensure minimum order amount |
| `VALIDATION_ERROR` | Missing or invalid request fields | Check request body structure |
| `UNAUTHORIZED` | Invalid or missing authentication token | Verify user is logged in |
| `FORBIDDEN` | User doesn't have buyer role | Check user role |
| `NOT_FOUND` | Order not found | Verify order ID |
| `SIGNATURE_MISMATCH` | Payment signature verification failed | Retry payment or contact support |

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "description": "Detailed error description",
    "field": "field_name" // If validation error
  }
}
```

### Frontend Error Handling

```javascript
const handlePaymentError = (error) => {
  if (error.response) {
    const { message, error: errorDetails } = error.response.data;
    
    switch (errorDetails?.code) {
      case 'MIN_AMOUNT_ERROR':
        showErrorMessage('Order amount must be at least ₹1.00');
        break;
      case 'SIGNATURE_MISMATCH':
        showErrorMessage('Payment verification failed. Please contact support.');
        break;
      default:
        showErrorMessage(message || 'Payment failed. Please try again.');
    }
  } else {
    showErrorMessage('Network error. Please check your connection.');
  }
};
```

---

## Testing Guide

### Test Mode Setup

1. Use Razorpay test keys:
   - Key ID: `rzp_test_xxxxxxxxxxxxx`
   - Key Secret: `xxxxxxxxxxxxx`

2. Test Cards (Razorpay Test Mode):
   - **Success**: `4111 1111 1111 1111`
   - **Failure**: `4000 0000 0000 0002`
   - **3D Secure**: `4012 0010 3714 1112`
   - CVV: Any 3 digits
   - Expiry: Any future date

### Testing Checklist

- [ ] Create payment order with valid data
- [ ] Create payment order with minimum amount (₹1.00)
- [ ] Create payment order with invalid amount (< ₹1.00)
- [ ] Initialize Razorpay checkout
- [ ] Complete payment with success card
- [ ] Complete payment with failure card
- [ ] Verify payment signature
- [ ] Handle payment cancellation
- [ ] Check order status after payment
- [ ] Verify stock reduction after payment

### Test Scenarios

#### Scenario 1: Successful Payment
1. Create order with ₹100
2. Initialize Razorpay
3. Use test card: `4111 1111 1111 1111`
4. Complete payment
5. Verify payment
6. Check order status = `completed`

#### Scenario 2: Payment Failure
1. Create order
2. Initialize Razorpay
3. Use test card: `4000 0000 0000 0002`
4. Payment fails
5. Check order status = `failed`

#### Scenario 3: Payment Cancellation
1. Create order
2. Initialize Razorpay
3. Close payment modal
4. Order remains in `pending` status

---

## Webhook Configuration

### Webhook Endpoint

**URL**: `https://your-domain.com/api/payments/webhook`

### Supported Events

- `payment.captured`: Payment successfully captured
- `payment.failed`: Payment failed

### Webhook Setup (Razorpay Dashboard)

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-domain.com/api/payments/webhook`
3. Select events: `payment.captured`, `payment.failed`
4. Copy webhook secret
5. Add to `.env`: `RAZORPAY_WEBHOOK_SECRET=your_webhook_secret`

### Webhook Security

- Webhook signature is verified using HMAC SHA256
- Only verified webhooks are processed
- Invalid signatures are rejected

---

## Important Notes

### Amount Conversion

- **Backend sends**: Amount in paise (multiply by 100)
- **Frontend receives**: Amount in paise
- **Display**: Convert to rupees (divide by 100)

```javascript
// Convert paise to rupees for display
const amountInRupees = razorpayOrder.amount / 100;
```

### Order Status Flow

```
pending → processing → shipped → delivered
         ↓
      cancelled (if payment fails or user cancels)
```

### Payment Status Flow

```
pending → completed (on successful payment)
       → failed (on payment failure)
```

### Stock Management

- Stock is **NOT** reduced when order is created
- Stock is reduced **ONLY** after payment verification
- If payment fails, stock remains unchanged

### Security Best Practices

1. **Never expose** `RAZORPAY_KEY_SECRET` on frontend
2. Always verify payment signature on backend
3. Use HTTPS in production
4. Validate all user inputs
5. Implement rate limiting on payment endpoints

---

## Support & Troubleshooting

### Common Issues

**Issue**: "Order amount less than minimum amount allowed"
- **Solution**: Ensure order amount is at least ₹1.00

**Issue**: "Payment verification failed - Invalid signature"
- **Solution**: Check if correct payment details are sent

**Issue**: "Razorpay order not found"
- **Solution**: Verify order ID matches Razorpay order ID

### Debug Mode

Enable debug logging in backend:
```javascript
// In routes/payments.js
console.log('Razorpay Order:', razorpayOrder);
console.log('Payment Response:', paymentResponse);
```

---

## API Reference Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/payments/create-order` | POST | Buyer | Create payment order |
| `/api/payments/verify-payment` | POST | Buyer | Verify payment |
| `/api/payments/order-status/:orderId` | GET | Buyer | Get payment status |
| `/api/payments/webhook` | POST | Public | Razorpay webhook |

---

## Frontend Integration Checklist

- [ ] Install Razorpay SDK
- [ ] Create payment order API call
- [ ] Initialize Razorpay checkout
- [ ] Handle payment success callback
- [ ] Verify payment API call
- [ ] Handle payment failure
- [ ] Handle payment cancellation
- [ ] Show loading states
- [ ] Show success/error messages
- [ ] Redirect after successful payment
- [ ] Test with test cards
- [ ] Handle edge cases

---

**Last Updated**: January 2024
**Version**: 1.0.0

For questions or issues, contact the backend team.

