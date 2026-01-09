# Cache Invalidation Audit - Session 1.4.4

**Date:** 2026-01-07  
**Session:** 1.4.4 - Ensure Proper Cache Invalidation on Mutations

---

## Executive Summary

This audit examines cache invalidation patterns across all composables to ensure consistent and correct cache invalidation after mutations.

**Key Findings:**
- ✅ Most composables invalidate `['globalData']` correctly
- ⚠️ Inconsistency: Some use `refetchQueries`, others use `invalidateQueries`
- ⚠️ `useAnnotationType` uses separate cache key `['annotationTypes']` (expected - not part of globalData)
- ✅ All entity CRUD operations invalidate cache
- ✅ All relationship operations invalidate cache

---

## Invalidation Pattern Analysis

### Pattern 1: `refetchQueries` (Waits for fresh data)

**Composables using this pattern:**
- `useEntity.ts` - All mutations (create, update, delete, patchOrderIndex)
- `useRelationship.ts` - All mutations (create, delete)
- `useComponentEntity.ts` - All mutations (add, remove, reorder)
- `usePrimitiveMutation` (in useEntity.ts) - Field updates

**Advantages:**
- ✅ Immediately fetches fresh data
- ✅ Ensures UI has latest data before next operation
- ✅ Better for operations that need immediate feedback

**Disadvantages:**
- ⚠️ Slightly slower (waits for API call)
- ⚠️ May cause unnecessary refetches if multiple mutations happen quickly

**Example:**
```typescript
onSuccess: async () => {
  await queryClient.refetchQueries({ queryKey: ['globalData'] })
}
```

---

### Pattern 2: `invalidateQueries` (Marks as stale, refetches on next access)

**Composables using this pattern:**
- `useAppointment.ts` - All mutations (create, update, delete, patch)
- `useProperty.ts` - All mutations (create, update, delete, patch)
- `useUser.ts` - All mutations (create, update, delete, patch)
- `useAnnotationType.ts` - All mutations (create, update, delete) - Uses `['annotationTypes']` key

