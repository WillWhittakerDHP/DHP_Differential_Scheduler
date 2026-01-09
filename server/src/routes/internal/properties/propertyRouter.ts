import { Router, Request, Response } from 'express';
import { Address, PropertyVersion, PropertyDetails, PropertyVersionType, BlockInstance, BlockShape } from '../../../config/app.js';
import { Op } from 'sequelize';

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
  });
}

/**
 * Helper function to transform PropertyVersion with relationships to flat property object
 * LEARNING: Combines Address, PropertyVersion, and PropertyDetails into single response
 * WHY: Maintains backward compatibility with existing API consumers
 */
function transformPropertyVersion(propertyVersion: any) {
  const address = propertyVersion.address;
  const propertyDetails = propertyVersion.propertyDetails?.[0] || propertyVersion.propertyDetails; // Handle array or single object

  return {
    id: propertyVersion.id,
    propertyVersionId: propertyVersion.id,
    addressId: propertyVersion.addressId,
    // Address fields
    address: address?.address,
    unit: address?.unit,
    city: address?.city,
    state: address?.state,
    zipCode: address?.zipCode,
    // Property details fields
    mlsNumber: propertyDetails?.mlsNumber,
    squareFootage: propertyDetails?.squareFootage,
    bedrooms: propertyDetails?.bedrooms,
    bathrooms: propertyDetails?.bathrooms,
    foundationAccess: propertyDetails?.foundationAccess,
    additionalUnits: propertyDetails?.additionalUnits,
    source: propertyDetails?.source,
    // Timestamps
    createdAt: propertyVersion.createdAt,
    updatedAt: propertyVersion.updatedAt,
  };
}

/**
 * GET /properties
 * Get all properties (PropertyVersions with Address and PropertyDetails)
 */
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

/**
 * GET /properties/:id
 * Get a property by PropertyVersion ID
 */
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

    // Use transaction for atomic operation
    const result = await PropertyVersion.sequelize!.transaction(async (transaction) => {
      // Step 1: Find or create Address
      const addressRecord = await findOrCreateAddress({
        address,
        unit,
        city,
        state,
        zipCode,
      });

      // Step 2: Create PropertyVersion
      const propertyVersion = await PropertyVersion.create({
        addressId: addressRecord.id,
      }, { transaction });

      // Step 3: Create PropertyDetails
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

      // Step 4: Fetch complete property with relationships
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

/**
 * PUT /properties/:id
 * Update a property by PropertyVersion ID
 * Updates PropertyDetails (address changes would require new PropertyVersion)
 */
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

    // Update PropertyDetails (get first/latest details record)
    // LEARNING: Sequelize associations are dynamically added, TypeScript doesn't know about them
    // WHY: Need type assertion to access association property
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

    // Refresh property with relationships
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

/**
 * PATCH /properties/:id
 * Partially update a property by PropertyVersion ID
 */
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

    // Update PropertyDetails with partial data
    // LEARNING: Sequelize associations are dynamically added, TypeScript doesn't know about them
    // WHY: Need type assertion to access association property
    // PATTERN: Use 'as any' cast to access Sequelize associations (similar to relationshipRouter.ts)
    const propertyVersionWithAssociations = propertyVersion as any;
    const propertyDetails = Array.isArray(propertyVersionWithAssociations.propertyDetails) 
      ? propertyVersionWithAssociations.propertyDetails[0] 
      : propertyVersionWithAssociations.propertyDetails;

    if (propertyDetails) {
      await propertyDetails.update(req.body);
    }

    // Refresh property with relationships
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

/**
 * DELETE /properties/:id
 * Delete a property by PropertyVersion ID
 * LEARNING: Cascades to PropertyDetails, but Address remains (may be reused)
 * WHY: Preserves address data for potential reuse, only removes versioned details
 */
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

    // Delete PropertyVersion (cascades to PropertyDetails)
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

/**
 * GET /properties/:id/types
 * Get all property types for a property version
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
    
    // Verify property version exists
    const propertyVersion = await PropertyVersion.findByPk(propertyVersionId);
    if (!propertyVersion) {
      res.status(404).json({
        error: 'Property version not found',
        propertyVersionId,
      });
      return;
    }
    
    // Application-level validation: Verify blockInstance has "Properties" block_shape
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
    
    // Create property version type
    const propertyType = await PropertyVersionType.create({
      propertyVersionId,
      blockInstanceId,
      orderIndex,
    });
    
    // Fetch with associations
    const completePropertyType = await PropertyVersionType.findByPk(propertyType.id, {
      include: [{ model: BlockInstance, as: 'blockInstance' }],
    });
    
    res.status(201).json(completePropertyType);
  } catch (error) {
    // Check for trigger error
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

/**
 * PATCH /properties/:id/types/:typeId
 * Update a property type (e.g., change order_index)
 */
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
    
    // Fetch with associations
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

/**
 * DELETE /properties/:id/types/:typeId
 * Remove a property type from a property version
 */
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
    
    // Verify property version exists
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
    
    // Transaction: Delete existing, create new
    await PropertyVersion.sequelize!.transaction(async (transaction) => {
      // Delete existing property types
      await PropertyVersionType.destroy({
        where: { propertyVersionId },
        transaction,
      });
      
      // Create new property types
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
    
    // Fetch and return updated property types
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
