import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataShareService } from '@services/data-share.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { StorageLocation, StorageLocationDetails } from '@services/emergency-dashboard/interface/storage-location.interface';
import { getAlertConfig } from '@services/index';
import { ActionType, FilterType, WordType } from '@services/interfaces/common.enum';
import { StorageService } from '@services/storage.service';
import { TabsetComponent, TabDirective } from 'ngx-bootstrap/tabs';
import { TooltipConfig } from 'ngx-bootstrap/tooltip';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-consumables',
  templateUrl: './consumables.component.html',
  styleUrls: ['./consumables.component.scss'],
  providers: [{ provide: TooltipConfig, useFactory: getAlertConfig }],
})
export class ConsumablesComponent implements OnInit, OnDestroy, AfterViewInit {
  @Output() postEvent: any = new EventEmitter();
  public formDetailGroup: FormGroup;
  public disableSwitching: boolean;
  
  actionTypeSubscription$: Subscription;
  isConsumableAction: string = '1';

  public storageLocationList: Array<StorageLocationDetails> = [];
  public selectedLocation: any = 'ER01'; // Property to hold selected location
  public paramsObject: any;

  activeTab: string = '2'; // Initialize with the id of the second tab

  tabs = [
    { id: 1, title: 'History', content: '' },
    { id: 2, title: 'New Issue', content: '', active: true },
  ];


  constructor(
    public ePrescriptionService: EPrescriptionService,
    public emergencyService: EmergencyService,
    private formBuilder: FormBuilder,
    private dataShareService: DataShareService,
    private storageService: StorageService,
    private _route: ActivatedRoute,
  ) {

    this.actionTypeSubscription$ = this.dataShareService.data$.subscribe((data) => {
      if (data != null) {
        this.isConsumableAction = data;
      }
    });

    this._route.queryParams.subscribe((params) => {
       this.paramsObject = params;
     });
  }


  ngOnDestroy(): void {
    // this.dataShareService.sendActionType(null);
    if (JSON.parse(localStorage.getItem('forConsumable'))) {
      localStorage.removeItem('forConsumable');
    }
  }

  ngOnInit(): void {
    this.consumablesFrom();
    this.dataShareService.sendData('2');
    this.getStoragelocations();
  }
  ngAfterViewInit() {
    // Set the second tab as the active tab after the view has been initialized
  }
  public consumablesFrom() {
    this.formDetailGroup = this.formBuilder.group({
      SearchData: ['', [Validators.required]],
      DateRange: [[], [Validators.required]],
      SelectDropdown: [null, [Validators.required]],
       selectedLocation: ['ER01', [Validators.required]]
    });
  }

  public saveConsumable(): void {
    Swal.fire({
      title: 'Confirm',
      text: 'Are You Sure to Add New Consumables?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      // customClass: 'myalertpopup'
    }).then(async (result) => {
      if (result.value) {
        // this.dataShareService.sendActionType(ActionType.Save$, true,WordType.MaterialCode$);
        this.postEvent.emit(ActionType.Save$)
      }
    });
  }

  public changeTab($event) {
    let id = String($event.id);
    this.activeTab = $event.id;
    this.dataShareService.sendData(id);
  }

  public resetForm() {
    // this.dataShareService.sendActionType(ActionType.Reset$, true,WordType.MaterialCode$);
    this.postEvent.emit(ActionType.Reset$)
  }

  // Method to handle location change event
    public onLocationChange(event: any) {
    // Handle location change logic here if needed
    this.dataShareService.sendFilterType(FilterType.ConsumableStorageLocation$, true, event);
  }
  
  private getStoragelocations() {
    const userType = this.storageService.getUserProfile();
    const parms = {
      Bname: userType.UserName,
      Einri: this.paramsObject.einri,
      Falnr: this.paramsObject.falnr,
    };
    this.emergencyService.getStoragelocationList(`${JSON.stringify(parms)}`).subscribe({
      next: (data: StorageLocation) => {
        // Handle successful data retrieval
        this.storageLocationList = data.d.results;
        if (this.storageLocationList.length === 1) {
          // this.selectedLocation = this.storageLocationList[0];
          this.formDetailGroup.get('selectedLocation').setValue(this.selectedLocation);
        }
        this.dataShareService.sendFilterType(FilterType.ConsumableStorageLocation$, true, {Lgort: this.selectedLocation});
      },
      error: (err: any) => {
        // Handle errors if the request fails
      },
    });
  }
}
