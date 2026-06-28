/**
 * server/data/store.js
 * ---------------------------------------------------------
 * In-memory data store for the Express backend.
 *
 * NOTE: This is intentionally NOT a database. All data lives
 * in plain JS objects/arrays in server memory, so it resets
 * every time the server restarts. This matches the "frontend
 * + middleware only, no DB" requirement. To upgrade to a real
 * database later, swap the functions in this file for
 * Mongoose models — the route files won't need to change
 * their calling convention since everything here is already
 * exposed as small functions.
 * ---------------------------------------------------------
 */

// ─── INITIAL PRODUCTS ──────────────────────────────────────────────────────
const initialProducts = [
  { id: 1, name: 'Sky Shot Rocket',   category: 'Rockets',     price: 150, mrp: 200, stock: 50,  lowStockThreshold: 10, desc: '100 shots upward' },
  { id: 2, name: 'Color Fountain',    category: 'Fountains',   price: 120, mrp: 180, stock: 30,  lowStockThreshold: 10, desc: 'Colorful sparkles' },
  { id: 3, name: 'Flower Pot',        category: 'Flower Pots', price: 200, mrp: 250, stock: 20,  lowStockThreshold: 5,  desc: 'Beautiful multi-color' },
  { id: 4, name: 'Chakri',            category: 'Wheels',      price:  80, mrp: 120, stock: 100, lowStockThreshold: 20, desc: 'Spinning wheel' },
  { id: 5, name: 'Bomb',              category: 'Bombettes',   price:  50, mrp:  80, stock: 150, lowStockThreshold: 30, desc: 'Loud sound' },
  { id: 6, name: 'Atom Bomb',         category: 'Bombettes',   price:  30, mrp:  50, stock: 200, lowStockThreshold: 40, desc: 'Small loud cracker' },
  { id: 7, name: 'Ladi Bomb',         category: 'Bombettes',   price: 100, mrp: 150, stock:  75, lowStockThreshold: 15, desc: 'String of crackers' },
  { id: 8, name: 'Fancy Rocket',      category: 'Rockets',     price: 250, mrp: 350, stock:  25, lowStockThreshold: 8,  desc: 'Premium 200 shots' },
  { id: 9, name: 'Ground Spinner',    category: 'Wheels',      price:  60, mrp:  90, stock:  80, lowStockThreshold: 15, desc: 'Spinning ground effect' },
  { id: 10, name: 'Star Bomb',        category: 'Bombettes',   price:  40, mrp:  65, stock: 120, lowStockThreshold: 25, desc: 'Star burst effect' },
  { id: 11, name: 'Roman Candle',     category: 'Fountains',   price: 180, mrp: 240, stock:  40, lowStockThreshold: 10, desc: '10-shot candle' },
  { id: 12, name: 'Mega Fountain',    category: 'Fountains',   price: 350, mrp: 450, stock:  15, lowStockThreshold: 5,  desc: 'Premium fountain 3 mins' },
];

// ─── STATE (all in memory) ─────────────────────────────────────────────────
let products = JSON.parse(JSON.stringify(initialProducts));
let orders = [];
let bills = [];
let users = [];
let notifications = [];
let expenses = [];
let incomes = [];

const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' };

// ─── PRODUCTS ───────────────────────────────────────────────────────────────
function getProducts() {
  return products;
}

function addProduct(data) {
  const newP = {
    id: Date.now(),
    ...data,
    stock: parseInt(data.stock) || 0,
    lowStockThreshold: data.lowStockThreshold !== undefined && data.lowStockThreshold !== ''
      ? parseInt(data.lowStockThreshold) : 10,
    price: parseFloat(data.price),
    mrp: parseFloat(data.mrp),
  };
  products.push(newP);
  return newP;
}

function updateProduct(id, data) {
  products = products.map((p) =>
    p.id === Number(id)
      ? {
          ...p,
          ...data,
          stock: parseInt(data.stock),
          lowStockThreshold: data.lowStockThreshold !== undefined && data.lowStockThreshold !== ''
            ? parseInt(data.lowStockThreshold) : (p.lowStockThreshold ?? 10),
          price: parseFloat(data.price),
          mrp: parseFloat(data.mrp),
        }
      : p
  );
  return products.find((p) => p.id === Number(id));
}

