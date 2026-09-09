import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataShareService {

  private dataSubject = new BehaviorSubject<any>(null);
  public data$ = this.dataSubject.asObservable();

  sendData(data: any) {
    this.dataSubject.next(data);
  }

  private actionTypeSubject = new BehaviorSubject<{ type: string, isAllow: boolean, value?: any }>({ type: null, isAllow: false, value: null });
  actionsType$: Observable<{ type: string, isAllow: boolean, value?: any }> = this.actionTypeSubject.asObservable();

  sendActionType(type: string, isAllow: boolean = true, value?: any): void {
    const data = { type, isAllow, value };
    this.actionTypeSubject.next(data);
  }

  private filterTypeSubject = new BehaviorSubject<{ type: string, isAllow: boolean, value?: any }>({ type: null, isAllow: false, value: null });
  filterType$: Observable<{ type: string, isAllow: boolean, value?: any }> = this.filterTypeSubject.asObservable();

  sendFilterType(type: string, isAllow: boolean = true, value?: any): void {
    const data = { type, isAllow, value };
    this.filterTypeSubject.next(data);
  }
}
