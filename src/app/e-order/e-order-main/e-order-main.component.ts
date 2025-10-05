import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { eOrderService } from '@services/eorder.service';
import { EventService } from '@services/event.service';
import { OrganizationUnitComponent } from '../organization-unit/organization-unit.component';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { EEmrService } from '@services/e-emr.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ActivatedRoute } from '@angular/router';
import { EPrescriptionService, TemplateMedDataList } from '@services/e-Prescription/e-prescription.service';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import swal from 'sweetalert2';
import { formatDate } from 'ngx-bootstrap/chronos';
import { AdditionInfoPopupComponent } from 'src/app/e-prescription/discharge-order/addition-info-popup/addition-info-popup.component';
import { DatePipe } from '@angular/common';
import { Subject, Subscription, catchError, debounceTime, of } from 'rxjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { OrdersDashboardService } from '@services/orders-dashboard/orders-dashboard.service';
import * as _ from 'lodash';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import Swal from 'sweetalert2';

@UntilDestroy()
@Component({
  selector: 'app-e-order-main',
  templateUrl: './e-order-main.component.html',
  styleUrls: ['./e-order-main.component.scss'],
  providers: [DatePipe]

})
export class EOrderMainComponent {
  searchString: string;
  searchMedString: string;
  labOrdersSearchList: any;
  radOrdersSearchList: any;
  procedureSearchList: any;
  eOrders: any;
  historyOrders: any;
  searchFeestring: any;

  showSelected = false;
  selectedData: any;
  medicationform: FormGroup;
  radform: FormGroup;
  labform: FormGroup;
  servicesform: FormGroup;
  phyOrderform: FormGroup;
  diagnosisform: FormGroup;
  surgeryform: FormGroup;
  admissionform: FormGroup;
  dispensingform: FormGroup;

  phyOrderitems: FormArray;
  medicationItems: FormArray;
  radItems: FormArray;
  labItems: FormArray;
  servicesItems: FormArray;
  diagnosisItems: FormArray;
  surgeryItems: FormArray;
  admissionItems: FormArray;
  dispensingItems: FormArray;

  phyOrderitemsArr = [];
  medicationItemsArr = [];
  radItemsArr = [];
  labItemsArr = [];
  servicesItemsArr = [];
  diagnosisItemsArr = [];
  surgeryItemsArr = [];
  admissionItemsArr = [];
  @ViewChild('organizationUnit') organizationUnit: OrganizationUnitComponent;
  occupationalGroupData: any;
  getOrderSetFavDataById: any;
  selectedFavData: any;
  institutionid: any;
  caseid: any;
  physicianOrderList: any[];
  admittedFrom: string;
  admittedTo: string;
  paramsFilter: any = {};
  paramsObj: any = {};
  lfdnr: any;
  navTabBoxActiveValue: string = '02';

  public defaultAgentId: string
  public dosageUnitList: any[];
  public isFormSubmitted: boolean = false;
  public administrationForm: FormGroup;
  public tabmodetail: string;
  public modetailsFormSubscription: Subscription;
  public searchTermTreatmentOU = new Subject<string>();
  public searchTermDepartmentOU = new Subject<string>();
  purposeList: any = [
    {
      id: '00',
      label: ''
    },
    {
      id: '01',
      label: 'Despensing'
    },
    {
      id: '02',
      label: 'Prescription Print'
    },
    {
      id: '03',
      label: 'Administration Event'
    },
  ]

  @ViewChild('additionalPopup', { static: true }) additionalPopup: AdditionInfoPopupComponent;
  dosageUnitListOrderSet: any;
  localizationListOrderSet: any;
  localizationText: any;
  //subtitleActive: boolean=false;
  allSubtitlesSets: any;
  getOrderSetDataBySubtitles = [];
  selectedStid: any;
  modalRef: BsModalRef
  selectedAddInfo: any;
  formDetails: any;
  indexformDetails: any;
  searchOrderSets = "";
  public priorityArray: any = [{ Desc: "Regular", Value: "010" }, { Desc: "High", Value: "020" }, { Desc: "STAT", Value: "030" }];
  selectedArr = [];
  firstIndex: number;
  firstRadIndex: number;
  firstLabIndex: number;
  firstPhyIndex: number;
  firstServiceIndex: number;
  firstSurgeryIndex: number;
  firstAdmissionIndex: number;

  MedAccor = 'collapse';
  RadAccor = 'collapse';
  LabAccor = 'collapse';
  PhyAccor = 'collapse';
  SerAccor = 'collapse';
  DiaAccor = 'collapse';
  SurAccor = 'collapse';
  AdmiAccor = 'collapse';
  treatmentOUList: any;
  departmentOUList: any;
  assignUsersList: any = [];
  radiologyDataList: any = [];
  physicianDataList: any = [];
  medicationDataList: any = [];
  laboratoryDataList: any = [];
  serviceDataList: any = [];
  diagnosisDataList: any = [];
  surgeryDataList: any = [];
  admissionDataList: any = [];
  dispesingDataList: any = [];
  isRadiologyCollapse: boolean = false;
  isLaboratoryCollapse: boolean = false;
  isMedicationCollapse: boolean = false;
  isAdmissionCollapse: boolean = false;
  isPhysicianCollapse: boolean = false;
  isServicesCollapse: boolean = false;
  isDiagnosisCollapse: boolean = false;
  isSurgeryCollapse: boolean = false;
  isDispensingCollapse: boolean = false;
  dispensingItemsArr: any[];
  procedureCategoryList = [
    {
      name: 'Procedure',
      value: '03' 
    },
    {
      name: 'Service',
      value: '04' 
    }
  ]


  constructor(
    public eOrderService: eOrderService,
    private formBuilder: FormBuilder,
    private _dataServices: EEmrService,
    private emergencyService: EmergencyService,
    private route: ActivatedRoute,
    public ePrescriptionService: EPrescriptionService,
    public addministrationService: AddministrationService,
    private modalService: BsModalService,
    private orderDashboardService: OrdersDashboardService
  ) {
    this.eOrderService.isFilterDataPopup.subscribe((data) => {
      this.organizationUnit.showPopup(data);
      this.organizationUnit.onClosetempl.subscribe((item) => {
        const SelectedData = {
          ...data,
          defaultOrgCode: item.OrgfaDefault,
          defaultOrgDescription: item.OrgfaDescr,
          treatingUnitCode: item.Trtoe,
          treatingUnitDescription: item.TrtoeDescr,
        };
        this.eOrderService.onInsertOrder(SelectedData);
      });
    });

    this.medicationform = this.formBuilder.group({
      medicationItems: new FormArray([]),
    });

    this.radform = this.formBuilder.group({
      radItems: new FormArray([]),
    });

    this.labform = this.formBuilder.group({
      labItems: new FormArray([]),
    });

    this.servicesform = this.formBuilder.group({
      servicesItems: new FormArray([]),
    });

    this.phyOrderform = this.formBuilder.group({
      phyOrderitems: new FormArray([]),
    });

    this.diagnosisform = this.formBuilder.group({
      diagnosisItems: new FormArray([]),
    });

    this.surgeryform = this.formBuilder.group({
      surgeryItems: new FormArray([]),
    });

    this.admissionform = this.formBuilder.group({
      admissionItems: new FormArray([]),
    });

    this.dispensingform = this.formBuilder.group({
      dispensingItems: new FormArray([]),
    });

    this.occupationalGroupList();

    this.route.queryParams.subscribe((params) => {
      this.paramsObj.patientId = params.patnr;
      this.paramsObj.caseid = params.falnr;
      this.institutionid = params.einri;
      this.lfdnr = params.lfdnr;
      this.navTabBoxActiveValue = params.activeValue;
      this.caseid = params.falnr;
      if (params.admittedFrom || params.admittedTo || params.wardNo) {
        this.paramsFilter = {
          admittedFrom: params.admittedFrom,
          admittedTo: params.admittedTo,
          wardNo: params.wardNo,
        };
      } else {
        //this.getBetDetails();
      }
    });

    this.getAssignUsersList();
  }

