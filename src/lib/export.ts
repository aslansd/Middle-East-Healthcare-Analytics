import type { HealthcareRecord } from "../data";

/**
 * Escapes a CSV field. Anything containing a delimiter, quote or newline is
 * quoted, and embedded quotes are doubled per RFC 4180.
 */
function escapeCsvField(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function recordsToCsv(records: HealthcareRecord[]): string {
  const headers = [
    "country",
    "year",
    "life_expectancy_years",
    "health_expenditure_pct_gdp",
    "infant_mortality_per_1000",
    "physicians_per_1000",
    "hospital_beds_per_1000",
    "is_gcc"
  ];

  const rows = records.map((r) =>
    [
      r.country,
      r.year,
      r.lifeExpectancy,
      r.expenditurePctGdp,
      r.infantMortality,
      r.physiciansPer1000,
      r.hospitalBedsPer1000,
      r.isGcc
    ]
      .map(escapeCsvField)
      .join(",")
  );

  // A UTF-8 BOM keeps Arabic/Persian country names intact when opened in Excel.
  return "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
}

/** Triggers a client-side file download without needing a server round-trip. */
export function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Give the browser a tick to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function timestampedName(prefix: string, extension: string): string {
  const stamp = new Date().toISOString().slice(0, 10);
  return `${prefix}-${stamp}.${extension}`;
}
