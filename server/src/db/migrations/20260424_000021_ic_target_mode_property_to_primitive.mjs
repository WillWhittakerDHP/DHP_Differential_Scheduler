/**
 * Select inputConfig: rename deprecated ic_target_mode value `property` → `primitive` (admin metadata tables only).
 * WHY: Runtime parse rejects `targetMode: 'property'`; DB must match canonical wire.
 *
 * Unified DBs only have public.admin_metadata (metadata_type discriminates primitive vs relationship).
 * Some environments may also have split admin_primitive_metadata / admin_relationship_metadata — update those only if present.
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

    if (!(await publicTableExists(sequelize, Sequelize, 'admin_metadata'))) {
      throw new Error('[migration 000021] public.admin_metadata is missing')
    }
    await sequelize.query(
      `UPDATE public.admin_metadata SET ic_target_mode = 'primitive' WHERE ic_target_mode = 'property'`
    )

    if (await publicTableExists(sequelize, Sequelize, 'admin_primitive_metadata')) {
      await sequelize.query(
        `UPDATE public.admin_primitive_metadata SET ic_target_mode = 'primitive' WHERE ic_target_mode = 'property'`
      )
    } else {
      console.info(
        '[migration 000021] public.admin_primitive_metadata absent; skipping (unified admin_metadata only).'
      )
    }

    if (await publicTableExists(sequelize, Sequelize, 'admin_relationship_metadata')) {
      await sequelize.query(
        `UPDATE public.admin_relationship_metadata SET ic_target_mode = 'primitive' WHERE ic_target_mode = 'property'`
      )
    } else {
      console.info(
        '[migration 000021] public.admin_relationship_metadata absent; skipping (unified admin_metadata only).'
      )
    }
  },

  async down() {
    // Irreversible: cannot distinguish rows that were always `primitive` from renamed `property`.
  },
}
