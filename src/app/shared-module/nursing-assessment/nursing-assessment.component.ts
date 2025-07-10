import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { SharedService } from '@services/shared.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PatientService } from '@services/e-kardex/patient.service';
import { StorageService } from '@services/storage.service';
import { CommanService } from '@services/comman.service';
import { DataShareService } from '@services/data-share.service';
import { DayCaseDashboardService } from '@services/day-case.dashboard/day-case-dashboard.service';
import { catchError, of, Subscription } from 'rxjs';
import { Patient } from '@services/e-kardex/interfaces/patient';
import { ActionType } from '@services/interfaces/common.enum';
import { commonKeyValuePariExt0 } from '@services/e-kardex/interfaces/documents.interface';
import { GlosGowCommaScaleAssessmentPopupComponent } from './glos-gow-comma-scale/glos-gow-comma-scale-popup.component';
import { MorseFallScaleAssessmentComponent } from './morse-fall-scale/morse-fall-scale.component';
import { BradenScaleAssessmentComponent } from './braden-scale/braden-scale.component';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';

@Component({
  selector: 'app-nursing-assessment',
  templateUrl: './nursing-assessment.component.html',
  styleUrls: ['./nursing-assessment.component.scss']
})
export class NursingAssessmentComponent implements OnInit {

  @ViewChild('scalesGlosgow') scalesGlosgow: GlosGowCommaScaleAssessmentPopupComponent;
  @ViewChild('morseFallScale') morseFallScale: MorseFallScaleAssessmentComponent;
  @ViewChild('bradenScaleTemp') bradenScaleTemp: BradenScaleAssessmentComponent;
  noScaleAppicable: any;
  public nursingAdmissionForm: FormGroup;
  public TOMEDICATION: FormArray;
  public TOINFECTION: FormArray;
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

  public socialHistoryList: commonKeyValuePariExt0[] = [
    {
      Habitid: '',
      value: '0',
      label: 'Alcohol',
      Status: '',
      Quantity: '',
      Duration: '',
      Year: '',
      DateFrom: null,
    },
    {
      value: '1',
      label: 'Drugs',
      Status: '',
      Quantity: '',
      Duration: '',
      Year: '',
      DateFrom: null,
      Habitid: '',
    },
    {
      value: '2',
      label: 'Tobacco',
      Status: '',
      Quantity: '',
      Duration: '',
      Year: '',
      DateFrom: null,
      Habitid: '',
    },
    {
      value: '3',
      label: 'Other',
      Status: '',
      Quantity: '',
      Duration: '',
      Year: '',
      DateFrom: null,
      Habitid: '',
    },
  ];
  paramsObject: any;
  toAllergyArr: any = [];
  selectedScales:any[]=[];
  scalesArray: any[]=[];
  toScaleArr: any[];
  modalRefScales: BsModalRef;
  encounterId: any;
  public selectedTableDetails: any;
  public docKey: any;
  public maritalStatus: any;
  public patientDetails: Patient;
  private subscription: Subscription;
  private actionTypeSubscription$: Subscription;
  constructor(private sharedService: SharedService,
    private formBuilder: FormBuilder,
    private emergencyService: EmergencyService,
    private datePipe: DatePipe,
    private _route: ActivatedRoute,
    private patientService: PatientService,
    public storageService: StorageService,
    private commanService: CommanService,
    private dataShareService: DataShareService,
    private modalService: BsModalService,
    private ePrescriptionService: EPrescriptionService,
    private dayCaseDashboard: DayCaseDashboardService) {
    this._route.queryParams.subscribe((params) => {
      this.paramsObject = params;
      this.encounterId =
        this.paramsObject.einri +
        this.paramsObject.falnr +
        this.paramsObject.lfdnr;
      this.getPatinetDetails(this.encounterId);
    });
    this.initForm();

    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe(
      (data) => {
        if (data != null) {
          if (data.type == ActionType.Add$ && data.value == '') {
            this.docKey = data.value.Dockey;
          }
          if (data.type == ActionType.Update$ && data.value) {
            this.docKey = data.value.docKey;
            this.getNursingAdmissionDocDetails(data.value.docKey);
          }
          if (data.type == ActionType.Copy$ && data.value) {
            this.docKey = data.value.docKey;
            this.getNursingAdmissionDocDetails(data.value.docKey);
          }
        }
      }
    );
  }

  ngOnInit(): void {
  }

