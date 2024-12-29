import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import { formatDate } from 'ngx-bootstrap/chronos';
import { Subscription } from 'rxjs';
import swal from 'sweetalert2';

@Component({
  selector: 'complex-order',
  templateUrl: './complex-order.component.html',
  styleUrls: ['./complex-order.component.scss']
})
export class ComplexOrderComponent implements OnInit, OnDestroy {
  public complexorderForm: FormGroup = new FormGroup({
    complexRowData: new FormArray([])
  });
  public isFormReady: boolean = false;
  public isFormSubmitted: boolean = false;
  public complexValueArray: ComplexData;
  public disableDuration: boolean = false;
  public valueChangeSubscription: Subscription;

  @Output() complexData: EventEmitter<any> = new EventEmitter<any>();

  constructor(public administrationService: AddministrationService) { }

  @Input() set DoseComplexData(data: any) {
    data.Pduru !== null && data.Pduru !== "" ? this.disableDuration = true : this.disableDuration = false;
    if (data && data.TOCOMPLEX && data.TOCOMPLEX.length && !this.isFormReady) {
      this.complexValueArray = data;
      this.generateDefaultForm(data);
      this.isFormReady = true;
    }
  };

  ngOnInit() {
    this.administrationService.loadDropdownList();
    this.valueChangeSubscription = this.complexorderForm.valueChanges.subscribe((data) => {
      this.isFormSubmitted = true;
      this.complexData.emit(this.complexorderForm);
    });
  }

  get complexArray() {
    return this.complexorderForm.get('complexRowData') as FormArray;
  }

  generateForm() {
    return new FormGroup({
      Drugid: new FormControl(this.complexValueArray.Drugid),
      Seqno: new FormControl(""),
      Quan: new FormControl("0", [Validators.required, Validators.min(0)]),
      Quanunit: new FormControl(this.complexValueArray.Quanunit),
      N1znr: new FormControl(this.complexValueArray.N1znr, Validators.required),
      Pdur: new FormControl(""),
      Pduru: new FormControl(this.complexValueArray.Pduru !== null || this.complexValueArray.Pduru !== "" ? this.complexValueArray.Pduru : null),
      StartD: new FormControl(null),
      StartT: new FormControl(null),
      EndD: new FormControl(null),
      EndT: new FormControl(null),
    })
  }

  generateDefaultForm(data) {
    if (data.TOCOMPLEX && data.TOCOMPLEX.length) {
      for (let i = 0; i < data.TOCOMPLEX.length; i++) {
        this.complexArray.push(this.generateForm());
        this.complexArray.controls[i].patchValue({
          Drugid: data.TOCOMPLEX[i].Drugid,
          Seqno: data.Seqno !== "" ? i + 1 : data.Seqno,
          Quan: data.TOCOMPLEX[i].Quan,
          Quanunit: data.TOCOMPLEX[i].Quanunit,
          N1znr: data.TOCOMPLEX[i].N1znr,
          Pdur: data.TOCOMPLEX[i].Pdur,
          Pduru: data.TOCOMPLEX[i].Pduru !== null && this.administrationService.durationUnitList.find(d => d.Text === data.TOCOMPLEX[i].Pduru) !== undefined && this.administrationService.durationUnitList.find(d => d.Text === data.TOCOMPLEX[i].Pduru).Unit !== undefined ? this.administrationService.durationUnitList.find(d => d.Text === data.TOCOMPLEX[i].Pduru).Unit : data.TOCOMPLEX[i].Pduru,
          StartT: data.TOCOMPLEX[i].StartT !== null ? data.TOCOMPLEX[i].StartT : null,
          StartD: data.TOCOMPLEX[i].StartD !== null ? data.TOCOMPLEX[i].StartD : null,
          EndD: data.TOCOMPLEX[i].EndD !== null ? data.TOCOMPLEX[i].EndD : null,
          EndT: data.TOCOMPLEX[i].EndT !== null ? data.TOCOMPLEX[i].EndT : null,
        });
        if (data.TOCOMPLEX[i].EndT === null) {
          if (formatDate(data.TOCOMPLEX[i].StartD, "HH:mm:ss") <= formatDate(new Date(), "HH:mm:ss")) {
            this.complexArray.controls[i].patchValue({
              StartD: new Date(data.TOCOMPLEX[i].StartD.setDate(data.TOCOMPLEX[i].StartD.getDate() + 1))
            })
          }
          this.validFromTobaseonDuration(i, this.complexArray.value[i]);
        }
      }
    }
  }

