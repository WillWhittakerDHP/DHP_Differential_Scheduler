/**
 * API ENDPOINT BUILDER TESTS
 * 
 * Unit tests for API endpoint builder functions.
 * Tests that endpoint builders construct correct URL paths.
 * Phase 7: Edge Case Tests
 * 
 * WHAT: Tests all endpoint builder functions return correct URL paths
 * HOW: Calls each function with various inputs and verifies output
 * WHY: Ensures type-safe endpoint construction works correctly
 * DEPENDENCIES: api.ts endpoint builder functions
 */

import { describe, it, expect } from 'vitest'
import {
  getEntityEndpoint,
  getEntityByIdEndpoint,
  getRelationshipEndpoint,
  getRelationshipByIdEndpoint,
  getRelationshipByParentChildEndpoint,
  getOrderIndexEndpoint,
  getAnnotationEndpoint,
  getAnnotationByIdEndpoint,
  getBlockInstanceAnnotationsEndpoint,
  getBlockInstanceAnnotationEndpoint,
  getAnnotationAssignmentsEndpoint,
  getAnnotationShapeEndpoint,
  getAnnotationShapeByIdEndpoint,
  getAvailabilityEndpoint,
  getAppointmentEndpoint,
  getAppointmentByIdEndpoint,
  getPropertyEndpoint,
  getPropertyByIdEndpoint,
  getUserEndpoint,
  getUserByIdEndpoint,
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

    it('should build relationship by ID endpoint', () => {
      expect(getRelationshipByIdEndpoint('annotationAssignments', 'rel-123')).toBe('/relationships/annotationAssignments/rel-123')
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
  })

  describe('Order index endpoint', () => {
    it('should build order index endpoint', () => {
      expect(getOrderIndexEndpoint('block-instance')).toBe('/entities/block-instance/order_index')
    })

    it('should handle different entity keys', () => {
      expect(getOrderIndexEndpoint('part-instance')).toBe('/entities/part-instance/order_index')
    })
  })

  describe('Annotation endpoints', () => {
    it('should build annotation endpoint', () => {
      expect(getAnnotationEndpoint('annotationInstance')).toBe('/annotations/annotationInstance')
    })

    it('should build annotation by ID endpoint', () => {
      expect(getAnnotationByIdEndpoint('ann-123')).toBe('/annotations/annotationInstance/ann-123')
    })

    it('should build block instance annotations endpoint', () => {
      expect(getBlockInstanceAnnotationsEndpoint('block-123')).toBe('/annotations/annotationInstance/block-instance/block-123')
    })

    it('should build block instance annotation endpoint', () => {
      expect(getBlockInstanceAnnotationEndpoint('block-123', 'ann-456')).toBe(
        '/annotations/annotationInstance/block-instance/block-123/ann-456'
      )
    })

    it('should build annotation assignments endpoint', () => {
      expect(getAnnotationAssignmentsEndpoint()).toBe('/annotations/annotationInstance/annotation-assignments')
    })
  })

  describe('Annotation shape endpoints', () => {
    it('should build annotation shape endpoint', () => {
      expect(getAnnotationShapeEndpoint()).toBe('/annotations/annotationShape')
    })

    it('should build annotation shape by ID endpoint', () => {
      expect(getAnnotationShapeByIdEndpoint('shape-123')).toBe('/annotations/annotationShape/shape-123')
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
      expect(getEntityByIdEndpoint('block-instance', idWithSpaces)).toBe(`/entities/block-instance/${idWithSpaces}`)
    })

    it('should handle unicode characters in IDs', () => {
      const unicodeId = 'id-形状-123'
      expect(getEntityByIdEndpoint('block-instance', unicodeId)).toBe(`/entities/block-instance/${unicodeId}`)
    })
  })
})