  public getPatinetDetails(encounterId) {
    this.patientService
      .getDataPatient(encounterId)
      .pipe(
        catchError(() => {
          return of({} as Patient);
        })
      )
      .subscribe((patientData: Patient) => {
        this.patientDetails = patientData;
        this.maritalStatus = this.patientDetails.maritalStatus;
        this.storageService.setPatientData(patientData);
      });
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

  public viewGlosgowModel(item) {
    if (this.noScaleAppicable) return;
    if (item.value == '1') {
      if (item.Dockey) {
        this.scalesGlosgow.openModalForGlosgow(item.Dockey);
      } else {
        this.sharedService.waringSwallModel('No data found');
      }
    } else if (item.value == '2') {
      if (item.Dockey) {
        this.morseFallScale.openMorseFallScaleModal(item.Dockey);
      } else {
        this.sharedService.waringSwallModel('No data found');
      }
    } else if (item.value == '3') {
      if (item.Dockey) {
        this.bradenScaleTemp.openBradenScaleModal(item.Dockey);
      } else {
        this.sharedService.waringSwallModel('No data found');
      }
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

  removeScale(index: number) {
    this.scalesList[index].LastScore = "";
    this.scalesList[index].ScoreDesc = "";
    this.scalesList[index].Dockey = "";
    this.scalesList[index].Datetimee = "";
  }

  initForm() {
    let currentTime = this.datePipe.transform(new Date(), 'hh:mm:ss a');
    this.nursingAdmissionForm = this.formBuilder.group({
      Dockey: '',
      Dtid: 'ZMED_NRASM',
      Einri: this.paramsObject.einri,
      Patnr: this.paramsObject.patnr,
      Falnr: this.paramsObject.falnr,
      Lfdnr: this.paramsObject.lfdnr,
      Orgdo: this.storageService?.patientData?.deptOrgUnit,
      GgRectalPain: false,
      GgIndigestion: false,
      GbAbsent: false,
      GbPresent: false,
      GbHypoactive: false,
      GbHyperactive: false,
      GaSoft: false,
      GaDistendend: false,
      GaFirm: false,
      GaTenderness: false,
      GeEnema: false,
      GeLaxatives: false,
      GeOstomyType: false,
      GeOstomyTypeTxt: '',
      GeOther: false,
      GeOtherTxt: '',
      RmProstate: false,
      RmLesions: false,
      RmDischarge: false,
      RmScrotal: false,
      RmDescr: '',
      RfPregnant: false,
      RfLmp: null,
      RfDischarge: false,
      RfLesions: false,
      RfItching: false,
      RfPelvic: false,
      RfMenarcheAge: '',
      RfNotReached1: false,
      RfMenopauseAge: '',
      RfNotReached2: false,
      RfBirthCont: false,
      RfBirthContTxt: '',
      RbTenderness: false,
      RbDischarge: false,
      RbSwelling: false,
      RbProsthesis: false,
      RbLumps: false,
      GPainful: false,
      GIncontinence: false,
      GBurning: false,
      GHematuria: false,
      GOliguria: false,
      GDysuria: false, //
      GPolyuria: false,
      GDribbling: false,
      GNocturia: false,
      GRetention: false,
      GStraining: false,
      GUrineColour: '',
      GUrineClarity: '',
      GCatheterType: false,
      GCatheterTypeTxt: '',
      GMicturition: '',
      GOther: false,
      GOtherTxt: '',
      SSkinColor: '',
      SSkinColorTxt: '',
      STemperature: '',
      SMoisture: '',
      SLesions: '',
      SLocation: '',
      NnHeadache: false,
      NnDizziness: false,
      NnNumbness: false,
      NnNumbnessLoc: '',
      NnTingling: false,
      NnTinglingLoc: '',
      NnParalysis: false,
      NnParalysisLoc: '',
      NnTremors: false,
      NnTremorsLoc: '',
      NLevelConscious: '',
      NoPlace: false,
      NoTime: false,
      NoPresent: false,
      NResponsiveness: '',
      CgChestPain: false,
      CgPalpitations: false,
      CgPacemaker: false,
      CgPainCalves: false,
      CpRegular: false,
      CpIrregular: false,
      CpStrong: false,
      CpWeak: false,
      CPedalPulses: '',
      CeYes: false,
      CeNo: false,
      CePitting: false,
      CeNonPitting: false,
      CeLocation: '',
      CNailBed: '',
      CCapillaryRefill: '',
      EeHardHearing: '',
      EePain: '',
      EeDrainage: '',
      EeDeaf: '',
      EnEpistaxis: false,
      EnCongestion: false,
      EnDrainage: false,
      EnType: '',
      EtDysphagia: false,
      EtBleeding: false,
      EtSwollenGlands: false,
      EtSwollenGums: false,
      EtPain: false,
      EtLesions: false,
      EtLocation: '',
      OGlassEye: '',
      ORedness: '',
      OPain: '',
      ODischarge: '',
      OBlind: '',
      OComments: '',
      RChestAppearance: '',
      RbDyspneaRest: false,
      RbDyspneaExertion: false,
      RbNonLabored: false,
      RBbreathSounds: '',
      RRhonchi: '',
      RCough: '',
      RColor: '',
      RAmount: '',
      RTracheostomy: false,
      RTubeSize: '',
      RO2: false,
      RBy: '',
      RAt: "",
      NoScale: false,
      AttendPhy: this.storageService.getUserProfile()?.Gpart,
      DocStatus: '1',
      disabledAllPhy: false
    });

    const currentTime1 = new Date();
    const hours = currentTime1.getHours().toString().padStart(2, '0');
    const minutes = currentTime1.getMinutes().toString().padStart(2, '0');
    const seconds = currentTime1.getSeconds().toString().padStart(2, '0');
    this.nursingAdmissionForm.get('RAt')?.setValue(`${hours}:${minutes}:${seconds}`);
    // this.defaultAddRow();
    // this.defaultAddRowInfectious();
  }


  defaultAddRowInfectious() {
    for (let index = 0; index < 3; index++) {
      this.addItemRowInfectious();
    }
  }

  addItemRowInfectious() {
    this.TOINFECTION = this.nursingAdmissionForm.get('TOINFECTION') as FormArray;
    this.TOINFECTION.push(this.itemFormArrayFieldForInfectious());
  }

  itemFormArrayFieldForInfectious(): FormGroup {
    return this.formBuilder.group({
      Dockey: [''],
      InfectiousDiesease: [''],
      Status: [''],
      TypeIsolation: [''],
    });
  }
  // Vaccination FormArray Details
  addItemRow() {
    this.TOMEDICATION = this.nursingAdmissionForm.get('TOMEDICATION') as FormArray;
    this.TOMEDICATION.push(this.itemFormArrayFieldForMedication());
  }

  itemFormArrayFieldForMedication(): FormGroup {
    return this.formBuilder.group({
      Dockey: [''],
      vaccination: [''],
      othervaccination: [''],
      status: [''],
      date: [false],
    });
  }

  defaultAddRow() {
    for (let index = 0; index < 3; index++) {
      this.addItemRow();
    }
  }

  isDockeyAvailable(): boolean {
    return this.scalesList.some(scale => scale.Dockey && scale.Dockey.trim() !== '');
  }

  get items(): FormArray {
    return this.nursingAdmissionForm.get('TOINFECTION') as FormArray;
  }
  getNursingAdmissionDocDetails(docKey?) {
    this.subscription = this.dayCaseDashboard
      .getNursingAssessmentDocData(docKey)
      .subscribe({
        next: (data: any) => {
          this.nursingAdmissionForm.patchValue({
            Dockey: data.d.results[0]?.Dockey,
            Dtid: data.d.results[0]?.Dtid,
            Einri: data.d.results[0]?.Einri,
            Patnr: data.d.results[0]?.Patnr,
            Falnr: data.d.results[0]?.Falnr,
            Lfdnr: data.d.results[0]?.Lfdnr,
            Orgdo: data.d.results[0]?.Orgdo,
            
            GgRectalPain: data.d.results[0]?.GgRectalPain,
            GgIndigestion: data.d.results[0]?.GgIndigestion,
            GbAbsent: data.d.results[0]?.GbAbsent,
            GbPresent: data.d.results[0]?.GbPresent,
            GbHypoactive: data.d.results[0]?.GbHypoactive,
            GbHyperactive: data.d.results[0]?.GbHyperactive,
            GaSoft: data.d.results[0]?.GaSoft,
            GaDistendend: data.d.results[0]?.GaDistendend,
            GaFirm: data.d.results[0]?.GaFirm,
            GaTenderness: data.d.results[0]?.GaTenderness,
            GeEnema: data.d.results[0]?.GeEnema,
            GeLaxatives: data.d.results[0]?.GeLaxatives,
            GeOstomyType: data.d.results[0]?.GeOstomyType,
            GeOstomyTypeTxt: data.d.results[0]?.GeOstomyTypeTxt,
            GeOther: data.d.results[0]?.GeOther,
            GeOtherTxt: data.d.results[0]?.GeOtherTxt,
            RmProstate: data.d.results[0]?.RmProstate,
            RmLesions: data.d.results[0]?.RmLesions,
            RmDischarge: data.d.results[0]?.RmDischarge,
            RmScrotal: data.d.results[0]?.RmScrotal,
            RmDescr: data.d.results[0]?.RmDescr,
            RfPregnant: data.d.results[0]?.RfPregnant,
            CgPacemaker: data.d.results[0]?.CgPacemaker,
            RfLmp: this.parseDate(data.d.results[0]?.RfLmp),
            RfDischarge: data.d.results[0]?.RfDischarge,
            RfLesions: data.d.results[0]?.RfLesions,
            RfItching: data.d.results[0]?.RfItching,
            RfPelvic: data.d.results[0]?.RfPelvic,
            RfMenarcheAge: data.d.results[0]?.RfMenarcheAge,
            RfNotReached1: data.d.results[0]?.RfNotReached1,
            RfMenopauseAge: data.d.results[0]?.RfMenopauseAge,
            RfNotReached2: data.d.results[0]?.RfNotReached2,
            RfBirthCont: data.d.results[0]?.RfBirthCont,
            RfBirthContTxt: data.d.results[0]?.RfBirthContTxt,
            RbTenderness: data.d.results[0]?.RbTenderness,
            RbDischarge: data.d.results[0]?.RbDischarge,
            RbSwelling: data.d.results[0]?.RbSwelling,
            RbProsthesis: data.d.results[0]?.RbProsthesis,
            RbLumps: data.d.results[0]?.RbLumps,
            GPainful: data.d.results[0]?.GPainful,
            GIncontinence: data.d.results[0]?.GIncontinence,
            GBurning: data.d.results[0]?.GBurning,
            GHematuria: data.d.results[0]?.GHematuria,
            GOliguria: data.d.results[0]?.GOliguria,
            GDysuria: data.d.results[0]?.GDysuria, //
            GPolyuria: data.d.results[0]?.GPolyuria,
            GDribbling: data.d.results[0]?.GDribbling,
            GNocturia: data.d.results[0]?.GNocturia,
            GRetention: data.d.results[0]?.GRetention,
            GStraining: data.d.results[0]?.GStraining,
            GUrineColour: data.d.results[0]?.GUrineColour,
            GUrineClarity: data.d.results[0]?.GUrineClarity,
            GCatheterType: data.d.results[0]?.GCatheterType,
            GCatheterTypeTxt: data.d.results[0]?.GCatheterTypeTxt,
            GMicturition: data.d.results[0]?.GMicturition,
            GOther: data.d.results[0]?.GOther,
            GOtherTxt: data.d.results[0]?.GOtherTxt,
            SSkinColor: data.d.results[0]?.SSkinColor,
            SSkinColorTxt: data.d.results[0]?.SSkinColorTxt,
            STemperature: data.d.results[0]?.STemperature,
            SMoisture: data.d.results[0]?.SMoisture,
            SLesions: data.d.results[0]?.SLesions,
            SLocation: data.d.results[0]?.SLocation,
            NnHeadache: data.d.results[0]?.NnHeadache,
            NnDizziness: data.d.results[0]?.NnDizziness,
            NnNumbness: data.d.results[0]?.NnNumbness,
            NnNumbnessLoc: data.d.results[0]?.NnNumbnessLoc,
            NnTingling: data.d.results[0]?.NnTingling,
            NnTinglingLoc: data.d.results[0]?.NnTinglingLoc,
            NnParalysis: data.d.results[0]?.NnParalysis,
            NnParalysisLoc: data.d.results[0]?.NnParalysisLoc,
            NnTremors: data.d.results[0]?.NnTremors,
            NnTremorsLoc: data.d.results[0]?.NnTremorsLoc,
            NLevelConscious: data.d.results[0]?.NLevelConscious,
            NoPlace: data.d.results[0]?.NoPlace,
            NoTime: data.d.results[0]?.NoTime,
            NoPresent: data.d.results[0]?.NoPresent,
            NResponsiveness: data.d.results[0]?.NResponsiveness,
            CgChestPain: data.d.results[0]?.CgChestPain,
            CgPalpitations: data.d.results[0]?.CgPalpitations,

            CgPainCalves: data.d.results[0]?.CgPainCalves,
            CpRegular: data.d.results[0]?.CpRegular,
            CpIrregular: data.d.results[0]?.CpIrregular,
            CpStrong: data.d.results[0]?.CpStrong,
            CpWeak: data.d.results[0]?.CpWeak,
            CPedalPulses: data.d.results[0]?.CPedalPulses,
            CeYes: data.d.results[0]?.CeYes,
            CeNo: data.d.results[0]?.CeNo,
            CePitting: data.d.results[0]?.CePitting,
            CeNonPitting: data.d.results[0]?.CeNonPitting,
            CeLocation: data.d.results[0]?.CeLocation,
            CNailBed: data.d.results[0]?.CNailBed,
            CCapillaryRefill: data.d.results[0]?.CCapillaryRefill,
            EeHardHearing: data.d.results[0]?.EeHardHearing,
            EePain: data.d.results[0]?.EePain,
            EeDrainage: data.d.results[0]?.EeDrainage,
            EeDeaf: data.d.results[0]?.EeDeaf,
            EnEpistaxis: data.d.results[0]?.EnEpistaxis,
            EnCongestion: data.d.results[0]?.EnCongestion,
            EnDrainage: data.d.results[0]?.EnDrainage,
            EnType: data.d.results[0]?.EnType,
            EtDysphagia: data.d.results[0]?.EtDysphagia,
            EtBleeding: data.d.results[0]?.EtBleeding,
            EtSwollenGlands: data.d.results[0]?.EtSwollenGlands,
            EtSwollenGums: data.d.results[0]?.EtSwollenGums,
            EtPain: data.d.results[0]?.EtPain,
            EtLesions: data.d.results[0]?.EtLesions,
            EtLocation: data.d.results[0]?.EtLocation,
            OGlassEye: data.d.results[0]?.OGlassEye,
            ORedness: data.d.results[0]?.ORedness,
            OPain: data.d.results[0]?.OPain,
            ODischarge: data.d.results[0]?.ODischarge,
            OBlind: data.d.results[0]?.OBlind,
            OComments: data.d.results[0]?.OComments,
            RChestAppearance: data.d.results[0]?.RChestAppearance,
            RbDyspneaRest: data.d.results[0]?.RbDyspneaRest,
            RbDyspneaExertion: data.d.results[0]?.RbDyspneaExertion,
            RbNonLabored: data.d.results[0]?.RbNonLabored,
            RBbreathSounds: data.d.results[0]?.RBbreathSounds,
            RRhonchi: data.d.results[0]?.RRhonchi,
            RCough: data.d.results[0]?.RCough,
            RColor: data.d.results[0]?.RColor,
            RAmount: data.d.results[0]?.RAmount,
            RTracheostomy: data.d.results[0]?.RTracheostomy,
            RTubeSize: data.d.results[0]?.RTubeSize,
            RO2: data.d.results[0]?.RO2,
            RBy: data.d.results[0]?.RBy,
            RAt: data.d.results[0]?.RAt,
            
            AttendPhy: data.d.results[0]?.AttendPhy,
            DocStatus: data.d.results[0]?.DocStatus
          });
          // this.nursingAdmissionForm.patchValue({
          //   ADate: this.parseDate(data.d.results[0].ADate),
          //   ATime: this.parseTime(data.d.results[0].ATime),
          // });
        
          if (data?.d?.results[0].TOSCALE.results.length) {
            // Sort the array in descending order based on Datetimee (as a string)
            let sortedScales = data.d.results[0].TOSCALE.results.sort((a, b) => 
              b.Datetimee.localeCompare(a.Datetimee)
            );
          
            // Create a map to store only the latest record for each ScaleType
            let latestScalesMap = new Map();
            sortedScales.forEach(item => {
              if (!latestScalesMap.has(item.ScaleType)) {
                latestScalesMap.set(item.ScaleType, item);
              }
            });
          
            // Convert map values to an array (only latest records per ScaleType)
            let latestScales = Array.from(latestScalesMap.values());
          
            // Update scalesList with the latest values
            latestScales.forEach(element => {
              let existingScale = this.scalesList.find(res => res.ScaleType === element.ScaleType);
              if (existingScale) {
                existingScale.Datetimee = element.Datetimee;
                existingScale.Dockey = element.Dockey;
                existingScale.ScoreDesc = element.ScoreDesc;
                existingScale.LastScore = element.LastScore;
              }
            });
          }
          
          console.log(this.scalesList, "scalesList")
          // this.bindDataToFormArray(data?.d?.results[0].TOINFECTION.results)
        },
        error: (err: any) => {
          this.sharedService.waringSwallModel(`Error ${err}`);
          this.sharedService.waringSwallModel(
            `POST Error at Nursing care plans: ${err}`
          );
        },
      });
  }

isFormValidError = false
 createNursingAssessmentDoc(docStatus: any, actiontype?: string) {
    return new Promise((resolve, reject) => {
      this.isFormValidError = true;
      if(this.nursingAdmissionForm.invalid) {
        return;
      }
      this.nursingAdmissionForm.value.DocStatus = docStatus;
      let paylaod = this.nursingAdmissionForm.value;
      paylaod.Orgdo = this.storageService.patientData.deptOrgUnit;
      paylaod.AttendPhy = this.storageService.getUserProfile().Gpart;
      // paylaod.ADate = this.sanitizeSAPDateFormat(this.nursingAdmissionForm.value.ADate);
      paylaod.RAt = this.parsePayloadFormateTime(this.nursingAdmissionForm.value.RAt);
      if(this.nursingAdmissionForm.value.RfLmp) paylaod.RfLmp = this.nursingAdmissionForm.value.RfLmp.toISOString().split('T')[0] + "T00:00:00";
      delete paylaod.disabledAllPhy
   
      paylaod.TOSCALE = this.scalesList.filter((res: any) => {
        delete res.value;
        res.LastScore = res?.LastScore.toString();
        if(res.LastScore) {
          return res;
        }
      });

      paylaod.Orgdo = this.storageService?.patientData?.deptOrgUnit;
      this.subscription = this.dayCaseDashboard
      .saveNursingAssessmentDoc(paylaod)
      .subscribe({
        next: (data: any) => {},
        error: (err: any) => {
          this.sharedService.waringSwallModel(`Error ${err}`);
          this.sharedService.waringSwallModel(
            `PUT Error at Nursing assessment document : ${err}`
          );
        },
        complete: () => {
          resolve(true);
          if (actiontype === 'edit') {
            this.sharedService.successSwallModel(
              'Nursing assessment document updated successfully'
            );
          } else {
            this.sharedService.successSwallModel(
              'Nursing assessment document created successfully'
            );
          }
        },
      });
    });
  }

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
        if(resp.body?.d?.results.length) {
          let requiredScales = ["Glasgow Coma Scale", "Morse Fall Scale (MFS)", "Braden scale for predicting pressure ulcers"];
          this.toScaleArr = resp.body.d.results.filter(scale => requiredScales.includes(scale.Scaletype)).map(scale => ({ ...scale, isSelected: false }));
        }
        // this.medicationImportDrugArray=[];
       //http://http://192.168.193.9:6051:8000/sap/opu/odata/sap/ZN_TRANSFER_ASSES_SRV/PatScalesSet?$filter=Patnr
      }
      //   this.filterEvents();
    }, () => { scalesOrders.unsubscribe(); });
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

