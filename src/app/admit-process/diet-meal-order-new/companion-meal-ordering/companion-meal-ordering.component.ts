import { ChangeDetectorRef, Component, NgZone, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-companion-meal-ordering-new',
  templateUrl: './companion-meal-ordering.component.html',
  styleUrls: ['./companion-meal-ordering.component.scss']
})
export class CompanionMealOrderingComponentNew implements OnInit {

  dietOrderForm: FormGroup;
  assessmentForm: FormGroup;
  snckOrderForm: FormGroup;
  modalRef: BsModalRef
  mealList = [
    {
      text: 'Breakfast',
      value: 'breakfast',
    },
    {
      text: 'Lunch',
      value: 'lunch',
    },
    {
      text: 'Dinner',
      value: 'dinner',
    },
  ];

  dietList = [
    {
      text: 'Regular',
      value: 'regular',
    },
    {
      text: 'High Protein',
      value: 'High Protein',
    },
    {
      text: 'Diabetic',
      value: 'Diabetic',
    },
  ];

  snackTimeList = [
    {
      text: 'Morning',
      value: 'morning',
    },
    {
      text: 'Afternoon',
      value: 'afternoon',
    },
    {
      text: 'Evening',
      value: 'evening',
    },
  ];

  consistencyList = [
    {
      text: 'Low Calcium',
      value: 'Low Calcium',
    },
    {
      text: 'Soft',
      value: 'Soft',
    },
    {
      text: 'Full Fluid',
      value: 'Full Fluid',
    },
  ];

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

  dietDescription = [
    {
      text: 'Toast',
      value: 'T'
    },
    {
      text: 'Egg',
      value: 'E'
    },
    {
      text: 'Milk',
      value: 'M'
    },
    {
      text: 'Chesse',
      value: 'C'
    },
    {
      text: 'Labneh',
      value: 'L'
    },
    {
      text: 'Juice',
      value: 'J'
    },
  ]

  data = [
    {
      dietConsistency: 'Soft',
      dietDescription: 'vegan',
      date: '2024-08-16',
      qty: 10,
      comment: 'text',
    },
  ];
  modalType: string;
  dietConsistency: any = [
    {
      text: 'Companion Meal',
      value: 'CM'
    }
  ]
  paramsObj: any;
  companionOrderList: any;
  isInvalidForm: boolean = false;

  constructor(private fb: FormBuilder, private ngZone: NgZone, private modalService: BsModalService,
    private emergencyService: EmergencyService, private route: ActivatedRoute) {
    this.route.queryParams.subscribe((res) => {
      this.paramsObj = res
    })
  }

  ngOnInit(): void {
    this.createForm();
    this.onStartDateChange(null);
    this.companionOrder();
  }

  createForm() {
    this.dietOrderForm = this.fb.group({
      Institution: [this.paramsObj?.einri],
      Mrn: [this.paramsObj?.patnr],
      Mealday: [new Date(), Validators.required],
      Dietconsistency: ["X"],
      Mealtype: ["", Validators.required],
      Caseno: [this.paramsObj?.falnr],
      BreakFastQuantity: [],
      LunchQuantity: [],
      DinnerQuantity: [],
      Comments: ""
    });

    this.snckOrderForm = this.fb.group({
      Mealday: [new Date(), Validators.required],
      Institution: [this.paramsObj?.einri],
      Mrn: [this.paramsObj?.patnr],
      Caseno: [this.paramsObj?.falnr],
      snackTime: ["", Validators.required],
      Quantity: ["", Validators.required],
      snackConsistency: [true, Validators.required],
      snackDescription: [true,Validators.required],
      Comments: ""
    });

  }

