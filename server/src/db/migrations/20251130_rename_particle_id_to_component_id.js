/**
 * Migration: Rename particle_id to component_id in active_compositions table
 * Date: 2025-11-30
 * Purpose: Rename column from particle_id to component_id to match codebase terminology
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const [results] = await queryInterface.sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'active_compositions' 
      AND column_name IN ('particle_id', 'component_id')
    `);
    
    const columnNames = results.map((r) => r.column_name);
    const hasParticleId = columnNames.includes('particle_id');
    const hasComponentId = columnNames.includes('component_id');
    
    if (hasParticleId && !hasComponentId) {
      await queryInterface.renameColumn('active_compositions', 'particle_id', 'component_id');
      console.log('✅ Renamed particle_id column to component_id on active_compositions');
      
      // if there are any indexes with old names that need updating
      try {
        const [indexResults] = await queryInterface.sequelize.query(`
          SELECT indexname 
          FROM pg_indexes 
          WHERE tablename = 'active_compositions' 
          AND indexname = 'idx_particle'
        `);
        
        if (indexResults.length > 0) {
          await queryInterface.sequelize.query(`
            ALTER INDEX idx_particle RENAME TO idx_component
          `);
          console.log('✅ Renamed index from idx_particle to idx_component');
        }
      } catch (error) {
        console.log('ℹ️  Error updating index name (may not exist):', error.message);
      }
      
      // Check for unique_composer_particle constraint and rename it
      try {
        const [constraintResults] = await queryInterface.sequelize.query(`
          SELECT indexname 
          FROM pg_indexes 
          WHERE tablename = 'active_compositions' 
          AND indexname = 'unique_composer_particle'
        `);
        
        if (constraintResults.length > 0) {
          await queryInterface.sequelize.query(`
            ALTER INDEX unique_composer_particle RENAME TO unique_composer_component
          `);
          console.log('✅ Renamed unique constraint from unique_composer_particle to unique_composer_component');
        }
      } catch (error) {
        console.log('ℹ️  Error updating constraint name (may not exist):', error.message);
      }
    } else if (hasComponentId) {
      console.log('ℹ️  Column active_compositions.component_id already exists, skipping');
    } else if (!hasParticleId && !hasComponentId) {
      console.log('⚠️  Neither particle_id nor component_id exists in active_compositions table');
    }
  },

  async down(queryInterface, Sequelize) {
    const [results] = await queryInterface.sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'active_compositions' 
      AND column_name IN ('particle_id', 'component_id')
    `);
    
    const columnNames = results.map((r) => r.column_name);
    const hasParticleId = columnNames.includes('particle_id');
    const hasComponentId = columnNames.includes('component_id');
    
    if (hasComponentId && !hasParticleId) {
      await queryInterface.renameColumn('active_compositions', 'component_id', 'particle_id');
      console.log('✅ Renamed component_id column back to particle_id on active_compositions');
      
      try {
        const [indexResults] = await queryInterface.sequelize.query(`
          SELECT indexname 
          FROM pg_indexes 
          WHERE tablename = 'active_compositions' 
          AND indexname = 'idx_component'
        `);
        
        if (indexResults.length > 0) {
          await queryInterface.sequelize.query(`
            ALTER INDEX idx_component RENAME TO idx_particle
          `);
          console.log('✅ Renamed index back from idx_component to idx_particle');
        }
      } catch (error) {
        console.log('ℹ️  Error updating index name:', error.message);
      }
      
      // Update constraint name back
      try {
        const [constraintResults] = await queryInterface.sequelize.query(`
          SELECT indexname 
          FROM pg_indexes 
          WHERE tablename = 'active_compositions' 
          AND indexname = 'unique_composer_component'
        `);
        
        if (constraintResults.length > 0) {
          await queryInterface.sequelize.query(`
            ALTER INDEX unique_composer_component RENAME TO unique_composer_particle
          `);
          console.log('✅ Renamed unique constraint back from unique_composer_component to unique_composer_particle');
        }
      } catch (error) {
        console.log('ℹ️  Error updating constraint name:', error.message);
      }
    } else if (hasParticleId) {
      console.log('ℹ️  Column active_compositions.particle_id already exists, no change needed');
    }
  }
};

