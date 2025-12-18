/**
 * Migration Script: Add isCustomStone Field to Existing Gems
 * 
 * This script adds the `isCustomStone` field (default: false) to all existing gems
 * that don't have this field yet.
 * 
 * Usage:
 *   node migrate-custom-stone-field.js
 * 
 * Make sure to:
 * 1. Backup your database before running this script
 * 2. Set MONGODB_URI in .env file or pass as environment variable
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Gem = require('./models/Gem');

async function migrateCustomStoneField() {
    try {
        // Connect to database
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jewel_backend';
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000
        };

        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(mongoURI, options);
        console.log('✅ Connected to MongoDB successfully\n');

        // Find all gems without isCustomStone field
        console.log('🔍 Finding gems without isCustomStone field...');
        const gemsToMigrate = await Gem.find({
            isCustomStone: { $exists: false }
        }).lean();

        console.log(`📊 Found ${gemsToMigrate.length} gems to migrate\n`);

        if (gemsToMigrate.length === 0) {
            console.log('✅ No gems found without isCustomStone field. Migration not needed.');
            await mongoose.connection.close();
            return;
        }

        // Update all gems to add isCustomStone: false
        console.log('🔄 Adding isCustomStone: false to all gems...');
        const result = await Gem.updateMany(
            { isCustomStone: { $exists: false } },
            { $set: { isCustomStone: false } }
        );

        console.log(`✅ Updated ${result.modifiedCount} gems\n`);

        // Verify migration
        const remainingWithoutField = await Gem.countDocuments({
            isCustomStone: { $exists: false }
        });

        if (remainingWithoutField > 0) {
            console.warn(`⚠️  WARNING: ${remainingWithoutField} gems still don't have isCustomStone field`);
        } else {
            console.log('✅ Verification: All gems now have isCustomStone field');
        }

        // Optional: Check for gems that might be custom stones (no planet)
        console.log('\n🔍 Checking for potential custom stones (gems without planet)...');
        const gemsWithoutPlanet = await Gem.find({
            $or: [
                { planet: null },
                { planet: '' },
                { planet: { $exists: false } }
            ],
            isCustomStone: false
        }).select('_id name planet birthMonth isCustomStone').lean();

        if (gemsWithoutPlanet.length > 0) {
            console.log(`⚠️  Found ${gemsWithoutPlanet.length} gems without planet but isCustomStone is false:`);
            gemsWithoutPlanet.slice(0, 10).forEach(gem => {
                console.log(`   - ${gem.name} (ID: ${gem._id}) - birthMonth: ${gem.birthMonth || 'null'}`);
            });
            if (gemsWithoutPlanet.length > 10) {
                console.log(`   ... and ${gemsWithoutPlanet.length - 10} more`);
            }
            console.log('\n💡 Note: These gems may need manual review to determine if they should be custom stones.');
        } else {
            console.log('✅ All gems with isCustomStone: false have planet values');
        }

        // Close database connection
        await mongoose.connection.close();
        console.log('\n✅ Migration completed successfully!');

    } catch (error) {
        console.error('\n❌ Migration failed!');
        console.error('Error:', error.message);
        console.error(error);
        
        // Close connection on error
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        
        process.exit(1);
    }
}

// Run migration
if (require.main === module) {
    migrateCustomStoneField()
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error('Unhandled error:', error);
            process.exit(1);
        });
}

module.exports = { migrateCustomStoneField };

