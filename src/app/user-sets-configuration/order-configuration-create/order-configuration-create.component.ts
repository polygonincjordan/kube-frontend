import { Component, OnInit, TemplateRef } from '@angular/core';
import { OrdersDashboardService } from '@services/orders-dashboard/orders-dashboard.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subject, catchError, debounceTime, of } from 'rxjs';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdmissionService } from '@services/admission/admission.service';
import * as _ from 'lodash';
import {
  AssignUserModal,
  DefaultValueModal,
  DiagnosisModal,
  PatientAgeModal,
} from '@services/orders-dashboard/interfaces/orders-dashboard-model';
import Swal from 'sweetalert2';
@UntilDestroy()
@Component({
  selector: 'app-order-configuration-create',
  templateUrl: './order-configuration-create.component.html',
  styleUrls: ['./order-configuration-create.component.scss'],
})
export class OrderConfigurationCreateComponent implements OnInit {
  public searchCodeTypeHead = new Subject<string>();

  modalRefForAssignUsers: BsModalRef;
  modalRefForDiagnosis: BsModalRef;
  modalRefForConformation: BsModalRef;

  orderConfigurationForm: FormGroup;
  subTitleFormList: FormArray;
  subTitleForm: FormGroup;

  isHiddenDiagnosisModal: boolean = false;
  isHiddenAssignModal: boolean = false;
  isParamsIdAvai: boolean = false;
  isCloneIdAvai: boolean = false;
  isExpanded: boolean = false;

  selectedSubTitleIndex: any = 0;
  seachAssignUsersData: string;
  specialtyDeptList: any;
  getOrderFavData: any;
  paramsObj: any;
  paramsId: any;

  patientAgeList: PatientAgeModal[] = [];
  assignUsersList: AssignUserModal[] = [];
  assignedUsersList: any = [];
  diagnosisSearchList: DiagnosisModal[] = [];
  assignDiagnosisList: any = [];
  assignedDiagnosisList: any = [];
  patientGenderList: DefaultValueModal[] = [
    {
      value: '0',
      label: 'All',
    },
    {
      value: '1',
      label: 'Male',
    },
    {
      value: '2',
      label: 'Female',
    },
  ];
  patientCaseList: DefaultValueModal[] = [
    {
      value: '0',
      label: 'All',
    },
    {
      value: '1',
      label: 'Inpatient',
    },
    {
      value: '2',
      label: 'Outpatient',
    },
    {
      value: '3',
      label: 'Day Patient',
    },
  ];
  setStatus: DefaultValueModal[] = [
    {
      label: 'Draft',
      value: '01',
    },
    {
      label: 'In Review',
      value: '02',
    },
  ];
  setLevelList: DefaultValueModal[] = [
    {
      label: 'General',
      value: '1',
    },
    {
      label: 'User',
      value: '2',
    },
  ];
  selectedSubTitleData: any;
  selectedSubTitleDetails: any;

  constructor(
    private _ordersDashboardService: OrdersDashboardService,
    private _admissionService: AdmissionService,
    public modalService: BsModalService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    public router: Router
  ) {
    this.route.queryParams.subscribe((params) => {
      if (params.id) {
        this.paramsId = params.id;
        this.isParamsIdAvai = true;
      }

      if (params.cloneId) {
        this.paramsId = params.cloneId;
        this.isCloneIdAvai = true;
      }
    });
  }

  ngOnInit(): void {
    this.getAssignUsersList();
    this.getPatientAgeList();
    this.getSpecialityList();
    this.initForm();
    this.diagnosisCodeList();
    this.initSubTitleForm();
  }

  initForm() {
    this.orderConfigurationForm = this.formBuilder.group({
      Id: [''],
      Name: [, [Validators.required]],
      Description: ['All', [Validators.required]],
      DeptOu: [,],
      PatientType: ['0', [Validators.required]],
      Gender: ['0', [Validators.required]],
      AgeFrom: [],
      AgeTo: [],
      Uom: [],
      ValidDays: [''],
      AccessLevel: ['1'],
      Status: ['2'],
      StatusApr: ['01'],
      Update: [false],
      ToAccess: [{ results: new FormArray([]) }],
      ToDiag: [{ results: new FormArray([]) }],
    });
  }

  initSubTitleForm() {
    this.subTitleForm = this.formBuilder.group({
      subTitleFormList: new FormArray([]),
    });
  }

  addSubTitleInForm() {
    let seqValue: any = 1;
    this.subTitleFormList = this.subTitleForm.get(
      'subTitleFormList'
    ) as FormArray;
    let ids = this.subTitleFormList.value.map((object) => {
      if(!object.Delete) return object.Seqno;
    });

    ids = ids.filter(Boolean);

    if (ids.length) {
      let max = Math.max(...ids);
      seqValue = max;
      if (this.subTitleFormList.value.length) {
        seqValue = seqValue + 1;
      }
    }
    seqValue = seqValue.toString();
    this.addRow(seqValue);
  }

