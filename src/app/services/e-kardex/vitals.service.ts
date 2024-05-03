import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  lastValueFrom,
  map,
  Observable,
  of,
  ReplaySubject,
  retry,
  switchMap,
  tap,
  throwError,
  zip,
} from 'rxjs';

import { environment } from 'src/environments/environment';
import { CatalogItem, RangeTime, VitalItem } from './interfaces/vitals';
import { PatientService } from './patient.service';
import { Router, UrlSerializer } from '@angular/router';
// import { ChartVitalsService } from './chart-vitals.service';
import { LeyendIndicatorService } from './leyend-indicator.service';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import { formatDate } from '@angular/common';
import { StorageService } from '@services/storage.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
dayjs.extend(utc);

@Injectable({
  providedIn: 'root',
})
export class VitalsService {
  /** Catalog Subjects */
  private catalogListSubject$ = new ReplaySubject<CatalogItem[]>(1);
  public catalogList$ = this.catalogListSubject$.asObservable();

  /** Vitals Subjects */
  private vitalListSubject$ = new ReplaySubject<VitalItem[]>(1);
  public vitalList$ = this.vitalListSubject$.asObservable();

  private vitalListSubjectLoading$ = new BehaviorSubject<boolean>(false);
  public vitalListLoading$ = this.vitalListSubjectLoading$.asObservable();

  /** Datail Vital Subjects */
  public detailsVitalSubject$ = new ReplaySubject<VitalItem[]>(1);
  public detailsVital$ = this.detailsVitalSubject$.asObservable();
  ChartdataService: any;


  constructor(
    private http: HttpClient,
    private patientService: PatientService,
    private router: Router,
    private serializer: UrlSerializer,
    private leyendIndicator: LeyendIndicatorService,
    private storageService: StorageService,
  ) { }

  getUrlCatalog() {
    return `${environment.eKardexApiUrl}/catalog/getAll`;
  }

  async getDataCatalog() {
    const url = this.getUrlCatalog();
    const dataCatalog$ = this.http.get(url, { withCredentials: true }).pipe(
      map((data: any) => this.processData(data)),
      tap((data) => {
        this.catalogListSubject$.next(data);
      }),
      retry(2),
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );

    await lastValueFrom(dataCatalog$);
  }

  processData(data: any): CatalogItem[] {
    const _data = data?.d?.results ? [...data?.d?.results] : [];
    return _data;
  }

  async updateCatalog(itemCatalog: CatalogItem, payload: any) {
    const { CatKey, CatItemKey } = itemCatalog;
    const url = `${environment.eKardexApiUrl}/catalog/update/${CatKey}/${CatItemKey}`;

    const updateCatalog$ = this.http
      .put(url, payload, { withCredentials: true })
      .pipe(
        tap((data) => {
          this.updateChanges();
        }),
        catchError((error: HttpErrorResponse) => throwError(() => error))
      );

    await lastValueFrom(updateCatalog$);
  }

  async updateChanges() {
    await this.getDataCatalog();
    await this.getListOfVitals();

  }

  async getListOfVitals() {
    await lastValueFrom(this.getVitals());
  }

  getVitals(): Observable<VitalItem[]> {
    this.vitalListSubjectLoading$.next(true);

    return zip(this.patientService.patient$, this.catalogList$).pipe(
      switchMap(([patient, catalogList]) => {
        const { institution, id, isInPatient } = patient;
        const type = isInPatient ? 'IPCaseType' : 'OPCaseType';

        const catItemsKeysByCaseTypeOfPatient = catalogList.filter(
          (item) => item[type] === true
        );

        const catItemsKeys = catItemsKeysByCaseTypeOfPatient.map(
          (item) => item.CatItemKey
        );

        if (catItemsKeys.length === 0) {
          this.vitalListSubjectLoading$.next(false);
          this.vitalListSubject$.next([]);
          return of([] as VitalItem[]);
        }

        const { CatKey: catKey } = catItemsKeysByCaseTypeOfPatient[0];
        const catItemKeys = JSON.stringify([...catItemsKeys]);

        const tree = this.router.createUrlTree(['/vital/getByFilters'], {
          queryParams: { institution, patient: id, catKey, catItemKeys },
        });
        const routeSerialize = this.serializer.serialize(tree);

        const url = `${environment.eKardexApiUrl}${routeSerialize}`;

        const vitalExtraData = (vital: VitalItem) => ({
          ...vital,
          isAbnormal: this.leyendIndicator.isAbnormal(vital.ValRangeType),
          isWarning: this.leyendIndicator.isWarning(vital.ValRangeType),
        });

        const processData = (data: VitalItem[]): VitalItem[] => {
          const copyOfData = [...data];
          const indexAlreadyUsed: number[] = [];
          return data.reduce((acc, vital, index) => {
            if (indexAlreadyUsed.includes(index)) {
              return acc;
            }
            if (vital.PairKey === '') {
              copyOfData.splice(index, 1);
              acc.push(vitalExtraData(vital));
            }
            if (
              vital.PairKey !== '' &&
              !acc.some((_vital) => _vital.PairKey === vital.PairKey)
            ) {
              const indexPairkey = copyOfData.findIndex(
                ({ PairKey, CatItemKey }) =>
                  vital.PairKey === PairKey && vital.CatItemKey !== CatItemKey
              );
              if (indexPairkey > -1) {
                vital.PairVital = copyOfData[indexPairkey];
                indexAlreadyUsed.push(indexPairkey);
              }
              acc.push(vitalExtraData(vital));
            }
            return acc;
          }, []);
        };

        return this.http.get(url, { withCredentials: true }).pipe(
          map((data: any): any => data?.value),
          tap((data) => {
            this.vitalListSubjectLoading$.next(false);
            this.vitalListSubject$.next(processData(data));
          }),
          catchError((error: HttpErrorResponse) => {
            this.vitalListSubjectLoading$.next(false);
            return throwError(() => error);
          })
        );
      }),
      catchError((error: HttpErrorResponse) => {
        this.vitalListSubjectLoading$.next(false);
        return throwError(() => error);
      })
    );
  }


