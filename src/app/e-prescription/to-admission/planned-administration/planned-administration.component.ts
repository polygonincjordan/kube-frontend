import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DatePipe } from '@angular/common';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import { EPrescriptionService} from '@services/e-Prescription/e-prescription.service';
import { formatDate } from 'ngx-bootstrap/chronos';
import { Subscription } from 'rxjs';
import swal from 'sweetalert2';
import { AdditionInfoPopupComponent } from '../../discharge-order/addition-info-popup/addition-info-popup.component';
import { TemplateDescriptionComponent } from '../../administration/create-administration/template-description/template-description.component';
import { PopoverDirective } from 'ngx-bootstrap/popover';


@Component({
  selector: 'planned-administration',
  templateUrl: './planned-administration.component.html',
  styleUrls: ['./planned-administration.component.scss']
})
export class PlannedAdministrationComponent implements OnInit {
  public indexofData: number;
  public administrationForm= new FormGroup({ AdministrationData: new FormArray([], Validators.required),});
  public isFormSubmitted: boolean = false;
  public dosageUnitList: any[];
  public modetailsFormSubscription: Subscription;
  public priorityArray: any = [{ Desc: "Regular", Value: "010" }, { Desc: "High", Value: "020" }, { Desc: "STAT", Value: "030" }];
  public defaultAgentId: string;
  public tabmodetail: string;
  public subscription: Subscription
  public SelectMedicinesubscription: Subscription;
  modalRef: BsModalRef;


  constructor(public opentempmodalservices: NgbModal,private modalService: BsModalService, public ePrescriptionService: EPrescriptionService, public route: ActivatedRoute, public addministrationService: AddministrationService, private cdr: ChangeDetectorRef){}
  @ViewChild('additionalInfo', { static: true }) additionalInfo: TemplateRef<any>;
  @Output() onUpdateData: EventEmitter<any> = new EventEmitter;
  @ViewChild('additionalPopup', { static: true }) additionalPopup: AdditionInfoPopupComponent;
  @ViewChild('template', { static: true }) template: PlannedAdministrationComponent;
  @ViewChild('prnPopup', { static: true }) prnPopup: AdditionInfoPopupComponent;
  @ViewChild('templateDescription', { static: true }) templateDescription: TemplateDescriptionComponent;
  @Output() onDrugArraySubmit : EventEmitter<any | any[]> = new EventEmitter;
  @ViewChildren(PopoverDirective) popovers: QueryList<PopoverDirective>;
  // @Input() set ContinueHospital(data: any) {
  //   if (data && data.CONTINUEHOSPITAL) {
  //     if(data.checkbox){
  //       this.priortoad.push(data.CONTINUEHOSPITAL);
  //       this.processTemplateData(this.priortoad);
  //     }else{
  //       const index = this.priortoad.findIndex(period=> period.Agentid === data.Agentid );
  //       if(index !== -1){
  //         this.priortoad.splice(index,1);
  //         this.processTemplateData(this.priortoad);
  //       }
  //       data.CONTINUEHOSPITAL = [];
  //     }
  //   }
  // };
  showPopup(data: any){
    this.processTemplateData(data)
    this.addministrationService.loadDropdownList();
    this.modetailsFormSubscription = this.administrationForm.valueChanges.subscribe(() => { this.isFormSubmitted = true; })
    // this.modalRef = this.modalService.show(this.additionalInfo,{backdrop:true,ignoreBackdropClick:true,class:'configuration-popup modal-right'});
  }
  ngOnInit(): void {
    this.addministrationService.loadDropdownList();
    this.modetailsFormSubscription = this.administrationForm.valueChanges.subscribe(() => { this.isFormSubmitted = true; });
    this.ePrescriptionService.drugArrayActions$.subscribe((res)=>{
      if(res.isSubmitted){
        this.ePrescriptionService.drugArrayActions$.next({isSubmitted:false, value: this.drugArray.value});
      }
    });
  }

