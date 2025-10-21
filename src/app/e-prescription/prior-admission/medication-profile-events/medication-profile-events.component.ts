import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import { EPrescriptionService, MedicationdFilterData } from '@services/e-Prescription/e-prescription.service';
import { formatDate } from 'ngx-bootstrap/chronos';
import swal from 'sweetalert2';


@Component({
  selector: 'medication-profile-events',
  templateUrl: './medication-profile-events.component.html',
  styleUrls: ['./medication-profile-events.component.scss']
})
export class MedicationProfileEventsComponent {
  isPopUpOpen: boolean;
  public eventsprofileForm: FormGroup;
  public isFormReady: boolean = false;
  public medicationDrugList: any[];
  public frequencyList: any[];
  public durationUnitList: any[];
  public medicationEndReason: any[];
  public medicationCancellationReason: any[];
  public endEventActiondata: any[];
  public isFormSubmitted: boolean = false;
  private configurationData: any;
  public medicationAdministrative: string;
  public replaceSuspendtoResume: any = "Hold";
  CurrentDateTime = new Date();
  filtereventConfig: any = { Active: false, Suspended: false, Ended: false, Cancelled: false, MedicationSorting: "", Sorting: "", Pbdad: false }
  configurationPopup: any

  constructor(public route: ActivatedRoute, public addministrationService: AddministrationService, public ePrescriptionService: EPrescriptionService,) { }

  @Input() set filtereventData(data: MedicationdFilterData) {
    this.filtereventConfig = data;
  }
  @Input() set medicationprofileeventsdata(data: any) {
    this.isFormReady = true;
    this.configurationData = data
    this.eventsprofileForm = new FormGroup({
      eventsProfileData: new FormArray([], Validators.required),
      MedicationCreate: new FormGroup({
        Dose: new FormControl(null),
        Timefrom: new FormControl(`${this.parsePayloadTime}`),
        DoseUnit: new FormControl(null)
      }),
      MedicationHold: new FormGroup({
        Stoid: new FormControl(null),
        Datefrom: new FormControl(),
        Timefrom: new FormControl(),
        Comments: new FormControl("", Validators.required)
      }),
      MedicationResume: new FormGroup({
        Datefrom: new FormControl(null, Validators.required),
        Comments: new FormControl
      }),
      MedicationEdit: new FormGroup({
        Dose: new FormControl(null, Validators.required),
        DoseUnit: new FormControl(null)
      }),
      MedicationEnd: new FormGroup({
        Rcodeid: new FormControl(null, Validators.required),
        Datefrom: new FormControl(null, Validators.required),
        Timefrom: new FormControl(null, Validators.required)
      }),
    })
    for (let i = 0; i < data.TOEVENTDATA.length; i++) {
      this.drugArray.push(this.generateForm(data.TOEVENTDATA[i]));
    }
    this.isFormReady = true;
  }

  popupStatus(data: any) {
    this.configurationPopup = data;
  }



  generateForm(data) {
    return new FormGroup({
      Meordid: new FormControl(data.Meordid),
      Meevtid: new FormControl(data.Meevtid),
      Pbdad: new FormControl(this.sanitizeSAPDateFormat(data.Pbdad, data.Pbtad)),
      Pbtad: new FormControl(this.parseTime(data.Pbtad)),
      Einri: new FormControl(data.Einri),
      Falnr: new FormControl(data.Falnr),
      Dose: new FormControl(data.Dose && parseInt(data.Dose) === Number(data.Dose) ? parseInt(data.Dose) : data.Dose),
      Unit: new FormControl(data.Unit),
      Evstatus: new FormControl(data.Evstatus),
      Evdescr: new FormControl(data.Evdescr),
      EvstaDate: new FormControl(new Date(new DatePipe('en-US').transform(
        data.EvstaDate.replace('/Date(', '').replace(')/', ''),
        'yyyy-MM-dd'
      ))),
      EvstaTime: new FormControl(this.parseTime(data.EvstaTime)),
      Upusr: new FormControl(data.Upusr),
      DoseAdm: new FormControl(`${Math.floor(data.DoseAdm)}`),
      UnitAdm: new FormControl(data.UnitAdm),
      Admcomment: new FormControl(data.Admcomment),
      isSelected: new FormControl(false),
      Rcodeid: new FormControl(),
      Stoid: new FormControl(),
      Editdata: new FormControl(false),
    })
  }

  selectCheckBox(index: number, event: any) {
    const checked = event.target.checked;
    for (let i = 0; i < this.drugArray.controls.length; i++) {
      this.drugArray.controls[i].patchValue({ isSelected: false, Editdata: false })
    }
    this.drugArray.controls[index].patchValue({
      isSelected: checked
    })
  }