function deleteProduct(id) {
  products = products.filter((p) => p.id !== Number(id));
}

function reduceStockForOrder(items) {
  items.forEach((item) => {
    const p = products.find((x) => x.id === item.productId);
    if (p) p.stock = Math.max(0, p.stock - item.qty);
  });
}

function addStockToProduct(productId, qty) {
  products = products.map((p) =>
    p.id === Number(productId) ? { ...p, stock: p.stock + parseInt(qty) } : p
  );
  return products.find((p) => p.id === Number(productId));
}

// ─── ORDERS ─────────────────────────────────────────────────────────────────
function getOrders() {
  return orders;
}

function addOrder(data) {
  const order = {
    ...data,
    id: 'ORD-' + Date.now(),
    createdAt: new Date().toISOString(),
    status: 'Pending',
  };
  orders.unshift(order);
  return order;
}

function updateOrderStatus(orderId, status) {
  const order = orders.find((o) => o.id === orderId);
  if (order) {
    order.status = status;
    order.updatedAt = new Date().toISOString();
  }
  return order;
}

// ─── BILLING ────────────────────────────────────────────────────────────────
function getBills() {
  return bills;
}

function createBill(data) {
  const bill = {
    id: 'BILL-' + Date.now(),
    ...data,
    createdAt: new Date().toISOString(),
    status: 'Paid',
  };
  bills.unshift(bill);
  return bill;
}

// ─── USERS ──────────────────────────────────────────────────────────────────
function getUsers() {
  return users;
}

function registerUser(data) {
  if (users.find((u) => u.phone === data.phone)) {
    const err = new Error('User already exists');
    err.code = 'USER_EXISTS';
    throw err;
  }
  const u = { id: Date.now(), ...data, role: 'user' };
  users.push(u);
  return u;
}

function getUserByPhone(phone) {
  return users.find((u) => u.phone === phone);
}

function validateAdmin(username, password) {
  return username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password;
}

// ─── NOTIFICATIONS ──────────────────────────────────────────────────────────
function getNotifications() {
  return notifications;
}

function addNotification(message, type = 'order', userId = null) {
  const n = {
    id: Date.now(),
    message,
    type,
    userId,
    read: false,
    createdAt: new Date().toISOString(),
  };
  notifications.unshift(n);
  return n;
}

function getNotificationsForUser(userId) {
  return notifications.filter((n) => String(n.userId) === String(userId));
}

function getUnreadCountForUser(userId) {
  return getNotificationsForUser(userId).filter((n) => !n.read).length;
}

function markAllNotificationsRead(userId) {
  notifications = notifications.map((n) =>
    String(n.userId) === String(userId) ? { ...n, read: true } : n
  );
}

// ─── EXPENSES ───────────────────────────────────────────────────────────────
function getExpenses() {
  return expenses;
}

function addExpense(data) {
  const exp = {
    id: Date.now(),
    title: data.title,
    amount: parseFloat(data.amount),
    category: data.category || 'Other',
    note: data.note || '',
    date: data.date || new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  expenses.unshift(exp);
  return exp;
}

function deleteExpense(id) {
  expenses = expenses.filter(e => e.id !== id);
}

function getIncomes() { return incomes; }
function addIncome(data) {
  const inc = { id: Date.now(), title: data.title, amount: parseFloat(data.amount), category: data.category || 'Other', note: data.note || '', date: data.date || new Date().toISOString(), createdAt: new Date().toISOString() };
  incomes.unshift(inc); return inc;
}
function deleteIncome(id) { incomes = incomes.filter(i => i.id !== id); }
module.exports = {
  // products
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  reduceStockForOrder,
  addStockToProduct,
  // orders
  getOrders,
  addOrder,
  updateOrderStatus,
  // billing
  getBills,
  createBill,
  // users
  getUsers,
  registerUser,
  getUserByPhone,
  validateAdmin,
  // notifications
  getNotifications,
  addNotification,
  getNotificationsForUser,
  getUnreadCountForUser,
  markAllNotificationsRead,
  // expenses
  getExpenses,
  addExpense,
  deleteExpense,
  getIncomes, addIncome, deleteIncome,
};