  hidePopover() {
    this.popovers.forEach(popover => popover.hide());
  }
  ngDoCheck(): void {
    if (!!this.popovers) {
      this.popovers.forEach((popover: PopoverDirective) => {
        if (popover.popover['_declarationTContainer']['localNames'][0] === "hourPopover") {
          const popoverSubscription: Subscription = popover.onShown.subscribe(() => {
            this.popovers
              .filter(p => p !== popover)
              .forEach(p => p.hide());
            popoverSubscription.unsubscribe();
          });
        }
      });
    }
  }

  onCancel(){
    this.addministrationService.isExpanded = !this.addministrationService.isExpanded;
    this.addministrationService.isConditionTrue = !this.addministrationService.isConditionTrue;
  }

  processTemplateData(data) {
    this.drugArray.controls = [];
    if(data){
      data.forEach((item ,index) =>{
      this.drugArray.push(this.generateForm());
        this.drugArray.controls[index].patchValue({
         Agentid: item.Agentid,
         Drugid: item.Drugid,
         N1znr: item.N1znr,
         Result_Drug_Name: item.Result_Drug_Name,
         Quan: item.Quan === '0.000' ? '0' : item.Quan,
         Quanunit: item.Quanunit,
         Formatdescr: item.Formatdescr,
         Routedescr: item.Routedescr !== null ? item.Routedescr.Descr :item.Routedescr,
         Pdur: parseInt(item.Pdur) === 0 ? "" : `${Math.floor(item.Pdur)}`,
         Pduru: item.Pduru !== null ? item.Pduru : "",
         Aprouteid: item.Routedescr !== null ? item.Routedescr.Aprouid :item.Aprouteid,
         Phformid: item.Phformid,
         Prncond: item.Prncond,
         Prn: item.Prn,
         Descr: item.Descr,
         Dosdef: item.Dosdef,
         N1ztxt:item.N1ztxt,
         id:item.id,
         AgentidResult:item.AgentidResult
        });
      });
    }else{
      this.addministrationService.isExpanded = !this.addministrationService.isExpanded;
      this.addministrationService.isConditionTrue = !this.addministrationService.isConditionTrue;
    }
  }

  generateForm() {
    return new FormGroup({
      id:new FormControl(),
      Agentid: new FormControl(''),
      Drugid: new FormControl(''),
      Phformid: new FormControl(null, Validators.required),
      Aprouteid: new FormControl(null),
      Pdur: new FormControl(''),
      Pduru: new FormControl(null),
      Quan: new FormControl('0', Validators.required),
      Quanunit: new FormControl(null, Validators.required),
      N1znr: new FormControl(null, Validators.required),
      Dosdef: new FormControl(""),
      Prn: new FormControl(false),
      Prncond: new FormControl(''),
      Moresp1: new FormControl(''),
      Lfdnr: new FormControl(this.ePrescriptionService.parameters.lfdnr),
      StartD: new FormControl(new Date(), Validators.required),
      StartT: new FormControl(''),
      EndD: new FormControl(null),
      EndT: new FormControl(''),
      Orgfa: new FormControl(""),
      Orgpf: new FormControl(""),
      Updmode: new FormControl(false),
      Descr: new FormControl(''),
      AddDose: new FormControl(''),
      Complex: new FormControl(''),
      Pom: new FormControl(''),
      Priority: new FormControl('010', Validators.required),
      Routedescr: new FormControl(null),
      TOCOMPLEX: new FormControl([]),
      TOEVENTDATA: new FormControl([]),
      Formatdescr: new FormControl(null),
      Result_Drug_Name: new FormControl(null, Validators.required),
      IsmoDetails: new FormControl(false),
      IsFrequencyDeftim: new FormControl(false),
      deftimcycleData: new FormControl([]),
      AgentidResult: new FormControl([]),
      N1ztxt : new FormControl(''),
    })
  }

  sanitizeSAPDateFormat(date: string, time: any) {
    if (typeof (date) === 'string') {
      if (date !== null && time !== null) {
        const generatedDate = new DatePipe('en-US').transform(
          date.replace('/Date(', '').replace(')/', ''), 'yyyy-MM-dd'
        );
        return new Date(`${generatedDate}T${this.parsePtTime(time)}`);
      } else {
        return null
      }
    } else {
      return date
    }
  }

