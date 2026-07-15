import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ungzip } from "pako";
import { Product } from "../types";

// Gzip+base64 "Noto Sans Thai" (Thai + Latin subset) TrueType font.
const THAI_FONT_GZ_B64 =
  "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巨大化しているのが「Noto Sans Thai」フォントデータです。
const THAI_FONT_GZ_B64 =
  "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";

let thaiFontB64Cache: string | null = null;
async function getThaiFontBase64(): Promise<string> {
  if (thaiFontB64Cache) return thaiFontB64Cache;
  const bin = atob(THAI_FONT_GZ_B64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const fontBytes = ungzip(bytes);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < fontBytes.length; i += chunkSize) {
    binary += String.fromCharCode(...fontBytes.subarray(i, i + chunkSize));
  }
  thaiFontB64Cache = btoa(binary);
  return thaiFontB64Cache;
}

function fmtMoney(n: number): string {
  return n.toLocaleString("th-TH", { maximumFractionDigits: 0 });
}

export async function exportStockPdf(
  products: Product[],
  opts?: { branch?: string; title?: string; inspector?: string }
) {
  const fontB64 = await getThaiFontBase64();
  const title = opts?.title ?? "ใบเช็คสต็อกสินค้าประจำสาขา";
  const branch = opts?.branch?.trim() || "ทุกสาขา / สำนักงานใหญ่";

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  doc.addFileToVFS("NotoThai-Regular.ttf", fontB64);
  doc.addFont("NotoThai-Regular.ttf", "NotoThai", "normal");
  doc.setFont("NotoThai", "normal");

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const now = new Date();
  const dateLabel = now.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
  const timeLabel = now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  const lowStock = products.filter((p) => p.quantity <= p.minStock);
  const totalQty = products.reduce((s, p) => s + p.quantity, 0);

  // ฟังก์ชันวาดแถบหัวกระดาษสีน้ำเงิน (แก้ไขระยะ Y ให้ไม่ล้นจอ)
  function drawHeader() {
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, pageW, 18, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text(title, 8, 7);
    doc.setFontSize(8.5);
    doc.text("ระบบจัดการสต็อกสินค้าและงานประจำวัน · KOA BY BAS", 8, 13);
    doc.setTextColor(0, 0, 0);
  }

  function drawMetaBox(startY: number): number {
    const boxY = startY, boxH = 16;
    doc.setDrawColor(200, 206, 214);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(8, boxY, pageW - 16, boxH, 1.5, 1.5, "FD");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const col1X = 12, col2X = pageW / 2 + 6;
    doc.text("สาขา:", col1X, boxY + 6);
    doc.setTextColor(15, 23, 42);
    doc.text(branch, col1X + 14, boxY + 6, { maxWidth: pageW / 2 - 30 });
    doc.setTextColor(51, 65, 85);
    doc.text(`ผู้นับสต็อก: ${opts?.inspector?.trim() || "......................................"}`, col1X, boxY + 12);
    doc.text(`วันที่: ${dateLabel}  เวลา ${timeLabel} น.`, col2X, boxY + 6);
    doc.text(
      `รายการทั้งหมด ${products.length}  ·  ใกล้หมด ${lowStock.length}  ·  รวมคงเหลือในระบบ ${fmtMoney(totalQty)} หน่วย`,
      col2X,
      boxY + 12,
      { maxWidth: pageW - col2X - 10 }
    );
    doc.setTextColor(0, 0, 0);
    return boxY + boxH + 5;
  }

  // วาดหัวกระดาษหน้าแรก
  drawHeader();
  const tableStartY = drawMetaBox(22);

  // จัดกลุ่มสินค้าตามหมวดหมู่
  const byCategory = new Map<string, Product[]>();
  products.forEach((p) => {
    const list = byCategory.get(p.category) ?? [];
    list.push(p);
    byCategory.set(p.category, list);
  });

  const body: any[][] = [];
  let no = 1;
  byCategory.forEach((items, category) => {
    body.push([
      {
        content: category,
        colSpan: 8,
        styles: { font: "NotoThai", fontStyle: "normal", fillColor: [219, 234, 254], textColor: [30, 64, 175], fontSize: 9.5 },
      },
    ]);
    items.forEach((p) => {
      const status = p.quantity <= p.minStock ? "ใกล้หมด" : "ปกติ";
      body.push([
        no++,
        `${p.name}${p.description ? "\n" + p.description : ""}`,
        p.barcode || "-",
        `${p.weightUnit} ${p.unit}`.trim(),
        p.quantity,
        "",
        "",
        {
          content: status,
          styles: {
            font: "NotoThai",
            fontStyle: "normal",
            textColor: p.quantity <= p.minStock ? [185, 28, 28] : [21, 128, 61],
          },
        },
      ]);
    });
  });

  // สร้างตารางด้วยระบบคำนวณระยะอัตโนมัติที่ถูกต้อง
  autoTable(doc, {
    startY: tableStartY,
    head: [["ลำดับ", "ชื่อสินค้า", "บาร์โค้ด", "หน่วย", "ระบบ", "นับได้จริง", "✓", "สถานะ"]],
    body,
    styles: {
      font: "NotoThai",
      fontStyle: "normal",
      fontSize: 8.5,
      cellPadding: { top: 2.5, bottom: 2.5, left: 2, right: 2 },
      lineColor: [222, 228, 236],
      lineWidth: 0.1,
      minCellHeight: 8,
      valign: "middle",
    },
    headStyles: { font: "NotoThai", fontStyle: "normal", fillColor: [30, 64, 175], textColor: 255, fontSize: 9 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 13, halign: "center" },
      1: { cellWidth: 78 },
      2: { cellWidth: 27, halign: "center" },
      3: { cellWidth: 22, halign: "center" },
      4: { cellWidth: 16, halign: "center" },
      5: { cellWidth: 30, halign: "center" },
      6: { cellWidth: 12, halign: "center" },
      7: { cellWidth: 18, halign: "center" },
    },
    // 🔥 ตั้งค่าขอบกระดาษให้สมดุลเพื่อรองรับการแสดงผลทุกหน้า
    margin: { left: 8, right: 8, top: 24, bottom: 24 },
    rowPageBreak: "avoid",
    // ทำงานเมื่อระบบขึ้นหน้าใหม่เพื่อให้หัวตารางไม่เบี้ยวตัดขาด
    showHead: "everyPage",
    didParseCell: (data) => {
      if (data.row.section === "body" && data.column.index === 6 && data.cell.raw === "") {
        data.cell.text = [];
      }
    },
    didDrawCell: (data) => {
      // วาดกล่องสี่เหลี่ยมสำหรับเช็คลิสต์เครื่องหมายถูก
      if (data.row.section === "body" && data.column.index === 6) {
        const size = 4;
        const cx = data.cell.x + data.cell.width / 2 - size / 2;
        const cy = data.cell.y + data.cell.height / 2 - size / 2;
        doc.setDrawColor(100, 116, 139);
        doc.rect(cx, cy, size, size);
      }
    },
    didDrawPage: (data) => {
      // วาดแถบสีน้ำเงินหัวกระดาษสำหรับหน้า 2 เป็นต้นไป
      if (doc.getNumberOfPages() > 1) {
        drawHeader();
      }
      // ใส่ท้ายกระดาษและเลขหน้าอย่างเป็นระบบ
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`สร้างโดยระบบจัดการสต็อกสินค้า · ${dateLabel} ${timeLabel} น.`, 8, pageH - 6);
      doc.text(`หน้า ${doc.getCurrentPageInfo().pageNumber} / {total_pages_count_string}`, pageW - 22, pageH - 6);
      doc.setTextColor(0, 0, 0);
    },
  });

  // ใส่จำนวนหน้าทั้งหมดแบบไดนามิกลงในท้ายกระดาษ
  if (typeof (doc as any).putTotalPages === "function") {
    (doc as any).putTotalPages("{total_pages_count_string}");
  }

  // คำนวณตำแหน่งลายเซ็นท้ายตารางอย่างชาญฉลาด ไม่ให้ทับเนื้อหา
  let finalY = (doc as any).lastAutoTable?.finalY ?? tableStartY;
  if (finalY > pageH - 34) {
    doc.addPage();
    drawHeader();
    finalY = 24;
  }
  const sigY = finalY + 16;
  doc.setFontSize(9);
  doc.setDrawColor(100, 116, 139);
  doc.line(20, sigY, 90, sigY);
  doc.text("ผู้นับสต็อก", 47, sigY + 5);
  doc.line(pageW - 90, sigY, pageW - 20, sigY);
  doc.text("ผู้ตรวจสอบ / หัวหน้าสาขา", pageW - 70, sigY + 5);

  const fileBranch = (opts?.branch || "all").replace(/[^a-zA-Z0-9ก-๙]/g, "_").slice(0, 30);
  doc.save(`stock-checklist-${fileBranch}-${now.toISOString().slice(0, 10)}.pdf`);
}
