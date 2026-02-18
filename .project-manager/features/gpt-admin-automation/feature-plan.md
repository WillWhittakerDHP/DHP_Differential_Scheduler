# Feature Branch: GPT-Powered Admin Panel Automation

**Feature:** GPT-Powered Admin Panel Automation  
**Status:** Planning  
**Created:** 2025-02-01  
**Branch:** `feature/gpt-admin-automation`

---

## Overview

Add a GPT controller that can create and configure admin entities (part types, profiles, composites, relationships) via natural language, automating complex setups like "infrared scan part type/profile composite" with conditional rules (e.g., "condos not having attics").

### Goals

1. Enable natural language entity creation through GPT
2. Automate complex composite creation with conditional rules
3. Reduce manual configuration work for admin users
4. Provide safe, validated AI-driven configuration changes

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Vue.js)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  AIAssistant.vue - Chat Interface                    │   │
│  │  AICommandInput.vue - Natural Language Input         │   │
│  │  AIExecutionPreview.vue - Preview & Confirmation    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP POST /api/internal/ai/execute
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Express)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  aiRouter.ts - AI Endpoints                           │   │
│  │  └─ POST /ai/execute                                   │   │
│  │  └─ POST /ai/validate                                 │   │
│  │  └─ GET /ai/tools                                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                │
│  ┌─────────────────────────┼──────────────────────────┐   │
│  │                         │                            │   │
│  ▼                         ▼                            ▼   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │   │
│  │ gptService.ts│  │  Tool Wrappers│  │ Domain       │ │   │
│  │              │  │  - entityTools│  │ Knowledge    │ │   │
│  │ OpenAI API   │  │  - relTools   │  │ - Schema     │ │   │
│  │ Function     │  │  - queryTools │  │ - Rules      │ │   │
│  │ Calling      │  │               │  │ - Validation │ │   │
│  └──────────────┘  └──────────────┘  └──────────────┘ │   │
│                            │                            │   │
│                            └────────────┬───────────────┘   │
│                                         ▼                   │
│                            ┌───────────────────────┐       │
│                            │  Existing Admin APIs  │       │
│                            │  - /entities          │       │
│                            │  - /relationships      │       │
│                            │  - /compositions       │       │
│                            └───────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Foundation & GPT Integration

**Goal:** Set up GPT service client and basic tool definitions for entity creation.

**Tasks:**

1. **Setup GPT Service Client**
   - [ ] Install OpenAI SDK (`openai` package)
   - [ ] Create `server/src/ai/gptService.ts`
   - [ ] Configure OpenAI client with API key from environment
   - [ ] Add environment variable validation (`OPENAI_API_KEY`)
   - [ ] Add feature flag (`AI_ENABLED`)

2. **Create Domain Knowledge Base**
   - [ ] Create `server/src/ai/knowledge/domainKnowledge.ts`
   - [ ] Define entity schemas (partShape, blockShape, partInstance, blockInstance)
   - [ ] Document required/optional fields for each entity type
   - [ ] Document relationship types and constraints
   - [ ] Create validation rules documentation

3. **Create Basic Tool Definitions**
   - [ ] Create `server/src/ai/tools/entityTools.ts`
   - [ ] Implement `createEntity` tool wrapper
   - [ ] Implement `queryEntities` tool wrapper
   - [ ] Create tool definition schema for GPT function calling
   - [ ] Add input validation using Zod schemas

4. **Create AI Router**
   - [ ] Create `server/src/routes/internal/ai/aiRouter.ts`
   - [ ] Implement `POST /ai/execute` endpoint
   - [ ] Add authentication middleware (admin only)
   - [ ] Add rate limiting middleware
   - [ ] Integrate GPT service with tool calling
   - [ ] Add error handling and logging

5. **Integration & Testing**
   - [ ] Add AI router to `server/src/routes/internal/index.ts`
   - [ ] Test GPT service connection
   - [ ] Test basic entity creation via GPT
   - [ ] Add unit tests for tool wrappers

**Deliverables:**
- GPT service client functional
- Basic entity creation via natural language working
- API endpoint `/api/internal/ai/execute` operational

**Success Criteria:**
- Can create a partShape via natural language prompt
- GPT correctly identifies entity type and required fields
- Created entity is valid and persisted

---

### Phase 2: Relationship & Composition Management

**Goal:** Add tools for creating relationships, cascades, constituents, and compositions.

**Tasks:**

