import { AfterContentChecked, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EPrescriptionService, PatientMedicationData, TemplateMedDataList } from '@services/e-Prescription/e-prescription.service';
import swal from 'sweetalert2';
import { AdditionInfoPopupComponent } from '../addition-info-popup/addition-info-popup.component';
import { formatDate } from 'ngx-bootstrap/chronos';
import { Subscription } from 'rxjs';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import { TemplateDescriptionComponent } from './template-description/template-description.component';

@Component({
  selector: 'create-discharge-order',
  templateUrl: './create-discharge-order.component.html',
  styleUrls: ['./create-discharge-order.component.scss']
})
export class CreateDischargeOrderComponent implements OnInit , AfterContentChecked  {
  public MedicationForm: FormGroup;

  public isFormSubmitted: boolean = false;
  public isFormReady: boolean = false;

  public dosageUnitList: any[];
  public frequencyList: any[];
  public durationUnitList: any[];
  public medicationDrugList: any[];
  subscription: Subscription
  public defaultAgentId: string;
  dosageUnitListdata: any;
  constructor(public ePrescriptionService: EPrescriptionService, public route: ActivatedRoute, public addministrationService: AddministrationService, private cdr: ChangeDetectorRef) { }

  @ViewChild('additionalPopup', { static: true }) additionalPopup: AdditionInfoPopupComponent
  @ViewChild('prnPopup', { static: true }) prnPopup: AdditionInfoPopupComponent
  @ViewChild('templateDescription', { static: true }) templateDescription: TemplateDescriptionComponent;

  ngAfterContentChecked() {
    this.cdr.detectChanges();
  }
  ngOnInit() {
    this.loadMedicationDrugList();
    this.loadFrequencylist();
    this.loadDurationUnit();
    this.addministrationService.loadRouteDropdownList()
    this.MedicationForm = new FormGroup({ MedicationData: new FormArray([], Validators.required) })
    for (let i = 1; i <= 5; i++) { this.drugArray.push(this.generateForm()); }
    this.isFormReady = true;
  }

  @Input() set medicationData(data: PatientMedicationData[]) {
    if (data && data.length) {
      this.processMedicationData(data)
    } else {
      return;
    }
  }

  @Input() set templateData(data: TemplateMedDataList[]) {
    if (data && data.length) {
      this.processTemplateData(data)
    } else {
      return;
    }
  }

  get drugArray() {
    return this.MedicationForm.get('MedicationData') as FormArray;
  }

