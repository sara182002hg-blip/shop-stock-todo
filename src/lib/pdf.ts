import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ungzip } from "pako";
import { Product } from "../types";

// Gzip+base64 "Noto Sans Thai" (Thai + Latin subset) TrueType font.
// jsPDF's built-in fonts (helvetica/times/courier) do NOT contain Thai glyphs at all —
// without this, all Thai text in the exported PDF renders as garbled symbols.
// Decompressed client-side with pako (see loadSeedProducts in data/seedProducts.ts for
// the same pattern) and registered with jsPDF via addFileToVFS/addFont before drawing text.
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

  function drawHeader() {
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, pageW, 18, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.text(title, 8, 8);
    doc.setFontSize(9);
    doc.text("ระบบจัดการสต็อกสินค้าและงานประจำวัน · KOA BY BAS", 8, 14);
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

  drawHeader();
  const tableStartY = drawMetaBox(22);

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

  autoTable(doc, {
    startY: tableStartY,
    head: [["ลำดับ", "ชื่อสินค้า", "บาร์โค้ด", "หน่วย", "ระบบ", "นับได้จริง", "✓", "สถานะ"]],
    body,
    styles: {
      font: "NotoThai",
      fontStyle: "normal",
      fontSize: 8.5,
      cellPadding: { top: 2, bottom: 2, left: 2, right: 2 },
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
    margin: { left: 8, right: 8, bottom: 24 },
    rowPageBreak: "avoid",
    didParseCell: (data) => {
      if (data.row.section === "body" && data.column.index === 6 && data.cell.raw === "") {
        data.cell.text = [];
      }
    },
    didDrawCell: (data) => {
      if (data.row.section === "body" && data.column.index === 6) {
        const size = 4;
        const cx = data.cell.x + data.cell.width / 2 - size / 2;
        const cy = data.cell.y + data.cell.height / 2 - size / 2;
        doc.setDrawColor(100, 116, 139);
        doc.rect(cx, cy, size, size);
      }
    },
    didDrawPage: () => {
      if (doc.getNumberOfPages() > 1) drawHeader();
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`สร้างโดยระบบจัดการสต็อกสินค้า · ${dateLabel} ${timeLabel} น.`, 8, pageH - 6);
      doc.text(`หน้า ${doc.getCurrentPageInfo().pageNumber} / {total_pages_count_string}`, pageW - 22, pageH - 6);
      doc.setTextColor(0, 0, 0);
    },
  });

  if (typeof (doc as any).putTotalPages === "function") {
    (doc as any).putTotalPages("{total_pages_count_string}");
  }

  let finalY = (doc as any).lastAutoTable?.finalY ?? tableStartY;
  if (finalY > pageH - 34) {
    doc.addPage();
    drawHeader();
    finalY = 26;
  }
  const sigY = finalY + 16;
  doc.setFontSize(9);
  doc.setDrawColor(100, 116, 139);
  doc.line(20, sigY, 90, sigY);
  doc.text("ผู้นับสต็อก", 40, sigY + 5);
  doc.line(pageW - 90, sigY, pageW - 20, sigY);
  doc.text("ผู้ตรวจสอบ / หัวหน้าสาขา", pageW - 78, sigY + 5);

  const fileBranch = (opts?.branch || "all").replace(/[^a-zA-Z0-9ก-๙]/g, "_").slice(0, 30);
  doc.save(`stock-checklist-${fileBranch}-${now.toISOString().slice(0, 10)}.pdf`);
}
