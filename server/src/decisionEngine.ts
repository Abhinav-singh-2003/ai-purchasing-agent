import { Evidence, Decision, PurchasingInput } from "./types";

export interface PolicyResult {
  decision: Decision;
  approvedQuantity: number;
  reasons: string[];
  warnings: string[];
}

export function evaluate(input: PurchasingInput, evidence: Evidence): PolicyResult {
  const product = evidence.inventory;
  const reasons: string[] = [];
  const warnings: string[] = [];

  const projectedNeed =
    product.forecastDailyDemand * product.leadTimeDays +
    product.forecastDailyDemand * 3; // 3-day safety horizon

  const netBeforePurchase =
    product.currentInventory + evidence.totalIncoming - projectedNeed;

  const requestedCost = input.recommendedQuantity * product.unitCost;
  const storageAvailable = evidence.storageAvailable;
  const supplierAvailable =
    evidence.supplier.availableQuantity[product.id] ?? 0;

  if (netBeforePurchase >= 0) {
    reasons.push(
      `Existing inventory and open POs already cover the projected demand horizon by ${netBeforePurchase} units.`
    );
    warnings.push("The original recommendation appears unnecessary.");
    return {
      decision: "REJECT",
      approvedQuantity: 0,
      reasons,
      warnings
    };
  }

  if (input.recommendedQuantity < product.moq) {
    warnings.push(`Requested quantity is below supplier MOQ of ${product.moq}.`);
    return {
      decision: "MODIFY",
      approvedQuantity: product.moq,
      reasons: ["The recommendation is below the supplier's minimum order quantity."],
      warnings
    };
  }

  if (requestedCost > product.availableBudget) {
    reasons.push(
      `Requested spend ₹${requestedCost.toLocaleString()} exceeds budget ₹${product.availableBudget.toLocaleString()}.`
    );

    const affordable = Math.floor(product.availableBudget / product.unitCost);
    const adjusted = Math.floor(affordable / product.moq) * product.moq;

    if (adjusted >= product.moq && adjusted < input.recommendedQuantity) {
      warnings.push("Quantity was reduced to remain within budget.");
      return {
        decision: "MODIFY",
        approvedQuantity: adjusted,
        reasons,
        warnings
      };
    }

    return {
      decision: "REJECT",
      approvedQuantity: 0,
      reasons,
      warnings
    };
  }

  if (input.recommendedQuantity > storageAvailable) {
    reasons.push(
      `Only ${storageAvailable} units of storage are available after existing inbound stock.`
    );

    const adjusted = Math.floor(storageAvailable / product.moq) * product.moq;

    if (adjusted >= product.moq) {
      warnings.push("Quantity was reduced to fit storage capacity.");
      return {
        decision: "MODIFY",
        approvedQuantity: adjusted,
        reasons,
        warnings
      };
    }

    return {
      decision: "INVESTIGATE",
      approvedQuantity: 0,
      reasons,
      warnings: ["Storage constraint prevents a safe purchase."]
    };
  }

  if (supplierAvailable < input.recommendedQuantity) {
    reasons.push(
      `Primary supplier can only supply ${supplierAvailable} units right now.`
    );
    warnings.push("Consider an alternative supplier or escalation.");
    return {
      decision: "INVESTIGATE",
      approvedQuantity: 0,
      reasons,
      warnings
    };
  }

  reasons.push(
    `Projected demand creates a ${Math.abs(netBeforePurchase)}-unit shortfall before the safety horizon.`
  );
  reasons.push("Budget, storage, MOQ and supplier availability are within constraints.");

  return {
    decision: "ACCEPT",
    approvedQuantity: input.recommendedQuantity,
    reasons,
    warnings
  };
}
