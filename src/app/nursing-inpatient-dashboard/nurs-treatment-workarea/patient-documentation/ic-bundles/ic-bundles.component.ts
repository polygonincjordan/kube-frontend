import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdmissionService } from '@services/admission/admission.service';
import { DataShareService } from '@services/data-share.service';
import { ActionType } from '@services/interfaces/common.enum';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ic-bundles',
  templateUrl: './ic-bundles.component.html',
  styleUrls: ['./ic-bundles.component.scss']
})
export class ICBundlesComponent implements OnInit,OnDestroy {
  @Output() successEvent: EventEmitter<any> = new EventEmitter<any>();
  public urinaryForm :FormGroup
  public paramsObject: any
  private subscription: Subscription;
  private actionTypeSubscription$: Subscription;
  docKey: any;
  public dropdownOptions = [
    { label: 'Indwelling short term', value: '0' },
    { label: 'Indwelling long term', value: '1' },
    { label: 'Suprapubic', value: '2' }
  ];
  constructor(private formBuilder: FormBuilder, private _route: ActivatedRoute, public storageService: StorageService,public admissionService:AdmissionService,private sharedService: SharedService,private dataShareService:DataShareService) { 
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
                }  else {
                // for after code
                }
        })
  }

  ngOnInit(): void {
    this.initForm()
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
    .geturinaryDocument(this.docKey)
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
    this.urinaryForm = this.formBuilder.group({
      UciInsertionDate :[this.getDate(data?.UciInsertionDate) || null],
      UciInsertionTime : [this.parseTime(data?.UciInsertionTime) || null],
      UciTypeCatheter : [data?.UciTypeCatheter || ''],
      UciCatheterRemDate :[this.getDate(data?.UciCatheterRemDate) || null],
      UciUrinaryCatheterDays : [data?.UciUrinaryCatheterDays || ''],
      UciCatheterChangeDueDt :[this.getDate(data?.UciCatheterChangeDueDt) || null],
      UciPatientLocation : [data?.UciPatientLocation || ''],
      Uci1UnnecessaryInsertion : [data?.Uci1UnnecessaryInsertion || ''],
      Uci1NaTxt :[data?.Uci1NaTxt || { value: '', disabled: true }] ,
      Uci1PreopInsertion : [data?.Uci1PreopInsertion || false],
      Uci1UrineOutput : [data?.Uci1UrineOutput || false],
      Uci1Management : [data?.Uci1Management || false],
      Uci1Assistance : [data?.Uci1Assistance || false],
      Uci1PatientRequires : [data?.Uci1PatientRequires || false],
      Uci1AsAnException : [data?.Uci1AsAnException || false],
      Uci1OtherReason : [data?.Uci1OtherReason || false],
      Uci1OtherReasonTxt : [data?.Uci1OtherReasonTxt ||{ value: '', disabled: true }],
      Uci2WasAsepticTechnique : [data?.Uci2WasAsepticTechnique || ''],
      Uci2NaTxt : [data?.Uci2NaTxt || { value: '', disabled: true }],
      Uci2PerformHand : [data?.Uci2PerformHand || false],
      Uci2SterileGloves : [data?.Uci2SterileGloves || false],
      Uci2SterileAntiseptic : [data?.Uci2SterileAntiseptic || false],
      Uci2SmallestPossible : [data?.Uci2SmallestPossible || false],
      Uci2SingleUse : [data?.Uci2SingleUse || false],
      UcmMaintenanceDate :[this.getDate(data?.UcmMaintenanceDate) || null],
      UcmMaintenanceTime : [this.parseTime(data?.UcmMaintenanceTime) || null],
      Ucm3WasUrinary : [data?.Ucm3WasUrinary || ''],
      Ucm3NaTxt :[data?.Ucm3NaTxt || { value: '', disabled: true }] ,
      Ucm3SterileContinuously : [data?.Ucm3SterileContinuously || false],
      Ucm3CatheterProperly : [data?.Ucm3CatheterProperly || false],
      Ucm3CollectionBag : [data?.Ucm3CollectionBag || false],
      Ucm3UrineFlowChecked : [data?.Ucm3UrineFlowChecked || false],
      Ucm3DrainageBag : [data?.Ucm3DrainageBag || false],
      Ucm3MaintainMeatal : [data?.Ucm3MaintainMeatal || false],
      Ucm4WasNeed : [data?.Ucm4WasNeed || ''],
      Ucm4NaTxt : [data?.Ucm4NaTxt || { value: '', disabled: true }],
      UcmCautiPreventionScore : [data?.UcmCautiPreventionScore || ''],
      UcmSignsCatheter : [data?.UcmSignsCatheter || ''],
      UcmComments : [data?.UcmComments || '']
    })
  }
  

  public createDoc(status?:any,actionType?:any){
    return new Promise((resolve, reject) => {
      let formData = this.urinaryForm.value;
   const convertDateFormat = (dateString: string): string => {
    const [day, month, year] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toString();
  };
   if (formData.UciInsertionDate) {
    if(typeof formData.UciInsertionDate === 'string'){
      if (/\d{2}-\d{2}-\d{4}/.test(formData.UciInsertionDate)) {
        formData.UciInsertionDate = convertDateFormat(formData.UciInsertionDate);
      }
    }
    const date = new Date(formData.UciInsertionDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');

    formData.UciInsertionDate = `${year}-${month}-${day}T00:00:00`;
  }
  if (formData.UciCatheterRemDate) {
    if(typeof formData.UciCatheterRemDate === 'string'){
      if (/\d{2}-\d{2}-\d{4}/.test(formData.UciCatheterRemDate)) {
        formData.UciCatheterRemDate = convertDateFormat(formData.UciCatheterRemDate);
      }
    }
    const date = new Date(formData.UciCatheterRemDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');

    formData.UciCatheterRemDate = `${year}-${month}-${day}T00:00:00`;
  }
  if (formData.UciCatheterChangeDueDt) {
    if(typeof formData.UciCatheterChangeDueDt === 'string'){
      if (/\d{2}-\d{2}-\d{4}/.test(formData.UciCatheterChangeDueDt)) {
        formData.UciCatheterChangeDueDt = convertDateFormat(formData.UciCatheterChangeDueDt);
      }
    }
    const date = new Date(formData.UciCatheterChangeDueDt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');

    formData.UciCatheterChangeDueDt = `${year}-${month}-${day}T00:00:00`;
  }
  if (formData.UcmMaintenanceDate) {
    if(typeof formData.UcmMaintenanceDate === 'string'){
      if (/\d{2}-\d{2}-\d{4}/.test(formData.UcmMaintenanceDate)) {
        formData.UcmMaintenanceDate = convertDateFormat(formData.UcmMaintenanceDate);
      }
    }
    const date = new Date(formData.UcmMaintenanceDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');

    formData.UcmMaintenanceDate = `${year}-${month}-${day}T00:00:00`;
  }
  
  if(formData.UciInsertionTime){
   formData.UciInsertionTime= this.convertTimeToDuration(formData.UciInsertionTime)
  }
  if(formData.UcmMaintenanceTime){
   formData.UcmMaintenanceTime= this.convertTimeToDuration(formData.UcmMaintenanceTime)
  }
    let payload = {
      ...formData,
      Dockey : actionType === 'edit' ||  actionType === 'copy' ? this.docKey : '',
      Dtid : 'ZMED_URC',
      Einri: this.paramsObject.einri,
      Patnr: this.paramsObject.patnr,
      Falnr: this.paramsObject.falnr,
      Lfdnr: this.paramsObject.lfdnr,
      Orgdo: 'F21IUAMC',
      AttendPhy :this.storageService.getUserProfile().Gpart,
      DocStatus :status,
    }
   
      this.subscription = this.admissionService.createUrinary(payload).subscribe({
        next: (data: any) => {
        },
        error: (err: any) => {
          this.sharedService.waringSwallModel(`Error ${err}`);
          this.sharedService.waringSwallModel(`PUT Error at IC Bundles for Urinary Catheter : ${err}`);
        },
        complete: () => {
          resolve(true);
          if(status === 'edit'){
            this.sharedService.successSwallModel('IC Bundles for Urinary Catheter updated successfully');
          }else{
            this.sharedService.successSwallModel('IC Bundles for Urinary Catheter created successfully');
          }
          this.successEvent.next(true)
        }
      });
    })   
    
  }

  toggleRadio(controlName: string, value: string,textinput?:string) {
    if (this.urinaryForm.get(controlName)?.value === value) {
      this.urinaryForm.get(controlName)?.setValue(null);
    }
    if (value === '2') {  
      this.urinaryForm.get(textinput)?.enable(); // Enable input when abnormal (Yes)
    } else {
        this.urinaryForm.get(textinput)?.disable(); // Disable input when normal (No)
        this.urinaryForm.get(textinput)?.setValue(''); // Clear input if disable
  
      }
  }

  toggleInput(checkboxName: string, inputName: string) {
    const checkboxControl = this.urinaryForm.get(checkboxName);
    const inputControl = this.urinaryForm.get(inputName);
    if (checkboxControl?.value) {
      inputControl?.enable();
    } else {
      inputControl?.disable();
      inputControl?.setValue('');
    }
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

  convertTimeToDuration(timeString: string): string {
    if (!timeString) return '';
  
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
  
    // Ensure values are properly formatted
    const formattedHours = hours ? `PT${hours}H` : 'PT00H';
    const formattedMinutes = minutes ? `${minutes}M` : '00M';
    const formattedSeconds = seconds ? `${seconds}S` : '00S';
  
    return `${formattedHours}${formattedMinutes}${formattedSeconds}`;
  }

}
