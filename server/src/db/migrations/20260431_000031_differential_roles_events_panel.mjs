/**
 * Move blockInstance.differentialEventRoleOverrides ("Differential roles") from Relationships to Events panel.
 * Matches client determinePanelFromFieldKey (primitive keys are not in RELATIONSHIP_KEYS).
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      UPDATE public.admin_metadata
      SET panel = 'events', updated_at = NOW()
      WHERE entity_type = 'blockInstance'
        AND field_key = 'differentialEventRoleOverrides'
        AND panel IS DISTINCT FROM 'events';
    `)
  },
}
