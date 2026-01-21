/**
 * Migration: Rename dependent → is_dependent_instance column
 * 
 * LEARNING: Renames the boolean column in block_instances table for clearer terminology
 * WHY: "isDependentInstance" is more descriptive and explicit than "dependent"
 * PATTERN: Column rename with consistent naming conventions
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface) {
    console.log('📝 Renaming dependent → is_dependent_instance column in block_instances table...');
    
    await queryInterface.renameColumn('block_instances', 'dependent', 'is_dependent_instance');
    
    console.log('✅ Successfully renamed column dependent → is_dependent_instance');
  },

  async down(queryInterface) {
    console.log('📝 Reverting: Renaming is_dependent_instance → dependent column in block_instances table...');
    
    await queryInterface.renameColumn('block_instances', 'is_dependent_instance', 'dependent');
    
    console.log('✅ Successfully reverted column name to dependent');
  }
};
