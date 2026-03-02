# Session 1.5.1 Guide: Business Rules Database Infrastructure

**Purpose:** Session-level guide with task breakdown and learning goals

**Tier:** Session (Tier 2 - Medium-Level)

---

## Quick Start

### Session Overview

**Session ID:** 1.5.1  
**Session Name:** Business Rules Database Infrastructure  
**Phase:** 1.5 - Business Rules & Validation

**Description:** Create database tables, models, and API infrastructure for admin-configurable business rules that control validation behavior in the booking wizard. Replace hardcoded validation logic with database-driven business rules that can be configured through the admin panel. Leverage existing annotation infrastructure for validation messages.

**Duration:** 3-4 hours  
**Status:** Not Started

---

## Current State Analysis

### Existing Infrastructure to Leverage

1. **Annotation System** ✅
   - `annotation_shapes` table - defines annotation types (e.g., "validation_message", "tooltip")
   - `annotation_instances` table - stores actual annotation text
   - `annotation_assignments` table - assigns annotations to block instances
   - Already in `globalData.entities.annotationShape` and `globalData.entities.annotationInstance`

2. **Business Settings Pattern** ✅
   - `business_settings` table with key-value JSONB pattern
   - `BusinessControlsTab.vue` - reference implementation for admin tabs
   - API pattern: `businessSettingsRouter.ts`

3. **Validation Composables** ✅
   - `usePropertyValidation.ts` - property step validation
   - `useContactsValidation.ts` - contacts step validation
   - `useAvailabilityValidation.ts` - availability step validation

### Hardcoded Validation Logic to Replace

#### 1. Multi-Family Property Logic
**Current Location:** `usePropertyDetailsLogic.ts` (lines 89-93), `useWizardValidationErrors.ts` (lines 93-95)

```typescript
// HARDCODED: Checks property type name for "multi" or "duplex"
const isMultiFamily = computed(() => {
  return wizard.selectedPropertyTypeBlocks.value.some(
    selected => selected.name.toLowerCase().includes('multi')
  )
})
```

**Should Be:** Database flag or business rule
- Add `isMultiFamily` boolean to `block_instances` table (follows `requiresUnitNumber` pattern)
- OR store as business rule with `rule_type: 'multi_family_property'`

#### 2. Conditional Required Fields
**Current Location:** `usePropertyValidation.ts` (lines 85-92), `useWizardValidationErrors.ts` (lines 92-98)

```typescript
// HARDCODED: numberOfUnits validation only if isMultiFamily
if (isMultiFamily.value) {
  baseRules.numberOfUnits = [
    required(...),
    min(1, ...),
    max(1000, ...)
  ]
}
```

**Should Be:** Business rule per block instance
- `rule_type: 'required_fields'`
- `rule_config: { fields: ["numberOfUnits"], condition: "isMultiFamily" }`

#### 3. Hardcoded Validation Messages
**Current Location:** `useWizardValidationErrors.ts` (lines 72-77, 104-107)

```typescript
// HARDCODED validation messages
showError('Please complete all required fields: address, city, state, zip code, and size')
showError('Please complete: ${missingFields.join(', ')}')
```

**Should Be:** Annotation instances
- Create validation message annotation instances
- Link to block instances via business rules
- `validation_message_annotation_id` → `annotation_instances.id`

#### 4. Agent/Client Always Required
**Current Location:** `useContactsValidation.ts` (lines 63-79)

```typescript
// HARDCODED: Agent fields always required
const validationRules: Record<string, ValidationRule[]> = {
  agentFirstName: [required(...)],
  agentLastName: [required(...)],
  agentEmail: [required(...), email()],
  // No conditional logic based on service selection
}
```

**Should Be:** Service-specific business rule
- Add `requiresAgent` boolean to `block_instances` table
- OR store as business rule with `rule_type: 'requires_agent'`
- Check selected services in wizard and conditionally require agent fields

#### 5. Property Type Validation Messages
**Current Location:** `usePropertyValidation.ts` (lines 97-104), `propertyValidationStrings.ts`

