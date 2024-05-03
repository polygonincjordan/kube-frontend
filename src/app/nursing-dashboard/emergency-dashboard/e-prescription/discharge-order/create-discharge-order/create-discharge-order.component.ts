import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EPrescriptionService, PatientMedicationData, TemplateMedDataList } from '@services/e-Prescription/e-prescription.service';
import swal from 'sweetalert2';
import { AdditionInfoPopupComponent } from '../addition-info-popup/addition-info-popup.component';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

@Component({
  selector: 'create-discharge-order',
  templateUrl: './create-discharge-order.component.html',
  styleUrls: ['./create-discharge-order.component.scss']
})
export class CreateDischargeOrderComponent implements OnInit {
  public MedicationForm: FormGroup;

  public isFormSubmitted: boolean = false;
  public isFormReady: boolean = false;

  public dosageUnitList: any[];
  public frequencyList: any[];
  public durationUnitList: any[];
  public medicationDrugList: any[];
  searchTypeOnKeyEnter:"";
  modalRef: BsModalRef;
  index: any;
  constructor(public ePrescriptionService: EPrescriptionService, public route: ActivatedRoute,private modalService: BsModalService) { }

  @ViewChild('additionalPopup', { static: true }) additionalPopup: AdditionInfoPopupComponent
  @ViewChild('prnPopup', { static: true }) prnPopup: AdditionInfoPopupComponent


  ngOnInit() {
    this.loadMedicationDrugList();
    this.loadFrequencylist();
    this.loadDurationUnit();

    this.MedicationForm = new FormGroup({ MedicationData: new FormArray([], Validators.required) })
    for (let i = 1; i <= 10; i++) { this.drugArray.push(this.generateForm()); }
    this.isFormReady = true;
    // const el = document.getElementsByTagName('body')as HTMLCollectionOf<HTMLBodyElement>;
    // el[0].style.overflow = 'hidden';
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
            IsPatientMedication: true
          });
          notTouchedForms[notTouchedFormIndex].markAsTouched();
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
            IsPatientMedication: true
          })
          this.drugArray.push(arrayOfFormControl);
        }
      });
    }
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
            N1ztxt: item.N1ZTXT,
            Result_Drug_Name: item.RESULT_DRUG_NAME,
            Quan: item.QUAN,
            Quanunit: item.QUANUNIT,
            Quantunittxt: item.QUANTUNITTXT,
            Formatdescr: item.FORMATDESCR,
            Routedescr: item.ROUTEDESCR,
            Pdur: item.PDUR,
            Pduru: item.PDURU,
            Durunittxt: item.DURUNITTXT,
            Aprouteid: item.APROUTEID,
            Phformid: item.PHFORMID,
            IsPatientMedication: true
          });
          notTouchedForms[notTouchedFormIndex].markAsTouched();
          notTouchedFormIndex = notTouchedFormIndex + 1;
        } else {
          const arrayOfFormControl = this.generateForm();
          arrayOfFormControl.patchValue({
            Agentid: item.AGENTID,
            Drugid: item.DRUGID,
            N1znr: item.N1ZNR,
            N1ztxt: item.N1ZTXT,
            Result_Drug_Name: item.RESULT_DRUG_NAME,
            Quan: item.QUAN,
            Quanunit: item.QUANUNIT,
            Quantunittxt: item.QUANTUNITTXT,
            Formatdescr: item.FORMATDESCR,
            Routedescr: item.ROUTEDESCR,
            Pdur: item.PDUR,
            Pduru: item.PDURU,
            Durunittxt: item.DURUNITTXT,
            Aprouteid: item.APROUTEID,
            Phformid: item.PHFORMID,
            IsPatientMedication: true
          })
          this.drugArray.push(arrayOfFormControl);
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
      });
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
              Aprouteid: resp.body.d.results[0].NAVDRUGFORMATROUTES.results[0].RouteID,
              Result_Drug_Name: selectedData[0].Drugname,
              Formatdescr: selectedData[0].Formatdescr,
              Routedescr: selectedData[0].Routedescr,
            });
            this.dosageUnitList = resp.body.d.results[0].NAVDRUGFORMATROUTEUNITS.results
          },
        })
      }
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
    });
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
          element.Prncond = element.Prn ? element.Prncond : "";
          delete element.IsPatientMedication;
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
                }).then((result) => {
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
  openDrugsList(template: TemplateRef<any>,index){
    const config: ModalOptions = {
      class: 'modal-dialog-centered all-vital',
    };
    this.modalRef = this.modalService.show(template, config);
    this.index = index;
    this.searchTypeOnKeyEnter = "";
    this.someMethod("");
  }
  someMethod(term?: string) {
    if ((term !== null && term.length >= 3)) {
      if (term.length === 3 || term.length > 3) {
        this.searchMedication(term)
      }
    }else if(term.length === 0){
      this.searchMedicationDrugList();
    }  else {
      this.medicationDrugList = this.medicationDrugList;
    }
  }

  searchMedication(term: any) {
    const filters = this.ePrescriptionService.loadParameters(true, true, false, false);
    filters['SearchString'] = term;
    filters['Searchtype'] = 'B';
    const expandEntities = ['TODURG', 'TOTEMPLATE'];
    // this.medicationDrugList = [];
    this.ePrescriptionService.loadData('SearchMSet', filters, expandEntities, true, true).subscribe({
      next: (resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results) {
          this.medicationDrugList = resp.body.d.results[0].TODURG.results;
        }
      }
    });
  }

  broadcastEvent(event,index) {
    this.modalRef.hide();
    this.onSelectMedicine({ data: event.Drugid, index: this.index, medicationDruglist: this.medicationDrugList });
  }
}
