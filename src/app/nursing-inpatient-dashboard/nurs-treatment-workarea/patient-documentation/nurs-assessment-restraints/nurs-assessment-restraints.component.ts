import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdmissionService } from '@services/admission/admission.service';
import { DataShareService } from '@services/data-share.service';
import { ActionType } from '@services/interfaces/common.enum';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-nurs-assessment-restraints',
  templateUrl: './nurs-assessment-restraints.component.html',
  styleUrls: ['./nurs-assessment-restraints.component.scss']
})
export class NursAssessmentRestraintsComponent implements OnInit {
   @Output() successEvent: EventEmitter<any> = new EventEmitter<any>();
  nurseAssMainForm:FormGroup
  private subscription: Subscription;
  private actionTypeSubscription$: Subscription;
  public paramsObject: any;
  public docKey: any;
  reasonOptions = [
    { value: "0", label: 'Yes' },
    { value: "1", label: 'No' }
  ];
  
  circulationOptions = [
    { value: "0", label: 'Good' },
    { value:"1", label: 'Bad' }
  ];
  
  careGivenOptions = [
    { value: "0", label: 'Skin Care' },
    { value: "1", label: 'Range of Motion' },
    { value: "2", label: 'Reposition' }
  ];
  
  behaviourOptions = [
    { value:"0", label: 'Calm' },
    { value:"1", label: 'Confused' },
    { value:"2", label: 'Agitated' },
    { value:"3", label: 'Asleep' }
  ];
  constructor(private formBuilder: FormBuilder, private _route: ActivatedRoute, public storageService: StorageService,public admissionService:AdmissionService,private sharedService: SharedService,private dataShareService:DataShareService)  {
    this._route.queryParams.subscribe((params) => {
                  this.paramsObject = params;
                  this.storageService.setEinri(this.paramsObject.einri);
                  this.storageService.setFalnr(this.paramsObject.falnr);
                  this.storageService.setLfdnr(this.paramsObject.lfdnr);
                  this.storageService.setPatnr(this.paramsObject.patnr);
                });
                this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe((data) => {      
                      if (data != null) {
                        if (data.type == ActionType.Add$ && data.value == '') {
                          this.docKey = data.value.Dockey
                        }
                        if (data.type == ActionType.Update$  && data.value) {
                        this.docKey = data.value.docKey
                        this.getDocument(data.value.docKey)
                          }
                          if (data.type == ActionType.Copy$  && data.value) {
                             this.docKey = data.value.docKey
                             this.getDocument(data.value.docKey)
                          }
                        } 
                })
   }

