/**
 * Phase 6.12.1.3: Per–user-type annotation copy in annotation_instance_content; backfill from annotation_instances.
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS public.annotation_instance_content (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        annotation_instance_id uuid NOT NULL
          REFERENCES public.annotation_instances (id) ON UPDATE CASCADE ON DELETE CASCADE,
        user_type_block_instance_id uuid NULL
          REFERENCES public.block_instances (id) ON UPDATE CASCADE ON DELETE SET NULL,
        text text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `)
    await sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_annotation_instance_content_generic
        ON public.annotation_instance_content (annotation_instance_id)
        WHERE user_type_block_instance_id IS NULL;
    `)
    await sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_annotation_instance_content_typed
        ON public.annotation_instance_content (annotation_instance_id, user_type_block_instance_id)
        WHERE user_type_block_instance_id IS NOT NULL;
    `)
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_annotation_instance_content_annotation_id
        ON public.annotation_instance_content (annotation_instance_id);
    `)
    await sequelize.query(`
      INSERT INTO public.annotation_instance_content (
        id,
        annotation_instance_id,
        user_type_block_instance_id,
        text,
        created_at,
        updated_at
      )
      SELECT
        gen_random_uuid(),
        ai.id,
        CASE
          WHEN ai.user_type IS NOT NULL AND ai.user_type ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
            THEN ai.user_type::uuid
          ELSE NULL
        END,
        ai.text,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      FROM public.annotation_instances ai;
    `)
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`DROP TABLE IF EXISTS public.annotation_instance_content;`)
  },
}
