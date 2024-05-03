import { DatePipe } from '@angular/common';
import { Component, DoCheck, EventEmitter, Input, OnDestroy, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import { EPrescriptionService, MedicationdFilterData } from '@services/e-Prescription/e-prescription.service';
import { formatDate } from 'ngx-bootstrap/chronos';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PopoverDirective } from 'ngx-bootstrap/popover';
import { Subscription } from 'rxjs';
import swal from 'sweetalert2';
import { AdditionInfoPopupComponent } from '../../discharge-order/addition-info-popup/addition-info-popup.component';
import { MedicationsPopupComponent } from '../medications-popup/medications-popup.component';
import { ModetailPanelComponent } from '../modetail-panel/modetail-panel.component';

@Component({
  selector: 'medications-profile',
  templateUrl: './medications-profile.component.html',
  styleUrls: ['./medications-profile.component.scss'],
  providers: [DatePipe]
})
export class MedicationsProfileComponent implements OnInit, OnDestroy, DoCheck {
  public dosageUnitList: any[];
  public MedicationorderForm: FormGroup;
  public medicationEndReason: any[] = [];
  public medicationCancellationReason: any[];
  // public medicationHoldReason: any[];
  public isFormSubmitted: boolean = false;
  public modetailsFormSubscription: Subscription;
  public defaultAgentId: string;
  // public filterConfigEnded: boolean = false
  public tabmodetail: string;
  // public MedicationOrders: boolean = true;
  // isCollapsed = true;
  configurationData: MedicationdFilterData[] = [];
  // public replaceSuspendtoResume: any = "Hold";
  hours: number[] = [];
  startHour: number;
  endHour: number;
  modalRef: BsModalRef;
  filterConfig: MedicationdFilterData = {
    Active: false, Suspended: false, Ended: false, Cancelled: false,
    Status: "", MedicationSorting: "", Sorting: ""
  }

  @Output() onUpdateprnData: EventEmitter<any> = new EventEmitter;
  CurrentDateTime = new Date()
  @ViewChild('modetailpanel', { static: true }) modetailpanel: ModetailPanelComponent;
  @ViewChild('additionalPopup', { static: true }) additionalPopup: AdditionInfoPopupComponent;
  @ViewChild('prnPopup', { static: true }) prnPopup: AdditionInfoPopupComponent;
  @ViewChild('medicationspopup', { static: true }) medicationspopup: MedicationsPopupComponent;

  @ViewChildren(PopoverDirective) popovers: QueryList<PopoverDirective>;
  EventPayloadConfig = {
    AddDose: "",
    Agentid: "",
    Aprouteid: "",
    Complex: "",
    Descr: "",
    Dosdef: "",
    Drugid: "",
    Lfdnr: "",
    Moresp1: "",
    N1znr: "",
    Orgfa: "",
    Orgpf: "",
    Pdur: "",
    Pduru: "",
    Phformid: "",
    Pom: "",
    Priority: "",
    Prn: "",
    Prncond: "",
    Quan: "",
    Quanunit: "",
    StartD: "",
    StartT: "",
    EndD: "",
    EndT: "",
    TOCOMPLEX: "",
    Updmode: ""
  }

  CopyActionPayloadConfig = {
    Falnr: "",
    Meordid: "",
    Agentid: "",
    Aprouteid: "",
    Einri: "",
    Pdur: "",
    Pduru: "",
    Quan: "",
    Quanunit: "",
    N1znr: "",
    Prn: "",
    Prncond: "",
    Moresp1: "",
    Orgfa: "",
    Orgpf: "",
    Mostx: "",
    StartD: "",
    StartT: "",
    EndD: "",
    EndT: ""
  }
  configurationPopup: string;
  // Isrenewed: boolean;

  constructor(public ePrescriptionService: EPrescriptionService, public addministrationService: AddministrationService) { }
  ngDoCheck(): void {
    if (!!this.popovers) {
      this.popovers.forEach((popover: PopoverDirective) => {
        if (popover.popover['_declarationTContainer']['localNames'][0] === "actionData") {
          popover.onShown.subscribe(() => {
            this.popovers
              .filter(p => p !== popover)
              .forEach(p => p.hide());
          });
        }
      });
    }
  }

askQuestion(index){
  if (this.drugArray.controls[index].value.IsEditMode) {
    this.popovers.forEach(p => p.hide());  }
  }

