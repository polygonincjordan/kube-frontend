import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ProgressNotesListModel } from '@services/admission/interfaces/template-model';
import { DataShareService } from '@services/data-share.service';
import { EEmrService } from '@services/e-emr.service';
import { HospitalistService } from '@services/e-hospitalist/hospitalist.service';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { CpoeService } from '@services/emergency-dashboard/cpoe.service';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { eOrderService } from '@services/eorder.service';
import { SidebarService } from '@services/sidebar.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { catchError, of, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import swal from 'sweetalert2';
@UntilDestroy()
@Component({
  selector: 'app-nurs-treatment-workarea',
  templateUrl: './nurs-treatment-workarea.component.html',
  styleUrls: ['./nurs-treatment-workarea.component.scss']
})
export class NursTreatmentWorkareaComponent implements OnInit, OnDestroy {

  // @ViewChild(DocumentationComponent) documentationComp:DocumentationComponent;
  @Output() redirectTreatmentPatientData = new EventEmitter<any>();
  showPatients = false;
  getOrderSetData: any;
  showSelected = false;
  selectedData: any;
  phyOrderform: FormGroup;
  medicationform: FormGroup;
  radform: FormGroup;
  labform: FormGroup;
  servicesform: FormGroup
  phyOrderitems: FormArray;
  medicationItems: FormArray;
  radItems: FormArray;
  labItems: FormArray;
  servicesItems: FormArray;
  occupationalGroupData: any;
  getFavSetData: any;
  selectedFavData: any;
  getOrderSetFavDataById: any;
  phyOrderitemsArr = [];
  medicationItemsArr = [];
  radItemsArr = [];
  labItemsArr = [];
  servicesItemsArr = [];
  //phy order
  navTabBoxActiveValue: string = '02';
  graphChartCountType: string = '1';
  reloadPhyOrderList: boolean = false;
  inHospitalistList: any[] = [];
  institutionid: any;
  caseid: any;
  physicianOrderList: any[];
  searchString: string;
  admittedFrom: string;
  admittedTo: string;
  paramsFilter: any = {};
  paramsObj: any = {};
  ProgressNotesList: ProgressNotesListModel[];
  ProgressNotesListFilterValue: ProgressNotesListModel[];
  physicianOrderListFilterValue: any[];
  myTag: any;
  treatmentPatientData: any;
  lfdnr: any;
  checkCounterPatient: any = {
    isEnCounterCheck: true, isPatientCheck: false
  };
  dosageUnitListOrderSet: any;
  public priorityArray: any = [{ Desc: "Regular", Value: "010" }, { Desc: "High", Value: "020" }, { Desc: "STAT", Value: "030" }];
  localizationListOrderSet: any;
  allSubtitlesSets: any;
  selectedStid: any;
  getOrderSetDataBySubtitles = [];
  searchOrderSets: any;
  formDetails: any;
  indexformDetails: any;
  selectedAddInfo: any;
  modalRef: BsModalRef;
  MedAccor = 'collapse';
  RadAccor = 'collapse';
  LabAccor = 'collapse';
  PhyAccor = 'collapse';
  SerAccor = 'collapse';
  configurationData: any;
  PATNR: any;
  EINRI: any;
  FALNR: any;
  LFDBW: any;
  firstIndex: number;
  actionTypeSubscription$: Subscription;
  isConsumableAction: string = '1';
  constructor(public emergencyService: EmergencyService, public cpoeService: CpoeService, private formBuilder: FormBuilder, private _dataServices: EEmrService, public sidebarService: SidebarService,
    private dataShareService: DataShareService,
    public ePrescriptionService: EPrescriptionService,
    private hospitalistService: HospitalistService,
    public eOrderService: eOrderService,
    public addministrationService: AddministrationService,
    private route: ActivatedRoute, private el: ElementRef, private modalService: BsModalService) {
    this.phyOrderform = this.formBuilder.group({
      phyOrderitems: new FormArray([]),
    });
    this.medicationform = this.formBuilder.group({
      medicationItems: new FormArray([]),
    });
    this.radform = this.formBuilder.group({
      radItems: new FormArray([]),
    });
    this.labform = this.formBuilder.group({
      labItems: new FormArray([]),
    });
    this.servicesform = this.formBuilder.group({
      servicesItems: new FormArray([]),
    });
    //phy order
    this.route.queryParams.subscribe((params) => {
      this.paramsObj.patientId = params.patnr;
      this.paramsObj.caseid = params.falnr;
      this.paramsObj.redirectFor = params.redirectFor;
      this.paramsObj.action = params.action;
      this.institutionid = params.einri;
      this.lfdnr = params.lfdnr;
      this.navTabBoxActiveValue = params.activeValue;
      this.caseid = params.falnr;
      if (params.admittedFrom || params.admittedTo || params.wardNo) {
        this.paramsFilter = {
          admittedFrom: params.admittedFrom,
          admittedTo: params.admittedTo,
          wardNo: params.wardNo,
        };
        // this.inPatientListByFilter(
        //   params.admittedFrom,
        //   params.admittedTo,
        //   params.wardNo
        // );
      } else {
        //this.getBetDetails();
      }
    });

    // this.phyOrderTableList();
    // this.occupationalGroupList();
    this.myTag = this.el.nativeElement.querySelector("div");
    this.actionTypeSubscription$ = this.dataShareService.data$.subscribe((data) => {
      if (data != null) {
        this.isConsumableAction = data;
      }
    });
  }
  ngOnDestroy(): void {
    if (this.actionTypeSubscription$) {
      this.actionTypeSubscription$.unsubscribe();
    }
  }

