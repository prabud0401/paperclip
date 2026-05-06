import { describe, expect, it } from "vitest";
import { estimateCursorSubscriptionListPriceUsd } from "./estimate-cursor-subscription-usd.js";

describe("estimateCursorSubscriptionListPriceUsd", () => {
  it("returns null when no tokens", () => {
    expect(
      estimateCursorSubscriptionListPriceUsd({
        model: "composer-2",
        inputTokens: 0,
        cachedInputTokens: 0,
        outputTokens: 0,
      }),
    ).toBeNull();
  });

  it("returns null for non-composer models", () => {
    expect(
      estimateCursorSubscriptionListPriceUsd({
        model: "sonnet-4.6",
        inputTokens: 1_000_000,
        cachedInputTokens: 0,
        outputTokens: 0,
      }),
    ).toBeNull();
  });

  it("uses Composer 2 standard list price for composer-2 (1M input)", () => {
    expect(
      estimateCursorSubscriptionListPriceUsd({
        model: "composer-2",
        inputTokens: 1_000_000,
        cachedInputTokens: 0,
        outputTokens: 0,
      }),
    ).toBe(0.5);
  });

  it("uses Composer 2 fast list price for composer-2-fast", () => {
    expect(
      estimateCursorSubscriptionListPriceUsd({
        model: "composer-2-fast",
        inputTokens: 1_000_000,
        cachedInputTokens: 0,
        outputTokens: 0,
      }),
    ).toBe(1.5);
  });

  it("uses fast tier for auto (product default per Cursor blog)", () => {
    expect(
      estimateCursorSubscriptionListPriceUsd({
        model: "auto",
        inputTokens: 1_000_000,
        cachedInputTokens: 0,
        outputTokens: 0,
      }),
    ).toBe(1.5);
  });

  it("uses fast tier for auto (0 input + 500k cached, 1M output)", () => {
    const inputUsd = (500_000 / 1e6) * 1.5;
    const outputUsd = (1_000_000 / 1e6) * 7.5;
    expect(
      estimateCursorSubscriptionListPriceUsd({
        model: "auto",
        inputTokens: 0,
        cachedInputTokens: 500_000,
        outputTokens: 1_000_000,
      }),
    ).toBeCloseTo(inputUsd + outputUsd, 6);
  });

  it("uses standard tier for composer-1.5 (legacy, approximated with C2 standard)", () => {
    expect(
      estimateCursorSubscriptionListPriceUsd({
        model: "composer-1.5",
        inputTokens: 2_000_000,
        cachedInputTokens: 0,
        outputTokens: 0,
      }),
    ).toBe(1.0);
  });

  it("uses fast tier for composer-1.5-fast", () => {
    expect(
      estimateCursorSubscriptionListPriceUsd({
        model: "composer-1.5-fast",
        inputTokens: 1_000_000,
        cachedInputTokens: 0,
        outputTokens: 0,
      }),
    ).toBe(1.5);
  });

  it("treats empty model as composer-2 standard (DEFAULT_CURSOR_LOCAL_MODEL path)", () => {
    expect(
      estimateCursorSubscriptionListPriceUsd({
        model: "",
        inputTokens: 1_000_000,
        cachedInputTokens: 0,
        outputTokens: 0,
      }),
    ).toBe(0.5);
  });
});
