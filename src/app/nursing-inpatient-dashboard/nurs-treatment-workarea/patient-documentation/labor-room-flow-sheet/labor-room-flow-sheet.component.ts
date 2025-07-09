import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdmissionService } from '@services/admission/admission.service';
import { DataShareService } from '@services/data-share.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { Subscription } from 'rxjs';
import { ActionType } from '@services/interfaces/common.enum';
import { PhysicianAllergyComponent } from 'src/app/shared-module/paediatric-physician-assessment/physician-allergy/physician-allergy.component';
import Swal from 'sweetalert2';
import { GlosGowCommaScalePopupComponent } from 'src/app/shared-module/paediatrics-adm-document/glos-gow-comma-scale/glos-gow-comma-scale-popup.component';
import { MorseFallScaleComponent } from 'src/app/shared-module/paediatrics-adm-document/morse-fall-scale/morse-fall-scale.component';
import { BradenScaleComponent } from 'src/app/shared-module/paediatrics-adm-document/braden-scale/braden-scale.component';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-labor-room-flow-sheet',
  templateUrl: './labor-room-flow-sheet.component.html',
  styleUrls: ['./labor-room-flow-sheet.component.scss']
})
export class LaborRoomFlowSheetComponent implements OnInit {
  @ViewChild('createAllergyId') createAllergyId: PhysicianAllergyComponent;
  @ViewChild('scalesGlosgow') scalesGlosgow: GlosGowCommaScalePopupComponent;
  @ViewChild('morseFallScale') morseFallScale: MorseFallScaleComponent;
  @ViewChild('bradenScaleTemp') bradenScaleTemp: BradenScaleComponent;
  labourForm: FormGroup;

  currentTime: string;
  paramsObject: any;
  apiJson: any;

  toAllergyArr: any = [];
  duplicates: any[];
  docKey: any;

  public scalesList: any[] = [
    {
      ScaleType: 'Glasgow Coma Scale',
      LastScore: '',
      ScoreDesc: '',
      Datetimee: '',
      value: '1',
      Dockey: '',
    },
    {
      ScaleType: 'Morse Fall Scale (MFS)',
      LastScore: '',
      ScoreDesc: '',
      Datetimee: '',
      value: '2',
      Dockey: '',
    },
    {
      ScaleType: 'Braden scale for predicting pressure ulcers',
      LastScore: '',
      ScoreDesc: '',
      Datetimee: '',
      value: '3',
      Dockey: '',
    },
  ];

  status = [
    { value: '0', label: 'Normal' },
    { value: '1', label: 'Birth Defects' },
    { value: '2', label: 'Premature' },
    { value: '3', label: 'Post Mature' },
  ];
  public gender = [
    { value: '1', label: 'Male' },
    { value: '2', label: 'Female' },
    { value: '3', label: 'UnKnown' }
  ]
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

  private subscription: Subscription;
  private actionTypeSubscription$: Subscription;

