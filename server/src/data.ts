import { Product, PurchaseOrder, Supplier } from "./types";

export const products: Product[] = [
  {
    id: "p-100",
    name: "Instant Coffee 200g",
    currentInventory: 120,
    dailyDemand: 45,
    forecastDailyDemand: 40,
    leadTimeDays: 5,
    supplierId: "s-1",
    moq: 100,
    unitCost: 120,
    storageCapacity: 900,
    availableBudget: 100000
  },
  {
    id: "p-200",
    name: "Bottled Water 1L",
    currentInventory: 400,
    dailyDemand: 120,
    forecastDailyDemand: 100,
    leadTimeDays: 3,
    supplierId: "s-2",
    moq: 200,
    unitCost: 20,
    storageCapacity: 1000,
    availableBudget: 15000
  }
];

export let purchaseOrders: PurchaseOrder[] = [
  {
    id: "po-1",
    productId: "p-100",
    supplierId: "s-1",
    quantity: 200,
    status: "OPEN",
    expectedDeliveryDays: 3
  },
  {
    id: "po-2",
    productId: "p-200",
    supplierId: "s-2",
    quantity: 100,
    status: "OPEN",
    expectedDeliveryDays: 2
  }
];

export const suppliers: Supplier[] = [
  {
    id: "s-1",
    name: "FreshSupply",
    availableQuantity: { "p-100": 1000, "p-200": 0 },
    leadTimeDays: 5,
    unitCost: { "p-100": 120, "p-200": 0 }
  },
  {
    id: "s-2",
    name: "QuickWholesale",
    availableQuantity: { "p-100": 400, "p-200": 1000 },
    leadTimeDays: 4,
    unitCost: { "p-100": 130, "p-200": 20 }
  },
  {
    id: "s-3",
    name: "Backup Traders",
    availableQuantity: { "p-100": 600, "p-200": 500 },
    leadTimeDays: 7,
    unitCost: { "p-100": 135, "p-200": 22 }
  }
];

const initialSupplierAvailability = suppliers.map((supplier) => ({
  id: supplier.id,
  availableQuantity: { ...supplier.availableQuantity }
}));

export function resetData(): void {
  purchaseOrders = [
    {
      id: "po-1",
      productId: "p-100",
      supplierId: "s-1",
      quantity: 200,
      status: "OPEN",
      expectedDeliveryDays: 3
    },
    {
      id: "po-2",
      productId: "p-200",
      supplierId: "s-2",
      quantity: 100,
      status: "OPEN",
      expectedDeliveryDays: 2
    }
  ];

  for (const initialSupplier of initialSupplierAvailability) {
    const supplier = suppliers.find((item) => item.id === initialSupplier.id);
    if (supplier) {
      supplier.availableQuantity = { ...initialSupplier.availableQuantity };
    }
  }
}
