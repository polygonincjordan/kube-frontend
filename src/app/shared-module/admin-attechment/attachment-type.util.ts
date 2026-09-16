/**
 * SAP's CaseAttachmentSet reports `Attachmenttype` as a short, sometimes padded
 * or upper-cased file suffix (`pdf`, `htm`, `jpe` for JPEG). Map it once here so
 * the viewer never has to compare raw SAP strings.
 */
export type AttachmentViewerKind = 'pdf' | 'html' | 'image' | 'unsupported';

export interface AttachmentViewer {
  kind: AttachmentViewerKind;
  /** Set only for `image`; the MIME type for the base64 data URL. */
  mimeType?: string;
}

const IMAGE_MIME_TYPES: { [suffix: string]: string } = {
  jpe: 'image/jpeg',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  bmp: 'image/bmp',
  tif: 'image/tiff',
  tiff: 'image/tiff',
};

export function resolveAttachmentViewer(attachmentType: string): AttachmentViewer {
  const suffix = (attachmentType || '').trim().toLowerCase();

  if (suffix === 'pdf') {
    return { kind: 'pdf' };
  }

  if (suffix === 'htm' || suffix === 'html') {
    return { kind: 'html' };
  }

  const mimeType = IMAGE_MIME_TYPES[suffix];
  if (mimeType) {
    return { kind: 'image', mimeType };
  }

  return { kind: 'unsupported' };
}
