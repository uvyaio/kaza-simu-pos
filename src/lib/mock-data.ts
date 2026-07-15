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

// Menu items sold at the restaurant (used by POS as the tappable menu)
export const products: Product[] = [
  { id: "m1", name: "Nyama Choma (½ kg)", sku: "MEAT-NYA", category: "Mains", price: 850, cost: 480, stock: 40, reorder: 10, unit: "plate", emoji: "🥩", supplier: "Kitchen" },
  { id: "m2", name: "Ugali & Sukuma", sku: "MEAL-UGS", category: "Mains", price: 250, cost: 90, stock: 60, reorder: 15, unit: "plate", emoji: "🍽️", supplier: "Kitchen" },
  { id: "m3", name: "Pilau ya Kuku", sku: "MEAL-PIL", category: "Mains", price: 450, cost: 200, stock: 35, reorder: 10, unit: "plate", emoji: "🍛", supplier: "Kitchen" },
  { id: "m4", name: "Samaki wa Kupaka", sku: "FISH-KUP", category: "Mains", price: 780, cost: 420, stock: 22, reorder: 8, unit: "plate", emoji: "🐟", supplier: "Kitchen" },
  { id: "m5", name: "Chapati (2 pcs)", sku: "SIDE-CHA", category: "Sides", price: 80, cost: 25, stock: 120, reorder: 30, unit: "order", emoji: "🫓", supplier: "Kitchen" },
  { id: "m6", name: "Chips (Fries)", sku: "SIDE-CHP", category: "Sides", price: 200, cost: 70, stock: 80, reorder: 20, unit: "plate", emoji: "🍟", supplier: "Kitchen" },
  { id: "m7", name: "Kachumbari", sku: "SIDE-KAC", category: "Sides", price: 100, cost: 40, stock: 50, reorder: 15, unit: "bowl", emoji: "🥗", supplier: "Kitchen" },
  { id: "m8", name: "Mandazi (3 pcs)", sku: "SNK-MAN", category: "Snacks", price: 60, cost: 20, stock: 90, reorder: 25, unit: "order", emoji: "🍩", supplier: "Kitchen" },
  { id: "m9", name: "Samosa (Beef)", sku: "SNK-SAM", category: "Snacks", price: 50, cost: 18, stock: 70, reorder: 20, unit: "pc", emoji: "🥟", supplier: "Kitchen" },
  { id: "m10", name: "Chai ya Maziwa", sku: "DRK-CHA", category: "Drinks", price: 80, cost: 25, stock: 100, reorder: 20, unit: "cup", emoji: "🍵", supplier: "Kitchen" },
  { id: "m11", name: "Fresh Passion Juice", sku: "DRK-PAS", category: "Drinks", price: 180, cost: 70, stock: 40, reorder: 12, unit: "glass", emoji: "🧃", supplier: "Kitchen" },
  { id: "m12", name: "Coca-Cola 500ml", sku: "DRK-COK", category: "Drinks", price: 120, cost: 70, stock: 60, reorder: 20, unit: "btl", emoji: "🥤", supplier: "Coca-Cola Beverages" },
];

// Raw ingredients / supplies purchased for the kitchen
export type Ingredient = {
  id: string;
  name: string;
  category: string;
  stock: number;
  reorder: number;
  unit: string;
  costPerUnit: number;
  emoji: string;
  expiry?: string;
  supplier: string;
};

export const ingredients: Ingredient[] = [
  { id: "i1", name: "Tomatoes", category: "Vegetables", stock: 3, reorder: 8, unit: "kg", costPerUnit: 120, emoji: "🍅", expiry: "2026-07-20", supplier: "Marikiti Market" },
  { id: "i2", name: "Onions (Red)", category: "Vegetables", stock: 12, reorder: 10, unit: "kg", costPerUnit: 90, emoji: "🧅", supplier: "Marikiti Market" },
  { id: "i3", name: "Sukuma Wiki", category: "Vegetables", stock: 6, reorder: 5, unit: "bunch", costPerUnit: 30, emoji: "🥬", expiry: "2026-07-18", supplier: "Karatina Farmers" },
  { id: "i4", name: "Cabbage", category: "Vegetables", stock: 8, reorder: 6, unit: "head", costPerUnit: 60, emoji: "🥬", supplier: "Karatina Farmers" },
  { id: "i5", name: "Tilapia (Fresh)", category: "Fish & Meat", stock: 4, reorder: 10, unit: "kg", costPerUnit: 480, emoji: "🐟", expiry: "2026-07-16", supplier: "Gikomba Fish Market" },
  { id: "i6", name: "Beef (Boneless)", category: "Fish & Meat", stock: 7, reorder: 8, unit: "kg", costPerUnit: 620, emoji: "🥩", expiry: "2026-07-17", supplier: "Farmer's Choice" },
  { id: "i7", name: "Chicken (Whole)", category: "Fish & Meat", stock: 2, reorder: 6, unit: "pc", costPerUnit: 550, emoji: "🍗", expiry: "2026-07-17", supplier: "Kenchic" },
  { id: "i8", name: "Goat Meat", category: "Fish & Meat", stock: 5, reorder: 5, unit: "kg", costPerUnit: 780, emoji: "🍖", supplier: "Burma Market" },
  { id: "i9", name: "Pembe Maize Flour", category: "Dry Goods", stock: 18, reorder: 10, unit: "kg", costPerUnit: 95, emoji: "🌽", supplier: "Unga Ltd" },
  { id: "i10", name: "Basmati Rice", category: "Dry Goods", stock: 9, reorder: 15, unit: "kg", costPerUnit: 220, emoji: "🍚", supplier: "Capwell Industries" },
  { id: "i11", name: "Wheat Flour (Chapati)", category: "Dry Goods", stock: 14, reorder: 10, unit: "kg", costPerUnit: 130, emoji: "🌾", supplier: "Unga Ltd" },
  { id: "i12", name: "Elianto Cooking Oil", category: "Dry Goods", stock: 6, reorder: 8, unit: "L", costPerUnit: 310, emoji: "🫙", supplier: "Bidco Africa" },
  { id: "i13", name: "Royco Mchuzi Mix", category: "Spices", stock: 4, reorder: 5, unit: "pkt", costPerUnit: 85, emoji: "🧂", supplier: "Unilever Kenya" },
  { id: "i14", name: "Pilau Masala", category: "Spices", stock: 3, reorder: 4, unit: "pkt", costPerUnit: 140, emoji: "🌶️", supplier: "Tropical Heat" },
  { id: "i15", name: "Salt (Kensalt)", category: "Spices", stock: 10, reorder: 5, unit: "pkt", costPerUnit: 45, emoji: "🧂", supplier: "Kensalt Ltd" },
  { id: "i16", name: "Brookside Milk 500ml", category: "Dairy", stock: 20, reorder: 15, unit: "pkt", costPerUnit: 52, emoji: "🥛", expiry: "2026-07-22", supplier: "Brookside Dairy" },
  { id: "i17", name: "Ketepa Tea Leaves", category: "Dairy", stock: 5, reorder: 4, unit: "pkt", costPerUnit: 210, emoji: "🍵", supplier: "Ketepa Tea" },
  { id: "i18", name: "Charcoal (Nyama Choma)", category: "Fuel", stock: 2, reorder: 3, unit: "sack", costPerUnit: 1400, emoji: "🪵", supplier: "Local Supplier" },
  { id: "i19", name: "Cooking Gas 13kg", category: "Fuel", stock: 1, reorder: 2, unit: "cyl", costPerUnit: 3200, emoji: "🔥", supplier: "K-Gas" },
  { id: "i20", name: "Passion Fruits", category: "Fruits", stock: 4, reorder: 6, unit: "kg", costPerUnit: 180, emoji: "🍈", expiry: "2026-07-19", supplier: "Marikiti Market" },
];

