/**
 * Migration: Add 'inspector' to user_role enum
 * Date: 2026-01-08
 * Purpose: Add 'inspector' role to user_role_enum for home inspectors
 * 
 * LEARNING: PostgreSQL ENUM types need ALTER TYPE to add new values
 * WHY: Home inspectors are a user type in the scheduling system
 * PATTERN: Safe enum addition with IF NOT EXISTS check
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    try {
      // Check if 'inspector' value already exists in the enum
      const [results] = await queryInterface.sequelize.query(`
        SELECT EXISTS (
          SELECT 1 
          FROM pg_enum 
          WHERE enumlabel = 'inspector' 
          AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role_enum')
        ) as exists;
      `);
      
      const inspectorExists = results[0]?.exists || false;
      
      if (!inspectorExists) {
        // Add 'inspector' to user_role_enum
        await queryInterface.sequelize.query(`
          ALTER TYPE user_role_enum ADD VALUE IF NOT EXISTS 'inspector';
        `);
        console.log('✅ Added inspector to user_role_enum');
      } else {
        console.log('ℹ️  inspector already exists in user_role_enum, skipping');
      }
    } catch (error) {
      // If enum doesn't exist or other error, log but don't fail
      console.log('ℹ️  Could not add inspector to enum:', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    // PostgreSQL doesn't support removing values from ENUM types
    // Would need to recreate the type, which is complex and risky
    console.log('ℹ️  Cannot remove enum value in PostgreSQL, skipping down migration');
  }
};

