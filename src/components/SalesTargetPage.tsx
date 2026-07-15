import { useState } from "react";
import { SalesTarget } from "../types";
import { addSalesTarget, updateSalesTarget, deleteSalesTarget } from "../lib/storage";
import { BRANCHES } from "../data/branches";
import { Plus, Trash2 } from "lucide-react";

export function SalesTargetPage({ rows, refresh }: { rows: SalesTarget[]; refresh: () => void }) {
  const [form, setForm] = useState({ branch: "", month: new Date().toISOString().slice(0, 7), targetAmount: 0 });

  function submit() {
    if (!form.branch.trim() || !form.targetAmount) return;
    addSalesTarget({ ...form, actualAmount: 0 });
    setForm({ branch: "", month: new Date().toISOString().slice(0, 7), targetAmount: 0 });
    refresh();
  }

  function fmt(n: number) {
    return n.toLocaleString("th-TH");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-5">เป้าการขาย</h1>

      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5">
        <h2 className="font-semibold text-slate-700 mb-3">เพิ่มเป้าหมายใหม่</h2>
        <div className="grid sm:grid-cols-4 gap-3">
          <select
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
            value={form.branch}
            onChange={(e) => setForm((f) => ({ ...f, branch: e.target.value }))}
          >
            <option value="">เลือกสาขา</option>
            {BRANCHES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <input
            type="month"
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
            value={form.month}
            onChange={(e) => setForm((f) => ({ ...f, month: e.target.value }))}
          />
          <input
            type="number"
            placeholder="เป้าหมาย (บาท)"
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
            value={form.targetAmount || ""}
            onChange={(e) => setForm((f) => ({ ...f, targetAmount: Number(e.target.value) }))}
          />
          <button onClick={submit} className="flex items-center justify-center gap-2 bg-brand-600 text-white rounded-lg px-3 py-2 text-sm font-medium">
            <Plus size={16} /> เพิ่ม
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200">
              <th className="px-4 py-3 font-medium">สาขา</th>
              <th className="px-4 py-3 font-medium">เดือน</th>
              <th className="px-4 py-3 font-medium text-right">เป้าหมาย</th>
              <th className="px-4 py-3 font-medium text-right">ยอดขายจริง</th>
              <th className="px-4 py-3 font-medium text-right">% สำเร็จ</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  ยังไม่มีเป้าหมายการขาย
                </td>
              </tr>
            )}
            {rows.map((r) => {
              const pct = r.targetAmount ? Math.round((r.actualAmount / r.targetAmount) * 100) : 0;
              return (
                <tr key={r.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-800">{r.branch}</td>
                  <td className="px-4 py-3 text-slate-600">{r.month}</td>
                  <td className="px-4 py-3 text-right">{fmt(r.targetAmount)}</td>
                  <td className="px-4 py-3 text-right">
                    <input
                      type="number"
                      className="w-28 text-right border border-slate-200 rounded px-2 py-1"
                      value={r.actualAmount}
                      onChange={(e) => { updateSalesTarget(r.id, { actualAmount: Number(e.target.value) }); refresh(); }}
                    />
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${pct >= 100 ? "text-emerald-600" : "text-slate-600"}`}>
                    {pct}%
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { deleteSalesTarget(r.id); refresh(); }} className="text-slate-300 hover:text-rose-500">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