1. **Relationship Tools**
   - [ ] Create `server/src/ai/tools/relationshipTools.ts`
   - [ ] Implement `createRelationship` tool (wraps `/relationships/:relationshipType`)
   - [ ] Support all relationship types (validCascades, validConstituents, activeCascades, activeConstituents)
   - [ ] Add relationship validation logic
   - [ ] Add tool definitions for GPT

2. **Composition Tools**
   - [ ] Implement `createComposition` tool (wraps `/compositions`)
   - [ ] Add composition validation (composable BlockShapes, same type, no circular refs)
   - [ ] Handle composer/particle visibility logic
   - [ ] Add tool definitions for GPT

3. **Query & Validation Tools**
   - [ ] Implement `queryEntities` with filtering
   - [ ] Implement `validateConfiguration` tool
   - [ ] Add entity existence checking
   - [ ] Add relationship existence checking

4. **Enhanced Domain Knowledge**
   - [ ] Document relationship constraints in domain knowledge
   - [ ] Add composition rules to knowledge base
   - [ ] Document validation requirements

5. **Testing**
   - [ ] Test relationship creation via GPT
   - [ ] Test composition creation via GPT
   - [ ] Test validation tools
   - [ ] Add integration tests

**Deliverables:**
- All relationship types can be created via GPT
- Compositions can be created with proper validation
- Query tools functional for entity discovery

**Success Criteria:**
- Can create validCascade relationship via natural language
- Can create composition with proper validation
- GPT correctly handles entity lookups before creating relationships

---

### Phase 3: Conditional Rules Engine

**Goal:** Implement conditional rule system for business logic (e.g., "condos don't have attics").

**Tasks:**

1. **Rule Engine Foundation**
   - [ ] Create `server/src/ai/knowledge/ruleEngine.ts`
   - [ ] Define rule schema (condition → exclusion/inclusion)
   - [ ] Implement rule evaluation logic
   - [ ] Add rule storage (database or config file)

2. **Rule Storage**
   - [ ] Decide on storage mechanism (database table vs config file)
   - [ ] If database: Create `business_rules` table
   - [ ] If config: Create `server/src/ai/knowledge/businessRules.ts`
   - [ ] Implement CRUD operations for rules

3. **Rule Application**
   - [ ] Integrate rule engine into composition creation
   - [ ] Apply rules when creating relationships
   - [ ] Handle conditional exclusions (e.g., exclude "attic" when "condo")
   - [ ] Handle conditional inclusions (e.g., require "basement" for "multi-family")

4. **Rule Examples**
   - [ ] Implement "condos don't have attics" rule
   - [ ] Add more example rules
   - [ ] Document rule syntax and patterns

5. **Testing**
   - [ ] Test rule evaluation logic
   - [ ] Test rule application in composition creation
   - [ ] Test complex multi-rule scenarios
   - [ ] Add unit tests for rule engine

**Deliverables:**
- Rule engine functional
- Rules can be stored and evaluated
- Rules applied during entity/relationship creation

**Success Criteria:**
- "Create infrared scan composite for condos, but condos shouldn't have attics" works correctly
- Attic part is excluded when creating compositions for condo profiles
- Rules can be added/modified without code changes

---

### Phase 4: Frontend Integration

**Goal:** Build Vue.js UI components for AI assistant integration into admin panel.

**Tasks:**

1. **AI Assistant Composable**
   - [ ] Create `client/src/composables/useAIAssistant.ts`
   - [ ] Implement API calls to `/ai/execute` and `/ai/validate`
   - [ ] Manage chat history state
   - [ ] Handle loading and error states
   - [ ] Add TypeScript types

2. **AI Assistant View**
   - [ ] Create `client/src/views/admin/ai/AIAssistant.vue`
   - [ ] Build chat interface UI (Vuetify components)
   - [ ] Display conversation history
   - [ ] Show execution results
   - [ ] Add error display

3. **Command Input Component**
   - [ ] Create `client/src/components/admin/ai/AICommandInput.vue`
   - [ ] Natural language input field
   - [ ] Command history/suggestions
   - [ ] Auto-complete for common commands
   - [ ] Input validation

4. **Execution Preview Component**
   - [ ] Create `client/src/components/admin/ai/AIExecutionPreview.vue`
   - [ ] Display proposed actions before execution
   - [ ] Show entity changes preview
   - [ ] Confirmation dialog
   - [ ] Allow editing before execution

5. **Admin Panel Integration**
   - [ ] Add AI Assistant tab/button to `AdminPanel.vue`
   - [ ] Add route for AI Assistant (`/admin/ai`)
   - [ ] Integrate with existing admin navigation
   - [ ] Add feature flag check (hide if disabled)

