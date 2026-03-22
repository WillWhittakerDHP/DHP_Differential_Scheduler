/**
 * Align persisted render_as for instance/graph fields that use RelationshipCollection in UI.
 * Shape-level valid* fields use multiselect (see 000033); do not list them here.
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      UPDATE public.admin_metadata
      SET render_as = 'relationshipCollection', updated_at = NOW()
      WHERE metadata_type = 'relationship'
        AND field_key IN (
          'partAssignments',
          'annotationAssignments',
          'eventAssignments',
          'bookingCascades',
          'pricingCascades',
          'dependentInstances',
          'instanceComponents',
          'attendeeAssignments'
        )
        AND render_as IS DISTINCT FROM 'relationshipCollection';
    `)
  },
}
