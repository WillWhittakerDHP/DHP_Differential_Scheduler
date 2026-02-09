/**
 * Property CRUD Router
 * 
 * LEARNING: Extracted CRUD operations for properties
 * WHY: Separates CRUD operations from property types operations, improves maintainability
 * PATTERN: Express router with RESTful endpoints
 */

import { Router, Request, Response } from 'express'
import { PropertyVersion, PropertyDetails, Address } from '../../../config/app.js'
import { transformPropertyVersion } from '../../../utils/propertyTransformers.js'
import { ERROR_MESSAGES, DEFAULT_VALUES, REQUIRED_FIELDS } from './propertyConstants.js'
import { handleRouteError } from './propertyErrorHandler.js'
import { validateAddressFields } from './propertyValidators.js'
import { findOrCreateAddress, getPropertyWithAssociations, getPropertyDetailsFromVersion } from './propertyHelpers.js'

const router = Router()

/**
 * GET /properties
 * List all properties
 * 
 * LEARNING: Fetches all property versions with associations
 * WHY: Provides complete property data including address and details
 * PATTERN: Sequelize findAll with includes, transform to API format
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const propertyVersions = await PropertyVersion.findAll({
      include: [
        { model: Address, as: 'address' },
        { model: PropertyDetails, as: 'propertyDetails' },
      ],
    })

    const properties = propertyVersions.map(transformPropertyVersion)
    res.json(properties)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.FETCH_PROPERTIES, 'fetching properties')
  }
})

/**
 * GET /properties/:id
 * Get single property by ID
 * 
 * LEARNING: Fetches single property version with associations
 * WHY: Provides complete property data for a specific property
 * PATTERN: Sequelize findByPk with includes, transform to API format
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const propertyVersion = await getPropertyWithAssociations(req.params.id)
    
    if (!propertyVersion) {
      res.status(404).json({ 
        error: ERROR_MESSAGES.PROPERTY_NOT_FOUND,
        id: req.params.id
      })
      return
    }
    
    const property = transformPropertyVersion(propertyVersion)
    res.json(property)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.FETCH_PROPERTY, 'fetching property')
  }
})

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
      source = DEFAULT_VALUES.SOURCE,
    } = req.body

    // Validate required address fields
    const addressValidation = validateAddressFields({ address, city, state, zipCode })
    if (!addressValidation.valid) {
      res.status(400).json({
        error: addressValidation.error,
        required: REQUIRED_FIELDS.ADDRESS,
      })
      return
    }

    const result = await PropertyVersion.sequelize!.transaction(async (transaction) => {
      const addressRecord = await findOrCreateAddress({
        address,
        unit,
        city,
        state,
        zipCode,
        placeId,
        latitude,
        longitude,
      })

      const propertyVersion = await PropertyVersion.create({
        addressId: addressRecord.id,
      }, { transaction })

      const propertyDetails = await PropertyDetails.create({
        propertyVersionId: propertyVersion.id,
        source: source as 'api' | 'manual' | 'client',
        mlsNumber: mlsNumber || null,
        squareFootage: squareFootage || null,
        bedrooms: bedrooms || null,
        bathrooms: bathrooms || null,
        foundationAccess: foundationAccess || null,
        additionalUnits: additionalUnits || null,
      }, { transaction })

      const completePropertyVersion = await getPropertyWithAssociations(propertyVersion.id, transaction)

      return completePropertyVersion!
    })

    const property = transformPropertyVersion(result)
    res.status(201).json(property)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.CREATE_PROPERTY, 'creating property')
  }
})

/**
 * PUT /properties/:id
 * Update a property (full update)
 * 
 * LEARNING: Updates property details with full replacement
 * WHY: Allows complete property update in single request
 * PATTERN: Load property, update propertyDetails, reload with associations
 */
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const propertyVersion = await getPropertyWithAssociations(req.params.id)

    if (!propertyVersion) {
      res.status(404).json({ 
        error: ERROR_MESSAGES.PROPERTY_NOT_FOUND,
        id: req.params.id
      })
      return
    }

    const {
      mlsNumber,
      squareFootage,
      bedrooms,
      bathrooms,
      foundationAccess,
      additionalUnits,
      source,
    } = req.body

    const propertyDetails = getPropertyDetailsFromVersion(propertyVersion)

    if (propertyDetails) {
      await propertyDetails.update({
        mlsNumber: mlsNumber !== undefined ? mlsNumber : propertyDetails.mlsNumber,
        squareFootage: squareFootage !== undefined ? squareFootage : propertyDetails.squareFootage,
        bedrooms: bedrooms !== undefined ? bedrooms : propertyDetails.bedrooms,
        bathrooms: bathrooms !== undefined ? bathrooms : propertyDetails.bathrooms,
        foundationAccess: foundationAccess !== undefined ? foundationAccess : propertyDetails.foundationAccess,
        additionalUnits: additionalUnits !== undefined ? additionalUnits : propertyDetails.additionalUnits,
        source: source !== undefined ? source : propertyDetails.source,
      })
    }

    await propertyVersion.reload({
      include: [
        { model: Address, as: 'address' },
        { model: PropertyDetails, as: 'propertyDetails' },
      ],
    })

    const property = transformPropertyVersion(propertyVersion)
    res.json(property)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.UPDATE_PROPERTY, 'updating property')
  }
})

/**
 * PATCH /properties/:id
 * Partial update a property
 * 
 * LEARNING: Updates property details with partial data
 * WHY: Allows selective property update without full replacement
 * PATTERN: Load property, update propertyDetails with partial data, reload with associations
 */
router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const propertyVersion = await getPropertyWithAssociations(req.params.id)

    if (!propertyVersion) {
      res.status(404).json({ 
        error: ERROR_MESSAGES.PROPERTY_NOT_FOUND,
        id: req.params.id
      })
      return
    }

    const propertyDetails = getPropertyDetailsFromVersion(propertyVersion)

    if (propertyDetails) {
      await propertyDetails.update(req.body)
    }

    await propertyVersion.reload({
      include: [
        { model: Address, as: 'address' },
        { model: PropertyDetails, as: 'propertyDetails' },
      ],
    })

    const property = transformPropertyVersion(propertyVersion)
    res.json(property)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.PATCH_PROPERTY, 'patching property')
  }
})

/**
 * DELETE /properties/:id
 * Delete a property
 * 
 * LEARNING: Deletes property version (cascades to property details)
 * WHY: Removes property from system
 * PATTERN: Find by ID, destroy if found, return 204 on success
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const propertyVersion = await PropertyVersion.findByPk(req.params.id)
    
    if (!propertyVersion) {
      res.status(404).json({ 
        error: ERROR_MESSAGES.PROPERTY_NOT_FOUND,
        id: req.params.id
      })
      return
    }

    await propertyVersion.destroy()
    
    res.status(204).send()
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.DELETE_PROPERTY, 'deleting property')
  }
})

export { router as PropertyCrudRouter }
