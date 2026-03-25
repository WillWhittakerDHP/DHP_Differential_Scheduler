/**
 * Rename differential role storage value moveable → minimizer (PostgreSQL ENUM),
 * migrate JSONB overrides, wizard_settings column names, and event-shape admin select metadata.
 * Down reverses renames (data round-trip for dev rollback).
 */

const EVENT_SHAPE_ADMIN_METADATA_ID = '132b05ce-f486-4d3d-be5d-211b13a7ee9d'

const INPUT_CONFIG_WITH_MARGIN = `{"options":[{"label":"None","value":null},{"label":"Major","value":"major"},{"label":"Minor","value":"minor"},{"label":"Minimizer","value":"minimizer"},{"label":"Margin","value":"margin"}]}`

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize

    await sequelize.query(`
    DO $migrate$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM pg_catalog.pg_enum e
        JOIN pg_catalog.pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'differential_role_enum'
          AND e.enumlabel = 'moveable'
      ) THEN
        ALTER TYPE public.differential_role_enum RENAME VALUE 'moveable' TO 'minimizer';
      END IF;
    END
    $migrate$;
  `)

    await sequelize.query(`
    UPDATE public.block_instances
    SET differential_event_role_overrides = sub.new_map
    FROM (
      SELECT
        id,
        COALESCE(
          (
            SELECT jsonb_object_agg(k, v)
            FROM (
              SELECT
                key AS k,
                CASE
                  WHEN value::text = '"moveable"' THEN '"minimizer"'::jsonb
                  ELSE value
                END AS v
              FROM jsonb_each(differential_event_role_overrides) AS t(key, value)
            ) x
          ),
          '{}'::jsonb
        ) AS new_map
      FROM public.block_instances
      WHERE differential_event_role_overrides IS NOT NULL
        AND differential_event_role_overrides::text LIKE '%moveable%'
    ) AS sub
    WHERE public.block_instances.id = sub.id;
  `)

    await sequelize.query(`
    DO $migrate$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'wizard_settings'
          AND column_name = 'moveable_fallback_label'
      ) THEN
        ALTER TABLE public.wizard_settings RENAME COLUMN moveable_fallback_label TO minimizer_fallback_label;
      END IF;
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'wizard_settings'
          AND column_name = 'sub_step_label_confirm_moveable'
      ) THEN
        ALTER TABLE public.wizard_settings RENAME COLUMN sub_step_label_confirm_moveable TO sub_step_label_confirm_minimizer;
      END IF;
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'wizard_settings'
          AND column_name = 'moveable_no_feasible_completion_slots_message'
      ) THEN
        ALTER TABLE public.wizard_settings RENAME COLUMN moveable_no_feasible_completion_slots_message TO minimizer_no_feasible_completion_slots_message;
      END IF;
    END
    $migrate$;
  `)

    await sequelize.query(`
    UPDATE public.entity_layout_config
    SET field_key = 'minimizer', updated_at = NOW()
    WHERE entity_type = 'part' AND field_key = 'moveable';
  `)

    await sequelize.query(`
    DO $migrate$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'admin_metadata'
          AND column_name = 'input_config'
      ) THEN
        UPDATE public.admin_metadata
        SET input_config = '${INPUT_CONFIG_WITH_MARGIN.replace(/'/g, "''")}'::jsonb,
            updated_at = NOW()
        WHERE id = '${EVENT_SHAPE_ADMIN_METADATA_ID}'::uuid;
      END IF;
    END
    $migrate$;
  `)
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize

    await sequelize.query(`
    DO $migrate$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'admin_metadata'
          AND column_name = 'input_config'
      ) THEN
        UPDATE public.admin_metadata
        SET input_config = '{"options":[{"label":"None","value":null},{"label":"Major","value":"major"},{"label":"Minor","value":"minor"},{"label":"Moveable","value":"moveable"},{"label":"Margin","value":"margin"}]}'::jsonb,
            updated_at = NOW()
        WHERE id = '${EVENT_SHAPE_ADMIN_METADATA_ID}'::uuid;
      END IF;
    END
    $migrate$;
  `)

    await sequelize.query(`
    UPDATE public.entity_layout_config
    SET field_key = 'moveable', updated_at = NOW()
    WHERE entity_type = 'part' AND field_key = 'minimizer';
  `)

    await sequelize.query(`
    DO $migrate$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'wizard_settings'
          AND column_name = 'minimizer_fallback_label'
      ) THEN
        ALTER TABLE public.wizard_settings RENAME COLUMN minimizer_fallback_label TO moveable_fallback_label;
      END IF;
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'wizard_settings'
          AND column_name = 'sub_step_label_confirm_minimizer'
      ) THEN
        ALTER TABLE public.wizard_settings RENAME COLUMN sub_step_label_confirm_minimizer TO sub_step_label_confirm_moveable;
      END IF;
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'wizard_settings'
          AND column_name = 'minimizer_no_feasible_completion_slots_message'
      ) THEN
        ALTER TABLE public.wizard_settings RENAME COLUMN minimizer_no_feasible_completion_slots_message TO moveable_no_feasible_completion_slots_message;
      END IF;
    END
    $migrate$;
  `)

    await sequelize.query(`
    UPDATE public.block_instances
    SET differential_event_role_overrides = sub.new_map
    FROM (
      SELECT
        id,
        COALESCE(
          (
            SELECT jsonb_object_agg(k, v)
            FROM (
              SELECT
                key AS k,
                CASE
                  WHEN value::text = '"minimizer"' THEN '"moveable"'::jsonb
                  ELSE value
                END AS v
              FROM jsonb_each(differential_event_role_overrides) AS t(key, value)
            ) x
          ),
          '{}'::jsonb
        ) AS new_map
      FROM public.block_instances
      WHERE differential_event_role_overrides IS NOT NULL
        AND differential_event_role_overrides::text LIKE '%minimizer%'
    ) AS sub
    WHERE public.block_instances.id = sub.id;
  `)

    await sequelize.query(`
    DO $migrate$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM pg_catalog.pg_enum e
        JOIN pg_catalog.pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'differential_role_enum'
          AND e.enumlabel = 'minimizer'
      ) THEN
        ALTER TYPE public.differential_role_enum RENAME VALUE 'minimizer' TO 'moveable';
      END IF;
    END
    $migrate$;
  `)
  },
}
