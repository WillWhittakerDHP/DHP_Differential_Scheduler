# Phase 1: Foundation & GPT Integration - Detailed Tasks

**Phase:** 1  
**Status:** Not Started  
**Estimated Duration:** 1 week

---

## Task 1.1: Setup GPT Service Client

### Subtasks
- [ ] Install OpenAI SDK: `cd server && npm install openai`
- [ ] Create directory structure: `server/src/ai/`
- [ ] Create `server/src/ai/gptService.ts` with basic OpenAI client setup
- [ ] Add environment variable loading for `OPENAI_API_KEY`
- [ ] Add feature flag `AI_ENABLED` (default: false)
- [ ] Add environment variable validation in `server/src/config/app.ts`
- [ ] Create TypeScript types for GPT service in `server/src/ai/types.ts`

### Acceptance Criteria
- OpenAI client initialized successfully
- Environment variables validated on server startup
- Feature flag controls AI functionality
- TypeScript types defined

### Files to Create
- `server/src/ai/gptService.ts`
- `server/src/ai/types.ts`

### Files to Modify
- `server/src/config/app.ts` - Add AI env var validation
- `server/package.json` - Add `openai` dependency

---

## Task 1.2: Create Domain Knowledge Base

### Subtasks
- [ ] Create `server/src/ai/knowledge/domainKnowledge.ts`
- [ ] Define entity schemas for:
  - [ ] `partShape` - required/optional fields, relationships
  - [ ] `blockShape` - required/optional fields, relationships
  - [ ] `partInstance` - required/optional fields, relationships
  - [ ] `blockInstance` - required/optional fields, relationships
- [ ] Document relationship types:
  - [ ] `validCascades` - BlockShape → BlockShape
  - [ ] `validConstituents` - BlockShape → PartShape
  - [ ] `activeCascades` - BlockInstance → BlockInstance
  - [ ] `activeConstituents` - BlockInstance → PartInstance
  - [ ] `validCompositions` - Shape → Shape (same type)
  - [ ] `activeCompositions` - Instance → Instance (same type)
- [ ] Document validation rules:
  - [ ] Composable BlockShapes requirement for compositions
  - [ ] No circular references in compositions
  - [ ] Same BlockShape requirement for composition particles
  - [ ] Particle-required entities cannot be composers

### Acceptance Criteria
- All entity types documented with schemas
- All relationship types documented
- Validation rules clearly defined
- Knowledge base is TypeScript-typed

### Files to Create
- `server/src/ai/knowledge/domainKnowledge.ts`

### Reference Files
- `server/src/config/entityRegistry.ts` - Entity configurations
- `server/src/routes/internal/compositions/compositionRouter.ts` - Composition validation logic
- `server/src/db/models/` - Model definitions for field names

---

## Task 1.3: Create Basic Tool Definitions

### Subtasks
- [ ] Install Zod: `cd server && npm install zod`
- [ ] Create `server/src/ai/tools/entityTools.ts`
- [ ] Implement `createEntity` function:
  - [ ] Accept entityType and data
  - [ ] Validate entityType against valid types
  - [ ] Call existing API: `POST /api/internal/entities/:entityType`
  - [ ] Return created entity
- [ ] Implement `queryEntities` function:
  - [ ] Accept entityType and optional filters
  - [ ] Call existing API: `GET /api/internal/entities/:entityType`
  - [ ] Return filtered entities
- [ ] Create GPT tool definition schemas:
  - [ ] `createEntity` tool definition (function calling format)
  - [ ] `queryEntities` tool definition
- [ ] Add Zod schemas for input validation:
  - [ ] Entity type enum validation
  - [ ] Entity data schema validation

### Acceptance Criteria
- `createEntity` tool functional and tested
- `queryEntities` tool functional and tested
- Tool definitions match OpenAI function calling format
- Input validation working

### Files to Create
- `server/src/ai/tools/entityTools.ts`

### Files to Modify
- `server/package.json` - Add `zod` dependency

### Reference Files
- `server/src/routes/internal/entities/entityRouter.ts` - API endpoints to wrap