  selectSet(item) {
    this.resetTags();
    this.showSelected = true;
    this.selectedData = item;
    this.getOrderSetDataBySubtitles = [];
    this.subtitlesListByOrderSet(item);
    this.eOrderService.getOrderSetData.forEach((element) => {
      if (element.Id == this.selectedData.Id) {
        element['isSelect'] = true;
      } else {
        element['isSelect'] = false;
      }
    });
    // this.eOrderService.getFavSetData.forEach((element) => {
    //   element['isSelect'] = false;
    // });
    //this.setRecordsForms(item);

  }

  selectFavSet(data) {
    const collapseOneShow = document.getElementById('collapseOne');
    collapseOneShow.classList.add('show');
    const collapseTwoShow = document.getElementById('collapseTwo');
    collapseTwoShow.classList.add('show');
    const collapseThreeShow = document.getElementById('collapseThree');
    collapseThreeShow.classList.add('show');
    const collapseFourShow = document.getElementById('collapseFour');
    collapseFourShow.classList.add('show');
    const collapseFiveShow = document.getElementById('collapseFive');
    collapseFiveShow.classList.add('show');
    const collapseSixShow = document.getElementById('collapseSix');
    collapseSixShow.classList.add('show');
    const collapseSevenShow = document.getElementById('collapseSeven');
    collapseSevenShow.classList.add('show');
    const collapseEightShow = document.getElementById('collapseEight');
    collapseEightShow.classList.add('show');
    const collapseNineShow = document.getElementById('collapseNine');
    collapseNineShow.classList.add('show');
    this.getOrderSetByFavId(data);
    this.selectedFavData = data;
    this.eOrderService.getFavSetData.forEach((element) => {
      if (element.Id == this.selectedFavData.Id) {
        element['isSelect'] = true;
      } else {
        element['isSelect'] = false;
      }
    });
    this.eOrderService.getOrderSetData.forEach((element) => {
      element['isSelect'] = false;
    });
  }
  dosageUnitListForOrderSets(item) {
    this.ePrescriptionService.loadData(`e-prescription/DurgUnitlist?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}&Lfdnr=${this.ePrescriptionService.parameters.lfdnr}&Drugid=${item.Drugid}`, false, false, false, false).subscribe((resp: any) => {
      this.dosageUnitListOrderSet = resp.body.d.results;
    });
  }
  localizationForOrderSets() {
    this.ePrescriptionService.getData(`e-prescription/LocalizationSet`).subscribe((resp: any) => {
      this.localizationListOrderSet = resp.body.d.results;
    });

  }
  subtitlesListByOrderSet(data) {
    this.ePrescriptionService.getData(`e-prescription/OrderSetSubtitleSet?Id='${data.Id}'`).subscribe((resp: any) => {
      this.allSubtitlesSets = resp.body.d.results;
      if(this.allSubtitlesSets.length) {
        this.selectedStid = this.allSubtitlesSets[0].Stid;
        this.allSubtitlesSets.forEach((element, index) => {
          element['isSelect'] = false;
          this.getOrderSetBySubtitles(element, index);
        });
        this.changeSubtitle(this.allSubtitlesSets[0], 0)
      }
    });

  }

  showAccor(type) {
    if(type == 'medication') {
      this.isMedicationCollapse = !this.isMedicationCollapse
    }
    if(type == 'radiology') {
      this.isRadiologyCollapse = !this.isRadiologyCollapse
    }
    if(type == 'laboratory') {
      this.isLaboratoryCollapse = !this.isLaboratoryCollapse
    }
    if(type == 'physician') {
      this.isPhysicianCollapse = !this.isPhysicianCollapse
    }
    if(type == 'services') {
      this.isServicesCollapse = !this.isServicesCollapse
    }
    if(type == 'diagnosis') {
      this.isDiagnosisCollapse = !this.isDiagnosisCollapse
    }
    if(type == 'surgery') {
      this.isSurgeryCollapse = !this.isSurgeryCollapse
    }
    if(type == 'admission') {
      this.isAdmissionCollapse = !this.isAdmissionCollapse
    }
    if(type == 'dispensing') {
      this.isDispensingCollapse = !this.isDispensingCollapse;
    }
    // this.collaspeCondition();
  }
  openAddInfo(template: TemplateRef<any>, data, index) {
    this.modalRef = this.modalService.show(template, {
      id: 1,
      class: 'additional-info-temp modal-lg',
    });
    this.formDetails = data;
    this.indexformDetails = index;
    if (this.formDetails['controls']['medicationItems']) {
      this.selectedAddInfo = this.medicationform.get('medicationItems')['controls'].at(this.indexformDetails).get('Descr').value;
    } else if (this.formDetails['controls']['radItems']) {
      this.selectedAddInfo = this.radform.get('radItems')['controls'].at(this.indexformDetails).get('AddInfo').value;
    } else if (this.formDetails['controls']['labItems']) {
      this.selectedAddInfo = this.labform.get('labItems')['controls'].at(this.indexformDetails).get('AddInfo').value;
    } else if (this.formDetails['controls']['dispensingItems']) {
      this.dispensingform.get('dispensingItems')['controls'].at(this.indexformDetails).get('Descr').setValue(this.selectedAddInfo);
    }
  }

  openAddInfoForDisp(template: TemplateRef<any>, data, index) {
    this.modalRef = this.modalService.show(template, {
      id: 1,
      class: 'additional-info-temp modal-lg',
    });
    this.formDetails = data;
    this.indexformDetails = index;
    if (this.formDetails['controls']['dispensingItems']) {
      this.selectedAddInfo = this.dispensingform.get('dispensingItems')['controls'].at(this.indexformDetails).get('Descr').value;
    } else if (this.formDetails['controls']['radItems']) {
      this.selectedAddInfo = this.radform.get('radItems')['controls'].at(this.indexformDetails).get('AddInfo').value;
    } else if (this.formDetails['controls']['labItems']) {
      this.selectedAddInfo = this.labform.get('labItems')['controls'].at(this.indexformDetails).get('AddInfo').value;
    }
  }
  saveAddinfo() {
    this.modalRef.hide();
    if (this.formDetails['controls']['medicationItems']) {
      this.medicationform.get('medicationItems')['controls'].at(this.indexformDetails).get('Descr').setValue(this.selectedAddInfo);
    }
    else if (this.formDetails['controls']['dispensingItems']) {
      this.dispensingform.get('dispensingItems')['controls'].at(this.indexformDetails).get('Descr').setValue(this.selectedAddInfo);
    }
    else if (this.formDetails['controls']['radItems']) {
      this.radform.get('radItems')['controls'].at(this.indexformDetails).get('AddInfo').setValue(this.selectedAddInfo);
    }
    else if (this.formDetails['controls']['labItems']) {
      this.labform.get('labItems')['controls'].at(this.indexformDetails).get('AddInfo').setValue(this.selectedAddInfo);
    }
  }
  occupationalGroupList() {
    this._dataServices.occupationalGroupList().subscribe(
      (_success: any) => {
        this.occupationalGroupData = _success.d.results;
        // this.phyOrderform1.controls.occupationalGroup.setValue(this.occupationalGroupData[2].Group);
      },
      (_error: any) => { }
    );
  }

