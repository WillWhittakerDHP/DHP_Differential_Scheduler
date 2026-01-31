/**
 * API Client Configuration
 * 
 * LEARNING: Centralized API client with axios for HTTP requests
 * WHY: Provides consistent error handling, interceptors, and base configuration
 * PATTERN: Single axios instance configured with base URL and interceptors
 * COMPARISON: React uses fetch directly, Vue uses axios for better TypeScript support
 */

import axios, { type AxiosInstance, type AxiosError } from 'axios'
import type { GlobalEntityKey } from '@/constants/entities'

/**
 * Base API URL
 * LEARNING: Environment variable for API base URL
 * WHY: Allows different URLs for dev/prod without code changes
 * PATTERN: Use import.meta.env for Vite environment variables
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1/internal'

/**
 * Create axios instance with base configuration
 * LEARNING: Axios instance provides shared configuration
 * WHY: Avoids repeating base URL and headers in every request
 * PATTERN: Create instance once, reuse throughout app
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request interceptor
 * LEARNING: Interceptors can modify requests before they're sent
 * WHY: Add auth tokens, logging, or error handling globally
 * PATTERN: Use interceptors for cross-cutting concerns
 */
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available (future enhancement)
    // const token = localStorage.getItem('authToken')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Response interceptor
 * LEARNING: Interceptors can handle responses and errors globally
 * WHY: Centralized error handling and response transformation
 * PATTERN: Use interceptors for global error handling
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized (future enhancement)
    // if (error.response?.status === 401) {
    //   // Redirect to login
    //   window.location.href = '/login'
    // }
    
    return Promise.reject(error)
  }
)

export default apiClient

/**
 * Entity API endpoints
 * LEARNING: Type-safe endpoint builders
 * WHY: Ensures correct endpoint construction and type safety
 * PATTERN: Helper functions for building endpoints
 */
export function getEntityEndpoint(entityKey: string): string {
  return `/entities/${entityKey}`
}

export function getEntityByIdEndpoint(entityKey: string, id: string): string {
  return `/entities/${entityKey}/${id}`
}

/**
 * Relationship API endpoints
 * LEARNING: Type-safe relationship endpoint builders
 * WHY: Ensures correct relationship endpoint construction
 * PATTERN: Helper functions for building relationship endpoints
 */
export function getRelationshipEndpoint(relationshipKey: string): string {
  return `/relationships/${relationshipKey}`
}

export function getRelationshipByParentChildEndpoint(
  relationshipKey: string, 
  parentId: string, 
  childId: string
): string {
  return `/relationships/${relationshipKey}/${parentId}/${childId}`
}

/**
 * Order Index API endpoint
 * LEARNING: Endpoint for bulk updating orderIndex values
 * WHY: Allows efficient bulk updates after drag-and-drop reordering
 * PATTERN: Returns endpoint path for orderIndex PATCH operations
 */
export function getOrderIndexEndpoint(entityKey: string): string {
  return `/entities/${entityKey}/order_index`
}

/**
 * Bulk PATCH API endpoint
 * LEARNING: Endpoint for bulk partial updates to multiple entities
 * WHY: Allows efficient bulk updates (1 request vs N requests)
 * PATTERN: Returns endpoint path for bulk PATCH operations
 */
export function getBulkPatchEndpoint(entityKey: string): string {
  return `/entities/${entityKey}/bulk`
}

// NOTE: Event and annotation endpoints removed - use generic entity endpoints instead
// Use getEntityEndpoint('eventShape'), getEntityEndpoint('eventInstance'), etc.
// Relationship endpoints (eventAssignments, annotationAssignments) remain in relationshipRouter

/**
 * Admin Metadata API endpoints (unified)
 * LEARNING: Single endpoint for all metadata (primitives + relationships)
 * WHY: Follows entity pattern - single endpoint/table, backend routes based on fieldKey type
 * PATTERN: Single endpoint replaces separate primitive/relationship endpoints
 */
export function getAdminMetadataEndpoint(entityType: string, entityId: string): string {
  return `/admin-metadata/${entityType}/${entityId}`
}

