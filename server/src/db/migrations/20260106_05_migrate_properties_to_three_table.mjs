/**
 * Migration: Migrate existing Property data to three-table structure
 * Date: 2026-01-06
 * Purpose: Migrate existing properties table data to addresses, property_versions, and property_details tables
 * 
 * LEARNING: Data migration preserves all existing property data while restructuring into normalized tables
 * WHY: Maintains data integrity and relationships during migration to new structure
 * PATTERN: Transaction-based migration, address deduplication, relationship preservation
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const propertiesTableExists = await queryInterface.tableExists('properties');
    const addressesTableExists = await queryInterface.tableExists('addresses');
    const propertyVersionsTableExists = await queryInterface.tableExists('property_versions');
    const propertyDetailsTableExists = await queryInterface.tableExists('property_details');
    const appointmentsTableExists = await queryInterface.tableExists('appointments');

    if (!propertiesTableExists) {
      console.log('ℹ️  Properties table does not exist, skipping data migration');
      return;
    }

    if (!addressesTableExists || !propertyVersionsTableExists || !propertyDetailsTableExists) {
      throw new Error('Addresses, property_versions, and property_details tables must exist before data migration');
    }

    // Start transaction for atomic operation
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('🔄 Starting property data migration...');

      // Step 1: Get all existing properties
      const [properties] = await queryInterface.sequelize.query(
        'SELECT * FROM properties ORDER BY created_at',
        { transaction }
      );

      console.log(`📊 Found ${properties.length} properties to migrate`);

      // Step 2: Create a map to track address deduplication
      const addressMap = new Map(); // key: address key, value: address_id

      // Step 3: Migrate each property
      for (const property of properties) {
        // Create address key for deduplication (address + city + state + zip_code + unit)
        const addressKey = `${property.address || ''}|${property.city || ''}|${property.state || ''}|${property.zip_code || ''}|${property.unit || ''}`;

        let addressId;

        // Check if address already exists
        if (addressMap.has(addressKey)) {
          addressId = addressMap.get(addressKey);
          console.log(`   ℹ️  Reusing existing address: ${addressKey.substring(0, 50)}...`);
        } else {
          // Create new address
          const [addressResult] = await queryInterface.sequelize.query(
            `INSERT INTO addresses (id, address, unit, city, state, zip_code, created_at, updated_at)
             VALUES (gen_random_uuid(), :address, :unit, :city, :state, :zip_code, :created_at, :updated_at)
             RETURNING id`,
            {
              replacements: {
                address: property.address,
                unit: property.unit || null,
                city: property.city,
                state: property.state,
                zip_code: property.zip_code,
                created_at: property.created_at || new Date(),
                updated_at: property.updated_at || new Date(),
              },
              transaction,
            }
          );

          addressId = addressResult[0].id;
          addressMap.set(addressKey, addressId);
          console.log(`   ✅ Created address: ${property.address}, ${property.city}, ${property.state}`);
        }

        // Step 4: Create PropertyVersion
        const [propertyVersionResult] = await queryInterface.sequelize.query(
          `INSERT INTO property_versions (id, address_id, created_at, updated_at)
           VALUES (gen_random_uuid(), :address_id, :created_at, :updated_at)
           RETURNING id`,
          {
            replacements: {
              address_id: addressId,
              created_at: property.created_at || new Date(),
              updated_at: property.updated_at || new Date(),
            },
            transaction,
          }
        );

        const propertyVersionId = propertyVersionResult[0].id;
        console.log(`   ✅ Created property_version: ${propertyVersionId}`);

        // Step 5: Create PropertyDetails (source='client' for existing data)
        await queryInterface.sequelize.query(
          `INSERT INTO property_details (
            id, property_version_id, source, mls_number, square_footage, bedrooms, 
            bathrooms, foundation_access, additional_units, created_at, updated_at
          )
          VALUES (
            gen_random_uuid(), :property_version_id, 'client', :mls_number, :square_footage, :bedrooms,
            :bathrooms, :foundation_access, :additional_units, :created_at, :updated_at
          )`,
          {
            replacements: {
              property_version_id: propertyVersionId,
              mls_number: property.mls_number || null,
              square_footage: property.square_footage || null,
              bedrooms: property.bedrooms || null,
              bathrooms: property.bathrooms || null,
              foundation_access: property.foundation_access || null,
              additional_units: property.additional_units || null,
              created_at: property.created_at || new Date(),
              updated_at: property.updated_at || new Date(),
            },
            transaction,
          }
        );

        console.log(`   ✅ Created property_details for property: ${property.id}`);

        // Step 6: Update appointments.property_version_id if appointments table exists
        if (appointmentsTableExists) {
          const tableDescription = await queryInterface.describeTable('appointments');
          const hasPropertyVersionId = 'property_version_id' in tableDescription;

          if (hasPropertyVersionId) {
            await queryInterface.sequelize.query(
              `UPDATE appointments 
               SET property_version_id = :property_version_id
               WHERE property_id = :property_id`,
              {
                replacements: {
                  property_version_id: propertyVersionId,
                  property_id: property.id,
                },
                transaction,
              }
            );

            const [updatedRows] = await queryInterface.sequelize.query(
              `SELECT COUNT(*) as count FROM appointments WHERE property_id = :property_id`,
              {
                replacements: { property_id: property.id },
                transaction,
              }
            );

            if (updatedRows[0].count > 0) {
              console.log(`   ✅ Updated ${updatedRows[0].count} appointment(s) to use property_version_id`);
            }
          }
        }
      }

      // Step 7: After all data is migrated, make property_version_id NOT NULL if all appointments have been migrated
      if (appointmentsTableExists) {
        const tableDescription = await queryInterface.describeTable('appointments');
        const hasPropertyVersionId = 'property_version_id' in tableDescription;

        if (hasPropertyVersionId) {
          // Check if all appointments have property_version_id
          const [nullCheck] = await queryInterface.sequelize.query(
            'SELECT COUNT(*) as count FROM appointments WHERE property_version_id IS NULL',
            { transaction }
          );

          if (nullCheck[0].count === 0) {
            // All appointments migrated, make column NOT NULL
            await queryInterface.sequelize.query(
              `ALTER TABLE appointments 
               ALTER COLUMN property_version_id SET NOT NULL`,
              { transaction }
            );
            console.log('✅ Set property_version_id to NOT NULL');
          } else {
            console.log(`   ⚠️  ${nullCheck[0].count} appointments still have NULL property_version_id, keeping column nullable`);
          }
        }
      }

      await transaction.commit();
      console.log(`✅ Successfully migrated ${properties.length} properties to three-table structure`);
      console.log(`✅ Created ${addressMap.size} unique addresses`);
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error migrating property data:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // Rollback: This would require recreating properties from the three tables
    // This is complex and may not be needed if we're fully committed to the new structure
    console.log('⚠️  Rollback of property data migration not implemented');
    console.log('   Data would need to be manually restored from addresses, property_versions, and property_details tables');
  }
};

