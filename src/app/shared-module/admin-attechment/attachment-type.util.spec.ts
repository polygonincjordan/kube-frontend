import { resolveAttachmentViewer } from './attachment-type.util';

/**
 * `Attachmenttype` comes straight from SAP's CaseAttachmentSet, which reports a
 * short and sometimes padded or upper-cased file suffix.
 */
describe('resolveAttachmentViewer', () => {
  it('maps pdf to the pdf viewer', () => {
    expect(resolveAttachmentViewer('pdf')).toEqual({ kind: 'pdf' });
  });

  it('maps both htm and html to the html viewer', () => {
    expect(resolveAttachmentViewer('htm')).toEqual({ kind: 'html' });
    expect(resolveAttachmentViewer('html')).toEqual({ kind: 'html' });
  });

  it('maps SAP\'s jpe suffix to a JPEG image', () => {
    expect(resolveAttachmentViewer('jpe')).toEqual({
      kind: 'image',
      mimeType: 'image/jpeg',
    });
  });

  it('maps the other image suffixes the service can return', () => {
    expect(resolveAttachmentViewer('jpg').mimeType).toBe('image/jpeg');
    expect(resolveAttachmentViewer('jpeg').mimeType).toBe('image/jpeg');
    expect(resolveAttachmentViewer('png').mimeType).toBe('image/png');
    expect(resolveAttachmentViewer('gif').mimeType).toBe('image/gif');
    expect(resolveAttachmentViewer('bmp').mimeType).toBe('image/bmp');
    expect(resolveAttachmentViewer('tif').mimeType).toBe('image/tiff');
    expect(resolveAttachmentViewer('tiff').mimeType).toBe('image/tiff');
  });

  it('ignores SAP casing and padding', () => {
    expect(resolveAttachmentViewer(' JPE ')).toEqual({
      kind: 'image',
      mimeType: 'image/jpeg',
    });
    expect(resolveAttachmentViewer('PDF')).toEqual({ kind: 'pdf' });
  });

  it('reports an unknown or missing type as unsupported', () => {
    expect(resolveAttachmentViewer('docx')).toEqual({ kind: 'unsupported' });
    expect(resolveAttachmentViewer('')).toEqual({ kind: 'unsupported' });
    expect(resolveAttachmentViewer(undefined)).toEqual({ kind: 'unsupported' });
  });

  it('never returns a mime type for a non-image kind', () => {
    expect(resolveAttachmentViewer('pdf').mimeType).toBeUndefined();
    expect(resolveAttachmentViewer('htm').mimeType).toBeUndefined();
    expect(resolveAttachmentViewer('docx').mimeType).toBeUndefined();
  });
});
