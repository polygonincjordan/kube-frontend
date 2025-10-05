import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  TemplateRef,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Patient } from '@services/e-kardex/interfaces/patient';
import { PatientService } from '@services/e-kardex/patient.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { catchError, of, tap } from 'rxjs';
import Swal from 'sweetalert2';

@UntilDestroy()
@Component({
  selector: 'app-io-charts-new',
  templateUrl: './io-charts.component.html',
  styleUrls: ['./io-charts.component.scss'],
})
export class IoChartsComponentNew implements OnInit {
  @Input() patientDetails: any;
  newInputRecord = false;
  newOutputRecord = false;
  recordView = false;
  viewHistory = false;
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
  modalRefForEndChart: BsModalRef;
  currentDate: any;
  Comments: any;
  currentTime: any;
  selectedIndex = 0;
  paramsObj: any;
  categoryList: any = [];
  categoryTypeCodeList: any = [];
  isLoading: boolean;
  isError: boolean;
  encounterId: any;
  endChartComment: string
  startEndChartDetail: any = [];
  constructor(
    private fb: FormBuilder,
    public modalService: BsModalService,
    private cdr: ChangeDetectorRef,
    private emergencyService: EmergencyService,
    private route: ActivatedRoute,
    private patientService: PatientService,
    private cd: ChangeDetectorRef
  ) {
    this.route.queryParams.subscribe((params) => {
      this.paramsObj = params;
    });
    this.encounterId =
      this.paramsObj.einri + this.paramsObj.falnr + this.paramsObj.lfdnr;
    this.getDataPatient(this.encounterId);
  }

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

