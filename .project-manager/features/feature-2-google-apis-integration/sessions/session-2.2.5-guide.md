# Session 2.2.5 Guide: API Prefetching & Data Source Semantics

**Purpose:** Session-level guide with task breakdown and learning goals

**Tier:** Session (Tier 2 - Medium-Level)

---

## Quick Start

### Session Overview

**Session ID:** 2.2.5  
**Session Name:** API Prefetching & Data Source Semantics  
**Description:** Optimize API call timing by prefetching calendar events and busy times when placeId becomes available (Step 2), and clarify that data source modes control which values are *used* rather than when APIs are *called*.

**Duration:** ~3-4 hours  
**Status:** Not Started

### Learning Goals

- **API Orchestration Patterns:** Learn how to coordinate multiple API calls in a sequential chain
- **Prefetching Strategies:** Understand when and how to prefetch data before it's needed
- **Mode Semantics:** Clarify the distinction between "when API is called" vs "which value is used"
- **Vue Provide/Inject:** Use provide/inject pattern for cross-component data sharing
- **Reactive Date Ranges:** Create computed date ranges that update when displayed month changes

### Tasks

- [ ] #### Task 2.2.5.1: Create useDateRangeDecider Composable
**Goal:** Create composable that calculates date range for displayed calendar month
**Files:** 
- NEW: `client/src/composables/booking/useDateRangeDecider.ts`
**Approach:** 
- Accept optional `displayedMonth` ref (year, month)
- Return computed date range (start/end of month in UTC)
- Default to current month if no month provided
**Checkpoint:** Composable created, types correct, returns proper date range format

- [ ] #### Task 2.2.5.2: Create useApiOrchestrator Composable
**Goal:** Create orchestrator that watches placeId and dateRange, triggers sequential API chain
**Files:** 
- NEW: `client/src/composables/booking/useApiOrchestrator.ts`
**Approach:** 
- Watch placeId from propertyDetailsStepData
- Watch dateRange from dateRangeDecider
- Execute sequential chain: events API → busy times API
- Return prefetched data refs (calendarEvents, busyTimes)
- Return loading and error states
**Checkpoint:** Orchestrator created, watches trigger correctly, API chain executes sequentially

- [ ] #### Task 2.2.5.3: Integrate Orchestrator in BookingWizard
**Goal:** Set up orchestrator in parent component and provide data via inject
**Files:** 
- `client/src/components/booking/BookingWizard.vue`
**Approach:** 
- Initialize displayedMonth ref
- Create dateRange using useDateRangeDecider
- Create apiOrchestrator using useApiOrchestrator
- Provide displayedMonth, updateDisplayedMonth, and orchestrator data via inject
**Checkpoint:** Orchestrator integrated, provide/inject setup correctly, data available to children

- [ ] #### Task 2.2.5.4: Update AvailabilityStep for Month Tracking
**Goal:** Track displayed month and consume prefetched data from orchestrator
**Files:** 
- `client/src/components/booking/steps/AvailabilityStep.vue`
**Approach:** 
- Inject displayedMonth and updateDisplayedMonth from parent
- Track vDatePickerDisplayDate for VDatePicker
- Watch displayedMonth and update VDatePicker display-date
- Watch VDatePicker display-date and update parent's displayedMonth
- Watch selectedDate and update displayedMonth
- Inject apiOrchestrator and create computed refs for prefetched data
**Checkpoint:** Month tracking works, VDatePicker updates trigger orchestrator, prefetched data available

- [ ] #### Task 2.2.5.5: Update useBusyTimes for Prefetched Data
**Goal:** Accept optional prefetched busy times, consume instead of fetching
**Files:** 
- `client/src/composables/booking/useBusyTimes.ts`
**Approach:** 
- Add optional prefetchedBusyTimes parameter
- Watch prefetched data if provided, update local busyTimes ref
- Only set up fetch watch if prefetched data NOT provided
- Add logging for prefetched vs fetched data
**Checkpoint:** Composable accepts prefetched data, watches update correctly, no duplicate API calls

- [ ] #### Task 2.2.5.6: Update useAvailableStartTimes for Prefetched Events
**Goal:** Consume prefetched calendar events instead of fetching independently
**Files:** 
- `client/src/composables/booking/useAvailableStartTimes.ts`
**Approach:** 
- Remove direct calendar event fetching logic
- Accept optional prefetchedCalendarEvents parameter
- Use prefetched events if available, otherwise empty array
- Add logging for prefetched vs empty array
**Checkpoint:** Composable consumes prefetched events, no duplicate API calls, fallback works

