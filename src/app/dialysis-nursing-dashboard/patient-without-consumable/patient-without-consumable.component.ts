import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ConsumableService } from '@services/consumables/consumable.service';
import { PatientWithouConsumables } from '@services/consumables/interfaces/consumables.interface';
import { DataShareService } from '@services/data-share.service';
import { FilterType } from '@services/interfaces/common.enum';
import { PatientDocumentationService } from '@services/patient-documentation.service';
import { StorageService } from '@services/storage.service';

@Component({
  selector: 'app-patient-without-consumable',
  templateUrl: './patient-without-consumable.component.html',
  styleUrls: ['./patient-without-consumable.component.scss']
})
export class PatientWithoutConsumableComponent implements OnInit {

  @Output() redirectCheckInData = new EventEmitter<any>();
  @Output() sendNoConsumableCount = new EventEmitter<any>();
  @Output() sendFilterOption = new EventEmitter<any>();

  public patientWithoutConsumableList: Array<PatientWithouConsumables> = [];
  public filteredPatients: Array<PatientWithouConsumables> = [];
  public financialCategory: Array<any> = [];
  public statucList: Array<any> = [];
  public statusValueArr: Array<any> = [];
  public categoryValueArr: Array<any> = [];

  public isFormValidError: boolean = false;
  public searchString: string = '';

  // Sorting properties
  public sortColumn: string = '';
  public sortDirection: string = 'asc'; // Default sorting direction


  constructor(
    private consumableService: ConsumableService,
    private storageService: StorageService,
    private dataShareService: DataShareService,
  ) { }

  ngOnInit(): void {
    this.getPatientWithoutConsumable();
  }

  public getPatientWithoutConsumable(date?) {
    // this.consumableService.getNoConsumablesSet().subscribe({
    //   next: (resp: PatientWithouConsumables) => {
    //     if (resp && resp) {
    //       this.patientWithoutConsumableList = this.filteredPatients = resp.d.results;
    //       this.patientWithoutConsumableList.forEach((ele: any) => {
    //         this.financialCategory.push(ele?.FinancecategoryName);
    //         this.statucList.push(ele?.StatusText);
    //       });
    //       this.financialCategory = Array.from(new Set(this.financialCategory.filter(category => category.trim() !== '')));
    //       this.statucList = Array.from(new Set(this.statucList.filter(category => category.trim() !== '')));
    //       const value = {
    //         filterCategoryList: this.financialCategory,
    //         filterStatusList: this.statucList
    //       };
    //       this.dataShareService.sendFilterType(FilterType.PatientWithNoConsumable$, true, value);
    //       this.sendNoConsumableCount.emit(this.patientWithoutConsumableList.length);
    //     }
    //   }
    // });
    const json = {
      Deptcode: '2',
      fromDate: `${new DatePipe('en-US').transform(
        date ? date[0] : new Date().setDate(new Date().getDate()),
        'yyyy-MM-dd'
      )}T00:00:00`,
      toDate: `${new DatePipe('en-US').transform(
        date ? date[1] : new Date().setDate(new Date().getDate()),
        'yyyy-MM-dd'
      )}T00:00:00`,
    };

    this.consumableService.getDialysisConsumableSet(json).subscribe({
      next: (resp:PatientWithouConsumables) =>{
        if (resp && resp) {
          this.patientWithoutConsumableList = this.filteredPatients = resp.d.results;
          this.patientWithoutConsumableList.forEach((ele: any) => {
            this.financialCategory.push(ele?.FinancecategoryName);
            this.statucList.push(ele?.StatusText);
          });
          this.financialCategory = Array.from(new Set(this.financialCategory.filter(category => category.trim() !== '')));
          this.statucList = Array.from(new Set(this.statucList.filter(category => category.trim() !== '')));
          const value = {
            filterCategoryList: this.financialCategory,
            filterStatusList: this.statucList
          };
          this.dataShareService.sendFilterType(FilterType.PatientWithNoConsumable$, true, value);
          this.sendNoConsumableCount.emit(this.patientWithoutConsumableList.length);
        }
      } 
    })
  }

  formatDate(dateTimeString){
    if(dateTimeString){
      const date = new Date(dateTimeString).toISOString()
      const dateDataArr = date.split('T')
      return `${dateDataArr[0]}T${dateDataArr[1].substring(0,8)}`
    }
  }

