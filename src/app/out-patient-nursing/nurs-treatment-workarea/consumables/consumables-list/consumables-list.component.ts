import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConsumableService } from '@services/consumables/consumable.service';
import { ConsumableList, MaterialDetails, MaterialDetailsResult, MaterialStockDetails } from '@services/consumables/interfaces/consumables.interface';
import { DataShareService } from '@services/data-share.service';
import { UserConfig } from '@services/e-kardex/interfaces/user-config';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { getAlertConfig } from '@services/index';
import { ActionType, FilterType, WordType } from '@services/interfaces/common.enum';
import { StorageService } from '@services/storage.service';
import { TooltipConfig } from 'ngx-bootstrap/tooltip';
import { Subject, Subscription, debounceTime, filter, switchMap } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-consumables-list',
  templateUrl: './consumables-list.component.html',
  styleUrls: ['./consumables-list.component.scss'],
  providers: [{ provide: TooltipConfig, useFactory: getAlertConfig }],
})
export class ConsumablesListComponent implements OnInit, OnDestroy,OnChanges {
  @Input() postitem: any;
  @Output() postitemReset = new EventEmitter<void>();
  public consumableHistoryForm: FormGroup;
  public UserDetails: any;
  public consumableList: Array<ConsumableList>;
  public materialList: Array<MaterialDetailsResult> = [];
  public materialListCopy: Array<MaterialDetailsResult> = [];
  public batchNumberList: Array<any> = [];
  public PatMatCosmpNmm7HdToItmNav: FormArray;
  public searchTerm = new Subject<string>();
  private searchTermText: string = '';
  public selectedStorageLocation: string = '';

  private searchSubject = new Subject<string>();
  private materialType: string;
  private indexNumber: Number;
  private actionTypeSubscription$: Subscription;
  private defaultRecords: Number = 10;
  private paramsValue: any;
  public userconfig: UserConfig;
  public periodParameterMonthSelectValue: any;
  public wordType = WordType
  UOMList: any;
  constructor(
    private consumableService: ConsumableService,
    private dataShareService: DataShareService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private storageService: StorageService,
    private emergencyService: EmergencyService
  ) {
    this.getMaterialList();
    this.route.queryParams.subscribe((params) => {
      this.paramsValue = params;
    });
  }

    ngOnChanges(changes: SimpleChanges): void {
    if (changes['postitem']) {
      const currentValue = changes['postitem'].currentValue;
      if(currentValue == 'Save'){
        this.saveRecords();
      }else if (currentValue == 'Reset'){
        this.consumableHistoryForm.reset();
         this.consumableHistoryForm = this.generateConsumableForm();
         this.generateDefaultForm();
      }else {
         this.consumableHistoryForm = this.generateConsumableForm();
         this.generateDefaultForm();
      }
    }
  }

  ngOnDestroy(): void {
    this.actionTypeSubscription$.unsubscribe();
    this.postitemReset.emit()
  }

  ngOnInit(): void {
    this.UserDetails = JSON.parse(localStorage.getItem('amc_dev_loggedInUserProfile'));
    this.consumableHistoryForm = this.generateConsumableForm();
    this.generateDefaultForm();

    this.actionTypeSubscription$ = this.dataShareService.filterType$.subscribe((data) => {
      if (data != null && data.type === FilterType.ConsumableStorageLocation$ && data.isAllow === true) {
        this.selectedStorageLocation = data?.value?.Lgort;
      }
    });
  }

  private generateDefaultForm() {
    for (let i = 0; i < this.defaultRecords.valueOf(); i++) {
      this.addrow()
    }
  }

  // getUserConfigSetting() {
  //   this.userConfigurationService
  //     .getUserConfigData()
  //     .pipe(
  //       untilDestroyed(this),
  //       catchError((err) => {
  //         return of([]);
  //       })
  //     )
  //     .subscribe((userconfig: UserConfig) => {
  //       this.userconfig = userconfig;
  //       this.periodParameterMonthSelectValue = this.userconfig.PeriodParameterMonth;
  //     });
  // }

  get resultsFormArray(): FormArray {
    return this.consumableHistoryForm.get('PatMatCosmpNmm7HdToItmNav.results') as FormArray;
  }

  public addNewConsumable(): void {
    this.addrow();
  }

  public generateConsumableForm(): FormGroup {
    return new FormGroup({
      Einri: new FormControl(this.paramsValue.einri),
      Falnr: new FormControl(this.paramsValue.falnr),
      Anfoe: new FormControl(this.storageService.patientData.deptOrgUnit),
      Anpoe: new FormControl(this.storageService.patientData?.Treatmentou),
      Lgort: new FormControl(''),
      PatMatCosmpNmm7HdToItmNav: new FormGroup({
        // results: new FormArray([])
        results: this.formBuilder.array([]),
      }),
      isAllSelected: new FormControl(false),
    });


  }

