import { Component, Input, OnInit, Output, TemplateRef, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { catchError, of, retry, throwError } from 'rxjs';
import { StorageService } from '@services/storage.service';
import { HospitalistService } from '@services/e-hospitalist/hospitalist.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';

@UntilDestroy()
@Component({
  selector: 'app-in-patients',
  templateUrl: './in-patients.component.html',
  styleUrls: ['./in-patients.component.scss'],
})
export class InPatientsComponent implements OnInit {
  @Input() listItem: any;
  @Input() searchString
  @Output() reloadTableData = new EventEmitter();
  @Output() openModuleKardex = new EventEmitter();

  modalRef: BsModalRef;
  phyOrderform1: FormGroup;
  phyOrderform2: FormGroup;
  progressEntryForm:FormGroup
  items: FormArray;

  columnsList = [
    'MRN',
    'Patient',
    'Ward',
    'Room',
    'Created On',
    'Created By',
    'Status',
    'Occupational Group',
    'Physician Order Text',
    'Action',
  ];
  asc = false;
  showPhyOrderError=false;
  phyOrderData: any;
  phyOrderAction: any;
  currentTime: any;
  profileRes: any;
  cancelReasonValue: any = '';
  errmsg: string;
  cancelReasonListData: any = [];
  occupationalGroupData: any;
  physicianOrderList: any[];


  constructor(
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private storageService: StorageService,
    private _hospitallistService: HospitalistService,
    public emergencyService: EmergencyService
  ) {}

  ngOnInit(): void {
    this.inForm();
    this.profileRes=this.storageService.getUserProfile();
    this.cancelReasonList();
  }

  inForm() {
    this.phyOrderform1 = this.formBuilder.group({
      items: new FormArray([]),
      physicianNumber:[''],
      physicianName: [''],
    });

    this.progressEntryForm = this.formBuilder.group({
      progressDate: [''],
      progressTime: [''],
      assignment:[''],
      occupationalGroup: [''],
      text:['']
    });
  }

  addItem(): void {
    this.items = this.phyOrderform1.get('items') as FormArray;
    this.items.push(this.createNewOrder());
  }

  createNewOrder(): FormGroup {
    this.currentTime = new Date().getHours() + ':' + new Date().getMinutes();
    return this.formBuilder.group({
      orderDate: [new Date()],
      orderTime: [this.currentTime],
      occupationalGroup: ['NURS'],
      physicianOrder: [''],
    }
    );
  }

  phyOrderTableList(data) {
    const res = this._hospitallistService.getPhyOrderSetDataSet(
      data.Einri,
      data.Falnr
    );

    this._hospitallistService.phyOrderlistData$
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any[]) => {
        this.physicianOrderList = data;
        //this.physicianOrderListFilterValue = data;
      });
  }

  get phyOrderControls() {
    return this.phyOrderform1.controls;
  }

  sortOnCreatedOnPhyOrder() {
    if (!this.asc) {
      this.asc = true;
      this.listItem.sort((a, b) => {
        const nameA = a.Erdat.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Erdat.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      });
    } else {
      this.asc = false;
      this.listItem.sort((a, b) => {
        const nameA = a.Erdat.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Erdat.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return 1;
        }
        if (nameA > nameB) {
          return -1;
        }

        // names must be equal
        return 0;
      });
    }
  }

  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }

  redirectToeKardex(data) {
    this.openModuleKardex.emit(data);
  }

  public openModalForPhyOrder(
    template: TemplateRef<any>,
    data: any,
    action: any
  ) {
    if (action == 'execute') {
      const config: ModalOptions = { class: 'modal-dialog-centered execute-delete-modal'};
      this.modalRef = this.modalService.show(template,config);
    }
    if (action == 'delete') {
      const config: ModalOptions = { class: 'modal-dialog-centered execute-delete-modal'};
      this.modalRef = this.modalService.show(template,config);
    }
    if (action == 'remove') {
      const config: ModalOptions = { class: 'modal-dialog-centered execute-delete-modal'};
      this.modalRef = this.modalService.show(template,config);
    }
    if (action == 'create') {
      this.showPhyOrderError = false;
      this.phyOrderform1.controls['physicianNumber'].disable();
      this.phyOrderform1.controls['physicianName'].disable();
      const config: ModalOptions = { class: 'modal-dialog-centered modal-xl create-modal'};
      this.modalRef = this.modalService.show(template,config);
      this.items = this.phyOrderform1.get('items') as FormArray;
      this.items.clear();
      this.modalRef.onHide.subscribe((reason: string | any) => {
        if(reason === 'backdrop-click') {
         this.phyOrderform1.reset();
         this.items = this.phyOrderform1.get('items') as FormArray;
         this.items.clear();
        }
      });
      this.occupationalGroupList();
      this.phyOrderTableList(data)
    }


    this.phyOrderData = data;
    this.phyOrderAction = action;
    this.currentTime = new Date().getHours() + ':' + new Date().getMinutes();
    // this.phyOrderform1.controls.orderTime.setValue(this.currentTime);
    this.phyOrderform1.controls.physicianNumber.setValue(this.profileRes.Gpart);
    this.phyOrderform1.controls.physicianName.setValue(this.profileRes.GpartName);
    // this.phyOrderform1.controls.orderDate.setValue(new Date());
    
  }

  physicianOrderSet(phyOrderData, action) {
    let json;
    if (action == 'execute') {
      this.modalRef.hide();
      json = {
        PorderId: phyOrderData.PorderId,
        CancelIndicator: false,
        ActionExecute: 'X',
      };

      this._hospitallistService.physicianOrderSet(json).subscribe(
        (_success: any) => {
          //_success = JSON.parse(_success._body);

          //this.navModule('Not_Executed_Physician_Order');
          this.refreshModules();
          Swal.fire({
            title: 'Physician Order has been Executed',
            icon: 'success',
            confirmButtonText: 'OK',
            //preConfirm: () => {},
          });
        },
        (_error: any) => {
          Swal.fire({
            title: 'Something went wrong',
            icon: 'error',
            confirmButtonText: 'OK',
            //preConfirm: () => {},
          });
        }
      );
    } else {
      json = {
        PorderId: phyOrderData.PorderId,
        CancelIndicator: true,
        ActionExecute: '',
        CancelReason: this.cancelReasonValue,
      };
      if (this.cancelReasonValue == '') {
        this.errmsg = 'Select a Reason for Deletion';
      } else {
        this.modalRef.hide();
        this._hospitallistService.physicianOrderSet(json).subscribe(
          (_success: any) => {
            //_success = JSON.parse(_success._body);

            //this.navModule('Not_Executed_Physician_Order');
            this.refreshModules();
            Swal.fire({
              title: 'Physician Order has been Deleted',
              icon: 'success',
              confirmButtonText: 'OK',
              //preConfirm: () => {},
            });
          },
          (_error: any) => {
            Swal.fire({
              title: 'Something went wrong',
              icon: 'error',
              confirmButtonText: 'OK',
              //preConfirm: () => {},
            });
          }
        );
      }
    }
  }

  removePhysicianOrder(phyOrderDetails: any) {
      let jsonObj: any = {
        PorderId: phyOrderDetails.PorderId
      };
      this._hospitallistService.getCheckPDF(jsonObj).subscribe(
        (_success: any) => {
          if (_success) {
            this.modalRef.hide();
            this.reloadTableData.next('physicianOrder');
          }
        },
        (_error: any) => {}
      );  
  }

  cancelReasonList() {
    this._hospitallistService.cancelReasonList().subscribe(
      (_success: any) => {
        //_success = JSON.parse(_success._body);
        this.cancelReasonListData = _success.d.results;
      },
      (_error: any) => {}
    );
  }

  createPhysicianOrder() {
    if (this.items.controls[0].value.physicianOrder == '' && this.items.controls[1].value.physicianOrder == '' && this.items.controls[2].value.physicianOrder == '' && this.items.controls[3].value.physicianOrder == '') {
        this.showPhyOrderError = true;
      }
    else{
        this.items.controls.forEach(element => {
          if (element.value.physicianOrder != '') {
            var createTime = 'PT11H29M30S';
            if (element.value.orderTime.value) {
             createTime = this.phyOrderControls.orderTime.value.split(':')
            createTime = 'PT'+ createTime[0]+'H' + createTime[1] + 'M' + '00S'
            }
            let json ={};

            if (this.phyOrderData.Einri) {
               json = {
                "InstitutionId":this.phyOrderData.Einri,
                 "CaseId":this.phyOrderData.Falnr,
                "CreationDate" : element.value.orderDate.toISOString().split('.')[0],
                "CreationTime" : createTime,
                "ZphysOrder" : element.value.physicianOrder,
                "EmployeeResp" : this.phyOrderControls.physicianNumber.value,
                "ProfessionalGroup" : element.value.occupationalGroup,
              }
            } else {
               json = {
                "InstitutionId":this.phyOrderData.Institute,
                 "CaseId":this.phyOrderData.CaseNumber,
                "CreationDate" : element.value.orderDate.toISOString().split('.')[0],
                "CreationTime" : createTime,
                "ZphysOrder" : element.value.physicianOrder,
                "EmployeeResp" : this.phyOrderControls.physicianNumber.value,
                "ProfessionalGroup" : element.value.occupationalGroup,
              }
            }
            this._hospitallistService.createPhysicianOrder(json).subscribe(
              (_success: any) => {
                //_success = JSON.parse(_success._body);
                this.modalRef.hide();
                this.phyOrderform1.reset();
                //this.navModule(this.setModule)
                this.refreshModules();
              },
              (_error: any) => {}
            );
          }
         })
      }

}

occupationalGroupList() {
  this._hospitallistService.occupationalGroupList().subscribe(
    (_success: any) => {
      //_success = JSON.parse(_success._body);
      this.occupationalGroupData = _success.d.results;
      // this.phyOrderform1.controls.occupationalGroup.setValue(this.occupationalGroupData[2].Group);
      this.occupationalGroupData.forEach(element => {
        if (element.Group == 'DOCT') {
          this.progressEntryForm.controls.occupationalGroup.setValue(element.Group)
        }
        
      });
     
      this.currentTime = new Date().getHours() + ':' + new Date().getMinutes();
      this.addItem()
      this.addItem()
      this.addItem()
      this.addItem()
    },
    (_error: any) => {}
  );
}

  refreshModules() {
    this.reloadTableData.next('Not_Executed_Physician_Order');
  }
}
