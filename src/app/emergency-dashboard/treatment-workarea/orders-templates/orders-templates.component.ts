import {
  Component, EventEmitter, Input,
  OnInit, Output, TemplateRef
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AdmissionService } from '@services/admission/admission.service';
import { EEmrService } from '@services/e-emr.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { catchError, of } from 'rxjs';
import Swal from 'sweetalert2';

@UntilDestroy()
@Component({
  selector: 'app-orders-templates',
  templateUrl: './orders-templates.component.html',
  styleUrls: ['./orders-templates.component.scss'],
})
export class OrdersTemplatesComponent implements OnInit {
  occupationalGroupData: any;
  @Input() physicianOrderList: any;
  @Input() searchString: string;
  @Output() reloadPhyOrderList = new EventEmitter();
  modalRefUpdateName: BsModalRef;
  phyOrderform1: FormGroup;
  saveTemplateForm1: FormGroup;
  items: FormArray;
  currentTime: string;
  modalRef: BsModalRef;
  phyorderData: any[] = [];
  orderTemplateList: any[] = [];
  orderTemplateDataSetModal: any;
  newOrderTemplateList: any[] = [];
  phyorderDataParams: any;
  physicianNumber: any;
  orderTemplateDetails: any;
  notAuthUpdateTemp: boolean = true;
  templateRefName: TemplateRef<any>;
  isHideTemplateUpdate: boolean = false;
  getItemsValueMin: any[] = [];
  searchOrder: string;
  physicianOrderTextData: any;

  constructor(
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    public emergencyService: EmergencyService,
    private _dataServices: EEmrService,
    private _storageService: StorageService,
    private admissionService: AdmissionService,
    private route: ActivatedRoute
  ) {
    this.occupationalGroup();
    this.route.queryParams.subscribe((params) => {
      this.phyorderDataParams = params;
    });
    this.phyOrderform1 = this.formBuilder.group({
      items: new FormArray([]),
    });

    this.physicianNumber = this._storageService.getGpart();
  }

  ngOnInit(): void {
    this.saveTemplateForm();
    this.getTemplate();
    this.physicianOrderText();
  }

