import { LayoutDashboard, Package, ListTodo, Target, Settings } from "lucide-react";

export type Page = "dashboard" | "stock" | "todo" | "salesTarget" | "settings";

const NAV: { key: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "dashboard", label: "ภาพรวม", icon: LayoutDashboard },
  { key: "stock", label: "สต็อกสินค้า", icon: Package },
  { key: "todo", label: "Smart To-Do List", icon: ListTodo },
  { key: "salesTarget", label: "เป้าการขาย", icon: Target },
  { key: "settings", label: "ตั้งค่า", icon: Settings },
];

export function Sidebar({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white min-h-screen p-4 hidden md:flex md:flex-col">
      <div className="px-2 py-3 mb-4">
        <div className="text-xl font-extrabold text-brand-600">KOA BY BAS</div>
        <div className="text-xs text-slate-400">สต็อก & งานง่าย</div>
      </div>
      <nav className="flex-1 space-y-1">
        {NAV.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setPage(key)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
              page === key ? "bg-brand-50 text-brand-600" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
