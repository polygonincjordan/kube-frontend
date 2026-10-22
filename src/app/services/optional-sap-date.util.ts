/**
 * Optional document dates (an empty LMP, an unticked intubation) go to SAP as
 * null: SAP rejects an empty string for a date property.
 */
export function optionalSapDate<T = any>(
  value: any,
  format: (value: any) => T = (date) => date
): T | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  return format(value);
}
