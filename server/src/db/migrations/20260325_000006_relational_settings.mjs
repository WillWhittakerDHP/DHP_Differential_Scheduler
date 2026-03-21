/**
 * Fully relational wizard, calendar, and availability settings.
 * Backfills from app_setting_entries (if present) else legacy JSONB columns.
 * Drops app_setting_entries; drops setting_value on wizard_settings and calendar_settings;
 * removes availability_settings row from business_settings after backfill.
 */

import { Sequelize } from 'sequelize'

const DEFAULT_AVAIL = {
  minuteIncrement: 15,
  timezone: null,
  businessHours: {},
  rangeConstraints: {},
  buffers: {},
  maxWorkHours: {},
  maxIncome: {},
  overlapSources: {},
  durationRounding: { enabled: false, increment: 15, method: 'roundUp' },
  differentialPerspectives: {},
  defaultLocation: null,
}

const DEFAULT_CAL = {
  enabled: false,
  provider: 'none',
  calendars: [],
  holdDurationMinutes: 15,
  holdDurationMin: 1,
  holdDurationMax: 60,
  holdDurationFallback: 15,
  adminEntryTimeout: { value: 30, unit: 'days' },
  autoConfirmEnabled: false,
}

const DEFAULT_WIZ = {
  showApplyCoupon: false,
  useBrandColors: false,
}

async function tableExists(sequelize, name) {
  const [rows] = await sequelize.query(
    `SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = :name
    ) AS e`,
    { replacements: { name } }
  )
  return Boolean(rows[0]?.e)
}

async function fetchAvailabilityDoc(sequelize) {
  if (await tableExists(sequelize, 'app_setting_entries')) {
    const [rows] = await sequelize.query(
      `SELECT value_jsonb AS v FROM app_setting_entries WHERE namespace = 'availability' AND path = 'document' LIMIT 1`
    )
    if (rows[0]?.v) return typeof rows[0].v === 'string' ? JSON.parse(rows[0].v) : rows[0].v
  }
  const [rows] = await sequelize.query(
    `SELECT setting_value AS v FROM business_settings WHERE setting_key = 'availability_settings' LIMIT 1`
  )
  if (rows[0]?.v) return typeof rows[0].v === 'string' ? JSON.parse(rows[0].v) : rows[0].v
  return null
}

async function fetchCalendarDoc(sequelize) {
  if (await tableExists(sequelize, 'app_setting_entries')) {
    const [rows] = await sequelize.query(
      `SELECT value_jsonb AS v FROM app_setting_entries WHERE namespace = 'calendar' AND path = 'document' LIMIT 1`
    )
    if (rows[0]?.v) return typeof rows[0].v === 'string' ? JSON.parse(rows[0].v) : rows[0].v
  }
  const [rows] = await sequelize.query(
    `SELECT setting_value AS v FROM calendar_settings ORDER BY updated_at DESC NULLS LAST LIMIT 1`
  )
  if (rows[0]?.v) return typeof rows[0].v === 'string' ? JSON.parse(rows[0].v) : rows[0].v
  return null
}

async function fetchWizardDoc(sequelize) {
  if (await tableExists(sequelize, 'app_setting_entries')) {
    const [rows] = await sequelize.query(
      `SELECT value_jsonb AS v FROM app_setting_entries WHERE namespace = 'wizard' AND path = 'document' LIMIT 1`
    )
    if (rows[0]?.v) return typeof rows[0].v === 'string' ? JSON.parse(rows[0].v) : rows[0].v
  }
  const [rows] = await sequelize.query(
    `SELECT setting_value AS v FROM wizard_settings ORDER BY updated_at DESC NULLS LAST LIMIT 1`
  )
  if (rows[0]?.v) return typeof rows[0].v === 'string' ? JSON.parse(rows[0].v) : rows[0].v
  return null
}

