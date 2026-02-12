/**
 * relationshipHelpers unit tests
 *
 * Covers: Pure mappers (annotation, attendee, default), mapRelationshipFields dispatcher,
 * validateBlockShapesComposable. These run with the shared test DB (setupTestDb).
 * Async helpers (mapEventAssignmentsFields, hasCircularReference, restoreComponentActiveState,
 * getComponentChildIds) are covered by relationship router integration tests.
 */

import { describe, it, expect } from '@jest/globals'
import {
  mapAnnotationAssignmentsFields,
  mapAttendeeAssignmentsFields,
  mapRelationshipFields,
  validateBlockShapesComposable,
} from '../relationshipHelpers.js'

describe('relationshipHelpers', () => {
  describe('mapAnnotationAssignmentsFields', () => {
    it('returns blockInstanceId and annotationId from parentId and childId', () => {
      expect(mapAnnotationAssignmentsFields('p1', 'c1')).toEqual({
        blockInstanceId: 'p1',
        annotationId: 'c1',
      })
    })
  })

  describe('mapAttendeeAssignmentsFields', () => {
    it('returns eventShapeId and userTypeBlockInstanceId from parentId and childId', () => {
      expect(mapAttendeeAssignmentsFields('event-1', 'block-1')).toEqual({
        eventShapeId: 'event-1',
        userTypeBlockInstanceId: 'block-1',
      })
    })
  })

  describe('mapRelationshipFields', () => {
    it('returns parentId and childId for default/instanceComponents kind', async () => {
      const out = await mapRelationshipFields('instanceComponents', 'p1', 'c1')
      expect(out).toEqual({ parentId: 'p1', childId: 'c1' })
    })

    it('delegates annotationAssignments to mapAnnotationAssignmentsFields', async () => {
      const out = await mapRelationshipFields('annotationAssignments', 'p1', 'c1')
      expect(out).toEqual({ blockInstanceId: 'p1', annotationId: 'c1' })
    })

    it('delegates attendeeAssignments to mapAttendeeAssignmentsFields', async () => {
      const out = await mapRelationshipFields('attendeeAssignments', 'e1', 'b1')
      expect(out).toEqual({ eventShapeId: 'e1', userTypeBlockInstanceId: 'b1' })
    })
  })

  describe('validateBlockShapesComposable', () => {
    it('throws if parent block shape is not composable', () => {
      expect(() =>
        validateBlockShapesComposable(
          { id: 's1', name: 'Parent', composable: false },
          { id: 's1', name: 'Child', composable: true }
        )
      ).toThrow(/not composable/)
    })

    it('throws if child block shape is not composable', () => {
      expect(() =>
        validateBlockShapesComposable(
          { id: 's1', name: 'Parent', composable: true },
          { id: 's1', name: 'Child', composable: false }
        )
      ).toThrow(/not composable/)
    })

    it('throws if parent and child have different block shapes', () => {
      expect(() =>
        validateBlockShapesComposable(
          { id: 's1', name: 'Parent', composable: true },
          { id: 's2', name: 'Child', composable: true }
        )
      ).toThrow(/same BlockShape/)
    })

    it('does not throw when both composable and same shape', () => {
      expect(() =>
        validateBlockShapesComposable(
          { id: 's1', name: 'Parent', composable: true },
          { id: 's1', name: 'Child', composable: true }
        )
      ).not.toThrow()
    })
  })

})
