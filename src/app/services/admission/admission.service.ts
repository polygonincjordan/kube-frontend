import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { InPatientDataResult } from '@services/e-kardex/interfaces/inpatient-data';
import { UserConfig } from '@services/e-kardex/interfaces/user-config';
import {
  BehaviorSubject,
  Observable,
  ReplaySubject,
  catchError,
  lastValueFrom,
  map,
  tap,
  throwError
} from 'rxjs';
import { DocumentationListComponent } from 'src/app/discharge-process/documentation/documentation-list/documentation-list.component';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';
import { StorageService } from '../storage.service';
import { TemplateModel } from './interfaces/template-model';
import { ActionType, WordType } from '@services/interfaces/common.enum';
import { DataShareService } from '@services/data-share.service';

@Injectable({
  providedIn: 'root',
})
export class AdmissionService {
  public isSaveEducationData = new BehaviorSubject(false);
  public isSaveSoapDocumnet = new BehaviorSubject(false);
  public isUpdateSoapDocumnet = new BehaviorSubject(false);
  public isSaveMedicalDocumnet = new BehaviorSubject(false);
  public isDeleteEducation = new BehaviorSubject(false);
  public isRealoadData = new BehaviorSubject(false);
  public educationDateFilter = new BehaviorSubject('');
  public clearSoapEvent = new BehaviorSubject(false);
  public isClearSelectedDoc = new BehaviorSubject(false);

  public documentTypeDrop = new BehaviorSubject({ documentType: '', dateRange: '', selectedDocumentOU: '', selectedCreatedBy: '', previousPeriodValue: '' });
  public documentDateRangeFilter = new BehaviorSubject('');

  documentTypeFilter: any[] = [];
  departmentOUList: any[] = [];
  createdDocumentUserList: any[] = [];
  documentType
  formDetailGroup: any;

  public PhysicianOrders: boolean = true;
  public ProgressNotes: boolean = false;
  public Diagnosis: boolean = false;
  public Documentation: boolean = false;
  public vitalSign: boolean = false;
  public isAddEditMedicalForm: boolean = false;
  public isDischargeProcess: boolean = false;

  public isAddEditSopaDocument: boolean = false;
  public isEditSoapDoc: boolean = false;
  public isCloneSoapDoc: boolean = false;
  public isAddEditMedicalDocument: boolean = false;
  public isEditMedicalDoc: boolean = false;
  public isCloneMedicalDoc: boolean = false;

  public isAddEditDischargeSummery: boolean = false;
  public isEditDischargeSummery: boolean = false;
  public isCloneDischargeSummery: boolean = false;

  public isAddEditNeonatalDischarge: boolean = false;
  public isEditNeonatalDischarge: boolean = false;
  public isCloneNeonatalDischarge: boolean = false;

  public isAddEditObstetricRisk: boolean = false;
  public isEditObstetricRisk: boolean = false;
  public isCloneObstetricRisk: boolean = false;
  public isPDFObstetricRisk: boolean = false;
  public dichargeUserConfig

  public isCopyBtnHide: boolean = false;
  public isAddEditObsVteAnt: boolean = false;
  public isEditObsVteAnt: boolean = false;
  public isCloneObsVteAnt: boolean = false;
  public isPDFObsVteAnt: boolean = false;

  public isAddEditEducationForm: boolean = false;
  public isAddEditEducationAsset: boolean = false;
  public isEditEducationAsset: boolean = false;
  public isCloneEducationAsset: boolean = false;
  public isAddEditObsGynForm: boolean = false;
  public isEditObsGynDoc: boolean = false;
  public isCloneObsGynDoc: boolean = false;
  selectedCurrentDocDetails: any;

  public isAddEditOperationReport: boolean = false;
  public isEditOperationReport: boolean = false;
  public isCloneOperationReport: boolean = false;

  public isAddEditNeonatal: boolean = false;
  public isEditNeonatal: boolean = false;
  public isCloneNeonatal: boolean = false;

  public isAddEditNeonatalMR: boolean = false;
  public isEditNeonatalMR: boolean = false;
  public isCloneNeonatalMR: boolean = false;

  public isAddEditPhysicianForm: boolean = false;
  public isEditPhysicianForm: boolean = false;
  public isClonePhysicianForm: boolean = false;

  public isAddEditDocVisitForm: boolean = false;
  public isCloneVisitForm: boolean = false;
  public isEditVisitForm: boolean = false;

  public isAddEditDocPaediatricsAdmissionForm: boolean = false;
  public isClonePaediatricsAdmissionForm: boolean = false;
  public isEditPaediatricsAdmissionForm: boolean = false;