  setRecordsForms(data) {
    this.resetTags();

    data.ToPhyOrd.results.forEach((element) => {
      this.addItemForPhyOrder(element);
    });
    data.ToMedOrd.results.forEach((element) => {
      if(element.Purpose == '03') {
        this.addItemForMedication(element);
      }
      if(element.Purpose == '01') {
        this.addItemForDispensing(element);
      }
      this.dosageUnitListForOrderSets(element);
    });
    data.ToRad.results.forEach((element) => {
      this.addItemForRad(element);
    });
    data.ToLab.results.forEach((element) => {
      this.addItemForLab(element);
    });
    data.ToServices.results.forEach((element) => {
      this.addItemForServices(element);
    });
    data.ToNdia.results.forEach((element) => {
      this.addItemForDiagnosis(element);
    });
    data.ToSurgy.results.forEach((element) => {
      this.addItemForSurgery(element);
    });
    data.ToAdm.results.forEach((element) => {
      this.addItemForAdmission(element);
    });
  }

  addItemForPhyOrder(element): void {
    this.phyOrderitems = this.phyOrderform.get('phyOrderitems') as FormArray;
    this.phyOrderitems.push(this.createPhyOrderRecords(element));
  }
  addItemForMedication(element, index?): void {
    this.medicationItems = this.medicationform.get(
      'medicationItems'
    ) as FormArray;
    this.medicationItems.push(this.createMedicationRecords(element));
    this.disableInputsOfMed();
  }

  addItemForDispensing(element, index?): void {
    this.dispensingItems = this.dispensingform.get(
      'dispensingItems'
    ) as FormArray;
    this.dispensingItems.push(this.createDispensingRecords(element));
    console.log(this.dispensingItems, "this.dispensingItems");
    this.disableInputsOfDispensing();
  }
  addItemForSurgery(element, index?): void {
    this.surgeryItems = this.surgeryform.get(
      'surgeryItems'
    ) as FormArray;
    this.surgeryItems.push(this.createSurgeryRecords(element));
    
    // this.disableInputsOfMed();
  }
  addItemForAdmission(element, index?): void {
    this.admissionItems = this.admissionform.get(
      'admissionItems'
    ) as FormArray;
    this.admissionItems.push(this.createAdmissionRecords(element));
  }
  addItemForRad(element): void {
    this.radItems = this.radform.get('radItems') as FormArray;
    this.radItems.push(this.createRadRecords(element));
    //this.disableInputsOfRad();
  }
  addItemForLab(element): void {
    this.labItems = this.labform.get('labItems') as FormArray;
    this.labItems.push(this.createLabRecords(element));
    //this.disableInputsOfLab();
  }
  addItemForServices(element): void {
    this.servicesItems = this.servicesform.get('servicesItems') as FormArray;
    this.servicesItems.push(this.createServicesRecords(element));
  }
  addItemForDiagnosis(element): void {
    this.diagnosisItems = this.diagnosisform.get('diagnosisItems') as FormArray;
    this.diagnosisItems.push(this.createDiagnosisRecords(element));
  }
  disableInputsOfMed() {
    (<FormArray>this.medicationform.get('medicationItems'))
      .controls
      .forEach((control, index) => {
        control['controls']['Drugname'].disable();
        control['controls']['Prn'] ? control['controls']['Prncond'].enable() : control['controls']['Prncond'].disable();
        control['controls']['FormulaText'].disable();
        // this.updatePRN(control['controls']['Prn'].value, index)
      })
  }
  disableInputsOfDispensing() {
    (<FormArray>this.dispensingform.get('dispensingItems'))
      .controls
      .forEach((control, index) => {
        control['controls']['Drugname'].disable();
        control['controls']['Prn'] ? control['controls']['Prncond'].enable() : control['controls']['Prncond'].disable();
        control['controls']['FormulaText'].disable();
        this.updatePRN(control['controls']['Prn'].value, index)
      })
  }
  disableInputsOfRad() {
    (<FormArray>this.radform.get('radItems'))
      .controls
      .forEach((control, index) => {
        control['controls']['Trtoe'].disable();
        control['controls']['ServiceText'].disable();
        control['controls']['Talst'].disable();
      })
  }
  disableInputsOfLab() {
    (<FormArray>this.labform.get('labItems'))
      .controls
      .forEach((control, index) => {
        control['controls']['Trtoe'].disable();
        control['controls']['ServiceText'].disable();
        control['controls']['Talst'].disable();
      })
  }

  createPhyOrderRecords(element): FormGroup {
    return this.formBuilder.group({
      isChecked: [true],
      Id: [element.Id],
      Seqno: [element.Seqno],
      ZphysOrder: [element.ZphysOrder],
      ProfGroup: [element.ProfGroup],
      Stid: [element.Stid],
      ValidOn: [element.ValidOn]
    });
  }
  createMedicationRecords(element): FormGroup {
    return this.formBuilder.group({
      isChecked: [element.Autoselect],
      Complex: [element.Complex],
      Id: [element.Id],
      Drugname: [element.Drugname],
      Formula: [element.Formula],
      FormulaText: [element.FormulaText],
      Route: [element.Route],
      Dosage: [`${parseFloat(element.Dosage).toString()}`],
      DosageUnit: [element.DosageUnit],
      Frequency: [element.Frequency],
      FrequencyText: [element.FrequencyText],
      Quantity: [element.Quantity],
      QuantityUnit: [element.QuantityUnit],
      Drugid: [element.Drugid],
      Duration: [element?.Duration ? this.showDecimalThree(element?.Duration) : ''],
      DurationUnit: [element.DurationUnit],
      Prn: [element.Prn],
      Prncond: [element.Prncond],
      ValidOn: [parseInt(element.ValidOn).toString()],
      ValidTill: [parseInt(element.ValidTill).toString()],
      Descr: [element.Descr],
      Priority: [element.Priority],
      Stid: [element.Stid],
      Seqno: [element.Seqno],
      Agentid: [element.Agentid],
      Purpose: [element.Purpose],
      Dosdef: [''],
      deftimcycleData: [''],
      IsFrequencyDeftim: [false],
    });
  }

  createDispensingRecords(element): FormGroup {
    return this.formBuilder.group({
      isChecked: [element.Autoselect],
      Complex: [element.Complex],
      Id: [element.Id],
      Drugname: [element.Drugname],
      Formula: [element.Formula],
      FormulaText: [element.FormulaText],
      Route: [element.Route],
      Dosage: [`${parseFloat(element.Dosage).toString()}`],
      DosageUnit: [element.DosageUnit],
      Frequency: [element.Frequency],
      FrequencyText: [element.FrequencyText],
      Quantity: [element.Quantity],
      QuantityUnit: [element.QuantityUnit],
      Drugid: [element.Drugid],
      Duration: [element?.Duration ? this.showDecimalThree(element?.Duration) : ''],
      DurationUnit: [element.DurationUnit],
      Prn: [element.Prn],
      Prncond: [element.Prncond],
      ValidOn: [parseInt(element.ValidOn).toString()],
      ValidTill: [parseInt(element.ValidTill).toString()],
      Descr: [element.Descr],
      Priority: [element.Priority],
      Stid: [element.Stid],
      Seqno: [element.Seqno],
      Agentid: [element.Agentid],
      Purpose: [element.Purpose],
      Dosdef: [''],
      deftimcycleData: [''],
      IsFrequencyDeftim: [false],
    });
  }