/**
 * Admin Metadata Batch API endpoint
 * LEARNING: Single endpoint fetches ALL metadata for admin page
 * WHY: Reduces N+4 calls to 1 call, lazy-loaded only when admin page is accessed
 * PATTERN: Batch endpoint returns structured metadata for all entity types
 */
export function getAdminMetadataBatchEndpoint(): string {
  return '/admin-metadata/batch'
}


/**
 * Admin Primitive Metadata API endpoints (deprecated - use getAdminMetadataEndpoint)
 * LEARNING: Kept for backward compatibility during migration
 * WHY: Old code may still reference these endpoints
 * NOTE: These endpoints still work (routed to unified endpoint) but should be migrated to getAdminMetadataEndpoint
 */
export function getAdminPrimitiveMetadataEndpoint(entityType: string, entityId: string): string {
  // Route to unified endpoint (backward compatibility)
  return getAdminMetadataEndpoint(entityType, entityId)
}

/**
 * Admin Relationship Metadata API endpoints (deprecated - use getAdminMetadataEndpoint)
 * LEARNING: Kept for backward compatibility during migration
 * WHY: Old code may still reference these endpoints
 * NOTE: These endpoints still work (routed to unified endpoint) but should be migrated to getAdminMetadataEndpoint
 */
export function getAdminRelationshipMetadataEndpoint(entityType: string, entityId: string): string {
  // Route to unified endpoint (backward compatibility)
  return getAdminMetadataEndpoint(entityType, entityId)
}

/**
 * Availability API endpoints
 * LEARNING: Endpoints for fetching available time slots
 * WHY: Provides type-safe endpoint construction for availability API
 * PATTERN: Helper function for availability endpoint
 */
export function getAvailabilityEndpoint(): string {
  return '/availability'
}

/**
 * Appointment API endpoints
 * LEARNING: Endpoints for appointment CRUD operations
 * WHY: Provides type-safe endpoint construction for appointment API
 * PATTERN: Helper functions for appointment endpoints
 */
export function getAppointmentEndpoint(): string {
  return '/appointments'
}

export function getAppointmentByIdEndpoint(id: string): string {
  return `/appointments/${id}`
}

export function getAppointmentVersionsEndpoint(id: string): string {
  return `/appointments/${id}/versions`
}

/**
 * Property API endpoints
 * LEARNING: Endpoints for property CRUD operations
 * WHY: Provides type-safe endpoint construction for property API
 * PATTERN: Helper functions for property endpoints
 */
export function getPropertyEndpoint(): string {
  return '/properties'
}

export function getPropertyByIdEndpoint(id: string): string {
  return `/properties/${id}`
}

/**
 * User API endpoints
 * LEARNING: Endpoints for user CRUD operations
 * WHY: Provides type-safe endpoint construction for user API
 * PATTERN: Helper functions for user endpoints
 */
export function getUserEndpoint(): string {
  return '/users'
}

export function getUserByIdEndpoint(id: string): string {
  return `/users/${id}`
}

/**
 * Block Instance Annotation Assignment endpoints
 * LEARNING: Endpoints for annotation assignment relationships (blockInstance → annotationInstance)
 * WHY: Annotation assignments are relationships, not entities
 * PATTERN: Use relationship endpoints for assignment operations
 * NOTE: GET endpoint uses query parameter for filtering (backend needs to support blockInstanceId filter)
 * DELETE/PATCH endpoints use parent/child ID pattern
 */
export function getBlockInstanceAnnotationsEndpoint(blockInstanceId: string): string {
  // LEARNING: Use query parameter for filtering - backend needs to support blockInstanceId filter
  // WHY: Relationship router currently only supports parent_id filter for instanceComponents
  // TODO: Add backend support for filtering annotationAssignments by blockInstanceId
  return `/relationships/annotationAssignments?blockInstanceId=${blockInstanceId}`
}

export function getBlockInstanceAnnotationEndpoint(blockInstanceId: string, annotationId: string): string {
  // LEARNING: DELETE endpoint uses parent/child ID pattern from relationship router
  // WHY: Matches DELETE /relationships/:relationshipType/:parentId/:childId pattern
  // PATTERN: blockInstanceId is parent, annotationId is child
  return `/relationships/annotationAssignments/${blockInstanceId}/${annotationId}`
}
