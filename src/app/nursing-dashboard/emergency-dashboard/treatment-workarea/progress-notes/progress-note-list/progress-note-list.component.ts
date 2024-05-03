import {
  Component,
  Input,
  OnInit,
  Output,
  TemplateRef,
  EventEmitter,
} from '@angular/core';
import { AdmissionService } from '@services/admission/admission.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-progress-note-list',
  templateUrl: './progress-note-list.component.html',
  styleUrls: ['./progress-note-list.component.scss'],
})
export class ProgressNoteListComponent implements OnInit {
  @Input() ProgressNotesList: any;
  progressNoteTextInfoModal: any;
  modalRef: BsModalRef;
  @Output() reloadPhyOrderList = new EventEmitter();
  @Output() copyProgressNotes = new EventEmitter();

  constructor(
    private modalService: BsModalService,
    private _admissionservice: AdmissionService,
  ) {}

  ngOnInit(): void {}

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
      class: 'modal-dialog-centered',
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

  copyProgressNotesBind(note: any) {    
    this.copyProgressNotes.next(note);
  }
}
