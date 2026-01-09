/**
 * Migration: Rename additional_service_options to dependent_instance_options
 * 
 * LEARNING: Renames the relationship table for clearer domain terminology
 * WHY: "additionalServiceOptions" was too service-specific; "dependentInstanceOptions" 
 *      is generic and applies to any block shape (user, property, service, option)
 * PATTERN: Simple table rename with updated kind virtual field reference
 * 
 * Date: 2026-01-09
 */

async function up(queryInterface) {
  // Rename the table
  await queryInterface.renameTable('additional_service_options', 'dependent_instance_options');
  
  console.log('✅ Renamed additional_service_options to dependent_instance_options');
}

async function down(queryInterface) {
  // Revert: Rename back to original name
  await queryInterface.renameTable('dependent_instance_options', 'additional_service_options');
  
  console.log('✅ Reverted: Renamed dependent_instance_options back to additional_service_options');
}

export default { up, down };