  @Input() set filterData(data: MedicationdFilterData) {
    this.filterConfig = data;
    this.filterEvents();
  }

  ngOnInit() {
    this.addministrationService.loadDropdownList();
    this.MedicationorderForm = new FormGroup({
      MedicationorderData: new FormArray([], Validators.required),
      isActiveOrder: new FormControl(true)
    });
    this.loadMedicationHistoryData();
    this.modetailsFormSubscription = this.MedicationorderForm.valueChanges.subscribe((resp) => { if (resp) { this.isFormSubmitted = true } });
  }

  // loadMedicationeventData(data) {
  //   this.ePrescriptionService.loadData(`e-prescription/OrderEventMedicationStatus?Einri=${this.ePrescriptionService.parameters.Einri}&Falnr=${this.ePrescriptionService.parameters.Falnr}&Meordid=${data.Meordid}`, false, false, false, false).subscribe((resp: any) => {
  //     if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {

  //     }
  //   });
  // }

  loadMedicationHistoryData() {
    this.ePrescriptionService.loadData(`e-prescription/OrderHistorylist?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        this.generateDefaultForm(resp.body.d.results);
        this.configurationData = resp.body.d.results;
      }
      this.filterEvents();
    });

  }

  onChangePom(index: number, event: any) {
    this.drugArray.controls[index].patchValue({ Pom: event.target.value })
  }

  onUpdatedAdditionalInfoprn(event: any) {
    this.drugArray.controls[event.index].patchValue({ Prncond: event.target.value })
  }

  Medicationsdatavalue(event: any) {
    this.drugArray.controls[event.index]
  }

  onOpenPrnDesc(data: any, index: number, event: any) {
    if (event.target.checked) {
      this.prnPopup.showPopup(data.get('Prncond').value, index)
    }
  }

  onUpdatedPrnCondition(event: any) {
    this.drugArray.controls[event.index].patchValue({
      Prn: event.data !== "" ? true : false,
      Prncond: event.data
    })
  }
  filterEvents() {
    if (this.configurationData && this.configurationData.length) {
      this.generateDefaultForm(this.configurationData);
    }
    if (this.filterConfig.Active || this.filterConfig.Suspended || this.filterConfig.Ended || this.filterConfig.Cancelled) {
      const scheduleList = ([].concat.apply([], this.drugArray.controls.map(d => d.value))).filter(d =>
        // (this.filterConfig.Status === "Active" && d.MosidDesc === "Active") ||
        // (this.filterConfig.Status === "Ended" && d.MosidDesc === "Ended") ||
        // (this.filterConfig.Status === "Cancelled" && d.MosidDesc === "Cancelled") ||
        // (this.filterConfig.Status === "Suspended" && d.MosidDesc === "Suspended")
        (this.filterConfig.Active && d.MosidDesc === "Active") ||
        (this.filterConfig.Ended && d.MosidDesc === "Ended") ||
        (this.filterConfig.Cancelled && d.MosidDesc === "Cancelled") ||
        (this.filterConfig.Suspended && d.MosidDesc === "Suspended")
      );
      this.generateDefaultForm(scheduleList);
    }
    // this.filterOrderData(this.filterConfig)
  }


  generateForm(data: any) {
    return new FormGroup({
      Meordid: new FormControl(data.Meordid),
      Einri: new FormControl(data.Einri),
      Falnr: new FormControl(data.Falnr),
      Descrlt: new FormControl(data.Descrlt, Validators.required),
      Formatdescr: new FormControl(data.Formatdescr),
      Routedescr: new FormControl(data.Routedescr),
      Durunittxt: new FormControl(data.Durunittxt, Validators.required),
      Quantunittxt: new FormControl(data.Quantunittxt),
      N1id: new FormControl(data.N1id),
      N1ztxt: new FormControl(data.N1ztxt),
      Physicin: new FormControl(data.Physicin),
      Physicinnm: new FormControl(data.Physicinnm),
      MotypId: new FormControl(data.MotypId),
      TOEVENTDATA: new FormControl([]),
      PomTxt: new FormControl(data.PomTxt),
      Purpose: new FormControl(data.Purpose),
      PriorityTxt: new FormControl(data.PriorityTxt),
      Mosid: new FormControl(data.Mosid),
      MosidDesc: new FormControl(data.MosidDesc),
      IsmoDetails: new FormControl(true),
      IsEditMode: new FormControl(false),
      Isrenewed: new FormControl(false),
      AddDose: new FormControl(data.AddDose),
      Agentid: new FormControl(data.Agentid),
      Aprouteid: new FormControl(data.Aprouteid),
      Complex: new FormControl(data.Complex),
      Descr: new FormControl(data.Descr),
      Dosdef: new FormControl(data.Dosdef),
      Drugid: new FormControl(data.Drugid),
      Lfdnr: new FormControl(data.Lfdnr),
      EmpRespNm: new FormControl(data.EmpRespNm),
      Moresp1: new FormControl(this.addministrationService.medicationAdministrative.EmpResp),
      N1znr: new FormControl(data.N1znr),
      Orgfa: new FormControl(data.Orgfa),
      Orgpf: new FormControl(data.Orgpf),
      Pdur: new FormControl(data.Pdur),
      Pduru: new FormControl(data.Pduru),
      Phformid: new FormControl(data.Phformid),
      Pom: new FormControl(data.Pom),
      Priority: new FormControl(data.Priority),
      Prn: new FormControl(data.Prn),
      Prncond: new FormControl(data.Prncond),
      Quan: new FormControl(data.Quan),
      Quanunit: new FormControl(data.Quanunit),
      Indisdos: new FormControl(data.Pduru !== null ? data.Pduru : "X"),
      Result_Drug_Name: new FormControl(data.Descrlt, Validators.required),
      StartD: new FormControl(this.sanitizeSAPDateFormat(data.StartD, data.StartT), Validators.required),
      StartT: new FormControl(''),
      EndD: new FormControl(this.sanitizeSAPDateFormat(data.EndD, data.EndT), Validators.required),
      EndT: new FormControl(data.EndT),
      TOCOMPLEX: new FormControl([]),
      Updmode: new FormControl(false),
      Rcodeid: new FormControl(),
      MedicationEnd: new FormGroup({
        Rcodeid: new FormControl(null, Validators.required),
        Datefrom: new FormControl(null, Validators.required),
        Timefrom: new FormControl(null, Validators.required)
      }),
      MedicationCancel: new FormGroup({
        Stoid: new FormControl(null, Validators.required),
      }),
      MedicationHold: new FormGroup({
        Stoid: new FormControl(null, Validators.required),
        Datefrom: new FormControl(null, Validators.required),
        Timefrom: new FormControl(null, Validators.required),
        Comments: new FormControl("", Validators.required)
      }),
      indisdos: new FormControl(data.indisdos)
    })
  }

  onOpenInfoPopup(data: any, index: number) {
    this.additionalPopup.showPopup(`${data.get('Descr').value !== '' ? `Comment: ${data.get('Descr').value}\n` : ''}${data.get('Prncond').value !== '' ? `PRN Condition: ${data.get('Prncond').value}` : ''}`, index);
  }

  pdurdata(data: any) {
    if (data == 0) {
      return ''
    } else {
      return data
    }
  }

  durationConvert(data: any) {
    if (data === 0) {
      return ""
    }
    return data
  }




  medicationEndAction(index: number) {
    if (this.drugArray.controls[index].value.IsEditMode) { this.drugArray.controls[index].patchValue({ IsEditMode: false }) }
    this.ePrescriptionService.loadData(`e-prescription/EndOrdReasonMedication?Einri=${this.ePrescriptionService.parameters.einri}`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        this.medicationEndReason = resp.body.d.results;
        this.drugArray.controls[index].get('MedicationEnd').patchValue({
          Rcodeid: resp.body.d.results.find(d => d.Descr === "Physician's Request").Rcodeid
        })
        this.CurrentDateTime = new Date();
      }
    },
      (error) => {
        this.showErrorPopup("", error.error.error.message.value, "Error")
      });
  }

  medicationCancellationAction(index) {
    if (this.drugArray.controls[index].value.IsEditMode) { this.drugArray.controls[index].patchValue({ IsEditMode: false }) }
    this.ePrescriptionService.loadData(`e-prescription/CancelMedicationStatus?Einri=${this.ePrescriptionService.parameters.einri}`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        this.medicationCancellationReason = resp.body.d.results;
        this.drugArray.controls[index].get('MedicationHold').patchValue({
          Stoid: resp.body.d.results.find(d => d.Stoid === "ERR").Stoid
        })
      }
    });
  }

  medicationHoldAction(index: number) {
    this.ePrescriptionService.loadData(`e-prescription/CancelMedicationStatus?Einri=${this.ePrescriptionService.parameters.einri}`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        // if (resp.body.d.results.find(d => d.Stoid === "ERR")) {
        //   this.drugArray.controls[index].get('MedicationHold').patchValue({
        //     Stoid: resp.body.d.results.find(d => d.Stoid === "ERR").Stoid
        //   })
        // }
      }
    });
  }

  setDateInAction(data: Date, ControlType, index: number) {
    this.drugArray.controls[index].get(ControlType).patchValue({
      Datefrom: `${formatDate(data, "YYYY-MM-DD")}T${formatDate(data, "HH:mm:ss")}`,
      Timefrom: `${this.parsePayloadTime(data)}`
    })
    // this.Createdata(index, data)
  }
  bsvalueDate(index: number) {
    return this.drugArray.controls[index].get('MedicationEnd').value.Datefrom !== null ? new Date(this.drugArray.controls[index].get('MedicationEnd').value.Datefrom) : new Date();
  }

  // Createdata(data: any, index: number) {
  //   const OrderData = this.drugArray.controls;
  //   this.drugArray.controls[index].get('MedicationEnd').patchValue({
  //     Rcodeid: OrderData
  //   })
  // }

  popupStatus(data: any) {
    this.configurationPopup = data;
  }

  Endorder(data: any, index: number) {
    if (!!this.drugArray.controls[index].value.Pdur && !!this.drugArray.controls[index].value.Pduru) {
      this.endAction(data, index)
    } else {
      this.showErrorPopup("", 'No Duration Specified, End is not Possible!', "Error")
    }
  }

  copyorder(data: any, index: number) {
    if (data.MosidDesc === "Ended") {
      this.medicationCopyAction(data, index)
    }else if (!!this.drugArray.controls[index].value.Pdur && !!this.drugArray.controls[index].value.Pduru) {
      this.medicationCopyAction(data, index)
    } else {
      this.showErrorPopup("", 'No Duration Specified, Renewal is not Possible!', "Error")
    }
  }


  endAction(data: any, index: number) {
    const OrderData = this.drugArray.controls[index].value;
    const PayloadData = {
      ...data,
      Einri: OrderData.Einri,
      Falnr: OrderData.Falnr,
      Meordid: OrderData.Meordid,
      Rcodeid: OrderData.MedicationEnd.Rcodeid,
      Action: "1",
    }
    this.updateActionSet("Your Order has been ended",PayloadData)
  }

  HoldAction(data: any, index: number) {
    const OrderData = this.drugArray.controls[index].value;
    const PayloadData = {
      ...data,
      Einri: OrderData.Einri,
      Falnr: OrderData.Falnr,
      Meordid: OrderData.Meordid,
      Stoid: OrderData.MedicationHold.Stoid,
      Action: "2",

    }
    this.updateActionSet("Your Order has been Suspended",PayloadData)
    // this.ResumeActionSet(PayloadData, "Event has been suspend", "Suspend")
  }
  cancelAction(data: any, index: number) {
    const OrderData = this.drugArray.controls[index].value;
    const PayloadData = {
      ...data,
      Einri: OrderData.Einri,
      Falnr: OrderData.Falnr,
      Meordid: OrderData.Meordid,
      Action: "3",
    }
    this.updateActionSet("Your Order has been Cancelled", PayloadData)
  }

  // ResumeeventAction() {
  //   const filterSelectedData = this.drugArray.controls.map(d => d.value).filter(d => d.isSelected);
  //   if (filterSelectedData && filterSelectedData.length) {
  //     const OrderData = this.drugArray.controls.map(d => d.value).find(d => d.Meordid);
  //     const Timefrom = this.parsePayloadTime(OrderData.EvstaTime)
  //     const PayloadData = {
  //       Einri: OrderData.Einri,
  //       Falnr: OrderData.Falnr,
  //       Meordid: OrderData.Meordid,
  //       Datefrom: `${formatDate(this.MedicationorderForm.get('MedicationResume').value.Datefrom, "YYYY-MM-DD")}T00:00:00`,
  //       Timefrom: Timefrom,
  //       Action: "4"
  //     }
  //     this.ResumeActionSet(PayloadData, "Event has been Resume", "Resume")
  //   }
  // }

  updateActionSet(title, data) {
    this.ePrescriptionService.updateData(`e-prescription/updateMedicationStatus?Meordid=${data.Meordid}`, data).subscribe((resp: any) => {
      this.loadMedicationHistoryData()
      swal.fire({
        title: title,
        confirmButtonColor: '#0890c5',
        cancelButtonColor: '#84898c',
        confirmButtonText: 'OK',
        customClass: 'myalertpopup',
        icon: 'success'
      })
    },
      (error) => {
        this.showErrorPopup("", error.error.error.message.value, "Error")
      });
  }

  // ResumeActionSet(data: any, message: string, eventType: string) {
  //   const filterSelectedData = this.drugArray.controls.map(d => d.value).find(d => d.Meordid);
  //   if (data || data.length) {
  //     this.ePrescriptionService.updateData(`e-prescription/updateMedicationStatus?Meordid=${filterSelectedData.Meordid}`, data).subscribe((resp: any) => {
  //       if (resp) {
  //         if (eventType === "Suspend") {
  //           this.replaceSuspendtoResume = 'Resume'
  //         } else if (eventType === "Resume") {
  //           this.replaceSuspendtoResume = 'Hold'
  //         }
  //       }
  //       swal.fire({
  //         title: message,
  //         confirmButtonColor: '#0890c5',
  //         cancelButtonColor: '#84898c',
  //         confirmButtonText: 'OK',
  //         customClass: 'myalertpopup',
  //         icon: 'success'
  //       }).then(() => {
  //         this.configurationPopup = "false";
  //       })
  //     },
  //       (error) => {
  //         this.showErrorPopup("", error.error.error.message.value, "Error")
  //       });
  //   }
  // }



  medicationCopyAction(validData, index: number) {
    if (this.drugArray.controls[index].value.IsEditMode) { this.drugArray.controls[index].patchValue({ IsEditMode: false }) }
    const genratePayload = {
      ...validData,
      StartT: validData.MosidDesc === "Ended" ? this.parsePayloadTime(new Date()) :this.parsePayloadTime(validData.EndD),
      EndT: null,
      EndD: null,
      Rcodeid: "",
      Quan: validData.Quan === 0 || validData.Quan === "0" ? "1" : `${validData.Quan}`,
      Pdur: `${validData.Pdur}`,
      StartD: validData.EndD ? `${formatDate(validData.EndD, "YYYY-MM-DD")}T00:00:00` : null,
    }
    const payloadData = {};
    Object.keys(this.CopyActionPayloadConfig).forEach((key) => {
      if (validData.hasOwnProperty(key)) {
        payloadData[key.toString()] = genratePayload[key];
      }
    });
    if (payloadData) {
      this.ePrescriptionService.updateData(`e-prescription/CopyMedicationStatus?Meordid=${validData.Meordid}`, payloadData).subscribe((resp: any) => {
        this.loadMedicationHistoryData()

        swal.fire({
          title: 'Medication Order has been Renewed',
          confirmButtonColor: '#0890c5',
          cancelButtonColor: '#84898c',
          confirmButtonText: 'OK',
          customClass: 'myalertpopup',
          icon: 'success'
        })
      }, (error) => {
        this.showErrorPopup("", error.error.error.message.value, "Error")
      })
    }
  }




  closeActivedata() {
    this.MedicationorderForm.patchValue({ isActiveOrder: !this.MedicationorderForm.value.isActiveOrder });
  }


  onOpenInfoPopupprn(data: any, index: number) {
    this.additionalPopup.showPopup(data.get('Prncond').value, index);
  }

  closeModetail(index: number) {
    this.drugArray.controls[index].patchValue({ IsmoDetails: false });
  }

  closeeditModetail(index: number) {
    this.drugArray.controls[index].patchValue({ IsEditMode: false, Isrenewed: false });
  }

  generateDefaultForm(data: any) {
    this.drugArray.clear();
    for (let i = 0; i < data.length; i++) { this.drugArray.push(this.generateForm(data[i])); }
  }

  get drugArray() {
    return this.MedicationorderForm.get('MedicationorderData') as FormArray;
  }

  updatePrnCondition(data: any, index: number) {
    this.drugArray.controls[index].patchValue({ Prncond: data })
  }

  onSelectMedicine(event: any) {
    this.defaultAgentId = event.data.Agentid;
    if (event.data) {
      const filter = {
        einri: this.ePrescriptionService.parameters.einri,
        case: this.ePrescriptionService.parameters.falnr,
        movement: this.ePrescriptionService.parameters.lfdnr,
        AgentID: event.data.Agentid,
        DrugID: event.data.Drugid,
        purpose: ''
      }
      let expandEntities = ['NAVDRUGFORMATS', 'NAVDRUGFORMATROUTES', 'NAVDRUGFORMATROUTEUNITS', 'NAVDRUGUNITS'];
      this.ePrescriptionService.loadData('DrugPropSet', filter, expandEntities, true, true).subscribe((resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results) {
          const DescriptionData = resp.body.d.results[0].NAVDRUGFORMATROUTES.results[0];
          this.drugArray.controls[event.index].patchValue({
            Phformid: DescriptionData.FormID,
            Aprouteid: DescriptionData.RouteID,
            Result_Drug_Name: event.data.Drugname,
            Formatdescr: event.data.Formatdescr,
            Routedescr: event.data.Routedescr,
            Agentid: event.data.Agentid,
            Drugid: event.data.Drugid
          });
        }
      });
      this.ePrescriptionService.loadData(`e-prescription/DurgUnitlist?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}&Lfdnr=${this.ePrescriptionService.parameters.lfdnr}&Drugid=${event.data.Drugid}`, false, false, false, false).subscribe((resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
          if (resp.body.d.results[0] && resp.body.d.results.length) {
            resp.body.d.results.forEach(element => {
              element.Mseht !== "" && element.Agent !== "" ? element.OptionField = [element.Mseht, element.Agent].join(" - ") : element.OptionField = element.Mseht;
            });
            this.drugArray.controls[event.index].patchValue({
              DosageUnitSet: resp.body.d.results,
              Quanunit: resp.body.d.results[0].Meinh,
              Quan: Math.floor(resp.body.d.results[0].Quant)
            })
          }
        }
      });
    }
  }

  openMoDetailPanel(index?: any, validData?: any) {
    if (validData) {
      this.ePrescriptionService.loadData(`e-prescription/OrderEventMedicationStatus?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}&Meordid=${validData.Meordid}`, false, false, false, false).subscribe((resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results) {
          this.drugArray.controls[index].patchValue({
            TOEVENTDATA: resp.body.d.results
          });
          this.modetailpanel.showPopup(this.drugArray.controls[index].value);
        }
      });
    }
  }
  onClickTabChange(index: number, tabdetail: any) {
    if (tabdetail === "Medicationdata") { this.tabmodetail = tabdetail }
    else if (tabdetail === "Eventdata") { this.tabmodetail = tabdetail }
  }

  parseTime(data: string) {
    if (data && data.length) {
      const strArr: string[] = data.split('');
      if (
        data &&
        data.length === 11 &&
        strArr[4] === 'H' &&
        strArr[7] === 'M' &&
        strArr[10] === 'S' &&
        !isNaN(+(strArr[2] + strArr[3])) &&
        !isNaN(+(strArr[5] + strArr[6])) &&
        !isNaN(+(strArr[8] + strArr[9]))
      ) {
        const hours = +(strArr[2] + strArr[3]) <= 9 ? `0${+(strArr[2] + strArr[3])}` : +(strArr[2] + strArr[3]);
        const Minute = +(strArr[5] + strArr[6]) <= 9 ? `0${+(strArr[5] + strArr[6])}` : +(strArr[5] + strArr[6]);
        const Second = +(strArr[8] + strArr[9]) <= 9 ? `0${+(strArr[8] + strArr[9])}` : +(strArr[8] + strArr[9]);
        return `${hours}:${Minute}:${Second}`
      }
    }
    return null;
  }

  parseDate(date: any) {
    if (date !== null) {
      var StartD = "/Date(1268524800000)/";
      var num = parseInt(StartD.replace(/[^0-9]/g, ""));
    }
    return null;
  }

  parsePayloadTime(date) {
    const newDate = `${new DatePipe('en-US').transform(date, "HH:mm:ss")}`
    if (newDate) {
      const strArr: string[] = newDate.split(':');
      if (
        newDate &&
        newDate.length === 8
      ) {
        return `PT${strArr[0]}H${strArr[1]}M${strArr[2]}S`;
      }
    }
    return null;
  }
  validFromTobaseonDuration(index: number, data: any) {
    if (data.StartD) {
      if (`${data.Pdur}` === "0") {
        this.drugArray.controls[index].patchValue({ EndD: null });
      }
      if (data.Pduru === "MON" && `${data.Pdur}` !== "0") {
        this.drugArray.controls[index].patchValue({
          EndD: new Date(data.StartD.setMonth(data.StartD.getMonth() + +(data.Pdur))),
          StartD: new Date(data.StartD.setMonth(data.StartD.getMonth() - +(data.Pdur)))
        });
      }
      if (data.Pduru === "TAG" && `${data.Pdur}` !== "0") {
        this.drugArray.controls[index].patchValue({
          EndD: new Date(data.StartD.setDate(data.StartD.getDate() + +(data.Pdur))),
          StartD: new Date(data.StartD.setDate(data.StartD.getDate() - +(data.Pdur)))
        });
      }

      if (data.Pduru === "MIN" && `${data.Pdur}` !== "0") {
        this.drugArray.controls[index].patchValue({
          EndD: new Date(data.StartD.setMinutes(data.StartD.getMinutes() + +(data.Pdur))),
          StartD: new Date(data.StartD.setMinutes(data.StartD.getMinutes() - +(data.Pdur)))
        });
      }

      if (data.Pduru === "STD" && `${data.Pdur}` !== "0") {
        this.drugArray.controls[index].patchValue({
          EndD: new Date(data.StartD.setHours(data.StartD.getHours() + +(data.Pdur))),
          StartD: new Date(data.StartD.setHours(data.StartD.getHours() - +(data.Pdur)))
        });
      }

      if (data.Pduru === "S" && `${data.Pdur}` !== "0") {
        this.drugArray.controls[index].patchValue({
          EndD: new Date(data.StartD.setSeconds(data.StartD.getSeconds() + +(data.Pdur))),
          StartD: new Date(data.StartD.setSeconds(data.StartD.getSeconds() - +(data.Pdur)))
        });
      }

      if (data.Pduru === "WCH" && `${data.Pdur}` !== "0") {
        this.drugArray.controls[index].patchValue({
          EndD: new Date(data.StartD.setDate(data.StartD.getDate() + (+(data.Pdur) * 7))),
          StartD: new Date(data.StartD.setDate(data.StartD.getDate() - (+(data.Pdur) * 7)))
        });
      }

      if (data.Pduru === "DOS" && `${data.Pdur}` !== "0") {
        this.drugArray.controls[index].patchValue({ EndD: null });
        if (data.N1znr !== null) { this.onFrequencyFilter(data, index) }
      }
    }
  }

  onFrequencyFilter(data: any, index: number) {
    const findSelectedFrequency = this.addministrationService.frequencyList.find(d => d.CycleKey === data.N1znr).N1id;
    if (findSelectedFrequency === "Q24H") {
      this.updateDosageHour(data, index, 24)
    } else if (findSelectedFrequency === "BID") {
      this.updateDosageHour(data, index, 12)
    } else if (findSelectedFrequency === "TID") {
      this.updateDosageHour(data, index, 8)
    } else if (findSelectedFrequency === "QID") {
      this.updateDosageHour(data, index, 4)
    } else if (findSelectedFrequency === "ONCE") {
      this.updateDosageHour(data, index, 24)
    } else if (findSelectedFrequency === "SLIDING") {
      this.updateDosageHour(data, index, 8)
    } else if (findSelectedFrequency === "Q12H") {
      this.updateDosageHour(data, index, 24)
    } else if (findSelectedFrequency === "Q2H") {
      this.updateDosageHour(data, index, 12)
    } else if (findSelectedFrequency === "Q3H") {
      this.updateDosageHour(data, index, 8)
    } else if (findSelectedFrequency === "Q4H") {
      this.updateDosageHour(data, index, 4)
    } else if (findSelectedFrequency === "Q6H") {
      this.updateDosageHour(data, index, 6)
    } else if (findSelectedFrequency === "Q8H") {
      this.updateDosageHour(data, index, 8)
    } else if (findSelectedFrequency === "PQ24H") {
      this.updateDosageHour(data, index, 24)
    } else if (findSelectedFrequency === "NBID") {
      this.updateDosageHour(data, index, 12)
    } else if (findSelectedFrequency === "PBID") {
      this.updateDosageHour(data, index, 12)
    } else if (findSelectedFrequency === "PTID") {
      this.updateDosageHour(data, index, 8)
    } else if (findSelectedFrequency === "NTID") {
      this.updateDosageHour(data, index, 8)
    } else if (findSelectedFrequency === "PQID") {
      this.updateDosageHour(data, index, 4)
    } else if (findSelectedFrequency === "NQID") {
      this.updateDosageHour(data, index, 4)
    } else if (findSelectedFrequency === "QHS") {
      this.updateDosageHour(data, index, 12)
    } else if (findSelectedFrequency === "PHS") {
      this.updateDosageHour(data, index, 12)
    } else if (findSelectedFrequency === "PQ4H") {
      this.updateDosageHour(data, index, 4)
    } else if (findSelectedFrequency === "PQ8H") {
      this.updateDosageHour(data, index, 8)
    } else if (findSelectedFrequency === "NQ8H") {
      this.updateDosageHour(data, index, 8)
    } else if (findSelectedFrequency === "PQ12H") {
      this.updateDosageHour(data, index, 24)
    } else if (findSelectedFrequency === "NQ12H") {
      this.updateDosageHour(data, index, 24)
    } else if (findSelectedFrequency === "5X/DAY") {
      this.updateDosageHour(data, index, 12)
    } else if (findSelectedFrequency === "STAT") {
      this.updateDosageHour(data, index, 24)
    } else if (findSelectedFrequency === "QAD") {
      this.updateDosageHour(data, index, 12)
    } else if (findSelectedFrequency === "QD") {
      this.updateDosageHour(data, index, 24)
    } else if (findSelectedFrequency === "QD/AC") {
      this.updateDosageHour(data, index, 24)
    } else if (findSelectedFrequency === "QD/PC") {
      this.updateDosageHour(data, index, 24)
    } else if (findSelectedFrequency === "CONT") {
      this.updateDosageHour(data, index, 24)
    } else if (findSelectedFrequency === "BID/AC") {
      this.updateDosageHour(data, index, 12)
    } else if (findSelectedFrequency === "TID/PC") {
      this.updateDosageHour(data, index, 8)
    } else if (findSelectedFrequency === "NQD") {
      this.updateDosageHour(data, index, 24)
    } else if (findSelectedFrequency === "NQ6H") {
      this.updateDosageHour(data, index, 6)
    } else if (findSelectedFrequency === "PQ6H") {
      this.updateDosageHour(data, index, 6)
    } else if (findSelectedFrequency === "TID/AC") {
      this.updateDosageHour(data, index, 8);
    } else if (findSelectedFrequency === "BID/PC") {
      this.updateDosageHour(data, index, 8)
    } else if (findSelectedFrequency === "DEFTIM") {
      this.updateDosageHour(data, index, 24)
    } else if (findSelectedFrequency === "DAILY") {
      this.updateDosageHour(data, index, 24)
    } else if (findSelectedFrequency === "Q23H") {
      this.updateDosageHour(data, index, 24)
    } else if (findSelectedFrequency === "WEEKLY") {
      this.updateDosageHour(data, index, 24)
    } else if (findSelectedFrequency === "INCREMENT") {
      this.updateDosageHour(data, index, 24)
    } else if (findSelectedFrequency === "TEST 1") {
      this.updateDosageHour(data, index, 24)
    }
  }

  updateDosageHour(data: any, index: number, updatedHour) {
    this.drugArray.controls[index].patchValue({
      EndD: new Date(data.StartD.setHours(data.StartD.getHours() + (+(data.Pdur) * updatedHour))),
      StartD: new Date(data.StartD.setHours(data.StartD.getHours() - (+(data.Pdur) * updatedHour)))
    });
  }

  ngOnDestroy(): void {
    if (this.modetailsFormSubscription) { this.modetailsFormSubscription.unsubscribe(); }
  }


  showErrorPopup(title: any, text: any, messageType) {
    return swal.fire({
      title: title ? title : '',
      text: text ? text : '',
      showCancelButton: messageType === 'Conform' ? true : false,
      confirmButtonColor: '#0890c5',
      cancelButtonColor: '#84898c',
      confirmButtonText: messageType === 'Error' ? 'Close' : 'Yes',
      cancelButtonText: 'No',
      customClass: 'myalertpopup',
      icon: 'error'
    });
  }
  sanitizeSAPDateFormat(date: string, time: any) {
    if (typeof (date) === 'string') {
      if (date !== null && time !== null) {
        const generatedDate = new DatePipe('en-US').transform(
          date.replace('/Date(', '').replace(')/', ''),
          'yyyy-MM-dd'
        );
        return new Date(`${generatedDate}T${this.parseTime(time)}`);
      } else {
        return null
      }
    } else {
      return date
    }
  }

}
