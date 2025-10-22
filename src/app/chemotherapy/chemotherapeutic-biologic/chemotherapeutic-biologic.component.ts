import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChemotherapyService } from '@services/chemotherapy.service';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import { EPrescriptionService, TemplateMedDataList, TemplateMedDataListget } from '@services/e-Prescription/e-prescription.service';
import { formatDate } from 'ngx-bootstrap/chronos';
import { Subscription } from 'rxjs';
import { TemplateDescriptionComponent } from 'src/app/e-prescription/administration/create-administration/template-description/template-description.component';
import { AdditionInfoPopupComponent } from 'src/app/e-prescription/discharge-order/addition-info-popup/addition-info-popup.component';
import swal from 'sweetalert2';

@Component({
  selector: 'chemotherapeutic-biologic',
  templateUrl: './chemotherapeutic-biologic.component.html',
  styleUrls: ['./chemotherapeutic-biologic.component.scss']
})
export class ChemotherapeuticBiologicComponent implements OnInit {

  Protocalsubscription: Subscription;
  public administrationForm = new FormGroup({
    AdministrationData: new FormArray([], Validators.required),
  });
  public cycledailyform: FormGroup;
  public isFormSubmitted: boolean = false;
  public dosageUnitList: any[];
  public tabmodetail: string;
  public medicationDruglist: any[];
  public modetailsFormSubscription: Subscription;
  public priorityArray: any = [{ Desc: "Regular", Value: "010" }, { Desc: "High", Value: "020" }, { Desc: "STAT", Value: "030" }];
  public defaultAgentId: string;
  subscription: Subscription
  calculateQuan: boolean = false;
  drugArrayData: any;
  datavalue: any;
  calculate: any[] = [];
  isSelect:boolean = false;
  CycleIdvalue:any = [];
  calculatebakaups: any[] = [];
  @Input() Chemotherapeutic: any;
  @Input() PreMedications: any;
  @Input() set startdata(data: any) {
    if (data && data.length) {
      this.datavalue = data[0];
      const formattedDate = this.startDateforment(data[0].StartDate);
      const formattedTime = this.formatTime(data[0].StartTime);
      const dateTimeString = new Date(`${formattedDate}T${formattedTime}`);
      for (let i = 0; i < this.drugArray.length; i++) {
        this.drugArray.controls[i].patchValue({
          StartD: dateTimeString,
        });
        if (this.drugArray.value[i].N1znr) {
          this.onChangeFrequencySet(this.drugArray.value[i].N1znr, i);
        }
      }
      // if (this.drugArray.controls.length >= 0) {
      //   // this.drugArrayData = this.drugArray.controls.filter((d => d.valid));
      //   // if (!this.calculateQuan) {
      //   //   this.calculate = [];
      //   // // this.drugArrayData.forEach((ele, index) => {
      //   // //   // const calculate = this.calculatevalue(ele.value, data[0]);
      //   // //   // this.calculate.push(this.calculatevalue(ele.value, data[0]));
      //   // //   //   this.drugArray.controls[index].patchValue({
      //   // //   //     Quan: `${Math.round(calculate)}`
      //   // //   //   });
      //   // //     this.calculateQuan = true;
      //   // //   });
      //   // }else {
      //   //   this.calculateQuan = false;
      //   // }
      // }
    }
  }

