/**
 * Migration: Seed admin_metadata for pricingCascades and validPricingCascades
 * Date: 2026-02-13
 * Purpose: Add relationship field metadata so the admin UI shows Pricing Cascade
 *          on partInstance cards and Valid Pricing Cascades on partShape cards.
 */

const PART_INSTANCE_GLOBAL_ID = '00000000-0000-0000-0000-000000000003'
const PART_SHAPE_GLOBAL_ID = '00000000-0000-0000-0000-000000000002'

const PRICING_CASCADES_INPUT_CONFIG = JSON.stringify({
  targetKey: 'pricingCascades',
  groupByKey: 'partShapeRef',
  selectMode: 'multiple',
  selectType: 'pricingCascadeSelect',
  targetMode: 'relationship',
  globalField: 'pricingCascades',
  placeholder: 'No pricing cascades selected',
  selectedChildKey: 'partInstance',
  candidateChildKey: 'partInstance',
  selectedChildPath: ['pricingCascades'],
  selectedParentKey: 'partInstance',
  candidateChildPath: [],
  candidateParentKey: 'partShape',
  candidateParentPath: ['partShapeRef'],
})

const VALID_PRICING_CASCADES_INPUT_CONFIG = JSON.stringify({
  targetKey: 'validPricingCascades',
  selectMode: 'multiple',
  selectType: 'validPricingCascadeSelect',
  targetMode: 'relationship',
  globalField: 'validPricingCascades',
  placeholder: 'No valid pricing cascades',
  selectedChildKey: 'partShape',
  candidateChildKey: 'partShape',
  selectedChildPath: ['validPricingCascades'],
  selectedParentKey: 'partShape',
  candidateChildPath: [],
  candidateParentKey: 'partShape',
  candidateParentPath: [],
})

export default {
  async up(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      INSERT INTO public.admin_metadata (
        id, metadata_type, entity_type, entity_id, field_key, data_type, label,
        is_required, visibility, layout, display_order, render_as, status_button_color,
        panel, bulk_edit, input_config, created_at, updated_at, block_shape_ref
      ) VALUES
      (
        gen_random_uuid(),
        'relationship',
        'partInstance',
        '${PART_INSTANCE_GLOBAL_ID}',
        'pricingCascades',
        'reference',
        'Pricing Cascade',
        false,
        'expandedPanel',
        'stacked',
        20,
        'reference',
        NULL,
        'relationships',
        false,
        '${PRICING_CASCADES_INPUT_CONFIG.replace(/'/g, "''")}',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        NULL
      ),
      (
        gen_random_uuid(),
        'relationship',
        'partShape',
        '${PART_SHAPE_GLOBAL_ID}',
        'validPricingCascades',
        'reference',
        'Valid Pricing Cascades',
        false,
        'expandedPanel',
        'stacked',
        20,
        'reference',
        NULL,
        'relationships',
        false,
        '${VALID_PRICING_CASCADES_INPUT_CONFIG.replace(/'/g, "''")}',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        NULL
      );
    `)
    console.log('[pricing_cascade_metadata] Inserted admin_metadata for pricingCascades and validPricingCascades')
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      DELETE FROM public.admin_metadata
      WHERE metadata_type = 'relationship'
        AND (
          (entity_type = 'partInstance' AND field_key = 'pricingCascades')
          OR (entity_type = 'partShape' AND field_key = 'validPricingCascades')
        );
    `)
    console.log('[pricing_cascade_metadata] Removed admin_metadata for pricingCascades and validPricingCascades')
  },
}
