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
  selector: 'app-critical-care-pain',
  templateUrl: './critical-care-pain.component.html',
  styleUrls: ['./critical-care-pain.component.scss']
})
export class CriticalCarePainComponent implements OnInit {
  @Output() successEvent: EventEmitter<any> = new EventEmitter<any>();
  public criticalForm :FormGroup
  public paramsObject: any
  private subscription: Subscription;
  private actionTypeSubscription$: Subscription;
  public docKey: any;
  public facialList: any;
  public painList: any;
  public VocalizationList: any;
  public ventilationList: any;
  public musicList: any;
  public bodyList: any;
  public realized: any;
  public realizedDescription: any;
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
    this.ToGetFieldValues()
    this.ToGetFieldValuesB()
    this.ToGetFieldValuesM()
    this.ToGetFieldValuesV()
    this.ToGetFieldValuesE()
    this.ToGetFieldValuesP()
    // Watch for changes in any relevant dropdowns
  const controlsToWatch = [
    'FacialExpressions',
    'BodyMovements',
    'MuscleTension',
    'Ventilation',
    'Vocalization',
    'PainMovement'
  ];
 
  this.realized = this.storageService.getUserProfile().Gpart;
  this.realizedDescription = this.storageService.getUserProfile().GpartName;
  }

  calculateTotalScore() {
    const fields = [
      'FacialExpressions',
      'BodyMovements',
      'MuscleTension',
      'Ventilation',
      'Vocalization',
      'PainMovement'
    ];
  
    let total = 0;
  
    fields.forEach(field => {
      const val: string = this.criticalForm.get(field)?.value;
      if (val) {
        const match = val.match(/\((\d+)\)/); // get number inside parentheses
        if (match) {
          total += parseInt(match[1], 10);
        }
      }
    });
  
    this.criticalForm.get('TotalScore')?.setValue(String(total), { emitEvent: false });
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
  ToGetFieldValues(data?){
    this.admissionService
    .ToGetFieldValues('F')
    .subscribe({
      next: (data: any) => {
        if(data){
         this.facialList = data?.results
        }
      },
      error: (err: any) => {   
      },
    });
  }
  ToGetFieldValuesB(data?){
    this.admissionService
    .ToGetFieldValues('B')
    .subscribe({
      next: (data: any) => {
        if(data){
         this.bodyList = data?.results
        }
      },
      error: (err: any) => {   
      },
    });
  }
  ToGetFieldValuesM(data?){
    this.admissionService
    .ToGetFieldValues('M')
    .subscribe({
      next: (data: any) => {
        if(data){
         this.musicList = data?.results
        }
      },
      error: (err: any) => {   
      },
    });
  }
  ToGetFieldValuesV(data?){
    this.admissionService
    .ToGetFieldValues('V')
    .subscribe({
      next: (data: any) => {
        if(data){
         this.ventilationList  = data?.results
        }
      },
      error: (err: any) => {   
      },
    });
  }
  ToGetFieldValuesE(data?){
    this.admissionService
    .ToGetFieldValues('E')
    .subscribe({
      next: (data: any) => {
        if(data){
         this.VocalizationList = data?.results
        }
      },
      error: (err: any) => {   
      },
    });
  }
  ToGetFieldValuesP(data?){
    this.admissionService
    .ToGetFieldValues('P')
    .subscribe({
      next: (data: any) => {
        if(data){
         this.painList = data?.results
        }
      },
      error: (err: any) => {   
      },
    });
  }

  initForm(data?){
    this.criticalForm = this.formBuilder.group({
      FacialExpressions : [data?.FacialExpressions || ''],
      BodyMovements : [data?.BodyMovements || ''],
      MuscleTension : [data?.MuscleTension || ''],
      Ventilation : [data?.Ventilation || ''],
      Vocalization : [data?.Vocalization || ''],
      PainMovement : [data?.PainMovement || ''],
      TotalScore :  [data?.TotalScore || ''],
      Comments : [data?.Comments || '']
    })
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

}
