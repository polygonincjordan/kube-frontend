import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { PatientDocumentationService } from '@services/patient-documentation.service';
import { StorageService } from '@services/storage.service';

@Component({
  selector: 'app-hemo-catheter',
  templateUrl: './hemo-catheter.component.html',
  styleUrls: ['./hemo-catheter.component.scss']
})
export class HemoCatheterComponent implements OnInit {
  hemoCatheterForm: FormGroup;
  realized: string;
  realizedDescription: string;
  patientData: any;
  isSelected:boolean = false;
  isInputSelected:boolean = false;
  isInputDisconnection:boolean =false;
  isDisconnection:boolean =false;
  isInputDisExitsit:boolean = false;
  isDisExitsit:boolean = false;
  isInputPreparation:boolean = false;
  isPreparation:boolean = false;
  isInputadministration:boolean = false;
  isadministration:boolean = false;
  isInputdialysisStatus:boolean = false;
  isdialysisStatus:boolean = false;
  daysDifference: number;

  constructor(private storageService: StorageService) { }

  ngOnInit(): void {
    this.hemoCatheterForm = new FormGroup({
    // Dockey : "",
    // Dtid : "ZMED_HBCA",
    // Einri : "1000",
    // Patnr : "1101",
    // Falnr : "1402",
    // Lfdnr : "00001",
    // Orgdo : "F21IUAMC",
    SessionDate : new FormControl(new Date()),
    SessionTime : new FormControl(new Date()),
    CatheterDays : new FormControl(''),
    CatheterInsertion : new FormControl(new Date()),
    CatheterRemoval : new FormControl(new Date()),
    CatheterCon : new FormControl('2'),
    CatheterConTxt : new FormControl(""),
    ConHandHygiene : new FormControl(false),
    ConProperPpe : new FormControl(false),
    ConProvideMask : new FormControl(false),
    ConSoakDialysis : new FormControl(false),
    ConScrubCatheter : new FormControl(false),
    ConConnectCatheter : new FormControl(false),
    ConAttachNew : new FormControl(false),
    CatheterDiscon : new FormControl('2'),
    CatheterDisconTxt : new FormControl(""),
    DisconHandHygiene : new FormControl(false),
    DisconProperPpe : new FormControl(false),
    DisconProvideMask : new FormControl(false),
    DisconSoakDialysis : new FormControl(false),
    DisconDisCatheter : new FormControl(false),
    DisconDiscardTubing : new FormControl(false),
    DisconScrubCatheter : new FormControl(false),
    CatheterExit : new FormControl('2'),
    CatheterExitTxt : new FormControl(""),
    ExitHandHygiene : new FormControl(false),
    ExitApplySkin : new FormControl(false),
    ExitAllowSkin : new FormControl(false),
    ExitApplyDressing : new FormControl(false),
    MedicationPrep : new FormControl('2'),
    MedicationPrepTxt : new FormControl(""),
    PrepHandHygiene : new FormControl(false),
    PrepMedications : new FormControl(false),
    PrepInspectVials : new FormControl(false),
    PrepAsepticTechniq : new FormControl(false),
    PrepNewNeedle : new FormControl(false),
    PrepDiscardAll : new FormControl(false),
    PrepProperlyStore : new FormControl(false),
    MedicationAdm : new FormControl('2'),
    MedicationAdmTxt : new FormControl(""),
    AdmHandHygiene : new FormControl(false),
    AdmProperPpe : new FormControl(false),
    AdmProperlyTrans : new FormControl(false),
    AdmInjectionPort : new FormControl(false),
    AdmAdministerMed : new FormControl(false),
    AdmDiscardSyringe : new FormControl(false),
    DialysisStat : new FormControl('2'),
    DialysisStatTxt : new FormControl(""),
    StatProperPpe : new FormControl(false),
    StatEnsureThat : new FormControl(false),
    StatDiscardAll : new FormControl(false),
    StatNursingClean : new FormControl(false),
    StatKeepUsed : new FormControl(false),
    StatHousekeeping : new FormControl(false),
    SignsCatheter : new FormControl(''),
    Comments : new FormControl(''),
    AttendPhy : new FormControl(''),
    // DocStatus : "1"
    })


    this.realized = JSON.parse(
      localStorage.getItem('amc_dev_loggedInUserProfile')
    ).Gpart;
    this.realizedDescription = JSON.parse(
      localStorage.getItem('amc_dev_loggedInUserProfile')
    ).GpartName;

    this.hemoCatheterForm.controls['AttendPhy'].patchValue(this.realized);

    this.patientData = JSON.parse(this.storageService.getLocal('patientData'));
    console.log(this.patientData);

    
   
    const timeDifference = new Date().getTime() - new Date(this.patientData.periodStart).getTime();
    this.daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1;
  }

  checkChange(event){
    const {name,checked} = event.target as HTMLInputElement 
    this.hemoCatheterForm.get(name).patchValue(checked)
  }

  getFormData(){
    return this.hemoCatheterForm.value;
  }
}
