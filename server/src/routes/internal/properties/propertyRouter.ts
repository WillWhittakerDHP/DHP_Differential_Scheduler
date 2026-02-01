import { Router, Request, Response } from 'express';
import { Address, PropertyVersion, PropertyDetails, PropertyVersionType, BlockInstance, BlockShape } from '../../../config/app.js';
import { Op } from 'sequelize';
import { transformPropertyVersion } from '../../../utils/propertyTransformers.js';

const router = Router();

/**
 * WHY: PropertyRouter

LEARNING: Handles property CRUD operations with three-table structure
WHY: Separates address (stable) from property details (versioned) for MLS API integration
PATTERN: Address → PropertyVersion → PropertyDetails relationship chain
 */
async function findOrCreateAddress(addressData: {
  address: string;
  unit?: string | null;
  city: string;
  state: string;
  zipCode: string;
  placeId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}) {
  const existingAddress = await Address.findOne({
    where: {
      address: addressData.address,
      city: addressData.city,
      state: addressData.state,
      zipCode: addressData.zipCode,
      unit: addressData.unit || null,
    },
  });

  if (existingAddress) {
    return existingAddress;
  }

  return await Address.create({
    address: addressData.address,
    unit: addressData.unit || null,
    city: addressData.city,
    state: addressData.state,
    zipCode: addressData.zipCode,
    placeId: addressData.placeId || null,
    latitude: addressData.latitude || null,
    longitude: addressData.longitude || null,
  });
}


