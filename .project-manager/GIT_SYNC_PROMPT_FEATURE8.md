# Prompt: Keep Feature 8 work aligned with `main` (copy into a new chat)

Use the block below as the opening message when picking up work on **Feature 8** (phase-8.x session branches or a dedicated feature branch) so the agent stays consistent with repo reality.

---

## Context for the agent

- **Feature 6 (appointment workflow)** is developed on branch `feature/appointment-workflow`. It is **not finished**, but it was **merged with `origin/main`** so local work includes **authentication (Feature 7)**, booking, and server changes from `main`.
- **Feature 7 (authentication)** is **closed**; its code lives on **`main`** (and `develop`). Older remote branches like `phase-7.*` / `session-7.*` may be **deleted or stale**—do **not** assume they are the source of truth.
- **Feature 8** work should treat **`origin/main` as the baseline** for shared infrastructure (auth, server, client patterns). Session branches such as `phase-8.1`, `phase-8.2`, … exist on the remote for harness/tier workflow; align their **code** with `main` often.

## How you should respond

1. **Before coding:** `git fetch origin` and confirm whether the current branch is behind `origin/main`. If Feature 8 depends on appointment work, also compare with `origin/feature/appointment-workflow`.
2. **To stay current:** merge `origin/main` into the Feature 8 branch regularly (`git merge origin/main`) or rebase if the team agrees—**resolve conflicts** with `main` as the authority for auth/server/shared Vue patterns unless the task is explicitly appointment-specific.
3. **Do not** recreate or depend on Feature 7–only branches for auth behavior; use **`main`** and the files under `server/src/auth/`, `client/…` as merged.
4. **Multi-machine:** After syncing, **push** the Feature 8 branch so the other machine can `git fetch` / `git merge` (or pull) the same tip—**remote branches are the handshake**, not un-pushed local only commits.
5. If **merge conflicts** appear in booking/admin files, prefer the **integrated patterns from `main`** unless the session task is specifically to extend `feature/appointment-workflow` behavior—then merge carefully and preserve appointment semantics.

## One-liner sync (Feature 8 branch)

```bash
git fetch origin && git checkout <feature-8-branch> && git merge origin/main
```

(Resolve conflicts, run `cd client && npm run lint` and `cd server && npm run lint`, then commit.)

---

**Last updated:** 2026-03-23 — after merging `origin/main` into `feature/appointment-workflow`.