  calculatevalue(ele: any, data: any) {
    if (parseFloat(ele.SpecificDose)) {
      return parseFloat(ele.SpecificDose);
    } else {
      if (ele.Perunit === 'M2') {
        if (parseFloat(data.Bsa) < 2) {
          return parseFloat(data.Bsa) * parseFloat(ele.GenericDose);
        } else {
          return Math.floor(parseFloat(data.Bsa)) * parseFloat(ele.GenericDose);
        }
      }else if(ele.Perunit === 'KG'){
        return parseFloat(data.Weight) * parseFloat(ele.GenericDose);
      }else{
        return parseFloat(ele.GenericDose);
      }
    }
    // if (ele.Perunit === 'M2') {
    //   if (parseFloat(data.Bsa) < 2) {
    //     if (ele.SpecificDose) {
    //       return parseFloat(ele.SpecificDose);
    //     } else {
    //       return parseFloat(data.Bsa) * parseFloat(ele.GenericDose);
    //     }
    //   } else {
    //     if (ele.SpecificDose) {
    //       return parseFloat(ele.SpecificDose);
    //     } else {
    //       return Math.floor(parseFloat(data.Bsa)) * parseFloat(ele.GenericDose);
    //     }
    //   }
    // } else if (ele.Perunit === 'KG') {
    //   if (ele.SpecificDose) {
    //     return parseFloat(ele.SpecificDose);
    //   } else {
    //     return parseFloat(data.Weight) * parseFloat(ele.GenericDose);
    //   }
    // } else {
    //   return parseFloat(ele.GenericDose);
    // }
  }

  calculateDataa(ele: any, data: any): number {
    if (ele.value.Perunit === 'M2') {
      if (parseFloat(data[0].Bsa) < 2) {
        return parseFloat(data[0].Bsa) * parseFloat(ele.value.Quan);
      } else {
        return Math.floor(parseFloat(data[0].Bsa)) * parseFloat(ele.value.Quan);
      }
    } else if (ele.value.Perunit === 'KG') {
      return parseFloat(data[0].Weight) * parseFloat(ele.value.Quan);
    } else {
      return parseFloat(ele.value.Quan);
    }
  }


  @ViewChild('additionalPopup', { static: true }) additionalPopup: AdditionInfoPopupComponent;
  @ViewChild('prnPopup', { static: true }) prnPopup: AdditionInfoPopupComponent;
  @ViewChild('templateDescription', { static: true }) templateDescription: TemplateDescriptionComponent;
  SelectMedicinesubscription: Subscription;
  @Input() set templateData(data: TemplateMedDataList[]) { if (data && data.length) { this.processTemplateData(data) } else { return; } }
  @Output() chemotherapypeutic = new EventEmitter();
  constructor(public opentempmodalservices: NgbModal, public ePrescriptionService: EPrescriptionService, public chemotherapyService: ChemotherapyService, public route: ActivatedRoute, public addministrationService: AddministrationService, private cdr: ChangeDetectorRef) { }
  ngOnInit() {
    this.addministrationService.loadDropdownList();
    // this.generateDefaultForm();
    this.chemotherapyService.ProtocalType.subscribe((resp) => {
      this.isSelect = false;
      this.premeicationssetData(resp);
    });

    this.chemotherapyService.mySubject.subscribe((res) =>{
      this.premeicationssetData(res);
    });

    this.modetailsFormSubscription = this.administrationForm.valueChanges.subscribe(() => {
      this.isFormSubmitted = true;
      this.chemotherapypeutic.emit(this.drugArray);
    });
    this.chemotherapyService.chemotherapyForm.get('percentage').valueChanges.subscribe(() => {
      this.calculateReducedDose();
    });
    const doseReductionOptionControl = this.chemotherapyService.chemotherapyForm.get('doseReductionOption');
    if (doseReductionOptionControl) {
      doseReductionOptionControl.valueChanges.subscribe(() => {
        this.calculateReducedDose();
      });
    }else if (this.chemotherapyService.chemotherapyForm.get('doseReductionOption').value === 'yes') {
      this.chemotherapyService.chemotherapyForm.get('percentage').valueChanges.subscribe(() => {
        this.calculateReducedDose();
      });
    }
  }
  calculateReducedDose() {
    const validForms = this.drugArray.controls.filter(d => d.touched);
    const reductionFactor = parseFloat(this.chemotherapyService.chemotherapyForm.get('percentage').value) / 100;
    validForms.forEach((ele: any, i: number) => {
      if (this.chemotherapyService.chemotherapyForm.get('doseReductionOption').value === 'yes') {
        const calculatedValue = Math.round(parseFloat(this.calculatebakaups[i]) * reductionFactor);
        const reducedValue = Math.round(parseFloat(this.calculatebakaups[i])) - calculatedValue;
        ele.patchValue({
          Quan: `${Math.round(reducedValue)}` === 'NaN' || `${Math.round(reducedValue)}`  === '' ? `${Math.round(this.calculatebakaups[i])}` : `${Math.round(reducedValue)}`,
        });
      } else if (this.chemotherapyService.chemotherapyForm.get('doseReductionOption').value === 'no') {
        ele.patchValue({
          Quan: `${Math.round(this.calculatebakaups[i])}`
        });
      }
    });
  }

