import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PointofsaleService } from '@services/pointofsale.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { ErBedComponent } from '../check-in/er-bed/er-bed.component';
import { ErVitalsComponent } from '../check-in/er-vitals/er-vitals.component';
import { NurErAllergyComponent } from '../check-in/nur-er-allergy/nur-er-allergy.component';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { StorageService } from '@services/storage.service';
import { DatePipe } from '@angular/common';
import { HospitalistService } from '@services/e-hospitalist/hospitalist.service';
import { DayCaseDashboardService } from '@services/day-case.dashboard/day-case-dashboard.service';

@Component({
  selector: 'app-physician-orders-list',
  templateUrl: './physician-orders-list.component.html',
  styleUrls: ['./physician-orders-list.component.scss']
})
export class PhysicianOrdersListComponent implements OnInit{
  @ViewChild('erBed') erBed: ErBedComponent;
  @ViewChild('erVitalsModal') erVitalsModal: ErVitalsComponent;
  @ViewChild('nurErAllergy') nurErAllergy: NurErAllergyComponent;
  @Output() sendErPatientCount = new EventEmitter<any>();
  @Output() redirectCheckInData = new EventEmitter<any>();
  @Output() reloadTableData = new EventEmitter();
  items: FormArray;
  isFormValidError: boolean = false;
  profileRes: any;
  showPhyOrderError=false;
  currentTime: any;
  phyOrderData: any;
  searchString: string = '';
  cancelReasonListData: any = [];
  ERlistData:any;
  errmsg: string;
  // @Output() ERlistData = new EventEmitter<string>();
  @Output() dataToParent = new EventEmitter<any>();
  currentDateObj: any = [];
  ERlistDataClone: any = [];
  asc: boolean;
  cancelReasonValue: any = '';
  triageValueArr: any = [];
  physicianValueArr: any = [];
  statusValueArr: any = [];
  lastIndex: number;
  modalRefForRisk: BsModalRef;
  modalRefForLab:BsModalRef;
  phyOrderform1: FormGroup;
  selectedERList: any;
  isRiskUpdate: boolean;
  phyOrderAction: any;
  riskList: any[];
  riskform: FormGroup;
  riskFormitems: FormArray;
  updateRiskForm: FormGroup;
  modalRef: BsModalRef;
  colName: any;
  modalCommonDataArr: any;
  allergenValues: any;
  updateAllergyForm: FormGroup;
  allergenGroupValues: any;
  allergyCertaintyValues: any;
  allergyEvaluationValues: any;
  allergyReactionValues: any;
  severityValues: any;
  allergyTypeValues: any;
  riskValues: any;
  riskItemsArr: any[];
  riskJson: any[];
  selectedDataForUpdate: any;
  activelabLabelData: any;
  oldDate: any;
  printUrl: any;
  dataOnTableForPhyOrder = [];
  dataOnTableForPhyOrderClone=[]
  constructor(
    private emergencyService: EmergencyService,
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private storageService:StorageService,
    private hospitalistService: HospitalistService,
    private _hospitallistService: HospitalistService,
    private dayCaseDashboardService:DayCaseDashboardService
  ) {
    this.riskform = this.formBuilder.group({
      riskFormitems: new FormArray([]),
    });

    this.updateAllergyForm = this.formBuilder.group({
      AllergySeqno : ['0000'],
      Allrgycatlog : [''],
      Allrgyid :  [''],
      Allergen :  [''],
      AllrgycatlogAgr :  [''],
      AllrgyidAgr :  [''],
      AllergenGrp :  [''],
      Cert :  [''],
      CerText :  [''],
      Eval :  [''],
      EvalTxt :  [''],
      Rea :  [''],
      ReaText :   [''],
      Soa :  [''],
      SoaText :  [''],
      Typ :  [''],
      TypText :  [''],
      Adcomment :  [''],
      AdcommentLt :  [''],
      });
    this.updateRiskForm = this.formBuilder.group({
        Rsfnr: [''],
        Rsfna: ['', [Validators.required]],
        Rsfkb: [''],
        Rsfsn: [''],
        Repdt: [''],
    });
  }

