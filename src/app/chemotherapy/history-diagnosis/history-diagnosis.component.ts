import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit ,Output,TemplateRef, ViewChild} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ChemotherapyService } from '@services/chemotherapy.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import swal from 'sweetalert2';
import { ChemotherapyComponent } from '../chemotherapy.component';
@Component({
  selector: 'history-diagnosis',
  templateUrl: './history-diagnosis.component.html',
  styleUrls: ['./history-diagnosis.component.scss']
})
export class HistoryDiagnosisComponent implements OnInit {
  filteredProtocolIdList: any[] = [];
  constructor(private modalService: BsModalService,private fb: FormBuilder,private ePrescriptionService: EPrescriptionService,public storageService: StorageService,public chemotherapyService: ChemotherapyService) {}
  @ViewChild('historyPopup',{static:true}) historyPopup! :TemplateRef<any>;
  @ViewChild('ChemotherapyComponent') Chemotherapy: ChemotherapyComponent;
  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();
  public modetailsFormSubscription: any;
  private modalRef!: BsModalRef;
  public historyform: FormGroup;
  public updateAllergyForm:FormGroup;
  public newDataRow:any;
  public ChemoHistory:any;
  public isFormSubmitted: boolean = false;
  public ChemoHistorylength:any;
  public protocolIdlist: any;
  public cyclenumbar:any;
  sortColumn: string = 'ProtoDesc';
  sortOrder: string = 'asc';
  sortDir = 1;
  sortable = true;
  public searchTypeOnKeyEnter: string;
  ngOnInit(): void {
    this.historyform = new FormGroup({ historyformarray: new FormArray([]) });
    this.ChemoHistoryData();
    this.updatehistoryData();
    this.modetailsFormSubscription = this.updateAllergyForm.valueChanges.subscribe(() => {this.isFormSubmitted = true});
  }
  removeLeadingZeros(cycleId: string): string {return cycleId.replace(/^0+/, '')}

  get historyArray() { return this.historyform.get('historyformarray') as FormArray;}

  updatehistoryData(){
    this.updateAllergyForm = new FormGroup({
        Patnr :new FormControl(''),
        ProtoId :new FormControl(''),
        ProtoDesc :new FormControl(''),
        CycleId :new FormControl(''),
        OrderDate :new FormControl(''),
        MonitParam :new FormControl('') ,
        Notes :new FormControl(''),
        Erdat :new FormControl(new Date()),
        Erusr :new FormControl(''),
        Manual :new FormControl(false),
        Comments:new FormControl('')
    });
  };

  historyformdata() {
    return new FormGroup({
      Patnr :new FormControl(''),
      ProtoId :new FormControl(''),
      ProtoDesc :new FormControl(''),
      CycleId :new FormControl(''),
      OrderDate :new FormControl(''),
      MonitParam :new FormControl('') ,
      Notes :new FormControl(''),
      Erdat :new FormControl(''),
      Erusr :new FormControl(''),
      Manual :new FormControl(false),
      Comments:new FormControl('')
    });
  };

  showPopup(data:any){
    this.updateAllergyForm.patchValue({
      Patnr :'',
      ProtoId :'',
      ProtoDesc :'',
      CycleId :'',
      OrderDate :'',
      MonitParam :'',
      Notes :'',
      Manual :'',
      Comments:''
    });
    this.modalRef = this.modalService.show(this.historyPopup, { backdrop: true, ignoreBackdropClick: false, class: 'template-med template-med-data' });
    const qaUserProfile = JSON.parse(localStorage.getItem('amc_qa_loggedInUserProfile'));
    const devUserProfile = JSON.parse(localStorage.getItem('amc_dev_loggedInUserProfile'));
    const username =(devUserProfile && devUserProfile.UserName) || (qaUserProfile && qaUserProfile.UserName);
    if (username) {
      this.updateAllergyForm.patchValue({
        Erusr: username,
      });
    }
    this.protocolListId();
  }
  savePopup() {
    const addDatahistory = this.updateAllergyForm.value;
    const touched = this.updateAllergyForm.touched;
    const validForms = this.updateAllergyForm.valid;
    this.isFormSubmitted = true;
    if(validForms){
      this.newDataRow = this.fb.group({
        Patnr:this.chemotherapyService.parameters.patnr,
        ProtoId: addDatahistory.ProtoId,
        ProtoDesc: addDatahistory.ProtoDesc,
        CycleId: addDatahistory.CycleId,
        MonitParam: addDatahistory.MonitParam,
        Notes: addDatahistory.Notes,
        Erdat:addDatahistory.Erdat.toISOString().slice(0, -5),
        Erusr: addDatahistory.Erusr,
        OrderDate:addDatahistory.OrderDate.toISOString().slice(0, -5),
        Manual: false
      });
    }
    this.ePrescriptionService.postData('e-prescription/ChemoHistorypost', this.newDataRow.value).subscribe((res: any) => {
        swal.fire({
          title: 'Your update is added.',
          confirmButtonColor: '#0890c5',
          cancelButtonColor: '#84898c',
          confirmButtonText: 'OK',
          customClass: 'myalertpopup',
          icon: 'success'
        }).then(() => {
         this.updateAllergyForm.patchValue({
          Patnr :'',
          ProtoId :'',
          ProtoDesc :'',
          CycleId :'',
          OrderDate :'',
          MonitParam :'',
          Notes :'',
          Manual :'',
          Comments:''
        });
         this.ChemoHistoryData();
         this.chemotherapyService.previousCycle.next(true);
        })
      },
      (error) => {
        this.showErrorPopup("", error.error.error.message.value, "Error")
      });
  }

