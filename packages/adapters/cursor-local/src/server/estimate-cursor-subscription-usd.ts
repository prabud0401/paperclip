/**
 * Cursor “Composer” list prices from the Mar 2026 “Introducing Composer 2” post:
 * - Composer 2 **standard**: $0.50/M input, $2.50/M output
 * - Composer 2 **fast** (same model, default modality in the product): $1.50/M input, $7.50/M output
 *
 * Cursor does not publish separate list API $ for Composer 1 / 1.5 in that post; we approximate those
 * with the **Composer 2 standard** tier, and any `*-fast` / `*fast*` composer id with the **fast** tier.
 */

const COMPOSER_FAST_USD_PER_MILLION = { inputUsd: 1.5, outputUsd: 7.5 } as const;
const COMPOSER_STANDARD_USD_PER_MILLION = { inputUsd: 0.5, outputUsd: 2.5 } as const;

function hasAnyTokens(usage: { inputTokens: number; cachedInputTokens: number; outputTokens: number }): boolean {
  return usage.inputTokens + usage.cachedInputTokens + usage.outputTokens > 0;
}

/** Heuristic: id requests the “fast” price band from the Composer 2 announcement ($1.50 / $7.50 per M). */
function composerModelIdRequestsFastTier(normalized: string): boolean {
  if (normalized === "auto") return true;
  if (!normalized.includes("composer")) return false;
  if (/(^|-)fast($|-)/.test(normalized) || normalized.includes("-fast-")) return true;
  return false;
}

/**
 * Map Cursor model id → USD/M for input and output for Composer-family runs.
 * Non-composer models return null (no list-price estimate here).
 */
function listPriceUsdPerMillion(model: string): { inputUsd: number; outputUsd: number } | null {
  const m = model.trim().toLowerCase();
  if (!m) {
    return COMPOSER_STANDARD_USD_PER_MILLION;
  }
  if (m === "auto") {
    return COMPOSER_FAST_USD_PER_MILLION;
  }
  if (!m.startsWith("composer")) {
    return null;
  }

  const useFast = composerModelIdRequestsFastTier(m);

  // Composer 2: blog quotes standard vs fast explicitly.
  if (m === "composer-2" || m.startsWith("composer-2-")) {
    return useFast ? COMPOSER_FAST_USD_PER_MILLION : COMPOSER_STANDARD_USD_PER_MILLION;
  }

  // Composer 1 / 1.5 (and similar): no public split in the same post — use standard, or fast if id says so.
  if (
    m === "composer-1" ||
    m.startsWith("composer-1-") ||
    m === "composer-1.5" ||
    m.startsWith("composer-1.5-")
  ) {
    return useFast ? COMPOSER_FAST_USD_PER_MILLION : COMPOSER_STANDARD_USD_PER_MILLION;
  }

  // Future ids: composer-3, composer-beta, etc. — prefer explicit -fast/-high in id, else standard.
  return useFast ? COMPOSER_FAST_USD_PER_MILLION : COMPOSER_STANDARD_USD_PER_MILLION;
}

/**
 * When the Cursor CLI does not attach dollar usage (common for Cursor subscription / included pool),
 * estimate spend from measured tokens × published Composer list prices (where applicable).
 * Cached prompt tokens count at the same USD/M rate as uncached input (conservative approximation).
 */
export function estimateCursorSubscriptionListPriceUsd(opts: {
  model: string;
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
}): number | null {
  const { model, inputTokens, cachedInputTokens, outputTokens } = opts;
  if (!hasAnyTokens({ inputTokens, cachedInputTokens, outputTokens })) return null;

  const rates = listPriceUsdPerMillion(model);
  if (!rates) return null;

  const billedInputTokens = Math.max(0, inputTokens) + Math.max(0, cachedInputTokens);
  const billedOutputTokens = Math.max(0, outputTokens);

  const usd =
    (billedInputTokens / 1_000_000) * rates.inputUsd + (billedOutputTokens / 1_000_000) * rates.outputUsd;
  return Number.isFinite(usd) && usd > 0 ? usd : null;
}