  get drugArray() {
    return this.eventsprofileForm.get('eventsProfileData') as FormArray;
  }
  getdata(date: any) {
    this.drugArray.value;
  }

  medicationEndAction() {
    this.ePrescriptionService.loadData(`e-prescription/EndOrdReasonMedication?Einri=${this.ePrescriptionService.parameters.einri}`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        this.endEventActiondata = resp.body.d.results;
        for (let i = 0; i < this.drugArray.value.length; i++) {
          this.drugArray.controls[i].patchValue({
            Rcodeid: resp.body.d.results.find(d => d.Rcodeid === "00001").Rcodeid
          })
        }
      }
    },
      (error) => {
        this.showErrorPopup("", error.error.error.message.value, "Error")
      });
  }

  medicationHoldAction() {
    this.ePrescriptionService.loadData(`e-prescription/CancelMedicationStatus?Einri=${this.ePrescriptionService.parameters.einri}`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        this.medicationCancellationReason = resp.body.d.results;
        for (let i = 0; i < this.drugArray.value.length; i++) {
          this.drugArray.controls[i].patchValue({
            Stoid: resp.body.d.results.find(d => d.Stoid === "ERR").Stoid,
            Timefrom: resp.body.d.results.Pbtad,
            Datefrom: resp.body.d.results.Pbdad
          })
        }
        this.Createeventdata()
      }
    },
      (error) => {
        this.showErrorPopup("", error.error.error.message.value, "Error")
      });
  }

  setDateInAction(data: any, ControlType) {
    this.eventsprofileForm.get(ControlType).patchValue({
      Timefrom: `${this.parsePayloadTime(data)}`
    })
  }

  closeModetail() {
    this.isPopUpOpen = false
  }

  Createeventdata() {
    const OrderData = this.drugArray.controls.map(d => d.value).find(d => d.isSelected);
    const filterSelectedData = this.drugArray.controls.map(d => d.value).filter(d => d.isSelected);
    if (filterSelectedData && filterSelectedData.length) {
      this.eventsprofileForm.get('MedicationCreate').patchValue({
        Dose: !!OrderData.Dose ? OrderData.Dose : "",
        Timefrom: new Date(),
        DoseUnit: !!OrderData.Unit ? OrderData.UnitAdm : ""
      })
      this.eventsprofileForm.get('MedicationHold').patchValue({
        Timefrom: filterSelectedData[0].Pbtad,
        Datefrom: new Date(`${formatDate(filterSelectedData[0].Pbdad, "YYYY-MM-DD")}T${filterSelectedData[0].Pbtad}`)
      })
      this.eventsprofileForm.get('MedicationResume').patchValue({
        Datefrom: new Date(`${formatDate(filterSelectedData[0].Pbdad, "YYYY-MM-DD")}T${filterSelectedData[0].Pbtad}`)
      })
      this.eventsprofileForm.get('MedicationEdit').patchValue({
        Dose: OrderData.Dose,
        DoseUnit: !!OrderData.Unit ? OrderData.UnitAdm : ""
      })
      this.eventsprofileForm.get('MedicationEnd').patchValue({
        Timefrom: filterSelectedData[0].Pbtad,
        Rcodeid: OrderData.Rcodeid,
        Datefrom: new Date(`${formatDate(filterSelectedData[0].Pbdad, "YYYY-MM-DD")}T${filterSelectedData[0].Pbtad}`)
      })
    }
  }

  CreateeventAction(createPopover: any) {
    const data = this.eventsprofileForm.get('MedicationCreate').value
    const filterSelectedData = this.drugArray.controls.map(d => d.value);
    if (!!data) {
      if (data.DoseUnit === 0 || data.DoseUnit === "0") {
        this.showErrorPopup("", "Please Specify the Dose!", "Error")
      } else {
        if (filterSelectedData && filterSelectedData.length) {
          const OrderData = filterSelectedData[0];
          let PayloadData = {
            Einri: OrderData.Einri,
            Falnr: OrderData.Falnr,
            Meordid: OrderData.Meordid,
            Dosedate: `${formatDate(new Date(), "YYYY-MM-DD")}T${formatDate(this.eventsprofileForm.get('MedicationCreate').value.Timefrom, "HH:mm:ss")}`,
            Dosetime: this.parsePayloadTime(this.eventsprofileForm.get('MedicationCreate').value.Timefrom),
            Dose: `${this.eventsprofileForm.get('MedicationCreate').value.Dose}`,
            Action: "6"
          }
          const filterData = filterSelectedData.filter(d => d.isSelected)
          if (filterData && filterData.length) {
            const payload = filterData[0];
            PayloadData = {
              ...PayloadData,
              Dosedate: `${formatDate(payload.Pbdad, "YYYY-MM-DD")}T${formatDate(this.eventsprofileForm.get('MedicationCreate').value.Timefrom, "HH:mm:ss")}`,
            }
          }
          this.CreateventActionSet(createPopover, PayloadData, "Event has been Created");
        }
      }
    }
  }

  SuspendAction(createPopover: any) {
    const newtime = `${formatDate(new Date(), "HH:mm:ss")}`
    const filterSelectedData = this.drugArray.controls.map(d => d.value).filter(d => d.isSelected);
    if (new Date() <= filterSelectedData[0].Pbdad) {
      if (filterSelectedData && filterSelectedData.length || newtime <= filterSelectedData[0].Pbtad) {
        const OrderData = this.drugArray.controls.map(d => d.value).find(d => d.Meordid);
        const PayloadData = {
          Einri: OrderData.Einri,
          Falnr: OrderData.Falnr,
          Meordid: OrderData.Meordid,
          Meevtid: OrderData.Meevtid,
          Datefrom: `${formatDate(this.eventsprofileForm.get('MedicationHold').value.Datefrom, "YYYY-MM-DD")}T${formatDate(this.eventsprofileForm.get('MedicationHold').value.Datefrom, "HH:mm:ss")}`,
          Timefrom: this.parsePayloadTime(formatDate(this.eventsprofileForm.get('MedicationHold').value.Datefrom, "HH:mm:ss")),
          Stoid: OrderData.Stoid,
          Action: "2",
          Comments: this.eventsprofileForm.get('MedicationHold').value.Comments,
        }
        this.eventActionSet(createPopover, PayloadData, "Event has been Suspended", "Suspend")
      }
    } else {
      this.showErrorPopup("", "You can't Suspend previous event", "Error")
    }
  }

  endEventAction(createPopover: any) {
    const filterSelectedData = this.drugArray.controls.map(d => d.value);
    if (filterSelectedData && filterSelectedData.length) {
      const OrderData = this.drugArray.controls.map(d => d.value).find(d => d.Meordid);
      const PayloadData = {
        Einri: OrderData.Einri,
        Falnr: OrderData.Falnr,
        Meordid: OrderData.Meordid,
        Meevtid: OrderData.Meevtid,
        Rcodeid: this.eventsprofileForm.get('MedicationEnd').value.Rcodeid,
        Datefrom: `${formatDate(this.eventsprofileForm.get('MedicationEnd').value.Datefrom, "YYYY-MM-DD")}T${formatDate(this.eventsprofileForm.get('MedicationEnd').value.Datefrom, "HH:mm:ss")}`,
        Timefrom: this.parsePayloadTime(formatDate(this.eventsprofileForm.get('MedicationEnd').value.Datefrom, "HH:mm:ss")),
        Action: "1",
      }
      this.eventActionSet(createPopover, PayloadData, "Event has been Ended")
    }
  }

  editEventAction(createPopover: any) {
    const filterSelectedData = this.drugArray.controls.map(d => d.value).filter(d => d.isSelected);
    if (new Date() <= filterSelectedData[0].Pbdad) {
      if (filterSelectedData && filterSelectedData.length) {
        const OrderData = this.drugArray.controls.map(d => d.value).find(d => d.Meordid);
        const PayloadData = {
          Einri: OrderData.Einri,
          Falnr: OrderData.Falnr,
          Meordid: OrderData.Meordid,
          Meevtid: OrderData.Meevtid,
          Dose: `${this.eventsprofileForm.get('MedicationEdit').value.Dose}`,
          Action: "5",
        }
        this.eventActionSet(createPopover, PayloadData, "Event has been Edited")
      }
    } else {
      this.showErrorPopup("", "You can't edit previous event", "Error")
    }

  }

  deleteeventAction(createPopover: any) {
    const filterSelectedData = this.drugArray.controls.map(d => d.value).filter(d => d.isSelected);
    if (new Date() <= filterSelectedData[0].Pbdad) {
      if (filterSelectedData && filterSelectedData.length) {
        const OrderData = this.drugArray.controls.map(d => d.value).find(d => d.Meordid);
        const PayloadData = {
          Einri: filterSelectedData[0].Einri,
          Falnr: filterSelectedData[0].Falnr,
          Meordid: filterSelectedData[0].Meordid,
          Meevtid: filterSelectedData[0].Meevtid,
          Action: "3"
        }
        this.eventActionSet(createPopover, PayloadData, "Event has been deleted")
      }
    } else {
      this.showErrorPopup("", "You can't delete previous event", "Error")
    }
  }


  ResumeeventAction(createPopover: any) {
    const filterSelectedData = this.drugArray.controls.map(d => d.value);
    if (filterSelectedData && filterSelectedData.length) {
      const OrderData = this.drugArray.controls.map(d => d.value).find(d => d.Meordid);
      const Timefrom = this.parsePayloadTime(OrderData.EvstaTime)
      const PayloadData = {
        Einri: OrderData.Einri,
        Falnr: OrderData.Falnr,
        Meordid: OrderData.Meordid,
        Datefrom: `${formatDate(this.eventsprofileForm.get('MedicationResume').value.Datefrom, "YYYY-MM-DD")}T${formatDate(this.eventsprofileForm.get('MedicationResume').value.Datefrom, "HH:mm:ss")}`,
        Timefrom: this.parsePayloadTime(formatDate(this.eventsprofileForm.get('MedicationResume').value.Datefrom, "HH:mm:ss")),
        Action: "4",
        Comments: this.eventsprofileForm.get('MedicationResume').value.Comments,
      }
      this.eventActionSet(createPopover, PayloadData, "Event has been Resumed", "Error")
    }
  }

  eventActionSet(template: any, data: any, message: string, eventType?: string) {
    const filterSelectedData = this.drugArray.controls.map(d => d.value).find(d => d.Meordid);
    if (data || data.length) {
      this.ePrescriptionService.updateData(`e-prescription/updateEventMedicationStatus?Meordid=${filterSelectedData.Meordid}`, data).subscribe((resp: any) => {
        swal.fire({
          title: message,
          confirmButtonColor: '#0890c5',
          cancelButtonColor: '#84898c',
          confirmButtonText: 'OK',
          customClass: { popup: 'myalertpopup' },
          icon: 'success'
        } as any).then(() => {
          this.drugArray.clear();
          this.ePrescriptionService.loadData(`e-prescription/OrderEventMedicationStatus?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}&Meordid=${this.configurationData.Meordid}`, false, false, false, false).subscribe((resp: any) => {
            if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
              for (let i = 0; i < resp.body.d.results.length; i++) {
                this.drugArray.push(this.generateForm(resp.body.d.results[i]));
              }
            }
            template.hide();
          });
          this.configurationPopup = "false";
        })
      },
        (error) => {
          this.showErrorPopup("", error.error.error.message.value, "Error")
        });
    }
  }

  CreateventActionSet(template: any, data: any, message: string) {
    if (data.Dose !== "") {
      const filterSelectedData = this.drugArray.controls.map(d => d.value).find(d => d.Meordid);

      this.ePrescriptionService.updateData(`e-prescription/updateEventMedicationStatus?Meordid=${filterSelectedData.Meordid}`, data).subscribe((resp: any) => {
        swal.fire({
          title: message,
          confirmButtonColor: '#0890c5',
          cancelButtonColor: '#84898c',
          confirmButtonText: 'OK',
          customClass: { popup: 'myalertpopup' },
          icon: 'success'
        } as any).then(() => {
          this.drugArray.clear();
          this.ePrescriptionService.loadData(`e-prescription/OrderEventMedicationStatus?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}&Meordid=${this.configurationData.Meordid}`, false, false, false, false).subscribe((resp: any) => {
            if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
              for (let i = 0; i < resp.body.d.results.length; i++) {
                this.drugArray.push(this.generateForm(resp.body.d.results[i]));
              }
            }
            template.hide();
          });
          this.configurationPopup = "false";
        })
      },
        (error) => {
          this.showErrorPopup("", error.error.error.message.value, "Error")
        });
    } else {
      this.showErrorPopup("", "Please specify the Dose", "Error")
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
      customClass: { popup: 'myalertpopup' },
      icon: 'error'
    } as any);
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


  parsePayloadTime(date) {
    const newDate = typeof (date) === "object" ? `${new DatePipe('en-US').transform(date, "HH:mm:ss")}` : date
    if (newDate) {
      const strArr: string[] = newDate.split(':');
      if (
        newDate &&
        newDate.length === 8
      ) {
        return `PT${strArr[0]}H${strArr[1]}M${strArr[2]}S`;
      }
    }
    return null;
  }

  sanitizeSAPDateFormat(date: string, time: any) {
    if (typeof (date) === 'string') {
      if (date !== null && time !== null) {
        const generatedDate = new DatePipe('en-US').transform(
          date.replace('/Date(', '').replace(')/', ''),
          'yyyy-MM-dd'
        );
        return new Date(`${generatedDate}T${this.parseTime(time)}`);
      } else {
        return null
      }
    } else {
      return date
    }
  }

}
