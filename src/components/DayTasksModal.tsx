import { Task } from "../types";
import { toggleTaskComplete, deleteTask, isOverdue } from "../lib/storage";
import { X, CheckCircle2, Circle, Trash2, Plus } from "lucide-react";

export function DayTasksModal({
  dateStr,
  tasks,
  onClose,
  onEdit,
  onAdd,
  refresh,
}: {
  dateStr: string;
  tasks: Task[];
  onClose: () => void;
  onEdit: (t: Task) => void;
  onAdd: () => void;
  refresh: () => void;
}) {
  const label = new Date(dateStr + "T00:00:00").toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-5 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">{label}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-2 mb-4">
          {tasks.length === 0 && <div className="text-sm text-slate-400 text-center py-6">ไม่มีงานในวันนี้</div>}
          {tasks.map((t) => (
            <div key={t.id} className="flex items-start gap-2 border border-slate-200 rounded-lg p-3">
              <button onClick={() => { toggleTaskComplete(t.id); refresh(); }} className="mt-0.5 text-brand-600">
                {t.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
              </button>
              <button onClick={() => onEdit(t)} className="flex-1 text-left">
                <div className={`text-sm font-medium ${t.completed ? "line-through text-slate-400" : "text-slate-800"}`}>
                  {t.title}
                </div>
                {t.branch && <div className="text-xs text-slate-400">สาขา: {t.branch}</div>}
                {!t.completed && isOverdue(t) && <div className="text-xs text-rose-600 font-semibold">เลยกำหนด</div>}
              </button>
              <button
                onClick={() => { deleteTask(t.id); refresh(); }}
                className="text-slate-300 hover:text-rose-500 mt-0.5"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={onAdd}
          className="w-full flex items-center justify-center gap-2 border border-dashed border-slate-300 rounded-lg py-2.5 text-sm font-medium text-brand-600"
        >
          <Plus size={16} /> เพิ่มงานในวันนี้
        </button>
      </div>
    </div>
  );
}
