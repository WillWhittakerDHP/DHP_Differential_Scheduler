# Feature 19: Admin Assistance Wizard

**Feature Number:** 19
**Status:** 🔮 Future
**Created:** 2025-02-01
**Updated:** 2026-02-18
**Depends On:** Feature 18 (Admin UI Overhaul)

---

## Overview

> **Note:** This feature was originally planned as "GPT-Powered Admin Panel Automation." It has been redesigned as a deterministic guided wizard with no external AI dependency. The existing planning documents in this directory contain the original GPT-based design — they will be replaced when work begins.

Step-by-step guided wizard that walks administrators through setting up services, parts, relationships, and compositions. Replaces manual form-filling with a structured walkthrough that explains each step, validates inputs, and provides contextual help.

### Target Users
- Non-technical administrators
- Primary use case: initial bulk service setup, then periodic adjustments/additions

### Design Philosophy
- **Deterministic:** No external AI dependency — pure guided workflows
- **Educational:** Each step explains *why* the configuration matters
- **Validating:** Prevents errors through step-by-step input validation
- **Template-driven:** Common inspection types available as one-click templates

---

## Key Objectives

1. Reduce time to create a service from 15+ minutes to under 5 minutes
2. Eliminate configuration errors through step-by-step validation
3. Provide contextual help that explains each configuration choice
4. Support template-based quick setup for common service types
5. Guide administrators through relationship and composition setup

---

## Planned Phases

1. **Foundation & Wizard Framework** — Wizard shell component, step navigation, progress tracking
2. **Service Setup Wizard** — Walk through creating shapes, instances, and their relationships
3. **Relationship & Composition Wizard** — Guided cascades, constituents, and compositions setup
4. **Templates & Quick Setup** — Pre-configured service templates for common inspection types
5. **Contextual Help & Validation** — Inline help, smart suggestions, validation before each step

---

## How It Relates to Other Features

- **Feature 9 (UI Polish):** Visual polish comes first — the wizard builds on a polished admin panel
- **Feature 10 (Admin UI Overhaul):** The overhaul redesigns the admin panel structure — the wizard adds guided workflows within that redesigned structure
- **Feature 11 (this):** Adds the overlay wizard experience after the admin panel is redesigned

---

## Historical Context

This directory originally contained plans for a GPT-powered natural language automation system. The approach was redesigned because:
- External AI dependency adds cost and complexity
- Deterministic wizards are more reliable for critical admin operations
- Step-by-step guidance achieves the same goal (reducing setup time) without AI
- Templates cover the most common use cases more predictably

The original planning documents (`feature guide`, `phase-1-tasks.md`, `IMPLEMENTATION_SUMMARY.md`) reflect the GPT-based design and will be replaced when work on this feature begins.

---

**Last Updated:** 2026-02-18
