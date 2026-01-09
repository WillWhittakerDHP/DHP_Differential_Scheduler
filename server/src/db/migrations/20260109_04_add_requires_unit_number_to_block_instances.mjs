/**
 * Migration: Add requires_unit_number column to block_instances
 * Purpose: Allow per-block-instance control of whether a property requires a unit number (e.g., condo / co-op).
 * Date: 2026-01-09
 *
 * NOTE: Column is nullable (as requested). UI should only treat `true` as requiring a unit number.
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize

    const tableDescription = await queryInterface.describeTable('block_instances')

    if (tableDescription.requires_unit_number) {
      console.log('ℹ️  Column block_instances.requires_unit_number already exists, skipping migration')
      return
    }

    await queryInterface.addColumn('block_instances', 'requires_unit_number', {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'requires_unit_number',
      comment: 'If true, this block instance requires a unit number (e.g., condo/co-op). Nullable by design.',
    })

    // Backfill: mark common condo/co-op property-type blocks as requiring unit number.
    // We intentionally keep the condition narrow to property-type blocks by joining block_shapes.
    await queryInterface.sequelize.query(`
      UPDATE block_instances bi
      SET requires_unit_number = TRUE
      FROM block_shapes bs
      WHERE bi.block_shape_ref = bs.id
        AND (bs.name = 'Property Adjustment' OR bs.name = 'property_type_block')
        AND (
          bi.name ILIKE '%condo%'
          OR bi.name ILIKE '%co-op%'
          OR bi.name ILIKE '%co op%'
        )
    `)

    console.log('✅ Added requires_unit_number column to block_instances table (with condo/co-op backfill)')
  },

  async down(queryInterface) {
    const tableDescription = await queryInterface.describeTable('block_instances')

    if (tableDescription.requires_unit_number) {
      await queryInterface.removeColumn('block_instances', 'requires_unit_number')
      console.log('✅ Removed requires_unit_number column from block_instances table')
    } else {
      console.log('ℹ️  Column block_instances.requires_unit_number does not exist, skipping rollback')
    }
  },
}


