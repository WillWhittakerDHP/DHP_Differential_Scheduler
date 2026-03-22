/**
 * Block shape `validAnnotations` relationship metadata: ensure input_config.selectMode is `multiple`
 * so multiselect/reference render paths match `validParts` (useSelectConfig / resolveSelectMultiple).
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      UPDATE public.admin_metadata
      SET
        input_config = input_config || '{"selectMode": "multiple", "groupByKey": null}'::jsonb,
        updated_at = NOW()
      WHERE metadata_type = 'relationship'
        AND entity_type = 'blockShape'
        AND field_key = 'validAnnotations'
        AND block_shape_ref IS NULL
        AND (input_config->>'selectMode' IS NULL OR input_config->>'selectMode' = '');
    `)
  },

  async down() {
    // Intentionally no-op: removing selectMode could break multiselect UX; baseline refresh can restore.
  },
}
