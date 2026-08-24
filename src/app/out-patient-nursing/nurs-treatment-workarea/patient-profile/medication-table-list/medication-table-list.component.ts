import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';

@Component({
  selector: 'app-medication-table-list',
  templateUrl: './medication-table-list.component.html',
  styleUrls: ['./medication-table-list.component.scss']
})
export class MedicationTableListComponent implements OnInit {

  @Input() madicationList: any;
  @Input() searchString: any;

  columnList: any[] = [
    'Service Description',
    'Category',
    'Order Date',
    'Order Time',
    'Status',
    'Action',
  ];
  isCollpseOpen: boolean;
  constructor(public emergencyService: EmergencyService) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.radiologyList.currentValue.length) {
      this.isCollpseOpen = true;
    } else {
      this.isCollpseOpen = false;
    }
  }

  
  durationConvert(data: any) {
    if (data === 0) {
      return '';
    }
    return data;
  }

  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
    
  }

  parsePayloadFormateTime(data: string) {
    if (data && data.length) {
      let hours = data.substring(2, 4);
      let minute = data.substring(5, 7);
      return `${hours}:${minute}`;
    }
  }

}
