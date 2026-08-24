import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  catchError,
  map,
  Observable,
  ReplaySubject,
  retry,
  throwError,
  tap,
  Subject,
} from 'rxjs';
import * as dayjs from 'dayjs';
import {
  get as _get,
  isArray as _isArray,
  isEmpty as _isEmpty,
  isInteger as _isInteger,
  isString as _isString,
} from 'lodash';

import { environment } from 'src/environments/environment';
import { Patient, VitalSing } from './interfaces/patient';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private patientSubject$ = new ReplaySubject<Patient>(1);
  public patientapi = new Subject<any>();
  public patient$ = this.patientSubject$.asObservable();
  public HeaderConfigurationData: any;
  public isAdmitProcessSection: boolean = false;

  constructor(private http: HttpClient, private _sanitizer: DomSanitizer) {}

  getUrlPatient(encounterId) {
    return `${environment.eKardexApiUrl}/patient/getDataPatient/${encounterId}`;
  }

  getDataPatient(encounterId): Observable<Patient> {
    const url = this.getUrlPatient(encounterId);
    console.log('url11',url);
    
    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => this.processData(data)),
      retry(2),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(() => error);
      })
    );
  }

  processData(data: any): Patient {
    this.HeaderConfigurationData = data
    const { subject = {}, location = {}, episodeOfCare = {} } = data;
    const { careManager, financeCat = '' } = episodeOfCare;

    const rawCaseNumber = _get(episodeOfCare, 'id', '');
    // date1.diff('2018-06-05', 'month')
    const _patient = {
      id: this.getFormattedId(subject),
      name: _get(subject, 'name[0].text', ''),
      photo: {
        changingThisBreaksApplicationSecurity: this.getPhotoUrl(subject)
      },
      gender: subject?.gender,
      birthDate: subject?.birthDate,
      age: dayjs().diff(subject?.birthDate, 'years'),
      periodStart: _get(episodeOfCare, 'period.start'),
      encounterStart: _get(data, 'period.start'),
      lenghtOfStay: this.getLenghtOfStay(episodeOfCare),
      location: {
        room: _get(location, '[0].name', ''),
        bed: _get(location, '[1].name', ''),
      },
      institution: this.getInstitution(rawCaseNumber),
      case: this.getCaseNumber(rawCaseNumber),
      careManager: _get(careManager, 'name[0].text', ''),
      financeCat,
      riskfactors: this.getRiskFactors(_get(subject, 'riskfactors')),
      allergyInfo: this.getAllergyInfo(_get(subject, 'allergyInfo')),
      height: this.getVitalSign(subject, 'HEIGHT'),
      weight: this.getVitalSign(subject, 'WEIGHT'),
      bmi: this.getVitalSign(subject, 'BMI'),
      bradenScaleScore: _get(episodeOfCare, 'bradenScaleScore', ''),
      bradenScaleScoreTxt: _get(episodeOfCare, 'bradenScaleScoreTxt', ''),
      fallRiskForceScore: _get(episodeOfCare, 'fallRiskForceScore', ''),
      fallRiskForceScoreTxt: _get(episodeOfCare, 'fallRiskForceScoreTxt', ''),
      phone: _get(subject, 'telecom[0].value'),
      telephone: _get(subject, 'telecom[1].value'),
      address: this.getAddressText(_get(subject, 'address[0]', '')),
      deptOrgUnit: _get(data, 'deptOrgUnit', ''),
      deptOrgUnitTxt: _get(data, 'deptOrgUnitTxt', ''),
      isInPatient: _get(episodeOfCare, 'caseType', '') === '1',
      caseTypeText: _get(episodeOfCare, 'caseTypeTxt', ''),
      email: _get(subject, 'eMail', ''),
      flagsIcons: {
        isolationInd: _get(data, 'isolationInd', {}),
        packageInd: _get(episodeOfCare, 'packageInd', {}),
        watchListInd: _get(episodeOfCare, 'watchListInd', {}),
        clinicPharmctStdInd: _get(episodeOfCare, 'clinicPharmctStdInd', {}),
        patCatInd: _get(subject, 'patCatInd', {}),
        riskFactorInd: _get(subject, 'riskFactorInd', {}),
      },
      primDiaTxt: _get(episodeOfCare, 'primDiaTxt', ''),
      bloodGrpTxt: _get(subject, 'bloodGrpTxt', ''),
      maritalStatus:_get(subject, 'maritalStatus[coding][0].display', ''),
      kinName:subject?.KinName,
      KinTelephone:subject?.KinTelephone,
      Nationality:subject?.Nationality,
      Treatmentou:data?.Treatmentou
    };

    this.patientSubject$.next(_patient);
    return _patient;
  }

  getLenghtOfStay(episodeOfCare: any): number {
    const start = _get(episodeOfCare, 'period.start');
    const end = _get(episodeOfCare, 'period.end') || dayjs();
    const LOS = dayjs(end).diff(dayjs(start), 'days');
    return LOS;
  }

  getAddressText(address: any) {
    const { text = '', city = '', postalcode = '', country = '' } = address;
    return `${text} ${city}, ${postalcode}, ${country}`;
  }

  getFormattedId(subject: any): number {
    return Number(_get(subject, 'id', ''));
  }

  getPhotoUrl(subject: any): SafeResourceUrl {
    return this.getBase64StringSanitized(
      _get(subject, 'photo[0]', 'assets/img/avatar-default.png')
    );
  }

  getBase64StringSanitized(base64string: any) {
    if(typeof base64string == "string"){
      return base64string;
    }else{
      return this._sanitizer.bypassSecurityTrustResourceUrl(
        'data:image/jpg;base64,' + base64string.data
      );
    }
  }

  getVitalSign(subject: any, vitalSignToLookFor: string): VitalSing {
    const vitalSignFounded = _get(subject, 'vitals', []).filter(
      (vitalSign: any) => vitalSign?.id === vitalSignToLookFor
    )[0];
    return _isEmpty(vitalSignFounded) ? {} : vitalSignFounded;
  }

  getInstitution(rawCaseNumber: number | string): string {
    const isValidDate = _isInteger(rawCaseNumber) || _isString(rawCaseNumber);
    return isValidDate ? rawCaseNumber.toString().slice(0, 4) : '';
  }

  getCaseNumber(rawCaseNumber: number | string): string {
    const isValidDate = _isInteger(rawCaseNumber) || _isString(rawCaseNumber);
    return isValidDate ? rawCaseNumber.toString().slice(4) : '';
  }

  getRiskFactors(risks: { riskName: string }[]): string {
    let _risks = '';
    if (_isArray(risks)) {
      _risks = risks
        .map((risk) => risk.riskName)
        .filter((riskName) => riskName !== undefined)
        .join(', ');
    }
    return _risks ? _risks : '';
  }

  getAllergyInfo(data: any): string {
    const allergies = _get(data, 'allergies', []);
    const alternativeText = _get(data, 'text', '');
    let _risks: string | any[] = [];
    if (_isArray(allergies) && allergies.length > 0) {
      _risks = allergies
        .map((allergy) => allergy.description)
        .filter((nameOfAllergy) => nameOfAllergy !== undefined)
        .join(', ');
    }
    return typeof _risks === 'string' ? _risks : alternativeText;
  }

  public getHeaderDataPatient(encounterId): Observable<any> {
    const url = `${environment.eKardexApiUrl}/patient/getHeaderDataPatient/${encounterId}`;
    return this.http.get(url, { withCredentials: true })
  }

}
