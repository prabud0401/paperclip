import type { AdapterModelProfileDefinition } from "@paperclipai/adapter-utils";

export const type = "cursor";
export const label = "Cursor CLI (local)";

export const DEFAULT_CURSOR_LOCAL_MODEL = "composer-2";

const CURSOR_FALLBACK_MODEL_IDS = [
  "auto",
  "composer-2",
  "composer-2-fast",
  "composer-1.5",
  "composer-1.5-fast",
  "composer-1",
  "composer-1-fast",
  "gpt-5.3-codex-low",
  "gpt-5.3-codex-low-fast",
  "gpt-5.3-codex",
  "gpt-5.3-codex-fast",
  "gpt-5.3-codex-high",
  "gpt-5.3-codex-high-fast",
  "gpt-5.3-codex-xhigh",
  "gpt-5.3-codex-xhigh-fast",
  "gpt-5.3-codex-spark-preview",
  "gpt-5.2",
  "gpt-5.2-codex-low",
  "gpt-5.2-codex-low-fast",
  "gpt-5.2-codex",
  "gpt-5.2-codex-fast",
  "gpt-5.2-codex-high",
  "gpt-5.2-codex-high-fast",
  "gpt-5.2-codex-xhigh",
  "gpt-5.2-codex-xhigh-fast",
  "gpt-5.1-codex-max",
  "gpt-5.1-codex-max-high",
  "gpt-5.2-high",
  "gpt-5.1-high",
  "gpt-5.1-codex-mini",
  "opus-4.6-thinking",
  "opus-4.6",
  "opus-4.5",
  "opus-4.5-thinking",
  "sonnet-4.6",
  "sonnet-4.6-thinking",
  "sonnet-4.5",
  "sonnet-4.5-thinking",
  "gemini-3.1-pro",
  "gemini-3-pro",
  "gemini-3-flash",
  "grok",
  "kimi-k2.5",
];

export const models = CURSOR_FALLBACK_MODEL_IDS.map((id) => ({ id, label: id }));

export const modelProfiles: AdapterModelProfileDefinition[] = [
  {
    key: "cheap",
    label: "Cheap",
    description: "Use Cursor's known Codex mini model as the budget lane instead of assuming auto is cheap.",
    adapterConfig: {
      model: "gpt-5.1-codex-mini",
    },
    source: "adapter_default",
  },
];

export const agentConfigurationDoc = `# cursor agent configuration

Adapter: cursor

Use when:
- You want Paperclip to run Cursor Agent CLI locally as the agent runtime
- You want Cursor chat session resume across heartbeats via --resume
- You want structured stream output in run logs via --output-format stream-json

Don't use when:
- You need webhook-style external invocation (use openclaw_gateway or http)
- You only need one-shot shell commands (use process)
- Cursor Agent CLI is not installed on the machine

Core fields:
- cwd (string, optional): default absolute working directory fallback for the agent process (created if missing when possible)
- instructionsFilePath (string, optional): absolute path to a markdown instructions file prepended to the run prompt
- promptTemplate (string, optional): run prompt template
- model (string, optional): Cursor model id (defaults to composer-2; examples: auto, composer-2, gpt-5.3-codex)
- mode (string, optional): Cursor execution mode passed as --mode (plan|ask). Leave unset for normal autonomous runs.
- command (string, optional): defaults to "agent"
- extraArgs (string[], optional): additional CLI args
- env (object, optional): KEY=VALUE environment variables

Operational fields:
- timeoutSec (number, optional): run timeout in seconds
- graceSec (number, optional): SIGTERM grace period in seconds

Notes:
- Runs are executed with: agent -p --output-format stream-json ...
- Prompts are piped to Cursor via stdin.
- Sessions are resumed with --resume when stored session cwd matches current cwd.
- When you authenticate via Cursor subscription (no CURSOR_API_KEY), streamed runs often omit USD from the CLI. Paperclip attaches **estimated** Composer list-price ledger rows (\`subscription_estimate\`) using published **Composer 2** standard ($0.50/M in, $2.50/M out) vs **fast** ($1.50/M in, $7.50/M out) based on model id (\`composer-2\` vs \`composer-2-fast\` / \`auto\`; Composer 1.x approximated at standard tier unless id contains \`-fast\`). Totals are informational and omitted from budgets.
- Paperclip auto-injects local skills into "~/.cursor/skills" when missing, so Cursor can discover "$paperclip" and related skills on local runs.
- Paperclip auto-adds --yolo unless one of --trust/--yolo/-f is already present in extraArgs.
- Remote sandbox runs prepend "~/.local/bin" to PATH and prefer "~/.local/bin/cursor-agent" when the default Cursor entrypoint is requested, so standard E2B-style installs do not need hardcoded absolute command paths.
`;
