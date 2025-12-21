import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { OrdersDashboardService } from '@services/orders-dashboard/orders-dashboard.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { EMPTY, Subject, catchError, debounceTime, of } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-surgery-e-order',
  templateUrl: './surgery-e-order.component.html',
  styleUrls: ['./surgery-e-order.component.scss'],
})
export class SurgeryEOrderComponent implements OnInit {
  surgeryForm: FormGroup;
  surgeryFormArray: FormArray;
  public searchTerm = new Subject<string>();
  public searchTermTreatmentOU = new Subject<string>();
  public searchTermDepartmentOU = new Subject<string>();
  serviceTextList: any;
  treatmentOUList: any;
  departmentOUList: any;
  assignUsersList: any;
  minDate = new Date();

  isFormSubmitted: boolean = false;
  paramsObj: any = {};
  modalRefForFav: BsModalRef;
  myFavArr=[];
  showFav: boolean=false;
  favList: any;
  selectFavList=[];
  constructor(
    private formBulider: FormBuilder,
    private orderDashboardService: OrdersDashboardService,
    private route: ActivatedRoute,
    private modalService: BsModalService
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
    this.getAssignUsersList();
  }

  initForm() {
    this.surgeryForm = this.formBulider.group({
      surgeryFormArray: new FormArray([]),
    });
  }

  addFormArray() {
    this.surgeryFormArray = this.surgeryForm.get(
      'surgeryFormArray'
    ) as FormArray;
    this.surgeryFormArray.push(this.createSurgeryFormRecords());
  }

  storedPatientStr = localStorage.getItem('myPatient')
  createSurgeryFormRecords(): FormGroup {
    return this.formBulider.group({
      Einri: [''],
      Falnr: [''],
      Lfdnr: [''],
      Patnr: [this.paramsObj.patnr],
      Talst: [''],
      Trtoe: ['F9GOTAMC', [Validators.required]],
      Orgfa: [JSON.parse(this.storedPatientStr).deptOrgUnit, [Validators.required]],
      Surgeon: [''],
      Anerf: [false],
      AddInfo: [''],
      Wbgdt: [null, [Validators.required]],
      Wbgzt: ['', [Validators.required]],
      PatientName: [''],
      ServiceText: ['', [Validators.required]],
      TrtoeText: ['Major OT (GRAL)', [Validators.required]],
      OrgfaText: [JSON.parse(this.storedPatientStr).deptOrgUnitTxt],
      SurgeonName: [''],
      Favorite:[false]
    });
  }