  ngOnInit(): void {
    this.getErList("","")
     this.cancelReasonList();
  }
  getAssignedTime(triagetime, triagedate, index) {
    let {
      charArr,
      hr,
      min,
      dateObj,
      totalMinutes,
      assignedHr,
      assignedMin,
      assignedTime,
    }: any = '';
    charArr = triagetime.split('');
    hr = parseInt(charArr[0] + charArr[1]);
    min = parseInt(charArr[3] + charArr[4]);
    dateObj = triagedate;
    this.currentDateObj = new Date();
    dateObj.setHours(hr, min);
    totalMinutes = (this.currentDateObj.getTime() - dateObj.getTime()) / 1000;
    totalMinutes = totalMinutes / 60;
    totalMinutes = Math.abs(Math.round(totalMinutes));
    assignedHr = Math.floor(totalMinutes / 60);
    assignedMin = totalMinutes % 60;
    assignedTime =
      String(assignedHr).padStart(2, '0') +
      'h' +
      String(assignedMin).padStart(2, '0');
    this.ERlistData[index]['assignedTime'] = assignedTime;
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
      var str = str.split(':');
      var finalstr = str[0] + ':' + str[1];
      return finalstr;
    }
  }

  addItemForRisk(element?): void {
    this.riskFormitems = this.riskform.get('riskFormitems') as FormArray;
    this.riskFormitems.push(this.showRiskDetailsOnList(element));
    this.disableInputs();
  }

  disableInputs() {
    (<FormArray>this.riskform.get('riskFormitems')).controls.forEach(
      (control) => {
        control['controls']['Rsfna'].disable();
        control['controls']['Rsfkb'].disable();
      }
    );
  }

  cancelReasonList() {
    this._hospitallistService.cancelReasonList().subscribe(
      (_success: any) => {
        //_success = JSON.parse(_success._body);
        this.cancelReasonListData = _success.d.results;
      },
      (_error: any) => {}
    );
  }
  showRiskDetailsOnList(element?): FormGroup {
    if (element) {
      return this.formBuilder.group({
        Rsfnr: [element.Rsfnr],
        Rsfna: [element.Rsfna],
        Rsfkb: [element.Rsfkb],
        Rsfsn: [element.Rsfsn],
        Repdt: [element.Repdt],
        Einri: [this.selectedERList.Einri],
        Patnr: [this.selectedERList.Patnr],
        Lfdnr: [this.selectedERList.Lfdbw],
        Mode: [''],
        isChecked: [false],
      });
    } else {
      return this.formBuilder.group({
        Rsfnr: [''],
        Rsfna: [''],
        Rsfkb: [''],
        Rsfsn: [''],
        Repdt: [''],
        Einri: [this.selectedERList.Einri],
        Patnr: [this.selectedERList.Patnr],
        Lfdnr: [this.selectedERList.Lfdbw],
        Mode: [''],
        isChecked: [true],
      });
    }
  }
  get phyOrderControls() {
    return this.phyOrderform1.controls;
  }
  saveRiskJsonFormat() {
    this.isFormValidError = true;
    this.riskJson = [];
    let mode = '';
    if (this.isRiskUpdate) {
      mode = 'U';
    } else {
      mode = 'I';
    }
    let finallfdnrValue;
    if (mode == 'I') {
      finallfdnrValue = '000';
    } else {
      finallfdnrValue = this.selectedDataForUpdate.Lfdnr;
    }
    let reportedon = '';
    if (this.updateRiskForm.controls.Repdt.value !== '') {
      reportedon =
        this.updateRiskForm.controls.Repdt.value.getDate() +
        '.' +
        this.updateRiskForm.controls.Repdt.value.getMonth(
          this.updateRiskForm.controls.Repdt.value.setMonth(
            this.updateRiskForm.controls.Repdt.value.getMonth() + 1
          )
        ) +
        '.' +
        this.updateRiskForm.controls.Repdt.value.getFullYear();
    }
    this.riskJson = [
      {
        Patnr: this.selectedERList.Patnr,
        Lfdnr: finallfdnrValue,
        Rsfnr: this.updateRiskForm.controls.Rsfnr.value,
        Rsfna: this.updateRiskForm.controls.Rsfna.value,
        Rsfkb: this.updateRiskForm.controls.Rsfkb.value,
        Rsfsn: this.updateRiskForm.controls.Rsfsn.value,
        Mode: mode,
      },
    ];
    if (this.updateRiskForm.controls.Repdt.value !== '') {
      (reportedon =
        this.updateRiskForm.controls.Repdt.value.getFullYear() +
        '-' +
        String(
          this.updateRiskForm.controls.Repdt.value.getMonth() + 1
        ).padStart(2, '0') +
        '-' +
        String(this.updateRiskForm.controls.Repdt.value.getDate()).padStart(
          2,
          '0'
        ) +
        'T00:00:00'),
        (this.riskJson[0]['Repdt'] = reportedon);
    }
    this.saveRiskList();
  }
  saveRiskList() {
    if (this.riskJson[0]['Mode'] !== 'D') {
      if (this.updateRiskForm.controls.Rsfna.value == '') {
        Swal.fire({
          text: 'Risk Code is Mandatory',
          icon: 'error',
          confirmButtonText: 'Ok',
          customClass: 'myalertpopup',
        });
      } else {
        const json = {
          Patnr: this.selectedERList.Patnr,
          PatRiskHdrToItmNav: {
            results: this.riskJson,
          },
        };
        this.emergencyService.saveRiskList(json).subscribe(
          (_success: any) => {
            this.resetRiskForm();
            this.resetUpdateRiskForm();
            this.getRiskList(this.selectedERList);
            Swal.fire({
              text: 'Saved successfully',
              icon: 'success',
              confirmButtonText: 'Ok',
              customClass: 'myalertpopup',
            });
            this.isFormValidError = false;
          },
          (_error: any) => {}
        );
      }
    } else if (this.riskJson[0]['Mode'] == 'D') {
      const json = {
        Patnr: this.selectedERList.Patnr,
        PatRiskHdrToItmNav: {
          results: this.riskJson,
        },
      };
      this.emergencyService.saveRiskList(json).subscribe(
        (_success: any) => {
          this.resetRiskForm();
          this.resetUpdateRiskForm();
          this.getRiskList(this.selectedERList);
          Swal.fire({
            text: 'Deleted successfully',
            icon: 'success',
            confirmButtonText: 'Ok',
            customClass: 'myalertpopup',
          });
        },
        (_error: any) => {}
      );
    } else {
      const json = {
        Patnr: this.selectedERList.Patnr,
        PatRiskHdrToItmNav: {
          results: this.riskJson,
        },
      };
      this.emergencyService.saveRiskList(json).subscribe(
        (_success: any) => {
          this.resetRiskForm();
          this.resetUpdateRiskForm();
          this.getRiskList(this.selectedERList);
          Swal.fire({
            text: 'Saved successfully',
            icon: 'success',
            confirmButtonText: 'Ok',
            customClass: 'myalertpopup',
          });
        },
        (_error: any) => {}
      );
    }
  }

  openCommonModal(template: TemplateRef<any>, column) {
    const config: ModalOptions = { class: 'modal-dialog-centered' };
    this.modalRef = this.modalService.show(template, config);
    this.colName = column;
    if (column == 'Allergen') {
      this.modalCommonDataArr = this.allergenValues;
      this.searchString = this.updateAllergyForm.controls.Allergen.value;
      this.someMethod(this.searchString);
    }
    if (column == 'Allergen group') {
      this.modalCommonDataArr = this.allergenGroupValues;
    }
    if (column == 'Certainty') {
      this.modalCommonDataArr = this.allergyCertaintyValues;
    }
    if (column == 'Evaluation') {
      this.modalCommonDataArr = this.allergyEvaluationValues;
    }
    if (column == 'Allergic reaction') {
      this.modalCommonDataArr = this.allergyReactionValues;
    }
    if (column == 'Severity') {
      this.modalCommonDataArr = this.severityValues;
    }
    if (column == 'Allergy type') {
      this.modalCommonDataArr = this.allergyTypeValues;
    }
    if (column == 'Comments') {
      this.modalCommonDataArr = this.allergenValues;
    }
    if (column == 'RiskCode') {
      this.modalCommonDataArr = this.riskValues;
      this.searchString = this.updateRiskForm.controls.Rsfna.value;
      this.someMethod(this.searchString);
    }
  }

  someMethod(event: string) {
    if (this.modalCommonDataArr.length == 0) {
      if (this.colName == 'Allergen') {
        this.modalCommonDataArr = this.allergenValues;
      } else {
        this.modalCommonDataArr = this.riskValues;
      }
    } else {
      if (event == '') {
        if (this.colName == 'Allergen') {
          this.modalCommonDataArr = this.allergenValues;
        } else {
          this.modalCommonDataArr = this.riskValues;
        }
      } else {
        this.modalCommonDataArr = this.modalCommonDataArr.filter(
          (item: any) => {
            if (item.hasOwnProperty('Bcpname')) {
              return item.Bcpname.toLowerCase().includes(event.toLowerCase());
            } else {
              return item.Rsfna.toLowerCase().includes(event.toLowerCase());
            }
          }
        );
      }
    }
  }

  confirmationForRiskDelete(status, item) {
    Swal.fire({
      text: 'Are you sure you want to delete?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: 'myalertpopup',
    }).then((result) => {
      if (result.value) {
        this.deleteRiskJson(item);
      }
    });
  }

  deleteRiskJson(item) {
    this.riskJson = [];
    this.riskJson = [
      {
        Patnr: this.selectedERList.Patnr,
        Lfdnr: item.Lfdnr,
        Rsfnr: item.Rsfnr,
        Rsfna: item.Rsfna,
        Rsfkb: item.Rsfkb,
        Rsfsn: item.Rsfsn,
        Mode: 'D',
      },
    ];
    this.saveRiskList();
  }

  selectValueFromList(item) {
    if (this.colName == 'Allergen') {
      this.updateAllergyForm.controls.Allergen.setValue(item.Bcpname);
      this.updateAllergyForm.controls.Allrgyid.setValue(item.Bcpid);
      this.updateAllergyForm.controls.Allrgycatlog.setValue(item.Bchid);
      this.updateAllergyForm.controls.AllergenGrp.setValue(item.BcpnameGroup);
      this.updateAllergyForm.controls.AllrgyidAgr.setValue(item.BcpidGroup);
      this.updateAllergyForm.controls.AllrgycatlogAgr.setValue(item.Bchid);
    }
    if (this.colName == 'Allergen group') {
      this.updateAllergyForm.controls.AllergenGrp.setValue(item.Bcpname);
      this.updateAllergyForm.controls.AllrgyidAgr.setValue(item.Bcpid);
      this.updateAllergyForm.controls.AllrgycatlogAgr.setValue(item.Bchid);
    }
    if (this.colName == 'Certainty') {
      this.updateAllergyForm.controls.CerText.setValue(item.CerText);
      this.updateAllergyForm.controls.Cert.setValue(item.Cer);
    }
    if (this.colName == 'Evaluation') {
      this.updateAllergyForm.controls.EvalTxt.setValue(item.EvalTxt);
      this.updateAllergyForm.controls.Eval.setValue(item.Eval);
    }
    if (this.colName == 'Allergic reaction') {
      this.updateAllergyForm.controls.ReaText.setValue(item.ReaText);
      this.updateAllergyForm.controls.Rea.setValue(item.Rea);
    }
    if (this.colName == 'Severity') {
      this.updateAllergyForm.controls.SoaText.setValue(item.SoaText);
      this.updateAllergyForm.controls.Soa.setValue(item.Soa);
    }
    if (this.colName == 'Allergy type') {
      this.updateAllergyForm.controls.TypText.setValue(item.TypText);
      this.updateAllergyForm.controls.Typ.setValue(item.Typ);
    }
    if (this.colName == 'Comments') {
      this.updateAllergyForm.controls.Adcomment.setValue(item.Adcomment);
      this.updateAllergyForm.controls.AdcommentLt.setValue(item.Adcomment);
    }
    if (this.colName == 'RiskCode') {
      this.updateRiskForm.controls.Rsfnr.setValue(item.Rsfnr);
      this.updateRiskForm.controls.Rsfna.setValue(item.Rsfna);
      this.updateRiskForm.controls.Rsfkb.setValue(item.Rsfkb);
    }
    this.modalRef.hide();
  }

  selectValueFromRiskTable(item) {
    this.isRiskUpdate = true;
    this.selectedDataForUpdate = item;
    this.updateRiskForm.controls.Rsfnr.setValue(item.Rsfnr);
    this.updateRiskForm.controls.Rsfna.setValue(item.Rsfna);
    this.updateRiskForm.controls.Rsfkb.setValue(item.Rsfkb);
    this.updateRiskForm.controls.Rsfsn.setValue(item.Rsfsn);
    this.updateRiskForm.controls.Repdt.setValue(item.Repdt);
  }

  public openModalForRisk(template: TemplateRef<any>, data: any) {
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-xl risk-modal-size',
    };
    this.modalRefForRisk = this.modalService.show(template, config);
    this.selectedERList = data;
    this.getRiskList(data);
    this.getRiskValues();
    this.isRiskUpdate = false;
    this.modalRefForRisk.onHide.subscribe((reason: string | any) => {
      if (reason === 'backdrop-click') {
        this.closeRiskModal();
      }
    });
  }
  public labPrintLabelModal(template: TemplateRef<any>, data: any) {
    const config: ModalOptions = {
      class: 'modal-dialog-centered modal-md lab-modal-size',
    };
    this.modalRefForLab = this.modalService.show(template, config);
    this.activelabLabelData = data
    this.modalRefForLab.onHide.subscribe((reason: string | any) => {
      if (reason === 'backdrop-click') {
        this.closeLabModal();
      }
    });
  }
  closeLabModal(){
    this.modalRefForLab.hide();
  }
  closeRiskModal() {
    this.modalRefForRisk.hide();
    this.resetRiskForm();
    this.resetUpdateRiskForm();
    this.searchString = '';
  }

  resetUpdateRiskForm() {
    this.updateRiskForm.patchValue({
      Rsfnr: '',
      Rsfna: '',
      Rsfkb: '',
      Rsfsn: '',
      Repdt: '',
    });
    this.isRiskUpdate = false;
    this.isFormValidError = false;
  }

  resetRiskForm() {
    this.riskFormitems = this.riskform.get('riskFormitems') as FormArray;
    this.riskform.reset();
    this.riskFormitems.clear();
    this.riskItemsArr = [];
  }

  getRiskList(data) {
    const json = {
      einri: data.Einri,
      patnr: data.Patnr,
    };
    this.emergencyService.getRiskList(json).subscribe(
      (_success: any) => {
        this.riskList = [];
        this.riskList = _success.d.results;

        this.riskList.forEach((element) => {
          element['Repdt'] = new Date(element.Repdt);
          this.addItemForRisk(element);
        });
      },
      (_error: any) => {}
    );
  }
  getRiskValues() {
    this.emergencyService.getRiskValues().subscribe(
      (_success: any) => {
        this.riskValues = _success.d.results;
      },
      (_error: any) => {}
    );
  }
  navTabBoxActiveValue: string = '02';
 getErList(date:any,event?:any) {
  let jsonObj = {
    // fromDate:`${new DatePipe('en-US').transform(
    //   date ?  date[0] : new Date().setDate(new Date().getDate()),
    //   'yyyy-MM-dd'
    // )}T00:00:00`,
    // toDate:`${new DatePipe('en-US').transform(
    //   date ?  date[1]  :new Date().setDate(new Date().getDate()),
    //   'yyyy-MM-dd'
    // )}T00:00:00`,
      // Floor: event?.wardNo ? event.wardNo : '',
      // Patientstatus: event?.patientStatus ? event.patientStatus : '',
      // module: "Not_Executed_Physician_Order",
      currentDate:`${new DatePipe('en-US').transform(
        date ?  date[0] : new Date().setDate(new Date().getDate()),
        'yyyy-MM-dd'
      )}T00:00:00`,
      // AttendingDoctor:event?.AttendingDoctor ? event.AttendingDoctor:'',
      Deptou:event?.Deptou ? event.Deptou : '',
      // Flag:event?.Flag?event.Flag : ''
  };
  let jsonObj1 = {
     fromDate:`${new DatePipe('en-US').transform(
      date ?  date[0] : new Date().setDate(new Date().getDate()),
      'yyyy-MM-dd'
    )}T00:00:00`,
    toDate:`${new DatePipe('en-US').transform(
      date ?  date[1]  :new Date().setDate(new Date().getDate()),
      'yyyy-MM-dd'
    )}T00:00:00`,
    Deptcode:'1',
  }
      this.dayCaseDashboardService.getNotPhysicionOrderList(jsonObj1).subscribe(
        (_success: any) => {
          if(_success){
            this.dataOnTableForPhyOrder = _success?.d?.results;
            this.dataOnTableForPhyOrderClone = _success?.d?.results;
              this.dataToParent.emit(this.dataOnTableForPhyOrder);
              this.sendErPatientCount.emit(this.dataOnTableForPhyOrder.length);
            }
        },(error)=>{})
  }
  

  getSelectedDates(dates){
    // this.getErList("", dates);
    this.oldDate = dates
   }

  filterPhysicianOrders(event) { 
    const { wardNo, Physician, FWard } = event;
    this.dataOnTableForPhyOrder = this.dataOnTableForPhyOrderClone.filter((item: any) => {
        const matchesPhysician = Physician.length === 0 || Physician.includes(item.Erusr);
        const matchesPhysicianWard = FWard.length === 0 || FWard.includes(item.Floor);
        const matchesWardNo = !wardNo || item.RoomidText === wardNo;
        
        return matchesPhysician && matchesWardNo && matchesPhysicianWard;
    });
   }
  
  

  getPrintUrl(){
    this.emergencyService.getPrintLabel().subscribe((res:any)=>{
      this.printUrl = res.d.results[0].Url 
   })
  }

  printLabel(){
    if(this.activelabLabelData.Vkgid){
      this.emergencyService.PrintLabel(this.printUrl + this.activelabLabelData.Vkgid).subscribe((res:any)=>{}) 
      this.closeLabModal();
    }
    
  }
  createPhysicianOrder() {
    if (this.items.controls[0].value.physicianOrder == '' && this.items.controls[1].value.physicianOrder == '' && this.items.controls[2].value.physicianOrder == '' && this.items.controls[3].value.physicianOrder == '') {
        this.showPhyOrderError = true;
      }
    else{
        this.items.controls.forEach(element => {
          if (element.value.physicianOrder != '') {
            var createTime = 'PT11H29M30S';
            if (element.value.orderTime.value) {
             createTime = this.phyOrderControls.orderTime.value.split(':')
            createTime = 'PT'+ createTime[0]+'H' + createTime[1] + 'M' + '00S'
            }
            let json ={};

            if (this.phyOrderData.Einri) {
               json = {
                "InstitutionId":this.phyOrderData.Einri,
                 "CaseId":this.phyOrderData.Falnr,
                "CreationDate" : element.value.orderDate.toISOString().split('.')[0],
                "CreationTime" : createTime,
                "ZphysOrder" : element.value.physicianOrder,
                "EmployeeResp" : this.phyOrderControls.physicianNumber.value,
                "ProfessionalGroup" : element.value.occupationalGroup,
              }
            } else {
               json = {
                "InstitutionId":this.phyOrderData.Institute,
                 "CaseId":this.phyOrderData.CaseNumber,
                "CreationDate" : element.value.orderDate.toISOString().split('.')[0],
                "CreationTime" : createTime,
                "ZphysOrder" : element.value.physicianOrder,
                "EmployeeResp" : this.phyOrderControls.physicianNumber.value,
                "ProfessionalGroup" : element.value.occupationalGroup,
              }
            }
            this._hospitallistService.createPhysicianOrder(json).subscribe(
              (_success: any) => {
                //_success = JSON.parse(_success._body);
                this.modalRef.hide();
                this.phyOrderform1.reset();
                //this.navModule(this.setModule)
                this.refreshModules();
              },
              (_error: any) => {}
            );
          }
         })
      }

}
  public openModalForPhyOrder(
    template: TemplateRef<any>,
    data: any,
    action: any
  ) {
    if (action == 'execute') {
      const config: ModalOptions = { class: 'modal-dialog-centered execute-delete-modal'};
      this.modalRef = this.modalService.show(template,config);
    }
    // if (action == 'delete') {
    //   const config: ModalOptions = { class: 'modal-dialog-centered execute-delete-modal'};
    //   this.modalRef = this.modalService.show(template,config);
    // }  
     this.phyOrderAction = action;
    this.phyOrderData = data;
    this.phyOrderAction = action;
    this.currentTime = new Date().getHours() + ':' + new Date().getMinutes();
    // this.phyOrderform1.controls.orderTime.setValue(this.currentTime);
    this.phyOrderform1.controls.physicianNumber.setValue(this.profileRes.Gpart);
    this.phyOrderform1.controls.physicianName.setValue(this.profileRes.GpartName);
    // this.phyOrderform1.controls.orderDate.setValue(new Date());
  }
  refreshModules() {
    this.reloadTableData.next('Not_Executed_Physician_Order');
  }
  physicianOrderSet(phyOrderData, action) {
    let json;
    if (action == 'execute') {
      this.modalRef.hide();
      json = {
        PorderId: phyOrderData.PorderId,
        CancelIndicator: false,
        ActionExecute: 'X',
      };

      this.hospitalistService.physicianOrderSet(json).subscribe(
        (_success: any) => {
          //_success = JSON.parse(_success._body);

          //this.navModule('Not_Executed_Physician_Order');
          this.refreshModules();
          Swal.fire({
            title: 'Physician Order has been Executed',
            icon: 'success',
            confirmButtonText: 'OK',
            preConfirm: () => {
              // this.getErList()
            },
          });
        },
        (_error: any) => {
          Swal.fire({
            title: 'Something went wrong',
            icon: 'error',
            confirmButtonText: 'OK',
            //preConfirm: () => {},
          });
        }
      );
      this.getErList("","")
    } else {
      json = {
        PorderId: phyOrderData.PorderId,
        CancelIndicator: true,
        ActionExecute: '',
        CancelReason: this.cancelReasonValue,
      };
      if (this.cancelReasonValue == '') {
        this.errmsg = 'Select a Reason for Deletion';
      } else {
        this.modalRef.hide();
        this._hospitallistService.physicianOrderSet(json).subscribe(
          (_success: any) => {
            //_success = JSON.parse(_success._body);

            //this.navModule('Not_Executed_Physician_Order');
            this.refreshModules();
            Swal.fire({
              title: 'Physician Order has been Deleted',
              icon: 'success',
              confirmButtonText: 'OK',
              //preConfirm: () => {},
            });
          },
          (_error: any) => {
            Swal.fire({
              title: 'Something went wrong',
              icon: 'error',
              confirmButtonText: 'OK',
              //preConfirm: () => {},
            });
          }
        );
      }
      this.getErList("","")
    }
  }

  sortOnCreatedOnPhyOrder() {
    if (!this.asc) {
      this.asc = true;
      this.dataOnTableForPhyOrder.sort((a, b) => {
        const nameA = a.Date.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Date.toUpperCase(); // ignore upper and lowercase
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
      this.dataOnTableForPhyOrder.sort((a, b) => {
        const nameA = a.Date.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Date.toUpperCase(); // ignore upper and lowercase
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
      this.dataOnTableForPhyOrder.sort((a, b) => {
        const nameA = a.Time.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Time.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });
    } else {
      this.asc = false;
      this.dataOnTableForPhyOrder.sort((a, b) => {
        const nameA = a.Time.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Time.toUpperCase(); // ignore upper and lowercase
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
 
  sortPhysician() {
    if (!this.asc) {
      this.asc = true;
      this.ERlistData.sort((a, b) => {
        const nameA = this.getTimeSinceOrdered(a).toUpperCase(); // Call getTimeSinceOrdered as a method
        const nameB = this.getTimeSinceOrdered(b).toUpperCase(); // Call getTimeSinceOrdered as a method
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
      this.ERlistData.sort((a, b) => {
        const nameA = this.getTimeSinceOrdered(a).toUpperCase(); // Call getTimeSinceOrdered as a method
        const nameB = this.getTimeSinceOrdered(b).toUpperCase(); // Call getTimeSinceOrdered as a method
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

  sortCreatedBy() {
    if (!this.asc) {
      this.asc = true;
      this.dataOnTableForPhyOrder.sort((a, b) => {
        const nameA = a.Erusr.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Erusr.toUpperCase(); // ignore upper and lowercase
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
      this.dataOnTableForPhyOrder.sort((a, b) => {
        const nameA = a.Erusr.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Erusr.toUpperCase(); // ignore upper and lowercase
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
      this.ERlistData.sort((a, b) => {
        const nameA = a.Erusr.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Erusr.toUpperCase(); // ignore upper and lowercase
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
      this.ERlistData.sort((a, b) => {
        const nameA = a.Erusr.toUpperCase(); // ignore upper and lowercase
        const nameB = b.Erusr.toUpperCase(); // ignore upper and lowercase
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
  sortRoom() {
    if (!this.asc) {
      this.asc = true;
      this.dataOnTableForPhyOrder.sort((a, b) => {
        const nameA = a.RoomidText.toUpperCase(); // ignore upper and lowercase
        const nameB = b.RoomidText.toUpperCase(); // ignore upper and lowercase
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
      this.dataOnTableForPhyOrder.sort((a, b) => {
        const nameA = a.RoomidText.toUpperCase(); // ignore upper and lowercase
        const nameB = b.RoomidText.toUpperCase(); // ignore upper and lowercase
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
  sortCategory() {
    if (!this.asc) {
      this.asc = true;
      this.ERlistData.sort((a, b) => {
        const nameA = a.ZzfinCat.toUpperCase(); // ignore upper and lowercase
        const nameB = b.ZzfinCat.toUpperCase(); // ignore upper and lowercase
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
      this.ERlistData.sort((a, b) => {
        const nameA = a.ZzfinCat.toUpperCase(); // ignore upper and lowercase
        const nameB = b.ZzfinCat.toUpperCase(); // ignore upper and lowercase
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
  sortWaitTime() {
    if (!this.asc) {
      this.asc = true;
      this.ERlistData.sort((a, b) => {
        const nameA = a.assignedTime.toUpperCase(); // ignore upper and lowercase
        const nameB = b.assignedTime.toUpperCase(); // ignore upper and lowercase
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
      this.ERlistData.sort((a, b) => {
        const nameA = a.assignedTime.toUpperCase(); // ignore upper and lowercase
        const nameB = b.assignedTime.toUpperCase(); // ignore upper and lowercase
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
  sortTriage() {
    if (!this.asc) {
      this.asc = true;
      this.ERlistData.sort((a, b) => {
        const nameA = a.TriagePriorityCode.toUpperCase(); // ignore upper and lowercase
        const nameB = b.TriagePriorityCode.toUpperCase(); // ignore upper and lowercase
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
      this.ERlistData.sort((a, b) => {
        const nameA = a.TriagePriorityCode.toUpperCase(); // ignore upper and lowercase
        const nameB = b.TriagePriorityCode.toUpperCase(); // ignore upper and lowercase
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
  // er bed code
  openModalForErBed(data) {
    this.erBed.openModalForErBed(data);
  }

  openModalForAllergy(template, data) {
    this.nurErAllergy.openModalForAllergy(template, data)
  }
  // er-vitals
  openModalVital(item){
    item["admissionDate"] = this.getDate(item.Datum);
    this.erVitalsModal.openModalForErVital(item);
  }
  redirectToTreatByName(data){
    const json = {
      Patnr:data.Patnr,
      Einri:data.Einri,
      Falnr:data.Falnr,
      Lfdnr:data.Lfdbw
    }
    this.storageService.setCheckinData(data);
    localStorage.setItem('checkindata',JSON.stringify(data));
    this.redirectToTreatment(json);

  }
  redirectToTreatment(data){
    this.redirectCheckInData.emit(data);
 }
getTimeSinceOrdered(value) {
  if (value) {
    const orderDate = this.getDate(value.Datum);
    const orderTime = this.getTime(value.Zeit);

    // Check if both orderDate and orderTime are valid
    if (orderDate && orderTime) {
      const orderDateTimeString = `${orderDate.toISOString().split('T')[0]}T${orderTime}`;
      const orderDateTime = new Date(orderDateTimeString);
      const currentTime = new Date();
      const timeDifference = currentTime.getTime() - orderDateTime.getTime();

      // Convert the time difference to hours and minutes
      const hours = Math.floor(timeDifference / (1000 * 60 * 60));
      const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

      return `${hours}h ${minutes}m`;
    } else {
      return 'Invalid date or time';
    }
  } else {
    return '';
  }
}

}
