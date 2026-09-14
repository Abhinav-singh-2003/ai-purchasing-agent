import { useState } from "react";

type Result = {
  decision: string;
  approvedQuantity: number;
  reasons: string[];
  warnings: string[];
  evidence: {
    inventory: {
      name: string;
      currentInventory: number;
      forecastDailyDemand: number;
      leadTimeDays: number;
      moq: number;
      unitCost: number;
      availableBudget: number;
      storageCapacity: number;
    };
    totalIncoming: number;
    projectedDemandDuringLeadTime: number;
    projectedCoverageAfterPurchase: number;
    requestedCost: number;
    storageAvailable: number;
    supplier: { name: string; leadTimeDays: number };
  };
  action: { type: string; message: string };
  validation: {
    status: string;
    expectedQuantity?: number;
    actualQuantity?: number;
    message: string;
  };
};

const API = "http://localhost:4000";

export default function App() {
  const [productId, setProductId] = useState("p-100");
  const [quantity, setQuantity] = useState(800);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  async function review() {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API}/api/agent/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          recommendedQuantity: quantity,
          scenario: "recommendation"
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed");
      setResult(data);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  async function reset() {
    await fetch(`${API}/api/reset`, { method: "POST" });
    setResult(null);
  }

  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">FULL-STACK AI WORKFLOW</p>
          <h1>AI Purchasing Agent</h1>
          <p>
            Investigate operational data, challenge a recommendation, take a
            constrained action, and validate the result.
          </p>
        </div>
        <div className="badge">Human approval ready</div>
      </section>

      <section className="card controls">
        <div>
          <label>Product</label>
          <select value={productId} onChange={(e) => setProductId(e.target.value)}>
            <option value="p-100">Instant Coffee 200g</option>
            <option value="p-200">Bottled Water 1L</option>
          </select>
        </div>

        <div>
          <label>System recommendation</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>

        <button onClick={review} disabled={loading}>
          {loading ? "Investigating..." : "Run Agent"}
        </button>
        <button className="secondary" onClick={reset}>Reset demo</button>
      </section>

      {!result && (
        <section className="card empty">
          <h2>Try Scenario 1</h2>
          <p>
            Run the default 800-unit recommendation. The agent will inspect
            inventory, forecast, open POs, supplier availability, budget and
            storage before deciding.
          </p>
        </section>
      )}

      {result && (
        <>
          <section className="grid">
            <Metric title="Decision" value={result.decision} />
            <Metric title="Approved quantity" value={String(result.approvedQuantity)} />
            <Metric title="Incoming stock" value={String(result.evidence.totalIncoming)} />
            <Metric title="Storage available" value={String(result.evidence.storageAvailable)} />
          </section>

          <section className="card">
            <h2>Agent reasoning</h2>
            {result.reasons.map((reason, i) => (
              <p className="reason" key={i}>• {reason}</p>
            ))}
            {result.warnings.length > 0 && (
              <>
                <h3>Warnings</h3>
                {result.warnings.map((warning, i) => (
                  <p className="warning" key={i}>⚠ {warning}</p>
                ))}
              </>
            )}
          </section>

          <section className="grid two">
            <div className="card">
              <h2>Evidence gathered</h2>
              <Row k="Inventory" v={`${result.evidence.inventory.currentInventory} units`} />
              <Row k="Forecast/day" v={`${result.evidence.inventory.forecastDailyDemand} units`} />
              <Row k="Lead time" v={`${result.evidence.inventory.leadTimeDays} days`} />
              <Row k="Open PO quantity" v={`${result.evidence.totalIncoming} units`} />
              <Row k="Unit cost" v={`₹${result.evidence.inventory.unitCost}`} />
              <Row k="Requested spend" v={`₹${result.evidence.requestedCost}`} />
              <Row k="Budget" v={`₹${result.evidence.inventory.availableBudget}`} />
            </div>

            <div className="card">
              <h2>Action + validation</h2>
              <Row k="Action" v={result.action.type} />
              <p>{result.action.message}</p>
              <Row k="Validation" v={result.validation.status} />
              <p>{result.validation.message}</p>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="metric card">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="row">
      <span>{k}</span>
      <strong>{v}</strong>
    </div>
  );
}
