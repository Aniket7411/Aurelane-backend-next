# GST Frontend Integration Guide

## Overview
This guide provides all the information needed for frontend developers to integrate GST (Goods and Services Tax) functionality into the Aurelane application.

## GST Categories and Rates

| Value | Label | GST Rate | Use Case |
|-------|-------|----------|----------|
| `rough_unworked` | Rough/Unworked Precious & Semi-precious Stones | 0% | Uncut, unpolished gemstones |
| `cut_polished` | Cut & Polished Loose Gemstones (excl. diamonds) | 2% | **Most common** - Cut and polished gemstones (Ruby, Sapphire, Emerald, etc.) |
| `rough_diamonds` | Rough/Unpolished Diamonds | 0.25% | Uncut, unpolished diamonds |
| `cut_diamonds` | Cut & Polished Loose Diamonds | 1% | Cut and polished diamonds |

## API Endpoints

### 1. Add Gem with GST Category

**Endpoint**: `POST /api/gems`  
**Access**: Protected (Seller only)  
**Headers**: `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Emerald",
  "hindiName": "पन्ना",
  "category": "Emerald",
  "subcategory": "Zambian Emerald",
  "gstCategory": "cut_polished",
  "price": 50000,
  "sizeWeight": 5.5,
  "sizeUnit": "carat",
  "stock": 10,
  "description": "Beautiful natural emerald...",
  "benefits": ["Enhances intelligence", "Improves communication"],
  "suitableFor": ["Teachers", "Lawyers"],
  "certification": "Govt. Lab Certified",
  "origin": "Zambia",
  "deliveryDays": 7,
  "heroImage": "https://...",
  "additionalImages": ["https://...", "https://..."]
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
    "gstCategory": "cut_polished",
    "price": 50000,
    ...
  }
}
```

### 2. Update Gem GST Category (For Existing Gems)

**Endpoint**: `PUT /api/gems/:id`  
**Access**: Protected (Seller only - own gems)  
**Headers**: `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "gstCategory": "cut_polished"
}
```

**Or update multiple fields:**
```json
{
  "gstCategory": "cut_polished",
  "price": 55000,
  "stock": 8
}
```

**Response:**
```json
{
  "success": true,
  "message": "Gem updated successfully",
  "gem": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Emerald",
    "gstCategory": "cut_polished",
    "price": 55000,
    ...
  }
}
```

### 3. Get Gem Details (Includes GST Category)

**Endpoint**: `GET /api/gems/:id`  
**Access**: Public

**Response:**
```json
{
  "success": true,
  "gem": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Emerald",
    "gstCategory": "cut_polished",
    "price": 50000,
    ...
  }
}
```

### 4. Get Gems List (Includes GST Category)

**Endpoint**: `GET /api/gems`  
**Access**: Public

**Response:**
```json
{
  "success": true,
  "count": 45,
  "gems": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Emerald",
      "gstCategory": "cut_polished",
      "price": 50000,
      ...
    }
  ],
  "pagination": {...}
}
```

## Frontend Implementation

### 1. Add Gem Form

Add GST category dropdown to your Add Gem form:

```jsx
import React, { useState } from 'react';

const GST_CATEGORIES = [
  { value: 'rough_unworked', label: 'Rough/Unworked Precious & Semi-precious Stones (0% GST)' },
  { value: 'cut_polished', label: 'Cut & Polished Loose Gemstones (2% GST)' },
  { value: 'rough_diamonds', label: 'Rough/Unpolished Diamonds (0.25% GST)' },
  { value: 'cut_diamonds', label: 'Cut & Polished Loose Diamonds (1% GST)' }
];

function AddGemForm() {
  const [formData, setFormData] = useState({
    name: '',
    gstCategory: '', // Add this field
    price: '',
    // ... other fields
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/gems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.success) {
        // Handle success
      }
    } catch (error) {
      console.error('Error adding gem:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Other form fields */}
      
      <div>
        <label htmlFor="gstCategory">
          GST Category <span style={{color: 'red'}}>*</span>
        </label>
        <select
          id="gstCategory"
          name="gstCategory"
          value={formData.gstCategory}
          onChange={(e) => setFormData({...formData, gstCategory: e.target.value})}
          required
        >
          <option value="">Select GST Category</option>
          {GST_CATEGORIES.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        <small>
          Most gemstones use "Cut & Polished Loose Gemstones (2% GST)"
        </small>
      </div>
      
      <button type="submit">Add Gem</button>
    </form>
  );
}
```

