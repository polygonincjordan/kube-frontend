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
import Swal from 'sweetalert2';
import { ScalesGlosgowComaComponent } from 'src/app/nursing-inpatient-dashboard/check-in/er-triage/scales-glosgow-coma/scales-glosgow-coma.component';
import { ScalesFacePainComponent } from 'src/app/nursing-inpatient-dashboard/check-in/er-triage/scales-face-pain/scales-face-pain.component';
import { ScalesNumericRatingComponent } from 'src/app/nursing-inpatient-dashboard/check-in/er-triage/scales-numeric-rating/scales-numeric-rating.component';
import { ModifiedAldreteDocumentForInportComponent } from './modified-aldrete-document/modified-aldrete-document.component';
import { OrderType } from '@services/interfaces/common.enum';

@Component({
  selector: 'app-post-anesthesia-care-record',
  templateUrl: './post-anesthesia-care-record.component.html',
  styleUrls: ['./post-anesthesia-care-record.component.scss'],
})
export class PostAnesthesiaCareRecordComponent implements OnInit, OnDestroy {

  @ViewChild('erVitalsModal') erVitalsModal: ErVitalsForSBARComponent;
  @ViewChild('scalesGlosgow') scalesGlosgow: ScalesGlosgowComaComponent;
  @ViewChild('scalesFacePain') scalesFacePain: ScalesFacePainComponent;
  @ViewChild('scalesNumericRating') scalesNumericRating: ScalesNumericRatingComponent;
  @ViewChild('aldreteScaleModalRef') aldreteScaleModalRef: ModifiedAldreteDocumentForInportComponent;
  public CurrentDateAndTime: Date = new Date();
  postAssForm: FormGroup;
  paramsObject: any;
  public toVitalsArr: any = [];
  orderType = OrderType;

