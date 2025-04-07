import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'listFilter'
})
export class ListFilterPipe implements PipeTransform {

  transform(items: any[], searchText: string): any[] {
    if (!items) return [];
    if (!searchText) return items;

    searchText = searchText.toLowerCase();

    return items.filter(item => {
      // Choose which fields to search in (e.g., Dktxt, DtidText, MitarbName, etc.)
      const dktxt = (item?.Dktxt || '').toLowerCase();
      const dtidText = (item?.DtidText || '').toLowerCase();
      const mitarbName = (item?.MitarbName || '').toLowerCase();
      const DokstText = (item?.DokstText || '').toLowerCase();
      
      // Match if search string is in any of the selected fields
      return (
        dktxt.includes(searchText) ||
        dtidText.includes(searchText) ||
        mitarbName.includes(searchText) ||
        DokstText.includes(searchText)
      );
    });
  }
}
