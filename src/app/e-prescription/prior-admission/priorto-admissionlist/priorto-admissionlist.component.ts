import { Component, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import { EPrescriptionService, MedicationdFilterData } from '@services/e-Prescription/e-prescription.service';
import { AdditionInfoPopupComponent } from '../../discharge-order/addition-info-popup/addition-info-popup.component';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { PopoverDirective } from 'ngx-bootstrap/popover';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'priorto-admissionlist',
  templateUrl: './priorto-admissionlist.component.html',
  styleUrls: ['./priorto-admissionlist.component.scss'],
  providers: [DatePipe]
})
export class PriortoAdmissionlistComponent implements OnInit {
  selectedRowIndex: number = -1;
  public medicationCancellationReason: any[];
  unSubscribe:Subscription;
  priortoadmissionlistform = new FormGroup({ priortoadmissionlistformArray: new FormArray([])})
  @ViewChild('additionalPopup', { static: true }) additionalPopup: AdditionInfoPopupComponent;
  @ViewChildren(PopoverDirective) popovers: QueryList<PopoverDirective>;
  constructor(public addministrationService: AddministrationService,public eprescriptionService: EPrescriptionService) {}
  cancelActions:any[] = [];
  configurationData: MedicationdFilterData[] = [];
  filterConfig: MedicationdFilterData = {
    Active: false, Suspended: false, Ended: false, Cancelled: false,
    Status: "", MedicationSorting: "", Sorting: ""
  }
  ngOnInit(): void {
    this.addministrationService.PriorToAdmission();
    this.unSubscribe = this.addministrationService.PriorToAdministrSubject.subscribe((data) => {
      this.generateDefaultForm(data);
      this.configurationData = data;
    });
  }
  @Input() set filterData(data: MedicationdFilterData) {
    this.filterConfig = data;
    this.filterEvents();
  }

  get drugArray() {
    return this.priortoadmissionlistform.get('priortoadmissionlistformArray') as FormArray
  }

  generateForm(data: any, index: number){
    return new FormGroup({
      Id: new FormControl(index),
      Meordid: new FormControl(data.Meordid),
      Einri: new FormControl(data.Einri),
      Falnr: new FormControl(data.Falnr),
      Descrlt: new FormControl(data.Descrlt, Validators.required),
      Formatdescr: new FormControl(data.Formatdescr),
      Routedescr: new FormControl(data.Routedescr),
      Durunittxt: new FormControl(data.Durunittxt, Validators.required),
      Quantunittxt: new FormControl(data.Quantunittxt),
      N1id: new FormControl(data.N1id),
      N1ztxt: new FormControl(data.N1ztxt),
      Physicin: new FormControl(data.Physicin),
      Physicinnm: new FormControl(data.Physicinnm),
      MotypId: new FormControl(data.MotypId),
      TOEVENTDATA: new FormControl([]),
      PomTxt: new FormControl(data.PomTxt),
      Purpose: new FormControl(data.Purpose),
      PriorityTxt: new FormControl(data.PriorityTxt),
      Mosid: new FormControl(data.Mosid),
      MosidDesc: new FormControl(data.MosidDesc),
      IsmoDetails: new FormControl(true),
      IsEditMode: new FormControl(false),
      Isrenewed: new FormControl(false),
      AddDose: new FormControl(data.AddDose),
      Agentid: new FormControl(data.Agentid),
      Aprouteid: new FormControl(data.Aprouteid),
      Complex: new FormControl(data.Complex),
      Descr: new FormControl(data.Descr),
      Dosdef: new FormControl(data.Dosdef),
      Drugid: new FormControl(data.Drugid),
      Lfdnr: new FormControl(data.Lfdnr),
      EmpRespNm: new FormControl(data.EmpRespNm),
      Moresp1: new FormControl(this.addministrationService.medicationAdministrative.EmpResp),
      N1znr: new FormControl(data.N1znr),
      Orgfa: new FormControl(data.Orgfa),
      Orgpf: new FormControl(data.Orgpf),
      Pdur: new FormControl(data.Pdur),
      Pduru: new FormControl(data.Pduru),
      Phformid: new FormControl(data.Phformid),
      Pom: new FormControl(data.Pom),
      Priority: new FormControl(data.Priority),
      Prn: new FormControl(data.Prn),
      Prncond: new FormControl(data.Prncond),
      Quan: new FormControl(data.Quan),
      Quanunit: new FormControl(data.Quanunit),
      Indisdos: new FormControl(data.Indisdos),
      Result_Drug_Name: new FormControl(data.Descrlt, Validators.required),
      StartD: new FormControl(this.sanitizeSAPDateFormat(data.StartD, data.StartT), Validators.required),
      StartT: new FormControl(''),
      EndD: new FormControl(this.sanitizeSAPDateFormat(data.EndD, data.EndT), Validators.required),
      EndT: new FormControl(data.EndT),
      TOCOMPLEX: new FormControl([]),
      Updmode: new FormControl(false),
      Rcodeid: new FormControl(),
      ValidationDate: new FormControl(this.sanitizeSAPDateFormat(data.ValidationDate, data.ValidationTime), Validators.required),
      ValidationNm: new FormControl(data.ValidationNm),
      ValidationTime: new FormControl(this.sanitizeSAPDateFormat(data.ValidationDate, data.ValidationTime), Validators.required),
      ValidationVma: new FormControl(data.ValidationVma),
      ContHospital: new FormControl(data.ContHospital),
    })
  }
  updatedata(index: number) {
    return this.drugArray.controls.map(d => d.value).find(d => d.Id === index)
  }
  generateDefaultForm(data: any) {
    this.addministrationService.searchMedicationProfile = "";
    this.drugArray.clear();
    for (let i = 0; i < data.length; i++) { this.drugArray.push(this.generateForm(data[i], i)); }
  }
  ngDoCheck(): void {
    if (!!this.popovers) {
      this.popovers.forEach((popover: PopoverDirective) => {
        if (popover.popover['_declarationTContainer']['localNames'][0] === "cancelActionRef") {
          const popoverSubscription: Subscription = popover.onShown.subscribe(() => {
            this.popovers
              .filter(p => p !== popover)
              .forEach(p => p.hide());
            popoverSubscription.unsubscribe();
          });
        }
      });
    }
  }

