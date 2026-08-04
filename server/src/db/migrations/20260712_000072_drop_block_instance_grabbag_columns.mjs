/**
 * Phase 1 grab-bag cleanup (BONSAI_SPEC §6 item 2):
 *
 * Drop dead block-instance columns with no live behaviour:
 * - base_sq_ft / baseSqFt — legacy service threshold; booking uses property_details.squareFootage
 * - agent_permissions / agentPermissions — always false in live data; no runtime consumer
 *
 * Keep domain-specific flags that still drive wizard behaviour, but admin cards now hide
 * them outside their proper semantic type (client-side visibility layer).
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      ALTER TABLE public.block_instances
        DROP COLUMN IF EXISTS base_sq_ft,
        DROP COLUMN IF EXISTS agent_permissions;
    `)
    await sequelize.query(`
      ALTER TABLE public.block_instance_versions
        DROP COLUMN IF EXISTS base_sq_ft;
    `)
    await sequelize.query(`
      DROP TYPE IF EXISTS public.enum_block_instances_agent_permissions;
    `)
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      DO $do$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'enum_block_instances_agent_permissions'
        ) THEN
          CREATE TYPE public.enum_block_instances_agent_permissions AS ENUM ('true', 'false', 'override');
        END IF;
      END
      $do$;
    `)
    await sequelize.query(`
      ALTER TABLE public.block_instances
        ADD COLUMN IF NOT EXISTS base_sq_ft INTEGER NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS agent_permissions public.enum_block_instances_agent_permissions NOT NULL DEFAULT 'false';
    `)
    await sequelize.query(`
      ALTER TABLE public.block_instance_versions
        ADD COLUMN IF NOT EXISTS base_sq_ft INTEGER;
    `)
  },
}