### 2. Edit Gem Form (Update GST Category)

Add GST category field to your Edit Gem form:

```jsx
function EditGemForm({ gemId }) {
  const [gem, setGem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    // Fetch gem details
    fetch(`/api/gems/edit/${gemId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setGem(data.gem);
        setFormData({
          gstCategory: data.gem.gstCategory || '',
          // ... other fields
        });
      });
  }, [gemId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/gems/${gemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Gem updated successfully!');
      }
    } catch (error) {
      console.error('Error updating gem:', error);
    }
  };

  return (
    <form onSubmit={handleUpdate}>
      {/* Other form fields */}
      
      <div>
        <label htmlFor="gstCategory">GST Category</label>
        <select
          id="gstCategory"
          name="gstCategory"
          value={formData.gstCategory || ''}
          onChange={(e) => setFormData({...formData, gstCategory: e.target.value})}
        >
          <option value="">Select GST Category</option>
          {GST_CATEGORIES.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        {!gem?.gstCategory && (
          <small style={{color: 'orange'}}>
            ⚠️ GST category not set. Please select one for accurate tax calculation.
          </small>
        )}
      </div>
      
      <button type="submit">Update Gem</button>
    </form>
  );
}
```

### 3. Display GST Information on Gem Detail Page

```jsx
function GemDetailPage({ gemId }) {
  const [gem, setGem] = useState(null);

  useEffect(() => {
    fetch(`/api/gems/${gemId}`)
      .then(res => res.json())
      .then(data => setGem(data.gem));
  }, [gemId]);

  const getGSTRate = (gstCategory) => {
    const rates = {
      'rough_unworked': 0,
      'cut_polished': 2,
      'rough_diamonds': 0.25,
      'cut_diamonds': 1
    };
    return rates[gstCategory] || 0;
  };

  if (!gem) return <div>Loading...</div>;

  const gstRate = getGSTRate(gem.gstCategory);
  const priceWithGST = gem.price;
  const priceBeforeGST = gem.price / (1 + gstRate / 100);
  const gstAmount = priceWithGST - priceBeforeGST;

  return (
    <div>
      <h1>{gem.name}</h1>
      <p>Price: ₹{priceWithGST.toLocaleString()}</p>
      
      {gem.gstCategory && (
        <div>
          <p>
            GST ({gstRate}%): ₹{gstAmount.toFixed(2)} (included in price)
          </p>
          <small>Base Price: ₹{priceBeforeGST.toFixed(2)}</small>
        </div>
      )}
      
      {!gem.gstCategory && (
        <p style={{color: 'orange'}}>
          ⚠️ GST information not available for this gem
        </p>
      )}
    </div>
  );
}
```

### 4. Cart and Checkout (GST Calculation)

The backend automatically calculates GST when creating orders. You just need to include `gstCategory` in the cart items:

```jsx
// When adding to cart
const addToCart = async (gem, quantity) => {
  const cartItem = {
    gem: gem._id,
    quantity: quantity,
    price: gem.price, // Price with GST included
    gstCategory: gem.gstCategory // Include GST category
  };
  
  // Add to cart via your cart API
  await addCartItem(cartItem);
};

