import { Component, OnInit, ViewChild } from '@angular/core';
import { DataShareService } from '@services/data-share.service';
import { Subscription } from 'rxjs';
import { ReservationListComponent } from './reservation-list/reservation-list.component';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActionType, FilterType } from '@services/interfaces/common.enum';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss']
})
export class ReservationComponent implements OnInit {
  @ViewChild(ReservationListComponent) reservationCom;
  private actionTypeSubscription$: Subscription;
  public formDetailGroup: FormGroup;
  public selectedLocation: any;
  public selectedCostCenter:any;
  public isConsumableAction: string = '1';
  public activeTab: string = '2';
  public selectedType: string ;
  public storageLocationList: any;
  public costCenterList:any;
  public tabs = [
    // { id: 1, title: 'History', content: '' },
    { id: 2, title: 'New Issue', content: '', active: true },
  ];
  public movementTypes = [
    { value: '201', label: '201' },
    { value: '311', label: '311' }
  ];
  constructor( private dataShareService: DataShareService,private emergencyService: EmergencyService, private formBuilder: FormBuilder) { 
    this.actionTypeSubscription$ = this.dataShareService.data$.subscribe((data) => {
      if (data != null) {
        this.isConsumableAction = data;
      }
    });
    this.selectedType = this.movementTypes[1].value ;
    this.formDetailGroup = new FormGroup({
      movementType:new FormControl(this.movementTypes[1].value),
      selectedLocation: new FormControl(null), // Initialize form control
      selectedCostCenter:new FormControl(null)
    });
  }

  ngOnInit(): void {
    this.consumablesFrom();
    this.getStrogeLocation();
    this.getCostCenter();
    this.dataShareService.sendData('2');
  }

  public onLocationChange(event: any) {
    // Handle location change logic here if needed
    this.dataShareService.sendFilterType(FilterType.ConsumableStorageLocation$, true, event);
  }

  public consumablesFrom() {
    this.formDetailGroup = this.formBuilder.group({
      movementType:[this.movementTypes[1].value,[Validators.required]],
      selectedLocation: [null, [Validators.required]],
      selectedCostCenter:[null,Validators.required]
    });
  }

  getStrogeLocation(){
    this.emergencyService.getStorageLocation().subscribe({
      next:(res:any) =>{
        if(res){
          this.storageLocationList = res.d.results;
          // Set default selection if only one item in the list
          if (this.storageLocationList.length === 1) {
            this.selectedLocation = this.storageLocationList[0];
            this.formDetailGroup.get('selectedLocation').setValue(this.selectedLocation);
            this.dataShareService.sendFilterType(FilterType.ConsumableStorageLocation$, true, this.selectedLocation);
          }
        }
      },error:(err:any)=>{}
    })
  }


  getCostCenter(){
    this.emergencyService.getCostcenter().subscribe({
      next:(res:any)=>{
        this.costCenterList = res.d.results;
          // Set default selection if only one item in the list
          if (this.costCenterList.length === 1) {
            this.selectedCostCenter = this.costCenterList[0];
            this.formDetailGroup.get('selectedCostCenter').setValue(this.selectedCostCenter);
            this.dataShareService.sendFilterType(FilterType.ConsumableStorageLocation$, true, this.selectedCostCenter);
          }
      }
    })
  }

  public changeTab($event) {
    let id = String($event.id);
    this.activeTab = $event.id;
    this.dataShareService.sendData(id);
  }

  selectType(type){
    this.selectedType = type
  }

  createReservationSet(){
    this.reservationCom.saveReservationSet()
  }
  
  public resetForm() {
    this.formDetailGroup.reset();
    this.formDetailGroup.get('movementType').setValue(this.movementTypes[1].value)
    this.dataShareService.sendActionType(ActionType.Reset$, true);
  }

  onReservationSaved() {
    this.formDetailGroup.reset();
    this.formDetailGroup.get('movementType').setValue(this.movementTypes[1].value)
  }
}
