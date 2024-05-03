import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import * as _ from 'lodash';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { OrdersDashboardService } from '@services/orders-dashboard/orders-dashboard.service';
import { Subject, catchError, debounceTime, of } from 'rxjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DiagnosisOrderComponent } from './diagnosis-order/diagnosis-order.component';
import { PhysicianOrderSetComponent } from './physician-order-set/physician-order-set.component';
import { EEmrService } from '@services/e-emr.service';
import { MedicationOrdersComponent } from './medication-orders/medication-orders.component';
import { ClinicalOrdersComponent } from './clinical-orders/clinical-orders.component';
import { SurgeryOrdersComponent } from './surgery-orders/surgery-orders.component';
import { AdmissionOrdersComponent } from './admission-orders/admission-orders.component';
@UntilDestroy()
@Component({
  selector: 'app-order-create-step-three',
  templateUrl: './order-create-step-three.component.html',
  styleUrls: ['./order-create-step-three.component.scss'],
})
export class OrderCreateStepThreeComponent implements OnInit {
  @Input() selectedSubTitleData;
  @Input() assignUsersList;
  @Output() realoadSubTitle = new EventEmitter();
  @ViewChild(PhysicianOrderSetComponent) private physicianChild: PhysicianOrderSetComponent;
  @ViewChild(DiagnosisOrderComponent) private diagnosisChild: DiagnosisOrderComponent;
  @ViewChild(MedicationOrdersComponent) private medicationChild: MedicationOrdersComponent;
  @ViewChild(ClinicalOrdersComponent) private clinicalChild: ClinicalOrdersComponent;
  @ViewChild(SurgeryOrdersComponent) private surgeryChild: SurgeryOrdersComponent;
  @ViewChild(AdmissionOrdersComponent) private admissionChild: AdmissionOrdersComponent;


  public medicationForm: FormGroup;
  medicationListForm: FormArray;
  public dispensingForm: FormGroup;
  dispensingListForm: FormArray;
  diagnosisForm: FormGroup;
  diagnosisFormList: FormArray;
  physicianOrderForm: FormGroup;
  physicianOrderList: FormArray;
  clinicalForm: FormGroup;
  radiologyFormArray: FormArray
  proceduresFormArray: FormArray
  laboratoyFormArray: FormArray

  surgeryForm: FormGroup;
  surgeryListForm: FormArray;

  admissionOrderForm: FormGroup;
  admissionOrderFormArray: FormArray;

  modalRefForMedication: BsModalRef;

  medicationDrugList: any;
  isFormSubmitted = false;
  defaultAgentId: any;
  dosageUnitList: any;

  occupationGroupList: any = [];

  public priorityArray: any = [
    { Desc: 'Regular', Value: '010' },
    { Desc: 'High', Value: '020' },
    { Desc: 'STAT', Value: '030' },
  ];


  activeClinicalOrders: boolean = true;
  activeMedications: boolean = false;
  activeDispensing: boolean = false;
  activePhysicianOrders: boolean = false;
  activeSurgeryOrder: boolean = false;
  activeAdmissionOrder: boolean = false;
  activeDiagnosis: boolean = false;
  subTitleDetails: any;
  selectedOrderIndex: any;

  fieldTouchLab: boolean[] = [];
  fieldTouchRad: boolean[] = [];
  fieldTouchProce: boolean[] = [];
  fieldTouchAdministration: boolean[] = [];
  fieldTouchDispensing: boolean[] = [];
  fieldTouchPhy: boolean[] = [];
  fieldTouchSurgery: boolean[] = [];
  fieldTouchDiagnosis: boolean[] = [];


  public searchTerm = new Subject<string>();
  isFormSubmittedLab: boolean = false;
  isFormSubmittedRad: boolean = false;
  isFormSubmittedProc: boolean = false;
  isFormSubmittedAdmi: boolean = false;
  isFormSubmittedDispe: boolean = false;
  isFormSubmittedPhy: boolean;
  isFormSubmittedSurgery: boolean;

  constructor(
    private formBuilder: FormBuilder,
    public addministrationService: AddministrationService,
    public ePrescriptionService: EPrescriptionService,
    private _ordersDashboardService: OrdersDashboardService,
    public modalService: BsModalService,
    private _dataServices: EEmrService,
  ) {}

  ngOnInit(): void {
    // this.subscribeSearchEvent();
    this.addministrationService.loadDropdownList();
    // this.medicationForm.valueChanges.subscribe(() => { this.isFormSubmitted = true });
    this.occupationalGroupList();
  }
  
