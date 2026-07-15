export type TaskPriority = "high" | "medium" | "low";

export interface Product {
  id: string;
  species: string;
  category: string;
  name: string;
  description: string;
  weightUnit: string;
  unit: string;
  barcode: string;
  qtyPerCase: number;
  quantity: number;
  minStock: number;
  price: number | null;
  imageUrl: string | null;
}

export interface Task {
  id: string;
  title: string;
  note: string;
  category: string;
  priority: TaskPriority;
  branch: string;
  dueDate: string; // YYYY-MM-DD
  originalDueDate: string;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
}

export interface SalesTarget {
  id: string;
  branch: string;
  month: string; // YYYY-MM
  targetAmount: number;
  actualAmount: number;
}
