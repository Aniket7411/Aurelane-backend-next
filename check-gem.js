const mongoose = require('mongoose');
require('dotenv').config();
const Gem = require('./models/Gem');

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        const gemId = '6936995c5ec3332c3373cb5e';
        const gem = await Gem.findById(gemId);
        
        if (gem) {
            console.log(`✅ Gem found: ${gem.name}`);
            console.log(`   Category: ${gem.category}`);
            console.log(`   Seller ID: ${gem.seller}`);
            console.log(`   Price: ${gem.price}`);
            console.log(`   Stock: ${gem.stock}`);
        } else {
            console.log('❌ Gem not found with ID:', gemId);
        }
        
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error.message);
    }
})();

