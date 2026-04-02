/**
 * Phase 20.1.3.1 — Event schema alignment (Feature 20 §2.2–§2.4).
 *
 * - event_shapes: placement_kind + anchor_edge; drop differential_role, shape-level invite toggles.
 * - event_instances: parent_block_instance_id, location_*, per-segment include_reschedule_link / include_cancel_link.
 * - event_shape_attendees → event_instance_attendees (FK event_instance_id).
 * - Seed default placement type rows by name (§2.2).
 * - Prune admin_metadata keys for removed eventShape fields.
 *
 * Idempotent where practical. Attendee backfill: first event_instance per event_shape_ref (order_index, id).
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize

    await sequelize.query(`
      ALTER TABLE public.event_instances
        ADD COLUMN IF NOT EXISTS parent_block_instance_id UUID REFERENCES public.block_instances(id) ON UPDATE CASCADE ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS location_type VARCHAR(32),
        ADD COLUMN IF NOT EXISTS location_place_id TEXT,
        ADD COLUMN IF NOT EXISTS location_address TEXT,
        ADD COLUMN IF NOT EXISTS location_lat DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS location_lng DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS include_reschedule_link BOOLEAN NOT NULL DEFAULT true,
        ADD COLUMN IF NOT EXISTS include_cancel_link BOOLEAN NOT NULL DEFAULT true;
    `)

    await sequelize.query(`
      UPDATE public.event_instances ei
      SET
        include_reschedule_link = es.include_reschedule_link,
        include_cancel_link = es.include_cancel_link
      FROM public.event_shapes es
      WHERE es.id = ei.event_shape_ref;
    `)

    await sequelize.query(`
      UPDATE public.event_instances ei
      SET parent_block_instance_id = sub.parent_id
      FROM (
        SELECT DISTINCT ON (child_id) child_id, parent_id
        FROM public.event_assignments
        WHERE disabled = false
        ORDER BY child_id, created_at ASC
      ) sub
      WHERE sub.child_id = ei.id;
    `)

    await sequelize.query(`
      ALTER TABLE public.event_shapes
        ADD COLUMN IF NOT EXISTS placement_kind VARCHAR(32),
        ADD COLUMN IF NOT EXISTS anchor_edge VARCHAR(8);
    `)

    await sequelize.query(`
      UPDATE public.event_shapes
      SET
        placement_kind = CASE differential_role::text
          WHEN 'major' THEN 'primary'
          WHEN 'minor' THEN 'secondary'
          WHEN 'minimizer' THEN 'floating'
          WHEN 'margin' THEN 'marginal'
          ELSE 'primary'
        END,
        anchor_edge = CASE differential_role::text
          WHEN 'major' THEN NULL
          WHEN 'minor' THEN 'start'
          WHEN 'minimizer' THEN 'start'
          WHEN 'margin' THEN 'start'
          ELSE NULL
        END
      WHERE placement_kind IS NULL;
    `)

    await sequelize.query(`
      UPDATE public.event_shapes
      SET placement_kind = 'primary', anchor_edge = NULL
      WHERE placement_kind IS NULL OR placement_kind = '';
    `)

    await sequelize.query(`
      ALTER TABLE public.event_shapes
        ALTER COLUMN placement_kind SET NOT NULL;
    `)

    await sequelize.query(`
      ALTER TABLE public.event_shapes DROP CONSTRAINT IF EXISTS chk_event_shapes_placement_anchor;
    `)
    await sequelize.query(`
      ALTER TABLE public.event_shapes
        ADD CONSTRAINT chk_event_shapes_placement_anchor CHECK (
          (placement_kind = 'primary' AND anchor_edge IS NULL)
          OR (
            placement_kind IN ('secondary', 'marginal', 'floating')
            AND anchor_edge IN ('start', 'end')
          )
        );
    `)

    await sequelize.query(`
      ALTER TABLE public.event_shape_attendees
        ADD COLUMN IF NOT EXISTS event_instance_id UUID REFERENCES public.event_instances(id) ON UPDATE CASCADE ON DELETE CASCADE;
    `)

    await sequelize.query(`
      UPDATE public.event_shape_attendees esa
      SET event_instance_id = pick.id
      FROM (
        SELECT DISTINCT ON (event_shape_ref) event_shape_ref AS shape_id, id
        FROM public.event_instances
        ORDER BY event_shape_ref, order_index ASC, id ASC
      ) pick
      WHERE pick.shape_id = esa.event_shape_id AND esa.event_instance_id IS NULL;
    `)

    await sequelize.query(`
      DELETE FROM public.event_shape_attendees WHERE event_instance_id IS NULL;
    `)

    await sequelize.query(`
      ALTER TABLE public.event_shape_attendees DROP CONSTRAINT IF EXISTS event_shape_attendees_event_shape_id_fkey;
    `)
    await sequelize.query(`
      ALTER TABLE public.event_shape_attendees DROP COLUMN IF EXISTS event_shape_id;
    `)

    await sequelize.query(`
      DROP INDEX IF EXISTS public.idx_event_shape_attendees_event_shape_id;
    `)
    await sequelize.query(`
      ALTER TABLE public.event_shape_attendees RENAME TO event_instance_attendees;
    `)

    await sequelize.query(`
      ALTER TABLE public.event_instance_attendees
        ALTER COLUMN event_instance_id SET NOT NULL;
    `)

    await sequelize.query(`
      ALTER TABLE public.event_instance_attendees
        DROP CONSTRAINT IF EXISTS unique_event_shape_attendee;
    `)
    await sequelize.query(`
      ALTER TABLE public.event_instance_attendees
        ADD CONSTRAINT unique_event_instance_attendee UNIQUE (event_instance_id, user_type_block_instance_id);
    `)

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_event_instance_attendees_event_instance_id
        ON public.event_instance_attendees (event_instance_id);
    `)

    await sequelize.query(`
      ALTER TABLE public.event_shapes
        DROP COLUMN IF EXISTS differential_role,
        DROP COLUMN IF EXISTS include_reschedule_link,
        DROP COLUMN IF EXISTS include_cancel_link;
    `)

    await sequelize.query(`
      DELETE FROM public.admin_metadata
      WHERE entity_type = 'eventShape'
        AND field_key IN (
          'differentialRole',
          'differential_role',
          'includeRescheduleLink',
          'includeCancelLink',
          'include_reschedule_link',
          'include_cancel_link'
        );
    `)

    const seeds = [
      ['Primary', 'primary', null],
      ['FrontSecondary', 'secondary', 'start'],
      ['BackSecondary', 'secondary', 'end'],
      ['FrontMarginal', 'marginal', 'start'],
      ['BackMarginal', 'marginal', 'end'],
      ['FrontFloating', 'floating', 'start'],
      ['BackFloating', 'floating', 'end'],
    ]

    for (const [name, kind, edge] of seeds) {
      const edgeSql = edge === null ? 'NULL' : `'${edge}'`
      await sequelize.query(`
        INSERT INTO public.event_shapes (id, name, order_index, active, placement_kind, anchor_edge, created_at, updated_at)
        VALUES (gen_random_uuid(), '${name}', 0, true, '${kind}', ${edgeSql}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (name) DO UPDATE SET
          placement_kind = EXCLUDED.placement_kind,
          anchor_edge = EXCLUDED.anchor_edge,
          updated_at = CURRENT_TIMESTAMP;
      `)
    }
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      ALTER TABLE public.event_shapes
        ADD COLUMN IF NOT EXISTS differential_role public.differential_role_enum,
        ADD COLUMN IF NOT EXISTS include_reschedule_link BOOLEAN NOT NULL DEFAULT true,
        ADD COLUMN IF NOT EXISTS include_cancel_link BOOLEAN NOT NULL DEFAULT true;
    `)
    await sequelize.query(`
      ALTER TABLE public.event_shapes DROP CONSTRAINT IF EXISTS chk_event_shapes_placement_anchor;
    `)
    await sequelize.query(`
      ALTER TABLE public.event_shapes DROP COLUMN IF EXISTS placement_kind;
      ALTER TABLE public.event_shapes DROP COLUMN IF EXISTS anchor_edge;
    `)
    await sequelize.query(`
      ALTER TABLE public.event_instance_attendees RENAME TO event_shape_attendees;
    `)
    await sequelize.query(`
      ALTER TABLE public.event_shape_attendees ADD COLUMN IF NOT EXISTS event_shape_id UUID;
    `)
    await sequelize.query(`
      ALTER TABLE public.event_instances
        DROP COLUMN IF EXISTS parent_block_instance_id,
        DROP COLUMN IF EXISTS location_type,
        DROP COLUMN IF EXISTS location_place_id,
        DROP COLUMN IF EXISTS location_address,
        DROP COLUMN IF EXISTS location_lat,
        DROP COLUMN IF EXISTS location_lng,
        DROP COLUMN IF EXISTS include_reschedule_link,
        DROP COLUMN IF EXISTS include_cancel_link;
    `)
    void sequelize
    void queryInterface
  },
}
