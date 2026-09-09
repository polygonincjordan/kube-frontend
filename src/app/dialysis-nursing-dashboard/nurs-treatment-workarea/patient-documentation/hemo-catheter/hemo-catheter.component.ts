import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DataShareService } from '@services/data-share.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ActionType } from '@services/interfaces/common.enum';
import { PatientDocumentationService } from '@services/patient-documentation.service';
import { StorageService } from '@services/storage.service';
import { Subscription } from 'rxjs';

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
  daysDifference: number;

  latestHemoCatheterData: any;
  private actionTypeSubscription$: Subscription;

  constructor(private storageService: StorageService, private emergencyService:EmergencyService, private patientDocService: PatientDocumentationService,private datePipe: DatePipe,private dataShareService:DataShareService) {
    
    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe((data) => {
      
      if (data != null) {       
        if (data.type == ActionType.Copy$ && data.isAllow == true && data.value) {
           this.getDocData();
        }
        if (data.type == ActionType.Update$ && data.isAllow == true && data.value) {
           this.getDocData();
        }
      }
    });
  }

  @ViewChildren('checkbox') checkboxes: QueryList<ElementRef>;

  getDocData(){
    this.emergencyService.getHemoCatheterDoc(this.patientDocService.latestHemoCatheterData?.Dockey).subscribe({
      next : (data: any) => {
        if(data.d){
          const resp = data.d.results[0];
          this.hemoCatheterForm.patchValue({
            ...resp,
            SessionDate: this.patientDocService.formatDate(resp.SessionDate),
            SessionTime: this.parseTime(resp.SessionTime),
            CatheterInsertion: this.patientDocService.formatDate(resp.CatheterInsertion),
            CatheterRemoval: this.patientDocService.formatDate(resp.CatheterRemoval),
          });

          this.checkboxes.forEach((element:ElementRef)=>{
            if(resp[element.nativeElement.name]){
              element.nativeElement.checked = true;
            }
          })
        }
      },
      error : (error)=>{
        console.error(error);
      }
    })
  }


  ngOnInit(): void {
    let currentTime = this.datePipe.transform(new Date(), 'hh:mm:ss');
    this.hemoCatheterForm = new FormGroup({
    SessionDate : new FormControl(new Date()),
    SessionTime : new FormControl(currentTime),
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
    })

    

    this.realized = this.storageService.getLocal('amc_dev_loggedInUserProfile', false)
    this.realizedDescription = this.storageService.getLocal('amc_dev_loggedInUserProfile',false)

    this.hemoCatheterForm.controls['AttendPhy'].patchValue(this.realized);

    this.patientData = JSON.parse(this.storageService.getLocal('patientData'));
   
    const timeDifference = new Date().getTime() - new Date(this.patientData.periodStart).getTime();
    this.daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1;
  }

  ngOnDestroy(): void {
  }

  parseTime(data: string) {    
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
        const hours =
          +(strArr[2] + strArr[3]) <= 9
            ? `0${+(strArr[2] + strArr[3])}`
            : +(strArr[2] + strArr[3]);
        const Minute =
          +(strArr[5] + strArr[6]) <= 9
            ? `0${+(strArr[5] + strArr[6])}`
            : +(strArr[5] + strArr[6]);
        const Second =
          +(strArr[8] + strArr[9]) <= 9
            ? `0${+(strArr[8] + strArr[9])}`
            : +(strArr[8] + strArr[9]);
        return `${hours}:${Minute}:${Second}`;
      }
    }
    return null;
  }

  checkChange(event){
    const {name,checked} = event.target as HTMLInputElement 
    this.hemoCatheterForm.get(name).patchValue(checked)

    this.updateData();
  }

  getFormData(){
    return this.hemoCatheterForm.value;
  }

  convertToDateTime(timeString){
    const time = timeString;
    const hours = time.substring(2, 4);
    const minutes = time.substring(5, 7);
    const seconds = time.substring(8, 10);

    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(seconds);

    return date;
  }

  radioChange(event: Event) {
    const { name,value } = event.target as HTMLInputElement;

    const textFieldsToUpdate: { [key: string]: string } = {
      CatheterCon: 'CatheterConTxt',
      CatheterDiscon: 'CatheterDisconTxt',
      CatheterExit: 'CatheterExitTxt',
      MedicationPrep: 'MedicationPrepTxt',
      MedicationAdm: 'MedicationAdmTxt',
      DialysisStat: 'DialysisStatTxt'
  };
  
    const checkboxesToUpdate: { [key: string]: string[] } = {
      CatheterCon: ['ConHandHygiene', 'ConProperPpe', 'ConProvideMask', 'ConSoakDialysis', 'ConScrubCatheter', 'ConConnectCatheter', 'ConAttachNew'],
      CatheterDiscon: ['DisconHandHygiene', 'DisconProperPpe', 'DisconProvideMask', 'DisconSoakDialysis', 'DisconDisCatheter', 'DisconDiscardTubing', 'DisconScrubCatheter'],
      CatheterExit: ['ExitHandHygiene', 'ExitApplySkin', 'ExitAllowSkin', 'ExitApplyDressing'],
      MedicationPrep: ['PrepHandHygiene', 'PrepMedications', 'PrepInspectVials', 'PrepAsepticTechniq', 'PrepNewNeedle', 'PrepDiscardAll', 'PrepProperlyStore'],
      MedicationAdm: ['AdmHandHygiene', 'AdmProperPpe', 'AdmProperlyTrans', 'AdmInjectionPort', 'AdmAdministerMed', 'AdmDiscardSyringe'],
      DialysisStat: ['StatProperPpe', 'StatEnsureThat', 'StatDiscardAll', 'StatNursingClean', 'StatKeepUsed', 'StatHousekeeping']
    };
  
    this.checkboxes.forEach((elem: ElementRef) => {
      const elemName = elem.nativeElement.name;
      const checked = checkboxesToUpdate[name].includes(elemName) ? false : elem.nativeElement.checked;
      elem.nativeElement.checked = checked;
      this.hemoCatheterForm.get(elemName).patchValue(checked);
    });

    if (value === '0' || value === '1') {
      const textField = textFieldsToUpdate[name];
      if (textField) {
          this.hemoCatheterForm.get(textField).patchValue('');
      }
    }
  }
  
  updateData() {
    const updateField = (field: string, values: string[]) => {
      const trueValues = values.filter(value => this.hemoCatheterForm.get(value).value === true);
      const patchValue = trueValues.length === values.length ? '0' : (trueValues.length > 0 ? '1' : '2');
      this.hemoCatheterForm.get(field).patchValue(patchValue)
    };
  
    updateField('CatheterCon', ['ConHandHygiene', 'ConProperPpe', 'ConProvideMask', 'ConSoakDialysis', 'ConScrubCatheter', 'ConConnectCatheter', 'ConAttachNew']);
    updateField('CatheterDiscon', ['DisconHandHygiene', 'DisconProperPpe', 'DisconProvideMask', 'DisconSoakDialysis', 'DisconDisCatheter', 'DisconDiscardTubing', 'DisconScrubCatheter']);
    updateField('CatheterExit', ['ExitHandHygiene', 'ExitApplySkin', 'ExitAllowSkin', 'ExitApplyDressing']);
    updateField('MedicationPrep', ['PrepHandHygiene', 'PrepMedications', 'PrepInspectVials', 'PrepAsepticTechniq', 'PrepNewNeedle', 'PrepDiscardAll', 'PrepProperlyStore']);
    updateField('MedicationAdm', ['AdmHandHygiene', 'AdmProperPpe', 'AdmProperlyTrans', 'AdmInjectionPort', 'AdmAdministerMed', 'AdmDiscardSyringe']);
    updateField('DialysisStat', ['StatProperPpe', 'StatEnsureThat', 'StatDiscardAll', 'StatNursingClean', 'StatKeepUsed', 'StatHousekeeping']);
  }
}
