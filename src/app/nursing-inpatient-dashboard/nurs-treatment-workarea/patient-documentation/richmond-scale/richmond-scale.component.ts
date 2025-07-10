import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdmissionService } from '@services/admission/admission.service';
import { DataShareService } from '@services/data-share.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { ActionType } from '@services/interfaces/common.enum';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-richmond-scale',
  templateUrl: './richmond-scale.component.html',
  styleUrls: ['./richmond-scale.component.scss'],
})
export class RichmondScaleComponent implements OnInit {
  @Output() successEvent: EventEmitter<any> = new EventEmitter<any>();
  public richmondForm: FormGroup;
  public paramsObject: any;
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
  scoreDescriptions = [
    { key: '+4', value: 'Combative or violent: immediate danger to staff' },
    { key: '+3', value: 'Very agitated: pulls on or removes tube or catheter or has aggressive behaviour' },
    { key: '+2', value: 'Agitated: frequent non purposeful movement or patient–ventilator dyssynchrony' },
    { key: '+1', value: 'Restless: anxious or apprehensive but movements not aggressive or vigorous' },
    { key: '0', value: 'Alert and calm: spontaneously pays attention to caregiver' },
    { key: '-1', value: 'Not fully alert, but sustained awakening to voice (eye opening & contact >10sec)' },
    { key: '-2', value: 'Light sedation: Briefly awakens to voice (eyes open & contact <10 sec)' },
    { key: '-3', value: 'Moderate sedation, any movement (but no eye contact) to voice' },
    { key: '-4', value: 'Deep sedation, no response to voice, but any movement to physical stimulation' },
    { key: '-5', value: 'No response to voice or physical stimulation' }
  ];




  constructor(
    private formBuilder: FormBuilder,
    private _route: ActivatedRoute,
    public storageService: StorageService,
    public admissionService: AdmissionService,
    private sharedService: SharedService,
    private emergencyService: EmergencyService,
    private dataShareService: DataShareService
  ) {
    this._route.queryParams.subscribe((params) => {
      this.paramsObject = params;
      this.storageService.setEinri(this.paramsObject.einri);
      this.storageService.setFalnr(this.paramsObject.falnr);
      this.storageService.setLfdnr(this.paramsObject.lfdnr);
      this.storageService.setPatnr(this.paramsObject.patnr);
    });
    this.actionTypeSubscription$ = this.dataShareService.actionsType$.subscribe(
      (data) => {
        if (data != null) {
          if (data.type == ActionType.Add$ && data.value == '') {
            this.docKey = data.value.Dockey;
          }
          if (data.type == ActionType.Update$ && data.value) {
            this.docKey = data.value.docKey;
            this.getDocument(data.value.docKey);
          }
          if (data.type == ActionType.Copy$ && data.value) {
            this.docKey = data.value.docKey;
            this.getDocument(data.value.docKey);
          }
        } else {
          // for after code
        }
      }
    );
  }
  noSort = () => 0;
  ngOnInit(): void {
    this.initForm();
    this.realized = this.storageService.getUserProfile().Gpart;
    this.realizedDescription = this.storageService.getUserProfile().GpartName;
    this.richmondForm.get('Score')?.valueChanges.subscribe((score) => {
      this.richmondForm.patchValue({
        TotalScore: score,
      });
    });
  }
  getDescription() {
    const selectedKey = this.richmondForm.get('Score')?.value;
    const score = this.scoreDescriptions.find(item => item.key === selectedKey);
    if (score && score.value.includes(':')) {
      const beforeColon = score.value.split(':')[0]?.trim() || '';
      this.richmondForm.patchValue({
        ScoreDesc: beforeColon
      })
      return `${beforeColon}`;
    }
    if (score && score.value.includes(',')) {
      const afterComma = score.value.includes(',') ? score.value.split(',')[0]?.trim() : '';
      this.richmondForm.patchValue({
        ScoreDesc: afterComma
      })
      return `${afterComma}`;
    }
    if (selectedKey == '-5') {
      this.richmondForm.patchValue({
        ScoreDesc: 'No response'
      })
      return `${'No response'}`;
    }
    return '';

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

  getDocument(data?) {
    // Subscribe using an object to define handlers
    this.subscription = this.emergencyService.fetchRichmondDocument(this.docKey).subscribe({
      next: (data: any) => {
        this.richmondForm.patchValue(data?.d?.results[0]);
      },
      error: (err: any) => {
        // Handle errors if the request fails
        console.error('Error fetching Richmond Scale Data:', err);
        this.sharedService.waringSwallModel(`GET Error at Richmond Scale : ${err}`);
      },
      complete: () => {
        // Handle completion (optional), invoked when the observable completes
        console.log('Richmond Scale Data retrieval complete');
      }
    });
  }

  initForm(data?) {
    this.richmondForm = this.formBuilder.group({
      Dockey: [''],
      Dtid: ['SCA_RCM'],
      Einri: this.paramsObject.einri,
      Patnr: this.paramsObject.patnr,
      Falnr: this.paramsObject.falnr,
      Lfdnr: this.paramsObject.lfdnr,
      Orgdo: [this.storageService.patientData.deptOrgUnit],
      AttendPhy: [this.storageService.getUserProfile().Gpart],
      DocStatus: ['1'],
      Score: [''],
      TotalScore: [''],
      ScoreDesc: [''],
      Comments: ['']
    })
  }

  onRassChange(event: any) {
    const value = event.target.value;
    const numericValue = Number(value);
    this.richmondForm.patchValue({
      TotalScore: numericValue,
    });
  }

  createRichmond(docStatus): Promise<any> {
    return new Promise((resolve, reject) => {
      let formData = this.richmondForm.value;
      formData.DocStatus = docStatus;
      formData.Orgdo = this.storageService.patientData.deptOrgUnit;
      formData.AttendPhy = this.storageService.getUserProfile().Gpart;
      let payload = {
        d: this.richmondForm.value
      };
      this.subscription = this.emergencyService.saveRichmondScaleDoc(payload).subscribe({
        next: (data: any) => {
        
        },
        error: (err: any) => {
          this.sharedService.waringSwallModel(`POST Error at Richmond Scale : ${err}`);
        },
        complete: () => {
          resolve(true); // Resolve the promise with formValue
          this.sharedService.successSwallModel('Richmond Scale created successfully');
        }
      });
    });
  }
}
