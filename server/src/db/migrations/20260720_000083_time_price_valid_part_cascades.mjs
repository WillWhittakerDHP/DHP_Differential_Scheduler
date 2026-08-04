/**
 * WHY: Time (Property Details) and price (Fees & Coupons) block shapes had zero
 * valid_part_cascades, so admin could not offer part-shape slots to attach work items.
 * Mirror the service/event allow-list: every active part shape is valid on time & price.
 *
 * Idempotent. Localhost-safe data migration.
 */
export default {
  async up(queryInterface) {
    const { sequelize } = queryInterface

    await sequelize.query(`
      INSERT INTO public.valid_part_cascades (
        id, parent_id, child_id, is_default, disabled, created_at, updated_at
      )
      SELECT
        gen_random_uuid(),
        bs.id,
        ps.id,
        false,
        false,
        NOW(),
        NOW()
      FROM public.block_shapes AS bs
      CROSS JOIN public.part_shapes AS ps
      WHERE bs.semantic_type IN ('time', 'price')
        AND NOT EXISTS (
          SELECT 1
          FROM public.valid_part_cascades AS vpc
          WHERE vpc.parent_id = bs.id
            AND vpc.child_id = ps.id
        )
    `)
  },

  async down(queryInterface) {
    const { sequelize } = queryInterface

    await sequelize.query(`
      DELETE FROM public.valid_part_cascades AS vpc
      USING public.block_shapes AS bs
      WHERE vpc.parent_id = bs.id
        AND bs.semantic_type IN ('time', 'price')
    `)
  },
}