```typescript
// HARDCODED: Custom validator with hardcoded message
const customValidators = {
  propertyTypeBlock: () => {
    if (!hasPropertyTypeBlock.value) {
      return PROPERTY_VALIDATION_STRINGS.propertyTypeBlock.required
    }
    return true
  }
}
```

**Should Be:** Annotation-driven validation messages
- Validation message from annotation instance linked to property type selection rule

---

## Tasks

### Session Objectives

1. **Create `business_rules` table** - Store admin-configurable validation rules
2. **Create Sequelize model** - `BusinessRule` model with TypeScript types
3. **Create API routes** - CRUD endpoints for business rules management
4. **Add block instance flags** - Extend `block_instances` table with validation flags
5. **Seed default business rules** - Create seed script with default validation rules
6. **Link to annotations** - Use existing annotation infrastructure for validation messages

---

- [ ] #### Task 1.5.1.1: Create Business Rules Migration

**Goal:** Create database table for storing business rules

**Migration:** `server/src/db/migrations/[timestamp]_create_business_rules_table.mjs`

**Schema:**
```sql
CREATE TABLE business_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  block_instance_id UUID REFERENCES block_instances(id) ON DELETE CASCADE,
  rule_type VARCHAR(50) NOT NULL,  -- 'required_fields', 'requires_agent', 'conditional_validation'
  rule_config JSONB NOT NULL,      -- { fields: ["numberOfUnits"], condition: "isMultiFamily" }
  validation_message_annotation_id UUID REFERENCES annotation_instances(id) ON DELETE SET NULL,
  active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_business_rules_block_instance_id ON business_rules(block_instance_id);
CREATE INDEX idx_business_rules_rule_type ON business_rules(rule_type);
CREATE INDEX idx_business_rules_active ON business_rules(active);
```

**Rule Types:**
- `required_fields` - Defines additional required fields based on block selection
- `requires_agent` - Service requires agent/client contact information
- `conditional_validation` - Field validation depends on other field values
- `validation_message` - Custom validation message for field/block

**Rule Config Examples:**
```typescript
// Multi-family requires numberOfUnits
{
  rule_type: 'required_fields',
  rule_config: {
    fields: ['numberOfUnits'],
    condition: 'isMultiFamily'
  }
}

// Service requires agent
{
  rule_type: 'requires_agent',
  rule_config: {
    requiresAgent: true
  }
}

// Custom validation message
{
  rule_type: 'validation_message',
  rule_config: {
    field: 'propertyTypeBlock',
    messageType: 'required'
  }
}
```

---

- [ ] #### Task 1.5.1.2: Add Block Instance Validation Flags

**Goal:** Extend `block_instances` table with validation flags (follows `requiresUnitNumber` pattern)

**Migration:** `server/src/db/migrations/[timestamp]_add_validation_flags_to_block_instances.mjs`

**Columns to Add:**
```sql
ALTER TABLE block_instances 
  ADD COLUMN is_multi_family BOOLEAN DEFAULT false NOT NULL,
  ADD COLUMN requires_agent BOOLEAN DEFAULT false NOT NULL;

COMMENT ON COLUMN block_instances.is_multi_family IS 'Property type is multi-family (requires numberOfUnits field)';
COMMENT ON COLUMN block_instances.requires_agent IS 'Service requires agent/client contact information';
```

**Rationale:**
- Follows existing `requiresUnitNumber` pattern on `block_instances`
- Simple boolean flags for common validation rules
- Avoids complex business rule queries for frequent checks
- Can be supplemented with business_rules table for complex rules

---

- [ ] #### Task 1.5.1.3: Create BusinessRule Sequelize Model

**Goal:** Create TypeScript model for business rules

**File:** `server/src/db/models/admin/business_rule.ts`

**Pattern:** Follow `BusinessSettings` model structure with typed JSONB

