import { Component, OnInit, Input, TemplateRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { AdmissionService } from '@services/admission/admission.service';
import { EEmrService } from '@services/e-emr.service';
import { OrdersDashboardService } from '@services/orders-dashboard/orders-dashboard.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { EMPTY, Subject, catchError, debounceTime, of } from 'rxjs';
@UntilDestroy()
@Component({
  selector: 'app-admission-e-order',
  templateUrl: './admission-e-order.component.html',
  styleUrls: ['./admission-e-order.component.scss']
})
export class AdmissionEOrderComponent implements OnInit {
  @Input() searchString: string;
  consultationForm: FormGroup;
  consultationFormArray: FormArray;
  templateForm: FormGroup;
  phyOrderform: FormGroup;
  items: FormArray;

  modalRef: BsModalRef;


  public searchTerm = new Subject<string>();
  public searchTermTreatmentOU = new Subject<string>();
  public searchTermDepartmentOU = new Subject<string>();
  serviceTextList: any;
  treatmentOUList: any;
  departmentOUList: any;
  assignUsersList: any;
  minDate = new Date();
  orderTemplateList: any[] = [];
  newOrderTemplateList: any[] = [];

  isFormSubmitted: boolean = false;
  paramsObj: any = {};
  currentTime: string;
  occupationalGroupData: any;
  getItemsValueMin: any[];
  orderTemplateDetails: any;
  orderTemplateDataSetModal: any;
  term= "admission";
  term1="card";
  constructor(
    private formBulider: FormBuilder,
    private orderDashboardService: OrdersDashboardService,
    private admissionService: AdmissionService,
    private route: ActivatedRoute,
    private _dataServices: EEmrService,
    public modalService: BsModalService,
  ) {
    this.route.queryParams.subscribe((params) => {
      this.paramsObj = params;
    });
    this.admissionForm();
  }

  admissionForm() {
    this.phyOrderform = this.formBulider.group({
      Patnr: [this.paramsObj.patnr],
      Trtoe: ['', [Validators.required]],
      TrtoeText: [''],
      Orgfa: ['', [Validators.required]],
      OrgfaText: [''],
      Wbgdt: ['', [Validators.required]],
      Wbgzt: ['', [Validators.required]],
      Trtgp: [''],
      SurgeonName: [''],
      items: new FormArray([]),
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.addFormArray();
    this.subscribeSearchEvent();
    this.searchEventForDepartmentOU();
    this.searchEventForDepartmentOU1(this.term1)
    this.searchEventForTreatmentOU();
    this.searchEventForTreatmentOU1(this.term);
    this.getAssignUsersList();
    this.getTemplate();
    this.occupationalGroup();
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

  initForm() {
    this.consultationForm = this.formBulider.group({
      consultationFormArray: new FormArray([]),
    });
  }

  addFormArray() {
    this.consultationFormArray = this.consultationForm.get(
      'consultationFormArray'
    ) as FormArray;
    this.consultationFormArray.push(this.createConsultationFormRecords());
  }

  createConsultationFormRecords(): FormGroup {
    return this.formBulider.group({
      Einri: [''],
      Falnr: [''],
      Lfdnr: [''],
      Patnr: [this.paramsObj.patnr],
      Talst: [''],
      Trtoe: ['', [Validators.required]],
      Orgfa: ['', [Validators.required]],
      Surgeon: ['', [Validators.required]],
      Anerf: [false],
      AddInfo: [''],
      Wbgdt: [null, [Validators.required]],
      Wbgzt: ['', [Validators.required]],
      PatientName: [''],
      ServiceText: ['', [Validators.required]],
      TrtoeText: ['', [Validators.required]],
      OrgfaText: [''],
      SurgeonName: [''],
    });
  }

  subscribeSearchEvent() {
    this.searchTerm.pipe(debounceTime(2000)).subscribe((term) => {
      if (term !== '' && term !== null && term.length >= 3) {
        this.orderDashboardService.getServiceTextList('07', term).subscribe({
          next: (resp: any) => {
            this.serviceTextList = resp?.d?.results;
          },
        });
      }
    });
  }

  searchEventForTreatmentOU() {
    this.searchTermTreatmentOU.pipe(debounceTime(2000)).subscribe((term) => {
      if (term !== '' && term !== null && term.length >= 3) {
        this.orderDashboardService.getTreatmentOUList('01', term).subscribe({
          next: (resp: any) => {
            this.treatmentOUList = resp?.d?.results;
          },
        });
      }
    });
  }
  searchEventForTreatmentOU1(term:any) {
    this.orderDashboardService.getTreatmentOUList('01', term).subscribe(
      (resp: any) => {
        this.treatmentOUList = resp?.d?.results;
        this.phyOrderform.patchValue({
          Trtoe: this.treatmentOUList[0].Orgid,
          TrtoeText: this.treatmentOUList[0].Orgna,
        });
      },
      (_error: any) => {}
    );
  }


  searchEventForDepartmentOU() {
    this.searchTermDepartmentOU.pipe(debounceTime(2000)).subscribe((term) => {
      if (term !== '' && term !== null && term.length >= 3) {
        this.orderDashboardService.getDepartmentOUList('01', term).subscribe({
          next: (resp: any) => {
            this.departmentOUList = resp?.d?.results;
          },
        });
      }
    });
  }
  searchEventForDepartmentOU1(term1:any) {
    this.orderDashboardService.getDepartmentOUList('01', term1).subscribe(
      (resp: any) => {
        this.departmentOUList = resp?.d?.results;
        this.phyOrderform.patchValue({
          Orgfa: this.departmentOUList[0].Orgid,
          OrgfaText: this.departmentOUList[0].Orgna,
        });
      },
      (_error: any) => {}
    );
  }

  getAssignUsersList() {
    this.orderDashboardService
      .getAssignUsersData()
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any) => {
        this.assignUsersList = data?.d?.results;
      });
  }

  onSelectService(value, index) {
    if (value) {
      this.phyOrderform.controls[index].patchValue({
        Talst: value.Talst,
        ServiceText: value.Ktext,
      });
    } else {
      this.phyOrderform.controls[index].patchValue({
        Talst: '',
        ServiceText: '',
      });
    }
  }

  onSelectTreatmentOU(value, index) {
    if (value) {
      this.phyOrderform.patchValue({
        Trtoe: value.Orgid,
        TrtoeText: value.Orgna,
      });
    } else {
      this.phyOrderform.patchValue({
        Trtoe: '',
        TrtoeText: '',
      });
    }
  }

  onSelectDepartmentOU(value, index) {
    if (value) {
      this.phyOrderform.patchValue({
        Orgfa: value.Orgid,
        OrgfaText: value.Orgna,
      });
    } else {
      this.phyOrderform.patchValue({
        Orgfa: '',
        OrgfaText: '',
      });
    }
  }

  onSelectSurgeon(value, index) {
    if (value) {
      this.phyOrderform.patchValue({
        Trtgp: value.Gpart,
        SurgeonName: value.NamString,
      });
    } else {
      this.phyOrderform.patchValue({
        Trtgp: '',
        SurgeonName: '',
      });
    }
  }

  removeConsultation(index) {
    this.consultationFormArray.removeAt(index);
  }

  bindDataToTemplate(orderTemp: any) {
    this.getItemsValueMin = [];
    this.items.value.forEach((element) => {
      if (element.OrderShortText != '') {
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
      let controlArray = <FormArray>this.phyOrderform.controls['items'];
      controlArray.controls[index].patchValue({
        OrderShortText: element.OrderShortText ? element.OrderShortText : element.ZphysOrder,
        ProfessionalGroup: element.ProfessionalGroup ? element.ProfessionalGroup : element.ProfGroupText,
      });
    });
  }

  public openModalForOrderTemplate(
    template: TemplateRef<any>,
    orderTemplate: any
  ) {
    console.log(orderTemplate, "orderTemplate");
    this.orderTemplateDetails = orderTemplate;
    this.orderTemplateDataSetModal = orderTemplate.TemplateHeaderItem.results;
    const config: ModalOptions = {
      class: 'modal-dialog-centered execute-delete-modal order-template-pop',
    };
    this.modalRef = this.modalService.show(template, config);
  }

  saveTemplateForm() {
    this.templateForm = this.formBulider.group({
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
    this.items = this.phyOrderform.get('items') as FormArray;
    this.items.push(this.createNewOrder());
  }

  createNewOrder(): FormGroup {
    this.currentTime = new Date().getHours() + ':' + new Date().getMinutes();
    return this.formBulider.group({
      orderDate: [new Date()],
      orderTime: [this.currentTime],
      ProfessionalGroup: ['NURS'],
      OrderShortText: [''],
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

  saveBtnOnModal() {
    if(this.newOrderTemplateList.length) this.newOrderTemplateList;
    else this.newOrderTemplateList = this.orderTemplateDataSetModal;
    this.bindDataToTemplate(this.newOrderTemplateList);
    this.newOrderTemplateList = [];
    this.modalService.hide();
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

  removeItem(index) {
    this.items.removeAt(index);
  }

  saveAdmissionOrderData() {
    if (this.phyOrderform.invalid) {
      this.orderDashboardService.showErrorPopup('', 'Please fill all required fields', 'Error');
      this.phyOrderform.markAllAsTouched();
      return; 
    }

    let physicianList: any = []
    if (
      typeof this.phyOrderform.value.Wbgdt === 'object' &&
      this.phyOrderform.value.Wbgdt !== null &&
      'toISOString' in this.phyOrderform.value.Wbgdt
    ) {
      this.phyOrderform.value.Wbgdt = this.phyOrderform.value.Wbgdt.toISOString().split('.')[0];
    }
    if(this.phyOrderform.value.Wbgzt) {
    let createTime = this.phyOrderform.value.Wbgzt.split(':');
    let checkCreatTime = this.phyOrderform.value.Wbgzt.slice(0, 2);
      if (checkCreatTime != 'PT') {
        this.phyOrderform.value.Wbgzt =
          'PT' + createTime[0] + 'H' + createTime[1] + 'M' + '00S';
      }
    } else {
      this.phyOrderform.value.Wbgzt = "";
    }
    this.phyOrderform.value.items.forEach((element: any)=>{
      if (element.OrderShortText) {
        delete element.orderDate;
        delete element.orderTime;
        delete element.orderTime;
        delete element.orderTime;
        delete element.orderTime;

        physicianList.push(element)
      }
    })
    let payload: any = {
      Patnr: this.phyOrderform.value.Patnr,
      Trtoe: this.phyOrderform.value.Trtoe,
      Orgfa: this.phyOrderform.value.Orgfa,
      Trtgp: this.phyOrderform.value.Trtgp,
      Wbgdt: this.phyOrderform.value.Wbgdt,
      Wbgzt: this.phyOrderform.value.Wbgzt,
      ToPhyOrd: { results: physicianList },
    };

    this.orderDashboardService
    .saveAdmissionOrder(payload)
    .pipe(
      untilDestroyed(this),
      catchError((err) => {
        const errorMessage = err?.error?.error?.innererror?.errordetails?.[0]?.message || err?.error?.error?.message?.value || 'An error occurred';
        this.orderDashboardService.showErrorPopup('', errorMessage, 'Error');
        return EMPTY;
      })
    )
    .subscribe((data: any) => {
      if (data && data.length != 0) {
        this.admissionForm();
        this.occupationalGroup();
        this.orderDashboardService.showSuccessPopup(
          '',
          'Admission order is successfully created',
          'Success'
        );
      }
    });

  }
}
