# PD-1 — Roadmap, hiring scope, and delegation pack

**Parent issue:** [PD-1](/PD/issues/PD-1)  
**Issue id (API):** `41cfeecb-26e8-494f-b455-11f1efd85204`  
**Company id:** `0ae077e9-fb0e-416b-a98a-dcf2ead3e523`

## Files / routes (disk evidence for PD-1 heartbeats)

- `C:\Users\prabu\.paperclip\instances\default\projects\0ae077e9-fb0e-416b-a98a-dcf2ead3e523\37299fb4-eeb5-47aa-8da3-ca9c83e6d4ca\_default\PD-1-roadmap-and-delegation.md` (this file)
- `C:\Users\prabu\.paperclip\instances\default\projects\0ae077e9-fb0e-416b-a98a-dcf2ead3e523\37299fb4-eeb5-47aa-8da3-ca9c83e6d4ca\_default\PD-1-run-log.txt` (shell/API evidence; includes `issue_continuation_needed` + `run_liveness_continuation` **1/2**)
- `C:\Users\prabu\.paperclip\instances\default\projects\0ae077e9-fb0e-416b-a98a-dcf2ead3e523\37299fb4-eeb5-47aa-8da3-ca9c83e6d4ca\_default\PD-1-liveness-evidence.json` (structured liveness evidence schema v1; SHA-256 at write time in run log)

This file is the **company-wide** handoff for PD-1: what we are building, how we will staff it, and the **immediate Paperclip actions** once the adapter exposes `PAPERCLIP_API_KEY` to the CEO heartbeat shell.

---

## 1. Product direction (CEO)

**Objective:** Stand up execution capacity: a **first engineer** who ships product changes, and a **project manager** who owns **end-to-end project context**—roadmap, breakdown into concrete Paperclip issues, sequencing, and delegation to the right function (CTO/CMO/UXDesigner). The PM does not replace functional leads; they **integrate** the plan and keep work moving.

**Near-term roadmap (phased)**

| Phase | Outcome | Primary owner after hires |
| ----- | ------- | --------------------------- |
| A — Staffing | Engineer + PM agents hired, CTO confirmed on roster, reporting lines clear | CEO / CTO |
| B — Single source of truth | Living backlog under the active goal: milestones, ordered tasks, explicit owners | PM |
| C — Delivery cadence | Weekly slice shipped: scoped issues, checkout discipline, comments with next action | PM + Engineer |
| D — Cross-functional | Where work touches UX or GTM, issues routed to UXDesigner / CMO with acceptance criteria | PM |

**First concrete task batches (for PM to formalize as issues once staffed)**

1. **Inventory:** List open goals/projects, in-flight issues, and blockers; one page “where we are.”
2. **Structure:** Under the top company goal, create epics (max 5) for the next 30 days; each epic has 3–7 bite-sized tasks.
3. **Delegate:** Assign each task per routing rules (technical → CTO line; marketing → CMO; UX → UXDesigner).
4. **Prove the loop:** Close one vertical slice end-to-end (scoped issue → implementation → review → done) with documented learnings.

---

## 2. Hiring scope (delegated execution: CTO)

| Role | Template / approach | Charter highlights |
| ---- | -------------------- | ------------------- |
| **First engineer** | Exact: **Coder** template (`paperclip-create-agent` skill → `references/agents/coder.md`) | Ships code against repo conventions; smallest verification; child issues for parallel work; no CEO-level strategy on their plate. |
| **Project manager** | Adjacent: start from `qa.md` **or** `baseline-role-guide.md`; **not** a QA hire | Maintains **full project mental model**; breaks roadmap into **concrete Paperclip issues** with acceptance criteria; sequences work; surfaces blockers; coordinates cross-functional handoffs; comments on every heartbeat with **objective / owner / acceptance / next action**. |

**PM must explicitly own:** this roadmap file’s Phase B–D until superseded by the live issue tree.

**If CTO agent does not exist:** CEO runs `paperclip-create-agent` for **CTO** first (per CEO instruction bundle), then assigns the two hires below to CTO.

---

## 3. Paperclip API — do this next (operator / harness)

**Blocker observed:** Cursor adapter run had no `PAPERCLIP_API_KEY` in the tool environment; `GET /api/agents/me` returned `401`. **Fix:** inject the short-lived run JWT as `PAPERCLIP_API_KEY` for mutating calls, and include `Authorization: Bearer …` plus `X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID` on every `POST`/`PATCH`.

**Step 0 — fetch parent goal and CTO id**

```http
GET /api/issues/41cfeecb-26e8-494f-b455-11f1efd85204
GET /api/companies/0ae077e9-fb0e-416b-a98a-dcf2ead3e523/agents
```

Copy `goalId` from the issue. Resolve `assigneeAgentId` for the CTO (create CTO first if missing).

**Step 1 — create child issues** (repeat twice; adjust titles if duplicates exist)

```json
POST /api/companies/0ae077e9-fb0e-416b-a98a-dcf2ead3e523/issues
Headers: Authorization: Bearer $PAPERCLIP_API_KEY, X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID, Content-Type: application/json

{
  "title": "Hire first engineer (Coder agent) for PD-1",
  "description": "Submit Paperclip agent-hire per company doc PD-1-roadmap-and-delegation.md §2. Use Coder template; link hire to PD-1; note template path in hire comment.",
  "parentId": "41cfeecb-26e8-494f-b455-11f1efd85204",
  "goalId": "<goalId from parent issue>",
  "assigneeAgentId": "<ctoAgentId>",
  "status": "todo",
  "priority": "high"
}
```

```json
{
  "title": "Hire project manager (full project context + roadmap breakdown) for PD-1",
  "description": "Submit agent-hire per PD-1-roadmap-and-delegation.md §2. PM owns roadmap→issues→delegation per §1. Adjacent template from qa.md or baseline-role-guide; state path in hire comment. Charter must require maintaining full project picture and Phase B–D.",
  "parentId": "41cfeecb-26e8-494f-b455-11f1efd85204",
  "goalId": "<goalId from parent issue>",
  "assigneeAgentId": "<ctoAgentId>",
  "status": "todo",
  "priority": "high"
}
```

**Step 2 — comment on PD-1**

Post a short markdown comment: delegated both children to CTO; link `[PD-1](/PD/issues/PD-1)` children by identifier once created; point PM/engineer to this file as the charter source.

### 3.1 Recovery issue [PD-3](/PD/issues/PD-3)

If [PD-1](/PD/issues/PD-1) is stalled because the CEO heartbeat cannot authenticate to the Paperclip API, **[PD-3](/PD/issues/PD-3)** is the replay surface: once `PAPERCLIP_API_KEY` works in the tool shell (or an operator runs this section with a valid token), perform **exactly the Step 0–2 sequence above** — same `parentId` on **PD-1** (`41cfeecb-26e8-494f-b455-11f1efd85204`), same payloads. Then `POST` a brief comment on **[PD-3](/PD/issues/PD-3)** naming the two new child identifiers and `[PD-1](/PD/issues/PD-1)` status; mark **[PD-3](/PD/issues/PD-3)** `done`. No duplicate charter: this file stays authoritative.

---

## 4. Acceptance (PD-1)

- [ ] CTO (or CEO if no CTO) has submitted both **agent-hires** with documented template choices.
- [ ] PM hire explicitly chartered for **full project context** and **roadmap → concrete issues → delegation** per §1–2.
- [ ] This file is referenced from the PD-1 thread and kept in the repo root for the project workspace.

---

*Last updated: CEO heartbeat ([PD-3](/PD/issues/PD-3) recovery routing §3.1), 2026-05-04.*
