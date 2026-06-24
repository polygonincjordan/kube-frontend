import { DatePipe } from '@angular/common';
import { Component, DoCheck, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { formatDate } from 'ngx-bootstrap/chronos';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import swal from 'sweetalert2';
import { AdditionInfoPopupComponent } from '../../discharge-order/addition-info-popup/addition-info-popup.component';
import { PrnConditionPopupComponent } from '../../discharge-order/prn-condition-popup/prn-condition-popup.component';
import { CycleDefinitionPopupComponent } from '../../../../../shared-module/cycle-definition/cycle-definition-popup.component';

@Component({
  selector: 'edit-medication',
  templateUrl: './edit-medication.component.html',
  styleUrls: ['./edit-medication.component.scss']
})
export class EditMedicationComponent implements OnInit {
  public editprofileForm: FormGroup;
  public medicationEndReason: any[];
  public isFormSubmitted: boolean = false;
  public defaultAgentId: string;
  constructor(public route: ActivatedRoute, public ePrescriptionService: EPrescriptionService, private datePipe: DatePipe, public addministrationService: AddministrationService) { }

  @Input() editdata: any;
  @Input() Editdvalue: any;
  @Output() onUpdateprnData: EventEmitter<any> = new EventEmitter;
  InputValue: any;
  // @Output() Editdvalue: any = new EventEmitter();
  private regex: RegExp = new RegExp(/^\d*\.?\d{0,2}$/g);
  @ViewChild('prnCondition', { static: true }) prnCondition: PrnConditionPopupComponent;
  @ViewChild('cyclePopup', { static: true }) cyclePopup: CycleDefinitionPopupComponent;

  EditActionPayloadConfig = {
    Einri: "",
    Falnr: "",
    Meordid: "",
    Agentid: "",
    Aprouteid: "",
    Pdur: "",
    Pduru: "",
    Quan: "",
    Quanunit: "",
    N1znr: "",
    Prn: "",
    Prncond: "",
    Moresp1: "",
    Orgfa: "",
    Orgpf: "",
    Mostx: "",
    Rcodeid: "",
    StartD: "",
    StartT: "",
    EndD: "",
    EndT: "",
    TOCYCDEF: "",
  }

  ngOnInit(): void {
    this.onSelectMedicine({ data: { ...this.editdata, Drugname: this.editdata.Result_Drug_Name } })
    this.editprofileForm = new FormGroup({
      Einri: new FormControl(this.editdata.Einri),
      Falnr: new FormControl(this.editdata.Falnr),
      Meordid: new FormControl(this.editdata.Meordid),
      Agentid: new FormControl(this.editdata.Agentid),
      Aprouteid: new FormControl(this.editdata.Aprouteid),
      Pdur: new FormControl(this.editdata.Pdur && parseInt(this.editdata.Pdur) === Number(this.editdata.Pdur) ? parseInt(this.editdata.Pdur) : this.editdata.Pdur),
      Pduru: new FormControl(this.editdata.Pduru),
      Quan: new FormControl(this.editdata.Quan && parseInt(this.editdata.Quan) === Number(this.editdata.Quan) ? parseInt(this.editdata.Quan) : this.editdata.Quan),
      Quanunit: new FormControl(this.editdata.Quanunit),
      N1znr: new FormControl(this.editdata.N1znr),
      Prn: new FormControl(this.editdata.Prn),
      Prncond: new FormControl(this.editdata.Prncond),
      Moresp1: new FormControl(this.editdata.Moresp1),
      Orgfa: new FormControl(this.editdata.Orgfa),
      Orgpf: new FormControl(this.editdata.Orgpf),
      Mostx: new FormControl(this.editdata.Descr),
      Formatdescr: new FormControl(this.editdata.Formatdescr),
      Rcodeid: new FormControl(this.editdata.Rcodeid),
      StartD: new FormControl(this.editdata.StartD, Validators.required),
      StartT: new FormControl(''),
      EndD: new FormControl(this.sanitizeSAPDateFormat(this.editdata.EndD, this.editdata.EndT), Validators.required),
      EndT: new FormControl(this.editdata.EndT),
      Physicinnm: new FormControl(this.editdata.Physicinnm),
      Pom: new FormControl(this.editdata.Pom),
      Result_Drug_Name: new FormControl(this.editdata.Result_Drug_Name, Validators.required),
      AgentidResult: new FormControl([]),
      indisdos: new FormControl(this.editdata.indisdos),
      TOCYCDEF: new FormControl(this.editdata.TOCYCDEF && this.editdata.TOCYCDEF.results ? this.editdata.TOCYCDEF.results : [])
    })
    if (new Date() > this.editdata.StartD) {
      this.editprofileForm.patchValue({ StartD: new Date() });
    }
    this.validFromTobaseonDuration(this.editprofileForm.value);
  }

  updateAdditionalInfo(event) {
    this.onUpdateprnData.emit(this.editprofileForm)
  }

  onOpenCycleDefinition() {
    const existing = this.editprofileForm.get('TOCYCDEF').value || [];
    const n1znr = this.editprofileForm.get('N1znr').value;
    if (existing && existing.length) { this.openCyclePopup(existing); return; }
    if (n1znr) {
      // Load the cycle definition for this frequency key (N1znr) and populate the popup.
      this.ePrescriptionService.loadData(`e-prescription/frequencyQ24Cycle?N1znr=${n1znr}`, false, false, false, false).subscribe((res: any) => {
        const records = res && res.body && res.body.d && res.body.d.results ? res.body.d.results : [];
        this.openCyclePopup(records);
      }, () => this.openCyclePopup([]));
      return;
    }
    this.openCyclePopup([]);
  }

  private openCyclePopup(records: any[]) {
    this.cyclePopup.showPopup({
      index: 0,
      n1znr: this.editprofileForm.get('N1znr').value,
      title: this.editdata.Result_Drug_Name || this.editdata.Descr || '',
      startDate: this.editprofileForm.get('StartD').value,
      records
    });
  }

  onCycleSaved(event: { index: number; data: any[] }) {
    this.editprofileForm.get('TOCYCDEF').setValue(event.data || []);
    this.editprofileForm.markAsDirty();
  }

  /** Map TOCYCDEF to the writable fields, dropping read-back-only props such as __metadata. */
  normalizeCycleDef(records: any[], n1znr: string): any[] {
    const list = records && records.length ? records : [];
    return list.map((r: any, i: number) => ({
      N1znr: r.N1znr || n1znr,
      N1lfnr: r.N1lfnr || `${i + 1}`.padStart(4, '0'),
      Menge: `${r.Menge}`,
      Begdt: r.Begdt,
      Enddt: r.Enddt,
      Mo: !!r.Mo, Tu: !!r.Tu, We: !!r.We, Th: !!r.Th, Fr: !!r.Fr, Sa: !!r.Sa, Su: !!r.Su,
      IntervalDay: +r.IntervalDay || 1,
      IntervalHour: `${r.IntervalHour || '0'}`,
      TiStart: r.TiStart,
      TiEnd: r.TiEnd
    }));
  }

  onEditAction() {
    const genratePayload = {
      ...this.editprofileForm.value,
      // Map TOCYCDEF to writable fields (drops __metadata etc. from read-back records).
      TOCYCDEF: this.normalizeCycleDef(this.editprofileForm.value.TOCYCDEF, this.editprofileForm.value.N1znr),
      StartT: this.parsePayloadTime(this.editprofileForm.value.StartD),
      StartD: this.editprofileForm.value.StartD !== null ? `${formatDate(this.editprofileForm.value.StartD, "YYYY-MM-DD")}T${formatDate(this.editprofileForm.value.StartD, "HH:mm:ss")}` : null,
      EndT: this.parsePayloadTime(this.editprofileForm.value.EndD),
      EndD: this.editprofileForm.value.EndD ? `${formatDate(this.editprofileForm.value.EndD, "YYYY-MM-DD")}T${formatDate(this.editprofileForm.value.EndD, "HH:mm:ss")}` : null,
      Rcodeid: "",
      Quan: `${this.editprofileForm.value.Quan}`,
      Pdur: `${this.editprofileForm.value.Pdur}`,
    }
    this.ePrescriptionService.loadData(`e-prescription/EndOrdReasonMedication?Einri=${this.ePrescriptionService.parameters.einri}`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        this.medicationEndReason = resp.body.d.results;
        genratePayload.Rcodeid = resp.body.d.results.find(d => d.Rcode === "END").Rcodeid;
        if (genratePayload.Rcodeid !== undefined || genratePayload.Rcodeid !== "") {
          const payloadData = {};
          Object.keys(this.EditActionPayloadConfig).forEach((key) => {
            if (this.EditActionPayloadConfig.hasOwnProperty(key)) {
              payloadData[key.toString()] = genratePayload[key];
            }
          });
          this.ePrescriptionService.updateData(`e-prescription/EditMedicationStatus?Meordid=${this.editdata.Meordid}`, payloadData).subscribe((resp: any) => {
            this.editdata;
            swal.fire({
              title: 'Order has been edited',
              confirmButtonColor: '#0890c5',
              cancelButtonColor: '#84898c',
              confirmButtonText: 'OK',
              customClass: { popup: 'myalertpopup' },
              icon: 'success'
            } as any).then(() => {
              window.location.reload();
            })
          },
            (error) => {
              this.showErrorPopup("", error.error.error.message.value, "Error")
            })
        }
      }
    })
  }

  numberOnly(event): boolean {
    let value = event.target.value;
    if (this.editprofileForm.value.indexOf(event.key) !== -1) {
      return;
    }
    let current: string = value;
    const position = event.target.selectionStart;
    const next: string = [
      current.slice(0, position),
      event.key == 'Decimal' ? '.' : event.key,
      current.slice(position),
    ].join('');
    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
  }

  onChangePom(index: number, event: any) {
    event.target.value
    this.editprofileForm.patchValue({
      Pom: `${index}`
    })
  }

  Commentprncond() {
    this.onUpdateprnData.emit(this.editprofileForm.get('Prncond').value)
  }

  @Input() set medicationdetailsdate(data: any) {
    // this.medicationValidity = data.item;
    // this.medicationForm.setValue(data.userData);
    // this.durationUnit = this.medicationValidity.Pduru !== null && this.medicationValidity.Pduru !== "" ? this.administrationService.durationUnitList.find(d => d.Unit == this.medicationValidity.Pduru).Text : "";
  }


  onChangeDosageUnit(data: any, event: any) {
    const selectedDosage = data.find(d => d.Meinh === event)
    if (selectedDosage !== undefined && selectedDosage.Agentid !== '') {
      this.editprofileForm.patchValue({
        Agentid: selectedDosage.Agentid !== null ? selectedDosage.Agentid : "",
        Quan: Math.floor(selectedDosage.Quant)
      })
    } else {
      this.editprofileForm.patchValue({
        Agentid: this.defaultAgentId
      })
    }
  }

  onSelectMedicine(event: any) {
    if (event.data) {
      const filter = {
        einri: this.ePrescriptionService.parameters.einri,
        case: this.ePrescriptionService.parameters.falnr,
        movement: this.ePrescriptionService.parameters.lfdnr,
        AgentID: event.data.Agentid,
        DrugID: event.data.Drugid,
        purpose: ''
      }
      let expandEntities = ['NAVDRUGFORMATS', 'NAVDRUGFORMATROUTES', 'NAVDRUGFORMATROUTEUNITS', 'NAVDRUGUNITS'];
      this.ePrescriptionService.loadData('DrugPropSet', filter, expandEntities, true, true).subscribe((resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results) {
          const DescriptionData = resp.body.d.results[0].NAVDRUGFORMATROUTES.results[0];
          this.editprofileForm.patchValue({
            Phformid: DescriptionData.FormID,
            Aprouteid: DescriptionData.RouteID,
            Result_Drug_Name: event.data.Drugname,
            Formatdescr: event.data.Formatdescr,
            Routedescr: event.data.Routedescr,
            Agentid: event.data.Agentid,
            Drugid: event.data.Drugid
          });
        }
      });
      this.ePrescriptionService.loadData(`e-prescription/DurgUnitlist?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}&Lfdnr=${this.ePrescriptionService.parameters.lfdnr}&Drugid=${event.data.Drugid}`, false, false, false, false).subscribe((resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
          if (resp.body.d.results[0] && resp.body.d.results.length) {
            resp.body.d.results.forEach(element => {
              element.Mseht !== "" && element.Agent !== "" ? element.OptionField = [element.Mseht, element.Agent].join(" - ") : element.OptionField = element.Mseht;
            });
            this.editprofileForm.patchValue({
              AgentidResult: resp.body.d.results,
            })
          }
        }
      });
    }
  }

  validFromTobaseonDuration(data: any) {
    if (data.StartD) {
      if (`${data.Pdur}` === "0") {
        this.editprofileForm.patchValue({ EndD: null });
      }
      if (data.Pduru === "MON" && `${data.Pdur}` !== "0") {
        this.editprofileForm.patchValue({
          EndD: new Date(data.StartD.setMonth(data.StartD.getMonth() + +(data.Pdur))),
          StartD: new Date(data.StartD.setMonth(data.StartD.getMonth() - +(data.Pdur)))
        });
      }
      if (data.Pduru === "TAG" && `${data.Pdur}` !== "0") {
        this.editprofileForm.patchValue({
          EndD: new Date(data.StartD.setDate(data.StartD.getDate() + +(data.Pdur))),
          StartD: new Date(data.StartD.setDate(data.StartD.getDate() - +(data.Pdur)))
        });
      }

      if (data.Pduru === "MIN" && `${data.Pdur}` !== "0") {
        this.editprofileForm.patchValue({
          EndD: new Date(data.StartD.setMinutes(data.StartD.getMinutes() + +(data.Pdur))),
          StartD: new Date(data.StartD.setMinutes(data.StartD.getMinutes() - +(data.Pdur)))
        });
      }

      if (data.Pduru === "STD" && `${data.Pdur}` !== "0") {
        this.editprofileForm.patchValue({
          EndD: new Date(data.StartD.setHours(data.StartD.getHours() + +(data.Pdur))),
          StartD: new Date(data.StartD.setHours(data.StartD.getHours() - +(data.Pdur)))
        });
      }

      if (data.Pduru === "S" && `${data.Pdur}` !== "0") {
        this.editprofileForm.patchValue({
          EndD: new Date(data.StartD.setSeconds(data.StartD.getSeconds() + +(data.Pdur))),
          StartD: new Date(data.StartD.setSeconds(data.StartD.getSeconds() - +(data.Pdur)))
        });
      }

      if (data.Pduru === "WCH" && `${data.Pdur}` !== "0") {
        this.editprofileForm.patchValue({
          EndD: new Date(data.StartD.setDate(data.StartD.getDate() + (+(data.Pdur) * 7))),
          StartD: new Date(data.StartD.setDate(data.StartD.getDate() - (+(data.Pdur) * 7)))
        });
      }

      if (data.Pduru === "DOS" && `${data.Pdur}` !== "0") {
        this.editprofileForm.patchValue({ EndD: null });
        if (data.N1znr !== null) { this.onFrequencyFilter(data) }
      }
    }
  }

  onUpdatedAdditionalInfoprn(event: any) {
    this.editprofileForm.patchValue({ Prncond: event.data })
  }
  onOpenInfoPopup(data: any, index?) {
    this.prnCondition.showPopup(data.Prncond, index);
  }

  onFrequencyFilter(data: any) {
    const findSelectedFrequency = this.addministrationService.frequencyList.find(d => d.CycleKey === data.N1znr).N1id;
    if (findSelectedFrequency === "Q24H") {
      this.updateDosageHour(data, 24)
    } else if (findSelectedFrequency === "BID") {
      this.updateDosageHour(data, 12)
    } else if (findSelectedFrequency === "TID") {
      this.updateDosageHour(data, 8)
    } else if (findSelectedFrequency === "QID") {
      this.updateDosageHour(data, 4)
    } else if (findSelectedFrequency === "ONCE") {
      this.updateDosageHour(data, 24)
    } else if (findSelectedFrequency === "SLIDING") {
      this.updateDosageHour(data, 8)
    } else if (findSelectedFrequency === "Q12H") {
      this.updateDosageHour(data, 24)
    } else if (findSelectedFrequency === "Q2H") {
      this.updateDosageHour(data, 12)
    } else if (findSelectedFrequency === "Q3H") {
      this.updateDosageHour(data, 8)
    } else if (findSelectedFrequency === "Q4H") {
      this.updateDosageHour(data, 4)
    } else if (findSelectedFrequency === "Q6H") {
      this.updateDosageHour(data, 6)
    } else if (findSelectedFrequency === "Q8H") {
      this.updateDosageHour(data, 8)
    } else if (findSelectedFrequency === "PQ24H") {
      this.updateDosageHour(data, 24)
    } else if (findSelectedFrequency === "NBID") {
      this.updateDosageHour(data, 12)
    } else if (findSelectedFrequency === "PBID") {
      this.updateDosageHour(data, 12)
    } else if (findSelectedFrequency === "PTID") {
      this.updateDosageHour(data, 8)
    } else if (findSelectedFrequency === "NTID") {
      this.updateDosageHour(data, 8)
    } else if (findSelectedFrequency === "PQID") {
      this.updateDosageHour(data, 4)
    } else if (findSelectedFrequency === "NQID") {
      this.updateDosageHour(data, 4)
    } else if (findSelectedFrequency === "QHS") {
      this.updateDosageHour(data, 12)
    } else if (findSelectedFrequency === "PHS") {
      this.updateDosageHour(data, 12)
    } else if (findSelectedFrequency === "PQ4H") {
      this.updateDosageHour(data, 4)
    } else if (findSelectedFrequency === "PQ8H") {
      this.updateDosageHour(data, 8)
    } else if (findSelectedFrequency === "NQ8H") {
      this.updateDosageHour(data, 8)
    } else if (findSelectedFrequency === "PQ12H") {
      this.updateDosageHour(data, 24)
    } else if (findSelectedFrequency === "NQ12H") {
      this.updateDosageHour(data, 24)
    } else if (findSelectedFrequency === "5X/DAY") {
      this.updateDosageHour(data, 12)
    } else if (findSelectedFrequency === "STAT") {
      this.updateDosageHour(data, 24)
    } else if (findSelectedFrequency === "QAD") {
      this.updateDosageHour(data, 12)
    } else if (findSelectedFrequency === "QD") {
      this.updateDosageHour(data, 24)
    } else if (findSelectedFrequency === "QD/AC") {
      this.updateDosageHour(data, 24)
    } else if (findSelectedFrequency === "QD/PC") {
      this.updateDosageHour(data, 24)
    } else if (findSelectedFrequency === "CONT") {
      this.updateDosageHour(data, 24)
    } else if (findSelectedFrequency === "BID/AC") {
      this.updateDosageHour(data, 12)
    } else if (findSelectedFrequency === "TID/PC") {
      this.updateDosageHour(data, 8)
    } else if (findSelectedFrequency === "NQD") {
      this.updateDosageHour(data, 24)
    } else if (findSelectedFrequency === "NQ6H") {
      this.updateDosageHour(data, 6)
    } else if (findSelectedFrequency === "PQ6H") {
      this.updateDosageHour(data, 6)
    } else if (findSelectedFrequency === "TID/AC") {
      this.updateDosageHour(data, 8);
    } else if (findSelectedFrequency === "BID/PC") {
      this.updateDosageHour(data, 8)
    } else if (findSelectedFrequency === "DEFTIM") {
      this.updateDosageHour(data, 24)
    } else if (findSelectedFrequency === "DAILY") {
      this.updateDosageHour(data, 24)
    } else if (findSelectedFrequency === "Q23H") {
      this.updateDosageHour(data, 24)
    } else if (findSelectedFrequency === "WEEKLY") {
      this.updateDosageHour(data, 24)
    } else if (findSelectedFrequency === "INCREMENT") {
      this.updateDosageHour(data, 24)
    } else if (findSelectedFrequency === "TEST 1") {
      this.updateDosageHour(data, 24)
    }
  }

  updateDosageHour(data: any, updatedHour) {
    this.editprofileForm.patchValue({
      EndD: new Date(data.StartD.setHours(data.StartD.getHours() + (+(data.Pdur) * updatedHour))),
      StartD: new Date(data.StartD.setHours(data.StartD.getHours() - (+(data.Pdur) * updatedHour)))
    });
  }

  parsePayloadTime(date) {
    const newDate = `${new DatePipe('en-US').transform(date, "HH:mm:ss")}`
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
