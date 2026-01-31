/**
 * Migration: Convert block_instance_versions.differential to Ternary Enum
 * Purpose: Convert differential column in block_instance_versions table from BOOLEAN to ternary_boolean
 * Date: 2026-01-30
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Converting block_instance_versions.differential to ternary enum...');

    // Check if table exists
    const tableExists = await queryInterface.tableExists('block_instance_versions');
    if (!tableExists) {
      console.log('ℹ️  block_instance_versions table does not exist, skipping migration');
      return;
    }

    const tableDescription = await queryInterface.describeTable('block_instance_versions');
    
    // Check if differential column exists and is BOOLEAN
    if (tableDescription.differential && tableDescription.differential.type === 'BOOLEAN') {
      // Drop default before altering type
      await queryInterface.sequelize.query(`
        ALTER TABLE block_instance_versions 
        ALTER COLUMN differential DROP DEFAULT;
      `);
      
      // Convert column type
      await queryInterface.sequelize.query(`
        ALTER TABLE block_instance_versions 
        ALTER COLUMN differential TYPE ternary_boolean 
        USING CASE 
          WHEN differential = true THEN 'true'::ternary_boolean
          WHEN differential = false THEN 'false'::ternary_boolean
          ELSE 'false'::ternary_boolean
        END;
      `);
      
      // Set new default
      await queryInterface.sequelize.query(`
        ALTER TABLE block_instance_versions 
        ALTER COLUMN differential SET DEFAULT 'false'::ternary_boolean;
      `);
      
      console.log('✅ Converted block_instance_versions.differential to ternary_boolean');
    } else {
      console.log('ℹ️  block_instance_versions.differential column does not exist or is not BOOLEAN, skipping');
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting block_instance_versions.differential to boolean...');

    const tableExists = await queryInterface.tableExists('block_instance_versions');
    if (!tableExists) {
      console.log('ℹ️  block_instance_versions table does not exist, skipping');
      return;
    }

    await queryInterface.sequelize.query(`
      ALTER TABLE block_instance_versions 
      ALTER COLUMN differential DROP DEFAULT;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE block_instance_versions 
      ALTER COLUMN differential TYPE BOOLEAN 
      USING CASE 
        WHEN differential::text = 'true' THEN true
        WHEN differential::text = 'override' THEN false
        ELSE false
      END;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE block_instance_versions 
      ALTER COLUMN differential SET DEFAULT false;
    `);

    console.log('✅ Reverted block_instance_versions.differential to boolean');
  }
};
