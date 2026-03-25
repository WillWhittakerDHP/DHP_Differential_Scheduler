# Session 9.10 Pattern Inventory

**Date:** 2025-01-30
**Session:** 9.10 - Transformer Refactoring - DRY Pattern

---

## Architectural Issues Identified

### Issue 1: Composition Treated Inconsistently
**Problem:**
- `activeCompositions` is defined in `RELATIONSHIP_KEYS` as a relationship type
- But it's handled differently from other relationships:
  - Other relationships → transformed into `GlobalRelationship[]` format
  - `activeCompositions` → kept as `ActiveComposition[]` and stored separately in `GlobalData.activeCompositions`
- Aggregation logic is separate from relationship transformation

**Impact:**
- Inconsistent architecture
- Duplicate relationship handling logic
- Aggregation logic isolated from relationship system

**Solution:**
- Transform `activeCompositions` into `GlobalRelationship[]` format (like other relationships)
- Store in `relationships.activeCompositions` instead of separate field
- Move aggregation logic into relationship transformation utilities

**Files Affected:**
- `fetchToGlobalTransformer.ts` - hydrate() method
- `GlobalData` type definition
- `compositionAggregator.ts` - move functions to relationship transformers
- `useCompositionEntity.ts` - update imports

---

## Duplicate Patterns Identified

### Pattern 1: Finding Relationships by Parent ID
**Appears in:**
- `fetchToGlobalTransformer.ts` - `transformRelationships()` (lines 132-138)
- `globalToAdminTransformer.ts` - `attachRelationshipData()` (lines 298-300)
- `globalToBookingTransformer.ts` - `transformBlockInstance()` (lines 140-142, 166-168)

**Current Implementation:**
```typescript
// Pattern A: Group by parent_id (fetchToGlobalTransformer)
const parentMap = new Map<string, string[]>()
fetchedRelationships.forEach(rel => {
  const existing = parentMap.get(rel.parent_id) || []
  parentMap.set(rel.parent_id, [...existing, rel.child_id])
})

// Pattern B: Filter by parent.id (globalToAdminTransformer, globalToBookingTransformer)
const parentRelationships = relationships.filter((rel: GlobalRelationship) => 
  rel.parent && rel.parent.id === entity.id
)
```

**Proposed Utility:**
```typescript
function findRelationshipsByParent(
  parentId: string,
  relationships: GlobalRelationship[]
): GlobalRelationship[]

function groupRelationshipsByParent(
  relationships: FetchedRelationship[]
): Map<string, string[]>
```

**Extract to:** `relationshipTransformers.ts`

---

### Pattern 2: Extracting Child IDs from Relationships
**Appears in:**
- `globalToAdminTransformer.ts` - `attachRelationshipData()` (lines 304-306)
- `globalToBookingTransformer.ts` - `transformBlockInstance()` (line 170)

**Current Implementation:**
```typescript
// Pattern A: Extract child IDs (globalToAdminTransformer)
const childIds = parentRelationships.flatMap((rel: GlobalRelationship) => 
  rel.children ? rel.children.map((child) => child.id) : []
)

// Pattern B: Extract child IDs (globalToBookingTransformer)
const activeBlockIds = activeCascadesRel
  ? activeCascadesRel.children.map((child) => child.id)
  : []
```

**Proposed Utility:**
```typescript
function extractChildIds(relationships: GlobalRelationship[]): string[]
```

**Extract to:** `relationshipTransformers.ts`

---

### Pattern 3: Field Name Transformation (snake_case → camelCase)
**Appears in:**
- `fetchToGlobalTransformer.ts` - `transformApiEntity()` (lines 52-92)
- `fetchToGlobalTransformer.ts` - `dehydrateEntity()` (lines 385-418)

**Current Implementation:**
```typescript
// Pattern A: Transform API entity (snake_case → camelCase)
const fieldMappings: Record<string, Record<string, string>> = {
  blockShape: { order_index: 'orderIndex', ... },
  // ...
}
const mapping = fieldMappings[entityKey] || {}
const frontendKey = mapping[backendKey] || backendKey

// Pattern B: Dehydrate entity (camelCase → snake_case)
const mapping = fieldMappings[entityKey] || {}
const backendKey = mapping[frontendKey] || frontendKey
```

**Proposed Utility:**
```typescript
function transformEntityFields(
  entity: Record<string, unknown>,
  fieldMappings: Record<string, string>
): Record<string, unknown>

function getFieldMappings(entityKey: GlobalEntityKey): Record<string, string>
```

**Extract to:** `fieldMappings.ts` and `entityTransformers.ts`

---

### Pattern 4: Lookup Map Creation (id → entity)
**Appears in:**
- `globalToBookingTransformer.ts` - `transformGlobalToScheduler()` (lines 85-93)

