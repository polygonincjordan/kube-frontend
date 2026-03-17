import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Patient } from '@services/e-kardex/interfaces/patient';
import { PatientService } from '@services/e-kardex/patient.service';
import { StorageService } from '@services/storage.service';
import { Subscription, catchError, of } from 'rxjs';
import { DiagnosisTabComponent } from './diagnosis-tab/diagnosis-tab.component';
import Swal from 'sweetalert2';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { SharedService } from '@services/shared.service';
import { DataShareService } from '@services/data-share.service';
import { ActionType } from '@services/interfaces/common.enum';
import { ErVitalsComponent } from 'src/app/day-case-dashboard/check-in/er-vitals/er-vitals.component';


@Component({
  selector: 'app-surgical-passport',
  templateUrl: './surgical-passport.component.html',
  styleUrls: ['./surgical-passport.component.scss'],
})
export class SurgicalPassportComponent implements OnInit {
  @ViewChild('diagnosisNotesKardexId') diagnosisNotesKardex: DiagnosisTabComponent;
  @ViewChild('erVitalsModal') erVitalsModal: ErVitalsComponent;
  public surgicalPassp: boolean = true;
  public diagnosis: boolean = false;
  public vitals: boolean = false;
  formSurgicalPaasDetailGroup:FormGroup
  public toVitalsArr: any = [];
  public toDiagnosisArr: any = [];
  private paramsObject: any;
  public enableCreateVitals: boolean = false;
  public enableCreateDiagnosis: boolean = false;
  private encounterId: any;
  conmonDropOption = [
    { label: 'Yes', value: '0' },
    { label: 'No', value: '1' },
  ];
  npoDropList = [
    { label: 'Yes', value: '0'},
    { label: 'No', value: '1' },
    { label: 'Not Applicable', value:'2' },
  ]
  typeOfIsolationDropList = [
    {  label: 'HIV', value: '0' },
    {  label: 'HCV', value: '1' },
    {  label: 'MRSA', value: '2' },
  ]
  modeOfTransDropList = [
    {  label: 'Ambulatory', value: '0' },
    {  label: 'Wheel chair', value: '1' },
    {  label: 'Stretcher', value: '2' },
    {  label: 'Carried', value: '3' },
    {  label: 'Cuddled', value: '4' },
    {  label: 'Other', value: '5' },
  ]
  prosthesisDropList = [
    {  label: 'Available', value: '0' },
    {  label: 'Not available', value: '1' },
    {  label: 'Not applicable', value: '2' },
  ]
  patientDetails: Patient;
  maritalStatus: any;
  duplicates: any[];
  private subscription: Subscription;
  private actionTypeSubscription$: Subscription;
  docKey: any;
  isFormValidError: boolean = false;
  isChecked: any;
  isCheckedDiagnosis: any;

  constructor(private formBuilder: FormBuilder,private _route: ActivatedRoute,private patientService: PatientService,public storageService: StorageService,private emergencyService:EmergencyService,private sharedService: SharedService,private dataShareService:DataShareService) {
    this._route.queryParams.subscribe((params) => {
      this.paramsObject = params;
      if (this.paramsObject.lfdnr) {
        this.encounterId = this.paramsObject.einri + this.paramsObject.falnr + this.paramsObject.lfdnr;
      }
      this.storageService.setEinri(this.paramsObject.einri);
      this.storageService.setFalnr(this.paramsObject.falnr);
      this.storageService.setLfdnr(this.paramsObject.lfdnr);
      this.storageService.setPatnr(this.paramsObject.patnr);
      this.getPatinetDetails(this.encounterId);
    });

    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe((data) => {      
      if (data != null) {
        if (data.type == ActionType.Add$ && data.value == '') {
          this.docKey = data.value.Dockey
        }
        if (data.type == ActionType.Update$  && data.value) {
        this.docKey = data.value.docKey
        this.getSurgiPassPortDetail(data.value.docKey)
          }
          if (data.type == ActionType.Copy$  && data.value) {
             this.docKey = data.value.docKey
             this.getSurgiPassPortDetail(data.value.docKey)
          }
        }  else {
        // for after code
        }
      })


  }