**Model Definition:**
```typescript
export type RuleType = 
  | 'required_fields' 
  | 'requires_agent' 
  | 'conditional_validation'
  | 'validation_message'

export interface RequiredFieldsRuleConfig {
  fields: string[]
  condition?: string  // e.g., "isMultiFamily"
}

export interface RequiresAgentRuleConfig {
  requiresAgent: boolean
}

export interface ConditionalValidationRuleConfig {
  field: string
  dependsOn: string
  condition: string  // e.g., "equals", "contains"
  value: unknown
}

export interface ValidationMessageRuleConfig {
  field: string
  messageType: 'required' | 'invalid' | 'custom'
}

export type RuleConfig = 
  | RequiredFieldsRuleConfig 
  | RequiresAgentRuleConfig 
  | ConditionalValidationRuleConfig
  | ValidationMessageRuleConfig

export class BusinessRule extends Model<
  InferAttributes<BusinessRule>,
  InferCreationAttributes<BusinessRule>
> {
  declare id: CreationOptional<string>
  declare blockInstanceId: string
  declare ruleType: RuleType
  declare ruleConfig: RuleConfig
  declare validationMessageAnnotationId: string | null
  declare active: CreationOptional<boolean>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}
```

**Key Features:**
- Typed JSONB `ruleConfig` based on `ruleType`
- Optional link to `annotation_instances` for validation messages
- Follows `business_settings.ts` JSONB pattern

---

- [ ] #### Task 1.5.1.4: Create Business Rules API Router

**Goal:** Create CRUD endpoints for business rules

**File:** `server/src/routes/internal/businessRulesRouter.ts`

**Pattern:** Follow `businessSettingsRouter.ts` structure

**Endpoints:**
```typescript
GET    /api/v1/internal/business-rules              // Get all business rules
GET    /api/v1/internal/business-rules/:id          // Get business rule by ID
GET    /api/v1/internal/business-rules/block/:blockInstanceId  // Get rules for block instance
POST   /api/v1/internal/business-rules              // Create business rule
PUT    /api/v1/internal/business-rules/:id          // Update business rule
PATCH  /api/v1/internal/business-rules/:id          // Partial update
DELETE /api/v1/internal/business-rules/:id          // Delete business rule
```

**Special Endpoint:**
```typescript
GET /api/v1/internal/business-rules/block/:blockInstanceId
// Returns all business rules for a specific block instance
// Includes validation message annotations via relationship
```

**Response Format:**
```typescript
{
  id: "uuid",
  blockInstanceId: "uuid",
  ruleType: "required_fields",
  ruleConfig: {
    fields: ["numberOfUnits"],
    condition: "isMultiFamily"
  },
  validationMessageAnnotation: {
    id: "uuid",
    text: "Number of units is required for multi-family properties",
    type: "uuid"  // annotationShape reference
  },
  active: true
}
```

---

- [ ] #### Task 1.5.1.5: Seed Default Business Rules

**Goal:** Create seed script with default validation rules

**File:** `server/src/db/seedScripts/seedBusinessRules.ts` (or add to existing seed script)

**Default Rules to Seed:**

1. **Multi-Family Required Fields Rule**
   - Block: Multi-family property type blocks (find by name containing "multi")
   - Rule Type: `required_fields`
   - Config: `{ fields: ["numberOfUnits"], condition: "isMultiFamily" }`
   - Validation Message: Create annotation instance: "Number of units is required for multi-family properties"

2. **Property Type Required Rule**
   - Block: All property type block shapes (find by blockShape type)
   - Rule Type: `validation_message`
   - Config: `{ field: "propertyTypeBlock", messageType: "required" }`
   - Validation Message: Create annotation instance: "Please select at least one property type"

3. **Requires Agent Rules**
   - Block: Services that need agent info (to be determined - maybe all services by default?)
   - Rule Type: `requires_agent`
   - Config: `{ requiresAgent: true }`
   - Validation Message: Create annotation instance: "This service requires agent and client contact information"

**Seed Process:**
1. Find or create validation message annotation shape
2. Create annotation instances for each validation message
3. Find target block instances (by name pattern or blockShape reference)
4. Create business rules linking block instances to annotations
5. Update block instance flags (is_multi_family, requires_agent)

---

- [ ] #### Task 1.5.1.6: Update Block Instances with Validation Flags