export const salesTrend = [
  { day: "Mon", sales: 24500, profit: 6800 },
  { day: "Tue", sales: 31200, profit: 8400 },
  { day: "Wed", sales: 28900, profit: 7900 },
  { day: "Thu", sales: 36800, profit: 10200 },
  { day: "Fri", sales: 52100, profit: 15300 },
  { day: "Sat", sales: 68400, profit: 19800 },
  { day: "Sun", sales: 49600, profit: 14400 },
];

export const paymentSplit = [
  { name: "M-Pesa", value: 72, color: "var(--color-mpesa)" },
  { name: "Cash", value: 23, color: "var(--color-primary)" },
  { name: "Card", value: 5, color: "var(--color-chart-4)" },
];

export const topProducts = [
  { name: "Nyama Choma", units: 84, revenue: 71400 },
  { name: "Ugali & Sukuma", units: 132, revenue: 33000 },
  { name: "Pilau ya Kuku", units: 76, revenue: 34200 },
  { name: "Chapati", units: 210, revenue: 16800 },
  { name: "Chai ya Maziwa", units: 168, revenue: 13440 },
];

export const aiInsights = [
  { tone: "warning", title: "Low ingredient alert", body: "Tilapia and Tomatoes will run out by lunch service — order from Gikomba now.", icon: "⚠️" },
  { tone: "success", title: "Best-selling dish", body: "Nyama Choma sales up 28% this week — consider a weekend special.", icon: "📈" },
  { tone: "info", title: "Shopping list ready", body: "AI prepared today's market run: Tomatoes, Chicken, Passion Fruits, Cooking Gas.", icon: "🛒" },
  { tone: "danger", title: "Food cost spike", body: "Beef cost is up 12% vs last month — review Nyama Choma pricing.", icon: "🚨" },
];

export const customers = [
  { id: "c1", name: "Wanjiku Kamau", phone: "+254 712 345 678", points: 1240, visits: 32, spent: 48200 },
  { id: "c2", name: "Otieno Ochieng", phone: "+254 722 456 789", points: 890, visits: 21, spent: 31500 },
  { id: "c3", name: "Aisha Mohamed", phone: "+254 733 567 890", points: 2105, visits: 48, spent: 76300 },
  { id: "c4", name: "Brian Mutua", phone: "+254 705 678 901", points: 320, visits: 9, spent: 12400 },
  { id: "c5", name: "Faith Njeri", phone: "+254 798 789 012", points: 1560, visits: 27, spent: 54100 },
];

export const staff = [
  { id: "s1", name: "Mercy Akinyi", role: "Waitress", branch: "Westlands", status: "active", sales: 124000 },
  { id: "s2", name: "Daniel Kiprop", role: "Manager", branch: "Westlands", status: "active", sales: 0 },
  { id: "s3", name: "Chef Kamau", role: "Head Chef", branch: "Westlands", status: "active", sales: 0 },
  { id: "s4", name: "Grace Wairimu", role: "Waitress", branch: "Eastleigh", status: "active", sales: 98500 },
  { id: "s5", name: "Samuel Mwangi", role: "Kitchen Assistant", branch: "Westlands", status: "off", sales: 0 },
  { id: "s6", name: "Linet Achieng", role: "Cashier", branch: "Thika Road", status: "active", sales: 87200 },
];

export const branches = [
  { id: "b1", name: "Westlands Kitchen", sales: 184500, growth: 12 },
  { id: "b2", name: "Eastleigh Grill", sales: 96800, growth: -4 },
  { id: "b3", name: "Thika Road Bistro", sales: 142300, growth: 8 },
];
