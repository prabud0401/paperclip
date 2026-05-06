import { Command } from "commander";
import type { Agent } from "@paperclipai/shared";
import {
  removeMaintainerOnlySkillSymlinks,
  resolvePaperclipSkillsDir,
} from "@paperclipai/adapter-utils/server-utils";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  addCommonClientOptions,
  formatInlineRecord,
  handleCommandError,
  printOutput,
  resolveCommandContext,
  type BaseClientOptions,
} from "./common.js";

interface AgentListOptions extends BaseClientOptions {
  companyId?: string;
}

interface AgentLocalCliOptions extends BaseClientOptions {
  companyId?: string;
  keyName?: string;
  installSkills?: boolean;
}

interface CreatedAgentKey {
  id: string;
  name: string;
  token: string;
  createdAt: string;
}

interface SkillsInstallSummary {
  tool: "codex" | "claude";
  target: string;
  linked: string[];
  removed: string[];
  skipped: string[];
  failed: Array<{ name: string; error: string }>;
}

const __moduleDir = path.dirname(fileURLToPath(import.meta.url));

function codexSkillsHome(): string {
  const fromEnv = process.env.CODEX_HOME?.trim();
  const base = fromEnv && fromEnv.length > 0 ? fromEnv : path.join(os.homedir(), ".codex");
  return path.join(base, "skills");
}

function claudeSkillsHome(): string {
  const fromEnv = process.env.CLAUDE_HOME?.trim();
  const base = fromEnv && fromEnv.length > 0 ? fromEnv : path.join(os.homedir(), ".claude");
  return path.join(base, "skills");
}

