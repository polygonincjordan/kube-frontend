import { DatePipe } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConsumableService } from '@services/consumables/consumable.service';
import { MaterialDetails, MaterialDetailsResult, MaterialStockDetails } from '@services/consumables/interfaces/consumables.interface';
import { DataShareService } from '@services/data-share.service';
import { UserConfig } from '@services/e-kardex/interfaces/user-config';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { FilterType, WordType } from '@services/interfaces/common.enum';
import { Subject, Subscription, debounceTime, filter, switchMap } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reservation-list',
  templateUrl: './reservation-list.component.html',
  styleUrls: ['./reservation-list.component.scss']
})
export class ReservationListComponent implements OnInit {
  @Input() selectedType: any;
  public reservationForm: FormGroup;
  public materialList: Array<MaterialDetailsResult> = [];
  public materialListCopy: Array<MaterialDetailsResult> = [];
  public reservationToItem: FormArray;
  public searchTerm = new Subject<string>();
  public selectedStorageLocation: string = '';
  private searchSubject = new Subject<string>();
  private materialType: string;
  private actionTypeSubscription$: Subscription;
  private defaultRecords: Number = 5;
  public userconfig: UserConfig;
  public periodParameterMonthSelectValue: any;
  public wordType = WordType
  public selectedCostCenter: any;
  constructor(
    private consumableService: ConsumableService,
    private dataShareService: DataShareService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private emergencyService: EmergencyService
  ) {
    this.getMaterialList();
  }

 ngOnDestroy(): void {
    this.actionTypeSubscription$.unsubscribe();
  }

  ngOnInit(): void {
    this.reservationForm = this.generateConsumableForm();
    this.generateDefaultForm();
    this.actionTypeSubscription$ = this.dataShareService.filterType$.subscribe((data) => {
      if (data != null && data.type === FilterType.ConsumableStorageLocation$ && data.isAllow === true) {
        this.selectedStorageLocation = data?.value?.Lgort;
        this.selectedCostCenter = data?.value?.Kostl
      }
    });
  }

  private generateDefaultForm() {
    for (let i = 0; i < this.defaultRecords.valueOf(); i++) {
      this.addrow()
    }
  }

  get resultsFormArray(): FormArray {
    return this.reservationForm.get('reservationToItem.results') as FormArray;
  }

  public addNewConsumable(): void {
    this.addrow();
  }

  public generateConsumableForm(): FormGroup {
    return new FormGroup({
      reservationToItem: new FormGroup({
        results: this.formBuilder.array([]),
      }),
      isAllSelected: new FormControl(false),
    });
  }

  public addrow() {
    const formArray = (this.reservationForm.get('reservationToItem').get('results') as FormArray);
    formArray.push(this.generateChildListForm(this.reservationForm.get('reservationToItem').get('results').value.length));
  }

  generateChildListForm(index: number): FormGroup {
    return new FormGroup({
      Id: new FormControl(index),
      Matnr: new FormControl(""),
      plant: new FormControl("1000"),
      Menge: new FormControl("", Validators.required),
      Meins: new FormControl(""),
      sloc: new FormControl(""),
      isSelected: new FormControl(false),
    })
  }

  public isAllchecked(event: any): void {
    const target = event.currentTarget.checked;
    this.reservationForm.get('reservationToItem').get('results').value.forEach((element, index) => {
      this.reservationForm.get('reservationToItem').get('results')['controls'][index].patchValue({
        isSelected: target
      })
    });
  }


  public isSelectedItem(): void {
    if (
      this.reservationForm.get('reservationToItem').get('results')['controls'] &&
      this.reservationForm.get('reservationToItem').get('results')['controls'].length &&
      this.reservationForm.get('reservationToItem').get('results').value.filter(d => d.isSelected).length === this.reservationForm.get('reservationToItem').get('results')['controls'].length
    ) {
      this.reservationForm.patchValue({
        isAllSelected: true
      })
    } else {
      this.reservationForm.patchValue({
        isAllSelected: false
      })
    }
  }

  public searchMaterial(event, type: string, index: number) {
    this.materialType = type
    this.searchSubject.next(event);
  }


