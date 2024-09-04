import { DatePipe } from '@angular/common';
import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConsumableService } from '@services/consumables/consumable.service';
import { MaterialDetails, MaterialDetailsResult } from '@services/consumables/interfaces/consumables.interface';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { WordType } from '@services/interfaces/common.enum';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { debounceTime, from, Subject, Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-history-list',
  templateUrl: './history-list.component.html',
  styleUrls: ['./history-list.component.scss']
})
export class HistoryListComponent implements OnInit {
  historyList: any;
  @Input() storageLocationList:any
  @Input() costCenterList:any
  filteredHistoryList: any[] = [];
  payload: { CostCtr: any; MoveType: any; Matnr: any; Sloc: any; Erdat: string; Erdat1: string; };
  itemDate: Date;
  matchesDateRange: boolean;
  historyCloneList: any;
  modalRefForRisk: BsModalRef;
  EditReservationFomm:FormGroup;
  private searchSubject = new Subject<string>();
  private materialType: string;
  private actionTypeSubscription$: Subscription;
  public wordType = WordType
  public materialList: Array<MaterialDetailsResult> = [];
  public materialListCopy: Array<MaterialDetailsResult> = [];
  public defaultDate = '9999-12-31';
  public movementTypes = [
    { value: '201', label: '201' },
    { value: '311', label: '311' }
  ];
  // historyLists = [
  //   {
  //     Rsnum: '0000012345',
  //     Matnr: 'A12345',
  //     Maktx: 'Material 1',
  //     Sloc: 'SL01',
  //     CostCtr: 'CC100',
  //     Bdmng: 10,
  //     Erdat:  "\/Date(1721001600000)\/",
  //     Meins: 'EA',
  //     Erusr: 'User1',
  //     MoveType:'311',
  //     Rspos : "0001",
  //     // Add more fields if necessary
  //   },
  //   {
  //     Rsnum: '0000012346',
  //     Matnr: 'B67890',
  //     Maktx: 'Material 2',
  //     Sloc: 'SL02',
  //     CostCtr: 'CC200',
  //     Bdmng: 20,
  //     Erdat:  "\/Date(1721001600000)\/",
  //     Meins: 'EA',
  //     Erusr: 'User2',
  //     MoveType:'201',
  //     Rspos : "0001",
  //   },
  //   {
  //     Rsnum: '0000012347',
  //     Matnr: 'C13579',
  //     Maktx: 'Material 3',
  //     Sloc: 'SL03',
  //     CostCtr: 'CC300',
  //     Bdmng: 30,
  //     Erdat:  "\/Date(1721001600000)\/",
  //     Meins: 'KG',
  //     Erusr: 'User3',
  //     MoveType:'311',
  //     Rspos : "0001",
  //   },
  // ];
  selectedType: any;
  constructor(private emergencyService: EmergencyService,private modalService: BsModalService,private formBuilder: FormBuilder,private consumableService: ConsumableService) { this.getMaterialList();}

  ngOnInit(): void {
    this.getHistoryList();
    this.historyForm();
  }


  public historyForm(){
    this.EditReservationFomm = this.formBuilder.group({
      movementType:[''],
      stoLocation:[''],
      cosCenter:[''],
      Matnr:[''],
      Meins:[''],
      plant:[''],
      sloc:[''],
      Menge:['',Validators.required]
    })
  }

  getHistoryList(formValue?){
    const fromDate = `${new DatePipe('en-US').transform(
      formValue?.dateRange?.[0] || this.defaultDate, 'yyyy-MM-dd'
    )}T00:00:00`;
    
    const toDate = `${new DatePipe('en-US').transform(
      formValue?.dateRange?.[1] || this.defaultDate, 'yyyy-MM-dd'
    )}T00:00:00`;
    const Sloc = formValue?.stoLocation?.Lgort
    const Matnr = formValue?.meCode?.Matnr  
    const MoveType = formValue?.moveType
    const CostCtr = formValue?.cosCenter?.Kostl
   
    this.emergencyService.getHistoryReservationList(fromDate,toDate,Sloc,Matnr,MoveType,CostCtr).subscribe({
      next:(res:any)=>{
        if (res) {
          this.historyList = res.d?.results || [];
        } else {
          this.historyList = [];
        }
      },error:(err:any)=>{
        console.log(err)
      }
    })
  }

  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }

  confirmationForReservationDelete(item){
    Swal.fire({
      text: "Are you sure you want to delete?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: 'myalertpopup'
    }).then((result) => {
      if (result.value) {
        // this.deleteForPastSurg(item);
      }
    })
  }

  public openModalForUpdateReservation(template: TemplateRef<any>, data: any) {
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-xl risk-modal-size',
    };
    console.log(data,"data");
    this.getAndPatchValue(data)
    this.selectedType = data?.MoveType
    this.modalRefForRisk = this.modalService.show(template, config);
    this.modalRefForRisk.onHide.subscribe((reason: string | any) => {
      if (reason === 'backdrop-click') {
        if (reason === 'backdrop-click') {
          this.closeReservationModal();
        }
      }
    });
  }

  closeReservationModal(){
    this.modalRefForRisk.hide();
  }

  getAndPatchValue(data){
    if(data){
      this.EditReservationFomm.patchValue({
        movementType:data?.MoveType,
        stoLocation:data?.Rspos,
        cosCenter:data?.CostCtr,
        Matnr:data?.Matnr,
        Meins:data?.Meins,
        plant:data?.Werks,
        sloc:data?.Sloc,
        Menge:data?.Bdmng
      });
    }
  }

  
  selectType(type){
    this.selectedType = type;
  }

  public searchMaterial(event, type: string) {
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

  setValueOfUnit(data:any){
    if(data){
      this.EditReservationFomm.patchValue({
        Meins:data.Meins,
      });
    }
  }

}
