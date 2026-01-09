# Naming Conventions

**Feature:** Data Flow Alignment  
**Last Updated:** 2026-01-07

---

## Overview

This document defines naming conventions for the codebase, established during Phase 1.3 Session 1.3.1 to align with Vue.js best practices and user-facing terminology.

---

## Composables

**Pattern:** `useXxx` (no suffix)

**Examples:**
- `useBooking()` - Booking feature data access
- `useGlobal()` - Global entity data access  
- `useAdmin()` - Admin feature data access
- `useBookingWizard()` - Wizard state management
- `useAppointment()` - Appointment CRUD operations
- `useProperty()` - Property CRUD operations
- `useUser()` - User CRUD operations

**Rationale:** 
- Follows Vue.js conventions (similar to `useRouter`, `useRoute`, `useStore` from Vue ecosystem)
- No suffix needed - the `use` prefix already indicates it's a composable
- Cleaner and more consistent than `useXxxComp` pattern

**Migration:** 
- Old pattern: `useSchedulerComp()`, `useGlobalComp()`, `useAdminComp()`
- New pattern: `useBooking()`, `useGlobal()`, `useAdmin()`
- Changed: 2025-12-28

---

## Feature Terminology

### Booking vs Scheduler

**"Booking"** = User-facing feature terminology
- Users "book" appointments
- Booking wizard, booking data, booking flow
- Matches user mental model

**"Scheduler"** = Legacy term (no longer used)
- Previously used for internal implementation
- Renamed to "booking" to align with user language
- Migration completed: 2025-12-28

### Data Layer Distinction

**`useBooking()`** - Optimized data for booking wizard
- Transforms global data into booking-optimized format
- Provides `BookingData`, `BookingBlockInstance`, `BookingPartInstance`
- Used by booking wizard components

**`useGlobal()`** - Raw entity data (internal)
- Provides access to all entities from Vue Query cache
- Base data layer used by other composables
- Used by admin panel and booking features

**`useAdmin()`** - Optimized data for admin panel
- Transforms global data into admin-optimized format
- Provides admin-specific entity operations
- Used by admin panel components

---

## Type Naming

### Booking Types

**Pattern:** `BookingXxx`

**Examples:**
- `BookingData` - Container for booking-optimized data
- `BookingBlockInstance` - Block instance optimized for booking
- `BookingPartInstance` - Part instance optimized for booking
- `BookingTransformer` - Transformer class for booking data

**Migration:**
- Old: `SchedulerData`, `SchedulerBlockInstance`, `SchedulerPartInstance`, `SchedulerTransformer`
- New: `BookingData`, `BookingBlockInstance`, `BookingPartInstance`, `BookingTransformer`
- Changed: 2025-12-28

### Transformer Naming

**Pattern:** `globalToXxxTransformer` or `xxxTransformer`

**Examples:**
- `globalToBookingTransformer` - Transforms global data to booking format
- `globalToAdminTransformer` - Transforms global data to admin format
- `appointmentToWizardTransformer` - Transforms appointment to wizard state

---

## Folder Structure

### Frontend Folders

**Pattern:** Feature-based folder names

**Examples:**
- `components/booking/` - Booking wizard components
- `views/booking/` - Booking wizard views
- `components/admin/` - Admin panel components
- `views/admin/` - Admin panel views

**Migration:**
- Old: `components/scheduler/`, `views/scheduler/`
- New: `components/booking/`, `views/booking/`
- Changed: 2025-12-28

### Backend Folders

**Pattern:** Feature-based folder names in models

**Examples:**
- `server/src/db/models/booking/` - Booking-related models (appointments, properties)
- `server/src/db/models/admin/` - Admin-related models (block shapes, part shapes)
- `server/src/db/models/participantModels/` - User/participant models

**Migration:**
- Old: `server/src/db/models/scheduler/`
- New: `server/src/db/models/booking/`
- Changed: 2025-12-28

**Note:** Database table names remain unchanged (e.g., `appointments`, `properties`, `block_instances`). Only folder structure changed.

---

## Database Naming

**Database Name:** `scheduler_db` (historical name, unchanged)

**Rationale:** 
- Database name is historical and changing it would require migration
- Database name doesn't affect code functionality
- Table names are descriptive and don't use "scheduler" prefix

