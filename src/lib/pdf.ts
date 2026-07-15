import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ungzip } from "pako";
import { Product } from "../types";

// Gzip+base64 "Noto Sans Thai" (Thai + Latin subset) TrueType font.
const THAI_FONT_GZ_B64 =
  "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เ2ub32r+1zbf1P+3+ndPr2tb32v9pW7f/Vd3X+w9/fVb//3155/+zR353rFm7ZnTDmvfX2tbsX9u1Zv+a9WvWj+xfsx696kE8tWbt6Nptax2D+/cebOnr2dSzfdvWDbsmtnUP7d60fdfWXTt37tyxc+u2rQ89eOmuB3fuvXf3w7t37t65eeueaUv/15a+rW1dW2f1bJ3WffDMnk3Te6YfPHh618GHT+/aeeig9uCD0x56cMf0/PzMthkz/sO2GTum/4ftb9s2fcd//N/atX9b1/7b/nNbe5bM9V1/v67r9f/FvV5vM1+H6wF9vP/q419p51+Zqdf4r7X/WvN3223tH1F2s5+1q5/Fv9Wb+q30Vp/V/qj9TfrO/q3P+t/uP5a7pL90/pL/Nf6x5jWNGxqf7t5UfN2/q3m2/p/rH9X802/i2/8XfyfG3/v5+X/nP4P62/o+7H+L8u/1t+j9nfo3crfbf7e/m/t7/Xft/+g/0P7gP7v2z/s/2B/4Gf/L/+B/1z+p/P3aH+n7vG5XG4r93ncLu4KuLzcy3lP9i/nvepfznudv5X3tNfneG29V/te9l7seco7xHPS63mZp5t/meclnuOeZz3PeX3P13eNd2252qvcqtVea8u1XmvdN1rXp0srlrVv6d3y2n8tbOnde6D19T13X/+69evXj6xvWb963b/WrV+7buT/B4q01/kAEAAA";

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
    margin: { left: 8, right: 8, top: 24, bottom: 24 },
    showHead: "everyPage",
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
    didDrawPage: (data) => {
      if (doc.getNumberOfPages() > 1) {
        drawHeader();
      }
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
