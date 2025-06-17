import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdmissionService } from '@services/admission/admission.service';
import { DataShareService } from '@services/data-share.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ErVitalsForSBARComponent } from '../sbar-nursing-endorsement/er-vitals/er-vitals.component';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ActionType } from '@services/interfaces/common.enum';
import { observationList } from 'src/app/shared-module/cpr-document/dropdown-values';

@Component({
  selector: 'app-post-anesthesia-care-record',
  templateUrl: './post-anesthesia-care-record.component.html',
  styleUrls: ['./post-anesthesia-care-record.component.scss'],
})
export class PostAnesthesiaCareRecordComponent implements OnInit, OnDestroy {
  @ViewChild('erVitalsModal') erVitalsModal: ErVitalsForSBARComponent;

  public CurrentDateAndTime: Date = new Date();
  postAssForm: FormGroup;
  paramsObject: any;
  public toVitalsArr: any = [];

  tabItems = [
    { label: 'Vital Signs', value: '1' },
    { label: 'Aldrete Score', value: '2' },
    { label: 'Intake/Output', value: '3' },
    { label: 'Post Anaesthesia Complications', value: '4' },
    { label: 'Current Medication', value: '5' },
  ];
  public scalesList: any[] = [
    {
      ScaleType: 'Modified Aldrete Score (MAS)',
      LastScore: '',
      ScoreDesc: '',
      Datetimee: '',
      value: '1',
      Dockey: '',
    },
    {
      ScaleType: '',
      LastScore: '',
      ScoreDesc: '',
      Datetimee: '',
      value: '2',
      Dockey: '',
    },
    {
      ScaleType: '',
      LastScore: '',
      ScoreDesc: '',
      Datetimee: '',
      value: '3',
      Dockey: '',
    },
  ];
  tableHeading = ['Time', 'Vital Signs', '2 min', '4 min', '6 min', '8 min', '10 min', '12 min', '14 min', '16 min', '18 min', '20 min', '22 min', '24 min', '26 min', '28 min', '30 min', '32 min', '34 min', '36 min', '38 min', '40 min', 'Comments']
  observationList = observationList;

