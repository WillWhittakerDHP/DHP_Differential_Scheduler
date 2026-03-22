/**
 * Replace input_config JSONB on admin_primitive_metadata and admin_relationship_metadata
 * with ic_* columns + per-table select_options (same shape as admin_metadata migration 000014).
 *
 * If either legacy table is missing (e.g. DB only has unified admin_metadata), that side is skipped.
 */

function unwrapInputConfig(raw) {
  if (raw && typeof raw === 'object' && 'targetMode' in raw) return raw
  const wrapped = raw?.relationshipSelect
  if (wrapped && typeof wrapped === 'object' && 'targetMode' in wrapped) return wrapped
  return raw
}

function asStringArray(v) {
  if (!Array.isArray(v)) return null
  const out = v.filter((x) => typeof x === 'string')
  return out.length === v.length ? out : null
}

function strOrNull(v) {
  if (v === null || v === undefined) return null
  if (typeof v === 'string') return v
  return String(v)
}

/** Sequelize named replacements mishandle NULL and JS [] for PostgreSQL TEXT[]. */
function pgTextArraySql(sequelize, arr) {
  if (arr == null) return 'NULL'
  if (!Array.isArray(arr)) return 'NULL'
  if (arr.length === 0) return `'{}'::text[]`
  const parts = arr.map((s) => sequelize.escape(String(s)))
  return `ARRAY[${parts.join(',')}]::text[]`
}

function encodeInputConfig(inputConfig) {
  const empty = {
    icTargetMode: null,
    icSelectMode: null,
    icSelectType: null,
    icTargetKey: null,
    icGlobalField: null,
    icPlaceholder: null,
    icGroupByKey: null,
    icSelectedChildKey: null,
    icCandidateChildKey: null,
    icSelectedParentKey: null,
    icCandidateParentKey: null,
    icSelectedChildPath: null,
    icCandidateChildPath: null,
    icCandidateParentPath: null,
  }
  if (!inputConfig || typeof inputConfig !== 'object') {
    return { columns: empty, options: [] }
  }
  const rawOpts = inputConfig.options
  if (Array.isArray(rawOpts)) {
    const options = rawOpts
      .filter((o) => typeof o === 'object' && o !== null)
      .map((o, index) => {
        const label = strOrNull(o.label) ?? ''
        const val = o.value
        const valuePayload = val === undefined ? null : JSON.stringify(val)
        return { displayOrder: index, label, valuePayload }
      })
    return { columns: empty, options }
  }
  const cfg = unwrapInputConfig(inputConfig)
  return {
    columns: {
      icTargetMode: strOrNull(cfg.targetMode),
      icSelectMode: strOrNull(cfg.selectMode),
      icSelectType: strOrNull(cfg.selectType),
      icTargetKey: strOrNull(cfg.targetKey),
      icGlobalField: strOrNull(cfg.globalField),
      icPlaceholder: strOrNull(cfg.placeholder),
      icGroupByKey: cfg.groupByKey === null || cfg.groupByKey === undefined ? null : strOrNull(cfg.groupByKey),
      icSelectedChildKey: strOrNull(cfg.selectedChildKey),
      icCandidateChildKey: strOrNull(cfg.candidateChildKey),
      icSelectedParentKey: strOrNull(cfg.selectedParentKey),
      icCandidateParentKey: strOrNull(cfg.candidateParentKey),
      icSelectedChildPath: asStringArray(cfg.selectedChildPath),
      icCandidateChildPath: asStringArray(cfg.candidateChildPath),
      icCandidateParentPath: asStringArray(cfg.candidateParentPath),
    },
    options: [],
  }
}

