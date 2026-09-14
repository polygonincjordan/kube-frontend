import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdmissionService } from '@services/admission/admission.service';
import { DataShareService } from '@services/data-share.service';
import { ActionType } from '@services/interfaces/common.enum';
import { SharedService } from '@services/shared.service';
import { StorageService } from '@services/storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cvc-maintenance',
  templateUrl: './cvc-maintenance.component.html',
  styleUrls: ['./cvc-maintenance.component.scss']
})
export class CvcMaintenanceComponent implements OnInit {
  @Output() successEvent: EventEmitter<any> = new EventEmitter<any>();
  public cvcMainForm:FormGroup
  private subscription: Subscription;
  private actionTypeSubscription$: Subscription;
  private ivSetSubscriptions: Subscription[] = [];
  public paramsObject: any;
  public docKey: any;
  public saveAttempted = false;
  // 2.1-2.4 drive question 2; question 2 is never entered by hand.
  private readonly ivSetFields = ['Cvc21', 'Cvc22', 'Cvc23', 'Cvc24'];
  // Stored answer values, shared by every question on this document.
  public readonly YES = '0';
  public readonly NO = '1';
  public readonly NOT_APPLICABLE = '2';
  public readonly NOT_DOCUMENTED = '3';
  anatomicalSites = [
    { value:'1', name: 'Subclavian' },
    { value:'2', name: 'Intra-Jugular' },
    { value:'3', name: 'Femoral' },
    { value:'4', name: 'Implanted' },
    { value:'5', name: 'Umbilical' },
    { value:'6', name: 'Peripheral' }
  ];
  selectedAnatomicalSite: number = 1;

  cvcTypes = [
    { value:'1', name: 'Temporary central line' },
    { value:'2', name: 'Temporary dialysis catheter' },
    { value:'3', name: 'PICC' },
    { value:'4', name: 'Hickman' },
    { value:'5', name: 'Port-a-cath' }
  ];
  selectedCvcType: number = 1;

  cvcLumens = [
    { value:'1', name: '1' },
    { value:'2', name: '2' },
    { value:'3', name: '3' }
  ];

  dressingTypes = [
    { value: '1', name: 'Gauze' },
    { value: '2', name: 'Transparent' },
    { value: '3', name: 'Other' }
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
    this.ivSetSubscriptions.forEach((subscription) => subscription.unsubscribe());
    this.ivSetSubscriptions = [];
     if (this.actionTypeSubscription$) {
      this.actionTypeSubscription$.unsubscribe();
      this.dataShareService.sendActionType(null);
    }
  }

  
  getDocument(data?){
    this.admissionService
    .getCvcMainDetail(this.docKey)
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
    this.cvcMainForm = this.formBuilder.group({
      CvcInsertionDate :[this.getDate(data?.CvcInsertionDate) || null],
      CvcInsertionTime : [this.parseTime(data?.CvcInsertionTime) || null, Validators.required],
      PatientLocation : [data?.PatientLocation || ''],
      AnatomicalSite : [data?.AnatomicalSite || ''],
      TypeCentralVenous : [data?.TypeCentralVenous || ''],
      NumberCvcLumens : [data?.NumberCvcLumens || ''],
      CvcRemovalDate :[this.getDate(data?.CvcRemovalDate) || null],
      CvcDays : [data?.CvcDays || ''],
      MaintenanceDate :[this.getDate(data?.MaintenanceDate) || null],
      MaintenanceTime : [this.parseTime(data?.MaintenanceTime) || null, Validators.required],
      Cvc1 : [this.answerValue(data?.Cvc1)],
      Cvc1LastDressing :[this.getDate(data?.Cvc1LastDressing) || null],
      Cvc1TypeDressing : [data?.Cvc1TypeDressing || ''],
      Cvc1TypeDressingTxt : [data?.Cvc1TypeDressingTxt || ''],
      Cvc1ReasonDressing :[data?.Cvc1ReasonDressing || ''],
      Cvc2 : [this.answerValue(data?.Cvc2)],
      Cvc21 : [this.answerValue(data?.Cvc21)],
      Cvc22 : [this.answerValue(data?.Cvc22)],
      Cvc23 : [this.answerValue(data?.Cvc23)],
      Cvc24 : [this.answerValue(data?.Cvc24)],
      Cvc24Others : [data?.Cvc24Others || ''],
      Cvc3 : [this.answerValue(data?.Cvc3)],
      Cvc3SignsCatheterSite : [data?.Cvc3SignsCatheterSite || ''],
      Cvc3Comments : [data?.Cvc3Comments || '']
    })

    // Question 2 is derived, so the nurse never sets it: disabling the control
    // is what renders its radios locked. Its value is recomputed here for a new
    // and a reopened document alike, so what was stored can never disagree with
    // what 2.1-2.4 now say.
    this.cvcMainForm.get('Cvc2').disable({ emitEvent: false });
    this.deriveIvSetAnswer();

    this.ivSetSubscriptions.forEach((subscription) => subscription.unsubscribe());
    this.ivSetSubscriptions = this.ivSetFields.map((field) =>
      this.cvcMainForm.get(field).valueChanges.subscribe(() => this.deriveIvSetAnswer())
    );
  }