- [ ] #### Task 2.2.5.7: Clarify Drive Time Calculator Mode Semantics
**Goal:** Ensure mode controls usage, not fetching - API always called to populate cache
**Files:** 
- `client/src/utils/booking/driveTimeCalculator.ts`
**Approach:** 
- Add guard: only calculate if placeId exists
- Refactor: Always call API (populate cache), then use mode to determine return value
- Update mode-based return logic:
  - 'default': Return static (API still called)
  - 'api': Return calculated, fail if unavailable
  - 'both': Return calculated if available, fallback to static
- Update logging to show mode and cache population
**Checkpoint:** Mode semantics clarified, API always called, mode controls return value, logging accurate

- [ ] #### Task 2.2.5.8: Update Data Source Documentation and Defaults
**Goal:** Update documentation and defaults to match clarified mode semantics
**Files:** 
- `client/src/composables/booking/useDriveTimeDataSource.ts`
- `client/src/composables/booking/useFreeBusyDataSource.ts`
**Approach:** 
- Update documentation: Mode controls usage, not fetching
- Change driveTimeDataSource default from 'both' to 'default'
- Ensure consistency between both composables
**Checkpoint:** Documentation updated, default changed, both composables consistent

- [ ] #### Task 2.2.5.9: Fix Constraint Extractors Validation
**Goal:** Update validApplyTo array to use correct values (skipDayStart/skipDayEnd)
**Files:** 
- `client/src/utils/booking/constraintExtractors.ts`
**Approach:** 
- Update validApplyTo array from ['all', 'first_only', 'last_only', 'none']
- Change to: ['all', 'skipDayStart', 'skipDayEnd', 'none']
**Checkpoint:** Validation uses correct values, matches DriveTimeApplyTo type

---

## Session Workflow

### Before Starting a Session

**Recommended:** Use `/session-start 2.2.5 "API Prefetching & Data Source Semantics"` to automatically:
- Load key sections from session handoff document
- Load relevant sections from session guide
- Generate formatted session label with date/status
- Display compact prompt format for reference
- Trigger task planning (fill out task embeds in session guide)
- Set learning goals based on session
- Identify files to work with based on handoff "Next Action"

**Manual Alternative:**
1. **Label the session** with format below
2. **Review previous session notes** (Session 2.2.4)
3. **Set learning goals** for this session
4. **Identify files to work with**

### Session Labeling Format

Each session should start with:
```
## Session: 2.2.5 - API Prefetching & Data Source Semantics
**Date:** [Date]
**Duration:** [Estimated/Actual]
**Status:** [In Progress / Completed / Blocked]
**Agent:** [Current/New]
```

### During Session

1. **Work on one task at a time**
2. **Document decisions** inline in code
3. **Ask questions** as they arise

### After Each Task - Unified Checkpoint

**CRITICAL: Automatically pause and present checkpoint summary after each task.**

**Checkpoint Type:** Choose based on task complexity:
- **Simple tasks** (Task 2.2.5.9): Quick checkpoint (quality only)
- **Complex tasks** (Tasks 2.2.5.1-2.2.5.7): Full checkpoint (quality + learning + optional feedback)

#### Quick Checkpoint Format (Simple Tasks)

```
## Checkpoint: Task 2.2.5.9

**Completed:** Updated validApplyTo array to use correct values
**Quality:** [Status from /checkpoint command]
**Next:** Session complete

[Wait for user review before continuing]
```

#### Full Checkpoint Format (Complex Tasks)

```
## Checkpoint: Task 2.2.5.2

**Completed:** Created useApiOrchestrator composable

**Learning:**
- **API Orchestration:** Sequential API chains coordinate multiple calls
- **Reactive Watchers:** Watch placeId and dateRange, trigger on changes
- **Prefetching Pattern:** Fetch data before it's needed for instant loading

**Quality:** [Status from /checkpoint command]

**Questions Answered:**
- **Q: When should orchestrator trigger?** A: When placeId becomes available OR month changes

**Next:** Task 2.2.5.3: Integrate Orchestrator in BookingWizard

[Wait for user review before continuing]
```

### End of Session

**CRITICAL: Follow end-of-session checklist before marking complete.**

1. **Verify app starts** - Run `npm run start:dev` to confirm application launches
2. **Run linting** - Execute `cd client && npm run lint` and fix any errors
3. **Update session log** - Add task entries for all completed tasks
4. **Update handoff document** - Add transition context for next session
5. **Update session guide** - Mark tasks complete, add any notes
6. **PROMPT USER FOR COMMIT AND PUSH** - After all checks pass

---

## Session Structure

### Session Labeling Format

