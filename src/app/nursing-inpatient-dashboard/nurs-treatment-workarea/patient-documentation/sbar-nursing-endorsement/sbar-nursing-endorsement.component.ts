import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataShareService } from '@services/data-share.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ActionType } from '@services/interfaces/common.enum';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { ImportDiagnosisComponent } from 'src/app/shared-module/nursing-discharge-summary/diagnosis-tab/import-diagnosis/import-diagnosis.component';
import { PhysicianAllergyComponent } from 'src/app/shared-module/paediatrics-adm-document/physician-allergy/physician-allergy.component';
import { DatePipe } from '@angular/common';
import { ErVitalsForSBARComponent } from './er-vitals/er-vitals.component';
import { PhysicianPastSurgicalComponent } from './physician-past-surgical/physician-past-surgical.component';

@Component({
  selector: 'app-sbar-nursing-endorsement',
  templateUrl: './sbar-nursing-endorsement.component.html',
  styleUrls: ['./sbar-nursing-endorsement.component.scss']
})
export class SbarNursingEndorsementComponent implements OnInit {
  @ViewChild('diagnosisNotesKardexId') diagnosisNotesKardex: ImportDiagnosisComponent;
  @ViewChild('createAllergyId') createAllergyId: PhysicianAllergyComponent;
  @ViewChild('erVitalsModal') erVitalsModal: ErVitalsForSBARComponent;
  @ViewChild('pastSurgicalKardexId') pastSurgicalKardex: PhysicianPastSurgicalComponent;
  toVitalsArr: any = [];
  toAllergyArr: any = [];
  toDiagnosisArr: any = [];
  sbarNursingForm: FormGroup;
  yesNoOptions = [
    { value: '0', label: 'Yes' },
    { value: '1', label: 'No' },
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
  paramsObject: any;
  apiJson: any;
  docKey: any;
  private subscription: Subscription;
  private actionTypeSubscription$: Subscription;
  toPastSurgical: any = [];


  constructor(private formBuilder: FormBuilder, private route: ActivatedRoute, private storageService: StorageService, private emergencyService: EmergencyService,
    private sharedService: SharedService, private dataShareService: DataShareService,) {
    this.route.queryParams.subscribe((params) => {
      this.paramsObject = params;
      this.storageService.setEinri(params['einri']);
      this.storageService.setFalnr(params['falnr']);
      this.storageService.setLfdnr(params['lfdnr']);
      this.storageService.setPatnr(params['patnr']);
    });
    this.apiJson = {
      Einri: this.storageService.einri,
      Falnr: this.storageService.falnr,
      Patnr: this.storageService.patnr,
      Lfdnr: this.storageService.lfdnr,
      Lfdbw: this.storageService.lfdnr
    }
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
    }
    )
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


  ngOnInit(): void {
    this.initForm();
  }


