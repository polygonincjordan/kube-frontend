import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import { EPrescriptionService, TemplateMedDataList } from '@services/e-Prescription/e-prescription.service';
import { formatDate } from 'ngx-bootstrap/chronos';
import { Subscription } from 'rxjs';
import swal from 'sweetalert2';
import { AdditionInfoPopupComponent } from '../../discharge-order/addition-info-popup/addition-info-popup.component';
import { CycleDefinitionPopupComponent } from '../../../../shared-module/cycle-definition/cycle-definition-popup.component';
import { TemplateDescriptionComponent } from './template-description/template-description.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'create-administration',
  templateUrl: './create-administration.component.html',
  styleUrls: ['./create-administration.component.scss'],
  providers: [DatePipe]
})



export class CreateAdministrationComponent implements OnInit, OnDestroy {
  public administrationForm: FormGroup;
  public cycledailyform: FormGroup;
  public isFormSubmitted: boolean = false;
  public dosageUnitList: any[];
  public tabmodetail: string;
  public medicationDruglist: any[];
  public modetailsFormSubscription: Subscription;
  public priorityArray: any = [{ Desc: "Regular", Value: "010" }, { Desc: "High", Value: "020" }, { Desc: "STAT", Value: "030" }];
  public defaultAgentId: string;
  subscription: Subscription


  @ViewChild('additionalPopup', { static: true }) additionalPopup: AdditionInfoPopupComponent;
  @ViewChild('prnPopup', { static: true }) prnPopup: AdditionInfoPopupComponent;
  @ViewChild('templateDescription', { static: true }) templateDescription: TemplateDescriptionComponent;
  @ViewChild('cyclePopup', { static: true }) cyclePopup: CycleDefinitionPopupComponent;

  @Input() set templateData(data: TemplateMedDataList[]) { if (data && data.length) { this.processTemplateData(data) } else { return; } }

  constructor(public opentempmodalservices: NgbModal, public ePrescriptionService: EPrescriptionService, public route: ActivatedRoute, public addministrationService: AddministrationService,private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.addministrationService.loadDropdownList();
    this.administrationForm = new FormGroup({
      AdministrationData: new FormArray([], Validators.required),
    });
    this.generateDefaultForm();
    this.modetailsFormSubscription = this.administrationForm.valueChanges.subscribe(() => { this.isFormSubmitted = true; })
  }

  processTemplateData(data) {
    const notTouchedForms = this.drugArray.controls.filter(d => !d.touched);
    let notTouchedFormIndex = 0;
    if (data && data.length) {
      data.forEach((item) => {
        if (notTouchedForms && notTouchedForms.length && notTouchedForms.length > notTouchedFormIndex) {
          notTouchedForms[notTouchedFormIndex].patchValue({
            Agentid: item.Agentid,
            Drugid: item.Drugid,
            N1znr: item.N1znr,
            Result_Drug_Name: item.Result_Drug_Name,
            Quan: item.Quan === '0.000' ? '0' : item.Quan,
            Quanunit: item.Quanunit,
            Formatdescr: item.Formatdescr,
            Routedescr: item.Routedescr,
            Pdur: parseInt(item.Pdur) === 0 ? "" : `${Math.floor(item.Pdur)}`,
            Pduru: `${item.Pduru}`,
            Aprouteid: item.Aprouteid,
            Phformid: item.Phformid,
            Prncond: item.Prncond,
            Prn: item.Prn,
            Descr: item.Descr,
            Complex: item.Complex,
            TOCOMPLEX: item.TOCOMPLEX && item.TOCOMPLEX.results ? item.TOCOMPLEX.results : (item.TOCOMPLEX || []),
            TOCYCDEF: item.TOCYCDEF && item.TOCYCDEF.results ? item.TOCYCDEF.results : (item.TOCYCDEF || []),
          })
          notTouchedForms[notTouchedFormIndex].markAsTouched();
          this.onChangeFrequencySet(item.N1znr, notTouchedFormIndex)
          this.openMoDetailPanel(notTouchedFormIndex, this.drugArray.controls[notTouchedFormIndex].value, this.drugArray.controls[notTouchedFormIndex].valid, false);
          notTouchedFormIndex = notTouchedFormIndex + 1;
        } else {
          const arrayOfFormControl = this.generateForm();
          arrayOfFormControl.patchValue({
            Agentid: item.Agentid,
            Drugid: item.Drugid,
            N1znr: item.N1znr,
            Result_Drug_Name: item.Result_Drug_Name,
            Quan: item.Quan === '0.000' ? '0' : item.Quan,
            Quanunit: item.Quanunit,
            Formatdescr: item.Formatdescr,
            Routedescr: item.Routedescr,
            Pdur: parseInt(item.Pdur) === 0 ? "" : `${Math.floor(item.Pdur)}`,
            Pduru: `${item.Pduru}`,
            Aprouteid: item.Aprouteid,
            Phformid: item.Phformid,
            Prncond: item.Prncond,
            Prn: item.Prn,
            Descr: item.Descr,
            Complex: item.Complex,
            TOCOMPLEX: item.TOCOMPLEX && item.TOCOMPLEX.results ? item.TOCOMPLEX.results : (item.TOCOMPLEX || []),
            TOCYCDEF: item.TOCYCDEF && item.TOCYCDEF.results ? item.TOCYCDEF.results : (item.TOCYCDEF || []),
          })
          this.drugArray.push(arrayOfFormControl);
          this.onChangeFrequencySet(item.N1znr, this.drugArray.controls.length - 1)
          this.openMoDetailPanel(this.drugArray.controls.length - 1, this.drugArray.controls[this.drugArray.controls.length - 1].value, this.drugArray.controls[this.drugArray.controls.length - 1].valid, false);
        }
      });
    }
  }