  ngOnInit() {
    // this.getOrderSet();
    // this.getFavSet();
    // this.occupationalGroupList();
    // //this.getProgressNotesData();
    // this.getPatientData();
    // this.localizationForOrderSets();
    // this.addministrationService.loadFrequencylist();
    // this.addministrationService.loadDurationUnit();
    // this.addministrationService.loadRouteDropdownList();
    // this.addministrationService.loadDropdownList();
    // if (localStorage.getItem('tabName') == "Documentation" && this.paramsObj.redirectFor == 'Documentation') {
    //   this.emergencyService.tabPanelNavigation('Documentation');
    // } else if (localStorage.getItem('tabName') == "Consumables" && this.paramsObj.redirectFor == 'Consumables') {
    //   this.emergencyService.tabPanelNavigation('Consumables');
    // } else {
    //   this.emergencyService.tabPanelNavigation('patientProfile');
    // }
    this.tabChange('Documentation');
  }

  addItemForPhyOrder(element): void {
    this.phyOrderitems = this.phyOrderform.get('phyOrderitems') as FormArray;
    this.phyOrderitems.push(this.createPhyOrderRecords(element));
  }
  addItemForMedication(element): void {
    this.medicationItems = this.medicationform.get('medicationItems') as FormArray;
    this.medicationItems.push(this.createMedicationRecords(element));
    this.disableInputsOfMed();
  }
  addItemForRad(element): void {
    this.radItems = this.radform.get('radItems') as FormArray;
    this.radItems.push(this.createRadRecords(element));
  }
  addItemForLab(element): void {
    this.labItems = this.labform.get('labItems') as FormArray;
    this.labItems.push(this.createLabRecords(element));
  }
  addItemForServices(element): void {
    this.servicesItems = this.servicesform.get('servicesItems') as FormArray;
    this.servicesItems.push(this.createServicesRecords(element));
  }
  updatePRN(event, index) {
    if (event) {
      this.medicationform.get('medicationItems')['controls'].at(index).get('Prncond').enable();
    } else {
      this.medicationform.get('medicationItems')['controls'].at(index).get('Prncond').disable();
    }
  }
  disableInputsOfMed() {
    (<FormArray>this.medicationform.get('medicationItems'))
      .controls
      .forEach((control, index) => {
        control['controls']['Drugname'].disable();
        control['controls']['FormulaText'].disable();
        this.updatePRN(control['controls']['Prn'].value, index)
      })
  }
  resetTags() {
    const phyOrderitems = this.phyOrderform.controls.phyOrderitems as FormArray;
    while (0 !== phyOrderitems.length) {
      phyOrderitems.removeAt(0);
    }
    const medicationItems = this.medicationform.controls.medicationItems as FormArray;
    while (0 !== medicationItems.length) {
      medicationItems.removeAt(0);
    }
    const radItems = this.radform.controls.radItems as FormArray;
    while (0 !== radItems.length) {
      radItems.removeAt(0);
    }
    const labItems = this.labform.controls.labItems as FormArray;
    while (0 !== labItems.length) {
      labItems.removeAt(0);
    }
    const servicesItems = this.servicesform.controls.servicesItems as FormArray;
    while (0 !== servicesItems.length) {
      servicesItems.removeAt(0);
    }
    this.phyOrderitemsArr = [];
    this.medicationItemsArr = [];
    this.radItemsArr = [];
    this.labItemsArr = [];
    this.servicesItemsArr = [];
  }
  createPhyOrderRecords(element): FormGroup {
    return this.formBuilder.group({
      isChecked: [true],
      Id: [element.Id],
      Seqno: [element.Seqno],
      ZphysOrder: [element.ZphysOrder],
      ProfGroup: [element.ProfGroup],
      Stid: [element.Stid]
    }
    );
  }
  createMedicationRecords(element): FormGroup {
    return this.formBuilder.group({
      isChecked: [element.Autoselect],
      Complex: [element.Complex],
      Id: [element.Id],
      Drugname: [element.Drugname],
      Formula: [element.Formula],
      FormulaText: [element.FormulaText],
      Route: [element.Route],
      Dosage: [parseFloat(element.Dosage).toString()],
      DosageUnit: [element.DosageUnit],
      Frequency: [element.Frequency],
      FrequencyText: [element.FrequencyText],
      Quantity: [element.Quantity],
      QuantityUnit: [element.QuantityUnit],
      Drugid: [element.Drugid],
      Duration: [parseFloat(element.Duration).toString()],
      DurationUnit: [element.DurationUnit],
      Prn: [element.Prn],
      Prncond: [element.Prncond],
      ValidOn: [parseInt(element.ValidOn).toString()],
      ValidTill: [parseInt(element.ValidTill).toString()],
      Descr: [element.Descr],
      Priority: [element.Priority],
      Stid: [element.Stid],
      Seqno: [element.Seqno],
      Agentid: [element.Agentid],
    });
  }
  createRadRecords(element): FormGroup {
    return this.formBuilder.group({
      isChecked: [element.Autoselect],
      Id: [element.Id],
      Trtoe: [element.Trtoe],
      TrtoeText: [element.TrtoeText],
      ServiceText: [element.ServiceText],
      Talst: [element.Talst],
      ValidOn: [parseInt(element.ValidOn).toString()],
      ValidTill: [parseInt(element.ValidTill).toString()],
      Localization: [element.Localization],
      LocalizationText: [element.LocalizationText],
      AddInfo: [element.AddInfo],
      Stid: [element.Stid],
      Seqno: [element.Seqno]
    });
  }
  createLabRecords(element): FormGroup {
    return this.formBuilder.group({
      isChecked: [true],
      Id: [element.Id],
      Trtoe: [element.Trtoe],
      TrtoeText: [element.TrtoeText],
      ServiceText: [element.ServiceText],
      Talst: [element.Talst],
      ValidOn: [parseInt(element.ValidOn).toString()],
      Localization: [element.Localization],
      LocalizationText: [element.LocalizationText],
      Fasting: [element.Fasting],
      Cycle: [element.Cycle],
      CycleDays: [parseInt(element.CycleDays).toString()],
      AddInfo: [element.AddInfo],
      Stid: [element.Stid],
      Seqno: [element.Seqno],

    });
  }
  createServicesRecords(element): FormGroup {
    return this.formBuilder.group({
      isChecked: [true],
      Id: [element.Id],
      Category: [element.Category],
      ServiceText: [element.ServiceText],
      Subcategory: [element.Subcategory],
      Service: [element.Service],
      Stid: [element.Stid]
    }
    );
  }
  showhidePatients() {
    this.showPatients = !this.showPatients;
  }
  assignPatient(event: any) {
    this.showPatients = false;
  }
  selectSet(item) {
    this.resetTags();
    this.showSelected = true;
    this.selectedData = item;
    this.getOrderSetDataBySubtitles = [];
    this.subtitlesListByOrderSet(item);
    this.getOrderSetData.forEach(element => {
      if (element.Id == this.selectedData.Id) {
        element["isSelect"] = true;
      } else {
        element["isSelect"] = false;
      }
    });
    this.getFavSetData.forEach(element => {
      element["isSelect"] = false;
    });

  }
  setRecordsForms(data) {
    this.resetTags();
    console.log("med", this.medicationItems);

    data.ToPhyOrd.results.forEach(element => {
      this.addItemForPhyOrder(element);
    });
    data.ToMedOrd.results.forEach(element => {
      this.addItemForMedication(element);
      this.dosageUnitListForOrderSets(element);
    });
    data.ToRad.results.forEach(element => {
      this.addItemForRad(element);
    });
    data.ToLab.results.forEach(element => {
      this.addItemForLab(element);
    });
    data.ToServices.results.forEach(element => {
      this.addItemForServices(element);
    });
  }
  getPatientData() {
    this.emergencyService.getPatientData().subscribe(
      (_success: any) => {
        if (_success) {
          // _success = JSON.parse(_success._body);
          this.treatmentPatientData = _success.d.results;
          this.treatmentPatientData.forEach(element => {
            if (element.Statu == '20') {
              element['StatusText'] = 'Planned';
            } else if (element.Statu == '30') {
              element['StatusText'] = 'Checked In';
            } else if (element.Statu == '55') {
              element['StatusText'] = 'Called';
            } else if (element.Statu == '58') {
              element['StatusText'] = 'Nurse Completed';
            } else if (element.Statu == '60') {
              element['StatusText'] = 'Physician Start';
            } else if (element.Statu == '65') {
              element['StatusText'] = 'Physician End';
            } else if (element.Statu == '70') {
              element['StatusText'] = 'Checked Out';
            }
          });
        }
      },
      (_error: any) => { }
    );
  }
  getOrderSet() {
    const json = {
      falnr: this.caseid,
      einri: this.institutionid
    }
    this.emergencyService.getOrderSet(json).subscribe(
      (_success: any) => {
        if (_success) {
          // _success = JSON.parse(_success._body);

          this.getOrderSetData = _success.d.results;
          this.getOrderSetData.forEach(element => {
            element["isSelect"] = false;
          });
          //  if (this.getOrderSetData.length >0) {
          //   this.selectedData = this.getOrderSetData[0];
          //   this.selectSet(this.selectedData);
          //  }
        }
      },
      (_error: any) => { }
    );
  }
  getFavSet() {
    this.emergencyService.getFavSet().subscribe(
      (_success: any) => {
        if (_success) {
          // _success = JSON.parse(_success._body);

          this.getFavSetData = _success.d.results;
          this.getFavSetData.forEach(element => {
            element["isSelect"] = false;
          });
          //  if (this.getFavSetData.length >0) {
          //   this.selectedData = this.getOrderSetData[0];
          //   this.selectSet(this.selectedData);
          //  }
        }
      },
      (_error: any) => { }
    );
  }
  showLocalizationTextForRad(data, event, index) {
    let selectedLocalValue = data.find(d => d.Dialo === event)
    this.radItems.controls[index].patchValue({
      LocalizationText: selectedLocalValue.Dialotext
    })
  }
  showLocalizationTextForLab(data, event, index) {
    let selectedLocalValue = data.find(d => d.Dialo === event)
    this.labItems.controls[index].patchValue({
      LocalizationText: selectedLocalValue.Dialotext
    })
  }
  subtitlesListByOrderSet(data) {
    this.ePrescriptionService.getData(`e-prescription/OrderSetSubtitleSet?Id='${data.Id}'`).subscribe((resp: any) => {
      this.allSubtitlesSets = resp.body.d.results;
      this.allSubtitlesSets.forEach(element => {
        element['isSelect'] = false;
        this.getOrderSetBySubtitles(element);
      });
      this.changeSubtitle(this.allSubtitlesSets[0], 0)
    });

  }
  changeSubtitle(item: any, index: number) {
    if (!item.isSelect) {
      //this.subtitleActive = true;
      //this.getOrderSetBySubtitles(item);
      this.selectedStid = item.Stid;
      const collapseOneShow = document.getElementById('collapseOne');
      collapseOneShow.classList.add('show');
      const collapseTwoShow = document.getElementById('collapseTwo');
      collapseTwoShow.classList.add('show');
      const collapseThreeShow = document.getElementById('collapseThree');
      collapseThreeShow.classList.add('show');
      const collapseFourShow = document.getElementById('collapseFour');
      collapseFourShow.classList.add('show');
      const collapseFiveShow = document.getElementById('collapseFive');
      collapseFiveShow.classList.add('show');
      this.showAccor();
    } else {
      const collapseOneShow = document.getElementById('collapseOne');
      collapseOneShow.classList.remove('show');
      const collapseTwoShow = document.getElementById('collapseTwo');
      collapseTwoShow.classList.remove('show');
      const collapseThreeShow = document.getElementById('collapseThree');
      collapseThreeShow.classList.remove('show');
      const collapseFourShow = document.getElementById('collapseFour');
      collapseFourShow.classList.remove('show');
      const collapseFiveShow = document.getElementById('collapseFive');
      collapseFiveShow.classList.remove('show');
      this.showAccor();
    }
    this.allSubtitlesSets.forEach(element => {
      if (item.Stid == element.Stid) {
        if (element['isSelect']) {
          element['isSelect'] = false;
        } else {
          element['isSelect'] = true;
        }
      } else {
        element['isSelect'] = false;
      }
    });

  }
  actionOnSubtitle(item, i) {
    // if (!item.Autoselect) {
    //  (<FormArray>this.medicationform.get('medicationItems'))
    //    .controls
    //    .forEach((control,index) => {
    //      control['controls']['isChecked'].setValue(false);

    //    })
    // }else{
    //  this.selectSet(this.selectedData);
    // }

  }
  getOrderSetBySubtitles(data) {
    const json = {
      Id: data.Id,
      Stid: data.Stid
    }
    this.emergencyService.getOrderSetBySubtitles(json).subscribe(
      (_success: any) => {
        if (_success) {
          // _success = JSON.parse(_success._body);
          if (this.getOrderSetDataBySubtitles.length > 0) {
            this.getOrderSetDataBySubtitles.push(_success.d.results[0]);
          } else {
            this.getOrderSetDataBySubtitles = _success.d.results;
          }

          this.getOrderSetDataBySubtitles.forEach(element => {
            element["isSelect"] = false;
          });

          if (this.allSubtitlesSets.length == this.getOrderSetDataBySubtitles.length) {
            this.getOrderSetDataBySubtitles.forEach(data => {
              data.ToPhyOrd.results.forEach((element) => {
                this.addItemForPhyOrder(element);
              });
              data.ToMedOrd.results.forEach((element) => {
                this.addItemForMedication(element);
                this.dosageUnitListForOrderSets(element);
              });
              data.ToRad.results.forEach((element) => {
                this.addItemForRad(element);
              });
              data.ToLab.results.forEach((element) => {
                this.addItemForLab(element);
              });
              data.ToServices.results.forEach((element) => {
                this.addItemForServices(element);
              });
            });
          }

          //  if (this.getOrderSetData.length >0) {
          //   this.selectedData = this.getOrderSetData[0];
          //   this.selectSet(this.selectedData);
          //  }
        }
      },
      (_error: any) => { }
    );
  }

