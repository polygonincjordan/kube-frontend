

import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class LoadingInterceptor implements HttpInterceptor {
  constructor(private spinner: NgxSpinnerService) { }
  service_count = 0;
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this.service_count++;
    this.spinner.show();


    return next.handle(req).pipe(
      finalize(() => {
        this.service_count--;
        // decrement when service is completed (success/failed both 
        //handled when finalize rxjs operator used)

        if (this.service_count === 0) {
          this.spinner.hide();
        }
      })
    );
  }



  //   return next.handle(req).pipe(
  //     finalize(() => {
  //       this.spinner.hide();
  //     })
  //   );
  // }
}