  public getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }

  public getTime(value) {
    if (value) {
      var str = value;
      var str = str.replace(/[PT]/g, '');
      var str = str.replace(/[H]/g, ':');
      var str = str.replace(/[M]/g, ':');
      var str = str.replace(/[S]/g, '');
      var str = str.split(':');
      var finalstr = str[0] + ':' + str[1];
      return finalstr;
    }
  }


  public filterPatients(): void {
    // Convert the search string to lowercase for case-insensitive search
    const searchValue = this.searchString.toLowerCase().trim();

    // Filter the patient list based on the search string
    this.filteredPatients = this.patientWithoutConsumableList.filter(patient => {
      // Perform a case-insensitive search on each property of the patient object
      return Object.values(patient).some(value => {
        return typeof value === 'string' && value.toLowerCase().includes(searchValue);
      });
    });
    this.sendNoConsumableCount.emit(this.filteredPatients.length);
  }


  public sortTable(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.patientWithoutConsumableList.sort((a, b) => {
      const aValue = a[column];
      const bValue = b[column];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * (this.sortDirection === 'asc' ? 1 : -1);
      } else {
        return (aValue - bValue) * (this.sortDirection === 'asc' ? 1 : -1);
      }
    });
  }


  public redirectToTreatByName(data) {
    const json = {
      Patnr: data.Patient,
      Einri: data.Einri,
      Falnr: data.Falnr.toString().padStart(10, '0'),
      Lfdnr: '00001',
      redirectFor: 'Consumables'
    };
    this.storageService.setCheckinData(data);
    localStorage.setItem('checkindata', JSON.stringify(data));
    localStorage.setItem('tabName', 'Consumables');
    this.redirectToTreatment(json);
  }

  public redirectToTreatment(data) {
    this.redirectCheckInData.emit(data);
  }

  public filterListData(event) {
    let filterValue = this.filteredPatients;
    console.log(filterValue);
    if(event.Status || event.FCategory){
      if(event.Status && event.Status?.length){
        filterValue = filterValue.filter((item: any) => {
          return event.Status.includes(item.StatusText);
        });
      }
      if(event.FCategory && event.FCategory?.length){
        filterValue = filterValue.filter((item: any) => {
          return event.FCategory.includes(item.FinancecategoryName);
        });
      }
    this.patientWithoutConsumableList = filterValue 
    this.sendNoConsumableCount.emit(this.patientWithoutConsumableList.length);
    }

    // if (event.Status && event.Status != '') {
    //   if (event.Status && event.Status.length) {
    //     this.statusValueArr = event.Status.map((statusValue) => {
    //       console.log('statusValue',statusValue);
    //       return filterValue.filter((element: any) => {
    //         const statusText = element.StatusText ? element.StatusText.trim().toLowerCase() : ''; // Handle undefined or missing StatusText
    //         return statusText === statusValue.trim().toLowerCase()
    //       });
    //     });
    //   }


    //   if (event.FCategory && event.FCategory.length) {
    //     this.categoryValueArr = event.FCategory.map((categoryValue) => {
    //       return filterValue.filter((element: any) => {
    //         const financeCategory = element.FinancecategoryName ? element.FinancecategoryName.trim().toLowerCase() : ''; // Handle undefined or missing FinancecategoryName
    //         return financeCategory === categoryValue.trim().toLowerCase();
    //       });
    //     });
    //   }
    //   const filteredData = filterValue.filter((item:any) => {
    //     const statusMatch = event.Status.includes(item.StatusText);

    //     const fCategoryMatch = event.FCategory.includes(item.FinancecategoryName);

    //     return statusMatch && fCategoryMatch;
    // });

    //   // filterValue = this.flattenArrays([...this.statusValueArr, ...this.categoryValueArr]);

    //   this.patientWithoutConsumableList = filteredData;
    //   this.sendNoConsumableCount.emit(this.patientWithoutConsumableList.length);
    // } else {
    //   // Reset the filter and show all patients
    //   this.patientWithoutConsumableList = this.filteredPatients;
    //   this.sendNoConsumableCount.emit(this.patientWithoutConsumableList.length);
    // }
  }



  private flattenArrays(arrays: any[][]): any[] {
    return arrays.reduce((acc, val) => acc.concat(val), []);
  }

}