  getTemplate() {
    const template = this.emergencyService.getTemplateSetDataSet();
    this.emergencyService.templateSetData$
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any[]) => {
        this.orderTemplateList = data;
      });
  }

  saveTemplateForm() {
    this.saveTemplateForm1 = this.formBuilder.group({
      Templatetxt: ['', [Validators.required]],
      Templatelevel: ['2', [Validators.required]],
    });
  }
  physicianOrderText() {
    this._dataServices.physicianOrderText().subscribe(
      (_success: any) => {
        this.physicianOrderTextData = _success.d.results;
      },
      (_error: any) => { }
    );
  }

  occupationalGroupList() {
    this.currentTime = new Date().getHours() + ':' + new Date().getMinutes();
    this.addItem();
    this.addItem();
    this.addItem();
    this.addItem();
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
      ProfGroup: ['NURS'],
      ZphysOrder: ['', [Validators.required]],
    });
  }

  occupationalGroup() {
    this._dataServices.occupationalGroupList().subscribe(
      (_success: any) => {
        this.occupationalGroupData = _success.d.results;
        this.occupationalGroupList();
      },
      (_error: any) => {}
    );
  }

  public openModalForOrderTemplate(
    template: TemplateRef<any>,
    orderTemplate: any
  ) {
    this.orderTemplateDetails = orderTemplate;
    this.orderTemplateDataSetModal = orderTemplate.TemplateHeaderItem.results;
    const config: ModalOptions = {
      class: 'modal-dialog-centered execute-delete-modal order-template-pop',
    };
    this.modalRef = this.modalService.show(template, config);
  }

  showOrderTemplateModal(template: TemplateRef<any>, typeModal: any) {
    this.phyorderData = [];
    this.phyOrderform1.value.items.forEach((element: any) => {
      if (element.ZphysOrder) {
        this.phyorderData.push(element);
      }
    });

    if (this.phyorderData.length) {
      let findPhyOrder = this.phyorderData.find((res) => {
        if (!res.ProfGroup) {
          return res;
        }
      });

      if (findPhyOrder === undefined) {
        const config: ModalOptions = {
          class: 'modal-dialog-centered execute-delete-modal save-template-pop',
        };
        this.modalRef = this.modalService.show(template, config);
      } else {
        Swal.fire({
          title: 'Please select Occupation Group',
          icon: 'error',
          confirmButtonText: 'OK',
          customClass: { popup: 'swal-class' },
        });
        return;
      }
    } else {
      Swal.fire({
        title: 'Please add Physician order text',
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: { popup: 'swal-class' },
      });
      return;
    }
  }

  get phyOrderControls() {
    return this.phyOrderform1.controls;
  }

  createPhysicianOrder() {
    let onlyFieldData: any[] = [];
    this.items.controls.forEach((element, index) => {
      if (element.value.ZphysOrder != '') {
        var createTime = 'PT11H29M30S';
        if (element.value.orderTime) {
          createTime = element.value.orderTime.split(':');
          createTime = 'PT' + createTime[0] + 'H' + createTime[1] + 'M' + '00S';
        }
        let json = {
          InstitutionId: this.phyorderDataParams.einri,
          CaseId: this.phyorderDataParams.falnr,
          CreationDate: element.value.orderDate.toISOString().split('.')[0],
          CreationTime: createTime,
          ZphysOrder: element.value.ZphysOrder,
          EmployeeResp: this.physicianNumber,
          ProfessionalGroup: element.value.ProfGroup,
        };
        onlyFieldData.push(json);
      }
    });

    let jsonPhyOrder = {
      PorderId: '',
      ToPhyOrder: {
        results: onlyFieldData,
      },
    };

    if (onlyFieldData.length) {
      this._dataServices.createMultiplePhysicianOrder(jsonPhyOrder).subscribe(
        (_success: any) => {
          this.reloadPhyOrderList.next(true);
          Swal.fire({
            title: 'Physician orders is created successfully',
            icon: 'success',
            confirmButtonText: 'OK',
            customClass: { popup: 'swal-class' },
          });
          let orderLenght = this.ordertemplateBind.value.length;
          for (let index = 0; index <= orderLenght; index++) {
            this.ordertemplateBind.removeAt(0);
            if (index <= 4) {
              this.addItem();
            }
          }
        },
        (_error: any) => {}
      );
    } else {
      Swal.fire({
        title: 'Please add Physician order text',
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: { popup: 'swal-class' },
      });
    }
  }

  saveOrderTemplateData(template: TemplateRef<any>, updateTempName?) {
    this.templateRefName = template;
    if (!this.saveTemplateForm1.valid) {
      Swal.fire({
        title: 'Please add template name',
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: { popup: 'swal-class' },
      });
      return;
    }

    this.phyorderData.forEach((v) => {
      delete v.orderDate;
      delete v.orderTime;
    });

    let orderTemplateData = this.saveTemplateForm1.value;

    let saveTemplateData: any = {
      Templatetxt: orderTemplateData.Templatetxt,
      Templatelevel: orderTemplateData.Templatelevel,
      TemplateHeaderItem: {
        results: this.phyorderData,
      },
    };
    if (updateTempName == 'updateTempName') {
      saveTemplateData.Overwrite = true;
    }

    this.admissionService.saveTemplate(saveTemplateData).subscribe(
      (data: any) => {
        this.notAuthUpdateTemp = true;
        this.saveTemplateResponse(data, template);
      },
      (_error: any) => {}
    );

    // const res = this.emergencyService.saveTemplateData(saveTemplateData);

    // this.emergencyService.savetemplateSetData$
    //   .pipe(
    //     untilDestroyed(this),
    //     catchError((err) => {
    //       return of([]);
    //     })
    //   )
    //   .subscribe((data: any[]) => {
    //     this.modalService.hide();
    //     this.getTemplate();
    //     let orderLenght = this.ordertemplateBind.value.length;
    //     for (let index = 0; index <= orderLenght; index++) {
    //       this.ordertemplateBind.removeAt(0);
    //       if (index <= 4) {
    //         this.addItem();
    //       }
    //     }
    //     Swal.fire({
    //       title: 'Template Save Successfully',
    //       icon: 'success',
    //       confirmButtonText: 'OK',
    //       customClass: { popup: 'swal-class' },
    //     });
    //   });
  }

  saveTemplateResponse(data: any, template: any) {
    if (data?.d.Statuscode == '403') {
      this.updatePopupShow(template);
      this.isHideTemplateUpdate = true;
    } else if (data?.d.Statuscode === '201') {
      this.modalService.hide();
      this.getTemplate();
      let orderLenght = this.ordertemplateBind.value.length;
      for (let index = 0; index <= orderLenght; index++) {
        this.ordertemplateBind.removeAt(0);
        if (index <= 4) {
          this.addItem();
        }
      }
      this.saveTemplateForm();
      this.isHideTemplateUpdate = false;
      this.admissionService.successSwalModel('Template save successfully');
    } else if (data?.d.Statuscode === '200') {
      let orderLenght = this.ordertemplateBind.value.length;
      for (let index = 0; index <= orderLenght; index++) {
        this.ordertemplateBind.removeAt(0);
        if (index <= 4) {
          this.addItem();
        }
      }
      this.modalService.hide();
      this.getTemplate();
      this.isHideTemplateUpdate = false;
      this.saveTemplateForm();
      this.admissionService.successSwalModel('Template is updated successfully');
    } else if (data?.d.Statuscode === '404') {
      this.notAuthUpdateTemp = false;
      this.updatePopupShow(template);
      this.isHideTemplateUpdate = true;
    } else {
    }
  }

  updateExsitingTempName() {
    this.saveOrderTemplateData(this.templateRefName, 'updateTempName');
  }

  updatePopupShow(template: TemplateRef<any>) {
    const config: ModalOptions = {
      class: 'modal-dialog-centered',
    };
    this.modalRefUpdateName = this.modalService.show(template, config);

  }

  bindDataToTemplate(orderTemp: any) {
    this.getItemsValueMin = [];
    this.items.value.forEach((element) => {
      if (element.ZphysOrder != '') {
        this.getItemsValueMin.push(element);
      }
    });

    if (this.getItemsValueMin.length) {
      this.getItemsValueMin = [...this.getItemsValueMin, ...orderTemp];
    } else {
      this.getItemsValueMin = orderTemp;
    }

    let checkLenght = this.getItemsValueMin.length - this.items.value.length;
    for (let index = 0; index < checkLenght; index++) {
      this.addItem();
    }

    this.getItemsValueMin.forEach((element, index) => {
      let controlArray = <FormArray>this.phyOrderform1.controls['items'];
      controlArray.controls[index].patchValue(element);
    });
  }

  get ordertemplateBind() {
    return this.phyOrderform1.controls['items'] as FormArray;
  }

  bindFormArrayValue(items) {
    let item = this.formBuilder.group({
      orderDate: [new Date()],
      orderTime: [this.currentTime],
      ProfGroup: [items.ProfGroup],
      ZphysOrder: [items.ZphysOrder, [Validators.required]],
    });
    this.ordertemplateBind.push(item);
  }

  removeItem(index) {
    this.items.removeAt(index);
    // this.getItemsValueMin.splice(index, 1);

    // this.orderTemplateList = this.orderTemplateList;
  }

  addRemoveOrder(order: any) {
    if (this.newOrderTemplateList.length) {
      let obj = this.newOrderTemplateList.find((o) => o.Seqno === order.Seqno);
      if (obj) {
        this.newOrderTemplateList.splice(
          this.newOrderTemplateList.findIndex(
            (item) => item.Seqno === order.Seqno
          ),
          1
        );
      } else {
        this.newOrderTemplateList.push(order);
      }
    } else {
      this.newOrderTemplateList.push(order);
    }
  }

  saveBtnOnModal() {
    this.bindDataToTemplate(this.newOrderTemplateList);
    this.newOrderTemplateList = [];
    this.modalService.hide();
  }
  reloadTable(event) {
    this.reloadPhyOrderList.next(true);
  }
  searchOrderTemp(){
    this.orderTemplateList = this.orderTemplateList.filter(el => el.Templatetxt.toLowerCase().includes(this.searchOrder.toLowerCase()));
    if (this.searchOrder == '') {
      this.getTemplate();
    }
  }

  deleteOrderTemplate() {
    this.admissionService
      .removeOrderTemplate(this.orderTemplateDetails.Templateid)
      .subscribe(
        (element) => {
          this.modalRef.hide();
          this.getTemplate();
        },
        (error) => {
          
        }
      );
  }
  onAddClick(event: { label: any; }, i: number) {
    if (typeof event == "object") {
      let controls = this.items.controls[i] as FormGroup;
      controls.controls["ZphysOrder"].setValue(event.label);
    }
  }
  onAddInput(event: any, i: number) {
    if (typeof event == "object") {
      let controls = this.items.controls[i] as FormGroup;
      controls.controls["ZphysOrder"].setValue(event.target.value);
    }
  }
}
