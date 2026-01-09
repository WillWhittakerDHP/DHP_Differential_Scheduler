/**
 * Migration: Ensure `block_instances` has `dependent` and `visible` columns
 *
 * WHY: The backend BlockInstance Sequelize model selects `dependent`/`visible`.
 *      If a dev DB is missing these columns (e.g., migrations drift), the API will 500.
 *
 * PATTERN: Idempotent migration using describeTable + conditional addColumn.
 *          Safe to run even if columns already exist.
 */
/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const table = 'block_instances'
    const description = await queryInterface.describeTable(table)

    if (!description.dependent) {
      await queryInterface.addColumn(table, 'dependent', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      })
      console.log('✅ Added dependent column to block_instances')
    } else {
      console.log('ℹ️  Column block_instances.dependent already exists, skipping')
    }

    if (!description.visible) {
      await queryInterface.addColumn(table, 'visible', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      })
      console.log('✅ Added visible column to block_instances')
    } else {
      console.log('ℹ️  Column block_instances.visible already exists, skipping')
    }
  },

  async down(queryInterface) {
    const table = 'block_instances'
    const description = await queryInterface.describeTable(table)

    if (description.visible) {
      await queryInterface.removeColumn(table, 'visible')
      console.log('✅ Removed visible column from block_instances')
    }

    if (description.dependent) {
      await queryInterface.removeColumn(table, 'dependent')
      console.log('✅ Removed dependent column from block_instances')
    }
  },
}