  ngOnChanges(changes: SimpleChanges) {
    this.initSurgeryForm();
    this.initFormClinical();
    this.initForm();
    this.medicationDetailsForm();
    this.initFormPhyOrder();
    this.initFormDispensing();
    this.initAdmissionForm();
    this.selectedOrderIndex = undefined;
    this.subTitleDetails = changes.selectedSubTitleData?.currentValue?.subTitle;
   
    if (!this.subTitleDetails) {
      this.clearFormArray(this.surgeryFormArray);
      this.clearFormArray(this.medicationListForm);
      this.clearFormArray(this.diagnosisFormList);
      this.clearFormArray(this.physicianOrderList);
      this.clearFormArray(this.radiologyFormArray);
      this.clearFormArray(this.laboratoyFormArray);
      this.clearFormArray(this.proceduresFormArray);
      this.clearFormArray(this.admissionOrderFormArray);

    } else {
      if(changes.selectedSubTitleData.currentValue?.data?.ToNdia.results) {
        if (this.subTitleDetails) {
          this.diagnosisFormValueBind(changes.selectedSubTitleData.currentValue?.data?.ToNdia.results);
        }
      } else {
        this.clearFormArray(this.diagnosisFormList);
        this.diagnosisFormDetails('');
      }
      if (changes.selectedSubTitleData.currentValue?.data?.ToMedOrd.results) {
        if (this.subTitleDetails) {
          this.medicationFormValueBind(changes.selectedSubTitleData.currentValue?.data?.ToMedOrd.results);
        }
      } else {
        this.clearFormArray(this.medicationListForm);
        this.clearFormArray(this.diagnosisFormList);
        this.generateMedicationFormArray();
        this.defaultDespensingFormCreate()
  
      }
  
      if(changes.selectedSubTitleData.currentValue?.data?.ToPhyOrd.results) {
        this.bindPhyOrder(changes.selectedSubTitleData.currentValue?.data?.ToPhyOrd.results)
      } else {
        this.clearFormArray(this.physicianOrderList);
        this.defaultCreatePhysicianForm();
      }
  
      if(changes.selectedSubTitleData.currentValue?.data?.ToRad.results) {
        this.bindRadiologyData(changes.selectedSubTitleData.currentValue?.data?.ToRad.results)
      } else {
        this.clearFormArray(this.radiologyFormArray);
        this.defaultCreateRadForm();
      }
  
      if(changes.selectedSubTitleData.currentValue?.data?.ToLab.results) {
        this.bindLaboratory(changes.selectedSubTitleData.currentValue?.data?.ToLab.results)
      } else {
        this.clearFormArray(this.laboratoyFormArray);
        this.defaultCreateLabForm();
      }
  
      if(changes.selectedSubTitleData.currentValue?.data?.ToServices.results) {
        this.bindProcedures(changes.selectedSubTitleData.currentValue?.data?.ToServices.results)
      } else {
        this.clearFormArray(this.proceduresFormArray);
        this.defaultCreateServiceForm();
      }
  
      if(changes.selectedSubTitleData.currentValue?.data?.ToSurgy.results) {
        this.surgeryOrderDataBind(changes.selectedSubTitleData.currentValue?.data?.ToSurgy.results)
      } else {
        this.clearFormArray(this.surgeryListForm);
        this.defaultCreateSurgeryRow();
      }

      if(changes.selectedSubTitleData.currentValue?.data?.ToAdm.results.length) {
        this.admissionOrderDataBind(changes.selectedSubTitleData.currentValue?.data?.ToAdm.results)
      } else {
        this.clearFormArray(this.admissionFormArray);
        this.defaultCreateAdmissionRow();
      }
  
    }
  }

// medication form
  medicationDetailsForm() {
    this.medicationForm = this.formBuilder.group({
      medicationListForm: new FormArray([]),
    });
  }

  pushMedicationListInForm(element?) {
    if (this.selectedSubTitleData) {
      this.medicationListForm = this.medicationForm?.get('medicationListForm') as FormArray;
      this.medicationListForm.push(this.addOrderDetailRow(this.subTitleDetails?.Stid, element));
    }
  }

  generateMedicationFormArray() {
    for (let index = 0; index < 3; index++) {
      this.pushMedicationListInForm();
    }
  }

  addOrderDetailRow(stid, element): FormGroup {
    return this.formBuilder.group({
      Id: [this.selectedSubTitleData.data.Id],
      Stid: [stid],
      Seqno: [element?.Seqno ? element?.Seqno : ''],
      Agentid: [element?.Agentid ? element?.Agentid : ''],
      Drugid: [element?.Drugid ? element?.Drugid : ''],
      ResultDrugName: [element?.ResultDrugName ? element?.ResultDrugName : null,Validators.required],
      Formula: [element?.Formula ? element?.Formula : null,Validators.required],
      Route: [element?.Route ? element?.Route : null, Validators.required],
      Dosage: [element?.Dosage ? this.showDecimalThree(element?.Dosage) : ''],
      DosageUnit: [element?.DosageUnit ? element?.DosageUnit : null, Validators.required],
      Frequency: [element?.Frequency ? element?.Frequency : null, Validators.required],
      Duration: [element?.Duration ? this.showDecimalThree(element?.Duration) : ''],
      DurationUnit: [element?.DurationUnit ? element?.DurationUnit : null],
      ValidOn: [element?.ValidOn ? element?.ValidOn : ''],
      ValidTill: [element?.ValidTill ? element?.ValidTill : ''],
      Priority: [element?.Priority ? element?.Priority : '010'],
      Prn: [element?.Prn ? element?.Prn : false],
      Prncond: [element?.Prncond ? element?.Prncond : null],
      Descr: [element?.Descr ? element?.Descr : ''],
      Purpose: [element?.Purpose ? element?.Purpose : '03'],
      Complex: [element?.Complex ? element?.Complex : false],
      Autoselect: [element?.Autoselect ? element?.Autoselect : false],
      Delete: [element?.Delete ? element?.Delete : false],
      FormulaText: [element?.FormulaText ? element?.FormulaText : '', Validators.required],

      AgentidResult: [],
    });
  }

  addMedicationOrderRow() {
    if(this._ordersDashboardService.isActiveMedication) {
      this.pushMedicationListInForm();
    } else {
      this.pushDispensingListInForm()
    }
  }
  