  showDecimalThree(number) {
    return parseFloat(number).toFixed(3);
  }
  createSurgeryRecords(element): FormGroup {
    return this.formBuilder.group({
      Id: [element.Id],
      isChecked: [element.Autoselect],
      Talst: [element.Talst],
      ServiceText: [element.ServiceText],
      Trtoe: [element.Trtoe],
      TrtoeText: [element.TrtoeText],
      ValidOn: [parseInt(element.ValidOn).toString()],
      Wbgzt: [element.Wbgzt],
      Surgeon: [element.Surgeon],
      SurgeonName: [element.SurgeonName],
      Orgfa: [element.Orgfa],
      OrgfaText: [element.OrgfaText],
      AddInfo: [element.AddInfo],
      Anerf: [element.Anerf],
      Seqno: [element.Seqno],
      Stid: [element.Stid]
    });
  }
  createAdmissionRecords(element): FormGroup {
    return this.formBuilder.group({
      Id: [element.Id],
      isChecked: [element.Autoselect],
      Trtgp: [element.Trtgp],
      Trtoe: [element.Trtoe],
      TrtoeText: [element.TrtoeText],
      Orgfa: [element.Orgfa],
      ValidOn: [parseInt(element.ValidOn).toString()],
      ValidTill: [parseInt(element.ValidTill).toString()],
      OrgfaText: [element.OrgfaText],
      TrtgpName: [element.TrtgpName],
      Wbgzt: [element.Wbgzt],
      Seqno: [element.Seqno],
      Stid: [element.Stid]
    });
  }
  createRadRecords(element): FormGroup {
    return this.formBuilder.group({
      isChecked: [element.Autoselect],
      Id: [element.Id],
      Trtoe: [element.Trtoe],
      TrtoeText: [element.TrtoeText],
      ServiceText: [element.ServiceText],
      Talst: [element.Talst],
      ValidOn: [parseInt(element.ValidOn).toString()],
      ValidTill: [parseInt(element.ValidTill).toString()],
      Localization: [element.Localization],
      LocalizationText: [element.LocalizationText],
      AddInfo: [element.AddInfo],
      Stid: [element.Stid],
      Seqno: [element.Seqno]
    });
  }
  createLabRecords(element): FormGroup {
    return this.formBuilder.group({
      isChecked: [true],
      Id: [element.Id],
      Trtoe: [element.Trtoe],
      TrtoeText: [element.TrtoeText],
      ServiceText: [element.ServiceText],
      Talst: [element.Talst],
      ValidOn: [parseInt(element.ValidOn).toString()],
      Localization: [element.Localization],
      LocalizationText: [element.LocalizationText],
      Fasting: [element.Fasting],
      Cycle: [{ value: element.Cycle, disabled: true }],
      CycleDays: [parseInt(element.CycleDays).toString()],
      AddInfo: [element.AddInfo],
      Stid: [element.Stid],
      Seqno: [element.Seqno],
      Wbgzt: [element.Wbgzt],
      Priority: [false]
    });
  }
  createServicesRecords(element): FormGroup {
    return this.formBuilder.group({
      isChecked: [true],
      Id: [element.Id],
      Category: [{value: element.Category, disabled: true}],
      ServiceText: [element.ServiceText],
      Subcategory: [element.Subcategory],
      Service: [element.Service],
      Stid: [element.Stid],
      ValidOn: [element.ValidOn],
      AddInfo: [element.AddInfo]
    });
  }
  createDiagnosisRecords(element): FormGroup {
    return this.formBuilder.group({
      isChecked: [element.Autoselect],
      Id: [element.Id],
      Stid: [element.Stid],
      Seqno: [element.Seqno],
      DiagKey1: [element.DiagKey1],
      DiagText: [element.DiagText],
      ShortText: [element.ShortText],
      ReferralDia: [element.ReferralDia],
      TreatmentDia: [element.TreatmentDia],
      AdmissionDia: [element.AdmissionDia],
      DischargeDia: [element.DischargeDia],
      SurgeryDia: [element.SurgeryDia],
      PreopDiagInd: [element.PreopDiagInd],
      Dtext1: [element.Dtext1],
      Delete: [element.Delete]
    });
  }
  onOpenFrequencySet(index: number, frequencyItems: any) {
    let formArrayItems: any;
    if(frequencyItems == 'medication') {
      formArrayItems = this.medicationItems;
    } else if(frequencyItems == 'dispencing') {
      formArrayItems = this.dispensingItems;
    }
    if (formArrayItems.controls[index].get('deftimcycleData').value && formArrayItems.controls[index].get('deftimcycleData').value.length) {
      formArrayItems.controls[index].patchValue({ IsFrequencyDeftim: true });
    }
  }

  onSelect(event: string, index: number) {
    if(!event) {
      this.servicesItems.controls[index].patchValue({
        Category: '03'
      });
    } 
  }

  checkForSubtitles() {
    this.medicationItemsArr = [];
    this.phyOrderitemsArr = [];
    this.radItemsArr = [];
    this.labItemsArr = [];
    this.servicesItemsArr = [];
    this.diagnosisItemsArr = [];
    this.surgeryItemsArr = [];
    this.admissionItemsArr = [];
    this.dispensingItemsArr = []

    if (this.allSubtitlesSets.find(e => e.Autoselect === true)) {
      this.allSubtitlesSets.forEach(e1 => {
        if (e1.Autoselect) {
          if (this.medicationItems != undefined) {
            this.medicationItems.value.filter(element => {
              if (e1.Stid === element.Stid) {
                this.medicationItemsArr.push(element);
              }
            });
          }
          if (this.phyOrderitems != undefined) {
            this.phyOrderitems.value.filter(element => {
              if (e1.Stid === element.Stid) {
                this.phyOrderitemsArr.push(element);
              }
            });
          }
          if (this.radItems != undefined) {
            this.radItems.value.filter(element => {
              if (e1.Stid === element.Stid) {
                this.radItemsArr.push(element);
              }
            });
          }
          if (this.labItems != undefined) {
            this.labItems.value.filter(element => {
              if (e1.Stid === element.Stid) {
                this.labItemsArr.push(element);
              }
            });
          }
          if (this.servicesItems != undefined) {
            this.servicesItems.value.filter(element => {
              if (e1.Stid === element.Stid) {
                this.servicesItemsArr.push(element);
              }
            });
          }
          if (this.diagnosisItems != undefined) {
            this.diagnosisItems.value.filter(element => {
              if (e1.Stid === element.Stid) {
                this.diagnosisItemsArr.push(element);
              }
            });
          }
          if (this.surgeryItems != undefined) {
            this.surgeryItems.value.filter(element => {
              if (e1.Stid === element.Stid) {
                this.surgeryItemsArr.push(element);
              }
            });
          }
          if (this.admissionItems != undefined) {
            this.admissionItems.value.filter(element => {
              if (e1.Stid === element.Stid) {
                this.admissionItemsArr.push(element);
              }
            });
          }
          if (this.dispensingItems != undefined) {
            this.dispensingItems.value.filter(element => {
              if (e1.Stid === element.Stid) {
                this.dispensingItemsArr.push(element);
              }
            });
          }
        }
      });
      this.checkedForData();
    } else {
      swal.fire({
        text: 'No order is selected, Please select at least one Order',
        confirmButtonColor: '#0890c5',
        cancelButtonColor: '#84898c',
        confirmButtonText: 'OK',
        customClass: 'myalertpopup',
        icon: 'error'
      } as any);
    }
  }
  checkedForData() {
    let medicationItemsList = _.cloneDeep(this.medicationItemsArr);
    let radItemsList = _.cloneDeep(this.radItemsArr);
    let labItemsList = _.cloneDeep(this.labItemsArr);
    let phyOrderItemsList = _.cloneDeep(this.phyOrderitemsArr);
    let servicesItemsList = _.cloneDeep(this.servicesItemsArr);
    let diagnosisItemsList = _.cloneDeep(this.diagnosisItemsArr);
    let surgeryItemsList = _.cloneDeep(this.surgeryItemsArr);
    let admissionItemsList = _.cloneDeep(this.admissionItemsArr);
    let dispesingItemsList = _.cloneDeep(this.dispensingItemsArr);
    if(dispesingItemsList) {
      medicationItemsList.concat(dispesingItemsList);
    }

    if (this.phyOrderitems != undefined) {
      phyOrderItemsList = phyOrderItemsList.filter((element) => {
        if (element.isChecked) {
          delete element.isChecked;
          return element;
        }
      });
    } else {
      phyOrderItemsList = [];
    }
    if (this.medicationItems != undefined) {
      medicationItemsList = medicationItemsList.filter((element) => {
        if (element.isChecked) {
          delete element.isChecked;
          delete element.DurationUnitText;
          delete element.Quantity;
          delete element.QuantityUnit;
          delete element.FrequencyText;
          delete element.Complex;
          delete element.deftimcycleData
          delete element.IsFrequencyDeftim
          return element;
        }
      });
    } else {
      medicationItemsList = [];
    }

    if (this.radItems != undefined) {
      radItemsList = radItemsList.filter((element) => {
        if (element.isChecked) {
          delete element.isChecked;
          delete element.TrtoeText;
          delete element.LocalizationText;
          return element;
        }
      });
    } else {
      radItemsList = [];
    }
    if (this.labItems != undefined) {
      labItemsList = labItemsList.filter((element) => {
        if (element.isChecked) {
          delete element.isChecked;
          delete element.TrtoeText;
          delete element.LocalizationText;
          return element;
        }
      });
    } else {
      labItemsList = [];
    }
    if (this.servicesItems != undefined) {
      servicesItemsList = servicesItemsList.filter((element) => {
        if (element.isChecked) {
          delete element.isChecked;
          return element;
        }
      });
    } else {
      servicesItemsList = [];
    }
    if (this.diagnosisItems != undefined) {
      diagnosisItemsList = diagnosisItemsList.filter((element) => {
        if (element.isChecked) {
          delete element.isChecked;
          return element;
        }
      });
    } else {
      diagnosisItemsList = [];
    }

    if (this.surgeryItems != undefined) {
      surgeryItemsList = surgeryItemsList.filter((element) => {
        if (element.isChecked) {
          delete element.isChecked;
          // element.Wbgzt = this.parsePayloadFormateTime(element.Wbgzt);
          return element;
        }
      });
    } else {
      surgeryItemsList = [];
    }

    if (this.admissionItems != undefined) {
      admissionItemsList = admissionItemsList.filter((element) => {
        if (element.isChecked) {
          delete element.isChecked;
          // element.Wbgzt = this.parsePayloadFormateTime(element.Wbgzt);
          return element;
        }
      });
    } else {
      admissionItemsList = [];
    }
    this.createOrderSet(medicationItemsList, admissionItemsList, surgeryItemsList,diagnosisItemsList,servicesItemsList,phyOrderItemsList,labItemsList, radItemsList);
  }

