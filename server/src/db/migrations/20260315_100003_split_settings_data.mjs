/**
 * Migration: Split availability blob into calendar_settings, wizard_settings, and trim business_settings.
 * Purpose: Read current data from availability_setting_entries (or business_settings), write to new tables,
 *          update business_settings with availability-only blob, drop auto_confirm_enabled column.
 */

const AVAILABILITY_SETTINGS_KEY = 'availability_settings';
const AUTO_CONFIRM_ENTRY_KEY = 'autoConfirmEnabled';

function isBlobKey(key) {
  return key !== AUTO_CONFIRM_ENTRY_KEY;
}

export default {
  async up(queryInterface, Sequelize) {
    let blob = null;
    let autoConfirmEnabled = false;

    const [entryRows] = await queryInterface.sequelize.query(
      `SELECT entry_key, value FROM availability_setting_entries ORDER BY entry_key ASC`
    );

    if (entryRows && entryRows.length > 0) {
      blob = {};
      for (const row of entryRows) {
        const key = row.entry_key;
        if (key === AUTO_CONFIRM_ENTRY_KEY) {
          autoConfirmEnabled = row.value === true;
        } else if (isBlobKey(key)) {
          blob[key] = row.value;
        }
      }
    }

    if (!blob || Object.keys(blob).length === 0) {
      const [bsRows] = await queryInterface.sequelize.query(
        `SELECT setting_value, auto_confirm_enabled FROM business_settings WHERE setting_key = '${AVAILABILITY_SETTINGS_KEY}' LIMIT 1`
      );
      if (bsRows && bsRows.length > 0) {
        blob = bsRows[0].setting_value || {};
        autoConfirmEnabled = bsRows[0].auto_confirm_enabled === true;
      }
    }

    if (!blob || typeof blob !== 'object') {
      blob = {};
    }

    const calendarConfig = blob.calendarConfig && typeof blob.calendarConfig === 'object'
      ? blob.calendarConfig
      : { enabled: false, provider: 'none', calendars: [], holdDurationMinutes: 15, holdDurationMin: 1, holdDurationMax: 60, holdDurationFallback: 15, adminEntryTimeout: { value: 30, unit: 'days' } };
    const calendarSettingsValue = { ...calendarConfig, autoConfirmEnabled };

    const dp = blob.differentialPerspectives || {};
    const wizardSettingsValue = {
      showApplyCoupon: blob.showApplyCoupon ?? false,
      useBrandColors: blob.useBrandColors ?? false,
      majorLabel: dp.majorLabel,
      minorLabel: dp.minorLabel,
      moveableFallbackLabel: dp.moveableFallbackLabel,
      differentialGraphDefaultLabel: dp.differentialGraphDefaultLabel,
      majorStateLabel: dp.majorStateLabel,
      minorStateLabel: dp.minorStateLabel,
      selectTimeSlotLabel: dp.selectTimeSlotLabel,
      subStepLabelPickDay: dp.subStepLabelPickDay,
      subStepLabelOptions: dp.subStepLabelOptions,
      subStepLabelPickTime: dp.subStepLabelPickTime,
      subStepLabelConfirmMoveable: dp.subStepLabelConfirmMoveable,
    };

    const availabilityOnly = {
      businessHours: blob.businessHours,
      minuteIncrement: blob.minuteIncrement,
      rangeConstraints: blob.rangeConstraints,
      buffers: blob.buffers,
      maxWorkHours: blob.maxWorkHours,
      maxIncome: blob.maxIncome,
      overlapSources: blob.overlapSources,
      timezone: blob.timezone,
      durationRounding: blob.durationRounding,
      defaultLocation: blob.defaultLocation,
      differentialPerspectives: blob.differentialPerspectives
        ? { majorAttendees: blob.differentialPerspectives.majorAttendees, minorAttendees: blob.differentialPerspectives.minorAttendees }
        : undefined,
    };

    const now = new Date().toISOString();
    await queryInterface.sequelize.query(
      `INSERT INTO calendar_settings (id, setting_value, created_at, updated_at)
       VALUES (gen_random_uuid(), :value::jsonb, :now::timestamptz, :now::timestamptz)`,
      { replacements: { value: JSON.stringify(calendarSettingsValue), now }, type: Sequelize.QueryTypes.INSERT }
    );
    await queryInterface.sequelize.query(
      `INSERT INTO wizard_settings (id, setting_value, created_at, updated_at)
       VALUES (gen_random_uuid(), :value::jsonb, :now::timestamptz, :now::timestamptz)`,
      { replacements: { value: JSON.stringify(wizardSettingsValue), now }, type: Sequelize.QueryTypes.INSERT }
    );

    await queryInterface.sequelize.query(
      `UPDATE business_settings SET setting_value = :value::jsonb WHERE setting_key = :key`,
      { replacements: { value: JSON.stringify(availabilityOnly), key: AVAILABILITY_SETTINGS_KEY }, type: Sequelize.QueryTypes.UPDATE }
    );

    await queryInterface.sequelize.query(`
      ALTER TABLE public.business_settings DROP COLUMN IF EXISTS auto_confirm_enabled;
    `);

    console.log('[split_settings_data] Split data into calendar_settings, wizard_settings; trimmed business_settings');
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public.business_settings ADD COLUMN IF NOT EXISTS auto_confirm_enabled BOOLEAN DEFAULT false NOT NULL;
    `);
    await queryInterface.sequelize.query(`DELETE FROM wizard_settings`);
    await queryInterface.sequelize.query(`DELETE FROM calendar_settings`);
    console.log('[split_settings_data] Reverted split; re-added auto_confirm_enabled');
  },
};
