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
import { MissedMedicationDosesService } from '@services/e-hospitalist/missed-medication-doses.service';
import { HospitalistType } from '@services/e-hospitalist/interfaces/hospitalist';

@Component({
  selector: 'app-administered-doses',
  templateUrl: './administered-doses.component.html',
  styleUrls: ['./administered-doses.component.scss']
})
export class AdministeredDosesComponent implements OnInit{
  @ViewChild('erBed') erBed: ErBedComponent;
  @Input() listItem: Array<HospitalistType> = [];
  @ViewChild('erVitalsModal') erVitalsModal: ErVitalsComponent;
  @ViewChild('nurErAllergy') nurErAllergy: NurErAllergyComponent;
  @Output() sendErPatientCount = new EventEmitter<any>();
  @Output() redirectCheckInData = new EventEmitter<any>();
  isFormValidError: boolean = false;
  searchString: string = '';
  ERlistData:any;
  // @Output() ERlistData = new EventEmitter<string>();
  @Output() dataToParent = new EventEmitter<any>();
  currentDateObj: any = [];
  navTabBoxActiveValue: any;
  phyOrderData:any;
  admittedFrom:any;
  admittedTo:any;
  ERlistDataClone: any = [];
  asc: boolean;
  triageValueArr: any = [];
  physicianValueArr: any = [];
  statusValueArr: any = [];
  lastIndex: number;
  modalRefForRisk: BsModalRef;
  modalRefForLab:BsModalRef;
  modalRefForLabCollcetion:BsModalRef;
  selectedERList: any;
  isRiskUpdate: boolean;
  riskList: any[];
  riskform: FormGroup;
  riskFormitems: FormArray;
  updateRiskForm: FormGroup;
  modalRef: BsModalRef;
  colName: any;
  modalCommonDataArr: any;
  allergenValues: any;
  dataOnTableForPhyOrder:any;
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
  wardNo:any;
  physician:any;
  speciality:any;
  type:any;
  sampleOrderDescription: any;
  rightside:boolean = false;
  @Output() reloadTableData = new EventEmitter();
  @Output() openModuleKardex = new EventEmitter();
  @Output() openModuleAdmissionProcessEvent = new EventEmitter();
  @Output() openModuleDischargeProcessEvent = new EventEmitter();
  isExpanded: boolean;
    constructor(
    private emergencyService: EmergencyService,
    private modalService: BsModalService,
    private hospitalistService: HospitalistService,
    private formBuilder: FormBuilder,
    private storageService:StorageService,
    public missedMedicationService: MissedMedicationDosesService
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

  redirectToeKardex(data) {
    this.openModuleKardex.emit(data);
  }

  openModuleAdmissionProcess(data) {
    this.openModuleAdmissionProcessEvent.emit(data);
    localStorage.removeItem('tabName');
  }

  openRightside(item){
    this.hospitalistService.getMedicationAdministration(item?.Einri,item?.Falnr).subscribe(((res:any)=>{
      // console.log("res", res);
    }))
    this.rightside = !this.rightside
  }

  handleSidebarToggle() {
    this.isExpanded = !this.isExpanded;
  }

  
  openModuleDischargeProcess(data) {
    this.openModuleDischargeProcessEvent.emit(data);
    localStorage.removeItem('tabName');
  }

  ngOnInit(): void {
    this.filterData()
  }

  filterData(){
    // this.listItem.filter((data) => data.Us)
  }
  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }
  public openModalForPhyOrder(template: TemplateRef<any>, data: any) {
    const config: ModalOptions = {
      class: 'modal-dialog-centered execute-delete-modal',
    };
    this.modalRef = this.modalService.show(template, config);

    this.phyOrderData = data;
  }

  removePhysicianOrder(phyOrderDetails: any) {
    let jsonObj: any = {
      PorderId: phyOrderDetails.PorderId
    };
    this.hospitalistService.getCheckPDF(jsonObj).subscribe(
      (_success: any) => {
        if (_success) {
          this.reloadTableData.next('physicianOrder');
        }
      },
      (_error: any) => {}
    );  
}

}