async function backfillTable(sequelize, SequelizeCtor, metaTable, optionsTable, fkColumn) {
  const { QueryTypes } = SequelizeCtor
  const rows = await sequelize.query(`SELECT id, input_config FROM public.${metaTable} WHERE input_config IS NOT NULL`, {
    type: QueryTypes.SELECT,
  })

  for (const row of rows) {
    const id = row.id
    let cfg = row.input_config
    if (typeof cfg === 'string') {
      try {
        cfg = JSON.parse(cfg)
      } catch {
        console.warn(`[migration 000015] skip invalid input_config JSON for ${metaTable} row`, id)
        continue
      }
    }
    const { columns, options } = encodeInputConfig(cfg)
    const selPath = pgTextArraySql(sequelize, columns.icSelectedChildPath)
    const candChildPath = pgTextArraySql(sequelize, columns.icCandidateChildPath)
    const candParentPath = pgTextArraySql(sequelize, columns.icCandidateParentPath)
    await sequelize.query(
      `UPDATE public.${metaTable} SET
        ic_target_mode = :icTargetMode,
        ic_select_mode = :icSelectMode,
        ic_select_type = :icSelectType,
        ic_target_key = :icTargetKey,
        ic_global_field = :icGlobalField,
        ic_placeholder = :icPlaceholder,
        ic_group_by_key = :icGroupByKey,
        ic_selected_child_key = :icSelectedChildKey,
        ic_candidate_child_key = :icCandidateChildKey,
        ic_selected_parent_key = :icSelectedParentKey,
        ic_candidate_parent_key = :icCandidateParentKey,
        ic_selected_child_path = ${selPath},
        ic_candidate_child_path = ${candChildPath},
        ic_candidate_parent_path = ${candParentPath}
      WHERE id = :id`,
      {
        replacements: {
          id,
          icTargetMode: columns.icTargetMode,
          icSelectMode: columns.icSelectMode,
          icSelectType: columns.icSelectType,
          icTargetKey: columns.icTargetKey,
          icGlobalField: columns.icGlobalField,
          icPlaceholder: columns.icPlaceholder,
          icGroupByKey: columns.icGroupByKey,
          icSelectedChildKey: columns.icSelectedChildKey,
          icCandidateChildKey: columns.icCandidateChildKey,
          icSelectedParentKey: columns.icSelectedParentKey,
          icCandidateParentKey: columns.icCandidateParentKey,
        },
      }
    )
    for (const opt of options) {
      await sequelize.query(
        `INSERT INTO public.${optionsTable} (${fkColumn}, display_order, label, value_payload)
         VALUES (:parentId, :displayOrder, :label, :valuePayload)`,
        {
          replacements: {
            parentId: id,
            displayOrder: opt.displayOrder,
            label: opt.label,
            valuePayload: opt.valuePayload,
          },
        }
      )
    }
  }
}

const IC_COLUMNS_DDL = `
        ADD COLUMN IF NOT EXISTS ic_target_mode VARCHAR(32) NULL,
        ADD COLUMN IF NOT EXISTS ic_select_mode VARCHAR(32) NULL,
        ADD COLUMN IF NOT EXISTS ic_select_type VARCHAR(64) NULL,
        ADD COLUMN IF NOT EXISTS ic_target_key VARCHAR(128) NULL,
        ADD COLUMN IF NOT EXISTS ic_global_field VARCHAR(128) NULL,
        ADD COLUMN IF NOT EXISTS ic_placeholder TEXT NULL,
        ADD COLUMN IF NOT EXISTS ic_group_by_key VARCHAR(128) NULL,
        ADD COLUMN IF NOT EXISTS ic_selected_child_key VARCHAR(64) NULL,
        ADD COLUMN IF NOT EXISTS ic_candidate_child_key VARCHAR(64) NULL,
        ADD COLUMN IF NOT EXISTS ic_selected_parent_key VARCHAR(64) NULL,
        ADD COLUMN IF NOT EXISTS ic_candidate_parent_key VARCHAR(64) NULL,
        ADD COLUMN IF NOT EXISTS ic_selected_child_path TEXT[] NULL,
        ADD COLUMN IF NOT EXISTS ic_candidate_child_path TEXT[] NULL,
        ADD COLUMN IF NOT EXISTS ic_candidate_parent_path TEXT[] NULL
      `.replace(/\s+/g, ' ').trim()

