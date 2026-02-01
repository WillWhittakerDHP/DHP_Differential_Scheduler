
import { http, HttpResponse } from 'msw'
import { createAtomicBlockGlobalData, createCompositeBlockGlobalData } from '../factories/globalDataFactory'

const BASE_URL = 'http://localhost:3001/api/v1'

export const entityHandlers = [
  http.get(`${BASE_URL}/entities/:entityKey`, ({ params }) => {
    const { entityKey } = params
    const globalData = createAtomicBlockGlobalData()
    
    return HttpResponse.json({
      success: true,
      data: globalData.entities[entityKey as keyof typeof globalData.entities] || [],
    })
  }),
  
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
  
  http.delete(`${BASE_URL}/entities/:entityKey/:id`, ({ params }) => {
    const { id } = params
    
    return HttpResponse.json({
      success: true,
      message: `Entity ${id} deleted successfully`,
    })
  }),
]

export const relationshipHandlers = [
  http.get(`${BASE_URL}/relationships/:relationshipKey`, ({ params }) => {
    const { relationshipKey } = params
    const globalData = createCompositeBlockGlobalData()
    
    return HttpResponse.json({
      success: true,
      data: globalData.relationships[relationshipKey as keyof typeof globalData.relationships] || [],
    })
  }),
  
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
  
  http.delete(`${BASE_URL}/relationships/:relationshipKey/:parentId/:childId`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Relationship deleted successfully',
    })
  }),
]

export const appointmentHandlers = [
  http.get(`${BASE_URL}/appointments`, () => {
    return HttpResponse.json({
      success: true,
      data: [],
    })
  }),
  
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

export const availabilityHandlers = [
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

export const handlers = [
  ...entityHandlers,
  ...relationshipHandlers,
  ...appointmentHandlers,
  ...availabilityHandlers,
]

