/**
 * Parses every date shape this document can receive: the SAP OData
 * `/Date(ms)/` form and the `YYYY-MM-DDT00:00:00` form. The date parts are
 * read literally so the picker shows the day that was stored, whatever the
 * browser time zone is. Same parser as the NICU Admission document.
 */
export function parseNeonatalDate(value: any): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  const str = String(value).trim();
  if (!str) {
    return null;
  }

  // SAP OData v2 epoch form: /Date(1751241600000)/ or /Date(1751241600000+0180)/
  const sapMatch = /^\/Date\((-?\d+)(?:[+-]\d{4})?\)\/$/.exec(str);
  if (sapMatch) {
    const sapDate = new Date(parseInt(sapMatch[1], 10));
    return isNaN(sapDate.getTime()) ? null : sapDate;
  }

  // YYYY-MM-DDT00:00:00, with the time part, milliseconds and zone optional
  const isoMatch =
    /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(str);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    // SAP sends 0000-00-00T00:00:00 for an empty date
    if (!year || month < 1 || month > 12 || day < 1 || day > 31) {
      return null;
    }
    const isoDate = new Date(
      year,
      month - 1,
      day,
      Number(isoMatch[4] || 0),
      Number(isoMatch[5] || 0),
      Number(isoMatch[6] || 0)
    );
    return isNaN(isoDate.getTime()) ? null : isoDate;
  }

  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/** Formats a picker value (Date or DD-MM-YYYY string) as the SAP date string. */
export function toSapDateString(dateString: any): string {
  const convertDateFormat = (value: string): string => {
    const [day, month, year] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toString();
  };
  if (typeof dateString === 'string') {
    if (/\d{2}-\d{2}-\d{4}/.test(dateString)) {
      dateString = convertDateFormat(dateString);
    }
  }
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}T00:00:00`;
}

/**
 * Optional dates (such as an unticked UVC/UAC line) go to SAP as null:
 * SAP rejects an empty string for a date property.
 */
export function toOptionalSapDate(value: any): string | null {
  return value ? toSapDateString(value) : null;
}
