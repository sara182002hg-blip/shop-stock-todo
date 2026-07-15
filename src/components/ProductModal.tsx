import { useState } from "react";
import { Product } from "../types";
import { addProduct, updateProduct } from "../lib/storage";
import { X } from "lucide-react";

export function ProductModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const [form, setForm] = useState({
    species: product?.species ?? "",
    category: product?.category ?? "",
    name: product?.name ?? "",
    description: product?.description ?? "",
    weightUnit: product?.weightUnit ?? "",
    unit: product?.unit ?? "",
    barcode: product?.barcode ?? "",
    qtyPerCase: product?.qtyPerCase ?? 1,
    quantity: product?.quantity ?? 0,
    minStock: product?.minStock ?? 5,
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit() {
    if (!form.name.trim()) return;
    if (product) {
      updateProduct(product.id, form);
    } else {
      addProduct({ ...form, price: null, imageUrl: null });
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">{product ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-500">ชื่อสินค้า</label>
            <input
              className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500">ประเภทสัตว์</label>
              <input
                className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1"
                value={form.species}
                onChange={(e) => set("species", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">หมวดหมู่</label>
              <input
                className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">รายละเอียด</label>
            <input
              className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500">น้ำหนัก</label>
              <input
                className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1"
                value={form.weightUnit}
                onChange={(e) => set("weightUnit", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">หน่วย</label>
              <input
                className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1"
                value={form.unit}
                onChange={(e) => set("unit", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">บาร์โค้ด</label>
              <input
                className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1"
                value={form.barcode}
                onChange={(e) => set("barcode", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500">จำนวน/ลัง</label>
              <input
                type="number"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1"
                value={form.qtyPerCase}
                onChange={(e) => set("qtyPerCase", Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">คงเหลือ</label>
              <input
                type="number"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1"
                value={form.quantity}
                onChange={(e) => set("quantity", Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">ขั้นต่ำ</label>
              <input
                type="number"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1"
                value={form.minStock}
                onChange={(e) => set("minStock", Number(e.target.value))}
              />
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 border border-slate-300 rounded-lg py-2.5 text-slate-600 font-medium">
            ยกเลิก
          </button>
          <button onClick={submit} className="flex-1 bg-brand-600 text-white rounded-lg py-2.5 font-medium">
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}
