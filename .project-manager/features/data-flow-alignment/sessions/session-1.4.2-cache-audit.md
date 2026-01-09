# Session 1.4.2 Cache Audit: Admin Panel GlobalData Cache Usage

**Feature:** Data Flow Alignment  
**Phase:** 1.4 - Admin Panel Data Flow Fixes  
**Session:** 1.4.2 - Verify Admin Panel GlobalData Cache Usage  
**Status:** ✅ Complete  
**Date:** 2026-01-07

---

## Executive Summary

This audit identifies which admin panel components correctly use the globalData cache and which bypass it with direct API calls. The audit covers all admin panel tabs and generic admin components.

**Key Findings:**
- ✅ **2 components** use globalData cache correctly (ProfilesTab, ShapesTab)
- ❌ **3 components** bypass globalData cache (AppointmentsTable, PropertiesTable, UsersTable)
- ⚠️ **2 generic components** use direct API calls (SelectInputs [formerly SelectFields], AnnotationsField)
- ✅ **1 component** uses direct API calls (BusinessControlsTab) - **Expected/acceptable** for business settings

**Priority:** High - Data consistency requires all CRUD operations to use unified globalData cache.

---

## Expected Cache Usage Pattern

### Correct Pattern (using globalData cache)

**Read Operations:**
- Use `useGlobal()` composable to read from `globalData` cache
- Access entities via `getGlobalEntities(entityKey)` or `getGlobalEntityById(entityKey, id)`
- Access relationships via `useRelationshipCrud(relationshipKey).relationships`

**Write Operations:**
- Use `useEntityCrud(entityKey)` for entity CRUD operations
- Use `useRelationshipCrud(relationshipKey)` for relationship CRUD operations
- Mutations automatically invalidate `['globalData']` cache on success

**Cache Invalidation:**
- All mutations invalidate `['globalData']` query key
- Cache refetch triggers automatically via Vue Query

### Incorrect Pattern (bypassing globalData cache)

**Direct API Calls:**
- Direct `apiClient.get/post/put/patch/delete()` calls
- `useQuery` with custom query keys (e.g., `['appointments']`, `['properties']`, `['users']`)
- Separate cache keys that don't sync with `['globalData']`

**Problems:**
- Data inconsistency between components
- Stale data displayed after mutations
- Multiple cache sources causing confusion
- No unified data flow

---

## Component Audit Results

### ✅ ProfilesTab.vue - **CORRECT**

**File:** `client-vue/src/views/admin/tabs/ProfilesTab.vue`

**Cache Usage:**
- ✅ Uses `useGlobal()` to read BlockShapes and BlockInstances
- ✅ Uses `useEntityCrud('blockInstance')` for orderIndex mutations
- ✅ Reads from `globalData` cache via `getGlobalEntities()`

**Code Pattern:**
```typescript
const { getGlobalEntities } = useGlobal()
const { patchOrderIndex: patchBlockInstanceOrderIndex } = useEntityCrud('blockInstance')

const groupedProfiles = computed(() => {
  const blockShapes = getGlobalEntities('blockShape')
  const blockInstances = getGlobalEntities('blockInstance')
  // ... grouping logic
})
```

**Status:** ✅ **No changes needed** - Uses globalData cache correctly

---

### ✅ ShapesTab.vue - **CORRECT**

**File:** `client-vue/src/views/admin/tabs/ShapesTab.vue`

**Cache Usage:**
- ✅ Uses `useGlobal()` to read BlockShapes and PartShapes
- ✅ Uses `useEntityCrud('blockShape')` and `useEntityCrud('partShape')` for CRUD operations
- ✅ Reads from `globalData` cache via `getGlobalEntities()`

**Code Pattern:**
```typescript
const { getGlobalEntities } = useGlobal()
const { patchOrderIndex: patchBlockShapeOrderIndex } = useEntityCrud('blockShape')
const { patchOrderIndex: patchPartShapeOrderIndex } = useEntityCrud('partShape')

const blockShapes = computed(() => getGlobalEntities('blockShape'))
const partShapes = computed(() => getGlobalEntities('partShape'))
```

