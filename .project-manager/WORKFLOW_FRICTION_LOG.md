# Workflow friction log (harness / planning / verification)

**Purpose:** Append-only log for **material** friction with the tier harness, planning templates, gates, audits, or playbook/skill mismatches — **not** routine git issues (use `.project-manager/.git-friction-log.jsonl` for git).

**When to append:** Repeated confusion, blocked tier flow after following docs, misleading control-plane text, audit false positives worth tuning — **not** one-off typos.

**How to append:** Add a new section at the **bottom** using the template below. Prefer concrete paths, `reasonCode`s, and slash commands. Commit useful entries with other `.project-manager/` docs.

## Entry template

```markdown
### YYYY-MM-DD — [feature/phase/session/task id] — [slash command or step] — Short title

- **Symptom:** What went wrong or was unclear
- **Context:** Tier, `reasonCode` if any, relevant paths (planning doc, guide, pending file)
- **What we tried:**
- **Outcome / workaround:**
- **Suggestion:** Harness, playbook, SKILL, or doc change (optional PR note)
```

## Relationship to git friction

| Log | Owner | Typical triggers |
|-----|--------|------------------|
| `.git-friction-log.jsonl` | Harness + agents | Checkout blocked, wrong branch, merge/stash, staging surprises |
| `WORKFLOW_FRICTION_LOG.md` | Agents | Gates, parsers, audits, ARCHITECTURE.md drift, doc contradictions |

---

*(No entries yet.)*
