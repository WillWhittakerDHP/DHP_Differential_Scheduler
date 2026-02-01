/**
 * SEED TEST DATA
 * 
 * Utilities for seeding test data into the test database.
 * Provides realistic test fixtures for integration tests.
 */

import { getTestDb } from './testDb.js'

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
  
  // PATTERN: Use 'as any' cast to access model properties in test setup
  const blockInstance1 = await BlockInstance.create({
    id: 'block-1',
    name: 'Standard Inspection',
    blockShapeRef: (blockShape1 as any).id,
    disabled: false,
    orderIndex: 1,
    baseSqFt: 2000,
  })
  
  // PATTERN: Use 'as any' cast to access model properties in test setup
  const partInstance1 = await PartInstance.create({
    id: 'part-1',
    name: 'Interior Check',
    partShapeRef: (partShape1 as any).id,
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
    partShapeRef: (partShape2 as any).id,
    disabled: false,
    orderIndex: 2,
    baseTime: 45,
    baseFee: 75,
    onSite: true,
    clientPresent: false,
  })
  
  // PATTERN: Use 'as any' cast to access model properties in test setup
  await Relationship.create({
    relationshipKind: 'partAssignments',
    parentId: (blockInstance1 as any).id,
    parentEntityKey: 'blockInstance',
    childId: (partInstance1 as any).id,
    childEntityKey: 'partInstance',
  })
  
  await Relationship.create({
    relationshipKind: 'partAssignments',
    parentId: (blockInstance1 as any).id,
    parentEntityKey: 'blockInstance',
    childId: (partInstance2 as any).id,
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
  
  // PATTERN: Use 'as any' cast to access model properties in test setup
  const propertyVersions = await PropertyVersion.findAll({ limit: 1 })
  const propertyVersionId = propertyVersions.length > 0 ? (propertyVersions[0] as any).id : null
  
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
    selectedTimeSlots: [{ time: '10:00', duration: 120 }],
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

