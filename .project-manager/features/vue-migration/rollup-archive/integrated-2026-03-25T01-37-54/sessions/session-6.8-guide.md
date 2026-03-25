# Phase 6 Session 6.8 Guide: Page Layout & Responsive Design

**Feature:** Vue Migration  
**Purpose:** Session-level guide for arranging elements properly and ensuring responsive layout

**Tier:** Session (Tier 3 - Detailed Implementation)

**Phase:** 6 - Booking Wizard Logic Integration
**Session:** 6.8 - Page Layout & Responsive Design
**Status:** Not Started

---

## Session Overview

**Session Number:** 6.8
**Session Name:** Page Layout & Responsive Design
**Description:** Review and adjust spacing, element visibility, and responsive behavior in ServiceSelectionStep and AvailabilityStep after data integration is complete.

**Duration:** Estimated 2-3 hours
**Dependencies:** Sessions 6.1-6.7 complete (all data integration)

---

## Session Objectives

- Review and adjust spacing in ServiceSelectionStep
- Ensure proper element visibility based on selections
- Test responsive behavior (mobile, tablet, desktop)
- Verify visual hierarchy and flow
- Update AvailabilityStep layout if needed
- Ensure descriptions display properly at all screen sizes

---

## Key Deliverables

- Properly spaced and arranged elements
- Responsive layout working
- Proper element visibility
- Visual hierarchy maintained

---

## Detailed Task Breakdown

### Task 6.8.1: Review Spacing in ServiceSelectionStep

**File:** `client-vue/src/components/booking/steps/ServiceSelectionStep.vue`

**Steps:**
1. Review spacing between sections
2. Ensure consistent margins/padding
3. Match Jose's design spacing
4. Adjust as needed

---

### Task 6.8.2: Ensure Proper Element Visibility

**Steps:**
1. Verify elements show/hide based on selections
2. Test cascading visibility
3. Ensure empty states display correctly
4. Test all visibility scenarios

---

### Task 6.8.3: Test Responsive Behavior

**Steps:**
1. Test on mobile (< 600px)
2. Test on tablet (600-960px)
3. Test on desktop (> 960px)
4. Verify User Type cards stack on mobile
5. Verify two-column layouts stack on mobile
6. Ensure touch targets are adequate (44x44px minimum)

---

### Task 6.8.4: Verify Visual Hierarchy

**Steps:**
1. Review heading sizes
2. Review text sizes
3. Review spacing hierarchy
4. Ensure important elements stand out
5. Match Jose's visual design

---

### Task 6.8.5: Update AvailabilityStep Layout

**File:** `client-vue/src/components/booking/steps/AvailabilityStep.vue`

**Steps:**
1. Review layout after data integration
2. Adjust spacing if needed
3. Ensure responsive behavior
4. Test layout at all screen sizes

---

## Success Criteria

- [ ] Spacing is consistent and appropriate
- [ ] Elements show/hide correctly based on selections
- [ ] Responsive layout works on all screen sizes
- [ ] Visual hierarchy is clear
- [ ] Descriptions display properly at all screen sizes
- [ ] Layout matches design requirements
- [ ] Ready for Session 6.9 (Availability Options Integration)

---

## Related Documents

- Phase Guide: `project-manager/features/vue-migration/phases/phase-6-guide.md`
- Project Plan: `project-manager/PROJECT_PLAN.md`
- Plan Details: `plan.plan.md`



