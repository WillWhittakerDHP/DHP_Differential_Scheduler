# Phase 6 Session 6.10 Guide: Automated Description Generation from Website

**Feature:** Vue Migration  
**Purpose:** Session-level guide for automating description generation by reading website content and using AI to create user-type-specific descriptions

**Tier:** Session (Tier 3 - Detailed Implementation)

**Phase:** 6 - Booking Wizard Logic Integration
**Session:** 6.10 - Automated Description Generation from Website
**Status:** Not Started

---

## Session Overview

**Session Number:** 6.10
**Session Name:** Automated Description Generation from Website
**Description:** Create a tool/utility that reads content from www.districthomepro.com and uses Claude/Cursor AI to automatically generate user-type-specific descriptions (buyer, agent, owner) for services. This eliminates manual description entry and ensures descriptions stay aligned with website content.

**Duration:** Estimated 4-6 hours
**Dependencies:** Session 6.6 complete (User-Specific Descriptions - Admin Portal)

**Website:** https://www.districthomepro.com

---

## Session Objectives

- Use browser tools to read website content from districthomepro.com
- Extract service-relevant information from website pages
- Use AI (Claude/Cursor) to generate user-type-specific descriptions
- Create admin UI for triggering description generation
- Provide review/edit interface before saving to database
- Integrate with existing Description model and API

---

## Key Deliverables

- Web content reading service/utility
- AI description generation service
- Admin UI for triggering generation
- Review/edit interface for generated descriptions
- Integration with Description API
- Service mapping logic (website content → BlockInstances)

---

## Technical Approach

### Web Content Reading

**Tool:** Use Cursor MCP browser tools (`mcp_cursor-ide-browser`)
- `browser_navigate` - Navigate to website pages
- `browser_snapshot` - Get page content/structure
- `browser_click` - Navigate through menus/pages if needed

**Strategy:**
1. Navigate to districthomepro.com
2. Identify service pages (check navigation menu, service listings)
3. Extract service content from each page
4. Map website services to BlockInstance entities

### AI Description Generation

**Approach:**
1. Extract service content from website
2. Create structured prompts for each user type:
   - **Buyer-focused:** Benefits, what to expect, value proposition
   - **Agent-focused:** Process, timeline, coordination details
   - **Owner-focused:** Property insights, maintenance, recommendations
3. Use Claude/Cursor to generate descriptions
4. Return structured results for review

**Prompt Template:**
```
Given the following website content about [Service Name]:
[Website Content]

Generate three user-type-specific descriptions:
1. Buyer Description: Focus on benefits, expectations, value (2-4 sentences)
2. Agent Description: Focus on process, timeline, coordination (2-4 sentences)
3. Owner Description: Focus on property insights, maintenance (2-4 sentences)

Each description should be:
- Clear and professional
- Specific to the user type's needs
- Based on the website content provided
```

### Database Integration

**Description Model:** Already exists (`server/src/db/models/scheduler/description.ts`)
- Fields: `id`, `text`, `userType` (buyer/agent/owner/null), `createdAt`, `updatedAt`
- Many-to-many relationship with BlockInstance via `BlockInstanceDescription`

**API Extensions Needed:**
- `POST /api/descriptions/generate` - Trigger generation from website URL/service
- `POST /api/descriptions/generate-bulk` - Generate for multiple services
- `GET /api/descriptions/pending` - Get generated descriptions pending review
- `POST /api/descriptions/approve` - Approve and save generated descriptions

---

## Detailed Task Breakdown

### Task 6.10.1: Explore Website Structure

**Objective:** Understand website structure and identify service pages

**Steps:**
1. Navigate to https://www.districthomepro.com
2. Explore navigation menu to find service pages
3. Identify how services are organized (separate pages vs. one page)
4. Document service page URLs/structure
5. Identify service names and how they map to BlockInstances

**Tools:**
- `browser_navigate` - Navigate to website
- `browser_snapshot` - Get page structure
- `browser_click` - Navigate through menus

**Output:**
- List of service pages/URLs
- Service names and their website locations
- Mapping strategy (how website services → BlockInstances)

---

### Task 6.10.2: Create Web Content Extraction Service

**File:** `server/src/services/websiteContentService.ts` (new)

**Objective:** Create service to extract service content from website

**Steps:**
1. Create service class/module for website content extraction
2. Implement method to navigate to service pages
3. Extract relevant content (service descriptions, features, benefits)
4. Clean and structure extracted content
5. Return structured service content