6. **UI Polish**
   - [ ] Add loading states and animations
   - [ ] Improve error messages
   - [ ] Add success notifications
   - [ ] Responsive design (mobile-friendly)

**Deliverables:**
- AI Assistant UI integrated into admin panel
- Chat interface functional
- Execution preview working

**Success Criteria:**
- Can access AI Assistant from admin panel
- Natural language input works
- Preview shows proposed changes before execution
- Results display correctly

---

### Phase 5: Polish, Security & Testing

**Goal:** Add security, audit logging, comprehensive testing, and documentation.

**Tasks:**

1. **Security Enhancements**
   - [ ] Add authentication check (admin only)
   - [ ] Implement rate limiting (prevent abuse)
   - [ ] Add input sanitization
   - [ ] Validate all GPT responses before execution
   - [ ] Add CSRF protection

2. **Audit Logging**
   - [ ] Create `ai_audit_log` database table
   - [ ] Log all AI-generated changes (user, timestamp, actions)
   - [ ] Log GPT prompts and responses
   - [ ] Add audit log viewing in admin panel (optional)

3. **Error Handling & Rollback**
   - [ ] Implement transaction-based rollback on errors
   - [ ] Improve error messages (user-friendly)
   - [ ] Add retry logic for transient failures
   - [ ] Handle partial failures gracefully

4. **Comprehensive Testing**
   - [ ] Unit tests for all tool wrappers
   - [ ] Unit tests for rule engine
   - [ ] Integration tests for GPT execution flow
   - [ ] End-to-end tests for complex scenarios
   - [ ] Test error cases and edge conditions

5. **Documentation**
   - [ ] API documentation for AI endpoints
   - [ ] User guide for AI Assistant
   - [ ] Developer guide for adding new tools
   - [ ] Rule engine documentation
   - [ ] Architecture documentation

6. **Performance Optimization**
   - [ ] Optimize GPT prompt size
   - [ ] Cache domain knowledge
   - [ ] Add request batching where possible
   - [ ] Monitor API usage and costs

**Deliverables:**
- Secure, production-ready AI integration
- Comprehensive test coverage
- Complete documentation

**Success Criteria:**
- All security measures in place
- Audit logging functional
- Test coverage > 80%
- Documentation complete

---

## Technical Decisions

### LLM Provider
**Decision:** OpenAI GPT-4 (with function calling)  
**Rationale:** 
- Best function calling support
- Reliable API
- Good documentation
- Can switch to alternatives later if needed

**Alternative:** Anthropic Claude (if OpenAI unavailable)

### Rule Storage
**Decision:** TBD - Database table vs config file  
**Options:**
1. Database table (`business_rules`) - More flexible, can be edited via admin UI
2. Config file (`businessRules.ts`) - Version controlled, simpler

**Recommendation:** Start with config file, migrate to database if needed

### Execution Mode
**Decision:** Preview-first (default)  
**Rationale:**
- Safer for production
- Allows user review before changes
- Can add "auto-execute" option later

### UI Placement
**Decision:** Integrated into admin panel as new tab  
**Rationale:**
- Keeps admin tools together
- Easy to access
- Can be feature-flagged

---

## File Structure

### New Files

```
server/src/
├── ai/
│   ├── gptService.ts                    # OpenAI client & function calling
│   ├── tools/
│   │   ├── entityTools.ts              # Entity CRUD tool wrappers
│   │   ├── relationshipTools.ts        # Relationship creation tools
│   │   └── queryTools.ts               # Query & validation tools
│   ├── knowledge/
│   │   ├── domainKnowledge.ts          # Entity schemas & documentation
│   │   ├── ruleEngine.ts               # Rule evaluation logic
│   │   └── businessRules.ts            # Business rules definitions
│   └── types.ts                        # TypeScript types for AI system
└── routes/internal/ai/
    └── aiRouter.ts                     # AI API endpoints

client/src/
├── views/admin/ai/
│   └── AIAssistant.vue                 # Main AI assistant view
├── components/admin/ai/
│   ├── AICommandInput.vue             # Natural language input
│   └── AIExecutionPreview.vue         # Preview & confirmation
└── composables/
    └── useAIAssistant.ts               # AI assistant composable
```

### Modified Files

```
server/src/
├── config/app.ts                       # Add AI env vars validation
└── routes/internal/index.ts            # Add AI router

client/src/
└── views/admin/
    └── AdminPanel.vue                  # Add AI Assistant tab/button
```

---

## Dependencies

### New Packages

**Server:**
- `openai` - OpenAI API client
- `zod` - Schema validation for GPT responses

**Optional:**
- `langchain` - If using LangChain framework (not required initially)

### Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-...

# Optional
AI_ENABLED=true
AI_MODEL=gpt-4
AI_MAX_TOKENS=2000
AI_TEMPERATURE=0.3
```

---

## API Endpoints

### POST /api/internal/ai/execute
Execute natural language command via GPT.

**Request:**
```json
{
  "prompt": "Create an infrared scan part type",
  "context": {
    "userId": "user-123",
    "sessionId": "session-456"
  }
}
```

**Response:**
```json
{
  "result": {
    "entityId": "uuid-here",
    "entityType": "partShape",
    "name": "Infrared Scan"
  },
  "executionLog": [
    {
      "step": 1,
      "action": "createEntity",
      "entityType": "partShape",
      "result": "success"
    }
  ],
  "errors": []
}
```

### POST /api/internal/ai/validate
Validate command without executing.

**Request:**
```json
{
  "prompt": "Create infrared scan composite for condos"
}
```

**Response:**
```json
{
  "proposedActions": [
    {
      "type": "createEntity",
      "entityType": "partShape",
      "data": { "name": "Infrared Scan" }
    },
    {
      "type": "createComposition",
      "composerId": "...",
      "particleId": "..."
    }
  ],
  "confidence": 0.95,
  "warnings": []
}
```

### GET /api/internal/ai/tools
Get available tool definitions.

**Response:**
```json
{
  "tools": [
    {
      "name": "createEntity",
      "description": "Create a new entity...",
      "parameters": {...}
    }
  ]
}
```

---

## Testing Strategy

### Unit Tests
- Tool wrapper functions
- Rule engine logic
- Domain knowledge parsing
- Validation logic

### Integration Tests
- GPT execution flow (with mocked GPT responses)
- API endpoint tests
- Error handling scenarios

### End-to-End Tests
- Complete entity creation flow
- Complex composite creation with rules
- Error recovery

### Manual Testing Scenarios
1. "Create an infrared scan part type"
2. "Create infrared scan composite for condos, but condos shouldn't have attics"
3. "Add attic part to all profiles except condos"
4. Error cases: invalid entity types, missing required fields, circular references

---

## Success Metrics

1. **Functionality**
   - ✅ Can create part type via natural language
   - ✅ Can create composites with conditional rules
   - ✅ Handles "condos don't have attics" correctly
   - ✅ Validates all actions before execution

2. **User Experience**
   - ✅ Clear error messages
   - ✅ Preview before execution
   - ✅ Fast response times (< 5 seconds)
   - ✅ Intuitive UI

3. **Reliability**
   - ✅ 95%+ success rate for valid commands
   - ✅ Proper error handling and rollback
   - ✅ No data corruption

4. **Security**
   - ✅ Admin-only access
   - ✅ Rate limiting prevents abuse
   - ✅ All changes audited

---

## Risk Mitigation

### Risks

1. **GPT Hallucination** - GPT creates invalid entities
   - **Mitigation:** Comprehensive validation, preview before execution

2. **API Costs** - OpenAI API usage costs
   - **Mitigation:** Rate limiting, caching, monitoring

3. **Security** - Unauthorized access or malicious prompts
   - **Mitigation:** Authentication, input sanitization, rate limiting

4. **Data Integrity** - Incorrect changes made
   - **Mitigation:** Transactions, rollback on errors, audit logging

---

## Future Enhancements

1. **Rule Management UI** - Admin UI for managing business rules
2. **Command Templates** - Pre-defined command templates
3. **Batch Operations** - Execute multiple commands at once
4. **Learning System** - Learn from user corrections
5. **Multi-language Support** - Support for different languages
6. **Voice Input** - Voice commands for AI assistant

---

## Timeline Estimate

- **Phase 1:** 1 week
- **Phase 2:** 1 week
- **Phase 3:** 1 week
- **Phase 4:** 1 week
- **Phase 5:** 1 week

**Total:** ~5 weeks

---

## Next Steps

1. Review and approve this plan
2. Set up feature branch: `feature/gpt-admin-automation`
3. Begin Phase 1 implementation
4. Set up OpenAI API key and environment variables
5. Create initial GPT service client

---

## Questions to Resolve

1. **LLM Provider:** Confirm OpenAI GPT-4 or prefer alternative?
2. **Rule Storage:** Database table or config file?
3. **Execution Mode:** Preview-first (default) or immediate execution?
4. **UI Placement:** Standalone page or integrated tab?
5. **Budget:** OpenAI API usage limits/budget?

---

**Last Updated:** 2025-02-01  
**Status:** Planning - Ready for Review

