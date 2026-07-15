import { useCallback, useEffect, useState } from "react";
import { Sidebar, Page } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { StockPage } from "./components/StockPage";
import { TodoPage } from "./components/TodoPage";
import { SalesTargetPage } from "./components/SalesTargetPage";
import { SettingsPage } from "./components/SettingsPage";
import { ensureSeeded, getProducts, getTasks, getSalesTargets } from "./lib/storage";
import { Product, Task, SalesTarget } from "./types";

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [salesTargets, setSalesTargets] = useState<SalesTarget[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setProducts(getProducts());
    setTasks(getTasks());
    setSalesTargets(getSalesTargets());
  }, []);

  useEffect(() => {
    (async () => {
      await ensureSeeded();
      refresh();
      setReady(true);
    })();
  }, [refresh]);

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener("petshop:mutated", handler);
    return () => window.removeEventListener("petshop:mutated", handler);
  }, [refresh]);

  if (!ready) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400">กำลังโหลด...</div>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar page={page} setPage={setPage} />
      <main className="flex-1 p-4 md:p-8 max-w-6xl">
        {page === "dashboard" && <Dashboard products={products} tasks={tasks} setPage={setPage} />}
        {page === "stock" && <StockPage products={products} refresh={refresh} />}
        {page === "todo" && <TodoPage tasks={tasks} refresh={refresh} />}
        {page === "salesTarget" && <SalesTargetPage rows={salesTargets} refresh={refresh} />}
        {page === "settings" && <SettingsPage />}
      </main>
    </div>
  );
}