---

## Task 1.4: Create AI Router

### Subtasks
- [ ] Create `server/src/routes/internal/ai/aiRouter.ts`
- [ ] Implement `POST /ai/execute` endpoint:
  - [ ] Accept `{ prompt: string, context?: object }`
  - [ ] Call GPT service with tool definitions
  - [ ] Execute tool calls sequentially
  - [ ] Collect execution log
  - [ ] Return results and log
- [ ] Add authentication middleware (admin only)
  - [ ] Check if user is admin (or add admin check)
  - [ ] Return 403 if not authorized
- [ ] Add rate limiting middleware:
  - [ ] Install `express-rate-limit`
  - [ ] Configure rate limits (e.g., 10 requests/minute)
- [ ] Add error handling:
  - [ ] Try-catch around GPT calls
  - [ ] Handle API errors gracefully
  - [ ] Log errors appropriately
- [ ] Add request logging

### Acceptance Criteria
- Endpoint accepts natural language prompts
- GPT service called with correct tools
- Tool calls executed successfully
- Errors handled gracefully
- Rate limiting functional

### Files to Create
- `server/src/routes/internal/ai/aiRouter.ts`

### Files to Modify
- `server/src/routes/internal/index.ts` - Add AI router
- `server/package.json` - Add `express-rate-limit` if needed

---

## Task 1.5: Integration & Testing

### Subtasks
- [ ] Add AI router to main router in `server/src/routes/internal/index.ts`
- [ ] Test GPT service connection:
  - [ ] Verify API key works
  - [ ] Test basic GPT call
- [ ] Test basic entity creation:
  - [ ] Send prompt: "Create a part type called 'Test Part'"
  - [ ] Verify GPT identifies entity type correctly
  - [ ] Verify entity created successfully
- [ ] Add unit tests:
  - [ ] Test tool wrapper functions
  - [ ] Test GPT service (with mocked responses)
  - [ ] Test error handling
- [ ] Manual testing:
  - [ ] Test with various prompts
  - [ ] Verify created entities are valid
  - [ ] Test error cases

### Acceptance Criteria
- AI router integrated into app
- GPT connection working
- Basic entity creation via GPT working
- Unit tests passing
- Manual testing successful

### Files to Create
- `server/src/ai/__tests__/gptService.test.ts`
- `server/src/ai/tools/__tests__/entityTools.test.ts`

### Files to Modify
- `server/src/routes/internal/index.ts`

---

## Testing Checklist

### Unit Tests
- [ ] GPT service client initialization
- [ ] Tool wrapper: `createEntity` with valid input
- [ ] Tool wrapper: `createEntity` with invalid input
- [ ] Tool wrapper: `queryEntities` with filters
- [ ] Domain knowledge schema validation

### Integration Tests
- [ ] End-to-end: Create partShape via GPT
- [ ] End-to-end: Create blockShape via GPT
- [ ] Error handling: Invalid entity type
- [ ] Error handling: Missing required fields

### Manual Tests
- [ ] Prompt: "Create a part type called 'Infrared Scan'"
- [ ] Prompt: "Create a block type called 'Profile'"
- [ ] Verify created entities in database
- [ ] Test rate limiting (make 11 requests quickly)

---

## Dependencies

### External
- OpenAI API key (get from OpenAI)
- Node.js packages: `openai`, `zod`, `express-rate-limit`

### Internal
- Existing admin API endpoints (`/entities/:entityType`)
- Entity registry (`server/src/config/entityRegistry.ts`)
- Database models

---

## Success Criteria

✅ **Phase 1 Complete When:**
1. GPT service client functional
2. Can create partShape via natural language: "Create a part type called 'Test'"
3. Can create blockShape via natural language
4. API endpoint `/api/internal/ai/execute` operational
5. Basic error handling working
6. Unit tests passing

---

## Notes

- Start with simple prompts, add complexity later
- Use GPT-4 for better function calling support
- Keep tool definitions simple initially
- Focus on getting basic flow working before optimization

---

**Last Updated:** 2025-02-01  
**Status:** Not Started

