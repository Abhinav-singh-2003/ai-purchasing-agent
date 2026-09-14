import { describe, expect, it } from "vitest";
import { evaluate } from "./decisionEngine";
import { investigate } from "./tools";

describe("purchasing decision engine", () => {
  it("rejects a recommendation when existing stock + incoming stock covers demand", () => {
    const evidence = investigate("p-100");
    const result = evaluate(
      { productId: "p-100", recommendedQuantity: 800 },
      evidence
    );

    expect(result.decision).toBe("REJECT");
    expect(result.approvedQuantity).toBe(0);
  });

  it("modifies a recommendation that exceeds budget", () => {
    const evidence = investigate("p-200");
    const result = evaluate(
      { productId: "p-200", recommendedQuantity: 1000 },
      evidence
    );

    expect(result.decision).toBe("MODIFY");
    expect(result.approvedQuantity).toBeLessThan(1000);
  });

  it("investigates when primary supplier cannot fulfil the recommendation", () => {
    const evidence = investigate("p-200");
    evidence.supplier.availableQuantity["p-200"] = 50;

    const result = evaluate(
      { productId: "p-200", recommendedQuantity: 400 },
      evidence
    );

    expect(result.decision).toBe("INVESTIGATE");
  });
});
