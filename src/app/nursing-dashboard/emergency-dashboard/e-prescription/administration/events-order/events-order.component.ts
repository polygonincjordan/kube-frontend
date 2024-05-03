import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import swal from 'sweetalert2';

@Component({
  selector: 'events-order',
  templateUrl: './events-order.component.html',
  styleUrls: ['./events-order.component.scss']

})
export class EventsOrderComponent implements OnInit {
  public eventsorderForm: FormGroup;
  public isFormReady: boolean = false;
  public medicationDrugList: any[];
  public frequencyList: any[];
  public durationUnitList: any[];
  public isFormSubmitted: boolean = false;
  public medicationAdministrative: string
  constructor(public route: ActivatedRoute, private datePipe: DatePipe, public addministrationService: AddministrationService) { }

  @Input() set eventPanelData(data: any) {
    this.eventsorderForm = new FormGroup({ eventsOrderData: new FormArray([], Validators.required) })
    for (let i = 0; i < data.length; i++) {
      this.eventArray.push(this.generateForm(data[i]));
    }
    this.isFormReady = true;
  }

  ngOnInit() {
    this.addministrationService.loadDropdownList();
    this.isFormReady = true;
  }

  generateForm(data) {

    return new FormGroup({
      Dose: new FormControl(data.Dose),
      Drugid: new FormControl(data.Drugid),
      Eorderid: new FormControl(data.Eorderid),
      Evdescr: new FormControl(data.Evdescr),
      EvstaDate: new FormControl(new Date(new DatePipe('en-US').transform(
        data.EvstaDate.replace('/Date(', '').replace(')/', ''),
        'yyyy-MM-dd'
      ))),
      EvstaTime: new FormControl(this.parseTime(data.EvstaTime)),
      Evstatus: new FormControl(data.Evstatus),
      Pbdad: new FormControl(new Date(new DatePipe('en-US').transform(
        data.Pbdad.replace('/Date(', '').replace(')/', ''),
        'yyyy-MM-dd'
      ))),
      Pbtad: new FormControl(this.parseTime(data.Pbtad)),
      Unit: new FormControl(data.Unit)
    })
  }

  get eventArray() {
    return this.eventsorderForm.get('eventsOrderData') as FormArray;
  }

  getdata(date: any) {
    this.eventArray.value;
  }

  parseTime(data: string) {
    if (data && data.length) {
      const strArr: string[] = data.split('');
      if (
        data &&
        data.length === 11 &&
        strArr[4] === 'H' &&
        strArr[7] === 'M' &&
        strArr[10] === 'S' &&
        !isNaN(+(strArr[2] + strArr[3])) &&
        !isNaN(+(strArr[5] + strArr[6])) &&
        !isNaN(+(strArr[8] + strArr[9]))
      ) {
        const hours = +(strArr[2] + strArr[3]) <= 9 ? `0${+(strArr[2] + strArr[3])}` : +(strArr[2] + strArr[3]);
        const Minute = +(strArr[5] + strArr[6]) <= 9 ? `0${+(strArr[5] + strArr[6])}` : +(strArr[5] + strArr[6]);
        const Second = +(strArr[8] + strArr[9]) <= 9 ? `0${+(strArr[8] + strArr[9])}` : +(strArr[8] + strArr[9]);
        return `${hours}:${Minute}:${Second}`
      }
    }
    return null;
  }

  showErrorPopup(title: any, text: any, messageType) {
    return swal.fire({
      title: title ? title : '',
      text: text ? text : '',
      showCancelButton: messageType === 'Conform' ? true : false,
      confirmButtonColor: '#0890c5',
      cancelButtonColor: '#84898c',
      confirmButtonText: messageType === 'Error' ? 'Close' : 'Yes',
      cancelButtonText: 'No',
      customClass: 'myalertpopup',
      icon: 'error'
    });
  }

}
