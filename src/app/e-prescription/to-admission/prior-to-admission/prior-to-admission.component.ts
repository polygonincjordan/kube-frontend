import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import { EPrescriptionService} from '@services/e-Prescription/e-prescription.service';
import { formatDate } from 'ngx-bootstrap/chronos';
import { Subscription } from 'rxjs';
import swal from 'sweetalert2';
import { AdditionInfoPopupComponent } from '../../discharge-order/addition-info-popup/addition-info-popup.component';
import { TemplateDescriptionComponent } from '../../administration/create-administration/template-description/template-description.component';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PlannedAdministrationComponent } from '../planned-administration/planned-administration.component';

@Component({
  selector: 'prior-to-admission',
  templateUrl: './prior-to-admission.component.html',
  styleUrls: ['./prior-to-admission.component.scss'],
  providers: [DatePipe]
})
export class PriorToAdmissionComponent implements OnInit {
  public administrationForm= new FormGroup({ AdministrationData: new FormArray([], Validators.required),});
  public isFormSubmitted: boolean = false;
  public dosageUnitList: any[];
  public tabmodetail: string;
  public medicationDruglist: any[];
  public modetailsFormSubscription: Subscription;
  public defaultAgentId: string;
  public subscription: Subscription
  public SelectMedicinesubscription: Subscription;
  modalRef?: BsModalRef;
  priortoad:any[] = [];
  maxDate: Date;
  minDate: Date;
  ContinueHospital:any;
  constructor(public opentempmodalservices: NgbModal, public ePrescriptionService: EPrescriptionService, public route: ActivatedRoute, public addministrationService: AddministrationService, private cdr: ChangeDetectorRef) { }
  @ViewChild('additionalPopup', { static: true }) additionalPopup: AdditionInfoPopupComponent;
  @ViewChild('template', { static: true }) template: PlannedAdministrationComponent;
  @ViewChild('prnPopup', { static: true }) prnPopup: AdditionInfoPopupComponent;
  @ViewChild('templateDescription', { static: true }) templateDescription: TemplateDescriptionComponent;
  ngOnInit() {
    this.addministrationService.loadDropdownList();
    this.generateDefaultForm();
    this.modetailsFormSubscription = this.administrationForm.valueChanges.subscribe(() => { this.isFormSubmitted = true; });
    for (let i = 0; i < this.drugArray.controls.length ;i++){
      this.ChangeDate(i,this.drugArray.controls[i].value)
    }
  }

  openModal(data) {
    this.addministrationService.isExpanded = false;
    this.addministrationService.isConditionTrue = true;
    if (data.ContHospital) {
      this.priortoad.push(data);
      this.template.showPopup(this.priortoad);
    }else{
      const index = this.priortoad.findIndex(period=> period.Agentid === data.Agentid );
      if(index !== -1){
        this.priortoad.splice(index,1);
      this.template.showPopup(this.priortoad);
      }
    }
    if(this.priortoad && this.priortoad.length === 0){
      this.addministrationService.isExpanded = true;
      this.addministrationService.isConditionTrue = false;
      this.priortoad = [];
    }
  }

