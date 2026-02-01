/**
 * Migration: Rename entity_type to entity_kind in active_compositions table
 * Purpose: Align ActiveComposition with Session 9.3 (Type → Kind rename)
 *   - Rename entity_type column → entity_kind
 *   - Rename index idx_entity_type → idx_entity_kind
 * Date: 2025-11-29
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tableName = 'active_compositions';
    
    const tableDescription = await queryInterface.describeTable(tableName);
    
    if (!tableDescription) {
      console.log('⚠️  Table active_compositions does not exist, skipping migration');
      return;
    }
    
    if (tableDescription.entity_type) {
      await queryInterface.renameColumn(tableName, 'entity_type', 'entity_kind');
      console.log('✅ Renamed column entity_type → entity_kind in active_compositions');
    } else if (tableDescription.entity_kind) {
      console.log('ℹ️  Column entity_kind already exists, skipping rename');
    } else {
      console.log('⚠️  Neither entity_type nor entity_kind column found, skipping');
      return;
    }
    
    // Remove old index if it exists
    try {
      const indexes = await queryInterface.showIndex(tableName);
      const oldIndexExists = indexes.some(idx => idx.name === 'idx_entity_type');
      
      if (oldIndexExists) {
        await queryInterface.removeIndex(tableName, 'idx_entity_type');
        console.log('✅ Removed old index idx_entity_type');
      }
    } catch (error) {
      console.log('ℹ️  Old index idx_entity_type not found or already removed');
    }
    
    try {
      const indexes = await queryInterface.showIndex(tableName);
      const newIndexExists = indexes.some(idx => idx.name === 'idx_entity_kind');
      
      if (!newIndexExists) {
        await queryInterface.addIndex(tableName, ['entity_kind'], {
          name: 'idx_entity_kind',
        });
        console.log('✅ Created new index idx_entity_kind');
      } else {
        console.log('ℹ️  Index idx_entity_kind already exists, skipping');
      }
    } catch (error) {
      console.error('⚠️  Error creating index idx_entity_kind:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    const tableName = 'active_compositions';
    
    const tableDescription = await queryInterface.describeTable(tableName);
    
    if (!tableDescription) {
      console.log('⚠️  Table active_compositions does not exist, skipping rollback');
      return;
    }
    
    if (tableDescription.entity_kind) {
      try {
        const indexes = await queryInterface.showIndex(tableName);
        const newIndexExists = indexes.some(idx => idx.name === 'idx_entity_kind');
        
        if (newIndexExists) {
          await queryInterface.removeIndex(tableName, 'idx_entity_kind');
          console.log('✅ Removed index idx_entity_kind');
        }
      } catch (error) {
        console.log('ℹ️  Index idx_entity_kind not found or already removed');
      }
      
      await queryInterface.renameColumn(tableName, 'entity_kind', 'entity_type');
      console.log('✅ Renamed column entity_kind → entity_type in active_compositions');
      
      try {
        await queryInterface.addIndex(tableName, ['entity_type'], {
          name: 'idx_entity_type',
        });
        console.log('✅ Recreated old index idx_entity_type');
      } catch (error) {
        console.error('⚠️  Error recreating index idx_entity_type:', error);
      }
    } else {
      console.log('ℹ️  Column entity_kind does not exist, skipping rollback');
    }
  },
};