  public getMaterialList() {
    this.searchSubject.pipe(debounceTime(2000)).subscribe((term) => {
      const fltVal = (this.materialType === this.wordType.MaterialCode$) ? 2 : 3;
      if (term.length >= fltVal.valueOf()) {
        this.consumableService.getMaterialDetails(term).subscribe({
          next: (resp: MaterialDetails) => {
            if (resp && resp.d.results) {
              this.materialList = this.materialListCopy = resp.d.results;
            }
          }
        });
      }
    });
  }

  public getDetailsOfMaterial(event: any, index: number) {
    const enteredValue = event;
    let parms = {
      enteredValue: event,
      location:this.selectedType === "201" ? this.selectedCostCenter : this.selectedStorageLocation
    }
    this.consumableService.getMaterialStockDetails(`${JSON.stringify(parms)}`).subscribe({
      next: (resp: MaterialStockDetails) => {
        if (resp && resp.d.results && resp.d.results.length > 0) {
          let materialDetail = resp.d.results[0];
          this.reservationForm.get('reservationToItem').get('results')['controls'][index].patchValue({
            Matnr: materialDetail.Matnr,
            Meins: materialDetail.Uom,
            sloc: materialDetail.Lgort,
            plant: "1000",
            Menge:"1"
          });
        } else {
          Swal.fire({
            text: `No Stock data for the selected item ${enteredValue}`,
            icon: 'error',
            confirmButtonText: 'Ok',
            customClass: 'myalertpopup'
          }).then((result) => {
            if (result.value) {
              this.reservationForm.get('reservationToItem').get('results')['controls'][index].patchValue({
                Matnr: "",
                Meins: "",
                sloc:"",
                plant: "1000",
                Menge:""
              });
            }
          })
        }
      }
    })
  }

  createPayload() {
    const plantValue = this.reservationForm.get('reservationToItem').get('results')['controls'][0].get('plant').value;
    const toItems = this.reservationForm.get('reservationToItem').get('results')['controls']
      .filter(control => control.get('isSelected').value)  // Filter only selected rows
      .map(control => ({
        Material: control.get('Matnr').value,
        StoreLoc: control.get('sloc').value,
        Batch: "0000000004",
        Quantity: control.get('Menge').value,
        Unit: control.gey('Meins').value,
        ReqDate: `${new DatePipe('en-US').transform(new Date(), 'yyyy-MM-dd')}T00:00:00`,
        ShortText: "Testing"
      }));
  
    // Create the payload
    const payload = {
      d: {
        Plant: plantValue,
        MoveType: this.selectedType,
        RecvStloc: this.selectedStorageLocation,
        ResDate: `${new DatePipe('en-US').transform(new Date(), 'yyyy-MM-dd')}T00:00:00`,
        TOITEM: toItems
      }
    };

    const secondPayload = {
      d : {
        Plant :plantValue,
        MoveType : this.selectedType,
        CostCtr : this.selectedCostCenter,
        ResDate :`${new DatePipe('en-US').transform(new Date(),'yyyy-MM-dd')}T00:00:00`,
        TOITEM : toItems
      }

    }
  
    return { payload, secondPayload };
  }

  saveReservationSet(){
    const { payload, secondPayload } = this.createPayload();
    if(this.selectedType && (this.selectedStorageLocation || this.selectedCostCenter)){
      if(this.selectedType ==="201"){
           this.emergencyService.createReservation(secondPayload).subscribe((res)=>{},(error:any)=>{})
         }else{
           this.emergencyService.createReservation(payload).subscribe((res)=>{},(error:any)=>{})
         }
    }else {
      Swal.fire({
        text: !this.selectedType 
        ? 'Please select a movement type.' 
        : `Please select a ${this.selectedType === '201' ? 'cost center.' : 'storage location.'}`,
        icon: 'error',
        confirmButtonText: 'Ok',
        customClass: 'myalertpopup'
      })
    }
   }

  public removeRow($event: any, index: number) {
    this.resultsFormArray.removeAt(index);
  }


}
