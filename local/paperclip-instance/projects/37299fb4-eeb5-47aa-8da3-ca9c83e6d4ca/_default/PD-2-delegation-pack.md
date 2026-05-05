# PD-2 — Delegation pack (technical project understanding → CTO)

**Parent issue:** [PD-2](/PD/issues/PD-2)  
**Issue id (API):** `09d7c079-a94b-43e8-8ea8-bf117da3dfcb`  
**Company id:** `0ae077e9-fb0e-416b-a98a-dcf2ead3e523`

## Files / routes (disk evidence for PD-2 heartbeats)

| Path | Purpose |
| ---- | ------- |
| `D:\BlueOcean main\engineering\PD-2-delegation-pack.md` | Operator replay + script pointer (this file) |
| `D:\BlueOcean main\engineering\PD-2-run-log.txt` | Shell/API + liveness evidence (attempts 1–2) |
| `D:\BlueOcean main\engineering\scripts\paperclip-delegate-pd2.ps1` | Runnable `GET→POST→PATCH`/comment path |
| `D:\BlueOcean main\engineering\PD-2-liveness-evidence.json` | Structured liveness dossier (`sha256` for sibling artefacts) |

---
## 1. CEO routing (immutable for this ticket)

“Read and understand the project” is **technical discovery**. **CTO** produces the canonical briefing as an issue document on the **child** issue (`plan` or `overview` key). CEO **does not** perform repo archaeology.

Execution workspace pinned by harness: `D:/BlueOcean main/engineering`.

Directional snapshot for CTO validation (non-authoritative): **Highgate Engineering Contract** automation — PDF ingest/classify → GPT-4o extraction → SQL Server + MongoDB → cross-document mapping — see `highgate_engineering_contract/README.md`.

---

## 2. Paperclip API — run when `PAPERCLIP_API_KEY` is available

### One-shot script (preferred)

Runnable operator path (audited mutations, resolves `goalId` from `heartbeat-context`):

`D:\BlueOcean main\engineering\scripts\paperclip-delegate-pd2.ps1`

- Preview JSON without auth: `-PrintPayloadsOnly -CtoAgentId <uuid>`
- Live: set `PAPERCLIP_API_KEY` + required `PAPERCLIP_*` env vars, then  
  `.\scripts\paperclip-delegate-pd2.ps1 -CtoAgentId <ctoAgentId> -BlockParent`  
  (omit `-BlockParent` to only `POST` a delegation comment on [PD-2](/PD/issues/PD-2) after child create)

### Manual HTTP (same as prior pack)

Include on every **`POST`** / **`PATCH`**:

`Authorization: Bearer $PAPERCLIP_API_KEY`  
`X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID`

### Step 0 — goal + CTO

```http
GET /api/issues/09d7c079-a94b-43e8-8ea8-bf117da3dfcb/heartbeat-context
GET /api/companies/0ae077e9-fb0e-416b-a98a-dcf2ead3e523/agents
```

Copy `goalId` (and `projectId` if present). Resolve **`assigneeAgentId`** for CTO (hire via `paperclip-create-agent` if missing).

### Step 1 — create CTO child issue

```http
POST /api/companies/0ae077e9-fb0e-416b-a98a-dcf2ead3e523/issues
Content-Type: application/json

{
  "title": "Technical orientation: Engineering workspace + automation stack (parent PD-2)",
  "description": "Anchor on workspace `D:/BlueOcean main/engineering`. Read `highgate_engineering_contract/` and `backend.highgate_engineering_contract/` (relationship, ownership boundaries). Produce an issue document on **this child** (`overview` preferred, else `plan`) covering: runtime entrypoints, data stores, secrets/config surfaces, integrations (Azure/Power Automate/etc. as evidenced in code/docs), CI/dev expectations, principal risks/TODOs. Every claim must cite repo-relative file paths.",
  "parentId": "09d7c079-a94b-43e8-8ea8-bf117da3dfcb",
  "goalId": "<paste goalId from heartbeat-context>",
  "assigneeAgentId": "<ctoAgentId>",
  "status": "todo",
  "priority": "medium"
}
```

Substitute literals from Step 0. Record the **`id`** of the created issue (`<childId>`) and identifier (`PD-n`).

### Step 2 — wire dependency (recommended)

Keeps PD-2 from closing before the briefing lands.

```http
PATCH /api/issues/09d7c079-a94b-43e8-8ea8-bf117da3dfcb

{
  "status": "blocked",
  "blockedByIssueIds": ["<childId>"],
  "comment": "**Delegated** technical project understanding on [PD-2](/PD/issues/PD-2) to CTO via child [<child prefix>](/PD/issues/<child prefix>). PD-2 is blocked until that child documents the stack in its issue doc; CEO closes PD-2 after review."
}
```

If your convention is “parent stays `in_progress` and waits for `issue_children_completed`,” skip this `blocked` PATCH and substitute a **comment-only** handoff—but still **link the child**.

### Step 3 — comment on PD-2 (if Step 2 skipped `comment` field)

`POST /api/issues/09d7c079-a94b-43e8-8ea8-bf117da3dfcb/comments` with markdown summarizing delegation, CTO owner, acceptance (issue doc + path citations), link `[PD-<n>](/PD/issues/PD-<n>)` once known.

---

## 3. Acceptance (CTO child)

Child reaches **`done`** when its **`overview`** (or **`plan`**) exists, is internally consistent with the repo layout, lists **explicit file paths**, and surfaces **blocking unknowns** (if any).

---

## 4. CEO follow-through

After child completes: read the doc once, **`PATCH` PD-2** `done` with comment referencing the CTO document link `#document-overview` or `#document-plan`, extract any durable strategic facts into CEO PARA if warranted.
