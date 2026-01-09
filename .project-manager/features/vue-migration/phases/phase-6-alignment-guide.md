# Phase 6 Alignment Guide

**Created:** 2025-01-31  
**Session:** 9.19 - Branch Alignment & Merge  
**Purpose:** Guide for aligning Phase 6 work with Phase 9 naming conventions and future refactoring

**⚠️ TERMINOLOGY UPDATE (2025-02-01):** The codebase has been converted from "aggregate/pooling" to "composition" terminology. All references to `aggregateId` should now use `composerId`. Backward compatibility mappings for `entityAggregates` have been removed.

---

## Overview

This guide documents the alignment strategy for Phase 6 (Booking Wizard Logic Integration) work with Phase 9 (Three-Dimensional Relationship Model Refactoring) naming conventions. It provides a checklist and patterns for future Phase 6 sessions to ensure consistency.

---

## Naming Convention Changes (Phase 9)

### Type Name Changes
| Old Name | New Name | Usage |
|----------|----------|-------|
| `SchedulerBlockProfile` | `BookingBlockInstance` | Type definitions, imports |
| `SchedulerPartProfile` | `SchedulerPartInstance` | Type definitions, imports |

### Field Name Changes
| Old Name | New Name | Usage |
|----------|----------|-------|
| `blockType` | `blockShape` | Entity structure definitions |
| `partType` | `partShape` | Entity structure definitions |
| `blockProfile` | `blockInstance` | Runtime instances |
| `partProfile` | `partInstance` | Runtime instances |
| `entityType` | `entityKind` | Discriminators (code only, route params still use `entityType`) |
| `poolCoordinatorId` | `composerId` | Composition relationships |
| `memberId` | `particleId` | Composition relationships |

### Relationship Name Changes
| Old Name | New Name | Usage |
|----------|----------|-------|
| `validBlocks` | `validCascades` | Vertical hierarchy relationships |
| `validParts` | `validConstituents` | Block → Part relationships |
| `activeBlocks` | `activeCascades` | Active vertical hierarchy |
| `activeParts` | `activeConstituents` | Active Block → Part relationships |
| `entityAggregates` | `activeCompositions` | Lateral composition relationships |

### UI Label Changes (2025-02-01)
| Old Label | New Label | Location |
|-----------|-----------|----------|
| `"Active Child Blocks"` | `"Active Cascades"` | selectableDisplayConfig.ts |
| `"Active Parts"` | `"Active Constituents"` | selectableDisplayConfig.ts |
| `"Valid Child Block Types"` | `"Valid Cascades"` | selectableDisplayConfig.ts |
| `"Valid Part Types"` | `"Valid Constituents"` | selectableDisplayConfig.ts |
| `"Block Types"` | `"Block Shapes"` | BlockShapeList.vue |
| `"Part Types"` | `"Part Shapes"` | PartShapeList.vue |

---

## Alignment Checklist for Future Phase 6 Sessions

### Before Starting Work
- [ ] Verify you're working on a branch aligned with main (contains Phase 9 changes)
- [ ] Check that all imports use new type names (`BookingBlockInstance`, not `SchedulerBlockProfile`)
- [ ] Verify field names match Phase 9 conventions (`blockShape`, `blockInstance`, etc.)
- [ ] Ensure relationship names use new conventions (`activeCascades`, `activeConstituents`, etc.)

### During Development
- [ ] Use `BookingBlockInstance` for block instance types
- [ ] Use `SchedulerPartInstance` for part instance types
- [ ] Use `blockShape` and `partShape` for entity structure references
- [ ] Use `blockInstance` and `partInstance` for runtime instance references
- [ ] Use `entityKind` in code (not `entityType`, except route parameters)
- [ ] Use `composerId` instead of `poolCoordinatorId` (⚠️ Updated 2025-02-01: `aggregateId` → `composerId`)
- [ ] Use `particleId` instead of `memberId`
- [ ] Use relationship names: `activeCascades`, `activeConstituents`, `activeCompositions`

### After Completing Work
- [ ] Search codebase for old naming patterns (use grep with patterns from this guide)
- [ ] Verify TypeScript compilation passes
- [ ] Verify linting passes
- [ ] Test functionality with new naming conventions
- [ ] Update documentation if needed

---

## Common Patterns

### Importing Types
```typescript
// ✅ CORRECT (Phase 9 naming)
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

// ❌ INCORRECT (Old naming)
import type { SchedulerBlockProfile } from '@/utils/transformers/globalToBookingTransformer'
```

### Type Annotations
```typescript
// ✅ CORRECT
const selectedUserType = ref<BookingBlockInstance | null>(null)
const blockInstances = ref<BookingBlockInstance[]>([])

// ❌ INCORRECT
const selectedUserType = ref<SchedulerBlockProfile | null>(null)
const blockInstances = ref<SchedulerBlockProfile[]>([])
```

### Field Access
```typescript
// ✅ CORRECT
blockInstance.blockShape  // Entity structure
blockInstance.id          // Instance ID
relationship.composerId   // Composition relationship (⚠️ Updated 2025-02-01: `aggregateId` → `composerId`)
relationship.particleId    // Composition relationship

// ❌ INCORRECT
blockProfile.blockType    // Old naming
relationship.poolCoordinatorId  // Old naming
relationship.memberId     // Old naming
```

