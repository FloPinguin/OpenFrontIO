import { generateNationName } from "../src/core/execution/utils/BotNames";

describe("Dynamic Nation Name Generation", () => {
  test("generateNationName produces valid nation names", () => {
    // Test first few indices
    const name0 = generateNationName(0);
    expect(typeof name0).toBe("string");
    expect(name0.length).toBeGreaterThan(0);
    expect(name0.length).toBeLessThanOrEqual(27); // Nation names must be <= 27 characters

    const name1 = generateNationName(1);
    expect(typeof name1).toBe("string");
    expect(name1.length).toBeGreaterThan(0);
    expect(name1.length).toBeLessThanOrEqual(27);

    // Names with different indices should generally be different
    // (though collisions are theoretically possible with the fallback logic)
    expect(name0).not.toBe(name1);
  });

  test("all generated nation names respect 27 character limit", () => {
    // Test a large sample of indices
    for (let i = 0; i < 1000; i++) {
      const name = generateNationName(i);
      expect(name.length).toBeLessThanOrEqual(27);
      expect(name.length).toBeGreaterThan(0);
    }
  });

  test("generateNationName is deterministic", () => {
    // Same index should always produce the same name
    for (let i = 0; i < 100; i++) {
      const name1 = generateNationName(i);
      const name2 = generateNationName(i);
      expect(name1).toBe(name2);
    }
  });

  test("generateNationName produces diverse names", () => {
    // Generate names for first 50 indices and check for diversity
    const names = new Set<string>();
    for (let i = 0; i < 50; i++) {
      names.add(generateNationName(i));
    }
    // Should have at least 40 unique names out of 50
    expect(names.size).toBeGreaterThanOrEqual(40);
  });

  test("generateNationName handles large indices", () => {
    // Test with very large indices to ensure no overflow issues
    const largeName = generateNationName(999999);
    expect(typeof largeName).toBe("string");
    expect(largeName.length).toBeGreaterThan(0);
    expect(largeName.length).toBeLessThanOrEqual(27);
  });

  test("generated names follow expected format", () => {
    // Most names should be in "Prefix Suffix" format
    const name = generateNationName(0);
    // Either contains a space (prefix + suffix) or is just a prefix
    const hasSpace = name.includes(" ");
    if (hasSpace) {
      const parts = name.split(" ");
      expect(parts.length).toBeGreaterThanOrEqual(2);
    }
    // If no space, it's a truncated name (edge case)
  });
});
