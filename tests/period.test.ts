import { describe, expect, it } from "vitest";
import { formatCountdownToReset, getPeriodWindow } from "../src/domain/period";

describe("period utils", () => {
  it("calculates daily window", () => {
    const now = new Date("2024-04-20T10:00:00Z");
    const { start, end } = getPeriodWindow(now, "daily");
    expect(start.toISOString()).toContain("T00:00:00");
    expect(end.getTime() - start.getTime()).toBe(86400000);
  });

  it("calculates weekly window with Sunday start", () => {
    const now = new Date("2024-04-24T10:00:00Z");
    const { start } = getPeriodWindow(now, "weekly", 0);
    expect(start.getDay()).toBe(0);
  });

  it("formats countdown", () => {
    const now = new Date("2024-04-20T10:00:00Z");
    const label = formatCountdownToReset(now, "daily");
    expect(label).toMatch(/\d+m/);
  });
});
