/**
 * Migration: Link coupon block instances to service block instances in booking_cascades
 * Date: 2026-03-06
 * Purpose: Coupon cascade uses selectedServiceTypeBlocks as parent. Coupon instances
 *   were only linked to a user instance; this links them to every service instance
 *   so the Step 5 "Apply coupon" dropdown shows coupons when a service is selected.
 */

const COUPON_SHAPE_ID = '9acd044e-4470-4916-83fe-ac254eb6e7fe';
const SERVICE_SHAPE_ID = '26d66957-e7a1-40a7-829e-b68a5ca49b8e';

export default {
  async up(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(
      `
      INSERT INTO public.booking_cascades (parent_id, child_id, disabled, created_at, updated_at)
      SELECT s.id, c.id, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      FROM public.block_instances s
      CROSS JOIN public.block_instances c
      WHERE s.block_shape_ref = :serviceShapeId
        AND c.block_shape_ref = :couponShapeId
      ON CONFLICT (parent_id, child_id) DO NOTHING;
      `,
      {
        replacements: { serviceShapeId: SERVICE_SHAPE_ID, couponShapeId: COUPON_SHAPE_ID },
      }
    );
  },

  async down(_queryInterface, _Sequelize) {
    // Removing these links would require tracking which rows we inserted.
    // No-op; restore by re-running up or manually removing service-coupon links.
  },
};
