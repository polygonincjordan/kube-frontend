

import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HelperService } from '@services/helper.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';


@Injectable({ providedIn: 'root' })
export class LoadingInterceptor implements HttpInterceptor {
  constructor(private spinner: NgxSpinnerService,private helperService:HelperService) {}
  service_count = 0;
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this.service_count++;
    this.spinner.show();

    return next.handle(req).pipe(
      finalize(() => {
       if(!this.helperService.isNotAllowedSpinnerInAPI) {
          this.spinner.show();
      }
        this.service_count--;
        if (this.service_count === 0) {
          this.spinner.hide();
        }
      })
    );
  }
}