function mergeAv(doc) {
  const d = doc && typeof doc === 'object' ? doc : {}
  return {
    ...DEFAULT_AVAIL,
    ...d,
    businessHours: { ...DEFAULT_AVAIL.businessHours, ...(d.businessHours || {}) },
    rangeConstraints: { ...DEFAULT_AVAIL.rangeConstraints, ...(d.rangeConstraints || {}) },
    buffers: { ...DEFAULT_AVAIL.buffers, ...(d.buffers || {}) },
    maxWorkHours: { ...DEFAULT_AVAIL.maxWorkHours, ...(d.maxWorkHours || {}) },
    maxIncome: { ...DEFAULT_AVAIL.maxIncome, ...(d.maxIncome || {}) },
    overlapSources: { ...DEFAULT_AVAIL.overlapSources, ...(d.overlapSources || {}) },
    durationRounding: { ...DEFAULT_AVAIL.durationRounding, ...(d.durationRounding || {}) },
    differentialPerspectives: {
      ...DEFAULT_AVAIL.differentialPerspectives,
      ...(d.differentialPerspectives || {}),
    },
  }
}

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS public.availability_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        minute_increment INTEGER NOT NULL DEFAULT 15,
        timezone TEXT,
        default_location_place_id TEXT,
        default_location_label TEXT,
        default_location_lat DOUBLE PRECISION,
        default_location_lng DOUBLE PRECISION,
        duration_rounding_enabled BOOLEAN NOT NULL DEFAULT false,
        duration_rounding_increment INTEGER,
        duration_rounding_method TEXT,
        overlap_out_of_office_enforcement TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS public.availability_business_hours (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        availability_settings_id UUID NOT NULL REFERENCES public.availability_settings(id) ON DELETE CASCADE,
        day_of_week SMALLINT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
        start_at TIMESTAMPTZ NOT NULL,
        end_at TIMESTAMPTZ NOT NULL,
        UNIQUE (availability_settings_id, day_of_week)
      );

      CREATE TABLE IF NOT EXISTS public.availability_buffers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        availability_settings_id UUID NOT NULL REFERENCES public.availability_settings(id) ON DELETE CASCADE,
        buffer_kind TEXT NOT NULL CHECK (buffer_kind IN ('appointment','drive_to_candidate','drive_from_candidate','lunch')),
        minutes INTEGER,
        enforcement TEXT,
        placement TEXT,
        apply_to TEXT,
        UNIQUE (availability_settings_id, buffer_kind)
      );

      CREATE TABLE IF NOT EXISTS public.availability_range_constraints (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        availability_settings_id UUID NOT NULL REFERENCES public.availability_settings(id) ON DELETE CASCADE,
        range_type TEXT NOT NULL CHECK (range_type IN ('businessHours','leadTime','dateRange')),
        enforcement TEXT NOT NULL,
        lead_time_minutes INTEGER,
        date_range_start TIMESTAMPTZ,
        date_range_end TIMESTAMPTZ,
        UNIQUE (availability_settings_id, range_type)
      );

      CREATE TABLE IF NOT EXISTS public.availability_range_constraint_hours (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        range_constraint_id UUID NOT NULL REFERENCES public.availability_range_constraints(id) ON DELETE CASCADE,
        day_of_week SMALLINT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
        start_at TIMESTAMPTZ NOT NULL,
        end_at TIMESTAMPTZ NOT NULL,
        UNIQUE (range_constraint_id, day_of_week)
      );

      CREATE TABLE IF NOT EXISTS public.availability_max_work_hours (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        availability_settings_id UUID NOT NULL REFERENCES public.availability_settings(id) ON DELETE CASCADE,
        scope TEXT NOT NULL CHECK (scope IN ('day','calendar_week','rolling_week')),
        max_hours DOUBLE PRECISION NOT NULL,
        enforcement TEXT NOT NULL,
        rolling_direction TEXT,
        UNIQUE (availability_settings_id, scope)
      );

      CREATE TABLE IF NOT EXISTS public.availability_max_income (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        availability_settings_id UUID NOT NULL REFERENCES public.availability_settings(id) ON DELETE CASCADE,
        scope TEXT NOT NULL CHECK (scope IN ('day','calendar_week','rolling_week')),
        max_income DOUBLE PRECISION NOT NULL,
        enforcement TEXT NOT NULL,
        rolling_direction TEXT,
        UNIQUE (availability_settings_id, scope)
      );

      CREATE TABLE IF NOT EXISTS public.availability_differential_attendees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        availability_settings_id UUID NOT NULL REFERENCES public.availability_settings(id) ON DELETE CASCADE,
        role TEXT NOT NULL CHECK (role IN ('major','minor')),
        sort_order INTEGER NOT NULL DEFAULT 0,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.calendar_setting_calendars (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        calendar_settings_id UUID NOT NULL REFERENCES public.calendar_settings(id) ON DELETE CASCADE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        email TEXT NOT NULL,
        label TEXT,
        read_from BOOLEAN NOT NULL DEFAULT false,
        write_to BOOLEAN NOT NULL DEFAULT false
      );
    `)

    await sequelize.query(`
      ALTER TABLE public.wizard_settings
        ADD COLUMN IF NOT EXISTS show_apply_coupon BOOLEAN NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS use_brand_colors BOOLEAN NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS major_label TEXT,
        ADD COLUMN IF NOT EXISTS minor_label TEXT,
        ADD COLUMN IF NOT EXISTS moveable_fallback_label TEXT,
        ADD COLUMN IF NOT EXISTS differential_graph_default_label TEXT,
        ADD COLUMN IF NOT EXISTS major_state_label TEXT,
        ADD COLUMN IF NOT EXISTS minor_state_label TEXT,
        ADD COLUMN IF NOT EXISTS select_time_slot_label TEXT,
        ADD COLUMN IF NOT EXISTS sub_step_label_pick_day TEXT,
        ADD COLUMN IF NOT EXISTS sub_step_label_options TEXT,
        ADD COLUMN IF NOT EXISTS sub_step_label_pick_time TEXT,
        ADD COLUMN IF NOT EXISTS sub_step_label_confirm_moveable TEXT;

      ALTER TABLE public.calendar_settings
        ADD COLUMN IF NOT EXISTS enabled BOOLEAN NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS provider VARCHAR(32) NOT NULL DEFAULT 'none',
        ADD COLUMN IF NOT EXISTS hold_duration_minutes INTEGER NOT NULL DEFAULT 15,
        ADD COLUMN IF NOT EXISTS hold_duration_min INTEGER NOT NULL DEFAULT 1,
        ADD COLUMN IF NOT EXISTS hold_duration_max INTEGER NOT NULL DEFAULT 60,
        ADD COLUMN IF NOT EXISTS hold_duration_fallback INTEGER NOT NULL DEFAULT 15,
        ADD COLUMN IF NOT EXISTS admin_entry_timeout_value INTEGER NOT NULL DEFAULT 30,
        ADD COLUMN IF NOT EXISTS admin_entry_timeout_unit VARCHAR(16) NOT NULL DEFAULT 'days',
        ADD COLUMN IF NOT EXISTS auto_confirm_enabled BOOLEAN NOT NULL DEFAULT false;
    `)

    const avDoc = mergeAv(await fetchAvailabilityDoc(sequelize))

    const cntRows = await sequelize.query(`SELECT COUNT(*)::int AS c FROM public.availability_settings`, {
      type: Sequelize.QueryTypes.SELECT,
    })
    const existingAv = Number(cntRows[0]?.c ?? 0)

    let avId
    if (existingAv > 0) {
      const idRows = await sequelize.query(`SELECT id FROM public.availability_settings LIMIT 1`, {
        type: Sequelize.QueryTypes.SELECT,
      })
      avId = idRows[0].id
    } else {
      const insAv = await sequelize.query(
        `INSERT INTO public.availability_settings (
        minute_increment, timezone, default_location_place_id, default_location_label,
        default_location_lat, default_location_lng,
        duration_rounding_enabled, duration_rounding_increment, duration_rounding_method,
        overlap_out_of_office_enforcement
      ) VALUES (
        :minuteIncrement, :timezone, :dlp, :dll, :dla, :dlo,
        :dre, :dri, :drm, :ooo
      ) RETURNING id`,
        {
          replacements: {
            minuteIncrement: avDoc.minuteIncrement ?? 15,
            timezone: avDoc.timezone ?? null,
            dlp: avDoc.defaultLocation?.placeId ?? null,
            dll: avDoc.defaultLocation?.label ?? null,
            dla: avDoc.defaultLocation?.coordinates?.lat ?? null,
            dlo: avDoc.defaultLocation?.coordinates?.lng ?? null,
            dre: avDoc.durationRounding?.enabled ?? false,
            dri: avDoc.durationRounding?.increment ?? null,
            drm: avDoc.durationRounding?.method ?? null,
            ooo: avDoc.overlapSources?.outOfOffice?.enforcement ?? null,
          },
          type: Sequelize.QueryTypes.SELECT,
        }
      )
      avId = insAv[0].id
    }

    const av = avDoc

    await sequelize.query(
      `UPDATE public.availability_settings SET
        minute_increment = :minuteIncrement,
        timezone = :timezone,
        default_location_place_id = :dlp,
        default_location_label = :dll,
        default_location_lat = :dla,
        default_location_lng = :dlo,
        duration_rounding_enabled = :dre,
        duration_rounding_increment = :dri,
        duration_rounding_method = :drm,
        overlap_out_of_office_enforcement = :ooo,
        updated_at = NOW()
      WHERE id = :id`,
      {
        replacements: {
          id: avId,
          minuteIncrement: av.minuteIncrement ?? 15,
          timezone: av.timezone ?? null,
          dlp: av.defaultLocation?.placeId ?? null,
          dll: av.defaultLocation?.label ?? null,
          dla: av.defaultLocation?.coordinates?.lat ?? null,
          dlo: av.defaultLocation?.coordinates?.lng ?? null,
          dre: av.durationRounding?.enabled ?? false,
          dri: av.durationRounding?.increment ?? null,
          drm: av.durationRounding?.method ?? null,
          ooo: av.overlapSources?.outOfOffice?.enforcement ?? null,
        },
      }
    )

    for (const tbl of [
      'availability_business_hours',
      'availability_buffers',
      'availability_range_constraint_hours',
      'availability_range_constraints',
      'availability_max_work_hours',
      'availability_max_income',
      'availability_differential_attendees',
    ]) {
      if (tbl === 'availability_range_constraint_hours') {
        await sequelize.query(
          `DELETE FROM public.availability_range_constraint_hours WHERE range_constraint_id IN (
            SELECT id FROM public.availability_range_constraints WHERE availability_settings_id = :aid
          )`,
          { replacements: { aid: avId } }
        )
      } else if (tbl === 'availability_range_constraints') {
        await sequelize.query(
          `DELETE FROM public.availability_range_constraints WHERE availability_settings_id = :aid`,
          { replacements: { aid: avId } }
        )
      } else {
        await sequelize.query(
          `DELETE FROM public.${tbl} WHERE availability_settings_id = :aid`,
          { replacements: { aid: avId } }
        )
      }
    }

    const bh = av.businessHours || {}
    for (let dow = 0; dow <= 6; dow++) {
      const day = bh[String(dow)] ?? bh[dow]
      if (day?.start && day?.end) {
        await sequelize.query(
          `INSERT INTO public.availability_business_hours (availability_settings_id, day_of_week, start_at, end_at)
           VALUES (:aid, :dow, :st::timestamptz, :en::timestamptz)`,
          { replacements: { aid: avId, dow, st: day.start, en: day.end } }
        )
      }
    }

    const bufMap = [
      ['appointment', av.buffers?.appointment],
      ['drive_to_candidate', av.buffers?.driveToCandidate],
      ['drive_from_candidate', av.buffers?.driveFromCandidate],
      ['lunch', av.buffers?.lunch],
    ]
    for (const [kind, b] of bufMap) {
      if (!b || typeof b !== 'object') continue
      await sequelize.query(
        `INSERT INTO public.availability_buffers (availability_settings_id, buffer_kind, minutes, enforcement, placement, apply_to)
         VALUES (:aid, :kind, :min, :enf, :pl, :ap)`,
        {
          replacements: {
            aid: avId,
            kind,
            min: b.minutes ?? null,
            enf: b.enforcement ?? null,
            pl: b.placement ?? null,
            ap: b.applyTo ?? null,
          },
        }
      )
    }

    const rc = av.rangeConstraints || {}
    for (const rt of ['businessHours', 'leadTime', 'dateRange']) {
      const c = rc[rt]
      if (!c || typeof c !== 'object') continue
      const enforcement = c.enforcement ?? 'hard'
      let leadMin = null
      let drs = null
      let dre = null
      if (c.type === 'leadTime' && c.config?.minutes != null) leadMin = c.config.minutes
      if (c.type === 'dateRange' && c.config) {
        drs = c.config.start ?? null
        dre = c.config.end ?? null
      }
      const insRc = await sequelize.query(
        `INSERT INTO public.availability_range_constraints (
          availability_settings_id, range_type, enforcement, lead_time_minutes, date_range_start, date_range_end
        ) VALUES (:aid, :rt, :enf, :lm, CAST(:drs AS TIMESTAMPTZ), CAST(:dre AS TIMESTAMPTZ)) RETURNING id`,
        {
          replacements: {
            aid: avId,
            rt,
            enf: enforcement,
            lm: leadMin,
            drs,
            dre,
          },
          type: Sequelize.QueryTypes.SELECT,
        }
      )
      const rcId = insRc[0].id
      if (c.type === 'businessHours' && c.config?.hours) {
        const hours = c.config.hours
        for (let dow = 0; dow <= 6; dow++) {
          const day = hours[String(dow)] ?? hours[dow]
          if (day?.start && day?.end) {
            await sequelize.query(
              `INSERT INTO public.availability_range_constraint_hours (range_constraint_id, day_of_week, start_at, end_at)
               VALUES (:rcid, :dow, :st::timestamptz, :en::timestamptz)`,
              { replacements: { rcid: rcId, dow, st: day.start, en: day.end } }
            )
          }
        }
      }
    }

    const mw = av.maxWorkHours || {}
    for (const sk of ['day', 'calendarWeek', 'rollingWeek']) {
      const w = mw[sk]
      if (!w || w.maxHours == null) continue
      const sc = sk === 'calendarWeek' ? 'calendar_week' : sk === 'rollingWeek' ? 'rolling_week' : 'day'
      await sequelize.query(
        `INSERT INTO public.availability_max_work_hours (availability_settings_id, scope, max_hours, enforcement, rolling_direction)
         VALUES (:aid, :sc, :mh, :enf, :dir)`,
        {
          replacements: {
            aid: avId,
            sc,
            mh: w.maxHours,
            enf: w.enforcement,
            dir: w.direction ?? null,
          },
        }
      )
    }

    const mi = av.maxIncome || {}
    for (const sk of ['day', 'calendarWeek', 'rollingWeek']) {
      const w = mi[sk]
      if (!w || w.maxIncome == null) continue
      const sc = sk === 'calendarWeek' ? 'calendar_week' : sk === 'rollingWeek' ? 'rolling_week' : 'day'
      await sequelize.query(
        `INSERT INTO public.availability_max_income (availability_settings_id, scope, max_income, enforcement, rolling_direction)
         VALUES (:aid, :sc, :mv, :enf, :dir)`,
        {
          replacements: {
            aid: avId,
            sc,
            mv: w.maxIncome,
            enf: w.enforcement,
            dir: w.direction ?? null,
          },
        }
      )
    }

    const maj = av.differentialPerspectives?.majorAttendees
    if (Array.isArray(maj)) {
      let i = 0
      for (const v of maj) {
        await sequelize.query(
          `INSERT INTO public.availability_differential_attendees (availability_settings_id, role, sort_order, value)
           VALUES (:aid, 'major', :so, :val)`,
          { replacements: { aid: avId, so: i++, val: String(v) } }
        )
      }
    }
    const minr = av.differentialPerspectives?.minorAttendees
    if (Array.isArray(minr)) {
      let i = 0
      for (const v of minr) {
        await sequelize.query(
          `INSERT INTO public.availability_differential_attendees (availability_settings_id, role, sort_order, value)
           VALUES (:aid, 'minor', :so, :val)`,
          { replacements: { aid: avId, so: i++, val: String(v) } }
        )
      }
    }

    const cal = { ...DEFAULT_CAL, ...(await fetchCalendarDoc(sequelize)) }
    const [calRows] = await sequelize.query(`SELECT id FROM public.calendar_settings ORDER BY updated_at DESC NULLS LAST LIMIT 1`)
    const calId = calRows[0]?.id
    if (calId) {
      await sequelize.query(
        `UPDATE public.calendar_settings SET
          enabled = :en, provider = :pr,
          hold_duration_minutes = :hdm, hold_duration_min = :hdmin, hold_duration_max = :hdmax, hold_duration_fallback = :hdf,
          admin_entry_timeout_value = :aev, admin_entry_timeout_unit = :aeu,
          auto_confirm_enabled = :ac
        WHERE id = :id`,
        {
          replacements: {
            id: calId,
            en: Boolean(cal.enabled),
            pr: cal.provider ?? 'none',
            hdm: cal.holdDurationMinutes ?? 15,
            hdmin: cal.holdDurationMin ?? 1,
            hdmax: cal.holdDurationMax ?? 60,
            hdf: cal.holdDurationFallback ?? 15,
            aev: cal.adminEntryTimeout?.value ?? 30,
            aeu: cal.adminEntryTimeout?.unit ?? 'days',
            ac: Boolean(cal.autoConfirmEnabled),
          },
        }
      )
      await sequelize.query(`DELETE FROM public.calendar_setting_calendars WHERE calendar_settings_id = :id`, {
        replacements: { id: calId },
      })
      const cals = Array.isArray(cal.calendars) ? cal.calendars : []
      let order = 0
      for (const e of cals) {
        if (!e?.email) continue
        await sequelize.query(
          `INSERT INTO public.calendar_setting_calendars (calendar_settings_id, sort_order, email, label, read_from, write_to)
           VALUES (:cid, :so, :em, :lb, :rf, :wt)`,
          {
            replacements: {
              cid: calId,
              so: order++,
              em: String(e.email).trim(),
              lb: e.label ?? null,
              rf: Boolean(e.readFrom),
              wt: Boolean(e.writeTo),
            },
          }
        )
      }
    }

    const wiz = { ...DEFAULT_WIZ, ...(await fetchWizardDoc(sequelize)) }
    await sequelize.query(
      `UPDATE public.wizard_settings SET
        show_apply_coupon = :sac,
        use_brand_colors = :ubc,
        major_label = :maj,
        minor_label = :min,
        moveable_fallback_label = :mfb,
        differential_graph_default_label = :dgd,
        major_state_label = :msl,
        minor_state_label = :mis,
        select_time_slot_label = :sts,
        sub_step_label_pick_day = :spd,
        sub_step_label_options = :sop,
        sub_step_label_pick_time = :spt,
        sub_step_label_confirm_moveable = :scm,
        updated_at = NOW()
      WHERE id = (SELECT id FROM public.wizard_settings ORDER BY updated_at DESC NULLS LAST LIMIT 1)`,
      {
        replacements: {
          sac: Boolean(wiz.showApplyCoupon),
          ubc: Boolean(wiz.useBrandColors),
          maj: wiz.majorLabel ?? null,
          min: wiz.minorLabel ?? null,
          mfb: wiz.moveableFallbackLabel ?? null,
          dgd: wiz.differentialGraphDefaultLabel ?? null,
          msl: wiz.majorStateLabel ?? null,
          mis: wiz.minorStateLabel ?? null,
          sts: wiz.selectTimeSlotLabel ?? null,
          spd: wiz.subStepLabelPickDay ?? null,
          sop: wiz.subStepLabelOptions ?? null,
          spt: wiz.subStepLabelPickTime ?? null,
          scm: wiz.subStepLabelConfirmMoveable ?? null,
        },
      }
    )

    await sequelize.query(`ALTER TABLE public.wizard_settings DROP COLUMN IF EXISTS setting_value`)
    await sequelize.query(`ALTER TABLE public.calendar_settings DROP COLUMN IF EXISTS setting_value`)

    await sequelize.query(`DELETE FROM public.business_settings WHERE setting_key = 'availability_settings'`)

    if (await tableExists(sequelize, 'app_setting_entries')) {
      await sequelize.query(`DROP TABLE IF EXISTS public.app_setting_entries`)
    }
  },

  async down() {
    throw new Error(
      'Irreversible migration 20260325_000006_relational_settings: restore from backup or rebuild DB.'
    )
  },
}