Each session should start with:
```
## Session: 2.2.5 - API Prefetching & Data Source Semantics
**Date:** [Date]
**Duration:** [Estimated/Actual]
**Status:** [In Progress / Completed / Blocked]
**Agent:** [Current/New]
```

### Task Structure

Break each session into focused tasks. Each task should have:

- **Goal:** Clear objective for the task
- **Files:** Source and target files (if porting/migrating)
- **Approach:** How to accomplish the goal
- **Checkpoint:** What needs to be verified upon completion

**Task Format:**
```
#### Task 2.2.5.N: [Task Name]
**Goal:** [Task goal]
**Files:** 
- [Files to work with]
**Approach:** [Approach to take]
**Checkpoint:** [What needs to be verified]
```

### Session Organization

- **Quick Start:** Session overview, learning goals, tasks
- **Session Workflow:** Before/during/after session process
- **Reference:** Templates, examples, related documents
- **Notes:** Session-specific notes and decisions

---

## Learning Checkpoints

### Purpose

Learning checkpoints ensure understanding before moving forward. They're integrated into the unified checkpoint system.

### When to Use Learning Checkpoints

- **Complex tasks:** New concepts, architectural changes, framework transitions
- **Simple tasks:** Quick checkpoint (quality only) - learning optional

### Learning Checkpoint Process

After completing a task (especially complex ones), pause to:

1. **Review What Was Learned**
   - What patterns were used?
   - How does this differ from previous approaches?
   - What concepts need clarification?

2. **Verify Understanding**
   - Can you explain what was accomplished?
   - Do you understand the implementation?
   - Are there questions before continuing?

3. **Document Decisions**
   - Why was this approach chosen?
   - What alternatives were considered?
   - What might change later?

### Learning Checkpoint Format

Included in full checkpoint format:
```
**Learning:** (Optional - for complex tasks)
- [Key concepts/patterns learned]
- [Framework differences if applicable]
- [Questions answered]
```

---

## Task Template

### Task Planning Template

When planning a new task, use this structure:

```markdown
- [ ] #### Task 2.2.5.N: [Task Name]

**Goal:** [Clear, specific objective]

**Files:** 
- Source: `[source-path]` (if porting/migrating)
- Target: `[target-path]` (if creating new)

**Approach:** 
- [Step 1]
- [Step 2]
- [Step 3]

**Checkpoint:** 
- [What needs to be verified]
- [Quality criteria]
- [Learning goals if complex task]

**Learning Focus:** (Optional - for complex tasks)
- [Concept 1 to understand]
- [Concept 2 to understand]

**Dependencies:**
- [Prerequisite tasks or files]
```

### Task Entry Template (For Session Log)

When logging a completed task:

```markdown
### Task 2.2.5.N: [Name] ✅
**Completed:** [Date]
**Goal:** [What was accomplished]

**Files Created:**
- `[path]` - [Description]

**Files Modified:**
- `[path]` - [Description]

**Concepts Learned:**
- **[Concept]**: [Explanation]

**Key Methods/Functions:**
- `methodName()` - [Description]

**Architecture Notes:**
- **[Pattern]**: [Explanation]

**Learning Checkpoint:**
- [x] [Checkpoint] ✅

**Questions Answered:**
- **[Question]** - [Answer]

**Next Task:**
- [2.2.5.N+1]: [Next task]
```

---

## Reference

### Document Responsibilities

- **Session Guide** (this file): Instructions for how to work (workflow, checkpoints, end-of-session)
- **Session Log**: Historical record of what happened (task entries, concepts learned, progress)
- **Session Handoff**: Transition context for next session (where we left off, what's next)

### Documentation Templates

**See `.cursor/commands/tiers/session/templates/session-log.md` for complete documentation templates.**

Templates include:
- Task entry format for session log
- Handoff document format
- Learning-focused task template

### Related Documents

- **Session Handoff:** `.project-manager/features/feature-2-google-apis-integration/sessions/session-2.2.5-handoff.md` (transition context and planning)
- **Session Log:** `.project-manager/features/feature-2-google-apis-integration/sessions/session-2.2.5-log.md` (historical record)
- **Phase Handoff:** `.project-manager/features/feature-2-google-apis-integration/phases/phase-2.2-handoff.md` (phase-level context)

---

## Notes

- Orchestrator pattern allows prefetching data before it's needed, improving perceived performance
- Mode semantics clarification prevents confusion about when APIs are called vs when values are used
- Prefetched data pattern matches free-busy data source pattern (fetch always happens, mode controls usage)
- Month tracking ensures orchestrator re-runs when user navigates calendar, keeping data fresh
- Routes API calculations happen later in driveTimeCalculator using prefetched calendar events (not in orchestrator chain)
