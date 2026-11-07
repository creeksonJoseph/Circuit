import { describe, expect, it } from "vitest";

import { MATCHER_VERSION, findCycles } from "../src/index";

describe("matcher scaffold", () => {
  it("exposes the package version", () => {
    expect(MATCHER_VERSION).toBe("0.1.0");
  });

  it("fails loudly until cycle discovery is implemented", () => {
    expect(() => findCycles([], 0n)).toThrow(/not implemented/i);
  });
});