  generateForm(index?) {
    return new FormGroup({
      id:new FormControl(index),
      ContHospital:new FormControl(false),
      Agentid: new FormControl(''),
      Drugid: new FormControl(''),
      Phformid: new FormControl(null, Validators.required),
      Aprouteid: new FormControl(null),
      Pdur: new FormControl(''),
      Pduru: new FormControl(null),
      Quan: new FormControl('0', Validators.required),
      Quanunit: new FormControl(null, Validators.required),
      N1znr: new FormControl(null, Validators.required),
      Dosdef: new FormControl(""),
      Prn: new FormControl(false),
      Prncond: new FormControl(''),
      Moresp1: new FormControl(''),
      Lfdnr: new FormControl(this.ePrescriptionService.parameters.lfdnr),
      StartD: new FormControl(null),
      StartT: new FormControl(null),
      EndD: new FormControl(new Date(), Validators.required),
      EndT: new FormControl(''),
      // Orgfa: new FormControl(""),
      // Orgpf: new FormControl(""),
      Descr: new FormControl(''),
      // Pom: new FormControl(''),
      Priority: new FormControl('010', Validators.required),
      Routedescr: new FormControl(null,Validators.required),
      Formatdescr: new FormControl(null),
      Result_Drug_Name: new FormControl(null, Validators.required),
      IsFrequencyDeftim: new FormControl(false),
      deftimcycleData: new FormControl([]),
      AgentidResult: new FormControl([]),
      N1ztxt : new FormControl(''),
      LastDoseDt :new FormControl(),
      LastDoseTm :new FormControl(),
      CONTINUEHOSPITAL:new FormControl([])
    })
  }
  sanitizeSAPDateFormat(date: string, time: any) {
    if (typeof (date) === 'string') {
      if (date !== null && time !== null) {
        const generatedDate = new DatePipe('en-US').transform(
          date.replace('/Date(', '').replace(')/', ''), 'yyyy-MM-dd'
        );
        return new Date(`${generatedDate}T${this.parsePtTime(time)}`);
      } else {
        return null
      }
    } else {
      return date
    }
  }

  generateDefaultForm() {
    for (let i = 0; i <= 3; i++) { this.drugArray.push(this.generateForm(i)); }
  }

  get drugArray() {
    return this.administrationForm.get('AdministrationData') as FormArray;
  }

  addRowData() {
    const notTouchedForms = this.drugArray.controls.filter(d => !d.touched);
    if (notTouchedForms && notTouchedForms.length > 3) {
      swal.fire({
        text: 'Enter data before adding new row',
        confirmButtonColor: '#0890c5',
        cancelButtonColor: '#84898c',
        confirmButtonText: 'OK',
        customClass: { popup: 'myalertpopup' },
        icon: 'error'
      } as any);
    } else {
      this.drugArray.push(this.generateForm());
    }
  }

  closeCycle(index: number) {
    this.drugArray.controls[index].patchValue({ IsFrequencyDeftim: false })
  }

  deleteRowData(index: any) {
    const TouchedForms = this.drugArray.controls.filter(d => d.touched);
    const unTouchedForms = this.drugArray.controls.filter(d => !d.touched);
    if (TouchedForms && TouchedForms.length) {
      this.showErrorPopup(null, 'Do You Want to Delete this Data?', 'Conform').then(
        (result) => {
          if (result.value) {
            this.drugArray.removeAt(index);

          }
        });
    } else if (unTouchedForms && unTouchedForms.length < 3) {
      this.showErrorPopup(null, 'Can not Delete', 'Error');
    } else {
      this.drugArray.removeAt(index);
    }
  }

  serachInput(term: string, item: any) {
    term = term.toLowerCase();
    return (item.Descr.toLowerCase().includes(term) || item.Aprou.toLowerCase().includes(term))
  }

  deletecycleData(index: any) {
    const TouchedForms = this.drugArray.controls[index].get('deftimcycleData')['controls'];
    const unTouchedForms = this.drugArray.controls[index].get('deftimcycleData')['controls'];
    if (TouchedForms && TouchedForms.length) {
      this.showErrorPopup(null, 'Do You Want to Delete this Data?', 'Conform').then(
        (result) => {
          if (result.value) {
            (this.drugArray.controls[index].get('deftimcycleData') as FormArray).removeAt(index);
            if (this.drugArray.controls[index].get('deftimcycleData').value && !this.drugArray.controls[index].get('deftimcycleData').value.length) {
              this.drugArray.controls[index].patchValue({ IsFrequencyDeftim: false, N1znr: null })
            }
          }
        });
    } else if (unTouchedForms && unTouchedForms.length < 3) {
      this.showErrorPopup(null, 'Can not Delete', 'Error');
    } else {
      (this.drugArray.controls[index].get('deftimcycleData') as FormArray).removeAt(index);
      if (this.drugArray.controls[index].get('deftimcycleData').value && !this.drugArray.controls[index].get('deftimcycleData').value.length) {
        this.drugArray.controls[index].patchValue({ IsFrequencyDeftim: false, N1znr: null })
      }
    }
  }

