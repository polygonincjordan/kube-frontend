import { DatePipe } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

@Injectable()
export class HelperService {
  imageString: string | ArrayBuffer;

  constructor(@Inject(DatePipe) private datePipe: DatePipe) {}

  getBase64String(gender: any) {
    switch (gender) {
      case 'M':
      case 'Male':
        return 'assets/images/avatars/face_male.png';
      case 'F':
      case 'Female':
        return 'assets/images/avatars/face_female.png';
      default:
        return 'assets/images/avatars/face_unisex.png';
    }
  }

  padZeros(number: any, length: any) {
    var my_string = '' + number;
    while (my_string.length < length) {
      my_string = '0' + my_string;
    }
    return my_string;
  }

  convertTimeToUTC(_timeString: any) {
    var _timeArray = _timeString.split(':');
    var _d = new Date();
    _d.setHours(_timeArray[0]);
    _d.setMinutes(_timeArray[1]);
    _d.setSeconds(0);
    return this.datePipe.transform(_d, 'HH:mm:ss', 'UTC');
  }

  formatTime(time: any) {
    let that = this;
    var reptms = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
    var hours = 0,
      minutes = 0,
      seconds = 0,
      totalseconds;

    if (reptms.test(time)) {
      var matches = reptms.exec(time);
      if (matches![1]) hours = Number(matches![1]);
      if (matches![2]) minutes = Number(matches![2]);
      if (matches![3]) seconds = Number(matches![3]);
      totalseconds = hours * 3600 + minutes * 60 + seconds;
    }
    return (
      that.padZeros(hours, 2) +
      ':' +
      that.padZeros(minutes, 2) +
      ':' +
      that.padZeros(seconds, 2)
    );
  }
}