async function publicTableExists(sequelize, Sequelize, tableName) {
  const { QueryTypes } = Sequelize
  const rows = await sequelize.query(
    `SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = :tableName
     LIMIT 1`,
    { replacements: { tableName }, type: QueryTypes.SELECT }
  )
  return rows.length > 0
}

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    const { Sequelize } = await import('sequelize')

    const hasPrimitive = await publicTableExists(sequelize, Sequelize, 'admin_primitive_metadata')
    const hasRelationship = await publicTableExists(sequelize, Sequelize, 'admin_relationship_metadata')

    if (!hasPrimitive && !hasRelationship) {
      console.info(
        '[migration 000015] admin_primitive_metadata and admin_relationship_metadata are absent; skipping (unified admin_metadata only).'
      )
      return
    }

    if (hasPrimitive) {
      await sequelize.query(`
      CREATE TABLE IF NOT EXISTS public.admin_primitive_metadata_select_options (
        id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
        primitive_metadata_id UUID NOT NULL REFERENCES public.admin_primitive_metadata(id) ON DELETE CASCADE,
        display_order INTEGER NOT NULL DEFAULT 0,
        label TEXT NOT NULL,
        value_payload TEXT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `)
      await sequelize.query(`
      CREATE INDEX IF NOT EXISTS admin_primitive_metadata_select_options_meta_idx
        ON public.admin_primitive_metadata_select_options (primitive_metadata_id);
    `)

      await sequelize.query(`ALTER TABLE public.admin_primitive_metadata ${IC_COLUMNS_DDL};`)

      await backfillTable(
        sequelize,
        Sequelize,
        'admin_primitive_metadata',
        'admin_primitive_metadata_select_options',
        'primitive_metadata_id'
      )

      await sequelize.query(`ALTER TABLE public.admin_primitive_metadata DROP COLUMN IF EXISTS input_config;`)
    } else {
      console.info('[migration 000015] skip admin_primitive_metadata (table not in database).')
    }

    if (hasRelationship) {
      await sequelize.query(`
      CREATE TABLE IF NOT EXISTS public.admin_relationship_metadata_select_options (
        id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
        relationship_metadata_id UUID NOT NULL REFERENCES public.admin_relationship_metadata(id) ON DELETE CASCADE,
        display_order INTEGER NOT NULL DEFAULT 0,
        label TEXT NOT NULL,
        value_payload TEXT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `)
      await sequelize.query(`
      CREATE INDEX IF NOT EXISTS admin_relationship_metadata_select_options_meta_idx
        ON public.admin_relationship_metadata_select_options (relationship_metadata_id);
    `)

      await sequelize.query(`ALTER TABLE public.admin_relationship_metadata ${IC_COLUMNS_DDL};`)

      await backfillTable(
        sequelize,
        Sequelize,
        'admin_relationship_metadata',
        'admin_relationship_metadata_select_options',
        'relationship_metadata_id'
      )

      await sequelize.query(`ALTER TABLE public.admin_relationship_metadata DROP COLUMN IF EXISTS input_config;`)
    } else {
      console.info('[migration 000015] skip admin_relationship_metadata (table not in database).')
    }
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize
    const { Sequelize } = await import('sequelize')

    const hasPrimitive = await publicTableExists(sequelize, Sequelize, 'admin_primitive_metadata')
    const hasRelationship = await publicTableExists(sequelize, Sequelize, 'admin_relationship_metadata')

    await sequelize.query(`DROP TABLE IF EXISTS public.admin_primitive_metadata_select_options CASCADE;`)
    await sequelize.query(`DROP TABLE IF EXISTS public.admin_relationship_metadata_select_options CASCADE;`)

    if (hasPrimitive) {
      await sequelize.query(`ALTER TABLE public.admin_primitive_metadata ADD COLUMN IF NOT EXISTS input_config JSONB NULL;`)
      await sequelize.query(`
      ALTER TABLE public.admin_primitive_metadata
        DROP COLUMN IF EXISTS ic_target_mode,
        DROP COLUMN IF EXISTS ic_select_mode,
        DROP COLUMN IF EXISTS ic_select_type,
        DROP COLUMN IF EXISTS ic_target_key,
        DROP COLUMN IF EXISTS ic_global_field,
        DROP COLUMN IF EXISTS ic_placeholder,
        DROP COLUMN IF EXISTS ic_group_by_key,
        DROP COLUMN IF EXISTS ic_selected_child_key,
        DROP COLUMN IF EXISTS ic_candidate_child_key,
        DROP COLUMN IF EXISTS ic_selected_parent_key,
        DROP COLUMN IF EXISTS ic_candidate_parent_key,
        DROP COLUMN IF EXISTS ic_selected_child_path,
        DROP COLUMN IF EXISTS ic_candidate_child_path,
        DROP COLUMN IF EXISTS ic_candidate_parent_path;
    `)
    }

    if (hasRelationship) {
      await sequelize.query(`ALTER TABLE public.admin_relationship_metadata ADD COLUMN IF NOT EXISTS input_config JSONB NULL;`)
      await sequelize.query(`
      ALTER TABLE public.admin_relationship_metadata
        DROP COLUMN IF EXISTS ic_target_mode,
        DROP COLUMN IF EXISTS ic_select_mode,
        DROP COLUMN IF EXISTS ic_select_type,
        DROP COLUMN IF EXISTS ic_target_key,
        DROP COLUMN IF EXISTS ic_global_field,
        DROP COLUMN IF EXISTS ic_placeholder,
        DROP COLUMN IF EXISTS ic_group_by_key,
        DROP COLUMN IF EXISTS ic_selected_child_key,
        DROP COLUMN IF EXISTS ic_candidate_child_key,
        DROP COLUMN IF EXISTS ic_selected_parent_key,
        DROP COLUMN IF EXISTS ic_candidate_parent_key,
        DROP COLUMN IF EXISTS ic_selected_child_path,
        DROP COLUMN IF EXISTS ic_candidate_child_path,
        DROP COLUMN IF EXISTS ic_candidate_parent_path;
    `)
    }
  },
}