  tabItems = [
    { label: 'Vital Signs', value: '1' },
    { label: 'Aldrete Score', value: '2' },
    { label: 'Intake/Output', value: '3' },
    { label: 'Post Anaesthesia Complications', value: '4' },
    { label: 'Current Medication', value: '5' },
  ];
  scalesList = [
    { ScaleType: 'Glasgow Coma Scale', LastScore: '', description: '', Datetimee: '', value: '1', Dockey: '', },
    { ScaleType: 'Face pain scale', LastScore: '', description: '', Datetimee: '', value: '2', Dockey: '', },
    { ScaleType: 'Numeric rating scale(more than 8 years)', LastScore: '', description: '', Datetimee: '', value: '3', Dockey: '', },
    { ScaleType: 'Modified Aldrete Score (MAS)', LastScore: '', description: '', Datetimee: '', value: '4', Dockey: '', },
  ];
  tableHeading = ['Time', 'Vital Signs', '0 min', '10 min', '20 min', '30 min', '40 min', '50 min', '60 min', '70 min', '80 min', '90 min', '100 min', '110 min', '120 min']
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
  userProfile: any;
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
    this.userProfile = this.storageService.getUserProfile();
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
      TimeIn: [''],
      TimeOut: [''],
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
      NnNursingInitials: [this.userProfile?.UserName],
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
      Datee: [this.getDate(item?.Datee) ?? new Date()],
      Timee: [this.parseTime(item?.Timee) ?? this.currentTime],
      TypeIntake: [item?.TypeIntake ?? ''],
      Amount: [item?.Amount ?? '']
    });
    drainGroup.get('Amount').valueChanges.subscribe(() => {
      this.calculateTotalAmountForIntake();
    });
    this.TOINTAKE.push(drainGroup);
  }

  calculateTotalAmountForIntake() {
    const total = this.TOINTAKE.controls.reduce((sum, group) => {
      const amount = parseFloat(group.get('Amount').value) || 0;
      return sum + amount;
    }, 0);

    this.postAssForm.get('IoGrandTotalIntake').setValue(total);
    let mainTotal = parseFloat(this.postAssForm.value.IoGrandTotalIntake || 0) - parseFloat(this.postAssForm.value.IoGrandTotalOutput || 0);
    this.postAssForm.get('IoFluidBalance').setValue(mainTotal);
  }


  removeDrain(index: number) {
    this.TOINTAKE.removeAt(index);
    this.calculateTotalAmountForIntake();
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  addOut(item?) {
    const drainGroup = this.formBuilder.group({
      Dockey: [item?.Dockey ?? ''],
      Datee: [this.getDate(item?.Datee) ?? new Date()],
      Timee: [this.parseTime(item?.Timee) ?? this.currentTime],
      TypeOutput: [item?.TypeOutput ?? ''],
      Amount: [item?.Amount ?? '']
    });
    drainGroup.get('Amount').valueChanges.subscribe(() => {
      this.calculateTotalAmount();
    });
    this.TOOUTPUT.push(drainGroup);
  }

  calculateTotalAmount() {
    const total = this.TOOUTPUT.controls.reduce((sum, group) => {
      const amount = parseFloat(group.get('Amount').value) || 0;
      return sum + amount;
    }, 0);

    this.postAssForm.get('IoGrandTotalOutput').setValue(total);
    let mainTotal = parseFloat(this.postAssForm.value.IoGrandTotalIntake || 0) - parseFloat(this.postAssForm.value.IoGrandTotalOutput || 0);
    this.postAssForm.get('IoFluidBalance').setValue(mainTotal);
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
    this.calculateTotalAmount();
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
          Orgdo: this.storageService.patientData.deptOrgUnit,
          AttendPhy: this.storageService.getUserProfile().Gpart,
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
          TimeIn: payload.TimeIn == 'PT00H00M00S' ? '' : this.parseTime(payload.TimeIn),
          TimeOut: payload.TimeOut == 'PT00H00M00S' ? '' : this.parseTime(payload.TimeOut),
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

        this.postAssForm.patchValue(patchData);
        if(payload.TOOUTPUT.results.length) {
          (this.postAssForm.get('TOOUTPUT') as FormArray).clear();
          payload.TOOUTPUT.results.forEach(group => this.addOut(group));
        }

        if(payload.TOINTAKE.results.length) {
          (this.postAssForm.get('TOINTAKE') as FormArray).clear();
          payload.TOINTAKE.results.forEach(group => this.addDrain(group));
        }

        if(payload.TOVITALSIGNOBS.results.length) {
          (this.postAssForm.get('TOVITALSIGNOBS') as FormArray).clear();
          payload.TOVITALSIGNOBS.results.forEach(group => this.addItemVital(group));
        }

        payload?.TOSCALE?.results.forEach((element) => {
        this.scalesList.forEach((res: any) => {
          if (element.ScaleType == res.ScaleType && element.LastScore) {
            res.Datetimee = element.Datetimee,
              res.Dockey = element.Dockey,
              res.description = element.ScoreDesc,
              res.LastScore = element.LastScore,
              res.ScaleType = element.ScaleType
          }
        })
      })
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
    const scalesOrders: Subscription = this.ePrescriptionService.loadData(`e-prescription/ScalesList?Patnr=${this.ePrescriptionService.parameters.patnr}`, false, false, false, false).subscribe((resp: any) => {
      console.log(resp)
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        //this.configurationData = resp.body.d.results;
        // this.toScaleArr = resp.body.d.results;
        if (resp.body?.d?.results.length) {
          let requiredScales = ["Glasgow Coma Scale", "Braden scale for predicting pressure ulcers", "Face pain scale", 'Modified Aldrete Score (MAS)'];
          this.toScaleArr = resp.body.d.results.filter(scale => requiredScales.includes(scale.Scaletype)).map(scale => ({ ...scale, isSelected: false }));
        }
        // this.medicationImportDrugArray=[];
        //http://http://192.168.193.9:6051:8000/sap/opu/odata/sap/ZN_TRANSFER_ASSES_SRV/PatScalesSet?$filter=Patnr
      }
      //   this.filterEvents();
    }, () => { scalesOrders.unsubscribe(); });
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
      this.scalesList.forEach((res: any) => {
        if (element.Scaletype == res.ScaleType && element.Score) {
          res.Datetimee = element.DateTime,
            res.Dockey = element.Dockey,
            res.ScoreDesc = element.ScoreDesc,
            res.LastScore = element.Score,
            res.ScaleType = element.Scaletype
        }
      })
    })
    console.log(this.scalesList, this.selectedScales, "-");
    
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

  // Open Glosgow Scale Model
  openGlosgowComaModel(item: any) {
    if (this.noScaleAppicable) return;
    this.scalesEditConfirmationMsg(item);
  }

  scalesEditConfirmationMsg(item: { value: string; }) {
    Swal.fire({
      text: 'Are you sure you want to edit scale',
      icon: 'warning',
      confirmButtonText: 'Yes',
      showCancelButton: true,
      cancelButtonText: 'No',
      customClass: { popup: 'myalertpopup' },
    }).then((res) => {
      if (res.isConfirmed) {
        if (item.value == '1') {
          this.scalesGlosgow.openModalForGlosgow('');
        } else if (item.value == '2') {
          this.scalesFacePain.openModalForFacePain('');
        } else if (item.value == '3') {
          this.scalesNumericRating.openModalForNumericRating('');
        } else if (item.value == '4') {
          this.aldreteScaleModalRef.openModalForAldreteDocument('');
        }
      }
    });
  }

  viewGlosgowModel(item) {
    if (this.noScaleAppicable) return;
    if (item.value == '1') {
      if (item.Dockey) {
        this.scalesGlosgow.openModalForGlosgow(item.Dockey);
      } else {
        this.sharedService.waringSwallModel('No data found');
      }
    } else if (item.value == '2') {
      if (item.Dockey) {
        this.scalesFacePain.openModalForFacePain(item.Dockey);
      } else {
        this.sharedService.waringSwallModel('No data found');
      }
    } else if (item.value == '3') {
      if (item.Dockey) {
        this.scalesNumericRating.openModalForNumericRating(item.Dockey);
      } else {
        this.sharedService.waringSwallModel('No data found');
      }
    } else if (item.value == '4') {
      // item.Dockey = 'SCA000000000000001000003278000000'
      if (item.Dockey) {
        this.aldreteScaleModalRef.openModalForAldreteDocument(item.Dockey);
      } else {
        this.sharedService.waringSwallModel('No data found');
      }
    }
  }


  // Set Glasgow Scale Value In Table List
  glasgowValue(event) {
    this.scalesList[0].LastScore = event?.totalScore.toString();
    this.scalesList[0].description = event?.description;
    this.scalesList[0].Dockey = event?.dockey;
    this.scalesList[0].Datetimee = `${new DatePipe('en-US').transform(
      event?.date,
      'dd.MM.yyyy'
    )}/${event?.time}`;
  }

  // Set Numberic Scale Value In Table List
  numericValue(event) {
    this.scalesList[2].LastScore = event?.totalScore;
    this.scalesList[2].description = event?.description;
    this.scalesList[2].Dockey = event?.dockey;
    this.scalesList[2].Datetimee = `${new DatePipe('en-US').transform(
      event?.date,
      'dd.MM.yyyy'
    )}/${event?.time}`;
  }

  // Set Numberic Scale Value In Table List
  aldreteScale(event) {
    this.scalesList[3].LastScore = event?.totalScore;
    this.scalesList[3].description = event?.description;
    this.scalesList[3].Dockey = event?.dockey;
    this.scalesList[3].Datetimee = `${new DatePipe('en-US').transform(
      event?.date,
      'dd.MM.yyyy'
    )}/${event?.time}`;
  }

  // Set Face Pain Scale Value In tTable List
  facePainValue(event) {
    this.scalesList[1].LastScore = event?.totalScore;
    this.scalesList[1].description = event?.description;
    this.scalesList[1].Dockey = event?.dockey;
    this.scalesList[1].Datetimee = `${new DatePipe('en-US').transform(
      event?.date,
      'dd.MM.yyyy'
    )}/${event?.time}`;
  }

  onTransferChange(selected: 'DTpWard' | 'DTpIcu' | 'DTpOther') {
    const controls = ['DTpWard', 'DTpIcu', 'DTpOther'];

    controls.forEach(ctrl => {
      this.postAssForm.get(ctrl).setValue(ctrl === selected);
    });

    // Reset the textbox if "Other" is deselected
    if (selected !== 'DTpOther') {
      this.postAssForm.get('DTpOtherTxt').setValue('');
    }

    console.log(this.postAssForm, "---");
    
  }

  AnesthesiaCheck(selected: 'AGeneral' | 'ASpinal' | 'AEpidural' | 'AIvBlock' | 'AConsciousSedation' | 'AOtherRegional') {
    const controls = ['AGeneral', 'ASpinal', 'AEpidural', 'AIvBlock', 'AConsciousSedation', 'AOtherRegional'];

    controls.forEach(ctrl => {
      this.postAssForm.get(ctrl).setValue(ctrl === selected);
    });

  }


  public createDoc(status?: any, actionType?: any) {
    return new Promise((resolve, reject) => {
      let formData = this.postAssForm.value;
      formData.DocStatus = status;
      formData.IoFluidBalance = formData?.IoFluidBalance?.toString();
      formData.IoGrandTotalIntake = formData?.IoGrandTotalIntake?.toString();
      formData.IoGrandTotalOutput = formData?.IoGrandTotalOutput?.toString();
      formData.Datee = this.sanitizeSAPDateFormat(formData.Datee);
      formData.TimeIn = formData.TimeIn ? this.parsePayloadFormateTime(formData.TimeIn) : 'PT00H00M00S';
      formData.TimeOut = formData.TimeOut ? this.parsePayloadFormateTime(formData.TimeOut) : 'PT00H00M00S';
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
      let checkScalesList: any[] = this.scalesList.filter((res) => {
        delete res.description;
        delete res.value;
        if (res.LastScore) return res;
      });
      formData['TOSCALE'] = checkScalesList;
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
          this.sharedService.waringSwallModel(`PUT Error at Post Anesthesia Care Record : ${err}`);
        },
        complete: () => {
          resolve(true);
          if (status === 'edit') {
            this.sharedService.successSwallModel('Post Anesthesia Care Record updated successfully');
          } else {
            this.sharedService.successSwallModel('Post Anesthesia Care Record created successfully');
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
