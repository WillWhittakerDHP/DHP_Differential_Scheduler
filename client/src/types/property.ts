import { USER_ROLE_CLIENT } from '@/constants/attendeeRoles'
import type { PropertyAddressBase, PropertyDetailsBase } from '@shared/types/propertyTypes'

/**
 * WHY: TypeScript interfaces for property API data with three-table structure
W...
 */
export interface PropertyRequest extends PropertyAddressBase {
  placeId?: string | null
  latitude?: number | null
  longitude?: number | null
  mlsNumber?: string | null
  squareFootage?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  foundationAccess?: 'basement' | 'crawlspace' | 'slab' | null
  additionalUnits?: number | null
  source?: 'api' | 'manual' | typeof USER_ROLE_CLIENT // Defaults to USER_ROLE_CLIENT if not provided
}

export interface PropertyResponse extends PropertyAddressBase, PropertyDetailsBase {
  id: string // PropertyVersion ID (for backward compatibility)
  propertyVersionId: string
  addressId: string
  placeId?: string | null
  latitude?: number | null
  longitude?: number | null
  source?: 'api' | 'manual' | typeof USER_ROLE_CLIENT
  createdAt: string
  updatedAt: string
  propertyTypes?: PropertyVersionType[]
}

/**
 * PropertyVersionType interface
 */
export interface PropertyVersionType {
  id: string;
  propertyVersionId: string;
  blockInstanceId: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  blockInstance?: {
    id: string;
    name: string;
    icon?: string;
    blockShapeRef: string;
  };
}

export interface PropertyTypesRequest {
  blockInstanceIds: string[];
}

