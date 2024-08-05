import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ConsumableService } from '@services/consumables/consumable.service';
import { PatientWithouConsumables } from '@services/consumables/interfaces/consumables.interface';
import { DataShareService } from '@services/data-share.service';
import { DayCaseDashboardService } from '@services/day-case.dashboard/day-case-dashboard.service';
import { FilterType } from '@services/interfaces/common.enum';
import { StorageService } from '@services/storage.service';

@Component({
  selector: 'app-patient-without-consumable',
  templateUrl: './patient-without-consumable.component.html',
  styleUrls: ['./patient-without-consumable.component.scss']
})
export class PatientWithoutConsumableComponent implements OnInit {

  @Output() redirectCheckInData = new EventEmitter<any>();
  @Output() sendErPatientCount = new EventEmitter<any>();
  @Output() sendFilterOption = new EventEmitter<any>();
  @Output() dataToParent = new EventEmitter<any>();

  public patientWithoutConsumableList:any = [];
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
  patientWithoutConsumableListClone: any[];


  constructor(
    private consumableService: ConsumableService,
    private storageService: StorageService,
    private dataShareService: DataShareService,
    private dayCaseDashboardService:DayCaseDashboardService
  ) { }

  ngOnInit(): void {
    this.getPatientWithoutConsumable("");
  }

  public getPatientWithoutConsumable(date?) {
    const json = {
      Deptcode:'3',
      Datege :`${new DatePipe('en-US').transform(
        date ?  date[0] : new Date().setDate(new Date().getDate()),
        'yyyy-MM-dd'
      )}T00:00:00`,
      Datele:`${new DatePipe('en-US').transform(
        date ?  date[1]  :new Date().setDate(new Date().getDate()),
        'yyyy-MM-dd'
      )}T00:00:00`,
      
    };
    this.dayCaseDashboardService.getNoConsumablesSet(json).subscribe({
      next: (resp: PatientWithouConsumables) => {
        if (resp && resp) {
          this.patientWithoutConsumableList = this.filteredPatients = resp.d.results;
          this.patientWithoutConsumableListClone = this.filteredPatients = resp.d.results;
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
          this.sendErPatientCount.emit(this.patientWithoutConsumableList.length);
          this.dataToParent.emit(this.patientWithoutConsumableList);
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
    this.sendErPatientCount.emit(this.filteredPatients.length);
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
   const statusFilter = event.Status;
   const fCategoryFilter = event.FCategory;
   const room = event.Rooms
   const Physician = event.Physician
   this.patientWithoutConsumableList = this.patientWithoutConsumableListClone.filter((item) => {
        const statusMatch = statusFilter ? item.StatusText.includes(statusFilter) : true;
        const physicianMatch = Physician ? item.PhysicianName.includes(Physician) : true;
        const roomMatch = room && room.length > 0 ? room.includes(item.RoomidText) : true;
        const fCategoryMatch = fCategoryFilter && fCategoryFilter.length > 0 ? fCategoryFilter.includes(item.FinancecategoryName) : true;
        return statusMatch && fCategoryMatch && roomMatch && physicianMatch;
    });
  this.sendErPatientCount.emit(this.patientWithoutConsumableList.length);
  }

}
