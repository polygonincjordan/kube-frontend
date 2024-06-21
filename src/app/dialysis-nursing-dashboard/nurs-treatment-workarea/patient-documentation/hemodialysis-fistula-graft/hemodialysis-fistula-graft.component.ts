import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { PatientDocumentationService } from '@services/patient-documentation.service';
import { StorageService } from '@services/storage.service';

@Component({
  selector: 'app-hemodialysis-fistula-graft',
  templateUrl: './hemodialysis-fistula-graft.component.html',
  styleUrls: ['./hemodialysis-fistula-graft.component.scss'],
})
export class HemodialysisFistulaGraftComponent implements OnInit {
  hemoDialysisFistulGraftForm: FormGroup;
  realized: string;
  realizedDescription: string;
  patientData: any;
  daysDifference: number;

  anatomicalSiteOptions: Array<{  name: string, value: string }> = [
    { name: 'Left Arm', value: '0' },
    { name: 'Right Arm', value: '1' },
    { name: 'Left Forearm', value: '2' },
    { name: 'Right Forearm', value: '3' },
    { name: 'Left Femoral', value: '4' },
    { name: 'Right Femoral', value: '5' },
    { name: 'Left Radial', value: '6' },
    { name: 'Right Radial', value: '7' },
    { name: 'Left Brachial', value: '8' },
    { name: 'Right Brachial', value: '9' },
  ];

  @ViewChildren('checkbox') checkboxes: QueryList<ElementRef>;
  
  constructor(private storageService: StorageService, private emergencyService: EmergencyService, private patientDocService:PatientDocumentationService) {
    this.getDocData();
  }

