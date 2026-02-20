# Audit Exception Handling Guide

**⚠️ DEPRECATED: This document describes the old exclusion system. See `AUDIT_EXCEPTIONS_README.md` for the current unified exception handling system.**

## Current System (Recommended)

All audit scripts now use a **unified exception handling system** with:

1. **Inline Comments** - For specific, one-off exceptions with inline justification
   - Format: `// @audit-allow:<auditType>:<ruleId> - <reason>`
   - Example: `// @audit-allow:hardcoding:entityKeyString - Required for entity routing`

2. **Config Files** - For patterns/broad exceptions
   - Location: `.audit/<auditType>-audit-config.json`
   - Schema: See `AUDIT_EXCEPTIONS_README.md` for details

### Available Config Files

- `hardcoding-audit-config.json` - Hardcoding pattern exceptions
- `loop-mutation-audit-config.json` - Loop mutation exceptions  
- `duplication-audit-config.json` - File-level exclusions for duplication scanning
- `component-logic-audit-config.json` - Component logic scanning exclusions
- `composables-logic-audit-config.json` - Composables logic scanning exclusions
- `test-audit-config.json` - Reserved for future test audit exceptions
- `.typecheck/typecheck-audit-config.json` - Typecheck error exceptions

## Migration Notes

The following audits have been migrated from hardcoded `EXCLUDED_PATHS` arrays to config-based exceptions:

- ✅ `hardcoding-audit.mjs` - Uses `shared-audit-utils.mjs` + config file
- ✅ `loop-mutation-audit.mjs` - Uses `shared-audit-utils.mjs` + config file (removed duplicate `EXCLUDED_PATHS`)
- ✅ `duplication-audit.mjs` - Migrated from hardcoded `EXCLUDED_PATHS` to config file
- ✅ `component-logic-audit.mjs` - Migrated from hardcoded exclusions to config file
- ✅ `composables-logic-audit.mjs` - Migrated from hardcoded exclusions to config file
- ✅ `typecheck-audit.mjs` - Uses `shared-audit-utils.mjs` + config file

## Legacy Exclusion Patterns (Historical Reference)

The following patterns were previously hardcoded and have been migrated to config files:

### Duplication Audit (now in `duplication-audit-config.json`)
- Config files with intentional duplication:
  - `selectableFieldConfig.ts` / `selectableDisplayConfig.ts`
  - `appliedForm/` / `appliedDisplay/` directories
  - `formFields.ts` type definitions

### Loop Mutation Audit (now in `loop-mutation-audit-config.json`)
- Basic file exclusions (tests, @core, @layouts) moved to config
- Composables pattern exceptions for Vue reactive mutations

### Component Logic Audit (now in `component-logic-audit-config.json`)
- `@core/` and `@layouts/` directory exclusions

### Composables Logic Audit (now in `composables-logic-audit-config.json`)
- Test file exclusions (`__tests__/`, `*.test.*`, `*.spec.*`)

## For More Information

Execution order and audit families (e.g. the "Naming & constants" pipeline: naming-convention → constants-consolidation → hardcoding) are documented in [AUDIT_EXECUTION_ORDER.md](AUDIT_EXECUTION_ORDER.md).

See `AUDIT_EXCEPTIONS_README.md` for:
- How to add inline exceptions
- How to configure pattern-based exceptions
- Rule IDs for each audit type
- Best practices for exception management
