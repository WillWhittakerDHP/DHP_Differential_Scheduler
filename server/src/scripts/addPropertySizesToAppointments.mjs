/**
 * Add Property Sizes to Appointments
 * 
 * LEARNING: Script to add squareFootage values to existing property_details records
 * WHY: Ensures property size data comes through when loading appointments in the wizard
 * PATTERN: SQL update script that adds test squareFootage values to property_details
 */

import 'dotenv/config'
import { Sequelize } from 'sequelize'

const sequelize = new Sequelize(
  process.env.DB_NAME || 'scheduler_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'jklJKL',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log
  }
)

const TEST_SIZES = [251, 302, 507, 680, 800, 1201, 2294];

async function addPropertySizesToAppointments() {
  try {
    await sequelize.authenticate()
    console.log('✅ Database connection established\n')
    console.log('📏 Adding property sizes to appointments...\n');
    
    // Get all property_details that don't have squareFootage and are associated with appointments
    const [propertyDetailsWithoutSize] = await sequelize.query(`
      SELECT DISTINCT pd.id, pd.property_version_id
      FROM property_details pd
      INNER JOIN property_versions pv ON pd.property_version_id = pv.id
      INNER JOIN appointments a ON a.property_version_id = pv.id
      WHERE pd.square_footage IS NULL
      ORDER BY pd.id
    `);
    
    console.log(`Found ${propertyDetailsWithoutSize.length} property_details records without squareFootage\n`);
    
    if (propertyDetailsWithoutSize.length === 0) {
      console.log('✅ All property_details already have squareFootage values');
      return;
    }
    
    // Update each property_details record with a random test size
    let updated = 0;
    for (const propertyDetail of propertyDetailsWithoutSize) {
      const randomSize = TEST_SIZES[Math.floor(Math.random() * TEST_SIZES.length)];
      
      await sequelize.query(`
        UPDATE property_details
        SET square_footage = :size
        WHERE id = :id
      `, {
        replacements: {
          size: randomSize,
          id: propertyDetail.id
        }
      });
      
      updated++;
      console.log(`   ✅ Updated property_details ${propertyDetail.id}: squareFootage = ${randomSize}`);
    }
    
    console.log(`\n✅ Successfully updated ${updated} property_details records with squareFootage values`);
    
    // Verify all property_details with appointments now have squareFootage
    const [stillMissing] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM property_details pd
      INNER JOIN property_versions pv ON pd.property_version_id = pv.id
      INNER JOIN appointments a ON a.property_version_id = pv.id
      WHERE pd.square_footage IS NULL
    `);
    
    const missingCount = stillMissing[0]?.count || 0;
    if (missingCount > 0) {
      console.log(`\n⚠️  Warning: ${missingCount} property_details records still missing squareFootage`);
    } else {
      console.log('\n✅ All property_details with appointments now have squareFootage values');
    }
    
  } catch (error) {
    console.error('❌ Error adding property sizes:', error);
    throw error;
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Run the script
addPropertySizesToAppointments();