**Status:** ✅ **No changes needed** - Uses globalData cache correctly

**Note:** Uses `useAnnotationTypes()` composable for annotation types - needs verification if this uses globalData or direct API calls.

---

### ❌ AppointmentsTable.vue - **NEEDS FIX**

**File:** `client-vue/src/views/admin/tabs/components/AppointmentsTable.vue`

**Cache Usage:**
- ❌ Uses `useAppointment()` composable which bypasses globalData cache
- ❌ `useAppointment().fetchAll` uses `useQuery` with `['appointments']` key (not `['globalData']`)
- ❌ Mutations invalidate `['appointments']` instead of `['globalData']`
- ❌ Also uses `useProperty()` and `useUser()` which bypass globalData cache

**Code Pattern:**
```typescript
const { fetchAll, create, update, remove } = useAppointment()
const { fetchAll: fetchProperties } = useProperty()
const { fetchAll: fetchUsers } = useUser()

const appointments = computed(() => fetchAll.data.value || [])
const properties = computed(() => fetchProperties.data.value || [])
const users = computed(() => fetchUsers.data.value || [])
```

**Problem:**
- `useAppointment()`, `useProperty()`, and `useUser()` composables use direct `useQuery` with separate cache keys
- These queries don't sync with `['globalData']` cache
- Mutations invalidate separate cache keys, not `['globalData']`

**Required Changes:**
1. **Option A (Recommended):** Add appointment/property/user entities to globalData cache
   - Update `fetchToGlobalTransformer` to include appointments, properties, users
   - Update `useAppointment()`, `useProperty()`, `useUser()` to read from globalData cache
   - Update mutations to invalidate `['globalData']` instead of separate keys

2. **Option B:** Create `useEntityCrud` wrappers for appointments/properties/users
   - Use `useEntityCrud('appointment')`, `useEntityCrud('property')`, `useEntityCrud('user')`
   - Requires adding these entity types to globalData cache

**Priority:** High - Data consistency critical for appointments, properties, and users

---

### ❌ PropertiesTable.vue - **NEEDS FIX**

**File:** `client-vue/src/views/admin/tabs/components/PropertiesTable.vue`

**Cache Usage:**
- ❌ Uses `useProperty()` composable which bypasses globalData cache
- ❌ `useProperty().fetchAll` uses `useQuery` with `['properties']` key (not `['globalData']`)
- ❌ Mutations invalidate `['properties']` instead of `['globalData']`

**Code Pattern:**
```typescript
const { fetchAll, create, update, remove } = useProperty()

const properties = computed(() => fetchAll.data.value || [])
```

**Problem:**
- Same issue as AppointmentsTable - uses separate cache key instead of globalData

**Required Changes:**
- Same as AppointmentsTable (add properties to globalData cache or use useEntityCrud wrapper)

**Priority:** High - Data consistency critical for properties

---

### ❌ UsersTable.vue - **NEEDS FIX**

**File:** `client-vue/src/views/admin/tabs/components/UsersTable.vue`

**Cache Usage:**
- ❌ Uses `useUser()` composable which bypasses globalData cache
- ❌ `useUser().fetchAll` uses `useQuery` with `['users']` key (not `['globalData']`)
- ❌ Mutations invalidate `['users']` instead of `['globalData']`

**Code Pattern:**
```typescript
const { fetchAll, create, update, remove } = useUser()

const users = computed(() => fetchAll.data.value || [])
```

**Problem:**
- Same issue as AppointmentsTable - uses separate cache key instead of globalData

**Required Changes:**
- Same as AppointmentsTable (add users to globalData cache or use useEntityCrud wrapper)

**Priority:** High - Data consistency critical for users

---

### ⚠️ BusinessControlsTab.vue - **EXPECTED/ACCEPTABLE**

**File:** `client-vue/src/views/admin/tabs/BusinessControlsTab.vue`

