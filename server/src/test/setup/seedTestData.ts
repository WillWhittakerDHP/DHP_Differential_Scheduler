/**
 * SEED TEST DATA
 * 
 * Utilities for seeding test data into the test database.
 * Provides realistic test fixtures for integration tests.
 */

import type { Model } from 'sequelize'
import { getTestDb } from './testDb.js'

/** Get string id from a Sequelize model instance; throws if missing or not a string. */
function getModelId(model: Model): string {
  const id = model.get('id')
  if (typeof id !== 'string') {
    throw new Error('Expected model to have string id')
  }
  return id
}

export async function seedBasicTestData() {
  const sequelize = getTestDb()
  
  const { BlockShape, PartShape, BlockInstance, PartInstance, Relationship } = sequelize.models
  
  const blockShape1 = await BlockShape.create({
    id: 'block-shape-1',
    name: 'Standard Inspection',
    description: 'Standard home inspection service',
    disabled: false,
    orderIndex: 1,
  })
  
  const blockShape2 = await BlockShape.create({
    id: 'block-shape-2',
    name: 'Additional Service',
    description: 'Additional service option',
    disabled: false,
    orderIndex: 2,
  })
  
  const partShape1 = await PartShape.create({
    id: 'part-shape-1',
    name: 'Interior Inspection',
    description: 'Interior inspection component',
    disabled: false,
    orderIndex: 1,
  })
  
  const partShape2 = await PartShape.create({
    id: 'part-shape-2',
    name: 'Exterior Inspection',
    description: 'Exterior inspection component',
    disabled: false,
    orderIndex: 2,
  })
  
  const blockInstance1 = await BlockInstance.create({
    id: 'block-1',
    name: 'Standard Inspection',
    blockShapeRef: getModelId(blockShape1),
    disabled: false,
    orderIndex: 1,
    baseSqFt: 2000,
  })
  
  const partInstance1 = await PartInstance.create({
    id: 'part-1',
    name: 'Interior Check',
    partShapeRef: getModelId(partShape1),
    disabled: false,
    orderIndex: 1,
    baseTime: 60,
    baseFee: 100,
    onSite: true,
    clientPresent: true,
  })
  
  const partInstance2 = await PartInstance.create({
    id: 'part-2',
    name: 'Exterior Check',
    partShapeRef: getModelId(partShape2),
    disabled: false,
    orderIndex: 2,
    baseTime: 45,
    baseFee: 75,
    onSite: true,
    clientPresent: false,
  })
  
  await Relationship.create({
    relationshipKind: 'partAssignments',
    parentId: getModelId(blockInstance1),
    parentEntityKey: 'blockInstance',
    childId: getModelId(partInstance1),
    childEntityKey: 'partInstance',
  })
  
  await Relationship.create({
    relationshipKind: 'partAssignments',
    parentId: getModelId(blockInstance1),
    parentEntityKey: 'blockInstance',
    childId: getModelId(partInstance2),
    childEntityKey: 'partInstance',
  })
  
  return {
    blockShapes: [blockShape1, blockShape2],
    partShapes: [partShape1, partShape2],
    blockInstances: [blockInstance1],
    partInstances: [partInstance1, partInstance2],
  }
}

export async function seedUserTestData() {
  const sequelize = getTestDb()
  const { User } = sequelize.models
  
  const user1 = await User.create({
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
  })
  
  const user2 = await User.create({
    id: 'user-2',
    email: 'admin@example.com',
    name: 'Admin User',
  })
  
  return { users: [user1, user2] }
}

export async function seedAppointmentTestData() {
  const sequelize = getTestDb()
  const { Appointment, PropertyVersion } = sequelize.models
  
  const propertyVersions = await PropertyVersion.findAll({ limit: 1 })
  const propertyVersionId = propertyVersions.length > 0 ? getModelId(propertyVersions[0]) : null
  
  if (!propertyVersionId) {
    console.warn('⚠️  No property versions found. Skipping appointment seeding.')
    return { appointments: [] }
  }
  
  const appointment1 = await Appointment.create({
    id: 'appointment-1',
    propertyVersionId, // Use PropertyVersion ID (new structure)
    userTypeId: null,
    selectedServiceIds: null,
    selectedPropertyIds: null,
    selectedOptionIds: null,
    selectedDate: new Date('2026-01-15'),
    selectedDateRangeEnd: null,
    selectedTimeSlots: [{ startTime: '2026-01-15T15:00:00.000Z', endTime: '2026-01-15T17:00:00.000Z', duration: 120 }],
    isQuoteMode: false,
    quotePdfUrl: null,
    status: 'draft',
    clientId: null,
    agentId: null,
    additionalContacts: null,
    propertyDetails: null,
  })
  
  return { appointments: [appointment1] }
}

export async function seedAllTestData() {
  const basic = await seedBasicTestData()
  const users = await seedUserTestData()
  const appointments = await seedAppointmentTestData()
  
  return {
    ...basic,
    ...users,
    ...appointments,
  }
}

