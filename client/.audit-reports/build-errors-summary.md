# Client build-preventing errors (vue-tsc)

**Generated:** 2026-02-19  
**Command:** `npm run type-check` (vue-tsc --noEmit)  
**Total errors:** 61 across 23 files  
**Server:** compiles successfully (`npm run compile` in server/)

---

## By file (and error kind)

| File | Errors | Summary |
|------|--------|--------|
| **ApiDevPanelComputedTab.vue** | 4 | `string` not assignable to `RFC3339DateTime` (lines 108, 141) |
| **PartsCollection.vue** | 1 | No exported member `GlobalEntityKey` from `@/types/entities` (use correct export) |
| **EntityFormContent.vue** | 3 | Unused `Ref` import; `Ref<useForm return>` not assignable to `Ref<FormContext \| undefined>` (meta: `FormMeta` vs `ComputedRef<FormMeta>`) |
| **AddressAutocomplete.vue** | 1 | Emit handler type: `string` not assignable to literal event name `"error"` |
| **useAppointmentsTableModel.ts** | 1 | `AppointmentResponse & Record<string, unknown>` vs `AppointmentResponse` (index signature) |
| **useBufferSettings.ts** | 2 | Generic `TValue` vs concrete union (number | ConstraintEnforcement | …) |
| **useCalibrationChart.ts** | 1 | Theme object cast to `InternalThemeDefinition` (missing dark, colors, variables) |
| **useCapacitySettings.ts** | 9 | Cast to `Record<string, TValue>`; **8×** `createMaxIncomeComputed` not found (missing import or function) |
| **useEntityCardActions.ts** | 7 | Spread from non-object; `entity.value` unknown; argument type `GlobalEntity<…>` |
| **useEntityCardStoreSync.ts** | 1 | `string | number | symbol` not assignable to `string` |
| **useMetadataFieldOrdering.ts** | 5 | `GlobalFieldKey` (string \| number) used as `string`; `localeCompare` on number; `Ref<string[]>` vs `GlobalFieldKey[]` |
| **useSelectFiltering.ts** | 3 | `string | number` not assignable to `string` |
| **useStatusButtonToggle.ts** | 8 | Property `id` on `{}`; `GlobalFieldKey` index; `in` operator on `{}`; Record types |
| **useBlockInstanceSelection.ts** | 2 | Return type conversion to `UseBlockInstanceSelectionReturn<Mode>` (overlap) |
| **useDependentInstances.ts** | 1 | Mixed `\|\|` and `??` without parentheses (TS5076) |
| **useFormFields.ts** | 1 | `GlobalFieldKey[]` not assignable to `readonly string[]` |
| **useFormFieldsContext.ts** | 4 | `FormContext` vs useForm return (meta); `GlobalFieldKey` as `string`; `FieldContextType` conversion |
| **useFormFieldsStandardLayout.ts** | 2 | `GlobalFieldKey[]` not assignable to `readonly string[]` |
| **useEntityForm.ts** | 1 | Spread types from non-object type |
| **useSelectOptions.ts** | 2 | `string | number` not assignable to `string` |
| **windowDebug.ts** | 1 | `Window` to `WindowWithDebug` conversion (index signature) |
| **entityFieldPatch.ts** | 1 | Patch object to `Partial<GlobalEntityType>` conversion |
| **InstancesTab.vue** | 1 | `{ id, blockShapeRef }` to `BlockInstanceEntity` (missing required props) |

---

## Recurring themes

1. **FormContext vs useForm() return**  
   `FormContext` has `meta: ComputedRef<FormMeta>`, but useForm exposes `meta: FormMeta`. Typing or bridging in EntityFormContent / useFormFieldsContext needs to align with vee-validate’s actual types.

2. **GlobalFieldKey (string | number) vs string**  
   Many APIs expect `string` (Map keys, localeCompare, Ref<string[]>). Either narrow with `String(fieldKey)` / type guards or widen the APIs to `string | number` where correct.

3. **Missing symbol: createMaxIncomeComputed**  
   `useCapacitySettings.ts` references `createMaxIncomeComputed` 8 times; it is not defined or imported. Add implementation or import.

4. **Branded / strict types**  
   RFC3339DateTime, InternalThemeDefinition, WindowWithDebug, Partial<GlobalEntityType>, BlockInstanceEntity: conversions need `as unknown as T` or proper type guards where the compiler flags overlap.

5. **Generics and unions**  
   useBufferSettings (TValue), useCapacitySettings (Record<string, TValue>): generic constraints or overloads so concrete return types satisfy the generics.

---

## Quick reference: error codes seen

- **TS2304** – Cannot find name (e.g. createMaxIncomeComputed)
- **TS2322** – Type not assignable (including Ref/return types)
- **TS2339** – Property does not exist on type
- **TS2345** – Argument type not assignable
- **TS2352** – Conversion may be a mistake (use `unknown` first if intentional)
- **TS2536** – Type cannot be used to index type
- **TS2638** – Right operand of `in` may be primitive
- **TS2698** – Spread only from object types
- **TS2724** – Module has no exported member
- **TS5076** – Mixed `||` and `??` without parentheses
- **TS6133** – Declared but never read (unused import)
