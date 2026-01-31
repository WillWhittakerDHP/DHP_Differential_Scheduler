/**
 * Migration: Convert Boolean Columns to Ternary Enum
 * Purpose: Convert onSite, clientPresent (partInstance) and differential (blockInstance) 
 *          from BOOLEAN to ternary_boolean ENUM('true', 'false', 'override')
 * Date: 2026-01-30
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Converting boolean columns to ternary enum...');

    // Create ENUM type if it doesn't exist
    await queryInterface.sequelize.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ternary_boolean') THEN
          CREATE TYPE ternary_boolean AS ENUM ('true', 'false', 'override');
        END IF;
      END $$;
    `);
    console.log('✅ Created ternary_boolean ENUM type');

    // Convert part_instances.on_site
    const partInstancesDescription = await queryInterface.describeTable('part_instances');
    if (partInstancesDescription.on_site && partInstancesDescription.on_site.type === 'BOOLEAN') {
      // LEARNING: Drop default before altering type, then restore it
      // WHY: PostgreSQL cannot automatically cast boolean default to ternary_boolean enum
      await queryInterface.sequelize.query(`
        ALTER TABLE part_instances 
        ALTER COLUMN on_site DROP DEFAULT;
      `);
      await queryInterface.sequelize.query(`
        ALTER TABLE part_instances 
        ALTER COLUMN on_site TYPE ternary_boolean 
        USING CASE 
          WHEN on_site = true THEN 'true'::ternary_boolean
          WHEN on_site = false THEN 'false'::ternary_boolean
          ELSE 'false'::ternary_boolean
        END;
      `);
      await queryInterface.sequelize.query(`
        ALTER TABLE part_instances 
        ALTER COLUMN on_site SET DEFAULT 'false'::ternary_boolean;
      `);
      console.log('✅ Converted part_instances.on_site to ternary_boolean');
    }

    // Convert part_instances.client_present
    if (partInstancesDescription.client_present && partInstancesDescription.client_present.type === 'BOOLEAN') {
      await queryInterface.sequelize.query(`
        ALTER TABLE part_instances 
        ALTER COLUMN client_present DROP DEFAULT;
      `);
      await queryInterface.sequelize.query(`
        ALTER TABLE part_instances 
        ALTER COLUMN client_present TYPE ternary_boolean 
        USING CASE 
          WHEN client_present = true THEN 'true'::ternary_boolean
          WHEN client_present = false THEN 'false'::ternary_boolean
          ELSE 'false'::ternary_boolean
        END;
      `);
      await queryInterface.sequelize.query(`
        ALTER TABLE part_instances 
        ALTER COLUMN client_present SET DEFAULT 'false'::ternary_boolean;
      `);
      console.log('✅ Converted part_instances.client_present to ternary_boolean');
    }

    // Convert block_instances.differential
    const blockInstancesDescription = await queryInterface.describeTable('block_instances');
    if (blockInstancesDescription.differential && blockInstancesDescription.differential.type === 'BOOLEAN') {
      await queryInterface.sequelize.query(`
        ALTER TABLE block_instances 
        ALTER COLUMN differential DROP DEFAULT;
      `);
      await queryInterface.sequelize.query(`
        ALTER TABLE block_instances 
        ALTER COLUMN differential TYPE ternary_boolean 
        USING CASE 
          WHEN differential = true THEN 'true'::ternary_boolean
          WHEN differential = false THEN 'false'::ternary_boolean
          ELSE 'false'::ternary_boolean
        END;
      `);
      await queryInterface.sequelize.query(`
        ALTER TABLE block_instances 
        ALTER COLUMN differential SET DEFAULT 'false'::ternary_boolean;
      `);
      console.log('✅ Converted block_instances.differential to ternary_boolean');
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting ternary enum columns to boolean...');

    // Convert back to boolean
    await queryInterface.sequelize.query(`
      ALTER TABLE part_instances 
      ALTER COLUMN on_site TYPE BOOLEAN 
      USING CASE 
        WHEN on_site::text = 'true' THEN true
        WHEN on_site::text = 'override' THEN false
        ELSE false
      END;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE part_instances 
      ALTER COLUMN client_present TYPE BOOLEAN 
      USING CASE 
        WHEN client_present::text = 'true' THEN true
        WHEN client_present::text = 'override' THEN false
        ELSE false
      END;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE block_instances 
      ALTER COLUMN differential TYPE BOOLEAN 
      USING CASE 
        WHEN differential::text = 'true' THEN true
        WHEN differential::text = 'override' THEN false
        ELSE false
      END;
    `);

    // Drop ENUM type
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS ternary_boolean;
    `);

    console.log('✅ Reverted ternary enum columns to boolean');
  }
};
