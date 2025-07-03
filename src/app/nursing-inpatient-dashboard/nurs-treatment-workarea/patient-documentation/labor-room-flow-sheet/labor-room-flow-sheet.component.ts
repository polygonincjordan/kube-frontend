import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdmissionService } from '@services/admission/admission.service';
import { DataShareService } from '@services/data-share.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ActionType } from '@services/interfaces/common.enum';

@Component({
  selector: 'app-labor-room-flow-sheet',
  templateUrl: './labor-room-flow-sheet.component.html',
  styleUrls: ['./labor-room-flow-sheet.component.scss']
})
export class LaborRoomFlowSheetComponent implements OnInit {


  labourForm: FormGroup;

  currentTime: string;
  paramsObject: any;
  apiJson: any;

  docKey: any;
  private subscription: Subscription;
  private actionTypeSubscription$: Subscription;
  scalesList: any;
  
  statusDescriptionOptions = [
    { value: 0, label: 'Normal' },
    { value: 1, label: 'Birth Defects' },
    { value: 2, label: 'Premature' },
    { value: 3, label: 'Post Mature' }
  ];
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
      Dtid: [''],
      Einri: [''],
      Patnr: [''],
      Falnr: [''],
      Lfdnr: [''],
      Orgdo: [''],
      AttendPhy: [''],
      DocStatus: [''],
      Datee: [''],
      Timee: [''],
      Gravida: [''],
      Para: [''],
      Abortion: [''],
      NoOfAlive: [''],
      NoOfDead: [''],
      NormalDelivery: [''],
      Lmp: [''],
      Edd: [''],
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

      // Arrays
      TOSCALE: this.fb.array([]),
      TOALLERGY: this.fb.array([]),
      TONEONATAL: this.fb.array([]),
      TOLABTEST: this.fb.array([]),
    });

  }

  getNurseDocDetail() {
    
  }
}
