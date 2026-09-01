export interface DocumentVersionHistoryRow {
  [key: string]: any;
  isCurrentVersion?: boolean;
  sourceDocument?: any;
}

const RELEASED_VALUES = ['RELEASED', 'X', 'TRUE'];

/** Returns true only when the dashboard document is explicitly released. */
export function isReleasedDocument(document: any): boolean {
  if (!document || typeof document !== 'object') {
    return false;
  }

  const status = document.StatusTxt ?? document.DokstText ?? document.Released;
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
 * Adds the current released document to its API history, removes duplicate
 * versions, and returns newest-to-oldest numeric version order.
 */
export function mergeReleasedDocumentVersions(
  history: any,
  currentDocument: any
): DocumentVersionHistoryRow[] {
  const historyRows: DocumentVersionHistoryRow[] = Array.isArray(history)
    ? history.map((row) => ({ ...row, isCurrentVersion: false }))
    : [];

  const rows = isReleasedDocument(currentDocument)
    ? [normalizeCurrentDocument(currentDocument, historyRows[0]), ...historyRows]
    : historyRows;

  const seenVersions = new Set<string>();
  const uniqueRows = rows.filter((row) => {
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
