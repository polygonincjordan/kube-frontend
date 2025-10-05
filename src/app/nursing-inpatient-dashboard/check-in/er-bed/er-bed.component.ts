import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-er-bed',
  templateUrl: './er-bed.component.html',
  styleUrls: ['./er-bed.component.scss']
})
export class ErBedComponent implements OnInit {
  @ViewChild('erBedModal', { static: true }) erBedModal: TemplateRef<any>;
  @Output() reloadCheckin = new EventEmitter();;
  modalRef: BsModalRef;
  selectedPatientdata: any;
  patientDetails: any;
  selectedErPat: any;
  constructor(private modalService: BsModalService, private emergencyService: EmergencyService) { }

  ngOnInit() {
  }
  openModalForErBed(data) {
    this.selectedPatientdata = data;
    const config: ModalOptions = { class: 'modal-dialog modal-dialog-centered modal-xl er-bed' };
    this.modalRef = this.modalService.show(this.erBedModal, config);
    this.modalRef.onHide.subscribe((reason: string | any) => {
      if (reason === 'backdrop-click') {

      }
    });
    this.getErBedList();
  }
  getErBedList() {

    this.emergencyService.getErBedList().subscribe(
      (_success: any) => {
        this.patientDetails = _success.d.results;
        this.patientDetails.forEach(element => {
          element['isSelected'] = false;
        });
      },
      (_error: any) => { }
    );
  }

  selectBedForPatient(i, item) {
    this.patientDetails.forEach((element, index) => {
      if (i === index) {
        element['isSelected'] = true;
      } else {
        element['isSelected'] = false;
      }
    });
    this.selectedErPat = item;
  }

  SaveBedForPatient() {
    // if (this.selectedErPat.Patnr !== '') {
    //   return false;
    // }else{
    const json = {
      "Einri": this.selectedPatientdata.Institute,
      "Patnr": this.selectedPatientdata.Mrn,
      "Falnr": this.selectedPatientdata.CaseNumber,
      "Lfdnr": this.selectedPatientdata.Lfdnr,
      "Zimmr": this.selectedErPat.Zimmr
    }
    this.emergencyService.SaveBedForPatient(json)
      .subscribe({
        next: (_success: any) => {
          // Handle successful data retrieval
          this.closeErBed();
          Swal.fire({
            text: "Room is assigned successfully",
            icon: 'success',
            confirmButtonText: 'Ok',
            // customClass: 'myalertpopup'
          })
          this.reloadCheckin.emit(true);
        },
        error: (err: any) => {
          // Handle errors if the request fails
          console.error('Error Data:', err);
        },
        complete: () => {
          // Handle completion (optional), invoked when the observable completes
          console.log('Complete');
        }
      });

    // }
  }
  closeErBed() {
    this.modalRef.hide();
    this.selectedErPat = '';
  }
}