  constructor(private modalService: BsModalService, private ePrescriptionService: EPrescriptionService, public storageService: StorageService, private dataShareService: DataShareService,
    private sharedService: SharedService, private route: ActivatedRoute, private fb: FormBuilder, private emergencyService: EmergencyService
  ) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    this.currentTime = `${hours}:${minutes}:${seconds}`;

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
    this.initForm();
    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe((data) => {
      if (data != null) {
        if (data.type == ActionType.Add$ && data.value == '') {
          this.docKey = data.value.Dockey
        }
        if (data.type == ActionType.Update$ && data.value) {
          this.docKey = data.value.docKey
          this.getNurseDocDetail()
        }
        if (data.type == ActionType.Copy$ && data.value) {
          this.docKey = data.value.docKey
          this.getNurseDocDetail()
        }
      } else if (data.type == ActionType.Copy$ && data.value) {
        this.docKey = data.value.docKey
        this.getNurseDocDetail()
      }
    });
  }


  ngOnInit(): void {
  }

  initForm() {
    this.labourForm = this.fb.group({
      Dockey: [''],
      Dtid: ['ZMED_LABOR'],
      Einri: [this.paramsObject.einri],
      Patnr: [this.paramsObject.patnr],
      Falnr: [this.paramsObject.falnr],
      Lfdnr: [this.paramsObject.lfdnr],
      Orgdo: [this.storageService.patientData.deptOrgUnit],
      AttendPhy: [this.storageService.getUserProfile().Gpart],
      DocStatus: ['1'],
      Datee: [new Date()],
      Timee: [this.currentTime],
      Gravida: [''],
      Para: [''],
      Abortion: [''],
      NoOfAlive: [''],
      NoOfDead: [''],
      NormalDelivery: [''],
      Lmp: [new Date()],
      Edd: [new Date()],
      GestationalAge: [''],
      Height: [''],
      Weight: [''],

      // History
      HAph: [false],
      HPph: [false],
      HPreviousCs: [false],
      HVbAfterCs: [false],
      HAbdominalSurgery: [false],
      HAbdominalSurgeryTxt: [''],

      // Risk Factors
      RfGrandMultiparity: [false],
      RfPih: [false],
      RfPolyhydramnios: [false],
      RfTwins: [false],
      RfFetalAnomalies: [false],
      RfDiabetesMellitus: [false],
      RfPlacentaPrevia: [false],
      RfAbruptioPlacenta: [false],
      RfOligohydramnios: [false],
      RfProm: [false],
      RfLargeGa: [false],
      RfGdm: [false],
      RfSmallGa: [false],
      RfHeartDisease: [false],
      RfAntepartum: [false],
      RfMedicalProblem: [false],
      RfMedicalProblemTxt: [''],
      RfSurgicalProblem: [false],
      RfSurgicalProblemTxt: [''],

      // Reason for Admission
      RaLabourPain: [false],
      RaRupture: [false],
      RaLeaking: [false],
      RaBleeding: [false],
      RaInduction: [false],
      RaOther: [false],
      RaOtherTxt: [''],

      // Reason for Induction
      RiPostDate: [false],
      RiNonReassuring: [false],
      RiPatientRequest: [false],
      RiIugr: [false],
      RiOligo: [false],
      RiMedicalReason: [false],
      RiMedicalReasonTxt: [''],

      // Method of Induction
      MiPge2: [false],
      MiPropess: [false],
      MiSyntocinon: [false],
      MiAugmentation: [false],
      MiSyntocinon1: [false],
      MiArm: [false],

      // Assessment
      AaOlSpontaneous: [false],
      AaOlAugmentation: [false],
      AaOlInduced: [false],
      AaMmArm: [false],
      AaMmLeaking: [false],
      AaMmSrom: [false],
      AaMmSince: [''],
      AaMcLight: [false],
      AaMcStained: [false],
      AaMcThick: [false],
      AaLClear: [false],
      AaLBloodStained: [false],
      AaCReactive: [false],
      AaCNonreactive: [false],
      AaAeCephalic: [false],
      AaAeCephalicTxt: [''],
      AaAeFrom: [false],
      AaAeFromTxt: [''],
      AaAeBreech: [false],
      AaAeTransverse: [false],

      // Bishop Score
      BsDilatation: [''],
      BsEffacement: [''],
      BsStation: [''],
      BsPosition: [''],
      BsConsistency: [''],
      BsTotalScore: [''],
      BsTotalScoreDesc: [''],
      BsPelvicExam: [''],
      BsManagement: [false],
      BsCannula: [false],
      BsIvCannula: [false],
      BsCtg: [false],
      BsEpiduralUsed: [false],
      BsYes: [false],
      BsNo: [false],
      BsNoTxt: [''],
      BsCatheter: [false],
      BsRemoved: [false],
      BsNotRemoved: [false],

      // Post Delivery
      PdTimeDelivery: [''],
      PdModeDelivery: [false],
      PdNsvd: [false],
      PdVacuum: [false],
      PdForceps: [false],
      PdPlacenta: [false],
      PdComplete: [false],
      PdIncomplete: [false],
      PdPerineum: [false],
      PdIntact: [false],
      PdEpisiotomy: [false],
      PdLaceration: [false],
      PdExtendedTear: [false],
      PdOther: [false],
      PdOtherTxt: [''],
      PdBloodLoss: [false],
      PdAverage: [false],
      PdExcessive: [false],
      PdEstimatedBlood: [false],
      PdEstimatedBloodTxt: [''],
      PdCervix: [false],
      PdIntact1: [false],
      PdUterus: [false],
      PdAtony: [false],
      PdContracted: [false],
      PdComments: [''],
      PdAnLocal: [false],
      PdAnGeneral: [false],
      PdAnEpidural: [false],
      PdAnOther: [false],
      PdAnOtherTxt: [''],
      PdIfPost: [false],
      PdCervical: [false],
      PdAtonic: [false],
      PdRetained: [false],
      PdVaginal: [false],
      PdPerineal: [false],
      TONEONATAL: this.fb.array([]),
      TOLABTEST: this.fb.array([]),
    });

    for (let i = 0; i < 5; i++) {
      this.addDrain('', i)
    }
    for (let i = 0; i < 5; i++) {
      this.addLabTest('', i)
    }
    this.getPatientDeliveryDetails();
  }

  get TONEONATAL(): FormArray {
    return this.labourForm.get('TONEONATAL') as FormArray;
  }

  addDrain(item?, index?) {
    const drainGroup = this.fb.group({
      Dockey: [item?.Dockey ?? ''],
      Noo: [item?.Noo ?? (this.TONEONATAL.length + 1).toString()],
      Timee: [this.parseTime(item?.Timee) ?? this.currentTime],
      Sex: [item?.Sex ?? ''],
      Wt: [item?.Wt ?? ''],
      ApgarScore1: [item?.ApgarScore1 ?? ''],
      ApgarScore5: [item?.ApgarScore5 ?? ''],
      ApgarScore10: [item?.ApgarScore10 ?? ''],
      StatusDesc: [item?.StatusDesc ?? '']
    });

    this.TONEONATAL.push(drainGroup);
  }

  get TOLABTEST(): FormArray {
    return this.labourForm.get('TOLABTEST') as FormArray;
  }

  addLabTest(item?, index?) {
    const drainGroup = this.fb.group({
      Dockey: [item?.Dockey ?? ''],
      Description: [item?.Description ?? ''],
      Value: [item?.Value ?? ''],
      ValueConfi: [item?.ValueConfi ?? ''],
      Range: [item?.Range ?? ''],
      DateTime: [this.dateStringNewDate(item?.DateTime) ?? new Date()]
    });

    this.TOLABTEST.push(drainGroup);
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


  getPatientDeliveryDetails() {
    this.emergencyService
      .fetchPatientDeliveryDetail(this.paramsObject.falnr)
      .subscribe((response: any) => {
        const deliveryDetails = response?.d?.results[0];
        const neonatalArray = deliveryDetails.TOPATDEL.results || [];

        const formArray = this.TONEONATAL;
        formArray.clear();
        neonatalArray.forEach((item, index) => {
          const convertedItem = {
            Dockey: deliveryDetails.Faln1,
            Noo: (index + 1).toString(),
            Timee: item.Gbtim,
            Sex: item.Gschl,
            Wt: item.Gbgew,
            ApgarScore1: item.Bwert,
            ApgarScore5: item.Bwert5,
            ApgarScore10: item.Bwert10,
            StatusDesc: ''
          };
          this.addDrain(convertedItem, index);
        });
      });
  }

  getNurseDocDetail() {
    this.subscription = this.emergencyService.fetcLaborRoomDocDetails(this.docKey).subscribe({
      next: (apiResponse: any) => {
        let data = apiResponse?.d?.results[0] || {};
        console.log(data, "----")
        this.labourForm.patchValue({
          Dockey: data.Dockey,
          Dtid: data.Dtid,
          Einri: data.Einri,
          Patnr: data.Patnr,
          Falnr: data.Falnr,
          Lfdnr: data.Lfdnr,
          Orgdo: data.Orgdo,
          AttendPhy: data.AttendPhy,
          DocStatus: data.DocStatus,
          Datee: this.getDate(data.Datee),
          Timee: this.parseTime(data.Timee),
          Gravida: data.Gravida,
          Para: data.Para,
          Abortion: data.Abortion,
          NoOfAlive: data.NoOfAlive,
          NoOfDead: data.NoOfDead,
          NormalDelivery: data.NormalDelivery,
          Lmp: this.getDate(data.Lmp),
          Edd: this.getDate(data.Edd),
          GestationalAge: data.GestationalAge,
          Height: data.Height,
          Weight: data.Weight,

          // History
          HAph: data.HAph,
          HPph: data.HPph,
          HPreviousCs: data.HPreviousCs,
          HVbAfterCs: data.HVbAfterCs,
          HAbdominalSurgery: data.HAbdominalSurgery,
          HAbdominalSurgeryTxt: data.HAbdominalSurgeryTxt,

          // Risk Factors
          RfGrandMultiparity: data.RfGrandMultiparity,
          RfPih: data.RfPih,
          RfPolyhydramnios: data.RfPolyhydramnios,
          RfTwins: data.RfTwins,
          RfFetalAnomalies: data.RfFetalAnomalies,
          RfDiabetesMellitus: data.RfDiabetesMellitus,
          RfPlacentaPrevia: data.RfPlacentaPrevia,
          RfAbruptioPlacenta: data.RfAbruptioPlacenta,
          RfOligohydramnios: data.RfOligohydramnios,
          RfProm: data.RfProm,
          RfLargeGa: data.RfLargeGa,
          RfGdm: data.RfGdm,
          RfSmallGa: data.RfSmallGa,
          RfHeartDisease: data.RfHeartDisease,
          RfAntepartum: data.RfAntepartum,
          RfMedicalProblem: data.RfMedicalProblem,
          RfMedicalProblemTxt: data.RfMedicalProblemTxt,
          RfSurgicalProblem: data.RfSurgicalProblem,
          RfSurgicalProblemTxt: data.RfSurgicalProblemTxt,

          // Reason for Admission
          RaLabourPain: data.RaLabourPain,
          RaRupture: data.RaRupture,
          RaLeaking: data.RaLeaking,
          RaBleeding: data.RaBleeding,
          RaInduction: data.RaInduction,
          RaOther: data.RaOther,
          RaOtherTxt: data.RaOtherTxt,

          // Reason for Induction
          RiPostDate: data.RiPostDate,
          RiNonReassuring: data.RiNonReassuring,
          RiPatientRequest: data.RiPatientRequest,
          RiIugr: data.RiIugr,
          RiOligo: data.RiOligo,
          RiMedicalReason: data.RiMedicalReason,
          RiMedicalReasonTxt: data.RiMedicalReasonTxt,

          // Method of Induction
          MiPge2: data.MiPge2,
          MiPropess: data.MiPropess,
          MiSyntocinon: data.MiSyntocinon,
          MiAugmentation: data.MiAugmentation,
          MiSyntocinon1: data.MiSyntocinon1,
          MiArm: data.MiArm,

          // Assessment
          AaOlSpontaneous: data.AaOlSpontaneous,
          AaOlAugmentation: data.AaOlAugmentation,
          AaOlInduced: data.AaOlInduced,
          AaMmArm: data.AaMmArm,
          AaMmLeaking: data.AaMmLeaking,
          AaMmSrom: data.AaMmSrom,
          AaMmSince: data.AaMmSince,
          AaMcLight: data.AaMcLight,
          AaMcStained: data.AaMcStained,
          AaMcThick: data.AaMcThick,
          AaLClear: data.AaLClear,
          AaLBloodStained: data.AaLBloodStained,
          AaCReactive: data.AaCReactive,
          AaCNonreactive: data.AaCNonreactive,
          AaAeCephalic: data.AaAeCephalic,
          AaAeCephalicTxt: data.AaAeCephalicTxt,
          AaAeFrom: data.AaAeFrom,
          AaAeFromTxt: data.AaAeFromTxt,
          AaAeBreech: data.AaAeBreech,
          AaAeTransverse: data.AaAeTransverse,

          // Bishop Score
          BsDilatation: data.BsDilatation,
          BsEffacement: data.BsEffacement,
          BsStation: data.BsStation,
          BsPosition: data.BsPosition,
          BsConsistency: data.BsConsistency,
          BsTotalScore: data.BsTotalScore,
          BsTotalScoreDesc: data.BsTotalScoreDesc,
          BsPelvicExam: data.BsPelvicExam,
          BsManagement: data.BsManagement,
          BsCannula: data.BsCannula,
          BsIvCannula: data.BsIvCannula,
          BsCtg: data.BsCtg,
          BsEpiduralUsed: data.BsEpiduralUsed,
          BsYes: data.BsYes,
          BsNo: data.BsNo,
          BsNoTxt: data.BsNoTxt,
          BsCatheter: data.BsCatheter,
          BsRemoved: data.BsRemoved,
          BsNotRemoved: data.BsNotRemoved,

          // Post Delivery
          PdTimeDelivery: data.PdTimeDelivery,
          PdModeDelivery: data.PdModeDelivery,
          PdNsvd: data.PdNsvd,
          PdVacuum: data.PdVacuum,
          PdForceps: data.PdForceps,
          PdPlacenta: data.PdPlacenta,
          PdComplete: data.PdComplete,
          PdIncomplete: data.PdIncomplete,
          PdPerineum: data.PdPerineum,
          PdIntact: data.PdIntact,
          PdEpisiotomy: data.PdEpisiotomy,
          PdLaceration: data.PdLaceration,
          PdExtendedTear: data.PdExtendedTear,
          PdOther: data.PdOther,
          PdOtherTxt: data.PdOtherTxt,
          PdBloodLoss: data.PdBloodLoss,
          PdAverage: data.PdAverage,
          PdExcessive: data.PdExcessive,
          PdEstimatedBlood: data.PdEstimatedBlood,
          PdEstimatedBloodTxt: data.PdEstimatedBloodTxt,
          PdCervix: data.PdCervix,
          PdIntact1: data.PdIntact1,
          PdUterus: data.PdUterus,
          PdAtony: data.PdAtony,
          PdContracted: data.PdContracted,
          PdComments: data.PdComments,
          PdAnLocal: data.PdAnLocal,
          PdAnGeneral: data.PdAnGeneral,
          PdAnEpidural: data.PdAnEpidural,
          PdAnOther: data.PdAnOther,
          PdAnOtherTxt: data.PdAnOtherTxt,
          PdIfPost: data.PdIfPost,
          PdCervical: data.PdCervical,
          PdAtonic: data.PdAtonic,
          PdRetained: data.PdRetained,
          PdVaginal: data.PdVaginal,
          PdPerineal: data.PdPerineal,
        });


        if (data?.TONEONATAL?.results.length) {
          (this.labourForm.get('TONEONATAL') as FormArray).clear();
          data.TONEONATAL.results.forEach((group, i) => this.addDrain(group, i));
        }


        if (data.TOLABTEST.results || data.TOLABTEST.results.length) {
          const labTestList = this.TOLABTEST;
          labTestList.clear();
          data?.TOLABTEST?.results.forEach((item, index) => {
            this.addLabTest(item, index);
          });
        }
        this.toScaleArr = data?.TOSCALE.results && data?.TOSCALE.results.length ? data?.TOSCALE.results : [];
        this.toAllergyArr = data?.TOALLERGY?.results;

        this.toScaleArr.forEach((element) => {
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
        this.sharedService.waringSwallModel(`POST Error at Labor Room Flow Sheet : ${err}`);
      },
    });
  }

  //------------ Alergey managemenet  (start) ------------
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
  //------------ Alergey managemenet  (ends) ------------

  noScaleAppicable: any;
  modalRefScales: BsModalRef;
  selectedScales: any[] = [];
  toScaleArr: any[];

  //------------ Scal section  (starts) ------------
  openModalForScales(template: TemplateRef<any>) {
    const config: ModalOptions = {
      class:
        'modal-dialog modal-dialog-centered medication-order-case modal-xl',
    };
    this.modalRefScales = this.modalService.show(template, config);
    this.loadScalesData();
    // this.medicationImportDrugArray=[];
  }

  scalesImport() {

    this.selectedScales.forEach((element) => {
      this.scalesList.forEach((res: any) => {
        if (element.Scaletype == res.ScaleType && element.Score) {
          res.Datetimee = element.DateTime,
            // res.Dockey = element.Dockey, //this is commented because we are not getting it from the backendside
            res.Dockey = this.docKey; // manually patching doc form stored in vaiable
          res.ScoreDesc = element.ScoreDesc,
            res.LastScore = element.Score,
            res.ScaleType = element.Scaletype
        }
      })
    })
    // this.selectedScales.forEach(element => {
    //   console.log(element)
    //   this.scalesArray = this.scalesArray.concat({
    //     "Dockey": "",
    //     "ScaleType": element.Scaletype ,
    //     "ScoreDesc": element.ScoreDesc ,
    //     "Datetimee": element.DateTime,
    //     "LastScore": element.Score,
    //   });
    // });
    this.modalRefScales.hide();
  }

  removeScale(index: number) {
    this.scalesList[index].LastScore = "";
    this.scalesList[index].ScoreDesc = "";
    this.scalesList[index].Dockey = "";
    this.scalesList[index].Datetimee = "";
  }

  // Note : old function
  // public viewGlosgowModel(item) {
  //
  //   if (this.noScaleAppicable) return;
  //   if (item.value == '1') {
  //     if (item.Dockey) {
  //       this.scalesGlosgow.openModalForGlosgow(item.Dockey);
  //     } else {
  //       this.sharedService.waringSwallModel('No data found');
  //     }
  //   }
  // }

  //New function
  public viewGlosgowModel(item) {
    if (this.noScaleAppicable) return;
    if (item.Dockey) {

      if (item.value == '1') {
        this.scalesGlosgow.openModalForGlosgow(item.Dockey);
      } else if (item.value == '2') {
        this.scalesGlosgow.openModalForGlosgow(item.Dockey);
      } else if (item.value == '3') {
        this.bradenScaleTemp.openBradenScaleModal(item.Dockey);
      }
    } else {
      this.sharedService.waringSwallModel('No data found');
    }
  }

  collectScalesIData(event, item, i) {
    if (event.target.checked) {
      this.toScaleArr[i].isSelected = true;
      this.selectedScales.push(item);
    } else {
      this.toScaleArr[i].isSelected = false;
      const indexOf = this.selectedScales.findIndex(x => x.Scaletype == item.Scaletype);
      if (indexOf !== -1)
        this.selectedScales.splice(indexOf, 1);
    }
  }

  collectAllScalesData(event: any) {
    if (event.target.checked) {
      this.selectedScales = (Object.assign([], this.toScaleArr));
    } else {
      this.selectedScales = [];
    }
  }


  public openScaleModel(item: any) {
    if (this.noScaleAppicable) return;
    if (item.Dockey) {
      this.scalesEditConfirmationMsg(item);
    } else {
      this.openSelectedModalScale(item);
    }
  }

  private scalesEditConfirmationMsg(item: { value: string }) {
    Swal.fire({
      text: 'Are you sure you want to edit scale',
      icon: 'warning',
      confirmButtonText: 'Yes',
      showCancelButton: true,
      cancelButtonText: 'No',
      customClass: 'myalertpopup',
    }).then((res) => {
      if (res.isConfirmed) {
        this.openSelectedModalScale(item);
      }
    });
  }

  openSelectedModalScale(item) {
    if (item.value == '1') {
      this.scalesGlosgow.openModalForGlosgow('');
    } else if (item.value == '2') {
      this.morseFallScale.openMorseFallScaleModal('');
    } else if (item.value == '3') {
      this.bradenScaleTemp.openBradenScaleModal('');
    }
  }

  isDockeyAvailable(): boolean {
    return this.scalesList.some(scale => scale.Dockey && scale.Dockey.trim() !== '');
  }




  loadScalesData() {
    // this.selectedScales = [];
    this.toScaleArr = [];
    let patnr = this.ePrescriptionService.parameters.patnr;
    patnr = patnr.padStart(10, '0');
    const scalesOrders: Subscription = this.ePrescriptionService.loadData(`e-prescription/ScalesList?Patnr=${patnr}`, false, false, false, false).subscribe((resp: any) => {
      console.log(resp)
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        if (resp.body?.d?.results.length) {
          let requiredScales = ["Glasgow Coma Scale", "Morse Fall Scale (MFS)", "Braden scale for predicting pressure ulcers"];
          this.toScaleArr = resp.body.d.results.filter(scale => requiredScales.includes(scale.Scaletype)).map(scale => ({ ...scale, isSelected: false }));
        }
      }
      //   this.filterEvents();
    }, () => { scalesOrders.unsubscribe(); });
  }



  // get items(): FormArray {
  //   return this.nursingAdmissionForm.get('TOINFECTION') as FormArray;
  // }


  public scaleStoreInTable(event: any, scaleType: string) {
    if (scaleType == 'morseFall') {
      this.scalesList[1].LastScore = event?.totalScore;
      this.scalesList[1].ScoreDesc = event?.description;
      this.scalesList[1].Dockey = event?.dockey;
      this.scalesList[1].Datetimee = event?.date;
    } else if (scaleType == 'braden') {
      this.scalesList[2].LastScore = event?.totalScore;
      this.scalesList[2].ScoreDesc = event?.description;
      this.scalesList[2].Dockey = event?.dockey;
      this.scalesList[2].Datetimee = event?.date;
    } else if (scaleType == 'glosgow') {
      this.scalesList[0].LastScore = event?.totalScore;
      this.scalesList[0].ScoreDesc = event?.description;
      this.scalesList[0].Dockey = event?.dockey;
      this.scalesList[0].Datetimee = event?.date;
    }
  }


  public createLaborRoomDoc(status?: any, actionType?: any) {
    return new Promise((resolve, reject) => {
      let formData = this.labourForm.value;
      formData.Datee = formData.Datee ? this.sanitizeSAPDateFormat(formData.Datee) : '';
      formData.Lmp = formData.Lmp ? this.sanitizeSAPDateFormat(formData.Lmp) : '';
      formData.Edd = formData.Edd ? this.sanitizeSAPDateFormat(formData.Edd) : '';
      formData.DocStatus = status;
      formData.Height = formData.Height ? formData.Height : '0';
      formData.Weight = formData.Weight ? formData.Weight : '0';
      formData.DocStatus = status;
      formData.Timee = formData.Timee ? this.parsePayloadFormateTime(formData.Timee) : 'PT00H00M00S';
      formData.PdTimeDelivery = formData.PdTimeDelivery ? this.parsePayloadFormateTime(formData.PdTimeDelivery) : 'PT00H00M00S';
      formData['TONEONATAL'] = formData.TONEONATAL.filter(res => res.Wt).map(res => ({
        ...res,
        Timee: this.parsePayloadFormateTime(res.Timee)
      }));
      formData['TOLABTEST'] = formData.TOLABTEST.filter(res => res.Description || res.Value || res.ValueConfi || res.Range).map(res => ({
        ...res,
        DateTime: this.concatDateTime(res.DateTime)
      }));

      // formData.Datee = '\/Date(1620518400000)\/';
      let checkScalesList: any[] = this.scalesList.filter((res) => {
        delete res.description;
        delete res.value;
        res.LastScore = res?.LastScore?.toString()
        if (res.LastScore) return res;
      });

      formData['TOSCALE'] = checkScalesList;
      if (formData['TOSCALE'].length) {
        formData['TOSCALE'].forEach(item => {
          item.Dockey = this.docKey;
        });
      }

      formData['TOALLERGY'] = this.toAllergyArr && this.toAllergyArr?.length ? this.toAllergyArr : [];
      formData['TOALLERGY'].forEach(item => {
        item.Dockey = this.docKey;
      });



      this.subscription = this.emergencyService.saveLaborRoomDocument({ d: formData }).subscribe({
        next: (data: any) => {
        },
        error: (err: any) => {
          this.sharedService.waringSwallModel(`Error ${err}`);
          this.sharedService.waringSwallModel(`PUT Error at  Labor Room Flow Sheet PMD Document : ${err}`);
        },
        complete: () => {
          resolve(true);
          if (status === 'edit') {
            this.sharedService.successSwallModel(' Labor Room Flow Sheet PMD Document updated successfully');
          } else {
            this.sharedService.successSwallModel(' Labor Room Flow Sheet PMD Document created successfully');
          }
          // this.successEvent.next(true)
        }
      });
    })
  }


  concatDateTime(currentDate) {
    let padZero = (n: number) => n.toString().padStart(2, '0');

    let formattedDate =
      `${padZero(currentDate.getDate())}.` +
      `${padZero(currentDate.getMonth() + 1)}.` +
      `${currentDate.getFullYear()}/` +
      `${padZero(currentDate.getHours())}:` +
      `${padZero(currentDate.getMinutes())}:` +
      `${padZero(currentDate.getSeconds())}`;

    return formattedDate
  }

  sanitizeSAPDateFormat(date: any) {
    if (typeof date === 'string') {
      return date;
    } else {
      return `\/Date(${date.getTime()})\/`;
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
    console.log(data, "---")
    if (data && data.length) {
      const strArr: string[] = data.split(':');
      if (data && data.length === 8) {
        return `PT${strArr[0]}H${strArr[1]}M${strArr[2]}S`;
      }
    }
    return null;
  }

  public getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }

  dateStringNewDate(stringData: any) {
    if (stringData) {
      let [day, month, yearWithTime] = stringData.split('.');
      let [year, time] = yearWithTime.split('/');
      return new Date(+year, +month - 1, +day);
    }
  }
}