  initForm() {
    this.sbarNursingForm = this.formBuilder.group({
      Dockey: [''],
      Dtid: [''],
      Einri: [''],
      Patnr: [''],
      Falnr: [''],
      Lfdnr: [''],
      Orgdo: [''],
      AttendPhy: [''],
      DocStatus: [''],
      ChiefComplaint: [''],
      FullCode: [false],
      Dnr: [false],
      WhenSigned: [''],
      Isolation: [''],
      Diet: [''],
      MDm: [false],
      MHtn: [false],
      MCad: [false],
      MCopd: [false],
      MChf: [false],
      MCva: [false],
      MOthers: [false],
      MOthersTxt: [''],
      RFallingDown: [''],
      RBedsores: [''],
      RAspiration: [''],
      RBleeding: [''],
      RSeizures: [''],
      PrO2Therapy: [''],
      PrLMin: [''],
      PrVentilator: [''],
      PrTracheostomy: [''],
      PrChestTube: [false],
      PrLevelDrainage: [''],
      PrSuctioning: [false],
      PrLastTime: [''],
      PbRegular: [false],
      PbIrregular: [false],
      PbPacemaker: [false],
      PnAlert: [false],
      PnOriented: [false],
      PnDrowsy: [false],
      PnConfused: [false],
      PnUnconscious: [false],
      PnSeizures: [false],
      PgNausea: [false],
      PgVomiting: [false],
      PgDiarrhea: [false],
      PgLastBowel: [''],
      PgEnteralFeeding: [''],
      PgeContinence: [false],
      PgeIncontinence: [false],
      PgeDevice: [false],
      PgeDateInsertion: [''],
      PgeSignificantFindings: [''],
      PsWounds: [false],
      PsDescribe: [''],
      PsDressingBy: [''],
      PmAmbulated: [false],
      PmBedRest: [false],
      PmSplint: [false],
      PmPlace: [''],
      PmPeripheral: [false],
      PmCentral: [false],
      PmTypeAccess: [''],
      PmInsertionDate: [''],
      PmDressingDate: [''],
      PmOtherAssessment: [''],
      PsFamilySupport: [false],
      PsAlone: [false],
      PsNonArabic: [false],
      PsSubstanceAbuse: [false],
      PsPsychiatricHistory: [false],
      PsDeaf: [false],
      PsBlind: [false],
      PsOther: [false],
      PsOtherTxt: [''],
      EnIdBandApplied: [false],
      EnCleanEquipment: [false],
      EnNoSharp: [false],
      EnEquipmentLabel: [false],
      EnFallPreventive: [false],
      EnNursingCallBell: [false],
      EnSeizuresPrecautions: [false],
      NursingRecommendations: [''],

      TOMEDICATION: this.formBuilder.array(
        Array(4).fill(null).map(() => this.formBuilder.group({
          Dockey: [''],
          OrderType: [''],
          Description: [''],
          HomeMedication: [false],
          PatientOwnMed: [false],
          Dose: [''],
          Validity: [''],
          Route: [''],
          Amount: [''],
          Rate: [''],
          Therapy: [''],
          Id: [''],
          OrderingPhysician: [''],
          Cycle: ['']
        }))
      ),

      TOLABTEST: this.formBuilder.array(
        Array(4).fill(null).map(() => this.formBuilder.group({
          Dockey: [''],
          DateTime: [''],
          Catalog: [''],
          Description: [''],
          Done: [''],
          ResultsReady: ['']
        }))
      ),

      TOBLOOD: this.formBuilder.array(
        Array(4).fill(null).map(() => this.formBuilder.group({
          Dockey: [''],
          Date: [''],
          Time: [''],
          Code: [''],
          Description: [''],
          Requested: [''],
          Ready: ['']
        }))
      ),

      TOCONSULTATION: this.formBuilder.array(
        Array(4).fill(null).map(() => this.formBuilder.group({
          Dockey: [''],
          DateTime: [''],
          Consultation: [''],
          EmpResp: [''],
          Informed: [''],
          Seen: ['']
        }))
      ),

      TOSCALE: this.formBuilder.array(
        Array(4).fill(null).map(() => this.formBuilder.group({
          Dockey: [''],
          ScaleType: [''],
          LastScore: [''],
          ScoreDesc: [''],
          Datetimee: ['']
        }))
      )
    });
  }

