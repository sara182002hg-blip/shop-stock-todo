import { useMemo, useState } from "react";
import { Task, TaskPriority } from "../types";
import { isOverdue } from "../lib/storage";
import { ChevronLeft, ChevronRight, CircleAlert } from "lucide-react";
const priorityChip: Record<TaskPriority, string> = {
  high: "bg-rose-100 text-rose-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-slate-200 text-slate-700",
};
const WEEKDAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
export function TodoCalendar({ tasks, onDayClick }: { tasks: Task[]; onDayClick: (dateStr: string) => void }) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const todayStr = toDateStr(new Date());
  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach((t) => {
      const key = !t.completed && isOverdue(t) ? todayStr : t.dueDate;
      const list = map.get(key) ?? [];
      list.push(t);
      map.set(key, list);
    });
    return map;
  }, [tasks, todayStr]);
  const monthLabel = cursor.toLocaleDateString("th-TH", { month: "long", year: "numeric" });
  const cells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
    const result: { date: Date | null; dateStr: string | null }[] = [];
    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - startOffset + 1;
      if (dayNum < 1 || dayNum > daysInMonth) {
        result.push({ date: null, dateStr: null });
      } else {
        const d = new Date(year, month, dayNum);
        result.push({ date: d, dateStr: toDateStr(d) });
      }
    }
    return result;
  }, [cursor]);
  return (
    <div className="bg-white rounded-xl border border-slate-300 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 border border-slate-200"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-lg font-bold text-slate-800">{monthLabel}</div>
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 border border-slate-200"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="flex justify-center mb-3">
        <button
          onClick={() => setCursor(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
          className="text-xs font-medium text-brand-600 hover:underline"
        >
          กลับไปเดือนนี้
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center py-1.5 rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((cell, i) => {
          if (!cell.date || !cell.dateStr) {
            return <div key={i} className="min-h-[104px] rounded-lg bg-slate-50" />;
          }
          const dayTasks = tasksByDate.get(cell.dateStr) ?? [];
          const isCurrentDay = cell.dateStr === todayStr;
          const overdueCount = dayTasks.filter((t) => !t.completed && isOverdue(t)).length;
          return (
            <button
              key={i}
              onClick={() => onDayClick(cell.dateStr!)}
              className={`min-h-[104px] rounded-lg border-2 p-1.5 text-left align-top transition ${
                isCurrentDay
                  ? "border-brand-600 bg-brand-50"
                  : "border-slate-200 hover:border-brand-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                    isCurrentDay ? "bg-brand-600 text-white" : "text-slate-700"
                  }`}
                >
                  {cell.date.getDate()}
                </span>
                {isCurrentDay && overdueCount > 0 && (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-white bg-rose-600 rounded-full px-1.5 py-0.5">
                    <CircleAlert size={10} /> {overdueCount}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map((t) => (
                  <div
                    key={t.id}
                    className={`truncate rounded px-1.5 py-0.5 text-[10.5px] font-medium ${
                      t.completed ? "bg-slate-100 text-slate-400 line-through" : priorityChip[t.priority]
                    }`}
                  >
                    {t.title}
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-[10px] font-semibold text-brand-600">+{dayTasks.length - 3} อื่นๆ</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
