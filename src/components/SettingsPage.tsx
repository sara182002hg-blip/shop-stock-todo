import { useState } from "react";
import { getSheetsUrl, setSheetsUrl, getLastSync } from "../lib/storage";
import { pushToSheets, pullFromSheets } from "../lib/sheetsSync";
import { UploadCloud, DownloadCloud } from "lucide-react";

export function SettingsPage() {
  const [url, setUrl] = useState(getSheetsUrl());
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const lastSync = getLastSync();

  function saveUrl() {
    setSheetsUrl(url);
    setStatus("บันทึก URL แล้ว");
  }

  async function doPush() {
    setBusy(true);
    setStatus(null);
    try {
      await pushToSheets();
      setStatus("ส่งข้อมูลขึ้น Google Sheets สำเร็จ");
    } catch (e: any) {
      setStatus("เกิดข้อผิดพลาด: " + e.message);
    } finally {
      setBusy(false);
    }
  }

  async function doPull() {
    setBusy(true);
    setStatus(null);
    try {
      await pullFromSheets();
      setStatus("ดึงข้อมูลจาก Google Sheets สำเร็จ (รีเฟรชหน้าเพื่อดูข้อมูลล่าสุด)");
    } catch (e: any) {
      setStatus("เกิดข้อผิดพลาด: " + e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-5">ตั้งค่า</h1>

      <div className="bg-white rounded-xl border border-slate-200 p-5 max-w-xl">
        <h2 className="font-semibold text-slate-700 mb-1">ซิงค์ข้อมูลกับ Google Sheets</h2>
        <p className="text-sm text-slate-500 mb-4">
          วาง URL ของ Google Apps Script Web App (จากไฟล์ Code.gs) ที่นี่เพื่อสำรอง/ซิงค์ข้อมูลสต็อกและงาน
        </p>
        <div className="flex gap-2 mb-3">
          <input
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
            placeholder="https://script.google.com/macros/s/xxxx/exec"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button onClick={saveUrl} className="border border-slate-300 rounded-lg px-4 py-2 text-sm font-medium text-slate-700">
            บันทึก
          </button>
        </div>
        <div className="flex gap-2 mb-3">
          <button
            onClick={doPush}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-2 bg-brand-600 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
          >
            <UploadCloud size={16} /> ส่งขึ้น Sheets
          </button>
          <button
            onClick={doPull}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-2 border border-slate-300 rounded-lg py-2.5 text-sm font-medium text-slate-700 disabled:opacity-50"
          >
            <DownloadCloud size={16} /> ดึงจาก Sheets
          </button>
        </div>
        {status && <div className="text-sm text-slate-600 mb-2">{status}</div>}
        {lastSync && <div className="text-xs text-slate-400">ซิงค์ล่าสุด: {new Date(lastSync).toLocaleString("th-TH")}</div>}
      </div>
    </div>
  );
}
