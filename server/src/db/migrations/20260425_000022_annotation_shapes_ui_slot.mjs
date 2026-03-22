/**
 * Task 6.12.2.1: annotation_shapes.ui_slot + admin_metadata for wizard UI slot select.
 */

const ANNOTATION_SHAPE_GLOBAL_ID = '00000000-0000-0000-0000-000000000011'

const SLOT_OPTIONS = [
  { label: 'No wizard slot', valuePayload: null },
  { label: 'Card Description', valuePayload: JSON.stringify('cardDescription') },
  { label: 'Card Tooltip', valuePayload: JSON.stringify('cardTooltip') },
  { label: 'Color Label', valuePayload: JSON.stringify('cardColorLabel') },
  { label: 'Section Header', valuePayload: JSON.stringify('sectionHeader') },
  { label: 'Grid Overlay', valuePayload: JSON.stringify('gridOverlay') },
  { label: 'Confirmation Note', valuePayload: JSON.stringify('confirmationNote') },
  { label: 'Validation Message', valuePayload: JSON.stringify('validationMessage') },
]

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize

    await sequelize.query(`
      ALTER TABLE public.annotation_shapes
        ADD COLUMN IF NOT EXISTS ui_slot VARCHAR(50) NULL;
    `)

    await sequelize.query(`
      COMMENT ON COLUMN public.annotation_shapes.ui_slot IS
        'Registered wizard UI slot key (see shared/constants/annotationSlots.ts) or NULL';
    `)

    await sequelize.query(`
      UPDATE public.annotation_shapes
      SET ui_slot = 'cardDescription'
      WHERE ui_slot IS NULL AND LOWER(name) = 'description';
    `)
    await sequelize.query(`
      UPDATE public.annotation_shapes
      SET ui_slot = 'cardTooltip'
      WHERE ui_slot IS NULL AND LOWER(name) = 'tooltip';
    `)
    await sequelize.query(`
      UPDATE public.annotation_shapes
      SET ui_slot = 'validationMessage'
      WHERE ui_slot IS NULL AND LOWER(name) IN ('validation_message', 'validationmessage');
    `)

    await sequelize.query(
      `
      INSERT INTO public.admin_metadata (
        id,
        metadata_type,
        entity_type,
        entity_id,
        field_key,
        data_type,
        label,
        is_required,
        visibility,
        layout,
        display_order,
        render_as,
        status_button_color,
        panel,
        bulk_edit,
        created_at,
        updated_at,
        block_shape_ref
      )
      SELECT
        gen_random_uuid(),
        'primitive',
        'annotationShape',
        :globalId::uuid,
        'uiSlot',
        'string',
        'Wizard UI slot',
        false,
        'expandedDirect',
        'stacked',
        4,
        'select',
        NULL,
        'none',
        false,
        NOW(),
        NOW(),
        NULL
      WHERE NOT EXISTS (
        SELECT 1
        FROM public.admin_metadata am
        WHERE am.entity_type = 'annotationShape'
          AND am.entity_id = :globalId::uuid
          AND am.metadata_type = 'primitive'
          AND am.field_key = 'uiSlot'
          AND am.block_shape_ref IS NULL
      )
    `,
      { replacements: { globalId: ANNOTATION_SHAPE_GLOBAL_ID } }
    )

    const [rows] = await sequelize.query(
      `
      SELECT id FROM public.admin_metadata
      WHERE entity_type = 'annotationShape'
        AND entity_id = :globalId::uuid
        AND metadata_type = 'primitive'
        AND field_key = 'uiSlot'
        AND block_shape_ref IS NULL
      LIMIT 1;
    `,
      { replacements: { globalId: ANNOTATION_SHAPE_GLOBAL_ID } }
    )

    const metaId = rows?.[0]?.id
    if (!metaId) {
      return
    }

    const [existingOpts] = await sequelize.query(
      `SELECT COUNT(*)::int AS c FROM public.admin_metadata_select_options WHERE admin_metadata_id = :id`,
      { replacements: { id: metaId } }
    )
    const optCount = Number(existingOpts?.[0]?.c ?? 0)
    if (optCount > 0) {
      return
    }

    for (let i = 0; i < SLOT_OPTIONS.length; i += 1) {
      const opt = SLOT_OPTIONS[i]
      await sequelize.query(
        `
        INSERT INTO public.admin_metadata_select_options (
          admin_metadata_id,
          display_order,
          label,
          value_payload,
          created_at,
          updated_at
        ) VALUES (
          :adminMetadataId,
          :displayOrder,
          :label,
          :valuePayload,
          NOW(),
          NOW()
        );
      `,
        {
          replacements: {
            adminMetadataId: metaId,
            displayOrder: i,
            label: opt.label,
            valuePayload: opt.valuePayload,
          },
        }
      )
    }
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize

    await sequelize.query(
      `
      DELETE FROM public.admin_metadata_select_options
      WHERE admin_metadata_id IN (
        SELECT id FROM public.admin_metadata
        WHERE entity_type = 'annotationShape'
          AND entity_id = :globalId::uuid
          AND field_key = 'uiSlot'
          AND block_shape_ref IS NULL
      );
    `,
      { replacements: { globalId: ANNOTATION_SHAPE_GLOBAL_ID } }
    )

    await sequelize.query(
      `
      DELETE FROM public.admin_metadata
      WHERE entity_type = 'annotationShape'
        AND entity_id = :globalId::uuid
        AND metadata_type = 'primitive'
        AND field_key = 'uiSlot'
        AND block_shape_ref IS NULL;
    `,
      { replacements: { globalId: ANNOTATION_SHAPE_GLOBAL_ID } }
    )

    await sequelize.query(`
      ALTER TABLE public.annotation_shapes DROP COLUMN IF EXISTS ui_slot;
    `)
  },
}
