export const KES = (n: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n);

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  reorder: number;
  unit: string;
  emoji: string;
  expiry?: string;
  supplier: string;
};

export const products: Product[] = [
  { id: "p1", name: "Mumias Sugar 2kg", sku: "SUG-2KG", category: "Groceries", price: 380, cost: 320, stock: 4, reorder: 10, unit: "pkt", emoji: "🍬", expiry: "2026-08-12", supplier: "Mumias Sugar Co." },
  { id: "p2", name: "Brookside Milk 500ml", sku: "MLK-500", category: "Dairy", price: 65, cost: 52, stock: 28, reorder: 20, unit: "pkt", emoji: "🥛", expiry: "2026-05-20", supplier: "Brookside Dairy" },
  { id: "p3", name: "Pembe Maize Flour 2kg", sku: "UNG-2KG", category: "Groceries", price: 220, cost: 185, stock: 42, reorder: 15, unit: "pkt", emoji: "🌽", supplier: "Unga Ltd" },
  { id: "p4", name: "Coca-Cola 500ml", sku: "COK-500", category: "Beverages", price: 70, cost: 50, stock: 96, reorder: 30, unit: "btl", emoji: "🥤", supplier: "Coca-Cola Beverages" },
  { id: "p5", name: "Elianto Cooking Oil 1L", sku: "OIL-1L", category: "Groceries", price: 320, cost: 270, stock: 12, reorder: 10, unit: "btl", emoji: "🫙", supplier: "Bidco Africa" },
  { id: "p6", name: "Daawat Basmati Rice 2kg", sku: "RIC-2KG", category: "Groceries", price: 540, cost: 460, stock: 7, reorder: 12, unit: "pkt", emoji: "🍚", supplier: "Capwell Industries" },
  { id: "p7", name: "Royco Mchuzi Mix 200g", sku: "ROY-200", category: "Spices", price: 95, cost: 70, stock: 60, reorder: 25, unit: "pkt", emoji: "🧂", supplier: "Unilever Kenya" },
  { id: "p8", name: "Kenyan Tea Leaves 500g", sku: "TEA-500", category: "Beverages", price: 280, cost: 220, stock: 18, reorder: 15, unit: "pkt", emoji: "🍵", supplier: "Ketepa Tea" },
  { id: "p9", name: "Omo Detergent 1kg", sku: "OMO-1KG", category: "Household", price: 410, cost: 340, stock: 22, reorder: 12, unit: "pkt", emoji: "🧼", supplier: "Unilever Kenya" },
  { id: "p10", name: "Supa Loaf Bread 400g", sku: "BRD-400", category: "Bakery", price: 75, cost: 55, stock: 14, reorder: 20, unit: "loaf", emoji: "🍞", expiry: "2026-05-09", supplier: "Broadways Bakery" },
  { id: "p11", name: "Tropikal Apples 1kg", sku: "APL-1KG", category: "Fresh", price: 260, cost: 200, stock: 9, reorder: 8, unit: "kg", emoji: "🍎", supplier: "Fresh Produce Ltd" },
  { id: "p12", name: "Fanta Orange 500ml", sku: "FNT-500", category: "Beverages", price: 70, cost: 50, stock: 80, reorder: 30, unit: "btl", emoji: "🟠", supplier: "Coca-Cola Beverages" },
];

export const salesTrend = [
  { day: "Mon", sales: 24500, profit: 6800 },
  { day: "Tue", sales: 31200, profit: 8400 },
  { day: "Wed", sales: 28900, profit: 7900 },
  { day: "Thu", sales: 36800, profit: 10200 },
  { day: "Fri", sales: 42100, profit: 12300 },
  { day: "Sat", sales: 58400, profit: 16800 },
  { day: "Sun", sales: 39600, profit: 11400 },
];

export const paymentSplit = [
  { name: "M-Pesa", value: 68, color: "var(--color-mpesa)" },
  { name: "Cash", value: 27, color: "var(--color-primary)" },
  { name: "Card", value: 5, color: "var(--color-chart-4)" },
];

export const topProducts = [
  { name: "Brookside Milk 500ml", units: 142, revenue: 9230 },
  { name: "Supa Loaf Bread", units: 98, revenue: 7350 },
  { name: "Coca-Cola 500ml", units: 87, revenue: 6090 },
  { name: "Pembe Flour 2kg", units: 54, revenue: 11880 },
  { name: "Mumias Sugar 2kg", units: 41, revenue: 15580 },
];

export const aiInsights = [
  { tone: "warning", title: "Low stock alert", body: "Mumias Sugar 2kg will run out in 2 days at current sales pace.", icon: "⚠️" },
  { tone: "success", title: "Sales trending up", body: "Milk sales increased 22% this week vs last week.", icon: "📈" },
  { tone: "info", title: "Reorder suggestion", body: "Reorder Daawat Rice, Supa Loaf, and Elianto Oil today.", icon: "🛒" },
  { tone: "danger", title: "Refund anomaly", body: "Cashier refunds at Westlands branch are 3x normal today.", icon: "🚨" },
];

export const customers = [
  { id: "c1", name: "Wanjiku Kamau", phone: "+254 712 345 678", points: 1240, visits: 32, spent: 48200 },
  { id: "c2", name: "Otieno Ochieng", phone: "+254 722 456 789", points: 890, visits: 21, spent: 31500 },
  { id: "c3", name: "Aisha Mohamed", phone: "+254 733 567 890", points: 2105, visits: 48, spent: 76300 },
  { id: "c4", name: "Brian Mutua", phone: "+254 705 678 901", points: 320, visits: 9, spent: 12400 },
  { id: "c5", name: "Faith Njeri", phone: "+254 798 789 012", points: 1560, visits: 27, spent: 54100 },
];

export const staff = [
  { id: "s1", name: "Mercy Akinyi", role: "Cashier", branch: "Westlands", status: "active", sales: 124000 },
  { id: "s2", name: "Daniel Kiprop", role: "Manager", branch: "Westlands", status: "active", sales: 0 },
  { id: "s3", name: "Grace Wairimu", role: "Cashier", branch: "Eastleigh", status: "active", sales: 98500 },
  { id: "s4", name: "Samuel Mwangi", role: "Stock Clerk", branch: "Westlands", status: "off", sales: 0 },
  { id: "s5", name: "Linet Achieng", role: "Cashier", branch: "Thika Road", status: "active", sales: 87200 },
];

export const branches = [
  { id: "b1", name: "Westlands Mart", sales: 184500, growth: 12 },
  { id: "b2", name: "Eastleigh Kiosk", sales: 96800, growth: -4 },
  { id: "b3", name: "Thika Road Mini", sales: 142300, growth: 8 },
];
