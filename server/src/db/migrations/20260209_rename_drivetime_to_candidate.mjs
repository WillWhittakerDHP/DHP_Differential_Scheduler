/**
 * Migration: Rename drive time buffer keys to driveToCandidate / driveFromCandidate
 *
 * Renames in business_settings.setting_value.buffers:
 * - driveTimeTo -> driveToCandidate
 * - driveTimeFrom -> driveFromCandidate
 *
 * Down: reverses the key renames.
 */

export default {
  async up(queryInterface, _Sequelize) {
    const [settings] = await queryInterface.sequelize.query(
      `SELECT id, setting_value FROM "business_settings" WHERE setting_key = 'availability_settings'`
    );

    for (const row of settings) {
      const settingValue = typeof row.setting_value === 'string'
        ? JSON.parse(row.setting_value)
        : row.setting_value;

      if (!settingValue.buffers) continue;

      let needsUpdate = false;
      if (settingValue.buffers.driveTimeTo !== undefined) {
        settingValue.buffers.driveToCandidate = settingValue.buffers.driveTimeTo;
        delete settingValue.buffers.driveTimeTo;
        needsUpdate = true;
      }
      if (settingValue.buffers.driveTimeFrom !== undefined) {
        settingValue.buffers.driveFromCandidate = settingValue.buffers.driveTimeFrom;
        delete settingValue.buffers.driveTimeFrom;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await queryInterface.sequelize.query(
          `UPDATE "business_settings" SET setting_value = :value, updated_at = NOW() WHERE id = :id`,
          {
            replacements: {
              value: JSON.stringify(settingValue),
              id: row.id
            }
          }
        );
        console.log(`[Migration] Updated business_settings id=${row.id}: Renamed driveTimeTo/driveTimeFrom to driveToCandidate/driveFromCandidate`);
      }
    }
  },

  async down(queryInterface, _Sequelize) {
    const [settings] = await queryInterface.sequelize.query(
      `SELECT id, setting_value FROM "business_settings" WHERE setting_key = 'availability_settings'`
    );

    for (const row of settings) {
      const settingValue = typeof row.setting_value === 'string'
        ? JSON.parse(row.setting_value)
        : row.setting_value;

      if (!settingValue.buffers) continue;

      let needsUpdate = false;
      if (settingValue.buffers.driveToCandidate !== undefined) {
        settingValue.buffers.driveTimeTo = settingValue.buffers.driveToCandidate;
        delete settingValue.buffers.driveToCandidate;
        needsUpdate = true;
      }
      if (settingValue.buffers.driveFromCandidate !== undefined) {
        settingValue.buffers.driveTimeFrom = settingValue.buffers.driveFromCandidate;
        delete settingValue.buffers.driveFromCandidate;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await queryInterface.sequelize.query(
          `UPDATE "business_settings" SET setting_value = :value, updated_at = NOW() WHERE id = :id`,
          {
            replacements: {
              value: JSON.stringify(settingValue),
              id: row.id
            }
          }
        );
        console.log(`[Migration] Reverted business_settings id=${row.id}: Renamed driveToCandidate/driveFromCandidate back to driveTimeTo/driveTimeFrom`);
      }
    }
  }
};