  createOrderSet(medicationItemsList, admissionItemsList, surgeryItemsList,diagnosisItemsList,servicesItemsList,phyOrderItemsList,labItemsList, radItemsList) {
    const json = {
      Id: this.selectedData.Id,
      Einri: this.institutionid,
      Falnr: this.paramsObj.caseid,
      Lfdnr: this.lfdnr,
      Patnr: this.paramsObj.patientId,
      PhyOrd: {
        results: phyOrderItemsList,
      },
      MedOrd: {
        results: medicationItemsList,
      },
      Services: {
        results: servicesItemsList,
      },
      Lab: {
        results: labItemsList,
      },
      Rad: {
        results: radItemsList,
      },
      Ndia: {
        results: diagnosisItemsList,
      },
      Surgy: {
        results: surgeryItemsList,
      },
      Adm: {
        results: admissionItemsList,
      },
    };
    this.emergencyService.createOrderSet(json).subscribe(
      (_success: any) => {
        if (_success) {
          swal.fire({
            text: 'Order Set Created Successfully',
            confirmButtonColor: '#0890c5',
            cancelButtonColor: '#84898c',
            confirmButtonText: 'OK',
            customClass: 'myalertpopup',
            icon: 'success'
          } as any)
          this.eOrderService.onNavigationClick('OrderSet');
          this.cancelOrderSelected();
          this.showSelected = false;
          this.getOrderSetDataBySubtitles = [];
          // this.eOrderService.getFavSetData.forEach((element) => {
          //   element['isSelect'] = false;
          // });
          this.eOrderService.getOrderSetData.forEach((element) => {
            element['isSelect'] = false;
          });
        }
      },
      (_error: any) => { 
        let messageError = _error.error?.error?.innererror?.errordetails;        
        let message: any = '';
        messageError.forEach((e, index) => {
            if(message) {
              message = `${message} <br> ${index + 1}) ${e.message}`;
            } else {
              message = `${index + 1}) ${e.message}`
            }
          
        });

        // this.modalRefForDuplicateCode?.hide(); 
          Swal.fire({
            title: message,
            icon: 'error',
            confirmButtonText: 'OK',
            customClass:'diagnosis-error'
          } as any);
      }
    );
  }

  cancelOrderSelected() {
    this.eOrderService.getOrderSet();
    this.resetTags();
    this.showSelected = false;
    const collapseOneShow = document.getElementById('collapseOne');
    collapseOneShow.classList.remove('show');
    const collapseTwoShow = document.getElementById('collapseTwo');
    collapseTwoShow.classList.remove('show');
    const collapseThreeShow = document.getElementById('collapseThree');
    collapseThreeShow.classList.remove('show');
    const collapseFourShow = document.getElementById('collapseFour');
    collapseFourShow.classList.remove('show');
    const collapseFiveShow = document.getElementById('collapseFive');
    collapseFiveShow.classList.remove('show');
    const collapseSixShow = document.getElementById('collapseSix');
    collapseSixShow.classList.remove('show');
    const collapseSevenShow = document.getElementById('collapseSeven');
    collapseSevenShow.classList.remove('show');
    const collapseEightShow = document.getElementById('collapseEight');
    collapseEightShow.classList.remove('show');
    const collapseNineShow = document.getElementById('collapseNine');
    collapseNineShow.classList.remove('show');
    this.isRadiologyCollapse = false;
    this.isAdmissionCollapse = false;
    this.isLaboratoryCollapse = false;
    this.isMedicationCollapse = false;
    this.isDiagnosisCollapse = false;
    this.isServicesCollapse = false;
    this.isSurgeryCollapse = false;
    this.isPhysicianCollapse = false;
    this.isDispensingCollapse = false;
  }

  resetTags() {
    const phyOrderitems = this.phyOrderform.controls.phyOrderitems as FormArray;
    while (0 !== phyOrderitems.length) {
      phyOrderitems.removeAt(0);
    }
    const medicationItems = this.medicationform.controls
      .medicationItems as FormArray;
    while (0 !== medicationItems.length) {
      medicationItems.removeAt(0);
    }
    const radItems = this.radform.controls.radItems as FormArray;
    while (0 !== radItems.length) {
      radItems.removeAt(0);
    }
    const labItems = this.labform.controls.labItems as FormArray;
    while (0 !== labItems.length) {
      labItems.removeAt(0);
    }
    const servicesItems = this.servicesform.controls.servicesItems as FormArray;
    while (0 !== servicesItems.length) {
      servicesItems.removeAt(0);
    }
    const diagnosisItems = this.diagnosisform.controls.diagnosisItems as FormArray;
    while (0 !== diagnosisItems.length) {
      diagnosisItems.removeAt(0);
    }
    const surgeryItems = this.surgeryform.controls.surgeryItems as FormArray;
    while (0 !== surgeryItems.length) {
      surgeryItems.removeAt(0);
    }
    const admissionItems = this.admissionform.controls.admissionItems as FormArray;
    while (0 !== admissionItems.length) {
      admissionItems.removeAt(0);
    }
    const dispensingItems = this.dispensingform.controls.dispensingItems as FormArray;
    while (0 !== dispensingItems.length) {
      dispensingItems.removeAt(0);
    }
    this.phyOrderitemsArr = [];
    this.medicationItemsArr = [];
    this.radItemsArr = [];
    this.labItemsArr = [];
    this.servicesItemsArr = [];
    this.diagnosisItemsArr = [];
    this.surgeryItemsArr = [];
    this.admissionItemsArr = [];
    this.dispensingItemsArr = [];
  }

