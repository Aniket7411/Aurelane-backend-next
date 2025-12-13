# Gem Editing Guide

## Backend API Endpoints

### 1. Get Gem for Editing (NEW)
**Endpoint**: `GET /api/gems/edit/:id`  
**Access**: Protected (Seller only - own gems)  
**Headers**: `Authorization: Bearer <seller_token>`

**Response**:
```json
{
  "success": true,
  "gem": {
    "_id": "6936995c5ec3332c3373cb5e",
    "name": "Burma Ruby",
    "hindiName": "बर्मा माणिक",
    // ... all gem fields
  }
}
```

**Error Responses**:
- `400`: Invalid gem ID format
- `403`: Not authorized (gem doesn't belong to seller)
- `404`: Gem not found

### 2. Update Gem
**Endpoint**: `PUT /api/gems/:id`  
**Access**: Protected (Seller only - own gems)  
**Headers**: `Authorization: Bearer <seller_token>`

**Request Body** (all fields optional):
```json
{
  "name": "Updated Name",
  "price": 55000,
  "stock": 8,
  "description": "Updated description",
  "heroImage": "https://...",
  "additionalImages": ["https://...", "https://..."]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Gem updated successfully",
  "gem": {
    "_id": "6936995c5ec3332c3373cb5e",
    "name": "Updated Name",
    // ... updated fields
  }
}
```

## Frontend Route Issue

The 404 error you're seeing is from the **frontend route**, not the backend API.

**Current URL**: `https://aurelane-frontend-next.vercel.app/edit-gem/?id=6936995c5ec3332c3373cb5e`

### Frontend Fix Needed:

1. **Create the page file**: Create `/pages/edit-gem.js` or `/app/edit-gem/page.js` (depending on Next.js version)

2. **Example Next.js Pages Router** (`/pages/edit-gem.js`):
```javascript
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function EditGem() {
  const router = useRouter();
  const { id } = router.query;
  const [gem, setGem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchGem();
    }
  }, [id]);

  const fetchGem = async () => {
    try {
      const token = localStorage.getItem('token'); // or your auth method
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/gems/edit/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setGem(response.data.gem);
    } catch (error) {
      console.error('Error fetching gem:', error);
      // Handle error (404, 403, etc.)
    } finally {
      setLoading(false);
    }
  };

  const updateGem = async (gemData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/gems/${id}`,
        gemData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      // Handle success
      router.push('/seller/dashboard'); // or wherever
    } catch (error) {
      console.error('Error updating gem:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!gem) return <div>Gem not found</div>;

  return (
    <div>
      <h1>Edit Gem: {gem.name}</h1>
      {/* Your edit form here */}
    </div>
  );
}
```

3. **Example Next.js App Router** (`/app/edit-gem/page.js`):
```javascript
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function EditGemPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [gem, setGem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchGem();
    }
  }, [id]);

  const fetchGem = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/gems/edit/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setGem(response.data.gem);
    } catch (error) {
      console.error('Error fetching gem:', error);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component
}
```

## Testing the Backend API

You can test the backend API directly:

```bash
# Get gem for editing
curl -X GET "http://localhost:5000/api/gems/edit/6936995c5ec3332c3373cb5e" \
  -H "Authorization: Bearer YOUR_SELLER_TOKEN"

# Update gem
curl -X PUT "http://localhost:5000/api/gems/6936995c5ec3332c3373cb5e" \
  -H "Authorization: Bearer YOUR_SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 55000,
    "stock": 8,
    "description": "Updated description"
  }'
```

## Summary

✅ **Backend is ready**: 
- `GET /api/gems/edit/:id` - Get gem for editing (seller only)
- `PUT /api/gems/:id` - Update gem (seller only)

❌ **Frontend needs fix**: 
- Create the `/edit-gem` page/route
- Use the new `/api/gems/edit/:id` endpoint to fetch gem data
- Use `/api/gems/:id` PUT endpoint to update

The 404 error is because the frontend route doesn't exist yet. Once you create the page, it should work!

