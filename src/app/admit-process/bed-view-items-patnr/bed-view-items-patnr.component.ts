import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'app-bed-view-items-patnr',
  templateUrl: './bed-view-items-patnr.component.html',
  styleUrls: ['./bed-view-items-patnr.component.scss'],
})
export class BedViewItemsPatnrComponent implements OnInit {
  @Input() item: any;
  @Input() navTabBoxActiveValue: any;
  @Output() openModulAdmissionProcess: any = new EventEmitter();

  constructor() {}

  ngOnInit(): void {
    // console.log(this.item);
  }
  unixTimestampToDate(timestamp: number): Date {
    return new Date(timestamp);
  }
  
  getImgSrc() {
    switch (this.navTabBoxActiveValue === '07' ? this.item?.Bediconcolor : this.item?.Bediconcolor) {
      case 'Purple':
        return 'assets/img/bed-1.png';
      case 'Red':
        return 'assets/img/bed-3.png';
      default:
        return 'assets/img/bed-2.png';
    }
  }

  redirectToAdmissionProcess(data: any) {
    this.openModulAdmissionProcess.next(data);
  }

  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }
}
