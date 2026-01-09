# Phase 5 React Codebase State Snapshot

**Date:** 2025-11-26  
**Purpose:** Document current state of React codebase before removal  
**Archive Tag:** `react-codebase-archive-2025-11-26`

---

## Overview

This document captures the complete state of the React codebase (`client/` directory) before its removal in Phase 5. This snapshot serves as a historical reference for the React implementation.

---

## File Structure

### Root Directory Structure

```
client/
├── dist/                    # Build output directory
├── node_modules/            # Dependencies
├── public/                  # Static assets
│   └── vite.svg
├── src/                     # Source code
│   ├── admin/              # Admin panel code
│   ├── assets/             # Assets
│   ├── global/             # Global/shared code
│   ├── pages/              # Page components
│   ├── scheduler/          # Scheduler code
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── routes.tsx
│   └── test-setup.ts
├── index.html
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── tsconfig.tsbuildinfo
└── vite.config.ts
```

### Source Directory Structure

```
client/src/
├── admin/                   # Admin panel (145 files: 72 .ts, 72 .tsx, 1 .md)
│   ├── components/         # React components
│   │   ├── applied/       # Applied components
│   │   ├── debug/         # Debug components
│   │   └── generic/        # Generic reusable components
│   │       ├── buttons/
│   │       ├── collections/
│   │       ├── fields/
│   │       ├── instances/
│   │       └── modals/
│   ├── configs/            # Configuration files
│   │   └── field/          # Field configurations
│   │       ├── display/
│   │       └── form/
│   ├── contexts/           # React contexts
│   ├── dataTransformation/ # Data transformation utilities
│   ├── hooks/              # React hooks
│   │   └── debuggers/
│   ├── propertyPage/       # Property page components
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   └── planning/
│   ├── tests/              # Test files
│   │   ├── integration/
│   │   ├── mocks/
│   │   ├── perf/
│   │   └── utils/
│   ├── types/              # TypeScript type definitions
│   │   ├── component/
│   │   ├── contexts/
│   │   └── entity/
│   └── utils/              # Utility functions
├── assets/                 # Assets
│   └── react.svg
├── global/                 # Global/shared code (21 files: 17 .ts, 4 .tsx)
│   ├── api/
│   ├── components/
│   ├── config/
│   ├── constants/
│   ├── contexts/
│   ├── hooks/
│   ├── types/
│   └── utils/
├── pages/                  # Page components (8 .tsx files)
├── scheduler/              # Scheduler code (28 files: 15 .ts, 13 .tsx)
│   ├── availability/
│   ├── components/
│   ├── configs/
│   ├── contexts/
│   ├── dataTransformation/
│   ├── externalAPI/
│   ├── internalAPI/
│   └── types/
├── App.css
├── App.tsx                 # Main App component
├── index.css
├── main.tsx               # Entry point
├── routes.tsx             # Route definitions
└── test-setup.ts          # Test setup
```

### File Count Summary

- **Total React files:** 212 files (excluding node_modules and dist)
- **TypeScript files (.ts):** ~106 files
- **React component files (.tsx):** ~100 files
- **CSS files:** 2 files
- **Other:** 4 files

---

## Dependencies

### Root `package.json` - React-Related Scripts

```json
{
  "scripts": {
    "start": "npm run client:build && npm run server",
    "start:dev": "npm run build && concurrently \"npm run server:dev\" \"wait-on tcp:3001 && npm run client:dev\"",
    "start:dev:testing": "npm run build && concurrently \"npm run server:dev\" \"wait-on tcp:3001 && npm run client:dev\" \"wait-on tcp:3001 && npm run -w client test:watch\" --names \"server,client,tests\" --prefix-colors \"blue,green,yellow\"",
    "start:dev:all": "npm run build && concurrently \"npm run server:dev\" \"wait-on tcp:3001 && npm run client:dev\" \"wait-on tcp:3001 && npm run client-vue:dev\" --names \"server,react,vue\" --prefix-colors \"blue,green,yellow\"",
    "install": "npm install --prefix server && npm install --prefix client",
    "install:all": "npm install --prefix server && npm install --prefix client && npm install --prefix client-vue",
    "client:build": "npm --prefix client run build",
    "client:dev": "npm --prefix client run dev",
    "test:client": "npm run -w client test",
    "test:client:watch": "npm run -w client test:watch",
    "test:client:coverage": "npm run -w client test -- --coverage"
  }
}
```

**React-Related Scripts:**
- `start` - Builds React client and starts server
- `start:dev` - Starts server and React client in dev mode
- `start:dev:testing` - Starts server, React client, and React tests in watch mode
- `start:dev:all` - Starts server, React client, and Vue client simultaneously
- `install` - Installs server and React client dependencies
- `install:all` - Installs server, React client, and Vue client dependencies
- `client:build` - Builds React client
- `client:dev` - Starts React client dev server
- `test:client` - Runs React client tests
- `test:client:watch` - Runs React client tests in watch mode
- `test:client:coverage` - Runs React client tests with coverage

### `client/package.json` - Dependencies

