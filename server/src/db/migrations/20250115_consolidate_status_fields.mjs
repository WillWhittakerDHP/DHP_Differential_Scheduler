/**
 * Migration: Consolidate status fields (active, visible, dependent, disabled) into single active field
 * Date: 2025-01-15
 * Purpose: Consolidate redundant status fields into single active field
 * Logic: active = !disabled && active && visible (all must be true for active)
 *        Remove dependent field entirely (meaningless ghost field)
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tables = ['block_shapes', 'block_instances', 'part_shapes', 'part_instances'];
    
    for (const tableName of tables) {
      console.log(`\n🔄 Processing ${tableName}...`);
      
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
        continue;
      }
      
      const tableDescription = await queryInterface.describeTable(tableName);
      
      // Consolidate status fields into active
      // Logic: active = !disabled && active && visible
      if (tableDescription.active && (tableDescription.visible || tableDescription.disabled)) {
        console.log(`  📊 Consolidating status fields in ${tableName}...`);
        
        // Update active based on consolidation logic
        await queryInterface.sequelize.query(`
          UPDATE ${tableName}
          SET active = (
            COALESCE(active, true) = true 
            AND COALESCE(visible, true) = true 
            AND COALESCE(disabled, false) = false
          )
          WHERE active IS NOT NULL OR visible IS NOT NULL OR disabled IS NOT NULL;
        `);
        
        console.log(`  ✅ Consolidated status fields in ${tableName}`);
      }
      
      // Remove visible column if it exists
      if (tableDescription.visible) {
        await queryInterface.removeColumn(tableName, 'visible');
        console.log(`  ✅ Removed visible column from ${tableName}`);
      }
      
      // Remove dependent column if it exists
      if (tableDescription.dependent) {
        await queryInterface.removeColumn(tableName, 'dependent');
        console.log(`  ✅ Removed dependent column from ${tableName}`);
      }
      
      // Remove disabled column if it exists
      if (tableDescription.disabled) {
        await queryInterface.removeColumn(tableName, 'disabled');
        console.log(`  ✅ Removed disabled column from ${tableName}`);
      }
      
      // Ensure active column exists and has default value
      if (!tableDescription.active) {
        await queryInterface.addColumn(tableName, 'active', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        });
        console.log(`  ✅ Added active column to ${tableName}`);
      } else {
        // Ensure active has proper defaults
        await queryInterface.changeColumn(tableName, 'active', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        });
        console.log(`  ✅ Updated active column defaults in ${tableName}`);
      }
    }
    
    console.log('\n✅ Status field consolidation complete!');
  },

  async down(queryInterface, Sequelize) {
    const tables = ['block_shapes', 'block_instances', 'part_shapes', 'part_instances'];
    
    for (const tableName of tables) {
      console.log(`\n🔄 Rolling back ${tableName}...`);
      
      const tableExists = await queryInterface.sequelize.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '${tableName}'
        );`
      );
      
      if (!tableExists[0][0].exists) {
        console.log(`⚠️  Table ${tableName} does not exist, skipping...`);
        continue;
      }
      
      const tableDescription = await queryInterface.describeTable(tableName);
      
      // Restore visible column
      if (!tableDescription.visible && tableDescription.active) {
        await queryInterface.addColumn(tableName, 'visible', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        });
        
        // Set visible = active (reverse of consolidation)
        await queryInterface.sequelize.query(`
          UPDATE ${tableName}
          SET visible = active;
        `);
        
        console.log(`  ✅ Restored visible column in ${tableName}`);
      }
      
      // Restore dependent column
      if (!tableDescription.dependent) {
        await queryInterface.addColumn(tableName, 'dependent', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        });
        console.log(`  ✅ Restored dependent column in ${tableName}`);
      }
      
      // Restore disabled column
      if (!tableDescription.disabled) {
        await queryInterface.addColumn(tableName, 'disabled', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        });
        
        // Set disabled = !active (reverse of consolidation)
        await queryInterface.sequelize.query(`
          UPDATE ${tableName}
          SET disabled = NOT active;
        `);
        
        console.log(`  ✅ Restored disabled column in ${tableName}`);
      }
    }
    
    console.log('\n✅ Status field rollback complete!');
  }
};

