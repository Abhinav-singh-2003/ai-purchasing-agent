import { products, purchaseOrders, suppliers } from "./data";
import { Evidence, Product, PurchaseOrder, Supplier } from "./types";

export function getProduct(productId: string): Product {
  const product = products.find((p) => p.id === productId);
  if (!product) throw new Error(`Product ${productId} not found`);
  return product;
}

export function getOpenOrders(productId: string): PurchaseOrder[] {
  return purchaseOrders.filter(
    (po) => po.productId === productId && (po.status === "OPEN" || po.status === "PARTIAL")
  );
}

export function getSupplier(supplierId: string): Supplier {
  const supplier = suppliers.find((s) => s.id === supplierId);
  if (!supplier) throw new Error(`Supplier ${supplierId} not found`);
  return supplier;
}

export function getAlternativeSuppliers(productId: string, primarySupplierId: string): Supplier[] {
  return suppliers.filter(
    (s) => s.id !== primarySupplierId && (s.availableQuantity[productId] ?? 0) > 0
  );
}

export function investigate(productId: string): Evidence {
  const product = getProduct(productId);
  const openOrders = getOpenOrders(productId);
  const supplier = getSupplier(product.supplierId);
  const alternativeSuppliers = getAlternativeSuppliers(productId, supplier.id);
  const totalIncoming = openOrders.reduce((sum, po) => sum + po.quantity, 0);
  const projectedDemandDuringLeadTime =
    product.forecastDailyDemand * product.leadTimeDays;
  const storageAvailable = Math.max(
    0,
    product.storageCapacity - product.currentInventory - totalIncoming
  );

  return {
    inventory: product,
    openOrders,
    supplier,
    alternativeSuppliers,
    totalIncoming,
    projectedDemandDuringLeadTime,
    projectedCoverageAfterPurchase:
      product.currentInventory + totalIncoming - projectedDemandDuringLeadTime,
    requestedCost: 0,
    storageAvailable
  };
}

export function createPurchaseOrder(
  productId: string,
  supplierId: string,
  quantity: number
): PurchaseOrder {
  const product = getProduct(productId);
  const supplier = getSupplier(supplierId);
  const available = supplier.availableQuantity[productId] ?? 0;

  if (quantity <= 0) throw new Error("PO quantity must be positive");
  if (available < quantity) {
    throw new Error(
      `Supplier can only supply ${available} units, requested ${quantity}`
    );
  }

  supplier.availableQuantity[productId] = available - quantity;

  const po: PurchaseOrder = {
    id: `po-${Date.now()}`,
    productId,
    supplierId,
    quantity,
    status: "OPEN",
    expectedDeliveryDays: supplier.leadTimeDays
  };

  purchaseOrders.push(po);
  return po;
}
