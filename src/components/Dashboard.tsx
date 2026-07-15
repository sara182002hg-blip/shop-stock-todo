import { Product, Task } from "../types";
import { isOverdue } from "../lib/storage";
import { Page } from "./Sidebar";
import { Package, AlertTriangle, ListChecks, CircleAlert } from "lucide-react";

export function Dashboard({
  products,
  tasks,
  setPage,
}: {
  products: Product[];
  tasks: Task[];
  setPage: (p: Page) => void;
}) {
  const lowStock = products.filter((p) => p.quantity <= p.minStock);
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTasks = tasks.filter((t) => !t.completed && t.dueDate === todayStr);
  const overdueTasks = tasks.filter((t) => isOverdue(t));

  const cards = [
    { label: "สินค้าทั้งหมด", value: products.length, icon: Package, color: "text-brand-600 bg-brand-50", page: "stock" as Page },
    { label: "สินค้าใกล้หมด", value: lowStock.length, icon: AlertTriangle, color: "text-amber-600 bg-amber-50", page: "stock" as Page },
    { label: "งานวันนี้", value: todayTasks.length, icon: ListChecks, color: "text-emerald-600 bg-emerald-50", page: "todo" as Page },
    { label: "งานเลยกำหนด", value: overdueTasks.length, icon: CircleAlert, color: "text-rose-600 bg-rose-50", page: "todo" as Page },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">ภาพรวม</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <button
            key={c.label}
            onClick={() => setPage(c.page)}
            className="bg-white rounded-xl border border-slate-200 p-4 text-left hover:shadow-md transition"
          >
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3 ${c.color}`}>
              <c.icon size={20} />
            </div>
            <div className="text-2xl font-bold text-slate-800">{c.value}</div>
            <div className="text-sm text-slate-500">{c.label}</div>
          </button>
        ))}
      </div>

      {lowStock.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h2 className="font-semibold text-slate-700 mb-3">สินค้าใกล้หมด</h2>
          <div className="space-y-2">
            {lowStock.slice(0, 8).map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-100 last:border-0">
                <span className="text-slate-700">{p.name}</span>
                <span className="text-rose-600 font-semibold">
                  เหลือ {p.quantity} {p.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
