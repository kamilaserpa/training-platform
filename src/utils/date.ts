const ISO_DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;
const BR_DATE_ONLY_RE = /^\d{2}\/\d{2}\/\d{4}$/;

/**
 * Parses a date string into a Date without the common timezone-shift bug.
 *
 * - For date-only strings (YYYY-MM-DD), it builds a local Date at midnight.
 * - For BR format (DD/MM/YYYY), it builds a local Date at midnight.
 * - For other inputs (ISO datetimes, timestamps), it falls back to `new Date(value)`.
 */
export function parseLocalDate(value: string | Date): Date {
  if (value instanceof Date) return new Date(value.getTime());

  if (!value) return new Date(NaN);

  if (ISO_DATE_ONLY_RE.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  if (BR_DATE_ONLY_RE.test(value)) {
    const [day, month, year] = value.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  return new Date(value);
}

/**
 * Formats a Date into YYYY-MM-DD using local date parts (no UTC conversion).
 */
export function formatISODateOnlyLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
