/**
 * Strategy C catalog — Minimize Time On Site event packages (BONSAI_SPEC §6.1 / principles §5.2).
 *
 * 1. Standard Event Schedule (hidden): owns Primary; services baseline-route here.
 * 2. Minimize Time On Site (composite, wizard-facing): owns Early Arrival / Primary /
 *    Formal Presentation / Off-Site; part → segment overrides for report + presentation.
 * 3. Soft-hides segment-named competing event atomics from the wizard.
 * 4. Wires Buyer's Inspection booking_cascades → Standard / MTOS / No Presentation.
 * 5. Seeds service baseline event_assignments → Standard Primary.
 *
 * Idempotent. Localhost-safe data migration (no schema change).
 */

const EVENT_SHAPE_ID = 'c3e2fbe7-5201-4151-8355-14ebe8741b48'
const BUYERS_INSPECTION_ID = '71d4e133-0007-40b5-b249-7f1c9d2f7772'

/** Stable ids so re-runs and downs are predictable. */
const STANDARD_PACKAGE_ID = 'a1b2c3d4-e5f6-4789-a012-3456789abcde'
const STANDARD_PRIMARY_ID = 'b2c3d4e5-f6a7-4890-b123-456789abcdef'
const MTOS_EARLY_ID = 'c3d4e5f6-a7b8-4901-c234-56789abcdef0'
const MTOS_PRIMARY_ID = 'd4e5f6a7-b8c9-4012-d345-6789abcdef01'
const MTOS_PRESENTATION_ID = 'e5f6a7b8-c9d0-4123-e456-789abcdef012'
const MTOS_OFFSITE_ID = 'f6a7b8c9-d0e1-4234-f567-89abcdef0123'

const BASELINE_ASSIGNMENT_ID = '01234567-89ab-4cde-8f01-23456789abcd'
const OVERRIDE_REPORT_ID = '12345678-9abc-4def-8012-3456789abcde'
const OVERRIDE_PRESENTATION_ID = '23456789-abcd-4ef0-8123-456789abcdef'
const CASCADE_STANDARD_ID = '3456789a-bcde-4f01-8234-56789abcdef0'

const RETIRE_WIZARD_NAMES = [
  'Early Arrival',
  'Report Writing',
  'Data Collection',
  'Summary Writing',
  'Additional Presentation',
  'Default Presentation',
]

async function resolveEventShapeId(sequelize, placementKind, anchorEdge) {
  const [rows] = await sequelize.query(
    `
    SELECT id
    FROM public.event_shapes
    WHERE placement_kind = :placementKind
      AND (
        (:anchorEdge::text IS NULL AND anchor_edge IS NULL)
        OR anchor_edge = :anchorEdge
      )
      AND active = true
    ORDER BY order_index
    LIMIT 1
    `,
    { replacements: { placementKind, anchorEdge } }
  )
  return rows[0]?.id ?? null
}

async function ensureEventSegment(sequelize, params) {
  const { id, parentId, name, eventShapeId, orderIndex } = params
  await sequelize.query(
    `
    INSERT INTO public.event_instances (
      id, event_shape_ref, name, title_template, description_template, location_template,
      created_at, updated_at, order_index, active, parent_block_instance_id
    )
    SELECT
      :id::uuid, :eventShapeId::uuid, :name, '', '', '',
      NOW(), NOW(), :orderIndex, true, :parentId::uuid
    WHERE NOT EXISTS (
      SELECT 1 FROM public.event_instances WHERE id = :id::uuid
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.event_instances
      WHERE parent_block_instance_id = :parentId::uuid AND name = :name
    )
    `,
    { replacements: { id, parentId, name, eventShapeId, orderIndex } }
  )

  await sequelize.query(
    `
    UPDATE public.event_instances
    SET event_shape_ref = :eventShapeId::uuid,
        active = true,
        parent_block_instance_id = :parentId::uuid,
        order_index = :orderIndex,
        updated_at = NOW()
    WHERE id = :id::uuid
       OR (parent_block_instance_id = :parentId::uuid AND name = :name)
    `,
    { replacements: { id, parentId, name, eventShapeId, orderIndex } }
  )
}

async function segmentIdByName(sequelize, parentId, name) {
  const [rows] = await sequelize.query(
    `
    SELECT id FROM public.event_instances
    WHERE parent_block_instance_id = :parentId::uuid AND name = :name
    LIMIT 1
    `,
    { replacements: { parentId, name } }
  )
  return rows[0]?.id ?? null
}

