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
