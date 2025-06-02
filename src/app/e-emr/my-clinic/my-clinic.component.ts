import { Component, EventEmitter, HostListener, OnInit, Output, TemplateRef } from '@angular/core';
import { EEmrService } from '@services/e-emr.service';
import * as _ from 'lodash';
import * as converter from 'xml-js';
import { StorageService } from '@services/storage.service';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import { FormControl, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import * as XLSX from 'xlsx';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Patient } from '@services/e-kardex/interfaces/patient';
import { PatientService } from '@services/e-kardex/patient.service';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { catchError, of } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-my-clinic',
  templateUrl: './my-clinic.component.html',
  styleUrls: ['./my-clinic.component.scss'],
})
export class MyClinicComponent implements OnInit {
  @Output() public dataCount = new EventEmitter<any>();
  asc = false;
  Variantid: any;

  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.showfilter = false;
    this.showconfig = false;
  }

  movementTypeConfig: any;
  statustypeConfig: any;
  selectedView: any = '1';
  showTable = false;
  movementType = true;
  ColumnType: any[] = [
    { Desc: "Attending Physician", Value: "01", isSelected: false },
    { Desc: "Diagnosis", Value: "02", isSelected: false },
    { Desc: "Case", Value: "03", isSelected: false },
    { Desc: "Visit Type", Value: "04", isSelected: false },
    { Desc: "Comment", Value: "05", isSelected: false }
  ]
  AttendingPhysician: boolean = false;
  Diagnosis: boolean = false;
  Case: boolean = false;
  VisitType: boolean = false;
  comment: boolean = false;
  modalRef: BsModalRef;
  selectedItemsForStatusConf = '';
  defaultSelectedItemsForStatusConf = [];
  selectedItemsForMovTypeConf = '';
  defaultSelectedItemsForMovTypeConf = [];

  public formDetailGroup: any;
  public checkOutForm: any;

  statusView = false;
  postSelectedCol = [];
  showconfig = false;
  showfilter = false;
  dateFrom: Date;
  dateTo: Date;
  attendingPerson = '';
  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {};
  dropdownListForStatus = [];
  dropdownSettingsForStatus = {};
  filterXml: any;
  widgetID: any;
  dataOnTable = [];
  PATNR: any;
  FALNR: any;
  EINRI: any;
  LFDBW: any;
  widgetsSet: any;
  dropdownListForMovType: any;
  defaultSelectedItemsForStatus = [];
  defaultSelectedItemsForMovType = [];
  searchString!: string;
  order = 'asc';
  patientorder = 'asc';
  dateorder = '';
  maxDate = new Date()
  constructor(
    private _dataServices: EEmrService, private modalService: BsModalService, private patientService: PatientService,
    private storageService: StorageService,private datePipe: DatePipe) { 

      
    }

  ngOnInit() {
    this.filterMovementTypeConf();
    if (this.attendingPerson == '') {
      this.attendingPerson = this.storageService.getGpart();
    }
    this.dateFrom = new Date();
    this.dateTo = new Date();
    this.dataCount.emit(this.dataOnTable.length);
    console.log(this.dataOnTable.length);

    this.dropdownSettings = {
      singleSelection: false,
      enableCheckAll: false,
      idField: 'Valuekey',
      textField: 'Valuedescr',
      itemsShowLimit: 2,
      allowSearchFilter: false,
      defaultOpen: false,
    };

    this.dropdownSettingsForStatus = {
      singleSelection: false,
      enableCheckAll: false,
      idField: 'Valuekey',
      textField: 'Valuedescr',
      itemsShowLimit: 2,
      allowSearchFilter: false,
      defaultOpen: false,
    };

    this.formDetailGroup = new FormGroup({
      'SearchData': new FormControl(''),
      'DateRange': new FormControl([new Date(), new Date()]),
      'SelectDropdown': new FormControl(),
    });
    this.checkOutForm = new FormGroup({
      'DateRange': new FormControl([new Date(), new Date()]),
    });
  }
  showFilterFn($event) {
    $event.stopPropagation();
    if (this.attendingPerson == '') {
      this.attendingPerson = this.storageService.getGpart();
    }

    if (this.showfilter) {
      this.showfilter = false;
    } else {
      this.showfilter = true;
      this.showconfig = false;
    }
  }

  handleGetChangeDate(event){
    if(!event) {
      this.formDetailGroup.get("DateRange").patchValue([new Date(), new Date()]);
    }
    this.filterDataConf()    
  }

  handleGetChangeDateForCheckOut(event){
    if(!event) {
      this.checkOutForm.get("DateRange").patchValue([new Date(), new Date()]);
    }
    this.forCheckOutList()    
  }

  previousDate(){
    if(+this.formDetailGroup.get("DateRange").value[0] == +this.formDetailGroup.get("DateRange").value[1]){
      var date1 = this.formDetailGroup.get("DateRange").value[0];
      var date2 = this.formDetailGroup.get("DateRange").value[1];
      this.formDetailGroup.get("DateRange").patchValue([new Date(date1.setDate((date1.getDate()-1))), new Date(date2.setDate((date2.getDate()-1)))]);
      // this.ErHistoryComponent.getErList(this.formgroupData.DateRange);
    }else{
      var date1 = this.formDetailGroup.get("DateRange").value[0];
      var date2 = this.formDetailGroup.get("DateRange").value[1];
      const diffTime = Math.abs(date2 - date1);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      date1 = new Date(date1.setDate(date1.getDate()-diffDays));
      date2 = new Date(date2.setDate(date2.getDate()-diffDays));
      this.formDetailGroup.get("DateRange").patchValue([date1, date2]);
      // this.ErHistoryComponent.getSelectedDates(this.formgroupData.DateRange);
    }


  }
  onTodayEventData(){
    this.formDetailGroup.get("DateRange").patchValue([new Date(), new Date()]);
    // this.ErHistoryComponent.getSelectedDates(this.formgroupData.DateRange);
  }

  onTodayEventDataForCheckout(){
    this.checkOutForm.get("DateRange").patchValue([new Date(), new Date()]);
    // this.ErHistoryComponent.getSelectedDates(this.formgroupData.DateRange);
  }
  upcomingDate(){
    if(+this.formDetailGroup.get("DateRange").value[0] == +this.formDetailGroup.get("DateRange").value[1]){
      var date1 = this.formDetailGroup.get("DateRange").value[0];
      var date2 = this.formDetailGroup.get("DateRange").value[1];
      this.formDetailGroup.get("DateRange").patchValue([new Date(date1.setDate((date1.getDate()+1))), new Date(date2.setDate((date2.getDate()+1)))]);
      // this.ErHistoryComponent.getErList(this.formgroupData.DateRange);
    }else{
      var date1 = this.formDetailGroup.get("DateRange").value[0];
      var date2 = this.formDetailGroup.get("DateRange").value[1];
      const diffTime = Math.abs(date2 - date1);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      date1 = new Date(date1.setDate(date1.getDate()+diffDays));
      date2 = new Date(date2.setDate(date2.getDate()+diffDays));
      this.formDetailGroup.get("DateRange").patchValue([date1, date2]);
      // this.ErHistoryComponent.getSelectedDates(this.formgroupData.DateRange);
    }
    
  }

  upcomingDateForCheckout(){
    if(+this.checkOutForm.get("DateRange").value[0] == +this.checkOutForm.get("DateRange").value[1]){
      var date1 = this.checkOutForm.get("DateRange").value[0];
      var date2 = this.checkOutForm.get("DateRange").value[1];
      this.checkOutForm.get("DateRange").patchValue([new Date(date1.setDate((date1.getDate()+1))), new Date(date2.setDate((date2.getDate()+1)))]);
      // this.ErHistoryComponent.getErList(this.formgroupData.DateRange);
    }else{
      var date1 = this.checkOutForm.get("DateRange").value[0];
      var date2 = this.checkOutForm.get("DateRange").value[1];
      const diffTime = Math.abs(date2 - date1);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      date1 = new Date(date1.setDate(date1.getDate()+diffDays));
      date2 = new Date(date2.setDate(date2.getDate()+diffDays));
      this.checkOutForm.get("DateRange").patchValue([date1, date2]);
      // this.ErHistoryComponent.getSelectedDates(this.formgroupData.DateRange);
    }
    
  }

  previousDateForCheckout(){
    if(+this.checkOutForm.get("DateRange").value[0] == +this.checkOutForm.get("DateRange").value[1]){
      var date1 = this.checkOutForm.get("DateRange").value[0];
      var date2 = this.checkOutForm.get("DateRange").value[1];
      this.checkOutForm.get("DateRange").patchValue([new Date(date1.setDate((date1.getDate()-1))), new Date(date2.setDate((date2.getDate()-1)))]);
      // this.ErHistoryComponent.getErList(this.formgroupData.DateRange);
    }else{
      var date1 = this.checkOutForm.get("DateRange").value[0];
      var date2 = this.checkOutForm.get("DateRange").value[1];
      const diffTime = Math.abs(date2 - date1);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      date1 = new Date(date1.setDate(date1.getDate()-diffDays));
      date2 = new Date(date2.setDate(date2.getDate()-diffDays));
      this.checkOutForm.get("DateRange").patchValue([date1, date2]);
      // this.ErHistoryComponent.getSelectedDates(this.formgroupData.DateRange);
    }


  }
  checkedOutList: any = [];
  openCheckoutList(template: TemplateRef<any>) {
    const config: ModalOptions = { class: 'modal-dialog-centered checkout_list' };
    this.modalRef = this.modalService.show(template, config);
    this.forCheckOutList();
  }

  showConfigFn($event) {
    $event.stopPropagation();
    if (this.showconfig) {
      this.showconfig = false;
    } else {
      this.showconfig = true;
      this.showfilter = false;
    }
  }

  updateView(value, event) {
    if (event.target.checked) {
      this.selectedView = value;
      if (this.selectedView == 'Movement Type') {
        this.selectedView = '1';
        this.movementType = true;
        this.statusView = false;
      } else {
        this.selectedView = '2';
        this.movementType = false;
        this.statusView = true;
      }
    } else {
      this.selectedView = '';
    }
  }

  updateColums(value, event) {
    if (event.target.checked) {
      this.postSelectedCol.push({ Variantid: '', Fieldname: value });
    } else {
      let el = this.postSelectedCol.find((itm) => {
        if (itm.Fieldname === value) {
          return value;
        }
      });

      if (el) this.postSelectedCol.splice(this.postSelectedCol.indexOf(el), 1);
    }

  }

  saveConfigTools(dataReset?: string) {
    let jsonObj = {
      Variantid: this.Variantid,
      Varianrname: '',
      Compid: 'MYCLINIC01',
      Usname: '',
      DefaultVariant: '',
      ConfigHeaderItem: [],
    };
    const ColumnType = this.ColumnType.filter(d => d.isSelected);
    if (dataReset == "reset") {
      jsonObj.ConfigHeaderItem.push({ Variantid: "", Fieldname: `ShowColumn-04` })
    } else {
      if (ColumnType && ColumnType.length) {
        jsonObj.ConfigHeaderItem.push({ Variantid: "", Fieldname: `ShowColumn-${ColumnType.map(d => d.Value).join(",")}` });
      }
      if (this.selectedItemsForMovTypeConf && this.selectedItemsForMovTypeConf.length) {
        const PayloadData = []
        const Data = this.selectedItemsForMovTypeConf.split(";");
        const DataShift = Data.shift();
        if (Data && Data.length) {
          Data.forEach((element) => {
            if(element) PayloadData.push(this.dropdownListForMovType.findIndex(d => d.Valuekey === element))
          })
          jsonObj.ConfigHeaderItem.push({ Variantid: "", Fieldname: `MovementType-${PayloadData.join(",")}` })
        }
      }
      if (this.selectedItemsForStatusConf && this.selectedItemsForStatusConf.length) {

        const Data: any = this.selectedItemsForStatusConf.split(";");
        const DataShift = Data.shift();
        let remove = Data.join(",").replace(/^[\s,]+/,"").replace(/[\s,]+$/,"").replace(/\s*,+\s*(,+\s*)*/g,",")
        jsonObj.ConfigHeaderItem.push({ Variantid: "", Fieldname: `Status-${remove}` })
      }
    }
    this._dataServices.postConfigTools(jsonObj).subscribe((data: any) => {
      if (data && data.d) {
        this.getConfigTools();
      }
    });
    this.showconfig = false;
  }



  getConfigTools() {
    this.AttendingPhysician = false;
    this.Diagnosis = false;
    this.Case = false;
    this.VisitType = false;
    this.comment = false;
    let jsonObj = {
      Compid: 'MYCLINIC01',
    };
    this.selectedItemsForMovTypeConf='';
    this.selectedItemsForStatusConf='';
    this._dataServices.getConfigTools(jsonObj).subscribe(
      (success: any) => {
        this.Variantid = success.d.results[0].Variantid;
        if (success && success.d && success.d.results[0] && success.d.results[0].ConfigHeaderItem && success.d.results[0].ConfigHeaderItem.results && success.d.results[0].ConfigHeaderItem.results.length) {
          // success.d.results[0].ConfigHeaderItem.results.find(d => d.Fieldname === "Attending Physician") ? this.AttendingPhysician = true : this.AttendingPhysician = false;
          // success.d.results[0].ConfigHeaderItem.results.find(d => d.Fieldname === "Diagnosis") ? this.Diagnosis = true : this.Diagnosis = false;
          // success.d.results[0].ConfigHeaderItem.results.find(d => d.Fieldname === "Case") ? this.Case = true : this.Case = false;
          // success.d.results[0].ConfigHeaderItem.results.find(d => d.Fieldname === "Visit Type") ? this.VisitType = true : this.VisitType = false;
          console.log(success.d.results[0].ConfigHeaderItem.results[0].Fieldname.split(" - "))
          success.d.results[0].ConfigHeaderItem.results.forEach(e => {
            const Data = e.Fieldname.split("-");
            const DataType = Data[0];
            const DataValue = Data[1].split(",")

            if (DataValue && DataValue.length) {
              if (DataType === "ShowColumn") {
                DataValue.forEach((element) => {
                  if (this.ColumnType.filter(d => element === d.Value) && this.ColumnType.filter(d => element === d.Value).length) {
                    this.ColumnType.filter(d => element === d.Value).forEach(i => i.isSelected = true);
                  } else {
                    this.ColumnType.forEach(i => i.isSelected = false);
                  }
                })
                let result = this.ColumnType.filter(item => item.isSelected);
                result.forEach((res: any)=> {
                  if(res.Desc == "Attending Physician") this.AttendingPhysician = true;
                  if(res.Desc == "Diagnosis") this.Diagnosis = true;
                  if(res.Desc == "Case") this.Case = true;
                  if(res.Desc == "Visit Type") this.VisitType = true;
                  if(res.Desc == "Comment") this.comment = true;
                })
              } else if (DataType === "MovementType") {
                this.defaultSelectedItemsForMovType = [];
                this.defaultSelectedItemsForMovTypeConf = [];
                DataValue.forEach((element) => {
                  if(element != 0) {
                    let mvtTtypVal=this.dropdownListForMovType[parseInt(element)];
                    if(mvtTtypVal){
                    this.defaultSelectedItemsForMovTypeConf.push({ Valuekey: mvtTtypVal.Valuekey, Valuedescr: mvtTtypVal.Valuedescr });
                    this.defaultSelectedItemsForMovType=this.defaultSelectedItemsForMovTypeConf;                  
                    this.selectedItemsForMovTypeConf = this.selectedItemsForMovTypeConf.concat(';',mvtTtypVal.Valuekey);
                  }
                }
                })
              } else if (DataType === "Status") {
                this.defaultSelectedItemsForStatus = [];
                this.defaultSelectedItemsForStatusConf = [];
                DataValue.forEach((element) => {
                  if(element) {
                    let statusTtypVal=this.dropdownListForStatus.find(d => d.Valuekey === element);
                    if(statusTtypVal){
                    this.defaultSelectedItemsForStatusConf.push({ Valuekey: statusTtypVal.Valuekey, Valuedescr: statusTtypVal.Valuedescr });
                    this.defaultSelectedItemsForStatus=this.defaultSelectedItemsForStatusConf;                  
                    this.selectedItemsForStatusConf = this.selectedItemsForStatusConf.concat(';',statusTtypVal.Valuekey);
                  }
                }
                })
              }
            }
          });
        } else {
          this.AttendingPhysician = false;
          this.Diagnosis = false;
          this.Case = false;
          this.VisitType = false;
          this.comment = false
        }
        this.selectedView = '1';
        this.movementType = true;
        this.statusView = false;
        this.filterDataConf();
      });
  }

  resetConfigToolsFields() {
    this.ColumnType.forEach(element => {
      element.isSelected = false;
    });
    this.saveConfigTools('reset');
  }

  myClinicWidgetInfoSet() {
    this._dataServices.getMyClinicInfoSet().subscribe(
      (_success: any) => {
        if (_success) {
          let test = JSON.parse(_success._body).d.TOMETADATA.FilterFields;
          this.widgetID = JSON.parse(_success._body).d.Widgetid;
          this.filterXml = JSON.parse(_success._body).d.TOMETADATA.FilterXml;
          let result1 = converter.xml2json(test, { compact: true, spaces: 2 });
          if (result1) {
            result1 = JSON.parse(result1);

            // console.log(result1["xsd:schema"]["xsd:complexType"][0]["xsd:sequence"][0]["xsd:element"]);
          }

          //this.profileResponse =JSON.parse(_success._body).d.results[0];
        }
      },
      (_error: any) => { }
    );
  }

  onItemSelectForMovType(item: any) {
    // this.selectedItemsForMovType = this.selectedItemsForMovType.concat(
    //   ';',
    //   item.Valuekey
    // );
    // console.log(this.selectedItemsForMovType);
  }
  onItemSelectForStatus(item: any) {
    // this.selectedItemsForStatus = this.selectedItemsForStatus.concat(
    //   ';',
    //   item.Valuekey
    // );
    // console.log(this.selectedItemsForStatus);
  }
  onSelectAll(items: any) {
    console.log(items);
  }
  onChange(event) {
    console.log(event);
  }

  getDataOnAction(data) {
    console.log(data);
    this.PATNR = data.PATNR;
    this.FALNR = data.FALNR;
    this.EINRI = data.EINRI;
    this.LFDBW = data.LFDBW;
  }
  openModuleKardex(data) {
    if (data.BESSTATTEXT == 'Planned') {
      if (data.BESSTATTEXT == 'Planned' && data.PATNR) {
        window.open(
          'e-kardex?patnr=' +
          data.PATNR +
          '&falnr=' +
          data.FALNR +
          '&einri=' +
          data.EINRI +
          '&lfdnr=' +
          data.LFDBW,
          '_blank'
        );
      }
    } else {
      window.open(
        'e-kardex?patnr=' +
        data.PATNR +
        '&falnr=' +
        data.FALNR +
        '&einri=' +
        data.EINRI +
        '&lfdnr=' +
        data.LFDBW,
        '_blank'
      );
    }

  }
  openModulePrescription(data) {
    window.open(
      'http://abdaliwebserver.ach.jo:8090/e-Application-QA/#/home/application?patnr=' +
      data.PATNR +
      '&falnr=' +
      data.FALNR +
      '&einri=' +
      data.EINRI +
      '&lfdnr=' +
      data.LFDBW +
      '&appl=EPRSCR',
      '_blank'
    );
  }
  openModuleLabChart(data) {

    window.open(
      environment.labChartUrl + 'patnr=' +
      data.PATNR +
      '&falnr=' +
      data.FALNR +
      '&einri=' +
      data.EINRI +
      '&lfdnr=' +
      data.LFDBW +
      '&appl=LABCHART',
      '_blank'
    );
  }
  openModuleVisitNote(data) {
    window.open(
      environment.visitNoteUrl + 'patnr=' +
      data.PATNR +
      '&falnr=' +
      data.FALNR +
      '&einri=' +
      data.EINRI +
      '&lfdnr=' +
      data.LFDBW +
      '&appl=VISITNOTE',
      '_blank'
    );
  }
  openModuleRad(data) {
    window.open(
      environment.radiologyUrl + 'patient_id=' + data.PATNR,
      '_blank'
    );
  }
  resetfilterData() {
    this.dateFrom = new Date();
    this.dateTo = new Date();




    this.filterDataConf();
  }


  sort() {
    this.dataOnTable.sort((a, b) => 0 - (a > b ? -1 : 1));
  }

  commanSorting(keyName: string) {
    if (!this.asc) {
      this.asc = true;
      this.dataOnTable.sort((a, b) => {
        const nameA = a[keyName].toUpperCase(); // ignore upper and lowercase
        const nameB = b[keyName].toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      });
    } else {
      this.asc = false;
      this.dataOnTable.sort((a, b) => {
        const nameA = a[keyName].toUpperCase(); // ignore upper and lowercase
        const nameB = b[keyName].toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return 1;
        }
        if (nameA > nameB) {
          return -1;
        }

        // names must be equal
        return 0;
      });
    }
  }
  sortTime() {
    if (!this.asc) {
      this.asc = true;
      this.dataOnTable.sort((a, b) => {
        const nameA = a.ZEIT_INTERN.toUpperCase(); // ignore upper and lowercase
        const nameB = b.ZEIT_INTERN.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      });
    } else {
      this.asc = false;
      this.dataOnTable.sort((a, b) => {
        const nameA = a.ZEIT_INTERN.toUpperCase(); // ignore upper and lowercase
        const nameB = b.ZEIT_INTERN.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return 1;
        }
        if (nameA > nameB) {
          return -1;
        }

        // names must be equal
        return 0;
      });
    }

  }
  sortMrn() {
    if (!this.asc) {
      this.asc = true;
      this.dataOnTable.sort((a, b) => {
        const nameA = a.PATNR.toUpperCase(); // ignore upper and lowercase
        const nameB = b.PATNR.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      });
    } else {
      this.asc = false;
      this.dataOnTable.sort((a, b) => {
        const nameA = a.PATNR.toUpperCase(); // ignore upper and lowercase
        const nameB = b.PATNR.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return 1;
        }
        if (nameA > nameB) {
          return -1;
        }

        // names must be equal
        return 0;
      });
    }

  }
  sortPatient() {
    if (!this.asc) {
      this.asc = true;
      this.dataOnTable.sort((a, b) => {
        const nameA = a.PATIENT.toUpperCase(); // ignore upper and lowercase
        const nameB = b.PATIENT.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      });
    } else {
      this.asc = false;
      this.dataOnTable.sort((a, b) => {
        const nameA = a.PATIENT.toUpperCase(); // ignore upper and lowercase
        const nameB = b.PATIENT.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return 1;
        }
        if (nameA > nameB) {
          return -1;
        }

        // names must be equal
        return 0;
      });
    }
  }
  sortVisitStatus() {
    if (!this.asc) {
      this.asc = true;
      this.dataOnTable.sort((a, b) => {
        const nameA = a.BESSTATTEXT.toUpperCase(); // ignore upper and lowercase
        const nameB = b.BESSTATTEXT.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      });
    } else {
      this.asc = false;
      this.dataOnTable.sort((a, b) => {
        const nameA = a.BESSTATTEXT.toUpperCase(); // ignore upper and lowercase
        const nameB = b.BESSTATTEXT.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return 1;
        }
        if (nameA > nameB) {
          return -1;
        }

        // names must be equal
        return 0;
      });
    }
  }
  sortVisitType() {
    if (!this.asc) {
      this.asc = true;
      this.dataOnTable.sort((a, b) => {
        const nameA = a.BESUCHSARTTEXT.toUpperCase(); // ignore upper and lowercase
        const nameB = b.BESUCHSARTTEXT.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      });
    } else {
      this.asc = false;
      this.dataOnTable.sort((a, b) => {
        const nameA = a.BESUCHSARTTEXT.toUpperCase(); // ignore upper and lowercase
        const nameB = b.BESUCHSARTTEXT.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return 1;
        }
        if (nameA > nameB) {
          return -1;
        }

        // names must be equal
        return 0;
      });
    }
  }

  sortCommanModeule(fieldName: string) {
    if (!this.asc) {
      this.asc = true;
      this.checkedOutList.sort((a, b) => {
        const nameA = a[fieldName].toUpperCase(); // ignore upper and lowercase
        const nameB = b[fieldName].toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      });
    } else {
      this.asc = false;
      this.checkedOutList.sort((a, b) => {
        const nameA = a[fieldName].toUpperCase(); // ignore upper and lowercase
        const nameB = b[fieldName].toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return 1;
        }
        if (nameA > nameB) {
          return -1;
        }

        // names must be equal
        return 0;
      });
    }
  }
  onDeselectForStatus(item: any) {
    // this.selectedItemsForStatus = this.selectedItemsForStatus.replace(item.Valuekey, '')
  }
  onDeselectForMovType(item: any) {
    // this.selectedItemsForMovType = this.selectedItemsForMovType.replace(item.Valuekey, '')
  }



  onItemSelectForMovTypeConf(item: any) {
    this.selectedItemsForMovTypeConf = this.selectedItemsForMovTypeConf.concat(
      ';',
      item.Valuekey
    );
  }

  onItemSelectForStatusConf(item: any) {
    this.selectedItemsForStatusConf = this.selectedItemsForStatusConf.concat(
      ';',
      item.Valuekey
    );
  }

  filterMovementTypeConf() {
    this._dataServices.getfilterMovementType().subscribe(
      (_success: any) => {
        _success = JSON.parse(_success._body);
        if (_success) {
          this.dropdownListForMovType = _success.d.FLDPROPTOVHELP.results;
     
          this.movementTypeConfig = _success.d.FLDPROPTOVHELP.results;
          this.movementTypeConfig.forEach((data: any) => {
            data.isSelected = false
          });
          this.filterFieldsStatusConf();

          //this.profileResponse =JSON.parse(_success._body).d.results[0];
        }
      },
      (_error: any) => { }
    );
  }
  filterFieldsStatusConf() {
    this._dataServices.getfilterFieldsStatus().subscribe(
      (_success: any) => {
        _success = JSON.parse(_success._body);
        if (_success) {
          

          this.dropdownListForStatus = _success.d.FLDPROPTOVHELP.results;
          this.statustypeConfig = _success.d.FLDPROPTOVHELP.results;
          this.statustypeConfig.forEach((data: any) => {
            data.isSelected = false
          });
          this.getConfigTools();
         }
      },
      (_error: any) => { }
    );
  }

  resetData() {
    this.defaultSelectedItemsForMovType = [];
    this.defaultSelectedItemsForStatus = [];
    let jsonObj = {
      Widgetid: 'MYCLINIC01',
      FilterXml:
        "<?xml version='1.0'?><asx:abap><asx:values><OUTPUT><RSPARAMS><SELNAME>DATE_FIX</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>DATE_FX1</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_OSTAT</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_SELAKT</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_BESANZ</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_BPFEHL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_BRFEHL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_DATUMB</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>20221027</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_DATUMV</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>20220601</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_EWFEHL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_LSTANZ</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_MAFEHL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_PANUEC</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_TEFEHL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_TMNANZ</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_VRMANZ</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_ZEITB</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>235959</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_ZEITV</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>000000</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_ZYKLLE</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_AOEFA</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_AOEPF</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>AM</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>CO</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>DO</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>EA</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>FR</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>FU</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>PD</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>PT</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>TL</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>WI</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>SE</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BHPER</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>9000000000</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BSSTA</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>30</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BSSTA</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>00</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BSSTA</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>58</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_DOCST</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_DOCTY</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_DOKAR</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_DSPTY</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_EINRI</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>1000</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_ETRGP</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_FALL</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_LEIST</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_LEIST</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>CAROPAMC</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_LSTGR</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_LSTST</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_LSTTX</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_PAT</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_RAUM</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_TRPAR</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_TRTGP</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>TIME_FIX</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>TIME_FX1</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_SEL_AP</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_FALAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>0</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_FALAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>1</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_FALAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>2</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_FALAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>3</LOW><HIGH/></RSPARAMS></OUTPUT></asx:values></asx:abap>",

      Barnr: this.attendingPerson,
      Datefrom:this.formDetailGroup.get("DateRange").value[0].getFullYear() + '-' + String(this.formDetailGroup.get("DateRange").value[0].getMonth() + 1).padStart(2, '0') + '-' + String(this.formDetailGroup.get("DateRange").value[0].getDate()).padStart(2, '0') + 'T00:00:00',
      Dateto:this.formDetailGroup.get("DateRange").value[1].getFullYear() + '-' + String(this.formDetailGroup.get("DateRange").value[1].getMonth() + 1).padStart(2, '0') + '-' + String(this.formDetailGroup.get("DateRange").value[1].getDate()).padStart(2, '0') + 'T00:00:00',
      // Datefrom: this.dateFrom.getFullYear() + '-' + String(this.dateFrom.getMonth() + 1).padStart(2, '0') + '-' + String(this.dateFrom.getDate()).padStart(2, '0') + 'T00:00:00',
      // Dateto: this.dateTo.getFullYear() + '-' + String(this.dateTo.getMonth() + 1).padStart(2, '0') + '-' + String(this.dateTo.getDate()).padStart(2, '0') + 'T00:00:00',
      Bwart: '',
      Status: '',
      New: "X"
    };
    this._dataServices.widgetDataFilter(jsonObj).subscribe(
      (_success: any) => {
        this.showfilter = false;
        let v = converter.xml2js(_success.d.DataXml, { compact: true });
        let _dataArray = [];
        let _output = v['asx:abap']['asx:values'].OUTPUT;
        console.log('_output', typeof _output);
        let _parsedDataKeys = Object.keys(v['asx:abap']['asx:values'].OUTPUT);
        _.forEach(_parsedDataKeys, function (dataObj) {
          let _dataValues = [];

          let outputDataValues = _output[dataObj];
          if (outputDataValues.length > 0) {
            _dataValues = outputDataValues;
          } else if (typeof outputDataValues == 'object') {
            _dataValues.push(outputDataValues);
          }

          console.log('data', _dataValues);

          _.forEach(_dataValues, function (dataKeyValue) {
            let _obj = {};
            _.forEach(Object.keys(dataKeyValue), function (key) {
              _obj[key] = _.toString(dataKeyValue[key]._text);
            });
            console.log('obj', _obj);

            _dataArray.push(_obj);
          });

          console.log('asd', _dataArray);
        });
        this.dataOnTable = _dataArray;
        this.dataCount.emit(this.dataOnTable.length);
      },
      (_error: any) => { }
    );
  }

  encounterId: any
  patient: Patient = {} as Patient;
  openPatientInfo(template: TemplateRef<any>,item) {
    this.encounterId = item.EINRI + item.FALNR + item.LFDBW;
    this.getDataPatient(template);
  }

  getDataPatient(template: TemplateRef<any>) {
    this.patientService
      .getDataPatient(this.encounterId)
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          // this.isError = true;
          // this.isLoading = false;
          return of({} as Patient);
        })
      )
      .subscribe((patientData: Patient) => {
        // this.isLoading = false;
        this.patient = patientData;
        const config: ModalOptions = { class: 'modal-dialog-centered patient-info-modal-size' };
        this.modalRef = this.modalService.show(template, config);
        // localStorage.setItem('initOrg', patientData.deptOrgUnit)
        // this.titleService.setTitle(`${patientData?.name} | ${this._route.snapshot.parent.routeConfig.path}`);
        // this.storageService.setPatientData(patientData);
      });
  }

  filterDataConf() {
    let selectedItemsForStatus='';
    this.defaultSelectedItemsForStatus.forEach(element => {
      selectedItemsForStatus = selectedItemsForStatus.concat(
        ';',
        element.Valuekey
      );
    });

    let selectedItemsForMovType='';
     this.defaultSelectedItemsForMovType.forEach(element => {
            selectedItemsForMovType = selectedItemsForMovType.concat(
              ';',
              element.Valuekey
            );
          });

    let jsonObj = {
      Widgetid: 'MYCLINIC01',
      FilterXml:
        "<?xml version='1.0'?><asx:abap><asx:values><OUTPUT><RSPARAMS><SELNAME>DATE_FIX</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>DATE_FX1</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_OSTAT</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_SELAKT</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_BESANZ</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_BPFEHL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_BRFEHL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_DATUMB</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>20221027</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_DATUMV</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>20220601</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_EWFEHL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_LSTANZ</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_MAFEHL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_PANUEC</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_TEFEHL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_TMNANZ</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_VRMANZ</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_ZEITB</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>235959</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_ZEITV</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>000000</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_ZYKLLE</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_AOEFA</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_AOEPF</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>AM</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>CO</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>DO</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>EA</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>FR</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>FU</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>PD</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>PT</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>TL</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>WI</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>SE</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BHPER</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>9000000000</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BSSTA</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>30</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BSSTA</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>00</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BSSTA</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>58</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_DOCST</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_DOCTY</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_DOKAR</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_DSPTY</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_EINRI</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>1000</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_ETRGP</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_FALL</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_LEIST</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_LEIST</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>CAROPAMC</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_LSTGR</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_LSTST</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_LSTTX</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_PAT</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_RAUM</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_TRPAR</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_TRTGP</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>TIME_FIX</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>TIME_FX1</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_SEL_AP</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_FALAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>0</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_FALAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>1</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_FALAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>2</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_FALAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>3</LOW><HIGH/></RSPARAMS></OUTPUT></asx:values></asx:abap>",

      Barnr: this.attendingPerson,
      Datefrom:this.formDetailGroup.get("DateRange").value[0].getFullYear() + '-' + String(this.formDetailGroup.get("DateRange").value[0].getMonth() + 1).padStart(2, '0') + '-' + String(this.formDetailGroup.get("DateRange").value[0].getDate()).padStart(2, '0') + 'T00:00:00',
      Dateto:this.formDetailGroup.get("DateRange").value[1].getFullYear() + '-' + String(this.formDetailGroup.get("DateRange").value[1].getMonth() + 1).padStart(2, '0') + '-' + String(this.formDetailGroup.get("DateRange").value[1].getDate()).padStart(2, '0') + 'T00:00:00',
      // Datefrom: this.dateFrom.getFullYear() + '-' + String(this.dateFrom.getMonth() + 1).padStart(2, '0') + '-' + String(this.dateFrom.getDate()).padStart(2, '0') + 'T00:00:00',
      // Dateto: this.dateTo.getFullYear() + '-' + String(this.dateTo.getMonth() + 1).padStart(2, '0') + '-' + String(this.dateTo.getDate()).padStart(2, '0') + 'T00:00:00',
      Bwart: selectedItemsForMovType,
      Status: selectedItemsForStatus,
      New: "X"
    };
    this._dataServices.widgetDataFilter(jsonObj).subscribe(
      (_success: any) => {
        this.showfilter = false;
        let v = converter.xml2js(_success.d.DataXml, { compact: true });
        let _dataArray = [];
        let _output = v['asx:abap']['asx:values'].OUTPUT;
        console.log('_output', typeof _output);
        let _parsedDataKeys = Object.keys(v['asx:abap']['asx:values'].OUTPUT);
        _.forEach(_parsedDataKeys, function (dataObj) {
          let _dataValues = [];

          let outputDataValues = _output[dataObj];
          if (outputDataValues.length > 0) {
            _dataValues = outputDataValues;
          } else if (typeof outputDataValues == 'object') {
            _dataValues.push(outputDataValues);
          }

          console.log('data', _dataValues);

          _.forEach(_dataValues, function (dataKeyValue) {
            let _obj = {};
            _.forEach(Object.keys(dataKeyValue), function (key) {
              _obj[key] = _.toString(dataKeyValue[key]._text);
            });
            console.log('obj', _obj);

            _dataArray.push(_obj);
          });

          console.log('asd', _dataArray);
        });
        this.dataOnTable = _dataArray;
        this.dataOnTable.sort((a, b) => {
          const timeA = new Date(`1970-01-01T${a.ZEIT_INTERN}`).getTime();
          const timeB = new Date(`1970-01-01T${b.ZEIT_INTERN}`).getTime();
          return timeA - timeB;
        });
        this.dataCount.emit(this.dataOnTable.length);
      },
      (_error: any) => { }
    );
  }
  onDeselectForStatusConf(item: any) {
    this.selectedItemsForStatusConf = this.selectedItemsForStatusConf.replace(item.Valuekey, '')
  }
  onDeselectForMovTypeConf(item: any) {
    this.selectedItemsForMovTypeConf = this.selectedItemsForMovTypeConf.replace(item.Valuekey, '')
  }
  confirmationForDelete(item) {
    Swal.fire({
      text: "Are you sure you want to change visit status to Check Out?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: 'myalertpopup'
    }).then((result) => {
      if (result.value) {
        this.changeStatus(item);
      }
    })
  }
  changeStatus(item) {
    let createTime = 'PT' + new Date().getHours() + 'H' + new Date().getMinutes() + 'M' + '00S'
    const json = {
      "Einri": item.EINRI,
      "Falnr": item.FALNR,
      "Patnr": item.PATNR,
      "Lfdnr": item.LFDBW,
      "VisitStat": "70",
      "Sdate": new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0') + '-' + String(new Date().getDate()).padStart(2, '0') + 'T00:00:00',
      "Stime": createTime
    }
    this._dataServices.changeStatus(json).subscribe(
      (success: any) => {
        this.filterDataConf();
      });
  }
  exportToExcel(nameofFile: string = 'my-clinic', fileExtention: string = 'xlsx'): void {
    const eventArray = this.dataOnTable;
    const mappedEvents = eventArray.map(event => {
      return {
          DATUM: this.convertTimestampToDate(event.DATUM),
          ZEIT_INTERN: event.ZEIT_INTERN,
          BESUCHSARTTEXT: event.BESUCHSARTTEXT,
          BESSTATTEXT: event.BESSTATTEXT,
          PATNR: event.PATNR,
          FALNR: event.FALNR,
          PATIENT: event.PATIENT,
          BEHPERSNAME: event.BEHPERSNAME,
          ZZFIN_CAT: event.ZZFIN_CAT,
          ANFDIAGNOSE: event.ANFDIAGNOSE,
          BEMERKUNG: event.BEMERKUNG,
      };
  });
    let Heading = [['Date', 'Time' , 'Visit Type','Visit Status','MRN','Case','Patient','Attn. Phy.','Financial Category','Diagnosis','Comment']];
    const workbook = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, Heading);
    XLSX.utils.sheet_add_json(ws, mappedEvents, { origin: 'A2', skipHeader: true });
    XLSX.utils.book_append_sheet(workbook, ws, "test");
    XLSX.writeFile(workbook, `${nameofFile}.${fileExtention}`);
  }

  exportToExcelCheckOut(nameofFile: string = 'my-clinic', fileExtention: string = 'xlsx'): void {
    const eventArray = this.dataOnTableForCheckOut;
    const mappedEvents = eventArray.map(event => {
      return {
          DATUM: this.convertTimestampToDate(event.DATUM),
          ZEIT_INTERN: event.ZEIT_INTERN,
          BESUCHSARTTEXT: event.BESUCHSARTTEXT,
          BESSTATTEXT: event.BESSTATTEXT,
          PATNR: event.PATNR,
          FALNR: event.FALNR,
          PATIENT: event.PATIENT,
          BEHPERSNAME: event.BEHPERSNAME,
          ZZFIN_CAT: event.ZZFIN_CAT,
          ANFDIAGNOSE: event.ANFDIAGNOSE,
          BEMERKUNG: event.BEMERKUNG,
      };
  });
    let Heading = [['Date', 'Time' , 'Visit Type','Visit Status','MRN','Case','Patient','Attn. Phy.','Financial Category','Diagnosis','Comment']];
    const workbook = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, Heading);
    XLSX.utils.sheet_add_json(ws, mappedEvents, { origin: 'A2', skipHeader: true });
    XLSX.utils.book_append_sheet(workbook, ws, "test");
    XLSX.writeFile(workbook, `${nameofFile}.${fileExtention}`);
  }
  convertTimestampToDate(timestamp: any): string {
    if (typeof timestamp === 'string' && timestamp.startsWith('/Date(') && timestamp.endsWith(')/')) {
        const milliseconds = parseInt(timestamp.substring(6, timestamp.length - 2), 10);
        const date = new Date(milliseconds);
        return this.datePipe.transform(date, 'dd.MM.y');
    } else {
        return timestamp; // Return the original value if it's not in the expected format
    }
}
dataOnTableForCheckOut: any;
forCheckOutList() {
  let selectedItemsForStatus='';
  this.defaultSelectedItemsForStatus.forEach(element => {
    selectedItemsForStatus = selectedItemsForStatus.concat(
      ';',
      element.Valuekey
    );
  });

  let selectedItemsForMovType='';
   this.defaultSelectedItemsForMovType.forEach(element => {
          selectedItemsForMovType = selectedItemsForMovType.concat(
            ';',
            element.Valuekey
          );
        });

  let jsonObj = {
    Widgetid: 'MYCLINIC01',
    FilterXml:
      "<?xml version='1.0'?><asx:abap><asx:values><OUTPUT><RSPARAMS><SELNAME>DATE_FIX</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>DATE_FX1</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>GR_OSTAT</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>G_SELAKT</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_BESANZ</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_BPFEHL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_BRFEHL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_DATUMB</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>20221027</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_DATUMV</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>20220601</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_EWFEHL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_LSTANZ</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_MAFEHL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_PANUEC</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_TEFEHL</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_TMNANZ</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_VRMANZ</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_ZEITB</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>235959</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_ZEITV</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>000000</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_ZYKLLE</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_AOEFA</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_AOEPF</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>AM</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>CO</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>DO</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>EA</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>FR</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>FU</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>PD</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>PT</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>TL</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>WI</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BEWAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>SE</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BHPER</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>9000000000</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BSSTA</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>30</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BSSTA</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>00</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_BSSTA</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>58</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_DOCST</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_DOCTY</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_DOKAR</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_DSPTY</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_EINRI</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>1000</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_ETRGP</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_FALL</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_LEIST</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_LEIST</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>CAROPAMC</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_LSTGR</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_LSTST</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_LSTTX</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_PAT</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_RAUM</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_TRPAR</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_TRTGP</SELNAME><KIND>S</KIND><SIGN/><OPTION/><LOW/><HIGH/></RSPARAMS><RSPARAMS><SELNAME>TIME_FIX</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>TIME_FX1</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>P_SEL_AP</SELNAME><KIND>P</KIND><SIGN/><OPTION/><LOW>X</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_FALAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>0</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_FALAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>1</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_FALAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>2</LOW><HIGH/></RSPARAMS><RSPARAMS><SELNAME>SE_FALAR</SELNAME><KIND>S</KIND><SIGN>I</SIGN><OPTION>EQ</OPTION><LOW>3</LOW><HIGH/></RSPARAMS></OUTPUT></asx:values></asx:abap>",

    Barnr: this.attendingPerson,
    Datefrom:this.checkOutForm.get("DateRange").value[0].getFullYear() + '-' + String(this.checkOutForm.get("DateRange").value[0].getMonth() + 1).padStart(2, '0') + '-' + String(this.checkOutForm.get("DateRange").value[0].getDate()).padStart(2, '0') + 'T00:00:00',
    Dateto:this.checkOutForm.get("DateRange").value[1].getFullYear() + '-' + String(this.checkOutForm.get("DateRange").value[1].getMonth() + 1).padStart(2, '0') + '-' + String(this.checkOutForm.get("DateRange").value[1].getDate()).padStart(2, '0') + 'T00:00:00',
    // Datefrom: this.dateFrom.getFullYear() + '-' + String(this.dateFrom.getMonth() + 1).padStart(2, '0') + '-' + String(this.dateFrom.getDate()).padStart(2, '0') + 'T00:00:00',
    // Dateto: this.dateTo.getFullYear() + '-' + String(this.dateTo.getMonth() + 1).padStart(2, '0') + '-' + String(this.dateTo.getDate()).padStart(2, '0') + 'T00:00:00',
    Bwart: '',
    Status: '70',
    New: "X"
  };
  this._dataServices.widgetDataFilter(jsonObj).subscribe(
    (_success: any) => {
      this.showfilter = false;
      let v = converter.xml2js(_success.d.DataXml, { compact: true });
      let _dataArray = [];
      let _output = v['asx:abap']['asx:values'].OUTPUT;
      console.log('_output', typeof _output);
      let _parsedDataKeys = Object.keys(v['asx:abap']['asx:values'].OUTPUT);
      _.forEach(_parsedDataKeys, function (dataObj) {
        let _dataValues = [];

        let outputDataValues = _output[dataObj];
        if (outputDataValues.length > 0) {
          _dataValues = outputDataValues;
        } else if (typeof outputDataValues == 'object') {
          _dataValues.push(outputDataValues);
        }

        console.log('data', _dataValues);

        _.forEach(_dataValues, function (dataKeyValue) {
          let _obj = {};
          _.forEach(Object.keys(dataKeyValue), function (key) {
            _obj[key] = _.toString(dataKeyValue[key]._text);
          });
          console.log('obj', _obj);

          _dataArray.push(_obj);
        });

        console.log('asd', _dataArray);
      });
      this.dataOnTableForCheckOut = _dataArray;
      this.dataOnTableForCheckOut.sort((a, b) => {
        const timeA = new Date(`1970-01-01T${a.ZEIT_INTERN}`).getTime();
        const timeB = new Date(`1970-01-01T${b.ZEIT_INTERN}`).getTime();
        return timeA - timeB;
      });
      // this.dataCount.emit(this.dataOnTableForCheckOut.length);
    },
    (_error: any) => { }
  );
}
}

