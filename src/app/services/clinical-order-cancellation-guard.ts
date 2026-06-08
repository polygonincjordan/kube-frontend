/**
 * Shared, pure helpers that decide whether a Lab / Radiology clinical order item
 * may still be cancelled / deleted.
 *
 * Once Lab or Radiology work has been performed (sample collected, study done,
 * results released, etc.) the order can no longer be cancelled. These helpers are
 * intentionally free of any Angular / SweetAlert / network dependencies so they
 * can be unit tested in isolation and reused from multiple services and
 * components. They never mutate their inputs and never build SAP payloads – they
 * only inspect status data and report which items are protected.
 */

/** A Lab / Rad item that is protected from cancellation, surfaced for warnings. */
export interface ProtectedClinicalOrderItem {
  /** Best-effort human readable service name, may be empty when unknown. */
  serviceName: string;
  /** The raw status text that triggered the protection. */
  status: string;
}

/**
 * Object keys that are known to carry a clinical-order status text. Matching is
 * case-insensitive, so spelling/casing variants (StatusText / Statustext /
 * StatusTxt …) are all covered. Any other key whose normalized name contains
 * "status" is also inspected, which keeps result-status text fields covered.
 */
export const STATUS_FIELD_NAMES = [
  'Status',
  'StatusText',
  'StatusTxt',
  'Statustext',
  'Posstatus',
  'Lststatus',
  'Servicestatustext',
  'Resultstatus',
  'Resultstatustext',
  'Resstatus',
  'Resstatustext',
];

/** Type / target-collection values that identify a Lab or Radiology item. */
const LAB_RAD_TYPES = ['lab', 'rad'];
const LAB_RAD_TARGET_COLLECTIONS = ['tolabset', 'toradset'];

/**
 * Status tokens that indicate work has already been performed. Matched with word
 * boundaries against the normalized status text so that "Partially Done",
 * "Done", "Completed", "Performed" etc. (and case / spacing variants) are all
 * caught, while substrings inside unrelated words (e.g. "abandoned") are not.
 */
const PROTECTED_STATUS_PATTERNS: RegExp[] = [
  /\bperformed\b/,
  /\bpartially\s+done\b/,
  /\bdone\b/,
  /\bcompleted\b/,
  /\bcomplete\b/,
];

/** Lower-cases, collapses whitespace and trims a free-text status value. */
export function normalizeStatusText(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  return value
    .toString()
    .toLowerCase()
    .replace(/[_\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Returns true when the supplied status text indicates the Lab/Rad work has
 * already been performed / partially done / done / completed.
 */
export function isProtectedStatus(value: any): boolean {
  const normalized = normalizeStatusText(value);
  if (!normalized) {
    return false;
  }
  return PROTECTED_STATUS_PATTERNS.some((pattern) => pattern.test(normalized));
}

/**
 * Detects whether an item is a Lab or Radiology order. Detection is based on the
 * item's `type` / `targetCollection` hints. When the caller already knows the
 * item is Lab/Rad (e.g. profile delete flows that only operate on one section)
 * `assumeLabOrRad` short-circuits the detection.
 */
export function isLabOrRadItem(item: any, assumeLabOrRad = false): boolean {
  if (assumeLabOrRad) {
    return true;
  }
  if (!item) {
    return false;
  }
  const type = normalizeStatusText(item.type || item.Type);
  if (LAB_RAD_TYPES.indexOf(type) !== -1) {
    return true;
  }
  const target = normalizeStatusText(
    item.targetCollection || item.TargetCollection || item.collection
  );
  return LAB_RAD_TARGET_COLLECTIONS.indexOf(target) !== -1;
}

/** Collects every candidate status string present on an item. */
export function getItemStatusTexts(item: any): string[] {
  if (!item || typeof item !== 'object') {
    return [];
  }
  const values: string[] = [];
  const seenKeys = new Set<string>();
  const pushValue = (raw: any) => {
    if (raw === null || raw === undefined) {
      return;
    }
    if (typeof raw === 'string' || typeof raw === 'number') {
      const text = raw.toString();
      if (text.trim()) {
        values.push(text);
      }
    }
  };

  STATUS_FIELD_NAMES.forEach((name) => {
    if (Object.prototype.hasOwnProperty.call(item, name)) {
      seenKeys.add(name);
      pushValue(item[name]);
    }
  });

  Object.keys(item).forEach((key) => {
    if (seenKeys.has(key)) {
      return;
    }
    if (key.toLowerCase().indexOf('status') !== -1) {
      pushValue(item[key]);
    }
  });

  return values;
}

/** Returns the first protected status string on an item, or '' when none. */
export function getMatchedProtectedStatus(item: any): string {
  const statuses = getItemStatusTexts(item);
  for (const status of statuses) {
    if (isProtectedStatus(status)) {
      return status.toString().trim();
    }
  }
  return '';
}

/** Best-effort human readable service name for warning messages. */
export function getItemServiceName(item: any): string {
  if (!item || typeof item !== 'object') {
    return '';
  }
  const candidates = [
    item.serviceDescr,
    item.Servtxt,
    item.text,
    item.Leitxt,
    item.Leistung,
    item.Leist,
    item.serviceName,
    item.Servicetext,
    item.name,
  ];
  for (const candidate of candidates) {
    if (candidate !== null && candidate !== undefined) {
      const text = candidate.toString().trim();
      if (text) {
        return text;
      }
    }
  }
  return '';
}

/**
 * Inspects a list of order items and returns the Lab/Rad ones that are protected
 * from cancellation. Non Lab/Rad items (Proc, Med, Surgery, Consultation) are
 * ignored. Pass `assumeLabOrRad = true` from flows that already know every item
 * is Lab/Rad and where the items may not carry a `type` hint.
 */
export function findProtectedLabRadItems(
  items: any,
  assumeLabOrRad = false
): ProtectedClinicalOrderItem[] {
  if (!Array.isArray(items)) {
    return [];
  }
  const protectedItems: ProtectedClinicalOrderItem[] = [];
  items.forEach((item) => {
    if (!item) {
      return;
    }
    if (!isLabOrRadItem(item, assumeLabOrRad)) {
      return;
    }
    const status = getMatchedProtectedStatus(item);
    if (status) {
      protectedItems.push({
        serviceName: getItemServiceName(item),
        status,
      });
    }
  });
  return protectedItems;
}

/** Default title for the blocked-cancellation warning dialog. */
export const LAB_RAD_CANCELLATION_BLOCKED_TITLE = 'Cancellation not allowed';

/**
 * Builds the warning message shown when a Lab/Rad cancellation is blocked.
 * Includes the affected service names / statuses when they are available.
 */
export function buildLabRadCancellationBlockedMessage(
  protectedItems: ProtectedClinicalOrderItem[]
): string {
  const base =
    'Cancellation is not allowed for Lab/Radiology services that have already been performed or completed.';
  if (!protectedItems || !protectedItems.length) {
    return base;
  }
  const seen = new Set<string>();
  const details: string[] = [];
  protectedItems.forEach((item) => {
    const name = (item.serviceName || '').trim();
    const status = (item.status || '').trim();
    let line = name;
    if (status) {
      line = name ? `${name} (${status})` : status;
    }
    line = line.trim();
    if (line && !seen.has(line)) {
      seen.add(line);
      details.push(line);
    }
  });
  if (!details.length) {
    return base;
  }
  return `${base}\n\nAffected service(s):\n${details.join('\n')}`;
}