  getNurseDocDetail(docKey?: any) {
    this.subscription = this.emergencyService.fetchSBARNursingDocument(docKey).subscribe({
      next: (apiResponse: any) => {
        const result = apiResponse?.d?.results?.[0] || {};

        this.sbarNursingForm.patchValue({
          Dockey: result?.Dockey || '',
          Dtid: result?.Dtid || '',
          Einri: result?.Einri || '',
          Patnr: result?.Patnr || '',
          Falnr: result?.Falnr || '',
          Lfdnr: result?.Lfdnr || '',
          Orgdo: result?.Orgdo || '',
          AttendPhy: result?.AttendPhy || '',
          DocStatus: result?.DocStatus || '',
          ChiefComplaint: result?.ChiefComplaint || '',
          FullCode: result?.FullCode ?? false,
          Dnr: result?.Dnr ?? false,
          WhenSigned: result?.WhenSigned || '',
          Isolation: result?.Isolation || '',
          Diet: result?.Diet || '',
          MDm: result?.MDm ?? false,
          MHtn: result?.MHtn ?? false,
          MCad: result?.MCad ?? false,
          MCopd: result?.MCopd ?? false,
          MChf: result?.MChf ?? false,
          MCva: result?.MCva ?? false,
          MOthers: result?.MOthers ?? false,
          MOthersTxt: result?.MOthersTxt || '',
          RFallingDown: result?.RFallingDown || '',
          RBedsores: result?.RBedsores || '',
          RAspiration: result?.RAspiration || '',
          RBleeding: result?.RBleeding || '',
          RSeizures: result?.RSeizures || '',
          PrO2Therapy: result?.PrO2Therapy || '',
          PrLMin: result?.PrLMin || '',
          PrVentilator: result?.PrVentilator || '',
          PrTracheostomy: result?.PrTracheostomy || '',
          PrChestTube: result?.PrChestTube ?? false,
          PrLevelDrainage: result?.PrLevelDrainage || '',
          PrSuctioning: result?.PrSuctioning ?? false,
          PbRegular: result?.PbRegular ?? false,
          PbIrregular: result?.PbIrregular ?? false,
          PbPacemaker: result?.PbPacemaker ?? false,
          PnAlert: result?.PnAlert ?? false,
          PnOriented: result?.PnOriented ?? false,
          PnDrowsy: result?.PnDrowsy ?? false,
          PnConfused: result?.PnConfused ?? false,
          PnUnconscious: result?.PnUnconscious ?? false,
          PnSeizures: result?.PnSeizures ?? false,
          PgNausea: result?.PgNausea ?? false,
          PgVomiting: result?.PgVomiting ?? false,
          PgDiarrhea: result?.PgDiarrhea ?? false,
          PgEnteralFeeding: result?.PgEnteralFeeding || '',
          PgeContinence: result?.PgeContinence ?? false,
          PgeIncontinence: result?.PgeIncontinence ?? false,
          PgeDevice: result?.PgeDevice ?? false,
          PgeDateInsertion: result?.PgeDateInsertion || '',
          PgeSignificantFindings: result?.PgeSignificantFindings || '',
          PsWounds: result?.PsWounds ?? false,
          PsDescribe: result?.PsDescribe || '',
          PsDressingBy: result?.PsDressingBy || '',
          PmAmbulated: result?.PmAmbulated ?? false,
          PmBedRest: result?.PmBedRest ?? false,
          PmSplint: result?.PmSplint ?? false,
          PmPlace: result?.PmPlace || '',
          PmPeripheral: result?.PmPeripheral ?? false,
          PmCentral: result?.PmCentral ?? false,
          PmTypeAccess: result?.PmTypeAccess || '',
          PmInsertionDate: result?.PmInsertionDate || '',
          PmDressingDate: result?.PmDressingDate || '',
          PmOtherAssessment: result?.PmOtherAssessment || '',
          PsFamilySupport: result?.PsFamilySupport ?? false,
          PsAlone: result?.PsAlone ?? false,
          PsNonArabic: result?.PsNonArabic ?? false,
          PsSubstanceAbuse: result?.PsSubstanceAbuse ?? false,
          PsPsychiatricHistory: result?.PsPsychiatricHistory ?? false,
          PsDeaf: result?.PsDeaf ?? false,
          PsBlind: result?.PsBlind ?? false,
          PsOther: result?.PsOther ?? false,
          PsOtherTxt: result?.PsOtherTxt || '',
          EnIdBandApplied: result?.EnIdBandApplied ?? false,
          EnCleanEquipment: result?.EnCleanEquipment ?? false,
          EnNoSharp: result?.EnNoSharp ?? false,
          EnEquipmentLabel: result?.EnEquipmentLabel ?? false,
          EnFallPreventive: result?.EnFallPreventive ?? false,
          EnNursingCallBell: result?.EnNursingCallBell ?? false,
          EnSeizuresPrecautions: result?.EnSeizuresPrecautions ?? false,
          NursingRecommendations: result?.NursingRecommendations || '',
          PrLastTime: this.parseTime(result?.PrLastTime) || '',
          PgLastBowel: this.parseTime(result?.PgLastBowel) || '',
        });

        this.toDiagnosisArr = result.TODIAGNOSIS?.results;
        this.toAllergyArr = result.TOALLERGY?.results;
        this.toVitalsArr = result.TOVITALSIGN?.results;
        this.toPastSurgical = result.TOSURGICALHIST?.results;

        this.bindArray('TOMEDICATION', result.TOMEDICATION?.results, this.createMedicationGroup);
        this.bindArray('TOLABTEST', result.TOLABTEST?.results, this.createLabTestGroup);
        this.bindArray('TOBLOOD', result.TOBLOOD?.results, this.createBloodGroup);
        this.bindArray('TOCONSULTATION', result.TOCONSULTATION?.results, this.createConsultationGroup);
      },
      error: (err: any) => {
        this.sharedService.waringSwallModel(`Error ${err}`);
        this.sharedService.waringSwallModel(`POST Error at Nurse Endorsment : ${err}`);
      },
    });
  }

