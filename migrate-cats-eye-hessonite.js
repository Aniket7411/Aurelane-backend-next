/**
 * Migration Script: Split "Cat's Eye & Hessonite" into Separate Categories
 * 
 * This script migrates existing gems from the combined category
 * "Cat's Eye & Hessonite" to the new separate categories:
 * - "Cat's Eye" (for Cat's Eye/Lehsunia/Ketu gems)
 * - "Hessonite" (for Hessonite/Gomed/Rahu gems)
 * 
 * Usage:
 *   node migrate-cats-eye-hessonite.js
 * 
 * Make sure to:
 * 1. Backup your database before running this script
 * 2. Set MONGODB_URI in .env file or pass as environment variable
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Gem = require('./models/Gem');

const OLD_CATEGORY = "Cat's Eye & Hessonite";
const NEW_CATEGORY_CATS_EYE = "Cat's Eye";
const NEW_CATEGORY_HESSONITE = "Hessonite";

// Helper function to determine new category based on subcategory or name
function determineNewCategory(gem) {
    const subcategory = (gem.subcategory || '').toLowerCase();
    const name = (gem.name || '').toLowerCase();
    
    // Check for Cat's Eye indicators
    if (
        subcategory.includes("cat's eye") ||
        subcategory.includes("lehsunia") ||
        subcategory.includes("ketu") ||
        subcategory.includes("vaidurya") ||
        name.includes("cat's eye") ||
        name.includes("lehsunia")
    ) {
        return NEW_CATEGORY_CATS_EYE;
    }
    
    // Check for Hessonite indicators
    if (
        subcategory.includes("gomed") ||
        subcategory.includes("hessonite") ||
        subcategory.includes("rahu") ||
        subcategory.includes("cinnamon") ||
        name.includes("gomed") ||
        name.includes("hessonite")
    ) {
        return NEW_CATEGORY_HESSONITE;
    }
    
    // Default to Hessonite if unclear (you can change this based on your preference)
    console.warn(`⚠️  Could not determine category for gem ${gem._id} (${gem.name}). Defaulting to Hessonite.`);
    return NEW_CATEGORY_HESSONITE;
}

async function migrateCatsEyeHessonite() {
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

        // Find all gems with old category
        console.log(`🔍 Finding gems with category: "${OLD_CATEGORY}"...`);
        const gemsToMigrate = await Gem.find({
            category: OLD_CATEGORY
        }).lean();

        console.log(`📊 Found ${gemsToMigrate.length} gems to migrate\n`);

        if (gemsToMigrate.length === 0) {
            console.log('✅ No gems found with the old category. Migration not needed.');
            await mongoose.connection.close();
            return;
        }

        // Track migration statistics
        let migratedToCatsEye = 0;
        let migratedToHessonite = 0;
        const migrationLog = [];

        // Migrate each gem
        for (const gem of gemsToMigrate) {
            const newCategory = determineNewCategory(gem);
            
            // Update the gem
            await Gem.updateOne(
                { _id: gem._id },
                { $set: { category: newCategory } }
            );

            if (newCategory === NEW_CATEGORY_CATS_EYE) {
                migratedToCatsEye++;
            } else {
                migratedToHessonite++;
            }

            migrationLog.push({
                id: gem._id,
                name: gem.name,
                oldCategory: OLD_CATEGORY,
                newCategory: newCategory,
                subcategory: gem.subcategory
            });

            console.log(`✅ Migrated: ${gem.name} → ${newCategory}`);
        }

        // Print summary
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('📈 MIGRATION SUMMARY');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`Total gems migrated: ${gemsToMigrate.length}`);
        console.log(`  → Migrated to "Cat's Eye": ${migratedToCatsEye}`);
        console.log(`  → Migrated to "Hessonite": ${migratedToHessonite}`);
        console.log('═══════════════════════════════════════════════════════\n');

        // Verify migration
        const remainingOldCategory = await Gem.countDocuments({
            category: OLD_CATEGORY
        });

        if (remainingOldCategory > 0) {
            console.warn(`⚠️  WARNING: ${remainingOldCategory} gems still have the old category "${OLD_CATEGORY}"`);
        } else {
            console.log('✅ Verification: No gems remain with the old category');
        }

        // Save migration log to file (optional)
        const fs = require('fs');
        const logFileName = `migration-log-${Date.now()}.json`;
        fs.writeFileSync(logFileName, JSON.stringify(migrationLog, null, 2));
        console.log(`📝 Migration log saved to: ${logFileName}`);

        // Close database connection
        await mongoose.connection.close();
        console.log('\n✅ Migration completed successfully!');
        console.log('⚠️  Remember to update your backend code to remove support for the old category.');

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
    migrateCatsEyeHessonite()
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error('Unhandled error:', error);
            process.exit(1);
        });
}

module.exports = { migrateCatsEyeHessonite, determineNewCategory };

