# 🎯 Complete Seller & Admin API Endpoints

## 🔐 **ADMIN CREDENTIALS**

```
Email: admin@admin.com
Password: admin123
Username: admin (will be converted to admin@admin.com)
```

**To create admin user, run:**
```bash
node createAdmin.js
```

---

## 📋 **ALL ENDPOINTS**

### **1. ADMIN LOGIN**

**Endpoint:**
```
POST /api/auth/admin/login
```

**Request Body:**
```json
{
  "email": "admin@admin.com",
  "password": "admin123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Admin login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Admin",
    "email": "admin@admin.com",
    "role": "admin"
  }
}
```

---

### **2. REGULAR LOGIN (Works for all roles)**

**Endpoint:**
```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "User Name",
    "email": "user@example.com",
    "phone": "+91 9876543210",
    "role": "admin"
  }
}
```

**Note:** Frontend should check `user.role === 'admin'` to grant admin access

---

## 👨‍💼 **SELLER PROFILE ENDPOINTS**

### **3. GET SELLER PROFILE** (Seller Only)

**Endpoint:**
```
GET /api/seller/profile
```

**Headers:**
```
Authorization: Bearer <seller_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "seller": {
    "_id": "507f1f77bcf86cd799439012",
    "user": "507f1f77bcf86cd799439010",
    "fullName": "Raj Kumar Gems",
    "email": "raj@gemstore.com",
    "phone": "9876543210",
    "alternatePhone": "9123456789",
    "shopName": "Raj Kumar Gems & Jewels",
    "shopType": "Retail Store",
    "businessType": "Individual Proprietorship",
    "yearEstablished": "2015",
    "address": {
      "street": "123 Gem Market, Chandni Chowk",
      "city": "Delhi",
      "state": "Delhi",
      "pincode": "110006",
      "country": "India"
    },
    "gstNumber": "07AABCU9603R1ZM",
    "panNumber": "ABCDE1234F",
    "aadharNumber": "123456789012",
    "bankName": "State Bank of India",
    "accountNumber": "12345678901234",
    "ifscCode": "SBIN0001234",
    "accountHolderName": "Raj Kumar",
    "businessDescription": "Established gem dealer with over 8 years of experience in precious and semi-precious gemstones.",
    "specialization": ["Loose Gemstones", "Certified Gems", "Custom Designs"],
    "gemTypes": ["Rubies", "Sapphires", "Diamonds", "Emeralds"],
    "website": "https://rajkumargems.com",
    "instagram": "@rajkumargems",
    "facebook": "RajKumarGems",
    "isVerified": true,
    "documentsUploaded": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-10-09T10:30:00.000Z"
  }
}
```

---

### **4. UPDATE SELLER PROFILE** (Seller Only)

**Endpoint:**
```
PUT /api/seller/profile
```

**Headers:**
```
Authorization: Bearer <seller_token>
Content-Type: application/json
```

**Request Body (Example - All fields optional except required ones):**
```json
{
  "fullName": "Raj Kumar Gems",
  "email": "raj@gemstore.com",
  "phone": "9876543210",
  "alternatePhone": "9123456789",
  "shopName": "Raj Kumar Gems & Jewels",
  "shopType": "Retail Store",
  "businessType": "Individual Proprietorship",
  "yearEstablished": "2015",
  "address": {
    "street": "123 Gem Market, Chandni Chowk",
    "city": "Delhi",
    "state": "Delhi",
    "pincode": "110006",
    "country": "India"
  },
  "gstNumber": "07AABCU9603R1ZM",
  "panNumber": "ABCDE1234F",
  "aadharNumber": "123456789012",
  "bankName": "State Bank of India",
  "accountNumber": "12345678901234",
  "ifscCode": "SBIN0001234",
  "accountHolderName": "Raj Kumar",
  "businessDescription": "Established gem dealer with over 8 years of experience in precious and semi-precious gemstones. Specializing in certified natural gems with lab certificates.",
  "specialization": ["Loose Gemstones", "Certified Gems", "Custom Designs"],
  "gemTypes": ["Rubies", "Sapphires", "Diamonds", "Emeralds"],
  "website": "https://rajkumargems.com",
  "instagram": "@rajkumargems",
  "facebook": "RajKumarGems",
  "documentsUploaded": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Seller profile updated successfully",
  "seller": {
    "_id": "507f1f77bcf86cd799439012",
    "fullName": "Raj Kumar Gems",
    "email": "raj@gemstore.com",
    "phone": "9876543210",
    // ... all updated fields
    "updatedAt": "2024-10-09T12:00:00.000Z"
  }
}
```

