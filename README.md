# AI Purchasing Agent

A full-stack assignment solution for the AI Purchasing Agent challenge.

## What this demonstrates

- Tool-based purchasing investigation
- Scenario 1 end-to-end: review an 800-unit recommendation
- Deterministic decision policy for safety-critical purchasing constraints
- Optional LLM explanation layer
- Simulated purchase-order action
- Post-action validation / feedback loop
- Multiple evaluation scenarios
- React dashboard + TypeScript/Express backend
- Mock APIs/data so the project runs without external infrastructure

The assignment explicitly allows mock APIs/databases and asks for at least one scenario end-to-end.

## Architecture

```text
React Dashboard
      |
      | POST /api/agent/review
      v
Agent Orchestrator
      |
      +--> inventory tool
      +--> demand/forecast tool
      +--> purchase-order tool
      +--> supplier tool
      +--> constraints tool
      |
      v
Decision Engine
  - demand coverage
  - open PO coverage
  - lead time
  - MOQ
  - budget
  - storage
      |
      +--> ACCEPT / MODIFY / REJECT / INVESTIGATE
      |
      v
Action Executor
  - create/modify PO when allowed
      |
      v
Validation Loop
  - re-read resulting state
  - compare expected vs actual
  - return VALIDATED / MISMATCH
```

## Quick start

Requirements: Node.js 20+ and npm.

### Backend

```bash
cd server
npm install
npm run dev
```

Server runs on `http://localhost:4000`.

### Frontend

In another terminal:

```bash
cd client
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

### Optional LLM

Copy `.env.example` to `.env` in `server`.

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5.6-luna
```

The application works without an API key. Without it, the decision is still made by the deterministic policy engine; the LLM is only used to improve the natural-language explanation. This keeps purchasing actions constrained by explicit business rules.

OpenAI's current API documentation lists the Responses API as the API surface for current models. See the official documentation if you enable the optional provider integration.

## Scenarios

1. **Recommendation review** — initial recommendation is 800 units. The agent gathers inventory, forecast, open POs, supplier terms, budget and storage, then decides whether to accept, modify, reject or investigate.
2. **Supplier shortfall** — an existing PO asks for 500 units but the supplier can only provide 250. The agent evaluates alternative suppliers, inventory coverage and escalation.
3. **Demand spike** — actual demand is materially above forecast. The agent checks incoming stock and recommends additional buying if constraints permit.
4. **Purchasing constraint** — the required quantity cannot be purchased because of budget/storage/MOQ constraints.

## Evaluation approach

Every run records:

- information/tools consulted
- decision and reasons
- constraints checked
- action taken
- expected post-action state
- actual post-action state
- validation status
- fallback/escalation if validation fails

A good decision is not just "the number looks right"; it must be supported by evidence and must remain acceptable after execution.

## Important design choice

The LLM does **not** directly get permission to create arbitrary purchase orders. It can explain and summarize the structured evidence, while the deterministic policy validates whether an action is allowed.

This reduces hallucination risk for a workflow that can change inventory and spend money.

## Interview summary

Say:

> "I designed the agent as a tool-using workflow rather than a chatbot. It first gathers the minimum operational facts, then a deterministic policy evaluates demand coverage, incoming POs, supplier constraints, budget and storage. The agent can accept, modify, reject or escalate. If it takes an action, the system re-reads the state and validates the expected result. If reality differs from the expected state, it does not silently continue; it flags a mismatch and escalates."

## GitHub checklist

Before submission:

- [ ] public GitHub repository
- [ ] source code
- [ ] README
- [ ] architecture diagram
- [ ] `.env.example`
- [ ] tests/evaluation scenarios
- [ ] working demo
- [ ] no secrets committed
- [ ] meaningful commit history
