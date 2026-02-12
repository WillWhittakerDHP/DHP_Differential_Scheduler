/**
 * API endpoint builder tests
 * Covers: Current API surface from api/ domain modules (entity, relationship, appointment, availability, admin metadata, property, user).
 * Validates: Endpoint path construction for all exported getters.
 */

import { describe, it, expect } from 'vitest'
import {
  getEntityEndpoint,
  getEntityByIdEndpoint,
  getRelationshipEndpoint,
  getRelationshipByParentChildEndpoint,
  getOrderIndexEndpoint,
  getBulkPatchEndpoint,
  getEntitiesBatchEndpoint,
  getBlockInstanceAnnotationsEndpoint,
  getBlockInstanceAnnotationEndpoint,
  getRelationshipsBatchEndpoint,
  getAvailabilityEndpoint,
  getAppointmentEndpoint,
  getAppointmentByIdEndpoint,
  getAppointmentVersionsEndpoint,
  getPropertyEndpoint,
  getPropertyByIdEndpoint,
  getUserEndpoint,
  getUserByIdEndpoint,
  getAdminMetadataEndpoint,
  getAdminMetadataBatchEndpoint,
  getAdminPrimitiveMetadataEndpoint,
  getAdminRelationshipMetadataEndpoint,
} from '../api'

describe('API Endpoint Builders', () => {
  describe('Entity endpoints', () => {
    it('should build entity endpoint', () => {
      expect(getEntityEndpoint('block-instance')).toBe('/entities/block-instance')
    })

    it('should build entity by ID endpoint', () => {
      expect(getEntityByIdEndpoint('block-instance', 'id-123')).toBe('/entities/block-instance/id-123')
    })

    it('should handle special characters in entity key', () => {
      expect(getEntityEndpoint('block_instance')).toBe('/entities/block_instance')
    })

    it('should handle UUIDs in entity ID', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000'
      expect(getEntityByIdEndpoint('block-instance', uuid)).toBe(`/entities/block-instance/${uuid}`)
    })

    it('should handle empty entity key', () => {
      expect(getEntityEndpoint('')).toBe('/entities/')
    })

    it('should handle empty entity ID', () => {
      expect(getEntityByIdEndpoint('block-instance', '')).toBe('/entities/block-instance/')
    })
  })

  describe('Relationship endpoints', () => {
    it('should build relationship endpoint', () => {
      expect(getRelationshipEndpoint('annotationAssignments')).toBe('/relationships/annotationAssignments')
    })

    it('should build relationship by parent-child endpoint', () => {
      expect(getRelationshipByParentChildEndpoint('annotation-assignment', 'parent-123', 'child-456')).toBe(
        '/relationships/annotation-assignment/parent-123/child-456'
      )
    })

    it('should handle UUIDs in relationship IDs', () => {
      const parentId = '550e8400-e29b-41d4-a716-446655440000'
      const childId = '660e8400-e29b-41d4-a716-446655440001'
      expect(getRelationshipByParentChildEndpoint('annotationAssignments', parentId, childId)).toBe(
        `/relationships/annotationAssignments/${parentId}/${childId}`
      )
    })

    it('should build relationships batch endpoint', () => {
      expect(getRelationshipsBatchEndpoint()).toBe('/relationships/batch')
    })

    it('should build block instance annotations endpoint (query by blockInstanceId)', () => {
      expect(getBlockInstanceAnnotationsEndpoint('block-123')).toBe(
        '/relationships/annotationAssignments?blockInstanceId=block-123'
      )
    })

    it('should build block instance annotation endpoint (PATCH/DELETE by blockInstanceId and annotationId)', () => {
      expect(getBlockInstanceAnnotationEndpoint('block-123', 'ann-456')).toBe(
        '/relationships/annotationAssignments/block-123/ann-456'
      )
    })
  })

  describe('Order index and bulk endpoints', () => {
    it('should build order index endpoint', () => {
      expect(getOrderIndexEndpoint('block-instance')).toBe('/entities/block-instance/order_index')
    })

    it('should handle different entity keys for order index', () => {
      expect(getOrderIndexEndpoint('part-instance')).toBe('/entities/part-instance/order_index')
    })

    it('should build bulk PATCH endpoint', () => {
      expect(getBulkPatchEndpoint('block-instance')).toBe('/entities/block-instance/bulk')
    })

    it('should build entities batch endpoint', () => {
      expect(getEntitiesBatchEndpoint()).toBe('/entities/batch')
    })
  })

  describe('Availability endpoint', () => {
    it('should build availability endpoint', () => {
      expect(getAvailabilityEndpoint()).toBe('/availability')
    })
  })

  describe('Appointment endpoints', () => {
    it('should build appointment endpoint', () => {
      expect(getAppointmentEndpoint()).toBe('/appointments')
    })

    it('should build appointment by ID endpoint', () => {
      expect(getAppointmentByIdEndpoint('appt-123')).toBe('/appointments/appt-123')
    })

    it('should build appointment versions endpoint', () => {
      expect(getAppointmentVersionsEndpoint('appt-123')).toBe('/appointments/appt-123/versions')
    })
  })

  describe('Admin metadata endpoints', () => {
    it('should build admin metadata endpoint', () => {
      expect(getAdminMetadataEndpoint('blockInstance', 'inst-123')).toBe('/admin-metadata/blockInstance/inst-123')
    })

    it('should build admin metadata batch endpoint', () => {
      expect(getAdminMetadataBatchEndpoint()).toBe('/admin-metadata/batch')
    })

    it('should build admin primitive metadata endpoint (alias)', () => {
      expect(getAdminPrimitiveMetadataEndpoint('partInstance', 'part-1')).toBe('/admin-metadata/partInstance/part-1')
    })

    it('should build admin relationship metadata endpoint (alias)', () => {
      expect(getAdminRelationshipMetadataEndpoint('blockInstance', 'block-1')).toBe(
        '/admin-metadata/blockInstance/block-1'
      )
    })
  })

  describe('Property endpoints', () => {
    it('should build property endpoint', () => {
      expect(getPropertyEndpoint()).toBe('/properties')
    })

    it('should build property by ID endpoint', () => {
      expect(getPropertyByIdEndpoint('prop-123')).toBe('/properties/prop-123')
    })
  })

  describe('User endpoints', () => {
    it('should build user endpoint', () => {
      expect(getUserEndpoint()).toBe('/users')
    })

    it('should build user by ID endpoint', () => {
      expect(getUserByIdEndpoint('user-123')).toBe('/users/user-123')
    })
  })

  describe('Edge cases', () => {
    it('should handle very long IDs', () => {
      const longId = 'a'.repeat(1000)
      expect(getEntityByIdEndpoint('block-instance', longId)).toBe(`/entities/block-instance/${longId}`)
    })

    it('should handle IDs with special characters', () => {
      const specialId = 'id-123!@#$%^&*()'
      expect(getEntityByIdEndpoint('block-instance', specialId)).toBe(`/entities/block-instance/${specialId}`)
    })

    it('should handle IDs with spaces', () => {
      const idWithSpaces = 'id with spaces'
      expect(getEntityByIdEndpoint('block-instance', idWithSpaces)).toBe(
        `/entities/block-instance/${idWithSpaces}`
      )
    })

    it('should handle unicode characters in IDs', () => {
      const unicodeId = 'id-形状-123'
      expect(getEntityByIdEndpoint('block-instance', unicodeId)).toBe(`/entities/block-instance/${unicodeId}`)
    })
  })
})