router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const propertyVersions = await PropertyVersion.findAll({
      include: [
        { model: Address, as: 'address' },
        { model: PropertyDetails, as: 'propertyDetails' },
      ],
    });

    const properties = propertyVersions.map(transformPropertyVersion);
    res.json(properties);
  } catch (error) {
    console.error('[PropertyRouter] Error fetching properties:', error);
    res.status(500).json({ 
      error: 'Failed to fetch properties',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const propertyVersion = await PropertyVersion.findByPk(req.params.id, {
      include: [
        { model: Address, as: 'address' },
        { model: PropertyDetails, as: 'propertyDetails' },
      ],
    });
    
    if (!propertyVersion) {
      res.status(404).json({ 
        error: 'Property not found',
        id: req.params.id
      });
      return;
    }
    
    const property = transformPropertyVersion(propertyVersion);
    res.json(property);
  } catch (error) {
    console.error('[PropertyRouter] Error fetching property:', error);
    res.status(500).json({ 
      error: 'Error fetching property',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /properties
 * Create a new property (Address → PropertyVersion → PropertyDetails)
 * 
 * LEARNING: Creates three-table structure in single transaction
 * WHY: Ensures data integrity, all or nothing creation
 * PATTERN: Find or create Address, create PropertyVersion, create PropertyDetails
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      address,
      unit,
      city,
      state,
      zipCode,
      placeId,
      latitude,
      longitude,
      mlsNumber,
      squareFootage,
      bedrooms,
      bathrooms,
      foundationAccess,
      additionalUnits,
      source = 'client', // Default to 'client' for booking wizard
    } = req.body;

    // Validate required address fields
    if (!address || !city || !state || !zipCode) {
      res.status(400).json({
        error: 'Missing required fields',
        required: ['address', 'city', 'state', 'zipCode'],
      });
      return;
    }

    const result = await PropertyVersion.sequelize!.transaction(async (transaction) => {
      const addressRecord = await findOrCreateAddress({
        address,
        unit,
        city,
        state,
        zipCode,
        placeId: placeId || null,
        latitude: latitude || null,
        longitude: longitude || null,
      });

      const propertyVersion = await PropertyVersion.create({
        addressId: addressRecord.id,
      }, { transaction });

      const propertyDetails = await PropertyDetails.create({
        propertyVersionId: propertyVersion.id,
        source: source as 'api' | 'manual' | 'client',
        mlsNumber: mlsNumber || null,
        squareFootage: squareFootage || null,
        bedrooms: bedrooms || null,
        bathrooms: bathrooms || null,
        foundationAccess: foundationAccess || null,
        additionalUnits: additionalUnits || null,
      }, { transaction });

      const completePropertyVersion = await PropertyVersion.findByPk(propertyVersion.id, {
        include: [
          { model: Address, as: 'address' },
          { model: PropertyDetails, as: 'propertyDetails' },
        ],
        transaction,
      });

      return completePropertyVersion!;
    });

    const property = transformPropertyVersion(result);
    res.status(201).json(property);
  } catch (error) {
    console.error('[PropertyRouter] Error creating property:', error);
    res.status(500).json({ 
      error: 'Failed to create property',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const propertyVersion = await PropertyVersion.findByPk(req.params.id, {
      include: [
        { model: Address, as: 'address' },
        { model: PropertyDetails, as: 'propertyDetails' },
      ],
    });

    if (!propertyVersion) {
      res.status(404).json({ 
        error: 'Property not found',
        id: req.params.id
      });
      return;
    }

    const {
      mlsNumber,
      squareFootage,
      bedrooms,
      bathrooms,
      foundationAccess,
      additionalUnits,
      source,
    } = req.body;

    // PATTERN: Use 'as any' cast to access Sequelize associations (similar to relationshipRouter.ts)
    const propertyVersionWithAssociations = propertyVersion as any;
    const propertyDetails = Array.isArray(propertyVersionWithAssociations.propertyDetails) 
      ? propertyVersionWithAssociations.propertyDetails[0] 
      : propertyVersionWithAssociations.propertyDetails;

    if (propertyDetails) {
      await propertyDetails.update({
        mlsNumber: mlsNumber !== undefined ? mlsNumber : propertyDetails.mlsNumber,
        squareFootage: squareFootage !== undefined ? squareFootage : propertyDetails.squareFootage,
        bedrooms: bedrooms !== undefined ? bedrooms : propertyDetails.bedrooms,
        bathrooms: bathrooms !== undefined ? bathrooms : propertyDetails.bathrooms,
        foundationAccess: foundationAccess !== undefined ? foundationAccess : propertyDetails.foundationAccess,
        additionalUnits: additionalUnits !== undefined ? additionalUnits : propertyDetails.additionalUnits,
        source: source !== undefined ? source : propertyDetails.source,
      });
    }

    await propertyVersion.reload({
      include: [
        { model: Address, as: 'address' },
        { model: PropertyDetails, as: 'propertyDetails' },
      ],
    });

    const property = transformPropertyVersion(propertyVersion);
    res.json(property);
  } catch (error) {
    console.error('[PropertyRouter] Error updating property:', error);
    res.status(500).json({ 
      error: 'Failed to update property',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const propertyVersion = await PropertyVersion.findByPk(req.params.id, {
      include: [
        { model: Address, as: 'address' },
        { model: PropertyDetails, as: 'propertyDetails' },
      ],
    });

    if (!propertyVersion) {
      res.status(404).json({ 
        error: 'Property not found',
        id: req.params.id
      });
      return;
    }

    // PATTERN: Use 'as any' cast to access Sequelize associations (similar to relationshipRouter.ts)
    const propertyVersionWithAssociations = propertyVersion as any;
    const propertyDetails = Array.isArray(propertyVersionWithAssociations.propertyDetails) 
      ? propertyVersionWithAssociations.propertyDetails[0] 
      : propertyVersionWithAssociations.propertyDetails;

    if (propertyDetails) {
      await propertyDetails.update(req.body);
    }

    await propertyVersion.reload({
      include: [
        { model: Address, as: 'address' },
        { model: PropertyDetails, as: 'propertyDetails' },
      ],
    });

    const property = transformPropertyVersion(propertyVersion);
    res.json(property);
  } catch (error) {
    console.error('[PropertyRouter] Error patching property:', error);
    res.status(500).json({ 
      error: 'Failed to patch property',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const propertyVersion = await PropertyVersion.findByPk(req.params.id);
    
    if (!propertyVersion) {
      res.status(404).json({ 
        error: 'Property not found',
        id: req.params.id
      });
      return;
    }

    await propertyVersion.destroy();
    
    res.status(204).send();
  } catch (error) {
    console.error('[PropertyRouter] Error deleting property:', error);
    res.status(500).json({ 
      error: 'Failed to delete property',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * ============================================================================
 * PROPERTY VERSION TYPES ENDPOINTS
 * ============================================================================
 * 
 * LEARNING: Property types are stored in property_version_types junction table
 * WHY: Properties can have multiple types (e.g., Single-Family with ADU)
 * PATTERN: Similar to instance_components relationship pattern
 */

router.get('/:id/types', async (req: Request, res: Response): Promise<void> => {
  try {
    const propertyVersionId = req.params.id;
    
    const propertyTypes = await PropertyVersionType.findAll({
      where: { propertyVersionId },
      include: [
        { model: BlockInstance, as: 'blockInstance' },
      ],
      order: [['orderIndex', 'ASC']],
    });
    
    res.json(propertyTypes);
  } catch (error) {
    console.error('[PropertyRouter] Error fetching property types:', error);
    res.status(500).json({ 
      error: 'Failed to fetch property types',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /properties/:id/types
 * Add a property type to a property version
 * 
 * Request body:
 * - blockInstanceId: UUID of the block_instance (must be "Properties" block_shape)
 * - orderIndex (optional): Order position
 * 
 * LEARNING: Application-level validation complements database trigger
 * WHY: Better error messages and prevents bad data from being attempted
 * PATTERN: Validate block_shape is "Properties" before attempting insert
 */
router.post('/:id/types', async (req: Request, res: Response): Promise<void> => {
  try {
    const propertyVersionId = req.params.id;
    const { blockInstanceId, orderIndex = 0 } = req.body;
    
    // Validate required fields
    if (!blockInstanceId) {
      res.status(400).json({
        error: 'Missing required field: blockInstanceId',
      });
      return;
    }
    
    const propertyVersion = await PropertyVersion.findByPk(propertyVersionId);
    if (!propertyVersion) {
      res.status(404).json({
        error: 'Property version not found',
        propertyVersionId,
      });
      return;
    }
    
    const blockInstance = await BlockInstance.findByPk(blockInstanceId, {
      include: [{ model: BlockShape, as: 'block_shape' }],
    });
    
    if (!blockInstance) {
      res.status(404).json({
        error: 'Block instance not found',
        blockInstanceId,
      });
      return;
    }
    
    const blockInstanceWithShape = blockInstance as any;
    const blockShape = blockInstanceWithShape.block_shape;
    
    if (!blockShape || blockShape.name !== 'Properties') {
      res.status(400).json({
        error: 'Block instance must have "Properties" block_shape',
        blockInstanceId,
        actualBlockShape: blockShape?.name || 'NULL',
      });
      return;
    }
    
    const propertyType = await PropertyVersionType.create({
      propertyVersionId,
      blockInstanceId,
      orderIndex,
    });
    
    const completePropertyType = await PropertyVersionType.findByPk(propertyType.id, {
      include: [{ model: BlockInstance, as: 'blockInstance' }],
    });
    
    res.status(201).json(completePropertyType);
  } catch (error) {
    if (error instanceof Error && error.message.includes('block_instance_id must reference')) {
      res.status(400).json({
        error: 'Block instance must have "Properties" block_shape',
        details: error.message,
      });
      return;
    }
    
    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('duplicate key')) {
      res.status(409).json({
        error: 'Property type already assigned to this property version',
      });
      return;
    }
    
    console.error('[PropertyRouter] Error adding property type:', error);
    res.status(500).json({ 
      error: 'Failed to add property type',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.patch('/:id/types/:typeId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { typeId } = req.params;
    const { orderIndex } = req.body;
    
    const propertyType = await PropertyVersionType.findByPk(typeId);
    
    if (!propertyType) {
      res.status(404).json({
        error: 'Property type not found',
        typeId,
      });
      return;
    }
    
    if (orderIndex !== undefined) {
      await propertyType.update({ orderIndex });
    }
    
    const completePropertyType = await PropertyVersionType.findByPk(propertyType.id, {
      include: [{ model: BlockInstance, as: 'blockInstance' }],
    });
    
    res.json(completePropertyType);
  } catch (error) {
    console.error('[PropertyRouter] Error updating property type:', error);
    res.status(500).json({ 
      error: 'Failed to update property type',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.delete('/:id/types/:typeId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { typeId } = req.params;
    
    const propertyType = await PropertyVersionType.findByPk(typeId);
    
    if (!propertyType) {
      res.status(404).json({
        error: 'Property type not found',
        typeId,
      });
      return;
    }
    
    await propertyType.destroy();
    
    res.status(204).send();
  } catch (error) {
    console.error('[PropertyRouter] Error removing property type:', error);
    res.status(500).json({ 
      error: 'Failed to remove property type',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /properties/:id/types
 * Replace all property types for a property version
 * 
 * Request body:
 * - blockInstanceIds: Array of block_instance UUIDs
 * 
 * LEARNING: Bulk replacement for property types
 * WHY: Booking wizard typically selects all property types at once
 * PATTERN: Delete all existing, then create new ones in transaction
 */
router.put('/:id/types', async (req: Request, res: Response): Promise<void> => {
  try {
    const propertyVersionId = req.params.id;
    const { blockInstanceIds = [] } = req.body;
    
    const propertyVersion = await PropertyVersion.findByPk(propertyVersionId);
    if (!propertyVersion) {
      res.status(404).json({
        error: 'Property version not found',
        propertyVersionId,
      });
      return;
    }
    
    // Validate all blockInstanceIds have "Properties" block_shape
    if (blockInstanceIds.length > 0) {
      const blockInstances = await BlockInstance.findAll({
        where: { id: { [Op.in]: blockInstanceIds } },
        include: [{ model: BlockShape, as: 'block_shape' }],
      });
      
      const invalidInstances = blockInstances.filter((bi: any) => 
        !bi.block_shape || bi.block_shape.name !== 'Properties'
      );
      
      if (invalidInstances.length > 0) {
        res.status(400).json({
          error: 'All block instances must have "Properties" block_shape',
          invalidBlockInstanceIds: invalidInstances.map((bi: any) => bi.id),
        });
        return;
      }
      
      const foundIds = blockInstances.map((bi: any) => bi.id);
      const missingIds = blockInstanceIds.filter((id: string) => !foundIds.includes(id));
      
      if (missingIds.length > 0) {
        res.status(404).json({
          error: 'Some block instances not found',
          missingBlockInstanceIds: missingIds,
        });
        return;
      }
    }
    
    await PropertyVersion.sequelize!.transaction(async (transaction) => {
      await PropertyVersionType.destroy({
        where: { propertyVersionId },
        transaction,
      });
      
      if (blockInstanceIds.length > 0) {
        await PropertyVersionType.bulkCreate(
          blockInstanceIds.map((blockInstanceId: string, index: number) => ({
            propertyVersionId,
            blockInstanceId,
            orderIndex: index,
          })),
          { transaction }
        );
      }
    });
    
    const propertyTypes = await PropertyVersionType.findAll({
      where: { propertyVersionId },
      include: [{ model: BlockInstance, as: 'blockInstance' }],
      order: [['orderIndex', 'ASC']],
    });
    
    res.json(propertyTypes);
  } catch (error) {
    console.error('[PropertyRouter] Error replacing property types:', error);
    res.status(500).json({ 
      error: 'Failed to replace property types',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as PropertyRouter };