  public isAddEditTransferAssestForm: boolean = false;
  public isAddEditNewbornAssessment: boolean = false;
  public isCloneTransferAssestForm: boolean = false;
  public isEditTransferAssestForm: boolean = false;
  public isEditNicuForm: boolean = false;
  public isAddNicuForm: boolean = false;
  public isCloneNicuForm: boolean = false;
  public isNewBornForm: boolean = false;
  public isEditBornForm: boolean = false;
  public isCloneNewBornForm: boolean = false;
  public document = new BehaviorSubject(false);
  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private dataShareService: DataShareService
  ) {
    this.phyOrderForm();

    if (localStorage.getItem('tabName')) {
      this.tabPanelNavigation(localStorage.getItem('tabName'));
    }
  }

  successSwalModel(successMsg: string) {
    Swal.fire({
      title: successMsg,
      icon: 'success',
      confirmButtonText: 'OK',
      customClass: 'swal-class'
    });
  }

  errorSwalModel(successMsg: string) {
    Swal.fire({
      title: successMsg,
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: 'swal-class'
    });
  }

  phyOrderForm() {
    this.formDetailGroup = new FormGroup({
      'SearchData': new FormControl(''),
      'DateRange': new FormControl([new Date(), new Date()]),
      'SelectDropdown': new FormControl(),
    });
  }

  private phyOrderSetDataSubject$ = new ReplaySubject<any>(1);
  public phyOrderSetData$ = this.phyOrderSetDataSubject$.asObservable();



  tabPanelNavigation(tabName: any) {
    localStorage.setItem('tabName', tabName);
    this.vitalSign = false;
    if (tabName && tabName === 'PhysicianOrders') {
      this.PhysicianOrders = true; this.ProgressNotes = false; this.Diagnosis = false; this.Documentation = false; this.isDischargeProcess = false;
    } else if (tabName && tabName === 'ProgressNotes') {
      this.PhysicianOrders = false; this.ProgressNotes = true; this.Diagnosis = false; this.Documentation = false; this.isDischargeProcess = false;
    } else if (tabName && tabName === 'Diagnosis') {
      this.PhysicianOrders = false; this.ProgressNotes = false; this.Diagnosis = true; this.Documentation = false; this.isDischargeProcess = false;
    } else if (tabName && tabName === 'Documentation') {
      this.PhysicianOrders = false; this.ProgressNotes = false; this.Diagnosis = false; this.Documentation = true; this.isDischargeProcess = false;
    } else if (tabName && tabName === 'discharge') {
      this.PhysicianOrders = false; this.ProgressNotes = false; this.Diagnosis = false; this.Documentation = false; this.isDischargeProcess = true;
    } else if (tabName && tabName === 'vitalSign') {
      this.PhysicianOrders = false; this.ProgressNotes = false; this.Diagnosis = false; this.Documentation = false; this.isDischargeProcess = false; this.vitalSign = true;
    }
  }



  private phyOrderlistDataSubject$ = new ReplaySubject<any>(1);
  public phyOrderlistData$ = this.phyOrderlistDataSubject$.asObservable();

  async getPhyOrderSetDataSet(institutionid: string, caseid: string) {
    await lastValueFrom(this.getPhyOrderSet(institutionid, caseid));
  }

  getPhyOrderSet(institutionid: string, caseid: string) {
    const url = `${environment.eKardexApiUrl}/admission/getPhyOrderSet?institutionid=${institutionid}&caseid=${caseid}`;

    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => this.processPhyOrderSetData(data?.d.results)),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  processPhyOrderSetData(results: any) {
    this.phyOrderlistDataSubject$.next(results);
    return results;
  }


  private progressNotesSetDataSubject$ = new ReplaySubject<any>(1);
  public progressNotesSetData$ = this.progressNotesSetDataSubject$.asObservable();

  async getProgressNotesSetData(patientId: string, caseid: string) {
    await lastValueFrom(this.getProgressNotes(patientId, caseid));
  }

  getProgressNotes(patientId: string, caseid: string) {
    const url = `${environment.eKardexApiUrl}/admission/getProgressNote?patientId=${patientId}&caseid=${caseid}`;

    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => this.processProgressNotesSetData(data?.d.results)),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  processProgressNotesSetData(results: any) {
    this.progressNotesSetDataSubject$.next(results);
    return results;
  }

  private categorySetDataSubject$ = new ReplaySubject<any>(1);
  public categorySetData$ = this.categorySetDataSubject$.asObservable();

  async getCategorySetData(patientId: string, caseid: string) {
    await lastValueFrom(this.getCategoryList(patientId, caseid));
  }

  getCategoryList(patientId: string, caseid: string) {
    const url = `${environment.eKardexApiUrl}/admission/getCategorySet?patientId=${patientId}&caseid=${caseid}`;

    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => this.processCategorySetData(data?.d.results)),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  processCategorySetData(results: any) {
    this.categorySetDataSubject$.next(results);
    return results;
  }


  private progressNotesTempSetDataSubject$ = new ReplaySubject<any>(1);
  public progressNoteTempSetData$ = this.progressNotesTempSetDataSubject$.asObservable();

  async getNotesTemplateSetData(patientId: string, caseid: string) {
    await lastValueFrom(this.getNotesTemplateList(patientId, caseid));
  }

  getNotesTemplateList(patientId: string, caseid: string) {
    const url = `${environment.eKardexApiUrl}/admission/getTextModulesSet`;

    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => this.processNotesTemplateSetData(data?.d.results)),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  processNotesTemplateSetData(results: any) {
    this.progressNotesTempSetDataSubject$.next(results);
    return results;
  }

  private progressNotesSetDataSubjectWithFilter$ = new ReplaySubject<any>(1);
  public progressNoteSetDataWithFilter$ = this.progressNotesSetDataSubjectWithFilter$.asObservable();

  async getProgressNotesDataSetWithFilter(patientId: string, caseid: string, dateFrom: any, dateTo: any, progroup: string) {
    await lastValueFrom(this.getProgressNotesListWithFilter(patientId, caseid, dateFrom, dateTo, progroup));
  }

  getProgressNotesListWithFilter(patientId: string, caseid: string, dateFrom: any, dateTo: any, progroup: string) {
    const url = `${environment.eKardexApiUrl}/admission/getProgressNote?patientId=${patientId}&caseid=${caseid}&admdatefrom=${dateFrom}&admdateto=${dateTo}&progroup=${progroup}`;

    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => this.processProgressNotesData(data?.d.results)),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  processProgressNotesData(results: any) {
    this.progressNotesSetDataSubjectWithFilter$.next(results);
    return results;
  }

  deleteProgressNote(obj) {
    const url = `${environment.eKardexApiUrl}/admission/deleteProgressNote?notekey=${obj.Notekey}&patientId=${obj.PatientId}`;
    return this.http.delete(url, { withCredentials: true });
  }

  removeOrderTemplate(key: any) {
    const url = `${environment.eKardexApiUrl}/admission/deleteTemplateSet/${key}`;
    return this.http.delete(url, { withCredentials: true });
  }

  deleteProgressNoteForAdmit(obj, cancelReason) {
    const url = `${environment.eKardexApiUrl}/admission/deleteProgressNote?notekey=${obj.Notekey}&patientId=${obj.PatientId}&cancelcause=${cancelReason}`;
    return this.http.delete(url, { withCredentials: true });
  }

  private phyOrderlistDataSubjectWithFilter$ = new ReplaySubject<any>(1);
  public phyOrderlistDataWithFilter$ = this.phyOrderlistDataSubjectWithFilter$.asObservable();

  async getPhyOrderSetDataSetWithFilter(institutionid: string, caseid: string, dateFrom: any, dateTo: any, progroup: string) {
    await lastValueFrom(this.getPhyOrderListWithFilter(institutionid, caseid, dateFrom, dateTo, progroup));
  }

  getPhyOrderListWithFilter(institutionid: string, caseid: string, dateFrom: any, dateTo: any, progroup: string) {
    const url = `${environment.eKardexApiUrl}/admission/getPhyOrderSet?institutionid=${institutionid}&caseid=${caseid}&admdatefrom=${dateFrom}&admdateto=${dateTo}&progroup=${progroup}`;

    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => this.processPhyOrderSetDataWithFilter(data?.d.results)),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  processPhyOrderSetDataWithFilter(results: any) {
    this.phyOrderlistDataSubjectWithFilter$.next(results);
    return results;
  }

  private templateSetDataSubject$ = new ReplaySubject<any>(1);
  public templateSetData$ = this.templateSetDataSubject$.asObservable();


  async getTemplateSetDataSet() {
    await lastValueFrom(this.getTemplateSet());
  }


  getTemplateSet() {
    const url = `${environment.eKardexApiUrl}/admission/getTemplateSet`;

    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => this.processgetTemplateSetData(data?.d.results)),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  processgetTemplateSetData(results: any) {
    this.templateSetDataSubject$.next(results);
    return results;
  }

  private savetemplateSetDataSubject$ = new ReplaySubject<any>(1);
  public savetemplateSetData$ = this.savetemplateSetDataSubject$.asObservable();

  async saveTemplateData(templateData: TemplateModel) {

    const url = `${environment.eKardexApiUrl}/admission/saveTemplateSet`;

    const saveTemplateData$ = this.http.post(url, templateData, { withCredentials: true })
      .pipe(
        tap((data: any) => {
          this.processSaveTemplateSetData(data?.d.results)
        }),
        catchError((error: HttpErrorResponse) => {
          console.error(error);
          return throwError(() => error);
        })
      );

    await lastValueFrom(saveTemplateData$);
  }

  processSaveTemplateSetData(results: any) {
    this.savetemplateSetDataSubject$.next(results);
    return results;
  }

  cancelReasonList() {
    const url = `${environment.eKardexApiUrl}/admission/getCancelReasonSet`;
    return this.http.get(url, {
      withCredentials: true,
    });
  }

  saveTemplate(json) {
    const url = `${environment.eKardexApiUrl}/admission/saveTemplateSet`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }
  saveProgressNotesTemplate(json) {
    const url = `${environment.eKardexApiUrl}/admission/saveProgressNotesTemplate`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }
  // Diagnosis Code Search API
  searchDiagnosis(search: string) {
    const url = `${environment.eKardexApiUrl}/admission/getDiagnosisCodeSet?searchstring=${search}`;
    return this.http.get(url, {
      withCredentials: true,
    });
  }

  saveDiagnosis(diagnosis: any) {
    const url = `${environment.eKardexApiUrl}/admission/saveDiagnosisSet`;
    return this.http.post(url, diagnosis, {
      withCredentials: true,
    });
  }

  // For Get Diagnosis List
  private diagnosislistDataSubject$ = new ReplaySubject<any>(1);
  public diagnosislistData$ = this.diagnosislistDataSubject$.asObservable();

  async getDiagnosisSetDataSet(institutionid: string, caseid: string) {
    await lastValueFrom(this.getDiagnosisSet(institutionid, caseid));
  }

  getDiagnosisSet(institutionid: string, caseid: string) {
    const url = `${environment.eKardexApiUrl}/admission/getDiagnosisSet?institutionid=${institutionid}&caseid=${caseid}`;

    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => this.processDiagnosisSetData(data?.d.results)),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  processDiagnosisSetData(results: any) {
    this.diagnosislistDataSubject$.next(results);
    return results;
  }

  getDiagnosisList(institutionid: string, caseid: string, patientId: string) {
    const url = `${environment.eKardexApiUrl}/admission/getDiagnosisSet?institutionid=${institutionid}&caseid=${caseid}&patnr=${patientId}`;
    return this.http.get(url, {
      withCredentials: true,
    });
  }

  // Diagnosis favorite Modal
  private diagnosisFavoriteDataSubject$ = new ReplaySubject<any>(1);
  public diagnosisFavoriteData$ = this.diagnosisFavoriteDataSubject$.asObservable();

  async getDiagnosisFavoriteSetDataSet(patientId: string) {
    await lastValueFrom(this.getDiagnosisFavSet(patientId));
  }

  getDiagnosisFavSet(patientId: string) {
    const url = `${environment.eKardexApiUrl}/admission/getDiagnosisImport?patientId=${patientId}`;

    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => this.processDiagnosisFavSetData(data?.d.results)),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  processDiagnosisFavSetData(results: any) {
    this.diagnosisFavoriteDataSubject$.next(results);
    return results;
  }

  getFavrDiagnosisList(orgId: string, einri: string, type: string) {
    const url = `${environment.eKardexApiUrl}/admission/getFavrDiagnosisSet?orgid=${orgId}&einri=${einri}&type=${type}`;

    return this.http.get(url, {
      withCredentials: true,
    });
  }

  favDiagnosisAction(diagnosis: any) {
    const url = `${environment.eKardexApiUrl}/admission/updateDiagnosisFavrOUSet`;
    return this.http.post(url, diagnosis, {
      withCredentials: true,
    });
  }

  selectCurrentDocumentData(item) {
    if (this.selectedCurrentDocDetails?.Dockey == item?.Dockey) this.selectedCurrentDocDetails = '';
    else this.selectedCurrentDocDetails = item;
  }

  educationAddForm(actionType: string) {
    // if(this.selectedCurrentDocDetails.DtidText == "Document Attachmen" && actionType == "add"){
    //   this.popupdata.openModalForSpecialNotes
    // }
    if (this.selectedCurrentDocDetails) {
      if (this.selectedCurrentDocDetails.NodocText == 'N/A' && actionType == 'edit') {
        return;
      }

      if (this.selectedCurrentDocDetails.Dtid == 'ZMED_EDUAS') {
        if (this.selectedCurrentDocDetails.DokstText === 'Released' && actionType == 'edit') return;
        if (actionType == 'edit') {
          this.isEditEducationAsset = true;
        } else {
          this.isEditEducationAsset = false;
        }

        if (actionType == 'clone' && this.selectedCurrentDocDetails.DokstText != 'Released') return;
        this.isAddEditEducationAsset = !this.isAddEditEducationAsset;

        if (actionType == 'clone') {
          this.isCloneEducationAsset = true;
        } else {
          this.isCloneEducationAsset = false;
        }
      } else if (this.selectedCurrentDocDetails.Dtid == 'ZMED_MEDRP') {
        this.isAddEditMedicalForm = !this.isAddEditMedicalForm;
        if (this.selectedCurrentDocDetails.DokstText === 'Released' && actionType == 'edit') return;
        if (actionType == 'edit') {
          this.isEditMedicalDoc = true;
        } else {
          this.isEditMedicalDoc = false;
        }

        if (actionType == 'clone' && this.selectedCurrentDocDetails.DokstText != 'Released') return;

        if (actionType == 'clone') {
          this.isCloneMedicalDoc = true;
        } else {
          this.isCloneMedicalDoc = false;
        }
      } else if (this.selectedCurrentDocDetails.Dtid == 'ZMED_PHASM') {
        if (this.selectedCurrentDocDetails.DokstText === 'Released' && actionType == 'edit') return;
        if (actionType == 'edit') {
          this.isEditPhysicianForm = true;
        } else {
          this.isEditPhysicianForm = false;
        }

        if (actionType == 'clone' && this.selectedCurrentDocDetails.DokstText != 'Released') return;
        this.isAddEditPhysicianForm = !this.isAddEditPhysicianForm;
        if (actionType == 'clone') {
          this.isClonePhysicianForm = true;
        } else {
          this.isClonePhysicianForm = false;
        }
      } else if (this.selectedCurrentDocDetails.Dtid == 'ZMED_SOAP') {
        if (this.selectedCurrentDocDetails.DokstText === 'Released' && actionType == 'edit') return;
        if (actionType == 'edit') {
          this.isEditSoapDoc = true;
        } else {
          this.isEditSoapDoc = false;
        }

        if (actionType == 'clone' && this.selectedCurrentDocDetails.DokstText != 'Released') return;
        this.isAddEditSopaDocument = !this.isAddEditSopaDocument;

        if (actionType == 'clone') {
          this.isCloneSoapDoc = true;
        } else {
          this.isCloneSoapDoc = false;
        }
      } else if (this.selectedCurrentDocDetails.Dtid == 'ZMED_PHDIS') {
        if (this.selectedCurrentDocDetails.DokstText === 'Released' && actionType == 'edit') return;
        if (actionType == 'edit') {
          this.isEditDischargeSummery = true;
        } else {
          this.isEditDischargeSummery = false;
        }

        if (actionType == 'clone' && this.selectedCurrentDocDetails.DokstText != 'Released') return;
        this.isAddEditDischargeSummery = !this.isAddEditDischargeSummery;

        if (actionType == 'clone') {
          this.isCloneDischargeSummery = true;
        } else {
          this.isCloneDischargeSummery = false;
        }
      } else if (this.selectedCurrentDocDetails.Dtid == 'ZMED_NEODS') {
        if (this.selectedCurrentDocDetails.DokstText === 'Released' && actionType == 'edit') return;
        if (actionType == 'edit') {
          this.isEditNeonatalDischarge = true;
        } else {
          this.isEditNeonatalDischarge = false;
        }

        if (actionType == 'clone' && this.selectedCurrentDocDetails.DokstText != 'Released') return;
        this.isAddEditNeonatalDischarge = !this.isAddEditNeonatalDischarge;

        if (actionType == 'clone') {
          let valueObj = {
            type: WordType.CopyBS,
            docKey: this.selectedCurrentDocDetails.Dockey
          }
          this.dataShareService.sendActionType(ActionType.Update$, true, valueObj);
          this.isCloneNeonatalDischarge = true;
        } else {
          this.isCloneNeonatalDischarge = false;
        }
      } else if (this.selectedCurrentDocDetails.Dtid == 'ZMED_OBPPT') {
        if (this.selectedCurrentDocDetails.DokstText === 'Released' && actionType == 'edit') return;
        if (actionType == 'edit') {
          this.isEditObstetricRisk = true;
        } else {
          this.isEditObstetricRisk = false;
        }

        if (actionType == 'clone' && this.selectedCurrentDocDetails.DokstText != 'Released') return;
        this.isAddEditObstetricRisk = !this.isAddEditObstetricRisk;

        if (actionType == 'clone') {
          this.isCloneObstetricRisk = true;
        } else {
          this.isCloneObstetricRisk = false;
        }
      } else if (this.selectedCurrentDocDetails.Dtid == 'ZMED_OBANT') {
        if (this.selectedCurrentDocDetails.DokstText === 'Released' && actionType == 'edit') return;
        if (actionType == 'edit') {
          this.isEditObsVteAnt = true;
        } else {
          this.isEditObsVteAnt = false;
        }

        if (actionType == 'clone' && this.selectedCurrentDocDetails.DokstText != 'Released') return;
        this.isAddEditObsVteAnt = !this.isAddEditObsVteAnt;

        if (actionType == 'clone') {
          this.isCloneObsVteAnt = true;
        } else {
          this.isCloneObsVteAnt = false;
        }
      } else if (this.selectedCurrentDocDetails.Dtid == 'ZMED_OBPHY') {
        if (this.selectedCurrentDocDetails.DokstText === 'Released' && actionType == 'edit') return;
        if (actionType == 'edit') {
          this.isEditObsGynDoc = true;
        } else {
          this.isEditObsGynDoc = false;
        }

        if (actionType == 'clone' && this.selectedCurrentDocDetails.DokstText != 'Released') return;
        this.isAddEditObsGynForm = !this.isAddEditObsGynForm;
        if (actionType == 'clone') {
          this.isCloneObsGynDoc = true;
        } else {
          this.isCloneObsGynDoc = false;
        }
      } else if (this.selectedCurrentDocDetails.Dtid == 'ZMED_ORRPT') {
        if (this.selectedCurrentDocDetails.DokstText === 'Released' && actionType == 'edit') {
          this.isEditOperationReport = false;
          return;
        }
        if (actionType == 'edit') {
          this.isEditOperationReport = true;
        } else {
          this.isEditOperationReport = false;
        }

        if (actionType == 'clone' && this.selectedCurrentDocDetails.DokstText != 'Released') return;
        this.isAddEditOperationReport = !this.isAddEditOperationReport;

        if (actionType == 'clone') {
          this.isCloneOperationReport = true;
        } else {
          this.isCloneOperationReport = false;
        }
      } else if (this.selectedCurrentDocDetails.Dtid == 'ZMED_NEOPN') {
        if (this.selectedCurrentDocDetails.DokstText === 'Released' && actionType == 'edit') {
          return;
        }
        if (actionType == 'edit') {
          this.isEditNeonatal = true;
        } else {
          this.isEditNeonatal = false;
        }

        if (actionType == 'clone' && this.selectedCurrentDocDetails.DokstText != 'Released') return;
        this.isAddEditNeonatal = !this.isAddEditNeonatal;
        if (actionType == 'clone') {
          this.isCloneNeonatal = true;
        } else {
          this.isCloneNeonatal = false;
        }
      }
      else if (this.selectedCurrentDocDetails.Dtid == 'ZMED_NEOMD') {
        if (this.selectedCurrentDocDetails.DokstText === 'Released' && actionType == 'edit') {
          return;
        }
        if (actionType == 'edit') {
          this.isEditNeonatalMR = true;
        } else {
          this.isEditNeonatalMR = false;
        }

        if (actionType == 'clone' && this.selectedCurrentDocDetails.DokstText != 'Released') return;
        this.isAddEditNeonatalMR = !this.isAddEditNeonatalMR;
        if (actionType == 'clone') {
          this.isCloneNeonatalMR = true;
        } else {
          this.isCloneNeonatalMR = false;
        }
      }
      else if (this.selectedCurrentDocDetails.Dtid == 'ZMED_VISIT') {
        if (this.selectedCurrentDocDetails.DokstText === 'Released' && actionType == 'edit') {
          return;
        }

        if (actionType == 'edit') {
          this.isEditVisitForm = true;
        } else {
          this.isEditVisitForm = false;
        }

        if (actionType == 'clone' && this.selectedCurrentDocDetails.DokstText != 'Released') return;
        this.isAddEditDocVisitForm = !this.isAddEditDocVisitForm;
        if (actionType == 'clone') {
          this.isCloneVisitForm = true;
        } else {
          this.isCloneVisitForm = false;
        }
      }
      else if (this.selectedCurrentDocDetails.Dtid == 'ZMED_TRFAS') {
        if (this.selectedCurrentDocDetails.DokstText === 'Released' && actionType == 'edit') {
          return;
        }

        if (actionType == 'edit') {
          this.isEditTransferAssestForm = true;
        } else {
          this.isEditTransferAssestForm = false;
        }

        if (actionType == 'clone' && this.selectedCurrentDocDetails.DokstText != 'Released') return;
        this.isAddEditTransferAssestForm = !this.isAddEditTransferAssestForm;
        if (actionType == 'clone') {
          this.isCloneTransferAssestForm = true;
        } else {
          this.isCloneTransferAssestForm = false;
        }
      } else if (this.selectedCurrentDocDetails.Dtid == 'ZMED_NICAD') {
        if (this.selectedCurrentDocDetails.DokstText === 'Released' && actionType == 'edit') {
          return;
        }

        if (actionType == 'edit') {
          this.isEditNicuForm = true;
        } else {
          this.isCloneNicuForm = false;
        }

        if (actionType == 'clone' && this.selectedCurrentDocDetails.DokstText != 'Released') return;
        this.isAddNicuForm = !this.isAddNicuForm;
        if (actionType == 'clone') {
          this.isCloneNicuForm = true;
        } else {
          this.isCloneNicuForm = false;
        }
      } else if (this.selectedCurrentDocDetails.Dtid == 'ZMED_NBASM') {
        if (this.selectedCurrentDocDetails.DokstText === 'Released' && actionType == 'edit') {
          return;
        }

        if (actionType == 'edit') {
          this.isEditBornForm = true;
        } else {
          this.isCloneNewBornForm = false;
        }

        if (actionType == 'clone' && this.selectedCurrentDocDetails.DokstText != 'Released') return;
        this.isNewBornForm = !this.isNewBornForm;
        if (actionType == 'clone') {
          this.isCloneNewBornForm = true;
        } else {
          this.isCloneNewBornForm = false;
        }
      }
      else if (this.selectedCurrentDocDetails.Dtid == 'ZMED_PDASM') {
        if (this.selectedCurrentDocDetails.DokstText === 'Released' && actionType == 'edit') {
          return;
        }

        if (actionType == 'edit') {
          this.isEditPaediatricsAdmissionForm = true;
        } else {
          this.isClonePaediatricsAdmissionForm = false;
        }

        if (actionType == 'clone' && this.selectedCurrentDocDetails.DokstText != 'Released') return;
        this.isAddEditDocPaediatricsAdmissionForm = !this.isAddEditDocPaediatricsAdmissionForm;
        if (actionType == 'clone') {
          this.isClonePaediatricsAdmissionForm = true;
        } else {
          this.isClonePaediatricsAdmissionForm = false;
        }
      }
      else if (this.selectedCurrentDocDetails.Dtid == 'ZMED_ATCHM') {
        this.document.next(true);
      }
    }
  }

  cancelAllForm() {
    this.isAddEditEducationForm = false;
    this.isAddEditMedicalForm = false;
    this.isAddEditPhysicianForm = false;
    this.isCloneSoapDoc = false;
    this.isEditSoapDoc = false;
    this.isAddEditSopaDocument = false;
    this.isAddEditDischargeSummery = false;
    this.isEditDischargeSummery = false;
    this.isEditDischargeSummery = false;
    this.isAddEditObstetricRisk = false;
    this.isEditObstetricRisk = false;
    this.isEditObstetricRisk = false;
    this.isPDFObstetricRisk = false;
    this.isCloneObsVteAnt = false;
    this.isAddEditObsVteAnt = false;
    this.isEditObsVteAnt = false;
    this.isPDFObsVteAnt = false;
    this.isAddEditEducationAsset = false;
    this.isCloneEducationAsset = false;
    this.isEditEducationAsset = false;
    this.isAddEditObsGynForm = false;
    this.isEditObsGynDoc = false;
    this.isCloneObsGynDoc = false;
    this.isAddEditOperationReport = false;
    this.isEditOperationReport = false;
    this.isCloneOperationReport = false;
    this.isAddEditNeonatal = false;
    this.isEditNeonatal = false;
    this.isCloneNeonatal = false;
    this.isAddEditNeonatalMR = false;
    this.isEditNeonatalMR = false;
    this.isCloneNeonatalMR = false;
    this.isEditPhysicianForm = false;
    this.isClonePhysicianForm = false;
    this.selectedCurrentDocDetails = '';
    this.isClearSelectedDoc.next(true);
    this.clearSoapEvent.next(true);
    this.isAddEditDocVisitForm = false;
    this.isCloneVisitForm = false;
    this.isEditVisitForm = false;

    this.isCloneNeonatalDischarge = false;
    this.isEditNeonatalDischarge = false;
    this.isAddEditNeonatalDischarge = false;
    this.isAddEditTransferAssestForm = false;
    this.isEditTransferAssestForm = false;
    this.isCloneTransferAssestForm = false;
    this.isAddNicuForm = false;
    this.isEditNicuForm = false;
    this.isCloneNicuForm = false;

    this.isNewBornForm = false;
    this.isEditBornForm = false;
    this.isCloneNewBornForm = false;

    this.isEditPaediatricsAdmissionForm = false;
    this.isAddEditDocPaediatricsAdmissionForm = false;
    this.isClonePaediatricsAdmissionForm = false;

  }

  clearVarValue() {
    this.isAddEditEducationForm = false;
    this.isAddEditMedicalForm = false;
    this.isAddEditPhysicianForm = false;
    this.isCloneSoapDoc = false;
    this.isEditSoapDoc = false;
    this.isAddEditSopaDocument = false;
    this.isAddEditDischargeSummery = false;
    this.isEditDischargeSummery = false;
    this.isEditDischargeSummery = false;
    this.isAddEditObstetricRisk = false;
    this.isEditObstetricRisk = false;
    this.isEditObstetricRisk = false;
    this.isPDFObstetricRisk = false;
    this.isCloneObsVteAnt = false;
    this.isAddEditObsVteAnt = false;
    this.isEditObsVteAnt = false;
    this.isPDFObsVteAnt = false;
    this.isAddEditEducationAsset = false;
    this.isCloneEducationAsset = false;
    this.isEditEducationAsset = false;
    this.isAddEditObsGynForm = false;
    this.isEditObsGynDoc = false;
    this.isCloneObsGynDoc = false;
    this.isAddEditNeonatal = false;
    this.isEditNeonatal = false;
    this.isCloneNeonatal = false;
    this.isAddEditNeonatalMR = false;
    this.isEditNeonatalMR = false;
    this.isCloneNeonatalMR = false;
    this.isEditPhysicianForm = false;
    this.isClonePhysicianForm = false;
    this.isAddEditDocVisitForm = false;
    this.isCloneVisitForm = false;
    this.isEditVisitForm = false;

    this.isCloneNeonatalDischarge = false;
    this.isEditNeonatalDischarge = false;
    this.isAddEditNeonatalDischarge = false;

    this.isEditPaediatricsAdmissionForm = false;
    this.isAddEditDocPaediatricsAdmissionForm = false;
    this.isClonePaediatricsAdmissionForm = false;
  }

  //getDocumentDetails

  getDicumentDetails(einri: string, type: string, patnr: string, dodate: string, falnr: string) {
    const url = `${environment.eKardexApiUrl}/admission/getProfileDocsSet?einri=${einri}&type=${type}&patnr=${patnr}&falnr=${falnr}&dodate=${dodate}`;
    return this.http.get(url, {
      withCredentials: true,
    });
  }

  getDocuEducationDetails(dockey: string) {
    const url = `${environment.eKardexApiUrl}/admission/getEduAssesSet?dockey=${dockey}`;
    return this.http.get(url, {
      withCredentials: true,
    });
  }

  deleteEducationDetails(id: string) {
    const url = `${environment.eKardexApiUrl}/admission/deleteEduAssesSet/${id}`;
    return this.http.delete(url, {
      withCredentials: true,
    });
  }

  saveEducationData(education) {
    const url = `${environment.eKardexApiUrl}/admission/saveEduAssesSet`;
    return this.http.post(url, education, {
      withCredentials: true,
    });
  }
  getEducationPDF(dockey: string) {
    const url = `${environment.eKardexApiUrl}/admission/getPDFFileSet?dockey=${dockey}`;
    return this.http.get(url, {
      withCredentials: true,
    });
  }
  getSoapPDF(dockey: string) {
    const url = `${environment.eKardexApiUrl}/admission/getPDFFileSoapSet?dockey=${dockey}`;
    return this.http.get(url, {
      withCredentials: true,
    });
  }
  getPatientProfilePDF(dockey: string) {
    const url = `${environment.eKardexApiUrl}/admission/getPatientProfilePDFFileSet?dockey=${dockey}`;
    return this.http.get(url, {
      withCredentials: true,
    });
  }
  getDischargeSummarySet(paramsObj) {
    return this.http.get(`${environment.eKardexApiUrl}/inpatientData/getDischargeSummarySet?Einri=${paramsObj.einri}&Falnr=${paramsObj.falnr}`, { withCredentials: true })
  }

  saveInPatientPhdisData(data: any, userConfiguration: any, paramsObj) {
    const payloadData = {
      Dockey: data.patientFormData.Dockey !== undefined ? data.patientFormData.Dockey : "",
      Einri: paramsObj.einri,
      Patnr: paramsObj.patnr,
      Falnr: paramsObj.falnr,
      Orgdo: "",
      Mitarb: "",
      Dtid: "",
      Dtvers: "",
      Dodat: `\/Date(${new Date().getTime()})\/`,
      Dotim: "PT17H55M55S",
      Erusr: userConfiguration.UserId,
      Erdat: `\/Date(${new Date().getTime()})\/`,
      Dokst: "",
      Lfdbew: paramsObj.lfdnr,
      Orgfa: "",
      Orgpf: "",
      Released: data.releaseForm
    }
    const payload = { ...payloadData, ToFormData: { results: [data.patientFormData] }, ToDiagnosis: { results: [] }, ToHospitalMed: { results: [] }, ToDischargeMed: { results: [] } };
    const url = `${environment.eKardexApiUrl}/inpatientData/saveReleaseDischargeSummarySet`;
    return this.http.post(url, payload, { withCredentials: true });
    // const savePatientConfig$ = this.http.post(url, payload, { withCredentials: true })
    //   .pipe(
    //     // tap((data) => {
    //     //   console.log('test',data);
    //     //   //this.getListOfAllPatientVisitDataSet();
    //     // }),
    //     map((data: any) => {
    //       console.log(data)
    //        return data }),
    //     catchError((error: HttpErrorResponse) => {
    //       console.error(error);
    //       return throwError(() => error);
    //     })
    //   );
    // await lastValueFrom(savePatientConfig$)
  }

  getPatientVisitDataByDocKey(docKey: string, einri: string, patnr: string): Observable<InPatientDataResult> {
    const url = this.getUrlInPatientVisitDataByDocKey(
      einri,
      patnr,
      docKey
    );
    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => { return data.d }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }


  getUrlInPatientVisitDataByDocKey(
    einri: string,
    patnr: string,
    docKey: string
  ) {
    return `${environment.eKardexApiUrl}/inPatientData/getInPatientDocumentSet?einri=${einri}&patnr=${patnr}&docKey=${docKey}`;
  }

  updateInPatientPhdisData(data: any, userConfiguration: any, paramsObj) {
    const payloadData = {
      Dockey: data.patientFormData.Dockey !== undefined ? data.patientFormData.Dockey : "",
      Einri: paramsObj.einri,
      Patnr: paramsObj.patnr,
      Falnr: paramsObj.falnr,
      Orgdo: "",
      Mitarb: "",
      Dtid: "",
      Dtvers: "",
      Dodat: `\/Date(${new Date().getTime()})\/`,
      Dotim: "PT17H55M55S",
      Erusr: userConfiguration.UserId,
      Erdat: `\/Date(${new Date().getTime()})\/`,
      Dokst: "",
      Lfdbew: paramsObj.lfdnr,
      Orgfa: "",
      Orgpf: "",
      Released: data.releaseForm
    }
    const payload = { ...payloadData, ToFormData: { results: [data.patientFormData] }, ToDiagnosis: { results: [] }, ToHospitalMed: { results: [] }, ToDischargeMed: { results: [] } };
    const url = `${environment.eKardexApiUrl}/inpatientData/updateReleaseDischargeSummarySet`;
    return this.http.put(url, payload, { withCredentials: true });
    // const savePatientConfig$ = this.http.post(url, payload, { withCredentials: true })
    //   .pipe(
    //     // tap((data) => {
    //     //   console.log('test',data);
    //     //   //this.getListOfAllPatientVisitDataSet();
    //     // }),
    //     map((data: any) => {
    //       console.log(data)
    //        return data }),
    //     catchError((error: HttpErrorResponse) => {
    //       console.error(error);
    //       return throwError(() => error);
    //     })
    //   );
    // await lastValueFrom(savePatientConfig$)
  }

  // obstetric Form API

  getObstetricData(docKey: string) {
    return this.http.get(`${environment.eKardexApiUrl}/eHospitalist/getObpptSet?docKey=${docKey}`, { withCredentials: true }).pipe(
      map((data: any) => { return data.d }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  createObstetricDoc(payload: any) {
    return this.http.post(`${environment.eKardexApiUrl}/eHospitalist/createObpptSet`, payload, { withCredentials: true }).pipe(
      map((data: any) => { return data.d }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  // updateObstetricDoc(payload: any) {
  //   return this.http.post(`${environment.eKardexApiUrl}/eHospitalist/updateObpptSet`, payload, { withCredentials: true }).pipe(
  //     map((data: any) => { return data.d }),
  //     catchError((error: HttpErrorResponse) => {
  //       console.error(error);
  //       return throwError(error);
  //     })
  //   );
  // }

  updateObstetricDoc(payload) {
    const url = `${environment.eKardexApiUrl}/eHospitalist/updateObpptSet`;
    return this.http.post(url, payload, {
      withCredentials: true,
    });
  }

  // deleteObstetricDoc(dockey: any) {
  //   return this.http.delete(`${environment.eKardexApiUrl}/eHospitalist/deleteObpptSet/${dockey}`, { withCredentials: true }).pipe(
  //     map((data: any) => { return data.d }),
  //     catchError((error: HttpErrorResponse) => {
  //       console.error(error);
  //       return throwError(error);
  //     })
  //   );
  // }

  deleteObstetricDoc(dockey) {
    const url = `${environment.eKardexApiUrl}/eHospitalist/deleteObpptSet/${dockey}`;
    return this.http.delete(url, {
      withCredentials: true,
    });
  }

  // API for OBS-VTE-ANT

  createObsVteAnt(payload) {
    return this.http.post(`${environment.eKardexApiUrl}/eHospitalist/createObantSet`, payload, { withCredentials: true }).pipe(
      map((data: any) => { return data.d }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  getObsVteAntData(docKey: string) {
    return this.http.get(`${environment.eKardexApiUrl}/eHospitalist/getObantSet?docKey=${docKey}`, { withCredentials: true }).pipe(
      map((data: any) => { return data.d }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  updateObsVteAntDoc(payload) {
    const url = `${environment.eKardexApiUrl}/eHospitalist/updateObantSet`;
    return this.http.post(url, payload, {
      withCredentials: true,
    });
  }

  deleteObsVteAnt(dockey) {
    const url = `${environment.eKardexApiUrl}/eHospitalist/deleteObantSet/${dockey}`;
    return this.http.delete(url, {
      withCredentials: true,
    });
  }


  deleteOperationReportDoc(dockey) {
    const url = `${environment.eKardexApiUrl}/inpatientData/deleteInPatientData/${dockey}`;
    return this.http.delete(url, {
      withCredentials: true,
    });
  }

  saveOperationReport(data: any, userConfiguration: UserConfig, documentType: boolean, paramsObject: any, Dockey: any) {
    const payloadData = {
      DocKey: data.patientFormData.DocKey !== undefined ? data.patientFormData.DocKey : "",
      Dtid: 'ZMED_ORRPT',
      DtidText: "",
      Dodat: `\/Date(${new Date().getTime()})\/`,
      Dokst: "",
      Dokvr: "",
      Einri: paramsObject.einri,
      Patnr: paramsObject.patnr,
      Falnr: paramsObject.falnr,
      Orgdo: localStorage.getItem('initOrg'),
      Lfdnr: paramsObject.lfdnr,
      Visitdate: null,
      Referredby: "",
      Mitarbname: userConfiguration.UserId,
      Mitarb: userConfiguration.VMA,
      Released: documentType,
      Etag: "",
      Erdattim: `\/Date(${new Date().getTime()})\/`,
    }

    const payload = { ...payloadData, PATDOCTOOPERRPTDOCDETAIL: { results: [data.patientFormData] }, DOCCATTOATTACHMENTS: { results: [] }, PATDOCTOPOSTOPERATIVEDX: { results: [] }, PATDOCTOPREOPERATIVEDX: { results: [] }, PATDOCTOSURGICALTEAM: { results: data.surgeryData ? data.surgeryData : [] } };

    const url = `${environment.eKardexApiUrl}/inpatientData/saveInPatientDataSet`;
    return this.http.post(url, payload, {
      withCredentials: true,
    });
  }

  getSurgeryPopupData(obj: any) {
    const url = `${environment.eKardexApiUrl}/inPatientData/getSurgeryTeamData?SequenceNumberMovem=${obj.lfdnr}&CaseNumber=${obj.falnr}`
    return this.http.get(url, { withCredentials: true })
  }

  // dicumentation release arrow
  getReleaseHistoryData(data: any, einri: any) {
    const url = `${environment.eKardexApiUrl}/patientData/getHistoryOfPatientData?Einri=${einri}&DocKey=${data}`;
    return this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => data?.d.results),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  parsePayloadFormateTime(data: string) {
    if (data && data.length) {
      const strArr: string[] = data.split(':');
      if (data && data.length === 8) {
        return `PT${strArr[0]}H${strArr[1]}M${strArr[2]}S`;
      }
    }
    return null;
  }

  parseTime(data: string) {
    if (data && data.length) {
      const strArr: string[] = data.split('');
      if (
        data &&
        data.length === 11 &&
        strArr[4] === 'H' &&
        strArr[7] === 'M' &&
        strArr[10] === 'S' &&
        !isNaN(+(strArr[2] + strArr[3])) &&
        !isNaN(+(strArr[5] + strArr[6])) &&
        !isNaN(+(strArr[8] + strArr[9]))
      ) {
        const hours =
          +(strArr[2] + strArr[3]) <= 9
            ? `0${+(strArr[2] + strArr[3])}`
            : +(strArr[2] + strArr[3]);
        const Minute =
          +(strArr[5] + strArr[6]) <= 9
            ? `0${+(strArr[5] + strArr[6])}`
            : +(strArr[5] + strArr[6]);
        const Second =
          +(strArr[8] + strArr[9]) <= 9
            ? `0${+(strArr[8] + strArr[9])}`
            : +(strArr[8] + strArr[9]);
        return `${hours}:${Minute}:${Second}`;
      }
    }
    return null;
  }

  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }

  // obs gyn apis

  createObsGyn(payload) {
    return this.http.post(`${environment.eKardexApiUrl}/eHospitalist/createObsGyn`, payload, { withCredentials: true }).pipe(
      map((data: any) => { return data.d }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  getObsGynData(json) {
    return this.http.post(`${environment.eKardexApiUrl}/eHospitalist/getObsGynData`, json, { withCredentials: true }).pipe(
      map((data: any) => { return data.d }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }
  updateObsGynDoc(json) {
    const url = `${environment.eKardexApiUrl}/eHospitalist/updateObsGynDoc`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }
  deleteObsGynDoc(json): Observable<any> {
    const url = `${environment.eKardexApiUrl}/eHospitalist/deleteObsGynDoc`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }
  releaseObsGynDoc(json): Observable<any> {
    const url = `${environment.eKardexApiUrl}/eHospitalist/releaseObsGynDoc`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }
  getObsGynReleasedPdf(json): Observable<any> {
    const url = `${environment.eKardexApiUrl}/eHospitalist/getObsGynReleasedPdf`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }
  //
  // new natal apis

  createNeoNatalDoc(payload) {
    return this.http.post(`${environment.eKardexApiUrl}/eHospitalist/createNeoNatalDoc`, payload, { withCredentials: true }).pipe(
      map((data: any) => { return data.d }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  getNeoNatalData(json) {
    return this.http.post(`${environment.eKardexApiUrl}/eHospitalist/getNeoNatalData`, json, { withCredentials: true }).pipe(
      map((data: any) => { return data }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }
  updateNeoNatalDoc(json) {
    const url = `${environment.eKardexApiUrl}/eHospitalist/updateNeoNatalDoc`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }
  deleteNeoNatalDoc(json): Observable<any> {
    const url = `${environment.eKardexApiUrl}/eHospitalist/deleteNeoNatalDoc`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }
  releaseNeoNatalDoc(json): Observable<any> {
    const url = `${environment.eKardexApiUrl}/eHospitalist/releaseNeoNatalDoc`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }
  getNeoNatalReleasedPdf(json): Observable<any> {
    const url = `${environment.eKardexApiUrl}/eHospitalist/getNeoNatalReleasedPdf`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }
  //
  // neo natal medical reportapis

  createNeoNatalMRDoc(payload) {
    return this.http.post(`${environment.eKardexApiUrl}/eHospitalist/createNeoNatalMRDoc`, payload, { withCredentials: true }).pipe(
      map((data: any) => { return data.d }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  getNeoNatalMRData(json) {
    return this.http.post(`${environment.eKardexApiUrl}/eHospitalist/getNeoNatalMRData`, json, { withCredentials: true }).pipe(
      map((data: any) => { return data }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }
  updateNeoNatalMRDoc(json) {
    const url = `${environment.eKardexApiUrl}/eHospitalist/updateNeoNatalMRDoc`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }
  deleteNeoNatalMRDoc(json): Observable<any> {
    const url = `${environment.eKardexApiUrl}/eHospitalist/deleteNeoNatalMRDoc`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }
  releaseNeoNatalMRDoc(json): Observable<any> {
    const url = `${environment.eKardexApiUrl}/eHospitalist/releaseNeoNatalMRDoc`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }
  getNeoNatalMRReleasedPdf(json): Observable<any> {
    const url = `${environment.eKardexApiUrl}/eHospitalist/getNeoNatalMRReleasedPdf`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }
  // phycian report

  getPhysicianData(json) {
    return this.http.post(`${environment.eKardexApiUrl}/eHospitalist/getPhysicianAssessDoc`, json, { withCredentials: true }).pipe(
      map((data: any) => { return data.d }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  createPhysicianData(json) {
    return this.http.post(`${environment.eKardexApiUrl}/eHospitalist/createPhysicianAssessDoc`, json, { withCredentials: true }).pipe(
      map((data: any) => { return data }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  updatePhysicianData(json) {
    return this.http.post(`${environment.eKardexApiUrl}/eHospitalist/updatePhysicianAssessDoc`, json, { withCredentials: true }).pipe(
      map((data: any) => { return data }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  releasePhysicianDoc(json): Observable<any> {
    const url = `${environment.eKardexApiUrl}/eHospitalist/releasePhysicianAssessDoc`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }
  deletePhysicianAssessDoc(json): Observable<any> {
    const url = `${environment.eKardexApiUrl}/eHospitalist/deletePhysicianAssessDoc`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }

  deleteVisitNoteDocument(json): Observable<any> {
    const url = `${environment.eKardexApiUrl}/admission/deleteVisitNotDocument/${json}`;
    return this.http.delete(url, {
      withCredentials: true,
    });
  }
  getPhysicianAssessDocPDF(json): Observable<any> {
    const url = `${environment.eKardexApiUrl}/eHospitalist/getPhysicianAssessDocPDF`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }
  getTransferAssSetDocPDF(json): Observable<any> {
    const url = `${environment.eKardexApiUrl}/eHospitalist/getTransferAssSetDocPDF`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }
  getNicuAddNoteDocPDF(json): Observable<any> {
    const url = `${environment.eKardexApiUrl}/eHospitalist/getNicuAddNoteDocPDF`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }


  releaseVisitNoteDoc(json) {
    const url = `${environment.eKardexApiUrl}/admission/releaseVisitNoteDocument`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }

  saveVisitNoteDoc(education) {
    const url = `${environment.eKardexApiUrl}/admission/saveVisitNoteDocument`;
    return this.http.post(url, education, {
      withCredentials: true,
    });
  }


  // Transefer Assessment

  getTansferAssessData(json) {
    return this.http.get(`${environment.eKardexApiUrl}/eHospitalist/getTransferAssessDoc?docKey=${json.Dockey}`, { withCredentials: true }).pipe(
      map((data: any) => { return data.d }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  createTansferAssessData(json) {
    return this.http.post(`${environment.eKardexApiUrl}/eHospitalist/createTransferAssessDoc`, json, { withCredentials: true }).pipe(
      map((data: any) => { return data }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }
  updateTransferDoc(json) {
    return this.http.post(`${environment.eKardexApiUrl}/eHospitalist/updateTransferDoc`, json, { withCredentials: true }).pipe(
      map((data: any) => { return data }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }
  releaseTransferDoc(json) {
    return this.http.post(`${environment.eKardexApiUrl}/eHospitalist/releaseTransferDoc`, json, { withCredentials: true }).pipe(
      map((data: any) => { return data }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }


  deleteTransferDoc(json): Observable<any> {
    const url = `${environment.eKardexApiUrl}/eHospitalist/deleteTransferDoc`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }

  getNewBornDocument(Dockey) {
    return this.http.get(`${environment.eKardexApiUrl}/getNewBornDocument?Dockey=${Dockey}`, { withCredentials: true }).pipe(
      map((data: any) => { return data.d }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }
  geturinaryDocument(Dockey) {
    return this.http.get(`${environment.eKardexApiUrl}/getBundlesDetail?Dockey=${Dockey}`, { withCredentials: true }).pipe(
      map((data: any) => { return data.d }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }
  getCvcMainDetail(Dockey) {
    return this.http.get(`${environment.eKardexApiUrl}/getCvcMainDetail?Dockey=${Dockey}`, { withCredentials: true }).pipe(
      map((data: any) => { return data.d }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }
  getIntraOpNurRecSetDetail(Dockey) {
    return this.http.get(`${environment.eKardexApiUrl}/getIntraOpNurRecSetDetail?Dockey=${Dockey}`, { withCredentials: true }).pipe(
      map((data: any) => { return data.d }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }
  getMewsSetDetail(Dockey) {
    return this.http.get(`${environment.eKardexApiUrl}/getMewsSetDetail?Dockey=${Dockey}`, { withCredentials: true }).pipe(
      map((data: any) => { return data.d }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }
  getNurseAssMainDetail(Dockey) {
    return this.http.get(`${environment.eKardexApiUrl}/getNurseAssMainDetail?Dockey=${Dockey}`, { withCredentials: true }).pipe(
      map((data: any) => { return data.d }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }
  getCriticalPainDetail(Dockey) {
    return this.http.get(`${environment.eKardexApiUrl}/getCriticalPainDetail?Dockey=${Dockey}`, { withCredentials: true }).pipe(
      map((data: any) => { return data.d }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }
  ToGetFieldValues(Zindicator) {
    return this.http.get(`${environment.eKardexApiUrl}/ToGetFieldValues?Zindicator=${Zindicator}`, { withCredentials: true }).pipe(
      map((data: any) => { return data.d }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }
  getNicuDocument(Dockey) {
    return this.http.get(`${environment.eKardexApiUrl}/getNicuDocument?Dockey=${Dockey}`, { withCredentials: true }).pipe(
      map((data: any) => { return data.d }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }

  createNewBorn(json): Observable<any> {
    const url = `${environment.eKardexApiUrl}/createNewBornPhysicalDoc`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }
  createUrinary(json): Observable<any> {
    const url = `${environment.eKardexApiUrl}/createBundlesDoc`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }
  createCvcMainDoc(json): Observable<any> {
    const url = `${environment.eKardexApiUrl}/createCvcMainDoc`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }
  createIntraOpNurRecSetDoc(json): Observable<any> {
    const url = `${environment.eKardexApiUrl}/createIntraOpNurRecSetDoc`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }
  createNurseAssMainDoc(json): Observable<any> {
    const url = `${environment.eKardexApiUrl}/createNurseAssMainDoc`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }
  createCriticalPainDoc(json): Observable<any> {
    const url = `${environment.eKardexApiUrl}/createCriticalPainDoc`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }
  createMewsSetDoc(json): Observable<any> {
    const url = `${environment.eKardexApiUrl}/createMewsSetDoc`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }
  createNicuSet(json): Observable<any> {
    const url = `${environment.eKardexApiUrl}/createNicuSet`;
    return this.http.post(url, json, {
      withCredentials: true,
    });
  }

}