  get getMedicationFormList() {
    return this.medicationForm?.get('medicationListForm') as FormArray;
  }

  medicationFormValueBind(arrayData: any) {
    this.clearFormArray(this.medicationListForm);
    if(arrayData.length) {
      let dispensingValue = arrayData.filter(x => x.Purpose == '01');
      let medicationValue = arrayData.filter(x => x.Purpose == '03');
      medicationValue.forEach((element: any) => {
        if (element.Stid == this.subTitleDetails.Stid) {
          this.pushMedicationListInForm(element);
        }
      });

      dispensingValue.forEach((element: any) => {
        if (element.Stid == this.subTitleDetails.Stid) {
          this.pushDispensingListInForm(element);
        }
      });
      if(dispensingValue.length == 0) {
        this.defaultDespensingFormCreate();
      } 

      if(medicationValue.length == 0) {
        this.generateMedicationFormArray()
      }
    }
    if (this.getMedicationFormList.value.length == 0) {
      this.generateMedicationFormArray();
      this.defaultDespensingFormCreate();
    }
  }

  addFormsRow() {
    if (this.selectedSubTitleData) {
      if (this.activeMedications) {
        this.addMedicationOrderRow();
      } else if (this.activeDiagnosis) {
        this.addItem('');
      } else if(this.activePhysicianOrders) {
        this.addFormInFormArray();
      } else if(this.activeClinicalOrders) {
        this.activeClinical();
      } else if(this.activeSurgeryOrder) {
        this.pushSurgeryInFormArray();
      } else if(this.activeAdmissionOrder) {
        this.pushAdmissionInFormArray();
      }
    }
  }

  activeClinical() {
    if(this._ordersDashboardService.isActiveLaboratory) {
      this.pushLaboratoryForm()
    } else if(this._ordersDashboardService.isActiveRadiology) {
      this.pushRadiologyForm()
    } else {
      this.pushProceduresForm();
    }
  }

  // Dispensing Form
  initFormDispensing() {
    this.dispensingForm = this.formBuilder.group({
      dispensingListForm: new FormArray([]),
    });
  }

  pushDispensingListInForm(element?) {
    this.dispensingListForm = this.dispensingForm?.get('dispensingListForm') as FormArray;
    this.dispensingListForm.push(this.addDispensingRow(this.subTitleDetails?.Stid, element));
  }

  defaultDespensingFormCreate() {
    for (let index = 0; index < 3; index++) {
      this.pushDispensingListInForm();
    }
  }

  addDispensingRow(stid, element): FormGroup {
    return this.formBuilder.group({
      Id: [this.selectedSubTitleData?.data?.Id],
      Stid: [stid],
      Seqno: [element?.Seqno ? element?.Seqno : ''],
      Agentid: [element?.Agentid ? element?.Agentid : ''],
      Drugid: [element?.Drugid ? element?.Drugid : ''],
      ResultDrugName: [element?.ResultDrugName ? element?.ResultDrugName : null, [Validators.required]],
      Formula: [element?.Formula ? element?.Formula : null, [Validators.required]],
      Route: [element?.Route ? element?.Route : null, [Validators.required]],
      Dosage: [element?.Dosage ? this.showDecimalThree(element?.Dosage) : ''],
      DosageUnit: [element?.DosageUnit ? element?.DosageUnit : null, [Validators.required]],
      Frequency: [element?.Frequency ? element?.Frequency : null, [Validators.required]],
      Duration: [element?.Duration ? this.showDecimalThree(element?.Duration) : '', [Validators.required]],
      DurationUnit: [element?.DurationUnit ? element?.DurationUnit : null, [Validators.required]],
      ValidOn: [element?.ValidOn ? element?.ValidOn : ''],
      ValidTill: [element?.ValidTill ? element?.ValidTill : ''],
      Prn: [element?.Prn ? element?.Prn : false],
      Prncond: [element?.Prncond ? element?.Prncond : null],
      Descr: [element?.Descr ? element?.Descr : ''],
      Purpose: [element?.Purpose ? element?.Purpose : '01'],
      Autoselect: [element?.Autoselect ? element?.Autoselect : false],
      Delete: [element?.Delete ? element?.Delete : false],
      FormulaText: [element?.FormulaText ? element?.FormulaText : '', [Validators.required]],
      Complex: [false],
      Priority: [element?.Priority ? element?.Priority : '010'],

      AgentidResult: [],
    });
  }

// Diagnosis Form Details
  initForm() {
    this.diagnosisForm = this.formBuilder.group({
      diagnosisFormList: new FormArray([]),
    });
  }

  diagnosisFormDetails(diagnosisValue) {
    for (let index = 0; index < 3; index++) {
      this.addItem(diagnosisValue);
    }
  }

  addItem(diagnosisValue): void {
    this.diagnosisFormList = this.diagnosisForm?.get('diagnosisFormList') as FormArray;
    this.diagnosisFormList.push(this.creatDiagnosisFormData(diagnosisValue));
  }

