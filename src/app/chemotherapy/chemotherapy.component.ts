import { DatePipe } from '@angular/common';
import { Component, ElementRef, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AdmissionService } from '@services/admission/admission.service';
import { ChemotherapyService } from '@services/chemotherapy.service';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subject, Subscription } from 'rxjs';
import swal from 'sweetalert2';
import { ChemoPanelComponent } from './chemo-panel/chemo-panel.component';
import { HistoryDiagnosisComponent } from './history-diagnosis/history-diagnosis.component';
import { ClinicWebCamComponent } from './web-cam/web-cam.component';
@Component({
  selector: 'chemotherapy',
  templateUrl: './chemotherapy.component.html',
  styleUrls: ['./chemotherapy.component.scss']
})
export class ChemotherapyComponent {
  Swal: any;
  constructor(private sanitizer: DomSanitizer, private fb: FormBuilder, public modalService: BsModalService, private _admissionService: AdmissionService, public chemotherapyService: ChemotherapyService, public addministrationService: AddministrationService, public ePrescriptionService: EPrescriptionService) { }
  @ViewChild(ChemoPanelComponent) ChemoPanelData: ChemoPanelComponent;
  @ViewChild('webCam') webCam: ClinicWebCamComponent;
  @ViewChild('historydiagnosis') historydiagnosis: HistoryDiagnosisComponent;
  Protocolsform: FormGroup = new FormGroup({ ProtocolsProposed: new FormArray([]) });
  labdetailsform: FormGroup;
  public chemoDiagnosis: FormGroup = new FormGroup({ chemoData: new FormArray([]) });
  public labdetails: any;
  public ProtocolList: any;
  public DiagnosisList: any;
  public CreateEventdata: any;
  public prechemohyreset: any;
  public chemobiologicreset: any
  public Protocalsubscription: Subscription;
  public previousCycle: Subscription;
  public selectDiagnosisList: any[] = [];
  public modalRefForSaveDiagnosis: BsModalRef;
  public CreateEvent: any;
  public ProtoCodeData: any;
  public seachImportDiagnosis: string;
  public diagnosisImportList: any[];
  public PreviousEvent: any;
  public dichargereset: any;
  public hydrationreset: any;
  public dichargeEvent: any;
  public previousCyclenumber: any[];
  prevalidDataEvent: any;
  prechemohyEvent: any;
  chemobiologic: any;
  hydrationEvent: any;
  hyrationdDataEvent: any;
  selectedCycle: any = [];
  startdata: any;
  ChemoHistory: any;
  ChemoHistorylength: any;
  tocycle: any;
  pdfSrc: any;
  docTypeData: any;
  isExpanded = {
    Discharge: false,
    PostChemo: false,
    Chemotherapeutic: false,
    PreChemo: false,
    PreMedications: false,
  }
  selectedProtocol: string = '';
  isCycle = false;
  isFormSubmitted = false;
  public searchTerm = new Subject<string | null>();
  public searchTypeOnKeyEnter: string;
  selectedFile: File | null = null;
  documentUrl: SafeResourceUrl | null = null;
  isSelectProposedProtocol: FormControl = new FormControl("")
  @ViewChild('protocolInput') protocolInput: ElementRef;
  @ViewChild('protocolSelect') protocolSelect: ElementRef;
  ngOnInit() {
    this.subscribeSearchEvent();
    this.chemoarrer.push(this.chemotherapyDiagnosis());
    this.labdetailsResult();
    this.RecentLabdetails();
    this.HeightWeightBody();
    this.diagnosisFavoriteDetails();
    this.ChemoHistoryevnt();
    
    this.Protocalsubscription = this.chemotherapyService.ProtocalType.subscribe((resp: any) => {
      if (resp && resp.data) {
        if (resp.data.TOCHEMO && resp.data.TOCHEMO.results && resp.data.TOCHEMO.results.length) {
          this.isExpanded.Chemotherapeutic = true;
        }
        if (resp.data.TOCHEMODISCH && resp.data.TOCHEMODISCH.results && resp.data.TOCHEMODISCH.results.length) {
          this.isExpanded.Discharge = true;
        }
        if (resp.data.TOCHEMOPREMED && resp.data.TOCHEMODISCH.results && resp.data.TOCHEMOPREMED.results.length) {
          this.isExpanded.PreMedications = true;
        }
        if (resp.data.TOPOSTHDY && resp.data.TOPOSTHDY.results && resp.data.TOPOSTHDY.results.length) {
          this.isExpanded.PostChemo = true;
        }
        if (resp.data.TOPREHDY && resp.data.TOPREHDY.results && resp.data.TOPREHDY.results.length) {
          this.isExpanded.PreChemo = true;
        }
      }
      // this.ePrescriptionService.loadData(`e-prescription/ProtoHeadersearched?ProtoDesc=${resp.ProtoDesc}`, false, false, false, false).subscribe((resp: any) => {
      //   if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
      //     this.chemoarrer.controls[0].patchValue({
      //       monitParam: resp.body.d.results[0].MonitParam.toLowerCase(),
      //       Notes: resp.body.d.results[0].Notes.toLowerCase(),
      //       Comments: resp.body.d.results[0].Comments.toLowerCase(),
      //       ProtoId: resp.body.d.results[0].ProtoId,
      //     });
      //   }
      // });
      if (resp.data && resp.data.TOCYCLE && resp.data.TOCYCLE.results && resp.data.TOCYCLE.results.length) {
        this.tocycle = resp.data.TOCYCLE.results.slice().reverse();
        this.cyclenumberNxtProtoId(resp.data);
      }
      const filesdata = resp.data.TOCYCLE.results.find(d => d.CycleId == resp.CycleId).CycleId;
      this.chemoarrer.controls[0].patchValue({
        CycleId : filesdata,
      })
      
    });

    this.Protocalsubscription = this.chemoarrer.valueChanges.subscribe((data) => {
      this.isFormSubmitted = true;
      this.startdata = data;
    });
    this.chemotherapyService.chemotherapyForm = this.fb.group({
      doseReductionOption: 'no',
      percentage: '0',
    });

    this.previousCycle = this.chemotherapyService.previousCycle.subscribe((res) => {
      if (res) {
        this.ChemoHistoryevnt();
      }
    });
  }