  createAllergyGroup(item: any = {}) {
    return this.formBuilder.group({
      Agroup: [item.Agroup || ''],
      Description: [item.Description || '']
    });
  }

  createVitalSignGroup(item: any = {}) {
    return this.formBuilder.group({
      Vdescription: [item.Vdescription || ''],
      MeasuredValue: [item.MeasuredValue || ''],
      NormalRange: [item.NormalRange || ''],
      DateTime: [item.DateTime || ''],
      Vunit: [item.Vunit || '']
    });
  }
  createDiagnosisGroup(item: any = {}) {
    return this.formBuilder.group({
      DCode: [item.DCode || ''],
      DDescription: [item.DDescription || ''],
      DRemarks: [item.DRemarks || ''],
      DAdmission: [item.DAdmission || false],
      DDischarge: [item.DDischarge || false],
      DWorking: [item.DWorking || false],
      DPreoperative: [item.DPreoperative || false],
      DSurgery: [item.DSurgery || false],
      DDeath: [item.DDeath || false],
      DDepartment: [item.DDepartment || false],
      DHospital: [item.DHospital || false]
    });
  }
  createMedicationGroup(item: any = {}) {
    return this.formBuilder.group({
      OrderType: [item.OrderType || ''],
      Description: [item.Description || ''],
      HomeMedication: [item.HomeMedication || false],
      PatientOwnMed: [item.PatientOwnMed || false],
      Dose: [item.Dose || ''],
      Validity: [item.Validity || ''],
      Route: [item.Route || ''],
      Amount: [item.Amount || ''],
      Rate: [item.Rate || ''],
      Therapy: [item.Therapy || ''],
      Id: [item.Id || ''],
      OrderingPhysician: [item.OrderingPhysician || ''],
      Cycle: [item.Cycle || '']
    });
  }
  createSurgicalHistGroup(item: any = {}) {
    return this.formBuilder.group({
      SurgeryName: [item.SurgeryName || ''],
      Sdate: [item.Sdate || ''],
      SurgeryRemarks: [item.SurgeryRemarks || '']
    });
  }
  createLabTestGroup(item: any = {}) {
    return this.formBuilder.group({
      DateTime: [item.DateTime || ''],
      Catalog: [item.Catalog || ''],
      Description: [item.Description || ''],
      Done: [item.Done || '0'],
      ResultsReady: [item.ResultsReady || '0']
    });
  }
  createBloodGroup(item: any = {}) {
    return this.formBuilder.group({
      Date: [item.Date || ''],
      Time: [item.Time || ''],
      Code: [item.Code || ''],
      Description: [item.Description || ''],
      Requested: [item.Requested || '0'],
      Ready: [item.Ready || '0']
    });
  }
  createConsultationGroup(item: any = {}) {
    return this.formBuilder.group({
      DateTime: [item.DateTime || ''],
      Consultation: [item.Consultation || ''],
      EmpResp: [item.EmpResp || ''],
      Informed: [item.Informed || '0'],
      Seen: [item.Seen || '0']
    });
  }

  bindArray(field: string, list: any[], createFn: (item?: any) => FormGroup) {
    const arr = this.formBuilder.array([]);
    if (list?.length) {
      list.forEach(item => arr.push(createFn.call(this, item)));
    } else {
      for (let i = 0; i < 4; i++) arr.push(createFn.call(this));
    }
    this.sbarNursingForm.setControl(field, arr);
  }

  openModalForDiagnosis() {
    this.diagnosisNotesKardex.openModalForDiagnosisKardex();
  }

