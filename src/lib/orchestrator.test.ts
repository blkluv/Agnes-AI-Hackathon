import { describe, expect, it } from "vitest";
import { parseProduct } from "./orchestrator";

describe("parseProduct", () => {
  it("accepts valid product input", () => {
    const product = parseProduct({
      name: "Vitamin C Serum",
      price: "Rp 185.000",
      category: "skincare",
    });

    expect(product).toEqual({
      name: "Vitamin C Serum",
      price: "Rp 185.000",
      category: "skincare",
      photo: undefined,
    });
  });

  it("rejects missing category", () => {
    expect(() =>
      parseProduct({
        name: "Serum",
        price: "Rp 100.000",
        category: "makeup",
      }),
    ).toThrow("Valid category is required");
  });
});