**Cache Usage:**
- ⚠️ Uses direct `apiClient.get()` and `apiClient.put()` calls
- ⚠️ Manages its own cache via `clearAvailabilitySettingsCache()`

**Code Pattern:**
```typescript
const response = await apiClient.get('/business-settings/availability_settings')
await apiClient.put('/business-settings/availability_settings', settings)
```

**Rationale:**
- Business settings are not part of the global entity system
- Settings are stored in separate `business_settings` table
- Settings are not entities (no CRUD via useEntityCrud)
- Direct API calls are acceptable for non-entity data

**Status:** ✅ **No changes needed** - Direct API calls are acceptable for business settings

---

## Generic Component Audit Results

### ⚠️ SelectInputs.vue - **NEEDS REVIEW**

**File:** `client-vue/src/components/admin/generic/fields/SelectInputs.vue` (formerly SelectFields.vue)

**Cache Usage:**
- ⚠️ Uses direct `apiClient.get()` for annotations
- ⚠️ Uses direct `apiClient.get()` for block instance annotations
- ⚠️ Uses direct `apiClient.post()` and `apiClient.delete()` for annotation assignments

**Code Pattern:**
```typescript
const response = await apiClient.get(getAnnotationEndpoint())
const response = await apiClient.get(getBlockInstanceAnnotationsEndpoint(blockInstanceId.value))
await apiClient.post(getBlockInstanceAnnotationsEndpoint(blockInstanceId.value), payload)
await apiClient.delete(getBlockInstanceAnnotationEndpoint(blockInstanceId.value, annotationId))
```

**Problem:**
- Annotations are fetched directly instead of from globalData cache
- Block instance annotations (relationships) are fetched directly
- These should use `useGlobal()` and `useRelationshipCrud()` if annotations are in globalData

**Required Investigation:**
1. Check if annotations are included in globalData cache
2. Check if annotation assignments are included in globalData relationships
3. If yes, update to use globalData cache
4. If no, determine if annotations should be added to globalData cache

**Priority:** Medium - Annotations are used in admin forms, but may not be critical for data consistency

---

### ⚠️ AnnotationsField.vue - **NEEDS REVIEW**

**File:** `client-vue/src/components/admin/generic/fields/AnnotationsField.vue`

**Cache Usage:**
- ⚠️ Uses direct `apiClient.get()` for annotations
- ⚠️ Uses direct `apiClient.get()` for block instance annotations
- ⚠️ Uses direct `apiClient.post()`, `apiClient.patch()`, `apiClient.delete()` for annotation CRUD

**Code Pattern:**
```typescript
const response = await apiClient.get(getAnnotationEndpoint())
const response = await apiClient.get(getBlockInstanceAnnotationsEndpoint(blockInstanceId.value))
await apiClient.post(getAnnotationEndpoint(), data)
await apiClient.post(getBlockInstanceAnnotationsEndpoint(blockInstanceId.value), payload)
await apiClient.patch(getAnnotationEndpoint() + `/${ann.id}`, data)
await apiClient.delete(getAnnotationEndpoint() + `/${ann.id}`)
```

**Problem:**
- Same as SelectInputs (formerly SelectFields) - annotations fetched directly instead of from globalData cache

**Required Investigation:**
- Same as SelectInputs (formerly SelectFields) - check if annotations should be in globalData cache

**Priority:** Medium - Annotations are used in admin forms, but may not be critical for data consistency

---

## Composables Audit Results

### ❌ useAppointment.ts - **NEEDS FIX**

**File:** `client-vue/src/composables/useAppointment.ts`

**Cache Usage:**
- ❌ Uses `useQuery` with `['appointments']` key (not `['globalData']`)
- ❌ Mutations invalidate `['appointments']` instead of `['globalData']`
- ❌ Direct `apiClient` calls bypass globalData cache

**Required Changes:**
1. Add appointments to globalData cache (update `fetchToGlobalTransformer`)
2. Update `fetchAll` to read from `useGlobal().getGlobalEntities('appointment')`
3. Update mutations to invalidate `['globalData']` instead of `['appointments']`
4. Or create wrapper using `useEntityCrud('appointment')` if appointments are added to globalData

