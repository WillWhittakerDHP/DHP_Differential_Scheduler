/**
 * Remove event-shape isTernary / ternaryDefault (duration-accumulation gate, not differential roles).
 * Fix differentialRole admin metadata: title-row single select with minimizer + margin options;
 * refresh admin_metadata_select_options when normalized schema is in use.
 */

const ID_IS_TERNARY = 'e8a77f8e-a863-4eca-8673-750fec1b1ba8'
const ID_TERNARY_DEFAULT = 'aa8c6960-b977-47fb-9722-6e140a0e589e'
const ID_DIFFERENTIAL_ROLE = '132b05ce-f486-4d3d-be5d-211b13a7ee9d'

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize

    await sequelize.query(`
      DELETE FROM public.admin_metadata
      WHERE id IN ('${ID_IS_TERNARY}'::uuid, '${ID_TERNARY_DEFAULT}'::uuid);
    `)

    await sequelize.query(`
      UPDATE public.admin_metadata
      SET
        visibility = 'titleRow',
        layout = 'inline',
        display_order = 3,
        render_as = 'select',
        label = 'Differential role',
        updated_at = NOW()
      WHERE id = '${ID_DIFFERENTIAL_ROLE}'::uuid;
    `)

    const [colCheck] = await sequelize.query(
      `SELECT 1 AS ok FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'admin_metadata' AND column_name = 'input_config'
       LIMIT 1`
    )
    if (Array.isArray(colCheck) && colCheck.length > 0) {
      await sequelize.query(`
        UPDATE public.admin_metadata
        SET input_config = '{"options":[{"label":"None","value":null},{"label":"Major","value":"major"},{"label":"Minor","value":"minor"},{"label":"Minimizer","value":"minimizer"},{"label":"Margin","value":"margin"}]}'::jsonb,
            updated_at = NOW()
        WHERE id = '${ID_DIFFERENTIAL_ROLE}'::uuid;
      `)
    }

    const [optTable] = await sequelize.query(
      `SELECT 1 AS ok FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = 'admin_metadata_select_options'
       LIMIT 1`
    )
    if (Array.isArray(optTable) && optTable.length > 0) {
      await sequelize.query(`
        DELETE FROM public.admin_metadata_select_options
        WHERE admin_metadata_id = '${ID_DIFFERENTIAL_ROLE}'::uuid;
      `)
      await sequelize.query(`
        INSERT INTO public.admin_metadata_select_options
          (admin_metadata_id, display_order, label, value_payload, created_at, updated_at)
        VALUES
          ('${ID_DIFFERENTIAL_ROLE}'::uuid, 0, 'None', NULL, NOW(), NOW()),
          ('${ID_DIFFERENTIAL_ROLE}'::uuid, 1, 'Major', '"major"', NOW(), NOW()),
          ('${ID_DIFFERENTIAL_ROLE}'::uuid, 2, 'Minor', '"minor"', NOW(), NOW()),
          ('${ID_DIFFERENTIAL_ROLE}'::uuid, 3, 'Minimizer', '"minimizer"', NOW(), NOW()),
          ('${ID_DIFFERENTIAL_ROLE}'::uuid, 4, 'Margin', '"margin"', NOW(), NOW());
      `)
    }

    await sequelize.query(`ALTER TABLE public.event_shapes DROP CONSTRAINT IF EXISTS check_ternary_default_valid`)
    await sequelize.query(`ALTER TABLE public.event_shapes DROP COLUMN IF EXISTS is_ternary`)
    await sequelize.query(`ALTER TABLE public.event_shapes DROP COLUMN IF EXISTS ternary_default`)
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      ALTER TABLE public.event_shapes
        ADD COLUMN IF NOT EXISTS is_ternary BOOLEAN NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS ternary_default VARCHAR(10) NULL;
    `)
    await sequelize.query(`
      DO $d$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'check_ternary_default_valid'
        ) THEN
          ALTER TABLE public.event_shapes
            ADD CONSTRAINT check_ternary_default_valid CHECK (
              (ternary_default IS NULL) OR (
                (ternary_default)::text = ANY (
                  (ARRAY['true'::character varying, 'false'::character varying, 'override'::character varying])::text[]
                )
              )
            );
        END IF;
      END
      $d$;
    `)
  },
}
