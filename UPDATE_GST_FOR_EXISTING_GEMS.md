# How to Update GST Category for Existing Gems

## Overview
This guide explains how to update the GST category for existing gems that were added before GST implementation.

## Backend API Endpoint

### Update Gem GST Category
**Endpoint**: `PUT /api/gems/:id`  
**Access**: Protected (Seller only - own gems)  
**Headers**: `Authorization: Bearer <seller_token>`

### Request Example

```http
PUT /api/gems/6936995c5ec3332c3373cb5e
Authorization: Bearer <your_seller_token>
Content-Type: application/json

{
  "gstCategory": "cut_polished"
}
```

### Request Body
You can update just the `gstCategory` field, or update it along with other fields:

```json
{
  "gstCategory": "cut_polished",
  "price": 55000,
  "stock": 10
}
```

### Valid GST Category Values

| Value | Description | GST Rate |
|-------|-------------|----------|
| `rough_unworked` | Rough/Unworked Precious & Semi-precious Stones | 0% |
| `cut_polished` | Cut & Polished Loose Gemstones (excl. diamonds) | 2% |
| `rough_diamonds` | Rough/Unpolished Diamonds | 0.25% |
| `cut_diamonds` | Cut & Polished Loose Diamonds | 1% |

### Response Example

**Success (200):**
```json
{
  "success": true,
  "message": "Gem updated successfully",
  "gem": {
    "_id": "6936995c5ec3332c3373cb5e",
    "name": "Burma Ruby",
    "gstCategory": "cut_polished",
    "price": 125000,
    ...
  }
}
```

**Error (400) - Invalid GST Category:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Invalid GST category. Must be one of: rough_unworked, cut_polished, rough_diamonds, cut_diamonds",
      "param": "gstCategory"
    }
  ]
}
```

**Error (403) - Not Authorized:**
```json
{
  "success": false,
  "message": "Not authorized to update this gem"
}
```

**Error (404) - Gem Not Found:**
```json
{
  "success": false,
  "message": "Gem not found"
}
```

## Frontend Implementation

### Using Axios/Fetch

```javascript
// Update GST category for a gem
const updateGemGST = async (gemId, gstCategory) => {
  try {
    const token = localStorage.getItem('token'); // or your auth method
    const response = await axios.put(
      `${API_URL}/api/gems/${gemId}`,
      { gstCategory },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('GST updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating GST:', error.response?.data || error.message);
    throw error;
  }
};

// Usage
await updateGemGST('6936995c5ec3332c3373cb5e', 'cut_polished');
```

### React Component Example

```javascript
import { useState } from 'react';
import axios from 'axios';

function UpdateGemGST({ gemId }) {
  const [gstCategory, setGstCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/gems/${gemId}`,
        { gstCategory },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setMessage('GST category updated successfully!');
      console.log('Updated gem:', response.data.gem);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error updating GST category');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpdate}>
      <label>
        GST Category:
        <select
          value={gstCategory}
          onChange={(e) => setGstCategory(e.target.value)}
          required
        >
          <option value="">Select GST Category</option>
          <option value="rough_unworked">Rough/Unworked (0% GST)</option>
          <option value="cut_polished">Cut & Polished (2% GST)</option>
          <option value="rough_diamonds">Rough Diamonds (0.25% GST)</option>
          <option value="cut_diamonds">Cut Diamonds (1% GST)</option>
        </select>
      </label>
      <button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update GST Category'}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}
```

## Bulk Update Script (Optional)

If you need to update multiple gems at once, you can create a script:

```javascript
// update-gems-gst.js
const mongoose = require('mongoose');
require('dotenv').config();
const Gem = require('./models/Gem');

const updateGemsGST = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Example: Update all diamonds to cut_diamonds category
    const result = await Gem.updateMany(
      { 
        category: 'Diamond',
        gstCategory: null // Only update gems without GST category
      },
      { 
        $set: { gstCategory: 'cut_diamonds' }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} gems`);

    // Example: Update all other gems to cut_polished
    const result2 = await Gem.updateMany(
      { 
        category: { $ne: 'Diamond' },
        gstCategory: null
      },
      { 
        $set: { gstCategory: 'cut_polished' }
      }
    );

    console.log(`✅ Updated ${result2.modifiedCount} more gems`);
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

updateGemsGST();
```

Run the script:
```bash
node update-gems-gst.js
```

## GST Category Selection Guide

### For Diamonds:
- **Cut & Polished Diamonds**: Use `cut_diamonds` (1% GST)
- **Rough/Unpolished Diamonds**: Use `rough_diamonds` (0.25% GST)

### For Other Gemstones (Ruby, Sapphire, Emerald, etc.):
- **Cut & Polished**: Use `cut_polished` (2% GST)
- **Rough/Unworked**: Use `rough_unworked` (0% GST)

### Default Recommendations:
- Most gemstones: `cut_polished` (2% GST)
- Diamonds: `cut_diamonds` (1% GST)

## Important Notes

1. **GST Category is Optional**: Existing gems without GST category will still work, but GST won't be calculated for orders
2. **Update Before Orders**: It's recommended to update GST categories before processing new orders
3. **Seller Authorization**: Only the seller who owns the gem can update it
4. **Validation**: Invalid GST category values will be rejected with a clear error message
5. **No Breaking Changes**: Gems without GST category can still be retrieved and displayed

## Testing

### Test Update via API:
```bash
curl -X PUT "http://localhost:5000/api/gems/YOUR_GEM_ID" \
  -H "Authorization: Bearer YOUR_SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"gstCategory": "cut_polished"}'
```

### Verify Update:
```bash
curl -X GET "http://localhost:5000/api/gems/YOUR_GEM_ID" \
  -H "Authorization: Bearer YOUR_SELLER_TOKEN"
```

Check that `gstCategory` is present in the response.

---

**Last Updated**: January 2024  
**Version**: 1.0.0