  generateForm() {
    return new FormGroup({
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
      StartD: new FormControl(new Date(), Validators.required),
      StartT: new FormControl(''),
      EndD: new FormControl(null),
      EndT: new FormControl(''),
      Orgfa: new FormControl(""),
      Orgpf: new FormControl(""),
      Updmode: new FormControl(false),
      Descr: new FormControl(''),
      AddDose: new FormControl(''),
      Complex: new FormControl(''),
      Pom: new FormControl(''),
      Priority: new FormControl('010', Validators.required),
      Routedescr: new FormControl(null, Validators.required),
      TOCOMPLEX: new FormControl([]),
      TOCYCDEF: new FormControl([]),
      TOEVENTDATA: new FormControl([]),
      Formatdescr: new FormControl(null),
      Result_Drug_Name: new FormControl(null, Validators.required),
      IsmoDetails: new FormControl(false),
      IsFrequencyDeftim: new FormControl(false),
      deftimcycleData: new FormControl([]),
      AgentidResult: new FormControl([])
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
    for (let i = 0; i <= 3; i++) { this.drugArray.push(this.generateForm()); }
  }

  // Default the Frequency/Cycle to STAT once a medicine has been selected on a
  // row, applying the same derived behavior as if the physician picked STAT.
  // Skips rows where a frequency is already chosen or that are complex, so the
  // physician's own selection and complex rows are left intact. The physician
  // can still change the frequency manually afterwards.
  applyStatDefault(control: any) {
    const statFrequency = this.addministrationService.getStatFrequency();
    if (!statFrequency || !control) { return; }
    if (control.get('N1znr').value) { return; }
    if (control.get('Complex').value) { return; }
    control.patchValue({
      N1znr: statFrequency.CycleKey,
      Pdur: 1,
      Pduru: "DOS",
      Priority: "030",
      IsFrequencyDeftim: false
    });
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
    this.ePrescriptionService.loadData(`e-prescription/medicationDetails?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}&Searchtype=${'B'}&SearchString=${''}`, null, false, false, false).subscribe({
      next: (resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results) {
          this.addministrationService.medicationDrugList = resp.body.d.results[0].TODURG.results
        }
      },
    })
  }

  onSelectMedicine(event: any) {
    if (event.data) {
      this.defaultAgentId = event.data.Agentid;
      this.applyStatDefault(this.drugArray.controls[event.index]);
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
          // Agentid: event.data.Agentid,
          Drugid: event.data.Drugid
        });
      });
      this.ePrescriptionService.loadData(`e-prescription/DurgUnitlist?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}&Lfdnr=${this.ePrescriptionService.parameters.lfdnr}&Drugid=${event.data.Drugid}`, false, false, false, false).subscribe((resp: any) => {
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
              Agentid:resp.body.d.results[0].Agentid ? resp.body.d.results[0].Agentid : '',
              AgentidResult: resp.body.d.results,
              Quanunit: resp.body.d.results[0],
              // Quanunit: resp.body.d.results[0]Meinh,
              Quan: resp.body.d.results[0].Quant && parseInt(resp.body.d.results[0].Quant) === Number(resp.body.d.results[0].Quant) ? parseInt(resp.body.d.results[0].Quant) : Number(resp.body.d.results[0].Quant)
            });
          }
        }
      });
    }else{
      // this.drugArray.controls[event.index].patchValue({
      //   Phformid: '',
      //   Aprouteid: '',
      //   Result_Drug_Name: '',
      //   Formatdescr: '',
      //   Routedescr: '',
      //   Agentid: '',
      //   Drugid: '',
      //   Quanunit:'',
      //   Quan:'',
      //   N1znr:'',
      //   Pdur:'',
      //   Pduru:'',
      //   EndD:'',
      // });

      this.removeControl(event.index);
    }
  }
  removeControl(index: number) {
    this.drugArray.controls.splice(index, 1);
    this.cdr.detectChanges();
  }

  onChangeDosageUnit(data: any, event: any, index: number) {
    // const selectedDosage = data.find(d => d.Meinh === event)
    const selectedDosage = data.find(d => d.Agentid === event.Agentid)

    if (selectedDosage !== undefined && selectedDosage.Agentid !== '') {
      this.drugArray.controls[index].patchValue({
        Agentid: selectedDosage.Agentid !== null ? selectedDosage.Agentid : "",
        Quan: Math.floor(selectedDosage.Quant)
      })
    } else {
      this.drugArray.controls[index].patchValue({
        Agentid: ""
        // Agentid: this.defaultAgentId
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
        this.onChangeDosageUnit(data, element, index)
        // this.onChangeDosageUnit(data, element.deftimDosageUnit, index)
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
      if (frequencyData && frequencyData.N1id && (frequencyData.N1id == "STAT" || frequencyData.N1id == "ONCE")) {
        this.drugArray.controls[index].patchValue({ Pdur: 1, Pduru: "DOS", Priority: "030" });
      } else if (frequencyData && frequencyData.N1id && (frequencyData.N1id == "DEFTIM" || frequencyData.N1id == "DAILY")) {
        this.drugArray.controls[index].get('deftimcycleData').setValue([{ deftimDose: this.drugArray.value[0].Quan, deftimDosageUnit: this.drugArray.value[index].Quanunit?.Meinh ? this.drugArray.value[index].Quanunit?.Meinh : this.drugArray.value[index].Quanunit, deftimTime: new Date(`${formatDate(new Date(), "YYYY-MM-DD")}T08:00`), Agentid:this.drugArray.value[index].Agentid }]);
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
      this.drugArray.controls[index].patchValue({ Priority: "010", IsFrequencyDeftim: false });
    }
  }

  onOpenFrequencySet(index: number) {
    if (this.drugArray.controls[index].get('deftimcycleData').value && this.drugArray.controls[index].get('deftimcycleData').value.length) {
      this.drugArray.controls[index].patchValue({ IsFrequencyDeftim: true });
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
        this.drugArray.controls[index].patchValue({ EndD: null });
      }
      if (data.Pduru === "MON" && `${data.Pdur}` !== "0") {
        this.drugArray.controls[index].patchValue({
          EndD: new Date(getFullYear, (getMonth + (+(data.Pdur))), getDate, getHours, getMinutes, getSeconds)
        });
      }
      if (data.Pduru === "TAG" && `${data.Pdur}` !== "0") {
        this.drugArray.controls[index].patchValue({
          EndD: new Date(getFullYear, getMonth, (getDate + (+(data.Pdur))), getHours, getMinutes, getSeconds)
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
      EndD: new Date(data.StartD.setHours(data.StartD.getHours() + (+(data.Pdur) * updatedHour))),
      StartD: new Date(data.StartD.setHours(data.StartD.getHours() - (+(data.Pdur) * updatedHour)))
    });
  }

  onOpenInfoPopup(data: any, index: number) {
    this.additionalPopup.showPopup(data.get('Descr').value, index);
  }

  onOpenCycleDefinition(index: number) {
    const item = this.drugArray.controls[index];
    if (!item.get('N1znr') || !item.get('N1znr').value) {
      this.showErrorPopup('', 'Please select a medication and frequency ', 'Error');
      return;
    }
    const existing = item.get('TOCYCDEF').value || [];
    const n1znr = item.get('N1znr').value;
    const title = item.get('Descr').value || (item.get('N1ztxt') ? item.get('N1ztxt').value : '');
    const startDate = item.get('StartD').value;
    if (existing && existing.length) {
      this.cyclePopup.showPopup({ index, n1znr, title, startDate, records: existing });
      return;
    }
    if (n1znr) {
      // Load the master cycle definition for this frequency key (N1znr) and populate the popup.
      this.ePrescriptionService.loadData(`e-prescription/CycleDefMasterSet?N1znr=${n1znr}`, false, false, false, false).subscribe((res: any) => {
        const records = res && res.body && res.body.d && res.body.d.results ? res.body.d.results : [];
        this.cyclePopup.showPopup({ index, n1znr, title, startDate, records });
      }, () => this.cyclePopup.showPopup({ index, n1znr, title, startDate, records: [] }));
      return;
    }
    this.cyclePopup.showPopup({ index, n1znr, title, startDate, records: [] });
  }

  onCycleSaved(event: { index: number; data: any[] }) {
    this.drugArray.controls[event.index].get('TOCYCDEF').setValue(event.data || []);
    this.drugArray.controls[event.index].markAsTouched();
  }

  /**
   * Normalise the cycle-definition records for the EstdordSet payload: keep only
   * the documented TOCYCDEF fields and re-stamp the order frequency key (N1znr)
   * so it stays in sync if the Frequency was changed after the cycles were set.
   */
  normalizeCycleDef(element: any): any[] {
    const records = element.TOCYCDEF && element.TOCYCDEF.length ? element.TOCYCDEF : [];
    return records.map((r: any, i: number) => ({
      N1znr: element.N1znr,
      N1lfnr: r.N1lfnr || `${i + 1}`.padStart(4, '0'),
      Menge: `${r.Menge}`,
      Begdt: r.Begdt,
      Enddt: r.Enddt,
      Mo: !!r.Mo, Tu: !!r.Tu, We: !!r.We, Th: !!r.Th, Fr: !!r.Fr, Sa: !!r.Sa, Su: !!r.Su,
      IntervalDay: +r.IntervalDay || 1,
      IntervalHour: `${r.IntervalHour || '0'}`,
      N1cwft: !!r.N1cwft,
      TiStart: r.TiStart,
      TiEnd: r.TiEnd
    }));
  }

  onUpdatedAdditionalInfo(event: any) {
    this.drugArray.controls[event.index].patchValue({ Descr: event.data })
  }

  onClickTabChange(index: number, tabdetail: any) {
    if (tabdetail === "MedicationDetails") { this.tabmodetail = tabdetail } else if (tabdetail === "ComplexOrder") { this.tabmodetail = tabdetail } else if (tabdetail === "Events") { this.tabmodetail = tabdetail }
  }

  cancelFormData() {
    this.drugArray.controls = [];
    this.generateDefaultForm()
  }

  updatedComplexData(event: any, index: number) {
    const validForms = event.get('complexRowData').controls.filter(d => d.valid);
    if (validForms && validForms.length) {
      this.drugArray.controls[index].patchValue({
        Pdur: validForms.map(d => d.value).map(d => d.Pdur).reduce((partialSum, a) => +(partialSum) + +(a), 0)
      })
      this.drugArray.controls[index].patchValue({
        StartD: validForms[0].value.StartD,
        EndD: validForms[validForms.length - 1].value.EndD,
        Pduru: validForms[0].value.Pduru !== null ? validForms[0].value.Pduru : null
      })
      this.drugArray.controls[index].get('TOCOMPLEX').setValue(validForms.map(d => d.value));
    }
  }
  serachInput(term: string, item: any) {
    term = term.toLowerCase();
    return (item.Descr.toLowerCase().includes(term) || item.Aprou.toLowerCase().includes(term))
  }
  onSubmitData() {
    let postObject = this.ePrescriptionService.loadParameters(true, true, true, true)
    this.isFormSubmitted = true;
    if (this.drugArray.controls && this.drugArray.controls.length) {
      const invalidForms = this.drugArray.controls.filter(d => !d.valid && d.touched);
      const validForms = this.drugArray.controls.filter(d => d.valid);
      if (invalidForms.length === 0 && validForms.length === 0) { this.showErrorPopup('', 'No data to Save', 'Error'); return; }
      if ((!invalidForms || !invalidForms.length) && (validForms && validForms.length)) {
        const validData = validForms.map(d => d.value);
        validData.forEach((element: any) => {
          element.Quan = `${element.Quan}`;
          element.Pdur = element.Pdur === null || element.Pdur === '' ? "0" : `${element.Pdur}`;
          element.Pduru = element.Pduru !== null ? element.Pduru : "";
          element.Prncond = element.Prn ? element.Prncond : "";
          element.StartT = this.parseTime(element.StartD);
          element.StartD = `${this.parseDatedata(element.StartD)}${this.parseTimedata(element.StartD)}`;
          element.EndT = this.parseTime(element.EndD);
          element.EndD = element.EndD !== null ? `${this.parseDatedata(element.EndD)}${this.parseTimedata(element.EndD)}` : null;
          element.Complex = element.Complex ? "X" : "";
          element.AddDose = element.AddDose ? "X" : "";
          element.Aprouteid = element.Routedescr && element.Routedescr.Aprouid !== undefined ? element.Routedescr.Aprouid : element.Aprouteid;
          element.Routedescr = element.Routedescr && element.Routedescr.Descr !== undefined ? element.Routedescr.Descr : element.Routedescr;
          element.Prn && element.Prncond === "" ? this.showErrorPopup("", "PRN There should be an error that says", "Error") : null;
          element.Moresp1 = this.addministrationService.medicationAdministrative.EmpResp;
          element.Orgfa = this.addministrationService.medicationAdministrative.OrderingDept,
            element.Orgpf = this.addministrationService.medicationAdministrative.OrderingTo,
            element.Dosdef = element.deftimcycleData && element.deftimcycleData.length ? element.Dosdef : "";
            element.Quanunit = element?.Quanunit?.Meinh ? element?.Quanunit?.Meinh : element?.Quanunit;
          delete element.Formatdescr;
          delete element.Result_Drug_Name;
          delete element.IsmoDetails;
          delete element.TOEVENTDATA;
          delete element.IsFrequencyDeftim;
          delete element.deftimcycleData;
          delete element.AgentidResult;
          element.TOCYCDEF = this.normalizeCycleDef(element);
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
          this.ePrescriptionService.postData('EstdordSet', postObject).subscribe((res: any) => {
            swal.fire({
              title: 'Your Order is Created',
              confirmButtonColor: '#0890c5',
              cancelButtonColor: '#84898c',
              confirmButtonText: 'OK',
              customClass: { popup: 'myalertpopup' },
              icon: 'success'
            } as any).then(() => {
              this.drugArray.clear();
              this.generateDefaultForm()
            })
          },
            (error) => {
              this.showErrorPopup("", error.error.error.message.value, "Error")
            }
          )
        }
      }
    }
  }



  onTemplateData() {
    const TouchedForms = this.drugArray.controls.filter(d => d.touched && d.valid);
    if (!TouchedForms || !TouchedForms.length) {
      this.isFormSubmitted = true;
      this.showErrorPopup('', 'Please add at least one complete medication before creating a template.', 'Error');
      return;
    }
    const IncompleteForms = this.drugArray.controls.filter(d => d.touched && !d.valid);
    if (IncompleteForms && IncompleteForms.length) {
      this.isFormSubmitted = true;
      this.showErrorPopup('', 'Please complete all required fields (including Route) for each medication, or remove the incomplete row.', 'Error');
      return;
    }
    if ((this.drugArray.controls && this.drugArray.controls.length) && (TouchedForms && TouchedForms.length)) {
      this.templateDescription.showPopup();
      if (this.subscription) { this.subscription.unsubscribe(); }
      this.subscription = this.templateDescription.onClose.subscribe((resp) => {
        const invalidForms = this.drugArray.controls.filter(d => !d.valid && d.touched);
        const validForms = this.drugArray.controls.filter(d => d.valid);
        if (invalidForms.length === 0 && validForms.length === 0) { this.showErrorPopup('', 'No data to Save', 'Error'); return; }
        if ((!invalidForms || !invalidForms.length) && (validForms && validForms.length)) {
          const validData = validForms.map(d => d.value);
          validData.forEach((element: any) => {
            element.Quan = `${element.Quan}`;
            element.Quanunit = element?.Quanunit?.Meinh ? element?.Quanunit?.Meinh : element?.Quanunit;
            element.Pdur = element.Pdur === null || element.Pdur === '' ? "0" : `${element.Pdur}`;
            element.Pduru = element.Pduru !== null ? element.Pduru : "";
            element.Prncond = element.Prn ? element.Prncond : "";
            element.StartT = this.parseTime(element.StartD);
            element.StartD = `${this.parseDatedata(element.StartD)}${this.parseTimedata(element.StartD)}`;
            // element.StartD = this.sanitizeSAPDateFormat(this.parseDate(element.StartD),element.StartT);
            element.Aprouteid = element.Routedescr && element.Routedescr.Aprouid !== undefined ? element.Routedescr.Aprouid : element.Aprouteid;
            element.Routedescr = element.Routedescr && element.Routedescr.Descr !== undefined ? element.Routedescr.Descr : element.Routedescr;
            element.EndT = this.parseTime(element.EndD);
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
            element.TOCYCDEF = this.normalizeCycleDef(element);
            element.TOCOMPLEX.forEach(element => {
              delete element.N1zxtr;
              element.Quan = `${element.Quan}`;
              element.Quanunit = element?.Quanunit?.Meinh ? element?.Quanunit?.Meinh : element?.Quanunit;
              element.Pdur = element.Pdur === null || element.Pdur === '' ? "0" : `${element.Pdur}`;
              element.Seqno = `${element.Seqno}`;
              element.StartD = element.StartD !== null ? `${this.parseDatedata(element.StartD)}${this.parseTimedata(element.StartD)}` : null;
              element.StartT = element.StartT !== null ? this.parseComplexTime(element.StartT) : null;
              element.EndD = element.EndD !== null ? `${this.parseDatedata(element.EndD)}${this.parseTimedata(element.EndD)}` : null;
              element.EndT = element.EndT !== null ? this.parseComplexTime(element.EndT) : null;
              element.Pduru = element.Pduru !== null && this.addministrationService.durationUnitList.find(d => d.Text === element.Pduru) !== undefined && this.addministrationService.durationUnitList.find(d => d.Text === element.Pduru).Unit !== undefined ? this.addministrationService.durationUnitList.find(d => d.Text === element.Pduru).Unit : element.Pduru;
            });
          });
          let postObject = this.ePrescriptionService.loadParameters(true, true, true, true);
          if (validData && validData.length) {
            postObject["TemplateName"] = resp.Name,
              postObject["TemplateDesc"] = resp.Desc,
              postObject['Storn'] = '',
              postObject["Ordtype"] = '1',
              postObject['TOORDERTEMPLATE'] = validData;
            this.ePrescriptionService.postData('e-prescription/OrderTemplate', postObject).subscribe((res: any) => {
              swal.fire({
                title: 'Your Template has been Created!',
                confirmButtonColor: '#0890c5',
                cancelButtonColor: '#84898c',
                confirmButtonText: 'OK',
                customClass: { popup: 'myalertpopup' },
                icon: 'success'
              } as any).then((result) => {
                this.drugArray.clear();
                this.ePrescriptionService.loadAdministrationTemplateData();
                this.ePrescriptionService.TemplateMedDataList
                this.generateDefaultForm()
              })
            },
              (error) => {
                this.showErrorPopup("", error.error.error.message.value, "Error")
              }
            )
          }
        }
      })
    }
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
  parseDatedata(date: any) {
    if (date !== null) {
      return `${new DatePipe('en-US').transform(date, "yyyy-MM-dd")}`;
    }
    return null;
  }

  parseDate(date: any) {
    if (date !== null) {
      return `${new DatePipe('en-US').transform(date, "yyyy-MM-dd")}T${formatDate(date, "HH:mm:ss")}`;
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

  openMoDetailPanel(index: any, validData: any, isValidForm: boolean, IsMO: boolean) {
    if (isValidForm) {
      this.drugArray.controls[index].patchValue({ IsmoDetails: false });
      const data = Math.floor(validData.Pdur);
      if (((validData.Complex || validData.Complex === "X") && `${data}` !== validData.Pdur) && !IsMO) {
        this.drugArray.controls[index].patchValue({ Complex: false });
        this.showErrorPopup('', 'Sliding dosage: only integral values are valid for field Duration', 'Error')
        return;
      } else if (((validData.Complex || validData.Complex === "X") && validData.Pduru !== 'TAG') && !IsMO) {
        this.drugArray.controls[index].patchValue({ Complex: false });
        this.showErrorPopup('', 'Only Duration unit of Days is allowed for Complex Orders', 'Error')
        return;
      }
      if (((validData.Complex || validData.Complex === "X") && validData.Pduru === 'TAG') && ((validData.Complex || validData.Complex === "X") && data.toString() === validData.Pdur)) {
        this.tabmodetail = "ComplexOrder";
        if (this.drugArray.controls[index].get('TOCOMPLEX').value && !this.drugArray.controls[index].get('TOCOMPLEX').value.length) {
          if (this.addministrationService.frequencyList.find(d => d.CycleKey === validData.N1znr) !== undefined && this.addministrationService.frequencyList.find(d => d.CycleKey === validData.N1znr).N1id === "Q24H") {
            this.ePrescriptionService.loadData(`e-prescription/frequencyQ24Cycle?N1znr=${validData.N1znr}`, false, false, false, false).subscribe((resp: any) => {
              if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
                this.drugArray.controls[index].patchValue({ IsmoDetails: true, IsFrequencyDeftim: false });
                this.drugArray.controls[index].get('deftimcycleData')['controls'] = [];
                const filterDataComplex = [];
                for (let i = 0; i < resp.body.d.results.length; i++) {
                  filterDataComplex.push({
                    Drugid: validData.Drugid,
                    Seqno: "1",
                    Quan: validData.Quan,
                    Quanunit: validData?.Quanunit?.Meinh ? validData?.Quanunit?.Meinh : validData?.Quanunit,
                    // Quanunit: validData.Quanunit,
                    N1znr: validData.N1znr,
                    Pdur: validData.Pdur,
                    Pduru: validData.Pduru !== null ? validData.Pduru : null,
                    StartD: validData.StartD !== null ? new Date(`${formatDate(new Date(validData.StartD), "YYYY-MM-DD")}T${this.parsePtTime(resp.body.d.results[i].N1begzt)}`) : null,
                    StartT: this.parsePtTime(resp.body.d.results[i].N1begzt),
                    EndD: null,
                    EndT: null,
                  });
                }
                this.drugArray.controls[index].get('TOCOMPLEX').setValue(filterDataComplex);
              }
            }
            );
          } else {
            this.ePrescriptionService.loadData(`e-prescription/frequencyCycle?N1znr=${validData.N1znr}`, false, false, false, false).subscribe((resp: any) => {
              if (resp.body && resp.body.d) {
                this.drugArray.controls[index].patchValue({ IsmoDetails: true, IsFrequencyDeftim: false });
                this.drugArray.controls[index].get('deftimcycleData')['controls'] = [];
                this.drugArray.controls[index].get('TOCOMPLEX').setValue([{
                  Drugid: validData.Drugid,
                  Seqno: "1",
                  Quan: validData.Quan,
                  Quanunit: validData?.Quanunit?.Meinh ? validData?.Quanunit?.Meinh : validData?.Quanunit,
                  // Quanunit: validData.Quanunit,
                  N1znr: validData.N1znr,
                  Pdur: validData.Pdur,
                  Pduru: validData.Pduru !== null ? validData.Pduru : null,
                  StartD: validData.StartD !== null ? new Date(`${formatDate(new Date(validData.StartD), "YYYY-MM-DD")}T${this.parsePtTime(resp.body.d.N1begzt)}`) : null,
                  StartT: this.parsePtTime(resp.body.d.N1begzt),
                  EndD: null,
                  EndT: null,
                }])
              }
            }
            );
          }
        } else {
          this.tabmodetail = "ComplexOrder";
          this.drugArray.controls[index].patchValue({ IsmoDetails: true, IsFrequencyDeftim: false });
        }
      } else if ((validData.Complex || validData.Complex !== "") && !IsMO) {
        this.showErrorPopup('', 'Do you want to delete Complex Order?', "Conform").then((result) => {
          if (result.value) {
            this.tabmodetail = "MedicationDetails";
            this.drugArray.controls[index].get('TOCOMPLEX').setValue([]);
            this.drugArray.controls[index].patchValue({ N1znr: null, IsmoDetails: false, Pdur: '' });
          } else {
            this.tabmodetail = "ComplexOrder";
            this.drugArray.controls[index].patchValue({ Complex: true });
          }
        })
      }
      if (IsMO) {
        this.tabmodetail = "MedicationDetails";
      }
      if (this.drugArray.controls[index].get('TOEVENTDATA').value && !this.drugArray.controls[index].get('TOEVENTDATA').value.length) {
        let postObject = this.ePrescriptionService.loadParameters(true, true, true, true);
        validData.Quan = `${validData.Quan}`;
        validData.Pdur = `${validData.Pdur}`;
        validData.Prncond = validData.Prn ? validData.Prncond : "";
        validData.StartT = this.parseTime(validData.StartD);
        validData.StartD = this.parseDate(validData.StartD);
        validData.EndT = this.parseTime(validData.EndD);
        validData.EndD = this.parseDate(validData.EndD);
        validData.Complex = validData.Complex ? "X" : "";
        validData.AddDose = validData.AddDose ? "X" : "";
        validData.Pduru = validData.Pduru !== null ? validData.Pduru : "";
        delete validData.Routedescr;
        delete validData.Formatdescr;
        delete validData.Result_Drug_Name;
        delete validData.IsmoDetails;
        delete validData.TOEVENTDATA;
        delete validData.deftimcycleData;
        delete validData.IsFrequencyDeftim;
        delete validData.AgentidResult;
        if (validData) {
          postObject['TOGETEVENT'] = [validData];
          postObject['TOEVENT'] = [{}]
          this.ePrescriptionService.postData('e-prescription/getEventSetData', postObject).subscribe(
            {
              next: (resp: any) => {
                if (resp.body && resp.body.d && resp.body.d) {
                  if (IsMO) { this.drugArray.controls[index].patchValue({ IsmoDetails: true }) };
                  this.drugArray.controls[index].patchValue({
                    TOEVENTDATA: resp.body.d.TOEVENT.results
                  })
                }
              },
              error: (error: any) => { }
            }
          )
        }
      } else {
        this.drugArray.controls[index].patchValue({ IsmoDetails: true });
      }
      // if (validData.Pduru === 'TAG') {
      //   if (validData.Complex || validData.Complex === "X") {
      //     this.tabmodetail = "ComplexOrder";

      //   } else if ((!validData.Complex || validData.Complex === "") && this.drugArray.controls[index].get('TOCOMPLEX').value && this.drugArray.controls[index].get('TOCOMPLEX').value.length) {
      //
      //   }
      // } else {
      //   this.drugArray.controls[index].patchValue({ Complex: false })
      //   if (!IsMO) {
      //     this.showErrorPopup('', 'Only Duration unit of Days is allowed for Complex Orders', 'Error')
      //   }
      // }
    }
    else if (!isValidForm) {
      this.showErrorPopup('', 'Please fill required field', 'Error').then((result) => {
        if (result.value) {
          this.drugArray.controls[index].patchValue({ Complex: false });
        } else {
          this.drugArray.controls[index].patchValue({ Complex: true });
        }
      });
    }

  }

  closeModetail(index: number) {
    this.drugArray.controls[index].patchValue({ IsmoDetails: false });
  }

  onChangePom(index: number, event: any) {
    this.drugArray.controls[index].patchValue({ Pom: event.target.value })
  }

  ngOnDestroy(): void {
    if (this.modetailsFormSubscription) { this.modetailsFormSubscription.unsubscribe(); }
    if (this.subscription) { this.subscription.unsubscribe(); }
  }
}