  duplicates: any = [];
  importDiagnosisData(data) {
    data.forEach(el => {
      this.toDiagnosisArr = this.toDiagnosisArr.concat({
        "Dockey": "",
        "DCode": el.DiagKey1,
        "DDescription": el.DiagShorttext,
        "DRemarks": el.DiagText,
        "DAdmission": el.AdmissionDia,
        "DDischarge": el.DischargeDia,
        "DWorking": el.WorkDiagInd,
        "DPreoperative": el.PreopDiagInd,
        "DSurgery": el.SurgeryDia,
        "DDeath": el.CauseOfDeath,
        "DDepartment": el.DeptMainDia,
        "DHospital": el.HospMainDia
      });
    });
    this.duplicates = [];
    this.duplicates = this.findDuplicatesDiagnosis();
    this.toDiagnosisArr = this.toDiagnosisArr.filter((value, index, self) =>
      index === self.findIndex((t) => (
        t.DCode === value.DCode
      ))
    )
    if (this.duplicates.length > 0) {
      this.errorMsgForDuplicatesDiagnosis();
    }

  }
  findDuplicatesDiagnosis() {
    let tempArr = []
    const lookup = this.toDiagnosisArr.reduce((a, e) => {
      a[e.DCode] = ++a[e.DCode] || 0;
      return a;
    }, {});
    tempArr = this.toDiagnosisArr.filter(e => lookup[e.DCode]);
    return tempArr.filter((value, index, self) =>
      index === self.findIndex((t) => (
        t.DCode === value.DCode
      ))
    )

  }
  errorMsgForDuplicatesDiagnosis() {
    let codeArr = [];
    this.duplicates.forEach(element => {
      codeArr.push(element.DCode);
    });

    Swal.fire({
      text: `${codeArr.toString()} is/are already Imported `,
      icon: 'warning',
      confirmButtonText: 'Ok',
      customClass: 'myalertpopup'
    })
  }
  deleteDiagnosisFromTable(item, index) {
    this.toDiagnosisArr.splice(index, 1);
  }

  public openModalForAllergy() {
    this.createAllergyId.openModalForAllergy();
  }