  companionOrder() {
    this.emergencyService.fetchCompanionMealOrdering(this.paramsObj?.patnr, this.paramsObj?.falnr).subscribe((res: any) => {
      if (res?.d?.results.length) {
        const sortedResults = res?.d?.results.sort((a, b) => {
          return this.getCreatedDateTime(b) - this.getCreatedDateTime(a);
        });
        this.companionOrderList = sortedResults;
      }
    })
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


  validateNumber(event: any) {
    const input = event.target;
    if (input.value < 1) {
      input.value = ''; // Clear invalid input (zero or negative)
    }
  }

  selectMeal(meal: any, isChecked: any, controlName: string) {
    let currentValue: string = this.dietOrderForm.get('Mealtype')?.value || '';

    if (isChecked.target.checked) {
      if (!currentValue.includes(meal)) {
        currentValue += meal;
      }
    } else {
      currentValue = currentValue.replace(meal, '');
    }

    this.dietOrderForm.get('Mealtype')?.setValue(currentValue);

    let textFieldControl = this.dietOrderForm.get(controlName);

    if (isChecked.target.checked) {
      textFieldControl?.setValidators([Validators.required]);
    } else {
      textFieldControl?.clearValidators();
    }
    textFieldControl?.updateValueAndValidity();
  }

  blockInvalidKeys(event: KeyboardEvent) {
    if (['e', 'E', '+', '-'].includes(event.key)) {
      event.preventDefault();
    }
  }


  createNewDiet(type: string) {
    this.modalType = type;
    this.createForm();
    this.openNav();
  }

  resetForm() {
    this.isInvalidForm = false;
    this.createForm();
    this.closeNav();
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
    console.log(this.dietOrderForm);
    let formData: any = { ...this.dietOrderForm.value }
    this.isInvalidForm = true;
    if (this.dietOrderForm.invalid) {
      return;
    }
    this.isInvalidForm = false;

    if (this.dietOrderForm.valid) {
      formData.Mealday = this.getFormattedDate(formData?.Mealday);
      // formData.BreakFastQuantity = formData.BreakFastQuantity ? formData.BreakFastQuantity : 'Quantity';
      // formData.DinnerQuantity = formData.DinnerQuantity ? formData.DinnerQuantity : 'Quantity';
      // formData.LunchQuantity = formData.LunchQuantity ? formData.LunchQuantity : 'Quantity';
      let payload = {
        "Institution": this.dietOrderForm.value.Institution,
        "UpdateType": "P",
        "ToCompanion": [formData]
      }

      this.emergencyService.confirmAndCancelDietOrder(payload).subscribe((res: any) => {
        this.companionOrder();
        Swal.fire({
          text: 'Companion’s Meal Ordering saved successfully!',
          icon: 'success',
          confirmButtonText: 'Ok',
          customClass: { popup: 'myalertpopup' },
        } as any);
        this.resetForm();
        this.closeNav();
      }, (error) => {
        const messages = error?.error?.error?.innererror?.errordetails
          .filter(detail => detail.code != '/IWBEP/CX_MGW_BUSI_EXCEPTION')
          .map((detail, index) => `${index + 1}) ${detail.message}`)
          .join('<br>');

        Swal.fire({
          title: 'Error Details',
          html: messages,
          icon: 'error',
          customClass: { popup: 'error-details-swal-modal' },
          confirmButtonText: 'Close',
        } as any);
        this.resetForm();
      });
    }
  }

  saveSnackOrder() {
    console.log(this.snckOrderForm, "--")
  }

  public openIndicatorsModal(template: TemplateRef<any>) {
    const config: ModalOptions = {
      class: 'modal-dialog-centered',
    };
    this.modalRef = this.modalService.show(template, config);
  }

  dietConsistencySelect(value, isChecked) {
    if (isChecked.target.checked) {
      this.dietOrderForm.get('Dietconsistency')?.setValue(value);
    } else {
      this.dietOrderForm.get('Dietconsistency')?.setValue('');
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

  dateFormate(item) {
    let timestamp = parseInt(item.match(/\d+/)[0]);
    let date = new Date(timestamp);
    let formattedDate = date.toISOString();
    let datePart = formattedDate.split('T')[0];
    return datePart
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
