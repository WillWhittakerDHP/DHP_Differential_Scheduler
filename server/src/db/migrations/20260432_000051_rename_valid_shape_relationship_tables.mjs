/**
 * Rename shape-level relationship tables and align admin metadata / relationship keys.
 *
 * Legacy `valid_parts` (when present) → `valid_part_cascades`
 * Legacy `valid_cascades` (when present) → `valid_booking_cascades`
 * Legacy `valid_events` (when present) → `valid_event_cascades`
 * valid_annotations → valid_annotation_assignments
 *
 * Frontend / API relationship kinds (camelCase) and selectType strings are updated in DB rows.
 *
 * NOTE: Unified `admin_metadata` has no `input_config` JSONB — relationship UI config lives in `ic_*` columns.
 * Split deployments may have `admin_relationship_metadata`; unified DBs do not — updates there are gated on table existence.
 */

const IC_STRING_COLS = [
  'ic_target_key',
  'ic_global_field',
  'ic_select_type',
  'ic_group_by_key',
  'ic_placeholder',
]

const KEY_REPLACEMENTS = [
  ['validCascades', 'validBookingCascades'],
  ['validParts', 'validPartCascades'],
  ['validPartAssignments', 'validPartCascades'],
  ['validAnnotations', 'validAnnotationAssignments'],
  ['validEvents', 'validEventCascades'],
  ['validEventAssignments', 'validEventCascades'],
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
async function patchIcColumnsUp(q, tableName) {
  for (const col of IC_STRING_COLS) {
    await q(`
          UPDATE public.${tableName}
          SET ${col} = replace(replace(replace(replace(replace(replace(
            ${col},
            'validCascadeSelect', 'validBookingCascadeSelect'),
            'validPartAssignmentSelect', 'validPartCascadeSelect'),
            'validPartSelect', 'validPartCascadeSelect'),
            'validAnnotationSelect', 'validAnnotationAssignmentSelect'),
            'validEventAssignmentSelect', 'validEventCascadeSelect'),
            'validEventSelect', 'validEventCascadeSelect'),
          updated_at = NOW()
          WHERE ${col} IS NOT NULL AND (
            ${col} LIKE '%validCascadeSelect%' OR ${col} LIKE '%validPartSelect%'
            OR ${col} LIKE '%validPartAssignmentSelect%'
            OR ${col} LIKE '%validAnnotationSelect%' OR ${col} LIKE '%validEventSelect%'
            OR ${col} LIKE '%validEventAssignmentSelect%');
        `)
    await q(`
          UPDATE public.${tableName}
          SET ${col} = replace(replace(replace(replace(replace(replace(
            ${col},
            'validCascades', 'validBookingCascades'),
            'validPartAssignments', 'validPartCascades'),
            'validParts', 'validPartCascades'),
            'validAnnotations', 'validAnnotationAssignments'),
            'validEventAssignments', 'validEventCascades'),
            'validEvents', 'validEventCascades'),
          updated_at = NOW()
          WHERE ${col} IS NOT NULL AND (
            ${col} LIKE '%validCascades%' OR ${col} LIKE '%validParts%'
            OR ${col} LIKE '%validPartAssignments%'
            OR ${col} LIKE '%validAnnotations%' OR ${col} LIKE '%validEvents%'
            OR ${col} LIKE '%validEventAssignments%');
        `)
  }

  for (const [oldK, newK] of KEY_REPLACEMENTS) {
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
      const hasAdminRelationshipMetadata = await publicTableExists(
        sequelize,
        Sequelize,
        'admin_relationship_metadata'
      )

      const hasValidParts = await publicTableExists(sequelize, Sequelize, 'valid_parts')
      if (hasValidParts) {
        await q(`ALTER TABLE public.valid_parts RENAME TO valid_part_cascades;`)
        await q(
          `ALTER TABLE public.valid_part_cascades RENAME CONSTRAINT valid_parts_pkey TO valid_part_cascades_pkey;`
        )
        await q(
          `ALTER TABLE public.valid_part_cascades RENAME CONSTRAINT valid_parts_parent_id_child_id_key TO valid_part_cascades_parent_id_child_id_key;`
        )
        await q(
          `ALTER TABLE public.valid_part_cascades RENAME CONSTRAINT valid_parts_child_id_fkey TO valid_part_cascades_child_id_fkey;`
        )
        await q(
          `ALTER TABLE public.valid_part_cascades RENAME CONSTRAINT valid_parts_parent_id_fkey TO valid_part_cascades_parent_id_fkey;`
        )
        await q(`ALTER INDEX public.valid_parts_child_id_idx RENAME TO valid_part_cascades_child_id_idx;`)
        await q(`ALTER INDEX public.valid_parts_parent_id_idx RENAME TO valid_part_cascades_parent_id_idx;`)
      } else if (
        !(await publicTableExists(sequelize, Sequelize, 'valid_part_assignments')) &&
        !(await publicTableExists(sequelize, Sequelize, 'valid_part_cascades'))
      ) {
        throw new Error(
          'Migration 20260432_000051: expected public.valid_parts, public.valid_part_assignments, or public.valid_part_cascades'
        )
      }

      const hasValidCascades = await publicTableExists(sequelize, Sequelize, 'valid_cascades')
      if (hasValidCascades) {
        await q(`ALTER TABLE public.valid_cascades RENAME TO valid_booking_cascades;`)
        await q(
          `ALTER TABLE public.valid_booking_cascades RENAME CONSTRAINT valid_blocks_pkey TO valid_booking_cascades_pkey;`
        )
        await q(
          `ALTER TABLE public.valid_booking_cascades RENAME CONSTRAINT valid_blocks_parent_id_child_id_key TO valid_booking_cascades_parent_id_child_id_key;`
        )
        await q(
          `ALTER TABLE public.valid_booking_cascades RENAME CONSTRAINT valid_cascades_child_id_fkey TO valid_booking_cascades_child_id_fkey;`
        )
        await q(
          `ALTER TABLE public.valid_booking_cascades RENAME CONSTRAINT valid_cascades_parent_id_fkey TO valid_booking_cascades_parent_id_fkey;`
        )
        await q(
          `ALTER INDEX public.valid_blocks_child_id_idx RENAME TO valid_booking_cascades_child_id_idx;`
        )
        await q(
          `ALTER INDEX public.valid_blocks_parent_id_idx RENAME TO valid_booking_cascades_parent_id_idx;`
        )
      } else if (!(await publicTableExists(sequelize, Sequelize, 'valid_booking_cascades'))) {
        throw new Error(
          'Migration 20260432_000051: expected public.valid_cascades or public.valid_booking_cascades'
        )
      }

      const hasValidEvents = await publicTableExists(sequelize, Sequelize, 'valid_events')
      if (hasValidEvents) {
        await q(`ALTER TABLE public.valid_events RENAME TO valid_event_cascades;`)
        await q(
          `ALTER TABLE public.valid_event_cascades RENAME CONSTRAINT valid_events_pkey TO valid_event_cascades_pkey;`
        )
        await q(
          `ALTER TABLE public.valid_event_cascades RENAME CONSTRAINT valid_events_child_id_fkey TO valid_event_cascades_child_id_fkey;`
        )
        await q(
          `ALTER TABLE public.valid_event_cascades RENAME CONSTRAINT valid_events_parent_id_fkey TO valid_event_cascades_parent_id_fkey;`
        )
        await q(
          `ALTER INDEX public.idx_valid_events_child_id RENAME TO idx_valid_event_cascades_child_id;`
        )
        await q(
          `ALTER INDEX public.idx_valid_events_parent_child_unique RENAME TO idx_valid_event_cascades_parent_child_unique;`
        )
        await q(
          `ALTER INDEX public.idx_valid_events_parent_id RENAME TO idx_valid_event_cascades_parent_id;`
        )
      } else if (
        !(await publicTableExists(sequelize, Sequelize, 'valid_event_assignments')) &&
        !(await publicTableExists(sequelize, Sequelize, 'valid_event_cascades'))
      ) {
        throw new Error(
          'Migration 20260432_000051: expected public.valid_events, public.valid_event_assignments, or public.valid_event_cascades'
        )
      }

      await q(`ALTER TABLE public.valid_annotations RENAME TO valid_annotation_assignments;`)
      await q(
        `ALTER TABLE public.valid_annotation_assignments RENAME CONSTRAINT valid_annotations_pkey TO valid_annotation_assignments_pkey;`
      )
      await q(
        `ALTER TABLE public.valid_annotation_assignments RENAME CONSTRAINT valid_annotations_child_id_fkey TO valid_annotation_assignments_child_id_fkey;`
      )
      await q(
        `ALTER TABLE public.valid_annotation_assignments RENAME CONSTRAINT valid_annotations_parent_id_fkey TO valid_annotation_assignments_parent_id_fkey;`
      )
      await q(
        `ALTER INDEX public.valid_annotations_parent_id_child_id_unique RENAME TO valid_annotation_assignments_parent_id_child_id_unique;`
      )
      await q(
        `ALTER INDEX public.idx_valid_annotations_child_id RENAME TO idx_valid_annotation_assignments_child_id;`
      )
      await q(
        `ALTER INDEX public.idx_valid_annotations_parent_id RENAME TO idx_valid_annotation_assignments_parent_id;`
      )

      await q(`
        UPDATE public.admin_metadata
        SET field_key = CASE field_key
          WHEN 'validCascades' THEN 'validBookingCascades'
          WHEN 'validParts' THEN 'validPartCascades'
          WHEN 'validPartAssignments' THEN 'validPartCascades'
          WHEN 'validAnnotations' THEN 'validAnnotationAssignments'
          WHEN 'validEvents' THEN 'validEventCascades'
          WHEN 'validEventAssignments' THEN 'validEventCascades'
          ELSE field_key
        END,
        updated_at = NOW()
        WHERE field_key IN ('validCascades', 'validParts', 'validPartAssignments', 'validAnnotations', 'validEvents', 'validEventAssignments');
      `)

      if (hasAdminRelationshipMetadata) {
        await q(`
        UPDATE public.admin_relationship_metadata
        SET relationship_key = CASE relationship_key
          WHEN 'validCascades' THEN 'validBookingCascades'
          WHEN 'validParts' THEN 'validPartCascades'
          WHEN 'validPartAssignments' THEN 'validPartCascades'
          WHEN 'validAnnotations' THEN 'validAnnotationAssignments'
          WHEN 'validEvents' THEN 'validEventCascades'
          WHEN 'validEventAssignments' THEN 'validEventCascades'
          ELSE relationship_key
        END,
        updated_at = NOW()
        WHERE relationship_key IN ('validCascades', 'validParts', 'validPartAssignments', 'validAnnotations', 'validEvents', 'validEventAssignments');
      `)
      }

      await patchIcColumnsUp(q, 'admin_metadata')
      if (hasAdminRelationshipMetadata) {
        await patchIcColumnsUp(q, 'admin_relationship_metadata')
      }
    })
  },

  async down() {
    throw new Error(
      'Irreversible migration 20260432_000051: shape-level relationship table renames and metadata key updates.'
    )
  },
}
