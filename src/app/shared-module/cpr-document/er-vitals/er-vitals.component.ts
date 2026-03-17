import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-er-vitals',
  templateUrl: './er-vitals.component.html',
  styleUrls: ['./er-vitals.component.css']
})
export class ErVitalsComponent implements OnInit {
  @ViewChild('erVitalsModal', { static: true }) erVitalsModal: TemplateRef<any>;
  @Output() importEvent = new EventEmitter();

  modalRef: BsModalRef;
  modalRefForDelete: BsModalRef;
  modalRefForAllVitals: BsModalRef;
  erListSelectedData: any;
  vitalListResp: any;
  vitalListItems: any;
  toUniqueItemsArr = [];
  isSelected = false;
  selectedColData: any;
  showMaintain = false;
  maintainvitalform: FormGroup;
  maintainVitalFormitems: FormArray;
  measuredValueQual = [];
  Reason = [];
  maintainVitalBarForm: FormGroup;
  deleteReasonsListData: any;
  cancelReasonValue: any = '';
  isFormSubmitted = false;
  vitalDefaultListResp: any;
  vitalAllListResp: any;
  selectedIndex: any;
  edit = false;
  public selectedRowDelete;
  selectedRowIndex: any;
  stickyHead = true;
  searchString = '';
  isEditAndDeleteAble: boolean = false;
  nextInput: HTMLElement;
  nextInputId: string;
  selectedRowsIndex: number;
  selectedColIndex: any;
  constructor(private modalService: BsModalService, private emergencyService: EmergencyService, private formBuilder: FormBuilder, private storageService: StorageService) {
    this.maintainvitalform = this.formBuilder.group({
      maintainVitalFormitems: new FormArray([]),
    });
    // this.maintainVitalBarForm = this.formBuilder.group({
    //   Orgdo: [''],
    //   Vma: [''],
    //   Descr: [''],
    //   Odate: [''],
    //   Otime: [''],
    // });
  }

  ngOnInit() {
    this.initialValues();
    this.deleteReasonsList();
  }

  handleKeydown(event: KeyboardEvent, rowIndex: number, colIndex: any): void {
    const rowCount = this.maintainvitalform.get('maintainVitalFormitems')['controls'].length;
    const colCount = 9; // Adjust based on the number of columns
    let nextRow = rowIndex;
    let nextCol = colIndex;

    switch (event.key) {
      case 'ArrowLeft':
        nextCol = colIndex > 0 ? colIndex - 1 : colCount - 1;
        break;
      case 'ArrowRight':
        nextCol = colIndex < colCount - 1 ? colIndex + 1 : 0;
        break;
      case 'ArrowUp':
        nextRow = rowIndex > 0 ? rowIndex - 1 : rowCount - 1;
        break;
      case 'ArrowDown':
        nextRow = rowIndex < rowCount - 1 ? rowIndex + 1 : 0;
        break;
      default:
        return; // If other keys are pressed, do nothing
    }

    this.nextInputId = `cell-${nextRow}-${nextCol}`;
    this.selectedRowsIndex = nextRow;
    this.selectedColIndex = nextCol;
    if (this.nextInputId == `cell-${nextRow}-5`) {
      this.nextInput = document.getElementById(`cell-${nextRow}-7`) as HTMLElement;
      this.selectedColIndex = 7;
    } else if (this.nextInputId == `cell-${nextRow}-6` && event.key == 'ArrowLeft') {
      this.nextInput = document.getElementById(`cell-${nextRow}-4`) as HTMLElement;
      this.selectedColIndex = 4;
    }
    else {
      this.nextInput = document.getElementById(this.nextInputId) as HTMLElement;
    }
    if (this.nextInput) {
      this.nextInput.focus();
      event.preventDefault();
    }
  }

