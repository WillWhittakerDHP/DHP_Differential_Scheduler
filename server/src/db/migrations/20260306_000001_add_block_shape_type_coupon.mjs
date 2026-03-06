/**
 * Migration: Add 'coupon' to block_shape_type enum
 * Date: 2026-03-06
 * Purpose: Task 6.10.1.4 — Apply Coupon dropdown uses same type-based strategy as property/option;
 *          coupon block shape is identified by BLOCK_SHAPE_TYPES.COUPON.
 */

export default {
  async up(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TYPE public.block_shape_type ADD VALUE IF NOT EXISTS 'coupon';
    `);
  },

  async down(_queryInterface, _Sequelize) {
    // PostgreSQL does not support removing an enum value without recreating the type.
    // No-op; document that rollback would require a full enum migration.
  },
};