  SortData(col: string): void {
    if (this.sortColumn == col) {
      if (this.sortOrder == 'asc')
        this.sortOrder = 'desc';
      else
        this.sortOrder = 'asc';
    }
    else {
      this.sortColumn = col;
      this.sortOrder = 'asc';
    }
    this.ChemoHistory = this.ChemoHistory.sort((a, b) => {
      if (a[col] < b[col])
        return this.sortOrder == 'asc' ? -1 : 1;
      if (a[col] > b[col])
        return this.sortOrder == 'asc' ? 1 : -1;
      return 0;
    })
  }

  ChemoHistoryData(){
    this.historyArray.controls = []
    this.ePrescriptionService.loadData(`e-prescription/ChemoHistory?Patnr=${this.chemotherapyService.parameters.patnr}`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        this.ChemoHistory = resp.body.d.results;
        this.ChemoHistorylength = resp.body.d.results.length;
        for(let i = 0; i < this.ChemoHistory.length; i++){
          this.historyArray.push(this.historyformdata())
          this.historyArray.controls[i].patchValue({
            Patnr:this.ChemoHistory[i].Patnr,
            ProtoId: this.ChemoHistory[i].ProtoId,
            ProtoDesc: this.ChemoHistory[i].ProtoDesc,
            CycleId: this.removeLeadingZeros(this.ChemoHistory[i].CycleId),
            MonitParam: this.ChemoHistory[i].MonitParam,
            Notes: this.ChemoHistory[i].Notes,
            Erdat: new Date(new DatePipe('en-US').transform(
              this.ChemoHistory[i].Erdat.replace('/Date(', '').replace(')/', ''),
              'yyyy-MM-dd'
            )),
            Erusr: this.ChemoHistory[i].Erusr,
            OrderDate:  new Date(new DatePipe('en-US').transform(
              this.ChemoHistory[i].OrderDate.replace('/Date(', '').replace(')/', ''),
              'yyyy-MM-dd'
            )),
            Manual: this.ChemoHistory[i].Manual
          });
        }};
      });
  };

  protocolListId(){
    this.ePrescriptionService.loadData(`e-prescription/protocolListget`, false, false, false, false).subscribe((resp: any) => {
      if(resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length){
          this.protocolIdlist =  resp.body.d.results;
      }
    });
  }

  serachInput(term: string, item: any) {
    term = term.toLowerCase();
    return (item.ProtoDesc.toLowerCase().includes(term) || item.ProtoCode.toLowerCase().includes(term))
  }

cycleNolistNumbar(event:any){
  if(event.ProtoId )
    this.updateAllergyForm.patchValue({
      ProtoDesc:event.ProtoDesc,
      ProtoId:event.ProtoId
    });
    this.ePrescriptionService.loadData(`e-prescription/cycleNolist?ProtoId=${event.ProtoId}`, false, false, false, false).subscribe((resp: any) => {
      if(resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length){
        this.cyclenumbar = resp.body.d.results
      }
    });
    this.ePrescriptionService.loadData(`e-prescription/ProtoHeadersearched?ProtoDesc=${event.ProtoDesc}`, false, false, false, false).subscribe((resp: any) => {
      if(resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length){
        this.updateAllergyForm.patchValue({
          Comments:resp.body.d.results[0].Comments,
          Notes:resp.body.d.results[0].Notes,
          MonitParam:resp.body.d.results[0].MonitParam,
        });
      }
    });
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
  };

  closePopup() {this.modalRef.hide();}

  deletrow(index:number){ this.historyArray.removeAt(index);}

  CancelPopup(){
    this.updateAllergyForm.patchValue({
      Patnr :'',
      ProtoId :'',
      ProtoDesc :'',
      CycleId :'',
      OrderDate :'',
      MonitParam :'',
      Notes :'',
      Manual :'',
      Comments:''
    });
  }
}
