import { Product, Task } from "../types";
import { getProducts, getTasks, saveProducts, saveTasks, getSheetsUrl, setLastSync } from "./storage";

// Talks to the Google Apps Script web app defined in Code.gs
// (doGet ?action=getAll / doPost {action:"saveAll", products, tasks, movements}).

function toSheetProduct(p: Product) {
  return {
    id: p.id,
    species: p.species,
    category: p.category,
    name: p.name,
    description: p.description,
    weightUnit: p.weightUnit,
    unit: p.unit,
    barcode: p.barcode,
    qtyPerCase: p.qtyPerCase,
    quantity: p.quantity,
    minStock: p.minStock,
    price: p.price,
    imageUrl: p.imageUrl,
  };
}

function fromSheetProduct(row: any): Product {
  return {
    id: String(row.id ?? ""),
    species: String(row.species ?? ""),
    category: String(row.category ?? ""),
    name: String(row.name ?? ""),
    description: String(row.description ?? ""),
    weightUnit: String(row.weightUnit ?? ""),
    unit: String(row.unit ?? ""),
    barcode: String(row.barcode ?? ""),
    qtyPerCase: Number(row.qtyPerCase) || 1,
    quantity: Number(row.quantity) || 0,
    minStock: Number(row.minStock) || 0,
    price: row.price === "" || row.price == null ? null : Number(row.price),
    imageUrl: row.imageUrl || null,
  };
}

function toSheetTask(t: Task) {
  return {
    id: t.id,
    title: t.title,
    note: t.note,
    category: t.branch, // reuse the sheet's "category" column to carry the branch label
    priority: t.priority,
    dueDate: t.dueDate,
    originalDueDate: t.originalDueDate,
    completed: t.completed,
    completedAt: t.completedAt,
    createdAt: t.createdAt,
  };
}

function fromSheetTask(row: any): Task {
  return {
    id: String(row.id ?? ""),
    title: String(row.title ?? ""),
    note: String(row.note ?? ""),
    category: String(row.category ?? ""),
    branch: String(row.category ?? ""),
    priority: (row.priority === "high" || row.priority === "low" ? row.priority : "medium"),
    dueDate: String(row.dueDate ?? ""),
    originalDueDate: String(row.originalDueDate ?? row.dueDate ?? ""),
    completed: !!row.completed,
    completedAt: row.completedAt || null,
    createdAt: String(row.createdAt ?? new Date().toISOString()),
  };
}

export function isSheetsConfigured(): boolean {
  return !!getSheetsUrl();
}

export async function pushToSheets(): Promise<void> {
  const url = getSheetsUrl();
  if (!url) throw new Error("ยังไม่ได้ตั้งค่า Google Sheets URL");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      action: "saveAll",
      products: getProducts().map(toSheetProduct),
      tasks: getTasks().map(toSheetTask),
      movements: [],
    }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  setLastSync(new Date().toISOString());
}

export async function pullFromSheets(): Promise<void> {
  const url = getSheetsUrl();
  if (!url) throw new Error("ยังไม่ได้ตั้งค่า Google Sheets URL");
  const res = await fetch(`${url}?action=getAll`);
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  if (Array.isArray(json.products) && json.products.length) {
    saveProducts(json.products.map(fromSheetProduct));
  }
  if (Array.isArray(json.tasks) && json.tasks.length) {
    saveTasks(json.tasks.map(fromSheetTask));
  }
  setLastSync(new Date().toISOString());
}
