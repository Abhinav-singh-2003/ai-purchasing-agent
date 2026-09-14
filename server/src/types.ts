export type Decision = "ACCEPT" | "MODIFY" | "REJECT" | "INVESTIGATE";
export type ValidationStatus = "VALIDATED" | "MISMATCH" | "NOT_RUN";

export interface Product {
  id: string;
  name: string;
  currentInventory: number;
  dailyDemand: number;
  forecastDailyDemand: number;
  leadTimeDays: number;
  supplierId: string;
  moq: number;
  unitCost: number;
  storageCapacity: number;
  availableBudget: number;
}

export interface PurchaseOrder {
  id: string;
  productId: string;
  supplierId: string;
  quantity: number;
  status: "OPEN" | "PARTIAL" | "CANCELLED";
  expectedDeliveryDays: number;
}

export interface Supplier {
  id: string;
  name: string;
  availableQuantity: Record<string, number>;
  leadTimeDays: number;
  unitCost: Record<string, number>;
}

export interface PurchasingInput {
  productId: string;
  recommendedQuantity: number;
  scenario?: "recommendation" | "supplier_shortfall" | "demand_spike" | "constraint";
}

export interface Evidence {
  inventory: Product;
  openOrders: PurchaseOrder[];
  supplier: Supplier;
  alternativeSuppliers: Supplier[];
  totalIncoming: number;
  projectedDemandDuringLeadTime: number;
  projectedCoverageAfterPurchase: number;
  requestedCost: number;
  storageAvailable: number;
}

export interface AgentResult {
  decision: Decision;
  approvedQuantity: number;
  reasons: string[];
  warnings: string[];
  evidence: Evidence;
  action: {
    type: "CREATE_PO" | "MODIFY_PO" | "NO_ACTION" | "ESCALATE";
    message: string;
  };
  validation: {
    status: ValidationStatus;
    expectedQuantity?: number;
    actualQuantity?: number;
    message: string;
  };
}
