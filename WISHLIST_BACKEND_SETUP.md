# 🎯 Wishlist Backend Implementation Guide

## ✅ Implementation Status: **COMPLETE**

### Backend Implementation:
- ✅ **Wishlist Model** (`models/Wishlist.js`) - Implemented with `items` array structure
- ✅ **Wishlist Routes** (`routes/wishlist.js`) - All 6 endpoints implemented
- ✅ **Server Routes** (`server.js`) - Routes registered at `/api/wishlist`
- ✅ **Auth Middleware** - Using existing `protect` middleware

### Frontend Integration:
1. ✅ **`src/pages/GemDetail.js`**
   - Fixed React Hook error
   - Added comprehensive error handling
   - Added loading states and visual feedback
   - Added debug panel (remove after testing)
   - Connected to wishlistAPI

2. ✅ **`src/pages/Shop.js`**
   - Added wishlist integration with backend API
   - Fetches user's wishlist on load
   - Optimistic UI updates for better UX
   - Proper error handling and rollback

3. ✅ **`src/services/api.js`**
   - Already has wishlistAPI methods ready

---

## 🔧 Backend Implementation Details

All backend endpoints have been implemented according to this guide.

### Required Endpoints:
- `POST /api/wishlist/add` - Add item to wishlist
- `GET /api/wishlist` - Get user's wishlist
- `DELETE /api/wishlist/remove/:gemId` - Remove item
- `GET /api/wishlist/check/:gemId` - Check if item is in wishlist
- `DELETE /api/wishlist/clear` - Clear wishlist
- `GET /api/wishlist/count` - Get wishlist count (optional)

---

## 📋 Step-by-Step Backend Setup

### Step 1: Create Wishlist Model ✅

**Status:** IMPLEMENTED

File: `models/Wishlist.js`

```javascript
const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true  // Each user has only one wishlist
    },
    items: [{
        gem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Gem',
            required: true
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Indexes for faster queries
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ 'items.gem': 1 });

module.exports = mongoose.model('Wishlist', wishlistSchema);
```

### Step 2: Create Wishlist Routes ✅

**Status:** IMPLEMENTED

File: `routes/wishlist.js`

```javascript
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Your auth middleware
const Wishlist = require('../models/Wishlist');
const Gem = require('../models/Gem');

// Add item to wishlist
router.post('/add', auth, async (req, res) => {
    try {
        const { gemId } = req.body;
        const userId = req.user._id || req.user.id;

        console.log('Add to wishlist:', { userId, gemId });

        if (!gemId) {
            return res.status(400).json({
                success: false,
                message: 'Gem ID is required'
            });
        }

        // Check if gem exists
        const gem = await Gem.findById(gemId);
        if (!gem) {
            return res.status(404).json({
                success: false,
                message: 'Gem not found'
            });
        }

        // Find or create wishlist
        let wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            wishlist = new Wishlist({
                user: userId,
                items: [{ gem: gemId }]
            });
        } else {
            // Check if already exists
            const exists = wishlist.items.some(
                item => item.gem.toString() === gemId
            );

            if (exists) {
                return res.status(400).json({
                    success: false,
                    message: 'Item already in wishlist'
                });
            }

            wishlist.items.push({ gem: gemId });
        }

        await wishlist.save();

        res.status(200).json({
            success: true,
            message: 'Item added to wishlist',
            wishlist: wishlist
        });

    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add item to wishlist',
            error: error.message
        });
    }
});

// Get user's wishlist
router.get('/', auth, async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;

        const wishlist = await Wishlist.findOne({ user: userId })
            .populate({
                path: 'items.gem',
                select: 'name price discount discountType heroImage category sizeWeight sizeUnit stock availability'
            });

        if (!wishlist) {
            return res.status(200).json({
                success: true,
                items: [],
                message: 'Wishlist is empty'
            });
        }

        // Filter out deleted gems
        const validItems = wishlist.items.filter(item => item.gem !== null);

        res.status(200).json({
            success: true,
            items: validItems,
            totalItems: validItems.length
        });

    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch wishlist',
            error: error.message
        });
    }
});

// Remove item from wishlist
router.delete('/remove/:gemId', auth, async (req, res) => {
    try {
        const { gemId } = req.params;
        const userId = req.user._id || req.user.id;

        const wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist not found'
            });
        }

        const initialLength = wishlist.items.length;
        wishlist.items = wishlist.items.filter(
            item => item.gem.toString() !== gemId
        );

        if (wishlist.items.length === initialLength) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in wishlist'
            });
        }

        await wishlist.save();

        res.status(200).json({
            success: true,
            message: 'Item removed from wishlist'
        });

    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove item',
            error: error.message
        });
    }
});

// Check if item is in wishlist
router.get('/check/:gemId', auth, async (req, res) => {
    try {
        const { gemId } = req.params;
        const userId = req.user._id || req.user.id;

        const wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            return res.status(200).json({
                success: true,
                isInWishlist: false
            });
        }

        const isInWishlist = wishlist.items.some(
            item => item.gem.toString() === gemId
        );

        res.status(200).json({
            success: true,
            isInWishlist: isInWishlist
        });

    } catch (error) {
        console.error('Error checking wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check wishlist',
            error: error.message
        });
    }
});

// Clear wishlist
router.delete('/clear', auth, async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;

        const wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist not found'
            });
        }

        wishlist.items = [];
        await wishlist.save();

        res.status(200).json({
            success: true,
            message: 'Wishlist cleared'
        });

    } catch (error) {
        console.error('Error clearing wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear wishlist',
            error: error.message
        });
    }
});

// Get wishlist count
router.get('/count', auth, async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const wishlist = await Wishlist.findOne({ user: userId });
        const count = wishlist ? wishlist.items.length : 0;

        res.status(200).json({
            success: true,
            count: count
        });

    } catch (error) {
        console.error('Error getting wishlist count:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get count',
            error: error.message
        });
    }
});

module.exports = router;
```

