export interface DocumentVersionHistoryRow {
  [key: string]: any;
  isCurrentVersion?: boolean;
  sourceDocument?: any;
}

const RELEASED_VALUES = ['RELEASED', 'X', 'TRUE', '2', 'FR'];

/** Returns true only when the dashboard document is explicitly released. */
export function isReleasedDocument(document: any): boolean {
  if (!document || typeof document !== 'object') {
    return false;
  }

  const status = [
    document.StatusTxt,
    document.NodocText,
    document.DokstText,
    document.Released,
    document.DocStatus,
    document.Dokst,
  ].find(
    (value) =>
      value !== null &&
      value !== undefined &&
      (typeof value === 'boolean' || String(value).trim() !== '')
  );
  if (typeof status === 'boolean') {
    return status;
  }

  return RELEASED_VALUES.includes(String(status ?? '').trim().toUpperCase());
}

/** Reads either dashboard (`Zversion`) or history (`Dokvr`) version formats. */
export function getDocumentVersion(document: any): number | null {
  const rawVersion = document?.Dokvr ?? document?.Zversion;
  if (rawVersion === null || rawVersion === undefined || rawVersion === '') {
    return null;
  }

  const match = String(rawVersion).match(/\d+/);
  return match ? Number(match[0]) : null;
}

/**
 * Converts the current dashboard document to the field names consumed by the
 * existing history modals while retaining the original payload for opening.
 */
export function normalizeCurrentDocument(
  currentDocument: any,
  historyFallback?: any
): DocumentVersionHistoryRow {
  const fallback = historyFallback || {};
  const version = getDocumentVersion(currentDocument);

  return {
    ...fallback,
    ...currentDocument,
    DocKey: currentDocument?.DocKey ?? currentDocument?.Dockey ?? fallback.DocKey,
    Dockey: currentDocument?.Dockey ?? currentDocument?.DocKey ?? fallback.Dockey,
    Dokvr: version === null ? fallback.Dokvr : String(version),
    DtidText:
      currentDocument?.DtidText ??
      currentDocument?.Dktxt ??
      fallback.DtidText,
    Erdattim:
      currentDocument?.Erdattim ??
      currentDocument?.Dodat ??
      currentDocument?.DocDate ??
      fallback.Erdattim,
    Mitarbname:
      currentDocument?.Mitarbname ??
      currentDocument?.MitarbName ??
      currentDocument?.PhyNm ??
      fallback.Mitarbname,
    Orgdo: currentDocument?.Orgdo ?? fallback.Orgdo,
    Released: true,
    Mimetype:
      currentDocument?.Mimetype ??
      currentDocument?.AttMimeType ??
      fallback.Mimetype,
    AttMimeType:
      currentDocument?.AttMimeType ??
      currentDocument?.Mimetype ??
      fallback.AttMimeType,
    isCurrentVersion: true,
    sourceDocument: currentDocument,
  };
}

/**
 * Keeps the popup limited to previous releases, removes duplicate versions,
 * and returns newest-to-oldest numeric version order.
 */
export function mergeReleasedDocumentVersions(
  history: any,
  currentDocument: any
): DocumentVersionHistoryRow[] {
  const currentVersion = getDocumentVersion(currentDocument);
  const currentDocumentKeys = new Set(
    [currentDocument?.DocKey, currentDocument?.Dockey].filter(Boolean)
  );
  const historyRows: DocumentVersionHistoryRow[] = Array.isArray(history)
    ? history
      .filter((row) => {
        const rowVersion = getDocumentVersion(row);
        const rowKeys = [row?.DocKey, row?.Dockey].filter(Boolean);

        return !(
          (currentVersion !== null && rowVersion === currentVersion) ||
          rowKeys.some((key) => currentDocumentKeys.has(key))
        );
      })
      .map((row) => ({ ...row, isCurrentVersion: false }))
    : [];

  const seenVersions = new Set<string>();
  const uniqueRows = historyRows.filter((row) => {
    const version = getDocumentVersion(row);
    const key = version === null
      ? `doc:${row.DocKey ?? row.Dockey ?? ''}`
      : `version:${version}`;

    if (seenVersions.has(key)) {
      return false;
    }
    seenVersions.add(key);
    return true;
  });

  return uniqueRows.sort((left, right) => {
    const leftVersion = getDocumentVersion(left);
    const rightVersion = getDocumentVersion(right);
    return (rightVersion ?? -1) - (leftVersion ?? -1);
  });
}

/**
 * True only when the history popup would have rows to show: the document is
 * identifiable and its version is at least the second one, so a previous
 * release exists. `mergeReleasedDocumentVersions` drops the current version,
 * so anything below this always produces an empty popup.
 */
export function hasPreviousDocumentVersions(document: any): boolean {
  const documentKey = document?.Dockey ?? document?.DocKey;
  if (!documentKey) {
    return false;
  }

  const version = getDocumentVersion(document);
  return version !== null && version > 1;
}