  nodoseReduction(event) {
    if (event.target.value === 'no') {
      this.chemotherapyService.chemotherapyForm.patchValue({
        percentage: '0',
      });
    }
  }

  removeLeadingZeros(cycleId: string): string { return cycleId.replace(/^0+/, '') }

  opendocumentPdf(template: TemplateRef<any>, item: any) {
    if (item.AttachmentDataStr) {
      const blob = new Blob([new Uint8Array(Array.from(item.AttachmentDataStr)[''])], { type: item.Mimetype });
      this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
      const config: ModalOptions = { class: 'document' };
      this.modalService.show(template, config);
    }
  }

  valuechange(event) {
    this.chemotherapyService.mySubject.next(event);
  }

  selectProtocol(protocol: any): void {
    this.selectedProtocol = protocol.ProtoDesc;
  }

  openAttachDocument(template: TemplateRef<any>, docType) {
    this.docTypeData = docType;
    this.chemotherapyService.AttachDocumentData();
    const config: ModalOptions = { class: 'Attachpopup' };
    this.modalService.show(template, config);
  }

  onFileSelected(event: any, template: TemplateRef<any>): void {
    this.selectedFile = event.target.files[0];
    this.documentUrlopen(template);
    this.uploadDocument();
  }

  uploadDocument() {
    if (this.selectedFile) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        this.documentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          ((e.target as FileReader).result as string)
        );
        this.DocAttachpost(this.selectedFile, e.target.result)
      };
      fileReader.readAsDataURL(this.selectedFile);
    }
  }

  documentUrlopen(template) {
    const config: ModalOptions = { class: 'document' };
    this.modalService.show(template, config);
  }

  DocAttachpost(data: any, pdfurl) {
    if (data) {
      let AttachData = this.ePrescriptionService.loadParameters(true, true, false, true);
      AttachData['Dockey'] = '';
      AttachData['Orgdo'] = this.addministrationService.medicationAdministrative.OrderingDept;
      AttachData['AttendPhy'] = this.addministrationService.medicationAdministrative.EmpResp
      AttachData['Dtid'] = 'ZMED_ATCHM';
      AttachData['DocType'] = this.docTypeData;
      AttachData['FileName'] = data.name;
      AttachData['Mimetype'] = data.type;
      AttachData['AttachmentDataStr'] = pdfurl;
      this.ePrescriptionService.postData('e-prescription/postDocAttach', AttachData).subscribe((res: any) => {
        this.chemotherapyService.AttachDocumentData();
      });
    }
  }

  onSearchChange(event) {
    this.seachImportDiagnosis = event.target.value;
  }

  diagnosisFavoriteDetails() {
    this._admissionService.getDiagnosisFavoriteSetDataSet(this.chemotherapyService.parameters.patnr);
    this._admissionService.diagnosisFavoriteData$.subscribe((data: any[]) => {
      this.diagnosisImportList = data;
    });
  }

  selectDiagnosisData(diagnosis: any, index?: number) {
    for (let i = 0; i < this.chemoarrer.length; i++) {
      this.getProtocolsWithDiagnosis(diagnosis);
      this.chemoarrer.controls[0].get('Description').reset();
      this.chemoarrer.controls[i].patchValue({
        Description: diagnosis.DiagShorttext,
      });
    }
    this.modalRefForSaveDiagnosis.hide()
  }

  RecentLabdetails() {
    this.ePrescriptionService.loadData(`e-prescription/RecentLabResults?Patnr=${this.chemotherapyService.parameters.patnr}`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        this.labdetails = resp.body.d.results[0]
        this.labdetailsform.patchValue({
          Wbc: this.labdetails.Wbc,
          Serum: this.labdetails.Serum,
          Hemoglobin: this.labdetails.Hemoglobin,
          Alt: this.labdetails.Alt,
          Platelets: this.labdetails.Platelets,
          Ast: this.labdetails.Ast,
          BilirubinTotal: this.labdetails.BilirubinTotal,
          Anc: this.labdetails.Anc,
          AncUnit: this.labdetails.AncUnit,
          BilirubinDirect: this.labdetails.BilirubinDirect,
        })
      }
    });
  }

  labdetailsResult() {
    this.labdetailsform = new FormGroup({
      Patnr: new FormControl(''),
      Einri: new FormControl(''),
      Falnr: new FormControl(''),
      Lfdnr: new FormControl(''),
      Wbc: new FormControl(''),
      WbcUnit: new FormControl(''),
      Anc: new FormControl(''),
      AncUnit: new FormControl(''),
      Hemoglobin: new FormControl(''),
      HemoglobinUnit: new FormControl(''),
      Platelets: new FormControl(''),
      PlateletsUnit: new FormControl(''),
      Serum: new FormControl(''),
      SerumUnit: new FormControl(''),
      BilirubinTotal: new FormControl(''),
      BilirubinTotalUnit: new FormControl(''),
      BilirubinDirect: new FormControl(''),
      BilirubinDirectUnit: new FormControl(''),
      Alt: new FormControl(''),
      AltUnit: new FormControl(''),
      Ast: new FormControl(''),
      AstUnit: new FormControl(''),
    })
  }

  get chemoarrer() { return this.chemoDiagnosis.get('chemoData') as FormArray; }

  chemotherapyDiagnosis() {
    return new FormGroup({
      Description: new FormControl('', Validators.required),
      name: new FormControl(''),
      Height: new FormControl(''),
      Weight: new FormControl(''),
      WUnit: new FormControl(''),
      HUnit: new FormControl(''),
      Bsa: new FormControl(''),
      StartDate: new FormControl(new Date()),
      StartTime: new FormControl(new Date()),
      Comments: new FormControl(''),
      Notes: new FormControl(''),
      Protocol: new FormControl(''),
      ProtoCode: new FormControl('', Validators.required),
      monitParam: new FormControl(''),
      ProtoId: new FormControl(''),
      PreviousCycle: new FormControl(''),
      CycleId: new FormControl('', Validators.required),
      ProtoColsDesc: new FormControl(''),
      PreviousDesc: new FormControl('')
    })
  }

  get ProtocolsArray() { return this.Protocolsform.get('ProtocolsProposed') as FormArray }

  ProtocolsData() {
    return new FormGroup({
      ProtoDesc: new FormControl(''),
      ProtoId: new FormControl(''),
      ProtoCode: new FormControl(''),
      Dkey: new FormControl(''),
    });
  }

  isSelectedData(data: any, index: number, item) {
    // if (this.ProtocolsArray.controls[index].value) {
    //   this.chemotherapyService.protocalDetails(data.value);
    // }
    if (item.get('Description').value == '') {
      swal.fire({
        title: 'Please enter the Diagnosis first',
        confirmButtonColor: '#0890c5',
        cancelButtonColor: '#84898c',
        confirmButtonText: 'OK',
        // customClass: 'myalertpopup',
        icon: 'error',
      } as any)
    } else {
      this.ePrescriptionService.loadData(`e-prescription/ProtoHeadersearched?ProtoDesc=${data.value?.ProtoDesc}`, false, false, false, false).subscribe((resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
          this.chemoarrer.controls[0].patchValue({
            monitParam: resp.body.d.results[0].MonitParam.toLowerCase(),
            Notes: resp.body.d.results[0].Notes.toLowerCase(),
            Comments: resp.body.d.results[0].Comments.toLowerCase(),
            ProtoId: resp.body.d.results[0].ProtoId,
          });
          this.chemotherapyService.protocalDetails(resp.body.d.results[0]);
        }
      });
    }
  }

  getProtocolsWithDiagnosis(data: any) {
    this.DiagnosisList = data.Dkey || data.DiagKey1;
    this.ePrescriptionService.loadData(`e-prescription/ProtoDiagnosis?Dtext1=${data.Dtext1 || data.DiagShorttext}`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        const protocolDescList = this.ProtocolsArray.value.map(d => d.ProtoDesc);
        resp.body.d.results.forEach((item: any) => {
          if (protocolDescList && protocolDescList.length) {
            const isAvailableExistProtoList = protocolDescList.find(d => d === item.ProtoDesc);
            if (!isAvailableExistProtoList) {
              this.ProtocolsArray.push(this.ProtocolsData());
              this.ProtocolsArray.controls[this.ProtocolsArray.value.length - 1].patchValue({
                ProtoDesc: item.ProtoDesc,
                ProtoId: item.ProtoId,
                ProtoCode: item.ProtoCode,
                Dkey: item.Dkey
              })
            }
          }
        });
      } else {
        this.ProtocolsArray.clear();
        this.ProtocolsArray.push(this.ProtocolsData());
        this.ProtocolsArray.controls[this.ProtocolsArray.value.length - 1].patchValue({
          ProtoDesc: this.selectedCycle.ProtoDesc,
          ProtoId: this.selectedCycle.ProtoId
        });
      }
    });
  }

  onPreviousCycleSelected(data) {
    this.selectedCycle = data;
    if (!this.isCycle) {
      this.ProtocolsArray.push(this.ProtocolsData());
      this.isCycle = true;
    }
    const updateProtocolsArray = (protoDesc, protoId) => {
      this.ProtocolsArray.controls[0].patchValue({
        ProtoDesc: protoDesc,
        ProtoId: protoId,
      })
    };
    if (data) {
      updateProtocolsArray(data.ProtoDesc, data.ProtoId);
    }
  }

  serachinput(term: string, item: any) {
    term = term.toLowerCase();
    return (item.ProtoDesc.toLowerCase().includes(term) || item.ProtoCode.toLowerCase().includes(term))
  }

  cyclenumberNxtProtoId(data) {
    this.ePrescriptionService.loadData(`e-prescription/PreviousCycle?Patnr=${this.chemotherapyService.parameters.patnr}&PrevProtoId=${data.ProtoId}`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        this.previousCyclenumber = resp.body.d.results;
        // const cycleData = data.find((d => d.CycleId));
        const nextProtoId = resp.body.d.results.find((d => d.NxtCycleId))
        this.chemoarrer.controls[0].patchValue({
          ProtoCode: nextProtoId,
          CycleId: nextProtoId.PrevCycleId !== nextProtoId.NxtCycleId ? nextProtoId.NxtCycleId : nextProtoId.PrevCycleId,
          ProtoColsDesc: nextProtoId.NxtProtoDesc
        });
      }
    });
  }

  historydiagnosispopover() {
    this.chemoarrer.controls.forEach((ele) => {
      this.historydiagnosis.showPopup(ele.value);
    })
  }

  serachInput(term: string, item: any) {
    term = term.toLowerCase();
    return (item.CycleDesc.toLowerCase().includes(term))
  }

  subscribeSearchEvent() { this.searchTerm.pipe().subscribe(term => { this.searchTypeOnKeyEnter = term; }) }

  HeightWeightBody() {
    this.chemotherapyService.HeightWeightBodySurface()
    this.chemoarrer.controls[0].patchValue({
      Weight: this.chemotherapyService.HeightWeightData.Weight,
      Height: this.chemotherapyService.HeightWeightData.Height,
      Bsa: this.chemotherapyService.HeightWeightData.Bsa,
      WUnit: this.chemotherapyService.HeightWeightData.WUnit,
      HUnit: this.chemotherapyService.HeightWeightData.HUnit
    });
  }

  ChemoHistoryevnt() {
    this.chemoarrer.controls[0].get('PreviousCycle').reset();
    this.ePrescriptionService.loadData(`e-prescription/ChemoHistory?Patnr=${this.chemotherapyService.parameters.patnr}`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        this.ChemoHistory = resp.body.d.results;
        this.ChemoHistorylength = resp.body.d.results.length;
        this.chemoarrer.controls[0].patchValue({
          PreviousCycle: resp.body.d.results.find(d => d.ProtoDesc),
          PreviousDesc: resp.body.d.results.find(d => d.ProtoDesc).ProtoDesc,
        })
        this.onPreviousCycleSelected(resp.body.d.results.find(d => d.ProtoDesc))
      }
    });
  }

  ProtoHeadersearcheddata(term, data?: any) {
    if (term) {
      term = term.toLowerCase();
      if (term.length === 3 || term.length >= 3) {
        term = term ? term.toUpperCase() : term;
        this.ePrescriptionService.loadData(`e-prescription/ProtoHeadersearched?ProtoDesc=${term}`, false, false, false, false).subscribe((resp: any) => {
          if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
            this.ProtocolList = resp.body.d.results;
              if (data) {
                const protocolData = this.ProtocolList.find(d => d.ProtoId == data['ProtoId']);
                if (protocolData) {
                   this.updateControls(protocolData);
                }
              }
          }else{
            this.loadProtocolCode(term);
          }
        });
      }
    }
  }

  updateControls(protocolData: any) {
    this.chemoarrer.controls[0].patchValue({
      monitParam: (protocolData.MonitParam || '').toLowerCase(),
      Notes: (protocolData.Notes || '').toLowerCase(),
      Comments: (protocolData.Comments || '').toLowerCase(),
      ProtoId: protocolData.ProtoId,
    });
  }

  loadProtocolCode(term: string , data?: any) {
    this.ePrescriptionService.loadData(`e-prescription/ProtoHeadersearchedCode?ProtoCode=${term}`, false, false, false, false)
      .subscribe((resp: any) => {
        this.ProtocolList = resp.body.d.results;
        if (data) {
          const protocolData = this.ProtocolList.find(d => d.ProtoId == data['ProtoId']);
          if (protocolData) {
             this.updateControls(protocolData);
          }
        }
      });
  }

  selecttaData(index) {
    this.chemotherapyService.ProtocolListdata = this.ProtocolList.find(d => d.ProtoDesc === this.chemoarrer.value[index].Protocol);
    if (this.chemotherapyService.ProtocolListdata) {
      this.chemoarrer.controls[index].patchValue({
        monitParam: this.chemotherapyService.ProtocolListdata.MonitParam.toLowerCase(),
        Notes: this.chemotherapyService.ProtocolListdata.Notes.toLowerCase(),
        Comments: this.chemotherapyService.ProtocolListdata.Comments.toLowerCase(),
        ProtoId: this.chemotherapyService.ProtocolListdata.ProtoId,
        ProtoCode: this.chemotherapyService.ProtocolListdata.ProtoCode,
      });
      this.chemotherapyService.protocalDetails(this.chemotherapyService.ProtocolListdata);
    }
  }

  openModalForSaveDiagnosis(template: TemplateRef<any>) {
    this.selectDiagnosisList = [];
    const config: ModalOptions = { class: 'modal-dialog-centered modal-diagnosis' };
    this.modalRefForSaveDiagnosis = this.modalService.show(template, config);
  }

  Createpanel(event) {
    if (event.type === 'premedications') {
      this.CreateEventdata = event;
      this.CreateEvent = event.controls.filter(d => d.valid);
    } else if (event.type === 'prechemohydration') {
      this.prechemohyreset = event;
      this.prechemohyEvent = event.controls.filter(d => d.valid);
    } else if (event.type === 'chemotherapypeutic') {
      this.chemobiologicreset = event;
      this.chemobiologic = event.controls.filter(d => d.valid);
    } else if (event.type === 'dichargeChemo') {
      this.dichargereset = event;
      this.dichargeEvent = event.controls.filter(d => d.valid);
    } else if (event.type === 'chemohydrationData') {
      this.hydrationreset = event;
      this.hydrationEvent = event.controls.filter(d => d.valid);
    }
  }

  CreateEventData() {
    this.isFormSubmitted = true;
    const tophyorder = [];
    const validData = [];
    const chemoform = this.chemoarrer.value[0];
    const chemoformvalidForms = this.chemoarrer.controls.filter(d => d.valid);
    // const Dkey = this.ProtocolsArray.value.find(d => d.ProtoId === chemoform.ProtoId);
    if (this.prechemohyEvent) {
      var prevalidDataEvent = this.prechemohyEvent.map(d => d.value);
      prevalidDataEvent.forEach((ele: any) => {
        ele['ProtoId'] = chemoform.ProtoId;
        ele['ProtoDesc'] = chemoform.ProtoColsDesc;
        ele['CycleId'] = chemoform.CycleId;
        ele['Type'] = '1'
        delete ele.isSelected;
        tophyorder.push(ele)
      });
    }

    if (this.hydrationEvent) {
      var hyrationdDataEvent = this.hydrationEvent.map(d => d.value);
      hyrationdDataEvent.forEach((ele: any) => {
        ele['ProtoId'] = chemoform.ProtoId;
        ele['ProtoDesc'] = chemoform.ProtoColsDesc;
        ele['CycleId'] = chemoform.CycleId;
        ele['Type'] = '2'
        delete ele.isSelected;
        tophyorder.push(ele)
      });
    }

    if (this.dichargeEvent) {
      var dichargeData = this.dichargeEvent.map(d => d.value);
      dichargeData.forEach((element: any) => {
        const frequencyData = this.addministrationService.frequencyList.find(d => d.CycleKey == element.N1ztxt);
        element.Quan = `${element.Quan}`;
        element.Pdur = `${element.Pdur}`;
        element.Prncond = element.Prn ? element.Prncond : "";
        element.Moresp1 = element.Moresp1 !== null ? element.Moresp1 : '';
        element.Stoid = element.Stoid !== null ? element.Stoid : '';
        element.Storn = element.Storn !== null ? false : false;
        element.Updmode = element.Updmode !== null ? false : false;
        element.Dosdef = element.Dosdef !== null ? element.Dosdef : '';
        element.N1ztxt = frequencyData && frequencyData.Text ? frequencyData.Text : element.N1ztxt != "" ? element.N1ztxt : "";
        element.N1znr = frequencyData && frequencyData.CycleKey ? frequencyData.CycleKey : element.N1znr != "" ? element.N1znr : "";
        element.StartT = this.parseTime(element.StartD);
        element.StartD = `${this.parseDatedata(element.StartD)}${this.parseTimedata(element.StartD)}`;
        element.EndT = this.parseTime(element.EndD);
        element.EndD = element.EndD !== null ? `${this.parseDatedata(element.EndD)}${this.parseTimedata(element.EndD)}` : null;
        element['Type'] = '2';
        element['MotypId'] = '30';
        element.ProtoId = chemoform.ProtoId;
        element.ProtoDesc = chemoform.ProtoColsDesc;
        element.CycleId = chemoform.CycleId;
        delete element.IsPatientMedication;
        delete element.AgentidResult;
        delete element.deftimcycleData;
        delete element.IsFrequencyDeftim;
        delete element.Resppersname;
        delete element.Result_Drug_Name;
        delete element.Storntxt;
        delete element.Lfdnr
        delete element.Statustext,
          delete element.BlockChanges,
          delete element.Canceldby_Name,
          delete element.Favourite,
          validData.push(element);
      });
    }

    if (this.chemobiologic) {
      var Chemotherapy = this.chemobiologic.map(d => d.value);
      Chemotherapy.forEach((element: any) => {
        element.Quan = `${element.Quan}`;
        element.Pdur = element.Pdur === null || element.Pdur === '' ? "0" : `${element.Pdur}`;
        element.Pduru = element.Pduru !== null ? element.Pduru : "";
        element.Prncond = element.Prn ? element.Prncond : "";
        element.StartT = this.parseTime(element.StartD);
        element.StartD = `${this.parseDatedata(element.StartD)}${this.parseTimedata(element.StartD)}`;
        element.EndT = this.parseTime(element.EndD);
        element.EndD = element.EndD !== null ? `${this.parseDatedata(element.EndD)}${this.parseTimedata(element.EndD)}` : null;
        element.Complex = element.Complex ? "X" : "";
        element.AddDose = element.AddDose ? "X" : "";
        element.Prn = element.Prn;
        element.Moresp1 = this.addministrationService.medicationAdministrative.EmpResp;
        element.Orgfa = this.addministrationService.medicationAdministrative.OrderingDept,
          element.Orgpf = this.addministrationService.medicationAdministrative.OrderingTo,
          element.Dosdef = element.deftimcycleData && element.deftimcycleData.length ? element.Dosdef : "";
        element.Pom = element.Pom !== null ? element.Pom : "";
        element.ProtoId = chemoform.ProtoId;
        element.ProtoDesc = chemoform.ProtoColsDesc;
        // element.  = '20';
        element.CycleId = chemoform.CycleId;
        element.ChemoOrd = '';
        element.Type = "3",
          element.Descr = element.Descr;
        element.TOCOMPLEX = element.TOCOMPLEX != null ? element.TOCOMPLEX : [];
        element.Pdur = element.Pdur === null || element.Pdur === '' ? "0" : `${element.Pdur}`;
        delete element.Routedescr;
        delete element.Formatdescr;
        delete element.Result_Drug_Name;
        delete element.IsmoDetails;
        delete element.TOEVENTDATA;
        delete element.IsFrequencyDeftim;
        delete element.deftimcycleData;
        delete element.AgentidResult;
        delete element.Lfdnr;
        delete element.Updmode
        delete element.Orgfa
        delete element.Orgpf
        // delete element.Descr
        delete element.Perunit
        validData.push(element);
      });
    }

    if (this.CreateEvent) {
      var premedicaionsvalidData = this.CreateEvent.map(d => d.value);
      premedicaionsvalidData.forEach((element: any) => {
        element.Quan = `${element.Quan}`;
        element.Pdur = element.Pdur === null || element.Pdur === '' ? "0" : `${element.Pdur}`;
        element.Pduru = element.Pduru !== null ? element.Pduru : "";
        element.Prncond = element.Prn ? element.Prncond : "";
        element.StartT = this.parseTime(element.StartD);
        element.StartD = `${this.parseDatedata(element.StartD)}${this.parseTimedata(element.StartD)}`;
        element.EndT = this.parseTime(element.EndD);
        element.EndD = element.EndD !== null ? `${this.parseDatedata(element.EndD)}${this.parseTimedata(element.EndD)}` : null;
        element.Complex = element.Complex ? "X" : "";
        element.AddDose = element.AddDose ? "X" : "";
        element.Prn && element.Prncond === "" ? this.showErrorPopup("", "PRN There should be an error that says", "Error") : null;
        element.Moresp1 = this.addministrationService.medicationAdministrative.EmpResp;
        element.Orgfa = this.addministrationService.medicationAdministrative.OrderingDept,
          element.Orgpf = this.addministrationService.medicationAdministrative.OrderingTo,
          element.Dosdef = element.deftimcycleData && element.deftimcycleData.length ? element.Dosdef : "";
        element.Pom = element.Pom !== null ? element.Pom : "";
        element.ProtoId = chemoform.ProtoId;
        element.ProtoDesc = chemoform.ProtoColsDesc;
        element.MotypId = '20';
        element.CycleId = chemoform.CycleId;
        element.ChemoOrd = '';
        element.Type = "1",
          element.TOCOMPLEX = element.TOCOMPLEX != null ? element.TOCOMPLEX : [];
        element.Pdur = element.Pdur === null || element.Pdur === '' ? "0" : `${element.Pdur}`;
        delete element.Routedescr;
        delete element.Formatdescr;
        delete element.Result_Drug_Name;
        delete element.IsmoDetails;
        delete element.TOEVENTDATA;
        delete element.IsFrequencyDeftim;
        delete element.deftimcycleData;
        delete element.AgentidResult;
        delete element.Lfdnr;
        delete element.Updmode
        delete element.Orgfa
        delete element.Orgpf
        delete element.Descr
        validData.push(element);
      });
    }
    if (chemoformvalidForms && chemoformvalidForms.length) {
      if (validData && validData.length || tophyorder && tophyorder.length) {
        const cycleId = this.chemoarrer.controls[0].value.CycleId;
        let postObject = this.ePrescriptionService.loadParameters(true, true, true, true);
        postObject['Gpart'] = this.addministrationService.medicationAdministrative.EmpResp,
          postObject['Height'] = chemoform.Height,
          postObject['Weight'] = chemoform.Weight,
          postObject['Bsa'] = chemoform.Bsa,
          postObject['StartDate'] = `${this.parseDatedata(chemoform.StartDate)}${this.parseTimedata(chemoform.StartDate)}`,
          postObject['StartTime'] = this.parseTime(chemoform.StartTime),
          postObject['ChemoDoc'] = "",
          postObject['LabDoc'] = "",
          postObject['MonitParam'] = chemoform.monitParam,
          postObject['Notes'] = chemoform.Notes,
          postObject['Dkey'] = this.DiagnosisList,
          postObject['Reduction'] = this.chemotherapyService.chemotherapyForm.get('doseReductionOption').value === 'yes' ? true : false,
          postObject['ReductionValue'] = this.chemotherapyService.chemotherapyForm.get('percentage').value,
          postObject['Comments'] = chemoform.Comments,
          postObject['TOMEDORDER'] = validData.map((row) => { return { ...row, CycleId: cycleId } });
        postObject['TOPHYORDER'] = tophyorder.map((row) => { return { ...row, CycleId: cycleId } });
        this.ePrescriptionService.postData('e-prescription/ChemoOrder', postObject).subscribe((res: any) => {
          swal.fire({
            title: 'Your Order is Created',
            confirmButtonColor: '#0890c5',
            cancelButtonColor: '#84898c',
            confirmButtonText: 'OK',
            // customClass: 'myalertpopup',
            icon: 'success'
          } as any).then(() => {
            this.CreateEventdata.reset();
            for (let i = 0; i < this.CreateEventdata.controls.length; i++) {
              this.CreateEventdata.controls[i].patchValue({
                StartD: new Date(),
              });
            };
            this.prechemohyreset.reset();
            this.chemobiologicreset.reset();
            this.hydrationreset.reset();
            this.dichargereset.reset();
            this.chemoarrer.controls[0].patchValue({
              Notes: '',
              monitParam: '',
              Comments: '',
              Protocol: '',
              Description: '',
              ProtoCode: '',
              CycleIdf: '',
              CycleId: '',
            });
            this.isSelectProposedProtocol.reset();
            this.ProtocolsArray.reset();
             this.ProtocolsArray.push(this.ProtocolsData());
            this.ProtocolsArray.controls[0].patchValue({
              ProtoDesc:  this.selectedCycle.ProtoDesc,
              ProtoId:  this.selectedCycle.ProtoId,
            })
          });
        },
          (error) => {
            this.showErrorPopup("", error.error.error.message.value, "Error")
          });
      } else {
        return
      }
    }
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
      // customClass: 'myalertpopup',
      icon: 'error'
    } as any);
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

  CancelOrder() {
    this.CreateEventdata.reset();
    for (let i = 0; i < this.CreateEventdata.controls.length; i++) {
      this.CreateEventdata.controls[i].patchValue({
        StartD: new Date(),
      });
    };
    this.prechemohyreset.reset();
    this.chemobiologicreset.reset();
    this.hydrationreset.reset();
    this.dichargereset.reset();
    this.ProtocolsArray.clear();
    this.ProtocolsArray.push(this.ProtocolsData());
    this.ProtocolsArray.controls[this.ProtocolsArray.value.length - 1].patchValue({
      ProtoDesc: this.selectedCycle.ProtoDesc,
      ProtoId: this.selectedCycle.ProtoId
    })
    this.chemoarrer.controls[0].patchValue({
      Notes: '',
      monitParam: '',
      Comments: '',
      Protocol: '',
      Description: '',
      ProtoCode: '',
    })

    this.chemotherapyService.chemotherapyForm = this.fb.group({
      doseReductionOption: 'no',
      percentage: '0',
    });
  }

  ngOnDestroy(): void {
    if (this.Protocalsubscription) { this.Protocalsubscription.unsubscribe(); }
    if (this.previousCycle) { this.previousCycle.unsubscribe(); }
  }

  OrderDateFormate(date: string) {
    const timestamp = parseInt(date.match(/\d+/)[0], 10);
    const orderDate = new Date(timestamp);
    const year = orderDate.getFullYear() % 100;
    const month = orderDate.getMonth() + 1;
    const day = orderDate.getDate();

    const formattedDate = `${day}.${month}.${year}`;
    return formattedDate;
  }
}