async function installSkillsForTarget(
  sourceSkillsDir: string,
  targetSkillsDir: string,
  tool: "codex" | "claude",
): Promise<SkillsInstallSummary> {
  const summary: SkillsInstallSummary = {
    tool,
    target: targetSkillsDir,
    linked: [],
    removed: [],
    skipped: [],
    failed: [],
  };

  await fs.mkdir(targetSkillsDir, { recursive: true });
  const entries = await fs.readdir(sourceSkillsDir, { withFileTypes: true });
  summary.removed = await removeMaintainerOnlySkillSymlinks(
    targetSkillsDir,
    entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name),
  );
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const source = path.join(sourceSkillsDir, entry.name);
    const target = path.join(targetSkillsDir, entry.name);
    const existing = await fs.lstat(target).catch(() => null);
    if (existing) {
      if (existing.isSymbolicLink()) {
        let linkedPath: string | null = null;
        try {
          linkedPath = await fs.readlink(target);
        } catch (err) {
          await fs.unlink(target);
          try {
            await fs.symlink(source, target);
            summary.linked.push(entry.name);
            continue;
          } catch (linkErr) {
            summary.failed.push({
              name: entry.name,
              error:
                err instanceof Error && linkErr instanceof Error
                  ? `${err.message}; then ${linkErr.message}`
                  : err instanceof Error
                    ? err.message
                    : `Failed to recover broken symlink: ${String(err)}`,
            });
            continue;
          }
        }

        const resolvedLinkedPath = path.isAbsolute(linkedPath)
          ? linkedPath
          : path.resolve(path.dirname(target), linkedPath);
        const linkedTargetExists = await fs
          .stat(resolvedLinkedPath)
          .then(() => true)
          .catch(() => false);

        if (!linkedTargetExists) {
          await fs.unlink(target);
        } else {
          summary.skipped.push(entry.name);
          continue;
        }
      } else {
        summary.skipped.push(entry.name);
        continue;
      }
    }

    try {
      await fs.symlink(source, target);
      summary.linked.push(entry.name);
    } catch (err) {
      summary.failed.push({
        name: entry.name,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return summary;
}

function buildAgentEnvExports(input: {
  apiBase: string;
  companyId: string;
  agentId: string;
  apiKey: string;
}): string {
  const escaped = (value: string) => value.replace(/'/g, "'\"'\"'");
  return [
    `export PAPERCLIP_API_URL='${escaped(input.apiBase)}'`,
    `export PAPERCLIP_COMPANY_ID='${escaped(input.companyId)}'`,
    `export PAPERCLIP_AGENT_ID='${escaped(input.agentId)}'`,
    `export PAPERCLIP_API_KEY='${escaped(input.apiKey)}'`,
  ].join("\n");
}

export function registerAgentCommands(program: Command): void {
  const agent = program.command("agent").description("Agent operations");

  addCommonClientOptions(
    agent
      .command("list")
      .description("List agents for a company")
      .requiredOption("-C, --company-id <id>", "Company ID")
      .action(async (opts: AgentListOptions) => {
        try {
          const ctx = resolveCommandContext(opts, { requireCompany: true });
          const rows = (await ctx.api.get<Agent[]>(`/api/companies/${ctx.companyId}/agents`)) ?? [];

          if (ctx.json) {
            printOutput(rows, { json: true });
            return;
          }

          if (rows.length === 0) {
            printOutput([], { json: false });
            return;
          }

          for (const row of rows) {
            console.log(
              formatInlineRecord({
                id: row.id,
                name: row.name,
                role: row.role,
                status: row.status,
                reportsTo: row.reportsTo,
                budgetMonthlyCents: row.budgetMonthlyCents,
                spentMonthlyCents: row.spentMonthlyCents,
              }),
            );
          }
        } catch (err) {
          handleCommandError(err);
        }
      }),
    { includeCompany: false },
  );

  addCommonClientOptions(
    agent
      .command("get")
      .description("Get one agent")
      .argument("<agentId>", "Agent ID")
      .action(async (agentId: string, opts: BaseClientOptions) => {
        try {
          const ctx = resolveCommandContext(opts);
          const row = await ctx.api.get<Agent>(`/api/agents/${agentId}`);
          printOutput(row, { json: ctx.json });
        } catch (err) {
          handleCommandError(err);
        }
      }),
  );

  addCommonClientOptions(
    agent
      .command("local-cli")
      .description(
        "Create an agent API key, install local Paperclip skills for Codex/Claude, and print shell exports",
      )
      .argument("<agentRef>", "Agent ID or shortname/url-key")
      .requiredOption("-C, --company-id <id>", "Company ID")
      .option("--key-name <name>", "API key label", "local-cli")
      .option(
        "--no-install-skills",
        "Skip installing Paperclip skills into ~/.codex/skills and ~/.claude/skills",
      )
      .action(async (agentRef: string, opts: AgentLocalCliOptions) => {
        try {
          const ctx = resolveCommandContext(opts, { requireCompany: true });
          const query = new URLSearchParams({ companyId: ctx.companyId ?? "" });
          const agentRow = await ctx.api.get<Agent>(
            `/api/agents/${encodeURIComponent(agentRef)}?${query.toString()}`,
          );
          if (!agentRow) {
            throw new Error(`Agent not found: ${agentRef}`);
          }

          const now = new Date().toISOString().replaceAll(":", "-");
          const keyName = opts.keyName?.trim() ? opts.keyName.trim() : `local-cli-${now}`;
          const key = await ctx.api.post<CreatedAgentKey>(`/api/agents/${agentRow.id}/keys`, { name: keyName });
          if (!key) {
            throw new Error("Failed to create API key");
          }

          const installSummaries: SkillsInstallSummary[] = [];
          if (opts.installSkills !== false) {
            const skillsDir = await resolvePaperclipSkillsDir(__moduleDir, [path.resolve(process.cwd(), "skills")]);
            if (!skillsDir) {
              throw new Error(
                "Could not locate local Paperclip skills directory. Expected ./skills in the repo checkout.",
              );
            }

            installSummaries.push(
              await installSkillsForTarget(skillsDir, codexSkillsHome(), "codex"),
              await installSkillsForTarget(skillsDir, claudeSkillsHome(), "claude"),
            );
          }

          const exportsText = buildAgentEnvExports({
            apiBase: ctx.api.apiBase,
            companyId: agentRow.companyId,
            agentId: agentRow.id,
            apiKey: key.token,
          });

          if (ctx.json) {
            printOutput(
              {
                agent: {
                  id: agentRow.id,
                  name: agentRow.name,
                  urlKey: agentRow.urlKey,
                  companyId: agentRow.companyId,
                },
                key: {
                  id: key.id,
                  name: key.name,
                  createdAt: key.createdAt,
                  token: key.token,
                },
                skills: installSummaries,
                exports: exportsText,
              },
              { json: true },
            );
            return;
          }

          console.log(`Agent: ${agentRow.name} (${agentRow.id})`);
          console.log(`API key created: ${key.name} (${key.id})`);
          if (installSummaries.length > 0) {
            for (const summary of installSummaries) {
              console.log(
                `${summary.tool}: linked=${summary.linked.length} removed=${summary.removed.length} skipped=${summary.skipped.length} failed=${summary.failed.length} target=${summary.target}`,
              );
              for (const failed of summary.failed) {
                console.log(`  failed ${failed.name}: ${failed.error}`);
              }
            }
          }
          console.log("");
          console.log("# Run this in your shell before launching codex/claude:");
          console.log(exportsText);
        } catch (err) {
          handleCommandError(err);
        }
      }),
    { includeCompany: false },
  );

  addCommonClientOptions(
    agent
      .command("use-claude-local")
      .description(
        "Switch an agent to the claude_local adapter (Claude Code CLI) with sane defaults — install CLI only if you need it separately",
      )
      .argument("<agentRef>", "Agent UUID or url-key shortname")
      .requiredOption("-C, --company-id <id>", "Company ID")
      .option("--cwd <path>", "Working directory for runs (defaults to current directory)")
      .option("--model <id>", 'Claude model id (default: "claude-sonnet-4-6")', "claude-sonnet-4-6")
      .option(
        "--command <path>",
        'Claude CLI executable or name (defaults to "claude" on PATH)',
      )
      .action(async (agentRef: string, opts: AgentLocalCliOptions & { cwd?: string; model?: string; command?: string }) => {
        try {
          const ctx = resolveCommandContext(opts, { requireCompany: true });
          const companyId = ctx.companyId!;
          const qs = new URLSearchParams({ companyId });
          const existing = await ctx.api.get<Agent>(
            `/api/agents/${encodeURIComponent(agentRef)}?${qs.toString()}`,
          );
          if (!existing || !existing.id) {
            throw new Error(`Agent not found: ${agentRef}`);
          }

          const cwd =
            opts.cwd?.trim() ||
            process.env.PAPERCLIP_CLAUDE_CWD?.trim() ||
            process.cwd();
          const command = opts.command?.trim();
          const model = opts.model?.trim() || "claude-sonnet-4-6";

          const adapterConfig: Record<string, unknown> = {
            cwd,
            model,
            dangerouslySkipPermissions: true,
          };
          if (command) adapterConfig.command = command;

          const updated = await ctx.api.patch<Agent>(`/api/agents/${encodeURIComponent(existing.id)}`, {
            adapterType: "claude_local",
            adapterConfig,
            replaceAdapterConfig: true,
          });
          if (!updated) throw new Error("PATCH returned empty response");

          if (ctx.json) {
            printOutput(updated, { json: true });
            return;
          }
          console.log(`Updated agent ${existing.name} (${existing.id}) → claude_local`);
          console.log(`  cwd=${cwd}`);
          console.log(`  model=${model}`);
          console.log(`  command=${(command ?? "claude (PATH)")}`);
        } catch (err) {
          handleCommandError(err);
        }
      }),
    { includeCompany: false },
  );

  addCommonClientOptions(
    agent
      .command("use-gemini-local")
      .description(
        "Switch an agent to gemini_local (Google Gemini CLI). Optional: seed GEMINI_API_KEY from an env var (never paste keys on the CLI).",
      )
      .argument("<agentRef>", "Agent UUID or url-key shortname")
      .requiredOption("-C, --company-id <id>", "Company ID")
      .option("--cwd <path>", "Working directory for runs (defaults to current directory)")
      .option("--model <id>", 'Gemini model id (default: "gemini-2.5-flash")', "gemini-2.5-flash")
      .option("--command <path>", 'Gemini CLI executable or name (defaults to "gemini" on PATH)')
      .option(
        "--api-key-env <name>",
        "Read plaintext API key from this process.env name, store as encrypted company secret, bind to adapter env GEMINI_API_KEY",
      )
      .action(
        async (
          agentRef: string,
          opts: AgentLocalCliOptions & {
            cwd?: string;
            model?: string;
            command?: string;
            apiKeyEnv?: string;
          },
        ) => {
          try {
            const ctx = resolveCommandContext(opts, { requireCompany: true });
            const companyId = ctx.companyId!;
            const qs = new URLSearchParams({ companyId });
            const existing = await ctx.api.get<Agent>(
              `/api/agents/${encodeURIComponent(agentRef)}?${qs.toString()}`,
            );
            if (!existing || !existing.id) {
              throw new Error(`Agent not found: ${agentRef}`);
            }

            const cwd =
              opts.cwd?.trim() ||
              process.env.PAPERCLIP_GEMINI_CWD?.trim() ||
              process.cwd();
            const command = opts.command?.trim();
            const model = opts.model?.trim() || "gemini-2.5-flash";

            let secretBinding: Record<string, unknown> | null = null;

            const envVar = opts.apiKeyEnv?.trim();
            if (envVar) {
              const rawKey = process.env[envVar];
              if (!rawKey?.trim()) {
                throw new Error(
                  `${envVar} is empty or unset. Set it in your shell once (never pass the key as a CLI argument), then rerun.`,
                );
              }
              const secretName = `gemini-api-key/agent-${existing.id}`;
              const created = await ctx.api.post<{ id: string; name?: string }>(
                `/api/companies/${encodeURIComponent(companyId)}/secrets`,
                {
                  name: secretName,
                  description: `Gemini API key for agent ${existing.name}`,
                  value: rawKey.trim(),
                },
              );
              if (!created?.id) {
                throw new Error("Failed to create company secret — empty response.");
              }

              secretBinding = {
                GEMINI_API_KEY: {
                  type: "secret_ref",
                  secretId: created.id,
                  version: "latest",
                },
              };

              if (!ctx.json) {
                console.log(`Created secret '${secretName}' (${created.id}), bound → adapter env GEMINI_API_KEY`);
              }
            }

            const adapterConfig: Record<string, unknown> = {
              cwd,
              model,
            };
            if (command) adapterConfig.command = command;
            if (secretBinding) {
              adapterConfig.env = secretBinding;
            }

            const updated = await ctx.api.patch<Agent>(`/api/agents/${encodeURIComponent(existing.id)}`, {
              adapterType: "gemini_local",
              adapterConfig,
              replaceAdapterConfig: true,
            });
            if (!updated) throw new Error("PATCH returned empty response");

            if (ctx.json) {
              printOutput(updated, { json: true });
              return;
            }
            console.log(`Updated agent ${existing.name} (${existing.id}) → gemini_local`);
            console.log(`  cwd=${cwd}`);
            console.log(`  model=${model}`);
            console.log(`  command=${command ?? "gemini (PATH)"}`);
            if (!envVar) {
              console.log("");
              console.log(
                "(No secret created — set GEMINI_API_KEY or GOOGLE_API_KEY via company secrets + adapter env, or rerun with --api-key-env GEMINI_API_KEY)",
              );
            }
          } catch (err) {
            handleCommandError(err);
          }
        },
      ),
    { includeCompany: false },
  );
}
