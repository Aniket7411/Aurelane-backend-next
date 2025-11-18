const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const gemRoutes = require('./routes/gems');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const otpRoutes = require('./routes/otp');
const adminRoutes = require('./routes/admin');
const sellerRoutes = require('./routes/seller');
const userRoutes = require('./routes/user');
const wishlistRoutes = require('./routes/wishlist');
const reviewRoutes = require('./routes/reviews');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting - Only enabled in production
if (process.env.NODE_ENV === 'production') {
    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Increased for development
        message: {
            success: false,
            message: 'Too many authentication attempts, please try again later.'
        }
    });

    const otpLimiter = rateLimit({
        windowMs: 60 * 1000, // 1 minute
        max: 10, // Increased for development
        message: {
            success: false,
            message: 'Too many OTP requests, please try again later.'
        }
    });

    const generalLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000, // Very high limit for general endpoints
        message: {
            success: false,
            message: 'Too many requests from this IP, please try again later.'
        }
    });

    // Apply rate limiting only in production
    app.use('/api/auth', authLimiter);
    app.use('/api/otp', otpLimiter);
    app.use(generalLimiter);

    console.log('Rate limiting enabled (production mode)');
} else {
    console.log('Rate limiting disabled (development mode)');
}

// CORS configuration
app.use(cors({
    origin: function (origin, callback) {
        // In development, allow all origins
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:5173', // Vite default port
            'https://auralaneweb.vercel.app',
            'https://gems-frontend-two.vercel.app',
            process.env.CLIENT_URL
        ].filter(Boolean);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(null, true); // Allow anyway in case of misconfiguration
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    optionsSuccessStatus: 200,
    maxAge: 86400 // Cache preflight requests for 24 hours
}));

// Handle preflight OPTIONS requests
app.options('*', cors());

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection with improved error handling
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jewel_backend';

        // Set connection options
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000, // 10 seconds timeout
            socketTimeoutMS: 45000, // 45 seconds socket timeout
            connectTimeoutMS: 10000, // 10 seconds connection timeout
        };

        await mongoose.connect(mongoURI, options);
        console.log('✅ MongoDB connected successfully');

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err.message);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected successfully');
        });

    } catch (err) {
        console.error('\n❌ MongoDB Connection Failed!');
        console.error('═══════════════════════════════════════');

        if (err.name === 'MongooseServerSelectionError') {
            console.error('🔴 Error: Could not connect to MongoDB Atlas');
            console.error('\n📋 Common Solutions:');
            console.error('1. Check if your IP address is whitelisted in MongoDB Atlas:');
            console.error('   → Go to: https://cloud.mongodb.com/');
            console.error('   → Network Access → Add IP Address');
            console.error('   → Add "0.0.0.0/0" for all IPs (development only)');
            console.error('   → Or add your current IP address');
            console.error('\n2. Verify your MONGODB_URI in .env file is correct');
            console.error('3. Check if your MongoDB Atlas cluster is running');
            console.error('4. Verify your database username and password');
            console.error('\n💡 For local development, you can use:');
            console.error('   MONGODB_URI=mongodb://localhost:27017/jewel_backend');
        } else {
            console.error('Error details:', err.message);
        }

        console.error('═══════════════════════════════════════\n');

        // Don't exit immediately - allow server to start but show health check will fail
        console.warn('⚠️  Server will start but database operations will fail until connection is established.\n');
    }
};

// Connect to database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/gems', gemRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/user', userRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);

console.log("testing");

// Health check route
app.get('/api/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState;
    const dbStates = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };

    res.json({
        success: dbStatus === 1,
        message: 'Server is running',
        database: {
            status: dbStates[dbStatus] || 'unknown',
            connected: dbStatus === 1
        },
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
