/**
 * Migration: Drop legacy field_metadata JSONB columns
 * Date: 2026-01-16
 * Purpose: Remove old JSONB columns from block_shapes and part_shapes tables
 *          All data has been migrated to shape_field_metadata and shape_layout_config tables
 */

export default {
  async up(queryInterface, Sequelize) {
    console.log('Removing legacy field_metadata columns...')
    
    // Remove field_metadata column from block_shapes
    await queryInterface.removeColumn('block_shapes', 'field_metadata')
    console.log('Removed field_metadata from block_shapes')
    
    // Remove field_metadata column from part_shapes
    await queryInterface.removeColumn('part_shapes', 'field_metadata')
    console.log('Removed field_metadata from part_shapes')
    
    console.log('Legacy columns removed successfully')
  },
  
  async down(queryInterface, Sequelize) {
    console.log('Restoring legacy field_metadata columns...')
    
    // Restore field_metadata column to block_shapes
    await queryInterface.addColumn('block_shapes', 'field_metadata', {
      type: Sequelize.JSONB,
      allowNull: true,
    })
    console.log('Restored field_metadata to block_shapes')
    
    // Restore field_metadata column to part_shapes
    await queryInterface.addColumn('part_shapes', 'field_metadata', {
      type: Sequelize.JSONB,
      allowNull: true,
    })
    console.log('Restored field_metadata to part_shapes')
    
    console.log('Legacy columns restored')
  }
}
