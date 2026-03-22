/**
 * Align shape-level relationship panels with instance-level grouping:
 * validParts → parts, validAnnotations → annotations, validEvents → events.
 * Matches client determinePanelFromFieldKey (fieldLocationDispatcher).
 *
 * Unified DB: public.admin_metadata (metadata_type = 'relationship').
 * Split DB: public.admin_relationship_metadata — panel ENUM may lack `events`; only parts/annotations updated there.
 */

/**
 * @param {import('sequelize').Sequelize} sequelize
 * @param {typeof import('sequelize').Sequelize} SequelizeCtor
 * @param {string} tableName
 */
async function publicTableExists(sequelize, SequelizeCtor, tableName) {
  const { QueryTypes } = SequelizeCtor
  const rows = await sequelize.query(
    `SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = :tableName
     LIMIT 1`,
    { replacements: { tableName }, type: QueryTypes.SELECT }
  )
  return rows.length > 0
}

/** @param {import('sequelize').QueryInterface} queryInterface */
export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    const { Sequelize } = await import('sequelize')

    if (await publicTableExists(sequelize, Sequelize, 'admin_metadata')) {
      await sequelize.query(`
        UPDATE public.admin_metadata
        SET panel = 'parts', updated_at = NOW()
        WHERE metadata_type = 'relationship'
          AND field_key = 'validParts'
          AND panel IS DISTINCT FROM 'parts';
      `)
      await sequelize.query(`
        UPDATE public.admin_metadata
        SET panel = 'annotations', updated_at = NOW()
        WHERE metadata_type = 'relationship'
          AND field_key = 'validAnnotations'
          AND panel IS DISTINCT FROM 'annotations';
      `)
      await sequelize.query(`
        UPDATE public.admin_metadata
        SET panel = 'events', updated_at = NOW()
        WHERE metadata_type = 'relationship'
          AND field_key = 'validEvents'
          AND panel IS DISTINCT FROM 'events';
      `)
    } else {
      console.info(
        '[migration 000028] public.admin_metadata absent; skipping unified panel updates.'
      )
    }

    if (await publicTableExists(sequelize, Sequelize, 'admin_relationship_metadata')) {
      await sequelize.query(`
        UPDATE public.admin_relationship_metadata
        SET panel = 'parts', updated_at = NOW()
        WHERE relationship_key = 'validParts'
          AND panel IS DISTINCT FROM 'parts';
      `)
      await sequelize.query(`
        UPDATE public.admin_relationship_metadata
        SET panel = 'annotations', updated_at = NOW()
        WHERE relationship_key = 'validAnnotations'
          AND panel IS DISTINCT FROM 'annotations';
      `)
      try {
        await sequelize.query(`
          UPDATE public.admin_relationship_metadata
          SET panel = 'events', updated_at = NOW()
          WHERE relationship_key = 'validEvents'
            AND panel IS DISTINCT FROM 'events';
        `)
      } catch (err) {
        console.warn(
          '[migration 000028] validEvents → events skipped on admin_relationship_metadata (ENUM may omit events):',
          err?.message ?? err
        )
      }
    } else {
      console.info(
        '[migration 000028] public.admin_relationship_metadata absent; skipping split-table panel updates.'
      )
    }
  },
}
