import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConsumableService } from '@services/consumables/consumable.service';
import { ConsumablesHistory, ConsumablesHistoryResult, MaterialDetails, MaterialDetailsResult } from '@services/consumables/interfaces/consumables.interface';
import { DataShareService } from '@services/data-share.service';
import { Subject, Subscription, debounceTime } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-consumables-history',
  templateUrl: './consumables-history.component.html',
  styleUrls: ['./consumables-history.component.scss']
})
export class ConsumablesHistoryComponent implements OnInit {
  private paramsValue: any;

  public consumableHistoryForm: FormGroup;

  public consumableHistoryList: Array<ConsumablesHistoryResult> = [];
  public originalConsumableHistoryList: Array<ConsumablesHistoryResult> = [];
  public materialCodeList: Array<any> = [];
  public materiNameList: Array<any> = [];

  // Sorting properties
  public sortColumn: string = '';
  public sortDirection: string = 'asc'; // Default sorting direction
  actionTypeSubscription$: Subscription;
  slocData: any
  constructor(
    private consumableService: ConsumableService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private dataShareService: DataShareService,
  ) {
    this.route.queryParams.subscribe((params) => {
      this.paramsValue = params;
    });
  }

  ngOnInit(): void {
    this.consumablesFrom();
    this.actionTypeSubscription$ = this.dataShareService.filterType$.subscribe((data) => {
      if (data != null && data?.value?.Lgort) {
        this.slocData = data?.value?.Lgort;
        this.getConsumableHistory();
      } else {
        Swal.fire({
          text: 'Please select a storage location',
          icon: 'warning',
          confirmButtonText: 'Ok',
          // customClass: 'myalertpopup'
        })
      }
    })
    this.subscribeToFormChanges();
  }

  ngOnDestroy(): void {
    if (this.actionTypeSubscription$) {
      this.actionTypeSubscription$.unsubscribe();
    }
  }

  //#region "Filter Function"
  /**
   * Filter With "AND" Functionality
   */
  private subscribeToFormChanges() {
    this.consumableHistoryForm.get('materialCode').valueChanges.subscribe(() => {
      this.filterConsumableHistory();
    });

    this.consumableHistoryForm.get('materialName').valueChanges.subscribe(() => {
      this.filterConsumableHistory();
    });
  }

  private filterConsumableHistory() {
    const materialCode = this.consumableHistoryForm.get('materialCode').value;
    const materialName = this.consumableHistoryForm.get('materialName').value;

    if (materialCode || materialName) {
      this.consumableHistoryList = this.originalConsumableHistoryList.filter(item =>
        (!materialCode || item.Matnr === materialCode) &&
        (!materialName || item.Maktx === materialName)
      );
    } else {
      this.consumableHistoryList = this.originalConsumableHistoryList;
    }
  }
  /**
   * Filter With "AND" Functionality
   */
  // private subscribeToMaterialChanges() {
  //   this.consumableHistoryForm.get('materialCode').valueChanges.subscribe(() => {
  //     this.filterData();
  //   });
  //   this.consumableHistoryForm.get('materialName').valueChanges.subscribe(() => {
  //     this.filterData();
  //   });
  // }

  // private filterData() {
  //   const materialCode = this.consumableHistoryForm.value.materialCode;
  //   const materialName = this.consumableHistoryForm.value.materialName;
  //   if (materialCode || materialName) {
  //     this.consumableHistoryList = this.consumableHistoryList.filter(item => {
  //       return (!materialCode || item.Matnr === materialCode) &&
  //         (!materialName || item.Maktx === materialName);
  //     });
  //   } else {
  //     this.getConsumableHistory(); // If no filters applied, reset to original list
  //   }
  // }

  //#endregion "My Region"
  public consumablesFrom() {
    this.consumableHistoryForm = this.formBuilder.group({
      materialName: [''],
      materialCode: [''],
    });
    this.consumableHistoryForm.reset();
  }


  private getConsumableHistory() {
    this.consumableHistoryList = [];
    this.consumableService.getConsumablesHistory(this.paramsValue.falnr, this.slocData).subscribe({
      next: (resp: ConsumablesHistory) => {
        if (resp && resp.d.results) {
          // console.log(resp.d.results);
          resp.d.results.forEach((ele) => {
            this.originalConsumableHistoryList.push(ele);
            this.consumableHistoryList.push(ele);
            this.materialCodeList.push(ele.Matnr.toString());
            this.materiNameList.push(ele.Maktx.toString());
          });
          this.materialCodeList = Array.from(new Set(this.materialCodeList));
          this.materiNameList = Array.from(new Set(this.materiNameList));
          this.slocData = null
          // console.log(this.consumableHistoryList);
        }
      }
    });
  }

  public getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }


  public sortTable(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.consumableHistoryList.sort((a, b) => {
      const aValue = a[column];
      const bValue = b[column];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * (this.sortDirection === 'asc' ? 1 : -1);
      } else {
        return (aValue - bValue) * (this.sortDirection === 'asc' ? 1 : -1);
      }
    });
  }

  getTime(value) {
    if (value) {
      var str = value;
      var str = str.replace(/[PT]/g, '');
      var str = str.replace(/[H]/g, ':');
      var str = str.replace(/[M]/g, ':');
      var str = str.replace(/[S]/g, '');
      return str;
    }
  }
}
