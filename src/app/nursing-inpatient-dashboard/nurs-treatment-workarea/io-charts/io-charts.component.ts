import {
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-io-charts',
  templateUrl: './io-charts.component.html',
  styleUrls: ['./io-charts.component.scss'],
})
export class IoChartsComponent implements OnInit {
  newInputRecord = false;
  newOutputRecord = false;
  recordView = false;
  netBalance = 0;
  intakeBalance = 0;
  outputBalance = 0;
  recordViewData: any = {
    data: '',
    title: '',
  };
  inputForm: FormGroup;
  outputForm: FormGroup;
  modalForm: FormGroup;
  pushCategory = '';
  customType = '';
  inCategories = [
    'Oral',
    'Enteral (GI)',
    'Parenteral',
    'IV Fluids',
    'Blood Products',
    'Other',
  ];
  inTypes = {
    Oral: ['Fluids', 'Food', 'Medications', 'Supplements', '+ Add New Type'],
    'Enteral (GI)': [
      'Water',
      'Smashed Food',
      'Feeding Formula',
      '+ Add New Type',
    ],
    Parenteral: ['Total Parenteral Nutrition(TPN)'],
    'IV Fluids': [
      'NS 0.9%',
      'Saline 0.45%',
      'D5W',
      'GS 0.9%',
      'GS 0.45%',
      'Saline 3%',
      'LR',
      'Line Flush',
      'Bolus',
      'Hemodialysis',
      'Peritoneal Dialysis',
      'Medications',
      'Electrolytes',
      'Albumin',
      '+ Add New Type',
    ],
    'Blood Products': [
      'Whole Blood',
      'PRBCs',
      'FFP',
      'Platelets',
      'Cryoprecipitate',
      '+ Add New Type',
    ],
    Other: [''],
  };
  outTypes = {
    Urine: [
      'Void',
      'Urinal',
      'Condom',
      "Foley's Catheter",
      'Suprapubic',
      'Catheter',
      '+ Add New Type',
    ],
    Stool: ['Void', 'Bedpan', 'Colostomy', 'Diaper', '+ Add New Type'],
    'Emesis (Vomit)': ['Oral', 'NGT', 'OGT', 'PEGT', '+ Add New Type'],
    Drainage: [
      'Chest',
      'Tube',
      'Biliary',
      'CSF',
      'Peritoneal Dialysis',
      'Hemodialysis',
      'Redi-Vac',
      'Pigtail',
      'Surgical',
      'Bleeding',
      'Suction',
      'Abdominal',
      '+ Add New Type',
    ],
  };
  outCategories = ['Urine', 'Stool', 'Emesis (Vomit)', 'Drainage', 'Other'];
  modalRefForSave: BsModalRef;
  currentDate: any;
  currentTime: any;
  selectedIndex = 0;
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
    this.currentDate = currentDate;
    // Set current time
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;
    this.currentTime = currentTime;
    this.createOutputForm();
    this.createInputForm();
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

  onSelectType(event, template: TemplateRef<any>, index, category: any) {
    if (event.includes('+')) {
      const config: ModalOptions = {
        class: 'modal-dialog-centered modal-diagnosis',
      };
      this.modalForm = this.inputForm;
      this.pushCategory = category;
      this.selectedIndex = index;
      this.modalRefForSave = this.modalService.show(template, config);
    } else {
      this.inputTypeChange(event, index);
    }
  }
  onoutputSelectType(event, template: TemplateRef<any>, index, category: any) {
    if (event.includes('+')) {
      const config: ModalOptions = {
        class: 'modal-dialog-centered modal-diagnosis',
      };
      this.modalForm = this.outputForm;
      this.pushCategory = category;
      this.selectedIndex = index;
      this.modalRefForSave = this.modalService.show(template, config);
    } else {
      this.outputTypeChange(event, index);
    }
  }

  saveModal(type) {
    if (type == 'save' && this.customType != '') {
      let types;
      if (this.modalForm === this.inputForm) {
        types = this.inTypes;
      } else {
        types = this.outTypes;
      }
      types[this.pushCategory].splice(
        types[this.pushCategory].length - 1,
        0,
        this.customType
      );
      this.modalForm.controls.rows['controls'][this.selectedIndex]['controls'][
        'type'
      ].setValue(this.customType);
      this.modalRefForSave.hide();
    } else {
      this.modalForm.controls.rows['controls'][this.selectedIndex]['controls'][
        'type'
      ].setValue(null);
    }
  }