  async setVitalDetails(vitalSelected: VitalItem, range: any) {
    const {
      Institution: institution,
      Patient: id,
      CatKey: catKey,
      PairKey: PairKeySelected,
      CatItemKey,
      PairVital,
    } = vitalSelected;
    const {einri:einri,patnr:patnr,falnr:falnr,lfdnr:lfdnr,} = this.storageService
    const storagedarta = {
        Einri: einri,
        Falnr:falnr,
        Patnr:patnr,
        Lfdnr:lfdnr,
      };

    const _catItemKeys: string[] = PairVital?.CatItemKey
      ? [CatItemKey, PairVital?.CatItemKey]
      : [CatItemKey];
    const vitalsRelated = PairVital
      ? [vitalSelected, PairVital]
      : [vitalSelected];

    const catItemKeys = JSON.stringify(_catItemKeys);

    const { from, to } = this.selectedData(range);
    const tree = `/vital/getByDates?Einri=${this.storageService.einri}&Falnr=${this.storageService.falnr}&Patnr=${this.storageService.patnr}&Lfdnr=${this.storageService.lfdnr}`;
    // const routeSerialize = this.serializer.serialize(tree);
    const url = `${environment.eKardexApiUrl}${tree}`;

    const vitalDetails$ = this.http.get(url, { withCredentials: true }).pipe(
      map((data: any): any => data?.value),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        this.vitalListSubjectLoading$.next(false);
        return throwError(() => error);
      })
    );
    const vitalDetails = await lastValueFrom(vitalDetails$);
    // this.chartVitalsService.processDataChart({ rawData: vitalDetails, vitalsRelated });
    this.ChartdataService.areaChartOptions({ rawData: vitalDetails, vitalsRelated })
    this.detailsVitalSubject$.next(vitalDetails);
  }

  // getTimeFiltersInUTC(range: RangeTime) {
  //   const { from, to } = range;
  //   return {
  //     from: dayjs(from).utc().format(),
  //     to: dayjs(to).utc().format(),
  //   };
  // }


  selectedData(value: any) {
    const currentDate = new Date();
    if (value === 'Day') {
      const Fromday = `${formatDate(new Date(new Date().setDate(currentDate.getDate() - 1)), "YYYY-MM-dd", "en-US")}T${formatDate(new Date(new Date().setDate(currentDate.getDate() - 1)), "HH:mm:ss", "en-US")}Z`;
      const Today = `${formatDate(new Date(), "YYYY-MM-dd", "en-US")}T${formatDate(new Date(), "HH:mm:ss", "en-US")}Z`;
      return {
        from: Fromday,
        to: Today,
      };
    }
    else if (value === 'Week') {
      const Fromday = `${formatDate(new Date(new Date().setDate(currentDate.getDate() - 7)), "YYYY-MM-dd", "en-US")}T${formatDate(new Date(new Date().setDate(currentDate.getDate() - 7)), "HH:mm:ss", "en-US")}Z`;
      const Today = `${formatDate(new Date(), "YYYY-MM-dd", "en-US")}T${formatDate(new Date(), "HH:mm:ss", "en-US")}Z`;
      const Weeks = new Date(new Date().setDate(currentDate.getDate() - 7));
      return {
        from: Fromday,
        to: Today,
      };
    }
    else if (value === 'Month') {
      const Fromday = `${formatDate(new Date(new Date().setMonth(currentDate.getMonth())), "YYYY-MM-dd", "en-US")}T${formatDate(new Date(new Date().setMonth(currentDate.getMonth())), "HH:mm:ss", "en-US")}Z`;
      const Today = `${formatDate(new Date(), "YYYY-MM-dd", "en-US")}T${formatDate(new Date(), "HH:mm:ss", "en-US")}Z`;
      const month = new Date(new Date().setMonth(currentDate.getMonth()));
      return {
        from: Fromday,
        to: Today,
      };
    }
    else if (value === 'Year') {
      const Fromday = `${formatDate(new Date(new Date().setFullYear(currentDate.getFullYear() - 1)), "YYYY-MM-dd", "en-US")}T${formatDate(new Date(new Date().setFullYear(currentDate.getFullYear() - 1)), "HH:mm:ss", "en-US")}Z`;
      const Today = `${formatDate(new Date(), "YYYY-MM-dd", "en-US")}T${formatDate(new Date(), "HH:mm:ss", "en-US")}Z`;
      const year = new Date(new Date().setFullYear(currentDate.getFullYear() - 1));
      return {
        from: Fromday,
        to: Today,
      };
    }
    else if (value === 'Hour') {
      const Fromday = `${formatDate(new Date(new Date().setHours(currentDate.getHours() - 1)), "YYYY-MM-dd", "en-US")}T${formatDate(new Date(new Date().setHours(currentDate.getHours() - 1)), "HH:mm:ss", "en-US")}Z`;
      const Today = `${formatDate(new Date(), "YYYY-MM-dd", "en-US")}T${formatDate(new Date(), "HH:mm:ss", "en-US")}Z`;
      const Hours = new Date(new Date().setHours(currentDate.getHours() - 1));
      return {
        from: Fromday,
        to: Today
      };
    }
  }
}
