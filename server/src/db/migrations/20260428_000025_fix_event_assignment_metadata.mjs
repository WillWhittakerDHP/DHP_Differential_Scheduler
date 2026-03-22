/**
 * Event assignments: partInstance uses multi-select (reference), not relationshipCollection.
 * Remove erroneous blockShape.eventAssignments row and duplicate partShape.validEvents primitive.
 */

const PART_INSTANCE_EVENT_ASSIGNMENTS_ID = '1323b077-7037-4a8c-ac8b-c9c6beccdf13'
const BLOCK_SHAPE_EVENT_ASSIGNMENTS_ID = '1ec4b49e-531b-411b-af88-7d6de89faec3'
const PART_SHAPE_VALID_EVENTS_DUPLICATE_PRIMITIVE_ID = 'dcf4e791-f597-4a1f-bd14-740c34f8b2cd'

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize

    await sequelize.query(
      `
      UPDATE public.admin_metadata
      SET render_as = 'reference', updated_at = NOW()
      WHERE id = :id::uuid;
    `,
      { replacements: { id: PART_INSTANCE_EVENT_ASSIGNMENTS_ID } }
    )

    await sequelize.query(
      `
      DELETE FROM public.admin_metadata
      WHERE id = :id::uuid;
    `,
      { replacements: { id: BLOCK_SHAPE_EVENT_ASSIGNMENTS_ID } }
    )

    await sequelize.query(
      `
      DELETE FROM public.admin_metadata
      WHERE id = :id::uuid;
    `,
      { replacements: { id: PART_SHAPE_VALID_EVENTS_DUPLICATE_PRIMITIVE_ID } }
    )
  },
}
