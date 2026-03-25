# Session 1.3.8 Guide: Property and Address Table Separation Migration

**Feature:** Data Flow Alignment  
**Phase:** 1.3 - Interaction Fixes and Validation  
**Session:** 1.3.8 - Property and Address Table Separation Migration  
**Status:** ✅ Complete  
**Priority:** Medium  
**Started:** 2026-01-06  
**Completed:** 2026-01-06

---

## Session Overview

**Session Number:** 1.3.8  
**Session Name:** Property and Address Table Separation Migration  
**Description:** Migrated property information from single Property table to three-table structure: Address (stable client input), PropertyVersion (versioning link table), and PropertyDetails (versioned API/manual data). This separation enables better data normalization, address reuse, and prepares for future property detail versioning.

**Dependencies:** Session 1.3.7 (Client-Side Availability Calculations) ✅ Complete

---

## Objectives

- ✅ Separate Property table into three normalized tables (Address, PropertyVersion, PropertyDetails)
- ✅ Migrate existing Property data to new structure
- ✅ Update Appointment relationships to use PropertyVersion
- ✅ Update API routes for new structure
- ✅ Update frontend components and types
- ✅ Maintain backward compatibility during transition

---

## Architecture

### Three-Table Structure

**1. Address Table** (`addresses`)
- Stores stable address information from client input
- Fields: `id`, `address`, `unit`, `city`, `state`, `zipCode`, `createdAt`, `updatedAt`
- Can be reused (same address, different property records)
- Normalized for data integrity

**2. PropertyVersion Table** (`property_versions`)
- Link table connecting addresses to versioned property details
- Fields: `id`, `addressId`, `createdAt`, `updatedAt`
- Name indicates versioning purpose (prepares for future versioning logic)
- Current: one PropertyVersion per Address (1:1)
- Future: Multiple PropertyVersions per Address when versioning is implemented

**3. PropertyDetails Table** (`property_details`)
- Stores versioned property details from API or manual input
- Fields: `id`, `propertyVersionId`, `source` ('api' | 'manual' | 'client'), `mlsNumber`, `squareFootage`, `bedrooms`, `bathrooms`, `foundationAccess`, `additionalUnits`, `createdAt`, `updatedAt`
- Source tracking enables disambiguation and conflict resolution
- Current: one PropertyDetails per PropertyVersion (1:1)
- Future: Multiple PropertyDetails per PropertyVersion when versioning is implemented

### Relationship Diagram

```
Address ||--o{ PropertyVersion : "has"
PropertyVersion ||--o{ PropertyDetails : "has"
PropertyVersion ||--o{ Appointment : "references"
```

### Why Three Tables?

1. **Different Data Sources:** Address (client input, stable) vs PropertyDetails (API/manual, may change)
2. **Temporal Data Requirements:** Property details may change over time, need versioning capability
3. **Data Disambiguation:** Multiple sources may have different values, manual overrides without mutating API data
4. **Normalization Benefits:** Addresses can be reused, cleaner separation of concerns

---

## Implementation Summary

### Phase 1: Database Migrations ✅ Complete

**Migrations Created:**
- `20260106_01_create_addresses_table.mjs` - Created Address table
- `20260106_02_create_property_versions_table.mjs` - Created PropertyVersion table
- `20260106_03_create_property_details_table.mjs` - Created PropertyDetails table
- `20260106_04_update_appointments_property_reference.mjs` - Added `property_version_id` column to appointments
- `20260106_05_migrate_properties_to_three_table.mjs` - Migrated existing Property data

**Models Created:**
- `server/src/db/models/booking/address.ts` - Address model
- `server/src/db/models/booking/property_version.ts` - PropertyVersion model
- `server/src/db/models/booking/property_details.ts` - PropertyDetails model

**Models Updated:**
- `server/src/db/models/booking/appointment.ts` - Added `propertyVersionId` field
- `server/src/db/models/index.ts` - Added relationships for new models

### Phase 2: API Updates ✅ Complete

**Routes Updated:**
- `server/src/routes/internal/properties/propertyRouter.ts` - Complete rewrite for three-table structure
  - Property creation: Address → PropertyVersion → PropertyDetails
  - Property lookup: Joins Address and PropertyDetails
  - Property update: Updates PropertyDetails
- `server/src/routes/internal/appointments/appointmentRouter.ts` - Updated to use PropertyVersion with nested Address and PropertyDetails

**Scripts Updated:**
- `server/src/scripts/createAppointmentsFromCalendar.ts` - Updated to find PropertyVersion by address
- `server/src/db/seedScripts/seedAppointments.ts` - Updated to use PropertyVersion IDs
- `server/src/test/setup/seedTestData.ts` - Updated to use PropertyVersion IDs

