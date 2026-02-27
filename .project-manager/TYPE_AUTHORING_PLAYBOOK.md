# Type Authoring Playbook

## Purpose and scope

This document governs how types are created, placed, and used in the codebase. It complements:

- **Cursor rules** (`.cursor/rules/type-governance.mdc`) — inventory, boundaries, placement; always-applied.
- **Audit scripts** — type-escape, type-health, type-similarity, type-import, type-constant-inventory — which enforce and report on type hygiene.

The playbook is the source of truth for rationale and examples; cursor rules are condensed references; audits provide automated enforcement.

---

## Decision tree: create vs reuse vs inline

1. **Does a structurally equivalent or superset type already exist?**  
   Check `client/.audit-reports/type-constant-inventory-audit.md` and `type-similarity-audit.md`.  
   - If **UNIFY** or **EXTEND** applies → reuse or extend; do not duplicate.
2. **Is this type shared across features or only one composable/component?**  
   - Shared → create in `client/src/types/<domain>/` (see placement tree below).  
   - Single composable contract → co-locate in `client/src/types/<domain>/`.  
   - Used in only one `.vue` file → inline in `<script setup>`.
3. **Does it cross a Vue reactivity boundary (composable return, provide/inject)?**  
   Follow the [Vue reactivity boundary contract table](#vue-reactivity-boundary-contract-table) and [null/undefined policy](#nullundefined-policy-matrix).

---

## Vue reactivity boundary contract table

| Creating a...                       | Return type                               | Rationale                             |
| ----------------------------------- | ----------------------------------------- | ------------------------------------- |
| Composable field (read-only)        | `ComputedRef<T>`                          | Prevent accidental writes             |
| Composable field (read/write)       | `Ref<T>`                                  | Allow controlled two-way updates      |
| Query-derived field                 | `ComputedRef<T>`                          | Query state is read-only              |
| Injection key for read-only context | `ComputedRef<T>`                          | Narrow contract                       |
| Injection key for writable context  | `Ref<T>`                                  | Preserve write path                   |
| Composable return object            | Explicit interface + `as ReturnInterface` | Handle Vue UnwrapRef inference limits |

---

## Null/undefined policy matrix

| Layer | Pattern | Example |
|-------|---------|---------|
| API response | `T \| null` | `property: PropertyData \| null` |
| Optional component prop | `T \| undefined` via `?` | `data?: PropertyData` |
| Explicitly empty component prop | `T \| null` | `selectedId: string \| null` |
| Composable internal state | `Ref<T \| null>` | `const selected = ref<string \| null>(null)` |
| Optional field in injected context | include `undefined` in field type | `showDialog: Ref<boolean \| undefined>` |

Pick one of null vs undefined per boundary semantic; do not mix them for the same meaning.

---

## Assertion policy

- **Acceptable:** Composable return objects when Vue’s `UnwrapRef` causes deep inference mismatches — use an explicit return interface and `as ReturnInterface`.
- **Acceptable:** Narrowing after a null check, e.g. `const narrowed = ctx as NonNullable<typeof ctx>` after `if (!ctx) throw ...`.
- **Unacceptable:** `as unknown as T` to hide a real type mismatch; fix the source type or add a type guard instead.
- Prefer type guards (`value is Type`) over assertions for runtime narrowing. See `type-assertion-guidance.mdc` and `frontend-root/src/admin/dataTransformation/typeAdapters.ts`.

---

## Placement decision tree

```
Is this type used by multiple features?
  YES → client/src/types/<domain>/<descriptiveName>.ts
  NO → Is it a composable return contract?
    YES → client/src/types/<domain>/<composableName>.ts (co-locate by domain)
    NO → Is it used in only one .vue file?
      YES → Inline in <script setup>
      NO → client/src/types/<domain>/<descriptiveName>.ts
```

---

## Definition of Done for type changes

- `vue-tsc --noEmit` passes with no new errors.
- `npm run lint` passes in the client directory.
- No new `as unknown as` assertions (or they are justified in PR description).
- If a new type file was created, it appears in the next type-constant-inventory audit run.
- If a boundary contract changed, injection key types are updated to match.

---

## Common mistakes / anti-patterns

| Mistake | Why it fails | Correct approach |
|---------|--------------|------------------|
| Returning `Ref<T> \| ComputedRef<T>` from composable | Ambiguous contract; consumers must branch on flavor | Pick one: `Ref<T>` or `ComputedRef<T>` per field |
| Wrapping `provide()` value in `reactive()` | Strips Ref typing; breaks inject contract | Provide the composable return object directly |
| Untyped `Symbol()` for injection key | Forces downstream casts; loses type safety | `InjectionKey<ContextType>` |
| `as unknown as T` to work around UnwrapRef | Hides real mismatch; masks future breakage | Declare explicit return interface + `as ReturnInterface` |
| Classifying field as nullable when DB requires non-null | Schema/default mismatch; 400 on create | Align `ENTITY_SCHEMA_DEFAULTS` with DB schema |

---

## Audit rule cross-reference mapping

| Playbook rule                       | Audit script      | ruleId( s ) |
|-------------------------------------|-------------------|-------------|
| No `as unknown as`                  | type-escape-audit | as-unknown-as |
| No Ref/ComputedRef flavor confusion | type-health-audit | typeof-ref-return, typeof-computed-return |
| No ref/computed assertions          | type-escape-audit | as-ref, as-computed-ref, as-writable-computed |
| Descriptive generics                | type-health-audit | single-letter-generic |
| No `Record<string, any>`            | type-health-audit | record-string-any |

---

## Cross-references

- **Cursor rules:** `type-governance.mdc`, `coding-standards.mdc` (type assertions, generics, return types, descriptive typing, disallowed additions).
- **Audit scripts:** `client/.scripts/type-escape-audit.mjs`, `type-health-audit.mjs`, `type-similarity-audit.mjs`, `type-import-audit.mjs`, `type-constant-inventory-audit.mjs` (reports in `client/.audit-reports/`).