  createOrderSet() {
    const json =
    {
      "Id": this.selectedData.Id,
      "Einri": this.institutionid,
      "Falnr": this.paramsObj.caseid,
      "Lfdnr": this.lfdnr,
      "Patnr": this.paramsObj.patientId,
      "PhyOrd": {
        "results": this.phyOrderitemsArr
      },
      "MedOrd": {
        "results": this.medicationItemsArr
      },
      "Services": {
        "results": this.servicesItemsArr
      },
      "Lab": {
        "results": this.labItemsArr
      },
      "Rad": {
        "results": this.radItemsArr
      }
    }
    this.emergencyService.createOrderSet(json).subscribe(
      (_success: any) => {
        if (_success) {
          swal.fire({
            text: 'Order Set Created Successfully',
            confirmButtonColor: '#0890c5',
            cancelButtonColor: '#84898c',
            confirmButtonText: 'OK',
            customClass: 'myalertpopup',
            icon: 'success'
          });
          this.resetTags();
          this.showSelected = false;
          this.getOrderSetDataBySubtitles = [];
          this.getFavSetData.forEach(element => {
            element["isSelect"] = false;
          });
          this.getOrderSetData.forEach(element => {
            element["isSelect"] = false;
          });
        }
      },
      (_error: any) => {
        swal.fire({
          text: _error.error.error.message.value,
          confirmButtonColor: '#0890c5',
          cancelButtonColor: '#84898c',
          confirmButtonText: 'OK',
          customClass: 'myalertpopup',
          icon: 'error'
        });
      }
    );
  }
  checkForSubtitles() {
    if (this.allSubtitlesSets.find(e => e.Autoselect === true)) {
      this.allSubtitlesSets.forEach(e1 => {
        if (e1.Autoselect) {
          if (this.medicationItems != undefined) {
            this.medicationItems.value.filter(element => {
              if (e1.Stid === element.Stid) {
                this.medicationItemsArr.push(element);
              }
            });
          }
          if (this.phyOrderitems != undefined) {
            this.phyOrderitems.value.filter(element => {
              if (e1.Stid === element.Stid) {
                this.phyOrderitemsArr.push(element);
              }
            });
          }
          if (this.radItems != undefined) {
            this.radItems.value.filter(element => {
              if (e1.Stid === element.Stid) {
                this.radItemsArr.push(element);
              }
            });
          }
          if (this.labItems != undefined) {
            this.labItems.value.filter(element => {
              if (e1.Stid === element.Stid) {
                this.labItemsArr.push(element);
              }
            });
          }
          if (this.servicesItems != undefined) {
            this.servicesItems.value.filter(element => {
              if (e1.Stid === element.Stid) {
                this.servicesItemsArr.push(element);
              }
            });
          }
        }
      });
      this.checkedForData();
    } else {
      swal.fire({
        text: 'No order is selected, Please select at least one Order',
        confirmButtonColor: '#0890c5',
        cancelButtonColor: '#84898c',
        confirmButtonText: 'OK',
        customClass: 'myalertpopup',
        icon: 'error'
      });
    }
  }
  checkedForData() {
    if (this.phyOrderitems != undefined) {
      this.phyOrderitemsArr = this.phyOrderitemsArr.filter((element) => {
        if (element.isChecked) {
          delete element.isChecked;
          return element;
        }
      });
    } else {
      this.phyOrderitemsArr = [];
    }
    if (this.medicationItems != undefined) {
      this.medicationItemsArr = this.medicationItemsArr.filter((element) => {
        if (element.isChecked) {
          delete element.isChecked;
          delete element.DurationUnitText;
          delete element.Quantity;
          delete element.QuantityUnit;
          delete element.FrequencyText;
          delete element.Complex;
          return element;
        }
      });
    } else {
      this.medicationItemsArr = [];
    }
    if (this.radItems != undefined) {
      this.radItemsArr = this.radItemsArr.filter((element) => {
        if (element.isChecked) {
          delete element.isChecked;
          delete element.TrtoeText;
          delete element.LocalizationText;
          return element;
        }
      });
    } else {
      this.radItemsArr = [];
    }
    if (this.labItems != undefined) {
      this.labItemsArr = this.labItemsArr.filter((element) => {
        if (element.isChecked) {
          delete element.isChecked;
          delete element.TrtoeText;
          delete element.LocalizationText;
          return element;
        }
      });
    } else {
      this.labItemsArr = [];
    }
    if (this.servicesItems != undefined) {
      this.servicesItemsArr = this.servicesItemsArr.filter((element) => {
        if (element.isChecked) {
          delete element.isChecked;
          return element;
        }
      });
    } else {
      this.servicesItemsArr = [];
    }
    this.createOrderSet();
  }
  occupationalGroupList() {
    this._dataServices.occupationalGroupList().subscribe(
      (_success: any) => {
        this.occupationalGroupData = _success.d.results;
        // this.phyOrderform1.controls.occupationalGroup.setValue(this.occupationalGroupData[2].Group);

      },
      (_error: any) => { }
    );
  }
  selectFavSet(data) {
    const collapseOneShow = document.getElementById('collapseOne')
    collapseOneShow.classList.add('show');
    const collapseTwoShow = document.getElementById('collapseTwo')
    collapseTwoShow.classList.add('show');
    const collapseThreeShow = document.getElementById('collapseThree')
    collapseThreeShow.classList.add('show');
    const collapseFourShow = document.getElementById('collapseFour')
    collapseFourShow.classList.add('show');
    const collapseFiveShow = document.getElementById('collapseFive')
    collapseFiveShow.classList.add('show');
    this.getOrderSetByFavId(data);
    this.selectedFavData = data;
    this.getFavSetData.forEach(element => {
      if (element.Id == this.selectedFavData.Id) {
        element["isSelect"] = true;
      } else {
        element["isSelect"] = false;
      }
    });
    this.getOrderSetData.forEach(element => {
      element["isSelect"] = false;
    });
  }
  getOrderSetByFavId(data) {
    const json = {
      Id: data.Id
    }
    this.emergencyService.getOrderSetByFavId(json).subscribe(
      (_success: any) => {
        if (_success) {
          // _success = JSON.parse(_success._body);

          this.getOrderSetFavDataById = _success.d.results;
          this.selectedData = this.getOrderSetFavDataById[0];
          this.setRecordsForms(this.getOrderSetFavDataById[0]);
          //  if (this.getOrderSetFavDataById.length >0) {
          //   this.selectedFavData = this.getOrderSetFavDataById[0];
          //   this.selectFavSet(this.selectedFavData);
          //  }
        }
      },
      (_error: any) => { }
    );
  }
  dosageUnitListForOrderSets(item) {
    this.ePrescriptionService.loadData(`e-prescription/DurgUnitlist?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}&Lfdnr=${this.ePrescriptionService.parameters.lfdnr}&Drugid=${item.Drugid}`, false, false, false, false).subscribe((resp: any) => {
      this.dosageUnitListOrderSet = resp.body.d.results;
    });
  }
  localizationForOrderSets() {
    this.ePrescriptionService.getData(`e-prescription/LocalizationSet`).subscribe((resp: any) => {
      this.localizationListOrderSet = resp.body.d.results;
    });
  }
  onlyNumberKey(event) {
    let charCode = (event.query) ? event.query : event.keyCode;
    console.log(charCode);
    if (charCode > 31
      && (charCode < 48 || charCode > 57))
      return false;

    return true;
  }
  SearchOrderSets() {
    this.getOrderSetData = this.getOrderSetData.filter((item: any) => {
      return item.Name.toLowerCase().includes(this.searchOrderSets.toLowerCase());
    });
    this.getFavSetData = this.getFavSetData.filter((item: any) => {
      return item.Name.toLowerCase().includes(this.searchOrderSets.toLowerCase());
    });
    if (this.searchOrderSets == "") {
      this.getOrderSet();
      this.getFavSet();
    }
  }
  openAddInfo(template: TemplateRef<any>, data, index) {
    this.modalRef = this.modalService.show(template, {
      id: 1,
      class: 'additional-info-temp modal-lg',
    });
    this.formDetails = data;
    this.indexformDetails = index;
    if (this.formDetails['controls']['medicationItems']) {
      this.selectedAddInfo = this.medicationform.get('medicationItems')['controls'].at(this.indexformDetails).get('Descr').value;
    } else if (this.formDetails['controls']['radItems']) {
      this.selectedAddInfo = this.radform.get('radItems')['controls'].at(this.indexformDetails).get('AddInfo').value;
    } else if (this.formDetails['controls']['labItems']) {
      this.selectedAddInfo = this.labform.get('labItems')['controls'].at(this.indexformDetails).get('AddInfo').value;
    }
  }
  saveAddinfo() {
    this.modalRef.hide();
    if (this.formDetails['controls']['medicationItems']) {
      this.medicationform.get('medicationItems')['controls'].at(this.indexformDetails).get('Descr').setValue(this.selectedAddInfo);
    }
    else if (this.formDetails['controls']['radItems']) {
      this.radform.get('radItems')['controls'].at(this.indexformDetails).get('AddInfo').setValue(this.selectedAddInfo);
    }
    else if (this.formDetails['controls']['labItems']) {
      this.labform.get('labItems')['controls'].at(this.indexformDetails).get('AddInfo').setValue(this.selectedAddInfo);
    }
  }
  //phy order
  phyOrderTableList() {
    const res = this.emergencyService.getPhyOrderSetDataSet(
      this.institutionid,
      this.caseid
    );

    this.emergencyService.phyOrderlistData$
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any[]) => {
        this.physicianOrderList = data;
        this.physicianOrderListFilterValue = data;
      });
  }

  inPatientListByFilter(admittedFrom, admittedTo, wardNo) {
    const res = this.hospitalistService.getIpListSetDataSetWithFilter(
      this.navTabBoxActiveValue,
      admittedFrom,
      admittedTo,
      wardNo,
      ""
    );

    this.hospitalistService.inHospitalistData$
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any[]) => {
        // this.showFilter = false;
        this.inHospitalistList = data;
      });
  }

  onSearchChange(event: any): void {
    this.searchString = event;
  }

  reloadPhyOrderListEvent(event) {
    if (event) {
      this.phyOrderTableList();
    }
  }

  openModuleAdmissionProcess(data) {
    let admittedFrom = '';
    let admittedTo = '';
    let wardNo = '';

    if (this.paramsFilter.admittedFrom) {
      admittedFrom = this.paramsFilter.admittedFrom;
    }

    if (this.paramsFilter.admittedTo) {
      admittedTo = this.paramsFilter.admittedTo;
    }

    if (this.paramsFilter.wardNo) {
      wardNo = this.paramsFilter.wardNo;
    }

    window.open(
      'admit-process?patnr=' +
      data.Mrn +
      '&falnr=' +
      data.CaseNumber +
      '&einri=' +
      data.Institute +
      '&lfdnr=' +
      data.Lfdnr +
      '&admittedFrom=' +
      admittedFrom +
      '&admittedTo=' +
      admittedTo +
      '&wardNo=' +
      wardNo +
      '&activeValue=' +
      this.navTabBoxActiveValue,
      '_self'
    );
  }

  phyOrderFilterList(formFilter: any) {
    this.admittedFrom = '';
    this.admittedTo = '';
    let profGroup =
      formFilter.value.SelectDropdown === null
        ? ''
        : formFilter.value.SelectDropdown;
    this.admittedFrom = formFilter?.value?.DateRange?.length === 0 ? '' : formFilter?.value?.DateRange[0].getFullYear() + '-' + String(formFilter?.value?.DateRange[0].getMonth() + 1).padStart(2, '0') + '-' + String(formFilter?.value?.DateRange[0].getDate()).padStart(2, '0') + 'T00:00:00';
    this.admittedTo = formFilter?.value?.DateRange?.length === 0 ? '' : formFilter?.value?.DateRange[1].getFullYear() + '-' + String(formFilter?.value?.DateRange[1].getMonth() + 1).padStart(2, '0') + '-' + String(formFilter?.value?.DateRange[1].getDate()).padStart(2, '0') + 'T00:00:00';
    if (this.admittedFrom == this.admittedTo) {
      this.admittedFrom = '';
      this.admittedTo = '';
    }
    this.emergencyService.getPhyOrderSetDataSetWithFilter(
      this.institutionid,
      this.caseid,
      this.admittedFrom,
      this.admittedTo,
      profGroup
    );
    this.emergencyService.phyOrderlistDataWithFilter$
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any[]) => {
        this.physicianOrderList = data;
      });
  }

  getProgressNotesData() {
    const res = this.emergencyService.getProgressNotesSetData(
      this.paramsObj.patientId,
      this.paramsObj.caseid
    );

    this.emergencyService.progressNotesSetData$
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any[]) => {
        this.ProgressNotesList = data;
        this.ProgressNotesListFilterValue = data;
      });
  }

  progressNotesFilterList(formFilter: any) {
    this.admittedFrom = '';
    this.admittedTo = '';
    let profGroup = formFilter?.value?.SelectDropdown === null ? '' : formFilter?.value?.SelectDropdown;
    this.admittedFrom = formFilter?.value?.DateRange?.length === 0 ? '' : formFilter?.value?.DateRange[0].getFullYear() + '-' + String(formFilter?.value?.DateRange[0].getMonth() + 1).padStart(2, '0') + '-' + String(formFilter?.value?.DateRange[0].getDate()).padStart(2, '0') + 'T00:00:00';
    this.admittedTo = formFilter?.value?.DateRange?.length === 0 ? '' : formFilter?.value?.DateRange[1].getFullYear() + '-' + String(formFilter?.value?.DateRange[1].getMonth() + 1).padStart(2, '0') + '-' + String(formFilter?.value?.DateRange[1].getDate()).padStart(2, '0') + 'T00:00:00';
    // if (this.admittedFrom || this.admittedTo || profGroup) {
    if (this.admittedFrom == this.admittedTo) {
      this.admittedFrom = '';
      this.admittedTo = '';
    }
    this.emergencyService.getProgressNotesDataSetWithFilter(
      this.paramsObj.patientId,
      this.caseid,
      this.admittedFrom,
      this.admittedTo,
      profGroup
    );
    this.emergencyService.progressNoteSetDataWithFilter$
      .pipe(
        untilDestroyed(this),
        catchError((err) => {
          return of([]);
        })
      )
      .subscribe((data: any[]) => {
        this.ProgressNotesList = data;
      });
    // }
  }
  tabChange(tabName?) {
    if (tabName == 'ProgressNotes') {
      this.getProgressNotesData();
      this.emergencyService.tabPanelNavigation('ProgressNotes');
    } else if (tabName == 'PhysicianOrders') {
      this.phyOrderTableList();
      this.emergencyService.tabPanelNavigation('PhysicianOrders');
    } else if (tabName == 'OrderSet') {
      this.emergencyService.tabPanelNavigation('OrderSet');
    } else if (tabName == 'CPOE') {
      this.emergencyService.tabPanelNavigation('CPOE');
    } else if (tabName == 'ePrescription') {
      this.emergencyService.tabPanelNavigation('ePrescription');
    } else if (tabName == 'orderdetails') {
      this.emergencyService.tabPanelNavigation('orderdetails');
    } else if (tabName == 'Diagnosis') {
      this.emergencyService.tabPanelNavigation('Diagnosis');
    } else if (tabName == 'Documentation') {
      this.emergencyService.tabPanelNavigation('Documentation');
      // if ( this.documentationComp != undefined) {
      //   this.documentationComp.ngOnInit();
      // }
    } else if (tabName == 'Lab') {
      this.emergencyService.tabPanelNavigation('Lab');
      this.openModuleLabChart();
    } else if (tabName == 'Rad') {
      this.emergencyService.tabPanelNavigation('Rad');
      this.openModuleRad();
    } else if (tabName == 'patientProfile') {
      this.emergencyService.tabPanelNavigation('patientProfile');
    } else if (tabName == 'Consumables') {
      this.emergencyService.tabPanelNavigation('Consumables');
    } else if (tabName == 'Services') {
      this.emergencyService.tabPanelNavigation('Services');
    }
    this.onSearchChange('');
    //this.ProgressNotesList = this.ProgressNotesListFilterValue;
    this.physicianOrderList = this.physicianOrderListFilterValue;
  }

  refreshPatientData(data) {
    this.cpoeService.constants.falnr = data.Falnr
    this.cpoeService.constants.patnr = data.Patnr
    this.cpoeService.constants.lfdnr = data.Lfdnr
    this.cpoeService.constants.einri = data.Einri
    this.ePrescriptionService.parameters.falnr = data.Falnr;
    this.ePrescriptionService.parameters.patnr = data.Patnr;
    this.ePrescriptionService.parameters.lfdnr = data.Lfdnr;
    this.ePrescriptionService.parameters.einri = data.Einri;
    this.paramsObj.patientId = data.Patnr;
    this.paramsObj.caseid = data.Falnr;
    this.institutionid = data.Einri;
    this.lfdnr = data.Lfdnr;
    // this.navTabBoxActiveValue = params.activeValue;
    this.caseid = data.Falnr;
    this.redirectTreatmentPatientData.emit(data);
    this.resetTags();
    this.getOrderSet();
    this.getFavSet();
    if (localStorage.getItem('tabName') == 'OrderSet') {
      this.emergencyService.tabPanelNavigation('OrderSet');
      this.tabChange('OrderSet');
    } else if (localStorage.getItem('tabName') == 'CPOE') {
      this.emergencyService.tabPanelNavigation('CPOE');
      this.tabChange('CPOE');
    } else if (localStorage.getItem('tabName') == 'orderdetails') {
      this.emergencyService.tabPanelNavigation('orderdetails');
      this.tabChange('orderdetails');
    } else if (localStorage.getItem('tabName') == 'PhysicianOrders') {
      this.emergencyService.tabPanelNavigation('PhysicianOrders');
      this.tabChange('PhysicianOrders');
    } else if (localStorage.getItem('tabName') == 'ProgressNotes') {
      this.emergencyService.tabPanelNavigation('ProgressNotes');
      this.tabChange('ProgressNotes');
    } else if (localStorage.getItem('tabName') == 'ePrescription') {
      this.emergencyService.tabPanelNavigation('ePrescription');
      this.tabChange('ePrescription');
    } else if (localStorage.getItem('tabName') == 'Documentation') {
      this.emergencyService.tabPanelNavigation('Documentation');
      this.tabChange('Documentation');
    }
  }

  checkPatientCounter(event: any) {
    this.checkCounterPatient = event;
  }
  showAccor() {
    setTimeout(() => {
      const collapseOneShow = document.getElementById('collapseOne');
      this.MedAccor = collapseOneShow.classList.value;
      const collapseTwoShow = document.getElementById('collapseTwo');
      this.RadAccor = collapseTwoShow.classList.value;
      const collapseThreeShow = document.getElementById('collapseThree');
      this.LabAccor = collapseThreeShow.classList.value;
      const collapseFourShow = document.getElementById('collapseFour');
      this.SerAccor = collapseFourShow.classList.value;
      const collapseFiveShow = document.getElementById('collapseFive');
      this.PhyAccor = collapseFiveShow.classList.value;
    }, 500);

  }
  openModuleLabChart() {
    this.route.queryParams.subscribe((params) => {
      this.PATNR = params.patnr;
      this.EINRI = params.einri;
      this.LFDBW = params.lfdnr;
      this.FALNR = params.falnr;
    });
    window.open(
      environment.labChartUrl + 'patnr=' +
      this.PATNR +
      '&falnr=' +
      this.FALNR +
      '&einri=' +
      this.EINRI +
      '&lfdnr=' +
      this.LFDBW +
      '&appl=LABCHART',
      '_blank'
    );
  }


  openModuleRad() {
    this.route.queryParams.subscribe((params) => {
      this.PATNR = params.patnr;
      this.EINRI = params.einri;
      this.LFDBW = params.lfdnr;
      this.FALNR = params.falnr;
    });
    window.open(
      environment.radiologyUrl + 'patient_id=' + this.PATNR,
      '_blank'
    );
  }

}