**Goal:** Update existing block instances with new validation flags

**Migration:** Same as Task 1.5.1.2 or separate data migration

**Update Logic:**
```sql
-- Set is_multi_family for property types containing "multi"
UPDATE block_instances 
SET is_multi_family = true
WHERE LOWER(name) LIKE '%multi%' OR LOWER(name) LIKE '%duplex%';

-- Set requires_agent for all services (or specific services)
-- To be determined based on business requirements
UPDATE block_instances bi
SET requires_agent = true
WHERE EXISTS (
  SELECT 1 FROM block_shapes bs
  WHERE bs.id = bi.block_shape_ref
  AND bs.type = 'service'  -- Assuming block shapes have type field
);
```

---

## Success Criteria

- [ ] `business_rules` table created with proper relationships
- [ ] `block_instances` table extended with `is_multi_family` and `requires_agent` flags
- [ ] `BusinessRule` Sequelize model created with TypeScript types
- [ ] Business rules API router created with full CRUD operations
- [ ] Default business rules seeded in database
- [ ] Validation messages linked to annotation instances
- [ ] API endpoint returns rules with validation message annotations
- [ ] All migrations run successfully
- [ ] Seed scripts execute without errors

---

## Files to Create

### Database
- `server/src/db/migrations/[timestamp]_create_business_rules_table.mjs`
- `server/src/db/migrations/[timestamp]_add_validation_flags_to_block_instances.mjs`

### Models
- `server/src/db/models/admin/business_rule.ts`
- `server/src/db/models/admin/business_rule.js` (compiled)

### API Routes
- `server/src/routes/internal/businessRulesRouter.ts`

### Seed Scripts
- `server/src/db/seedScripts/seedBusinessRules.ts` (or update existing seed)

---

## Files to Modify

### Register New Model
- `server/src/db/models/index.ts` (register BusinessRule model)
- `server/src/config/app.ts` (export BusinessRule model)

### Register New Routes
- `server/src/routes/internal/index.ts` (register business rules router)

### Update Seed Script
- `server/src/db/seedScripts/seed.ts` (add seedBusinessRules call)

---

## Architecture Notes

### Design Decisions

1. **Business Rules Table vs Business Settings Table**
   - **Decision:** Create separate `business_rules` table
   - **Rationale:** 
     - One-to-many relationship (multiple rules per block instance)
     - Easier to query rules by block instance
     - More normalized for complex rule types
     - Better performance for filtering

2. **Block Instance Flags vs Business Rules Only**
   - **Decision:** Use both - flags for common cases, rules for complex cases
   - **Rationale:**
     - Flags (`is_multi_family`, `requires_agent`) are simple, fast checks
     - Business rules handle complex conditional logic
     - Follows existing `requiresUnitNumber` pattern
     - Reduces business rule query overhead for frequent checks

3. **Leverage Existing Annotations**
   - **Decision:** Use `annotation_instances` for validation messages
   - **Rationale:**
     - Reuses existing infrastructure
     - Annotations already support user-type filtering
     - Consistent pattern across app
     - Admin panel already manages annotations

4. **Rule Type Enumeration**
   - **Decision:** Use string enum for `rule_type` column
   - **Rationale:**
     - Flexible for future rule types
     - Easy to query and filter
     - TypeScript type safety via union types
     - Allows rule-specific config schemas

---

## Next Session

**Session 1.5.2:** Business Rules Admin Tab
- Create `BusinessRulesTab.vue` component
- Build UI for managing business rules
- Connect to business rules API
- Enable admin configuration of validation rules

---

## Related Documents

- **Phase 1.5 Guide:** `phase-1.5-guide.md`
- **Phase 1.5 Handoff:** `phase-1.5-handoff.md`
- **Feature Guide:** `../feature-data-flow-alignment-guide.md`
- **Business Settings Model:** `server/src/db/models/admin/business_settings.ts`
- **Annotation Infrastructure:** `server/src/db/models/booking/annotation_*.ts`

---

**Session Status:** Not Started  
**Created:** 2026-01-31  
**Last Updated:** 2026-01-31