---

## 👔 **ADMIN ENDPOINTS - Seller Management**

### **5. GET ALL SELLERS** (Admin Only)

**Endpoint:**
```
GET /api/admin/sellers
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
```
?page=1
&limit=20
&search=raj
&status=verified
```

**Query Parameters Details:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search in fullName, email, shopName
- `status`: Filter by verification status ("verified" or "unverified")

**Success Response (200):**
```json
{
  "success": true,
  "count": 50,
  "totalPages": 3,
  "currentPage": 1,
  "sellers": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "fullName": "Raj Kumar Gems",
      "email": "raj@gemstore.com",
      "phone": "9876543210",
      "shopName": "Raj Kumar Gems & Jewels",
      "shopType": "Retail Store",
      "isVerified": true,
      "totalGems": 45,
      "totalOrders": 120,
      "totalRevenue": 5500000,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "fullName": "Mumbai Gems",
      "email": "mumbai@gems.com",
      "phone": "9988776655",
      "shopName": "Mumbai Gems & Jewellery",
      "shopType": "Wholesaler",
      "isVerified": false,
      "totalGems": 12,
      "totalOrders": 5,
      "totalRevenue": 250000,
      "createdAt": "2024-02-10T10:30:00.000Z"
    }
  ]
}
```

---

### **6. GET SELLER DETAILS BY ID** (Admin Only)

**Endpoint:**
```
GET /api/admin/sellers/:sellerId
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Example:**
```
GET /api/admin/sellers/507f1f77bcf86cd799439012
```

**Success Response (200):**
```json
{
  "success": true,
  "seller": {
    "_id": "507f1f77bcf86cd799439012",
    "user": "507f1f77bcf86cd799439010",
    "fullName": "Raj Kumar Gems",
    "email": "raj@gemstore.com",
    "phone": "9876543210",
    "alternatePhone": "9123456789",
    "shopName": "Raj Kumar Gems & Jewels",
    "shopType": "Retail Store",
    "businessType": "Individual Proprietorship",
    "yearEstablished": "2015",
    "address": {
      "street": "123 Gem Market, Chandni Chowk",
      "city": "Delhi",
      "state": "Delhi",
      "pincode": "110006",
      "country": "India"
    },
    "gstNumber": "07AABCU9603R1ZM",
    "panNumber": "ABCDE1234F",
    "aadharNumber": "123456789012",
    "bankName": "State Bank of India",
    "accountNumber": "12345678901234",
    "ifscCode": "SBIN0001234",
    "accountHolderName": "Raj Kumar",
    "businessDescription": "Established gem dealer...",
    "specialization": ["Loose Gemstones", "Certified Gems", "Custom Designs"],
    "gemTypes": ["Rubies", "Sapphires", "Diamonds", "Emeralds"],
    "website": "https://rajkumargems.com",
    "instagram": "@rajkumargems",
    "facebook": "RajKumarGems",
    "isVerified": true,
    "documentsUploaded": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-10-09T10:30:00.000Z",
    "gems": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Emerald",
        "price": 50000,
        "stock": 10,
        "availability": true,
        "createdAt": "2024-10-09T10:30:00.000Z"
      }
    ],
    "orders": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "orderNumber": "ORD-2024-001",
        "totalPrice": 100000,
        "status": "delivered",
        "createdAt": "2024-10-05T10:30:00.000Z"
      }
    ],
    "stats": {
      "totalGems": 45,
      "totalOrders": 120,
      "totalRevenue": 5500000,
      "averageRating": 4.5
    }
  }
}
```