**Table Names:** Use descriptive, feature-agnostic names
- `appointments` - Not `scheduler_appointments`
- `properties` - Not `booking_properties`
- `block_instances` - Not `scheduler_block_instances`

---

## Variable Naming

### Composable Instances

**Pattern:** `xxxInstance` or `xxxData`

**Examples:**
- `bookingInstance` - Singleton for `useBooking()`
- `globalInstance` - Singleton for `useGlobal()`
- `adminInstance` - Singleton for `useAdmin()`
- `bookingData` - Computed data from `useBooking()`
- `globalData` - Computed data from `useGlobal()`

**Migration:**
- Old: `schedulerCompInstance`, `globalCompInstance`, `adminCompInstance`, `schedulerData`
- New: `bookingInstance`, `globalInstance`, `adminInstance`, `bookingData`
- Changed: 2025-12-28

---

## Component Naming

### Field vs Input Terminology

**"Field"** = Data model concept (property/key in entities)
- Used for: `GlobalFieldKey`, `fieldKey`, `DisplayFieldConfig`, `FormFieldConfig`
- Represents: The property/key in the data model (e.g., `name`, `orderIndex`)
- Examples: `GlobalFieldKey<GE>`, `fieldKey: GlobalFieldKey<GE>`, `DisplayFieldConfig`

**"Input"** = UI component (interactive element)
- Used for: `InputRenderer`, `TextInput`, `BooleanInput`, `BaseInput`, `SelectInputs`, `PrimitiveInputs`
- Represents: The actual UI component users interact with
- Examples: `<InputRenderer>`, `<TextInput>`, `<BaseInput>`

**Rationale:**
- Distinguishes between data model concepts and UI components
- Aligns with common UI framework patterns (Vuetify uses `VTextField`, `VSelect`, etc.)
- Makes codebase terminology clearer and more maintainable
- Prevents confusion between "field" (data property) and "field" (UI element)

**Migration:**
- Old component names: `FieldRenderer`, `TextInputField`, `BooleanInputField`, `NumberInputField`, `DateInputField`, `TextAreaInputField`, `IconInputField`, `BaseField`, `PrimitiveFields`, `SelectFields`
- New component names: `InputRenderer`, `TextInput`, `BooleanInput`, `NumberInput`, `DateInput`, `TextAreaInput`, `IconInput`, `BaseInput`, `PrimitiveInputs`, `SelectInputs`
- Changed: 2026-01-07 (Session 1.4.4)

**Note:** Configuration types (`DisplayFieldConfig`, `FormFieldConfig`) remain as "Field" since they configure data fields, not UI components.

---

## Best Practices

1. **Use descriptive names** - Names should clearly indicate purpose
2. **Follow Vue conventions** - Use `useXxx` for composables
3. **Match user language** - Use "booking" not "scheduler" for user-facing features
4. **Be consistent** - Use same naming pattern across similar concepts
5. **Update comments** - Keep code comments aligned with naming conventions

---

## Migration History

**2026-01-07:** Renamed UI components from "Field" to "Input" terminology
- Renamed `FieldRenderer` → `InputRenderer`
- Renamed `TextInputField` → `TextInput`
- Renamed `BooleanInputField` → `BooleanInput`
- Renamed `NumberInputField` → `NumberInput`
- Renamed `DateInputField` → `DateInput`
- Renamed `TextAreaInputField` → `TextAreaInput`
- Renamed `IconInputField` → `IconInput`
- Renamed `BaseField` → `BaseInput`
- Renamed `PrimitiveFields` → `PrimitiveInputs`
- Renamed `SelectFields` → `SelectInputs`
- Updated all imports, references, and documentation
- Rationale: Distinguish data model concepts ("field") from UI components ("input")

**2025-12-28:** Renamed composables and types
- Removed `-Comp` suffix from all composables
- Renamed "scheduler" to "booking" throughout codebase
- Updated folder structure to use "booking" terminology
- Updated all code comments and documentation

---

## Related Documents

- **Session Summary**: `../sessions/session-1.3.1-summary.md`
- **Feature Plan**: `../feature-plan.md`
- **Phase Guide**: `../phases/phase-1.3-guide.md`

