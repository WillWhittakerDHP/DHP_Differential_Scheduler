# EntityCard.vue Refactor Brief

## Current State
- **Complexity Score**: 33 (highest in codebase)
- **Computed Properties**: 22
- **Watches**: 2
- **Async/Await**: 2/2
- **Map Operations**: 3
- **File Size**: ~1200 lines

## Key Responsibilities (Current)
1. Form management (vee-validate integration)
2. Metadata fetching and composition
3. Field categorization and layout (inline/stacked/titleRow/expandedPanel)
4. Entity CRUD operations (save, delete, create)
5. Field context creation and management
6. Readiness state tracking (metadata ready, form ready)
7. Entity store synchronization
8. Provide/inject setup for child components
9. Expansion panel state management
10. Title field handling

## Refactoring Goals
- **Maintain**: All current functionality (CRUD, form validation, field rendering, metadata handling)
- **Reduce**: Complexity score, number of computed properties, component size
- **Improve**: Separation of concerns, testability, maintainability

## Proposed Approach
Extract logic into focused composables:
1. **useEntityCardForm** - Form management, validation, reset logic
2. **useEntityCardMetadata** - Metadata fetching, composition, categorization
3. **useEntityCardFields** - Field context creation, categorization, layout
4. **useEntityCardCrud** - Save, delete, create operations
5. **useEntityCardReadiness** - Metadata/form readiness tracking (already exists, expand)
6. **useEntityCardStoreSync** - Store entity synchronization logic

## Key Constraints
- Must NOT maintain backward compatibility with existing provide/inject patterns.
- Must maintain all functionality without silent fallbacks, defaults, or overrides
- Must preserve all field rendering functionality
- Must maintain form state management with vee-validate
- Must keep entity store synchronization working

## Success Criteria
- Complexity score reduced to < 20
- Computed properties reduced to < 15
- Component file size reduced to < 800 lines
- All existing tests pass
- No regression in functionality