---

### **7. VERIFY/UNVERIFY SELLER** (Admin Only)

**Endpoint:**
```
PUT /api/admin/sellers/:sellerId/verify
```

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "isVerified": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Seller verification status updated",
  "seller": {
    "_id": "507f1f77bcf86cd799439012",
    "isVerified": true,
    "updatedAt": "2024-10-09T12:00:00.000Z"
  }
}
```

---

### **8. DELETE SELLER** (Admin Only)

**Endpoint:**
```
DELETE /api/admin/sellers/:sellerId
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Seller deleted successfully"
}
```

**Note:** This will also delete:
- The seller profile
- All gems posted by the seller
- The associated user account

---

## 📊 **COMPLETE ENDPOINT SUMMARY**

### **Authentication:**
| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/auth/signup` | POST | Public | Signup (buyer/seller) |
| `/auth/login` | POST | Public | Login (all roles) |
| `/auth/admin/login` | POST | Public | Admin-specific login |
| `/auth/me` | GET | Protected | Get current user |

### **Seller Profile:**
| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/seller/profile` | GET | Seller | Get seller profile |
| `/seller/profile` | PUT | Seller | Create/Update profile |

### **Admin - Seller Management:**
| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/admin/sellers` | GET | Admin | Get all sellers with stats |
| `/admin/sellers/:id` | GET | Admin | Get seller details |
| `/admin/sellers/:id/verify` | PUT | Admin | Verify/Unverify seller |
| `/admin/sellers/:id` | DELETE | Admin | Delete seller |
| `/admin/orders` | GET | Admin | Get all orders |
| `/admin/gems` | GET | Admin | Get all gems |

---

## 🧪 **TESTING GUIDE**

### **Step 1: Create Admin User**
```bash
node createAdmin.js
```

**Output:**
```
✅ Admin user created successfully!

═══════════════════════════════════════
📧 Email: admin@admin.com
🔑 Password: admin123
👤 Role: admin
🆔 ID: 507f1f77bcf86cd799439011
═══════════════════════════════════════

🔐 LOGIN CREDENTIALS:
Username: admin
Password: admin123

Or use:
Email: admin@admin.com
Password: admin123
═══════════════════════════════════════
```

---

### **Step 2: Test Admin Login**

**Using cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin123"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Admin",
    "email": "admin@admin.com",
    "role": "admin"
  }
}
```

---

### **Step 3: Test Get All Sellers**

```bash
curl http://localhost:5000/api/admin/sellers \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### **Step 4: Create Seller and Update Profile**

**4.1 Signup as Seller:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Raj Kumar","email":"raj@gemstore.com","password":"123456","role":"seller"}'
```

**4.2 Update Seller Profile:**
```bash
curl -X PUT http://localhost:5000/api/seller/profile \
  -H "Authorization: Bearer YOUR_SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Raj Kumar Gems",
    "email": "raj@gemstore.com",
    "phone": "9876543210",
    "alternatePhone": "9123456789",
    "shopName": "Raj Kumar Gems & Jewels",
    "shopType": "Retail Store",
    "businessType": "Individual Proprietorship",
    "yearEstablished": "2015",
    "address": {
      "street": "123 Gem Market, Chandni Chowk",
      "city": "Delhi",
      "state": "Delhi",
      "pincode": "110006",
      "country": "India"
    },
    "gstNumber": "07AABCU9603R1ZM",
    "panNumber": "ABCDE1234F",
    "aadharNumber": "123456789012",
    "bankName": "State Bank of India",
    "accountNumber": "12345678901234",
    "ifscCode": "SBIN0001234",
    "accountHolderName": "Raj Kumar",
    "businessDescription": "Established gem dealer with over 8 years of experience",
    "specialization": ["Loose Gemstones", "Certified Gems", "Custom Designs"],
    "gemTypes": ["Rubies", "Sapphires", "Diamonds", "Emeralds"],
    "website": "https://rajkumargems.com",
    "instagram": "@rajkumargems",
    "facebook": "RajKumarGems",
    "documentsUploaded": true
  }'
