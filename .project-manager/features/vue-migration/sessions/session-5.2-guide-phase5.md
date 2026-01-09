# Phase 5 Session 5.2 Guide: Remove React Codebase and Update Configuration

**Feature:** Vue Migration  
**Purpose:** Session-level guide for removing React codebase and updating all configuration files to Vue-only

**Tier:** Session (Tier 3 - Detailed Implementation)

**Phase:** 5 - React Cleanup and Removal
**Session:** 5.2 - Remove React Codebase and Update Configuration
**Status:** Not Started

---

## Session Overview

**Session Number:** 5.2
**Session Name:** Remove React Codebase and Update Configuration
**Description:** Remove React codebase (`client/` directory) and update all configuration files to Vue-only. Remove React scripts, update CI/CD, update workspace rules, and remove React from slash commands.

**Duration:** Estimated 2-3 hours
**Dependencies:** Session 5.1 complete (archive created, prerequisites verified)

---

## Session Objectives

- Remove `client/` directory (entire React codebase)
- Remove React scripts from root `package.json`
- Update CI/CD configuration files
- Update deployment documentation
- Update workspace rules
- Remove React from slash commands

---

## Key Deliverables

- React codebase removed (`client/` directory deleted)
- Configuration files updated (Vue-only)
- Slash commands updated (no React target)
- CI/CD updated (no React build steps)

---

## Detailed Task Breakdown

### Task 5.2.1: Remove React Codebase

**Purpose:** Delete the entire React codebase directory

**⚠️ CRITICAL:** Ensure Session 5.1 archive is created before proceeding!

**Steps:**
1. Verify archive exists:
   ```bash
   git tag -l | grep react-codebase-archive
   # OR
   git branch -a | grep archive/react-codebase
   ```

2. Remove `client/` directory:
   ```bash
   rm -rf client/
   ```

3. Stage deletion:
   ```bash
   git add client/
   git commit -m "Remove React codebase (archived in react-codebase-archive-YYYY-MM-DD)"
   ```

**Files to Delete:**
- `client/` directory (entire React codebase)

**Deliverables:**
- `client/` directory removed
- Deletion committed to git

---

### Task 5.2.2: Remove React Scripts from Root package.json

**Purpose:** Clean up React-related scripts from root package.json

**File:** `package.json` (root)

**Steps:**
1. Open root `package.json`
2. Remove React-related scripts:
   - `client:dev`
   - `client:build`
   - `client:test`
   - `client:lint`
   - Any other `client:*` scripts
3. Update `start:dev` script if it references React
4. Update any scripts that reference `client/` directory

**Scripts to Remove:**
- All `client:*` scripts
- Any scripts that reference `client/` directory

**Deliverables:**
- Root `package.json` cleaned of React scripts
- All scripts updated to Vue-only

---

### Task 5.2.3: Update CI/CD Configuration

**Purpose:** Remove React build steps and tests from CI/CD

**Files to Modify:**
- `.github/workflows/*.yml` (if using GitHub Actions)
- `.gitlab-ci.yml` (if using GitLab CI)
- `circle.yml` (if using CircleCI)
- Any other CI/CD configuration files

**Steps:**
1. Identify CI/CD configuration files
2. Remove React build steps:
   - Remove `cd client && npm install`
   - Remove `cd client && npm run build`
   - Remove `cd client && npm test`
   - Remove React linting steps
3. Update to Vue-only:
   - Ensure `cd client-vue && npm install` exists
   - Ensure `cd client-vue && npm run build` exists
   - Ensure `cd client-vue && npm test` exists

**Deliverables:**
- CI/CD configuration updated (Vue-only)
- React build steps removed

---

### Task 5.2.4: Update Deployment Documentation

**Purpose:** Update deployment docs to remove React references

**Files to Modify:**
- `DEPLOYMENT.md` (if exists)
- `docs/deployment.md` (if exists)
- Any deployment-related documentation

**Steps:**
1. Find deployment documentation files
2. Remove React deployment steps
3. Update to Vue-only deployment
4. Remove React environment variables
5. Update build commands

**Deliverables:**
- Deployment documentation updated (Vue-only)

---

### Task 5.2.5: Update Workspace Rules

**Purpose:** Remove React-related workspace rules, add Vue-only rule

**File:** `.cursor/rules/*.mdc` or workspace rules file

**Steps:**
1. Find workspace rules files
2. Remove React-related rules:
   - Remove React migration rules
   - Remove React deprecation rules
   - Remove React comparison rules
3. Add Vue-only development rule
4. Update deprecation rule or remove it entirely

**Files to Modify:**
- `.cursor/rules/deprecation.mdc` - Remove or update deprecation rule
- Any other React-related rule files

**Deliverables:**
- Workspace rules updated (Vue-only)
- React rules removed

---

### Task 5.2.6: Remove React from Slash Commands

**Purpose:** Update slash commands to remove React targets

**Files to Modify:**
- `.cursor/commands/atomic/lint.ts` - Remove React target
- `.cursor/commands/atomic/test.ts` - Remove React target
- `.cursor/commands/composite/verify.ts` - Remove React option

**Steps:**

1. **Update lint.ts:**
   - Remove React linting target
   - Keep only Vue and server targets

2. **Update test.ts:**
   - Remove React test target
   - Keep only Vue and server targets

3. **Update verify.ts:**
   - Remove React verification option
   - Keep only Vue and server options

**Deliverables:**
- Slash commands updated (no React target)
- All commands work with Vue-only

---

## Success Criteria

- [ ] `client/` directory removed
- [ ] React scripts removed from root `package.json`
- [ ] CI/CD configuration updated (no React build steps)
- [ ] Deployment documentation updated
- [ ] Workspace rules updated (Vue-only)
- [ ] Slash commands updated (no React target)
- [ ] All changes committed to git
- [ ] Ready to proceed to Session 5.3

---

## Important Notes

**⚠️ CRITICAL WARNINGS:**

1. **Archive First:** Ensure Session 5.1 archive is created before deletion
2. **Verify Archive:** Double-check archive exists before deleting
3. **Test After Changes:** Test that Vue app still works after configuration changes
4. **Commit Incrementally:** Commit changes incrementally for easier rollback

**Verification Steps:**
- Verify Vue app starts: `cd client-vue && npm run dev`
- Verify Vue tests pass: `cd client-vue && npm test`
- Verify linting works: `/lint vue`
- Verify CI/CD pipeline passes

---

## Related Documents

- Phase Guide: `project-manager/features/vue-migration/phases/phase-5-guide.md`
- Phase Handoff: `project-manager/features/vue-migration/phases/phase-5-handoff.md`
- Previous Session: `project-manager/features/vue-migration/sessions/session-5.1-guide-phase5.md`
- Next Session: `project-manager/features/vue-migration/sessions/session-5.3-guide-phase5.md`

---

## Next Steps

After completing this session:
1. Verify all deliverables are complete
2. Test Vue app functionality
3. Test CI/CD pipeline
4. Proceed to Session 5.3: Documentation Cleanup

