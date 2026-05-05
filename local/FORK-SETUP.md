# Fork setup (another PC after `git clone`)

This fork includes portable scripts under `scripts/` and `local/` so a new machine can match your usual Paperclip dev flow.

## 1. Prerequisites

- **Git**
- **Node.js** LTS — [nodejs.org](https://nodejs.org/)
- **Windows** (optional): log-on autostart uses Task Scheduler + `powershell.exe`.

## 2. Bootstrap dependencies

From the cloned repo root:

```powershell
pwsh -File ./local/fork-setup.ps1
```

Or:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\local\fork-setup.ps1
```

That runs `pnpm install` and creates a root `.env` from `.env.example` if `.env` is missing (edit values if needed).

Then start dev:

```bash
pnpm dev
```

Upstream quickstart applies for embedded DB / URLs; see the root `README.md` if anything fails to connect.

## 3. Autostart Paperclip dev on login (same as this PC)

The batch file resolves the repo path automatically (`scripts\..\`), so **do not hardcode drive letters**.

**Option A — script (recommended):**

```powershell
pwsh -File ./scripts/register-paperclip-autostart-task.ps1
```

**Option B — Task Scheduler GUI:** trigger **At log on**, action **Program:** `cmd.exe`, **arguments:** `/c "C:\FULL\PATH\TO\paperclip\scripts\paperclip-autostart-logon.cmd"`

## 4. What travels in git vs machine-only

| In this repo | Still per-machine |
|--------------|-------------------|
| `scripts/paperclip-autostart-logon.cmd` | Node/pnpm install |
| `local/fork-setup.ps1`, `scripts/register-paperclip-autostart-task.ps1` | Editing `.env`, secrets |
| `local/global-prompt-rules/` (reference skill text) | Importing skills into Paperclip UI |
| `local/paperclip-instance/` (exported `.md` snapshot) | Live `%USERPROFILE%\.paperclip\` runtime data |

After first `pnpm dev` / onboarding, Paperclip recreates instance data under **`.paperclip`** on that machine (gitignored by upstream). Use the snapshot under `local/paperclip-instance/` only as a reference when recreating agents.
