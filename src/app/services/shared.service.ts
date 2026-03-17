import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private messageSource = new BehaviorSubject<boolean>(false);
  currentMessage = this.messageSource.asObservable(); // Expose as Observable
  constructor() {}

  getDateRangeFormat(from: Date) {
    let formatDate = `${new DatePipe('en-US').transform(
      from,
      'yyyy-MM-dd'
    )}T00:00:00`;
    // let todate = `${new DatePipe('en-US').transform(
    //   to,
    //   'yyyy-MM-dd'
    // )}T00:00:00`;

    return formatDate;
  }

  changeMessage(newMessage: boolean) {
    this.messageSource.next(newMessage);
  }

  successSwallModel(message: string) {
    Swal.fire({
      text: message,
      icon: 'success',
      confirmButtonText: 'Ok',
      customClass: { popup: 'myalertpopup' }
    } as any)
  }

  waringSwallModel(message: string) {
    Swal.fire({
      text: message,
      icon: 'warning',
      confirmButtonText: 'Ok',
      customClass: { popup: 'myalertpopup' }
    } as any)
  }

  errorSwallModel(message: string) {
    return Swal.fire({
      text: message,
      icon: 'error',
      confirmButtonText: 'Ok',
      customClass: { popup: 'myalertpopup' }
    } as any)
  }

  customConfirmPopup(
  message: string,
  extraChargeText: string,
  onNewPackage: () => void,
  onSamePackage: () => void
) {
  Swal.fire({
    title: `<div style="display:flex;align-items:center;justify-content:space-between;">
      <span style="flex:1;text-align:center;">Please, Confirm Action</span>
      <span id="swal-close-x" style="cursor:pointer;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;background:#E53935;border-radius:50%;margin-left:8px;"><svg width="16" height="16" viewBox="0 0 16 16"><line x1="4" y1="4" x2="12" y2="12" stroke="white" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="4" x2="4" y2="12" stroke="white" stroke-width="2" stroke-linecap="round"/></svg></span>
    </div>`,
    html: `
      <div style="text-align:left;margin-top:2px;">
        <div style="font-size: 18px;">${message}!</div>
        <div style="margin-top:4px;">Do you want to generate an extra charge of: ${extraChargeText}\t?</div>
      </div>
      <div style="display:flex;justify-content:flex-start;gap:16px;margin-top:16px;">
        <button id="swal-new-package" class="swal2-confirm swal2-styled" style="margin-right:8px;">New Package</button>
        <button id="swal-same-package" class="swal2-cancel swal2-styled" style="background-color:#1C663C;">Same Package</button>
      </div>
    `,
    showConfirmButton: false,
    showCancelButton: false,
    customClass: { popup: 'myalertpopup' },
    didOpen: () => {
      const closeX = document.getElementById('swal-close-x');
      if (closeX) closeX.onclick = () => Swal.close();

      const newPackageBtn = document.getElementById('swal-new-package');
      if (newPackageBtn) newPackageBtn.onclick = () => {
        Swal.close();
        onNewPackage();
      };

      const samePackageBtn = document.getElementById('swal-same-package');
      if (samePackageBtn) samePackageBtn.onclick = () => {
        Swal.close();
        onSamePackage();
      };
    }
  });
}
}
