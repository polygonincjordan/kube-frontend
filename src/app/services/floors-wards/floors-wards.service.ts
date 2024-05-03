import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class FloorsWardsService {
  public IsFloors: boolean = true;
  public IsClinic: boolean = false;
  public IsEmergency: boolean = false;
  floorward: boolean;
  public parameters: any = {
    einri: this.route.snapshot.queryParamMap.get('einri'),
    falnr: this.route.snapshot.queryParamMap.get('falnr'),
    lfdnr: this.route.snapshot.queryParamMap.get('lfdnr'),
    patnr: this.route.snapshot.queryParamMap.get('patnr')
  }
  constructor(private route: ActivatedRoute,) { }

  loadParameters(isEinri: boolean, isFalnr: boolean, islfdnr: boolean, isPatnr: boolean, isInst?: boolean): object {
    let filter: any = {};
    if (isEinri) { filter['Einri'] = this.parameters.einri }
    if (isFalnr) { filter['Falnr'] = this.parameters.falnr }
    if (islfdnr) { filter['Lfdnr'] = this.parameters.lfdnr }
    if (isPatnr) { filter['Patnr'] = this.parameters.patnr }
    if (isInst) { filter['Inst'] = this.parameters.einri }
    return filter;
  }

  tabPanelNavigation(tabName: any) {
    if (tabName && tabName === 'IsFloors') {
      this.IsFloors = true;
      this.IsClinic = false;
      this.IsEmergency = false;
    } else if (tabName && tabName === 'IsClinic') {
      this.IsFloors = false;
      this.IsClinic = true;
      this.IsEmergency = false;
    } else if (tabName && tabName === 'IsEmergency') {
      this.IsFloors = false;
      this.IsClinic = false;
      this.IsEmergency = true;
    }
  }
}
