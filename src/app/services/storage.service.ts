import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ActivatedRoute } from '@angular/router';
declare let sessionStorage: any;

@Injectable({ providedIn: 'root' })
export class StorageService {
  public einri: string;
  public falnr: string;
  public lfdnr: string;
  public patnr: string;
  public env: { production: boolean; ver: string } = environment;

  isLoginKey = 'isLoggedIn';
  gpartKey = 'gpart';
  kubeRuleKey = 'kubeRule';
  loggedInUserProfile = 'loggedInUserProfile';
  orgUnitKey = 'initOrg';
  patientData: any;
  checkinPatientData: any;
  lastPassedDate: any;

  isLoggedIn() {
    return this.getLocal(this.isLoginKey);
  }

  getUserProfile() {
    return this.getLocal(this.loggedInUserProfile);
  }

  getGpart() {
    return this.getLocal(this.gpartKey);
  }

  getKubeRule() {
    return this.getLocal(this.kubeRuleKey);
  }

  getOrgunit() {
    return this.getLocal(this.orgUnitKey);
  }

  getClient() {
    if (this.env['app_prefix'] == 'amc_dev_') {
      return 'DEV';
    } else if (this.env['app_prefix'] == 'amc_qas_') {
      return 'QAS';
    } else if (this.env['app_prefix'] == 'amc_prd_') {
      return 'PRD';
    }
  }

  getLocal(key: string, skipParse?) {
    var data = sessionStorage.getItem(this.env['app_prefix'] + key);

    if (data) {
      if (!skipParse) {
        data = JSON.parse(data);
      }
      return data;
    }
  }



  setUserProfile(val: string) {
    this.setLocal(this.loggedInUserProfile, val)
  }

  setGpart(val: string) {
    this.setLocal(this.gpartKey, val)
  }

  setKubeRule(val: string) {
    this.setLocal(this.kubeRuleKey, val)
  }

  setLogin(val: boolean) {
    this.setLocal(this.isLoginKey, val)
  }

  setLocal(key: string, value: any, skipParse?: any) {
    if (!skipParse) {
      value = JSON.stringify(value);
    }
    sessionStorage.setItem(this.env['app_prefix'] + key, value);
  }

  setUserConfig(key,value){
    sessionStorage.setItem(this.env['app_prefix'] + key, value);
  }

  remLocal(key: any) {
    sessionStorage.removeItem(this.env['app_prefix'] + key);
  }

  setEinri(id: string) {
    this.einri = id;
  }
  setPatnr(id: string) {
    this.patnr = id;
  }
  setFalnr(id: string) {
    this.falnr = id;
  }
  setLfdnr(id: string) {
    this.lfdnr = id;
  }

  getEncounterId() {
    return this.einri + this.falnr + this.lfdnr;
  }

  getImgAvatarByDefault() {
    return './assets/images/avatar-default.png';
  }

  setPatientData(data: any) {
    this.patientData = data;
    this.setLocal('patientData', JSON.stringify(data))
  }

  setCheckinData(data: any) {
    this.checkinPatientData = data;
  }
  setLastPassedData(data: any) {
    this.lastPassedDate = data;
  }

  setMySurgerySelectedDate(date) {
    sessionStorage.setItem(this.env['app_prefix'] + 'mySurgerySelectedDate', date);
  }

  getMySurgerySelectedDate() {
    return sessionStorage.getItem(this.env['app_prefix'] + 'mySurgerySelectedDate')
  }
}
