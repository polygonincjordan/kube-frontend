import {
  getDocumentVersion,
  hasPreviousDocumentVersions,
  isReleasedDocument,
  mergeReleasedDocumentVersions,
} from './document-version-history.util';

describe('document-version-history.util', () => {
  describe('isReleasedDocument', () => {
    it('recognizes the released values used by dashboard document shapes', () => {
      expect(isReleasedDocument({ StatusTxt: 'Released' })).toBe(true);
      expect(isReleasedDocument({ DokstText: 'Released' })).toBe(true);
      expect(isReleasedDocument({ NodocText: 'Released' })).toBe(true);
      expect(isReleasedDocument({ DocStatus: '2' })).toBe(true);
      expect(isReleasedDocument({ Dokst: 'FR' })).toBe(true);
      expect(isReleasedDocument({ Released: 'X' })).toBe(true);
      expect(isReleasedDocument({ Released: true })).toBe(true);
    });

    it('rejects draft, N/A, and missing documents', () => {
      expect(isReleasedDocument({ StatusTxt: 'Draft' })).toBe(false);
      expect(isReleasedDocument({ StatusTxt: 'N/A' })).toBe(false);
      expect(
        isReleasedDocument({ NodocText: 'N/A', DokstText: 'Released' })
      ).toBe(false);
      expect(isReleasedDocument(null)).toBe(false);
    });
  });

  describe('getDocumentVersion', () => {
    it('reads current and historical version formats', () => {
      expect(getDocumentVersion({ Zversion: '02' })).toBe(2);
      expect(getDocumentVersion({ Dokvr: 'v10' })).toBe(10);
      expect(getDocumentVersion({})).toBeNull();
    });
  });

  describe('mergeReleasedDocumentVersions', () => {
    it('keeps the current released version out of the history popup', () => {
      const current = {
        Dockey: 'current-key',
        Zversion: '02',
        StatusTxt: 'Released',
        DocDate: '/Date(2000)/',
        PhyNm: 'Current User',
        AttMimeType: 'HTML',
      };
      const result = mergeReleasedDocumentVersions(
        [{ DocKey: 'old-key', Dokvr: '01', DtidText: 'Assessment' }],
        current
      );

      expect(result.map((row) => row.Dokvr)).toEqual(['01']);
      expect(result[0].DocKey).toBe('old-key');
      expect(result[0].DtidText).toBe('Assessment');
      expect(result[0].isCurrentVersion).toBe(false);
    });

    it('keeps released predecessors available for a draft current document', () => {
      const history = [{ DocKey: 'old-key', Dokvr: '00' }];
      const result = mergeReleasedDocumentVersions(history, {
        Dockey: 'draft-key',
        Zversion: '01',
        StatusTxt: 'Draft',
      });

      expect(result.length).toBe(1);
      expect(result[0].DocKey).toBe('old-key');
      expect(result[0].isCurrentVersion).toBe(false);
    });

    it('removes the current version when the API also returns it', () => {
      const result = mergeReleasedDocumentVersions(
        [
          { DocKey: 'duplicate-key', Dokvr: '02' },
          { DocKey: 'old-key', Dokvr: '01' },
        ],
        {
          Dockey: 'current-key',
          Zversion: '02',
          StatusTxt: 'Released',
        }
      );

      expect(result.map((row) => row.DocKey)).toEqual(['old-key']);
      expect(result[0].isCurrentVersion).toBe(false);
    });

    it('sorts versions numerically from newest to oldest', () => {
      const result = mergeReleasedDocumentVersions(
        [
          { DocKey: 'v2', Dokvr: '02' },
          { DocKey: 'v10', Dokvr: '10' },
          { DocKey: 'v0', Dokvr: '00' },
        ],
        null
      );

      expect(result.map((row) => getDocumentVersion(row))).toEqual([10, 2, 0]);
    });
  });

  describe('hasPreviousDocumentVersions', () => {
    it('hides the history control when no previous release exists', () => {
      expect(hasPreviousDocumentVersions(null)).toBe(false);
      expect(hasPreviousDocumentVersions({ Zversion: '02' })).toBe(false);
      expect(hasPreviousDocumentVersions({ Dockey: 'doc-1' })).toBe(false);
      expect(
        hasPreviousDocumentVersions({ Dockey: 'doc-1', Zversion: '' })
      ).toBe(false);
      expect(
        hasPreviousDocumentVersions({ Dockey: 'doc-1', Zversion: '00' })
      ).toBe(false);
      expect(
        hasPreviousDocumentVersions({ Dockey: 'doc-1', Zversion: '01' })
      ).toBe(false);
    });

    it('shows the history control from the second version onwards', () => {
      expect(
        hasPreviousDocumentVersions({ Dockey: 'doc-1', Zversion: '02' })
      ).toBe(true);
      expect(
        hasPreviousDocumentVersions({ DocKey: 'doc-1', Dokvr: '10' })
      ).toBe(true);
    });
  });
});