**Code Structure:**
```typescript
export class WebsiteContentService {
  async extractServiceContent(serviceUrl: string): Promise<ServiceContent> {
    // Navigate to URL
    // Extract content
    // Return structured content
  }
  
  async extractAllServices(baseUrl: string): Promise<ServiceContent[]> {
    // Find all service pages
    // Extract each service
    // Return array of service content
  }
}

interface ServiceContent {
  name: string;
  url: string;
  content: string; // Full page content or relevant sections
  sections?: {
    overview?: string;
    features?: string;
    benefits?: string;
  };
}
```

**Note:** This may need to be a manual/script-based approach initially, or use browser automation tools available in Cursor.

---

### Task 6.10.3: Create AI Description Generation Service

**File:** `server/src/services/descriptionGenerationService.ts` (new)

**Objective:** Use AI to generate user-type-specific descriptions from website content

**Steps:**
1. Create service for AI description generation
2. Design prompt templates for each user type
3. Integrate with Claude/Cursor API (or use Cursor's built-in AI)
4. Generate descriptions for buyer, agent, owner
5. Return structured results

**Code Structure:**
```typescript
export class DescriptionGenerationService {
  async generateDescriptions(
    serviceContent: ServiceContent
  ): Promise<GeneratedDescriptions> {
    const buyerPrompt = this.buildBuyerPrompt(serviceContent);
    const agentPrompt = this.buildAgentPrompt(serviceContent);
    const ownerPrompt = this.buildOwnerPrompt(serviceContent);
    
    // Use AI to generate descriptions
    // Return structured results
  }
  
  private buildBuyerPrompt(content: ServiceContent): string {
    return `Given the following website content about ${content.name}:
${content.content}

Generate a buyer-focused description (2-4 sentences) that emphasizes:
- Benefits and value proposition
- What to expect during the service
- Why this service is valuable for buyers

Description:`;
  }
  
  // Similar for agent and owner prompts
}

interface GeneratedDescriptions {
  buyer: string;
  agent: string;
  owner: string;
}
```

**Note:** May need to use Cursor's AI capabilities directly or integrate with external API.

---

### Task 6.10.4: Create Backend API Endpoints

**File:** `server/src/routes/descriptions.ts` (extend existing or create new)

**Objective:** Create API endpoints for description generation

**Steps:**
1. Add `POST /api/descriptions/generate` endpoint
   - Accept: `{ serviceId: string, websiteUrl?: string }`
   - Return: Generated descriptions (pending review)
2. Add `POST /api/descriptions/generate-bulk` endpoint
   - Accept: `{ serviceIds: string[] }`
   - Return: Array of generated descriptions
3. Add `GET /api/descriptions/pending` endpoint
   - Return: All pending descriptions awaiting review
4. Add `POST /api/descriptions/approve` endpoint
   - Accept: `{ descriptionId: string, edits?: { text: string } }`
   - Save to database and link to BlockInstance

**Code Structure:**
```typescript
router.post('/generate', async (req, res) => {
  const { serviceId, websiteUrl } = req.body;
  
  // Extract content from website
  const content = await websiteContentService.extractServiceContent(websiteUrl);
  
  // Generate descriptions
  const descriptions = await descriptionGenerationService.generateDescriptions(content);
  
  // Store as pending (in memory or temp table)
  // Return for review
});

router.post('/approve', async (req, res) => {
  const { descriptionId, edits } = req.body;
  
  // Get pending description
  // Apply edits if provided
  // Save to database
  // Link to BlockInstance
});
```

---

### Task 6.10.5: Create Admin UI - Generation Interface

**File:** `client-vue/src/components/admin/DescriptionGenerator.vue` (new)

**Objective:** Build admin UI for triggering description generation

**Steps:**
1. Create component with service selection dropdown
2. Add "Generate from Website" button
3. Display generation status/progress
4. Show generated descriptions after generation
5. Handle errors and edge cases

**UI Elements:**
- Service selector (dropdown of BlockInstances)
- "Generate Descriptions" button
- Loading state during generation
- Generated descriptions display (buyer/agent/owner)
- "Review & Save" button

**Code Structure:**
```vue
<template>
  <VCard>
    <VCardTitle>Generate Descriptions from Website</VCardTitle>
    <VCardText>
      <VSelect
        v-model="selectedService"
        :items="services"
        label="Select Service"
      />
      <VBtn @click="generateDescriptions" :loading="generating">
        Generate from Website
      </VBtn>
      
      <div v-if="generatedDescriptions">
        <h3>Generated Descriptions</h3>
        <VTextarea v-model="generatedDescriptions.buyer" label="Buyer Description" />
        <VTextarea v-model="generatedDescriptions.agent" label="Agent Description" />
        <VTextarea v-model="generatedDescriptions.owner" label="Owner Description" />
        <VBtn @click="saveDescriptions">Save Descriptions</VBtn>
      </div>
    </VCardText>
  </VCard>
</template>
```

---

### Task 6.10.6: Create Admin UI - Review & Edit Interface

**Objective:** Build UI for reviewing and editing generated descriptions

**Steps:**
1. Display generated descriptions in editable form fields
2. Allow editing each description before saving
3. Add "Approve & Save" button
4. Link descriptions to selected BlockInstance
5. Show success/error messages

**UI Elements:**
- Editable text areas for each user type description
- Preview of how descriptions will appear
- "Approve & Save" button
- "Cancel" button to discard

---

### Task 6.10.7: Integrate with Description API

**Objective:** Connect frontend to backend API endpoints

**Steps:**
1. Create API client methods for description generation
2. Create composable for description generation (`useDescriptionGenerator.ts`)
3. Connect UI components to API
4. Handle loading states and errors
5. Test end-to-end flow

**File:** `client-vue/src/composables/useDescriptionGenerator.ts` (new)

**Code Structure:**
```typescript
export function useDescriptionGenerator() {
  const generating = ref(false);
  const generatedDescriptions = ref<GeneratedDescriptions | null>(null);
  
  const generateDescriptions = async (serviceId: string) => {
    generating.value = true;
    try {
      const response = await descriptionApi.generate(serviceId);
      generatedDescriptions.value = response.data;
    } catch (error) {
      // Handle error
    } finally {
      generating.value = false;
    }
  };
  
  const saveDescriptions = async (serviceId: string, descriptions: GeneratedDescriptions) => {
    // Save to database
  };
  
  return {
    generating,
    generatedDescriptions,
    generateDescriptions,
    saveDescriptions,
  };
}
```

---

### Task 6.10.8: Add to Admin Portal

**Objective:** Add description generator to admin portal

**Steps:**
1. Add Description Generator component to admin portal
2. Add route/navigation item if needed
3. Or integrate into existing Description management page
4. Test full workflow

**Integration Options:**
- Add as new page in admin portal
- Add as tab/section in Description management
- Add as button/modal in BlockInstance form

---

## Success Criteria

- [ ] Can navigate to districthomepro.com and extract service content
- [ ] Can identify service pages and extract relevant content
- [ ] Can generate user-type-specific descriptions using AI
- [ ] Generated descriptions are relevant and well-formatted
- [ ] Admin can trigger generation from UI
- [ ] Admin can review generated descriptions before saving
- [ ] Admin can edit generated descriptions
- [ ] Descriptions are correctly saved to database with user type tags
- [ ] Descriptions are correctly linked to BlockInstances
- [ ] Error handling works for invalid URLs or failed generation

---

## Open Questions

1. **Website Structure:** How are services organized on the website? (Separate pages vs. one page)
2. **Service Mapping:** How do we map website services to BlockInstances? (Manual mapping vs. auto-detect by name)
3. **Content Selection:** Should admins select specific sections of website, or auto-detect all relevant content?
4. **AI Integration:** Use Cursor's built-in AI or external API? (May need to use Cursor's AI directly)
5. **Generation Frequency:** One-time generation or periodic updates?
6. **Quality Threshold:** What quality checks should be in place before allowing save?