  loadFrequencylist() {
    let filter = this.ePrescriptionService.loadParameters(false, false, false, false, true)
    this.ePrescriptionService.loadData('FrequencySet', filter, false, false, true).subscribe({
      next: (resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results) {
          this.frequencyList = resp.body.d.results;
        }
      }
    });
  }

  loadDurationUnit() {
    this.ePrescriptionService.loadData('DurationUnitSet', null, false, false, true).subscribe({
      next: (resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results) {
          this.durationUnitList = resp.body.d.results;
        }
      },
    });
  }

  loadMedicationDrugList() {
    const filters = this.ePrescriptionService.loadParameters(true, true, false, false)
    filters['Searchtype'] = '';
    const expandEntities = ['TODURG', 'TOTEMPLATE'];
    this.ePrescriptionService.loadData('SearchMSet', filters, expandEntities, true, true).subscribe({
      next: (resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results) {
          this.medicationDrugList = resp.body.d.results[0].TODURG.results
        }
      },
    })
  }

  processMedicationData(data: PatientMedicationData[]) {
    const notTouchedForms = this.drugArray.controls.filter(d => !d.touched);
    let notTouchedFormIndex = 0;
    if (data && data.length) {
      data.forEach((item: PatientMedicationData) => {
        if (notTouchedForms && notTouchedForms.length && notTouchedForms.length > notTouchedFormIndex) {
          notTouchedForms[notTouchedFormIndex].patchValue({
            Agentid: item.Agentid,
            Drugid: item.Drugid,
            N1znr: item.N1znr,
            N1ztxt: item.N1ztxt,
            Result_Drug_Name: item.Descrlt,
            Quan: item.Quan,
            Quanunit: item.Unit,
            Quantunittxt: item.Quantunittxt,
            Formatdescr: item.Formatdescr,
            Routedescr: item.Routedescr,
            Pdur: item.Pdur,
            Pduru: item.Pduru,
            Durunittxt: item.Durunittxt,
            Aprouteid: item.Aprouteid,
            Phformid: item.Phformid,
            Dosdef: item.Dosdef,
            IsPatientMedication: true
          });
          notTouchedForms[notTouchedFormIndex].markAsTouched();
          this.onChangeFrequencySet(item.N1znr, notTouchedFormIndex);
          notTouchedFormIndex = notTouchedFormIndex + 1;
        } else {
          const arrayOfFormControl = this.generateForm();
          arrayOfFormControl.patchValue({
            Agentid: item.Agentid,
            Drugid: item.Drugid,
            N1znr: item.N1znr,
            N1ztxt: item.N1ztxt,
            Result_Drug_Name: item.Descrlt,
            Quan: item.Quan,
            Quanunit: item.Unit,
            Quantunittxt: item.Quantunittxt,
            Formatdescr: item.Formatdescr,
            Routedescr: item.Routedescr,
            Pdur: item.Pdur,
            Pduru: item.Pduru,
            Durunittxt: item.Durunittxt,
            Aprouteid: item.Aprouteid,
            Phformid: item.Phformid,
            Dosdef: item.Dosdef,
            IsPatientMedication: true
          })
          this.drugArray.push(arrayOfFormControl);
          this.onChangeFrequencySet(item.N1znr, notTouchedFormIndex);
        }
      });
    }
  }

  processTemplateData(data) {
    const notTouchedForms = this.drugArray.controls.filter(d => !d.touched);
    let notTouchedFormIndex = 0;
    if (data && data.length) {
      data.forEach((item) => {
        if (notTouchedForms && notTouchedForms.length && notTouchedForms.length > notTouchedFormIndex) {
          notTouchedForms[notTouchedFormIndex].patchValue({
            Agentid: item.Agentid || item.AGENTID,
            Drugid: item.Drugid || item.DRUGID,
            N1znr: item.N1znr || item.N1ZNR,
            N1ztxt: item.N1ztxt || item.N1ZTXT ,
            Result_Drug_Name: item.Result_Drug_Name || item.RESULT_DRUG_NAME,
            Quan: item.Quan || item.QUAN,
            Quanunit: item.Quanunit || item.QUANUNIT,
            Quantunittxt: item.Quantunittxt || item.QUANTUNITTXT,
            Formatdescr: item.Formatdescr || item.FORMATDESCR,
            Routedescr: item.Routedescr || item.ROUTEDESCR,
            Pdur: item.Pdur || item.PDUR,
            Pduru: item.Pduru || item.PDURU,
            Durunittxt: item.Durunittxt || item.DURUNITTXT,
            Aprouteid: item.Aprouteid || item.APROUTEID,
            Phformid: item.Phformid || item.PHFORMID,
            Dosdef: item.Dosdef || item.DOSEDEF,
            Prn: item.Prn || item.PRN,
            Prncond: item.Prncond || item.PRNCOND,
            Descr:item.Descr || item.DESCR,
            IsPatientMedication: true
          });
          notTouchedForms[notTouchedFormIndex].markAsTouched();
          this.onChangeFrequencySet(item.N1znr, notTouchedFormIndex);
          notTouchedFormIndex = notTouchedFormIndex + 1;
        } else {
          const arrayOfFormControl = this.generateForm();
          arrayOfFormControl.patchValue({
            Agentid: item.Agentid || item.AGENTID,
            Drugid: item.Drugid || item.DRUGID,
            N1znr: item.N1znr || item.N1ZNR,
            N1ztxt: item.N1ztxt || item.N1ZTXT ,
            Result_Drug_Name: item.Result_Drug_Name || item.RESULT_DRUG_NAME,
            Quan: item.Quan || item.QUAN,
            Quanunit: item.Quanunit || item.QUANUNIT,
            Quantunittxt: item.Quantunittxt || item.QUANTUNITTXT,
            Formatdescr: item.Formatdescr || item.FORMATDESCR,
            Routedescr: item.Routedescr || item.ROUTEDESCR,
            Pdur: item.Pdur || item.PDUR,
            Pduru: item.Pduru || item.PDURU,
            Durunittxt: item.Durunittxt || item.DURUNITTXT,
            Aprouteid: item.Aprouteid || item.APROUTEID,
            Phformid: item.Phformid || item.PHFORMID,
            Dosdef: item.Dosdef || item.DOSEDEF,
            Prn: item.Prn || item.PRN,
            Prncond: item.Prncond || item.PRNCOND,
            Descr:item.Descr || item.DESCR,
            IsPatientMedication: true
          })
          this.drugArray.push(arrayOfFormControl);
          this.onChangeFrequencySet(item.N1znr, notTouchedFormIndex);
        }
      });
    }
  }


  addRowData() {
    const notTouchedForms = this.drugArray.controls.filter(d => !d.touched);
    if (notTouchedForms && notTouchedForms.length > 4) {
      swal.fire({
        text: 'Enter data before adding new row',
        confirmButtonColor: '#0890c5',
        cancelButtonColor: '#84898c',
        confirmButtonText: 'OK',
        customClass: 'myalertpopup',
        icon: 'error'
      } as any);
    } else {
      this.drugArray.push(this.generateForm());
    }
  }

  deleteRowData(index: any) {
    const TouchedForms = this.drugArray.controls.filter(d => d.touched);
    const unTouchedForms = this.drugArray.controls.filter(d => !d.touched);
    if (TouchedForms && TouchedForms.length) {
      this.showErrorPopup(null, 'Do You Want to Delete this Data?', 'Conform').then(
        (result) => {
          if (result.value) {
            this.drugArray.controls.splice(index, 1);
          }
        });
    } else if (unTouchedForms && unTouchedForms.length < 3) {
      this.showErrorPopup(null, 'Can not Delete', 'Error');
    }
    else {
      this.drugArray.controls.splice(index, 1);
    }
    // else delete row
  }

  onSelectMedicine(event: any) {
    if (event.data) {
      const selectedData = event.medicationDruglist.filter(d => d.Drugid === event.data) || this.medicationDrugList.filter(d => d.Drugid === event.data);
      if (selectedData && selectedData.length) {
        const filter = {
          einri: this.ePrescriptionService.parameters.einri,
          case: this.ePrescriptionService.parameters.falnr,
          movement: this.ePrescriptionService.parameters.lfdnr,
          AgentID: selectedData[0].Agentid,
          DrugID: event.data,
          purpose: '',
        }
        let expandEntities = ['NAVDRUGFORMATS', 'NAVDRUGFORMATROUTES', 'NAVDRUGFORMATROUTEUNITS', 'NAVDRUGUNITS'];
        this.ePrescriptionService.loadData('DrugPropSet', filter, expandEntities, true, true).subscribe({
          next: (resp: any) => {
            if (resp.body && resp.body.d && resp.body.d.results) {
              if (resp.body.d.results[0].NAVDRUGFORMATROUTEUNITS.results && resp.body.d.results[0].NAVDRUGFORMATROUTEUNITS.results.length) {
                this.dosageUnitList = resp.body.d.results[0].NAVDRUGFORMATROUTEUNITS.results;
              }
            }
            this.drugArray.controls[event.index].patchValue({
              Agentid: resp.body.d.results[0].AgentID,
              Drugid: resp.body.d.results[0].DrugID,
              Phformid: resp.body.d.results[0].NAVDRUGFORMATROUTES.results[0].FormID,
              // Aprouteid: resp.body.d.results[0].NAVDRUGFORMATROUTES.results[0].RouteID,
              Result_Drug_Name: selectedData[0].Drugname ,
              Formatdescr: selectedData[0].Formatdescr,
              // Routedescr: selectedData[0].Routedescr,
            });
            this.dosageUnitList = resp.body.d.results[0].NAVDRUGFORMATROUTEUNITS.results
          }
        })
        this.ePrescriptionService.loadData(`e-prescription/DurgUnitlist?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}&Lfdnr=${this.ePrescriptionService.parameters.lfdnr}&Drugid=${event.data}`, false, false, false, false).subscribe((resp: any) => {
          if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
              this.dosageUnitListdata =  resp.body.d.results
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
              });
            }
          }
        });
      }
    }else{
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
        // Quan: Math.floor(selectedDosage.Quant)
      })
    } else {
      this.drugArray.controls[index].patchValue({
        Agentid: this.defaultAgentId
      })
    }
  }


  searchMedicationDrugList() {
    const filters = this.ePrescriptionService.loadParameters(true, true, false, false)
    filters['Searchtype'] = '';
    const expandEntities = ['TODURG', 'TOTEMPLATE'];
    this.ePrescriptionService.loadData('SearchMSet', filters, expandEntities, true, true).subscribe({
      next: (resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results) {
          this.medicationDrugList = resp.body.d.results[0].TODURG.results
        }
      },
    })
  }

  onOpenInfoPopup(data, index: number) {
    this.additionalPopup.showPopup(data.get('Descr').value, index);
  }

  onUpdatedAdditionalInfo(event) {
    this.drugArray.controls[event.index].patchValue({
      Descr: event.data
    })
  }

  onOpenPrnDesc(data: any, index: number, event: any) {
    if (event.target.checked) {
      this.prnPopup.showPopup(data.get('Prncond').value, index)
    }
  }

  onUpdatedPrnCondition(event: any) {
    this.drugArray.controls[event.index].patchValue({
      Prn: event.data !== "" ? true : false,
      Prncond: event.data
    })
  }

  generateForm() {
    return new FormGroup({
      // Qty: new FormControl(''),
      Agentid: new FormControl(''),
      Drugid: new FormControl(''),
      Phformid: new FormControl(''),
      Aprouteid: new FormControl(''),
      Pdur: new FormControl('0', Validators.required),
      Pduru: new FormControl(null, Validators.required),
      Quan: new FormControl('0', Validators.required),
      Quanunit: new FormControl(null, Validators.required),
      N1znr: new FormControl(''),
      Prn: new FormControl(false),
      Prncond: new FormControl(''),
      Moresp1: new FormControl(''),
      Lfdnr: new FormControl(this.ePrescriptionService.parameters.lfdnr),
      Storn: new FormControl(false),
      Stoid: new FormControl(''),
      Descr: new FormControl(''),
      Updmode: new FormControl(false),
      Routedescr: new FormControl(null),
      Formatdescr: new FormControl(null),
      Quantunittxt: new FormControl(''),
      N1ztxt: new FormControl(null, Validators.required),
      Durunittxt: new FormControl(''),
      Result_Drug_Name: new FormControl(null, Validators.required),
      Storntxt: new FormControl(''),
      Resppersname: new FormControl(''),
      Statustext: new FormControl(''),
      BlockChanges: new FormControl(true),
      Canceldby_Name: new FormControl(''),
      Favourite: new FormControl(false),
      IsPatientMedication: new FormControl(false),
      Dosdef: new FormControl(''),
      IsFrequencyDeftim: new FormControl(false),
      deftimcycleData: new FormControl([]),
      AgentidResult: new FormControl([]),
    });
  }

  onOpenFrequencySet(index: number) {
    if (this.drugArray.controls[index].get('deftimcycleData').value && this.drugArray.controls[index].get('deftimcycleData').value.length) {
      this.drugArray.controls[index].patchValue({ IsFrequencyDeftim: true });
    }
  }

  FrequencySetcycle(event, index: number) {
    if (event && event.length) {
      this.drugArray.controls[index].get("deftimcycleData").setValue(event);
      const selectedData = [];
      if (!event.find(d => formatDate(d.deftimTime, "HH:mm") === "08:00")) {
        selectedData.push("0(08:00)")
      }
      event.forEach(element => {
        selectedData.push(`${element.deftimDose}(${formatDate(element.deftimTime, "HH:mm")})`)
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

  onChangeFrequencySet(data?: any, index?: number, eventData?: string) {
    if (data !== null || data !== "") {
      this.drugArray.controls[index].get('deftimcycleData').setValue([]);
      const frequencyData = this.frequencyList.find(d => d.CycleKey == data);
      if (frequencyData && frequencyData.N1id && (frequencyData.N1id == "STAT" || frequencyData.N1id == "ONCE")) {
        this.drugArray.controls[index].patchValue({ Pdur: 1, Pduru: "DOS", Priority: "030" });
      } else if (frequencyData && frequencyData.N1id && (frequencyData.N1id == "DEFTIM" || frequencyData.N1id == "DAILY")) {
        if (eventData && eventData === "change") { this.drugArray.controls[index].get('Dosdef').setValue(null); }
        if (!this.drugArray.value[index].Dosdef) {
          this.drugArray.controls[index].get('deftimcycleData').setValue([{ deftimDose: this.drugArray.value[index].Quan, deftimDosageUnit: this.drugArray.value[index].Quanunit, deftimTime: new Date(`${formatDate(new Date(), "YYYY-MM-DD")}T08:00`) }]);
          const selectedData = [];
          if (!this.drugArray.controls[index].get('deftimcycleData').value.find(d => formatDate(d.deftimTime, "HH:mm") === "08:00")) {
            selectedData.push("0(08:00)")
          }
          this.drugArray.controls[index].get('deftimcycleData').value.forEach(element => {
            selectedData.push(`${element.deftimDose}(${formatDate(element.deftimTime, "HH:mm")})`)
          });
          this.drugArray.controls[index].patchValue({ IsFrequencyDeftim: true, Dosdef: selectedData.join("-") });
        } else if (this.drugArray.value[index].Dosdef) {
          const dosDefSplit = this.drugArray.controls[index].get('Dosdef').value.split("-");
          if (dosDefSplit && dosDefSplit.length) {
            const selectedMedicationData = [];
            this.drugArray.controls[index].get('Dosdef').value.split("-").forEach(element => {
              const getdefDose = element.split("");
              const getdefTime = getdefDose.slice(2, 7).join("");
              selectedMedicationData.push({ deftimDose: getdefDose[0], deftimTime: getdefTime, deftimDosageUnit: this.drugArray.value[index].Quanunit });
            });
            this.drugArray.controls[index].get('deftimcycleData').setValue(selectedMedicationData);
          }
          this.drugArray.controls[index].patchValue({ IsFrequencyDeftim: true });
        }
      } else {
        this.drugArray.controls[index].patchValue({ Priority: "010", IsFrequencyDeftim: false });
      }
    } else {
      this.drugArray.controls[index].patchValue({ Priority: "010", IsFrequencyDeftim: false });
    }
  }


  closeCycle(index: number) {
    this.drugArray.controls[index].patchValue({ IsFrequencyDeftim: false })
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
    } as any);
  }
  onChangeDropdownlist(dropdowntype: any, element: any, index: any) {
    if (dropdowntype === 'Frequency' && element !== undefined) {
      const frequencyFilter = this.frequencyList.filter(d => d.Text === element).map(d => d.CycleKey);
      if (frequencyFilter && frequencyFilter.length) {
        this.drugArray.controls[index].patchValue({
          N1znr: frequencyFilter[0]
        });
      }
    } else {
      this.drugArray.controls[index].patchValue({
        N1znr: ""
      });
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
          const frequencyData = this.frequencyList.find(d => d.CycleKey == element.N1ztxt);
          element.Quan = `${element.Quan}`;
          element.Pdur = `${element.Pdur}`;
          element.Prncond = element.Prn ? element.Prncond : "";
          element.Aprouteid = element.Routedescr.Aprouid !== undefined ? element.Routedescr.Aprouid :element.Aprouteid;
          element.Routedescr = element.Routedescr.Descr !== undefined ? element.Routedescr.Descr :element.Routedescr;
          element.N1ztxt = frequencyData && frequencyData.Text ? frequencyData.Text : element.N1ztxt!="" ? element.N1ztxt :"";
          element.N1znr =  frequencyData && frequencyData.CycleKey ? frequencyData.CycleKey : element.N1znr!=""? element.N1znr:"";
          delete element.IsPatientMedication;
          delete element.AgentidResult;
          delete element.deftimcycleData;
          delete element.IsFrequencyDeftim;
        })
        if (validData && validData.length) {
          postObject['Gpart'] = '',
            postObject['Storn'] = '',
            postObject['TODISCH'] = validData;
          this.ePrescriptionService.postData('EorderSet', postObject).subscribe(
            {
              next: (resp: any) => {
                swal.fire({
                  title: 'Your Order is Created',
                  confirmButtonColor: '#0890c5',
                  cancelButtonColor: '#84898c',
                  confirmButtonText: 'OK',
                  customClass: 'myalertpopup',
                  icon: 'success'
                } as any).then((result) => {
                  if (result.value) {
                    this.drugArray.controls = [];
                    for (let i = 1; i <= 5; i++) { this.drugArray.push(this.generateForm()); }
                  }
                })
              },
              error: (error: any) => {

              }
            }
          )
        }
      }
    }
  }

  onTemplate() {
    let postObject = this.ePrescriptionService.loadParameters(true, true, true, true)
    this.isFormSubmitted = true;
    if (this.drugArray.controls && this.drugArray.controls.length) {
      this.templateDescription.showPopup();
      if (this.subscription) { this.subscription.unsubscribe(); }
      this.subscription = this.templateDescription.onClose.subscribe((resp) => {
        const invalidForms = this.drugArray.controls.filter(d => !d.valid && d.touched);
        const validForms = this.drugArray.controls.filter(d => d.valid);
        if (invalidForms.length === 0 && validForms.length === 0) { this.showErrorPopup('', 'No data to Save', 'Error'); return; }
        if ((!invalidForms || !invalidForms.length) && (validForms && validForms.length)) {
          const validData = validForms.map(d => d.value);
          validData.forEach((element: any) => {
            const frequencyData = this.frequencyList.find(d => d.CycleKey == element.N1ztxt);
            element.Quan = `${element.Quan}`;
            element.Pdur = `${element.Pdur}`;
            element.Aprouteid = element.Routedescr.Aprouid !== undefined ? element.Routedescr.Aprouid :element.Aprouteid;
            element.Routedescr = element.Routedescr.Descr !== undefined ? element.Routedescr.Descr :element.Routedescr;
            element.N1ztxt = frequencyData && frequencyData.Text ? frequencyData.Text : element.N1ztxt!="" ? element.N1ztxt :"";
            element.N1znr =  frequencyData && frequencyData.CycleKey ? frequencyData.CycleKey : element.N1znr!=""? element.N1znr:"";
            element.Prncond = element.Prn ? element.Prncond : "";
            delete element.IsPatientMedication;
            delete element.AgentidResult;
            delete element.deftimcycleData;
            delete element.IsFrequencyDeftim;
          })
          if (validData && validData.length) {
            postObject["TemplateName"] = resp.Name,
              postObject["TemplateDesc"] = resp.Desc,
              postObject['Storn'] = '',
              postObject["Ordtype"] = '2',
              postObject['TOORDERTEMPLATE'] = validData;
            this.ePrescriptionService.postData('e-prescription/OrderTemplate', postObject).subscribe(
              {
                next: (resp: any) => {
                  swal.fire({
                    title: 'Your Template has been Created!',
                    confirmButtonColor: '#0890c5',
                    cancelButtonColor: '#84898c',
                    confirmButtonText: 'OK',
                    customClass: 'myalertpopup',
                    icon: 'success'
                  } as any).then((result) => {
                    if (result.value) {
                      this.drugArray.controls = [];
                      for (let i = 1; i <= 5; i++) { this.drugArray.push(this.generateForm()); }
                    }
                  this.ePrescriptionService.loadTemplateMedicationData()
                  })
                },
                error: (error: any) => {
                  this.showErrorPopup("", error.error.error.message.value, "Error")
                }
              }
            )
          }
        }
      })
    }
  }
}