  public addrow() {
    const formArray = (this.consumableHistoryForm.get('PatMatCosmpNmm7HdToItmNav').get('results') as FormArray);
    formArray.push(this.generateChildListForm(this.consumableHistoryForm.get('PatMatCosmpNmm7HdToItmNav').get('results').value.length));
    // if (formArray.length >= 2) {
    //   const numericValue = parseInt(formArray.at(formArray.length - 2).value.Item, 10) + 10;
    //   formArray.at(formArray.value.length - 1).patchValue({
    //     Item: numericValue.toString().padStart(4, '0'),
    //   });
    // } else {
    //   formArray.at(formArray.value.length - 1).patchValue({
    //     Item: "0010",
    //   });
    // }
  }

  stringDateConvert(data: any) {
    if (typeof data === 'string' && data.includes('/Date(')) {
      return data = new Date(
        new Date(+data.replace('/Date(', '').replace(')/', '')).toLocaleDateString('en-US')
      );
    }
  }

  public isFormatDate(date: Date) {
    const Month = date.getMonth() < 9 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    const Year = date.getFullYear();
    const Day = date.getDate() < 9 ? `0${date.getDate()}` : date.getDate();
    return `${Year}-${Month}-${Day}`
  }

  generateChildListForm(index: number): FormGroup {
    return new FormGroup({
      Id: new FormControl(index),
      Falnr: new FormControl(this.paramsValue.falnr),
      Werks: new FormControl("1000"),
      Matnr: new FormControl(""),
      Arktx: new FormControl(""),
      Stock: new FormControl(""),
      Menge: new FormControl("", Validators.required),
      Meins: new FormControl(""),
      Lfdat: new FormControl(this.isFormatDate(new Date())),
      Lfsta: new FormControl("3"),
      Genam: new FormControl(""),
      Postx: new FormControl(""),
      Abrkz: new FormControl(""),
      Charg: new FormControl(""),
      Drukz: new FormControl(""),
      Wempf: new FormControl(""),
      Cstock: new FormControl(""),
      Ftxtkz: new FormControl(""),
      Txz01: new FormControl(""),
      PrioUrg: new FormControl(""),
      PrioReq: new FormControl(""),
      Gernr: new FormControl(""),
      isSelected: new FormControl(false),
    })
  }

  public isAllchecked(event: any): void {
    const target = event.currentTarget.checked;
    this.consumableHistoryForm.get('PatMatCosmpNmm7HdToItmNav').get('results').value.forEach((element, index) => {
      this.consumableHistoryForm.get('PatMatCosmpNmm7HdToItmNav').get('results')['controls'][index].patchValue({
        isSelected: target
      })
    });
  }


  public isSelectedItem(): void {
    if (
      this.consumableHistoryForm.get('PatMatCosmpNmm7HdToItmNav').get('results')['controls'] &&
      this.consumableHistoryForm.get('PatMatCosmpNmm7HdToItmNav').get('results')['controls'].length &&
      this.consumableHistoryForm.get('PatMatCosmpNmm7HdToItmNav').get('results').value.filter(d => d.isSelected).length === this.consumableHistoryForm.get('PatMatCosmpNmm7HdToItmNav').get('results')['controls'].length
    ) {
      this.consumableHistoryForm.patchValue({
        isAllSelected: true
      })
    } else {
      this.consumableHistoryForm.patchValue({
        isAllSelected: false
      })
    }
  }

