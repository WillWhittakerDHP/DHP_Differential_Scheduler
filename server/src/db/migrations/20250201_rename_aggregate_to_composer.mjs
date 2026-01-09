/**
 * Migration: Rename aggregate_id to composer_id in active_compositions table
 * Purpose: Complete conversion to composition terminology
 * Date: 2025-02-01
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Check if aggregate_id column exists
    const tableDescription = await queryInterface.describeTable('active_compositions');
    
    if (tableDescription.aggregate_id) {
      // Rename aggregate_id column to composer_id
      await queryInterface.renameColumn('active_compositions', 'aggregate_id', 'composer_id');
      console.log('✅ Renamed aggregate_id column to composer_id in active_compositions table');
      
      // Rename indexes
      const indexes = await queryInterface.showIndex('active_compositions');
      
      // Rename unique_aggregate_particle index if it exists
      const aggregateParticleIndex = indexes.find(idx => idx.name === 'unique_aggregate_particle');
      if (aggregateParticleIndex) {
        await queryInterface.sequelize.query(`
          ALTER INDEX IF EXISTS unique_aggregate_particle RENAME TO unique_composer_particle;
        `);
        console.log('✅ Renamed index unique_aggregate_particle to unique_composer_particle');
      }
      
      // Rename idx_aggregate index if it exists
      const aggregateIndex = indexes.find(idx => idx.name === 'idx_aggregate');
      if (aggregateIndex) {
        await queryInterface.sequelize.query(`
          ALTER INDEX IF EXISTS idx_aggregate RENAME TO idx_composer;
        `);
        console.log('✅ Renamed index idx_aggregate to idx_composer');
      }
    } else if (tableDescription.composer_id) {
      console.log('ℹ️  Column composer_id already exists in active_compositions table. Migration may have already been applied.');
    } else {
      throw new Error('Column active_compositions.aggregate_id does not exist and active_compositions.composer_id does not exist. Cannot perform migration.');
    }
  },

  async down(queryInterface, Sequelize) {
    // Check if composer_id column exists
    const tableDescription = await queryInterface.describeTable('active_compositions');
    
    if (tableDescription.composer_id) {
      // Rename composer_id column back to aggregate_id
      await queryInterface.renameColumn('active_compositions', 'composer_id', 'aggregate_id');
      console.log('✅ Renamed composer_id column back to aggregate_id in active_compositions table');
      
      // Rename indexes back
      const indexes = await queryInterface.showIndex('active_compositions');
      
      const composerParticleIndex = indexes.find(idx => idx.name === 'unique_composer_particle');
      if (composerParticleIndex) {
        await queryInterface.sequelize.query(`
          ALTER INDEX IF EXISTS unique_composer_particle RENAME TO unique_aggregate_particle;
        `);
        console.log('✅ Renamed index unique_composer_particle back to unique_aggregate_particle');
      }
      
      const composerIndex = indexes.find(idx => idx.name === 'idx_composer');
      if (composerIndex) {
        await queryInterface.sequelize.query(`
          ALTER INDEX IF EXISTS idx_composer RENAME TO idx_aggregate;
        `);
        console.log('✅ Renamed index idx_composer back to idx_aggregate');
      }
    } else if (tableDescription.aggregate_id) {
      console.log('ℹ️  Column aggregate_id already exists, skipping rollback');
    } else {
      throw new Error('Column active_compositions.composer_id does not exist and active_compositions.aggregate_id does not exist. Cannot perform rollback.');
    }
  }
};