### Phase 3: Frontend Updates ✅ Complete

**Types Updated:**
- `client-vue/src/types/property.ts` - Updated PropertyResponse to include `propertyVersionId` and `addressId`
- `client-vue/src/types/appointment.ts` - Updated to use `propertyVersionId` (with `propertyId` fallback for compatibility)

**Components Updated:**
- `client-vue/src/components/booking/BookingWizard.vue` - Updated to use `propertyVersionId`
- `client-vue/src/views/admin/tabs/components/AppointmentsTable.vue` - Updated to use `propertyVersionId`

**Transformers Updated:**
- `client-vue/src/utils/transformers/appointmentToWizardTransformer.ts` - Updated to use `propertyVersion` relationship

**Test Files Updated:**
- `client-vue/src/utils/__tests__/factories/appointmentFactory.ts` - Updated to use `propertyVersionId`
- `client-vue/src/utils/__tests__/mocks/apiHandlers.ts` - Updated mock data

---

## Relationship Changes

### Before Migration
```
Appointment → Property (propertyId)
```

### After Migration
```
Appointment → PropertyVersion (propertyVersionId)
PropertyVersion → Address (addressId)
PropertyVersion → PropertyDetails (propertyVersionId)
```

### Access Patterns
- Address: `appointment.propertyVersion.address`
- Property Details: `appointment.propertyVersion.propertyDetails[0]` (or single object)

---

## Key Files

### Database Migrations
- `server/src/db/migrations/20260106_01_create_addresses_table.mjs`
- `server/src/db/migrations/20260106_02_create_property_versions_table.mjs`
- `server/src/db/migrations/20260106_03_create_property_details_table.mjs`
- `server/src/db/migrations/20260106_04_update_appointments_property_reference.mjs`
- `server/src/db/migrations/20260106_05_migrate_properties_to_three_table.mjs`

### Models
- `server/src/db/models/booking/address.ts` - Address model
- `server/src/db/models/booking/property_version.ts` - PropertyVersion model
- `server/src/db/models/booking/property_details.ts` - PropertyDetails model
- `server/src/db/models/booking/appointment.ts` - Updated with propertyVersionId
- `server/src/db/models/index.ts` - Updated relationships

### API Routes
- `server/src/routes/internal/properties/propertyRouter.ts` - Complete rewrite
- `server/src/routes/internal/appointments/appointmentRouter.ts` - Updated for PropertyVersion

### Frontend Types
- `client-vue/src/types/property.ts` - Updated PropertyResponse
- `client-vue/src/types/appointment.ts` - Updated AppointmentRequest/Response

### Frontend Components
- `client-vue/src/components/booking/BookingWizard.vue` - Updated property creation
- `client-vue/src/views/admin/tabs/components/AppointmentsTable.vue` - Updated display

### Scripts
- `server/src/scripts/createAppointmentsFromCalendar.ts` - Updated property lookup
- `server/src/db/seedScripts/seedAppointments.ts` - Updated seed data

---

## Success Criteria

- ✅ All three tables created with proper relationships
- ✅ Existing Property data migrated successfully (30 properties)
- ✅ Appointment relationships maintained (updated to use propertyVersionId)
- ✅ API endpoints updated and working
- ✅ Frontend components updated and working
- ✅ No data loss during migration
- ✅ Backward compatibility maintained (propertyId kept as nullable for transition)

---

## Implementation Notes

### Migration Safety
- Old Property table kept during migration (for rollback capability)
- Data migration uses transactions (all or nothing)
- Foreign keys updated atomically
- Address deduplication implemented (same address = one Address record)

### Backward Compatibility
- `propertyId` field kept in Appointment model (nullable) for transition period
- API maintains transformed response structure (flat object with all fields)
- Frontend types include both `propertyVersionId` and `propertyId` (with fallbacks)

### Current Implementation
- One PropertyVersion per Address (1:1)
- One PropertyDetails per PropertyVersion (1:1)
- Simple structure, no versioning logic yet
- Source tracking implemented (`source` field in PropertyDetails)

### Future Enhancements
The three-table structure is designed to support future versioning features:
- Multiple PropertyVersions per Address
- Multiple PropertyDetails per PropertyVersion
- Version tracking and selection logic
- Active version selection
- Version history and rollback

---

## Related Documents

- **Phase Guide**: `../phases/phase-1.3-guide.md`
- **Phase Handoff**: `../phases/phase-1.3-handoff.md`
- **Session Log**: `session-1.3.8-log.md`

---

**Session Status:** ✅ Complete  
**Next Session:** Session 1.3.9 (Multi-Select Services Refactor) or Phase 1.4 (Admin Panel Data Flow Fixes)