**Current Implementation:**
```typescript
const partInstanceById = new Map(
  partInstances.map(partInstance => [partInstance.id, partInstance])
)
const blockShapeById = new Map(
  blockShapes.map(blockShape => [blockShape.id, blockShape])
)
const partShapeById = new Map(
  partShapes.map(partShape => [partShape.id, partShape])
)
```

**Proposed Utility:**
```typescript
function createLookupMap<T extends { id: string }>(
  entities: T[],
  keyField: keyof T = 'id' as keyof T
): Map<string, T>
```

**Extract to:** `denormalizationUtils.ts`

---

### Pattern 5: Shape Reference Denormalization (ref → name)
**Appears in:**
- `globalToBookingTransformer.ts` - `transformBlockInstance()` (lines 160-163)
- `globalToBookingTransformer.ts` - `transformPartInstance()` (lines 206-209)

**Current Implementation:**
```typescript
// Pattern A: Denormalize blockShape
const blockShapeRef = blockInstanceTyped.blockShapeRef
const blockShapeEntity = blockShapeById.get(blockShapeRef)
const blockShape = blockShapeEntity?.name || blockShapeRef

// Pattern B: Denormalize partShape
const partShapeRef = partInstanceTyped.partShapeRef
const partShapeEntity = partShapeById.get(partShapeRef)
const partShape = partShapeEntity?.name || partShapeRef
```

**Proposed Utility:**
```typescript
function denormalizeShapeRef(
  ref: string,
  shapeMap: Map<string, GlobalEntity<'blockShape' | 'partShape'>>
): string
```

**Extract to:** `denormalizationUtils.ts`

---

### Pattern 6: Composition Aggregation (Property Aggregation from Particles)
**Appears in:**
- `compositionAggregator.ts` - entire file

**Current Implementation:**
- `getParticlesRecursive()` - recursive traversal
- `aggregateProperty()` - strategy-based aggregation
- `aggregateAggregateProperties()` - property aggregation
- `getAggregatedEntity()` - create aggregated entity

**Proposed Utility:**
```typescript
// Move to relationshipTransformers.ts
function getParticlesRecursive(
  aggregateId: string,
  entityKind: GlobalEntityKey,
  relationships: GlobalRelationship[],
  visited: Set<string> = new Set()
): string[]

function aggregatePropertiesFromRelationships<GE extends GlobalEntityKey>(
  aggregateId: string,
  entityKind: GE,
  relationships: GlobalRelationship[],
  entities: Record<GlobalEntityKey, GlobalEntity<GlobalEntityKey>[]>,
  aggregationRules: Record<string, AggregationStrategy>
): Partial<GlobalEntity<GE>>

function getAggregatedEntityFromRelationships<GE extends GlobalEntityKey>(
  aggregateId: string,
  entityKind: GE,
  relationships: GlobalRelationship[],
  entities: Record<GlobalEntityKey, GlobalEntity<GlobalEntityKey>[]>,
  aggregationRules: Record<string, AggregationStrategy>
): GlobalEntity<GE> | null
```

**Extract to:** `relationshipTransformers.ts` (integrate with relationship transformation)

---

## Patterns to Keep Specific

### Pattern 7: Admin Entity Validation
**Appears in:**
- `globalToAdminTransformer.ts` - `transformSingleEntity()` (lines 188-211)

**Reason to Keep:**
- Specific to admin transformer
- Uses AdminEntity class for validation
- Not reusable across transformers

---

### Pattern 8: Scheduler-Specific Denormalization
**Appears in:**
- `globalToBookingTransformer.ts` - entire transformation logic

**Reason to Keep:**
- Creates scheduler-specific types (BookingBlockInstance, SchedulerPartInstance)
- Embeds relationships in specific structure
- Optimized for scheduler display needs

---

## Summary

### Patterns to Extract:
1. ✅ Finding relationships by parent ID → `relationshipTransformers.ts`
2. ✅ Extracting child IDs → `relationshipTransformers.ts`
3. ✅ Field name transformation → `fieldMappings.ts` + `entityTransformers.ts`
4. ✅ Lookup map creation → `denormalizationUtils.ts`
5. ✅ Shape reference denormalization → `denormalizationUtils.ts`
6. ✅ Composition aggregation → `relationshipTransformers.ts` (integrate with relationship transformation)

### Architectural Improvements:
1. ✅ Integrate composition into relationship transformation system
2. ✅ Transform compositions as `GlobalRelationship[]`
3. ✅ Move aggregation logic to relationship transformers
4. ✅ Remove `compositionAggregator.ts` after integration

### Files to Create:
- `relationshipTransformers.ts` (includes composition aggregation)
- `entityTransformers.ts`
- `denormalizationUtils.ts`
- `fieldMappings.ts`

### Files to Update:
- `fetchToGlobalTransformer.ts` (integrate composition as relationship)
- `globalToAdminTransformer.ts` (use shared utilities)
- `globalToBookingTransformer.ts` (use shared utilities)
- `useCompositionEntity.ts` (update imports)

### Files to Remove:
- `compositionAggregator.ts` (after integration)