  creatDiagnosisFormData(value): FormGroup {
    return this.formBuilder.group({
      Id: [this.selectedSubTitleData?.data?.Id],
      Stid: [this.subTitleDetails?.Stid],
      Seqno: [value.Seqno ? value.Seqno : ''],
      DiagKey1: [value.DiagKey1 ? value.DiagKey1 : '', value.DiagText ? '' : [Validators.required]],
      Dtext1: [value.Dtext1 ? value.Dtext1 : '', value.DiagText ? '' : [Validators.required]],
      DiagText: [value.DiagText ? value.DiagText : '', value.DiagKey1 ? '' : [Validators.required]],
      ShortText: [value.ShortText ? value.ShortText : ''],
      ReferralDia: [value.ReferralDia ? value.ReferralDia : false],
      TreatmentDia: [value.TreatmentDia ? value.TreatmentDia : false],
      AdmissionDia: [value.AdmissionDia ? value.AdmissionDia : false],
      DischargeDia: [value.DischargeDia ? value.DischargeDia : false],
      SurgeryDia: [value.SurgeryDia ? value.SurgeryDia : false],
      PreopDiagInd: [value.PreopDiagInd ? value.PreopDiagInd : false],
      Autoselect: [value?.Autoselect ? value?.Autoselect : false],
      Delete: [value.Delete ? value.Delete : false],
    });
  }

  get diagnosisFormArray(): FormArray {
    return this.diagnosisForm.get('diagnosisFormList') as FormArray;
  }

  diagnosisFormValueBind(diagnosisValue) {
    let controlArray = <FormArray>(this.diagnosisForm.controls['diagnosisFormList']);
    diagnosisValue.forEach((element) => {
      if (this.subTitleDetails.Stid == element.Stid) {
        this.addItem(element);
      }
    });
    if (controlArray.value.length === 0) {
      this.diagnosisFormDetails('');
    }
  }

  // Physician Order Form
  initFormPhyOrder() {
    this.physicianOrderForm = this.formBuilder.group({
      physicianOrderList: new FormArray([]),
    });
  }

  addFormInFormArray(value?) {
    this.physicianOrderList = this.physicianOrderForm.get('physicianOrderList') as FormArray;
    this.physicianOrderList.push(this.createPhysicianFormArray(value));
  }

  createPhysicianFormArray(value): FormGroup {
    return this.formBuilder.group({
      Id: [this.selectedSubTitleData?.data?.Id],
      Stid: [this.selectedSubTitleData?.subTitle?.Stid],
      Seqno: [value?.Seqno ? value?.Seqno : ''],
      ZphysOrder: [value?.ZphysOrder ? value?.ZphysOrder : '', [Validators.required]],
      ProfGroup: [value?.ProfGroup ? value?.ProfGroup : 'NURS'],
      ValidOn: [value?.ValidOn ? value?.ValidOn : '',[Validators.required]],
      ValidTill: [value?.ValidTill ? value?.ValidTill : ''],
      ProfGroupText: [value?.ProfGroupText ? value?.ProfGroupText : ''],
      Autoselect: [value?.Autoselect ? value?.Autoselect : false],
      Delete: [false],
    });
  }

  defaultCreatePhysicianForm() {
    for (let index = 0; index < 6; index++) {
      this.addFormInFormArray();
    }
  }

  get phyOrderListArray(): FormArray {
    return this.physicianOrderForm.get('physicianOrderList') as FormArray;
  }

  bindPhyOrder(value) {
    let controlArray = <FormArray>(this.physicianOrderForm.controls['physicianOrderList']);
    value.forEach((element) => {
      if (this.subTitleDetails.Stid == element.Stid) {
        this.addFormInFormArray(element);
      }
    });
    if (controlArray.value.length === 0) {
      this.defaultCreatePhysicianForm();
    }
  }

  get dispensingListArray(): FormArray {
    return this.dispensingForm.get('dispensingListForm') as FormArray;
  }

// CLinical Orders Set Save
  initFormClinical() {
    this.clinicalForm = this.formBuilder.group({
      radiologyFormArray: new FormArray([]),
      proceduresFormArray: new FormArray([]),
      laboratoyFormArray: new FormArray([]),
    });
  }

  pushRadiologyForm(value?) {
    this.radiologyFormArray = this.clinicalForm.get('radiologyFormArray') as FormArray;
    this.radiologyFormArray.push(this.radiologyFormFields(value));
  }

  radiologyFormFields(value): FormGroup {
    return this.formBuilder.group({
      Id: [this.selectedSubTitleData?.data?.Id],
      Stid: [this.selectedSubTitleData?.subTitle?.Stid],
      Seqno: [value?.Seqno ? value?.Seqno : ''],
      Talst: [value?.Talst ? value?.Talst : ''],
      Trtoe: [value?.Trtoe ? value?.Trtoe : ''],
      Localization: [value?.Localization ? value?.Localization : ''],
      AddInfo: [value?.AddInfo ? value?.AddInfo : ''],
      ValidOn: [value?.ValidOn ? value?.ValidOn : '', [Validators.required]],
      ValidTill: [value?.ValidTill ? value?.ValidTill : ''],
      Autoselect: [value?.Autoselect ? value?.Autoselect : false],
      ServiceText: [value?.ServiceText ? value?.ServiceText : null, [Validators.required]],
      LocalizationText: [value?.LocalizationText ? value?.LocalizationText : ''],
      TrtoeText: [value?.TrtoeText ? value?.TrtoeText : ''],
      Wbgzt: [value?.Wbgzt ? value?.Wbgzt : ''],
      Delete: [value?.Delete ? value?.Delete : false],
    });
  }

  pushLaboratoryForm(value?) {
    this.laboratoyFormArray = this.clinicalForm.get('laboratoyFormArray') as FormArray;
    this.laboratoyFormArray.push(this.laboratoryFormFields(value));
  }