  startDateforment(startDate: any) {
    const year = startDate.getFullYear();
    const month = (startDate.getMonth() + 1).toString().padStart(2, '0');
    const day = startDate.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate
  }

  formatTime(startTime) {
    const hours = startTime.getHours().toString().padStart(2, '0');
    const minutes = startTime.getMinutes().toString().padStart(2, '0');
    const seconds = startTime.getSeconds().toString().padStart(2, '0');
    const formattedTime = `${hours}:${minutes}:${seconds}`;
    return formattedTime
  }

  premeicationssetData(resp) {
    if(this.isSelect){
      const notTouchedForms = this.drugArray.controls;
      if (this.Protocalsubscription) { this.Protocalsubscription.unsubscribe(); }
      this.drugArray.reset();
      this.calculatebakaups = [];
      const filterdata =  this.CycleIdvalue.filter(d => d.CycleId === resp);
     filterdata.forEach((item, index) => {
      this.drugArray.push(this.generateForm())
        if (notTouchedForms && notTouchedForms.length && notTouchedForms.length > index) {
          const QUAN = this.calculatevalue(item, this.datavalue)
          this.calculatebakaups.push(QUAN);
          notTouchedForms[index].patchValue({
            Agentid: item.Agentid,
            Drugid: item.Drugid,
            N1znr: item.N1znr,
            Result_Drug_Name: item.Descrlt,
            Quan: `${Math.round(QUAN).toString()}`,
            Quanunit: parseFloat(item.SpecificDose) ? item.SpecificUnit : item.GenericUnit,
            Formatdescr: item.Phdescr,
            Routedescr: item.Apdescr,
            Pdur: parseInt(item.Duration) === 0 ? "" : `${Math.floor(item.Duration)}`,
            Pduru: `${item.DurationUnit}`,
            Aprouteid: item.Aprouteid,
            Phformid: item.Phformid,
            Prncond: item.Prncond,
            Prn: item.Prn,
            Descr: item.Comments,
            StartD: new Date(),
            StartT: this.parsePtTime(item.Uptim),
            EndD: this.sanitizeSAPDateFormat(item.Erdat, item.Ertim),
            EndT: this.parsePtTime(item.Ertim),
            Perunit: item.Perunit,
          });
          const findFormIndex = this.drugArray.controls.findIndex(d => d.value === notTouchedForms[index].value);
          notTouchedForms[index].markAsTouched();
          this.onChangeFrequencySet(item.N1znr, findFormIndex);
        }
      });
    }else{
      this.isSelect = true;
      this.CycleIdvalue = resp.data['TOCHEMO'].results;
      const notTouchedForms = this.drugArray.controls;
      if (this.Protocalsubscription) { this.Protocalsubscription.unsubscribe(); }
      this.drugArray.reset();
      this.calculatebakaups = [];
     const filterdata =  resp.data['TOCHEMO'].results.filter(d => d.CycleId === resp.CycleId);
     filterdata.forEach((item, index) => {
      this.drugArray.push(this.generateForm())
        if (notTouchedForms && notTouchedForms.length && notTouchedForms.length > index) {
          const QUAN = this.calculatevalue(item, this.datavalue)
          this.calculatebakaups.push(QUAN);
          notTouchedForms[index].patchValue({
            Agentid: item.Agentid,
            Drugid: item.Drugid,
            N1znr: item.N1znr,
            Result_Drug_Name: item.Descrlt,
            Quan: `${Math.round(QUAN).toString()}`,
            Quanunit: parseFloat(item.SpecificDose) ? item.SpecificUnit : item.GenericUnit,
            Formatdescr: item.Phdescr,
            Routedescr: item.Apdescr,
            Pdur: parseInt(item.Duration) === 0 ? "" : `${Math.floor(item.Duration)}`,
            Pduru: `${item.DurationUnit}`,
            Aprouteid: item.Aprouteid,
            Phformid: item.Phformid,
            Prncond: item.Prncond,
            Prn: item.Prn,
            Descr: item.Comments,
            StartD: new Date(),
            StartT: this.parsePtTime(item.Uptim),
            EndD: this.sanitizeSAPDateFormat(item.Erdat, item.Ertim),
            EndT: this.parsePtTime(item.Ertim),
            Perunit: item.Perunit,
          });
          const findFormIndex = this.drugArray.controls.findIndex(d => d.value === notTouchedForms[index].value);
          notTouchedForms[index].markAsTouched();
          this.onChangeFrequencySet(item.N1znr, findFormIndex);
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
            TOCOMPLEX: item.TOCOMPLEX.results,
          })
          const findFormIndex = this.drugArray.controls.findIndex(d => d.value === notTouchedForms[notTouchedFormIndex].value);
          notTouchedForms[notTouchedFormIndex].markAsTouched();
          this.onChangeFrequencySet(item.N1znr, findFormIndex)
          this.openMoDetailPanel(findFormIndex, notTouchedForms[notTouchedFormIndex].value, notTouchedForms[notTouchedFormIndex].valid, false);
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
            TOCOMPLEX: item.TOCOMPLEX.results,
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
      Aprouteid: new FormControl(null, Validators.required),
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
      Routedescr: new FormControl(null),
      TOCOMPLEX: new FormControl([]),
      TOEVENTDATA: new FormControl([]),
      Formatdescr: new FormControl(null),
      Result_Drug_Name: new FormControl(null, Validators.required),
      IsmoDetails: new FormControl(false),
      IsFrequencyDeftim: new FormControl(false),
      deftimcycleData: new FormControl([]),
      AgentidResult: new FormControl([]),
      ProtoDesc: new FormControl(''),
      Perunit: new FormControl('')
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
    for (let i = 0; i <= 2; i++) { this.drugArray.push(this.generateForm()); }
  }

  get drugArray() {
    return (this.administrationForm as FormGroup).get('AdministrationData') as FormArray;
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
          Aprouteid: resp.body.d.results[0].NAVDRUGFORMATROUTES.results[0].RouteID,
          Result_Drug_Name: event.data.Drugname,
          Formatdescr: event.data.Formatdescr,
          Routedescr: event.data.Routedescr,
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
      if (frequencyData && frequencyData.N1id && frequencyData.N1id == "STAT" || data == "STAT") {
        this.drugArray.controls[index].patchValue({ Pdur: 1, Pduru: "DOS", Priority: "020" });
      } else if (frequencyData && frequencyData.N1id && frequencyData.N1id == "ONCE" || data == "ONCE") {
        this.drugArray.controls[index].patchValue({ Pdur: 1, Pduru: "DOS", Priority: "010" });
      } else if (frequencyData && frequencyData.N1id && (frequencyData.N1id == "DEFTIM" || frequencyData.N1id == "DAILY")) {
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
      this.drugArray.controls[index].patchValue({ Priority: "010", IsFrequencyDeftim: false, IsmoDetails: false });
    }
  }

  onOpenFrequencySet(index: number) {
    if (this.drugArray.controls[index].get('deftimcycleData').value && this.drugArray.controls[index].get('deftimcycleData').value.length) {
      this.drugArray.controls[index].patchValue({ IsFrequencyDeftim: true, IsmoDetails: false });
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
          // element.StartD = this.sanitizeSAPDateFormat(this.parseDate(element.StartD),element.StartT);
          element.EndT = this.parseTime(element.EndD);
          element.EndD = element.EndD !== null ? `${this.parseDatedata(element.EndD)}${this.parseTimedata(element.EndD)}` : null;
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
            swal.fire({
              title: 'Your Order is Created',
              confirmButtonColor: '#0890c5',
              cancelButtonColor: '#84898c',
              confirmButtonText: 'OK',
              customClass: { popup: 'myalertpopup' },
              icon: 'success'
            } as any).then(() => {
              this.drugArray.clear();
              this.generateDefaultForm();
            })
          },
            (error) => {
              this.showErrorPopup("", error.error.error.message.value, "Error")
            });
        }

      }
    }
  }



  onTemplateData() {
    const TouchedForms = this.drugArray.controls.filter(d => d.touched && d.valid);
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
            element.Pdur = element.Pdur === null || element.Pdur === '' ? "0" : `${element.Pdur}`;
            element.Pduru = element.Pduru !== null ? element.Pduru : "";
            element.Prncond = element.Prn ? element.Prncond : "";
            element.StartT = this.parseTime(element.StartD);
            element.StartD = `${this.parseDatedata(element.StartD)}${this.parseTimedata(element.StartD)}`;
            // element.StartD = this.sanitizeSAPDateFormat(this.parseDate(element.StartD),element.StartT);
            element.EndT = this.parseTime(element.EndD);
            element.EndD = element.EndD !== null ? `${this.parseDatedata(element.EndD)}${this.parseTimedata(element.EndD)}` : null;
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
                this.generateDefaultForm();
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


  parseDate(date: any) {
    if (date !== null) {
      return `${new DatePipe('en-US').transform(date, "yyyy-MM-dd")}T${formatDate(date, "HH:mm:ss")}`;
    }
    return null;
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

  // parseTime(date: Date): string | null {
  //   if (date instanceof Date && !isNaN(date.getTime())) {
  //     const newDate = new DatePipe('en-US').transform(date, 'HH:mm:ss');
  //     if (newDate) {
  //       const strArr: string[] = newDate.split(':');
  //       if (strArr.length === 3) {
  //         return `PT${strArr[0]}H${strArr[1]}M${strArr[2]}S`;
  //       }
  //     }
  //   }
  //   return null;
  // }
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
                this.drugArray.controls[index].patchValue({ IsmoDetails: true, IsFrequencyDeftim: false });
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
        validData.MotypId = '20';
        validData.Type = '3'
        delete validData.Pom
        delete validData.Priority
        delete validData.ProtoDesc
        delete validData.CycleId
        delete validData.Routedescr;
        delete validData.Descr;
        delete validData.Orgfa
        delete validData.Orgpf
        delete validData.ProtoDesc
        delete validData.Protoid
        delete validData.Formatdescr;
        delete validData.Result_Drug_Name;
        delete validData.IsmoDetails;
        delete validData.TOEVENTDATA;
        delete validData.deftimcycleData;
        delete validData.IsFrequencyDeftim;
        delete validData.AgentidResult;
        delete validData.comments;
        if (validData) {
          postObject['TOGETEVENT'] = [validData];
          postObject['TOEVENT'] = [{}]
          this.ePrescriptionService.postData('e-prescription/ChemoEvents', postObject).subscribe(
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
        this.drugArray.controls[index].patchValue({ IsmoDetails: true, IsFrequencyDeftim: false });
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
    if (this.SelectMedicinesubscription) { this.SelectMedicinesubscription.unsubscribe() }
  }

}
