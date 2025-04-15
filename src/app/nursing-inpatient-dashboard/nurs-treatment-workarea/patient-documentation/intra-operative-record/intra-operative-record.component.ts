import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdmissionService } from '@services/admission/admission.service';
import { DataShareService } from '@services/data-share.service';
import { ActionType } from '@services/interfaces/common.enum';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-intra-operative-record',
  templateUrl: './intra-operative-record.component.html',
  styleUrls: ['./intra-operative-record.component.scss']
})
export class IntraOperativeRecordComponent implements OnInit {
  @Output() successEvent: EventEmitter<any> = new EventEmitter<any>();
  public equipment = [
    {value : '1',label:'No'},
    {value : '0',label:'Yes'},
  ]
  yesNoOptions = [
    { value:'0', label: 'Yes' },
    { value: 1, label: 'No' }
  ];
  
  classifications = [
    { value:'0', label: 'Intermediate' },
    { value: 1, label: 'Major Plus' },
    { value: 2, label: 'Complex Major' },
    { value: 3, label: 'Minor' }
  ];
  
  surgeryTypes = [
    { value:'0', label: 'Elective' },
    { value: 1, label: 'Emergency' },
    { value: 2, label: 'Urgent' }
  ];
  
  surgeryRoomTypes = [
    { value:'0', label: 'Sterilized' },
    { value: 1, label: 'Destilized' }
  ];
  
  positions = [
    { value:'0', label: 'Supine' },
    { value:'1', label: 'Prone' },
    { value:'2', label: 'Lithotomy' },
    { value:'3', label: 'Sitting' },
    { value:'4', label: 'Lateral Rt.' },
    { value:'5', label: 'Lateral Lt.' },
    { value:'7', label: 'Others' }
  ];
  
  skinConditions = [
    { value:'0', label: 'Intact' },
    { value:'1', label: 'Non-Intact' }
  ];
  
  sutureTypes = [
    { value:'0', label: 'Suture' },
    { value:'1', label: 'Stapler' },
    { value:'2', label: 'Glue' }
  ];
  
  drainMethods = [
    { value:'0', label: 'Single' },
    { value: '1', label: 'Continuous' },
    { value: '2', label: 'Retention' }
  ];
  
  investigationTypes = [
    { value:'0', label: 'Pathology' },
    { value:'1', label: 'Cytology' },
    { value:'2', label: 'Bacteriology' },
    { value:'3', label: 'Other Lab Investigations' }
  ];

  babyGenders = [
    { value:'0', label: 'Unknown' },
    { value: '1', label: 'Female' },
    { value: '2', label: 'Male' }
  ];
  
  babyDischargeOptions = [
    { value:'0', label: 'NICU' },
    { value: '1', label: 'Nursery' },
    { value: '2', label: 'Other' }
  ];
  
  dischargeDestinations = [
    { value:'0', label: 'PACU' },
    { value: '1', label: 'Ward' },
    { value: '2', label: 'Intensive Care Unit' },
    { value: '3', label: 'Other' }
  ];
  
  public criticalForm :FormGroup
  public paramsObject: any
  private subscription: Subscription;
  private actionTypeSubscription$: Subscription;
  public docKey: any;
  public CurrentDateAndTime: Date = new Date();
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
    this.initForm();
  
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
    .getCriticalPainDetail(this.docKey)
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
    this.criticalForm = this.formBuilder.group({
      MotherBg:[''],
      EquipmentText:[''],
      Problem:[false],
      ProblemText:[''],
      AppliedL:[''],
      AppliedR:[''],
      rightLine:[false],
      leftLine:[false],
      Tourniquet:[''],
      Tourniquettext:[''],
      otherassetT:[''],
      otherasset:[false],
      asset:[false],
      assetT:[''],
      otherS:[false],
      otherT:[''],
      na:[false],
      naT:[''],
      otherIv:[false],
      otherIvT:[''],
      Hair:[''],
      HairT:[''],
      Position:[''],
      PositionT:[''],

    })

  }


  toggleInput(controlName: string, value: string): void {
    // const control = this.criticalForm.get(controlName);  
    if (value === '0') {
      this.criticalForm.get(controlName)?.enable();
    } else {
      this.criticalForm.get(controlName)?.disable();
      this.criticalForm.get(controlName)?.setValue('');
    }
  }

  onSelectChange(selectControl: string, inputControl: string) {
    const value = this.criticalForm.get(selectControl)?.value;
    this.toggleInput(inputControl, value);
  }

  toggleInputText(checkboxName: string, inputName: string) {
    const checkboxControl = this.criticalForm.get(checkboxName);
    const inputControl = this.criticalForm.get(inputName);
    if (checkboxControl?.value) {
      inputControl?.enable();
    } else {
      inputControl?.disable();
      inputControl?.setValue('');
    }
  }
  

  public createDoc(status?:any,actionType?:any){
    return new Promise((resolve, reject) => {
      let formData = this.criticalForm.value;
      let payload = {
        ...formData,
        Dockey : actionType === 'edit' ||  actionType === 'copy' ? this.docKey : '',
        Dtid : 'ZSCA_CCPOT',
        Einri: this.paramsObject.einri,
        Patnr: this.paramsObject.patnr,
        Falnr: this.paramsObject.falnr,
        Lfdnr: this.paramsObject.lfdnr,
        Orgdo: 'F21IUAMC',
        AttendPhy :this.storageService.getUserProfile().Gpart,
        DocStatus :status,
      }
   
      this.subscription = this.admissionService.createCriticalPainDoc(payload).subscribe({
        next: (data: any) => {
        },
        error: (err: any) => {
          this.sharedService.waringSwallModel(`Error ${err}`);
          this.sharedService.waringSwallModel(`PUT Error at Critical Care Pain Observation Tool : ${err}`);
        },
        complete: () => {
          resolve(true);
          if(status === 'edit'){
            this.sharedService.successSwallModel('Critical Care Pain Observation Tool updated successfully');
          }else{
            this.sharedService.successSwallModel('Critical Care Pain Observation Tool created successfully');
          }
          this.successEvent.next(true)
        }
      });
    })   
    
  }
  activeTab: string = 'surgicalsafetychecklist'; // Default tab
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}