export default {
  async up(queryInterface) {
    const { sequelize } = queryInterface

    const primaryShapeId = await resolveEventShapeId(sequelize, 'primary', null)
    const earlyShapeId = await resolveEventShapeId(sequelize, 'marginal', 'start')
    const presentationShapeId = await resolveEventShapeId(sequelize, 'secondary', 'end')
    const offsiteShapeId = await resolveEventShapeId(sequelize, 'floating', 'end')

    if (!primaryShapeId || !earlyShapeId || !presentationShapeId || !offsiteShapeId) {
      throw new Error(
        'Migration 082: missing event_shapes for primary / marginal:start / secondary:end / floating:end'
      )
    }

    // --- Standard Event Schedule (hidden baseline package) ---
    await sequelize.query(
      `
      INSERT INTO public.block_instances (
        id, name, order_index, block_shape_ref, created_at, updated_at, icon,
        composite, requires_unit_number, is_multi_family, pre_closing, orchestrator,
        requires_agent, wizard_placement, accumulator
      )
      SELECT
        :id::uuid, 'Standard Event Schedule',
        COALESCE((SELECT MAX(order_index) FROM public.block_instances), 0) + 1,
        :shapeId::uuid, NOW(), NOW(), '',
        false, false, false, false, true,
        false, 'hidden', false
      WHERE NOT EXISTS (
        SELECT 1 FROM public.block_instances WHERE id = :id::uuid OR name = 'Standard Event Schedule'
      )
      `,
      { replacements: { id: STANDARD_PACKAGE_ID, shapeId: EVENT_SHAPE_ID } }
    )

    const [[standardRow]] = await sequelize.query(
      `
      SELECT id FROM public.block_instances
      WHERE id = :id::uuid OR name = 'Standard Event Schedule'
      LIMIT 1
      `,
      { replacements: { id: STANDARD_PACKAGE_ID } }
    )
    const standardId = standardRow.id

    await sequelize.query(
      `
      UPDATE public.block_instances
      SET orchestrator = true,
          composite = false,
          wizard_placement = 'hidden',
          updated_at = NOW()
      WHERE id = :id::uuid
      `,
      { replacements: { id: standardId } }
    )

    await ensureEventSegment(sequelize, {
      id: STANDARD_PRIMARY_ID,
      parentId: standardId,
      name: 'Primary',
      eventShapeId: primaryShapeId,
      orderIndex: 0,
    })
    const standardPrimaryId = await segmentIdByName(sequelize, standardId, 'Primary')

    // --- Minimize Time On Site (rename + composite package + four segments) ---
    await sequelize.query(
      `
      UPDATE public.block_instances
      SET name = 'Minimize Time On Site',
          composite = true,
          orchestrator = false,
          wizard_placement = 'topLine',
          updated_at = NOW()
      WHERE name IN ('Minimize Property Access', 'Minimize Time-on-site', 'Minimize Time On Site')
         OR id = 'db3942c3-8d49-4a92-a2dd-73ac142d5701'::uuid
      `
    )

    const [[mtosRow]] = await sequelize.query(
      `
      SELECT id FROM public.block_instances
      WHERE name = 'Minimize Time On Site'
      LIMIT 1
      `
    )
    if (!mtosRow) {
      throw new Error('Migration 082: Minimize Time On Site block instance not found')
    }
    const mtosId = mtosRow.id

    await ensureEventSegment(sequelize, {
      id: MTOS_EARLY_ID,
      parentId: mtosId,
      name: 'Early Arrival',
      eventShapeId: earlyShapeId,
      orderIndex: 0,
    })
    await ensureEventSegment(sequelize, {
      id: MTOS_PRIMARY_ID,
      parentId: mtosId,
      name: 'Primary',
      eventShapeId: primaryShapeId,
      orderIndex: 1,
    })
    await ensureEventSegment(sequelize, {
      id: MTOS_PRESENTATION_ID,
      parentId: mtosId,
      name: 'Formal Presentation',
      eventShapeId: presentationShapeId,
      orderIndex: 2,
    })
    await ensureEventSegment(sequelize, {
      id: MTOS_OFFSITE_ID,
      parentId: mtosId,
      name: 'Off-Site',
      eventShapeId: offsiteShapeId,
      orderIndex: 3,
    })

    const mtosPresentationId = await segmentIdByName(sequelize, mtosId, 'Formal Presentation')
    const mtosOffsiteId = await segmentIdByName(sequelize, mtosId, 'Off-Site')
    const mtosEarlyId = await segmentIdByName(sequelize, mtosId, 'Early Arrival')

    // --- Soft-retire competing segment-named wizard options ---
    await sequelize.query(
      `
      UPDATE public.block_instances AS bi
      SET wizard_placement = 'hidden',
          updated_at = NOW()
      FROM public.block_shapes AS bs
      WHERE bi.block_shape_ref = bs.id
        AND bs.semantic_type = 'event'
        AND bi.name IN (${RETIRE_WIZARD_NAMES.map((n) => sequelize.escape(n)).join(', ')})
        AND bi.wizard_placement <> 'hidden'
      `
    )

    // --- No Presentation stays wizard-facing; ensure Primary ownership ---
    await sequelize.query(
      `
      UPDATE public.block_instances
      SET wizard_placement = 'topLine',
          updated_at = NOW()
      WHERE name = 'No Presentation'
      `
    )

    // --- Cascades: Buyer's Inspection → Standard / MTOS / No Presentation ---
    const cascadeChildren = [
      { childId: standardId, cascadeId: CASCADE_STANDARD_ID },
      { childId: mtosId, cascadeId: null },
    ]
    for (const { childId, cascadeId } of cascadeChildren) {
      await sequelize.query(
        `
        INSERT INTO public.booking_cascades (
          id, parent_id, child_id, disabled, created_at, updated_at
        )
        SELECT
          ${cascadeId ? ':cascadeId::uuid' : 'gen_random_uuid()'},
          :parentId::uuid,
          :childId::uuid,
          false,
          NOW(),
          NOW()
        WHERE EXISTS (SELECT 1 FROM public.block_instances WHERE id = :parentId::uuid)
          AND EXISTS (SELECT 1 FROM public.block_instances WHERE id = :childId::uuid)
          AND NOT EXISTS (
            SELECT 1 FROM public.booking_cascades
            WHERE parent_id = :parentId::uuid AND child_id = :childId::uuid
          )
        `,
        {
          replacements: {
            parentId: BUYERS_INSPECTION_ID,
            childId,
            ...(cascadeId ? { cascadeId } : {}),
          },
        }
      )
      await sequelize.query(
        `
        UPDATE public.booking_cascades
        SET disabled = false, updated_at = NOW()
        WHERE parent_id = :parentId::uuid AND child_id = :childId::uuid
        `,
        { replacements: { parentId: BUYERS_INSPECTION_ID, childId } }
      )
    }

    // Ensure No Presentation cascade remains enabled if present.
    await sequelize.query(
      `
      UPDATE public.booking_cascades AS bc
      SET disabled = false, updated_at = NOW()
      FROM public.block_instances AS child
      WHERE bc.child_id = child.id
        AND bc.parent_id = :parentId::uuid
        AND child.name = 'No Presentation'
      `,
      { replacements: { parentId: BUYERS_INSPECTION_ID } }
    )

    // --- Baseline: Buyer's Inspection → Standard Primary ---
    if (standardPrimaryId) {
      await sequelize.query(
        `
        INSERT INTO public.event_assignments (
          id, parent_id, parent_kind, child_id, disabled, created_at, updated_at
        )
        SELECT
          :id::uuid,
          :parentId::uuid,
          'blockInstance'::public.enum_event_assignments_parent_kind,
          :childId::uuid,
          false,
          NOW(),
          NOW()
        WHERE NOT EXISTS (
          SELECT 1 FROM public.event_assignments
          WHERE parent_id = :parentId::uuid AND child_id = :childId::uuid
        )
        `,
        {
          replacements: {
            id: BASELINE_ASSIGNMENT_ID,
            parentId: BUYERS_INSPECTION_ID,
            childId: standardPrimaryId,
          },
        }
      )

      await sequelize.query(
        `
        UPDATE public.block_instances
        SET default_event_instance_id = :segmentId::uuid,
            updated_at = NOW()
        WHERE id = :serviceId::uuid
        `,
        {
          replacements: {
            segmentId: standardPrimaryId,
            serviceId: BUYERS_INSPECTION_ID,
          },
        }
      )
    }

    // --- MTOS overrides: report → Off-Site, presentation → Formal Presentation,
    //     early-arrival shape parts → Early Arrival (when assigned on the service). ---
    const overrideSpecs = [
      {
        partShapeName: 'Report Writing',
        segmentId: mtosOffsiteId,
        assignmentId: OVERRIDE_REPORT_ID,
      },
      {
        partShapeName: 'Formal Presentation',
        segmentId: mtosPresentationId,
        assignmentId: OVERRIDE_PRESENTATION_ID,
      },
      {
        partShapeName: 'Early Arrival',
        segmentId: mtosEarlyId,
        assignmentId: null,
      },
    ]

    for (const spec of overrideSpecs) {
      if (!spec.segmentId) continue
      const [parts] = await sequelize.query(
        `
        SELECT pi.id AS part_id
        FROM public.part_assignments AS pa
        JOIN public.part_instances AS pi ON pi.id = pa.child_id
        JOIN public.part_shapes AS ps ON ps.id = pi.part_shape_ref
        WHERE pa.parent_id = :serviceId::uuid
          AND pa.disabled = false
          AND pi.active = true
          AND ps.name = :partShapeName
        `,
        {
          replacements: {
            serviceId: BUYERS_INSPECTION_ID,
            partShapeName: spec.partShapeName,
          },
        }
      )

      for (const part of parts) {
        const assignmentId = spec.assignmentId ?? null
        await sequelize.query(
          `
          INSERT INTO public.event_assignments (
            id, parent_id, parent_kind, child_id, disabled, created_at, updated_at
          )
          SELECT
            ${assignmentId ? ':assignmentId::uuid' : 'gen_random_uuid()'},
            :partId::uuid,
            'partInstance'::public.enum_event_assignments_parent_kind,
            :segmentId::uuid,
            false,
            NOW(),
            NOW()
          WHERE NOT EXISTS (
            SELECT 1 FROM public.event_assignments
            WHERE parent_id = :partId::uuid AND child_id = :segmentId::uuid
          )
          `,
          {
            replacements: {
              ...(assignmentId ? { assignmentId } : {}),
              partId: part.part_id,
              segmentId: spec.segmentId,
            },
          }
        )
      }
    }
  },

  async down(queryInterface) {
    const { sequelize } = queryInterface

    await sequelize.query(
      `
      DELETE FROM public.event_assignments
      WHERE id IN (
        :baselineId::uuid,
        :reportId::uuid,
        :presentationId::uuid
      )
      OR (
        parent_kind = 'partInstance'::public.enum_event_assignments_parent_kind
        AND child_id IN (
          SELECT id FROM public.event_instances
          WHERE parent_block_instance_id IN (
            SELECT id FROM public.block_instances WHERE name = 'Minimize Time On Site'
          )
        )
      )
      `,
      {
        replacements: {
          baselineId: BASELINE_ASSIGNMENT_ID,
          reportId: OVERRIDE_REPORT_ID,
          presentationId: OVERRIDE_PRESENTATION_ID,
        },
      }
    )

    await sequelize.query(
      `
      UPDATE public.block_instances
      SET default_event_instance_id = NULL, updated_at = NOW()
      WHERE id = :serviceId::uuid
        AND default_event_instance_id IN (
          SELECT id FROM public.event_instances
          WHERE parent_block_instance_id IN (
            SELECT id FROM public.block_instances
            WHERE name = 'Standard Event Schedule' OR id = :standardId::uuid
          )
        )
      `,
      {
        replacements: {
          serviceId: BUYERS_INSPECTION_ID,
          standardId: STANDARD_PACKAGE_ID,
        },
      }
    )

    await sequelize.query(
      `
      DELETE FROM public.booking_cascades
      WHERE id = :cascadeId::uuid
         OR (
           parent_id = :serviceId::uuid
           AND child_id IN (
             SELECT id FROM public.block_instances
             WHERE name = 'Standard Event Schedule' OR id = :standardId::uuid
           )
         )
      `,
      {
        replacements: {
          cascadeId: CASCADE_STANDARD_ID,
          serviceId: BUYERS_INSPECTION_ID,
          standardId: STANDARD_PACKAGE_ID,
        },
      }
    )

    await sequelize.query(
      `
      DELETE FROM public.event_instances
      WHERE id IN (
        :earlyId::uuid, :primaryId::uuid, :presentationId::uuid, :offsiteId::uuid, :stdPrimaryId::uuid
      )
      OR parent_block_instance_id IN (
        SELECT id FROM public.block_instances
        WHERE name = 'Standard Event Schedule' OR id = :standardId::uuid
      )
      `,
      {
        replacements: {
          earlyId: MTOS_EARLY_ID,
          primaryId: MTOS_PRIMARY_ID,
          presentationId: MTOS_PRESENTATION_ID,
          offsiteId: MTOS_OFFSITE_ID,
          stdPrimaryId: STANDARD_PRIMARY_ID,
          standardId: STANDARD_PACKAGE_ID,
        },
      }
    )

    await sequelize.query(
      `
      DELETE FROM public.block_instances
      WHERE id = :standardId::uuid OR name = 'Standard Event Schedule'
      `,
      { replacements: { standardId: STANDARD_PACKAGE_ID } }
    )

    await sequelize.query(
      `
      UPDATE public.block_instances
      SET name = 'Minimize Property Access',
          composite = false,
          orchestrator = true,
          updated_at = NOW()
      WHERE name = 'Minimize Time On Site'
      `
    )
  },
}