  addinputRowAfter(index: number) {
    if (
      this.inputrows.controls[index]['controls']['type'].value === null ||
      this.inputrows.controls[index]['controls']['volume'].value == ''
    ) {
      this.inputrows.controls[index]['controls']['type'].setErrors({
        required: true,
      });
      this.inputrows.controls[index]['controls']['volume'].setErrors({
        required: true,
      });
      this.inputrows.controls[index]['controls']['type'].markAsTouched();
      this.inputrows.controls[index]['controls']['type'].markAsDirty();
      this.inputrows.controls[index]['controls']['volume'].markAsTouched();
      this.inputrows.controls[index]['controls']['volume'].markAsDirty();
      this.cdr.detectChanges();
      return;
    }
    if (
      this.inputrows.controls[index + 1] &&
      this.inputrows.controls[index + 1].status === 'INVALID' &&
      this.inputrows.controls[index + 1].value.action === 'minus'
    ) {
      this.inputrows.controls[index + 1]['controls']['type'].markAsTouched();
      this.inputrows.controls[index + 1]['controls']['type'].markAsDirty();
      this.inputrows.controls[index + 1]['controls']['volume'].markAsTouched();
      this.inputrows.controls[index + 1]['controls']['volume'].markAsDirty();
      return;
    }
    const category = this.inputrows.value[index].category;
    const type =
      this.inTypes[category].length === 1 ? this.inTypes[category][0] : null;
    const newRow = this.fb.group({
      category: [category, Validators.required],
      type: [type, Validators.required],
      volume: [null, Validators.required],
      uom: ['mL'],
      remarks: [''],
      action: ['minus'],
    });
    this.inputrows.insert(index + 1, newRow);
  }
  addoutputRowAfter(index: number) {
    if (
      this.outputrows.controls[index]['controls']['type'].value === null ||
      this.outputrows.controls[index]['controls']['volume'].value == ''
    ) {
      this.outputrows.controls[index]['controls']['type'].setErrors({
        required: true,
      });
      this.outputrows.controls[index]['controls']['volume'].setErrors({
        required: true,
      });
      this.outputrows.controls[index]['controls']['type'].markAsTouched();
      this.outputrows.controls[index]['controls']['type'].markAsDirty();
      this.outputrows.controls[index]['controls']['volume'].markAsTouched();
      this.outputrows.controls[index]['controls']['volume'].markAsDirty();
      this.cdr.detectChanges();
      return;
    }
    if (
      this.outputrows.controls[index + 1] &&
      this.outputrows.controls[index + 1].status === 'INVALID' &&
      this.outputrows.controls[index + 1].value.action === 'minus'
    ) {
      this.outputrows.controls[index + 1]['controls']['type'].markAsTouched();
      this.outputrows.controls[index + 1]['controls']['type'].markAsDirty();
      this.outputrows.controls[index + 1]['controls']['volume'].markAsTouched();
      this.outputrows.controls[index + 1]['controls']['volume'].markAsDirty();
      return;
    }
    const category = this.outputrows.value[index].category;
    // const type = this.outputrows.value[index].type;
    const newRow = this.fb.group({
      category: [category, Validators.required],
      type: [null, Validators.required],
      volume: [null, Validators.required],
      uom: ['mL'],
      remarks: [''],
      action: ['minus'],
    });
    this.outputrows.insert(index + 1, newRow);
  }

  outputdeleteRow(i) {
    this.outputrows.removeAt(i);
  }

  inputdeleteRow(i) {
    this.inputrows.removeAt(i);
  }

  outputTypeChange(event, i) {
    const volumeControl = (this.outputForm.get('rows') as FormArray)
      .at(i)
      .get('volume');
    if (event) {
      volumeControl?.setValidators(Validators.required);
    } else {
      volumeControl?.clearValidators();
    }
    volumeControl?.updateValueAndValidity();
  }

  inputTypeChange(event, i) {
    const volumeControl = (this.inputForm.get('rows') as FormArray)
      .at(i)
      .get('volume');
    if (event) {
      volumeControl?.setValidators(Validators.required);
    } else {
      volumeControl?.clearValidators();
    }
    volumeControl?.updateValueAndValidity();
  }

  inputVolumeChange(event, i) {
    console.log(event);
    const typeControl = (this.inputForm.get('rows') as FormArray)
      .at(i)
      .get('type');
    if (event) {
      typeControl?.setValidators(Validators.required);
    } else {
      typeControl?.clearValidators();
    }
    typeControl?.updateValueAndValidity();
  }

  outputVolumeChange(event, i) {
    console.log(event);
    const typeControl = (this.outputForm.get('rows') as FormArray)
      .at(i)
      .get('type');
    if (event) {
      typeControl?.setValidators(Validators.required);
    } else {
      typeControl?.clearValidators();
    }
    typeControl?.updateValueAndValidity();
  }

  outputFormCancel() {
    const hasValue = this.outputForm.value.rows.some(
      (item) => item.volume > 0 || item.type != null
    );
    if (hasValue) {
      Swal.fire({
        text: 'Unsaved Data will be Lost, are you sure?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        customClass: { popup: 'myalertpopup' },
      }).then((result) => {
        if (result.isConfirmed) {
          this.outputForm.reset();
          this.createOutputForm();
          this.newOutputRecord = false;
        }
      });
    } else {
      this.outputForm.reset();
      this.createOutputForm();
      this.newOutputRecord = false;
    }
  }
  inputFormCancel() {
    const hasValue = this.inputForm.value.rows.some(
      (item) =>
        item.volume > 0 ||
        (item.category != 'Parenteral' &&
          item.type != '' &&
          item.type != null) ||
        (item.category == 'Parenteral' && item.volume > 0)
    );
    if (hasValue) {
      Swal.fire({
        text: 'Unsaved Data will be Lost, are you sure?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        customClass: { popup: 'myalertpopup' },
      }).then((result) => {
        console.log(result);

        if (result.isConfirmed) {
          this.inputForm.reset();
          this.createInputForm();
          this.newInputRecord = false;
        }
      });
    } else {
      this.inputForm.reset();
      this.createInputForm();
      this.newInputRecord = false;
    }
  }