    this.ioCategoryList();
    this.startEndChartDetails();
  }

  public getDataPatient(encounterId) {
    this.patientService
      .getDataPatient(encounterId)
      .pipe(
        tap(() => (this.isLoading = false)),
        untilDestroyed(this),
        catchError(() => {
          this.isError = true;
          this.isLoading = false;
          return of({} as Patient);
        })
      )
      .subscribe((patientData: any) => {
        this.isLoading = false;
        this.patientDetails = patientData.d;
      });
  }

  ioCategoryList() {
    this.emergencyService.ioChartCategoryList().subscribe((res: any) => {
      this.categoryList = res?.d?.results;
      this.ioCategoryTypeCode();
    });
  }

  convertTypeCodeList;
  ioCategoryTypeCode() {
    this.emergencyService
      .ioChartCategoryTypeCodeList()
      .subscribe((res: any) => {
        this.categoryTypeCodeList = res?.d?.results;
        this.convertTypeCodeList = this.categoryTypeCodeList.reduce(
          (acc, current) => {
            if (!acc[current.Catdescription]) {
              acc[current.Catdescription] = []; // Initialize array for each unique Catdescription
            }
            acc[current.Catdescription].push({
              Catdescription: current.Catdescription,
              TypeCode: current.TypeCode,
              Description: current.Description,
              Cattype: current.Cattype,
            });
            return acc;
          },
          {}
        );

        // Object.keys(this.convertTypeCodeList).forEach((name) => {
        //   this.convertTypeCodeList[name].push({
        //     Description: '+ Add New Type',
        //   });
        // });

        this.ioChartFormDetails();

        this.createInputForm();
        this.createOutputForm();
      });
  }

  ioChartFormDetails() {
    this.emergencyService
      .ioChartFullDeatials(this.paramsObj.patnr, this.paramsObj.falnr)
      .subscribe((res: any) => {
        if(res.d.results) {
          this.intakeBalance = res.d.results.flatMap(header => header.HEADER_TO_ITEM.results)
          .filter(item => item.RecdType === "I")
          .reduce((sum, item) => sum + parseFloat(item.RecdVol), 0);

          this.outputBalance = res.d.results.flatMap(header => header.HEADER_TO_ITEM.results)
          .filter(item => item.RecdType === "O")
          .reduce((sum, item) => sum + parseFloat(item.RecdVol), 0);

          this.netBalance = this.intakeBalance - this.outputBalance;
        }
      });
  }

  startEndChartDetails() {
    this.emergencyService
      .startEndChartDetails(this.paramsObj.patnr, this.paramsObj.falnr)
      .subscribe((res: any) => {
        console.log(res);
        this.startEndChartDetail = res?.d?.results
      });
  }

  groupByCode(data) {
    const groupedData = data.reduce((acc, item) => {
      const catcode = item.Catcode;
    
      if (!acc[catcode]) {
        acc[catcode] = []; // Initialize the array for this Catcode
      }
      
      acc[catcode].push(item); // Push the current item into the corresponding Catcode group
      return acc;
    }, {});

    return groupedData
  }

  parseDate(date: string) {
    if (date) {
      return new Date(new Date(+(date.replace('/Date(', '').replace(')/', ''))).toLocaleDateString("en-US"));
    }
  }

  getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;
    return  currentTime;
  }

  addNewrecord(type: string) {
    if(this.startEndChartDetail.length) {
      this.inputForm.patchValue({
        CreatedAt: this.getCurrentTime()
      })
      this.outputForm.patchValue({
        CreatedAt: this.getCurrentTime()
      })
      if(type === 'intake' ) {
        this.newInputRecord = !this.newInputRecord;
        this.newOutputRecord = false;
      } else {
        this.newOutputRecord = !this.newOutputRecord; 
        this.newInputRecord = false
      } 
    } else {
      Swal.fire({
        text : 'I & O Chart is Not Open. Please Start it First to Add Data',
        icon: 'warning',
        // customClass: 'font-size-text-center',
        confirmButtonText: 'Okay',
        cancelButtonText: 'No',
      })
    }

  }

  convertDurationToTime(duration) {
    if(duration) {
      const regex = /PT(\d+H)?(\d+M)?(\d+S)?/;
      const matches = duration.match(regex);
      const hours = matches[1] ? parseInt(matches[1].replace('H', '')) : 0;
      const minutes = matches[2] ? parseInt(matches[2].replace('M', '')) : 0;
      const formattedHours = hours.toString().padStart(2, '0');
      const formattedMinutes = minutes.toString().padStart(2, '0');
      return `${formattedHours}:${formattedMinutes}`;
    }
}

  inputrowName(i) {
    return this.inputForm.controls.HEADER_TO_ITEM['value'][i];
  }
  outputrowName(i) {
    return this.outputForm.controls.HEADER_TO_ITEM['value'][i];
  }

  get inputrows(): FormArray {
    return this.inputForm.get('HEADER_TO_ITEM') as FormArray;
  }
  get outputrows(): FormArray {
    return this.outputForm.get('HEADER_TO_ITEM') as FormArray;
  }

  onSelectType(event, template: TemplateRef<any>, index, category: any) {
    let filterArray = this.categoryTypeCodeList.filter(
      (res) => res.TypeCode === event
    );

    // if(filterArray.length) {
    //   this.inputTypeChange(filterArray[0]?.Description, index);
    // } else {
      if (event == 'OTHS') {
        const config: ModalOptions = {
          class: 'modal-dialog-centered modal-diagnosis',
          backdrop: 'static',
          keyboard: false
        };
        this.modalForm = this.inputForm;
        this.pushCategory = category;
        this.selectedIndex = index;
        this.modalRefForSave = this.modalService.show(template, config);
      } else {
        this.inputTypeChange(filterArray[0]?.Description, index);
      }
    // }

  }
  onoutputSelectType(event, template: TemplateRef<any>, index, category: any) {
    let filterArray = this.categoryTypeCodeList.filter(
      (res) => res.TypeCode === event
    );
    // if(filterArray.length) {
    //   this.outputTypeChange(event?.Description, index);
    // } else {
      if (event == 'OTHS' ) {
        const config: ModalOptions = {
          class: 'modal-dialog-centered modal-diagnosis',
        };
        this.modalForm = this.outputForm;
        this.pushCategory = category;
        this.selectedIndex = index;
        this.modalRefForSave = this.modalService.show(template, config);
      } else {
        this.outputTypeChange(filterArray[0]?.Description, index);
      }
    // }
  }

  openModalForEndChart(template: TemplateRef<any>) {
    if(this.startEndChartDetail.length == 0) {
      Swal.fire({
        text: 'There is No Active I & O Chart',
        icon: 'warning',
        confirmButtonText: 'Okay',
        // customClass: 'myalertpopup',
      })
      return;
    }
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-sl',
      backdrop:'static',
      keyboard: false
    };
    this.modalRefForEndChart = this.modalService.show(template, config);
  }

  saveModal(type) {
    if (type == 'save' && this.customType != '') {
      let types;
      let Cattype
      if (this.modalForm === this.inputForm) {
        Cattype = "I";
        types = this.convertTypeCodeList;
      } else {
        Cattype = "O";
        types = this.convertTypeCodeList;
      }
      let othTypeCodes = this.convertTypeCodeList[this.pushCategory]
      .map(item => item.TypeCode)
      .filter(code => code.startsWith("OTHS") && code.length > 4) // Ensure it has a numeric part
      .map(code => parseInt(code.substring(4), 10)) // Extract numeric part
      .filter(num => !isNaN(num)); // Exclude invalid numbers
  
      let nextNumber = othTypeCodes.length ? Math.max(...othTypeCodes) + 1 : 0;

    let newTypeCode = `OTHS${nextNumber}`;
      let typeObj = {
        // Typedesc: this.customType,
        Catdescription: this.pushCategory,
        TypeCode: newTypeCode,
        Description: this.customType,
        Cattype: Cattype,
      };
      types[this.pushCategory].splice(
        types[this.pushCategory].length - 1,
        0,
        typeObj
      );
      this.modalForm.controls.HEADER_TO_ITEM['controls'][this.selectedIndex][
        'controls'
      ]['Typecode'].setValue(newTypeCode);
      this.modalForm.controls.HEADER_TO_ITEM['controls'][this.selectedIndex][
        'controls'
      ]['Typedesc'].setValue(this.customType);
      this.modalRefForSave.hide();
    } else {
      this.modalForm.controls.HEADER_TO_ITEM['controls'][this.selectedIndex][
        'controls'
      ]['Typecode'].setValue(null);
    }
    this.cd.detectChanges();
    this.customType = ''
  }

  addinputRowAfter(index: number) {
    if (
      this.inputrows.controls[index]['controls']['Typecode'].value === null ||
      this.inputrows.controls[index]['controls']['RecdVol'].value == ''
    ) {
      this.inputrows.controls[index]['controls']['Typecode'].setErrors({
        required: true,
      });
      this.inputrows.controls[index]['controls']['RecdVol'].setErrors({
        required: true,
      });
      this.inputrows.controls[index]['controls']['Typecode'].markAsTouched();
      this.inputrows.controls[index]['controls']['Typecode'].markAsDirty();
      this.inputrows.controls[index]['controls']['RecdVol'].markAsTouched();
      this.inputrows.controls[index]['controls']['RecdVol'].markAsDirty();
      this.cdr.detectChanges();
      return;
    }
    if (
      this.inputrows.controls[index + 1] &&
      this.inputrows.controls[index + 1].status === 'INVALID' &&
      this.inputrows.controls[index + 1].value.action === 'minus'
    ) {
      this.inputrows.controls[index + 1]['controls']['Catcode'].markAsTouched();
      this.inputrows.controls[index + 1]['controls']['Catcode'].markAsDirty();
      this.inputrows.controls[index + 1]['controls']['RecdVol'].markAsTouched();
      this.inputrows.controls[index + 1]['controls']['RecdVol'].markAsDirty();
      return;
    }
    const category = this.inputrows.value[index];
    let matchingItems = this.categoryTypeCodeList.filter(
      (item) => item.Catdescription === category.category
    );
    let type = matchingItems.length === 1 ? matchingItems[0].Description : null;
    // const type =
    //   this.inTypes[category].length === 1 ? this.inTypes[category][0] : null;
    const newRow = this.fb.group({
      category: [category?.category, Validators.required],
      Typecode: [type, Validators.required],
      RecdVol: [null, Validators.required],
      RecdUnit: ['mL'],
      Remarks: [''],
      action: ['minus'],
      RecordNo: '',
      Itemno: "",
      Einri: this.paramsObj?.einri,
      MRN: this.paramsObj?.patnr,
      Case: this.paramsObj?.falnr,
      RecdType: 'I',
      Roomno: this.patientDetails?.room,
      Bedno: this.patientDetails?.bed,
      StartOu: this.patientDetails?.room,
      AttendDoc: this.patientDetails?.PhysicianAtt,
      Catcode: [category?.Catcode],
      Status: '',
      Typedesc: ''
      // Typecode: [type],
      // RecdUnit: ['mL'],
      // Remarks: '',
      // category: [category.Description, Validators.required],
      // RecdVol: [null],
      // action: ['plus'],
    });
    
    this.inputrows.insert(index + 1, newRow);
  }
  addoutputRowAfter(index: number) {
    if (
      this.outputrows.controls[index]['controls']['Catcode'].value === null ||
      this.outputrows.controls[index]['controls']['RecdVol'].value == ''
    ) {
      this.outputrows.controls[index]['controls']['Catcode'].setErrors({
        required: true,
      });
      this.outputrows.controls[index]['controls']['RecdVol'].setErrors({
        required: true,
      });
      this.outputrows.controls[index]['controls']['Catcode'].markAsTouched();
      this.outputrows.controls[index]['controls']['Catcode'].markAsDirty();
      this.outputrows.controls[index]['controls']['RecdVol'].markAsTouched();
      this.outputrows.controls[index]['controls']['RecdVol'].markAsDirty();
      this.cdr.detectChanges();
      return;
    }
    if (
      this.outputrows.controls[index + 1] &&
      this.outputrows.controls[index + 1].status === 'INVALID' &&
      this.outputrows.controls[index + 1].value.action === 'minus'
    ) {
      this.outputrows.controls[index + 1]['controls'][
        'Catcode'
      ].markAsTouched();
      this.outputrows.controls[index + 1]['controls']['Catcode'].markAsDirty();
      this.outputrows.controls[index + 1]['controls'][
        'RecdVol'
      ].markAsTouched();
      this.outputrows.controls[index + 1]['controls']['RecdVol'].markAsDirty();
      return;
    }
    const category = this.outputrows.value[index];
    let matchingItems = this.categoryTypeCodeList.filter(
      (item) => item.Catdescription === category.category
    );
    let type = matchingItems.length === 1 ? matchingItems[0].Description : null;
    const newRow = this.fb.group({
      category: [category?.category, Validators.required],
      Typecode: [type, Validators.required],
      RecdVol: [null, Validators.required],
      RecdUnit: ['mL'],
      Remarks: [''],
      action: ['minus'],
      RecordNo: '',
      Itemno: "",
      Einri: this.paramsObj?.einri,
      MRN: this.paramsObj?.patnr,
      Case: this.paramsObj?.falnr,
      RecdType: 'O',
      Roomno: this.patientDetails?.room,
      Bedno: this.patientDetails?.bed,
      StartOu: this.patientDetails?.room,
      AttendDoc: this.patientDetails?.PhysicianAtt,
      Catcode: [category?.Catcode],
      Status: '',
      Typedesc: ''
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
    const volumeControl = (this.outputForm.get('HEADER_TO_ITEM') as FormArray)
      .at(i)
      .get('RecdVol');
    if (event) {
      volumeControl?.setValidators(Validators.required);
    } else {
      volumeControl?.clearValidators();
    }
    volumeControl?.updateValueAndValidity();
  }

  inputTypeChange(event, i) {
    const volumeControl = (this.inputForm.get('HEADER_TO_ITEM') as FormArray)
      .at(i)
      .get('RecdVol');
    if (event) {
      volumeControl?.setValidators(Validators.required);
    } else {
      volumeControl?.clearValidators();
    }
    volumeControl?.updateValueAndValidity();
  }

  inputVolumeChange(event, i) {
    const typeControl = (this.inputForm.get('HEADER_TO_ITEM') as FormArray)
      .at(i)
      .get('Catcode');
    if (event) {
      typeControl?.setValidators(Validators.required);
    } else {
      typeControl?.clearValidators();
    }
    typeControl?.updateValueAndValidity();
  }

  blockInvalidKeys(event: KeyboardEvent) {
    // Block keys like 'e', 'E', '+', '-', and others
    if (['e', 'E', '+', '-'].includes(event.key)) {
      event.preventDefault();
    }
  }

  outputVolumeChange(event, i) {
    const typeControl = (this.outputForm.get('HEADER_TO_ITEM') as FormArray)
      .at(i)
      .get('Catcode');
    if (event) {
      typeControl?.setValidators(Validators.required);
    } else {
      typeControl?.clearValidators();
    }
    typeControl?.updateValueAndValidity();
  }

  outputFormCancel() {
    const hasValue = this.outputForm.value.HEADER_TO_ITEM.some(
      (item) => item.RecdVol > 0
    );
    if (hasValue) {
      Swal.fire({
        text: 'Unsaved Data will be Lost, are you sure?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        // customClass: 'myalertpopup',
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
    const hasValue = this.inputForm.value.HEADER_TO_ITEM.some(
      (item) => item.RecdVol > 0 );
    if (hasValue) {
      Swal.fire({
        text: 'Unsaved Data will be Lost, are you sure?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        // customClass: 'myalertpopup',
      }).then((result) => {
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
    this.viewHistory = false;
    this.newOutputRecord = false;
    this.newInputRecord = false;
  }

  typeCodeForIntakArrayList(category: any) {
    let filteredTypeList = this.categoryTypeCodeList
      ? this.categoryTypeCodeList
          .filter(
            (type) => type.Catdescription === category[0] && type.Cattype == 'I'
          )
          .map(
            ({
              TypeCode,
              Description,
              Categorycode,
              Catdescription,
              Cattype,
            }) => {
              return {
                TypeCode,
                Description,
                Categorycode,
                Catdescription,
                Cattype,
              };
            }
          )
      : [];
    return filteredTypeList;
  }

  typeCodeForOutputArrayList(category: any) {
    let filteredTypeList = this.categoryTypeCodeList
      ? this.categoryTypeCodeList
          .filter(
            (type) => type.Catdescription === category[0] && type.Cattype == 'O'
          )
          .map(
            ({
              TypeCode,
              Description,
              Categorycode,
              Catdescription,
              Cattype,
            }) => {
              return {
                TypeCode,
                Description,
                Categorycode,
                Catdescription,
                Cattype,
              };
            }
          )
      : [];
    return filteredTypeList;
  }

  createOutputForm() {
    this.outputForm = this.fb.group({
      CreatedOn: [new Date()],
      CreatedAt: [this.currentTime],
      Case: this.paramsObj?.falnr,
      MRN: this.paramsObj?.patnr,
      RecordNo: '',
      Operation: 'I',
      HEADER_TO_ITEM: this.fb.array(
        this.categoryList
          .filter((category) => category.Categorytype === 'O')
          .map((category) => {
            let matchingItems = this.categoryTypeCodeList.filter(
              (item) => item.Categorycode === category.Categorycode
            );
            let type =
              matchingItems.length === 1 ? matchingItems[0].TypeCode : null;
            return this.fb.group({
              RecordNo: '',
              Itemno: "",
              Einri: this.paramsObj?.einri,
              MRN: this.paramsObj?.patnr,
              Case: this.paramsObj?.falnr,
              RecdType: 'O',
              Roomno: this.patientDetails?.room,
              Bedno: this.patientDetails?.bed,
              StartOu: this.patientDetails?.room,
              AttendDoc: this.patientDetails?.PhysicianAtt,
              Typecode: [type == 'OTHS' ? '' : type],
              Catcode: [category?.Categorycode],
              RecdUnit: ['mL'],
              Remarks: '',
              Status: '',
              category: [category.Description, Validators.required],
              RecdVol: [null],
              action: ['plus'],
              Typedesc: ''
            });
          })
      ),
    });
  }

  createInputForm() {
    this.inputForm = this.fb.group({
      CreatedOn: [new Date()],
      CreatedAt: [this.currentTime],
      Case: this.paramsObj?.falnr,
      MRN: this.paramsObj?.patnr,
      RecordNo: '',
      Operation: 'I',
      HEADER_TO_ITEM: this.fb.array(
        this.categoryList
          .filter((category) => category.Categorytype === 'I')
          .map((category, index: any) => {
            let matchingItems = this.categoryTypeCodeList.filter(
              (item) => item.Categorycode === category.Categorycode
            );
            let type =
              matchingItems.length === 1 ? matchingItems[0].TypeCode : null;
            return this.fb.group({
              RecordNo: '',
              Itemno: "",
              Einri: this.paramsObj?.einri,
              MRN: this.paramsObj?.patnr,
              Case: this.paramsObj?.falnr,
              RecdType: 'I',
              Typedesc: '',
              Roomno: this.patientDetails?.room,
              Bedno: this.patientDetails?.bed,
              StartOu: this.patientDetails?.room,
              AttendDoc: this.patientDetails?.PhysicianAtt,
              Typecode: [type == 'OTHS' ? '' : type],
              Catcode: [category?.Categorycode],
              RecdUnit: ['mL'],
              Remarks: '',
              Status: '',
              category: [category.Description, Validators.required],
              RecdVol: [null],
              action: ['plus'],
            });
          })
      ),
    });
  }

  sanitizeSAPDateFormat(date: any) {
    if (typeof date === 'string') {
      return date;
    } else {
      return `\/Date(${date.getTime()})\/`;
    }
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
          CreatedOn: entry.CreatedOn,
          CreatedAt: entry.CreatedAt,
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

      let json: any = JSON.parse(JSON.stringify(this.outputForm.value));
      json.CreatedOn = this.sanitizeSAPDateFormat(
        this.outputForm.value?.CreatedOn
      );
      json.CreatedAt = this.convertToPTFormat(this.outputForm.value?.CreatedAt);

      json.HEADER_TO_ITEM = json.HEADER_TO_ITEM.filter(
        (row) => row.RecdVol !== null
      ).map((row, index) => {
        row.Itemno = (index + 1)?.toString()
        row.RecdVol = row.RecdVol.toString();
        row.Typecode = row?.Typecode ? row?.Typecode : 'OTHS',
        delete row.action;
        delete row.category;
        return row;
      });

      json.HEADER_TO_ITEM = json.HEADER_TO_ITEM.filter(
        (row) => row.RecdVol !== null
      ).map((row, index) => {
        row.Itemno = (index + 1)?.toString()
        row.RecdVol = row.RecdVol.toString();
        delete row.action;
        delete row.category;
        return row;
      });
      json.HEADER_TO_ITEM = json.HEADER_TO_ITEM.map(record => ({
        ...record,
        Typecode: record?.Typecode.substring(0, 4) == 'OTHS' ? record.Typecode.replace(/\d+$/, '') : record.Typecode
      }));

      json.HEADER_TO_ITEM = json.HEADER_TO_ITEM.map((item: any) => {
        Object.keys(item).forEach((key) => {
          if (item[key] === null) {
            item[key] = '';
          }
        });
        return item;
      });

      // json.HEADER_TO_ITEM.forEach((item) => (this.intakeBalance += parseFloat(item.RecdVol)));
      const hasValue = json.HEADER_TO_ITEM.some((item) => item.RecdVol > 0);
      if (hasValue) {

        this.emergencyService.saveIOChartDetails(json).subscribe((res: any) => {
          const tableData = this.convertJsonToTableData(json);
          const mergedData = this.mergeDataByCategory(tableData);
          this.recordViewData.data = mergedData;
          this.recordViewData.title = 'Output';
          this.netBalance = this.intakeBalance - this.outputBalance;
          this.outputForm.reset();
          this.createOutputForm();
          this.ioChartFormDetails();
          this.newOutputRecord = false;
          this.newInputRecord = false;
          Swal.fire({
            text: 'Data Saved Successfully!',
            icon: 'success',
            confirmButtonText: 'Ok',
            // customClass: 'myalertpopup',
          });
        });
      } else {
        Swal.fire({
          text: 'No Data To be Saved!',
          icon: 'warning',
          confirmButtonText: 'Ok',
          // customClass: 'myalertpopup',
        });
      }
      // const json: any = this.inputForm.value;
      // json.CreatedOn = this.sanitizeSAPDateFormat(
      //   this.inputForm.value?.CreatedOn
      // );
      // json.CreatedAt = this.convertToPTFormat(this.inputForm.value?.CreatedAt);

      // json.HEADER_TO_ITEM = json.HEADER_TO_ITEM.filter(
      //   (row) => row.RecdVol !== null
      // ).map((row, index) => {
      //   if (typeof row.Catcode === 'object' && row.Catcode.TypeCode) {
      //     row.Catcode = row.Catcode.TypeCode;
      //   }
      //   row.Itemno = index?.toString()
      //   row.RecdVol = row.RecdVol.toString();
      //   delete row.action;
      //   delete row.category;
      //   return row;
      // });

      // json.HEADER_TO_ITEM = json.HEADER_TO_ITEM.map((item: any) => {
      //   Object.keys(item).forEach((key) => {
      //     if (item[key] === null) {
      //       item[key] = '';
      //     }
      //   });
      //   return item;
      // });

      // this.emergencyService.saveIOChartDetails(json).subscribe((res: any) => {
      //   console.log('test', res);
      // });
      // if (hasValue) {
      //   const tableData = this.convertJsonToTableData(json);
      //   const mergedData = this.mergeDataByCategory(tableData);
      //   this.recordViewData.data = mergedData;
      //   this.recordViewData.title = 'Output';
      //   this.netBalance = this.intakeBalance - this.outputBalance;
      //   this.outputForm.reset();
      //   this.createOutputForm();
      //   Swal.fire({
      //     text: 'Data Saved Successfully!',
      //     icon: 'success',
      //     confirmButtonText: 'Ok',
          // customClass: 'myalertpopup',
      //   });
      // } else {
      //   Swal.fire({
      //     text: 'No Data To be Saved!',
      //     icon: 'warning',
      //     confirmButtonText: 'Ok',
          // customClass: 'myalertpopup',
      //   });
      // }
    }
  }

  setOtherCatTypeCode(event, index) {
    this.inputForm.controls.HEADER_TO_ITEM['controls'][index][
      'controls'
    ]['Typecode'].setValue("OTHS");
  }

  setOtherCatTypeCodeOut(event, index) {
    this.outputForm.controls.HEADER_TO_ITEM['controls'][index][
      'controls'
    ]['Typecode'].setValue("OTHS");
  }

  inputSubmit() {
    if (this.inputForm.invalid) {
      this.inputForm.markAllAsTouched();
    } else {
      let json: any = JSON.parse(JSON.stringify(this.inputForm.value));
      json.CreatedOn = this.sanitizeSAPDateFormat(
        this.inputForm.value?.CreatedOn
      );
      json.CreatedAt = this.convertToPTFormat(this.inputForm.value?.CreatedAt);

      json.HEADER_TO_ITEM = json.HEADER_TO_ITEM.filter(
        (row) => row.RecdVol !== null
      ).map((row, index) => {
        row.Itemno = (index + 1)?.toString()
        row.RecdVol = row.RecdVol.toString();
        row.Typecode = row?.Typecode ? row?.Typecode : 'OTHS',
        delete row.action;
        delete row.category;
        return row;
      });

      json.HEADER_TO_ITEM = json.HEADER_TO_ITEM.map((item: any) => {
        Object.keys(item).forEach((key) => {
          if (item[key] === null) {
            item[key] = '';
          }
        });
        return item;
      });

      json.HEADER_TO_ITEM = json.HEADER_TO_ITEM.map(record => ({
        ...record,
        Typecode: record?.Typecode.substring(0, 4) == 'OTHS' ? record.Typecode.replace(/\d+$/, '') : record.Typecode
      }));

      // json.HEADER_TO_ITEM.forEach((item) => (this.intakeBalance += parseFloat(item.RecdVol)));
      const hasValue = json.HEADER_TO_ITEM.some((item) => item.RecdVol > 0);
      if (hasValue) {
        this.emergencyService.saveIOChartDetails(json).subscribe((res: any) => {
          const tableData = this.convertJsonToTableData(json);
          const mergedData = this.mergeDataByCategory(tableData);
          this.recordViewData.data = mergedData;
          this.recordViewData.title = 'Intake';
          this.netBalance = this.intakeBalance - this.outputBalance;
          this.ioChartFormDetails();
          this.inputForm.reset();
          this.createInputForm();
          this.newOutputRecord = false;
          this.newInputRecord = false;
          // this.inputForm.reset();
          // this.createInputForm();
          Swal.fire({
            text: 'Data Saved Successfully!',
            icon: 'success',
            confirmButtonText: 'Ok',
            // customClass: 'myalertpopup',
          });
        });
      } else {
        Swal.fire({
          text: 'No Data To be Saved!',
          icon: 'warning',
          confirmButtonText: 'Ok',
          // customClass: 'myalertpopup',
        });
      }
      // this.recordView = true;
    }
  }

  convertToPTFormat(time) {
    let ptFormatRegex = /^PT\d{2}H\d{2}M$/;
    if (ptFormatRegex.test(time)) {
      return time;
    }
    let [hours, minutes] = time.split(':');
    return `PT${hours}H${minutes}M00S`;
  }

  convertJsonToTableData(jsonData) {
    return jsonData.HEADER_TO_ITEM.map((row) => {
      return {
        category: row.category,
        CreatedOn: jsonData.CreatedOn, // Use appropriate date conversion here
        CreatedAt: jsonData.CreatedAt, // Use appropriate time conversion here
        enteredBy: 'Saja Oweisy',
        subRows:
          row.type !== null && row.RecdVol > 0
            ? [
                {
                  type: row.type,
                  value: `${row.RecdVol || '0'} ${row.RecdUnit || 'mL'}`,
                  Remarks: row.Remarks,
                },
              ]
            : [],
      };
    }).filter((entry) => entry.subRows.length > 0); // Filter out entries with empty subRows
  }

  startIOChart() {
    let json = {
      Operation:"I",
      Case: this.paramsObj?.falnr,
      MRN: this.paramsObj?.patnr,
      Institution: this.paramsObj?.einri
    }
    this.emergencyService.saveStartNewIOChart(json).subscribe((res: any) => {
      this.startEndChartDetails();
      Swal.fire({
        title: "New I & O Chart is Successfully Started",
        icon: 'success',
        confirmButtonText: 'OK',
        // customClass:'font-size-text-center'
      });
    }, (error) => {
      console.log(error,"--");
      
      Swal.fire({
        title: "An Open I & O Chart is Already Exists",
        icon: 'error',
        confirmButtonText: 'OK',
        // customClass:'font-size-text-center'
      });
    })
  }

  closeModal() {
    this.modalRefForEndChart?.hide();
    this.Comments = '';
  }

  endIOChart() {
    let json = {
      Operation:"U",
      Case: this.paramsObj?.falnr,
      MRN: this.paramsObj?.patnr,
      Institution: this.paramsObj?.einri,
      Comments: this.Comments
    }
    this.emergencyService.saveStartNewIOChart(json).subscribe((res: any) => {
      this.modalRefForEndChart?.hide();
      this.Comments = "";
      this.ioCategoryList();
      this.startEndChartDetails();
      Swal.fire({
        title: "The I & O Chart has been Completed Successfully",
        icon: 'success',
        confirmButtonText: 'OK',
        // customClass:'font-size-text-center'
      });
    }, (error) => {
      Swal.fire({
        title: error?.error?.error?.message?.value,
        icon: 'error',
        confirmButtonText: 'OK',
        // customClass:'font-size-text-center'
      });
    })
  }
}
