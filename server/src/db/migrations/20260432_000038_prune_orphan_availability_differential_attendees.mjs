/**
 * Remove availability_differential_attendees rows whose value is not a current state-control block_instance.
 * WHY: Column has no FK; orphans appear after instance deletes or user-type shape changes.
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      DELETE FROM public.availability_differential_attendees ada
      WHERE NOT EXISTS (
        SELECT 1
        FROM public.block_instances bi
        INNER JOIN public.block_shapes bs ON bs.id = bi.block_shape_ref
        WHERE bi.id::text = ada.value
          AND bs.semantic_type = 'user'
      );
    `)
  },

  async down() {
    /* Data purge is irreversible; no down migration. */
  },
}
