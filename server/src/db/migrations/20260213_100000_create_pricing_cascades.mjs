/**
 * Migration: Create pricing_cascades and valid_pricing_cascades tables
 * Date: 2026-02-13
 * Purpose: Instance-level (partInstance -> partInstance) and shape-level (partShape -> partShape)
 *          pricing cascade relationships for validated control over which downstream parts
 *          contribute to service pricing.
 */

export default {
  async up(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TABLE public.pricing_cascades (
        id uuid DEFAULT gen_random_uuid() NOT NULL,
        parent_id uuid NOT NULL,
        child_id uuid NOT NULL,
        disabled boolean DEFAULT false NOT NULL,
        created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE ONLY public.pricing_cascades
        ADD CONSTRAINT pricing_cascades_pkey PRIMARY KEY (id);
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE ONLY public.pricing_cascades
        ADD CONSTRAINT pricing_cascades_parent_id_child_id_key UNIQUE (parent_id, child_id);
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX pricing_cascades_parent_id_idx ON public.pricing_cascades USING btree (parent_id);
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX pricing_cascades_child_id_idx ON public.pricing_cascades USING btree (child_id);
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE ONLY public.pricing_cascades
        ADD CONSTRAINT pricing_cascades_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.part_instances(id) ON UPDATE CASCADE ON DELETE CASCADE;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE ONLY public.pricing_cascades
        ADD CONSTRAINT pricing_cascades_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.part_instances(id) ON UPDATE CASCADE ON DELETE CASCADE;
    `);

    await queryInterface.sequelize.query(`
      CREATE TABLE public.valid_pricing_cascades (
        id uuid DEFAULT gen_random_uuid() NOT NULL,
        parent_id uuid NOT NULL,
        child_id uuid NOT NULL,
        disabled boolean DEFAULT false NOT NULL,
        created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE ONLY public.valid_pricing_cascades
        ADD CONSTRAINT valid_pricing_cascades_pkey PRIMARY KEY (id);
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE ONLY public.valid_pricing_cascades
        ADD CONSTRAINT valid_pricing_cascades_parent_id_child_id_key UNIQUE (parent_id, child_id);
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX valid_pricing_cascades_parent_id_idx ON public.valid_pricing_cascades USING btree (parent_id);
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX valid_pricing_cascades_child_id_idx ON public.valid_pricing_cascades USING btree (child_id);
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE ONLY public.valid_pricing_cascades
        ADD CONSTRAINT valid_pricing_cascades_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.part_shapes(id) ON UPDATE CASCADE ON DELETE CASCADE;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE ONLY public.valid_pricing_cascades
        ADD CONSTRAINT valid_pricing_cascades_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.part_shapes(id) ON UPDATE CASCADE ON DELETE CASCADE;
    `);

    console.log('[pricing_cascades] Created pricing_cascades and valid_pricing_cascades tables');
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS public.pricing_cascades;`);
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS public.valid_pricing_cascades;`);
    console.log('[pricing_cascades] Dropped pricing_cascades and valid_pricing_cascades tables');
  },
};