```

---

## 💻 **Frontend Integration**

### **Axios Implementation:**

```javascript
// In your api.js or services file

import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

// Add token to requests
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Seller Profile APIs
export const sellerAPI = {
  // Get seller profile
  getProfile: async () => {
    return await apiClient.get('/seller/profile');
  },
  
  // Update seller profile
  updateProfile: async (profileData) => {
    return await apiClient.put('/seller/profile', profileData);
  }
};

// Admin APIs
export const adminAPI = {
  // Get all sellers
  getAllSellers: async (params = {}) => {
    return await apiClient.get('/admin/sellers', { params });
  },
  
  // Get seller details
  getSellerDetails: async (sellerId) => {
    return await apiClient.get(`/admin/sellers/${sellerId}`);
  },
  
  // Update seller verification
  updateSellerVerification: async (sellerId, isVerified) => {
    return await apiClient.put(`/admin/sellers/${sellerId}/verify`, { isVerified });
  },
  
  // Delete seller
  deleteSeller: async (sellerId) => {
    return await apiClient.delete(`/admin/sellers/${sellerId}`);
  },
  
  // Get all orders
  getAllOrders: async (params = {}) => {
    return await apiClient.get('/admin/orders', { params });
  },
  
  // Get all gems
  getAllGems: async (params = {}) => {
    return await apiClient.get('/admin/gems', { params });
  }
};

// Auth API
export const authAPI = {
  // Login (works for all roles)
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.success && response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },
  
  // Admin login (alternative)
  adminLogin: async (credentials) => {
    const response = await apiClient.post('/auth/admin/login', credentials);
    if (response.success && response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.admin));
    }
    return response;
  }
};
```

---

### **React Component Example:**

```javascript
// In your admin login component
const handleAdminLogin = async (formData) => {
  try {
    // Convert username to email format
    const loginData = {
      email: formData.username.includes('@') 
        ? formData.username 
        : `${formData.username}@admin.com`,
      password: formData.password
    };

    const response = await authAPI.login(loginData);

    if (response.success) {
      // Check if user is admin
      if (response.user && response.user.role === 'admin') {
        // SUCCESS - Redirect to admin dashboard
        navigate('/admin/sellers');
      } else {
        setError('Access denied. Admin credentials required.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      setError(response.message || 'Login failed');
    }
  } catch (err) {
    setError(err.message || 'An error occurred during login');
  }
};
```

---

## 🔑 **ADMIN CREDENTIALS (Use These)**

```
Method 1 (Username):
Username: admin
Password: admin123
(Will be converted to admin@admin.com automatically)

Method 2 (Email):
Email: admin@admin.com
Password: admin123
```

**Your frontend code already handles this perfectly!** ✅

---

## 📝 **Quick Reference**

### **To Create Admin:**
```bash
node createAdmin.js
```

### **Admin Login:**
```
POST /api/auth/login
Body: { "email": "admin@admin.com", "password": "admin123" }
```

### **Get All Sellers:**
```
GET /api/admin/sellers?page=1&limit=20
Headers: Authorization: Bearer <admin_token>
```

### **Get Seller Details:**
```
GET /api/admin/sellers/:sellerId
Headers: Authorization: Bearer <admin_token>
```

### **Verify Seller:**
```
PUT /api/admin/sellers/:sellerId/verify
Headers: Authorization: Bearer <admin_token>
Body: { "isVerified": true }
```

### **Update Seller Profile (Seller):**
```
PUT /api/seller/profile
Headers: Authorization: Bearer <seller_token>
Body: { fullName, phone, shopName, ... }
```

---

## ✅ **READY TO USE**

All endpoints are implemented and match the specification in `newbackendendpoints.md`.

**Next Steps:**
1. Run `node createAdmin.js` to create admin user
2. Use credentials: `admin@admin.com` / `admin123`
3. Login from your frontend
4. Access admin panel to manage sellers

🎉 **Everything is ready!**
