import { DatePipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import { EPrescriptionService, TemplateMedDataList } from '@services/e-Prescription/e-prescription.service';
import { formatDate } from 'ngx-bootstrap/chronos';
import { Subscription } from 'rxjs';
import swal from 'sweetalert2';
import { AdditionInfoPopupComponent } from '../../discharge-order/addition-info-popup/addition-info-popup.component';

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

  @ViewChild('additionalPopup', { static: true }) additionalPopup: AdditionInfoPopupComponent;
  @ViewChild('prnPopup', { static: true }) prnPopup: AdditionInfoPopupComponent;

  @Input() set templateData(data: TemplateMedDataList[]) { if (data && data.length) { this.processTemplateData(data) } else { return; } }

  constructor(public ePrescriptionService: EPrescriptionService, public route: ActivatedRoute, public addministrationService: AddministrationService) { }

  ngOnInit() {
    this.addministrationService.loadDropdownList();
    this.administrationForm = new FormGroup({
      AdministrationData: new FormArray([], Validators.required),
    });
    this.generateDefaultForm();
    this.modetailsFormSubscription = this.administrationForm.valueChanges.subscribe(() => { this.isFormSubmitted = true; })
  }

  processTemplateData(data: TemplateMedDataList[]) {
    const notTouchedForms = this.drugArray.controls.filter(d => !d.touched);
    let notTouchedFormIndex = 0;
    if (data && data.length) {
      data.forEach((item: TemplateMedDataList) => {
        if (notTouchedForms && notTouchedForms.length && notTouchedForms.length > notTouchedFormIndex) {
          notTouchedForms[notTouchedFormIndex].patchValue({
            Agentid: item.AGENTID,
            Drugid: item.DRUGID,
            N1znr: item.N1ZNR,
            Result_Drug_Name: item.RESULT_DRUG_NAME,
            Quan: `${Math.floor(+(item.QUAN))}`,
            Quanunit: item.QUANUNIT,
            Formatdescr: item.FORMATDESCR,
            Routedescr: item.ROUTEDESCR,
            Pdur: `${Math.floor(+(item.PDUR))}`,
            Pduru: item.PDURU,
            Aprouteid: item.APROUTEID,
            Phformid: item.PHFORMID
          });
          notTouchedForms[notTouchedFormIndex].markAsTouched();
          this.onChangeFrequencySet(item.N1ZNR, notTouchedFormIndex)
          notTouchedFormIndex = notTouchedFormIndex + 1;
        } else {
          const arrayOfFormControl = this.generateForm();
          arrayOfFormControl.patchValue({
            Agentid: item.AGENTID,
            Drugid: item.DRUGID,
            N1znr: item.N1ZNR,
            Result_Drug_Name: item.RESULT_DRUG_NAME,
            Quan: `${Math.floor(+(item.QUAN))}`,
            Quanunit: item.QUANUNIT,
            Formatdescr: item.FORMATDESCR,
            Routedescr: item.ROUTEDESCR,
            Pdur: `${Math.floor(+(item.PDUR))}`,
            Pduru: item.PDURU,
            Aprouteid: item.APROUTEID,
            Phformid: item.PHFORMID
          })
          this.drugArray.push(arrayOfFormControl);
          this.onChangeFrequencySet(item.N1ZNR, this.drugArray.controls.length - 1)
        }
      });
    }
  }

  generateForm() {
    return new FormGroup({
      Agentid: new FormControl(''),
      Drugid: new FormControl(''),
      Phformid: new FormControl(null, Validators.required),
      Aprouteid: new FormControl(null, Validators.required),
      Pdur: new FormControl('0'),
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
      Routedescr: new FormControl(null),
      TOCOMPLEX: new FormControl([]),
      TOEVENTDATA: new FormControl([]),
      Formatdescr: new FormControl(null),
      Result_Drug_Name: new FormControl(null, Validators.required),
      IsmoDetails: new FormControl(false),
      IsFrequencyDeftim: new FormControl(false),
      deftimcycleData: new FormControl([]),
      AgentidResult: new FormControl([])
    })
  }

  generateDefaultForm() {
    for (let i = 0; i <= 3; i++) { this.drugArray.push(this.generateForm()); }

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
    this.defaultAgentId = event.data.Agentid;
    if (event.data) {
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
          Aprouteid: resp.body.d.results[0].NAVDRUGFORMATROUTES.results[0].RouteID,
          Result_Drug_Name: event.data.Drugname,
          Formatdescr: event.data.Formatdescr,
          Routedescr: event.data.Routedescr,
          Agentid: event.data.Agentid,
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
              AgentidResult: resp.body.d.results,
              Quanunit: resp.body.d.results[0].Meinh,
              Quan: Math.floor(resp.body.d.results[0].Quant)
            })
          }
        }
      });
    }
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
      const frequencyData = this.addministrationService.frequencyList.find(d => d.CycleKey == data).N1id;
      if (frequencyData !== undefined && (frequencyData == "STAT" || frequencyData == "ONCE")) {
        this.drugArray.controls[index].patchValue({ Pdur: 1, Pduru: "DOS", Priority: "030" });
      } else if (frequencyData !== undefined && (frequencyData == "DEFTIM" || frequencyData == "DAILY")) {
        this.drugArray.controls[index].get('deftimcycleData').setValue([{ deftimDose: this.drugArray.value[0].Quan, deftimDosageUnit: this.drugArray.value[0].Quanunit, deftimTime: new Date(`${formatDate(new Date(), "YYYY-MM-DD")}T08:00`) }]);
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
    if (data.StartD) {
      if (`${data.Pdur}` === "0") {
        this.drugArray.controls[index].patchValue({ EndD: null });
      }
      if (data.Pduru === "MON" && `${data.Pdur}` !== "0") {
        this.drugArray.controls[index].patchValue({
          EndD: new Date(data.StartD.setMonth(data.StartD.getMonth() + +(data.Pdur))),
          StartD: new Date(data.StartD.setMonth(data.StartD.getMonth() - +(data.Pdur)))
        });
      }
      if (data.Pduru === "TAG" && `${data.Pdur}` !== "0") {
        this.drugArray.controls[index].patchValue({
          EndD: new Date(data.StartD.setDate(data.StartD.getDate() + +(data.Pdur))),
          StartD: new Date(data.StartD.setDate(data.StartD.getDate() - +(data.Pdur)))
        });
      }

      if (data.Pduru === "MIN" && `${data.Pdur}` !== "0") {
        this.drugArray.controls[index].patchValue({
          EndD: new Date(data.StartD.setMinutes(data.StartD.getMinutes() + +(data.Pdur))),
          StartD: new Date(data.StartD.setMinutes(data.StartD.getMinutes() - +(data.Pdur)))
        });
      }

      if (data.Pduru === "STD" && `${data.Pdur}` !== "0") {
        this.drugArray.controls[index].patchValue({
          EndD: new Date(data.StartD.setHours(data.StartD.getHours() + +(data.Pdur))),
          StartD: new Date(data.StartD.setHours(data.StartD.getHours() - +(data.Pdur)))
        });
      }

      if (data.Pduru === "S" && `${data.Pdur}` !== "0") {
        this.drugArray.controls[index].patchValue({
          EndD: new Date(data.StartD.setSeconds(data.StartD.getSeconds() + +(data.Pdur))),
          StartD: new Date(data.StartD.setSeconds(data.StartD.getSeconds() - +(data.Pdur)))
        });
      }

      if (data.Pduru === "WCH" && `${data.Pdur}` !== "0") {
        this.drugArray.controls[index].patchValue({
          EndD: new Date(data.StartD.setDate(data.StartD.getDate() + (+(data.Pdur) * 7))),
          StartD: new Date(data.StartD.setDate(data.StartD.getDate() - (+(data.Pdur) * 7)))
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

  onSubmitData() {
    let postObject = this.ePrescriptionService.loadParameters(true, true, true, true)
    this.isFormSubmitted = true;
    if (this.drugArray.controls && this.drugArray.controls.length) {
      const invalidForms = this.drugArray.controls.filter(d => !d.valid && d.touched);
      const validForms = this.drugArray.controls.filter(d => d.valid && d.touched);
      if (invalidForms.length === 0 && validForms.length === 0) { this.showErrorPopup('', 'No data to Save', 'Error'); return; }
      if ((!invalidForms || !invalidForms.length) && (validForms && validForms.length)) {
        const validData = validForms.map(d => d.value);
        validData.forEach((element: any) => {
          element.Quan = `${element.Quan}`;
          element.Pdur = `${element.Pdur}`;
          element.Pduru = element.Pduru !== null ? element.Pduru : "";
          element.Prncond = element.Prn ? element.Prncond : "";
          element.StartT = this.parseTime(element.StartD);
          element.StartD = this.parseDate(element.StartD);
          element.EndT = this.parseTime(element.EndD);
          element.EndD = this.parseDate(element.EndD);
          element.Complex = element.Complex ? "X" : "";
          element.AddDose = element.AddDose ? "X" : "";
          element.Prn && element.Prncond === "" ? this.showErrorPopup("", "PRN There should be an error that says", "Error") : null;
          element.Moresp1 = this.addministrationService.medicationAdministrative.EmpResp;
          element.Orgfa = this.addministrationService.medicationAdministrative.OrderingDept,
            element.Orgpf = this.addministrationService.medicationAdministrative.OrderingTo,
            element.Dosdef = element.deftimcycleData && element.deftimcycleData.length ? element.Dosdef : "";
          delete element.Routedescr;
          delete element.Formatdescr;
          delete element.Result_Drug_Name;
          delete element.IsmoDetails;
          delete element.TOEVENTDATA;
          delete element.IsFrequencyDeftim;
          delete element.deftimcycleData;
          delete element.AgentidResult;
          element.TOCOMPLEX.forEach(element => {
            delete element.N1zxtr;
            element.Quan = `${element.Quan}`;
            element.Pdur = `${element.Pdur}`;
            element.Seqno = `${element.Seqno}`;
            element.StartD = element.StartD !== null ? this.parseDate(element.StartD) : null;
            element.StartT = element.StartT !== null ? this.parseComplexTime(element.StartT) : null;
            element.EndD = element.EndD !== null ? this.parseDate(element.EndD) : null;
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

  parseDate(date: any) {
    if (date !== null) {
      return `${new DatePipe('en-US').transform(date, "yyyy-MM-dd")}T00:00:00`;
    }
    return null;
  }

  parseTime(date) {
    const newDate = `${new DatePipe('en-US').transform(date, "hh:mm:ss")}`
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

  openMoDetailPanel(index?: any, validData?: any, isValidForm?: boolean) {
    if (isValidForm) {
      if (!validData.IsmoDetails) {
        this.drugArray.controls[index].patchValue({ IsmoDetails: true });
        if (validData.Complex || validData.Complex === "X") {
          this.tabmodetail = "ComplexOrder";
        } else {
          this.tabmodetail = "MedicationDetails";
        }
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
                  this.drugArray.controls[index].patchValue({ IsmoDetails: true });
                  this.drugArray.controls[index].patchValue({
                    TOEVENTDATA: resp.body.d.TOEVENT.results
                  })
                }
              },
              error: (error: any) => { }
            }
          )
        }
      }
      if (validData.Complex || validData.Complex === "X") {
        this.tabmodetail = "ComplexOrder";
        if (this.drugArray.controls[index].get('TOCOMPLEX').value && !this.drugArray.controls[index].get('TOCOMPLEX').value.length) {
          if (this.addministrationService.frequencyList.find(d => d.CycleKey === validData.N1znr) !== undefined && this.addministrationService.frequencyList.find(d => d.CycleKey === validData.N1znr).N1id === "Q24H") {
            this.ePrescriptionService.loadData(`e-prescription/frequencyQ24Cycle?N1znr=${validData.N1znr}`, false, false, false, false).subscribe((resp: any) => {
              if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
                this.drugArray.controls[index].patchValue({ IsmoDetails: true, IsFrequencyDeftim: false, });
                this.drugArray.controls[index].get('deftimcycleData')['controls'] = [];
                const filterDataComplex = [];
                for (let i = 0; i < resp.body.d.results.length; i++) {
                  filterDataComplex.push({
                    Drugid: validData.Drugid,
                    Seqno: "1",
                    Quan: validData.Quan,
                    Quanunit: validData.Quanunit,
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
                this.drugArray.controls[index].patchValue({ IsmoDetails: true, IsFrequencyDeftim: false, });
                this.drugArray.controls[index].get('deftimcycleData')['controls'] = [];
                this.drugArray.controls[index].get('TOCOMPLEX').setValue([{
                  Drugid: validData.Drugid,
                  Seqno: "1",
                  Quan: validData.Quan,
                  Quanunit: validData.Quanunit,
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
        }
      } else if ((!validData.Complex || validData.Complex === "") && this.drugArray.controls[index].get('TOCOMPLEX').value && this.drugArray.controls[index].get('TOCOMPLEX').value.length) {
        this.showErrorPopup('', 'Do you want to delete Complex Order?', "Conform").then((result) => {
          if (result.value) {
            this.tabmodetail = "MedicationDetails";
            this.drugArray.controls[index].get('TOCOMPLEX').setValue([]);
            this.drugArray.controls[index].patchValue({ N1znr: null, IsmoDetails: false });
          } else {
            this.tabmodetail = "ComplexOrder";
            this.drugArray.controls[index].patchValue({ Complex: true });
          }
        })
      }
    } else if (!isValidForm) {
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
  }
}
