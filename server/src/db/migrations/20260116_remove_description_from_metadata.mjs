/**
 * Migration: Remove description field from metadata tables
 * Date: 2026-01-16
 * Purpose: Remove description field entries from shape_field_metadata and shape_layout_config
 *          Descriptions are handled exclusively through annotations system
 */

export default {
  async up(queryInterface, Sequelize) {
    console.log('Removing description field from metadata tables...')
    
    // Delete description entries from shape_field_metadata
    const [deletedMetadata] = await queryInterface.sequelize.query(`
      DELETE FROM shape_field_metadata 
      WHERE field_key = 'description'
    `)
    console.log(`Deleted ${deletedMetadata[1] || 0} description entries from shape_field_metadata`)
    
    // Delete description entries from shape_layout_config
    const [deletedLayout] = await queryInterface.sequelize.query(`
      DELETE FROM shape_layout_config 
      WHERE field_key = 'description'
    `)
    console.log(`Deleted ${deletedLayout[1] || 0} description entries from shape_layout_config`)
    
    console.log('✅ Description field removed from metadata tables')
  },
  
  async down(queryInterface, Sequelize) {
    console.log('⚠️  Cannot restore description field entries - data has been deleted')
    console.log('   Description entries would need to be recreated manually if needed')
  }
}
