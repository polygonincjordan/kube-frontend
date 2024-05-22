import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { EPrescriptionService } from './e-Prescription/e-prescription.service';

@Injectable({
  providedIn: 'root'
})
export class ChemotherapyService {
  public HeightWeightData: any;
  public DiagnosisList: any;
  public AttachDocument: any;
  public ProtoId: any;
  public ProtocolListdata: any;
  public ChemoHistory: any;
  public ChemoHistorylength: any;
  public ProtocalType = new Subject<any>();
  public mySubject = new Subject<any>();
  public previousCycle = new Subject<any>();
  public ProtoCodeData: any;
  public Discharge: boolean;
  public PostChemo: boolean;
  public Chemotherapeutic: boolean;
  public PreChemo: boolean;
  public PreMedications: boolean;
  public startdata: any;
  chemotherapyForm:FormGroup;
  constructor(private route: ActivatedRoute, private ePrescriptionService: EPrescriptionService) {
    this.HeightWeightBodySurface();
    this.initForm();
  }
  public parameters: any = {
    einri: this.route.snapshot.queryParamMap.get('einri'),
    falnr: this.route.snapshot.queryParamMap.get('falnr'),
    lfdnr: this.route.snapshot.queryParamMap.get('lfdnr'),
    patnr: this.route.snapshot.queryParamMap.get('patnr')
  }
  loadParameters(isEinri: boolean, isFalnr: boolean, islfdnr: boolean, isPatnr: boolean, isInst?: boolean): object {
    let filter: any = {};
    if (isEinri) { filter['Einri'] = this.parameters.einri }
    if (isFalnr) { filter['Falnr'] = this.parameters.falnr }
    if (islfdnr) { filter['Lfdnr'] = this.parameters.lfdnr }
    if (isPatnr) { filter['Patnr'] = this.parameters.patnr }
    if (isInst) { filter['Inst'] = this.parameters.einri }
    return filter;
  }

  DischargeEvent(data: any): void {
    if (data === 'Discharge') {
      this.Discharge = true;
      this.PostChemo = false;
      this.Chemotherapeutic = false;
      this.PreChemo = false;
      this.PreMedications = false;
    } else if (data === 'PostChemo') {
      this.PostChemo = true;
      this.Discharge = false;
      this.Chemotherapeutic = false;
      this.PreChemo = false;
      this.PreMedications = false;
    } else if (data === 'Chemotherapeutic') {
      this.Chemotherapeutic = true;
      this.PostChemo = false;
      this.Discharge = false;
      this.PreChemo = false;
      this.PreMedications = false;
    } else if (data === 'PreChemo') {
      this.PreChemo = true;
      this.Chemotherapeutic = false;
      this.PostChemo = false;
      this.Discharge = false;
      this.PreMedications = false;
    } else if (data === 'PreMedications') {
      this.PreMedications = true;
      this.PreChemo = false;
      this.Chemotherapeutic = false;
      this.PostChemo = false;
      this.Discharge = false;
    }
  }

  ChemoHistoryevnt(){
      this.ePrescriptionService.loadData(`e-prescription/ChemoHistory?Patnr=${this.parameters.patnr}`, false, false, false, false).subscribe((resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
          this.ChemoHistorylength = resp.body.d.results.length;
          this.ChemoHistory = resp.body.d.results;
        }
      });
  }

  AttachDocumentData() {
    this.ePrescriptionService.loadData(`e-prescription/getAttachDocument?Falnr=${this.parameters.falnr}`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        this.AttachDocument = resp.body.d.results;
      }
    });
  }

  Diagnosisdetails(term) {
    if (term) {
      term = term.toLowerCase();
      if (term.length === 3 || term.length >= 3) {
        this.ePrescriptionService.loadData(`e-prescription/getDiagnosisCodeSet?searchstring=${term}`, false, false, false, false).subscribe((resp: any) => {
          if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
            this.DiagnosisList = resp.body.d.results;
          }
        });
      }
    }
  }

  getProtocolsWithDiagnosis(data: string) {
    this.ProtoCodeData = [];
    this.ePrescriptionService.loadData(`e-prescription/ProtoDiagnosis?Dtext1=${data}`, false, false, false, false).subscribe((resp: any) => {
      if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
        this.ProtoCodeData = resp.body.d.results;
      }
    });
  }

  // ProtoHeadersearcheddata(term) {
  //   if (term) {
  //     term = term.toLowerCase();
  //     if (term.length === 3 || term.length >= 3) {
  //       term = term ? term.toUpperCase() : term;
  //       this.ePrescriptionService.loadData(`e-prescription/ProtoHeadersearched?ProtoDesc=${term}`, false, false, false, false).subscribe((resp: any) => {
  //         if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
  //           this.ProtocolList = resp.body.d.results;
  //         }
  //       });
  //     }
  //   }
  // }

  protocalDetails(data): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.ePrescriptionService.loadData(`e-prescription/Protocal?ProtoId=${data.ProtoId}&Patnr=${this.parameters.patnr}`, false, false, false, false).subscribe((resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
          const cycleId = resp.body.d.results[0].TOCYCLE && resp.body.d.results[0].TOCYCLE.results && resp.body.d.results[0].TOCYCLE.results.length ? resp.body.d.results[0].TOCYCLE.results[0].CycleId : '';
          this.ProtocalType.next({ data: resp.body.d.results[0], ProtoDesc: data.ProtoDesc,CycleId: cycleId })
          resolve(true);
        }
        resolve(false);
      });
    });
  }

  HeightWeightBodySurface(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.ePrescriptionService.loadData(`e-prescription/PatHeightWeight?Falnr=${this.parameters.falnr}&Lfdnr=${this.parameters.lfdnr}`, false, false, false, false).subscribe((resp: any) => {
        if (resp.body && resp.body.d && resp.body.d) {
          this.HeightWeightData = {
            Weight: resp.body.d.Weight,
            Height: resp.body.d.Height,
            Bsa: resp.body.d.Bsa,
            WUnit: resp.body.d.WUnit,
            HUnit: resp.body.d.HUnit
          }
          resolve(true);
        }
        resolve(false);
      });
    })
  }

initForm() {
  this.chemotherapyForm = new FormGroup({
    doseReductionOption: new FormControl(''),
    percentage: new FormControl(''),
    currentDose: new FormControl(''),
    reducedDose: new FormControl(''),
  });
  }
}