  public importAllergyData(data) {
    data.forEach((el) => {
      this.toAllergyArr = this.toAllergyArr.concat({
        Dockey: '',
        Agroup: el.AllergenGrp,
        Description: el.Allergen,
      });
    });
    this.duplicates = [];
    this.duplicates = this.findDuplicatesAllergy();
    this.toAllergyArr = this.toAllergyArr.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.Description === value.Description)
    );
    if (this.duplicates.length > 0) {
      this.errorMsgForDuplicatesAllergy();
    }
  }

  private errorMsgForDuplicatesAllergy() {
    let codeArr = [];
    this.duplicates.forEach((element) => {
      codeArr.push(element.Description);
    });

    Swal.fire({
      text: `${codeArr.toString()} is/are already Imported `,
      icon: 'warning',
      confirmButtonText: 'Ok',
      customClass: 'myalertpopup',
    });
  }

  private findDuplicatesAllergy() {
    let tempArr = [];
    const lookup = this.toAllergyArr.reduce((a, e) => {
      a[e.Description] = ++a[e.Description] || 0;
      return a;
    }, {});
    tempArr = this.toAllergyArr.filter((e) => lookup[e.Description]);
    return tempArr.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.Description === value.Description)
    );
  }

  public deleteFromAllergy(item, index) {
    this.toAllergyArr.splice(index, 1);
  }

  isChecked: any = false;
  public handleCheckboxVitals(event) {
    this.isChecked = event.target.checked;
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

  createSbarNursingDoc(status?: any, actionType?: any) {
    return new Promise((resolve, reject) => {
      let Payload = {...this.sbarNursingForm.value};
      Payload['TODIAGNOSIS'] = this.toDiagnosisArr;
      Payload['TOALLERGY'] = this.toAllergyArr;
      Payload['TOVITALSIGN'] = this.toVitalsArr;
      Payload['TOSURGICALHIST'] = this.toPastSurgical;
      this.subscription = this.emergencyService.saveSBARNursingDoc(Payload).subscribe({
        next: (data: any) => {

        },
        error: (err: any) => {
          this.sharedService.waringSwallModel(`Error ${err}`);
          this.sharedService.waringSwallModel(`PUT Error at SBAR Nursing Endorsement Document  : ${err}`);
        },
        complete: () => {
          resolve(true);
          if (status === 'edit') {
            this.sharedService.successSwallModel('SBAR Nursing Endorsement Document updated successfully');
          } else {
            this.sharedService.successSwallModel('SBAR Nursing Endorsement Document created successfully');
          }
        }
      });
    })
  }


  public getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }

  convertTimeToDuration(timeString: string): string {
    if (!timeString) return '';

    const [hours, minutes, seconds] = timeString.split(':').map(Number);

    // Ensure values are properly formatted
    const formattedHours = hours ? `PT${hours}H` : 'PT00H';
    const formattedMinutes = minutes ? `${minutes}M` : '00M';
    const formattedSeconds = seconds ? `${seconds}S` : '00S';

    return `${formattedHours}${formattedMinutes}${formattedSeconds}`;
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

  openModalForPastSurgical() {
    this.pastSurgicalKardex.openModalForPastSurgical();
  }

  importPastSurgical(data) {
    data.forEach((el) => {
      this.toPastSurgical = this.toPastSurgical.concat({
        SurgeryName: el.Surgeryname,
        Sdate: `${new DatePipe('en-US').transform(
          el.Date,
          'yyyy-MM-dd'
        )}T00:00:00`,
        SurgeryRemarks: el.Remarks,
      });
    });
    this.duplicates = [];
    this.duplicates = this.findDuplicatesPastSurgical();
    this.toPastSurgical = this.toPastSurgical.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.SurgeryName === value.SurgeryName)
    );
    if (this.duplicates.length > 0) {
      this.errorMsgForDuplicatesPastSurgical();
    }
  }


  findDuplicatesPastSurgical() {
    let tempArr = [];
    const lookup = this.toPastSurgical.reduce((a, e) => {
      a[e.SurgeryName] = ++a[e.SurgeryName] || 0;
      return a;
    }, {});
    tempArr = this.toPastSurgical.filter((e) => lookup[e.SurgeryName]);
    return tempArr.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.SurgeryName === value.SurgeryName)
    );
  }

  deleteFromPastSurgTable(item, index) {
    this.toPastSurgical.splice(index, 1);
  }

  errorMsgForDuplicatesPastSurgical() {
    let codeArr = [];
    this.duplicates.forEach((element) => {
      codeArr.push(element.SurgeryName);
    });

    Swal.fire({
      text: `${codeArr.toString()} is/are already Imported `,
      icon: 'warning',
      confirmButtonText: 'Ok',
      customClass: 'myalertpopup',
    });
  }


  //For First Tab
  activeTabFirst: string = 'chifComplaint'; // Default tab
  setActiveTabFirst(tab: string): void {
    this.activeTabFirst = tab;
  }

  //For Second Tab
  activeTabSecond: string = 'allergies'; // Default tab
  setActiveTabSecond(tab: string): void {
    this.activeTabSecond = tab;
  }

  //For Third Tab
  activeTabThird: string = 'risk'; // Default tab
  setActiveTabThird(tab: string): void {
    this.activeTabThird = tab;
  }

  //For Third Tab
  activeTabFour: string = 'medication'; // Default tab
  setActiveTabFour(tab: string): void {
    this.activeTabFour = tab;
  }

  code = [
    { code: 'A001', admission: false, discharge: false, working: false, preop: false, surgery: false, cause: false, department: false, hospital: false },
    { code: 'B002', admission: true, discharge: false, working: true, preop: false, surgery: true, cause: false, department: true, hospital: false },
    { code: 'C003', admission: false, discharge: true, working: false, preop: true, surgery: false, cause: true, department: false, hospital: true },
    { code: 'D004', admission: true, discharge: true, working: true, preop: false, surgery: true, cause: false, department: false, hospital: false },
    { code: 'E005', admission: false, discharge: false, working: false, preop: false, surgery: false, cause: false, department: true, hospital: true },
    { code: 'F006', admission: true, discharge: false, working: false, preop: true, surgery: false, cause: true, department: true, hospital: false },
    { code: 'G007', admission: false, discharge: false, working: true, preop: false, surgery: true, cause: false, department: false, hospital: true },
    { code: 'H008', admission: true, discharge: true, working: true, preop: true, surgery: true, cause: true, department: true, hospital: true }
  ];


}