// When creating order
const createOrder = async (cartItems, shippingAddress) => {
  const orderData = {
    items: cartItems.map(item => ({
      gem: item.gem,
      quantity: item.quantity,
      price: item.price,
      gstCategory: item.gstCategory // Include GST category
    })),
    shippingAddress,
    paymentMethod: 'COD', // or 'Online'
    totalPrice: calculateTotal(cartItems) // Total with GST
  };
  
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(orderData)
  });
  
  return await response.json();
};
```

### 5. Display GST Breakdown in Order Summary

```jsx
function OrderSummary({ order }) {
  return (
    <div>
      <h3>Order Summary</h3>
      
      <div>
        <p>Subtotal: ₹{order.gstSummary?.subtotalBeforeGST || 0}</p>
        
        {order.gstSummary?.gstBreakdown?.map((gst, index) => (
          <p key={index}>
            GST ({gst.rate}%): ₹{gst.amount.toFixed(2)}
          </p>
        ))}
        
        <p>Total GST: ₹{order.gstSummary?.totalGST?.toFixed(2) || 0}</p>
        <p><strong>Total: ₹{order.totalPrice}</strong></p>
      </div>
    </div>
  );
}
```

## Important Notes for Frontend

### 1. GST Category Selection Guidelines
- **Most gemstones** (Ruby, Sapphire, Emerald, Pearl, Coral, etc.): Use `cut_polished` (2% GST)
- **Diamonds**: Use `cut_diamonds` (1% GST) for cut/polished, `rough_diamonds` (0.25% GST) for rough
- **Rough/Unworked stones**: Use `rough_unworked` (0% GST)

### 2. Price Handling
- **Price includes GST**: The price displayed and sent to backend already includes GST
- **Backend calculates base price**: Backend automatically calculates base price before GST
- **No frontend GST calculation needed**: Backend handles all GST calculations

### 3. Existing Gems Without GST Category
- Gems added before GST implementation may not have `gstCategory`
- Display a warning/notice to sellers to update GST category
- Orders for gems without GST category will have 0% GST

### 4. Validation
- GST category is **optional** for existing gems (backward compatibility)
- GST category is **recommended** for new gems
- Invalid GST category values will return 400 error

### 5. Error Handling

```jsx
try {
  const response = await fetch('/api/gems', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(formData)
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    if (data.errors) {
      // Handle validation errors
      data.errors.forEach(error => {
        if (error.param === 'gstCategory') {
          alert('Invalid GST category selected');
        }
      });
    } else {
      alert(data.message || 'Error adding gem');
    }
    return;
  }
  
  // Success
  alert('Gem added successfully!');
} catch (error) {
  console.error('Error:', error);
  alert('Network error. Please try again.');
}
```

## Testing Checklist

- [ ] Add gem form includes GST category dropdown
- [ ] GST category is saved when creating new gem
- [ ] Edit gem form allows updating GST category
- [ ] GST category is displayed on gem detail page
- [ ] GST information is included when adding to cart
- [ ] GST breakdown is shown in cart summary
- [ ] GST breakdown is shown in checkout
- [ ] GST breakdown is shown in order confirmation
- [ ] Error handling for invalid GST category
- [ ] Warning shown for gems without GST category

## API Response Examples

### Get Gem with GST
```json
{
  "success": true,
  "gem": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Emerald",
    "gstCategory": "cut_polished",
    "price": 50000,
    "category": "Emerald",
    ...
  }
}
```

### Create Order with GST
```json
{
  "success": true,
  "order": {
    "_id": "order_id",
    "items": [
      {
        "gem": "gem_id",
        "quantity": 1,
        "price": 10200,
        "gstCategory": "cut_polished",
        "gstRate": 2,
        "gstAmount": 200,
        "priceBeforeGST": 10000
      }
    ],
    "gstSummary": {
      "totalGST": 200,
      "gstBreakdown": [
        {
          "rate": 2,
          "amount": 200
        }
      ]
    },
    "totalPrice": 10200
  }
}
```

## Quick Reference

### GST Category Values (for dropdowns)
```javascript
const GST_CATEGORIES = [
  { value: 'rough_unworked', label: 'Rough/Unworked (0% GST)' },
  { value: 'cut_polished', label: 'Cut & Polished (2% GST)' },
  { value: 'rough_diamonds', label: 'Rough Diamonds (0.25% GST)' },
  { value: 'cut_diamonds', label: 'Cut Diamonds (1% GST)' }
];
```

### GST Rate Mapping
```javascript
const getGSTRate = (gstCategory) => {
  const rates = {
    'rough_unworked': 0,
    'cut_polished': 2,
    'rough_diamonds': 0.25,
    'cut_diamonds': 1
  };
  return rates[gstCategory] || 0;
};
```

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Backend API Base URL**: `http://localhost:5000/api` (Development)  
**Production API Base URL**: `https://aurelane-backend-next.onrender.com/api`

