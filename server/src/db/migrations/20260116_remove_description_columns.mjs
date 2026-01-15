/**
 * Migration: Remove any remaining description columns
 * Date: 2026-01-16
 * Purpose: Remove description columns from block_shapes, block_instances, part_shapes, and part_instances
 *          All descriptions are now handled through annotations system
 */

export default {
  async up(queryInterface, Sequelize) {
    console.log('Checking for description columns...')
    
    const tables = ['block_shapes', 'block_instances', 'part_shapes', 'part_instances']
    
    for (const tableName of tables) {
      const tableExists = await queryInterface.tableExists(tableName)
      
      if (!tableExists) {
        console.log(`⚠️  Table ${tableName} does not exist, skipping`)
        continue
      }
      
      const tableDescription = await queryInterface.describeTable(tableName)
      
      if (tableDescription.description) {
        console.log(`📝 Removing description column from ${tableName}...`)
        await queryInterface.removeColumn(tableName, 'description')
        console.log(`   ✅ Description column removed from ${tableName}`)
      } else {
        console.log(`ℹ️  No description column in ${tableName}, skipping`)
      }
    }
    
    console.log('✅ Description column check complete')
  },
  
  async down(queryInterface, Sequelize) {
    console.log('Restoring description columns...')
    
    const tables = [
      { name: 'block_shapes', nullable: true },
      { name: 'block_instances', nullable: true },
      { name: 'part_shapes', nullable: true },
      { name: 'part_instances', nullable: true }
    ]
    
    for (const { name: tableName, nullable } of tables) {
      const tableExists = await queryInterface.tableExists(tableName)
      
      if (!tableExists) {
        console.log(`⚠️  Table ${tableName} does not exist, skipping`)
        continue
      }
      
      const tableDescription = await queryInterface.describeTable(tableName)
      
      if (!tableDescription.description) {
        console.log(`📝 Restoring description column to ${tableName}...`)
        await queryInterface.addColumn(tableName, 'description', {
          type: Sequelize.STRING,
          allowNull: nullable,
        })
        console.log(`   ✅ Description column restored to ${tableName}`)
      } else {
        console.log(`ℹ️  Description column already exists in ${tableName}, skipping`)
      }
    }
    
    console.log('✅ Description columns restored')
  }
}
