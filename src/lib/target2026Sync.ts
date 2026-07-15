const TARGET2026_URL =
  "https://script.google.com/macros/s/AKfycbzhZR5ncKS_PeylC4xVcBiTqYCuQqxYOU5rcYkA6xuWx4FEsvQNKqOEuyu0xcwvYczB9w/exec";

export interface Target2026Table {
  headers: string[];
  rows: Record<string, unknown>[];
}

function cleanHeader(value: unknown, index: number): string {
  const header = String(value ?? "").trim();
  return header || `คอลัมน์ ${index + 1}`;
}

function normalizeTable(value: any): Target2026Table {
  const source = value?.target2026 ?? value?.targets ?? value?.rows ?? value;

  if (source && Array.isArray(source.headers) && Array.isArray(source.rows)) {
    const headers = source.headers.map(cleanHeader);
    return {
      headers,
      rows: source.rows.map((row: any) => {
        if (!Array.isArray(row)) return row ?? {};
        return Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""]));
      }),
    };
  }

  if (Array.isArray(source)) {
    if (source.length === 0) return { headers: [], rows: [] };
    if (Array.isArray(source[0])) {
      const headers = source[0].map(cleanHeader);
      return {
        headers,
        rows: source.slice(1).map((row: unknown[]) =>
          Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""]))
        ),
      };
    }
    const headers = Array.from(
      source.reduce((set: Set<string>, row: Record<string, unknown>) => {
        Object.keys(row ?? {}).forEach((key) => set.add(key));
        return set;
      }, new Set<string>())
    );
    return { headers, rows: source };
  }

  return { headers: [], rows: [] };
}

export async function fetchTarget2026(): Promise<Target2026Table> {
  const primary = await fetch(`${TARGET2026_URL}?action=getTarget2026`);
  const primaryJson = await primary.json();

  if (!primaryJson?.error) {
    return normalizeTable(primaryJson);
  }

  const fallback = await fetch(`${TARGET2026_URL}?action=getAll`);
  const fallbackJson = await fallback.json();
  if (fallbackJson?.error) throw new Error(fallbackJson.error);

  const table = normalizeTable(fallbackJson);
  if (table.headers.length === 0 && table.rows.length === 0) {
    throw new Error(primaryJson.error || "ยังไม่พบข้อมูล Target2026 จาก Apps Script");
  }
  return table;
}
