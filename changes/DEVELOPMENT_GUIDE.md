# 🛠️ Development Setup Guide - CORS & Rate Limit Fixed

## ✅ **FIXES APPLIED**

### **1. Rate Limiting - DISABLED in Development**
- **Before**: 5 requests per 15 minutes (too strict!)
- **After**: Rate limiting completely DISABLED when `NODE_ENV=development`
- **Production**: Still has rate limiting when `NODE_ENV=production`

### **2. CORS - ALLOWS ALL in Development**
- **Before**: Only specific domains allowed
- **After**: ALL origins allowed when `NODE_ENV=development`
- **Production**: Still restricts to specific domains

---

## 🚀 **How to Run Local Development**

### **Step 1: Create .env file**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/jewellery
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jewellery

# JWT Secret
JWT_SECRET=9e120d5295e12f34e59466606fe10e4c

# JWT Expiration
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development
# ☝️ IMPORTANT: Keep as 'development' for local work

# Optional Email (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### **Step 2: Install Dependencies**
```bash
npm install
```

### **Step 3: Start Development Server**
```bash
npm run dev
```

You should see:
```
Server running on port 5000
Environment: development
Rate limiting disabled (development mode)
MongoDB connected successfully
```

---

## 🔥 **What Changed**

### **Before (had issues):**
```javascript
// ❌ Applied to ALL routes (including /api/auth twice!)
app.use('/api/auth', authLimiter);  // 5 requests/15min
app.use('/api/otp', otpLimiter);    // 3 requests/min
app.use(generalLimiter);            // 100 requests/15min
```

### **After (fixed):**
```javascript
// ✅ Only in production
if (process.env.NODE_ENV === 'production') {
    app.use('/api/auth', authLimiter);  // 100 requests/15min
    app.use('/api/otp', otpLimiter);    // 10 requests/min
    app.use(generalLimiter);            // 1000 requests/15min
} else {
    console.log('Rate limiting disabled (development mode)');
}
```

### **CORS Before (strict):**
```javascript
// ❌ Only specific origins allowed
const allowedOrigins = ['http://localhost:3000', 'https://auralaneweb.vercel.app'];
```

### **CORS After (flexible):**
```javascript
// ✅ Allow all in development
if (process.env.NODE_ENV !== 'production') {
    return callback(null, true); // Allow ALL origins
}
```

---

## 🧪 **Testing**

### **1. Test Health Check:**
```bash
curl http://localhost:5000/api/health
```

**Expected:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-10-09T12:00:00.000Z"
}
```

### **2. Test Signup:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"123456","role":"buyer"}'
```

### **3. Test Get Gems:**
```bash
curl http://localhost:5000/api/gems
```

### **4. Test from Frontend:**
Open your frontend and try to register/login - should work without CORS errors!

---

## 🎯 **Environment Settings**

### **For Local Development:**
```env
NODE_ENV=development  ✅ Use this
```
**Benefits:**
- ✅ No rate limiting
- ✅ All CORS origins allowed
- ✅ Detailed error messages
- ✅ Unlimited requests

### **For Production (Render/Vercel):**
```env
NODE_ENV=production  ✅ Use this on Render
```
**Benefits:**
- ✅ Rate limiting enabled
- ✅ CORS restricted to trusted domains
- ✅ Better security
- ✅ Production optimizations

---

## 🔧 **Common Issues & Solutions**

### **Issue: Still getting 429 error**
**Solution 1:** Check your `.env` file has `NODE_ENV=development`
**Solution 2:** Restart your server after changing `.env`
```bash
# Stop server (Ctrl+C)
# Start again
npm run dev
```

### **Issue: CORS error on localhost**
**Solution:** Make sure `NODE_ENV=development` in your `.env` file

### **Issue: CORS error on Vercel deployment**
**Solution:** 
1. Set `NODE_ENV=production` on Render
2. The allowed origins already include `https://auralaneweb.vercel.app`

---

## 📊 **Rate Limit Comparison**

| Endpoint Type | Development | Production |
|---------------|-------------|------------|
| Auth endpoints | ♾️ Unlimited | 100/15min |
| OTP endpoints | ♾️ Unlimited | 10/min |
| Other endpoints | ♾️ Unlimited | 1000/15min |
| CORS Origins | 🌐 All allowed | 🔒 Restricted |

---

## ⚡ **Quick Commands**

### **Start Development Server:**
```bash
npm run dev
```

### **Check Environment:**
```bash
# Should show "development"
echo $NODE_ENV  # Mac/Linux
echo %NODE_ENV%  # Windows

# Or check in code - server prints it on startup
```

### **Clear Rate Limit (if stuck):**
Just restart the server:
```bash
# Ctrl+C to stop
npm run dev
```

---

## 🎉 **You're All Set!**

Now you can:
- ✅ Make unlimited requests during development
- ✅ No more CORS errors on localhost
- ✅ No more 429 rate limit errors
- ✅ Smooth frontend-backend integration

Just make sure your `.env` has `NODE_ENV=development` and restart your server!

When deploying to production (Render), set `NODE_ENV=production` in the environment variables to enable security features.

---

**Happy coding! 🚀**