  vitalSigns = [
    { value: 0, label: 'Heart Rate/mt' },
    { value: 1, label: 'Respirations/mt' },
    { value: 2, label: 'O2 Saturation' },
    { value: 3, label: 'Blood Pressure' },
    { value: 4, label: 'Mode of Ventilation' },
    { value: 5, label: 'Compressions' },
    { value: 6, label: 'Atropine' },
    { value: 7, label: 'Adrenaline' },
    { value: 8, label: 'Sodium Bicarbonate' },
    { value: 9, label: 'Calcium Gluconate' },
    { value: 10, label: 'Xylocaine Bolus' },
    { value: 11, label: 'Infusion' },
    { value: 12, label: 'Amiodarone' },
    { value: 13, label: 'D/C Shock Jolues' },
    { value: 14, label: 'Others' },
    { value: 15, label: 'Pain Score' },
    { value: 16, label: 'Temperature' },
    { value: 17, label: 'Nausea and Vomiting' },
    { value: 18, label: 'Level of Consciousness' },
  ];
  activeTab: string = '1'; // Default tab
  otherChecked = false;
  otherChecked1 = false;
  currentTime: any;
  isChecked: any;
  encounterId: any;
  docKey: any;
  apiJson: any;
  medicationImportDrugArray: any = [];
  private subscription: Subscription;
  private actionTypeSubscription$: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    public storageService: StorageService,
    public admissionService: AdmissionService,
    private sharedService: SharedService,
    private ePrescriptionService: EPrescriptionService,
    private _route: ActivatedRoute,
    private datePipe: DatePipe,
    private dataShareService: DataShareService,
    private emergencyService: EmergencyService,
    private modalService: BsModalService
  ) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    this.currentTime = `${hours}:${minutes}:${seconds}`;

    this._route.queryParams.subscribe((params) => {
      this.paramsObject = params;
      if (this.paramsObject.lfdnr) {
        this.encounterId = this.paramsObject.einri + this.paramsObject.falnr + this.paramsObject.lfdnr;
      }
      this.storageService.setEinri(this.paramsObject.einri);
      this.storageService.setFalnr(this.paramsObject.falnr);
      this.storageService.setLfdnr(this.paramsObject.lfdnr);
      this.storageService.setPatnr(this.paramsObject.patnr);
    });

    this.apiJson = {
      Einri: this.storageService.einri,
      Falnr: this.storageService.falnr,
      Patnr: this.storageService.patnr,
      Lfdnr: this.storageService.lfdnr,
      Lfdbw: this.storageService.lfdnr
    }
    this.initForm();
    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe((data) => {
      if (data != null) {
        if (data.type == ActionType.Add$ && data.value == '') {
          this.docKey = data.value.Dockey
        }
        if (data.type == ActionType.Update$ && data.value) {
          this.docKey = data.value.docKey
          this.getNurseDocDetail(data.value.docKey)
        }
        if (data.type == ActionType.Copy$ && data.value) {
          this.docKey = data.value.docKey
          this.getNurseDocDetail(data.value.docKey)
        }
      } else if (data.type == ActionType.Copy$ && data.value) {
        this.docKey = data.value.docKey
        this.getNurseDocDetail(data.value.docKey)
      } else {
        // for after code
      }
    })
  }

  ngOnInit(): void {
  }

  initForm() {
    this.currentTime = this.datePipe.transform(new Date(), "hh:mm:ss");

    this.postAssForm = this.formBuilder.group({
      Dockey: [''],
      Dtid: ['ZMED_PACR'],
      Einri: this.paramsObject.einri,
      Patnr: this.paramsObject.patnr,
      Falnr: this.paramsObject.falnr,
      Lfdnr: this.paramsObject.lfdnr,
      Orgdo: [this.storageService.patientData.deptOrgUnit],
      AttendPhy: [this.storageService.getUserProfile().Gpart],
      DocStatus: ['1'],
      Datee: [new Date()],
      AGeneral: [false],
      ASpinal: [false],
      AEpidural: [false],
      AIvBlock: [false],
      AConsciousSedation: [false],
      AOtherRegional: [false],
      Anaesthesiologist: [''],
      Surgeon: [''],
      Proceduree: [''],
      Received: [''],
      TimeIn: [this.currentTime],
      TimeOut: [this.currentTime],
      VtPreOpBp: [''],
      VtOrBp: [''],
      VtUrineCatheter: [''],
      VtWoundDrainage: [''],
      VtBloodGiven: [''],
      VtIvFluid: [''],
      VtBiopsy: [''],
      VtOther: [''],
      IoGrandTotalIntake: [''],
      IoGrandTotalOutput: [''],
      IoFluidBalance: [''],
      PacAllergy: [false],
      PacDyspnoea: [false],
      PacBleeding: [false],
      PacArrhythmia: [false],
      PacLaryngoSpasm: [false],
      PacNausea: [false],
      PacAirwayObst: [false],
      PacHoarseness: [false],
      PacVomiting: [false],
      PacHypoxemia: [false],
      PacShivering: [false],
      PacHypertension: [false],
      PacConfusion: [false],
      PacHypotension: [false],
      PacAgitation: [false],
      PacOther: [false],
      PacOtherTxt: [''],
      PacIntervention: [''],
      PacSignature: [''],
      NnNursingNotes: [''],
      NnNursingInitials: [''],
      DTpWard: [false],
      DTpIcu: [false],
      DTpOther: [false],
      DTpOtherTxt: [''],
      DAnaesthesiologist: [''],
      DTransferred: [''],
      DEvaluatedBy: [''],
      DReceived: [''],
      DDischargeFrom: [''],

      TOSCALE: this.formBuilder.array([]),
      TOOUTPUT: this.formBuilder.array([]),
      TOINTAKE: this.formBuilder.array([]),
      TOVITALSIGNOBS: this.formBuilder.array([]),
    });

    for (let i = 0; i < 5; i++) {
      this.addDrain();
      this.addOut();
      this.addItemVital();
    }
  }

  onOtherChange() {
    const otherChecked = this.postAssForm.get('DTpOther')?.value;
    if (!otherChecked) {
      this.postAssForm.get('DTpOtherTxt')?.setValue('');
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.actionTypeSubscription$) {
      this.actionTypeSubscription$.unsubscribe();
      this.dataShareService.sendActionType(null);
    }
  }


  get TOINTAKE(): FormArray {
    return this.postAssForm.get('TOINTAKE') as FormArray;
  }
  get TOOUTPUT(): FormArray {
    return this.postAssForm.get('TOOUTPUT') as FormArray;
  }

  addDrain(item?) {
    const drainGroup = this.formBuilder.group({
      Dockey: [item?.Dockey ?? ''],
      Datee: [this.getDate(item?.Datee) ?? ''],
      Timee: [this.parseTime(item?.Timee) ?? ''],
      TypeIntake: [item?.TypeIntake ?? ''],
      Amount: [item?.Amount ?? '']
    });
    this.TOINTAKE.push(drainGroup);
  }

  removeDrain(index: number) {
    this.TOINTAKE.removeAt(index);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  addOut(item?) {
    const drainGroup = this.formBuilder.group({
      Dockey: [item?.Dockey ?? ''],
      Datee: [this.getDate(item?.Datee) ?? ''],
      Timee: [this.parseTime(item?.Timee) ?? ''],
      TypeOutput: [item?.TypeOutput ?? ''],
      Amount: [item?.Amount ?? '']
    });
    this.TOOUTPUT.push(drainGroup);
  }

  TOVITALSIGNOBS: FormArray
  addItemVital(data?: any): void {
    if (this.postAssForm) {
      this.TOVITALSIGNOBS = this.postAssForm.get('TOVITALSIGNOBS') as FormArray;
      this.TOVITALSIGNOBS.push(this.createObservation(data));
    }
  }

  createObservation(item): FormGroup {
    let currentTime = this.datePipe.transform(new Date(), 'hh:mm:ss');
    return this.formBuilder.group({
      Dockey: [item?.Dockey ?? ''],
      Timee: [this.parseTime(item?.Timee) ?? currentTime],  // Default to current time
      VitalSigns: [item?.VitalSigns ?? ''],
      M0: [item?.M0 ?? ''],
      M10: [item?.M10 ?? ''],
      M20: [item?.M20 ?? ''],
      M30: [item?.M30 ?? ''],
      M40: [item?.M40 ?? ''],
      M50: [item?.M50 ?? ''],
      M60: [item?.M60 ?? ''],
      M70: [item?.M70 ?? ''],
      M80: [item?.M80 ?? ''],
      M90: [item?.M90 ?? ''],
      M100: [item?.M100 ?? ''],
      M110: [item?.M110 ?? ''],
      M120: [item?.M120 ?? ''],
    });
  }

  removeOut(index: number) {
    this.TOOUTPUT.removeAt(index);
  }

  getNurseDocDetail(docKey?: any) {
    this.subscription = this.emergencyService.fetchPostCareRecord(docKey).subscribe({
      next: (apiResponse: any) => {
        const payload = apiResponse?.d?.results?.[0] || {};

        const patchData = {
          Dockey: payload.Dockey,
          Dtid: payload.Dtid,
          Einri: payload.Einri,
          Patnr: payload.Patnr,
          Falnr: payload.Falnr,
          Lfdnr: payload.Lfdnr,
          Orgdo: payload.Orgdo,
          AttendPhy: payload.AttendPhy,
          DocStatus: payload.DocStatus,
          Datee: this.getDate(payload.Datee),
          AGeneral: payload.AGeneral,
          ASpinal: payload.ASpinal,
          AEpidural: payload.AEpidural,
          AIvBlock: payload.AIvBlock,
          AConsciousSedation: payload.AConsciousSedation,
          AOtherRegional: payload.AOtherRegional,
          Anaesthesiologist: payload.Anaesthesiologist,
          Surgeon: payload.Surgeon,
          Proceduree: payload.Proceduree,
          Received: payload.Received,
          TimeIn: this.parseTime(payload.TimeIn),
          TimeOut: this.parseTime(payload.TimeOut),
          VtPreOpBp: payload.VtPreOpBp,
          VtOrBp: payload.VtOrBp,
          VtUrineCatheter: payload.VtUrineCatheter,
          VtWoundDrainage: payload.VtWoundDrainage,
          VtBloodGiven: payload.VtBloodGiven,
          VtIvFluid: payload.VtIvFluid,
          VtBiopsy: payload.VtBiopsy,
          VtOther: payload.VtOther,
          IoGrandTotalIntake: payload.IoGrandTotalIntake,
          IoGrandTotalOutput: payload.IoGrandTotalOutput,
          IoFluidBalance: payload.IoFluidBalance,
          PacAllergy: payload.PacAllergy,
          PacDyspnoea: payload.PacDyspnoea,
          PacBleeding: payload.PacBleeding,
          PacArrhythmia: payload.PacArrhythmia,
          PacLaryngoSpasm: payload.PacLaryngoSpasm,
          PacNausea: payload.PacNausea,
          PacAirwayObst: payload.PacAirwayObst,
          PacHoarseness: payload.PacHoarseness,
          PacVomiting: payload.PacVomiting,
          PacHypoxemia: payload.PacHypoxemia,
          PacShivering: payload.PacShivering,
          PacHypertension: payload.PacHypertension,
          PacConfusion: payload.PacConfusion,
          PacHypotension: payload.PacHypotension,
          PacAgitation: payload.PacAgitation,
          PacOther: payload.PacOther,
          PacOtherTxt: payload.PacOtherTxt,
          PacIntervention: payload.PacIntervention,
          PacSignature: payload.PacSignature,
          NnNursingNotes: payload.NnNursingNotes,
          NnNursingInitials: payload.NnNursingInitials,
          DTpWard: payload.DTpWard,
          DTpIcu: payload.DTpIcu,
          DTpOther: payload.DTpOther,
          DTpOtherTxt: payload.DTpOtherTxt,
          DAnaesthesiologist: payload.DAnaesthesiologist,
          DTransferred: payload.DTransferred,
          DEvaluatedBy: payload.DEvaluatedBy,
          DReceived: payload.DReceived,
          DDischargeFrom: payload.DDischargeFrom
        };

        this.toVitalsArr = payload.TOVITALSIGNOBS.results;
        this.medicationImportDrugArray = payload.TOMEDICATION.results;
        console.log(this.toVitalsArr, this.medicationImportDrugArray, "this.medicationImportDrugArray");


        this.postAssForm.patchValue(patchData);
        (this.postAssForm.get('TOOUTPUT') as FormArray).clear();
        payload.TOOUTPUT.results.forEach(group => this.addOut(group));

        (this.postAssForm.get('TOINTAKE') as FormArray).clear();
        payload.TOINTAKE.results.forEach(group => this.addDrain(group));

        (this.postAssForm.get('TOVITALSIGNOBS') as FormArray).clear();
        payload.TOVITALSIGNOBS.results.forEach(group => this.addItemVital(group));

        console.log(this.postAssForm, "-----");

      },
      error: (err: any) => {
        this.sharedService.waringSwallModel(`Error ${err}`);
        this.sharedService.waringSwallModel(`POST Error at Nurse Endorsment : ${err}`);
      },
    });
  }


  public handleCheckboxVitals(event) {
    this.isChecked = event.target.checked;
    // this.preCardiacForm.get('isVitals')?.setValue(this.isChecked);
  }

  public openModalVital() {
    if (this.isChecked) return;
    const item = {
      Einri: this.paramsObject.einri,
      Patnr: this.paramsObject.patnr,
      Falnr: this.paramsObject.falnr,
      Lfdnr: this.paramsObject.lfdnr,
      Patient: this.storageService?.patientData?.name,
      admissionDate: this.storageService.patientData.periodStart,
    };
    this.erVitalsModal.openModalForErVital(item);
  }

  public deleteVitalsFromTable(index: number) {
    if (index > -1) {
      this.toVitalsArr.splice(index, 1);
    }
  }

  public importVitalsData(data) {
    data.forEach((el) => {
      this.toVitalsArr = this.toVitalsArr.concat({
        Dockey: '',
        Vdescription: el.Name,
        MeasuredValue: el.ValueFormatted,
        NormalRange: el.NormalRange,
        DateTime: `${new DatePipe('en-US').transform(
          this.getDate(el.Date),
          'dd.MM.yyyy'
        )}/${this.parseTime(el.Time)}`,
        Vunit: el.UnitTxt,
      });
    });
  }


  modalRefUpdateName: BsModalRef;
  selectedMedicationOrder: any[] = [];
  drugArray: any[] = [];

  openModal(template: TemplateRef<any>) {
    // if (this.isReadOnly) return;
    const config: ModalOptions = {
      class:
        'modal-dialog modal-dialog-centered medication-order-case modal-xl',
    };
    this.modalRefUpdateName = this.modalService.show(template, config);
    this.loadMedicationHistoryData();
    // this.medicationImportDrugArray=[];
  }

  loadMedicationHistoryData() {
    this.selectedMedicationOrder = [];
    this.drugArray = [];
    const profileOrderHistory: Subscription = this.ePrescriptionService
      .loadData(
        `e-prescription/OrderHistorylist?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}`,
        false,
        false,
        false,
        false
      )
      .subscribe(
        (resp: any) => {
          if (
            resp.body &&
            resp.body.d &&
            resp.body.d.results &&
            resp.body.d.results.length
          ) {
            //this.configurationData = resp.body.d.results;
            this.drugArray = resp.body.d.results;
            // this.medicationImportDrugArray=[];
          }
          //   this.filterEvents();
        },
        () => {
          profileOrderHistory.unsubscribe();
        }
      );
  }

  medicationImport() {
    if (!this.medicationImportDrugArray) {
      this.medicationImportDrugArray = [];
    }

    this.selectedMedicationOrder.forEach((element) => {
      this.medicationImportDrugArray.push({
        Dockey: '',
        OrderType:
          element.MotypId == '30' ? 'Planned Administration' : 'Discharge',
        Description:
          element.Descrlt +
          element.Quan +
          element.Quanunit +
          element.Routedescr +
          element.N1id,
        HomeMedication: false,
        PatientOwnMed: false,
        Dose: element.Quan + element.Quanunit,
        Validity: `${new DatePipe('en-US').transform(
          this.getDate(element.StartD),
          'dd.MM.yyyy'
        )}-${new DatePipe('en-US').transform(
          this.getDate(element.EndD),
          'dd.MM.yyyy'
        )}`,
        Route: element.Routedescr,
        Amount: '',
        Rate: '',
        Therapy: '00000',
        Id: '',
        OrderingPhysician: element.EmpRespNm,
        Cycle: element.N1id,
      });
    });
    this.modalRefUpdateName.hide();
  }
  collectAllMedicationIData(event: any) {
    if (event.target.checked) {
      this.selectedMedicationOrder = Object.assign([], this.drugArray);
    } else {
      this.selectedMedicationOrder = [];
    }
  }

  collectMedicationIData(event, item) {
    if (event.target.checked) {
      this.selectedMedicationOrder.push(item);
      // this.medicationImportDrugArray.push(item);
    } else {
      const indexOf = this.selectedMedicationOrder.findIndex(
        (x) => x.Meordid == item.Meordid
      );
      if (indexOf !== -1) this.selectedMedicationOrder.splice(indexOf, 1);
      // this.medicationImportDrugArray.splice(index, 1);
    }
  }

  isCheckedMedical(item: any): boolean {
    return this.selectedMedicationOrder.some((x) => x.Meordid == item.Meordid);
  }


  selectedScales: any[] = [];
  scalesArray: any[] = [];
  toScaleArr: any[];
  modalRefScales: BsModalRef;
  noScaleAppicable: any;

  openModalForScales(template: TemplateRef<any>) {
    const config: ModalOptions = {
      class:
        'modal-dialog modal-dialog-centered medication-order-case modal-xl',
    };
    this.modalRefScales = this.modalService.show(template, config);
    this.loadScalesData();
    // this.medicationImportDrugArray=[];
  }

  loadScalesData() {
    // this.selectedScales = [];
    this.toScaleArr = [];
    const scalesOrders: Subscription = this.ePrescriptionService
      .loadData(
        `e-prescription/ScalesList?Patnr=${this.ePrescriptionService.parameters.patnr}`,
        false,
        false,
        false,
        false
      )
      .subscribe(
        (resp: any) => {
          console.log(resp);
          if (
            resp.body &&
            resp.body.d &&
            resp.body.d.results &&
            resp.body.d.results.length
          ) {
            //this.configurationData = resp.body.d.results;
            this.toScaleArr = resp.body.d.results;
            // this.medicationImportDrugArray=[];
            //http://amcqaemr01.ach.jo:8000/sap/opu/odata/sap/ZN_TRANSFER_ASSES_SRV/PatScalesSet?$filter=Patnr
          }
          //   this.filterEvents();
        },
        () => {
          scalesOrders.unsubscribe();
        }
      );
  }

  collectAllScalesData(event: any) {
    if (event.target.checked) {
      this.selectedScales = (Object.assign([], this.toScaleArr));
    } else {
      this.selectedScales = [];
    }
  }

  scalesImport() {
    this.selectedScales.forEach((element) => {
      console.log(element);
      this.scalesArray = this.scalesArray.concat({
        Dockey: '',
        ScaleType: element.Scaletype,
        ScoreDesc: element.ScoreDesc,
        Datetimee: element.DateTime,
        LastScore: element.Score,
      });
    });
    this.modalRefScales.hide();
  }

  isCheckedScale(item: any): boolean {
    return this.selectedScales.some((x) => x.Scaletype == item.Scaletype);
  }

  collectScalesIData(event, item) {
    if (event.target.checked) {
      this.selectedScales.push(item);
    } else {
      const indexOf = this.selectedScales.findIndex(
        (x) => x.Scaletype == item.Scaletype
      );
      if (indexOf !== -1) this.selectedScales.splice(indexOf, 1);
    }
  }


  public createDoc(status?: any, actionType?: any) {
    return new Promise((resolve, reject) => {
      let formData = this.postAssForm.value;
      formData.DocStatus = status;
      formData.Datee = this.sanitizeSAPDateFormat(formData.Datee);
      formData.TimeIn = this.parsePayloadFormateTime(formData.TimeIn);
      formData.TimeOut = this.parsePayloadFormateTime(formData.TimeOut);
      formData['TOINTAKE'] = formData.TOINTAKE.filter(res => res.Amount || res.TypeIntake).map(res => ({
        ...res,
        Datee: this.sanitizeSAPDateFormat(res.Datee),
        Timee: this.parsePayloadFormateTime(res.Timee)
      }));
      formData['TOOUTPUT'] = formData.TOOUTPUT.filter(res => res.Amount || res.TypeOutput).map(res => ({
        ...res,
        Datee: this.sanitizeSAPDateFormat(res.Datee),
        Timee: this.parsePayloadFormateTime(res.Timee)
      }));

      formData['TOMEDICATION'] = this.medicationImportDrugArray;
      formData['TOSCALE'] = this.scalesArray;
      let processedData: any[] = this.postAssForm.value.TOVITALSIGNOBS
        .filter(item => item.VitalSigns !== "")
        .map(item => ({
          ...item,
          Timee: this.parsePayloadFormateTime(item.Timee)
        }));

      formData['TOVITALSIGNOBS'] = processedData;

      this.subscription = this.emergencyService.savePostCareRecord(formData).subscribe({
        next: (data: any) => {
        },
        error: (err: any) => {
          this.sharedService.waringSwallModel(`Error ${err}`);
          this.sharedService.waringSwallModel(`PUT Error at Nurse Assessment for Restraints : ${err}`);
        },
        complete: () => {
          resolve(true);
          if (status === 'edit') {
            this.sharedService.successSwallModel('Nurse Assessment for Restraints updated successfully');
          } else {
            this.sharedService.successSwallModel('Nurse Assessment for Restraints created successfully');
          }
          // this.successEvent.next(true)
        }
      });
    })
  }

  sanitizeSAPDateFormat(date: any) {
    if (typeof date === 'string') {
      return date;
    } else {
      return `\/Date(${date.getTime()})\/`;
    }
  }

  public getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }

  public parseTime(data: string) {
    // Check if data is valid and matches the expected format
    if (!data || data.length !== 11 || data[4] !== 'H' || data[7] !== 'M' || data[10] !== 'S') {
      return null;
    }

    // Extract hours, minutes, and seconds from the input string
    const hours = parseInt(data.slice(2, 4), 10);
    const minutes = parseInt(data.slice(5, 7), 10);
    const seconds = parseInt(data.slice(8, 10), 10);

    // Check if extracted values are valid numbers
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
      return null;
    }

    // Format hours, minutes, and seconds with leading zeros if necessary
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    // Construct the formatted time string
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    return null;
  }

  parseDate(date: string) {
    if (date) {
      if (new Date(new Date(+(date.replace('/Date(', '').replace(')/', ''))).toLocaleDateString("en-US"))) {
        return new Date(new Date(+(date.replace('/Date(', '').replace(')/', ''))).toLocaleDateString("en-US"));
      }
    }
  }

  parsePayloadFormateTime(data: string) {
    if (data && data.length) {
      const strArr: string[] = data.split(':');
      if (data && data.length === 8) {
        return `PT${strArr[0]}H${strArr[1]}M${strArr[2]}S`;
      }
    }
    return null;
  }

}