  getOrderSetByFavId(data) {
    const json = {
      Id: data.Id,
    };
    this.emergencyService.getOrderSetByFavId(json).subscribe(
      (_success: any) => {
        if (_success) {
          // _success = JSON.parse(_success._body);

          this.getOrderSetFavDataById = _success.d.results;
          this.selectedData = this.getOrderSetFavDataById[0];
          this.setRecordsForms(this.getOrderSetFavDataById[0]);
          //  if (this.getOrderSetFavDataById.length >0) {
          //   this.selectedFavData = this.getOrderSetFavDataById[0];
          //   this.selectFavSet(this.selectedFavData);
          //  }
        }
      },
      (_error: any) => { }
    );
  }

  prnUnCheckPrnCodeBlanckMedi(event,index) {
    this.medicationItems.controls[index].patchValue({
      Prncond: ''
    });
    if (event) {
      this.medicationform.get('medicationItems')['controls'].at(index).get('Prncond').enable();
    } else {
      this.medicationform.get('medicationItems')['controls'].at(index).get('Prncond').disable();
    }
  }
  prnUnCheckPrnCodeBlanckDisp(event,index) {
    this.dispensingItems.controls[index].patchValue({
      Prncond: ''
    });
    if (event) {
      this.dispensingform.get('dispensingItems')['controls'].at(index).get('Prncond').enable();
    } else {
      this.dispensingform.get('dispensingItems')['controls'].at(index).get('Prncond').disable();
    }
  }
  updatePRN(event, index) {
    if (event) {
      this.medicationform.get('medicationItems')['controls']?.at(index)?.get('Prncond').enable();
    } else {
      this.medicationform.get('medicationItems')['controls']?.at(index)?.get('Prncond').disable();
    }
  }
  showLocalizationTextForRad(data, event, index) {
    let selectedLocalValue = data.find(d => d.Dialo === event)
    this.radItems.controls[index].patchValue({
      LocalizationText: selectedLocalValue.Dialotext
    })
  }
  showLocalizationTextForLab(data, event, index) {
    let selectedLocalValue = data.find(d => d.Dialo === event)
    this.labItems.controls[index].patchValue({
      LocalizationText: selectedLocalValue.Dialotext
    })
  }