  laboratoryFormFields(value): FormGroup {
    return this.formBuilder.group({
      Id: [this.selectedSubTitleData?.data?.Id],
      Stid: [this.selectedSubTitleData?.subTitle?.Stid],
      Seqno: [value?.Seqno ? value?.Seqno : ''],
      Talst: [value?.Talst ? value?.Talst : ''],
      Trtoe: [value?.Trtoe ? value?.Trtoe : ''],
      Fasting: [value?.Fasting ? value?.Fasting : false],
      Localization: [value?.Localization ? value?.Localization : ''],
      Cycle: [value?.Cycle ? value?.Cycle : false],
      CycleDays: [value?.CycleDays ? value?.CycleDays : ''],
      AddInfo: [value?.AddInfo ? value?.AddInfo : ''],
      ValidOn: [value?.ValidOn ? value?.ValidOn : '', [Validators.required]],
      ValidTill: [value?.ValidTill ? value?.ValidTill : ''],
      Autoselect: [value?.Autoselect ? value?.Autoselect : false],
      ServiceText: [value?.ServiceText ? value?.ServiceText : null, [Validators.required]],
      LocalizationText: [value?.LocalizationText ? value?.LocalizationText : '',],
      TrtoeText: [value?.TrtoeText ? value?.TrtoeText : ''],
      Wbgzt: [value?.Wbgzt ? value?.Wbgzt : ''],
      Delete: [false],
    });
  }

  pushProceduresForm(value?) {
    this.proceduresFormArray = this.clinicalForm.get('proceduresFormArray') as FormArray;
    this.proceduresFormArray.push(this.proceduresFormFields(value));
  }

  proceduresFormFields(value): FormGroup {
    return this.formBuilder.group({
      Id: [this.selectedSubTitleData?.data?.Id],
      Stid: [this.selectedSubTitleData?.subTitle?.Stid],
      Category: [value?.Category ? value?.Category : '03'],
      Subcategory: [value?.Subcategory ? value?.Subcategory : ''],
      Service: [value?.Service ? value?.Service : ''],
      ServiceText: [value?.ServiceText ? value?.ServiceText : '', [Validators.required]],
      CategoryText: [value?.CategoryText ? value?.CategoryText : ''],
      Delete: [false],
      AddInfo: [value?.AddInfo ? value?.AddInfo : ''],
      Autoselect: [value?.Autoselect ? value?.Autoselect : false],
      ValidOn: [value?.ValidOn ? value?.ValidOn : '', [Validators.required]],
      Seqno: [value?.Seqno ? value?.Seqno : '']
    });
  }

  bindRadiologyData(value) {
    let controlArray = <FormArray>(this.clinicalForm.controls['radiologyFormArray']);
    value.forEach((element) => {
      if (this.subTitleDetails.Stid == element.Stid) {
        this.pushRadiologyForm(element);
      }
    });
    if (controlArray.value.length === 0) {
      this.defaultCreateRadForm();
    }
  }

  bindLaboratory(value) {
    let controlArray = <FormArray>(this.clinicalForm.controls['laboratoyFormArray']);
    value.forEach((element) => {
      if (this.subTitleDetails.Stid == element.Stid) {
        this.pushLaboratoryForm(element);
      }
    });
    if (controlArray.value.length === 0) {
      this.defaultCreateLabForm();
    }
  }

  bindProcedures(value) {
    let controlArray = <FormArray>(this.clinicalForm.controls['proceduresFormArray']);
    value.forEach((element) => {
      if (this.subTitleDetails.Stid == element.Stid) {
        this.pushProceduresForm(element);
      }
    });
    if (controlArray.value.length === 0) {
      this.defaultCreateServiceForm();
    }
  }

  defaultCreateRadForm() {
    for (let index = 0; index < 2; index++) {
      this.pushRadiologyForm();
    }
  }
  defaultCreateLabForm() {
    for (let index = 0; index < 2; index++) {
      this.pushLaboratoryForm();
    }
  }
  defaultCreateServiceForm() {
    for (let index = 0; index < 2; index++) {
      this.pushProceduresForm();
    }
  }

  get clinicalFormArray(): FormArray {
    return this.clinicalForm.get('radiologyFormArray') as FormArray;
  }

  // surgery form 
  initSurgeryForm() {
    this.surgeryForm = this.formBuilder.group({
      surgeryListForm: new FormArray([]),
    });
  }

  surgeryOrderDataBind(value) {
    let controlArray = <FormArray>(this.surgeryForm.controls['surgeryListForm']);
    value.forEach((element) => {
      if (this.subTitleDetails.Stid == element.Stid) {
        this.pushSurgeryInFormArray(element);
      }
    });
    if (controlArray.value.length === 0) {
      this.defaultCreateSurgeryRow();
    }
  }

  pushSurgeryInFormArray(value?) {
    this.surgeryListForm = this.surgeryForm.get('surgeryListForm') as FormArray;
    this.surgeryListForm.push(this.surgeryFormFields(value));
  }

