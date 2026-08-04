/**
 * Baseline dumps use PostgreSQL type `block_shape_type` on `block_shapes.type`.
 * 20260432_000058 only renamed `enum_block_shapes_type`; DBs from SQL baseline kept legacy labels
 * (property, option, coupon) so UPDATE ... SET type = 'event' failed with enum errors → 500.
 *
 * Idempotent: no-op when labels are already canonical (time, event, price).
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
DO $migrate$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_enum e
    JOIN pg_catalog.pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'block_shape_type' AND e.enumlabel = 'property'
  ) THEN
    ALTER TYPE public.block_shape_type RENAME VALUE 'property' TO 'time';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_enum e
    JOIN pg_catalog.pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'block_shape_type' AND e.enumlabel = 'coupon'
  ) THEN
    ALTER TYPE public.block_shape_type RENAME VALUE 'coupon' TO 'price';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_enum e
    JOIN pg_catalog.pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'block_shape_type' AND e.enumlabel = 'option'
  ) THEN
    ALTER TYPE public.block_shape_type RENAME VALUE 'option' TO 'event';
  END IF;
END
$migrate$;
`)
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
DO $migrate$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_enum e
    JOIN pg_catalog.pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'block_shape_type' AND e.enumlabel = 'time'
  ) THEN
    ALTER TYPE public.block_shape_type RENAME VALUE 'time' TO 'property';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_enum e
    JOIN pg_catalog.pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'block_shape_type' AND e.enumlabel = 'price'
  ) THEN
    ALTER TYPE public.block_shape_type RENAME VALUE 'price' TO 'coupon';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_enum e
    JOIN pg_catalog.pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'block_shape_type' AND e.enumlabel = 'event'
  ) THEN
    ALTER TYPE public.block_shape_type RENAME VALUE 'event' TO 'option';
  END IF;
END
$migrate$;
`)
  },
}
