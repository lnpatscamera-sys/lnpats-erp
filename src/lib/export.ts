import { liberiaDateTime } from '@/lib/time';
export function exportCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0] ?? {});
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [keys.join(","), ...rows.map((r) => keys.map((k) => esc(r[k])).join(","))].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = filename;
  a.click();
}

export async function exportExcel(filename: string, rows: Record<string, unknown>[]) {
  const XLSX = await import("xlsx");
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(rows), "LNPATS Report");
  XLSX.writeFile(book, `${filename}.xlsx`);
}

export async function exportPdf(title: string, rows: Record<string, unknown>[]) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const { drawPdfLetterhead, currentWriter, writerLines } = await import("@/lib/letterhead");
  const doc = new jsPDF({ orientation: "landscape" });
  const w = doc.internal.pageSize.getWidth();
  const [writer, top] = await Promise.all([currentWriter().catch(() => null), drawPdfLetterhead(doc as never)]);
  doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.text(title, w / 2, top + 5, { align: "center" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(9);
  let y = top + 11;
  if (writer) { writerLines(writer).forEach((l, i) => { doc.setFont("helvetica", i === 0 ? "bold" : "normal"); doc.text(l, 14, y); y += 4.5; }); }
  doc.setFont("helvetica", "normal"); doc.text(liberiaDateTime(new Date()), w - 14, top + 11, { align: "right" });
  const startY = Math.max(y + 3, top + 18);
  doc.setFontSize(9);
  if (title === "Leave approval letter") {
    const record = rows[0];
    if (!record) return;
    doc.setFontSize(12);
    const lines = [`Reference: ${record['Reference'] ?? ""}`, `Officer: ${record['Officer'] ?? ""}`, `Service number: ${record['Service'] ?? ""}`, "", `Your ${record['Type'] ?? ""} leave request for ${record['Days'] ?? ""} days, from ${record['Start'] ?? ""} to ${record['End'] ?? ""}, has been approved and processed by the Human Resource Section.`, "", "Please report back for duty at the end of your approved leave period.", "", "Human Resource Section", "Liberia National Police Academy and Training School"];
    doc.text(doc.splitTextToSize(lines.join("\n"), 250), 14, startY);
    doc.save(`${title}.pdf`);
    return;
  }
  const keys = Object.keys(rows[0] ?? {});
  autoTable(doc, { startY: 30, head: [keys], body: rows.map(r => keys.map(k => String(r[k] ?? ""))), styles: { fontSize: 8 } });
  doc.save(`${title}.pdf`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formValues(form: HTMLFormElement): any {
  return Object.fromEntries(new FormData(form));
}
