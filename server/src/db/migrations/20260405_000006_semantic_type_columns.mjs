/**
 * Rename block_shapes.type → semantic_type; add block_instances.semantic_type;
 * backfill instance roles from user_role_block_alignments JSON.
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize

    await sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'block_shapes' AND column_name = 'type'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'block_shapes' AND column_name = 'semantic_type'
        ) THEN
          ALTER TABLE public.block_shapes RENAME COLUMN type TO semantic_type;
        END IF;
      END $$;
    `)

    await sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'block_instances' AND column_name = 'semantic_type'
        ) THEN
          ALTER TABLE public.block_instances
            ADD COLUMN semantic_type character varying(64) NULL;
          COMMENT ON COLUMN public.block_instances.semantic_type IS
            'For user-semantic block shapes: canonical user role key (shared USER_ROLE_VALUES). Nullable.';
        END IF;
      END $$;
    `)

    await sequelize.query(`
      UPDATE public.admin_metadata
      SET field_key = 'semanticType', label = 'App-wide Semantic Type'
      WHERE entity_type = 'blockShape' AND field_key = 'type';
    `)

    await sequelize.query(`
      UPDATE public.entity_layout_config
      SET field_key = 'semanticType'
      WHERE entity_type = 'blockShape' AND field_key = 'type';
    `)

    await sequelize.query(`
      UPDATE public.admin_metadata
      SET input_config = replace(
        input_config::text,
        '"filterCandidates": {"blockShape": {"type": "user"}}',
        '"filterCandidates": {"blockShape": {"semanticType": "user"}}'
      )::jsonb
      WHERE input_config::text LIKE '%"filterCandidates": {"blockShape": {"type": "user"}}%';
    `)

    await sequelize.query(`
      UPDATE public.block_instances bi
      SET semantic_type = x.role_key
      FROM (
        SELECT t.k AS role_key, NULLIF(trim(t.v), '') AS instance_id
        FROM (
          SELECT alignments FROM public.user_role_block_alignments ORDER BY created_at ASC LIMIT 1
        ) ur
        CROSS JOIN LATERAL jsonb_each_text(ur.alignments) AS t(k, v)
      ) AS x
      WHERE x.instance_id IS NOT NULL
        AND bi.id::text = x.instance_id;
    `)
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize

    await sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'block_instances' AND column_name = 'semantic_type'
        ) THEN
          ALTER TABLE public.block_instances DROP COLUMN IF EXISTS semantic_type;
        END IF;
      END $$;
    `)

    await sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'block_shapes' AND column_name = 'semantic_type'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'block_shapes' AND column_name = 'type'
        ) THEN
          ALTER TABLE public.block_shapes RENAME COLUMN semantic_type TO type;
        END IF;
      END $$;
    `)
  },
}
