/**
 * Migration: Rename is_composite column to composite in block_instances
 * Date: 2025-01-15
 * Purpose: Rename isComposite to composite for consistency with other boolean fields
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tableName = 'block_instances';
    
    console.log(`\n🔄 Renaming is_composite to composite in ${tableName}...`);
    
    // Check if table exists
    const tableExists = await queryInterface.sequelize.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '${tableName}'
      );`
    );
    
    if (!tableExists[0][0].exists) {
      console.log(`⚠️  Table ${tableName} does not exist, skipping...`);
      return;
    }
    
    const tableDescription = await queryInterface.describeTable(tableName);
    
    // Rename is_composite to composite if it exists
    if (tableDescription.is_composite && !tableDescription.composite) {
      await queryInterface.renameColumn(tableName, 'is_composite', 'composite');
      console.log(`  ✅ Renamed is_composite column to composite in ${tableName}`);
    } else if (tableDescription.composite) {
      console.log(`  ℹ️  Column ${tableName}.composite already exists, skipping migration`);
    } else {
      console.log(`  ⚠️  Column ${tableName}.is_composite does not exist, skipping migration`);
    }
  },

  async down(queryInterface, Sequelize) {
    const tableName = 'block_instances';
    
    console.log(`\n🔄 Rolling back composite to is_composite in ${tableName}...`);
    
    const tableExists = await queryInterface.sequelize.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '${tableName}'
      );`
    );
    
    if (!tableExists[0][0].exists) {
      console.log(`⚠️  Table ${tableName} does not exist, skipping...`);
      return;
    }
    
    const tableDescription = await queryInterface.describeTable(tableName);
    
    // Rename composite back to is_composite if it exists
    if (tableDescription.composite && !tableDescription.is_composite) {
      await queryInterface.renameColumn(tableName, 'composite', 'is_composite');
      console.log(`  ✅ Renamed composite column back to is_composite in ${tableName}`);
    } else if (tableDescription.is_composite) {
      console.log(`  ℹ️  Column ${tableName}.is_composite already exists, skipping rollback`);
    } else {
      console.log(`  ⚠️  Column ${tableName}.composite does not exist, skipping rollback`);
    }
  }
};

