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
}
