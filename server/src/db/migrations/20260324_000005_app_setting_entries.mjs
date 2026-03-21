/**
 * Registry-backed settings: one row per namespace with path `document` (phase 1).
 * Backfill from business_settings (availability_settings), calendar_settings, wizard_settings.
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS public.app_setting_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        namespace TEXT NOT NULL,
        path TEXT NOT NULL,
        value_jsonb JSONB NOT NULL,
        schema_version INTEGER NOT NULL DEFAULT 1,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT app_setting_entries_namespace_check CHECK (namespace IN ('availability', 'calendar', 'wizard')),
        CONSTRAINT app_setting_entries_namespace_path_key UNIQUE (namespace, path)
      );
    `)

    await sequelize.query(`
      COMMENT ON TABLE public.app_setting_entries IS 'Versioned key-value settings; phase 1 stores full document per namespace at path document';
    `)

    await sequelize.query(`
      INSERT INTO public.app_setting_entries (namespace, path, value_jsonb, schema_version, updated_at)
      SELECT 'availability', 'document', setting_value, 1, NOW()
      FROM public.business_settings
      WHERE setting_key = 'availability_settings'
      ON CONFLICT (namespace, path) DO UPDATE SET
        value_jsonb = EXCLUDED.value_jsonb,
        schema_version = EXCLUDED.schema_version,
        updated_at = EXCLUDED.updated_at;
    `)

    await sequelize.query(`
      INSERT INTO public.app_setting_entries (namespace, path, value_jsonb, schema_version, updated_at)
      SELECT 'calendar', 'document', setting_value, 1, NOW()
      FROM public.calendar_settings
      ORDER BY updated_at DESC NULLS LAST
      LIMIT 1
      ON CONFLICT (namespace, path) DO UPDATE SET
        value_jsonb = EXCLUDED.value_jsonb,
        schema_version = EXCLUDED.schema_version,
        updated_at = EXCLUDED.updated_at;
    `)

    await sequelize.query(`
      INSERT INTO public.app_setting_entries (namespace, path, value_jsonb, schema_version, updated_at)
      SELECT 'wizard', 'document', setting_value, 1, NOW()
      FROM public.wizard_settings
      ORDER BY updated_at DESC NULLS LAST
      LIMIT 1
      ON CONFLICT (namespace, path) DO UPDATE SET
        value_jsonb = EXCLUDED.value_jsonb,
        schema_version = EXCLUDED.schema_version,
        updated_at = EXCLUDED.updated_at;
    `)
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS public.app_setting_entries;`)
  },
}