  // Question 2 summarises 2.1-2.4, in this order:
  //   No             - any one of the four is No or Not Documented.
  //   Yes            - otherwise, at least one is Yes (the rest Not Applicable).
  //   Not Applicable - otherwise, all four are Not Applicable.
  // Every answer defaults to No, so the four always carry a value and no
  // further branch is reachable.
  public deriveIvSetAnswer(): void {
    const answers = this.ivSetFields.map((field) => this.cvcMainForm.get(field).value);

    let derived = this.NOT_APPLICABLE;
    if (answers.some((answer) => answer === this.NO || answer === this.NOT_DOCUMENTED)) {
      derived = this.NO;
    } else if (answers.some((answer) => answer === this.YES)) {
      derived = this.YES;
    }

    this.cvcMainForm.get('Cvc2').setValue(derived, { emitEvent: false });
  }

  // No is the default answer on every question. A document stored before this
  // rule existed can come back with an empty answer, and normalising it here
  // keeps a reopened document reading the same way as a new one.
  private answerValue(stored: any): string {
    return stored ? stored : this.NO;
  }

  // Errors stay hidden until the field is touched or a save has been attempted,
  // so a freshly opened document does not open covered in red.
  showError(field: string): boolean {
    const control = this.cvcMainForm.get(field);
    return !!control && control.invalid && (control.touched || this.saveAttempted);
  }

  public getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }

  public createDoc(status?:any,actionType?:any){
    return new Promise((resolve, reject) => {
      this.saveAttempted = true;
      this.cvcMainForm.markAllAsTouched();

      if (this.cvcMainForm.invalid) {
        this.sharedService.waringSwallModel(
          'Please complete the required fields before saving this document.'
        );
        resolve(false);
        return;
      }

      // getRawValue, not value: the derived Cvc2 control is disabled and would
      // otherwise be dropped from the payload.
      let formData = this.cvcMainForm.getRawValue();
      formData.CvcInsertionDate = formData.CvcInsertionDate ? this.dateFormateString(formData.CvcInsertionDate) : null;
      formData.CvcRemovalDate = formData.CvcRemovalDate ? this.dateFormateString(formData.CvcRemovalDate) : null;
      formData.MaintenanceDate = formData.MaintenanceDate ? this.dateFormateString(formData.MaintenanceDate) : null;
      formData.Cvc1LastDressing = formData.Cvc1LastDressing ? this.dateFormateString(formData.Cvc1LastDressing) : null;
      formData.MaintenanceTime = formData.MaintenanceTime ? this.convertTimeToDuration(formData.MaintenanceTime) : null;
      formData.CvcInsertionTime = formData.CvcInsertionTime ? this.convertTimeToDuration(formData.CvcInsertionTime) : null;
  
      let payload = {
        ...formData,
        Dockey : actionType === 'edit' ||  actionType === 'copy' ? this.docKey : '',
        Dtid : 'ZMED_CVCM',
        Einri: this.paramsObject.einri,
        Patnr: this.paramsObject.patnr,
        Falnr: this.paramsObject.falnr,
        Lfdnr: this.paramsObject.lfdnr,
        Orgdo: 'F21IUAMC',
        AttendPhy :this.storageService.getUserProfile().Gpart,
        DocStatus :status,
      }
   
      this.subscription = this.admissionService.createCvcMainDoc(payload).subscribe({
        next: (data: any) => {
        },
        error: (err: any) => {
          this.sharedService.waringSwallModel(`Error ${err}`);
          this.sharedService.waringSwallModel(`PUT Error at IC Bundles for CVC Maintenance : ${err}`);
        },
        complete: () => {
          resolve(true);
          this.sharedService.successSwallModel(this.getSuccessMessage(status, actionType));
          this.successEvent.next(true)
        }
      });
    })   
    
  }

  getSuccessMessage(status?: any, actionType?: any): string {
    if (status === '2' || status === '4' || status === '5') {
      return 'IC Bundles for CVC Maintenance released successfully';
    }
    if (actionType === 'edit') {
      return 'IC Bundles for CVC Maintenance updated successfully';
    }
    return 'IC Bundles for CVC Maintenance created successfully';
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

}
