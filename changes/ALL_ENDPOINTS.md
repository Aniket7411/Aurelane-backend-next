# 📡 Complete API Endpoints List - Quick Reference

## 🌐 Base URL
```
Production: https://gems-backend-zfpw.onrender.com/api
Local: http://localhost:5000/api
```

---

## 🔐 **AUTHENTICATION ENDPOINTS**

| # | Method | Endpoint | Access | Description |
|---|--------|----------|--------|-------------|
| 1 | POST | `/auth/signup` | Public | Signup (buyer/seller) |
| 2 | POST | `/auth/register` | Public | Register (alternative) |
| 3 | POST | `/auth/login` | Public | Login (all roles) |
| 4 | POST | `/auth/admin/login` | Public | Admin login |
| 5 | GET | `/auth/me` | Protected | Get current user |
| 6 | GET | `/auth/profile` | Protected | Get profile |
| 7 | PUT | `/auth/profile` | Protected | Update profile |
| 8 | PUT | `/auth/change-password` | Protected | Change password |
| 9 | POST | `/auth/forgot-password` | Public | Forgot password |
| 10 | POST | `/auth/reset-password/:token` | Public | Reset password |
| 11 | GET | `/auth/verify-email/:token` | Public | Verify email |

---

## 💎 **GEM ENDPOINTS**

| # | Method | Endpoint | Access | Description |
|---|--------|----------|--------|-------------|
| 1 | POST | `/gems` | Seller | Add new gem |
| 2 | GET | `/gems` | Public | Get all gems |
| 3 | GET | `/gems/my-gems` | Seller | Get seller's gems |
| 4 | GET | `/gems/:id` | Public | Get single gem |
| 5 | PUT | `/gems/:id` | Seller | Update own gem |
| 6 | DELETE | `/gems/:id` | Seller | Delete own gem |

---

## 🛒 **CART ENDPOINTS**

| # | Method | Endpoint | Access | Description |
|---|--------|----------|--------|-------------|
| 1 | POST | `/cart` | Buyer | Add to cart |
| 2 | GET | `/cart` | Buyer | Get cart |
| 3 | PUT | `/cart/:itemId` | Buyer | Update cart item |
| 4 | DELETE | `/cart/:itemId` | Buyer | Remove from cart |
| 5 | DELETE | `/cart` | Buyer | Clear cart |

---

## 📦 **ORDER ENDPOINTS**

| # | Method | Endpoint | Access | Description |
|---|--------|----------|--------|-------------|
| 1 | POST | `/orders` | Buyer | Create order |
| 2 | GET | `/orders/my-orders` | Buyer | Get buyer's orders |
| 3 | GET | `/orders/seller/orders` | Seller | Get seller's orders |
| 4 | GET | `/orders/:id` | Protected | Get single order |
| 5 | PUT | `/orders/:id/cancel` | Buyer | Cancel order |
| 6 | PUT | `/orders/:id/status` | Seller | Update order status |

---

## 👨‍💼 **SELLER PROFILE ENDPOINTS**

| # | Method | Endpoint | Access | Description |
|---|--------|----------|--------|-------------|
| 1 | GET | `/seller/profile` | Seller | Get seller profile |
| 2 | PUT | `/seller/profile` | Seller | Create/Update profile |

---

## 👤 **USER PROFILE ENDPOINTS**

| # | Method | Endpoint | Access | Description |
|---|--------|----------|--------|-------------|
| 1 | GET | `/user/profile` | Buyer | Get user profile |
| 2 | PUT | `/user/profile` | Buyer | Update user profile |

---

## 👔 **ADMIN ENDPOINTS**

| # | Method | Endpoint | Access | Description |
|---|--------|----------|--------|-------------|
| 1 | GET | `/admin/sellers` | Admin | Get all sellers + stats |
| 2 | GET | `/admin/sellers/:id` | Admin | Get seller details |
| 3 | PUT | `/admin/sellers/:id/verify` | Admin | Verify seller |
| 4 | DELETE | `/admin/sellers/:id` | Admin | Delete seller |
| 5 | GET | `/admin/orders` | Admin | Get all orders |
| 6 | GET | `/admin/gems` | Admin | Get all gems |

---

## 📱 **OTP ENDPOINTS**

| # | Method | Endpoint | Access | Description |
|---|--------|----------|--------|-------------|
| 1 | POST | `/otp/send` | Public | Send OTP |
| 2 | POST | `/otp/verify` | Public | Verify OTP |

---

## 🏥 **UTILITY ENDPOINTS**

| # | Method | Endpoint | Access | Description |
|---|--------|----------|--------|-------------|
| 1 | GET | `/health` | Public | Health check |

---

## 📊 **TOTAL: 39 ENDPOINTS**

- Authentication: 11
- Gems: 6
- Cart: 5
- Orders: 6
- Seller Profile: 2
- User Profile: 2
- Admin: 6
- OTP: 2
- Utility: 1

---

## 🎯 **MAIN ENDPOINTS YOU'LL USE**

### **For Admin Panel:**
```
POST   /api/auth/login                    - Login as admin
GET    /api/admin/sellers                 - List all sellers
GET    /api/admin/sellers/:id             - Seller details
PUT    /api/admin/sellers/:id/verify      - Verify seller
DELETE /api/admin/sellers/:id             - Delete seller
```

### **For Seller Dashboard:**
```
GET    /api/seller/profile                - Get profile
PUT    /api/seller/profile                - Update profile
POST   /api/gems                          - Add gem
GET    /api/gems/my-gems                  - My gems
GET    /api/orders/seller/orders          - My orders
```

### **For Buyer:**
```
GET    /api/gems                          - Browse gems
POST   /api/cart                          - Add to cart
GET    /api/cart                          - View cart
POST   /api/orders                        - Place order
GET    /api/orders/my-orders              - My orders
```

---

## 🔐 **ADMIN CREDENTIALS**

**To create admin user:**
```bash
node createAdmin.js
```

**Credentials:**
```
Email: admin@admin.com
Password: admin123
```

**Login Response will have:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "Admin",
    "email": "admin@admin.com",
    "role": "admin"  ← Check this in frontend
  }
}
```

---

## 🧪 **Quick Test Commands**

```bash
# 1. Health check
curl http://localhost:5000/api/health

# 2. Admin login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin123"}'

# 3. Get all sellers (use token from step 2)
curl http://localhost:5000/api/admin/sellers \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Seller signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Raj Kumar","email":"raj@gemstore.com","password":"123456","role":"seller"}'

# 5. Update seller profile (use seller token)
curl -X PUT http://localhost:5000/api/seller/profile \
  -H "Authorization: Bearer SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Raj Kumar Gems","phone":"9876543210","shopName":"Raj Gems",...}'
```

---

## ✅ **ALL READY FOR YOUR PROJECT SUBMISSION!**

Every endpoint from `newbackendendpoints.md` is implemented and working! 🎉
