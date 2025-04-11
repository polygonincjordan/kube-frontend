import { DatePipe } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommanService } from '@services/comman.service';
import { DataShareService } from '@services/data-share.service';
import { DayCaseDashboardService } from '@services/day-case.dashboard/day-case-dashboard.service';
import { commonKeyValuePariExt0, commonKeyValuePariExt4 } from '@services/e-kardex/interfaces/documents.interface';
import { PatientService } from '@services/e-kardex/patient.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { PhysicianAllergyComponent } from './physician-allergy/physician-allergy.component';
import { GlosGowCommaScalePopupComponent } from './glos-gow-comma-scale/glos-gow-comma-scale-popup.component';
import { MorseFallScaleComponent } from './morse-fall-scale/morse-fall-scale.component';
import { BradenScaleComponent } from './braden-scale/braden-scale.component';
import { Subscription } from 'rxjs';
import { ErVitalsComponent } from './er-vitals/er-vitals.component';

@Component({
  selector: 'app-paediatrics-adm-document',
  templateUrl: './paediatrics-adm-document.component.html',
  styleUrls: ['./paediatrics-adm-document.component.scss']
})
export class PaediatricsAdmDocumentComponent implements OnInit {
  public nursingAdmissionForm: FormGroup;
  public TOINFECTION: FormArray;
  public TOMEDICATION: FormArray;

  toAllergyArr: any = [];
  @ViewChild('createAllergyId') createAllergyId: PhysicianAllergyComponent;
  @ViewChild('erVitalsModal') erVitalsModal: ErVitalsComponent;

  @ViewChild('scalesGlosgow') scalesGlosgow: GlosGowCommaScalePopupComponent;
  @ViewChild('morseFallScale') morseFallScale: MorseFallScaleComponent;
  @ViewChild('bradenScaleTemp') bradenScaleTemp: BradenScaleComponent;
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

  public psychologicalHistoryList: commonKeyValuePariExt4[] = [
    { value: '01', label: 'Anxious', controlname: 'PsyAnxious' },
    { value: '02', label: 'Uncooperative', controlname: 'PsyUncooperative' },
    { value: '03', label: 'Depressed', controlname: 'PsyDepressed' },
    { value: '04', label: 'Angry', controlname: 'PsyAngry' },
    { value: '05', label: 'Agitated', controlname: 'PsyAgitated' },
    { value: '06', label: 'Combative', controlname: 'PsyCombative' },
    { value: '07', label: 'Other', controlname: 'PsyOther' },
  ];

  public currentOccupationList = [
    {
      label: 'Full Time Employment',
      value: '1',
    },
    {
      label: 'Part Time Employment',
      value: '2',
    },
    {
      label: 'Self-employed',
      value: '3',
    },
    {
      label: 'Multiple Jobs',
      value: '4',
    },
    {
      label: 'Unemployed',
      value: '5',
    },
    {
      label: 'Student',
      value: '6',
    },
    {
      label: 'Retied',
      value: '7',
    },
  ];

  occupationalOtherList = [
    {
      label: 'Yes',
      value: '0',
    },
    {
      label: 'No',
      value: '1',
    },
  ];

