import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthInterceptor implements HttpInterceptor {
  constructor(public router: Router) { }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // const token = localStorage.AccessToken;
    // if (token) {
    //   request = request.clone({
    //     headers: request.headers.set('Authorization', `Bearer ${token}`)
    //     .set('Access-Control-Allow-Origin', '*')
    //     .set('Access-Control-Allow-Credentials', 'true')
    //   });
    // }
    return next.handle(request).pipe(
      catchError((err) => {
        if (err.status === 401) {
          localStorage.clear();
          this.router.navigateByUrl('');
        }
        return throwError(err);
      })
    );
  }
}