  backEvent(event: any) {
    this.recordView = false;
  }

  createOutputForm() {
    this.outputForm = this.fb.group({
      date: [this.currentDate],
      time: [this.currentTime],
      rows: this.fb.array(
        this.outCategories.map((category, index) => {
          // const type = this.outTypes[category][0];
          return this.fb.group({
            category: [category, Validators.required],
            type: [null],
            volume: [null],
            uom: ['mL'],
            remarks: [''],
            action: ['plus'],
          });
        })
      ),
    });
  }

  createInputForm() {
    this.inputForm = this.fb.group({
      date: [this.currentDate],
      time: [this.currentTime],
      rows: this.fb.array(
        this.inCategories.map((category, index) => {
          const type =
            this.inTypes[category].length === 1
              ? this.inTypes[category][0]
              : null;
          return this.fb.group({
            category: [category, Validators.required],
            type: [type],
            volume: [null],
            uom: ['mL'],
            remarks: [''],
            action: ['plus'],
          });
        })
      ),
    });
  }

  viewRecord(text: string) {
    this.recordViewData.title = text;
    this.recordView = !this.recordView && this.recordViewData;
  }

  mergeDataByCategory(tableData) {
    const mergedData = [];
    tableData.forEach((entry) => {
      const existingEntry = mergedData.find(
        (item) => item.category === entry.category
      );
      if (existingEntry) {
        existingEntry.subRows.push(...entry.subRows);
      } else {
        mergedData.push({
          category: entry.category,
          date: entry.date,
          time: entry.time,
          enteredBy: entry.enteredBy,
          subRows: [...entry.subRows],
        });
      }
    });
    return mergedData;
  }

  outputSubmit() {
    if (this.outputForm.invalid) {
      this.outputForm.markAllAsTouched();
    } else {
      const json = this.outputForm.value;
      const hasValue = json.rows.some((item) => item.volume > 0);
      json.rows.forEach((item) => (this.outputBalance += item.volume));
      if (hasValue) {
        const tableData = this.convertJsonToTableData(json);
        const mergedData = this.mergeDataByCategory(tableData);
        this.recordViewData.data = mergedData;
        this.recordViewData.title = 'Output';
        this.netBalance = this.intakeBalance - this.outputBalance;
        this.outputForm.reset();
        this.createOutputForm();
        Swal.fire({
          text: 'Data Saved Successfully!',
          icon: 'success',
          confirmButtonText: 'Ok',
          customClass: { popup: 'myalertpopup' },
        });
      } else {
        Swal.fire({
          text: 'No Data To be Saved!',
          icon: 'warning',
          confirmButtonText: 'Ok',
          customClass: { popup: 'myalertpopup' },
        });
      }
    }
  }

  inputSubmit() {
    if (this.inputForm.invalid) {
      this.inputForm.markAllAsTouched();
    } else {
      const json = this.inputForm.value;
      console.log('json', json);

      json.rows.forEach((item) => (this.intakeBalance += item.volume));
      const hasValue = json.rows.some((item) => item.volume > 0);
      if (hasValue) {
        const tableData = this.convertJsonToTableData(json);
        const mergedData = this.mergeDataByCategory(tableData);
        this.recordViewData.data = mergedData;
        this.recordViewData.title = 'Intake';
        this.netBalance = this.intakeBalance - this.outputBalance;
        this.inputForm.reset();
        this.createInputForm();
        Swal.fire({
          text: 'Data Saved Successfully!',
          icon: 'success',
          confirmButtonText: 'Ok',
          customClass: { popup: 'myalertpopup' },
        });
      } else {
        Swal.fire({
          text: 'No Data To be Saved!',
          icon: 'warning',
          confirmButtonText: 'Ok',
          customClass: { popup: 'myalertpopup' },
        });
      }
      // this.recordView = true;
    }
  }

  convertJsonToTableData(jsonData) {
    return jsonData.rows
      .map((row) => {
        return {
          category: row.category,
          date: jsonData.date, // Use appropriate date conversion here
          time: jsonData.time, // Use appropriate time conversion here
          enteredBy: 'Saja Oweisy',
          subRows:
            row.type !== null && row.volume > 0
              ? [
                  {
                    type: row.type,
                    value: `${row.volume || '0'} ${row.uom || 'mL'}`,
                    remarks: row.remarks,
                  },
                ]
              : [],
        };
      })
      .filter((entry) => entry.subRows.length > 0); // Filter out entries with empty subRows
  }
}
