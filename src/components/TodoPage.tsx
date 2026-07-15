import { useMemo, useState } from "react";
import { Task } from "../types";
import { toggleTaskComplete, deleteTask, isOverdue } from "../lib/storage";
import { TodoCalendar } from "./TodoCalendar";
import { TaskModal } from "./TaskModal";
import { DayTasksModal } from "./DayTasksModal";
import { Plus, CheckCircle2, Circle, Trash2 } from "lucide-react";

export function TodoPage({ tasks, refresh }: { tasks: Task[]; refresh: () => void }) {
  const [editing, setEditing] = useState<Task | null | undefined>(undefined);
  const [addDate, setAddDate] = useState<string | undefined>(undefined);
  const [dayModal, setDayModal] = useState<string | null>(null);

  const sorted = useMemo(
    () =>
      [...tasks].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return a.dueDate.localeCompare(b.dueDate);
      }),
    [tasks]
  );

  const dayTasks = dayModal ? tasks.filter((t) => (!t.completed && isOverdue(t) ? new Date().toISOString().slice(0, 10) : t.dueDate) === dayModal) : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Smart To-Do List</h1>
        <button
          onClick={() => { setAddDate(undefined); setEditing(null); }}
          className="flex items-center gap-2 bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium"
        >
          <Plus size={16} /> เพิ่มงาน
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-5">
        <TodoCalendar tasks={tasks} onDayClick={(d) => setDayModal(d)} />

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h2 className="font-semibold text-slate-700 mb-3">รายการงานทั้งหมด</h2>
          <div className="space-y-2 max-h-[520px] overflow-y-auto">
            {sorted.length === 0 && <div className="text-sm text-slate-400 text-center py-6">ยังไม่มีงาน</div>}
            {sorted.map((t) => (
              <div key={t.id} className="flex items-start gap-2 border border-slate-100 rounded-lg p-2.5">
                <button onClick={() => { toggleTaskComplete(t.id); refresh(); }} className="mt-0.5 text-brand-600">
                  {t.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                </button>
                <button onClick={() => setEditing(t)} className="flex-1 text-left">
                  <div className={`text-sm font-medium ${t.completed ? "line-through text-slate-400" : "text-slate-800"}`}>
                    {t.title}
                  </div>
                  <div className="text-xs text-slate-400">
                    {t.dueDate}
                    {t.branch ? ` · ${t.branch}` : ""}
                  </div>
                  {!t.completed && isOverdue(t) && <div className="text-xs text-rose-600 font-semibold">เลยกำหนด</div>}
                </button>
                <button onClick={() => { deleteTask(t.id); refresh(); }} className="text-slate-300 hover:text-rose-500 mt-0.5">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {editing !== undefined && (
        <TaskModal task={editing} defaultDate={addDate} onClose={() => { setEditing(undefined); refresh(); }} />
      )}
      {dayModal && (
        <DayTasksModal
          dateStr={dayModal}
          tasks={dayTasks}
          onClose={() => setDayModal(null)}
          refresh={refresh}
          onEdit={(t) => { setDayModal(null); setEditing(t); }}
          onAdd={() => { setAddDate(dayModal); setDayModal(null); setEditing(null); }}
        />
      )}
    </div>
  );
}
