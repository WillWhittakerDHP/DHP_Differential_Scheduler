/**
 * Normalize ic_select_type values for collection relationship fields.
 *
 * Legacy DB rows use activePartSelect / activeAnnotationSelect, but the
 * canonical enum values (consumed by useSelectConfig, useSelectFiltering) are
 * partAssignmentSelect / annotationAssignmentSelect.  This migration aligns
 * the stored values so the runtime checks actually match.
 */

export default {
  /** @param {import('sequelize').QueryInterface} queryInterface */
  async up(queryInterface) {
    const { sequelize } = queryInterface

    await sequelize.query(`
      UPDATE admin_metadata
         SET ic_select_type = 'partAssignmentSelect',
             updated_at     = NOW()
       WHERE ic_select_type = 'activePartSelect';
    `)

    await sequelize.query(`
      UPDATE admin_metadata
         SET ic_select_type = 'annotationAssignmentSelect',
             updated_at     = NOW()
       WHERE ic_select_type = 'activeAnnotationSelect';
    `)

  },

  /** @param {import('sequelize').QueryInterface} queryInterface */
  async down(queryInterface) {
    const { sequelize } = queryInterface

    await sequelize.query(`
      UPDATE admin_metadata
         SET ic_select_type = 'activePartSelect',
             updated_at     = NOW()
       WHERE ic_select_type = 'partAssignmentSelect';
    `)

    await sequelize.query(`
      UPDATE admin_metadata
         SET ic_select_type = 'activeAnnotationSelect',
             updated_at     = NOW()
       WHERE ic_select_type = 'annotationAssignmentSelect';
    `)
  },
}
