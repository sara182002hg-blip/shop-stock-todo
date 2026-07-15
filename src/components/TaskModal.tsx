import { useState } from "react";
import { Task, TaskPriority } from "../types";
import { addTask, updateTask } from "../lib/storage";
import { BRANCHES } from "../data/branches";
import { X } from "lucide-react";

const PRIORITY_LABEL: Record<TaskPriority, string> = { high: "สูง", medium: "ปานกลาง", low: "ต่ำ" };

export function TaskModal({
  task,
  defaultDate,
  onClose,
}: {
  task: Task | null;
  defaultDate?: string;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: task?.title ?? "",
    note: task?.note ?? "",
    branch: task?.branch ?? "",
    priority: (task?.priority ?? "medium") as TaskPriority,
    dueDate: task?.dueDate ?? defaultDate ?? new Date().toISOString().slice(0, 10),
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit() {
    if (!form.title.trim()) return;
    if (task) {
      updateTask(task.id, { ...form, category: form.branch });
    } else {
      addTask({ ...form, category: form.branch });
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">{task ? "แก้ไขงาน" : "เพิ่มงานใหม่"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-500">ชื่องาน</label>
            <input
              className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">สาขาที่เข้าตรวจสอบ</label>
            <select
              className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1"
              value={form.branch}
              onChange={(e) => set("branch", e.target.value)}
            >
              <option value="">เลือกสาขา</option>
              {BRANCHES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500">วันที่กำหนด</label>
              <input
                type="date"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1"
                value={form.dueDate}
                onChange={(e) => set("dueDate", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">ความสำคัญ</label>
              <select
                className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1"
                value={form.priority}
                onChange={(e) => set("priority", e.target.value as TaskPriority)}
              >
                {(Object.keys(PRIORITY_LABEL) as TaskPriority[]).map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_LABEL[p]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">รายละเอียดเพิ่มเติม</label>
            <textarea
              className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1"
              rows={2}
              value={form.note}
              onChange={(e) => set("note", e.target.value)}
            />
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
