import { Pipe, PipeTransform } from '@angular/core';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';

@Pipe({
  name: 'filterOrderNurseStatus'
})
export class FilterOrderNurseStatusPipe implements PipeTransform {
  constructor(public ePrescriptionService:EPrescriptionService){}
  transform(value: any[], orderStatus: any[]): any[] {
    let data = [];
    orderStatus.forEach((element: any) => {
      const filteredItems = value.filter(d =>
        (element.item_text === 'Active' && d.Descr === 'Active') ||
        (element.item_text === 'Cancelled' && d.Descr === 'Cancelled') ||
        (element.item_text === 'Suspended' && d.Descr === 'Suspended') ||
        (element.item_text === 'Ended' && d.Descr === 'Ended')
      );
  
      data.push(...filteredItems);
    });
    return data;
  }

}


