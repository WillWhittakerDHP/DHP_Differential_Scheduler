/**
 * Migration: Add differential_role column to event_shapes
 * Date: 2026-02-22
 * Purpose: Add a direct differentialRole field so each event shape declares its
 *          role (major/minor/moveable) explicitly, replacing indirect attendee
 *          matching and name-based fallbacks.
 *
 *   Step 1 – ALTER TABLE: add differential_role varchar(12) nullable
 *   Step 2 – UPDATE: seed existing rows based on current names
 *   Step 3 – Seed admin_metadata so the field renders as a select in admin UI
 */

export default {
  async up(queryInterface, _Sequelize) {
    // Step 1: Add column
    await queryInterface.sequelize.query(`
      ALTER TABLE public.event_shapes
      ADD COLUMN IF NOT EXISTS differential_role VARCHAR(12) DEFAULT NULL;
    `);
    console.log('[add_event_shape_differential_role] Added differential_role column');

    // Step 2: Seed existing rows by name
    await queryInterface.sequelize.query(`
      UPDATE public.event_shapes SET differential_role = 'major'    WHERE name = 'Total Time';
      UPDATE public.event_shapes SET differential_role = 'minor'    WHERE name = 'Client Presentation';
      UPDATE public.event_shapes SET differential_role = 'moveable' WHERE name = 'Moveable Part';
    `);
    console.log('[add_event_shape_differential_role] Seeded differential_role for 3 existing rows');

    // Step 3: Seed admin_metadata for differentialRole field
    const entityId = '00000000-0000-0000-0000-000000000010';
    const inputConfig = JSON.stringify({
      options: [
        { value: 'major', label: 'Major' },
        { value: 'minor', label: 'Minor' },
        { value: 'moveable', label: 'Moveable' },
        { value: null, label: 'None' },
      ],
    });

    // Delete-then-insert for idempotency (no unique constraint on admin_metadata)
    await queryInterface.sequelize.query(`
      DELETE FROM public.admin_metadata
      WHERE entity_type = 'eventShape'
        AND entity_id = '${entityId}'
        AND field_key = 'differentialRole';
    `);
    await queryInterface.sequelize.query(`
      INSERT INTO public.admin_metadata (
        id, metadata_type, entity_type, entity_id, field_key,
        data_type, label, render_as, input_config, created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        'primitive',
        'eventShape',
        '${entityId}',
        'differentialRole',
        'string',
        'Differential Role',
        'select',
        '${inputConfig.replace(/'/g, "''")}',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      );
    `);
    console.log('[add_event_shape_differential_role] Seeded admin_metadata for differentialRole select');
  },

  async down(queryInterface, _Sequelize) {
    // Remove admin_metadata entry
    await queryInterface.sequelize.query(`
      DELETE FROM public.admin_metadata
      WHERE entity_type = 'eventShape'
        AND entity_id = '00000000-0000-0000-0000-000000000010'
        AND field_key = 'differentialRole';
    `);

    // Remove column
    await queryInterface.sequelize.query(`
      ALTER TABLE public.event_shapes DROP COLUMN IF EXISTS differential_role;
    `);
    console.log('[add_event_shape_differential_role] Reverted: column and metadata removed');
  },
};
