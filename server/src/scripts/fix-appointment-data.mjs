/**
 * Fix Appointment Data Script
 * 
 * LEARNING: Updates existing appointment rows to use current block instance IDs
 * WHY: Ensures appointments reference valid block instances that exist in the database
 * PATTERN: SQL update script that sets baseline data for testing
 * 
 * Updates all appointments to use:
 * - Buyer user type
 * - Buyer's Inspection service
 * - Single Family Home property type
 * 
 * This provides a consistent baseline that can be manually varied for testing.
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

const BUYER_USER_TYPE_ID = '925a88dc-8f7c-40da-927f-79d46a794b9a';
const BUYERS_INSPECTION_SERVICE_ID = '71d4e133-0007-40b5-b249-7f1c9d2f7772';
const SINGLE_FAMILY_HOME_PROPERTY_ID = '9ed2de4d-b90c-4c4c-bf62-6225ec8cda28';

async function fixAppointmentData() {
  try {
    await sequelize.authenticate()
    console.log('✅ Database connection established\n')
    console.log('🔧 Fixing appointment data...');
    
    // Update ALL appointments with current block instance IDs
    // LEARNING: Update all appointments to ensure no orphaned IDs remain
    // WHY: Some appointments may have old IDs that don't exist in block_instances
    const [results] = await sequelize.query(`
      UPDATE appointments
      SET 
        user_type_id = :buyerId,
        selected_service_ids = :serviceIds::jsonb,
        selected_property_ids = :propertyIds::jsonb,
        service_snapshots = :serviceSnapshots::jsonb,
        property_snapshots = :propertySnapshots::jsonb
    `, {
      replacements: {
        buyerId: BUYER_USER_TYPE_ID,
        serviceIds: JSON.stringify([BUYERS_INSPECTION_SERVICE_ID]),
        propertyIds: JSON.stringify([SINGLE_FAMILY_HOME_PROPERTY_ID]),
        serviceSnapshots: JSON.stringify({
          [BUYERS_INSPECTION_SERVICE_ID]: {
            id: BUYERS_INSPECTION_SERVICE_ID,
            name: "Buyer's Inspection",
            icon: "",
            baseSqFt: 0,
            differential: false,
            allowMultiple: false,
            partInstances: []
          }
        }),
        propertySnapshots: JSON.stringify({
          [SINGLE_FAMILY_HOME_PROPERTY_ID]: {
            id: SINGLE_FAMILY_HOME_PROPERTY_ID,
            name: "Single Family Home",
            icon: "",
            baseSqFt: 0,
            differential: false,
            allowMultiple: false,
            partInstances: []
          }
        })
      }
    });
    
    const updatedCount = results.rowCount || 0;
    console.log(`✅ Updated ${updatedCount} appointment(s) with baseline data`);
    
    // Verify updates
    const [verification] = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(user_type_id) as with_user_type,
        COUNT(CASE WHEN jsonb_array_length(COALESCE(selected_service_ids, '[]'::jsonb)) > 0 THEN 1 END) as with_services,
        COUNT(CASE WHEN jsonb_array_length(COALESCE(selected_property_ids, '[]'::jsonb)) > 0 THEN 1 END) as with_properties
      FROM appointments
    `);
    
    console.log('📊 Verification:');
    console.log(`   Total appointments: ${verification[0].total}`);
    console.log(`   With user_type_id: ${verification[0].with_user_type}`);
    console.log(`   With services: ${verification[0].with_services}`);
    console.log(`   With properties: ${verification[0].with_properties}`);
    
    await sequelize.close();
    console.log('\n✅ Appointment data fix completed');
    
  } catch (error) {
    console.error('❌ Error fixing appointment data:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixAppointmentData()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { fixAppointmentData };