  filterEvents() {
    if (this.configurationData && this.configurationData.length) {
      this.generateDefaultForm(this.configurationData);
    }
    if (this.filterConfig.Active || this.filterConfig.Suspended || this.filterConfig.Ended || this.filterConfig.Cancelled) {
      const scheduleList = ([].concat.apply([], this.drugArray.controls.map(d => d.value))).filter(d =>
        (this.filterConfig.Active && d.MosidDesc === "Active") ||
        (this.filterConfig.Ended && d.MosidDesc === "Ended") ||
        (this.filterConfig.Cancelled && d.MosidDesc === "Cancelled") ||
        (this.filterConfig.Suspended && d.MosidDesc === "Suspended")
      );
      this.generateDefaultForm(scheduleList);
    }
  }

  durationConvert(data: any) { if (data === 0) {return ""}return data }

  onOpenInfoPopup(data: any, index: number) {
    this.additionalPopup.showPopup(`${data.Descr !== '' ? `Comment: ${data.Descr}\n` : ''}${data.Prncond !== '' ? `PRN Condition: ${data.Prncond}` : ''}`, index);
  }

  sanitizeSAPDate(timestampStr){
    if (timestampStr && typeof timestampStr === 'string') {
        const matchResult = timestampStr.match(/\d+/);
        if (matchResult) {
            const timestamp = parseInt(matchResult[0]);
            const date = new Date(timestamp);
            const formattedDate = `${('0' + date.getDate()).slice(-2)}.${('0' + (date.getMonth() + 1)).slice(-2)}.${date.getFullYear()}`;
            return formattedDate;
        } else {
            return null;
        }
    } else {
        return null;
    }
}

medicationCancellationAction() {
  const medicationCancellReason: Subscription = this.eprescriptionService.loadData(`e-prescription/CancelMedicationStatus?Einri=${this.eprescriptionService.parameters.einri}`, false, false, false, false).subscribe((resp: any) => {
    if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
      this.medicationCancellationReason = resp.body.d.results;
      if(this.medicationCancellationReason){
        for(let i=0; i<this.addministrationService.PriorToAdministration.length; i++){
          this.cancelActions.push( {value:resp.body.d.results.find(d => d.Stoid === "ERR").Stoid});
        }
      }
    }
  }, () => {
    medicationCancellReason.unsubscribe();
  });
}
createFormGroup(defaultVal:string){
  return new FormGroup({
    Stoid: new FormControl(defaultVal)
  });
}

  onDelete(item, stoid) {
    const payload = {
      "Einri" : item.Einri,
      "Falnr" : item.Falnr,
      "Meordid" : item.Meordid,
      "Stoid" : stoid,
      "Action" : "3"
    }
      this.eprescriptionService.updateData(`e-prescription/OrderActionSet?Meordid=${item.Meordid}`, payload).subscribe((resp: any) => {
          Swal.fire({
            title: 'Your order has been Cancelled',
            confirmButtonColor: '#0890c5',
            cancelButtonColor: '#84898c',
            confirmButtonText: 'OK',
            // customClass: 'myalertpopup',
            icon: 'success'
          }).then((result) => {
            this.addministrationService.PriorToAdmission();
          });
        });
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
  onEditlist(index: number) {this.addministrationService.IsEditMode[index] = true;}

  closeEditModetail(index: number) { this.addministrationService.IsEditMode[index] = false; }

  ngOnDestroy(): void {
    if (this.unSubscribe) { this.unSubscribe.unsubscribe(); }
  }

}
