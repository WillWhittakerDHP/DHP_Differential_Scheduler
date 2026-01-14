# Cache Architecture - Data Flow Alignment

**Created:** Session 1.4.7  
**Last Updated:** 2026-01-14

---

## Overview

This document describes the cache architecture for the Differential Scheduler application. The architecture separates **configuration data** (static, rarely changing) from **business data** (frequently changing) to optimize cache invalidation and prevent unnecessary refetches.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Vue Query Cache                                  │
├─────────────────────────────────┬───────────────────────────────────────┤
│    GlobalData ['globalData']    │    BusinessData ['businessData']      │
├─────────────────────────────────┼───────────────────────────────────────┤
│ Configuration Data:             │ Business Data:                        │
│ • entities (blockInstance,      │ • appointments                        │
│   blockShape, partInstance,     │ • properties                          │
│   partShape)                    │ • users                               │
│ • relationships (validCascades, │                                       │
│   bookingCascades, etc.)        │                                       │
│ • annotations                   │                                       │
│ • annotationTypes               │                                       │
├─────────────────────────────────┼───────────────────────────────────────┤
│ Composable: useGlobal()         │ Composable: useBusiness()             │
│ Pattern: refetchQueries         │ Pattern: optimistic + refetchQueries  │
│ Change Frequency: Low           │ Change Frequency: High                │
└─────────────────────────────────┴───────────────────────────────────────┘
```

---

## Cache Keys

| Cache Key | Purpose | Composable | Change Frequency |
|-----------|---------|------------|------------------|
| `['globalData']` | Configuration entities, relationships, annotations | `useGlobal()` | Low |
| `['businessData']` | Appointments, properties, users | `useBusiness()` | High |

---

## Why Two Caches?

### Problem (Before Session 1.4.7)
- All data was fetched together in `globalData`
- Editing an appointment would invalidate `globalData`
- This caused refetching of ALL entities, relationships, annotations
- Slow refresh, unnecessary network requests

### Solution (Session 1.4.7)
- **Separation of concerns**: Configuration data stays stable; business data changes often
- **Granular invalidation**: Editing an appointment only refetches `businessData`
- **Better performance**: Configuration data doesn't get refetched unnecessarily

---

## GlobalData (Configuration Cache)

### Contents
```typescript
type GlobalData = {
  entities: Record<GlobalEntityKey, GlobalEntity<GlobalEntityKey>[]>
  relationships: Record<GlobalRelationshipKey, GlobalRelationship[]>
  annotations?: Annotation[]
  annotationTypes?: AnnotationType[]
}
```

### What Belongs Here
- **Entities**: BlockShape, BlockInstance, PartShape, PartInstance
- **Relationships**: ValidCascades, BookingCascades, InstanceComponents, etc.
- **Annotations**: Annotation instances (descriptions, tooltips)
- **Annotation Types**: Annotation type definitions (frontPage, description, etc.)

### When to Use
- Scheduler configuration
- Admin panel entity/relationship management
- Anything that changes infrequently (admin operations)

### Invalidation Pattern
```typescript
// After mutation
await queryClient.refetchQueries({ queryKey: ['globalData'] })
```

---

## BusinessData (Business Cache)

### Contents
```typescript
type BusinessData = {
  appointments: AppointmentResponse[]
  properties: PropertyResponse[]
  users: UserResponse[]
}
```

### What Belongs Here
- **Appointments**: Booking records created by clients/agents
- **Properties**: Property addresses and details
- **Users**: Client, agent, and admin user records

### When to Use
- Booking wizard
- Data management tab (appointments, properties, users tables)
- Any frequently changing business data

### Invalidation Pattern
```typescript
// Optimistic update + refetch
if (createdItem?.id) {
  queryClient.setQueryData<BusinessData>(BUSINESS_DATA_QUERY_KEY, (old) => {
    if (!old) return old
    const current = config.selectCollection(old) ?? []
    const updated = appendIfMissingById(current, createdItem)
    return config.updateCollection(old, updated)
  })
}
await queryClient.refetchQueries({ queryKey: BUSINESS_DATA_QUERY_KEY })
```

---

## Composable Architecture

### GlobalData Composables
```
useGlobal()
├── useEntity()                    → Entity CRUD
├── useRelationship()              → Relationship CRUD
├── useAnnotations()               → Annotation CRUD
├── useAnnotationType()            → Annotation type CRUD
└── useGlobalDataCollectionCrud()  → Generic collection CRUD
```

### BusinessData Composables
```
useBusiness()
├── useAppointment()                 → Appointment CRUD
├── useProperty()                    → Property CRUD
├── useUser()                        → User CRUD
└── useBusinessDataCollectionCrud()  → Generic collection CRUD
```

---

## Adding New Entity Types

### To GlobalData (Configuration Data)
1. Add type to `GlobalData` in `fetchToGlobalTransformer.ts`
2. Update `stageForHydration()` to fetch the data
3. Update `hydrate()` to include the data in returned GlobalData
4. Create composable using `useGlobalDataCollectionCrud()` pattern
5. Mutations should call `refetchQueries(['globalData'])`

### To BusinessData (Business Data)
1. Add type to `BusinessData` in `fetchToBusinessTransformer.ts`
2. Update `fetchAll()` to fetch the data
3. Create composable using `useBusinessDataCollectionCrud()` pattern
4. Mutations should use optimistic + `refetchQueries(['businessData'])`

---

## Invalidation Patterns Comparison

| Pattern | Description | Use Case |
|---------|-------------|----------|
| `invalidateQueries` | Marks cache as stale, refetches on next use | Rarely used |
| `refetchQueries` | Immediately refetches data | GlobalData mutations |
| `optimistic + refetchQueries` | Update cache immediately, then refetch | BusinessData mutations |

### Why Optimistic + RefetchQueries?
1. **Instant UI feedback**: User sees change immediately
2. **Data consistency**: Refetch ensures server state is reflected
3. **Error recovery**: If server fails, refetch restores correct state

---

## File Locations

### Types and Transformers
- `client/src/utils/transformers/fetchToGlobalTransformer.ts` - GlobalData type and transformer
- `client/src/utils/transformers/fetchToBusinessTransformer.ts` - BusinessData type and transformer

### Main Composables
- `client/src/composables/useGlobal.ts` - GlobalData access
- `client/src/composables/useBusiness.ts` - BusinessData access

### Collection CRUD Patterns
- `client/src/composables/globalDataCollections/` - GlobalData collection utilities
- `client/src/composables/businessDataCollections/` - BusinessData collection utilities

### Entity Composables
- `client/src/composables/useEntity.ts` - Entity CRUD (globalData)
- `client/src/composables/useRelationship.ts` - Relationship CRUD (globalData)
- `client/src/composables/useAnnotations.ts` - Annotation CRUD (globalData)
- `client/src/composables/useAnnotationType.ts` - AnnotationType CRUD (globalData)
- `client/src/composables/useAppointment.ts` - Appointment CRUD (businessData)
- `client/src/composables/useProperty.ts` - Property CRUD (businessData)
- `client/src/composables/useUser.ts` - User CRUD (businessData)

---

## Migration History

### Session 1.4.3 (Initial Integration)
- Added appointments, properties, users to globalData
- All data in single cache

### Session 1.4.7 (Separation)
- Created BusinessData cache for appointments, properties, users
- Moved annotationTypes to globalData (configuration data)
- Created useBusinessDataCollectionCrud pattern
- Implemented optimistic + refetchQueries pattern

---

## Related Documents

- **Phase 1.4 Handoff**: `../phases/phase-1.4-handoff.md`
- **Feature Plan**: `../feature-plan.md`
- **Session 1.4.7 Log**: `../sessions/session-1.4.7-log.md`

