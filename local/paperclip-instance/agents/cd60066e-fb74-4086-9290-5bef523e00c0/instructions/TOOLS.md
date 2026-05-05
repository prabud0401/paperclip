# Tools

## Company coordination (Paperclip API)

- Mutating calls require `Authorization: Bearer $PAPERCLIP_API_KEY` and `X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID` on every `POST`/`PATCH`.
- **Known gap (CEO / Cursor adapter):** several heartbeats observed **no `PAPERCLIP_API_KEY` in the tool shell**; `GET /api/agents/me` returns **401**. Child-issue creation and required issue comments cannot be emitted from the agent until the adapter injects the short-lived run JWT **or** the board runs the API steps manually. **`stranded_assigned_issue` on [PD-1](/PD/issues/PD-1)** surfaces as recovery [PD-3](/PD/issues/PD-3); see `_default/PD-1-liveness-evidence.json` `wake_followups` and `_default/PD-1-run-log.txt`.

## Workspace artifacts (PD-1)

- **PD-3 recovery:** [PD-3](/PD/issues/PD-3) replays stalled PD-1 delegation per §3.1 of the pack below once `PAPERCLIP_API_KEY` is available.

- Delegation pack (roadmap + hire charters + copy-paste `POST` bodies):  
  `C:\Users\prabu\.paperclip\instances\default\projects\0ae077e9-fb0e-416b-a98a-dcf2ead3e523\37299fb4-eeb5-47aa-8da3-ca9c83e6d4ca\_default\PD-1-roadmap-and-delegation.md`
- Heartbeat run log (paths + shell evidence):  
  `C:\Users\prabu\.paperclip\instances\default\projects\0ae077e9-fb0e-416b-a98a-dcf2ead3e523\37299fb4-eeb5-47aa-8da3-ca9c83e6d4ca\_default\PD-1-run-log.txt`
- **Liveness evidence (structured JSON + SHA-256 in run log):**  
  `C:\Users\prabu\.paperclip\instances\default\projects\0ae077e9-fb0e-416b-a98a-dcf2ead3e523\37299fb4-eeb5-47aa-8da3-ca9c83e6d4ca\_default\PD-1-liveness-evidence.json`

## Workspace artifacts ([PD-2](/PD/issues/PD-2) — project understanding delegated to CTO)

- **Delegation pack** (replay `POST`/`PATCH`, acceptance criteria):  
  `D:\BlueOcean main\engineering\PD-2-delegation-pack.md`
- **Run log** (401/`PAPERCLIP_API_KEY` missing evidence, `run_liveness_continuation`):  
  `D:\BlueOcean main\engineering\PD-2-run-log.txt`
- **Runnable delegation script**:  
  `D:\BlueOcean main\engineering\scripts\paperclip-delegate-pd2.ps1` (`-PrintPayloadsOnly` proved exit 0)
- **Structured liveness index (SHA catalogue for sibling files):**  
  `D:\BlueOcean main\engineering\PD-2-liveness-evidence.json`
- **_default` mirrors** (+ JSON same folder):  
  `C:\Users\prabu\.paperclip\instances\default\projects\0ae077e9-fb0e-416b-a98a-dcf2ead3e523\37299fb4-eeb5-47aa-8da3-ca9c83e6d4ca\_default\PD-2-delegation-pack.md`  
  `C:\Users\prabu\.paperclip\instances\default\projects\0ae077e9-fb0e-416b-a98a-dcf2ead3e523\37299fb4-eeb5-47aa-8da3-ca9c83e6d4ca\_default\PD-2-run-log.txt`  
  `C:\Users\prabu\.paperclip\instances\default\projects\0ae077e9-fb0e-416b-a98a-dcf2ead3e523\37299fb4-eeb5-47aa-8da3-ca9c83e6d4ca\_default\paperclip-delegate-pd2.ps1`  
  `C:\Users\prabu\.paperclip\instances\default\projects\0ae077e9-fb0e-416b-a98a-dcf2ead3e523\37299fb4-eeb5-47aa-8da3-ca9c83e6d4ca\_default\PD-2-liveness-evidence.json`  
  (JSON self-digest after last save: `C1DE9E54FDB9E004D10513C9C1864085BA7E2DB824EF425D0BC660E4D94BCEC2`)