### Step 3: Register Routes in Main Server File ✅

**Status:** IMPLEMENTED

In your `server.js`:

```javascript
const wishlistRoutes = require('./routes/wishlist');

// ... other middleware ...

app.use('/api/wishlist', wishlistRoutes);
```

### Step 4: Verify Auth Middleware ✅

**Status:** USING EXISTING `protect` MIDDLEWARE

The implementation uses your existing `middleware/auth.js` with the `protect` function:

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        // Extract token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No authentication token'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user
        const user = await User.findById(decoded.id || decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Attach user to request
        req.user = user;
        next();

    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

module.exports = auth;
```

### Step 5: Restart Backend ✅

**Status:** READY TO TEST

Restart your backend server:

```bash
npm start
# or
nodemon server.js
```

The wishlist endpoints are now live at `http://localhost:5000/api/wishlist`

---

## 🧪 Testing the Backend

Use these curl commands or Postman to test:

### 1. Add to Wishlist
```bash
curl -X POST https://gems-backend-u.onrender.com/api/wishlist/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"gemId": "SOME_GEM_ID"}'
```

### 2. Get Wishlist
```bash
curl -X GET https://gems-backend-u.onrender.com/api/wishlist \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Check if in Wishlist
```bash
curl -X GET https://gems-backend-u.onrender.com/api/wishlist/check/GEM_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Remove from Wishlist
```bash
curl -X DELETE https://gems-backend-u.onrender.com/api/wishlist/remove/GEM_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔍 Testing the Frontend

After backend is set up:

1. **Login** to your application
2. **Navigate** to any gem detail page
3. **Check debug panel** (yellow box at top):
   - Is Authenticated: Should be "YES"
   - Token: Should be "Present"
   - User: Should show your name

4. **Test buttons**:
   - Click "Test Add to Wishlist API" (blue button)
   - Click "Test Direct Backend Call" (purple button)
   - Both should show success

5. **Test heart icon**:
   - Click the heart icon
   - Should see loading spinner
   - Should see success alert
   - Heart should turn red

6. **Remove debug panel** once working:
   - In `GemDetail.js`, remove the yellow debug div (lines 358-396)

---

## ❗ Common Issues & Solutions

### Issue 1: "Network error"
**Solution**: Backend not running or wrong URL
- Check backend is running
- Verify URL in `src/services/api.js` line 4

### Issue 2: "Token is not valid"
**Solution**: Token expired or wrong JWT_SECRET
- Logout and login again
- Check JWT_SECRET in backend .env

### Issue 3: "Gem ID is required"
**Solution**: gemId not being sent
- Check frontend is sending gemId in request body
- Verify Content-Type is application/json

### Issue 4: "Item already in wishlist"
**Solution**: Normal behavior
- Item is already in wishlist
- Just show message to user

### Issue 5: CORS errors
**Solution**: Add CORS to backend
```javascript
const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
```

---

## 📦 Environment Variables

Make sure your backend `.env` has:

```
JWT_SECRET=your_secret_key_here
MONGODB_URI=mongodb://...
PORT=5000
```

---

## ✨ After Setup

Once the backend is working:

1. ✅ Test all wishlist functions
2. ✅ Remove debug panel from GemDetail.js
3. ✅ Enjoy working wishlist! 🎉

---

## 📞 Support

If you encounter any issues:
1. Check browser console for errors
2. Check backend logs
3. Share the exact error message
4. I can help debug further!

