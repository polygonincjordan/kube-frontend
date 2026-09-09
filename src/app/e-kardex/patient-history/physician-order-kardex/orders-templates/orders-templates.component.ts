import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AdmissionService } from '@services/admission/admission.service';
import { EEmrService } from '@services/e-emr.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { catchError, of } from 'rxjs';
import { StorageService } from '@services/storage.service';
import { ActivatedRoute } from '@angular/router';

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
  phyOrderform1: FormGroup;
  saveTemplateForm1: FormGroup;
  items: FormArray;
  currentTime: string;
  modalRef: BsModalRef;
  modalRefForImport: BsModalRef;
  modalRefUpdateName: BsModalRef;
  phyorderData: any[] = [];
  orderTemplateList: any[] = [];
  orderTemplateDataSetModal: any;
  newOrderTemplateList: any[] = [];
  phyorderDataParams: any;
  physicianNumber: any;
  getItemsValueMin: any[] = [];
  orderTemplateDetails: any;
  notAuthUpdateTemp: boolean = true;
  templateRefName: TemplateRef<any>;
  isHideTemplateUpdate: boolean = false;
  searchOrder:any;
  physicianOrderTextData: any;
  constructor(
    private formBuilder: FormBuilder,
    public modalService: BsModalService,
    private admissionService: AdmissionService,
    private _dataServices: EEmrService,
    private _storageService: StorageService,
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
    const template = this.admissionService.getTemplateSetDataSet();
    this.admissionService.templateSetData$
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
      class: 'modal-dialog-centered execute-delete-modal-kardex order-template-pop',
    };
    this.modalRefForImport = this.modalService.show(template, config);
  }

  deleteOrderTemplate() {
    this.admissionService
      .removeOrderTemplate(this.orderTemplateDetails.Templateid)
      .subscribe(
        (element) => {
          this.modalRefForImport.hide();
          this.getTemplate();
        },
        (error) => {
          
        }
      );
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
          class: 'modal-dialog-centered execute-delete-modal-kardex update-template-name',
        };
        this.modalRef = this.modalService.show(template, config);
      } else {
        this.admissionService.errorSwalModel('Please select occupation group');
        return;
      }
    } else {
      this.admissionService.errorSwalModel('Please add physician order text');
      return;
    }
  }

  reloadTable(event: any) {
    this.reloadPhyOrderList.next(true)
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
          CreationDate: element.value?.orderDate?.toISOString().split('.')[0],
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
          this.admissionService.successSwalModel('Physician Order(s) got created');
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
      this.admissionService.errorSwalModel('Please add physician order text');
    }
  }

  saveOrderTemplateData(template: TemplateRef<any>, updateTempName?: string) {
    this.templateRefName = template;
    if (!this.saveTemplateForm1.valid) {
      this.admissionService.errorSwalModel('Please add template name');
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

    // const res = this.admissionService.saveTemplateData(saveTemplateData);

    // this.admissionService.savetemplateSetData$
    //   .pipe(
    //     untilDestroyed(this),
    //     catchError((err) => {
    //       return of([]);
    //     })
    //   )
    //   .subscribe((data: any) => {
    //     this.notAuthUpdateTemp = true;
    //     if (data.Statuscode == '403') {
    //       console.log(data.Statuscode, '403');
    //       this.updatePopupShow(template);
    //     } else if (data.Statuscode === '201') {
    //       console.log(data.Statuscode, '201');
    //       this.modalService.hide();
    //       this.getTemplate();
    //       let orderLenght = this.ordertemplateBind.value.length;
    //       for (let index = 0; index <= orderLenght; index++) {
    //         this.ordertemplateBind.removeAt(0);
    //         if (index <= 4) {
    //           this.addItem();
    //         }
    //       }
    //       this.saveTemplateForm();
    //       this.admissionService.successSwalModel('Template Save Successfully');
    //     } else if (data.Statuscode === '200') {
    //       console.log(data.Statuscode, '200');
    //       let orderLenght = this.ordertemplateBind.value.length;
    //       for (let index = 0; index <= orderLenght; index++) {
    //         this.ordertemplateBind.removeAt(0);
    //         if (index <= 4) {
    //           this.addItem();
    //         }
    //       }
    //       this.modalService.hide();
    //       this.getTemplate();
    //       this.saveTemplateForm();
    //       this.admissionService.successSwalModel(
    //         'Template Updated Successfully'
    //       );
    //     } else if (data.Statuscode === '404') {
    //       console.log(data.Statuscode, '404');
    //       this.notAuthUpdateTemp = false;
    //       this.updatePopupShow(template);
    //     } else {

    //     }
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
    this.items.value.forEach((element: { ZphysOrder: string; }) => {
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

  bindFormArrayValue(items: { ProfGroup: any; ZphysOrder: any; }) {
    let item = this.formBuilder.group({
      orderDate: [new Date()],
      orderTime: [this.currentTime],
      ProfGroup: [items.ProfGroup],
      ZphysOrder: [items.ZphysOrder, [Validators.required]],
    });
    this.ordertemplateBind.push(item);
  }

  removeItem(index: number) {
    this.items.removeAt(index);
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
    if(this.newOrderTemplateList.length) this.newOrderTemplateList;
    else this.newOrderTemplateList = this.orderTemplateDataSetModal;
    this.bindDataToTemplate(this.newOrderTemplateList);
    this.newOrderTemplateList = [];
    this.modalRefForImport.hide();
  }
  searchOrderTemp(){
    this.orderTemplateList = this.orderTemplateList.filter(el => el.Templatetxt.toLowerCase().includes(this.searchOrder.toLowerCase()));
    if (this.searchOrder == '') {
      this.getTemplate();
    }
  }
  physicianOrderText() {
    this._dataServices.physicianOrderText().subscribe(
      (_success: any) => {
        this.physicianOrderTextData = _success.d.results;
      },
      (_error: any) => {}
    );
  }
  onAddClick(event: { label: any; },i:number) {
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
