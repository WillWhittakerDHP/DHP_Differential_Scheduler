/**
 * LEARNING: Database migration to add 'iconSelect' renderAs type
 * WHY: Icon fields should be metadata-driven, not detected by hardcoded fieldKey checks
 * PATTERN: Add enum value, convert legacy data, update existing icon fields
 */

export default {
  async up(queryInterface) {
    console.log('Starting migration: add iconSelect and convert toggle...');
    
    // Add 'iconSelect' to renderAs ENUM for admin_input_metadata
    // Note: PostgreSQL doesn't have "IF NOT EXISTS" for ALTER TYPE ADD VALUE in older versions
    // We'll try to add it and catch the error if it already exists
    try {
      await queryInterface.sequelize.query(`
        ALTER TYPE enum_admin_input_metadata_render_as ADD VALUE 'iconSelect';
      `);
      console.log('✓ Added iconSelect to admin_input_metadata renderAs enum');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠ iconSelect already exists in admin_input_metadata renderAs enum (skipping)');
      } else {
        throw error;
      }
    }
    
    // Add 'iconSelect' to renderAs ENUM for admin_relationship_metadata
    try {
      await queryInterface.sequelize.query(`
        ALTER TYPE enum_admin_relationship_metadata_render_as ADD VALUE 'iconSelect';
      `);
      console.log('✓ Added iconSelect to admin_relationship_metadata renderAs enum');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠ iconSelect already exists in admin_relationship_metadata renderAs enum (skipping)');
      } else {
        throw error;
      }
    }
    
    // Note: 'toggle' was already removed from the database in a previous migration
    // No conversion needed
    
    // Update any icon fields to use 'iconSelect' renderAs
    const [iconResults] = await queryInterface.sequelize.query(`
      UPDATE admin_input_metadata 
      SET render_as = 'iconSelect' 
      WHERE field_key = 'icon'
      RETURNING id;
    `);
    console.log(`✓ Updated ${iconResults.length} icon fields to use iconSelect renderAs`);
    
    console.log('Migration completed successfully!');
  },
  
  async down(queryInterface) {
    console.log('Rolling back migration: add iconSelect and convert toggle...');
    
    // Revert icon fields back to text
    const [iconResults] = await queryInterface.sequelize.query(`
      UPDATE admin_input_metadata 
      SET render_as = 'text' 
      WHERE render_as = 'iconSelect'
      RETURNING id;
    `);
    console.log(`✓ Reverted ${iconResults.length} iconSelect fields back to text`);
    
    // Note: Cannot remove enum value in PostgreSQL without recreating the type
    // This would require dropping and recreating all dependent columns
    console.log('⚠ Note: iconSelect enum value remains in database (PostgreSQL limitation)');
    console.log('⚠ To fully remove, you would need to recreate the enum type and update all columns');
    
    console.log('Rollback completed!');
  }
};
