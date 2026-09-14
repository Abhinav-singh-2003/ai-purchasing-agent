# Evaluation

## Scenario A — 800-unit recommendation

Expected behavior:
- Investigate all required information.
- Calculate demand coverage using inventory + open POs.
- Check supplier MOQ, supplier availability, budget and storage.
- If existing stock is sufficient, reject rather than blindly accepting the system recommendation.

## Scenario B — Supplier shortfall

Change primary supplier availability so it is below the requested quantity.

Expected behavior:
- Do not create an impossible PO.
- Investigate alternate suppliers.
- If no safe alternate exists, escalate.

## Scenario C — Demand spike

Increase `dailyDemand`/`forecastDailyDemand` in mock data.

Expected behavior:
- Recalculate the demand horizon.
- Reconsider the existing PO.
- Buy more only if constraints permit.

## Scenario D — Constraint

Lower budget or storage capacity.

Expected behavior:
- Modify quantity when a safe MOQ-aligned quantity is possible.
- Otherwise reject/investigate and explain the blocking constraint.

## Quality criteria

For each run ask:
1. Was the decision supported by evidence?
2. Did the agent use the necessary tools?
3. Did it respect constraints?
4. Did it take the correct action?
5. Did it validate the resulting state?
6. Did it escalate when the action failed?
