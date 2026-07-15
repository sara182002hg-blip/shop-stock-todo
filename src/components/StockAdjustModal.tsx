import { useState } from "react";
import { Product } from "../types";
import { adjustStock } from "../lib/storage";
import { X, Plus, Minus } from "lucide-react";

export function StockAdjustModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [amount, setAmount] = useState(1);

  function apply(sign: 1 | -1) {
    adjustStock(product.id, sign * amount);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">ปรับสต็อก</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        <div className="text-sm text-slate-600 mb-3">{product.name}</div>
        <div className="text-center text-3xl font-bold text-slate-800 mb-4">
          {product.quantity} <span className="text-base font-normal text-slate-400">{product.unit}</span>
        </div>
        <input
          type="number"
          min={1}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-center text-lg mb-4"
          value={amount}
          onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
        />
        <div className="flex gap-2">
          <button
            onClick={() => apply(-1)}
            className="flex-1 flex items-center justify-center gap-2 bg-rose-50 text-rose-600 rounded-lg py-2.5 font-medium"
          >
            <Minus size={16} /> ลด
          </button>
          <button
            onClick={() => apply(1)}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 rounded-lg py-2.5 font-medium"
          >
            <Plus size={16} /> เพิ่ม
          </button>
        </div>
      </div>
    </div>
  );
}