  initialValues() {
    this.maintainVitalBarForm = this.formBuilder.group({
      Orgdo: [this.storageService?.patientData?.deptOrgUnit],
      Vma: [''],
      Descr: [''],
      Odate: [''],
      Otime: [''],
    });
    this.measuredValueQual = [
      {
        Text: 'No Specification'
      },
      {
        Text: 'Questionable'
      },
      {
        Text: 'Not Measurable'
      },
      {
        Text: 'No Measured'
      }
    ]

    this.Reason = [
      {
        ReasonText: 'Patient Absent'
      },
      {
        ReasonText: 'Patient Refused'
      },
    ]

    this.vitalDefaultListResp = [
      {

        "Einri": "",
        "Valid": "E10989D8963E1EEE81C5B8A334F05E72",
        "ValidVers": "0000",
        "Bcpid": "C000C29D2E09C1ED9999E4DE4F9F884F0",
        "Extid": "SYSTOLIC BLOOD PRESSURE",
        "Name": "Systolic Blood Pressure",
        "Value": "",
        "ValueString": "",
        "UnitTxt": "mmHg",
        "NormalRange": "80.000 - 110.000",
        "Origin": "",
        "Descr": "",
        "Obsid": "E10989D8963E1EEE81C5B8A334F03E72",
        "ObsidVers": "0000",
        "Addinfo": ""
      },
      {

        "Einri": "",
        "Valid": "E10989D8963E1EEE81C5B8A334F07E72",
        "ValidVers": "0000",
        "Bcpid": "C000C29D2E09C1ED9999E552CFF3AE50F",
        "Extid": "DIASTOLIC BLOOD PRESSURE",
        "Name": "Diastolic Blood Pressure",
        "Value": "",
        "ValueString": "",
        "UnitTxt": "mmHg",
        "NormalRange": "50.000 - 70.000",
        "Origin": "",
        "Descr": "",
        "Obsid": "E10989D8963E1EEE81C5B8A334F03E72",
        "ObsidVers": "0000",
        "Addinfo": ""
      },
      {
        "Einri": "",
        "Valid": "E10989D8963E1EEE81C5B8A334F19E72",
        "ValidVers": "0000",
        "Bcpid": "C0050568120581EE8B8E4B9B228DEECC5",
        "Extid": "HEIGHT",
        "Name": "Height",
        "Value": "",
        "ValueString": "",
        "UnitTxt": "cm",
        "NormalRange": "00.000 - 00.000",
        "Origin": "",
        "Descr": "",
        "Obsid": "E10989D8963E1EEE81C5B8A334F03E72",
        "ObsidVers": "0000",
        "Addinfo": ""
      },
      {
        "Einri": "",
        "Valid": "E10989D8963E1EEE81C5B8A334F19E72",
        "ValidVers": "0000",
        "Bcpid": "C0050568120581EE8B8E4B5DCAA436CC5",
        "Extid": "WEIGHT",
        "Name": "Weight",
        "Value": "",
        "ValueString": "",
        "UnitTxt": "kg",
        "NormalRange": "00.000 - 00.000",
        "Origin": "",
        "Descr": "",
        "Obsid": "E10989D8963E1EEE81C5B8A334F03E72",
        "ObsidVers": "0000",
        "Addinfo": ""
      },
      {

        "Einri": "",
        "Valid": "E10989D8963E1EEE81C5B8A334F09E72",
        "ValidVers": "0000",
        "Bcpid": "C000C29D2E09C1ED9A4BEDCC0AC61B5A2",
        "Extid": "PAIN SCORE",
        "Name": "Pain score",
        "Value": "",
        "ValueString": "",
        "UnitTxt": "UnLess",
        "NormalRange": "0.000 - 3.000",
        "Origin": "",
        "Descr": "",
        "Obsid": "E10989D8963E1EEE81C5B8A334F03E72",
        "ObsidVers": "0000",
        "Addinfo": ""
      },
      {

        "Einri": "",
        "Valid": "E10989D8963E1EEE81C5B8A334F0BE72",
        "ValidVers": "0000",
        "Bcpid": "C000C29D2E09C1ED9A5D22D8A6C6B2972",
        "Extid": "RESPIRATORY RATE",
        "Name": "Respiratory Rate",
        "Value": "",
        "ValueString": "",
        "UnitTxt": "bpm",
        "NormalRange": "12.000 - 30.000",
        "Origin": "",
        "Descr": "",
        "Obsid": "E10989D8963E1EEE81C5B8A334F03E72",
        "ObsidVers": "0000",
        "Addinfo": ""
      },
      {

        "Einri": "",
        "Valid": "E10989D8963E1EEE81C5B8A334F0DE72",
        "ValidVers": "0000",
        "Bcpid": "C000C29D2E09C1EE98E8803F5593B50A7",
        "Extid": "OXYGEN SATURATION",
        "Name": "Oxygen Saturation",
        "Value": "",
        "ValueString": "",
        "UnitTxt": "%",
        "NormalRange": "90.000 - 99.000",
        "Origin": "",
        "Descr": "",
        "Obsid": "E10989D8963E1EEE81C5B8A334F03E72",
        "ObsidVers": "0000",
        "Addinfo": ""
      },
      {

        "Einri": "",
        "Valid": "E10989D8963E1EEE81C5B8A334F0FE72",
        "ValidVers": "0000",
        "Bcpid": "C000C29D2E09C1EE98E8803F5593E50A7",
        "Extid": "HEART RATE",
        "Name": "Heart Rate",
        "Value": "",
        "ValueString": "",
        "UnitTxt": "bpm",
        "NormalRange": "80.000 - 120.000",
        "Origin": "",
        "Descr": "",
        "Obsid": "E10989D8963E1EEE81C5B8A334F03E72",
        "ObsidVers": "0000",
        "Addinfo": ""
      },
      {

        "Einri": "",
        "Valid": "E10989D8963E1EEE81C5B8A334F15E72",
        "ValidVers": "0000",
        "Bcpid": "C0050568120581EE98CD1ABD87BC9ECD8",
        "Extid": "TEMP_AXIL",
        "Name": "Temperature-Axila",
        "Value": "",
        "ValueString": "",
        "UnitTxt": "°C",
        "NormalRange": "36.100 - 36.700",
        "Origin": "",
        "Descr": "",
        "Obsid": "E10989D8963E1EEE81C5B8A334F03E72",
        "ObsidVers": "0000",
        "Addinfo": ""
      },
      {
        "Einri": "",
        "Valid": "E10989D8963E1EEE81C5B8A334F17E72",
        "ValidVers": "0000",
        "Bcpid": "C0050568120581EE98CD1ABD87BCA2CD8",
        "Extid": "TEMP_ORAL",
        "Name": "Temperature-Oral",
        "Value": "",
        "ValueString": "",
        "UnitTxt": "°C",
        "NormalRange": "36.600 - 37.200",
        "Origin": "",
        "Descr": "",
        "Obsid": "E10989D8963E1EEE81C5B8A334F03E72",
        "ObsidVers": "0000",
        "Addinfo": ""
      },
      {
        "Einri": "",
        "Valid": "E10989D8963E1EEE81C5B8A334F19E72",
        "ValidVers": "0000",
        "Bcpid": "C0050568120581EE98CD1ABD87BCAACD8",
        "Extid": "TEMP_TYMP",
        "Name": "Temperature Tympanic",
        "Value": "",
        "ValueString": "",
        "UnitTxt": "°C",
        "NormalRange": "35.500 - 37.500",
        "Origin": "",
        "Descr": "",
        "Obsid": "E10989D8963E1EEE81C5B8A334F03E72",
        "ObsidVers": "0000",
        "Addinfo": ""
      },
      {
        "Einri": "",
        "Valid": "4522139805EB1FD0BC8A25C3E8D7BADE",
        "ValidVers": "0000",
        "Bcpid": "C000C29D2E09C1ED9A5D54D616DB4CEDE",
        "Extid": "MEWS SCORE",
        "Name": "MEWS Score",
        "Value": "",
        "ValueString": "",
        "UnitTxt": "UnLess",
        "NormalRange": "0.000 - 0.999",
        "Origin": "",
        "Descr": "",
        "Obsid": "4522139805EB1FD0BC8A25C3E8D79ADE",
        "ObsidVers": "0000",
        "Addinfo": ""
      }


    ];
  }
  openModalForErVital(checkinitem, tab?) {
    this.erListSelectedData = checkinitem;
    if (tab === "erHistory") {
      this.isEditAndDeleteAble = true
    }
    const config: ModalOptions = { class: 'modal-dialog-centered er-vital-modal' };
    this.modalRef = this.modalService.show(this.erVitalsModal, config);
    this.modalRef.onHide.subscribe((reason: string | any) => {
      if (reason === 'backdrop-click') {

      }
    });
    this.getVitalList();
    this.getAllVitalList();
    this.isFormSubmitted = false;
  }
  getVitalList() {
    const json = {
      patnr: this.erListSelectedData.Patnr,
      falnr: this.erListSelectedData.Falnr,
      einri: this.erListSelectedData.Einri,
      lfdnr: this.erListSelectedData.Lfdbw
    }
    this.emergencyService.getVitalList(json).subscribe(
      (_success: any) => {
        this.vitalListResp = _success.d.results;
        //this.vitalListItems = this.vitalListResp.TOITEM.results;
        let toItemsArr = this.vitalListResp.flatMap(a => a.TOITEM.results).sort(s => s.Bcpid);
        let groupingViaCommonProperty = Object.values(
          toItemsArr.reduce((acc, current) => {
            acc[current.Bcpid] = acc[current.Bcpid] ?? [];
            acc[current.Bcpid].push(current);
            return acc;
          }, {})
        );
        this.toUniqueItemsArr = groupingViaCommonProperty;
        this.showMaintain = false;
        this.selectedColData = {};
      },
      (_error: any) => { }
    );
  }
  getAllVitalList() {
    const json = {
      einri: this.erListSelectedData.Einri,
    }
    this.emergencyService.getAllVitalList(json).subscribe(
      (_success: any) => {
        this.vitalAllListResp = _success.d.results;

      },
      (_error: any) => { }
    );
  }
  selectDateColumn(item) {
    if ((this.selectedColData != undefined) && (this.selectedColData.Obsid == item.Obsid)) {
      if (this.isSelected) {
        this.isSelected = false;
      } else {
        this.isSelected = true;
      }
    } else {
      this.isSelected = true;
    }

    this.selectedColData = item;
  }
  confirmationForDelete(template: TemplateRef<any>) {
    const config: ModalOptions = {
      class: 'modal-dialog-centered',
    };
    if (this.isSelected) {
      this.modalRefForDelete = this.modalService.show(template, config);
    } else {
      Swal.fire({
        text: "Please select Vital Signs to delete.",
        icon: 'error',
        confirmButtonText: 'Ok',
        customClass: { popup: 'myalertpopup' }
      })
    }
  }
  deleteVitalList() {
    this.isFormSubmitted = true;
    if (this.cancelReasonValue !== '') {
      const json = {
        "Obsid": this.selectedColData.Obsid,
        "ObsidVers": this.selectedColData.ObsidVers,
        "Storn": true,
        "Stoid": this.cancelReasonValue,
        "TOITEM": [{}]
      }

      this.emergencyService.deleteVitalList(json).subscribe(
        (_success: any) => {
          this.getVitalList();
          this.modalRef.hide();
          this.modalRefForDelete.hide();
          this.isFormSubmitted = false;
          this.cancelReasonValue = '';
          this.isSelected = false;
          Swal.fire({
            text: "Vital signs deleted successfully",
            icon: 'success',
            confirmButtonText: 'Ok',
            customClass: { popup: 'myalertpopup' }
          })
        },
        (_error: any) => { }
      );
    }

  }
  onChange(event) {
    this.isFormSubmitted = false;
  }
  getDateRecord(obsdId: any, element: any) {
    let item = element.find(f => f.Obsid == obsdId);
    if (item) {
      if (item.Name.includes('Temperature')) {
        return parseFloat(item.ValueFormatted).toFixed(2);
      }
      else {
        return item.ValueFormatted;
      }
    };
  }
  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }
  getTime(value) {
    if (value) {
      var str = value;
      var str = str.replace(/[PT]/g, '');
      var str = str.replace(/[H]/g, ':');
      var str = str.replace(/[M]/g, ':');
      var str = str.replace(/[S]/g, '');
      var str = str.slice(0, 5)
      return str;
    }
  }

  EditVitalList() {
    if (this.isSelected) {
      if (this.selectedColData) {
        // Validation: Prevent editing if reading is older than 24 hours or in the future
                 const readingDate = this.getDate(this.selectedColData.Odate);
                 if(this.isPasssed24Hours(readingDate)){
                     Swal.fire({
                     text: "You cannot edit a vital reading older than 24 hours.",
                     icon: 'error',
                     confirmButtonText: 'Ok',
                     customClass: { popup: 'myalertpopup' }
                   });
                   return
                 }
        this.showMaintain = true;
        this.edit = true
        this.selectedColData.TOITEM.results.forEach(element => {
          // if(element.Name.includes('Temperature')){
          //   element['Value'] = parseFloat(element.Value).toFixed(2);
          // }
          // else{
          //   element['Value'] = parseInt(element.Value);
          // }
          this.addItemForVital(element);
        });
        this.maintainVitalBarForm.controls.Orgdo.setValue(this.storageService?.patientData?.deptOrgUnit);
        this.maintainVitalBarForm.controls.Vma.setValue(this.storageService.getGpart());
        this.maintainVitalBarForm.controls.Odate.setValue(this.getDate(this.selectedColData.Odate));
        this.maintainVitalBarForm.controls.Otime.setValue(this.getTime(this.selectedColData.Otime));
        this.maintainVitalBarForm.controls.Descr.setValue(this.selectedColData.Descr);

      }
    } else {
      Swal.fire({
        text: "Please select Vital Signs to change.",
        icon: 'error',
        confirmButtonText: 'Ok',
        customClass: { popup: 'myalertpopup' }
      })
    }

  }
  // maintain vitals
  closeMaintain() {
    this.showMaintain = false;
    this.edit = false;
    this.resetAllMaintainValues();
  }
  addItemForVital(element?): void {
    this.maintainVitalFormitems = this.maintainvitalform.get('maintainVitalFormitems') as FormArray;
    this.maintainVitalFormitems.push(this.showVitalDetailsOnList(element));
  }
  addNewItemForVital(): void {
    const control = <FormArray>this.maintainvitalform.controls['maintainVitalFormitems'];
    this.maintainVitalFormitems = this.maintainvitalform.get('maintainVitalFormitems') as FormArray;
    //this.maintainVitalFormitems.push(this.showVitalDetailsOnList());
    //this.disableInputs()
    control.insert(0, this.showVitalDetailsOnList());
  }
  showVitalDetailsOnList(element?): FormGroup {
    if (element) {
      return this.formBuilder.group({
        Bcpid: [element.Bcpid],
        Valid: [element.Valid],
        ValidVers: [element.ValidVers],
        Value: [element.Value],
        ValueString: [element.ValueString],
        UnitTxt: [element.UnitTxt],
        Origin: [''],
        Name: [element.Name],
        Extid: [element.Extid],
        Addinfo: [element.Addinfo]
      }
      );
    } else {
      return this.formBuilder.group({
        Bcpid: [''],
        Valid: [''],
        ValidVers: [''],
        Value: [''],
        ValueString: [''],
        UnitTxt: [''],
        Origin: [''],
        Name: [''],
        Extid: [''],
        Addinfo: element != undefined ? [element.Addinfo] : ['']
      }
      );

    }
  }
  get actionOnform(): FormArray {
    return this.maintainvitalform.get('maintainVitalFormitems') as FormArray;
  }
  updateVitalSigns() {
    this.isFormSubmitted = true;
    if (this.cancelReasonValue !== '') {
      // Validation: Prevent updating to a future date or if reading is older than 24 hours
            const createDateObj = this.maintainVitalBarForm.controls.Odate.value;
            if (this.isFutureDate(createDateObj)) {
              Swal.fire({
                text: "You cannot set a future date for vital readings.",
                icon: 'error',
                confirmButtonText: 'Ok',
                customClass: { popup: 'myalertpopup' }
              });
              return;
            }
      let createTime = this.maintainVitalBarForm.controls.Otime.value.split(':');
      createTime = 'PT' + createTime[0] + 'H' + createTime[1] + 'M' + '00S'
      let createDate = this.maintainVitalBarForm.controls.Odate.value.getFullYear() + '-' + String(this.maintainVitalBarForm.controls.Odate.value.getMonth() + 1).padStart(2, '0') + '-' + String(this.maintainVitalBarForm.controls.Odate.value.getDate()).padStart(2, '0') + 'T00:00:00';
      const json = {
        "Obsid": this.selectedColData.Obsid,
        "ObsidVers": this.selectedColData.ObsidVers,
        "Stoid": this.cancelReasonValue,
        "Descr": this.maintainVitalBarForm.controls.Descr.value,
        "Odate": createDate,
        "Otime": createTime,
        "TOITEM": this.maintainVitalFormitems.value
      }
      this.emergencyService.updateVitalSigns(json).subscribe(
        (_success: any) => {
          this.getVitalList();
          this.resetAllMaintainValues();
          this.initialValues();
          //this.modalRef.hide();
          this.modalRefForDelete.hide();
          this.cancelReasonValue = '';
          this.isSelected = false;
          Swal.fire({
            text: "Vital signs updated successfully",
            icon: 'success',
            confirmButtonText: 'Ok',
            customClass: { popup: 'myalertpopup' }
          })
        },
        (_error: any) => {
          Swal.fire({
            text: _error.error.message,
            icon: 'error',
            confirmButtonText: 'Ok',
            customClass: { popup: 'myalertpopup' }
          })
        }
      );
    }
  }
  createVitalSigns() {
    let EnteredvitalArr = [];
    let createTime = this.maintainVitalBarForm.controls.Otime.value.split(':');
    createTime = 'PT' + createTime[0] + 'H' + createTime[1] + 'M' + '00S'
    let createDate = this.maintainVitalBarForm.controls.Odate.value.getFullYear() + '-' + String(this.maintainVitalBarForm.controls.Odate.value.getMonth() + 1).padStart(2, '0') + '-' + String(this.maintainVitalBarForm.controls.Odate.value.getDate()).padStart(2, '0') + 'T00:00:00';
    EnteredvitalArr = this.maintainVitalFormitems.value;
    EnteredvitalArr = EnteredvitalArr.filter(element => element.Value !== '')
    const createDateObj = this.maintainVitalBarForm.controls.Odate.value;
        // Validation: Prevent creating with a future date
        if(this.isFutureDate(createDateObj)){
         Swal.fire({
            text: "You cannot set a future date for vital readings.",
            icon: 'error',
            confirmButtonText: 'Ok',
            customClass: { popup: 'myalertpopup' }
          });
          return;
        }
    const json = {
      "Einri": this.erListSelectedData.Einri,
      "Patnr": this.erListSelectedData.Patnr,
      "Falnr": this.erListSelectedData.Falnr,
      "Lfdnr": this.erListSelectedData.Lfdbw,
      "Orgfa": "",
      "Orgpf": "",
      "Orgdo": this.storageService?.patientData?.deptOrgUnit,
      "Mitarb": this.storageService.getGpart(),
      "Origin": "",
      "Odate": createDate,
      "Otime": createTime,
      "Descr": this.maintainVitalBarForm.controls.Descr.value,
      "Storn": false,
      "Stoid": this.selectedColData.Stoid,
      "TOITEM": EnteredvitalArr
    }

    this.emergencyService.createVitalSigns(json).subscribe(
      (_success: any) => {
        this.getVitalList();
        this.resetAllMaintainValues();
        this.initialValues();
        //this.modalRef.hide();
        this.edit = false;
        this.isSelected = false;
        Swal.fire({
          text: "Vital signs created successfully",
          icon: 'success',
          confirmButtonText: 'Ok',
          customClass: { popup: 'myalertpopup' }
        })
      },
      (_error: any) => {
        Swal.fire({
          text: _error.error.error.message.value,
          icon: 'error',
          confirmButtonText: 'Ok',
          customClass: { popup: 'myalertpopup' }
        })
      }
    );
  }
  deleteReasonsList() {
    this.emergencyService.deleteReasonsList().subscribe(
      (_success: any) => {
        this.deleteReasonsListData = _success.d.results;
      },
      (_error: any) => { }
    );
  }
  resetAllMaintainValues() {
    this.maintainvitalform.reset();
    this.maintainVitalBarForm.reset();
    this.maintainVitalFormitems.clear();
    this.edit = false;
  }

  //create

  CreateVitalList() {
    this.showMaintain = true;
    let createTime = 'PT' + new Date().getHours() + 'H' + new Date().getMinutes() + 'M' + '00S';
    // if (this.vitalListResp.length != 0) {
    //   this.maintainVitalBarForm.controls.Orgdo.setValue(this.vitalListResp[0].Orgdo);
    // }else{
    //   this.maintainVitalBarForm.controls.Orgdo.setValue('');
    // }
    this.maintainVitalBarForm.controls.Orgdo.setValue(this.storageService?.patientData?.deptOrgUnit);
    this.maintainVitalBarForm.controls.Vma.setValue(this.storageService.getGpart());
    this.maintainVitalBarForm.controls.Odate.setValue(new Date());
    this.maintainVitalBarForm.controls.Otime.setValue(this.getTime(createTime));
    this.vitalDefaultListResp.forEach(element => {
      this.addItemForVital(element);
    });
  }
  openAllVitalModal(template: TemplateRef<any>, index) {
    this.selectedIndex = index;
    const config: ModalOptions = {
      class: 'modal-dialog-centered',
    };
    this.modalRefForAllVitals = this.modalService.show(template, config);
  }
  selectVitalFromAllList(item) {
    this.modalRefForAllVitals.hide();
    this.maintainvitalform.controls['maintainVitalFormitems']['controls'][this.selectedIndex]['controls'].Extid.setValue(item.Extid);
    this.maintainvitalform.controls['maintainVitalFormitems']['controls'][this.selectedIndex]['controls'].Name.setValue(item.Name);
    this.maintainvitalform.controls['maintainVitalFormitems']['controls'][this.selectedIndex]['controls'].UnitTxt.setValue(item.UnitTxt);
    this.maintainvitalform.controls['maintainVitalFormitems']['controls'][this.selectedIndex]['controls'].Bcpid.setValue(item.Bcpid);
  }
  actionVitalSigns(template?) {
    if (this.edit) {
      this.confirmationForChange(template);
    } else {
      this.createVitalSigns();
    }
  }
  rowDelete(item, index) {
    this.selectedRowDelete = item.value;
    this.selectedRowIndex = index;
  }
  rowDeleteFn() {
    this.maintainVitalFormitems.removeAt(this.selectedRowIndex);
  }
  scrollRight() {
    this.stickyHead = false;
    const el = document.getElementById('columnDates');
    el.scrollLeft += 155;
  }
  scrollLeft() {
    this.stickyHead = false;
    const el = document.getElementById('columnDates');
    el.scrollLeft -= 155;
  }
  scrollHandler(event) {
    this.stickyHead = true;
  }
  confirmationForChange(template: TemplateRef<any>) {
    const config: ModalOptions = {
      class: 'modal-dialog-centered',
    };
    this.modalRefForDelete = this.modalService.show(template, config);
  }

  Import() {
    let value: any = []
    this.selectedColData.TOITEM.results.forEach(element => {
      element['Date'] = this.selectedColData.Odate;
      element['Time'] = this.selectedColData.Otime;
      value.push(element);
    });
    this.importEvent.emit(value);
    this.modalRef.hide();
    // this.vitalsArr = [];
  }

  isPasssed24Hours(readingDate:any): boolean {
         const now = new Date();
         return (readingDate&& (now.getTime() - readingDate.getTime()) > 24 * 60 * 60 * 1000);
  }

  isFutureDate(createDateObj:any): boolean {
    return (createDateObj&&createDateObj > new Date());
  }
}