### Relationship Access
```typescript
// ✅ CORRECT
blockInstance.activeBlockIds  // Child block IDs (cascades)
relationship.activeCascades   // Vertical hierarchy
relationship.activeConstituents  // Block → Part relationships
relationship.activeCompositions   // Lateral composition (⚠️ Updated 2025-02-01: terminology updated)

// ❌ INCORRECT
blockProfile.activeBlockIds  // Old type name
relationship.activeBlocks     // Old relationship name (removed 2025-02-01)
relationship.activeParts      // Old relationship name (removed 2025-02-01)
relationship.validBlocks      // Old relationship name (removed 2025-02-01)
relationship.validParts       // Old relationship name (removed 2025-02-01)
relationship.entityAggregates // Old relationship name (removed 2025-02-01)
```

### UI Label Access (2025-02-01)
```typescript
// ✅ CORRECT - Field Display Labels
displayConfig.label = "Active Cascades"        // Not "Active Child Blocks"
displayConfig.label = "Active Constituents"   // Not "Active Parts"
displayConfig.label = "Valid Cascades"        // Not "Valid Child Block Types"
displayConfig.label = "Valid Constituents"    // Not "Valid Part Types"

// ✅ CORRECT - List Page Titles
pageTitle = "Block Shapes"  // Not "Block Types"
pageTitle = "Part Shapes"  // Not "Part Types"

// ❌ INCORRECT - Old UI Labels (removed 2025-02-01)
displayConfig.label = "Active Child Blocks"   // Old label
displayConfig.label = "Active Parts"          // Old label
displayConfig.label = "Valid Child Block Types" // Old label
displayConfig.label = "Valid Part Types"     // Old label
pageTitle = "Block Types"  // Old title
pageTitle = "Part Types"    // Old title
```

---

## Merge Strategy

### When Merging Phase 6 Work with Main

1. **Create Backup Branches**
   ```bash
   git branch [branch-name]-backup [branch-name]
   ```

2. **Merge Main into Phase 6 Branch** (not the other way around)
   ```bash
   git checkout [phase-6-branch]
   git merge main --no-commit --no-ff
   ```

3. **Resolve Conflicts**
   - Naming conflicts: Update old names to new names
   - Structure conflicts: Update to match Phase 9 structure
   - Logic conflicts: Preserve Phase 6 logic, update to use new naming

4. **Verify After Merge**
   - Search for old naming patterns
   - Verify TypeScript compilation
   - Verify linting
   - Test functionality

5. **Commit Merge**
   ```bash
   git commit -m "Merge main into [branch-name]: Align with Phase 9 naming conventions"
   ```

---

## Verification Commands

### Check for Old Naming Patterns
```bash
# Search for old type names
grep -r "SchedulerBlockProfile\|SchedulerPartProfile" client-vue/src/

# Search for old field names
grep -r "blockType\|partType\|blockProfile\|partProfile" client-vue/src/

# Search for old relationship names (should return no results after cleanup)
grep -r "validBlocks\|validParts\|activeBlocks\|activeParts\|entityAggregates" client-vue/src/

# Search for old UI labels (should return no results after cleanup)
grep -r "Active Child Blocks\|Active Parts\|Valid Child Block Types\|Valid Part Types" client-vue/src/
grep -r "\"Block Types\"\|\"Part Types\"" client-vue/src/configs/field/
```

### Verify TypeScript Compilation
```bash
cd client-vue
npm run type-check
```

### Verify Linting
```bash
cd client-vue
npm run lint
```

---

## Files That May Need Updates

### Core Wizard Files
- `client-vue/src/composables/useBookingWizard.ts`
- `client-vue/src/components/booking/BookingWizard.vue`
- `client-vue/src/components/booking/steps/ServiceSelectionStep.vue`
- `client-vue/src/components/booking/steps/PropertyDetailsStep.vue`
- `client-vue/src/components/booking/steps/AvailabilityStep.vue`
- `client-vue/src/components/booking/steps/ContactsStep.vue`
- `client-vue/src/components/booking/steps/ConfirmationStep.vue`

### Verification Files
- `client-vue/src/views/admin/Session61Verification.vue`
- Any other Phase 6 verification/test files

---

## Notes

- **Route Parameters:** Route parameters still use `entityType` for URL stability (this is intentional)
- **Backward Compatibility:** API routes support both old and new field names during transition
- **Type Safety:** Always use TypeScript types to catch naming issues early
- **Testing:** Test functionality after any naming updates to ensure nothing breaks

---

## Session 9.19 Results

### Branches Aligned
- ✅ `vue-migration-phase-6` - Merged with main, no conflicts
- ✅ `vue-migration-phase-6-session-6.1` - Merged with main, no conflicts

### Verification Results
- ✅ No instances of `SchedulerBlockProfile` or `SchedulerPartProfile` found
- ✅ No instances of old field names found
- ✅ No instances of old relationship names found
- ✅ TypeScript compilation passes
- ✅ Linting passes

### Status
- ✅ All Phase 6 branches aligned with Phase 9 naming conventions
- ✅ Code uses new naming conventions throughout
- ✅ Ready for continuation of Phase 6 sessions

---

## Related Documents

- **Phase 9 Progress Summary:** `project-manager/features/vue-migration/phases/phase-9-progress-summary.md`
- **Phase 6 Alignment Inventory:** `project-manager/features/vue-migration/phases/phase-6-alignment-inventory.md`
- **Session 9.19 Guide:** `project-manager/features/vue-migration/sessions/session-9.19-guide.md`

---

## Questions or Issues?

If you encounter naming convention issues or conflicts:
1. Check this guide for the correct naming
2. Search codebase for examples of correct usage
3. Verify with Phase 9 progress summary for context
4. Update this guide if new patterns are discovered

