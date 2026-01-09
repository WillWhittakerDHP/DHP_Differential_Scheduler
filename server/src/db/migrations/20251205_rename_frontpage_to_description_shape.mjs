/**
 * Migration: Rename frontPage annotation shape to description
 * Date: 2025-12-05
 * Purpose: Rename annotation shape name from "frontPage" to "description" in annotation_shapes table
 * 
 * LEARNING: Update data in annotation_shapes table to rename shape name
 * WHY: The shape name "frontPage" should be renamed to "description" to match the new naming convention
 * PATTERN: Use raw SQL UPDATE to change the name value in the table
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting annotation shape rename: frontPage → description...');
    
    // Check if annotation_shapes table exists
    const tableExists = await queryInterface.tableExists('annotation_shapes');
    if (!tableExists) {
      console.log('⚠️  Table annotation_shapes does not exist, skipping migration');
      return;
    }
    
    // Update the shape name from "frontPage" to "description"
    const [results] = await queryInterface.sequelize.query(`
      UPDATE annotation_shapes 
      SET name = 'description' 
      WHERE name = 'frontPage'
    `);
    
    const affectedRows = results.rowCount || 0;
    if (affectedRows > 0) {
      console.log(`✅ Renamed ${affectedRows} annotation shape(s) from "frontPage" to "description"`);
    } else {
      console.log('ℹ️  No annotation shapes with name "frontPage" found, skipping update');
    }
    
    console.log('✅ Annotation shape rename complete!');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Rolling back annotation shape rename: description → frontPage...');
    
    // Check if annotation_shapes table exists
    const tableExists = await queryInterface.tableExists('annotation_shapes');
    if (!tableExists) {
      console.log('⚠️  Table annotation_shapes does not exist, skipping rollback');
      return;
    }
    
    // Update the shape name back from "description" to "frontPage"
    const [results] = await queryInterface.sequelize.query(`
      UPDATE annotation_shapes 
      SET name = 'frontPage' 
      WHERE name = 'description'
    `);
    
    const affectedRows = results.rowCount || 0;
    if (affectedRows > 0) {
      console.log(`✅ Renamed ${affectedRows} annotation shape(s) back from "description" to "frontPage"`);
    } else {
      console.log('ℹ️  No annotation shapes with name "description" found, skipping rollback');
    }
    
    console.log('✅ Rollback complete!');
  }
};

