/**
 * Migration: Remove email unique constraint in development
 * Date: 2026-02-04
 * Purpose: Allow duplicate emails in development environment for easier testing
 * 
 * LEARNING: Development environment should be more permissive for testing
 * WHY: Makes it easier to create test users without worrying about unique email constraints
 * PATTERN: Conditional migration based on NODE_ENV
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // LEARNING: Remove email unique constraint in non-production environments
    // WHY: Development and test environments should allow duplicate emails for easier testing
    // PATTERN: Check if NOT production (allows dev and test)
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (!isProduction) {
      const tableExists = await queryInterface.tableExists('users');
      
      if (tableExists) {
        try {
          // Remove the unique index on email
          await queryInterface.removeIndex('users', 'idx_users_email');
          console.log('✅ Removed unique constraint on users.email');
        } catch (error) {
          // Index might not exist or have a different name
          console.log('ℹ️  Could not remove email unique index (may not exist):', error.message);
          
          // Try to remove the constraint directly if it exists
          try {
            await queryInterface.sequelize.query(`
              ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
            `);
            console.log('✅ Removed users_email_key constraint');
          } catch (constraintError) {
            console.log('ℹ️  Could not remove email constraint (may not exist)');
          }
        }
      }
    } else {
      console.log('ℹ️  Skipping email unique constraint removal (production environment)');
    }
  },

  async down(queryInterface, Sequelize) {
    // Re-add constraint in non-production environments
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (!isProduction) {
      const tableExists = await queryInterface.tableExists('users');
      
      if (tableExists) {
        try {
          // Re-add the unique index on email
          await queryInterface.addIndex('users', ['email'], {
            name: 'idx_users_email',
            unique: true,
          });
          console.log('✅ Re-added unique constraint on users.email');
        } catch (error) {
          console.log('ℹ️  Could not re-add email unique index:', error.message);
        }
      }
    }
  }
};