    getAssignUsersList() {
    this.orderDashboardService
      .getAssignUsersData()
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any) => {
        this.assignUsersList = data?.d?.results;
      });
  }
  changeSubtitle(item: any, index: number) {
    this.isRadiologyCollapse = false;
    this.isAdmissionCollapse = false;
    this.isLaboratoryCollapse = false;
    this.isMedicationCollapse = false;
    this.isDiagnosisCollapse = false;
    this.isServicesCollapse = false;
    this.isSurgeryCollapse = false;
    this.isPhysicianCollapse = false;
    this.isDispensingCollapse = false;

    if (!item.isSelect) {
      //this.subtitleActive = true;
      //this.getOrderSetBySubtitles(item);
      this.selectedStid = item.Stid;
      const collapseOneShow = document.getElementById('collapseOne');
      collapseOneShow.classList.add('show');
      const collapseTwoShow = document.getElementById('collapseTwo');
      collapseTwoShow.classList.add('show');
      const collapseThreeShow = document.getElementById('collapseThree');
      collapseThreeShow.classList.add('show');
      const collapseFourShow = document.getElementById('collapseFour');
      collapseFourShow.classList.add('show');
      const collapseFiveShow = document.getElementById('collapseFive');
      collapseFiveShow.classList.add('show');
      const collapseSixShow = document.getElementById('collapseSix');
      collapseSixShow.classList.add('show');
      const collapseSevenShow = document.getElementById('collapseSeven');
      collapseSevenShow.classList.add('show');
      const collapseEightShow = document.getElementById('collapseEight');
      collapseEightShow.classList.add('show');
      const collapseNineShow = document.getElementById('collapseNine');
      collapseNineShow.classList.add('show');
      if (this.medicationItems != undefined) {
        this.getLowestIndex();
      }
      this.showAndHideCollpse();
    } else {
      const collapseOneShow = document.getElementById('collapseOne');
      collapseOneShow.classList.remove('show');
      const collapseTwoShow = document.getElementById('collapseTwo');
      collapseTwoShow.classList.remove('show');
      const collapseThreeShow = document.getElementById('collapseThree');
      collapseThreeShow.classList.remove('show');
      const collapseFourShow = document.getElementById('collapseFour');
      collapseFourShow.classList.remove('show');
      const collapseFiveShow = document.getElementById('collapseFive');
      collapseFiveShow.classList.remove('show');
      const collapseSixShow = document.getElementById('collapseSix');
      collapseSixShow.classList.remove('show');
      const collapseSevenShow = document.getElementById('collapseSeven');
      collapseSevenShow.classList.remove('show');
      const collapseEightShow = document.getElementById('collapseEight');
      collapseEightShow.classList.remove('show');
      const collapseNineShow = document.getElementById('collapseNine');
      collapseNineShow.classList.remove('show');
    }
    // this.showAccor();
    this.allSubtitlesSets.forEach(element => {
      if (item.Stid == element.Stid) {
        if (element['isSelect']) {
          element['isSelect'] = false;
        } else {
          element['isSelect'] = true;
        }
      } else {
        element['isSelect'] = false;
      }
    });
  }

  getLowestIndex() {
    if (this.medicationItems?.value.length > 0 && this.medicationItems != undefined) {
      this.selectedArr = [];
      let index = this.medicationItems.value.findIndex(el => this.selectedStid == el.Stid);
      this.selectedArr.push(index);
      this.firstIndex = Math.min(...this.selectedArr);
    }
    if (this.radItems?.value.length > 0 && this.medicationItems != undefined) {
      this.selectedArr = [];
      let index = this.radItems.value.findIndex(el => this.selectedStid == el.Stid);
      this.selectedArr.push(index);
      this.firstRadIndex = Math.min(...this.selectedArr);
    }
    if (this.labItems?.value.length > 0 && this.medicationItems != undefined) {
      this.selectedArr = [];
      let index = this.labItems.value.findIndex(el => this.selectedStid == el.Stid);
      this.selectedArr.push(index);
      this.firstLabIndex = Math.min(...this.selectedArr);
    }
    if (this.phyOrderitems?.value.length > 0 && this.medicationItems != undefined) {
      this.selectedArr = [];
      let index = this.phyOrderitems.value.findIndex(el => this.selectedStid == el.Stid);
      this.selectedArr.push(index);
      this.firstPhyIndex = Math.min(...this.selectedArr);
    }
    if (this.servicesItems?.value.length > 0 && this.medicationItems != undefined) {
      this.selectedArr = [];
      let index = this.servicesItems.value.findIndex(el => this.selectedStid == el.Stid);
      this.selectedArr.push(index);
      this.firstServiceIndex = Math.min(...this.selectedArr);
    }
    if (this.surgeryItems?.value.length > 0 && this.medicationItems != undefined) {
      this.selectedArr = [];
      let index = this.surgeryItems.value.findIndex(el => this.selectedStid == el.Stid);
      this.selectedArr.push(index);
      this.firstSurgeryIndex = Math.min(...this.selectedArr);
    }
    if (this.admissionItems?.value.length > 0 && this.medicationItems != undefined) {
      this.selectedArr = [];
      let index = this.admissionItems.value.findIndex(el => this.selectedStid == el.Stid);
      this.selectedArr.push(index);
      this.firstAdmissionIndex = Math.min(...this.selectedArr);
    }
  }
  actionOnSubtitle(item, i) {
    //  if (!item.Autoselect) {
    //   (<FormArray>this.medicationform.get('medicationItems'))
    //     .controls
    //     .forEach((control,index) => {
    //       control['controls']['isChecked'].setValue(false);

    //     })
    //  }else{
    //   this.selectSet(this.selectedData);
    //  }

  }
  getOrderSetBySubtitles(data, index) {
    const json = {
      Id: data.Id,
      Stid: data.Stid
    }
    this.emergencyService.getOrderSetBySubtitles(json).subscribe(
      (_success: any) => {
        if (_success) {
          // _success = JSON.parse(_success._body);
          if (this.getOrderSetDataBySubtitles.length > 0) {
            this.getOrderSetDataBySubtitles.push(_success.d.results[0]);
          } else {
            this.getOrderSetDataBySubtitles = _success.d.results;
          }

          this.getOrderSetDataBySubtitles.forEach(element => {
            element["isSelect"] = false;
          });

          if (this.allSubtitlesSets.length == this.getOrderSetDataBySubtitles.length) {
            this.getOrderSetDataBySubtitles.forEach(data => {
              data.ToPhyOrd.results.forEach((element) => {
                this.addItemForPhyOrder(element);
              });
              data.ToMedOrd.results.forEach((element) => {
                if(element.Purpose == '03') {
                  this.addItemForMedication(element);
                }
                if(element.Purpose == '01') {
                  this.addItemForDispensing(element);
                }
                this.dosageUnitListForOrderSets(element);
              });
              data.ToRad.results.forEach((element) => {
                this.addItemForRad(element);
              });
              data.ToLab.results.forEach((element) => {
                this.addItemForLab(element);
              });
              data.ToServices.results.forEach((element) => {
                this.addItemForServices(element);
              });
              data.ToNdia.results.forEach((element) => {
                this.addItemForDiagnosis(element);
              });
              data.ToSurgy.results.forEach((element) => {
                this.addItemForSurgery(element);
              });
              data.ToAdm.results.forEach((element) => {
                this.addItemForAdmission(element);
              });
              // this.assignUsersList = data.ToAccess.results
            });
            this.showAndHideCollpse();
          }
          this.getLowestIndex();
        }
      },
      (_error: any) => { }
    );
  }

  showAndHideCollpse() {
    if(this.admissionItems) {
      this.admissionItems.value.forEach(element => { 
        if(element.Stid == this.selectedStid) {
          this.isAdmissionCollapse = true;
        } 
      });
    }
    if(this.dispensingItems) {
      this.dispensingItems.value.forEach(element => { 
        if(element.Stid == this.selectedStid) {
          this.isDispensingCollapse = true;
        } 
      });
    }
    if(this.radItems) {
      this.radItems.value.forEach(element => { 
        if(element.Stid == this.selectedStid) {
          this.isRadiologyCollapse = true;
        } 
      });
    }

    if(this.medicationItems) {
      this.medicationItems.value.forEach(element => { 
        if(element.Stid == this.selectedStid) {
          this.isMedicationCollapse = true;
        } 
      });
    }
    if(this.labItems) {
      this.labItems.value.forEach(element => { 
        if(element.Stid == this.selectedStid) {
          this.isLaboratoryCollapse = true;
        } 
      });
    }

    if(this.phyOrderitems) {
      this.phyOrderitems.value.forEach(element => { 
        if(element.Stid == this.selectedStid) {
          this.isPhysicianCollapse = true;
        } 
      });
    }

    if(this.servicesItems) {
      this.servicesItems.value.forEach(element => { 
        if(element.Stid == this.selectedStid) {
          this.isServicesCollapse = true;
        } 
      });
    }

    if(this.diagnosisItems) {
      this.diagnosisItems.value.forEach(element => { 
        if(element.Stid == this.selectedStid) {
          this.isDiagnosisCollapse = true;
        } 
      });
    }

    if(this.surgeryItems) {
      this.surgeryItems.value.forEach(element => { 
        if(element.Stid == this.selectedStid) {
          this.isSurgeryCollapse = true;
        } 
      });
    }
    this.collaspeCondition();
  }

  collaspeCondition() {
    if(!this.isMedicationCollapse) {
      const collapseOneShow = document.getElementById('collapseOne');
      collapseOneShow.classList.remove('show');
    } else {
      const collapseOneShow = document.getElementById('collapseOne');
      collapseOneShow.classList.add('show');
    }
    if(!this.isDispensingCollapse) {
      const collapseNineShow = document.getElementById('collapseNine');
      collapseNineShow.classList.remove('show');
    } else {
      const collapseNineShow = document.getElementById('collapseNine');
      collapseNineShow.classList.add('show');
    }
    if(!this.isRadiologyCollapse) {
      const collapseTwoShow = document.getElementById('collapseTwo');
      collapseTwoShow.classList.remove('show');
    } else {
      const collapseTwoShow = document.getElementById('collapseTwo');
      collapseTwoShow.classList.add('show');
    }
    if(!this.isLaboratoryCollapse) {
      const collapseThreeShow = document.getElementById('collapseThree');
      collapseThreeShow.classList.remove('show');
    } else {
      const collapseThreeShow = document.getElementById('collapseThree');
      collapseThreeShow.classList.add('show');
    }
    if(!this.isPhysicianCollapse) {
      const collapseFiveShow = document.getElementById('collapseFive');
      collapseFiveShow.classList.remove('show');
    } else {
      const collapseFiveShow = document.getElementById('collapseFive');
      collapseFiveShow.classList.add('show');
    }
    if(!this.isServicesCollapse) {
      const collapseFourShow = document.getElementById('collapseFour');
      collapseFourShow.classList.remove('show');
    } else {
      const collapseFourShow = document.getElementById('collapseFour');
      collapseFourShow.classList.add('show');
    }
    if(!this.isDiagnosisCollapse) {
      const collapseSixShow = document.getElementById('collapseSix');
      collapseSixShow.classList.remove('show');
    } else {
      const collapseSixShow = document.getElementById('collapseSix');
      collapseSixShow.classList.add('show');
    }
    if(!this.isSurgeryCollapse) {
      const collapseSevenShow = document.getElementById('collapseSeven');
      collapseSevenShow.classList.remove('show');
    } else {
      const collapseSevenShow = document.getElementById('collapseSeven');
      collapseSevenShow.classList.add('show');
    }
    if(!this.isAdmissionCollapse) {
      const collapseEightShow = document.getElementById('collapseEight');
      collapseEightShow.classList.remove('show');
    } else {
      const collapseEightShow = document.getElementById('collapseEight');
      collapseEightShow.classList.add('show');
    }
  }

  SearchOrderSets() {
    this.eOrderService.getOrderSetData = this.eOrderService.getOrderSetData.filter((item: any) => {
      return item.Name.toLowerCase().includes(this.searchOrderSets.toLowerCase());
    });
    // this.eOrderService.getFavSetData = this.eOrderService.getFavSetData.filter((item: any) => {
    //   return item.Name.toLowerCase().includes(this.searchOrderSets.toLowerCase());
    // });
    if (this.searchOrderSets == "") {
      this.eOrderService.getOrderSet();
      //this.eOrderService.getFavSet();
    }
  }
  ngOnInit() {
    this.addministrationService.loadDropdownList();
    this.localizationForOrderSets();
    this.searchEventForTreatmentOU();
    this.searchEventForDepartmentOU();
  }



  onChangeDosageUnit(data: any, event: any, index: number) {
    const selectedDosage = data.find(d => d.Meinh === event)
    if (selectedDosage !== undefined && selectedDosage.Agentid !== '') {
      this.medicationItems.controls[index].patchValue({
        Agentid: selectedDosage.Agentid !== null ? selectedDosage.Agentid : "",
        DosageUnit: Math.floor(selectedDosage.DosageUnit)
      })
    } else {
      this.medicationItems.controls[index].patchValue({
        Agentid: this.defaultAgentId
      })
    }
  }

  FrequencySetcycle(event, index: number) {
    if (event && event.length) {
      this.medicationItems.controls[index].get("deftimcycleData").setValue(event);
      const selectedData = [];
      if (!event.find(d => formatDate(d.deftimTime, "HH:mm") === "08:00")) {
        selectedData.push("0(08:00)")
      }
      event.forEach(element => {
        selectedData.push(`${element.deftimDose}(${formatDate(element.deftimTime, "HH:mm")})`)
      });
      this.medicationItems.controls[index].patchValue({
        Dosage: `${Math.floor(event[0].deftimDose)}`,
        DosageUnit: event[0].deftimDosageUnit,
      })
      this.medicationItems.controls[index].patchValue({
        Dosdef: selectedData.join("-")
      })
    }
  }


  onChangeFrequencySet(data?: any, index?: number, frequencyItems?: any) {
    if (data != null && data != "") {
      let formArrayItems: any;
      if(frequencyItems == 'medication') {
        formArrayItems = this.medicationItems;
      } else if(frequencyItems == 'dispencing') {
        formArrayItems = this.dispensingItems;
      }
      formArrayItems.controls[index].get('deftimcycleData').setValue([]);
      const frequencyData = this.addministrationService.frequencyList.find(d => d.CycleKey == data).N1id;
      if (frequencyData !== undefined && (frequencyData == "STAT" || frequencyData == "ONCE")) {
        formArrayItems.controls[index].patchValue({ Pdur: 1, Pduru: "DOS", Priority: "030" });
      } else if (frequencyData !== undefined && (frequencyData == "DEFTIM" || frequencyData == "DAILY")) {
        formArrayItems.controls[index].get('deftimcycleData').setValue([{ deftimDose: formArrayItems.value[0].Dosage, deftimDosageUnit: formArrayItems.value[0].DosageUnit, deftimTime: new Date(`${formatDate(new Date(), "YYYY-MM-DD")}T08:00`) }]);
        const selectedData = [];
        if (!formArrayItems.controls[index].get('deftimcycleData').value.find(d => formatDate(d.deftimTime, "HH:mm") === "08:00")) {
          selectedData.push("0(08:00)")
        }
        formArrayItems.controls[index].get('deftimcycleData').value.forEach(element => {
          selectedData.push(`${element.deftimDose}(${formatDate(element.deftimTime, "HH:mm")})`)
        });
        formArrayItems.controls[index].patchValue({ IsFrequencyDeftim: true, Dosdef: selectedData.join("-") });
      } else {
        formArrayItems.controls[index].patchValue({ Priority: "010", IsFrequencyDeftim: false });
      }
    } else {
      this.medicationItems.controls[index].patchValue({ Priority: "010", IsFrequencyDeftim: false });
    }
  }
  closeCycle(index: number) {
    this.medicationItems.controls[index].patchValue({ IsFrequencyDeftim: false })
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

  parsePayloadFormateTime(data: any) {
    if (data.slice(0, 2) == 'PT') {
      return data;
    }
    if (data && data.length) {
      const strArr: string[] = data.split(':');
      if (data) {
        return `PT${strArr[0]}H${strArr[1]}M00S`;
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
      customClass: 'myalertpopup',
      icon: 'error'
    } as any);
  }

  searchEventForTreatmentOU() {
    this.searchTermTreatmentOU.pipe(debounceTime(2000)).subscribe((term) => {
      if (term !== '' && term !== null && term.length >= 3) {
        this.orderDashboardService.getTreatmentOUList('01', term).subscribe({
          next: (resp: any) => {
            this.treatmentOUList = resp?.d?.results;
          },
        });
      }
    });
  }

  searchEventForDepartmentOU() {
    this.searchTermDepartmentOU.pipe(debounceTime(2000)).subscribe((term) => {
      if (term !== '' && term !== null && term.length >= 3) {
        this.orderDashboardService.getDepartmentOUList('01', term).subscribe({
          next: (resp: any) => {
            this.departmentOUList = resp?.d?.results;
          },
        });
      }
    });
  }

  onSelectTreatmentOU(value, index) {
    if(value) {
      this.surgeryItems.controls[index].patchValue({
        Trtoe: value.Orgid,
        TrtoeText: value.Orgna,
      });
    } else {
      this.surgeryItems.controls[index].patchValue({
        Trtoe: '',
        TrtoeText: '',
      });
    }
  }

  onSelectDepartmentOU(value, index) {
    if(value) {
      this.surgeryItems.controls[index].patchValue({
        Orgfa: value.Orgid,
        OrgfaText: value.Orgna,
      });
    } else {
      this.surgeryItems.controls[index].patchValue({
        Orgfa: '',
        OrgfaText: '',
      });
    }
  }

  onSelectSurgeon(value, index) {
    if(value) {
      this.surgeryItems.controls[index].patchValue({
        Surgeon: value.Gpart,
        SurgeonName: value.NamString,
      });
    } else {
      this.surgeryItems.controls[index].patchValue({
        Surgeon: '',
        SurgeonName: '',
      });
    }
  }

  onSelectTreatmentOUForAdmission(value, index) {
    if(value) {
      this.admissionItems.controls[index].patchValue({
        Trtoe: value.Orgid,
        TrtoeText: value.Orgna,
      });
    } else {
      this.admissionItems.controls[index].patchValue({
        Trtoe: '',
        TrtoeText: '',
      });
    }
  }

  onSelectDepartmentOUForAdmission(value, index) {
    if(value) {
      this.admissionItems.controls[index].patchValue({
        Orgfa: value.Orgid,
        OrgfaText: value.Orgna,
      });
    } else {
      this.admissionItems.controls[index].patchValue({
        Orgfa: '',
        OrgfaText: '',
      });
    }
  }

  onSelectSurgeonForAdmission(value, index) {
    if(value) {
      this.admissionItems.controls[index].patchValue({
        Trtgp: value.Gpart,
        TrtgpName: value.NamString,
      });
    } else {
      this.admissionItems.controls[index].patchValue({
        Trtgp: '',
        TrtgpName: '',
      });
    }
  }

  onlyNumberKey(event) {
    let charCode = (event.query) ? event.query : event.keyCode;
    console.log(charCode);
    if (charCode > 31
      && (charCode < 48 || charCode > 57))
      return false;

    return true;
  }

  purposeValueSet(descr) {
    if (descr == '01') {
      return 'Despensing'
    } else if (descr == '02') {
      return 'Prescription Print';
    } else if (descr == '03') {
      return 'Administration Event';
    } else {
      return '';
    }
  }

  getDropDownTitle(value, type) {
    if(type == 'medicationRoute') {
      return this.addministrationService.routeDropdownList?.find(ele => ele.Aprouid == value)?.Descr;
    }
    if(type == 'medicationDosageUnit') {
      return this.dosageUnitListOrderSet?.find(ele => ele.Meinh == value)?.Mseht;
    }
    if(type == 'medicationFrequency') {
      return this.addministrationService.frequencyList?.find(ele => ele.CycleKey == value)?.OptionField;
    }
    if(type == 'medicationDuration') {
      return this.addministrationService.durationUnitList?.find(ele => ele.Unit == value)?.Text;
    }
    if(type == 'medicationOrderPurpose') {
      return this.purposeList?.find(ele => ele.id == value)?.label;
    }
    if(type == 'medicationPriority') {
      return this.priorityArray?.find(ele => ele.Value == value)?.Desc;
    }
    if(type == 'physicianOccGroup') {
      return this.occupationalGroupData?.find(ele => ele.Group == value)?.Text;
    }
    if(type == 'catogoryService') {
      return this.procedureCategoryList?.find(ele => ele.value == value)?.name;
    }
  }
}