  ngOnInit(): void {
    this.initForm();
    this.nurseAssMainForm.get('ReasonsExplained')?.valueChanges.subscribe(value => {
      if (value === '0') {
        this.nurseAssMainForm.get('ReasonsExplainedTxt')?.enable();
      } else {
        this.nurseAssMainForm.get('ReasonsExplainedTxt')?.disable();
        this.nurseAssMainForm.get('ReasonsExplainedTxt')?.setValue(''); // Clear input if disabled
      }
     });
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

  getDocument(data?){
    this.admissionService
    .getNurseAssMainDetail(this.docKey)
    .subscribe({
      next: (data: any) => {
        if(data){
          this.initForm(data?.results[0]);
        }
      },
      error: (err: any) => {
      
      },
    });
  }

  initForm(data?){
    this.nurseAssMainForm = this.formBuilder.group({
      PhysicianNotified : [this.parseTime(data?.PhysicianNotified) || null],
      SupervisorNotified : [this.parseTime(data?.SupervisorNotified) || null],
      PriorHistory : [data?.PriorHistory || false],
      PriorHistoryTxt : [data?.PriorHistoryTxt || ''],
      PatientBehavior : [data?.PatientBehavior || ''],
      PreventInjury : [data?.PreventInjury || false],
      FallPreventionSelf : [data?.FallPreventionSelf || false],
      FallPreventionOthers : [data?.FallPreventionOthers || false],
      Other : [data?.Other || false],
      OtherTxt : [data?.OtherTxt || ''],
      ReasonsExplained : [data?.ReasonsExplained || ''],
      ReasonsExplainedTxt : [data?.ReasonsExplainedTxt || ''],
      ReasonUsePatient : [data?.ReasonUsePatient || false],
      ReasonUseFamily : [data?.ReasonUseFamily || false],
      ReasonUseOther : [data?.ReasonUseOther || false],
      ReasonUseOtherTxt : [data?.ReasonUseOtherTxt || ''],
      TypeSoftBandage : [data?.TypeSoftBandage || false],
      TypeRestraintKit : [data?.TypeRestraintKit || false],
      TypeOther : [data?.TypeOther || false],
      TypeOtherTxt : [data?.TypeOtherTxt || ''],
      SiteRightHand : [data?.SiteRightHand || false],
      SiteLeftHand : [data?.SiteLeftHand || false],
      SiteRightFoot : [data?.SiteRightFoot || false],
      SiteLeftFoot : [data?.SiteLeftFoot || false],
      SiteOther : [data?.SiteOther || false],
      SiteOtherTxt : [data?.SiteOtherTxt || ''],
      LessRestrictive : [data?.LessRestrictive || ''],
      SearchedHarmful : [data?.SearchedHarmful || false],
      BeltShoes : [data?.BeltShoes || false],
      isAllSelected:[data ? true :false],
      TORESTRAINTS : this.formBuilder.array([])
     })
   
     if (data?.TORESTRAINTS?.results?.length) {
      const control = this.nurseAssMainForm.get('TORESTRAINTS') as FormArray;
      data.TORESTRAINTS.results?.forEach((item: any) => {
        control.push(this.createRestraintRow(item));
      });
    }
  }

  createRestraintRow(data?: any): FormGroup {
    return this.formBuilder.group({
      Dockey: [data?.Dockey || ''],
      Datee: [this.getDate(data?.Datee) || null],
      Timee: [this.parseTime(data?.Timee) || null],
      RespiratoryRate: [data?.RespiratoryRate || ''],
      Circulation: [data?.Circulation ?? ''],
      CareGiven: [data?.CareGiven ?? ''],
      Behaviour: [data?.Behaviour ?? ''],
      Signature: [data?.Signature || ''],
      checkboxSelected: [data ? true :false]
    });
  }

  public createDoc(status?:any,actionType?:any){
    return new Promise((resolve, reject) => {
      let formData = this.nurseAssMainForm.value;
      formData.Orgdo = localStorage.getItem('initOrg'),
      formData.AttendPhy = this.storageService.getGpart(),
      formData.PhysicianNotified = formData.PhysicianNotified ? this.convertTimeToDuration(formData.PhysicianNotified) : null;
      formData.SupervisorNotified = formData.SupervisorNotified ? this.convertTimeToDuration(formData.SupervisorNotified) : null;
      const checkedRows = this.nurseAssMainForm.value.TORESTRAINTS
      .filter((row: any) => row.checkboxSelected)
      .map((row: any) => ({
        Dockey: '', // always blank
        Datee: row.Datee ? this.dateFormateString(row.Datee) : null,
        Timee: row.Timee ? this.convertTimeToDuration(row.Timee) : null,
        RespiratoryRate: row.RespiratoryRate,
        Circulation:String(row.Circulation),
        CareGiven: String(row.CareGiven),
        Behaviour: String(row.Behaviour),
        Signature: row.Signature
      }));
      delete formData.isAllSelected
      let payload = {
        ...formData,
        TORESTRAINTS:checkedRows,
        Dockey : actionType === 'edit' ||  actionType === 'copy' ? this.docKey : '',
        Dtid : 'ZMED_NRRST',
        Einri: this.paramsObject.einri,
        Patnr: this.paramsObject.patnr,
        Falnr: this.paramsObject.falnr,
        Lfdnr: this.paramsObject.lfdnr,
        Orgdo: 'F21IUAMC',
        AttendPhy :this.storageService.getUserProfile().Gpart,
        DocStatus :status,
      }
   
      this.subscription = this.admissionService.createNurseAssMainDoc(payload).subscribe({
        next: (data: any) => {
        },
        error: (err: any) => {
          this.sharedService.waringSwallModel(`Error ${err}`);
          this.sharedService.waringSwallModel(`PUT Error at Nurse Assessment for Restraints : ${err}`);
        },
        complete: () => {
          resolve(true);
          if(status === 'edit'){
            this.sharedService.successSwallModel('Nurse Assessment for Restraints updated successfully');
          }else{
            this.sharedService.successSwallModel('Nurse Assessment for Restraints created successfully');
          }
          this.successEvent.next(true)
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

  dateFormateString(dateString: any) {
    const convertDateFormat = (dateString: string): string => {
      const [day, month, year] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toString();
    };
    if (typeof dateString === 'string') {
      if (/\d{2}-\d{2}-\d{4}/.test(dateString)) {
        dateString = convertDateFormat(dateString);
      }
    }
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}T00:00:00`;
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

  convertTimeToDuration(timeString: string): string {
    if (!timeString) return '';
  
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
  
    // Ensure values are properly formatted
    const formattedHours = hours ? `PT${hours}H` : 'PT00H';
    const formattedMinutes = minutes ? `${minutes}M` : '00M';
    const formattedSeconds = seconds ? `${seconds}S` : '00S';
  
    return `${formattedHours}${formattedMinutes}${formattedSeconds}`;
  }

  restrictToNumeric(event: any) {
    const charCode = event.which ? event.which : event.keyCode;
    if (
      (charCode < 48 || charCode > 57) && // Allow numbers 0-9
      charCode !== 46 // Allow decimal point
    ) {
      event.preventDefault();
    }
  }

  addNewConsumable(){
    const control = this.nurseAssMainForm.get('TORESTRAINTS') as FormArray;
    control.push(this.createRestraintRow());
  }

  public removeRow($event: any, index: number) {
    const control = this.nurseAssMainForm.get('TORESTRAINTS') as FormArray;
    control.removeAt(index);
  }

  public isAllchecked(event: any): void {
    const target = event.currentTarget.checked;
    this.nurseAssMainForm.get('TORESTRAINTS').value.forEach((element, index) => {
      this.nurseAssMainForm.get('TORESTRAINTS')['controls'][index].patchValue({
        checkboxSelected: target
      })
    });
  }

  
  public isSelectedItem(): void {
    if (
      this.nurseAssMainForm.get('TORESTRAINTS')['controls'] &&
      this.nurseAssMainForm.get('TORESTRAINTS')['controls'].length &&
      this.nurseAssMainForm.get('TORESTRAINTS').value.filter(d => d.checkboxSelected).length === this.nurseAssMainForm.get('TORESTRAINTS')['controls'].length
    ) {
      this.nurseAssMainForm.patchValue({
        isAllSelected: true
      })
    } else {
      this.nurseAssMainForm.patchValue({
        isAllSelected: false
      })
    }
  }

  toggleInput(checkboxName: string, inputName: string) {
    const checkboxControl = this.nurseAssMainForm.get(checkboxName);
    const inputControl = this.nurseAssMainForm.get(inputName);
    if (checkboxControl?.value) {
      inputControl?.enable();
    }
     else {
      inputControl?.disable();
      inputControl?.setValue('');
    }
  }
  
}