```json
{
  "name": "client",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "description": "Frontend for the app",
  "main": "src/main.tsx",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "clean": "rm -rf dist",
    "start": "node dist/index.js",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "uuid": "^11.0.5"
  },
  "devDependencies": {
    "@eslint/js": "^9.17.0",
    "@testing-library/dom": "^10.4.1",
    "@testing-library/jest-dom": "^6.8.0",
    "@testing-library/user-event": "^14.6.1",
    "eslint": "^9.17.0",
    "globals": "^15.14.0",
    "jsdom": "^27.0.0",
    "typescript": "~5.6.2",
    "typescript-eslint": "^8.18.2",
    "vite": "^6.0.5",
    "vitest": "^2.1.5"
  }
}
```

**Note:** The React dependencies are not explicitly listed in `package.json` because they're likely installed via Vite's React plugin or other build tools. The actual React packages would be in `node_modules/`.

---

## Configuration Files

### TypeScript Configuration

- `tsconfig.json` - Root TypeScript config
- `tsconfig.app.json` - App-specific TypeScript config
- `tsconfig.node.json` - Node-specific TypeScript config
- `tsconfig.tsbuildinfo` - TypeScript build info cache

### Build Configuration

- `vite.config.ts` - Vite build configuration
- `index.html` - HTML entry point

### Testing Configuration

- `test-setup.ts` - Test setup file
- Vitest configuration (likely in `vite.config.ts`)

---

## Workspace Rules

### React Migration Deprecation Rule

**File:** `.cursor/rules/deprecation.mdc`

```markdown
When migrating code from React to Vue:
1. After successfully migrating a file/feature, add a deprecation comment at the top of the React version:
   // @deprecated - Migrated to Vue. See client-vue/src/[equivalent-path]
   // This file is kept for reference only. Do not modify.
2. When planning or implementing new features, prioritize Vue versions over React versions
3. Only reference React files when:
   - Porting logic that hasn't been migrated yet
   - Understanding original implementation details
   - The Vue version doesn't exist yet
```

---

## Cursor Commands References

**React References Found:** 420 matches across 55 files in `.cursor/commands/`

These references are primarily in:
- Documentation and templates
- Utility functions that check for React/Vue patterns
- Command templates that reference both React and Vue
- Planning templates that mention React as a technology option

**Note:** These are documentation/template references, not actual React dependencies in the Vue codebase.

---

## Key React Components and Patterns

### Admin Panel (`client/src/admin/`)

- **Contexts:** React Context API for state management
  - `adminContext.tsx` - Admin state context
  - `collectionContext.tsx` - Collection management context
  - `crudContext.tsx` - CRUD operations context
  - `uiContext.tsx` - UI state context
  - `optimisticUpdateContext.tsx` - Optimistic updates context
  - `realtimeSyncContext.tsx` - Real-time sync context
  - `undoRedoContext.tsx` - Undo/redo context
  - `offlineContext.tsx` - Offline support context

- **Components:** Generic reusable React components
  - Generic buttons, collections, fields, instances, modals
  - Applied components (specific implementations)
  - Debug components

- **Hooks:** Custom React hooks
  - Debugger hooks
  - Various utility hooks

- **Data Transformation:** Transformers for data conversion
  - Bridge transformers
  - Admin transformers

### Global Code (`client/src/global/`)

- **API:** API client code
- **Components:** Global React components
- **Contexts:** Global React contexts
- **Hooks:** Global React hooks
- **Types:** Global TypeScript types
- **Utils:** Global utility functions

### Scheduler (`client/src/scheduler/`)

- **Availability:** Availability calculation logic
- **Components:** Scheduler React components
- **Contexts:** Scheduler React contexts
- **Data Transformation:** Scheduler-specific transformers
- **API:** External and internal API clients

---

## Migration Status

**All React code has been successfully migrated to Vue:**

- ✅ Phase 1: Data layer and transformers migrated
- ✅ Phase 2: State management migrated
- ✅ Phase 3: Data flow foundation verified
- ✅ Phase 4: Vuexy admin integration complete

**Vue Codebase Verification:**
- ✅ No React imports found in Vue codebase (only comment references)
- ✅ All functionality ported to Vue
- ✅ Production deployment successful
- ✅ Migration stable for required period

---

## Archive Information

**Git Tag:** `react-codebase-archive-2025-11-26`  
**Created:** 2025-11-26  
**Location:** Git repository (remote and local)  
**Purpose:** Permanent archive of React codebase before deletion

**To restore React codebase:**
```bash
git checkout react-codebase-archive-2025-11-26 -- client/
```

---

## Notes

- This snapshot was created on 2025-11-26 as part of Phase 5 Session 5.1
- The React codebase is fully functional but deprecated in favor of Vue implementation
- All React functionality has been successfully migrated to Vue
- This document serves as historical reference only
- The React codebase will be removed in Session 5.2

---

## Related Documents

- Phase 5 Handoff: `project-manager/features/vue-migration/phases/phase-5-handoff.md`
- Phase 5 Guide: `project-manager/features/vue-migration/phases/phase-5-guide.md`
- Session 5.1 Guide: `project-manager/features/vue-migration/sessions/session-5.1-guide-phase5.md`
- Backup Checklist: `project-manager/features/vue-migration/phases/phase-5-backup-checklist.md`

