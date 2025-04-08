import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'listFilter'
})
export class ListFilterPipe implements PipeTransform {

  transform(groups: any[], searchText: string): any[] {
    if (!searchText) return groups;

    searchText = searchText.toLowerCase();

    return groups
      .map(group => {
        const filteredDocs = group.documents.filter(doc =>
          doc.Dktxt?.toLowerCase().includes(searchText) ||
          doc.DtidText?.toLowerCase().includes(searchText) ||
          doc.DokstText?.toLowerCase().includes(searchText) ||
          doc.MitarbName?.toLowerCase().includes(searchText) 
        );
        return filteredDocs.length ? { ...group, documents: filteredDocs } : null;
      })
      .filter(group => group !== null);
  }
}
