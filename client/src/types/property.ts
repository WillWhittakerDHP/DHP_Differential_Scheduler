/**
 * WHY: Property Type Definitions

LEARNING: TypeScript interfaces for property API data with three-table structure
WHY: Ensures type safety when working with property data
PATTERN: Match server-side transformed property structure (Address + PropertyVersion + PropertyDetails)
 */
export interface PropertyRequest {
  address: string;
  unit?: string | null;
  city: string;
  state: string;
  zipCode: string;
  mlsNumber?: string | null;
  squareFootage?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  foundationAccess?: 'basement' | 'crawlspace' | 'slab' | null;
  additionalUnits?: number | null;
  source?: 'api' | 'manual' | 'client'; // Defaults to 'client' if not provided
}

/**
 * PropertyResponse interface matching transformed server response
 * LEARNING: Response structure from property API (transformed from three-table structure)
 * WHY: Type-safe property response handling, maintains backward compatibility
 * NOTE: id is PropertyVersion.id, includes propertyVersionId and addressId for reference
 */
export interface PropertyResponse {
  id: string; // PropertyVersion ID (for backward compatibility)
  propertyVersionId: string; // PropertyVersion ID
  addressId: string; // Address ID
  // Address fields
  address: string;
  unit?: string | null;
  city: string;
  state: string;
  zipCode: string;
  // Property details fields
  mlsNumber?: string | null;
  squareFootage?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  foundationAccess?: 'basement' | 'crawlspace' | 'slab' | null;
  additionalUnits?: number | null;
  source?: 'api' | 'manual' | 'client';
  // Timestamps
  createdAt: string;
  updatedAt: string;
  // Property types (junction to block_instances with "Properties" block_shape)
  propertyTypes?: PropertyVersionType[];
}

/**
 * PropertyVersionType interface
 * LEARNING: Junction table linking property_versions to block_instances (property types)
 * WHY: Properties can have multiple types (e.g., Single-Family with ADU)
 * PATTERN: Similar to instance_components relationship
 */
export interface PropertyVersionType {
  id: string;
  propertyVersionId: string;
  blockInstanceId: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  // Included block instance (when fetched with associations)
  blockInstance?: {
    id: string;
    name: string;
    icon?: string;
    blockShapeRef: string;
  };
}

/**
 * Request to update property types
 */
export interface PropertyTypesRequest {
  blockInstanceIds: string[];
}

