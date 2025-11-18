# 💎 Gem E-commerce Backend

A comprehensive Node.js backend for a gem/jewellery e-commerce platform with buyer/seller functionality.

## 🚀 Features

- **Multi-Role Authentication**: Buyer, Seller, and Admin roles
- **Gem Management**: Full CRUD operations for gemstones
- **Shopping Cart**: Add, update, remove items
- **Order Processing**: Complete order management system
- **Seller Profiles**: Detailed seller information with verification
- **Admin Panel**: Seller verification and platform management
- **Security**: JWT auth, bcrypt hashing, rate limiting
- **Email Integration**: Password reset and email verification

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd jewel-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   # Copy env.example to .env
   # On Windows:
   copy env.example .env
   
   # On Mac/Linux:
   cp env.example .env
   ```

4. **Update `.env` with your values:**
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key_min_32_chars
   JWT_EXPIRE=7d
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=https://auralaneweb.vercel.app
   ```

5. **Start the server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## 🌐 API Base URL

- **Production**: `https://gems-backend-zfpw.onrender.com/api`
- **Local**: `http://localhost:5000/api`

## 📚 API Documentation

See detailed API documentation in:
- `FINAL_IMPLEMENTATION_SUMMARY.md` - Complete implementation details
- `QUICK_API_REFERENCE.md` - Quick reference guide
- `GEM_API_ENDPOINTS.md` - Gem-specific endpoints
- `newbackendendpoints.md` - Full specification

## 🎯 Quick Start

### **1. Test Health Check**
```bash
curl http://localhost:5000/api/health
```

### **2. Signup as Buyer**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@test.com","password":"123456","role":"buyer"}'
```

### **3. Signup as Seller**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Gem Seller","email":"seller@test.com","password":"123456","role":"seller"}'
```

### **4. Browse Gems (No Auth Required)**
```bash
curl http://localhost:5000/api/gems
```

## 📋 Key Endpoints

### **Authentication**
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/admin/login` - Admin login
- `GET /auth/me` - Get current user

### **Gems (Public)**
- `GET /gems` - Get all gems
- `GET /gems/:id` - Get single gem

### **Gems (Seller)**
- `POST /gems` - Add new gem
- `GET /gems/my-gems` - Get seller's gems
- `PUT /gems/:id` - Update gem
- `DELETE /gems/:id` - Delete gem

### **Cart (Buyer)**
- `POST /cart` - Add to cart
- `GET /cart` - Get cart
- `PUT /cart/:itemId` - Update quantity
- `DELETE /cart/:itemId` - Remove item

### **Orders**
- `POST /orders` - Create order (Buyer)
- `GET /orders/my-orders` - Get buyer orders
- `GET /orders/seller/orders` - Get seller orders

### **Profiles**
- `GET /seller/profile` - Get seller profile
- `PUT /seller/profile` - Update seller profile
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile

### **Admin**
- `GET /admin/sellers` - Get all sellers
- `PUT /admin/sellers/:id/verify` - Verify seller

## 🗄️ Database Models

- **User** - Authentication and basic user info
- **Seller** - Seller profile with business details
- **Gem** - Gemstone products with astrological details
- **Cart** - Shopping cart for buyers
- **Order** - Order processing and tracking
- **OTPSession** - OTP verification for phone

## 🔒 Security Features

- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Authentication**: Secure token-based auth
- **Role-Based Access Control**: Buyer, Seller, Admin
- **Input Validation**: express-validator on all endpoints
- **Rate Limiting**:
  - Auth endpoints: 5 requests/15 minutes
  - OTP endpoints: 3 requests/minute
  - General: 100 requests/15 minutes
- **CORS**: Configured for trusted domains
- **Helmet.js**: Security headers

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcryptjs
- **Validation**: express-validator
- **Security**: helmet, cors, express-rate-limit
- **Email**: nodemailer (optional)
- **File Upload**: multer (optional)

## 📊 Database Schema

### User Roles
- **buyer**: Can browse, purchase gems
- **seller**: Can add and manage gems
- **admin**: Full platform access

### Gem Fields
Required: name, hindiName, planet, color, description, benefits, suitableFor, price, sizeWeight, sizeUnit, certification, origin, deliveryDays, heroImage

Optional: planetHindi, stock, availability, additionalImages

## 🌟 Frontend Integration

### Install axios in your frontend:
```bash
npm install axios
```

### Create api.js file:
```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://gems-backend-zfpw.onrender.com/api',
  headers: { 'Content-Type': 'application/json' }
});

// Add token to requests
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const api = {
  getGems: (params) => apiClient.get('/gems', { params }),
  addGem: (data) => apiClient.post('/gems', data),
  login: (credentials) => apiClient.post('/auth/login', credentials),
  // ... more methods
};
```

## 📱 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| MONGODB_URI | MongoDB connection string | ✅ | - |
| JWT_SECRET | Secret key for JWT | ✅ | - |
| JWT_EXPIRE | Token expiration time | ❌ | 7d |
| PORT | Server port | ❌ | 5000 |
| NODE_ENV | Environment | ❌ | development |
| CLIENT_URL | Frontend URL for CORS | ❌ | localhost:3000 |
| EMAIL_HOST | SMTP host | ❌ | smtp.gmail.com |
| EMAIL_PORT | SMTP port | ❌ | 587 |
| EMAIL_USER | Email username | ❌ | - |
| EMAIL_PASS | Email password | ❌ | - |

## 🐛 Troubleshooting

### Issue: "secretOrPrivateKey must have a value"
**Solution**: Create `.env` file with `JWT_SECRET=your_secret_key`

### Issue: "Cannot connect to MongoDB"
**Solution**: Whitelist your IP (0.0.0.0/0) in MongoDB Atlas

### Issue: "CORS error"
**Solution**: Already configured for `https://auralaneweb.vercel.app`

### Issue: "Module not found: multer/nodemailer"
**Solution**: Run `npm install`

## 📄 License

MIT

## 👨‍💻 Author

Your Name

---

**Backend is production-ready and matches the complete API specification!** ✨