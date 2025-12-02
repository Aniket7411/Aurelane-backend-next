/**
 * Script to fix old orderId index issue in MongoDB
 * Run this once to remove the old index that's causing duplicate key errors
 * 
 * Usage: node fix-order-index.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const fixOrderIndex = async () => {
    try {
        // Connect to MongoDB
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jewel_backend';
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        // Get the orders collection
        const db = mongoose.connection.db;
        const ordersCollection = db.collection('orders');

        // List all indexes
        const indexes = await ordersCollection.indexes();
        console.log('\n📋 Current indexes on orders collection:');
        indexes.forEach(index => {
            console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
        });

        // Check if orderId index exists
        const orderIdIndex = indexes.find(idx => idx.name === 'orderId_1' || idx.key.orderId);
        
        if (orderIdIndex) {
            console.log('\n⚠️  Found old orderId index. Removing it...');
            await ordersCollection.dropIndex(orderIdIndex.name);
            console.log('✅ Old orderId index removed successfully');
        } else {
            console.log('\n✅ No old orderId index found. Database is clean.');
        }

        // Verify orderNumber index exists and is sparse
        const orderNumberIndex = indexes.find(idx => idx.name === 'orderNumber_1' || idx.key.orderNumber);
        
        if (orderNumberIndex) {
            if (!orderNumberIndex.sparse) {
                console.log('\n⚠️  orderNumber index is not sparse. Recreating it...');
                await ordersCollection.dropIndex('orderNumber_1');
                await ordersCollection.createIndex({ orderNumber: 1 }, { unique: true, sparse: true });
                console.log('✅ orderNumber index recreated with sparse option');
            } else {
                console.log('\n✅ orderNumber index is correctly configured (sparse)');
            }
        } else {
            console.log('\n⚠️  orderNumber index not found. Creating it...');
            await ordersCollection.createIndex({ orderNumber: 1 }, { unique: true, sparse: true });
            console.log('✅ orderNumber index created successfully');
        }

        // Clean up old failed/pending orders (optional - uncomment if needed)
        // const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        // const result = await ordersCollection.deleteMany({
        //     paymentMethod: 'Online',
        //     paymentStatus: { $in: ['pending', 'failed'] },
        //     createdAt: { $lt: oneDayAgo }
        // });
        // console.log(`\n🧹 Cleaned up ${result.deletedCount} old failed/pending orders`);

        console.log('\n✅ Database index fix completed!');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error fixing indexes:', error);
        process.exit(1);
    }
};

fixOrderIndex();

