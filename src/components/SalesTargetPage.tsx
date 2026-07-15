import { useEffect, useMemo, useState } from "react";
import { SalesTarget } from "../types";
import { addSalesTarget, updateSalesTarget, deleteSalesTarget } from "../lib/storage";
import { fetchTarget2026, Target2026Table } from "../lib/target2026Sync";
import { BRANCHES } from "../data/branches";
import { Plus, RefreshCw, Trash2 } from "lucide-react";

export function SalesTargetPage({ rows, refresh }: { rows: SalesTarget[]; refresh: () => void }) {
  const [form, setForm] = useState({ branch: "", month: new Date().toISOString().slice(0, 7), targetAmount: 0 });
  const [target2026, setTarget2026] = useState<Target2026Table>({ headers: [], rows: [] });
  const [loadingTarget, setLoadingTarget] = useState(false);
  const [targetError, setTargetError] = useState("");

  async function loadTarget2026() {
    setLoadingTarget(true);
    setTargetError("");
    try {
      setTarget2026(await fetchTarget2026());
    } catch (err) {
      setTargetError(err instanceof Error ? err.message : "โหลดข้อมูล Target2026 ไม่สำเร็จ");
    } finally {
      setLoadingTarget(false);
    }
  }

  useEffect(() => {
    loadTarget2026();
  }, []);

  function submit() {
    if (!form.branch.trim() || !form.targetAmount) return;
    addSalesTarget({ ...form, actualAmount: 0 });
    setForm({ branch: "", month: new Date().toISOString().slice(0, 7), targetAmount: 0 });
    refresh();
  }

  function fmt(n: number) {
    return n.toLocaleString("th-TH");
  }

  const visibleHeaders = useMemo(
    () =>
      target2026.headers.filter((header) =>
        target2026.rows.some((row) => {
          const value = row[header];
          return value !== "" && value !== null && value !== undefined;
        })
      ),
    [target2026]
  );

  function formatCell(value: unknown) {
    if (value === null || value === undefined || value === "") return "-";
    if (typeof value === "number") return value.toLocaleString("th-TH");
    if (typeof value === "boolean") return value ? "ใช่" : "ไม่ใช่";
    return String(value);
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">เป้าการขาย</h1>
          <p className="mt-1 text-sm text-slate-500">ข้อมูลจากชีต Target2026</p>
        </div>
        <button
          onClick={loadTarget2026}
          disabled={loadingTarget}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw size={16} className={loadingTarget ? "animate-spin" : ""} />
          รีเฟรชข้อมูล
        </button>
      </div>

      <div className="mb-5 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="font-semibold text-slate-700">Target2026</h2>
          {targetError && <p className="mt-1 text-sm text-rose-600">{targetError}</p>}
          {!targetError && loadingTarget && <p className="mt-1 text-sm text-slate-400">กำลังโหลดข้อมูล...</p>}
          {!targetError && !loadingTarget && (
            <p className="mt-1 text-sm text-slate-400">พบ {target2026.rows.length.toLocaleString("th-TH")} รายการ</p>
          )}
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              {(visibleHeaders.length ? visibleHeaders : ["ข้อมูล"]).map((header) => (
                <th key={header} className="whitespace-nowrap px-4 py-3 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {target2026.rows.length === 0 && (
              <tr>
                <td colSpan={Math.max(visibleHeaders.length, 1)} className="px-4 py-8 text-center text-slate-400">
                  {targetError ? "ยังแสดงข้อมูลจากชีตไม่ได้" : "ยังไม่มีข้อมูล Target2026"}
                </td>
              </tr>
            )}
            {target2026.rows.map((row, index) => (
              <tr key={index} className="border-b border-slate-100 last:border-0">
                {visibleHeaders.map((header) => (
                  <td key={header} className="whitespace-nowrap px-4 py-3 text-slate-700">
                    {formatCell(row[header])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
