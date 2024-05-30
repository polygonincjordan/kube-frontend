

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
import { APIURL} from 'src/environments/dashboardConfig'

@Injectable({ providedIn: 'root' })
export class LoadingInterceptor implements HttpInterceptor {
  constructor(private spinner: NgxSpinnerService) { }
  service_count = 0;
  private firstCall = 0;
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this.service_count++;
    // this.spinner.show();
    const url = new URL(req.url);
    const Erdat = url.searchParams.get('Erdat');
    const datetime = url.searchParams.get('datetime');
    const apiUrl = APIURL.getApiUrl(Erdat, datetime); 
    if(req.url === apiUrl || req.url === APIURL.nursingDashboardApi){
       this.firstCall++
    }else {
      this.firstCall=0
    }
    if(this.firstCall == 0){
      this.spinner.show()
    }
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