  ngOnInit(): void {
    this.surgicalPassDocForm()
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

  public switchTabs(tab) {
    if (tab == 'SurgicalPassp') {
      this.surgicalPassp = true;
      this.diagnosis = false;
      this.vitals = false;
    } else if (tab == 'Diagnosis') {
      this.surgicalPassp = false;
      this.diagnosis = true;
      this.vitals = false;
    } else if (tab == 'Vitals') {
      this.surgicalPassp = false;
      this.diagnosis = false;
      this.vitals = true;
    }
  }

  surgicalPassDocForm(SurgicalPassData?:any){
    this.formSurgicalPaasDetailGroup = this.formBuilder.group({
      bandWithName: SurgicalPassData && SurgicalPassData.IdBand ? SurgicalPassData.IdBand : '',
      IdNo: SurgicalPassData && SurgicalPassData.IdNo ? SurgicalPassData.IdNo : '',
      general: SurgicalPassData && SurgicalPassData.Generall ? SurgicalPassData.Generall : '',
      highRisk: SurgicalPassData && SurgicalPassData.HighRisk ? SurgicalPassData.HighRisk : '',
      skin: SurgicalPassData && SurgicalPassData.Skin ? SurgicalPassData.Skin : '',
      bowel: SurgicalPassData && SurgicalPassData.Bowel ? SurgicalPassData.Bowel : '',
      allergies: SurgicalPassData && SurgicalPassData.Allergies ? SurgicalPassData.Allergies : '',
      food: SurgicalPassData && SurgicalPassData.Food ? SurgicalPassData.Food : false,
      medication: SurgicalPassData && SurgicalPassData.Medications ? SurgicalPassData.Medications : false,
      medicationsTxt:  SurgicalPassData && SurgicalPassData.MedicationsTxt ? SurgicalPassData.MedicationsTxt : '',
      prosthesisDenture: SurgicalPassData && SurgicalPassData.Prosthesis ? SurgicalPassData.Prosthesis : '',
      pRemove: SurgicalPassData && SurgicalPassData.PRemoved ? SurgicalPassData.PRemoved : '',
      valuableNail: SurgicalPassData && SurgicalPassData.Valuables ? SurgicalPassData.Valuables : '',
      vRemove: SurgicalPassData && SurgicalPassData.VRemoved ? SurgicalPassData.VRemoved : '',
      npo: SurgicalPassData && SurgicalPassData.Npo ? SurgicalPassData.Npo : '',
      typeOfIsolation: SurgicalPassData && SurgicalPassData.Isolationn ? SurgicalPassData.Isolationn : '',
      bloodArranged: SurgicalPassData && SurgicalPassData.BloodArranged ? SurgicalPassData.BloodArranged : '',
      voided:  SurgicalPassData && SurgicalPassData.Voided ? SurgicalPassData.Voided : '',
      catheter:  SurgicalPassData && SurgicalPassData.Catheter ? SurgicalPassData.Catheter : '',
      ngt: SurgicalPassData && SurgicalPassData.Ngt ? SurgicalPassData.Ngt : '',
      itime: [SurgicalPassData && SurgicalPassData.ITime ? this.convertDurationToTime(SurgicalPassData.ITime) : '',Validators.required],
      NoOfunit: SurgicalPassData && SurgicalPassData.Units ? SurgicalPassData.Units : '',
      VTime: [SurgicalPassData && SurgicalPassData.VTime ? this.convertDurationToTime(SurgicalPassData.VTime) : '',Validators.required],
      PreMedicationAdministred: SurgicalPassData && SurgicalPassData.PreMedication ? SurgicalPassData.PreMedication : '',
      skinTest: SurgicalPassData && SurgicalPassData.SkinTest ? SurgicalPassData.SkinTest : '',
      fullDose: SurgicalPassData && SurgicalPassData.FullDose ? SurgicalPassData.FullDose : '',
      OtClothes: SurgicalPassData && SurgicalPassData.OtClothes ? SurgicalPassData.OtClothes : '',
      FinanceClearence:  SurgicalPassData && SurgicalPassData.Finance ? SurgicalPassData.Finance : '',
      modeOfTrans:  SurgicalPassData && SurgicalPassData.Transportation ? SurgicalPassData.Transportation : '',
      specialInstruction:  SurgicalPassData && SurgicalPassData.Special ? SurgicalPassData.Special : '',
      InvestigationsRecordAtteched:  SurgicalPassData && SurgicalPassData.Investigations ? SurgicalPassData.Investigations : '',
      prosthesisImplant: SurgicalPassData && SurgicalPassData.Implant ? SurgicalPassData.Implant : '',
      comments: SurgicalPassData && SurgicalPassData.Comments ? SurgicalPassData.Comments : '',
      wardCheck: SurgicalPassData && SurgicalPassData.WardCheck ? SurgicalPassData.WardCheck : false,
      nameOfAssignedStaff: SurgicalPassData && SurgicalPassData.WardCheckNm ? SurgicalPassData.WardCheckNm : '',
      OrStaff: SurgicalPassData && SurgicalPassData.OrCheck ? SurgicalPassData.OrCheck : false,
      NameOfOrStaff: SurgicalPassData && SurgicalPassData.OrCheckNm ? SurgicalPassData.OrCheckNm : '',
      commentslast: SurgicalPassData && SurgicalPassData.Comments1 ? SurgicalPassData.Comments1 : '',
      isVitals:[false],
      isDiagnosis:[false]
    })
  }
  public deleteVitalsFromTable(index:number) {
    if(index > -1){
      this.toVitalsArr.splice(index, 1);
    }
  }
  public deleteDiagnosisFromTable(index: number) {
    if (index > -1) {
      this.toDiagnosisArr.splice(index, 1);
    }
  }

  public importVitalsData(data) {
    debugger
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
  } public getDate(value) {
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
  public handleCheckboxVitals(event) {
    this.isChecked = event.target.checked;
    this.formSurgicalPaasDetailGroup.get('isVitals')?.setValue(this.isChecked);
  } 
  public handleCheckboxDiagnosis(event) {
    this.isCheckedDiagnosis = event.target.checked;
    this.formSurgicalPaasDetailGroup.get('isDiagnosis')?.setValue(this.isCheckedDiagnosis);
  }
  public getPatinetDetails(encounterId) {
    this.patientService.getDataPatient(encounterId).pipe(catchError(() => {
      return of({} as Patient);
    })).subscribe((patientData: Patient) => {
      this.patientDetails = patientData;
      this.maritalStatus = this.patientDetails.maritalStatus;
      this.storageService.setPatientData(patientData);
    });
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
      Orgpf: this.storageService.patientData.deptOrgUnit,
    };
    this.erVitalsModal.openModalForErVital(item, '', 'surgical');
  }
  public openModalForDiagnosis() {
    if(this.isCheckedDiagnosis) return
    this.diagnosisNotesKardex.openModalForDiagnosisKardex();
  }

  importDiagnosisData(data) {
    data.forEach((el) => {
      this.toDiagnosisArr = this.toDiagnosisArr.concat({
        Dockey: '',
        DCode: el.DiagKey1,
        DDescription: el.DiagShorttext,
        DRemarks: el.DiagText,
        DAdmission: el.AdmissionDia,
        DDischarge: el.DischargeDia,
        DWorking: el.WorkDiagInd,
        DPreoperative: el.PreopDiagInd,
        DSurgery: el.SurgeryDia,
        DDeath: el.CauseOfDeath,
        DDepartment: el.DeptMainDia,
        DHospital: el.HospMainDia,
      });
    });
    this.duplicates = [];
    this.duplicates = this.findDuplicatesDiagnosis();
    this.toDiagnosisArr = this.toDiagnosisArr.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.DCode === value.DCode)
    );
    if (this.duplicates.length > 0) {
      this.errorMsgForDuplicatesDiagnosis();
    }
  }

  findDuplicatesDiagnosis() {
    let tempArr = [];
    const lookup = this.toDiagnosisArr.reduce((a, e) => {
      a[e.DCode] = ++a[e.DCode] || 0;
      return a;
    }, {});
    tempArr = this.toDiagnosisArr.filter((e) => lookup[e.DCode]);
    return tempArr.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.DCode === value.DCode)
    );
  }
  errorMsgForDuplicatesDiagnosis() {
    let codeArr = [];
    this.duplicates.forEach((element) => {
      codeArr.push(element.DCode);
    });

    Swal.fire({
      text: `${codeArr.toString()} is/are already Imported `,
      icon: 'warning',
      confirmButtonText: 'Ok',
      customClass: { popup: 'myalertpopup' },
    });
  }


   convertTimeToDuration(timeString: string): string {
    
    const [hours, minutes] = timeString.split(':').map(Number);

    const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;

    const durationString = `PT${formattedHours}H${formattedMinutes}M00S`;
    return timeString ? durationString : '';
}

 convertDurationToTime(durationString: string): string {
  const match = durationString.match(/PT(\d{2})H(\d{2})M/);
  if (match && match.length === 3) {
      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const timeString = `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
      return timeString;
  }
  return ''; 
}



  createSurgicalPassDoc(status?:any,actionType?:any) {
    this.isFormValidError = true
    return new Promise((resolve, reject) => {
    const Payload = {
      d: {
        Dockey: actionType === 'edit' ? this.docKey : '',
        Dtid: 'ZMED_SRGPP',
        Einri: this.paramsObject.einri,
        Patnr: this.paramsObject.patnr,
        Falnr: this.paramsObject.falnr,
        Lfdnr: this.paramsObject.lfdnr,
        Orgdo: this.storageService.patientData.deptOrgUnit,
        IdBand: this.formSurgicalPaasDetailGroup.value.bandWithName,
        IdNo: this.formSurgicalPaasDetailGroup.value.IdNo,
        Generall: this.formSurgicalPaasDetailGroup.value.general,
        HighRisk: this.formSurgicalPaasDetailGroup.value.highRisk,
        Skin:  this.formSurgicalPaasDetailGroup.value.skin,
        Bowel: this.formSurgicalPaasDetailGroup.value.bowel,
        Allergies: this.formSurgicalPaasDetailGroup.value.allergies,
        Food: this.formSurgicalPaasDetailGroup.value.food,
        Medications: this.formSurgicalPaasDetailGroup.value.medication,
        MedicationsTxt: this.formSurgicalPaasDetailGroup.value.medicationsTxt,
        Prosthesis: this.formSurgicalPaasDetailGroup.value.prosthesisDenture,
        PRemoved: this.formSurgicalPaasDetailGroup.value.pRemove,
        Valuables: this.formSurgicalPaasDetailGroup.value.valuableNail,
        VRemoved: this.formSurgicalPaasDetailGroup.value.vRemove,
        Npo: this.formSurgicalPaasDetailGroup.value.npo,
        Ngt: this.formSurgicalPaasDetailGroup.value.ngt,
        Isolationn: this.formSurgicalPaasDetailGroup.value.typeOfIsolation,
        ITime: this.convertTimeToDuration(this.formSurgicalPaasDetailGroup.value.itime),
        BloodArranged: this.formSurgicalPaasDetailGroup.value.bloodArranged,
        Units: this.formSurgicalPaasDetailGroup.value.NoOfunit,
        Voided: this.formSurgicalPaasDetailGroup.value.voided,
        VTime: this.convertTimeToDuration(this.formSurgicalPaasDetailGroup.value.VTime),
        Catheter:  this.formSurgicalPaasDetailGroup.value.catheter,
        PreMedication: this.formSurgicalPaasDetailGroup.value.PreMedicationAdministred,
        SkinTest: this.formSurgicalPaasDetailGroup.value.skinTest,
        FullDose: this.formSurgicalPaasDetailGroup.value.fullDose,
        OtClothes: this.formSurgicalPaasDetailGroup.value.OtClothes,
        Transportation: this.formSurgicalPaasDetailGroup.value.modeOfTrans,
        Investigations: this.formSurgicalPaasDetailGroup.value.InvestigationsRecordAtteched,
        Finance:  this.formSurgicalPaasDetailGroup.value.FinanceClearence,
        Special: this.formSurgicalPaasDetailGroup.value.specialInstruction,
        Implant: this.formSurgicalPaasDetailGroup.value.prosthesisImplant,
        Comments: this.formSurgicalPaasDetailGroup.value.comments,
        WardCheck: this.formSurgicalPaasDetailGroup.value.wardCheck,
        WardCheckNm: this.formSurgicalPaasDetailGroup.value.nameOfAssignedStaff,
        OrCheck: this.formSurgicalPaasDetailGroup.value.OrStaff,
        OrCheckNm:  this.formSurgicalPaasDetailGroup.value.NameOfOrStaff,
        Comments1: this.formSurgicalPaasDetailGroup.value.commentslast,
        AttendPhy: this.storageService.getUserProfile().Gpart,
        DocStatus: status,
        TODIAGNOSES: this.toDiagnosisArr ?  this.toDiagnosisArr :[] ,
        TOVITALSIGNS: this.toVitalsArr ? this.toVitalsArr:[] ,
      },
    };
    if(this.formSurgicalPaasDetailGroup.valid){
      this.subscription = this.emergencyService.createSurgicalPassDetail(Payload).subscribe({
        next: (data: any) => {
        },
        error: (err: any) => {
          this.sharedService.waringSwallModel(`Error ${err}`);
          this.sharedService.waringSwallModel(`PUT Error at Surgical Passport : ${err}`);
        },
        complete: () => {
          resolve(true);
          if(status === 'edit'){
            this.sharedService.successSwallModel('Surgical Passport updated successfully');
          }else{
            this.sharedService.successSwallModel('Surgical Passport created successfully');
          }
          this.isFormValidError = false
        }
      });    
    }
  })
  }
  copySurgicalPassDoc(status?:any,actionType?:any) {
    return new Promise((resolve, reject) => {
    const Payload = {
      d: {
        Dockey: actionType === 'copy' ? this.docKey : '',
        Dtid: 'ZMED_SRGPP',
        Einri: this.paramsObject.einri,
        Patnr: this.paramsObject.patnr,
        Falnr: this.paramsObject.falnr,
        Lfdnr: this.paramsObject.lfdnr,
        Orgdo: this.storageService.patientData.deptOrgUnit,
        IdBand: this.formSurgicalPaasDetailGroup.value.bandWithName,
        IdNo: this.formSurgicalPaasDetailGroup.value.IdNo,
        Generall: this.formSurgicalPaasDetailGroup.value.general,
        HighRisk: this.formSurgicalPaasDetailGroup.value.highRisk,
        Skin:  this.formSurgicalPaasDetailGroup.value.skin,
        Bowel: this.formSurgicalPaasDetailGroup.value.bowel,
        Allergies: this.formSurgicalPaasDetailGroup.value.allergies,
        Food: this.formSurgicalPaasDetailGroup.value.food,
        Medications: this.formSurgicalPaasDetailGroup.value.medication,
        MedicationsTxt: this.formSurgicalPaasDetailGroup.value.medicationsTxt,
        Prosthesis: this.formSurgicalPaasDetailGroup.value.prosthesisDenture,
        PRemoved: this.formSurgicalPaasDetailGroup.value.pRemove,
        Valuables: this.formSurgicalPaasDetailGroup.value.valuableNail,
        VRemoved: this.formSurgicalPaasDetailGroup.value.vRemove,
        Npo: this.formSurgicalPaasDetailGroup.value.npo,
        Ngt: this.formSurgicalPaasDetailGroup.value.ngt,
        Isolationn: this.formSurgicalPaasDetailGroup.value.typeOfIsolation,
        ITime: this.convertTimeToDuration(this.formSurgicalPaasDetailGroup.value.itime),
        BloodArranged: this.formSurgicalPaasDetailGroup.value.bloodArranged,
        Units: this.formSurgicalPaasDetailGroup.value.NoOfunit,
        Voided: this.formSurgicalPaasDetailGroup.value.voided,
        VTime: this.convertTimeToDuration(this.formSurgicalPaasDetailGroup.value.VTime),
        Catheter:  this.formSurgicalPaasDetailGroup.value.catheter,
        PreMedication: this.formSurgicalPaasDetailGroup.value.PreMedicationAdministred,
        SkinTest: this.formSurgicalPaasDetailGroup.value.skinTest,
        FullDose: this.formSurgicalPaasDetailGroup.value.fullDose,
        OtClothes: this.formSurgicalPaasDetailGroup.value.OtClothes,
        Transportation: this.formSurgicalPaasDetailGroup.value.modeOfTrans,
        Investigations: this.formSurgicalPaasDetailGroup.value.InvestigationsRecordAtteched,
        Finance:  this.formSurgicalPaasDetailGroup.value.FinanceClearence,
        Special: this.formSurgicalPaasDetailGroup.value.specialInstruction,
        Implant: this.formSurgicalPaasDetailGroup.value.prosthesisImplant,
        Comments: this.formSurgicalPaasDetailGroup.value.comments,
        WardCheck: this.formSurgicalPaasDetailGroup.value.wardCheck,
        WardCheckNm: this.formSurgicalPaasDetailGroup.value.nameOfAssignedStaff,
        OrCheck: this.formSurgicalPaasDetailGroup.value.OrStaff,
        OrCheckNm:  this.formSurgicalPaasDetailGroup.value.NameOfOrStaff,
        Comments1: this.formSurgicalPaasDetailGroup.value.commentslast,
        AttendPhy: this.storageService.getUserProfile().Gpart,
        DocStatus: status,
        TODIAGNOSES: this.toDiagnosisArr ?  this.toDiagnosisArr :[] ,
        TOVITALSIGNS: this.toVitalsArr ? this.toVitalsArr:[] ,
      },
    };

    this.subscription = this.emergencyService.createSurgicalPassDetail(Payload).subscribe({
      next: (data: any) => {
      },
      error: (err: any) => {
        this.sharedService.waringSwallModel(`Error ${err}`);
        this.sharedService.waringSwallModel(`PUT Error at Surgical Passport : ${err}`);
      },
      complete: () => {
        resolve(true);
        if(status === 'edit'){
          this.sharedService.successSwallModel('Surgical Passport updated successfully');
        }
        this.sharedService.successSwallModel('Surgical Passport created successfully');
      }
    });    
  })
  }

  getSurgiPassPortDetail(docKey?:any){
 
    this.subscription = this.emergencyService.getSurgicalPassPortDetail(docKey).subscribe({
      next: (data: any) => {
  
  this.surgicalPassDocForm(data.d.results[0])
  this.toDiagnosisArr = data.d.results[0].TODIAGNOSES.rsults
  this.toVitalsArr = data.d.results[0].TOVITALSIGNS.rsults
  
      },
      error: (err: any) => {
        this.sharedService.waringSwallModel(`Error ${err}`);
        this.sharedService.waringSwallModel(`POST Error at Surgical Passport: ${err}`);
      },
      // complete: () => {
        
      //   this.sharedService.successSwallModel('Nurse Endorsment created successfully');
      // }
    });
  }
}
