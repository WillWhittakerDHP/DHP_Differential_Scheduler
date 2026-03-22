/**
 * Normalize appointment block selections: one row per selected block instance
 * (kind, sort order, quantity, optional snapshot version FK).
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      CREATE TABLE public.appointment_selection_lines (
        id uuid NOT NULL,
        appointment_id uuid NOT NULL,
        line_kind text NOT NULL,
        sort_order integer NOT NULL,
        block_instance_id uuid NOT NULL,
        quantity integer NOT NULL DEFAULT 1,
        snapshot_version_id uuid,
        CONSTRAINT appointment_selection_lines_pkey PRIMARY KEY (id),
        CONSTRAINT appointment_selection_lines_line_kind_check
          CHECK (line_kind = ANY (ARRAY['service'::text, 'property'::text, 'option'::text])),
        CONSTRAINT appointment_selection_lines_quantity_check CHECK (quantity >= 1),
        CONSTRAINT appointment_selection_lines_appointment_kind_order_uniq
          UNIQUE (appointment_id, line_kind, sort_order),
        CONSTRAINT appointment_selection_lines_appointment_id_fkey
          FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON UPDATE CASCADE ON DELETE CASCADE,
        CONSTRAINT appointment_selection_lines_block_instance_id_fkey
          FOREIGN KEY (block_instance_id) REFERENCES public.block_instances(id) ON UPDATE CASCADE ON DELETE RESTRICT,
        CONSTRAINT appointment_selection_lines_snapshot_version_id_fkey
          FOREIGN KEY (snapshot_version_id) REFERENCES public.block_instance_versions(id) ON UPDATE CASCADE ON DELETE SET NULL
      );
    `)
    await sequelize.query(`
      CREATE INDEX idx_appointment_selection_lines_appointment_id
        ON public.appointment_selection_lines USING btree (appointment_id);
    `)
    await sequelize.query(`
      CREATE INDEX idx_appointment_selection_lines_block_instance_id
        ON public.appointment_selection_lines USING btree (block_instance_id);
    `)
    await sequelize.query(`
      CREATE INDEX idx_appointment_selection_lines_snapshot_version_id
        ON public.appointment_selection_lines USING btree (snapshot_version_id);
    `)

    await sequelize.query(`
      INSERT INTO public.appointment_selection_lines (
        id, appointment_id, line_kind, sort_order, block_instance_id, quantity, snapshot_version_id
      )
      SELECT
        gen_random_uuid(),
        a.id,
        'service',
        (t.ord - 1)::integer,
        (t.block_id)::uuid,
        GREATEST(
          1,
          COALESCE(
            NULLIF(trim(a.service_quantities->>t.block_id), '')::integer,
            1
          )
        ),
        CASE
          WHEN a.service_snapshot_ids IS NOT NULL
            AND cardinality(a.service_snapshot_ids) >= t.ord
          THEN a.service_snapshot_ids[t.ord]
          ELSE NULL
        END
      FROM public.appointments a
      CROSS JOIN LATERAL jsonb_array_elements_text(a.selected_service_ids) WITH ORDINALITY AS t(block_id, ord)
      WHERE a.selected_service_ids IS NOT NULL
        AND jsonb_typeof(a.selected_service_ids) = 'array'
        AND jsonb_array_length(a.selected_service_ids) > 0;
    `)

    await sequelize.query(`
      INSERT INTO public.appointment_selection_lines (
        id, appointment_id, line_kind, sort_order, block_instance_id, quantity, snapshot_version_id
      )
      SELECT
        gen_random_uuid(),
        a.id,
        'property',
        (t.ord - 1)::integer,
        (t.block_id)::uuid,
        GREATEST(
          1,
          COALESCE(
            NULLIF(trim(a.property_quantities->>t.block_id), '')::integer,
            1
          )
        ),
        CASE
          WHEN a.property_snapshot_ids IS NOT NULL
            AND cardinality(a.property_snapshot_ids) >= t.ord
          THEN a.property_snapshot_ids[t.ord]
          ELSE NULL
        END
      FROM public.appointments a
      CROSS JOIN LATERAL jsonb_array_elements_text(a.selected_property_ids) WITH ORDINALITY AS t(block_id, ord)
      WHERE a.selected_property_ids IS NOT NULL
        AND jsonb_typeof(a.selected_property_ids) = 'array'
        AND jsonb_array_length(a.selected_property_ids) > 0;
    `)

    await sequelize.query(`
      INSERT INTO public.appointment_selection_lines (
        id, appointment_id, line_kind, sort_order, block_instance_id, quantity, snapshot_version_id
      )
      SELECT
        gen_random_uuid(),
        a.id,
        'option',
        (t.ord - 1)::integer,
        (t.block_id)::uuid,
        GREATEST(
          1,
          COALESCE(
            NULLIF(trim(a.option_quantities->>t.block_id), '')::integer,
            1
          )
        ),
        CASE
          WHEN a.option_snapshot_ids IS NOT NULL
            AND cardinality(a.option_snapshot_ids) >= t.ord
          THEN a.option_snapshot_ids[t.ord]
          ELSE NULL
        END
      FROM public.appointments a
      CROSS JOIN LATERAL jsonb_array_elements_text(a.selected_option_ids) WITH ORDINALITY AS t(block_id, ord)
      WHERE a.selected_option_ids IS NOT NULL
        AND jsonb_typeof(a.selected_option_ids) = 'array'
        AND jsonb_array_length(a.selected_option_ids) > 0;
    `)

    await sequelize.query(`DROP INDEX IF EXISTS public.idx_appointments_selected_service_ids;`)
    await sequelize.query(`DROP INDEX IF EXISTS public.idx_appointments_selected_dwelling_adjustment_ids;`)

    await sequelize.query(`ALTER TABLE public.appointments DROP COLUMN IF EXISTS selected_service_ids;`)
    await sequelize.query(`ALTER TABLE public.appointments DROP COLUMN IF EXISTS service_quantities;`)
    await sequelize.query(`ALTER TABLE public.appointments DROP COLUMN IF EXISTS service_snapshot_ids;`)
    await sequelize.query(`ALTER TABLE public.appointments DROP COLUMN IF EXISTS selected_property_ids;`)
    await sequelize.query(`ALTER TABLE public.appointments DROP COLUMN IF EXISTS property_quantities;`)
    await sequelize.query(`ALTER TABLE public.appointments DROP COLUMN IF EXISTS property_snapshot_ids;`)
    await sequelize.query(`ALTER TABLE public.appointments DROP COLUMN IF EXISTS selected_option_ids;`)
    await sequelize.query(`ALTER TABLE public.appointments DROP COLUMN IF EXISTS option_quantities;`)
    await sequelize.query(`ALTER TABLE public.appointments DROP COLUMN IF EXISTS option_snapshot_ids;`)
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`DROP TABLE IF EXISTS public.appointment_selection_lines;`)

    await sequelize.query(`
      ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS selected_service_ids jsonb;
    `)
    await sequelize.query(`
      ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS service_quantities jsonb;
    `)
    await sequelize.query(`
      ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS service_snapshot_ids uuid[];
    `)
    await sequelize.query(`
      ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS selected_property_ids jsonb;
    `)
    await sequelize.query(`
      ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS property_quantities jsonb;
    `)
    await sequelize.query(`
      ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS property_snapshot_ids uuid[];
    `)
    await sequelize.query(`
      ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS selected_option_ids jsonb;
    `)
    await sequelize.query(`
      ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS option_quantities jsonb;
    `)
    await sequelize.query(`
      ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS option_snapshot_ids uuid[];
    `)

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_appointments_selected_service_ids
        ON public.appointments USING gin (selected_service_ids);
    `)
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_appointments_selected_dwelling_adjustment_ids
        ON public.appointments USING gin (selected_property_ids);
    `)
  },
}
