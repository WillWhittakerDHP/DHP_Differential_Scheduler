/**
 * Relational selected time slots: migrate from appointments.selected_time_slots JSONB.
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize

    await sequelize.query(`
      CREATE TABLE public.appointment_time_slots (
        id uuid NOT NULL,
        appointment_id uuid NOT NULL,
        sort_order integer NOT NULL,
        start_at timestamp with time zone NOT NULL,
        end_at timestamp with time zone NOT NULL,
        duration_minutes integer,
        slot_metadata jsonb,
        CONSTRAINT appointment_time_slots_pkey PRIMARY KEY (id),
        CONSTRAINT appointment_time_slots_appointment_sort_uniq
          UNIQUE (appointment_id, sort_order),
        CONSTRAINT appointment_time_slots_appointment_id_fkey
          FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON UPDATE CASCADE ON DELETE CASCADE
      );
    `)

    await sequelize.query(`
      CREATE INDEX idx_appointment_time_slots_appointment_id
        ON public.appointment_time_slots USING btree (appointment_id);
    `)

    await sequelize.query(`
      INSERT INTO public.appointment_time_slots (
        id, appointment_id, sort_order, start_at, end_at, duration_minutes, slot_metadata
      )
      SELECT
        gen_random_uuid(),
        a.id,
        (t.ord - 1)::integer,
        COALESCE(
          (t.elem->>'startTime')::timestamptz,
          (t.elem->>'time')::timestamptz
        ),
        COALESCE(
          (t.elem->>'endTime')::timestamptz,
          (t.elem->>'time')::timestamptz
        ),
        CASE
          WHEN (t.elem->>'duration') ~ '^[0-9]+$' THEN (t.elem->>'duration')::integer
          ELSE NULL
        END,
        NULLIF(
          t.elem
            - 'startTime'
            - 'endTime'
            - 'time'
            - 'duration',
          '{}'::jsonb
        )
      FROM public.appointments a
      CROSS JOIN LATERAL jsonb_array_elements(a.selected_time_slots) WITH ORDINALITY AS t(elem, ord)
      WHERE a.selected_time_slots IS NOT NULL
        AND jsonb_typeof(a.selected_time_slots) = 'array'
        AND jsonb_array_length(a.selected_time_slots) > 0
        AND (
          COALESCE((t.elem->>'startTime')::timestamptz, (t.elem->>'time')::timestamptz) IS NOT NULL
          AND COALESCE((t.elem->>'endTime')::timestamptz, (t.elem->>'time')::timestamptz) IS NOT NULL
        );
    `)

    await sequelize.query(`
      ALTER TABLE public.appointments DROP COLUMN IF EXISTS selected_time_slots;
    `)
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      ALTER TABLE public.appointments
        ADD COLUMN IF NOT EXISTS selected_time_slots jsonb;
    `)
    await sequelize.query(`
      UPDATE public.appointments a
      SET selected_time_slots = sub.slots
      FROM (
        SELECT
          s.appointment_id,
          jsonb_agg(
            row_json.slot
            ORDER BY s.sort_order
          ) AS slots
        FROM public.appointment_time_slots s
        CROSS JOIN LATERAL (
          SELECT
            (
              jsonb_build_object(
                'startTime', to_jsonb(s.start_at),
                'endTime', to_jsonb(s.end_at),
                'duration', to_jsonb(s.duration_minutes)
              )
              || COALESCE(s.slot_metadata, '{}'::jsonb)
            ) AS slot
        ) row_json
        GROUP BY s.appointment_id
      ) sub
      WHERE a.id = sub.appointment_id;
    `)
    await sequelize.query(`DROP TABLE IF EXISTS public.appointment_time_slots;`)
  },
}