  getDocData(){
    this.emergencyService.getHemoDialysisFistulaGraftDoc(this.patientDocService.latestHemoDialysisFistulaGraftData?.Dockey).subscribe({
      next : (data: any) => {
        if(data.d){
          const resp = data.d.results[0];
          this.hemoDialysisFistulGraftForm.patchValue({
            ...resp,
            SessionDate: this.patientDocService.formatDate(resp.SessionDate),
            SessionTime: this.convertToDateTime(resp.SessionTime),
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
    this.hemoDialysisFistulGraftForm = new FormGroup({
      SessionDate: new FormControl(new Date()),
      SessionTime: new FormControl(new Date()),
      AnatomicalSite: new FormControl(''),
      AvCan: new FormControl('2'),
      AvCanTxt: new FormControl(''),
      CanHandHygiene: new FormControl(false),
      CanProperPpe: new FormControl(false),
      CanCleanSite: new FormControl(false),
      CanApplySkin: new FormControl(false),
      CanContactSite: new FormControl(false),
      CanInsertNeedles: new FormControl(false),
      AvDecan: new FormControl('2'),
      AvDecanTxt: new FormControl(''),
      DecanHandHygiene: new FormControl(false),
      DecanProperPpe: new FormControl(false),
      DecanDisconnectFrom: new FormControl(false),
      DecanDiscardTubing: new FormControl(false),
      DecanWearClean: new FormControl(false),
      DecanRemoveNeedles: new FormControl(false),
      DecanApplyClean: new FormControl(false),
      MedicationPrep: new FormControl('2'),
      MedicationPrepTxt: new FormControl(''),
      PrepHandHygiene: new FormControl(false),
      PrepMedications: new FormControl(false),
      PrepInspectVials: new FormControl(false),
      PrepAsepticTechniq: new FormControl(false),
      PrepNewNeedle: new FormControl(false),
      PrepDiscardAll: new FormControl(false),
      PrepProperlyStore: new FormControl(false),
      MedicationAdm: new FormControl('2'),
      MedicationAdmTxt: new FormControl(''),
      AdmHandHygiene: new FormControl(false),
      AdmProperPpe: new FormControl(false),
      AdmProperlyTrans: new FormControl(false),
      AdmInjectionPort: new FormControl(false),
      AdmAdministerMed: new FormControl(false),
      AdmDiscardSyringe: new FormControl(false),
      DialysisStat: new FormControl('2'),
      DialysisStatTxt: new FormControl(''),
      StatProperPpe: new FormControl(false),
      StatEnsureThat: new FormControl(false),
      StatDiscardAll: new FormControl(false),
      StatNursingClean: new FormControl(false),
      StatKeepUsed: new FormControl(false),
      StatHousekeeping: new FormControl(false),
      SignsFistulaGraft: new FormControl(''),
      Comments: new FormControl(''),
      AttendPhy: new FormControl(''),
    });

    // this.realized = JSON.parse(
    //   localStorage.getItem('amc_dev_loggedInUserProfile')
    // ).Gpart;
    // this.realizedDescription = JSON.parse(
    //   localStorage.getItem('amc_dev_loggedInUserProfile')
    // ).GpartName;

    this.realized = this.storageService.getLocal('amc_dev_loggedInUserProfile', false)
    this.realizedDescription = this.storageService.getLocal('amc_dev_loggedInUserProfile',false)

    this.hemoDialysisFistulGraftForm.controls['AttendPhy'].patchValue(
      this.realized
    );

    this.patientData = JSON.parse(this.storageService.getLocal('patientData'));

    const timeDifference =
      new Date().getTime() - new Date(this.patientData.periodStart).getTime();
    this.daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1;
  }

  checkChange(event){
    const {name,checked} = event.target as HTMLInputElement 
    this.hemoDialysisFistulGraftForm.get(name).patchValue(checked)

    this.updateData();
  }

  getFormData(){
    return this.hemoDialysisFistulGraftForm.value;
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
    const { name, value } = event.target as HTMLInputElement;

    const textFieldsToUpdate: { [key: string]: string } = {
        AvCan: 'AvCanTxt',
        AvDecan: 'AvDecanTxt',
        MedicationPrep: 'MedicationPrepTxt',
        MedicationAdm: 'MedicationAdmTxt',
        DialysisStat: 'DialysisStatTxt'
    };

    const checkboxesToUpdate: { [key: string]: string[] } = {
        AvCan: ['CanHandHygiene', 'CanProperPpe', 'CanCleanSite', 'CanApplySkin', 'CanContactSite', 'CanInsertNeedles'],
        AvDecan: ['DecanHandHygiene', 'DecanProperPpe', 'DecanDisconnectFrom', 'DecanDiscardTubing', 'DecanWearClean', 'DecanRemoveNeedles', 'DecanApplyClean'],
        MedicationPrep: ['PrepHandHygiene', 'PrepMedications', 'PrepInspectVials', 'PrepAsepticTechniq', 'PrepNewNeedle', 'PrepDiscardAll', 'PrepProperlyStore'],
        MedicationAdm: ['AdmHandHygiene', 'AdmProperPpe', 'AdmProperlyTrans', 'AdmInjectionPort', 'AdmAdministerMed', 'AdmDiscardSyringe'],
        DialysisStat: ['StatProperPpe', 'StatEnsureThat', 'StatDiscardAll', 'StatNursingClean', 'StatKeepUsed', 'StatHousekeeping']
    };

    this.checkboxes.forEach((elem: ElementRef) => {
        const elemName = elem.nativeElement.name;
        const checked = checkboxesToUpdate[name].includes(elemName) ? false : elem.nativeElement.checked;
        elem.nativeElement.checked = checked;
        this.hemoDialysisFistulGraftForm.get(elemName).patchValue(checked);
    });

    if (value === '0' || value === '1') {
        const textField = textFieldsToUpdate[name];
        if (textField) {
            this.hemoDialysisFistulGraftForm.get(textField).patchValue('');
        }
    }
  }

  
  updateData() {
    const updateField = (field: string, values: string[]) => {
      const trueValues = values.filter(value => this.hemoDialysisFistulGraftForm.get(value).value === true);
      const patchValue = trueValues.length === values.length ? '0' : (trueValues.length > 0 ? '1' : '2');
      this.hemoDialysisFistulGraftForm.get(field).patchValue(patchValue)
    };
  
    updateField('AvCan', ['CanHandHygiene', 'CanProperPpe', 'CanCleanSite', 'CanApplySkin', 'CanContactSite', 'CanInsertNeedles']);
    updateField('AvDecan',  ['DecanHandHygiene', 'DecanProperPpe', 'DecanDisconnectFrom', 'DecanDiscardTubing', 'DecanWearClean', 'DecanRemoveNeedles', 'DecanApplyClean']);
    updateField('MedicationPrep', ['PrepHandHygiene', 'PrepMedications', 'PrepInspectVials', 'PrepAsepticTechniq', 'PrepNewNeedle', 'PrepDiscardAll', 'PrepProperlyStore']);
    updateField('MedicationAdm', ['AdmHandHygiene', 'AdmProperPpe', 'AdmProperlyTrans', 'AdmInjectionPort', 'AdmAdministerMed', 'AdmDiscardSyringe']);
    updateField('DialysisStat', ['StatProperPpe', 'StatEnsureThat', 'StatDiscardAll', 'StatNursingClean', 'StatKeepUsed', 'StatHousekeeping']);
  }
}
