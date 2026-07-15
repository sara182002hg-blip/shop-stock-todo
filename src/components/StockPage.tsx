import { useMemo, useState } from "react";
import { Product } from "../types";
import { deleteProduct } from "../lib/storage";
import { exportStockPdf } from "../lib/pdf";
import { BRANCHES } from "../data/branches";
import { ProductModal } from "./ProductModal";
import { StockAdjustModal } from "./StockAdjustModal";
import { Plus, Search, FileDown, Pencil, SlidersHorizontal, Trash2 } from "lucide-react";

export function StockPage({ products, refresh }: { products: Product[]; refresh: () => void }) {
  const [query, setQuery] = useState("");
  const [branch, setBranch] = useState("");
  const [editing, setEditing] = useState<Product | null | undefined>(undefined);
  const [adjusting, setAdjusting] = useState<Product | null>(null);
  const [exporting, setExporting] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.barcode.includes(q)
    );
  }, [products, query]);

  async function handleExport() {
    if (exporting) return;
    setExporting(true);
    try {
      await exportStockPdf(filtered, { branch, title: "ใบเช็คสต็อกสินค้าประจำสาขา" });
    } catch (err: any) {
      console.error("exportStockPdf failed:", err);
      alert("สร้าง PDF ไม่สำเร็จ: " + (err?.message || String(err)));
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h1 className="text-2xl font-bold text-slate-800">สต็อกสินค้า</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setEditing(null)}
            className="flex items-center gap-2 bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium"
          >
            <Plus size={16} /> เพิ่มสินค้า
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 border border-slate-300 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
          >
            <FileDown size={16} /> {exporting ? "กำลังสร้าง..." : "ดาวน์โหลด PDF"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm"
            placeholder="ค้นหาสินค้า / บาร์โค้ด / หมวดหมู่"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="min-w-[260px]">
          <select
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          >
            <option value="">สาขาที่เข้านับสต็อก (สำหรับพิมพ์ใบเช็ค)</option>
            {BRANCHES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200">
              <th className="px-4 py-3 font-medium">สินค้า</th>
              <th className="px-4 py-3 font-medium">หมวดหมู่</th>
              <th className="px-4 py-3 font-medium">หน่วย</th>
              <th className="px-4 py-3 font-medium text-right">คงเหลือ</th>
              <th className="px-4 py-3 font-medium text-center">สถานะ</th>
              <th className="px-4 py-3 font-medium text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const low = p.quantity <= p.minStock;
              return (
                <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{p.name}</div>
                    {p.description && <div className="text-xs text-slate-400">{p.description}</div>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.category}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {p.weightUnit} {p.unit}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">{p.quantity}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        low ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {low ? "ใกล้หมด" : "ปกติ"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setAdjusting(p)}
                        title="ปรับสต็อก"
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                      >
                        <SlidersHorizontal size={16} />
                      </button>
                      <button
                        onClick={() => setEditing(p)}
                        title="แก้ไข"
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`ลบ "${p.name}" ?`)) deleteProduct(p.id);
                        }}
                        title="ลบ"
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editing !== undefined && <ProductModal product={editing} onClose={() => { setEditing(undefined); refresh(); }} />}
      {adjusting && <StockAdjustModal product={adjusting} onClose={() => { setAdjusting(null); refresh(); }} />}
    </div>
  );
}