  surgeryFormFields(value): FormGroup {
    return this.formBuilder.group({
      Id: [this.selectedSubTitleData?.data?.Id],
      Stid: [this.selectedSubTitleData?.subTitle?.Stid],
      Seqno: [value?.Seqno ? value?.Seqno : ''],
      Talst: [value?.Talst ? value?.Talst : ''],
      Trtoe: [value?.Trtoe ? value?.Trtoe : '', [Validators.required]],
      Orgfa: [value?.Orgfa ? value?.Orgfa : ''],
      Surgeon: [value?.Surgeon ? value?.Surgeon : ''],
      Anerf: [value?.Anerf ? value?.Anerf : false],
      AddInfo: [value?.AddInfo ? value?.AddInfo : ''],
      ValidOn: [value?.ValidOn ? value?.ValidOn : '', [Validators.required]],
      ValidTill: [value?.ValidTill ? value?.ValidTill : ''],
      Autoselect: [value?.Autoselect ? value?.Autoselect : false],
      ServiceText: [value?.ServiceText ? value?.ServiceText : '', [Validators.required]],
      TrtoeText: [value?.TrtoeText ? value?.TrtoeText : ''],
      OrgfaText: [value?.OrgfaText ? value?.OrgfaText : ''],
      SurgeonName: [value?.SurgeonName ? value?.SurgeonName : ''],
      Wbgzt: [value?.Wbgzt ? value?.Wbgzt : '', [Validators.required]],
      Delete: [value?.Delete ? value?.Delete : false],
    });
  }

  defaultCreateSurgeryRow() {
    for (let index = 0; index < 3; index++) {
      this.pushSurgeryInFormArray();      
    }
  }

  get surgeryFormArray(): FormArray {
    return this.surgeryForm.get('surgeryListForm') as FormArray;
  }

  // Admission Order Form
  initAdmissionForm() {
    this.admissionOrderForm = this.formBuilder.group({
      admissionOrderFormArray: new FormArray([]),
    });
  }

  admissionOrderDataBind(value) {
    let controlArray = <FormArray>(this.admissionOrderForm.controls['admissionOrderFormArray']);
    value.forEach((element) => {
      if (this.subTitleDetails.Stid == element.Stid) {
        this.pushAdmissionInFormArray(element);
      }
    });
    if (controlArray.value.length === 0) {
      this.defaultCreateAdmissionRow();
    }
  }

  pushAdmissionInFormArray(value?) {
    this.admissionOrderFormArray = this.admissionOrderForm.get('admissionOrderFormArray') as FormArray;
    this.admissionOrderFormArray.push(this.admissionFormFields(value));
  }

  admissionFormFields(value): FormGroup {
    return this.formBuilder.group({
      Id: [this.selectedSubTitleData?.data?.Id],
      Stid: [this.selectedSubTitleData?.subTitle?.Stid],
      Seqno: [value?.Seqno ? value?.Seqno : ''],
      Trtgp: [value?.Trtgp ? value?.Trtgp : ''],
      Trtoe: [value?.Trtoe ? value?.Trtoe : ''],
      Orgfa: [value?.Orgfa ? value?.Orgfa : ''],
      ValidOn: [value?.ValidOn ? value?.ValidOn : ''],
      ValidTill: [value?.ValidTill ? value?.ValidTill : ''],
      Autoselect: [value?.Autoselect ? value?.Autoselect : false],
      TrtoeText: [value?.TrtoeText ? value?.TrtoeText : ''],
      OrgfaText: [value?.OrgfaText ? value?.OrgfaText : ''],
      TrtgpName: [value?.TrtgpName ? value?.TrtgpName : ''],
      Wbgzt: [value?.Wbgzt ? value?.Wbgzt : ''],
      Delete: [value?.Delete ? value?.Delete : false],
    });
  }

  defaultCreateAdmissionRow() {
    for (let index = 0; index < 3; index++) {
      this.pushAdmissionInFormArray();      
    }
  }

  get admissionFormArray(): FormArray {
    return this.admissionOrderForm.get('admissionOrderFormArray') as FormArray;
  }

