import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
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

  successSwallModel(message: string) {
    Swal.fire({
      text: message,
      icon: 'success',
      confirmButtonText: 'Ok',
      customClass: 'myalertpopup'
    })
  }

  waringSwallModel(message: string) {
    Swal.fire({
      text: message,
      icon: 'warning',
      confirmButtonText: 'Ok',
      customClass: 'myalertpopup'
    })
  }

  errorSwallModel(message: string) {
    return Swal.fire({
      text: message,
      icon: 'error',
      confirmButtonText: 'Ok',
      customClass: 'myalertpopup'
    })
  }
}
