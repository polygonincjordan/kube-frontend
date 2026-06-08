/**
 * Pure, dependency-free helpers that decide whether a Lab / Radiology clinical
 * order item may still be cancelled / deleted.
 *
 * Once Lab or Radiology work has been performed (Done / Partially Done /
 * Completed / Performed) the order can no longer be cancelled. These helpers are
 * intentionally free of Angular / SweetAlert / network dependencies so they can
 * be unit tested in isolation and reused from the patient-profile delete flows.
 * They never mutate their inputs and never build SAP payloads.
 *
 * Callers (the Orders Profile Lab/Rad delete actions) only ever pass Lab/Rad
 * items, so no Lab-vs-Rad type detection is needed here.
 */

/** A performed Lab/Rad item surfaced for the blocked-cancellation warning. */
export interface BlockedOrderItem {
  /** Best-effort human readable service name (may be empty when unknown). */
  service: string;
  /** The raw status text that triggered the block. */
  status: string;
}

/**
 * Fields that may carry the performed/done status on a Lab/Rad item. Matched in
 * order; the displayed `Status` column wins. Result-status text fields are
 * included so e.g. "Completed with abnormal" is also caught.
 */
const STATUS_FIELDS = [
  'Status',
  'StatusText',
  'StatusTxt',
  'Statustext',
  'Status_txt',
  'ZZRESULT_STATUS_TEXT',
  'Zzresult_status_text',
  'ResultStatusText',
];

/** Fields that may carry the service name, in priority order. */
const SERVICE_FIELDS = [
  'Leitxt',
  'Leistung',
  'Leist',
  'serviceDescr',
  'Servtxt',
  'text',
  'name',
];

/** Lower-cases, collapses whitespace and trims a free-text status value. */
export function normalizeStatus(value: any): string {
  return (value === null || value === undefined ? '' : String(value))
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Returns true when the status indicates work has already been performed
 * (Performed / Partially Done / Done / Completed and "… with abnormal"
 * variants), and false for non-performed statuses.
 *
 * Negated forms are stripped first so "Not done", "Not performed",
 * "Not yet completed" remain deletable. "Incomplete" is not matched because the
 * `\b` word boundary fails inside the word.
 */
export function isPerformedStatus(value: any): boolean {
  const normalized = normalizeStatus(value);
  if (!normalized) {
    return false;
  }
  const stripped = normalized.replace(
    /\bnot\s+(?:\w+\s+)*?(?:performed|done|complete|completed)\b/g,
    ' '
  );
  return (
    /\bperformed\b/.test(stripped) ||
    /\bdone\b/.test(stripped) ||
    /\bcomplet(?:e|ed)\b/.test(stripped)
  );
}

/** Returns the first performed status string found on an item, else ''. */
export function getBlockedStatus(item: any): string {
  if (!item || typeof item !== 'object') {
    return '';
  }
  for (const field of STATUS_FIELDS) {
    const value = item[field];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      if (isPerformedStatus(value)) {
        return String(value).trim();
      }
    }
  }
  return '';
}

/** Best-effort human readable service name for the warning message. */
export function getServiceName(item: any): string {
  if (!item || typeof item !== 'object') {
    return '';
  }
  for (const field of SERVICE_FIELDS) {
    const value = item[field];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

/**
 * Inspects the Lab/Rad items about to be deleted and returns the ones that are
 * performed (and therefore must not be cancelled).
 */
export function findBlockedLabRadItems(items: any): BlockedOrderItem[] {
  if (!Array.isArray(items)) {
    return [];
  }
  const blocked: BlockedOrderItem[] = [];
  items.forEach((item) => {
    const status = getBlockedStatus(item);
    if (status) {
      blocked.push({ service: getServiceName(item), status });
    }
  });
  return blocked;
}

/** Title for the blocked-cancellation warning dialog. */
export const BLOCKED_CANCELLATION_TITLE = 'Cancellation not allowed';

/**
 * Builds the warning message shown when a Lab/Rad cancellation is blocked,
 * listing the affected service(s) and matched status, de-duplicated.
 */
export function buildBlockedMessage(blocked: BlockedOrderItem[]): string {
  const base =
    'Cancellation is not allowed for Lab/Radiology services that have already been performed.';
  if (!blocked || !blocked.length) {
    return base;
  }
  const seen: { [line: string]: boolean } = {};
  const lines: string[] = [];
  blocked.forEach((item) => {
    const service = (item.service || '').trim();
    const status = (item.status || '').trim();
    let line = service ? (status ? `${service} — ${status}` : service) : status;
    line = line.trim();
    if (line && !seen[line]) {
      seen[line] = true;
      lines.push(line);
    }
  });
  return lines.length ? `${base}\n\n${lines.join('\n')}` : base;
}