  relationashipList = [
    {
      label: 'Parents',
      value: '0',
    },
    {
      label: 'Father',
      value: '1',
    },
    {
      label: 'Mother',
      value: '2',
    },
    {
      label: 'Grandparents',
      value: '3',
    },
    {
      label: 'Uncle/Aunt',
      value: '4',
    },
    {
      label: 'Cousin',
      value: '5',
    },
    {
      label: 'Brother/Sister',
      value: '6',
    },
    {
      label: 'Other',
      value: '7',
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
  noScaleAppicable: any;
  paramsObject: any;
  encounterId: any;
  docKey: any;
  isFormValidError: boolean = false;
  duplicates: any[];
  selectedScales: any[] = [];
  scalesArray: any[] = [];
  toScaleArr: any[];
  modalRefScales: BsModalRef;
  isChecked: any;
  public toVitalsArr: any = [];

  constructor(
    private sharedService: SharedService,
    private formBuilder: FormBuilder,
    private emergencyService: EmergencyService,
    private datePipe: DatePipe,
    private _route: ActivatedRoute,
    private patientService: PatientService,
    public storageService: StorageService,
    private commanService: CommanService,
    private dataShareService: DataShareService,
    private dayCaseDashboard: DayCaseDashboardService,
    private modalService: BsModalService,
    private ePrescriptionService: EPrescriptionService
  ) {
    this._route.queryParams.subscribe((params) => {
      this.paramsObject = params;
      this.encounterId =
        this.paramsObject.einri +
        this.paramsObject.falnr +
        this.paramsObject.lfdnr;
      // this.getPatinetDetails(this.encounterId);
    });
    this.initForm();

    // this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe(
    //   (data) => {
    //     if (data != null) {
    //       if (data.type == ActionType.Add$ && data.value == '') {
    //         this.docKey = data.value.Dockey;
    //       }
    //       if (data.type == ActionType.Update$ && data.value) {
    //         this.docKey = data.value.docKey;
    //         this.getNursingAdmissionDocDetails(data.value.docKey);
    //       }
    //       if (data.type == ActionType.Copy$ && data.value) {
    //         this.docKey = data.value.docKey;
    //         this.getNursingAdmissionDocDetails(data.value.docKey);
    //       }
    //     }
    //   }
    // );
  }


  ngOnInit(): void {
  }

  initForm() {
    let currentTime = this.datePipe.transform(new Date(), 'hh:mm:ss a');
    this.nursingAdmissionForm = this.formBuilder.group({
      Dockey: '',
      Dtid: 'ZMED_NRADM',
      Einri: this.paramsObject.einri,
      Patnr: this.paramsObject.patnr,
      Falnr: this.paramsObject.falnr,
      Lfdnr: this.paramsObject.lfdnr,
      Orgdo: this.storageService?.patientData?.deptOrgUnit,
      AAdmittedWard: '',
      ADate: [new Date()],
      ATime: "",
      ARoom: '',
      AReferralType: '',
      AAdmissionMode: '',
      AAdmissionModeT: '',
      AAccompaniedBy: '',
      AAccompaniedByT: '',
      AInfoObtained: '',
      AInfoObtainedT: '',
      ALanguageSpoken: 'English',
      // ASchoolGrade: '',
      AEducated: '',
      AFavouriteToy: '',
      AReasonVisit: '',
      AChiefComplaint: ['', Validators.required],
      Substances: '',
      Vaccinated: '',
      InfectionStatus: '',
      PsyNoProblem: false,
      PsyAnxious: false,
      PsyUncooperative: false,
      PsyDepressed: false,
      PsyAngry: false,
      PsyAgitated: false,
      PsyCombative: false,
      PsyOther: false,
      PsyComments: '',
      OccOccupationalStatus: '',
      OccOccupationalStatusTxt: '',
      OccJobNature: '',
      OccHealthProblems: '',
      OccHealthProblemsTxt: '',
      OccHealthInjury: '',
      OccHealthInjuryTxt: '',
      OccJob: '',
      OccJobTxt: '',
      OccDailyNeeds: '',
      OccDailyNeedsTxt: '',
      OccSpouseWork: '',
      OccSpouseWorkTxt: '',
      OccComments: '',
      EcoLiving: '',
      EcoNoPeople: '',
      EcoRelationship: '',
      EcoRelationshipTxt: '',
      EcoPhone: '',
      EcoFatherJob: '',
      EcoInsurance: '',
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
      ROtherTxt: '', //
      RAt: "",
      FunSelfNoProblem: false,
      FunSelfNeedsSuper: false,
      FunSelfNeedsFeeding: false,
      FunSelfNeedsHygiene: false,
      FunSelfNeedsToileting: false,
      FunSelfNeedsAmulation: false,
      FunMusNoProblem: false,
      FunMusProblemIdentified: false,
      FunMusProblems: '',
      FunAssEquipmentNone: false,
      FunAssEquipmentUseOf: false,
      FunAssEquipmentUseOfTyp: '',
      FunAssEquipmentUseOfTxt: '',
      FunDrNotification: '',
      FunNotified: '',
      ImpairedNutritional0: false,
      ImpairedNutritional1: false,
      ImpairedNutritional2: false,
      ImpairedNutritional3: false,
      ImpairedNutritionalScore: ['', Validators.required],
      SeverityDisease0: false,
      SeverityDisease1: false,
      SeverityDisease2: false,
      SeverityDisease3: false,
      SeverityDiseaseScore: ['', Validators.required],
      TotalScore: ['', Validators.required],
      AgeAdjustedScore: '',
      PhysicianInformed: '',
      NamePhysician: '',
      PComments: '',
      SSleepRest: '',
      SSleepTime: '',
      SNumberHours: '',
      SComments: '',
      OIdBand: false,
      OBathroom: false,
      OBatchCallLight: false,
      ONurseCall: false,
      OMealTimes: false,
      OVisitingHours: false,
      OTvControl: false,
      ONonSmokingPolicy: false,
      OEqual: false,
      OTelephone: false,
      OFallRiskScore: false,
      MaritalStatus: '',
      Since: '',
      NumberSpouse: '',
      HComments: '',
      AttendPhy: this.storageService.getUserProfile()?.Gpart,
      DocStatus: '1',
      TOMEDICATION: new FormArray([]),
      TOINFECTION: new FormArray([]),
      disabledAllPhy: false
    });
    this.defaultAddRow();
    this.defaultAddRowInfectious();

  }

  addItemRowInfectious() {
    this.TOINFECTION = this.nursingAdmissionForm.get('TOINFECTION') as FormArray;
    this.TOINFECTION.push(this.itemFormArrayFieldForInfectious());
  }

  
  defaultAddRow() {
    for (let index = 0; index < 3; index++) {
      this.addItemRow();
    }
  }

  defaultAddRowInfectious() {
    for (let index = 0; index < 3; index++) {
      this.addItemRowInfectious();
    }
  }

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
  
  addTableRow(event: any) {
    if (event == 'Vaccination History') {
      this.addItemRow();
    } else {
      this.addItemRowInfectious()
    }
  }


  itemFormArrayFieldForInfectious(): FormGroup {
    return this.formBuilder.group({
      Dockey: [''],
      InfectiousDiesease: [''],
      Status: [''],
      TypeIsolation: [''],
    });
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

  public openModalForAllergy() {
    this.createAllergyId.openModalForAllergy();
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
    let patnr = this.ePrescriptionService.parameters.patnr;
    patnr = patnr.padStart(10, '0');
    const scalesOrders: Subscription = this.ePrescriptionService.loadData(`e-prescription/ScalesList?Patnr=${patnr}`, false, false, false, false).subscribe((resp: any) => {
      console.log(resp)
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        //this.configurationData = resp.body.d.results;
        // this.toScaleArr = resp.body.d.results;
        if (resp.body?.d?.results.length) {
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

  public viewGlosgowModel(item) {
    if (this.noScaleAppicable) return;
    if (item.value == '1') {
      if (item.Dockey) {
        this.scalesGlosgow.openModalForGlosgow(item.Dockey);
      } else {
        this.sharedService.waringSwallModel('No data found');
      }
    }
  }

  removeScale(index: number) {
    this.scalesList[index].LastScore = "";
    this.scalesList[index].ScoreDesc = "";
    this.scalesList[index].Dockey = "";
    this.scalesList[index].Datetimee = "";
  }

  get items(): FormArray {
    return this.nursingAdmissionForm.get('TOINFECTION') as FormArray;
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
}
