import { Component, OnInit, Input, TemplateRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { AdmissionService } from '@services/admission/admission.service';
import { EEmrService } from '@services/e-emr.service';
import { OrdersDashboardService } from '@services/orders-dashboard/orders-dashboard.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { EMPTY, Subject, catchError, debounceTime, of } from 'rxjs';
import { DatePipe } from '@angular/common';
@UntilDestroy()
@Component({
  selector: 'app-consultation-order',
  templateUrl: './consultation-order.component.html',
  styleUrls: ['./consultation-order.component.scss'],
})
export class ConsultationOrderComponent implements OnInit {
  consultationForm: FormGroup;
  consultationFormArray: FormArray;
  surgeryFormArray: FormArray;
  public searchTerm = new Subject<string>();
  public searchTermTreatmentOU = new Subject<string>();
  public searchTermTreatmentDOU = new Subject<string>();
  public searchTermDepartmentOU = new Subject<string>();
  serviceTextList: any;
  treatmentOUList: any;
  departmentOUList: any;
  assignUsersList: any;
  selectFavList = [];
  minDate = new Date();
  paramsObj: any = {};
  myFavArr = [];
  modalRefForFav: BsModalRef;
  constructor(
    private formBulider: FormBuilder,
    private orderDashboardService: OrdersDashboardService,
    private route: ActivatedRoute,
    public modalService: BsModalService,
    private datePipe: DatePipe
  ) {
    this.route.queryParams.subscribe((params) => {
      this.paramsObj = params;
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.addFormArray();
    this.subscribeSearchEvent();
    this.searchEventForDepartmentOU();
    this.searchEventForTreatmentOU();
    this.searchEventForTreatmentDOU();
    this.getAssignUsersList();
  }

  initForm() {
    this.consultationForm = this.formBulider.group({
      consultationFormArray: new FormArray([]),
    });
  }
  closeFavModal() {
    this.myFavArr = [];
    this.modalRefForFav.hide();
  }
  openFavList(template: TemplateRef<any>) {
    const config: ModalOptions = {
      class: 'modal-dialog fav-modal',
    };
    this.modalRefForFav = this.modalService.show(template, config);
    const payload = {
      Einri: '',
      Tarif: '',
      Talst: '',
      Trtoe: '',
      Trtgp: '',
      ServiceText: '',
      TrtoeText: '',
      TrtgpName: '',
      Delete: false,
    };
    this.orderDashboardService.getFavoriteListeOrder(payload).subscribe({
      next: (resp: any) => {
        this.myFavArr = resp?.d?.results;
      },
    });
  }
  opneclick(item, index) {
    const payload = {
      Talst: item.value.Talst,
      Trtoe: item.value.Trtoe,
      Trtgp: item.value.Trtgp,
      ServiceText: item.value.ServiceText,
      TrtoeText: item.value.TrtoeText,
      TrtgpName: item.value.SurgeonName,
      Delete: false,
    };

    this.orderDashboardService.getFavoriteListeOrderSave(payload).subscribe({
      next: (resp: any) => {
        this.myFavArr = resp?.d?.results;
        this.consultationForm.get('consultationFormArray')['controls'][index].Favorite = !this.consultationForm.get('consultationFormArray')['controls'][index].Favorite
      },
    });
  }
  updateFavoriteFromModal(item, index) {
    const payload = {
      "Trtgp": item.Trtgp,
      "TrtgpName": item.TrtgpName,
      "Talst": item.Talst,
      "Trtoe": item.Trtoe,
      "ServiceText": item.ServiceText,
      "TrtoeText": item.TrtoeText,
      "Delete": true,
    };
    this.orderDashboardService
      .getFavoriteListeOrderSave(payload)
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any) => {
        this.orderDashboardService
          .getFavoriteListeOrder()
          .subscribe({
            next: (resp: any) => {
              this.myFavArr = resp?.d?.results;
            },
          });
      });
  }
  importFavInForm() {
    this.selectFavList.forEach((element, indexValue) => {
      if (
        !(
          this.consultationFormArray != undefined &&
          this.consultationFormArray.value.length == 1 &&
          (this.consultationFormArray.value[0].ServiceText == '' ||
            this.consultationFormArray.value[0].ServiceText == undefined)
        )
      ) {
        this.addFormArray(element);
      }
      let index = this.consultationFormArray.value.length - 1;
      this.onSelectService(element, index);
      this.consultationFormArray.controls[index].patchValue({
        Trtgp: element.Trtgp,
        SurgeonName: element.TrtgpName,
        Talst: element.Talst,
        Trtoe: element.Trtoe,
        ServiceText: element.ServiceText,
        TrtoeText: element.TrtoeText,
      });
    });
    this.modalRefForFav.hide();
    this.selectFavList = [];
  }
  selectOrderFromFav(item, i) {
    if (this.selectFavList.length) {
      let obj = this.selectFavList.find((o) => o.Talst === item.Talst);
      if (obj) {
        this.selectFavList.splice(
          this.selectFavList.findIndex((el) => el.Talst === item.Talst),
          1
        );
      } else {
        this.selectFavList.push(item);
      }
    } else {
      this.selectFavList.push(item);
    }
  }
  addFormArray(data?) {
    this.consultationFormArray = this.consultationForm.get(
      'consultationFormArray'
    ) as FormArray;
    this.consultationFormArray.push(this.createConsultationFormRecords(data));
    this.onSelectService(
      { Talst: 'CNIN00001', Ktext: 'Consultation Inpatient' },
      this.consultationFormArray.length - 1
    );
  }

  createConsultationFormRecords(data): FormGroup {
    let date = new Date();
    return this.formBulider.group({
      Patnr: [this.paramsObj.patnr],
      Talst: [data?.Talst ? data?.Talst : ''],
      Trtoe: [data?.Trtoe ? data?.Trtoe : '', [Validators.required]],
      Orgfa: [data?.Orgfa ? data?.Orgfa : '', [Validators.required]],
      Trtgp: [data?.Trtgp ? data?.Trtgp : '', [Validators.required]],
      Anerf: [false],
      AddInfo: [''],
      Wbgdt: [date, [Validators.required]],
      Wbgzt: [
        this.datePipe.transform(Date.now(), 'hh:mm'),
        [Validators.required],
      ],
      PatientName: [''],
      ServiceText: [
        data?.ServiceText ? data?.ServiceText : '',
        [Validators.required],
      ],
      TrtoeText: [
        data?.TrtoeText ? data?.TrtoeText : '',
        [Validators.required],
      ],
      OrgfaText: [data?.OrgfaText ? data?.OrgfaText : ''],
      SurgeonName: [data?.TrtgpName ? data?.TrtgpName : ''],
    });
  }

  subscribeSearchEvent() {
    this.searchTerm.pipe(debounceTime(2000)).subscribe((term) => {
      if (term !== '' && term !== null && term.length >= 3) {
        this.orderDashboardService.getServiceTextWithDistinctList('07', term).subscribe({
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

  searchEventForTreatmentDOU() {
    this.searchTermTreatmentDOU.pipe(debounceTime(2000)).subscribe((term) => {
      if (term !== '' && term !== null && term.length >= 3) {
        this.orderDashboardService.getTreatmentDOUList('01', term).subscribe({
          next: (resp: any) => {
            this.treatmentOUList = resp?.d?.results;
          },
        });
      }
    });
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
      this.consultationFormArray.controls[index].patchValue({
        Talst: value.Talst,
        ServiceText: value.Ktext,
      });
    } else {
      this.consultationFormArray.controls[index].patchValue({
        Talst: '',
        ServiceText: '',
      });
    }
  }

  onSelectTreatmentOU(value, index) {
    if (value) {
      this.consultationFormArray.controls[index].patchValue({
        Trtoe: value.Orgid,
        TrtoeText: value.Orgna,
      });
    } else {
      this.consultationFormArray.controls[index].patchValue({
        Trtoe: '',
        TrtoeText: '',
      });
    }
  }

  onSelectTreatmentDOU(value, index) {
    if (value) {
      this.consultationFormArray.controls[index].patchValue({
        Trtoe: value.Orgid,
        TrtoeText: value.Orgna,
      });
      this.getDepartmentOU(value.Deptou, index);
    } else {
      this.consultationFormArray.controls[index].patchValue({
        Trtoe: '',
        TrtoeText: '',
      });
    }
  }

  onSelectDepartmentOU(value, index) {
    if (value) {
      this.consultationFormArray.controls[index].patchValue({
        Orgfa: value.Orgid,
        OrgfaText: value.Orgna,
      });
    } else {
      this.consultationFormArray.controls[index].patchValue({
        Orgfa: '',
        OrgfaText: '',
      });
    }
  }

  onSelectSurgeon(value, index) {
    if (value) {
      this.consultationFormArray.controls[index].patchValue({
        Trtgp: value.Gpart,
        SurgeonName: value.NamString,
      });
    } else {
      this.consultationFormArray.controls[index].patchValue({
        Trtgp: '',
        SurgeonName: '',
      });
    }
  }

  removeConsultation(index) {
    this.consultationFormArray.removeAt(index);
  }

  saveConsultionData() {
    const inValidSurgeryForms = this.consultationFormArray.controls.filter(
      (d) => !d.valid
    );
    if (inValidSurgeryForms.length) {
      this.orderDashboardService.showErrorPopup(
        '',
        'Please provide all require data.',
        'Error'
      );
      this.consultationForm.markAllAsTouched();
      return;
    }

    this.consultationForm.value.consultationFormArray.forEach(
      (element: any) => {
        if (
          typeof element.Wbgdt === 'object' &&
          element.Wbgdt !== null &&
          'toISOString' in element.Wbgdt
        ) {
          element.Wbgdt = element.Wbgdt.toISOString().split('.')[0];
        }
        let createTime = element.Wbgzt.split(':');
        let checkCreatTime = element.Wbgzt.slice(0, 2);
        if (checkCreatTime != 'PT') {
          element.Wbgzt =
            'PT' + createTime[0] + 'H' + createTime[1] + 'M' + '00S';
        }

        delete element.SurgeonName;
        delete element.ServiceText;
        delete element.TrtoeText;
      }
    );

    let payload = {
      Einri: this.paramsObj.einri,
      Falnr: this.paramsObj.falnr,
      Lfdnr: this.paramsObj.lfdnr,
      Consultation: true,
      ToOrders: {
        results: this.consultationForm.value.consultationFormArray,
      },
    };

    this.orderDashboardService
      .saveConsultationOrder(payload)
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          const errorMessage = err?.error?.error?.innererror?.errordetails?.[0]?.message || 'An error occurred';
          this.orderDashboardService.showErrorPopup('', errorMessage, 'Error');
          return EMPTY;
        })
      )
      .subscribe((data: any) => {
        if (data && data.length != 0) {
          this.initForm();
          this.addFormArray();
          this.orderDashboardService.showSuccessPopup(
            '',
            'Consultation order is successfully created',
            'Success'
          );
        }
      });
  }

  getDepartmentOU(deptou, index) {
    this.orderDashboardService.getDepartmentOUList('01', deptou).subscribe({
      next: (resp: any) => {
        this.onSelectDepartmentOU(resp?.d?.results[0], index);
      },
    });
  }
}