**Advantages:**
- ✅ Faster (doesn't wait for API call)
- ✅ Better for performance when multiple mutations happen
- ✅ Data refetches when next accessed

**Disadvantages:**
- ⚠️ UI may show stale data briefly
- ⚠️ Requires component to access data to trigger refetch

**Example:**
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['globalData'] })
}
```

---

### Pattern 3: Mixed (Both patterns used)

**Composables using this pattern:**
- `useFieldContext.ts` - Uses both `invalidateQueries` and `refetchQueries` in different contexts

**Analysis:**
- Uses `invalidateQueries` for some operations
- Uses `refetchQueries` for others
- Comment indicates awareness: "Mutations use refetchQueries in onSuccess, so no need to invalidate here"

---

## Detailed Composable Analysis

### ✅ useEntity.ts

**Status:** ✅ Correct

**Invalidation:**
- `usePrimitiveMutation`: `refetchQueries(['globalData'])` + conditional `invalidateQueries(['schedulerAdmin'])`
- `createMutation`: `refetchQueries(['globalData'])` + optimistic cache update
- `updateMutation`: `refetchQueries(['globalData'])`
- `deleteMutation`: `refetchQueries(['globalData'])` (twice - before and after normalization)
- `patchOrderIndexMutation`: `refetchQueries(['globalData'])` + conditional `invalidateQueries(['schedulerAdmin'])`

**Notes:**
- Uses `refetchQueries` consistently
- Includes optimistic cache update for create operations
- Normalizes order indices after delete

---

### ✅ useRelationship.ts

**Status:** ✅ Correct

**Invalidation:**
- `createMutation`: `refetchQueries(['globalData'])`
- `deleteMutation`: `refetchQueries(['globalData'])`

**Notes:**
- Uses `refetchQueries` consistently
- Simple and correct

---

### ⚠️ useAppointment.ts

**Status:** ⚠️ Uses `invalidateQueries` instead of `refetchQueries`

**Invalidation:**
- `createMutation`: `invalidateQueries(['globalData'])` + optimistic cache update
- `updateMutation`: `invalidateQueries(['globalData'])`
- `deleteMutation`: `invalidateQueries(['globalData'])`
- `patchMutation`: `invalidateQueries(['globalData'])`

**Recommendation:**
- Consider changing to `refetchQueries` for consistency with `useEntity`
- Or document why `invalidateQueries` is preferred

---

### ⚠️ useProperty.ts

**Status:** ⚠️ Uses `invalidateQueries` instead of `refetchQueries`

**Invalidation:**
- `createMutation`: `invalidateQueries(['globalData'])` + optimistic cache update
- `updateMutation`: `invalidateQueries(['globalData'])`
- `deleteMutation`: `invalidateQueries(['globalData'])`
- `patchMutation`: `invalidateQueries(['globalData'])`

**Recommendation:**
- Consider changing to `refetchQueries` for consistency with `useEntity`
- Or document why `invalidateQueries` is preferred

---

### ⚠️ useUser.ts

**Status:** ⚠️ Uses `invalidateQueries` instead of `refetchQueries`

**Invalidation:**
- `createMutation`: `invalidateQueries(['globalData'])` + optimistic cache update
- `updateMutation`: `invalidateQueries(['globalData'])`
- `deleteMutation`: `invalidateQueries(['globalData'])`
- `patchMutation`: `invalidateQueries(['globalData'])`

**Recommendation:**
- Consider changing to `refetchQueries` for consistency with `useEntity`
- Or document why `invalidateQueries` is preferred

---

### ✅ useComponentEntity.ts

**Status:** ✅ Correct

**Invalidation:**
- `reorderComponentsMutation`: `refetchQueries(['globalData'])`
- `addToComponentMutation`: `refetchQueries(['globalData'])`
- `removeFromComponentMutation`: `refetchQueries(['globalData'])`
- `distributeComputedPropertyMutation`: `refetchQueries(['globalData'])`

**Notes:**
- Uses `refetchQueries` consistently
- All component operations properly invalidate cache

---

### ✅ useAnnotationType.ts

**Status:** ✅ Correct (Uses separate cache key - expected)

**Invalidation:**
- `useCreateAnnotationType`: `invalidateQueries(['annotationTypes'])`
- `useUpdateAnnotationType`: `invalidateQueries(['annotationTypes'])`
- `useDeleteAnnotationType`: `invalidateQueries(['annotationTypes'])`

**Notes:**
- Uses separate cache key `['annotationTypes']` (not part of globalData)
- This is correct - annotation types are not entities in ENTITY_KEYS
- Uses `invalidateQueries` which is appropriate for this use case

---

### ⚠️ useFieldContext.ts

**Status:** ⚠️ Mixed patterns

**Invalidation:**
- Some operations use `invalidateQueries([entityKey])` + `invalidateQueries(['globalData'])`
- Some operations use `refetchQueries` (via mutations)
- Comment indicates awareness: "Mutations use refetchQueries in onSuccess, so no need to invalidate here"

**Recommendation:**
- Review and standardize invalidation pattern
- Ensure all operations properly invalidate cache

---

## Recommendations

### 1. Standardize Invalidation Pattern

**Option A: Use `refetchQueries` everywhere (Recommended)**
- ✅ Ensures immediate fresh data
- ✅ Better user experience (no stale data)
- ✅ Consistent with `useEntity` pattern
- ⚠️ Slightly slower (waits for API call)

**Option B: Use `invalidateQueries` everywhere**
- ✅ Faster (doesn't wait)
- ✅ Better for performance
- ⚠️ May show stale data briefly
- ⚠️ Requires components to access data to trigger refetch

**Recommendation:** Use `refetchQueries` for `['globalData']` mutations to ensure immediate UI updates. Use `invalidateQueries` only for non-critical caches or when performance is a concern.

---

### 2. Update useAppointment, useProperty, useUser

**Action:** Change from `invalidateQueries` to `refetchQueries` for consistency with `useEntity`

**Rationale:**
- Consistency across all entity CRUD operations
- Ensures immediate UI updates
- Better user experience

---

### 3. Review useFieldContext

**Action:** Audit all invalidation calls in `useFieldContext.ts` and standardize pattern

**Rationale:**
- Currently uses mixed patterns
- Should be consistent with other composables

---

### 4. Document Invalidation Strategy

**Action:** Add documentation explaining when to use `refetchQueries` vs `invalidateQueries`

**Guidelines:**
- Use `refetchQueries` for `['globalData']` mutations (ensures immediate updates)
- Use `invalidateQueries` for separate cache keys (like `['annotationTypes']`)
- Use `refetchQueries` when operation needs immediate feedback
- Use `invalidateQueries` when performance is critical and stale data is acceptable

---

## Test Coverage

### Current Test Coverage

**Tests verify invalidation:**
- ✅ `useEntity.test.ts` - Tests invalidation (but may need updates)
- ✅ `useAppointment.test.ts` - Tests invalidation with `['globalData']`
- ✅ `useProperty.test.ts` - Tests invalidation with `['globalData']`
- ✅ `useUser.test.ts` - Tests invalidation with `['globalData']`
- ✅ `useRelationship.test.ts` - Tests invalidation with `['globalData']`
- ✅ `useComponentEntity.test.ts` - Tests invalidation with `['globalData']`
- ✅ `useAnnotationType.test.ts` - Tests invalidation with `['annotationTypes']`

**Test Updates Needed:**
- ⏳ Update tests to verify `refetchQueries` instead of `invalidateQueries` (if we standardize)
- ⏳ Add tests for missing invalidation scenarios

---

## Action Items

1. ⏳ **Standardize invalidation pattern** - Decide on `refetchQueries` vs `invalidateQueries`
2. ⏳ **Update useAppointment, useProperty, useUser** - Change to `refetchQueries` if standardizing
3. ⏳ **Review useFieldContext** - Audit and standardize invalidation
4. ⏳ **Update tests** - Verify invalidation calls match chosen pattern
5. ⏳ **Document strategy** - Add comments/docs explaining invalidation approach

---

## Conclusion

Most composables correctly invalidate `['globalData']` after mutations. The main issue is inconsistency between `refetchQueries` and `invalidateQueries`. Standardizing on `refetchQueries` for `['globalData']` mutations will ensure immediate UI updates and better user experience.

