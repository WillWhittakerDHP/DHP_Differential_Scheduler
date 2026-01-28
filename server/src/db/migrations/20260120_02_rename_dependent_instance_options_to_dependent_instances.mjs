/**
 * Migration: Rename dependent_instance_options → dependent_instances table
 * 
 * LEARNING: Renames the relationship table for clearer, more concise terminology
 * WHY: "dependent_instances" is more concise than "dependent_instance_options"
 * PATTERN: Table rename with foreign key and index updates
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface) {
    console.log('📝 Renaming dependent_instance_options → dependent_instances table...');
    
    // Rename the table
    await queryInterface.renameTable('dependent_instance_options', 'dependent_instances');
    
    console.log('✅ Successfully renamed table dependent_instance_options → dependent_instances');
  },

  async down(queryInterface) {
    console.log('📝 Reverting: Renaming dependent_instances → dependent_instance_options table...');
    
    // Revert the table name
    await queryInterface.renameTable('dependent_instances', 'dependent_instance_options');
    
    console.log('✅ Successfully reverted table name to dependent_instance_options');
  }
};
