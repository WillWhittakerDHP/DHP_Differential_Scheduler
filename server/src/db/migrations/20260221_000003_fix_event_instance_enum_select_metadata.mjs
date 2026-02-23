/**
 * Migration: Fix EventInstance enum select metadata
 * Date: 2026-02-21
 * Purpose: The original seed set render_as='select' but input_config=null for enum fields.
 *          The metadata editor's computeRenderAs overwrote render_as to 'text' on save
 *          because buildInputConfig returned null when targetMode was missing.
 *          This migration:
 *            1. Resets render_as back to 'select' for the affected fields
 *            2. Seeds input_config with options arrays so the SelectInputs component
 *               and fieldComponentDispatcher recognize them as valid selects
 */

export default {
  async up(queryInterface, _Sequelize) {
    const entityId = '00000000-0000-0000-0000-000000000012';

    const fieldOptions = [
      {
        field_key: 'visibility',
        options: [
          { value: 'default', label: 'Default' },
          { value: 'public', label: 'Public' },
          { value: 'private', label: 'Private' },
          { value: 'confidential', label: 'Confidential' },
        ],
      },
      {
        field_key: 'transparency',
        options: [
          { value: 'opaque', label: 'Busy' },
          { value: 'transparent', label: 'Free' },
        ],
      },
      {
        field_key: 'status',
        options: [
          { value: 'confirmed', label: 'Confirmed' },
          { value: 'tentative', label: 'Tentative' },
        ],
      },
      {
        field_key: 'sendUpdates',
        options: [
          { value: 'all', label: 'All Attendees' },
          { value: 'externalOnly', label: 'External Only' },
          { value: 'none', label: 'None' },
        ],
      },
      {
        field_key: 'colorId',
        options: [
          { value: '1', label: 'Lavender' },
          { value: '2', label: 'Sage' },
          { value: '3', label: 'Grape' },
          { value: '4', label: 'Flamingo' },
          { value: '5', label: 'Banana' },
          { value: '6', label: 'Tangerine' },
          { value: '7', label: 'Peacock' },
          { value: '8', label: 'Graphite' },
          { value: '9', label: 'Blueberry' },
          { value: '10', label: 'Basil' },
          { value: '11', label: 'Tomato' },
        ],
      },
    ];

    for (const field of fieldOptions) {
      const inputConfig = JSON.stringify({ options: field.options });

      await queryInterface.sequelize.query(`
        UPDATE public.admin_metadata
        SET render_as = 'select',
            input_config = '${inputConfig.replace(/'/g, "''")}',
            updated_at = CURRENT_TIMESTAMP
        WHERE entity_type = 'eventInstance'
          AND entity_id = '${entityId}'
          AND field_key = '${field.field_key}';
      `);
    }

    console.log('[fix_event_instance_enum_select_metadata] Fixed 5 enum select fields: render_as restored, input_config seeded with options');
  },

  async down(queryInterface, _Sequelize) {
    const entityId = '00000000-0000-0000-0000-000000000012';
    const fieldKeys = ['visibility', 'transparency', 'status', 'sendUpdates', 'colorId'];

    for (const key of fieldKeys) {
      await queryInterface.sequelize.query(`
        UPDATE public.admin_metadata
        SET render_as = 'text',
            input_config = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE entity_type = 'eventInstance'
          AND entity_id = '${entityId}'
          AND field_key = '${key}';
      `);
    }

    console.log('[fix_event_instance_enum_select_metadata] Reverted 5 fields to render_as=text, input_config=NULL');
  },
};
