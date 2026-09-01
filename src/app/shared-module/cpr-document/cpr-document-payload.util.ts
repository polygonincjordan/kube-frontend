export function prepareCprDocumentPayload(
  formValue: any,
  docStatus: any,
  actionType?: string,
  sourceDocumentKey?: string
) {
  const payload = {
    ...formValue,
    DocStatus: docStatus,
  };

  if (actionType === 'copy') {
    const documentKey = sourceDocumentKey || formValue?.Dockey;

    if (!documentKey) {
      throw new Error('The source CPR document key is required for copy and release.');
    }

    payload.Dockey = documentKey;
  }

  return payload;
}