  public searchMaterial(event, type: string, index: number) {
    this.materialType = type
    this.indexNumber = index;
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
              if (resp.d.results.length == 1) {
                this.getDetailsOfMaterial(term, this.indexNumber.valueOf());
              }
            }
          }
        });
      }
    });
  }

  // public searchMaterial(event, type: string, index: number) {
  //   this.materialType = type
  //   this.indexNumber = index;
  //   this.searchTermText = event;
  //   if (event.length != 0) {
  //     this.searchSubject.next(event);
  //   } else {
  //     this.materialList = this.materialListCopy = [];
  //   }
  // }

  // private getMaterialList() {
  //   this.searchSubject.pipe(
  //     debounceTime(200), // Debounce the events for 2000ms
  //     filter(term => {
  //       const fltVal = (this.materialType === 'MaterialCode') ? 2 : 3;
  //       return term.length >= fltVal; // Filter based on the condition
  //     }),
  //     switchMap(term => {
  //       if (this.materialList.length === 0) {
  //         return this.consumableService.getMaterialDetails(term);
  //       } else {
  //         return [];
  //       }
  //     })
  //   ).subscribe({
  //     next: (resp: MaterialDetails) => {
  //       if (resp && resp.d.results) {
  //         this.materialList = this.materialListCopy = resp.d.results;
  //         if (resp.d.results.length === 1) {
  //           this.getDetailsOfMaterial(this.searchTermText, this.indexNumber.valueOf());
  //         }
  //       }
  //     }
  //   });
  // }

    public getUnitTextList(event: any, index: number){
    if(event){
     this.emergencyService.getUnitList(event).subscribe({
       next:(resp:any)=>{
         if (resp && resp.d.results) {
           this.UOMList = resp.d.results;
         }
       }
     })
    }
   }

  public getDetailsOfMaterial(event: any, index: number) {
    const enteredValue = event;
    let parms = {
      enteredValue: event,
      location: this.selectedStorageLocation,
    }
    this.consumableService.getMaterialStockDetails(`${JSON.stringify(parms)}`).subscribe({
      next: (resp: MaterialStockDetails) => {
        if (resp && resp.d.results && resp.d.results.length > 0) {
          let materialDetail = resp.d.results[0];
          this.consumableHistoryForm.get('PatMatCosmpNmm7HdToItmNav').get('results')['controls'][index].patchValue({
            Matnr: materialDetail.Matnr,
            Arktx: materialDetail.Maktx,
            Stock: materialDetail.Stock,
            Meins: materialDetail.Uom,
            Werks: materialDetail.Werks,
            Vfdat: materialDetail.Vfdat,
            Lgort: materialDetail.Lgort,
            Charg: materialDetail.Charg,
            Menge: '1'
          });
          this.getUnitTextList(event, this.indexNumber.valueOf());
        } else {
          // this.showNotificationMessage = true;
          Swal.fire({
            text: `No Stock data for the selected item ${enteredValue}`,
            icon: 'error',
            confirmButtonText: 'Ok',
            customClass: { popup: 'myalertpopup' }
          }).then((result) => {
            if (result.value) {
              if (this.materialType === this.wordType.MaterialName$) {
                const control = (this.consumableHistoryForm.get('PatMatCosmpNmm7HdToItmNav').get('results') as FormArray).at(index).get('Arktx');
                control.reset();
              } else {
                const control = (this.consumableHistoryForm.get('PatMatCosmpNmm7HdToItmNav').get('results') as FormArray).at(index).get('Matnr');
                control.reset();
              }
            }
          })
        }
      }
    })
  }

  public removeRow($event: any, index: number) {
    this.resultsFormArray.removeAt(index);
  }

private saveRecords(): void {
  const formControls = this.consumableHistoryForm.get('PatMatCosmpNmm7HdToItmNav').get('results')['controls'];
  const filledRows = formControls.filter(d => d.valid && d.value.Matnr?.trim() !== '');
  const notSelectedRow = filledRows.find(d => !d.value.isSelected);
  if (notSelectedRow) {
    Swal.fire({
      text: "Please select the filled row to proceed.",
      icon: 'warning',
      confirmButtonText: 'Ok',
      customClass: { popup: 'myalertpopup' }
    });
    return;
  }
  const selectedRows = formControls.filter(d => d.value.isSelected);
  const selectedInvalid = selectedRows.find(d => !d.valid || d.value.Matnr?.trim() === '');
  if (selectedInvalid) {
    Swal.fire({
      text: "Please fill all the required values.",
      icon: 'error',
      confirmButtonText: 'Ok',
      customClass: { popup: 'myalertpopup' }
    });
    return;
  }
  const stockZeroRow = selectedRows.find(d =>
    d.valid && d.value.Matnr?.trim() !== '' && d.value.isSelected &&
    (+d.value.Stock === 0 || d.value.Stock === '0')
  );
  if (stockZeroRow) {
    Swal.fire({
      text: "Stock is not available.",
      icon: 'error',
      confirmButtonText: 'Ok',
      customClass: { popup: 'myalertpopup' }
    });
    return;
  }
  const payload = selectedRows
    .filter(d => d.valid && d.value.Matnr?.trim() !== '')
    .map(d => {
      const val = { ...d.value };
      delete val.Id;
      delete val.Arktx;
      delete val.isSelected;
      delete val.Stock;
      delete val.Lgort;
      return val;
    });

  this.consumableHistoryForm.patchValue({
    Lgort: this.selectedStorageLocation,
  });

  delete this.consumableHistoryForm.value.isAllSelected;
  this.consumableHistoryForm.value.PatMatCosmpNmm7HdToItmNav.results = [...payload];
  this.consumableService.saveConsumableDataSet(this.consumableHistoryForm.value).subscribe(() => {
    Swal.fire({
      text: "Saved Successfully",
      icon: 'success',
      confirmButtonText: 'Ok',
      customClass: { popup: 'myalertpopup' }
    }).then((result) => {
      if (result.value) {
        this.consumableHistoryForm.reset();
        this.postitemReset.emit();
      }
    });
  }, (error: any) => {
    let messageError = error.error.error.innererror?.errordetails || [];
    let message: any = '';
    messageError.forEach((e, index) => {
      if (e.code !== '/IWBEP/CX_MGW_BUSI_EXCEPTION') {
        message += `${message ? '<br>' : ''}${index + 1}) ${e.message}`;
      }
    });

    Swal.fire({
      title: message || 'An error occurred.',
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: { popup: 'diagnosis-error' },
    }).then((result) => {
     this.consumableHistoryForm.reset();
     this.postitemReset.emit();
    });
  });
}
}
