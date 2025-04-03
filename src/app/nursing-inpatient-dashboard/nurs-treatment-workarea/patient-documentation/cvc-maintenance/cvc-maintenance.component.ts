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
  selector: 'app-cvc-maintenance',
  templateUrl: './cvc-maintenance.component.html',
  styleUrls: ['./cvc-maintenance.component.scss']
})
export class CvcMaintenanceComponent implements OnInit {
  @Output() successEvent: EventEmitter<any> = new EventEmitter<any>();
  public cvcMainForm:FormGroup
  private subscription: Subscription;
  private actionTypeSubscription$: Subscription;
  public paramsObject: any;
  public docKey: any;
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
      CvcInsertionTime : [this.parseTime(data?.CvcInsertionTime) || null],
      PatientLocation : [data?.PatientLocation || ''],
      AnatomicalSite : [data?.AnatomicalSite || ''],
      TypeCentralVenous : [data?.TypeCentralVenous || ''],
      NumberCvcLumens : [data?.NumberCvcLumens || ''],
      CvcRemovalDate :[this.getDate(data?.CvcRemovalDate) || null],
      CvcDays : [data?.CvcDays || ''],
      MaintenanceDate :[this.getDate(data?.MaintenanceDate) || null],
      MaintenanceTime : [this.parseTime(data?.MaintenanceTime) || null],
      Cvc1 : [data?.Cvc1 || ''],
      Cvc1LastDressing :[this.getDate(data?.Cvc1LastDressing) || null],
      Cvc1TypeDressing : [data?.Cvc1TypeDressing || ''],
      Cvc1TypeDressingTxt : [data?.Cvc1TypeDressingTxt || ''],
      Cvc1ReasonDressing :[data?.Cvc1ReasonDressing || ''],
      Cvc2 : [data?.Cvc2 || ''],
      Cvc21 : [data?.Cvc21 || ''],
      Cvc22 : [data?.Cvc22 || ''],
      Cvc23 : [data?.Cvc23 || ''],
      Cvc24 : [data?.Cvc24 || ''],
      Cvc24Others : [data?.Cvc24Others || ''],
      Cvc3 : [data?.Cvc3 || ''],
      Cvc3SignsCatheterSite : [data?.Cvc3SignsCatheterSite || ''],
      Cvc3Comments : [data?.Cvc3Comments || '']
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

  public createDoc(status?:any,actionType?:any){
    return new Promise((resolve, reject) => {
      let formData = this.cvcMainForm.value;
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
          if(status === 'edit'){
            this.sharedService.successSwallModel('IC Bundles for CVC Maintenance updated successfully');
          }else{
            this.sharedService.successSwallModel('IC Bundles for CVC Maintenance created successfully');
          }
          this.successEvent.next(true)
        }
      });
    })   
    
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
