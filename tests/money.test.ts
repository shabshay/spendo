import { describe, expect, it } from "vitest";
import { formatILS, parseILS } from "../src/utils/money";

describe("money utils", () => {
  it("formats ILS from agorot", () => {
    expect(formatILS(12345)).toContain("₪");
  });

  it("parses ILS to agorot", () => {
    expect(parseILS("₪12.34")).toBe(1234);
    expect(parseILS("12")).toBe(1200);
  });
});