  subscribeSearchEvent() {
    this.searchTerm.pipe(debounceTime(2000)).subscribe((term) => {
      if (term !== '' && term !== null && term.length >= 3) {
        this.orderDashboardService.getServiceTextList('06', term).subscribe({
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
      this.surgeryFormArray.controls[index].patchValue({
        Talst: value.Talst,
        ServiceText: value.Ktext,
        Favorite:value.Favorite
      });
    } else {
      this.surgeryFormArray.controls[index].patchValue({
        Talst: '',
        ServiceText: '',
        Favorite:false
      });
    }
    console.log(this.surgeryFormArray);
    
  }

  onSelectTreatmentOU(value, index) {
    if (value) {
      this.surgeryFormArray.controls[index].patchValue({
        Trtoe: value.Orgid,
        TrtoeText: value.Orgna,
      });
    } else {
      this.surgeryFormArray.controls[index].patchValue({
        Trtoe: '',
        TrtoeText: '',
      });
    }
  }

  onSelectDepartmentOU(value, index) {
    if (value) {
      this.surgeryFormArray.controls[index].patchValue({
        Orgfa: value.Orgid,
        OrgfaText: value.Orgna,
      });
    } else {
      this.surgeryFormArray.controls[index].patchValue({
        Orgfa: '',
        OrgfaText: '',
      });
    }
  }

  onSelectSurgeon(value, index) {
    if (value) {
      this.surgeryFormArray.controls[index].patchValue({
        Surgeon: value.Gpart,
        SurgeonName: value.NamString,
      });
    } else {
      this.surgeryFormArray.controls[index].patchValue({
        Surgeon: '',
        SurgeonName: '',
      });
    }
  }

  createSurgeryOrder() {
    const inValidSurgeryForms = this.surgeryFormArray.controls.filter((d) => !d.valid);
    if (inValidSurgeryForms && inValidSurgeryForms.length) {
      this.orderDashboardService.showErrorPopup(
        '',
        'Please provide all require data in surgery.',
        'Error'
      );
      return;
    }

    this.surgeryForm.value.surgeryFormArray.forEach((element: any) => {
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
      delete element.Favorite;
    });

    let payload = {
      Einri: this.paramsObj.einri,
      Falnr: this.paramsObj.falnr,
      Lfdnr: this.paramsObj.lfdnr,
      ToSurgy: {
        results: this.surgeryForm.value.surgeryFormArray,
      },
    };

    this.orderDashboardService
      .saveSurgeryEOrderDetails(payload)
      .pipe(
        untilDestroyed(this),
          catchError(err => {
            const errorMessage = err?.error?.error?.innererror?.errordetails?.[0]?.message || 'An error occurred';
            this.orderDashboardService.showErrorPopup('', errorMessage, 'Error');
            return EMPTY;
    })
      )
      .subscribe((data: any) => {
        if (data && data.length != 0) {
          this.initForm();
          this.addFormArray();
          this.orderDashboardService.showSuccessPopup('','Surgery order is successfully created','Success');
        }
      });
  }

  removeSurgery(index) {
    this.surgeryFormArray.removeAt(index);
  }

  collectMyFav(index){
   this.myFavArr.push(this.surgeryForm.value.surgeryFormArray[index]);
   if (this.showFav) {
    this.showFav = false;
   }else{
    this.showFav = true;
   }
  }
  openFavList(template: TemplateRef<any>){
    const config: ModalOptions = {
      class: 'modal-dialog fav-modal',
    };
    this.modalRefForFav = this.modalService.show(template, config);
    const payload = {
      "Einri" : "",
        "Tarif" : "",
        "Talst" : "",
        "Surgeon" : "",
        "Ktext" : "",
        "SurgeonName" : "",
        "Delete" : false
    }
    this.orderDashboardService.getFavoriteListSurgery(payload).subscribe({
      next: (resp: any) => {
        this.myFavArr = resp?.d?.results;
      },
    });
  }
  closeFavModal(){
    this.myFavArr=[];
    this.modalRefForFav.hide();
  }
  updateFavorite(item,index){
   const payload ={
    Talst:this.surgeryFormArray.controls[index].value.Talst,
    Surgeon:this.surgeryFormArray.controls[index].value.Surgeon
   }
   this.orderDashboardService
   .updateFavoriteSurgery(payload)
   .pipe(
     untilDestroyed(this),
     catchError((err) => {
       return of([]);
     })
   )
   .subscribe((data: any) => {
    if(this.surgeryFormArray.controls[index].value.Favorite){
      this.surgeryFormArray.controls[index].patchValue({
        Favorite:false
      })
    }else{
      this.surgeryFormArray.controls[index].patchValue({
        Favorite:true
      })
    }
   });
  }
  updateFavoriteFromModal(item,index){
    const payload ={
      "Talst" : item.Talst,
      "Surgeon" : item.Surgeon,
      "Delete" : true
    }
    this.orderDashboardService
    .updateFavoriteSurgery(payload)
    .pipe(
      untilDestroyed(this),
      catchError((err) => {
        return of([]);
      })
    )
    .subscribe((data: any) => {
      const payload = {
        "Einri" : "",
          "Tarif" : "",
          "Talst" : "",
          "Surgeon" : "",
          "Ktext" : "",
          "SurgeonName" : "",
          "Delete" : false
      }
      this.orderDashboardService.getFavoriteListSurgery(payload).subscribe({
        next: (resp: any) => {
          this.myFavArr = resp?.d?.results;
        },
      });
    });
   }
   selectOrderFromFav(item,i){
    if (this.selectFavList.length) {
      let obj = this.selectFavList.find((o) => o.Talst === item.Talst);
      if (obj) {
        this.selectFavList.splice(
          this.selectFavList.findIndex(
            (el) => el.Talst === item.Talst
          ),
          1
        );
      } else {
        this.selectFavList.push(item);
      }
    } else {
      this.selectFavList.push(item);
    }
   }
   importFavInForm(){
    this.selectFavList.forEach((element) => {
      if (!(this.surgeryFormArray !=undefined && this.surgeryFormArray.value.length==1 && (this.surgeryFormArray.value[0].ServiceText=="" ||  this.surgeryFormArray.value[0].ServiceText==undefined ))) {
        this.addFormArray();
      }
     let index = this.surgeryFormArray.value.length -1;
      this.onSelectService(element,index);
      this.surgeryFormArray.controls[index].patchValue({
        Surgeon:element.Surgeon,
        SurgeonName:element.SurgeonName
      })
    });
    this.modalRefForFav.hide();
    this.selectFavList=[];
   }

   resetForm(){
    this.initForm();
    this.addFormArray();
   }
}
