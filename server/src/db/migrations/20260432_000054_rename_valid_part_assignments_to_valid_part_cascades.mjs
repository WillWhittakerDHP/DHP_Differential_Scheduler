/**
 * Rename `valid_part_assignments` → `valid_part_cascades` for databases that ran an
 * older 051 migration (valid_parts → valid_part_assignments). Fresh installs that
 * ran the updated 051 go straight to `valid_part_cascades` and skip this file's DDL.
 *
 * Also rewrites admin metadata keys and selectType strings when still present.
 */

const IC_STRING_COLS = [
  'ic_target_key',
  'ic_global_field',
  'ic_select_type',
  'ic_group_by_key',
  'ic_placeholder',
]

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

/**
 * @param {(sql: string, opts?: object) => Promise<unknown>} q
 * @param {'admin_metadata' | 'admin_relationship_metadata'} tableName
 */
async function patchIcColumns(q, tableName) {
  for (const col of IC_STRING_COLS) {
    await q(`
          UPDATE public.${tableName}
          SET ${col} = replace(replace(replace(replace(
            ${col},
            'validPartAssignmentSelect', 'validPartCascadeSelect'),
            'validPartSelect', 'validPartCascadeSelect'),
            'validPartAssignments', 'validPartCascades'),
            'validParts', 'validPartCascades'),
          updated_at = NOW()
          WHERE ${col} IS NOT NULL AND (
            ${col} LIKE '%validPartAssignmentSelect%' OR ${col} LIKE '%validPartSelect%'
            OR ${col} LIKE '%validPartAssignments%' OR ${col} LIKE '%validParts%');
        `)
  }

  for (const [oldK, newK] of [
    ['validPartAssignments', 'validPartCascades'],
    ['validParts', 'validPartCascades'],
  ]) {
    await q(`
          UPDATE public.${tableName}
          SET ic_selected_child_path = array_replace(ic_selected_child_path, '${oldK}', '${newK}'),
              updated_at = NOW()
          WHERE ic_selected_child_path IS NOT NULL AND '${oldK}' = ANY(ic_selected_child_path);
        `)
    await q(`
          UPDATE public.${tableName}
          SET ic_candidate_child_path = array_replace(ic_candidate_child_path, '${oldK}', '${newK}'),
              updated_at = NOW()
          WHERE ic_candidate_child_path IS NOT NULL AND '${oldK}' = ANY(ic_candidate_child_path);
        `)
    await q(`
          UPDATE public.${tableName}
          SET ic_candidate_parent_path = array_replace(ic_candidate_parent_path, '${oldK}', '${newK}'),
              updated_at = NOW()
          WHERE ic_candidate_parent_path IS NOT NULL AND '${oldK}' = ANY(ic_candidate_parent_path);
        `)
  }
}

/** @param {import('sequelize').QueryInterface} queryInterface */
export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.transaction(async (transaction) => {
      const q = (sql, opts = {}) =>
        sequelize.query(sql, { transaction, ...opts })

      const { Sequelize } = await import('sequelize')
      const hasAssignments = await publicTableExists(
        sequelize,
        Sequelize,
        'valid_part_assignments'
      )
      const hasAdminRelationshipMetadata = await publicTableExists(
        sequelize,
        Sequelize,
        'admin_relationship_metadata'
      )

      if (hasAssignments) {
        await q(`ALTER TABLE public.valid_part_assignments RENAME TO valid_part_cascades;`)
        await q(
          `ALTER TABLE public.valid_part_cascades RENAME CONSTRAINT valid_part_assignments_pkey TO valid_part_cascades_pkey;`
        )
        await q(
          `ALTER TABLE public.valid_part_cascades RENAME CONSTRAINT valid_part_assignments_parent_id_child_id_key TO valid_part_cascades_parent_id_child_id_key;`
        )
        await q(
          `ALTER TABLE public.valid_part_cascades RENAME CONSTRAINT valid_part_assignments_child_id_fkey TO valid_part_cascades_child_id_fkey;`
        )
        await q(
          `ALTER TABLE public.valid_part_cascades RENAME CONSTRAINT valid_part_assignments_parent_id_fkey TO valid_part_cascades_parent_id_fkey;`
        )
        await q(
          `ALTER INDEX public.valid_part_assignments_child_id_idx RENAME TO valid_part_cascades_child_id_idx;`
        )
        await q(
          `ALTER INDEX public.valid_part_assignments_parent_id_idx RENAME TO valid_part_cascades_parent_id_idx;`
        )
      }

      await q(`
        UPDATE public.admin_metadata
        SET field_key = 'validPartCascades', updated_at = NOW()
        WHERE field_key IN ('validPartAssignments', 'validParts');
      `)

      if (hasAdminRelationshipMetadata) {
        await q(`
        UPDATE public.admin_relationship_metadata
        SET relationship_key = 'validPartCascades', updated_at = NOW()
        WHERE relationship_key IN ('validPartAssignments', 'validParts');
      `)
      }

      await patchIcColumns(q, 'admin_metadata')
      if (hasAdminRelationshipMetadata) {
        await patchIcColumns(q, 'admin_relationship_metadata')
      }
    })
  },

  async down() {
    throw new Error(
      'Irreversible migration 20260432_000054: valid_part_assignments → valid_part_cascades.'
    )
  },
}
