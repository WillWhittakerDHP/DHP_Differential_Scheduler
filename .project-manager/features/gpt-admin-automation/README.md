# GPT-Powered Admin Panel Automation

**Feature Branch:** `feature/gpt-admin-automation`  
**Status:** Planning  
**Created:** 2025-02-01

---

## Overview

This feature adds GPT-powered natural language automation to the admin panel, allowing administrators to create and configure entities (part types, profiles, composites, relationships) using natural language commands instead of manual form filling.

### Example Use Cases

1. **Simple Entity Creation:**
   ```
   "Create an infrared scan part type"
   ```

2. **Complex Composite Creation:**
   ```
   "Create infrared scan part type/profile composite, but condos shouldn't have attics"
   ```

3. **Conditional Rules:**
   ```
   "Add attic part to all profiles except condos"
   ```

---

## Quick Start

### Prerequisites

1. OpenAI API key
2. Node.js and npm installed
3. Access to admin panel

### Setup

1. **Get OpenAI API Key:**
   - Sign up at https://platform.openai.com/
   - Create API key
   - Add to `.env.development`:
     ```bash
     OPENAI_API_KEY=sk-...
     AI_ENABLED=true
     ```

2. **Install Dependencies:**
   ```bash
   cd server
   npm install openai zod express-rate-limit
   ```

3. **Start Development:**
   ```bash
   npm run start:dev
   ```

---

## Documentation

- **[Feature Plan](./feature-plan.md)** - Complete feature specification
- **[Phase 1 Tasks](./phase-1-tasks.md)** - Detailed Phase 1 implementation tasks
- **[Phase 1 Todos](./todos/phase-1-todos.json)** - Task tracking

---

## Architecture

```
Frontend (Vue.js)
  └─ AIAssistant.vue
       │
       └─ POST /api/internal/ai/execute
              │
Backend (Express)
  └─ aiRouter.ts
       │
       ├─ GPT Service (OpenAI)
       ├─ Tool Wrappers (entityTools, relationshipTools)
       └─ Domain Knowledge (schemas, rules)
              │
       └─ Existing Admin APIs
              └─ Database
```

---

## Implementation Phases

1. **Phase 1:** Foundation & GPT Integration (Week 1)
2. **Phase 2:** Relationship & Composition Management (Week 2)
3. **Phase 3:** Conditional Rules Engine (Week 3)
4. **Phase 4:** Frontend Integration (Week 4)
5. **Phase 5:** Polish, Security & Testing (Week 5)

See [feature-plan.md](./feature-plan.md) for detailed phase breakdowns.

---

## API Endpoints

### POST /api/internal/ai/execute
Execute natural language command via GPT.

**Request:**
```json
{
  "prompt": "Create an infrared scan part type"
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
  "executionLog": [...],
  "errors": []
}
```

### POST /api/internal/ai/validate
Validate command without executing.

### GET /api/internal/ai/tools
Get available tool definitions.

---

## Security

- **Authentication:** Admin-only access required
- **Rate Limiting:** 10 requests/minute per user
- **Validation:** All GPT actions validated before execution
- **Audit Logging:** All AI-generated changes logged

---

## Testing

### Unit Tests
```bash
cd server
npm test -- ai
```

### Manual Testing
1. Start server: `npm run start:dev`
2. Access admin panel
3. Navigate to AI Assistant
4. Try prompts:
   - "Create a part type called 'Test'"
   - "Create a block type called 'Profile'"

---

## Troubleshooting

### GPT API Errors
- Check `OPENAI_API_KEY` is set correctly
- Verify API key has credits
- Check rate limits

### Tool Execution Errors
- Check entity types are valid
- Verify required fields provided
- Check database connection

---

## Contributing

1. Follow existing code patterns
2. Add tests for new features
3. Update documentation
4. Follow TypeScript best practices

---

## Questions?

See [feature-plan.md](./feature-plan.md) for detailed specifications and open questions.

---

**Last Updated:** 2025-02-01

