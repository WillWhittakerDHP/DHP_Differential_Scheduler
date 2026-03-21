import { USER_ROLE_CLIENT } from '@/constants/attendeeRoles'
import type { PropertyAddressBase, PropertyDetailsBase } from '@shared/types/propertyTypes'

export interface PropertyRequest extends PropertyAddressBase, PropertyDetailsBase {
  placeId?: string | null
  latitude?: number | null
  longitude?: number | null
  source?: 'api' | 'manual' | typeof USER_ROLE_CLIENT // Defaults to USER_ROLE_CLIENT if not provided
}

export interface PropertyResponse extends PropertyAddressBase, PropertyDetailsBase {
  id: string // PropertyVersion ID
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

