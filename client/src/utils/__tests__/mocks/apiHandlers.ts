/**
 * API MOCK HANDLERS
 * 
 * Mock Service Worker (MSW) request handlers for testing API calls.
 * Provides realistic API responses for all entity and relationship endpoints.
 */

import { http, HttpResponse } from 'msw'
import { createAtomicBlockGlobalData, createCompositeBlockGlobalData } from '../factories/globalDataFactory'

const BASE_URL = 'http://localhost:3001/api/v1'

/**
 * Mock handlers for entity endpoints
 */
export const entityHandlers = [
  // GET /entities/:entityKey
  http.get(`${BASE_URL}/entities/:entityKey`, ({ params }) => {
    const { entityKey } = params
    const globalData = createAtomicBlockGlobalData()
    
    return HttpResponse.json({
      success: true,
      data: globalData.entities[entityKey as keyof typeof globalData.entities] || [],
    })
  }),
  
  // GET /entities/:entityKey/:id
  http.get(`${BASE_URL}/entities/:entityKey/:id`, ({ params }) => {
    const { entityKey, id } = params
    const globalData = createAtomicBlockGlobalData()
    const entities = globalData.entities[entityKey as keyof typeof globalData.entities] || []
    const entity = entities.find((e: any) => e.id === id)
    
    if (!entity) {
      return HttpResponse.json(
        { success: false, error: 'Entity not found' },
        { status: 404 }
      )
    }
    
    return HttpResponse.json({
      success: true,
      data: entity,
    })
  }),
  
  // POST /entities/:entityKey
  http.post(`${BASE_URL}/entities/:entityKey`, async ({ request, params }) => {
    const { entityKey } = params
    const body = await request.json()
    
    return HttpResponse.json({
      success: true,
      data: {
        id: `${entityKey}-new-${Date.now()}`,
        entityKey,
        ...(body as object),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }, { status: 201 })
  }),
  
  // PUT /entities/:entityKey/:id
  http.put(`${BASE_URL}/entities/:entityKey/:id`, async ({ request, params }) => {
    const { id } = params
    const body = await request.json()
    
    return HttpResponse.json({
      success: true,
      data: {
        ...(body as object),
        id,
        updatedAt: new Date().toISOString(),
      },
    })
  }),
  
  // DELETE /entities/:entityKey/:id
  http.delete(`${BASE_URL}/entities/:entityKey/:id`, ({ params }) => {
    const { id } = params
    
    return HttpResponse.json({
      success: true,
      message: `Entity ${id} deleted successfully`,
    })
  }),
]

/**
 * Mock handlers for relationship endpoints
 */
export const relationshipHandlers = [
  // GET /relationships/:relationshipKey
  http.get(`${BASE_URL}/relationships/:relationshipKey`, ({ params }) => {
    const { relationshipKey } = params
    const globalData = createCompositeBlockGlobalData()
    
    return HttpResponse.json({
      success: true,
      data: globalData.relationships[relationshipKey as keyof typeof globalData.relationships] || [],
    })
  }),
  
  // POST /relationships/:relationshipKey
  http.post(`${BASE_URL}/relationships/:relationshipKey`, async ({ request, params }) => {
    const { relationshipKey } = params
    const body = await request.json()
    
    return HttpResponse.json({
      success: true,
      data: {
        relationshipKind: relationshipKey,
        ...(body as object),
        createdAt: new Date().toISOString(),
      },
    }, { status: 201 })
  }),
  
  // DELETE /relationships/:relationshipKey/:parentId/:childId
  http.delete(`${BASE_URL}/relationships/:relationshipKey/:parentId/:childId`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Relationship deleted successfully',
    })
  }),
]

/**
 * Mock handlers for appointment endpoints
 */
export const appointmentHandlers = [
  // GET /appointments
  http.get(`${BASE_URL}/appointments`, () => {
    return HttpResponse.json({
      success: true,
      data: [],
    })
  }),
  
  // GET /appointments/:id
  http.get(`${BASE_URL}/appointments/:id`, ({ params }) => {
    const { id } = params
    
    return HttpResponse.json({
      success: true,
      data: {
        id,
        userId: 'user-1',
        propertyVersionId: 'property-version-1', // Use propertyVersionId (new field)
        propertyId: 'property-1', // Keep for backward compatibility
        startTime: '2026-01-15T10:00:00Z',
        endTime: '2026-01-15T12:00:00Z',
        status: 'scheduled',
      },
    })
  }),
  
  // POST /appointments
  http.post(`${BASE_URL}/appointments`, async ({ request }) => {
    const body = await request.json()
    
    return HttpResponse.json({
      success: true,
      data: {
        id: `appointment-${Date.now()}`,
        ...(body as object),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }, { status: 201 })
  }),
]

/**
 * Mock handlers for availability endpoints
 */
export const availabilityHandlers = [
  // GET /availability
  http.get(`${BASE_URL}/availability`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        availableSlots: [],
        busyPeriods: [],
      },
    })
  }),
]

/**
 * All mock handlers combined
 */
export const handlers = [
  ...entityHandlers,
  ...relationshipHandlers,
  ...appointmentHandlers,
  ...availabilityHandlers,
]