---

## Notes

**Key Principles:**
- **Quality Over Speed:** Generated descriptions should be reviewed before saving
- **User Control:** Admins should have full control over what gets saved
- **Flexibility:** Support different website structures and content formats
- **Extensibility:** Design for future enhancements (other content sources, different AI models)

**Website:** https://www.districthomepro.com

**Future Enhancements:**
- Periodic auto-updates from website changes
- Support for multiple website sources
- Description versioning/history
- A/B testing different description variations
- Analytics on description effectiveness

**Implementation Notes:**
- May need to use Cursor's browser tools and AI capabilities directly
- Consider creating a script/utility that can be run manually initially
- May need to manually map website services to BlockInstances initially
- Can iterate on prompt engineering to improve description quality

---

## Related Documents

- **Description Model:** `server/src/db/models/scheduler/description.ts`
- **BlockInstanceDescription Model:** `server/src/db/models/scheduler/block_instance_description.ts`
- **Session 6.6 Guide:** User-Specific Descriptions - Admin Portal
- **Phase Guide:** `project-manager/features/vue-migration/phases/phase-6-guide.md`
- **Project Plan:** `project-manager/PROJECT_PLAN.md`

---

## Next Steps

1. **Explore Website:** Navigate to districthomepro.com and identify service pages
2. **Document Structure:** Document how services are organized on website
3. **Create Extraction Service:** Build service to extract website content
4. **Test AI Generation:** Test AI description generation with sample content
5. **Build API:** Create backend API endpoints
6. **Build UI:** Create admin UI components
7. **Test End-to-End:** Test full workflow from website → AI → database

