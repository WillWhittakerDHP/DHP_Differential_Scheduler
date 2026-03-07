/**
 * Migration: Fix Coupon block shape type and add Service → Coupon valid_cascade
 * Date: 2026-03-06
 * Purpose: Align DB with client cascade (coupon from service, same as property/option).
 *   - Coupon block shape must have type 'coupon' so getBlockShapeIdByType finds it.
 *   - Service shape must allow cascading to Coupon shape so service instances can
 *     have coupon instances in Active Cascades (booking_cascades).
 */

const COUPON_SHAPE_ID = '9acd044e-4470-4916-83fe-ac254eb6e7fe';
const SERVICE_SHAPE_ID = '26d66957-e7a1-40a7-829e-b68a5ca49b8e';

export default {
  async up(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      UPDATE public.block_shapes
      SET type = 'coupon'
      WHERE id = :couponShapeId AND type != 'coupon';
    `, {
      replacements: { couponShapeId: COUPON_SHAPE_ID },
    });

    await queryInterface.sequelize.query(`
      INSERT INTO public.valid_cascades (id, parent_id, child_id, is_default, disabled, created_at, updated_at)
      VALUES (gen_random_uuid(), :serviceShapeId, :couponShapeId, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (parent_id, child_id) DO NOTHING;
    `, {
      replacements: { serviceShapeId: SERVICE_SHAPE_ID, couponShapeId: COUPON_SHAPE_ID },
    });
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      DELETE FROM public.valid_cascades
      WHERE parent_id = :serviceShapeId AND child_id = :couponShapeId;
    `, {
      replacements: { serviceShapeId: SERVICE_SHAPE_ID, couponShapeId: COUPON_SHAPE_ID },
    });

    await queryInterface.sequelize.query(`
      UPDATE public.block_shapes
      SET type = 'user'
      WHERE id = :couponShapeId AND type = 'coupon';
    `, {
      replacements: { couponShapeId: COUPON_SHAPE_ID },
    });
  },
};
