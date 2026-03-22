/**
 * Shape-level valid* relationship fields: multiselect in admin (not RelationshipCollection).
 * Reverses over-broad 000032 for these keys. validEvents lives on partShape only (no blockShape.validEvents in schema).
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      UPDATE public.admin_metadata
      SET render_as = 'multiselect', updated_at = NOW()
      WHERE metadata_type = 'relationship'
        AND field_key IN (
          'validParts',
          'validAnnotations',
          'validCascades',
          'validEvents',
          'validPricingCascades'
        )
        AND render_as IS DISTINCT FROM 'multiselect';
    `)
  },
}