  addRowData() {
    const notTouchedForms = this.complexArray.controls.filter(d => !d.valid);
    if (notTouchedForms && notTouchedForms.length > 3) {
      swal.fire({
        text: 'Enter data before adding new row',
        confirmButtonColor: '#0890c5',
        cancelButtonColor: '#84898c',
        confirmButtonText: 'OK',
        customClass: 'myalertpopup',
        icon: 'error'
      });
    } else {
      if (this.complexArray.value[this.complexArray.controls.length - 1].EndD !== null && this.complexArray.value[this.complexArray.controls.length - 1].EndD !== null) {
        this.complexArray.push(this.generateForm());
        this.complexArray.controls[this.complexArray.controls.length - 1].patchValue({
          Seqno: this.complexArray.controls.length,
          Pduru: this.complexArray.value[this.complexArray.controls.length - 2].Pduru,
          StartD: new Date(this.complexArray.value[this.complexArray.controls.length - 2].EndD),
          StartT: this.complexArray.value[this.complexArray.controls.length - 2].EndT,
        });
        this.disableDuration = true;
      } else {
        swal.fire({
          text: 'Please Enter Duration and Duration Unit',
          confirmButtonColor: '#0890c5',
          cancelButtonColor: '#84898c',
          confirmButtonText: 'OK',
          customClass: 'myalertpopup',
          icon: 'error'
        })
      }
    }
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

  deleteRowData(index: any) {
    const TouchedForms = this.complexArray.controls.filter(d => d.valid);
    const unTouchedForms = this.complexArray.controls.filter(d => !d.valid);
    if (TouchedForms && TouchedForms.length) {
      this.showErrorPopup(null, 'Do You Want to Delete this Data?', 'Conform').then(
        (result) => {
          if (result.value) {
            this.complexArray.removeAt(index);
          }
        });
    } else if (unTouchedForms && unTouchedForms.length < 3) {
      this.showErrorPopup(null, 'Can not Delete', 'Error');
    }
    else {
      this.complexArray.removeAt(index);
    }
  }

  validFromTobaseonDuration(index: number, data: any) {
    let getMonth = data.StartD.getMonth();
    let getFullYear = data.StartD.getFullYear();
    let getDate = data.StartD.getDate();
    let getMinutes = data.StartD.getMinutes();
    let getSeconds = data.StartD.getSeconds();
    let getHours = data.StartD.getHours();
if (data.StartD) {
  if (`${data.Pdur}` === "0") {
    this.complexArray.controls[index].patchValue({ EndD: null });
  }
  if (data.Pduru === "MON" && `${data.Pdur}` !== "0") {
    this.complexArray.controls[index].patchValue({
      EndD: new Date(getFullYear, (getMonth + (+(data.Pdur))), getDate, getHours, getMinutes, getSeconds),
      EndT: formatDate(new Date(getFullYear, (getMonth + (+(data.Pdur))), getDate, getHours, getMinutes, getSeconds), "HH:mm:ss")
    });
  }
  if (data.Pduru === "TAG" && `${data.Pdur}` !== "0") {
    this.complexArray.controls[index].patchValue({
      EndD: new Date(getFullYear, getMonth, (getDate + (+(data.Pdur))), getHours, getMinutes, getSeconds),
      EndT: formatDate(new Date(getFullYear, getMonth, (getDate + (+(data.Pdur))), getHours, getMinutes, getSeconds), "HH:mm:ss")
    });
  }

  if (data.Pduru === "MIN" && `${data.Pdur}` !== "0") {
    this.complexArray.controls[index].patchValue({
      EndD: new Date(getFullYear, getMonth, getDate, getHours, (getMinutes + (+(data.Pdur))), getSeconds),
      EndT: formatDate(new Date(getFullYear, getMonth, getDate, getHours, (getMinutes + (+(data.Pdur))), getSeconds), "HH:mm:ss")
    });
  }

  if (data.Pduru === "STD" && `${data.Pdur}` !== "0") {
    this.complexArray.controls[index].patchValue({
      EndD: new Date(getFullYear, getMonth, getDate, (getHours + (+(data.Pdur))), getMinutes, getSeconds),
      EndT: formatDate( new Date(getFullYear, getMonth, getDate, (getHours + (+(data.Pdur))), getMinutes, getSeconds), "HH:mm:ss")
    });
  }

  if (data.Pduru === "S" && `${data.Pdur}` !== "0") {
    this.complexArray.controls[index].patchValue({
      EndD: new Date(getFullYear, getMonth, getDate, getHours, getMinutes, (getSeconds + (+(data.Pdur)))),
      EndT: formatDate(new Date(getFullYear, getMonth, getDate, getHours, getMinutes, (getSeconds + (+(data.Pdur)))), "HH:mm:ss")
    });
  }

  if (data.Pduru === "WCH" && `${data.Pdur}` !== "0") {
    this.complexArray.controls[index].patchValue({
      EndD: new Date(getFullYear, getMonth, (getDate + (+(data.Pdur) * 7)), getHours, getMinutes, getSeconds),
      EndT: formatDate(new Date(getFullYear, getMonth, (getDate + (+(data.Pdur) * 7)), getHours, getMinutes, getSeconds), "HH:mm:ss")
    });
  }

  if (data.Pduru === "DOS" && `${data.Pdur}` !== "0") {
    this.complexArray.controls[index].patchValue({ EndD: null });
    if (data.N1znr !== null) { this.onFrequencyFilter(data, index) }
  }
}
}


  onFrequencyFilter(data: any, index: number) {
    const findSelectedFrequency = this.administrationService.frequencyList.find(d => d.CycleKey === data.N1znr).N1id;
    if (findSelectedFrequency === "Q24H") {
      this.updateDosageHour(data, index, 24)
    } else if (findSelectedFrequency === "BID") {
      this.updateDosageHour(data, index, 12)
    } else if (findSelectedFrequency === "TID") {
      this.updateDosageHour(data, index, 8)
    } else if (findSelectedFrequency === "QID") {
      this.updateDosageHour(data, index, 4)
    } else if (findSelectedFrequency === "ONCE") {
      this.updateDosageHour(data, index, 24)
    } else if (findSelectedFrequency === "SLIDING") {
      this.updateDosageHour(data, index, 8)
    } else if (findSelectedFrequency === "Q12H") {
      this.updateDosageHour(data, index, 24)
    } else if (findSelectedFrequency === "Q2H") {
      this.updateDosageHour(data, index, 12)
    } else if (findSelectedFrequency === "Q3H") {
      this.updateDosageHour(data, index, 8)
    } else if (findSelectedFrequency === "Q4H") {
      this.updateDosageHour(data, index, 4)
    } else if (findSelectedFrequency === "Q6H") {
      this.updateDosageHour(data, index, 6)
    } else if (findSelectedFrequency === "Q8H") {
      this.updateDosageHour(data, index, 8)
    } else if (findSelectedFrequency === "PQ24H") {
      this.updateDosageHour(data, index, 24)
    } else if (findSelectedFrequency === "NBID") {
      this.updateDosageHour(data, index, 12)
    } else if (findSelectedFrequency === "PBID") {
      this.updateDosageHour(data, index, 12)
    } else if (findSelectedFrequency === "PTID") {
      this.updateDosageHour(data, index, 8)
    } else if (findSelectedFrequency === "NTID") {
      this.updateDosageHour(data, index, 8)
    } else if (findSelectedFrequency === "PQID") {
      this.updateDosageHour(data, index, 4)
    } else if (findSelectedFrequency === "NQID") {
      this.updateDosageHour(data, index, 4)
    } else if (findSelectedFrequency === "QHS") {
      this.updateDosageHour(data, index, 12)
    } else if (findSelectedFrequency === "PHS") {
      this.updateDosageHour(data, index, 12)
    } else if (findSelectedFrequency === "PQ4H") {
      this.updateDosageHour(data, index, 4)
    } else if (findSelectedFrequency === "PQ8H") {
      this.updateDosageHour(data, index, 8)
    } else if (findSelectedFrequency === "NQ8H") {
      this.updateDosageHour(data, index, 8)
    } else if (findSelectedFrequency === "PQ12H") {
      this.updateDosageHour(data, index, 24)
    } else if (findSelectedFrequency === "NQ12H") {
      this.updateDosageHour(data, index, 24)
    } else if (findSelectedFrequency === "5X/DAY") {
      this.updateDosageHour(data, index, 12)
    } else if (findSelectedFrequency === "STAT") {
      this.updateDosageHour(data, index, 24)
    } else if (findSelectedFrequency === "QAD") {
      this.updateDosageHour(data, index, 12)
    } else if (findSelectedFrequency === "QD") {
      this.updateDosageHour(data, index, 24)
    } else if (findSelectedFrequency === "QD/AC") {
      this.updateDosageHour(data, index, 24)
    } else if (findSelectedFrequency === "QD/PC") {
      this.updateDosageHour(data, index, 24)
    } else if (findSelectedFrequency === "CONT") {
      this.updateDosageHour(data, index, 24)
    } else if (findSelectedFrequency === "BID/AC") {
      this.updateDosageHour(data, index, 12)
    } else if (findSelectedFrequency === "TID/PC") {
      this.updateDosageHour(data, index, 8)
    } else if (findSelectedFrequency === "NQD") {
      this.updateDosageHour(data, index, 24)
    } else if (findSelectedFrequency === "NQ6H") {
      this.updateDosageHour(data, index, 6)
    } else if (findSelectedFrequency === "PQ6H") {
      this.updateDosageHour(data, index, 6)
    } else if (findSelectedFrequency === "TID/AC") {
      this.updateDosageHour(data, index, 8);
    } else if (findSelectedFrequency === "BID/PC") {
      this.updateDosageHour(data, index, 8)
    } else if (findSelectedFrequency === "DEFTIM") {
      this.updateDosageHour(data, index, 24)
    } else if (findSelectedFrequency === "DAILY") {
      this.updateDosageHour(data, index, 24)
    } else if (findSelectedFrequency === "Q23H") {
      this.updateDosageHour(data, index, 24)
    } else if (findSelectedFrequency === "WEEKLY") {
      this.updateDosageHour(data, index, 24)
    } else if (findSelectedFrequency === "INCREMENT") {
      this.updateDosageHour(data, index, 24)
    } else if (findSelectedFrequency === "TEST 1") {
      this.updateDosageHour(data, index, 24)
    }
  }

  updateDosageHour(data: any, index: number, updatedHour) {
    this.complexArray.controls[index].patchValue({
      EndD: new Date(data.StartD.setHours(data.StartD.getHours() + (+(data.Pdur) * updatedHour))),
      EndT: formatDate(data.StartD, "HH:mm:ss"),
      StartD: new Date(data.StartD.setHours(data.StartD.getHours() - (+(data.Pdur) * updatedHour)))
    });
  }

  parseDate(date: any) {
    return `${new DatePipe('en-US').transform(date, "yyyy-MM-dd")}T00:00:00`;
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

  ngOnDestroy(): void {
    if (this.valueChangeSubscription) {
      this.valueChangeSubscription.unsubscribe();
    }
  }
}
export interface ComplexData {
  Drugid: string;
  Seqno: string;
  Quan: string;
  Quanunit: string;
  N1znr: string;
  Pdur: string;
  Pduru: string;
  StartD: string;
  StartT: string;
  EndD: string;
  EndT: string;
}
