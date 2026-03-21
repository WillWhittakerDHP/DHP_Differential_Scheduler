/**
 * Align blockShape validAnnotations with validParts UX: multiselect + lowercase ic_select_mode.
 * Does not modify validParts or any other field_key.
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      UPDATE public.admin_metadata
      SET
        render_as = 'multiselect',
        ic_select_mode = CASE
          WHEN ic_select_mode IS NULL OR TRIM(ic_select_mode::text) = '' THEN 'multiple'
          ELSE LOWER(ic_select_mode::text)
        END,
        updated_at = NOW()
      WHERE metadata_type = 'relationship'
        AND entity_type = 'blockShape'
        AND field_key = 'validAnnotations';
    `)
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      UPDATE public.admin_metadata
      SET
        render_as = 'relationshipCollection',
        updated_at = NOW()
      WHERE metadata_type = 'relationship'
        AND entity_type = 'blockShape'
        AND field_key = 'validAnnotations';
    `)
  },
}
