import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ActivatedRoute } from '@angular/router';
declare let localStorage: any;

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
    var data = localStorage.getItem(this.env['app_prefix'] + key);

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
    localStorage.setItem(this.env['app_prefix'] + key, value);
  }

  setUserConfig(key,value){
    localStorage.setItem(this.env['app_prefix'] + key, value);
  }

  remLocal(key: any) {
    localStorage.removeItem(this.env['app_prefix'] + key);
  }

  setEinri(id: string) {
    this.einri = this.normalizeId(id);
  }
  setPatnr(id: string) {
    this.patnr = this.normalizeId(id, 10);
  }
  setFalnr(id: string) {
    this.falnr = this.normalizeId(id, 10);
  }
  setLfdnr(id: string) {
    this.lfdnr = this.normalizeId(id);
  }

  getEncounterId() {
    return this.einri + this.falnr + this.lfdnr;
  }

  private normalizeId(id: any, length?: number): string {
    const normalized = (id ?? '').toString().trim();
    return normalized && length ? normalized.padStart(length, '0') : normalized;
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
    localStorage.setItem(this.env['app_prefix'] + 'mySurgerySelectedDate', date);
  }

  getMySurgerySelectedDate() {
    return localStorage.getItem(this.env['app_prefix'] + 'mySurgerySelectedDate')
  }
}
