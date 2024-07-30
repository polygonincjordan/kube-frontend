import {
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-io-charts',
  templateUrl: './io-charts.component.html',
  styleUrls: ['./io-charts.component.scss'],
})
export class IoChartsComponent implements OnInit {
  newInputRecord = false;
  newOutputRecord = false;
  recordView = false;
  recordViewText = '';
  inputForm: FormGroup;
  outputForm: FormGroup;
  inCategories = [
    'Oral',
    'Enteral (GI)',
    'Parenteral',
    'IV Fluids',
    'Blood Products',
    'Other',
  ];
  inTypes = {
    Oral: [
      'Fluids',
      'Food',
      'Medications',
      'Supplements',
      'Other',
      '+ Add New Type',
    ],
    'Enteral (GI)': [
      'Fluids',
      'Food',
      'Medications',
      'Supplements',
      'Other',
      '+ Add New Type',
    ],
    Parenteral: ['Total Parenteral Nutrition(TPN)'],
    'IV Fluids': [
      'Fluids',
      'Food',
      'Medications',
      'Supplements',
      'Other',
      '+ Add New Type',
    ],
    'Blood Products': [
      'Fluids',
      'Food',
      'Medications',
      'Supplements',
      'Other',
      '+ Add New Type',
    ],
    Other: [''],
  };
  outCategories = ['Urine', 'Stool', 'Emesis (Vomit)', 'Drainage', 'Other'];
  modalRefForSave: BsModalRef;
  constructor(
    private fb: FormBuilder,
    public modalService: BsModalService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const now = new Date();

    // Set current date
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const year = now.getFullYear();
    const currentDate = `${day}.${month}.${year}`;

    // Set current time
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;

    // Initialize the form with current date and time
    // this.inputForm = this.fb.group({
    //   date: [currentDate],
    //   time: [currentTime],
    // });
    // this.outputForm = this.fb.group({
    //   date: [currentDate],
    //   time: [currentTime],
    // });
    this.inputForm = this.fb.group({
      date: [currentDate],
      time: [currentTime],
      rows: this.fb.array(
        this.inCategories.map((category, index) => {
          const type =
            this.inTypes[category].length === 1
              ? this.inTypes[category][0]
              : '';
          return this.fb.group({
            category: [category, Validators.required],
            type: [type, Validators.required],
            volume: ['', Validators.required],
            uom: ['mL'],
            remarks: [''],
            action: ['plus'],
            // lastRecord: [''],
          });
        })
      ),
    });
    this.outputForm = this.fb.group({
      date: [currentDate],
      time: [currentTime],
      rows: this.fb.array(
        this.outCategories.map((category, index) => {
          // const type = this.outTypes[category][0];
          return this.fb.group({
            category: [category, Validators.required],
            type: ['', Validators.required],
            volume: ['', Validators.required],
            uom: ['mL'],
            remarks: [''],
            action: ['plus'],
            // lastRecord: [''],
          });
        })
      ),
    });
  }

  inputrowName(i) {
    return this.inputForm.controls.rows['value'][i];
  }
  outputrowName(i) {
    return this.outputForm.controls.rows['value'][i];
  }

  get inputrows(): FormArray {
    return this.inputForm.get('rows') as FormArray;
  }
  get outputrows(): FormArray {
    return this.outputForm.get('rows') as FormArray;
  }

  onSelectType(event, template: TemplateRef<any>) {
    if (event.includes('+')) {
      const config: ModalOptions = {
        class: 'modal-dialog-centered modal-diagnosis',
      };
      this.modalRefForSave = this.modalService.show(template, config);
    }
  }

  saveModal() {}

  addinputRowAfter(index: number) {
    if (this.inputrows.controls[index].status === 'INVALID') {
      this.inputrows.controls[index]['controls']['type'].markAsTouched();
      this.inputrows.controls[index]['controls']['type'].markAsDirty();
      this.inputrows.controls[index]['controls']['volume'].markAsTouched();
      this.inputrows.controls[index]['controls']['volume'].markAsDirty();
      this.cdr.detectChanges();
      return;
    }
    const category = this.inputrows.value[index].category;
    const type = this.inputrows.value[index].type;
    const newRow = this.fb.group({
      category: [category, Validators.required],
      type: [type, Validators.required],
      volume: ['', Validators.required],
      uom: ['mL'],
      remarks: [''],
      action: ['minus'],
      // lastRecord: [''],
    });

    this.inputrows.insert(index + 1, newRow);
  }
  addoutputRowAfter(index: number) {
    const category = this.outputrows.value[index].category;
    const type = this.outputrows.value[index].type;
    const newRow = this.fb.group({
      category: [category, Validators.required],
      type: [type, Validators.required],
      volume: ['', Validators.required],
      uom: ['mL'],
      remarks: [''],
      action: ['minus'],
      // lastRecord: [''],
    });

    this.outputrows.insert(index + 1, newRow);
  }
  outputdeleteRow(i) {
    this.outputrows.removeAt(i);
  }
  inputdeleteRow(i) {
    this.inputrows.removeAt(i);
  }

  viewRecord(text: string) {
    this.recordViewText = text;
    this.recordView = !this.recordView;
  }

  outputSubmit() {
    console.log('outputSubmit', this.outputForm.value);
    this.outputForm.markAllAsTouched();
  }
  inputSubmit() {
    console.log('inputSubmit', this.inputForm.value);
    this.inputForm.markAllAsTouched();
  }
}
