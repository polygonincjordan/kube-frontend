import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
declare var document: any;
@Component({
  selector: 'app-patients-diet-meal',
  templateUrl: './patients-diet-meal.component.html',
  styleUrls: ['./patients-diet-meal.component.scss'],
})
export class PatientsDietMealComponent implements OnInit {
  dietOrderForm: FormGroup;
  mealList = [
    {
      text: 'Breakfast',
      value: 'breakfast',
    },
    {
      text: 'Snack',
      value: 'snack',
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

  data = [
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
      startDate: '2024-08-16T13:47:22.752Z',
      startTime: '12:00',
      endDate: '2024-08-26T13:47:22.752Z',
      endTime: '07:00',
      status: 'pending',
      Irradiated: {
        yes: true,
        no: false,
      },
      remarks: 'jkeivn',
    },
  ];

  constructor(private fb: FormBuilder, private ngZone: NgZone) {}

  ngOnInit(): void {
    this.createForm();
    this.onStartDateChange(null);
  }

  createForm() {
    this.dietOrderForm = this.fb.group({
      npo: [false],
      dietCategory: ['normal'],
      mealType: [null, Validators.required],
      dietType: [null, Validators.required],
      dietConsistency: ['', Validators.required],
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
  }

  createNewDiet() {
    this.createForm();
    this.openNav();
  }

  resetForm() {
    this.dietOrderForm.reset();
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
    console.log(this.dietOrderForm.controls);

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
          carbohydrates: formValues.carbohydrates,
          proteins: formValues.proteins,
          calories: formValues.calories,
          sodium: formValues.sodium,
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
        // customClass: 'myalertpopup',
      });
    } else {
      this.dietOrderForm.markAllAsTouched(); // Mark all controls as touched to show validation errors
    }
  }
}
