/**
 * Rename `valid_event_assignments` → `valid_event_cascades` for databases that ran an
 * older 051 migration (valid_events → valid_event_assignments). Fresh installs that
 * ran the updated 051 go straight to `valid_event_cascades` and skip this file's DDL.
 *
 * Also rewrites admin metadata keys `validEventAssignments` → `validEventCascades`
 * and selectType strings when still present.
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
          SET ${col} = replace(replace(
            ${col},
            'validEventAssignmentSelect', 'validEventCascadeSelect'),
            'validEventAssignments', 'validEventCascades'),
          updated_at = NOW()
          WHERE ${col} IS NOT NULL AND (
            ${col} LIKE '%validEventAssignmentSelect%' OR ${col} LIKE '%validEventAssignments%');
        `)
  }

  await q(`
          UPDATE public.${tableName}
          SET ic_selected_child_path = array_replace(ic_selected_child_path, 'validEventAssignments', 'validEventCascades'),
              updated_at = NOW()
          WHERE ic_selected_child_path IS NOT NULL AND 'validEventAssignments' = ANY(ic_selected_child_path);
        `)
  await q(`
          UPDATE public.${tableName}
          SET ic_candidate_child_path = array_replace(ic_candidate_child_path, 'validEventAssignments', 'validEventCascades'),
              updated_at = NOW()
          WHERE ic_candidate_child_path IS NOT NULL AND 'validEventAssignments' = ANY(ic_candidate_child_path);
        `)
  await q(`
          UPDATE public.${tableName}
          SET ic_candidate_parent_path = array_replace(ic_candidate_parent_path, 'validEventAssignments', 'validEventCascades'),
              updated_at = NOW()
          WHERE ic_candidate_parent_path IS NOT NULL AND 'validEventAssignments' = ANY(ic_candidate_parent_path);
        `)
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
        'valid_event_assignments'
      )
      const hasAdminRelationshipMetadata = await publicTableExists(
        sequelize,
        Sequelize,
        'admin_relationship_metadata'
      )

      if (hasAssignments) {
        await q(`ALTER TABLE public.valid_event_assignments RENAME TO valid_event_cascades;`)
        await q(
          `ALTER TABLE public.valid_event_cascades RENAME CONSTRAINT valid_event_assignments_pkey TO valid_event_cascades_pkey;`
        )
        await q(
          `ALTER TABLE public.valid_event_cascades RENAME CONSTRAINT valid_event_assignments_child_id_fkey TO valid_event_cascades_child_id_fkey;`
        )
        await q(
          `ALTER TABLE public.valid_event_cascades RENAME CONSTRAINT valid_event_assignments_parent_id_fkey TO valid_event_cascades_parent_id_fkey;`
        )
        await q(
          `ALTER INDEX public.idx_valid_event_assignments_child_id RENAME TO idx_valid_event_cascades_child_id;`
        )
        await q(
          `ALTER INDEX public.idx_valid_event_assignments_parent_child_unique RENAME TO idx_valid_event_cascades_parent_child_unique;`
        )
        await q(
          `ALTER INDEX public.idx_valid_event_assignments_parent_id RENAME TO idx_valid_event_cascades_parent_id;`
        )
      }

      await q(`
        UPDATE public.admin_metadata
        SET field_key = 'validEventCascades', updated_at = NOW()
        WHERE field_key = 'validEventAssignments';
      `)

      if (hasAdminRelationshipMetadata) {
        await q(`
        UPDATE public.admin_relationship_metadata
        SET relationship_key = 'validEventCascades', updated_at = NOW()
        WHERE relationship_key = 'validEventAssignments';
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
      'Irreversible migration 20260432_000053: valid_event_assignments → valid_event_cascades.'
    )
  },
}
