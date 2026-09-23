import {
  Component,
  Input,
  OnInit,
  Output,
  TemplateRef,
  EventEmitter,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdmissionService } from '@services/admission/admission.service';
import { StorageService } from '@services/storage.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-progress-note-list',
  templateUrl: './progress-note-list.component.html',
  styleUrls: ['./progress-note-list.component.scss'],
})
export class ProgressNoteListComponent implements OnInit {
  @Input() ProgressNotesList: any;
  @Input() searchString: any;
  progressNoteTextInfoModal: any;
  modalRef: BsModalRef;
  modalRefForDelete:BsModalRef;
  @Output() reloadPhyOrderList = new EventEmitter();
  @Output() copyProgressNotes = new EventEmitter();
  selectProgressNote: any;
  deleteProgressNoteForm: FormGroup;
  isFormSubmitted: boolean = false;
  cancalReasonList: any;
  cancelReason: null;
  currentUsername: string;
  constructor(
    private modalService: BsModalService,
    private _admissionservice: AdmissionService,
    private formBuilder: FormBuilder,
    public storageService:StorageService
  ) {}

  ngOnInit(): void {
    this.currentUsername = this.storageService.getGpart();
    this.getCancelReason();
  }

  isCurrentUser(noteUser: string): boolean {
    return noteUser === this.currentUsername;
  }

  public getImageBorderLogic(item) {
    return (
      (item.ProfGroup === 'ANES' && {
        'background-color': '#D6ECAE', //Surgery
      }) ||
      (item.ProfGroup === 'AUDI' && {
        'background-color': '#9B9BFF', //Surgery
      }) ||
      (item.ProfGroup === 'CPHA' && {
        'background-color': '#CFBB8B', //Surgery
      }) ||
      (item.ProfGroup === 'DIET' && {
        'background-color': '#00FFFF', //Surgery
      }) ||
      (item.ProfGroup === 'DOCT' && {
        'background-color': '#E0F0FF', //Surgery
      }) ||
      (item.ProfGroup === 'HOSP' && {
        'background-color': '#B0E0E6', //Surgery
      }) ||
      (item.ProfGroup === 'INFC' && {
        'background-color': '#FFB2FF', //Surgery
      }) ||
      (item.ProfGroup === 'NURS' && {
        'background-color': '#c9ffd8', //Surgery
      }) ||
      (item.ProfGroup === 'NVAD' && {
        'background-color': '#FFF8DC', // Nursing VAD (Cornsilk)
      }) ||
      (item.ProfGroup === 'OCTH' && {
        'background-color': '#E9DBF0', //Surgery
      }) ||
      (item.ProfGroup === 'PHYS' && {
        'background-color': '#E0F0FF', //Surgery
      }) ||
      (item.ProfGroup === 'PMGT' && {
        'background-color': '#FFFF00', //Surgery
      }) ||
      (item.ProfGroup === 'RESP' && {
        'background-color': '#9B9BFF', //Surgery
      }) ||
      (item.ProfGroup === 'SPTH' && {
        'background-color': '#B2B2B2', //Surgery
      }) ||
      (item.ProfGroup === 'ZPHA' && {
        'background-color': '#7AB200', //Surgery
      })
    );
  }

  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }

  parsePayloadFormateTime(data: string) {
    if (data && data.length) {
      let hours = data.substring(2, 4);
      let minute = data.substring(5, 7);
    
      return `${hours}:${minute}`;
    }
  }

  showParagraph(text: any) {
    return text.replace(/\n/g, ' <br /> ');
  }

  public openModalForProgressTextInfo(
    template: TemplateRef<any>,
    progressNotesText: any
  ) {
    this.progressNoteTextInfoModal = progressNotesText;
    const config: ModalOptions = {
      class: 'modal-dialog-centered kardex-info-progress-note',
    };
    this.modalRef = this.modalService.show(template, config);
  }

  deleteProgressNote(note: any) {
   
    this._admissionservice.deleteProgressNote(note).subscribe(
      (_success: any) => {
        this.reloadPhyOrderList.next(true);
        if (_success) {
        }
      },
      (_error: any) => {}
    );
  }

  copyProgressNotesBind(note: any, type: string) {
    let obj = {
      value : note,
      type: type
    }    
    this.copyProgressNotes.next(obj);
  }
  getCancelReason() {
    this._admissionservice.cancelReasonList().subscribe(
      (_success: any) => {
        this.cancalReasonList = _success.d.results
      },
      (_error) => {}
    );
  }
  progressNoteForm() {
    this.deleteProgressNoteForm = this.formBuilder.group({
      reason : ['', [Validators.required]]
    })
  }
  deleteProgressNotePopup(template: TemplateRef<any>, note: any) {
    this.selectProgressNote = note;
    let gpart =  this.storageService.getGpart()
    if (note.EmployeeResp !== gpart)  {
      this.warningSwalModel("You are not allowed to delete others' notes");
      return; 
    }
    const config: ModalOptions = {
      class: 'kardex-notes-delete modal-dialog-centered',
    };
    this.modalRefForDelete = this.modalService.show(template, config);
    this.progressNoteForm();
    this.isFormSubmitted = false;
  }
  warningSwalModel(message: string) {
  Swal.fire({
    icon: 'warning',
    title: 'Not Allowed',
    text: message
  });
}
  deleteProgressNoteAPI() {
    this.isFormSubmitted = true;
     if (this.deleteProgressNoteForm.invalid) {
      return;
    }
    this._admissionservice
      .deleteProgressNoteForAdmit(this.selectProgressNote, this.deleteProgressNoteForm.value.reason)
      .subscribe(
        (_success: any) => {
          this.reloadPhyOrderList.next(true);
          this.cancelReason = null;
          this._admissionservice.successSwalModel('Progress note is deleted successfully')
          this.modalRefForDelete.hide();
        },
        (_error: any) => {}
      );
  }
}
