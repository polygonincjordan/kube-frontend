import { prepareCprDocumentPayload } from './cpr-document-payload.util';

describe('prepareCprDocumentPayload', () => {
  it('keeps copy and release in the selected CPR document version chain', () => {
    const payload = prepareCprDocumentPayload(
      { Dockey: 'stale-form-key', DocStatus: '1' },
      '5',
      'copy',
      'selected-source-key'
    );

    expect(payload.DocStatus).toBe('5');
    expect(payload.Dockey).toBe('selected-source-key');
  });

  it('rejects copy and release when no CPR source document key is available', () => {
    expect(() => prepareCprDocumentPayload({}, '5', 'copy')).toThrowError(
      'The source CPR document key is required for copy and release.'
    );
  });

  it('does not change the document key behavior for non-copy saves', () => {
    const payload = prepareCprDocumentPayload(
      { Dockey: 'existing-key', DocStatus: '1' },
      '2',
      'edit',
      'ignored-source-key'
    );

    expect(payload.DocStatus).toBe('2');
    expect(payload.Dockey).toBe('existing-key');
  });
});
