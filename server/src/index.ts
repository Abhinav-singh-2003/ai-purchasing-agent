import "dotenv/config";
import express from "express";
import cors from "cors";
import { runAgent } from "./agent";
import { resetData } from "./data";
import { PurchasingInput } from "./types";

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "ai-purchasing-agent" });
});

app.post("/api/agent/review", async (req, res) => {
  const input = req.body as Partial<PurchasingInput>;

  if (!input.productId || typeof input.recommendedQuantity !== "number") {
    return res.status(400).json({
      error: "productId and numeric recommendedQuantity are required"
    });
  }

  try {
    const result = await runAgent({
      productId: input.productId,
      recommendedQuantity: input.recommendedQuantity,
      scenario: input.scenario
    });
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unexpected error"
    });
  }
});

app.post("/api/reset", (_req, res) => {
  resetData();
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
