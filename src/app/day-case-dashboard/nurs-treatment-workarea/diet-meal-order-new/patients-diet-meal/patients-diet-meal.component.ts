import { ChangeDetectorRef, Component, NgZone, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
declare var document: any;
@Component({
  selector: 'app-patients-diet-meal-new',
  templateUrl: './patients-diet-meal.component.html',
  styleUrls: ['./patients-diet-meal.component.scss'],
})
export class PatientsDietMealComponentNew implements OnInit {
  dietOrderForm: FormGroup;
  dietMealOrderForm: FormGroup;
  assessmentForm: FormGroup;
  dislikeFoodForm: FormGroup;
  snackOrderForm: FormGroup;
  dislikesValue: any;
  modalRef: BsModalRef
  mealList: any = [];

  dislikeList: any = [];
  trayTypeList: any = [];

  dietList: any = [];

  snackTimeList = [
    {
      text: 'Morning',
      value: 'SA',
    },
    {
      text: 'Afternoon',
      value: 'SN',
    },
    {
      text: 'Evening',
      value: 'SP',
    },
  ];

  consistencyList: any = [];

  assessmentList = [
    {
      text: 'Not Done',
      value: 'N'
    },
    {
      text: 'Done',
      value: 'D'
    },
  ]

  dietDescription: any = []

  data: any = [
    {
      npo: false,
      dietCategory: 'vegan',
      mealType: ['snack'],
      dietType: ['High Protein'],
      dietConsistency: 'Soft',
      carbohydrates: 10,
      proteins: 12,
      calories: 12,
      sodium: 12,
      duration: 10,
      startDate: '2024-08-16',
      startTime: '12:00',
      endDate: '2024-08-26',
      endTime: '07:00',
      status: 'pending',
      date: '2024-08-16',
      Irradiated: {
        yes: true,
        no: false,
      },
      remarks: 'jkeivn',
    },
  ];
  modalType: string;
  selectedDetails: any;
  selectedMeal: string;
  paramsObj: any;
  savedDietMealOrderDetails: any;
  dietMealOrderList: any;
  isIndicators: boolean = false;
  ReferOrEditOrder: string = '';
  dislikeDetails: any;
  isInvalidForm: boolean = false;
  assessmentDetails: any;
  constructor(private fb: FormBuilder, private ngZone: NgZone, private modalService: BsModalService,
    private emergencyService: EmergencyService, private route: ActivatedRoute) {
    this.route.queryParams.subscribe((res) => {
      this.paramsObj = res
    })
  }
  selectedDislikes: any = [];
  ngOnInit(): void {
    this.createForm();
    this.initForm();
    this.onStartDateChange(null);

    this.snakeTimeDetails();
    this.nursingIndicatorsDetails();
    this.foodPrefDetails();
    this.dietMealOrderDetails()
    this.getOrderDetails();
    this.getDislikeDetails();
    this.initAssessmentForm();

  }
  selectedDislike() {
    // this.dislikeFoodForm.get('Foodid')?.valueChanges.subscribe((selectedIds: any) => {
    this.selectedDislikes = this.dislikeList.filter(food => this.dislikeFoodForm.get('Foodid').value.includes(food.FoodprefId));
    // });
  }

  getOrderDetails() {
    this.emergencyService.fetchDietMealOrderDetails(this.paramsObj?.einri, this.paramsObj?.falnr).subscribe((res: any) => {
      if (res?.d?.results.length) {
        const sortedResults = res?.d?.results.sort((a, b) => {
          return this.getCreatedDateTime(b) - this.getCreatedDateTime(a);
        });
        this.dietMealOrderList = sortedResults;
      }
    })
  }

  getDietSpecValue(dietSpecs: any[], dietCode: string): string {
    if (!dietSpecs || dietSpecs.length === 0) return '0'; // Default to 0 if no data
    const spec = dietSpecs.find(spec => spec.DietCode === dietCode);
    return spec ? spec.Value || '0' : '0'; // Return value or default to 0
  }

  parseSapDate(sapDate) {
    const timestamp = parseInt(sapDate.replace(/\/Date\((\d+)\)\//, '$1'));
    return new Date(timestamp);
  }

  getCreatedDateTime(item): any {
    let datePart = this.parseSapDate(item.Createdon);
    let timePart = item.Createdat.match(/PT(\d+)H(\d+)M(\d+)S/);

    if (timePart) {
      let hours = parseInt(timePart[1], 10);
      let minutes = parseInt(timePart[2], 10);
      let seconds = parseInt(timePart[3], 10);
      datePart.setHours(hours, minutes, seconds, 0);
    }
    return datePart;
  }

  getDislikeDetails() {
    this.emergencyService.fetchDislikeList(this.paramsObj?.patnr).subscribe((res: any) => {
      if (res?.d?.results.length) {
        this.dislikeDetails = res?.d?.results;
        this.initDislikeForm();
        const foodPrefIds = this.dislikeDetails.map(item => item.Foodprefid);
        this.dislikeFoodForm.patchValue({
          Institution: this.paramsObj?.einri,
          Mrn: this.paramsObj?.patnr,
          Operation: "I",
          Foodid: foodPrefIds
        });
        console.log(this.dislikeFoodForm.value, "--");
      }
    })
  }

  fetchAssessmentDetail() {
    this.emergencyService.fetchAssessmentList(this.paramsObj?.patnr, this.paramsObj?.falnr).subscribe((res: any) => {
      console.log(res, "---");
      this.assessmentDetails = res?.d?.results[0];
      let assesmentDate = parseInt(this.assessmentDetails?.AssessmentDate.match(/\d+/)?.[0] || '0');
      let convertedassesmentDate = new Date(assesmentDate);
      let reAssesmentDate = parseInt(this.assessmentDetails?.AssessmentDate.match(/\d+/)?.[0] || '0');
      let convertedReAssesmentDate = new Date(reAssesmentDate);
      this.assessmentForm.patchValue({
        Institution: this.paramsObj?.einri,
        AssessmentStatus: this.assessmentDetails.AssessmentStatus,
        MRN: this.paramsObj?.patnr,
        AssessmentDate: convertedassesmentDate,
        CaseNo: this.paramsObj?.falnr,
        ReAssessmentStatus: this.assessmentDetails.ReAssessmentStatus,
        ReAssessmentDate: convertedReAssesmentDate,
        Comment: this.assessmentDetails?.Comment
      });

    })
  }

  createForm() {
    this.dietOrderForm = this.fb.group({
      npo: [false],
      dietCategory: ['normal'],
      mealType: [null, Validators.required],
      dietType: [null, Validators.required],
      dietConsistency: ['', Validators.required],
      snackTime: ['', Validators.required],
      carbohydrates: ['', [Validators.required, Validators.min(1)]],
      proteins: ['', [Validators.required, Validators.min(1)]],
      calories: ['', [Validators.required, Validators.min(1)]],
      sodium: ['', [Validators.required, Validators.min(1)]],
      duration: [1, [Validators.required, Validators.min(1)]],
      startDate: [new Date(), Validators.required],
      startTime: ['', Validators.required],
      endDate: [null, Validators.required],
      endTime: ['', Validators.required],
      Irradiated: this.fb.group({
        yes: [false],
        no: [false],
      }),
      remarks: ['', Validators.required],
    });

    this.snackOrderForm = this.fb.group({
      Institution: this.paramsObj?.einri,
      Mrn: this.paramsObj?.patnr,
      Dietday: [new Date(), Validators.required],
      Caseno: this.paramsObj?.falnr,
      Mealtype: ["S", Validators.required],
      Comments: [''],
      Dietdesc: ['', Validators.required],
      Operation: "I",
      DietdayTo: [new Date(), Validators.required],
      Snacktime: ['', Validators.required]
    });

    this.dislikeFoodForm = this.fb.group({
      Institution: this.paramsObj?.einri,
      Mrn: this.paramsObj?.patnr,
      Operation: "I",
      Foodcomment: "",
      Foodid: ['', Validators.required],
      NoDislike: [false]
    });
  }

  initDislikeForm() {
    // let foodPrefIds = this.dislikeDetails.map(item => item.Foodprefid);
    this.dislikeFoodForm.patchValue({
      Institution: this.paramsObj?.einri,
      Mrn: this.paramsObj?.patnr,
      Operation: "U",
      Foodid: this.dislikeDetails?.Foodprefid ? this.dislikeDetails?.Foodprefid.split(',').map(item => item.trim()) : ''
    });
  }

  initAssessmentForm() {
    this.assessmentForm = this.fb.group({
      Institution: this.paramsObj?.einri,
      AssessmentStatus: ["", Validators.required],
      MRN: this.paramsObj?.patnr,
      AssessmentDate: new Date(),
      CaseNo: this.paramsObj?.falnr,
      ReAssessmentStatus: ["", Validators.required],
      ReAssessmentDate: new Date(),
      Comment: ""
    });
  }

  initForm() {
    this.dietMealOrderForm = this.fb.group({
      Institution: [this.paramsObj?.einri],
      Mrn: [this.paramsObj?.patnr],
      Dietday: [new Date()],
      Caseno: [this.paramsObj?.falnr],
      Mealtype: ['', Validators.required],
      Comments: [''],
      DietConsistency: ['', Validators.required],
      Dietdesc: [''],
      DietType: [''],
      Operation: 'I',
      Orderno: '',
      NursingIndicators: '',
      Referorderno: '',


      sodium: [''],
      carbohydrates: [''],
      proteins: [''],
      calories: [''],
      Irradiated: [false]
    });
  }

  selectListData(item: any, index?: number) {
    this.selectedDetails = item;
    this.dietMealOrderList.forEach(item => {
      item.selected = false;
    });
    this.dietMealOrderList[index].selected = true;
  }

  snakeTimeDetails() {
    this.emergencyService.fetchSnackList().subscribe((res: any) => {
      this.dietDescription = res?.d?.results
    })
  }
  nursingIndicatorsDetails() {
    this.emergencyService.fetchNursingIndicatorsList().subscribe((res: any) => {
      this.mealList = res?.d?.results;
    })
  }
  foodPrefDetails() {
    this.emergencyService.fetchFoodPrefList().subscribe((res: any) => {
      this.dislikeList = res?.d?.results;

    })
  }
  dietMealOrderDetails() {
    this.emergencyService.fetchDietMasterList().subscribe((res: any) => {
      this.trayTypeList = res?.d?.results.filter(item => item.Diettypeid === "Tray Type");
      this.dietList = res?.d?.results.filter(item => item.Diettypeid === "Diet Type");
      this.consistencyList = res?.d?.results.filter(item => item.Diettypeid === "Add on");
    })
  }

  selectMeal(meal: any, isChecked: any) {
    let currentValue: string = this.dietMealOrderForm.get('Mealtype')?.value || '';

    if (isChecked.target.checked) {
      if (!currentValue.includes(meal)) {
        currentValue += meal;
      }
    } else {
      currentValue = currentValue.replace(meal, '');
    }

    this.dietMealOrderForm.get('Mealtype')?.setValue(currentValue);

  }

  createNewDiet(type: string) {
    if (type == 'dislikes') {
      this.getDislikeDetails();
    }
    if (type == 'assessment') {
      this.fetchAssessmentDetail();
    }
    this.modalType = type;
    this.createForm();
    this.initForm();
    this.openNav();
  }

  resetForm() {
    this.createForm();
    this.initForm();
    this.closeNav();
    this.initAssessmentForm();
    this.ReferOrEditOrder = '';
    this.selectedDetails = '';
  }

  sidenavWidth: string = '0';
  mainMarginLeft: string = '0';

  openNav() {
    this.sidenavWidth = '480px';
    this.mainMarginLeft = '480px';
    document.body.style.backgroundColor = 'rgba(0,0,0,0.4)';
  }

  closeNav() {
    this.sidenavWidth = '0';
    this.mainMarginLeft = '0';
    document.body.style.backgroundColor = 'white';
  }

  durationChange() {
    const date = this.dietOrderForm.value.startDate;
    this.onStartDateChange(date);
  }

  onStartDateChange(event) {
    const startDate = new Date(event);
    const duration = this.dietOrderForm.value.duration;
    console.log(startDate, duration);

    if (startDate && duration >= 1) {
      const endDate = this.addDays(new Date(startDate), duration);
      this.dietOrderForm.controls['endDate']?.setValue(endDate);
      this.dietOrderForm.controls['endTime']?.setValue('07:00');
    } else {
      this.dietOrderForm.controls['endDate']?.reset();
    }
  }

  addDays(startDate, duration) {
    const result = new Date(startDate);
    result.setDate(result.getDate() + duration);
    return result;
  }

  onIrradiatedChange(value) {
    if (value === 'yes') {
      this.dietOrderForm?.get('Irradiated')['controls']['yes']?.setValue(true);
      this.dietOrderForm?.get('Irradiated')['controls']['no']?.setValue(false);
    } else {
      this.dietOrderForm?.get('Irradiated')['controls']['no']?.setValue(true);
      this.dietOrderForm?.get('Irradiated')['controls']['yes']?.setValue(false);
    }
    console.log(this.dietOrderForm?.get('Irradiated')['controls']);
  }

  onNoDislikeChange(event: Event): void {
    let isChecked = (event.target as HTMLInputElement).checked;
    this.dislikeFoodForm?.get('NoDislike')?.setValue(isChecked);
    let foodIdControl = this.dislikeFoodForm?.get('Foodid');
    if (isChecked) {
      foodIdControl?.setValue('');
      foodIdControl?.clearValidators();
    } else {
      foodIdControl?.setValidators(Validators.required);
    }
    foodIdControl?.updateValueAndValidity();
  }

  onNPOChange() {
    if (this.dietOrderForm.value.npo) {
      this.dietOrderForm.controls.mealType.disable();
      this.dietOrderForm.controls.dietType.disable();
      this.dietOrderForm.controls.dietConsistency.disable();
      this.dietOrderForm.controls.carbohydrates.disable();
      this.dietOrderForm.controls.proteins.disable();
      this.dietOrderForm.controls.calories.disable();
      this.dietOrderForm.controls.sodium.disable();
      this.dietOrderForm.controls.remarks.disable();
      this.dietOrderForm.controls.Irradiated.disable();
    } else {
      this.dietOrderForm.controls.mealType.enable();
      this.dietOrderForm.controls.dietType.enable();
      this.dietOrderForm.controls.dietConsistency.enable();
      this.dietOrderForm.controls.carbohydrates.enable();
      this.dietOrderForm.controls.proteins.enable();
      this.dietOrderForm.controls.calories.enable();
      this.dietOrderForm.controls.sodium.enable();
      this.dietOrderForm.controls.remarks.enable();
      this.dietOrderForm.controls.Irradiated.enable();
    }
  }

  saveForm() {
    if (this.dietOrderForm.valid) {
      this.closeNav();
      console.log(this.dietOrderForm.value);
      const formValues = this.dietOrderForm.value;
      // Creating JSON object
      const jsonArray = [
        {
          npo: formValues.npo,
          dietCategory: formValues.dietCategory,
          mealType: formValues.mealType,
          dietType: formValues.dietType,
          dietConsistency: formValues.dietConsistency,
          // carbohydrates: formValues.carbohydrates,
          // proteins: formValues.proteins,
          // calories: formValues.calories,
          // sodium: formValues.sodium,
          duration: formValues.duration,
          startDate: formValues.startDate,
          startTime: formValues.startTime,
          endDate: formValues.endDate,
          endTime: formValues.endTime,
          status: 'pending',
          Irradiated: {
            yes: formValues.Irradiated.yes,
            no: formValues.Irradiated.no,
          },
          remarks: formValues.remarks,
        },
      ];
      this.data = [...this.data, ...jsonArray];
      console.log('jsonArray', jsonArray);

      Swal.fire({
        text: 'Data Saved Successfully!',
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: { popup: 'myalertpopup' },
      });
    } else {
      this.dietOrderForm.markAllAsTouched(); // Mark all controls as touched to show validation errors
    }
  }

  public openIndicatorsModal(template: TemplateRef<any>) {
    if (this.selectedDetails?.status == 'pending') {
      const config: ModalOptions = {
        class: 'modal-dialog-centered',
      };
      this.modalRef = this.modalService.show(template, config);
    }
  }

  indicatorsSet() {
    if (this.dietMealOrderForm?.get('Operation').value == 'I' && (this.ReferOrEditOrder == 'Edited' || this.ReferOrEditOrder == '')) {
      this.isIndicators = true;
    } else {
      this.isIndicators = false;
    }
  }

  // cancelOrder(item) {
  //   if (item?.status === 'pending' || item?.status === 'confirmed') {

  //   } else {
  //     Swal.fire({
  //       text: 'The order cannot be canceled.'
  //     })
  //   }
  // }

  editAndReferOrder(item, type: string) {
    this.ReferOrEditOrder = type;
    if ((item?.Orderstatusdesc === 'Saved' && type == 'Edited') || (item?.Orderstatusdesc === 'Confirmed' && type == 'Referred')) {
      if (item?.Mealtypedesc == 'Snack') {
        let timestamp = parseInt(item?.Dietday.match(/\d+/)?.[0] || '0');
        let convertedDate = new Date(timestamp);
        let convertedDateTo
        if (item?.DietdayTo) {
          let timestampTo = parseInt(item?.DietdayTo.match(/\d+/)?.[0] || '0');
          convertedDateTo = new Date(timestampTo);
        }
        this.snackOrderForm.patchValue({
          Institution: item?.Institution,
          Mrn: item?.Mrn,
          Dietday: type == 'Edited' ? convertedDate : new Date(),
          DietdayTo: type == 'Edited' ? convertedDateTo : new Date(),
          Caseno: item?.Caseno,
          Mealtype: item?.Mealtype,
          Comments: item?.Comments,
          DietConsistency: item?.DietConsistency ? item?.DietConsistency : '',
          Dietdesc: item?.Dietdesc ? item?.Dietdesc.split(',').map(item => item.trim()) : '',
          // DietType: item?.DietType ? item?.DietType.split(',').map(item => item.trim()) : '',
          // NursingIndicators: item?.NursingIndicators ? item?.NursingIndicators.match(/I\d{3}/g) : '',
          Operation: type == 'Edited' ? 'U' : 'I',
          Orderno: item?.Orderno,
          Snacktime: item?.Snacktime
          // Referorderno: item?.Orderno
        });
        this.modalType = "snackOrder";
        this.openNav();
      } else {
        let timestamp = parseInt(item?.Dietday.match(/\d+/)?.[0] || '0');
        let convertedDate = new Date(timestamp);
        this.dietMealOrderForm.patchValue({
          Institution: item?.Institution,
          Mrn: item?.Mrn,
          Dietday: type == 'Edited' ? convertedDate : new Date(),
          Caseno: item?.Caseno,
          Mealtype: item?.Mealtype,
          Comments: item?.Comments,
          DietConsistency: item?.DietConsistency ? item?.DietConsistency : '',
          Dietdesc: item?.Dietdesc ? item?.Dietdesc.split(',').map(item => item.trim()) : '',
          DietType: item?.DietType ? item?.DietType.split(',').map(item => item.trim()) : '',
          NursingIndicators: item?.NursingIndicators ? item?.NursingIndicators.match(/I\d{3}/g) : '',
          Operation: type == 'Edited' ? 'U' : 'I',
          Orderno: item?.Orderno,
          Referorderno: item?.Orderno
        });
        if (item?.ToDietSpecs?.results) {
          const specs = item.ToDietSpecs.results;
          
          // Mapping DietCode to form controls
          const dietSpecsMap: { [key: string]: string } = {
            'A010': 'carbohydrates',
            'A020': 'proteins',
            'A030': 'calories',
            'A040': 'sodium'
          };
      
          // Loop through the results and update the form
          specs.forEach(spec => {
            const formControlName = dietSpecsMap[spec.DietCode];
            if (formControlName) {
              this.dietMealOrderForm.get(formControlName)?.patchValue(parseFloat(spec.Value));
            }
          });
        }
        this.modalType = "dietMeal";
        this.openNav();
      }

    } else {
      Swal.fire({
        icon: 'warning',
        text: `The Order cannot be ${type}`
      })
    }
  }

  public openDislikesModal(template: TemplateRef<any>) {
    const config: ModalOptions = {
      class: 'modal-dialog-centered',
    };
    this.modalRef = this.modalService.show(template, config);
  }

  saveDietMealOrder() {
    if (this.dietMealOrderForm.invalid) {
      return;
    }
    const payload = { ...this.dietMealOrderForm.value };
    if (!payload.Indicatorid) { delete payload.Indicatorid } else {
      payload.Indicatorid = payload.Indicatorid.join(', ');
    }
    payload.Dietday = this.getFormattedDate(payload?.Dietday);
    payload.Dietdesc = payload.Dietdesc ? payload.Dietdesc.join(', ') : '';
    payload.DietType = payload.DietType ? payload.DietType.join(', ') : '';
    this.ReferOrEditOrder === 'Referred' ? delete payload?.Orderno : delete payload?.Referorderno;
    payload.NursingIndicators = payload.NursingIndicators ? payload.NursingIndicators.join(',') : '';

    payload.ToDietSpecs = [
      {
        "Institution": payload.Institution,
        "Mrn": payload.Mrn,
        "Dietday": payload.Dietday,
        "Caseno": payload.Caseno,
        "Schem": "DEFA",
        "DietCode": "A010",
        "Value": payload.carbohydrates.toString()
      },
      {
        "Institution": payload.Institution,
        "Mrn": payload.Mrn,
        "Dietday": payload.Dietday,
        "Caseno": payload.Caseno,
        "Schem" : "DEFA",
        "DietCode" : "A020",
        "Value": payload.proteins.toString()
      },
      {
        "Institution": payload.Institution,
        "Mrn": payload.Mrn,
        "Dietday": payload.Dietday,
        "Caseno": payload.Caseno,
        "Schem" : "DEFA",
        "DietCode" : "A030",
        "Value": payload.calories.toString()
      },
      {
        "Institution": payload.Institution,
        "Mrn": payload.Mrn,
        "Dietday": payload.Dietday,
        "Caseno": payload.Caseno,
        "Schem" : "DEFA",
        "DietCode" : "A040",
        "Value": payload.sodium.toString()
      },
    ]

    delete payload.carbohydrates
    delete payload.proteins
    delete payload.calories
    delete payload.sodium
    delete payload.Irradiated
    
    console.log(payload, "payload");

    this.emergencyService.saveDeitMealOrder(payload).subscribe((res: any) => {
      this.savedDietMealOrderDetails = res?.d;
      this.getOrderDetails();
      Swal.fire({
        text: 'Diet Meal Order Saved Successfully!',
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: { popup: 'myalertpopup' },
      });
      this.resetForm();
    }, (error) => {

      // const messages = error?.error?.error?.innererror?.errordetails
      //   .filter(detail => detail.code != '/IWBEP/CX_MGW_BUSI_EXCEPTION')
      //   .map((detail, index) => `${index + 1}) ${detail.message}`)
      //   .join('<br>');
      const meals = ['breakfas', 'Lunch', 'Dinner'];
      let foundMeals: string[] = [];
      let messages: any;
      for (let item of error?.error?.error?.innererror?.errordetails) {
        for (let meal of meals) {
          // Case insensitive match
          if (item.message.toLowerCase().includes(meal.toLowerCase())) {
            if (!foundMeals.includes(meal)) {
              foundMeals.push(meal);
            }
          }
        }
      }
      foundMeals = foundMeals.map(meal => meal === 'breakfas' ? 'breakfast' : meal);
      if (foundMeals.length > 0) {
        messages = 'Order is already available for ' + foundMeals.join(', ');
        console.log(messages);
        // Output: "Order is already available for Breakfast, Lunch, Dinner"
      }

      Swal.fire({
        title: 'Not Allowed',
        html: messages,
        icon: 'error',
        customClass: { popup: 'error-details-swal-modal' },
        confirmButtonText: 'Close',
      });
      this.resetForm();
    })
    // }
  }

  confirmOrder(item) {
    if (item?.Orderstatusdesc == "Saved") {
      let timestamp = parseInt(item.Dietday.match(/\d+/)[0]);
      let date = new Date(timestamp);
      let formattedDate = date.toISOString();
      const payload = {
        "Institution": item?.Institution,
        "UpdateType": "C",
        "ToConfirmation": [
          {
            "Institution": item?.Institution,
            "Operation": "R",
            "Mealday": item.Dietday,
            "OrderNo": item?.Orderno
          }]
      }

      this.emergencyService.confirmAndCancelDietOrder(payload).subscribe((res: any) => {
        Swal.fire({
          text: 'The diet meal order has been confirmed successfully!',
          icon: 'success',
          confirmButtonText: 'Ok',
          customClass: { popup: 'myalertpopup' },
        });
        this.getOrderDetails();
        this.resetForm();
      }, (error) => {

      })
    } else if(item?.Orderstatusdesc == "Confirmed") {
      Swal.fire({
        text: 'Order Already Confirmed',
        icon: 'warning',
        confirmButtonText: 'Ok',
        customClass: { popup: 'myalertpopup' },
      })
    } else {
      Swal.fire({
        text: 'Cannot Confirm a Cancelled Order',
        icon: 'warning',
        confirmButtonText: 'Ok',
        customClass: { popup: 'myalertpopup' },
      })
    }
  }

  assessmentSetOrder() {
    if (this.assessmentForm.invalid) {
      Swal.fire({
        icon: 'warning',
        text: 'No Date Entered to be Saved! Enter Data or Cancel'
      });
      return;
    }
    let formValue = { ...this.assessmentForm.value };
    formValue.AssessmentDate = this.sanitizeSAPDateFormat(formValue.AssessmentDate);
    formValue.ReAssessmentDate = this.sanitizeSAPDateFormat(formValue.ReAssessmentDate);
    let payload = {
      "Institution": this.paramsObj?.einri,
      "UpdateType": "A",
      "ToAssessment": [formValue]
    }

    this.emergencyService.confirmAndCancelDietOrder(payload).subscribe((res: any) => {
      Swal.fire({
        text: 'Assessment Saved Successfully!',
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: { popup: 'myalertpopup' },
      });
      this.getOrderDetails();
      this.resetForm();
    }, (error) => {

    })
  }

  createAndDeleteDislikeOrder(operation: string) {
    this.isInvalidForm = true;
    if (this.dislikeFoodForm.invalid) {
      return;
    }

    this.isInvalidForm = false;
    let formValue = { ...this.dislikeFoodForm.value };
    delete formValue.NoDislike
    let unmatchedFoodids: any;
    if(this.dislikeDetails) {
      unmatchedFoodids = this.dislikeDetails
        .map(item => item.Foodprefid)
        .filter(foodid => !formValue.Foodid.includes(foodid));
    }

    // Create payload
    let payloadDeleted = {
      "Institution": formValue.Institution,
      "Mrn": formValue.Mrn,
      "Operation": "D",
      "Foodcomment": formValue.Foodcomment,
      "Foodid": unmatchedFoodids ? unmatchedFoodids.join(', ') : formValue.Foodid.join(', ')
    };

    console.log(payloadDeleted);

    formValue.Foodid = formValue.Foodid ? formValue.Foodid.join(', ') : '';

    let payload = {
      "Institution": formValue.Institution,
      "UpdateType": "D",
      "ToDislike": [formValue]
    }

    if (payloadDeleted.Foodid) {
      payload.ToDislike.push(payloadDeleted)
    }

    this.emergencyService.confirmAndCancelDietOrder(payload).subscribe((res: any) => {
      Swal.fire({
        text: 'Dislike Order Saved Successfully!',
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: { popup: 'myalertpopup' },
      });
      this.getOrderDetails();
      this.resetForm();
    }, (error) => {

    })
  }

  saveSnackOrder() {
    let payload = { ...this.snackOrderForm.value }
    payload.Dietday = this.getFormattedDate(payload?.Dietday);
    payload.DietdayTo = this.getFormattedDate(payload?.DietdayTo);
    // payload.Dietdesc = payload.Dietdesc.join(', ');
    payload.ToDietSpecs = [];
    this.emergencyService.saveDeitMealOrder(payload).subscribe((res: any) => {
      Swal.fire({
        text: 'Snack Order Saved Successfully!',
        icon: 'success',
        confirmButtonText: 'Ok',
        customClass: { popup: 'myalertpopup' },
      });
      this.getOrderDetails();
      this.resetForm();
    }, (error) => {

    })
  }

  confirmOrderBtn() {
    if(this.ReferOrEditOrder == 'Referred') {
      Swal.fire({
        text: 'Please save your order before confirming.',
        icon: 'warning',
        confirmButtonText: 'Ok',
        customClass: { popup: 'myalertpopup' },
      });

      return
    }
    if (this.dietMealOrderForm?.value.Orderno ) {
      console.log(this.dietMealOrderForm?.value.Dietday)
      const payload = {
        "Institution": this.dietMealOrderForm?.value.Institution,
        "UpdateType": "C",
        "ToConfirmation": [
          {
            "Institution": this.dietMealOrderForm?.value.Institution,
            "Operation": "R",
            "Mealday": this.getFormattedDate(this.dietMealOrderForm?.value?.Dietday),
            "OrderNo": this.dietMealOrderForm?.value.Orderno
          }]
      }

      this.emergencyService.confirmAndCancelDietOrder(payload).subscribe((res: any) => {
        Swal.fire({
          text: 'The diet meal order has been confirmed successfully!',
          icon: 'success',
          confirmButtonText: 'Ok',
          customClass: { popup: 'myalertpopup' },
        });
        this.getOrderDetails();
        this.resetForm();
      }, (error) => {

      })
    } else {
      Swal.fire({
        text: 'Please save your order before confirming.',
        icon: 'warning',
        confirmButtonText: 'Ok',
        customClass: { popup: 'myalertpopup' },
      });
    }
  }

  dateFormate(item) {
    let timestamp = parseInt(item.match(/\d+/)[0]);
    let date = new Date(timestamp);
    let formattedDate = date.toISOString();
    let datePart = formattedDate.split('T')[0];
    return datePart
  }

  cancelOrder(item?) {
    if (item?.Orderstatusdesc === 'Confirmed') {
      const payload = {
        "Institution": item?.Institution,
        "UpdateType": "C",
        "ToConfirmation": [
          {
            "Institution": item?.Institution,
            "Operation": "C",
            "Mealday": item.Dietday,
            "OrderNo": item?.Orderno
          }]
      }

      this.emergencyService.confirmAndCancelDietOrder(payload).subscribe((res: any) => {
        Swal.fire({
          text: 'The Order is Cancelled successfully!',
          icon: 'success',
          confirmButtonText: 'Ok',
          customClass: { popup: 'myalertpopup' },
        });
        this.getOrderDetails();
        this.resetForm();
      }, (error) => {

      })
    }
     else if (item?.Orderstatusdesc === 'Saved') {
      Swal.fire({
        text: 'No Complete Order to Cancel',
        icon: 'warning',
      })
    } 
    else if (item?.Orderstatusdesc === 'Cancelled') {
      Swal.fire({
        text: 'The Order is Already Cancelled',
        icon: 'warning',
      })
    }
  }

  getFormattedDate(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

  sanitizeSAPDateFormat(date: any) {
    if (typeof (date) === 'string') {
      return date;
    } else {
      return `\/Date(${date.getTime()})\/`
    }
  }

  convertNursingIndicators(data: any) {
    return data.match(/\(([^)]+)\)/g)?.map(item => item.slice(1, -1)).join(", ") || "";
  }

  convertTime(duration: string): string {
    const hoursMatch = duration.match(/(\d+)H/);
    const minutesMatch = duration.match(/(\d+)M/);
    const secondsMatch = duration.match(/(\d+)S/);

    const hours = hoursMatch ? hoursMatch[1].padStart(2, '0') : '00';
    const minutes = minutesMatch ? minutesMatch[1].padStart(2, '0') : '00';
    const seconds = secondsMatch ? secondsMatch[1].padStart(2, '0') : '00';

    return `${hours}:${minutes}:${seconds}`;
  }
}