  get drugArray() {
    return this.administrationForm.get('AdministrationData') as FormArray;
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { backdrop: true, ignoreBackdropClick: false, class: 'template-med template-med-data template' });
 }
  addRowData() {
    const notTouchedForms = this.drugArray.controls.filter(d => !d.touched);
    if (notTouchedForms && notTouchedForms.length > 3) {
      swal.fire({
        text: 'Enter data before adding new row',
        confirmButtonColor: '#0890c5',
        cancelButtonColor: '#84898c',
        confirmButtonText: 'OK',
        customClass: 'myalertpopup',
        icon: 'error'
      });
    } else {
      this.drugArray.push(this.generateForm());
    }
  }

  closeCycle(index: number) {
    this.drugArray.controls[index].patchValue({ IsFrequencyDeftim: false })
  }

  deleteRowData(index: any) {
    if (this.drugArray.controls && this.drugArray.controls.length) {
      this.showErrorPopup(null, 'Do You Want to Delete this Data?', 'Conform').then(
        (result) => {
          if (result.value) {
            this.drugArray.removeAt(index);

          }
        });
    } else {
      this.drugArray.removeAt(index);
    }
  }

  serachInput(term: string, item: any) {
    term = term.toLowerCase();
    return (item.Descr.toLowerCase().includes(term) || item.Aprou.toLowerCase().includes(term))
  }

  deletecycleData(index: any) {
    const TouchedForms = this.drugArray.controls[index].get('deftimcycleData')['controls'];
    const unTouchedForms = this.drugArray.controls[index].get('deftimcycleData')['controls'];
    if (TouchedForms && TouchedForms.length) {
      this.showErrorPopup(null, 'Do You Want to Delete this Data?', 'Conform').then(
        (result) => {
          if (result.value) {
            (this.drugArray.controls[index].get('deftimcycleData') as FormArray).removeAt(index);
            if (this.drugArray.controls[index].get('deftimcycleData').value && !this.drugArray.controls[index].get('deftimcycleData').value.length) {
              this.drugArray.controls[index].patchValue({ IsFrequencyDeftim: false, N1znr: null })
            }
          }
        });
    } else if (unTouchedForms && unTouchedForms.length < 3) {
      this.showErrorPopup(null, 'Can not Delete', 'Error');
    } else {
      (this.drugArray.controls[index].get('deftimcycleData') as FormArray).removeAt(index);
      if (this.drugArray.controls[index].get('deftimcycleData').value && !this.drugArray.controls[index].get('deftimcycleData').value.length) {
        this.drugArray.controls[index].patchValue({ IsFrequencyDeftim: false, N1znr: null })
      }
    }
  }

  searchMedicationDrugList() {
    this.SelectMedicinesubscription = this.ePrescriptionService.loadData(`e-prescription/medicationDetails?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}&Searchtype=${'B'}&SearchString=${''}`, null, false, false, false).subscribe({
      next: (resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results) {
          this.addministrationService.medicationDrugList = resp.body.d.results[0].TODURG.results
        }
      },
    });
    this.SelectMedicinesubscription.unsubscribe()
  }

  onSelectMedicine(event: any) {
    if (event.data) {
      this.defaultAgentId = event.data.Agentid;
      const filter = {
        einri: this.ePrescriptionService.parameters.einri,
        case: this.ePrescriptionService.parameters.falnr,
        movement: this.ePrescriptionService.parameters.lfdnr,
        AgentID: event.data.Agentid,
        DrugID: event.data.Drugid,
        purpose: '',
      }
      let expandEntities = ['NAVDRUGFORMATS', 'NAVDRUGFORMATROUTES', 'NAVDRUGFORMATROUTEUNITS', 'NAVDRUGUNITS'];
      this.ePrescriptionService.loadData('DrugPropSet', filter, expandEntities, true, true).subscribe((resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results) {
          if (resp.body.d.results[0].NAVDRUGFORMATROUTEUNITS.results && resp.body.d.results[0].NAVDRUGFORMATROUTEUNITS.results.length) {
            this.dosageUnitList = resp.body.d.results[0].NAVDRUGFORMATROUTEUNITS.results;
          }
        }
        this.drugArray.controls[event.index].patchValue({
          Phformid: resp.body.d.results[0].NAVDRUGFORMATROUTES.results[0].FormID,
          // Aprouteid: resp.body.d.results[0].NAVDRUGFORMATROUTES.results[0].RouteID,
          Result_Drug_Name: event.data.Drugname,
          Formatdescr: event.data.Formatdescr,
          Routedescr: event.data.Routedescr,
          Agentid: event.data.Agentid,
          Drugid: event.data.Drugid
        });
      })
      this.SelectMedicinesubscription = this.ePrescriptionService.loadData(`e-prescription/DurgUnitlist?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}&Lfdnr=${this.ePrescriptionService.parameters.lfdnr}&Drugid=${event.data.Drugid}`, false, false, false, false).subscribe((resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
          if (resp.body.d.results[0] && resp.body.d.results.length) {
            resp.body.d.results.forEach(element => {
              if (element.Mseht !== "" && element.Agent !== "") {
                element.OptionField = [element.Mseht, element.Agent].join(" - ");
              } else {
                element.OptionField = element.Mseht
              }
            });
            this.drugArray.controls[event.index].patchValue({
              AgentidResult: resp.body.d.results,
              Quanunit: resp.body.d.results[0].Meinh,
              Quan: resp.body.d.results[0].Quant && parseInt(resp.body.d.results[0].Quant) === Number(resp.body.d.results[0].Quant) ? parseInt(resp.body.d.results[0].Quant) : Number(resp.body.d.results[0].Quant)
            });
          }
        }
      });
    } else {
      this.removeControl(event.index);
    }
  }
  removeControl(index: number) {
    this.drugArray.controls.splice(index, 1);
    this.cdr.detectChanges();
  }

  onChangeDosageUnit(data: any, event: any, index: number) {
    const selectedDosage = data.find(d => d.Meinh === event)
    if (selectedDosage !== undefined && selectedDosage.Agentid !== '') {
      this.drugArray.controls[index].patchValue({
        Agentid: selectedDosage.Agentid !== null ? selectedDosage.Agentid : "",
        Quan: Math.floor(selectedDosage.Quant)
      })
    } else {
      this.drugArray.controls[index].patchValue({
        Agentid: this.defaultAgentId
      })
    }
  }

  FrequencySetcycle(event, index: number, data: any) {
    if (event && event.length) {
      this.drugArray.controls[index].get("deftimcycleData").setValue(event);
      const selectedData = [];
      if (!event.find(d => formatDate(d.deftimTime, "HH:mm") === "08:00")) {
        selectedData.push("0(08:00)")
      }
      event.forEach(element => {
        selectedData.push(`${element.deftimDose}(${formatDate(element.deftimTime, "HH:mm")})`)
        this.onChangeDosageUnit(data, element.deftimDosageUnit, index)
      });
      this.drugArray.controls[index].patchValue({
        Quan: Math.floor(event[0].deftimDose),
        Quanunit: event[0].deftimDosageUnit,
      })
      this.drugArray.controls[index].patchValue({
        Dosdef: selectedData.join("-")
      })
    }
  }

  // closeModetail(index: number) {
  //   this.drugArray.controls[index].patchValue({ IsmoDetails: false });
  // }

  onClickTabChange(index: number, tabdetail: any) {
    if (tabdetail === "MedicationDetails") { this.tabmodetail = tabdetail } else if (tabdetail === "ComplexOrder") { this.tabmodetail = tabdetail } else if (tabdetail === "Events") { this.tabmodetail = tabdetail }
  }

  updatedComplexData(event: any, index: number) {
    const validForms = event.get('complexRowData').controls.filter(d => d.valid);
    if (validForms && validForms.length) {
      this.drugArray.controls[index].patchValue({
        Pdur: validForms.map(d => d.value).map(d => d.Pdur).reduce((partialSum, a) => +(partialSum) + +(a), 0)
      })
      this.drugArray.controls[index].patchValue({
        StartD: validForms[0].value.StartD,
        EndD: validForms[validForms.length - 1].value.EndD,
        Pduru: validForms[0].value.Pduru !== null ? validForms[0].value.Pduru : null
      })
      this.drugArray.controls[index].get('TOCOMPLEX').setValue(validForms.map(d => d.value));
    }
  }

  openMoDetailPanel(index: any, validData: any, isValidForm: boolean, IsMO: boolean,template?: TemplateRef<any>) {
    if (isValidForm) {
      this.drugArray.controls[index].patchValue({ IsmoDetails: false });
      const data = Math.floor(validData.Pdur);
      if (((validData.Complex || validData.Complex === "X") && `${data}` !== validData.Pdur) && !IsMO) {
        this.drugArray.controls[index].patchValue({ Complex: false });
        this.showErrorPopup('', 'Sliding dosage: only integral values are valid for field Duration', 'Error')
        return;
      } else if (((validData.Complex || validData.Complex === "X") && validData.Pduru !== 'TAG') && !IsMO) {
        this.drugArray.controls[index].patchValue({ Complex: false });
        this.showErrorPopup('', 'Only Duration unit of Days is allowed for Complex Orders', 'Error')
        return;
      }else if (((validData.Complex || validData.Complex === "X") && (validData.AddDose || validData.AddDose === "X")) && !IsMO) {
        this.drugArray.controls[index].patchValue({ Complex: false });
        this.showErrorPopup('', "Additional Dose can't be generated for a complex order!", 'Error')
        return;
      }
      if (((validData.Complex || validData.Complex === "X") && validData.Pduru === 'TAG') && ((validData.Complex || validData.Complex === "X") && data.toString() === validData.Pdur)) {
        this.tabmodetail = "ComplexOrder";
        this.modalRef = this.modalService.show(template, { backdrop: true, ignoreBackdropClick: false, class: 'template-med template-med-data template' });
        if (this.drugArray.controls[index].get('TOCOMPLEX').value && !this.drugArray.controls[index].get('TOCOMPLEX').value.length) {
          if (this.addministrationService.frequencyList.find(d => d.CycleKey === validData.N1znr) !== undefined && this.addministrationService.frequencyList.find(d => d.CycleKey === validData.N1znr).N1id === "Q24H") {
            this.ePrescriptionService.loadData(`e-prescription/frequencyQ24Cycle?N1znr=${validData.N1znr}`, false, false, false, false).subscribe((resp: any) => {
              if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
                this.drugArray.controls[index].patchValue({ IsmoDetails: true, IsFrequencyDeftim: false });
                this.drugArray.controls[index].get('deftimcycleData')['controls'] = [];
                const filterDataComplex = [];
                for (let i = 0; i < resp.body.d.results.length; i++) {
                  filterDataComplex.push({
                    Drugid: validData.Drugid,
                    Seqno: "1",
                    Quan: validData.Quan,
                    Quanunit: validData.Quanunit,
                    N1znr: validData.N1znr,
                    Pdur: validData.Pdur,
                    Pduru: validData.Pduru !== null ? validData.Pduru : null,
                    StartD: validData.StartD !== null ? new Date(`${formatDate(new Date(validData.StartD), "YYYY-MM-DD")}T${this.parsePtTime(resp.body.d.results[i].N1begzt)}`) : null,
                    StartT: this.parsePtTime(resp.body.d.results[i].N1begzt),
                    EndD: null,
                    EndT: null,
                  });
                }
                this.drugArray.controls[index].get('TOCOMPLEX').setValue(filterDataComplex);
              }
            }
            );
          } else {
            this.ePrescriptionService.loadData(`e-prescription/frequencyCycle?N1znr=${validData.N1znr}`, false, false, false, false).subscribe((resp: any) => {
              if (resp.body && resp.body.d) {
                this.drugArray.controls[index].patchValue({ IsmoDetails: true, IsFrequencyDeftim: false });
                this.drugArray.controls[index].get('deftimcycleData')['controls'] = [];
                this.drugArray.controls[index].get('TOCOMPLEX').setValue([{
                  Drugid: validData.Drugid,
                  Seqno: "1",
                  Quan: validData.Quan,
                  Quanunit: validData.Quanunit,
                  N1znr: validData.N1znr,
                  Pdur: validData.Pdur,
                  Pduru: validData.Pduru !== null ? validData.Pduru : null,
                  StartD: validData.StartD !== null ? new Date(`${formatDate(new Date(validData.StartD), "YYYY-MM-DD")}T${this.parsePtTime(resp.body.d.N1begzt)}`) : null,
                  StartT: this.parsePtTime(resp.body.d.N1begzt),
                  EndD: null,
                  EndT: null,
                }])
              }
            }
            );
          }
        } else {
          this.tabmodetail = "ComplexOrder";
          this.drugArray.controls[index].patchValue({ IsmoDetails: true, IsFrequencyDeftim: false });
        }
      } else if ((validData.Complex || validData.Complex !== "") && !IsMO) {
        this.showErrorPopup('', 'Do you want to delete Complex Order?', "Conform").then((result) => {
          if (result.value) {
            this.tabmodetail = "MedicationDetails";
            this.drugArray.controls[index].get('TOCOMPLEX').setValue([]);
            this.drugArray.controls[index].patchValue({ N1znr: null, IsmoDetails: true, Pdur: '' });
          } else {
            this.tabmodetail = "ComplexOrder";
            this.drugArray.controls[index].patchValue({ Complex: true });
          }
        })
      }
      if (IsMO) {
        this.tabmodetail = "MedicationDetails";
      }
      if (this.drugArray.controls[index].get('TOEVENTDATA').value && !this.drugArray.controls[index].get('TOEVENTDATA').value.length) {
        let postObject = this.ePrescriptionService.loadParameters(true, true, true, true);
        validData.Quan = `${validData.Quan}`;
        validData.Pdur = `${validData.Pdur}`;
        validData.Prncond = validData.Prn ? validData.Prncond : "";
        validData.StartT = this.parseTime(validData.StartD);
        validData.StartD = this.parseDate(validData.StartD);
        validData.EndT = this.parseTime(validData.EndD);
        validData.EndD = this.parseDate(validData.EndD);
        validData.Complex = validData.Complex ? "X" : "";
        validData.AddDose = validData.AddDose ? "X" : "";
        validData.Pduru = validData.Pduru !== null ? validData.Pduru : "";
        delete validData.Routedescr;
        delete validData.Formatdescr;
        delete validData.Result_Drug_Name;
        delete validData.IsmoDetails;
        delete validData.TOEVENTDATA;
        delete validData.deftimcycleData;
        delete validData.IsFrequencyDeftim;
        delete validData.AgentidResult;
        delete validData.id
        if (validData) {
          postObject['TOGETEVENT'] = [validData];
          postObject['TOEVENT'] = [{}]
          this.ePrescriptionService.postData('e-prescription/getEventSetData', postObject).subscribe(
            {
              next: (resp: any) => {
                if (resp.body && resp.body.d && resp.body.d) {
                  if (IsMO) { this.drugArray.controls[index].patchValue({ IsmoDetails: true }) };
                  this.drugArray.controls[index].patchValue({
                    TOEVENTDATA: resp.body.d.TOEVENT.results
                  })
                }
              },
              error: (error: any) => { }
            }
          )
        }
      } else {
        this.drugArray.controls[index].patchValue({ IsmoDetails: true, IsFrequencyDeftim: false });
      }
    }
    else if (!isValidForm) {
      this.showErrorPopup('', 'Please fill required field', 'Error').then((result) => {
        if (result.value) {
          this.drugArray.controls[index].patchValue({ Complex: false });
        } else {
          this.drugArray.controls[index].patchValue({ Complex: true });
        }
      });
    }

  }

  onChangeFrequencySet(data?: any, index?: number) {
    if (data !== null || data !== "") {
      this.drugArray.controls[index].get('deftimcycleData').setValue([]);
      if (this.drugArray.controls[index].get('Result_Drug_Name').value === "" || this.drugArray.controls[index].get('Result_Drug_Name').value === null) {
        this.showErrorPopup('', 'Please select medicine', "Error").then((result) => {
          if (result.value) {
            this.drugArray.controls[index].patchValue({ N1znr: null });
          }
        });
      }
      const frequencyData = this.addministrationService.frequencyList.find(d => d.CycleKey == data);
      if (frequencyData && frequencyData.N1id && (frequencyData.N1id == "STAT")) {
        this.drugArray.controls[index].patchValue({ Pdur: 1, Pduru: "DOS", Priority: "020" });
      }else if (frequencyData && frequencyData.N1id && frequencyData.N1id == "ONCE") {
        this.drugArray.controls[index].patchValue({ Pdur: 1, Pduru: "DOS", Priority: "010" });
      } else if (frequencyData && frequencyData.N1id && (frequencyData.N1id == "DEFTIM" || frequencyData.N1id == "DAILY")) {
        const defineDoses = this.drugArray.value[index].Dosdef ? this.drugArray.value[index].Dosdef.split(" ") : [];
        if (defineDoses && defineDoses.length) {
          let deftimDcycleData = [];
          defineDoses.forEach((element) => {
            const quanUnitDescription = element.split("(")[0];
            const defineTime = element.match(/\(([^)]+)\)/)[1];
            deftimDcycleData.push({ deftimDose: quanUnitDescription, deftimDosageUnit: this.drugArray.value[index].Quanunit, deftimTime: new Date(`${formatDate(new Date(), "YYYY-MM-DD")}T${defineTime}`) });
            this.drugArray.controls[index].get('deftimcycleData').setValue(deftimDcycleData)
          });
          deftimDcycleData = [];
        } else {
          this.drugArray.controls[index].get('deftimcycleData').setValue([{ deftimDose: this.drugArray.value[index].Quan, deftimDosageUnit: this.drugArray.value[index].Quanunit, deftimTime: new Date(`${formatDate(new Date(), "YYYY-MM-DD")}T08:00`) }]);
        }
        const selectedData = [];
        if (!this.drugArray.controls[index].get('deftimcycleData').value.find(d => formatDate(d.deftimTime, "HH:mm") === "08:00")) {
          selectedData.push("0(08:00)")
        }
        this.drugArray.controls[index].get('deftimcycleData').value.forEach(element => {
          selectedData.push(`${element.deftimDose}(${formatDate(element.deftimTime, "HH:mm")})`)
        });
        this.drugArray.controls[index].patchValue({ IsFrequencyDeftim: true, Dosdef: selectedData.join("-") });
      } else {
        this.drugArray.controls[index].patchValue({ Priority: "010", IsFrequencyDeftim: false });
      }
      this.validFromTobaseonDuration(index, this.drugArray.controls[index].value);
    } else {
      this.drugArray.controls[index].patchValue({ Priority: "010", IsFrequencyDeftim: false, IsmoDetails: false });
    }
  }

  onOpenFrequencySet(index: number) {
    if (this.drugArray.controls[index].get('deftimcycleData').value && this.drugArray.controls[index].get('deftimcycleData').value.length) {
      this.drugArray.controls[index].patchValue({ IsFrequencyDeftim: true, IsmoDetails: false });
    }
  }

  validFromTobaseonDuration(index: number, data: any) {
    let getMonth = data.StartD.getMonth();
    let getFullYear = data.StartD.getFullYear();
    let getDate = data.StartD.getDate();
    let getMinutes = data.StartD.getMinutes();
    let getSeconds = data.StartD.getSeconds();
    let getHours = data.StartD.getHours();
    if (data.StartD) {
      if (`${data.Pdur}` === "0") {
        this.drugArray.controls[index].patchValue({ EndD: null });
      }
      if (data.Pduru === "MON" && `${data.Pdur}` !== "0") {
        this.drugArray.controls[index].patchValue({
          EndD: new Date(getFullYear, (getMonth + (+(data.Pdur))), getDate, getHours, getMinutes, getSeconds)
        });
      }
      if (data.Pduru === "TAG" && `${data.Pdur}` !== "0") {
        this.drugArray.controls[index].patchValue({
          EndD: new Date(getFullYear, getMonth, (getDate + (+(data.Pdur))), getHours, getMinutes, getSeconds)
        });
      }

      if (data.Pduru === "MIN" && `${data.Pdur}` !== "0") {
        this.drugArray.controls[index].patchValue({
          EndD: new Date(getFullYear, getMonth, getDate, getHours, (getMinutes + (+(data.Pdur))), getSeconds)
        });
      }

      if (data.Pduru === "STD" && `${data.Pdur}` !== "0") {
        this.drugArray.controls[index].patchValue({
          EndD: new Date(getFullYear, getMonth, getDate, (getHours + (+(data.Pdur))), getMinutes, getSeconds),
        });
      }

      if (data.Pduru === "S" && `${data.Pdur}` !== "0") {
        this.drugArray.controls[index].patchValue({
          EndD: new Date(getFullYear, getMonth, getDate, getHours, getMinutes, (getSeconds + (+(data.Pdur)))),
        });
      }

      if (data.Pduru === "WCH" && `${data.Pdur}` !== "0") {
        this.drugArray.controls[index].patchValue({
          EndD: new Date(getFullYear, getMonth, (getDate + (+(data.Pdur) * 7)), getHours, getMinutes, getSeconds)
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

  onOpenInfoPopup(data: any, index: number) {
    this.additionalPopup.showPopup(data.get('Descr').value, index);
  }

  onUpdatedAdditionalInfo(event: any) {
    this.drugArray.controls[event.index].patchValue({ Descr: event.data })
  }

  cancelFormData() {
    this.drugArray.controls = [];
    // this.generateDefaultForm()
  }

  parseDate(date: any) {
    if (date !== null) {
      return `${new DatePipe('en-US').transform(date, "yyyy-MM-dd")}T${formatDate(date, "HH:mm:ss")}`;
    }
    return null;
  }

  parseDatedata(date: any) {
    if (date !== null) {
      return `${new DatePipe('en-US').transform(date, "yyyy-MM-dd")}`;
    }
    return null;
  }


  parseTime(date) {
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
  parseTimedata(date) {
    const newDate = `${new DatePipe('en-US').transform(date, "HH:mm:ss")}`
    if (newDate) {
      const strArr: string[] = newDate.split(':');
      if (
        newDate &&
        newDate.length === 8
      ) {
        return `T${strArr[0]}:${strArr[1]}:${strArr[2]}`;
      }
    }
    return null;
  }

  parseComplexTime(time: string) {
    if (time !== null) {
      const strArr: string[] = time.split('');
      if (
        time &&
        time.length === 8 &&
        !isNaN(+(strArr[0] + strArr[1])) &&
        !isNaN(+(strArr[3] + strArr[4])) &&
        !isNaN(+(strArr[6] + strArr[7]))
      ) {
        return `PT${strArr[0]}${strArr[1]}H${strArr[3]}${strArr[4]}M${strArr[6]}${strArr[7]}S`;
      }
    }
    return null;
  }

  parsePtTime(data: string) {
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

  onChangePom(index: number, event: any) {
    this.drugArray.controls[index].patchValue({ Pom: event.target.value })
  }

  ngOnDestroy(): void {
    if (this.modetailsFormSubscription) { this.modetailsFormSubscription.unsubscribe(); }
    if (this.subscription) { this.subscription.unsubscribe(); }
    if (this.SelectMedicinesubscription) { this.SelectMedicinesubscription.unsubscribe() }
  }

}