  saveStepThreeData() {
    
    this.laboratoyFormArray.controls.forEach((res, index)=>{
      if(res.touched) {
        this.fieldTouchLab[index] = true;
      }
    })

    this.radiologyFormArray.controls.forEach((res, index)=>{
      if(res.touched) {
        this.fieldTouchRad[index] = true;
      }
    })

    this.proceduresFormArray.controls.forEach((res, index)=>{
      if(res.touched) {
        this.fieldTouchProce[index] = true;
      }
    })

    this.medicationListForm.controls.forEach((res, index)=>{
      if(res.touched) {
        this.fieldTouchAdministration[index] = true;
      }
    })

    this.dispensingListForm.controls.forEach((res, index)=>{
      if(res.touched) {
        this.fieldTouchDispensing[index] = true;
      }
    })

    this.physicianOrderList.controls.forEach((res, index)=>{
      if(res.touched) {
        this.fieldTouchPhy[index] = true;
      }
    })

    this.surgeryListForm.controls.forEach((res, index)=>{
      if(res.touched) {
        this.fieldTouchSurgery[index] = true;
      }
    })

    this.dispensingListForm.controls.forEach((res, index)=>{
      if(res.touched) {
        this.fieldTouchDiagnosis[index] = true;
      }
    })

    const inValidMedicationForms = this.getMedicationFormList.controls.filter((d) => !d.valid && d.touched);
    const inValidPhysicianForms = this.phyOrderListArray.controls.filter((d) => !d.valid && d.touched);
    const inValidDiagnosisForms = this.diagnosisFormArray.controls.filter((d) => !d.valid && d.touched);
    const inValidDispensingForms = this.dispensingListArray.controls.filter((d) => !d.valid && d.touched);
    const inValidSurgeryForms = this.surgeryFormArray.controls.filter((d) => !d.valid && d.touched);
    const inValidLabForms = this.laboratoyFormArray.controls.filter((d) => !d.valid && d.touched);
    const inValidRadiologyForms = this.radiologyFormArray.controls.filter((d) => !d.valid && d.touched);
    const inValidProceduresForms = this.proceduresFormArray.controls.filter((d) => !d.valid && d.touched);
    const inValidAdmissionForms = this.admissionOrderFormArray.controls.filter((d) => !d.valid && d.touched);

    if(inValidMedicationForms.length) { this.isFormSubmittedAdmi = true; this._ordersDashboardService.showErrorPopup('', 'Please provide all require data in medication.', 'Error'); return };
    if(inValidDiagnosisForms.length) { this._ordersDashboardService.showErrorPopup('', 'Please provide all require data in diagnosis.', 'Error'); return; }
    if(inValidPhysicianForms.length) { this.isFormSubmittedPhy = true; this._ordersDashboardService.showErrorPopup('', 'Please provide all require data in physician.', 'Error'); return; }
    if(inValidDispensingForms.length) { this.isFormSubmittedDispe = true; this._ordersDashboardService.showErrorPopup('', 'Please provide all require data in dispensing.', 'Error'); return; }
    // if(inValidSurgeryForms.length) { this._ordersDashboardService.showErrorPopup('', 'Please provide all require data in surgery.', 'Error'); return; }
    if(inValidSurgeryForms.length) { this.isFormSubmittedSurgery = true;  this._ordersDashboardService.showErrorPopup('', 'Please provide all require data in surgery.', 'Error'); return; }
    if(inValidLabForms.length) { this.isFormSubmittedLab = true; this._ordersDashboardService.showErrorPopup('', 'Please provide all require data in laboratory.', 'Error'); return; }
    if(inValidRadiologyForms.length) { this.isFormSubmittedRad = true; this._ordersDashboardService.showErrorPopup('', 'Please provide all require data in radiology.', 'Error'); return; }
    if(inValidProceduresForms.length) { this.isFormSubmittedProc = true; this._ordersDashboardService.showErrorPopup('', 'Please provide all require data in procedures.', 'Error'); return; }
    if(inValidAdmissionForms.length) { this._ordersDashboardService.showErrorPopup('', 'Please provide all require data in admission.', 'Error'); return; }

    const validMedicationForms = this.getMedicationFormList.controls.filter((d) => d.valid && d.touched);
    const validDiagnosisForms = this.diagnosisFormArray.controls.filter((d) => d.valid && d.touched);
    const validPhysicianForms = this.phyOrderListArray.controls.filter((d) => d.valid && d.touched);
    const validLaboratoryForms = this.laboratoyFormArray.controls.filter((d) => d.valid && d.touched);
    const validRadiologyForms = this.radiologyFormArray.controls.filter((d) => d.valid && d.touched);
    const validProceduresForms = this.proceduresFormArray.controls.filter((d) => d.valid && d.touched);
    const validDispensingForms = this.dispensingListArray.controls.filter((d) => d.valid && d.touched);
    const validSurgeryForms = this.surgeryFormArray.controls.filter((d) => d.valid && d.touched);
    const validAdmissionForms = this.admissionFormArray.controls.filter((d) => d.valid && d.touched);

    let medicationValue = [];
    let diagnosisValue = [];
    let physicianValue = [];
    let laboratorynValue = [];
    let radiologyValue = [];
    let proceduresValue = [];
    let dispensingValue = [];
    let surgeryValue = [];
    let admissionValue = [];

    if (validMedicationForms.length) {
      validMedicationForms.filter((res: any) => {
        if (res.value.ResultDrugName || res.value.Formula) {
          delete res.value.AgentidResult;
          medicationValue.push(res.value);
        }
      });
    }

    if (validDiagnosisForms.length) {
      validDiagnosisForms.filter((res: any) => {
        if (res.value.DiagKey1 && res.value.Dtext1 || res.value.DiagText) {
          diagnosisValue.push(res.value);
        }
      });
    }

    if (validPhysicianForms.length) {
      validPhysicianForms.filter((res: any) => {
        if (res.value.ZphysOrder) {
          physicianValue.push(res.value);
        }
      });
    }

    if (validLaboratoryForms.length) {
      validLaboratoryForms.filter((res: any) => {
        if (res.value.ServiceText) {
          laboratorynValue.push(res.value);
        }
      });
    }

    if (validRadiologyForms.length) {
      validRadiologyForms.filter((res: any) => {
        if (res.value.ServiceText) {
          radiologyValue.push(res.value);
        }
      });
    }

    if (validProceduresForms.length) {
      validProceduresForms.filter((res: any) => {
        if (res.value.ServiceText) {
          proceduresValue.push(res.value);
        }
      });
    }

    if (validDispensingForms.length) {
      validDispensingForms.filter((res: any) => {
        if (res.value.ResultDrugName || res.value.Formula) {
          delete res.value.AgentidResult;
          dispensingValue.push(res.value);
        }
      });
    }

    if (validAdmissionForms.length) {
      validAdmissionForms.filter((res: any) => {
        if (res.value.Orgfa) {
          admissionValue.push(res.value);
        }
      });
    }

    if(dispensingValue.length) {
      medicationValue = medicationValue.concat(dispensingValue)
    }

    if (validSurgeryForms.length) {
      validSurgeryForms.filter((res: any) => {
        if (res.value.ServiceText) {
          surgeryValue.push(res.value);
        }
      });
    }

    if(validDiagnosisForms.length === 0 && validMedicationForms.length === 0 && validPhysicianForms.length === 0 && validRadiologyForms.length === 0 && validLaboratoryForms.length === 0 && validProceduresForms.length === 0 && validDispensingForms.length === 0 && validSurgeryForms.length === 0 && validAdmissionForms.length === 0) {
      this._ordersDashboardService.showErrorPopup('', 'No change found', 'Error');
      return;
    }

    let payload = {
      Id: this.selectedSubTitleData.data.Id,
      ToMedOrd: {
        results: medicationValue,
      },
      ToNdia: {
        results: diagnosisValue,
      },
      ToPhyOrd: {
        results: physicianValue
      },
      ToLab: {
        results: laboratorynValue
      },
      ToRad: {
        results: radiologyValue
      },
      ToServices: {
        results: proceduresValue
      },
      ToSurgy: {
        results: surgeryValue
      },
      ToAdm: {
        results: admissionValue
      }
    };

    this._ordersDashboardService
      .saveOrderConfigurationData(payload)
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any) => {
        this.realoadSubTitle.emit(data);
        this._ordersDashboardService.showSuccessPopup('', `Your order set details saved successfully`, 'Success');
      });
  }

  occupationalGroupList() {
    this._dataServices.occupationalGroupList().subscribe(
      (_success: any) => {
        this.occupationGroupList = _success.d.results;
      },
      (_error: any) => {}
    );
  }

  activateTabs(tabname) {
    if (tabname == 'ClinicalOrders') {
      this.activeClinicalOrders = true;
      this.activeMedications = false;
      this.activeDispensing = false;
      this.activePhysicianOrders = false;
      this.activeSurgeryOrder = false;
      this.activeAdmissionOrder = false;
      this.activeDiagnosis = false;
    } else if (tabname == 'Medications') {
      this.activeClinicalOrders = false;
      this.activeMedications = true;
      this.activeDispensing = false;
      this.activePhysicianOrders = false;
      this.activeSurgeryOrder = false;
      this.activeAdmissionOrder = false;
      this.activeDiagnosis = false;
    } else if (tabname == 'Dispensing') {
      this.activeClinicalOrders = false;
      this.activeMedications = false;
      this.activeDispensing = true;
      this.activePhysicianOrders = false;
      this.activeSurgeryOrder = false;
      this.activeAdmissionOrder = false;
      this.activeDiagnosis = false;
    } else if (tabname == 'PhysicianOrders') {
      this.activeClinicalOrders = false;
      this.activeMedications = false;
      this.activeDispensing = false;
      this.activePhysicianOrders = true;
      this.activeSurgeryOrder = false;
      this.activeAdmissionOrder = false;
      this.activeDiagnosis = false;
    } else if (tabname == 'SurgeryOrder') {
      this.activeClinicalOrders = false;
      this.activeMedications = false;
      this.activeDispensing = false;
      this.activePhysicianOrders = false;
      this.activeSurgeryOrder = true;
      this.activeAdmissionOrder = false;
      this.activeDiagnosis = false;
    } else if (tabname == 'AdmissionOrder') {
      this.activeClinicalOrders = false;
      this.activeMedications = false;
      this.activeDispensing = false;
      this.activePhysicianOrders = false;
      this.activeSurgeryOrder = false;
      this.activeAdmissionOrder = true;
      this.activeDiagnosis = false;
    } else if (tabname == 'Diagnosis') {
      this.activeClinicalOrders = false;
      this.activeMedications = false;
      this.activeDispensing = false;
      this.activePhysicianOrders = false;
      this.activeSurgeryOrder = false;
      this.activeAdmissionOrder = false;
      this.activeDiagnosis = true;
    }
  }

  removeOrderDetails() {
    if (this.activeMedications) {
      this.medicationChild.removeMedicationDetails();
      if(this._ordersDashboardService.isActiveMedication) this.fieldTouchAdministration = [];
      else this.fieldTouchDispensing = [];
    } else if (this.activeDiagnosis) {
      this.diagnosisChild.removeDiagnosis();
      this.fieldTouchDiagnosis = [];
    } else if(this.activePhysicianOrders) {
      this.physicianChild.removePhysicianModal();
      this.fieldTouchPhy = [];
    } else if(this.activeClinicalOrders) {
      this.clinicalChild.removeClinicalOrders();
      if(this._ordersDashboardService.isActiveLaboratory) this.fieldTouchLab = [];
      if(this._ordersDashboardService.isActiveRadiology) this.fieldTouchRad = [];
      if(this._ordersDashboardService.isActiveProcedures) this.fieldTouchProce = [];
    } else if(this.activeSurgeryOrder) {
      this.surgeryChild.removeSurgeryOrdersModal();
      this.fieldTouchSurgery = [];
    } else if(this.activeAdmissionOrder) {
      this.admissionChild.removeAdmissionOrdersModal();
    }
  }

  showDecimalThree(number) {
    return parseFloat(number).toFixed(3);
  }

  realoadData(event) {
    this.realoadSubTitle.emit(event);
  }

  clearFormArray = (formArray: FormArray) => {
    if (formArray) {
      while (formArray.length !== 0) {
        formArray.removeAt(0);
      }
    }
  };
}
