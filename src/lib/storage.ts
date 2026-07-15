import { Product, Task, SalesTarget } from "../types";
import { loadSeedProducts } from "../data/seedProducts";

const KEYS = {
  products: "koa_products_v1",
  tasks: "koa_tasks_v1",
  salesTargets: "koa_sales_targets_v1",
  branches: "koa_branch_history_v1",
  seeded: "koa_seeded_v1",
  sheetsUrl: "koa_sheets_url_v1",
  lastSync: "koa_last_sync_v1",
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function notifyMutated() {
  window.dispatchEvent(new CustomEvent("petshop:mutated"));
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// ---------- Seeding ----------
export async function ensureSeeded() {
  if (localStorage.getItem(KEYS.seeded)) return;
  const products = await loadSeedProducts();
  write(KEYS.products, products);
  write(KEYS.tasks, []);
  write(KEYS.salesTargets, []);
  write(KEYS.branches, []);
  localStorage.setItem(KEYS.seeded, "1");
}

// ---------- Products ----------
export function getProducts(): Product[] {
  return read<Product[]>(KEYS.products, []);
}

export function saveProducts(products: Product[]) {
  write(KEYS.products, products);
  notifyMutated();
}

export function addProduct(p: Omit<Product, "id">) {
  const products = getProducts();
  products.push({ ...p, id: uid() });
  saveProducts(products);
}

export function updateProduct(id: string, patch: Partial<Product>) {
  const products = getProducts().map((p) => (p.id === id ? { ...p, ...patch } : p));
  saveProducts(products);
}

export function deleteProduct(id: string) {
  saveProducts(getProducts().filter((p) => p.id !== id));
}

export function adjustStock(id: string, delta: number) {
  const products = getProducts().map((p) =>
    p.id === id ? { ...p, quantity: Math.max(0, p.quantity + delta) } : p
  );
  saveProducts(products);
}

// ---------- Tasks ----------
export function getTasks(): Task[] {
  return read<Task[]>(KEYS.tasks, []);
}

export function saveTasks(tasks: Task[]) {
  write(KEYS.tasks, tasks);
  notifyMutated();
}

export function addTask(t: Omit<Task, "id" | "createdAt" | "completed" | "completedAt" | "originalDueDate">) {
  const tasks = getTasks();
  const now = new Date().toISOString();
  tasks.push({
    ...t,
    id: uid(),
    completed: false,
    completedAt: null,
    createdAt: now,
    originalDueDate: t.dueDate,
  });
  saveTasks(tasks);
  if (t.branch) rememberBranch(t.branch);
}

export function updateTask(id: string, patch: Partial<Task>) {
  const tasks = getTasks().map((t) => (t.id === id ? { ...t, ...patch } : t));
  saveTasks(tasks);
}

export function deleteTask(id: string) {
  saveTasks(getTasks().filter((t) => t.id !== id));
}

export function toggleTaskComplete(id: string) {
  const tasks = getTasks().map((t) =>
    t.id === id
      ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : null }
      : t
  );
  saveTasks(tasks);
}

export function isOverdue(task: Task): boolean {
  if (task.completed) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(task.dueDate + "T00:00:00");
  return due.getTime() < today.getTime();
}

// ---------- Sales targets ----------
export function getSalesTargets(): SalesTarget[] {
  return read<SalesTarget[]>(KEYS.salesTargets, []);
}

export function saveSalesTargets(rows: SalesTarget[]) {
  write(KEYS.salesTargets, rows);
  notifyMutated();
}

export function addSalesTarget(row: Omit<SalesTarget, "id">) {
  const rows = getSalesTargets();
  rows.push({ ...row, id: uid() });
  saveSalesTargets(rows);
  if (row.branch) rememberBranch(row.branch);
}

export function updateSalesTarget(id: string, patch: Partial<SalesTarget>) {
  saveSalesTargets(getSalesTargets().map((r) => (r.id === id ? { ...r, ...patch } : r)));
}

export function deleteSalesTarget(id: string) {
  saveSalesTargets(getSalesTargets().filter((r) => r.id !== id));
}

// ---------- Branch history (free-text + autocomplete, no fixed hardcoded list) ----------
export function getBranchHistory(): string[] {
  return read<string[]>(KEYS.branches, []);
}

export function rememberBranch(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;
  const list = getBranchHistory().filter((b) => b !== trimmed);
  list.unshift(trimmed);
  write(KEYS.branches, list.slice(0, 60));
}

// ---------- Google Sheets sync settings ----------
export function getSheetsUrl(): string {
  return localStorage.getItem(KEYS.sheetsUrl) || "";
}

export function setSheetsUrl(url: string) {
  localStorage.setItem(KEYS.sheetsUrl, url.trim());
}

export function getLastSync(): string {
  return localStorage.getItem(KEYS.lastSync) || "";
}

export function setLastSync(iso: string) {
  localStorage.setItem(KEYS.lastSync, iso);
}
