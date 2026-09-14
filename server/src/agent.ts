import OpenAI from "openai";
import { evaluate } from "./decisionEngine";
import { createPurchaseOrder, investigate } from "./tools";
import { AgentResult, PurchasingInput } from "./types";

function buildExplanation(result: AgentResult): string {
  return [
    `Decision: ${result.decision}`,
    `Approved quantity: ${result.approvedQuantity}`,
    ...result.reasons.map((r) => `- ${r}`)
  ].join("\n");
}

async function optionalLlmExplanation(result: AgentResult): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) return null;

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
    input: [
      {
        role: "system",
        content:
          "Explain a purchasing-agent decision clearly and briefly. Do not change the decision or quantity."
      },
      {
        role: "user",
        content: JSON.stringify({
          decision: result.decision,
          approvedQuantity: result.approvedQuantity,
          reasons: result.reasons,
          warnings: result.warnings,
          evidence: result.evidence
        })
      }
    ]
  });

  return response.output_text;
}

export async function runAgent(input: PurchasingInput): Promise<AgentResult> {
  const evidence = investigate(input.productId);
  evidence.requestedCost =
    input.recommendedQuantity * evidence.inventory.unitCost;

  const policy = evaluate(input, evidence);

  let action: AgentResult["action"] = {
    type: "NO_ACTION",
    message: "No purchasing action executed."
  };

  let validation: AgentResult["validation"] = {
    status: "NOT_RUN",
    message: "No state-changing action was required."
  };

  if (policy.decision === "ACCEPT" || policy.decision === "MODIFY") {
    try {
      const po = createPurchaseOrder(
        input.productId,
        evidence.supplier.id,
        policy.approvedQuantity
      );

      const fresh = investigate(input.productId);
      const created = fresh.openOrders.find((order) => order.id === po.id);
      const actualQuantity = created?.quantity ?? 0;
      const valid = actualQuantity === policy.approvedQuantity;

      action = {
        type: policy.decision === "ACCEPT" ? "CREATE_PO" : "MODIFY_PO",
        message: `Created PO ${po.id} for ${po.quantity} units with ${evidence.supplier.name}.`
      };

      validation = {
        status: valid ? "VALIDATED" : "MISMATCH",
        expectedQuantity: policy.approvedQuantity,
        actualQuantity,
        message: valid
          ? "Post-action state matches the expected purchase quantity."
          : "Post-action state does not match the expected purchase quantity; escalation required."
      };
    } catch (error) {
      action = {
        type: "ESCALATE",
        message: error instanceof Error ? error.message : "Unknown action failure."
      };
      validation = {
        status: "MISMATCH",
        message: "Action failed before the expected state could be reached."
      };
    }
  } else if (policy.decision === "INVESTIGATE") {
    action = {
      type: "ESCALATE",
      message: "More information or human approval is required before purchasing."
    };
  }

  const result: AgentResult = {
    decision: policy.decision,
    approvedQuantity: policy.approvedQuantity,
    reasons: policy.reasons,
    warnings: policy.warnings,
    evidence,
    action,
    validation
  };

  const llm = await optionalLlmExplanation(result);
  if (llm) {
    result.reasons = [llm, ...result.reasons];
  }

  return result;
}

export function fallbackExplanation(result: AgentResult): string {
  return buildExplanation(result);
}