  collectAllScalesData(event: any) {
    if (event.target.checked) {
      this.selectedScales = (Object.assign([], this.toScaleArr));
    } else {
      this.selectedScales = [];
    }
  }

  isCheckedScale(item: any): boolean {
    return this.selectedScales.some(x => x.Scaletype == item.Scaletype);
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

  bindDataToFormArray(data: any[]): void {
    if (data.length) {
      this.items.clear(); // Clear the existing form array

      data.forEach(item => {
        this.items.push(this.formBuilder.group({
          Dockey: [item.Dockey],
          InfectiousDiesease: [item.InfectiousDiesease],
          Status: [item.Status],
          TypeIsolation: [item.TypeIsolation]
        }));
      });
    }
  }

  sanitizeSAPDateFormat(date: any) {
    if (typeof date === 'string') {
      return date;
    } else {
      return `\/Date(${date.getTime()})\/`;
    }
  }

  formatDateToMilliseconds(dateString: string): string {
    console.log(dateString, "--")
    const [datePart, timePart] = dateString.split('/');
    const [day, month, year] = datePart.split('.').map(Number);
    const [hours, minutes, seconds] = timePart.split(':').map(Number);
    const date = new Date(year, month - 1, day, hours, minutes, seconds);
    const timeInMillis = date.getTime();
    return `/Date${timeInMillis}/`;
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
    if (
      !data ||
      data.length !== 11 ||
      data[4] !== 'H' ||
      data[7] !== 'M' ||
      data[10] !== 'S'
    ) {
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
