import * as XLSX from 'xlsx';

function cellToString(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value).trim();
  }
  return String(value).trim();
}

function isHeaderCell(value: string) {
  const normalized = value.trim().toLowerCase();
  if (/^(name|names|part name|part names|spare part|spare parts)$/.test(normalized)) {
    return true;
  }
  if (/name list$/i.test(value.trim())) {
    return true;
  }
  return false;
}

/** Reads the first column of the first sheet; skips a header row named "name" or "names". */
export function parseSparePartNamesFromExcel(buffer: ArrayBuffer): string[] {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: '',
    blankrows: false,
  });

  const names: string[] = [];

  rows.forEach((row, index) => {
    if (!Array.isArray(row) || row.length === 0) return;

    const value = cellToString(row[0]);
    if (!value) return;

    if (index === 0 && isHeaderCell(value)) return;

    names.push(value);
  });

  return names;
}