  searchMedicationDrugList() {
    this.SelectMedicinesubscription = this.ePrescriptionService.loadData(`e-prescription/medicationDetails?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}&Searchtype=${'B'}&SearchString=${''}`, null, false, false, false).subscribe({
      next: (resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results) {
          this.addministrationService.medicationDrugList = resp.body.d.results[0].TODURG.results
        }
      },
    });
    this.SelectMedicinesubscription.unsubscribe()
  }

  onSelectMedicine(event: any) {
    if (event.data) {
      this.defaultAgentId = event.data.Agentid;
      const filter = {
        einri: this.ePrescriptionService.parameters.einri,
        case: this.ePrescriptionService.parameters.falnr,
        movement: this.ePrescriptionService.parameters.lfdnr,
        AgentID: event.data.Agentid,
        DrugID: event.data.Drugid,
        purpose: '',
      }
      let expandEntities = ['NAVDRUGFORMATS', 'NAVDRUGFORMATROUTES', 'NAVDRUGFORMATROUTEUNITS', 'NAVDRUGUNITS'];
      this.ePrescriptionService.loadData('DrugPropSet', filter, expandEntities, true, true).subscribe((resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results) {
          if (resp.body.d.results[0].NAVDRUGFORMATROUTEUNITS.results && resp.body.d.results[0].NAVDRUGFORMATROUTEUNITS.results.length) {
            this.dosageUnitList = resp.body.d.results[0].NAVDRUGFORMATROUTEUNITS.results;
          }
        }
        this.drugArray.controls[event.index].patchValue({
          Phformid: resp.body.d.results[0].NAVDRUGFORMATROUTES.results[0].FormID,
          // Aprouteid: resp.body.d.results[0].NAVDRUGFORMATROUTES.results[0].RouteID,
          Result_Drug_Name: event.data.Drugname,
          Formatdescr: event.data.Formatdescr,
          // Routedescr: event.data.Routedescr,
          Agentid: event.data.Agentid,
          Drugid: event.data.Drugid
        });
      })
      this.SelectMedicinesubscription = this.ePrescriptionService.loadData(`e-prescription/DurgUnitlist?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}&Lfdnr=${this.ePrescriptionService.parameters.lfdnr}&Drugid=${event.data.Drugid}`, false, false, false, false).subscribe((resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
          if (resp.body.d.results[0] && resp.body.d.results.length) {
            resp.body.d.results.forEach(element => {
              if (element.Mseht !== "" && element.Agent !== "") {
                element.OptionField = [element.Mseht, element.Agent].join(" - ");
              } else {
                element.OptionField = element.Mseht
              }
            });
            this.drugArray.controls[event.index].patchValue({
              AgentidResult: resp.body.d.results,
              Quanunit: resp.body.d.results[0].Meinh,
              Quan: resp.body.d.results[0].Quant && parseInt(resp.body.d.results[0].Quant) === Number(resp.body.d.results[0].Quant) ? parseInt(resp.body.d.results[0].Quant) : Number(resp.body.d.results[0].Quant)
            });
          }
        }
      });
    } else {
      this.removeControl(event.index);
    }
  }
  removeControl(index: number) {
    this.drugArray.controls.splice(index, 1);
    this.cdr.detectChanges();
  }

  onChangeDosageUnit(data: any, event: any, index: number) {
    const selectedDosage = data.find(d => d.Meinh === event)
    if (selectedDosage !== undefined && selectedDosage.Agentid !== '') {
      this.drugArray.controls[index].patchValue({
        Agentid: selectedDosage.Agentid !== null ? selectedDosage.Agentid : "",
        Quan: Math.floor(selectedDosage.Quant)
      })
    } else {
      this.drugArray.controls[index].patchValue({
        Agentid: this.defaultAgentId
      })
    }
  }

  FrequencySetcycle(event, index: number, data: any) {
    if (event && event.length) {
      this.drugArray.controls[index].get("deftimcycleData").setValue(event);
      const selectedData = [];
      if (!event.find(d => formatDate(d.deftimTime, "HH:mm") === "08:00")) {
        selectedData.push("0(08:00)")
      }
      event.forEach(element => {
        selectedData.push(`${element.deftimDose}(${formatDate(element.deftimTime, "HH:mm")})`)
        this.onChangeDosageUnit(data, element.deftimDosageUnit, index)
      });
      this.drugArray.controls[index].patchValue({
        Quan: Math.floor(event[0].deftimDose),
        Quanunit: event[0].deftimDosageUnit,
      })
      this.drugArray.controls[index].patchValue({
        Dosdef: selectedData.join("-")
      })
    }
  }

  onChangeFrequencySet(data?: any, index?: number) {
    if (data !== null || data !== "") {
      this.drugArray.controls[index].get('deftimcycleData').setValue([]);
      if (this.drugArray.controls[index].get('Result_Drug_Name').value === "" || this.drugArray.controls[index].get('Result_Drug_Name').value === null) {
        this.showErrorPopup('', 'Please select medicine', "Error").then((result) => {
          if (result.value) {
            this.drugArray.controls[index].patchValue({ N1znr: null });
          }
        });
      }
      const frequencyData = this.addministrationService.frequencyList.find(d => d.CycleKey == data);
      if (frequencyData && frequencyData.N1id && (frequencyData.N1id == "STAT")) {
        this.drugArray.controls[index].patchValue({ Pdur: 1, Pduru: "DOS", Priority: "020" });
      }else if (frequencyData && frequencyData.N1id && frequencyData.N1id == "ONCE") {
        this.drugArray.controls[index].patchValue({ Pdur: 1, Pduru: "DOS", Priority: "010" });
      } else if (frequencyData && frequencyData.N1id && (frequencyData.N1id == "DEFTIM" || frequencyData.N1id == "DAILY")) {
        const defineDoses = this.drugArray.value[index].Dosdef ? this.drugArray.value[index].Dosdef.split(" ") : [];
        if (defineDoses && defineDoses.length) {
          let deftimDcycleData = [];
          defineDoses.forEach((element) => {
            const quanUnitDescription = element.split("(")[0];
            const defineTime = element.match(/\(([^)]+)\)/)[1];
            deftimDcycleData.push({ deftimDose: quanUnitDescription, deftimDosageUnit: this.drugArray.value[index].Quanunit, deftimTime: new Date(`${formatDate(new Date(), "YYYY-MM-DD")}T${defineTime}`) });
            this.drugArray.controls[index].get('deftimcycleData').setValue(deftimDcycleData)
          });
          deftimDcycleData = [];
        } else {
          this.drugArray.controls[index].get('deftimcycleData').setValue([{ deftimDose: this.drugArray.value[index].Quan, deftimDosageUnit: this.drugArray.value[index].Quanunit, deftimTime: new Date(`${formatDate(new Date(), "YYYY-MM-DD")}T08:00`) }]);
        }
        const selectedData = [];
        if (!this.drugArray.controls[index].get('deftimcycleData').value.find(d => formatDate(d.deftimTime, "HH:mm") === "08:00")) {
          selectedData.push("0(08:00)")
        }
        this.drugArray.controls[index].get('deftimcycleData').value.forEach(element => {
          selectedData.push(`${element.deftimDose}(${formatDate(element.deftimTime, "HH:mm")})`)
        });
        this.drugArray.controls[index].patchValue({ IsFrequencyDeftim: true, Dosdef: selectedData.join("-") });
      } else {
        this.drugArray.controls[index].patchValue({ Priority: "010", IsFrequencyDeftim: false });
      }
      this.validFromTobaseonDuration(index, this.drugArray.controls[index].value);
    } else {
      this.drugArray.controls[index].patchValue({ Priority: "010", IsFrequencyDeftim: false, IsmoDetails: false });
    }
  }

  onOpenFrequencySet(index: number) {
    if (this.drugArray.controls[index].get('deftimcycleData').value && this.drugArray.controls[index].get('deftimcycleData').value.length) {
      this.drugArray.controls[index].patchValue({ IsFrequencyDeftim: true, IsmoDetails: false });
    }
  }

  ChangeDate(index: number, data: any){
    this.maxDate =  data.EndD;
    this.minDate = data.StartD === null ? data.EndD : data.StartD;
  }

  changevalue(index: number, data: any){
    if(data.StartD){
      var getMonth = data.StartD.getMonth();
      var getFullYear = data.StartD.getFullYear();
      var getDate = data.StartD.getDate();
      var getMinutes = data.StartD.getMinutes();
      var getSeconds = data.StartD.getSeconds();
      var getHours = data.StartD.getHours();
    }
    if (data.StartD) {
      if (`${data.Pdur}` === "0") {
        this.drugArray.controls[index].patchValue({ EndD: null });
      }
      if (data.Pduru === "MON" && `${data.Pdur}` !== "0") {
        this.drugArray.controls[index].patchValue({
          EndD: new Date(getFullYear, (getMonth + (+(data.Pdur))), getDate, getHours, getMinutes, getSeconds),
        });
      }
      if (data.Pduru === "TAG" && `${data.Pdur}` !== "0") {
        this.drugArray.controls[index].patchValue({
          EndD: new Date(getFullYear, getMonth, (getDate + (+(data.Pdur))), getHours, getMinutes, getSeconds),
        });
      }

      if (data.Pduru === "MIN" && `${data.Pdur}` !== "0") {
        this.drugArray.controls[index].patchValue({
          EndD: new Date(getFullYear, getMonth, getDate, getHours, (getMinutes + (+(data.Pdur))), getSeconds)
        });
      }

      if (data.Pduru === "STD" && `${data.Pdur}` !== "0") {
        this.drugArray.controls[index].patchValue({
          EndD: new Date(getFullYear, getMonth, getDate, (getHours + (+(data.Pdur))), getMinutes, getSeconds),
        });
      }

      if (data.Pduru === "S" && `${data.Pdur}` !== "0") {
        this.drugArray.controls[index].patchValue({
          EndD: new Date(getFullYear, getMonth, getDate, getHours, getMinutes, (getSeconds + (+(data.Pdur)))),
        });
      }

      if (data.Pduru === "WCH" && `${data.Pdur}` !== "0") {
        this.drugArray.controls[index].patchValue({
          EndD: new Date(getFullYear, getMonth, (getDate + (+(data.Pdur) * 7)), getHours, getMinutes, getSeconds)
        });
      }
      if (data.Pduru === "DOS" && `${data.Pdur}` !== "0") {
        this.drugArray.controls[index].patchValue({ EndD: null });
        if (data.N1znr !== null) { this.onFrequencyFilter(data, index) }
      }
    }
  if (data.StartD && data.EndD && !data.Pdur) {
    const startDate = new Date(data.StartD);
    const endDate = new Date(data.EndD);
    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        const durationInMilliseconds = endDate.getTime() - startDate.getTime();
        const durationInDays = Math.floor(durationInMilliseconds / (1000 * 60 * 60 * 24));
        this.drugArray.controls[index].patchValue({
            Pdur: durationInDays,
            Pduru: "TAG"
        });
    }
   }
  }


  validFromTobaseonDuration(index: number, data: any) {
    let getMonth = data.EndD.getMonth();
    let getFullYear = data.EndD.getFullYear();
    let getDate = data.EndD.getDate();
    let getMinutes = data.EndD.getMinutes();
    let getSeconds = data.EndD.getSeconds();
    let getHours = data.EndD.getHours();
    if (data.EndD) {
      if (`${data.Pdur}` === "0") {
        this.drugArray.controls[index].patchValue({ StartD: null });
      }
      if (data.Pduru === "MON" && `${data.Pdur}` !== "0") {
        this.drugArray.controls[index].patchValue({
          StartD: new Date(getFullYear, (getMonth + (-(data.Pdur))), getDate, getHours, getMinutes, getSeconds),
        });
      }
      if (data.Pduru === "TAG" && `${data.Pdur}` !== "0") {
        this.drugArray.controls[index].patchValue({
          StartD: new Date(getFullYear, getMonth, (getDate + (-(data.Pdur))), getHours, getMinutes, getSeconds),
        });
      }

      if (data.Pduru === "MIN" && `${data.Pdur}` !== "0") {
        this.drugArray.controls[index].patchValue({
          StartD: new Date(getFullYear, getMonth, getDate, getHours, (getMinutes + (-(data.Pdur))), getSeconds)
        });
      }

      if (data.Pduru === "STD" && `${data.Pdur}` !== "0") {
        this.drugArray.controls[index].patchValue({
          StartD: new Date(getFullYear, getMonth, getDate, (getHours + (-(data.Pdur))), getMinutes, getSeconds),
        });
      }

      if (data.Pduru === "S" && `${data.Pdur}` !== "0") {
        this.drugArray.controls[index].patchValue({
          StartD: new Date(getFullYear, getMonth, getDate, getHours, getMinutes, (getSeconds + (-(data.Pdur)))),
        });
      }

      if (data.Pduru === "WCH" && `${data.Pdur}` !== "0") {
        this.drugArray.controls[index].patchValue({
          StartD: new Date(getFullYear, getMonth, (getDate + (-(data.Pdur) * 7)), getHours, getMinutes, getSeconds)
        });
      }
      if (data.Pduru === "DOS" && `${data.Pdur}` !== "0") {
        this.drugArray.controls[index].patchValue({ StartD: null });
        if (data.N1znr !== null) { this.onFrequencyFilter(data, index) }
      }
    }
  }

  onFrequencyFilter(data: any, index: number) {
    const findSelectedFrequency = this.addministrationService.frequencyList.find(d => d.CycleKey === data.N1znr).N1id;
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
    this.drugArray.controls[index].patchValue({
      StartD: new Date(data.EndD.setHours(data.EndD.getHours() - (+(data.Pdur) * updatedHour))),
      EndD: new Date(data.EndD.setHours(data.EndD.getHours() + (+(data.Pdur) * updatedHour)))
    });
  }

  onOpenInfoPopup(data: any, index: number) {
    this.additionalPopup.showPopup(data.get('Descr').value, index);
  }

  onUpdatedAdditionalInfo(event: any) {
    this.drugArray.controls[event.index].patchValue({ Descr: event.data })
  }

  onSubmitData() {
    let Payload = this.ePrescriptionService.loadParameters(true, true, true, true);
    this.ePrescriptionService.drugArrayActions$.next({isSubmitted: true, value:null});
    const invalidForms = this.ePrescriptionService.drugArrayActions$.getValue().value;
    const validForms = this.drugArray.controls.filter(d => d.valid);
    const validData = validForms.map((d)=>{
      const {
        id,
        Orgfa,
        Orgpf,
        Pom,Priority,
        Formatdescr,
        Result_Drug_Name,
        IsFrequencyDeftim,
        deftimcycleData,
        AgentidResult,
        N1ztxt,
        CONTINUEHOSPITAL,
        ...validPayload}= d.value;
      return validPayload
    });
    validData.forEach((element: any) =>{
      // element.CONTINUEHOSPITAL = invalidForms.filter(d => d.Agentid === element.Agentid && d.id === element.id);
      element.StartT = this.parseTime(element.StartD);
      element.StartD = element.StartD !== null ? `${this.parseDatedata(element.StartD)}${this.parseTimedata(element.StartD)}` : null;
      element.Aprouteid = element.Routedescr.Aprouid !== undefined ? element.Routedescr.Aprouid :element.Aprouteid;
      element.Routedescr = element.Routedescr.Descr !== undefined ? element.Routedescr.Descr :element.Routedescr;
      element.Quan = `${element.Quan}`;
      element.Pdur = element.Pdur === null || element.Pdur === '' ? "0" : `${element.Pdur}`;
      element.Pduru = element.Pduru !== null ? element.Pduru : "";
      element.EndT = this.parseTime(element.EndD);
      element.EndD = element.EndD !== null ? `${this.parseDatedata(element.EndD)}${this.parseTimedata(element.EndD)}` : null;
      element.LastDoseTm = this.parseTime(element.LastDoseDt);
      element.LastDoseDt = element.LastDoseDt !== null ? `${this.parseDatedata(element.LastDoseDt)}${this.parseTimedata(element.LastDoseDt)}` : null;
      element['Einri'] = this.ePrescriptionService.parameters.einri;
    });
    if(validData && validData.length){
      Payload['TOADMISSION'] = validData;
      this.ePrescriptionService.postData('e-prescription/PriorToAdmissionSet', Payload).subscribe((res: any) => {
        swal.fire({
          title: 'Your Order is Created',
          confirmButtonColor: '#0890c5',
          cancelButtonColor: '#84898c',
          confirmButtonText: 'OK',
          customClass: { popup: 'myalertpopup' },
          icon: 'success'
        } as any).then(() => {
          if(validData.find(element =>  element.ContHospital)){
            this.onSubmit();
          }
          this.drugArray.clear();
          this.generateDefaultForm();
          this.priortoad = [];
          this.addministrationService.isExpanded = true;
          this.addministrationService.isConditionTrue = false;
        })
      },
        (error) => {
          this.showErrorPopup("", error.error.error.message.value, "Error")
        });
    }
  }

  onSubmit() {
    let postObject = this.ePrescriptionService.loadParameters(true, true, true, true)
    this.isFormSubmitted = true;
    if (this.drugArray.controls && this.drugArray.controls.length) {
      const validForms = this.ePrescriptionService.drugArrayActions$.getValue().value;
      if (validForms && validForms.length) {
        const validData = validForms;
        validData.forEach((element: any) => {
          element.Quan = `${element.Quan}`;
          element.Pdur = element.Pdur === null || element.Pdur === '' ? "0" : `${element.Pdur}`;
          element.Pduru = element.Pduru !== null ? element.Pduru : "";
          element.Prncond = element.Prn ? element.Prncond : "";
          element.StartT = this.parseTime(element.StartD);
          element.StartD = `${this.parseDatedata(element.StartD)}${this.parseTimedata(element.StartD)}`;
          element.EndT = this.parseTime(element.EndD);
          element.Aprouteid = element.Aprouteid;
          element.Routedescr = element.Routedescr;
          element.EndD = element.EndD !== null ? `${this.parseDatedata(element.EndD)}${this.parseTimedata(element.EndD)}` : null;
          element.Complex = element.Complex ? "X" : "";
          element.AddDose = element.AddDose ? "X" : "";
          element.Prn && element.Prncond === "" ? this.showErrorPopup("", "PRN There should be an error that says", "Error") : null;
          element.Moresp1 = this.addministrationService.medicationAdministrative.EmpResp;
          element.Orgfa = this.addministrationService.medicationAdministrative.OrderingDept,
            element.Orgpf = this.addministrationService.medicationAdministrative.OrderingTo,
            element.Dosdef = element.deftimcycleData && element.deftimcycleData.length ? element.Dosdef : "";
          delete element.Formatdescr;
          delete element.Result_Drug_Name;
          delete element.IsmoDetails;
          delete element.TOEVENTDATA;
          delete element.IsFrequencyDeftim;
          delete element.deftimcycleData;
          delete element.AgentidResult;
          delete element.id;
          element.TOCOMPLEX.forEach(element => {
            delete element.N1zxtr;
            element.Quan = `${element.Quan}`;
            element.Pdur = element.Pdur === null || element.Pdur === '' ? "0" : `${element.Pdur}`;
            element.Seqno = `${element.Seqno}`;
            element.StartD = element.StartD !== null ? `${this.parseDatedata(element.StartD)}${this.parseTimedata(element.StartD)}` : null;
            element.StartT = element.StartT !== null ? this.parseComplexTime(element.StartT) : null;
            element.EndD = element.EndD !== null ? `${this.parseDatedata(element.EndD)}${this.parseTimedata(element.EndD)}` : null;
            element.EndT = element.EndT !== null ? this.parseComplexTime(element.EndT) : null;
            element.Pduru = element.Pduru !== null && this.addministrationService.durationUnitList.find(d => d.Text === element.Pduru) !== undefined && this.addministrationService.durationUnitList.find(d => d.Text === element.Pduru).Unit !== undefined ? this.addministrationService.durationUnitList.find(d => d.Text === element.Pduru).Unit : element.Pduru;
          });
        })
        if (validData && validData.length) {
          postObject['Gpart'] = this.addministrationService.medicationAdministrative.EmpResp,
            postObject['Storn'] = '',
            postObject['TOSTD'] = validData;
          this.subscription = this.ePrescriptionService.postData('EstdordSet', postObject).subscribe((res: any) => {
            this.drugArray.clear();
            this.priortoad = [];
            this.generateDefaultForm();
          },
          (error) => {
            this.showErrorPopup("", error.error.error.message.value, "Error")
          });
        }
      }
    }
  }


  onCancel(){
    this.drugArray.controls = [];
    this.priortoad = [];
    this.addministrationService.isExpanded = true;
    this.addministrationService.isConditionTrue = false;
    this.generateDefaultForm();
    this.priortoad = [];
  }

  parseDatedata(date: any) {
    if (date !== null) {
      return `${new DatePipe('en-US').transform(date, "yyyy-MM-dd")}`;
    }
    return null;
  }

  parseTime(date) {
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
  parseTimedata(date) {
    const newDate = `${new DatePipe('en-US').transform(date, "HH:mm:ss")}`
    if (newDate) {
      const strArr: string[] = newDate.split(':');
      if (
        newDate &&
        newDate.length === 8
      ) {
        return `T${strArr[0]}:${strArr[1]}:${strArr[2]}`;
      }
    }
    return null;
  }

  parseComplexTime(time: string) {
    if (time !== null) {
      const strArr: string[] = time.split('');
      if (
        time &&
        time.length === 8 &&
        !isNaN(+(strArr[0] + strArr[1])) &&
        !isNaN(+(strArr[3] + strArr[4])) &&
        !isNaN(+(strArr[6] + strArr[7]))
      ) {
        return `PT${strArr[0]}${strArr[1]}H${strArr[3]}${strArr[4]}M${strArr[6]}${strArr[7]}S`;
      }
    }
    return null;
  }

  parsePtTime(data: string) {
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
      customClass: { popup: 'myalertpopup' },
      icon: 'error'
    } as any);
  }

  // onChangePom(index: number, event: any) {
  //   this.drugArray.controls[index].patchValue({ Pom: event.target.value })
  // }

  ngOnDestroy(): void {
    if (this.modetailsFormSubscription) { this.modetailsFormSubscription.unsubscribe(); }
    if (this.subscription) { this.subscription.unsubscribe(); }
    if (this.SelectMedicinesubscription) { this.SelectMedicinesubscription.unsubscribe() }
  }

}
