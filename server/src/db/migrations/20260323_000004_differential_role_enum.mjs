/**
 * Migrate event_shapes.differential_role from varchar to differential_role_enum (major|minor|moveable, NULL allowed).
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize

    await sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE public.differential_role_enum AS ENUM ('major', 'minor', 'moveable');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `)

    await sequelize.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'event_shapes'
          AND column_name = 'differential_role'
      ) THEN
        ALTER TABLE public.event_shapes
          ALTER COLUMN differential_role DROP DEFAULT;

        ALTER TABLE public.event_shapes
          ALTER COLUMN differential_role TYPE public.differential_role_enum
          USING (
            CASE
              WHEN differential_role IS NULL THEN NULL::public.differential_role_enum
              WHEN trim(differential_role::text) = 'major' THEN 'major'::public.differential_role_enum
              WHEN trim(differential_role::text) = 'minor' THEN 'minor'::public.differential_role_enum
              WHEN trim(differential_role::text) = 'moveable' THEN 'moveable'::public.differential_role_enum
              ELSE NULL
            END
          );
      END IF;
    END $$;
  `)

    await sequelize.query(`
    UPDATE public.admin_metadata
    SET input_config = '{"options":[{"label":"None","value":null},{"label":"Major","value":"major"},{"label":"Minor","value":"minor"},{"label":"Moveable","value":"moveable"}]}'
    WHERE id = '132b05ce-f486-4d3d-be5d-211b13a7ee9d';
  `)
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize

    await sequelize.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'event_shapes'
          AND column_name = 'differential_role'
      ) THEN
        ALTER TABLE public.event_shapes
          ALTER COLUMN differential_role TYPE character varying(12)
          USING (
            CASE
              WHEN differential_role IS NULL THEN NULL::character varying
              ELSE differential_role::text::character varying(12)
            END
          );
      END IF;
    END $$;
  `)

    await sequelize.query(`
    DROP TYPE IF EXISTS public.differential_role_enum;
  `)
  },
}
