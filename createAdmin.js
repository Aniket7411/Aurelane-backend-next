const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./models/User');

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');

        // Admin credentials
        const adminData = {
            name: 'Admin',
            email: 'admin@admin.com',
            password: 'admin123', // This will be hashed automatically by the User model
            role: 'admin',
            emailVerified: true
        };

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminData.email });

        if (existingAdmin) {
            console.log('❌ Admin user already exists!');
            console.log('Email:', adminData.email);
            console.log('Use existing password or delete the user first');
            process.exit(0);
        }

        // Create admin user
        const admin = new User(adminData);
        await admin.save();

        console.log('\n✅ Admin user created successfully!\n');
        console.log('═══════════════════════════════════════');
        console.log('📧 Email:', adminData.email);
        console.log('🔑 Password:', 'admin123');
        console.log('👤 Role:', admin.role);
        console.log('🆔 ID:', admin._id);
        console.log('═══════════════════════════════════════\n');
        console.log('🔐 LOGIN CREDENTIALS:');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('\nOr use:');
        console.log('Email: admin@admin.com');
        console.log('Password: admin123');
        console.log('═══════════════════════════════════════\n');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