  addRow(seqValue) {
    (this.subTitleForm.get('subTitleFormList') as FormArray).push(
      this.formBuilder.group({
        Id: [''],
        Stid: [''],
        Delete: [],
        Seqno: [seqValue],
        Name: [''],
        Autoselect: [false],
      })
    );
  }

  setStatusValue(value: string) {
    this.orderConfigurationForm.get('StatusApr').setValue(value);
  }

  setLevelValue(value: string) {
    this.orderConfigurationForm.get('AccessLevel').setValue(value);
  }

  setPatientAgeValue(patient) {
    if (patient) {
      this.orderConfigurationForm.get('AgeFrom').setValue(patient.AgeFrom);
      this.orderConfigurationForm.get('AgeTo').setValue(patient.AgeTo);
      this.orderConfigurationForm.get('Uom').setValue(patient.Uom);
      this.orderConfigurationForm.get('Description').setValue(patient.Description);
    }
  }

  handleSidebarToggle() {
    this.isExpanded = !this.isExpanded;
  }

  onSearchChange(event) {
    this.seachAssignUsersData = event.target.value;
  }

  getSpecialityList() {
    this._ordersDashboardService
      .getDeptSet()
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any) => {
        this.specialtyDeptList = data?.d?.results;
      });
  }

  getPatientAgeList() {
    this._ordersDashboardService
      .getPatientAgeData()
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any) => {
        this.patientAgeList = data?.d?.results;
      });
  }

  redirectToCreateNew() {
    this.router.navigateByUrl('/orders-dashboard/order-create');
    this.subTitleForm.reset();
    this.orderConfigurationForm.reset();
  }

  getAssignUsersList() {
    this._ordersDashboardService
      .getAssignUsersData()
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any) => {
        this.assignUsersList = data?.d?.results.map((obj) => ({
          ...obj,
          isSelected: false,
        }));
        if (this.paramsId) this.getOrderSetByFavId(this.paramsId);
      });
  }

  openAssignModal(template: TemplateRef<any>) {
    this.seachAssignUsersData = '';
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-diagnosis',
    };
    this.assignUsersList.sort((a,b)=>{
      return Number(b.isSelected) - Number(a.isSelected);
    })
    this.modalRefForAssignUsers = this.modalService.show(template, config);
  }

  addAssignUser() {
    this.assignedUsersList = this.assignUsersList.filter((element) => {
      return element.isSelected;
    });
    this.modalRefForAssignUsers.hide();
  }

  getOrderSetByFavId(id: string) {
    this._ordersDashboardService
      .getOrderSetByOrderId(id)
      .subscribe((_success: any) => {
        this.getOrderFavData = _success?.d?.results[0];
        this.bindValueInForm();
        this.assignUsersList.forEach((element: any) => {
          this.getOrderFavData.ToAccess.results.map((res: any) => {
            if (element.Gpart == res.Pernr) {
              element.isSelected = true;
              this.assignedUsersList.push(element);
            }
          });
          this.assignUsersList.sort((a,b)=>{
            return Number(b.isSelected) - Number(a.isSelected);
          })
        });

        this.getOrderFavData.ToDiag.results.map((res: any) => {
          res.isSelected = true;
          this.assignDiagnosisList.push(res);
          this.assignedDiagnosisList.push(res);
        });
        if (this.getOrderFavData.ToSubtitle.results.length) {
          for (let index = 0; index < this.getOrderFavData.ToSubtitle.results.length; index++) {
            this.addSubTitleInForm();
          }
          this.subTitles.patchValue(this.getOrderFavData.ToSubtitle.results);
          this.selectedSubTitle(
            this.selectedSubTitleIndex,
            this.subTitles.value[this.selectedSubTitleIndex]
          );
        }
      });
  }

  bindValueInForm() {
    this.orderConfigurationForm.patchValue({
      Id: this.isCloneIdAvai ? '' : this.getOrderFavData.Id,
      Name: this.getOrderFavData.Name,
      Description: this.getOrderFavData.Description,
      DeptOu: this.getOrderFavData.DeptOu,
      PatientType: this.getOrderFavData.PatientType,
      Gender: this.getOrderFavData.Gender,
      AgeFrom: this.getOrderFavData.AgeFrom,
      AgeTo: this.getOrderFavData.AgeTo,
      Uom: this.getOrderFavData.Uom,
      ValidDays: this.getOrderFavData.ValidDays,
      AccessLevel: this.getOrderFavData.AccessLevel,
      Status: this.isCloneIdAvai ? '2' : this.getOrderFavData.Status,
      StatusApr: this.getOrderFavData.StatusApr,
    });
  }

  saveConfData(template: TemplateRef<any>) {
    if (this.orderConfigurationForm.valid) {
      const config: ModalOptions = {
        class: 'modal-dialog-centered modal-diagnosis',
      };
      this.modalRefForConformation = this.modalService.show(template, config);
    }
  }

  saveConformationDetail() {
    let selectedAssignUsers: any = this.assignedUsersList
      .filter((element) => {
        return element.isSelected;
      })
      .map((node) => ({ Pernr: node.Gpart }));
    let selectedDiagnosis: any = this.assignDiagnosisList
      .filter((element) => {
        return element.isSelected;
      })
      .map((node) => ({
        Dkat: node.Dkat,
        Dkey: node.Dkey,
        Dtext: node.Dtext1,
        Id: '',
      }));
    this.orderConfigurationForm.value.ToAccess.results = selectedAssignUsers;
    this.orderConfigurationForm.value.ToDiag.results = selectedDiagnosis;
    this.orderConfigurationForm.value.Update = true;
    this._ordersDashboardService
      .saveOrderConfigurationData(this.orderConfigurationForm.value)
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any) => {
        this.getOrderFavData = data?.d;
        this.paramsId = this.getOrderFavData.Id;
        this.bindValueInForm();
        this.modalRefForConformation.hide();
        if (!this.isParamsIdAvai || this.isCloneIdAvai)
          this.createSubTitleData();
        this.isParamsIdAvai = true;
        this.showSuccessPopup('', 'Your order is saved successfully', 'Success');
      });
  }

  createSubTitleData() {
    this.addSubTitleInForm();
    this.subTitles.patchValue([
      {
        Id: '',
        Stid: '',
        Seqno: '1',
        Name: this.getOrderFavData.Name,
        Autoselect: false,
        Delete: '',
      },
    ]);
    if (!this.isParamsIdAvai || this.isCloneIdAvai) this.saveSubTitleData(false);
  }

  get subTitles(): FormArray {
    return this.subTitleForm.get('subTitleFormList') as FormArray;
  }

  showErrorPopup(title: any, text: any, messageType) {
    return Swal.fire({
      title: title ? title : '',
      text: text ? text : '',
      showCancelButton: messageType === 'Conform' ? true : false,
      confirmButtonColor: '#0890c5',
      cancelButtonColor: '#84898c',
      confirmButtonText: messageType === 'Error' ? 'Close' : 'Yes',
      cancelButtonText: 'No',
      customClass: 'myalertpopup',
      icon: 'error',
      timer: 3000
    });
  }

  showWarningPopup(title: any, text: any, messageType) {
    return Swal.fire({
      title: title ? title : '',
      text: text ? text : '',
      confirmButtonColor: '#0890c5',
      cancelButtonColor: '#84898c',
      confirmButtonText: messageType === 'Error' ? 'Close' : 'Yes',
      cancelButtonText: 'No',
      customClass: 'myalertpopup',
      icon: 'warning',
      timer: 3000
    });
  }

 hasDuplicate(array, propertyName) {
    const encounteredValues = {};
    for (let i = 0; i < array.length; i++) {
      if(array[i]['Delete'] != 'X') {
        const value = array[i][propertyName];
        if (encounteredValues[value]) {
          return true;
        }
        encounteredValues[value] = true;
      }
    }
    return false;
  }

  saveSubTitleData(showMessage = true) {
    // var filterSubTitle = _.filter(this.subTitleForm.value.subTitleFormList, (o: any) => { return o.Name || o.Id });
    if (this.hasDuplicate(this.subTitleForm.value.subTitleFormList, 'Seqno')) {
      return this.showErrorPopup('', 'Duplicate sequence number cannot save', 'Error');
    }

    let payload = {
      Id: this.getOrderFavData.Id,
      ToSubtitleH: {
        results: this.subTitleForm.value.subTitleFormList,
      },
    };
    this._ordersDashboardService
      .saveSubTitleData(payload)
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any) => {
        this.clearFormArray(this.subTitleFormList);
        if (data?.d?.ToSubtitleH?.results) {
          for ( let index = 0; index < data?.d?.ToSubtitleH?.results.length; index++ ) {
            this.addSubTitleInForm();
          }
          this.subTitles.patchValue(data?.d?.ToSubtitleH?.results);
          this.selectedSubTitle(
            this.selectedSubTitleIndex,
            data?.d?.ToSubtitleH?.results[this.selectedSubTitleIndex]
          );
        }
        if(showMessage) this.showSuccessPopup('', 'Your subtitle is saved successfully', 'Success');
      });
  }

  openDiagnosisModal(template: TemplateRef<any>) {
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-diagnosis',
    };
    this.modalRefForDiagnosis = this.modalService.show(template, config);
  }

  diagnosisCodeList() {
    this.searchCodeTypeHead.pipe(debounceTime(1000)).subscribe((term) => {
      if (term) {
        this._admissionService
          .searchDiagnosis(term)
          .subscribe((result: any) => {
            if (result.d.results) {
              this.diagnosisSearchList = result.d.results;
            }
          });
      }
    });
  }

  onSelectMedicine(event: any) {
    if (event) {
      event.isSelected = true;
      this.assignDiagnosisList.push(event);
    }
  }

  selectedDiagnosisAssign() {
    this.assignedDiagnosisList = this.assignDiagnosisList.filter((element) => {
      return element.isSelected;
    });
    this.modalRefForDiagnosis.hide();
  }

  refreshOrderData() {
    if (this.isParamsIdAvai || this.isCloneIdAvai) {
      this.clearFormArray(this.subTitleFormList);
      this.assignedDiagnosisList = [];
      this.assignDiagnosisList = [];
      this.assignedUsersList = [];
      this.getAssignUsersList();
    } else {
      this.initForm();
      this.assignedUsersList = [];
    }
  }

  removeSubTitle(template: TemplateRef<any> ) {
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-diagnosis',
    };

    if(this.selectedSubTitleDetails.Delete == null) {
      this.subTitleFormList.removeAt(this.selectedSubTitleIndex);
      this.selectedSubTitleIndex = null;
      this.selectedSubTitleDetails = '';
    } else {
      this.modalRefForDiagnosis = this.modalService.show(template, config);
    }
    this.selectedSubTitle(this.selectedSubTitleIndex, this.selectedSubTitleDetails);
  }

  removeConfSubTitle() {
    let controlArray = <FormArray>this.subTitleForm.get('subTitleFormList');
    controlArray.controls[this.selectedSubTitleIndex].get('Delete').setValue('X');
    let payload = {
      Id: this.getOrderFavData.Id,
      ToSubtitleH: {
        results: this.subTitleForm.value.subTitleFormList,
      },
    };
    this._ordersDashboardService
      .saveSubTitleData(payload)
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any) => {
        this.modalRefForDiagnosis.hide();
        this.showSuccessPopup('', 'Subtitle successfuly deleted', 'Error');
        this.selectedSubTitle(this.selectedSubTitleIndex, '');
      })
  }

  selectedSubTitle(index: any, subTitle) {
    if(!subTitle?.Stid) {

    }
    this.selectedSubTitleDetails = subTitle;
    this.selectedSubTitleIndex = index;
    this.selectedSubTitleData = {
      data: this.getOrderFavData,
      subTitle: subTitle,
      date: new Date(),
    };
    // if(subTitle.Stid) {
    // } else {
    //   this.selectedSubTitleDetails = subTitle;
    //   console.log(this.selectedSubTitleDetails, "this.selectedSubTitleDetails");
    //   this.selectedSubTitleIndex = index;
    //   // this.showWarningPopup('', 'Please save the subtitle first!', 'Warning');
    // }
  }

  bindMedicationData(data: any) {
    this.getOrderFavData.ToMedOrd = data?.d?.ToMedOrd;
    this.clearFormArray(this.subTitleFormList);
    this.getOrderSetByFavId(this.paramsId);
  }

  clearFormArray = (formArray: FormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  };

  redirectToCreateOrder() {
    window.open('orders-dashboard/order-create', '_self');
  }

  showSuccessPopup(title: any, text: any, messageType) {
    return Swal.fire({
      title: title ? title : '',
      text: text ? text : '',
      showCancelButton: messageType === 'Conform' ? true : false,
      confirmButtonColor: '#0890c5',
      cancelButtonColor: '#84898c',
      confirmButtonText: messageType === 'Error' ? 'Close' : 'Yes',
      cancelButtonText: 'No',
      customClass: 'myalertpopup',
      icon: 'success',
      timer: 3000
    });
  }

  
  titleDetails(titleName, type) {
    let title;
    if(titleName) {
      if (type == 'speciality') {
        const data = this.specialtyDeptList?.find((x) => {
          return x.Deptou == titleName;
        });
        title = data?.DeptouDesc;
      } else if (type == 'gender') {
        const data = this.patientGenderList?.find((x) => {
          return x.value == titleName;
        });
        title = data?.label;
      } else if (type == 'patientCase') {
        const data = this.patientCaseList?.find((x) => {
          return x.value == titleName;
        });
        title = data?.label;
      }
    }
    return title;
  }
}