**Priority:** High

---

### ❌ useProperty.ts - **NEEDS FIX**

**File:** `client-vue/src/composables/useProperty.ts`

**Cache Usage:**
- ❌ Uses `useQuery` with `['properties']` key (not `['globalData']`)
- ❌ Mutations invalidate `['properties']` instead of `['globalData']`
- ❌ Direct `apiClient` calls bypass globalData cache

**Required Changes:**
1. Add properties to globalData cache (update `fetchToGlobalTransformer`)
2. Update `fetchAll` to read from `useGlobal().getGlobalEntities('property')`
3. Update mutations to invalidate `['globalData']` instead of `['properties']`
4. Or create wrapper using `useEntityCrud('property')` if properties are added to globalData

**Priority:** High

---

### ❌ useUser.ts - **NEEDS FIX**

**File:** `client-vue/src/composables/useUser.ts`

**Cache Usage:**
- ❌ Uses `useQuery` with `['users']` key (not `['globalData']`)
- ❌ Mutations invalidate `['users']` instead of `['globalData']`
- ❌ Direct `apiClient` calls bypass globalData cache

**Required Changes:**
1. Add users to globalData cache (update `fetchToGlobalTransformer`)
2. Update `fetchAll` to read from `useGlobal().getGlobalEntities('user')`
3. Update mutations to invalidate `['globalData']` instead of `['users']`
4. Or create wrapper using `useEntityCrud('user')` if users are added to globalData

**Priority:** High

---

## Prioritized Fix List

### Priority 1: Critical Data Consistency (High Priority)

**Components:**
1. **AppointmentsTable.vue** - Uses separate cache for appointments
2. **PropertiesTable.vue** - Uses separate cache for properties
3. **UsersTable.vue** - Uses separate cache for users

**Composables:**
1. **useAppointment.ts** - Separate cache key `['appointments']`
2. **useProperty.ts** - Separate cache key `['properties']`
3. **useUser.ts** - Separate cache key `['users']`

**Fix Strategy:**
- Add appointments, properties, and users to globalData cache
- Update composables to read from globalData cache
- Update mutations to invalidate `['globalData']` instead of separate keys

**Estimated Effort:** Medium (requires updating transformer and composables)

---

### Priority 2: Annotation Components (Medium Priority)

**Components:**
1. **SelectInputs.vue** (formerly SelectFields.vue) - Direct API calls for annotations
2. **AnnotationsField.vue** - Direct API calls for annotations

**Fix Strategy:**
- Investigate if annotations should be in globalData cache
- If yes, add annotations to globalData cache and update components
- If no, document why annotations use direct API calls

**Estimated Effort:** Low (investigation) to Medium (if adding to cache)

---

## Summary Statistics

| Category | Count | Status |
|----------|-------|--------|
| Components using globalData correctly | 2 | ✅ ProfilesTab, ShapesTab |
| Components bypassing globalData | 3 | ❌ AppointmentsTable, PropertiesTable, UsersTable |
| Components with acceptable direct API calls | 1 | ✅ BusinessControlsTab |
| Generic components needing review | 2 | ⚠️ SelectFields, AnnotationsField |
| Composables bypassing globalData | 3 | ❌ useAppointment, useProperty, useUser |

---

## Next Steps

**Session 1.4.3:** Fix Direct API Calls Bypassing GlobalData
- Fix Priority 1 components (AppointmentsTable, PropertiesTable, UsersTable)
- Fix Priority 1 composables (useAppointment, useProperty, useUser)
- Investigate Priority 2 components (SelectFields, AnnotationsField)

**Architecture Decision Needed:**
- Should appointments, properties, and users be added to globalData cache?
- Should annotations be added to globalData cache?
- Or should these use separate cache keys with proper invalidation?

---

**Audit Status:** ✅ Complete  
**Ready for:** Session 1.4.3 - Fix Direct API Calls Bypassing GlobalData  
**Last Updated:** 2026-01-07

