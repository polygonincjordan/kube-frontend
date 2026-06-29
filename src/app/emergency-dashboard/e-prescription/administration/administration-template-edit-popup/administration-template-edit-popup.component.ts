import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { AddministrationService } from '@services/e-Prescription/Administration.service';
import { EPrescriptionService } from '@services/e-Prescription/e-prescription.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { CycleDefinitionPopupComponent } from '../../../../shared-module/cycle-definition/cycle-definition-popup.component';

/**
 * Editable view of a User-Level medication template (Administration tab, Ordtype = '1').
 * Loaded with the rows returned by `OrderTemplateget` (GET OrderTemplateSet by Tpgid).
 * Supports adding a medication (search), deleting selected rows and saving via
 * PUT OrderTemplateSet(Eorderid='<Tpgid>').
 */
@Component({
  selector: 'administration-template-edit-popup',
  templateUrl: './administration-template-edit-popup.component.html',
  styleUrls: ['./administration-template-edit-popup.component.scss']
})
export class AdministrationTemplateEditPopupComponent {
  public ordtype: string = '1';
  modaleditRef: BsModalRef;
  isallSelected: boolean = false;
  isSubmitted: boolean = false;
  public meta: any = {};
  public editForm: FormGroup;

  @ViewChild('templateeditPopup', { static: true }) templateeditPopup: TemplateRef<any>;
  @ViewChild('cyclePopup', { static: true }) cyclePopup: CycleDefinitionPopupComponent;
  @Output() onSaved: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    public ePrescriptionService: EPrescriptionService,
    public addministrationService: AddministrationService,
    private modalService: BsModalService
  ) { }

  get medArray(): FormArray {
    return this.editForm.get('Meds') as FormArray;
  }

  showPopup(data: any[], meta: { prscrid: string, templateName: string, templateDesc?: string, ordtype?: string }): void {
    this.meta = meta || {};
    this.ordtype = (meta && meta.ordtype) ? meta.ordtype : '1';
    this.isallSelected = false;
    this.isSubmitted = false;
    this.addministrationService.loadDropdownList();
    this.editForm = new FormGroup({ Meds: new FormArray([]) });
    (data || []).forEach((item) => this.medArray.push(this.buildRow(item)));
    this.modaleditRef = this.modalService.show(this.templateeditPopup, { backdrop: true, ignoreBackdropClick: false, class: 'tempate-detail-popup' });
  }

  /** Build a row form group from a loaded template item (keeps the original payload via __orig). */
  buildRow(item: any): FormGroup {
    return new FormGroup({
      Result_Drug_Name: new FormControl(item ? (item.Result_Drug_Name || '') : '', Validators.required),
      Formatdescr: new FormControl(item ? (item.Formatdescr || '') : ''),
      // Bind the dropdown by the stable SAP route id so async option loading can restore the selection.
      Routedescr: new FormControl(item ? (item.Aprouteid || null) : null, Validators.required),
      Quan: new FormControl(item && item.Quan === '0.000' ? '0' : (item ? item.Quan : '0'), Validators.required),
      Quantunittxt: new FormControl(item ? (item.Quantunittxt || '') : ''),
      Quanunit: new FormControl(item ? item.Quanunit : null),
      N1znr: new FormControl(item ? item.N1znr : null, Validators.required),
      N1ztxt: new FormControl(item ? (item.N1ztxt || '') : ''),
      Pdur: new FormControl(item && (parseInt(item.Pdur) === 0) ? '' : (item ? `${Math.floor(item.Pdur)}` : '')),
      Pduru: new FormControl(item ? item.Pduru : null),
      Durunittxt: new FormControl(item ? (item.Durunittxt || '') : ''),
      Stocktext: new FormControl(item ? (item.Stocktext || '') : ''),
      Agentid: new FormControl(item ? (item.Agentid || '') : ''),
      Drugid: new FormControl(item ? (item.Drugid || '') : ''),
      Phformid: new FormControl(item ? item.Phformid : null),
      Aprouteid: new FormControl(item ? item.Aprouteid : null),
      Dosdef: new FormControl(item ? (item.Dosdef || '') : ''),
      AgentidResult: new FormControl([]),
      TOCYCDEF: new FormControl(item && item.TOCYCDEF && item.TOCYCDEF.results ? item.TOCYCDEF.results : []),
      isSelected: new FormControl(false),
      __orig: new FormControl(item || null)
    });
  }

  /** Open the Cycle Definition popup for a row; requires a frequency to be selected. */
  onOpenCycleDefinition(index: number): void {
    const row = this.medArray.at(index);
    const n1znr = row.get('N1znr') ? row.get('N1znr').value : null;
    if (!n1znr) {
      Swal.fire({
        text: 'Please select a frequency first', icon: 'error',
        confirmButtonColor: '#0890c5', confirmButtonText: 'OK', customClass: { popup: 'myalertpopup' }
      } as any);
      return;
    }
    const existing = row.get('TOCYCDEF').value || [];
    const title = row.get('Result_Drug_Name').value || row.get('N1ztxt').value || '';
    if (existing && existing.length) {
      this.cyclePopup.showPopup({ index, n1znr, title, startDate: null, records: existing });
      return;
    }
    const orderId = this.getTemplateOrderId(row);
    if (orderId) {
      this.loadTemplateCycleDefinition(orderId, n1znr, index, title);
      return;
    }
    this.loadMasterCycleDefinition(n1znr, index, title);
  }

  private getTemplateOrderId(row: any): string {
    const orig = row && row.get('__orig') ? row.get('__orig').value : null;
    return (orig && orig.Eorderid) || (this.meta && this.meta.prscrid) || '';
  }

  private loadTemplateCycleDefinition(orderId: string, n1znr: string, index: number, title: string): void {
    this.ePrescriptionService.loadData(`e-prescription/TOCYCDEFSet?OrderId=${encodeURIComponent(orderId)}`, false, false, false, false).subscribe((res: any) => {
      const allRecords = res && res.body && res.body.d && res.body.d.results ? res.body.d.results : [];
      const records = allRecords.filter((r: any) => !r.N1znr || r.N1znr === n1znr);
      if (records.length) {
        this.cyclePopup.showPopup({ index, n1znr, title, startDate: null, records });
        return;
      }
      this.loadMasterCycleDefinition(n1znr, index, title);
    }, () => this.loadMasterCycleDefinition(n1znr, index, title));
  }

  private loadMasterCycleDefinition(n1znr: string, index: number, title: string): void {
    this.ePrescriptionService.loadData(`e-prescription/CycleDefMasterSet?N1znr=${n1znr}`, false, false, false, false).subscribe((res: any) => {
      const records = res && res.body && res.body.d && res.body.d.results ? res.body.d.results : [];
      this.cyclePopup.showPopup({ index, n1znr, title, startDate: null, records });
    }, () => this.cyclePopup.showPopup({ index, n1znr, title, startDate: null, records: [] }));
  }

  onCycleSaved(event: { index: number; data: any[] }): void {
    this.medArray.at(event.index).get('TOCYCDEF').setValue(event.data || []);
  }

  /** Keep only the writable TOCYCDEF fields and re-stamp the frequency key. */
  private normalizeCycleDef(records: any[], n1znr: string): any[] {
    const list = records && records.length ? records : [];
    return list.map((r: any, i: number) => ({
      N1znr: r.N1znr || n1znr,
      N1lfnr: r.N1lfnr || `${i + 1}`.padStart(4, '0'),
      Menge: `${r.Menge}`,
      Begdt: r.Begdt,
      Enddt: r.Enddt,
      Mo: !!r.Mo, Tu: !!r.Tu, We: !!r.We, Th: !!r.Th, Fr: !!r.Fr, Sa: !!r.Sa, Su: !!r.Su,
      IntervalDay: +r.IntervalDay || 1,
      IntervalHour: `${r.IntervalHour || '0'}`,
      N1cwft: !!r.N1cwft,
      TiStart: r.TiStart || r.TIStart,
      TiEnd: r.TiEnd || r.TIEnd
    }));
  }

  onCheckallMedicationData(event: any): void {
    this.medArray.controls.forEach(c => c.get('isSelected').setValue(event.target.checked));
  }

  onisSelected(): void {
    this.isallSelected = !this.medArray.controls.some(c => c.get('isSelected').value === false);
  }

  /** Plus icon: add a new empty medication row, ready for the medicine search. */
  addRow(): void {
    this.medArray.push(this.buildRow(null));
  }

  /** Minus icon: delete the selected rows. */
  deleteSelected(): void {
    const selected = this.medArray.controls.filter(c => c.get('isSelected').value);
    if (!selected.length) {
      this.showInfo('Please select a medication to delete');
      return;
    }
    Swal.fire({
      text: 'Do you want to delete the selected medication(s)?',
      showCancelButton: true,
      confirmButtonColor: '#0890c5',
      cancelButtonColor: '#84898c',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: { popup: 'myalertpopup' },
      icon: 'warning'
    } as any).then((result: any) => {
      if (result.value) {
        for (let i = this.medArray.length - 1; i >= 0; i--) {
          if (this.medArray.at(i).get('isSelected').value) { this.medArray.removeAt(i); }
        }
        this.isallSelected = false;
      }
    });
  }

  /** Medicine search selection — mirrors create-administration.onSelectMedicine. */
  onSelectMedicine(event: any): void {
    if (event && event.data) {
      const filter = {
        einri: this.ePrescriptionService.parameters.einri,
        case: this.ePrescriptionService.parameters.falnr,
        movement: this.ePrescriptionService.parameters.lfdnr,
        AgentID: event.data.Agentid,
        DrugID: event.data.Drugid,
        purpose: '',
      };
      const expandEntities = ['NAVDRUGFORMATS', 'NAVDRUGFORMATROUTES', 'NAVDRUGFORMATROUTEUNITS', 'NAVDRUGUNITS'];
      this.ePrescriptionService.loadData('DrugPropSet', filter, expandEntities, true, true).subscribe((resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
          this.medArray.at(event.index).patchValue({
            Phformid: resp.body.d.results[0].NAVDRUGFORMATROUTES.results[0].FormID,
            Result_Drug_Name: event.data.Drugname,
            Formatdescr: event.data.Formatdescr,
            Drugid: event.data.Drugid
          });
        }
      });
      this.ePrescriptionService.loadData(`e-prescription/DurgUnitlist?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}&Lfdnr=${this.ePrescriptionService.parameters.lfdnr}&Drugid=${event.data.Drugid}`, false, false, false, false).subscribe((resp: any) => {
        if (resp.body && resp.body.d && resp.body.d.results && resp.body.d.results.length) {
          resp.body.d.results.forEach((element: any) => {
            element.OptionField = (element.Mseht !== '' && element.Agent !== '') ? [element.Mseht, element.Agent].join(' - ') : element.Mseht;
          });
          this.medArray.at(event.index).patchValue({
            Agentid: resp.body.d.results[0].Agentid ? resp.body.d.results[0].Agentid : '',
            AgentidResult: resp.body.d.results,
            Quanunit: resp.body.d.results[0],
            Quantunittxt: resp.body.d.results[0].Mseht,
            Quan: resp.body.d.results[0].Quant && parseInt(resp.body.d.results[0].Quant) === Number(resp.body.d.results[0].Quant) ? parseInt(resp.body.d.results[0].Quant) : Number(resp.body.d.results[0].Quant)
          });
        }
      });
    } else {
      this.medArray.removeAt(event.index);
    }
  }

  /** Match template routes by description or route code, as create medication order does. */
  searchRoute = (term: string, item: any): boolean => {
    term = `${term || ''}`.trim().toLowerCase();
    let route = item;
    if (!route || route.Descr === undefined) {
      route = (this.addministrationService.routeDropdownList || [])
        .find((candidate: any) => `${candidate.Aprouid || ''}`.trim() === `${item || ''}`.trim());
    }
    if (!route) { return false; }
    return `${route.Descr || ''}`.toLowerCase().includes(term)
      || `${route.Aprou || ''}`.toLowerCase().includes(term);
  };

  /** Keep the displayed frequency text in sync with the selected code. */
  onChangeFrequency(index: number): void {
    const code = this.medArray.at(index).get('N1znr').value;
    const found = (this.addministrationService.frequencyList || []).find((d: any) => d.CycleKey === code);
    this.medArray.at(index).patchValue({ N1ztxt: found ? found.Text : '' });
  }

  /** Build one TOORDERTEMPLATE item in the exact Create-Template (POST) shape. */
  private buildTemplateItem(c: any): any {
    const v = c.value;
    const orig = v.__orig || {};
    const route = v.Routedescr;
    const routeId = route && route.Aprouid !== undefined ? route.Aprouid : (route || orig.Aprouteid || '');
    const selectedRoute = (this.addministrationService.routeDropdownList || [])
      .find((item: any) => `${item.Aprouid || ''}`.trim() === `${routeId}`.trim());
    const routedescr = selectedRoute ? selectedRoute.Descr : (route && route.Descr !== undefined ? route.Descr : (orig.Routedescr || ''));
    const aprouteid = selectedRoute ? selectedRoute.Aprouid : routeId;
    const quanunit = v.Quanunit && v.Quanunit.Meinh ? v.Quanunit.Meinh : (v.Quanunit || orig.Quanunit || '');
    const schedule = this.scheduleFields(orig);
    const toComplex = (orig.TOCOMPLEX && orig.TOCOMPLEX.results ? orig.TOCOMPLEX.results : (Array.isArray(orig.TOCOMPLEX) ? orig.TOCOMPLEX : []))
      .map((cx: any) => {
        const { __metadata, ...rest } = cx || {};
        return {
          ...rest,
          Quan: cx.Quan !== undefined ? `${cx.Quan}` : '0',
          Pdur: (cx.Pdur === null || cx.Pdur === undefined || cx.Pdur === '') ? '0' : `${cx.Pdur}`,
          Seqno: cx.Seqno !== undefined ? `${cx.Seqno}` : ''
        };
      });
    return {
      Agentid: v.Agentid || '',
      Drugid: v.Drugid || '',
      Phformid: v.Phformid != null ? v.Phformid : (orig.Phformid || ''),
      Aprouteid: aprouteid,
      Routedescr: routedescr,
      Result_Drug_Name: v.Result_Drug_Name || '',
      Quan: `${v.Quan}`,
      Quanunit: quanunit,
      N1znr: v.N1znr,
      N1ztxt: v.N1ztxt || '',
      Pdur: (v.Pdur === null || v.Pdur === '') ? '0' : `${v.Pdur}`,
      Pduru: v.Pduru != null ? v.Pduru : '',
      Dosdef: v.Dosdef || orig.Dosdef || '',
      Prn: orig.Prn != null ? orig.Prn : false,
      Prncond: orig.Prncond || '',
      Moresp1: orig.Moresp1 || '',
      Lfdnr: orig.Lfdnr || this.ePrescriptionService.parameters.lfdnr,
      StartD: schedule.StartD,
      StartT: schedule.StartT,
      EndD: orig.EndD != null ? orig.EndD : null,
      EndT: orig.EndT != null ? orig.EndT : null,
      Orgfa: orig.Orgfa || '',
      Orgpf: orig.Orgpf || '',
      Updmode: orig.Updmode != null ? orig.Updmode : false,
      Descr: orig.Descr || '',
      AddDose: orig.AddDose ? 'X' : '',
      Complex: orig.Complex ? 'X' : '',
      Pom: orig.Pom || '',
      Priority: orig.Priority || '010',
      TOCOMPLEX: toComplex,
      TOCYCDEF: this.normalizeCycleDef(v.TOCYCDEF, v.N1znr)
    };
  }

  /** Preserve the loaded schedule for existing rows; default added rows to "now" (as create does). */
  private scheduleFields(orig: any): { StartD: string, StartT: string } {
    if (orig && orig.StartD) { return { StartD: orig.StartD, StartT: orig.StartT || null }; }
    const d = new Date();
    const p = (n: number) => `${n}`.padStart(2, '0');
    const ymd = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    const hms = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
    return { StartD: `${ymd}T${hms}`, StartT: `PT${p(d.getHours())}H${p(d.getMinutes())}M${p(d.getSeconds())}S` };
  }

  /**
   * Save: POST to OrderTemplateSet with the old template id in the body as `Eorderid`.
   * The backend treats this as update/replace — it deactivates the old template (DEL_FLAG='X')
   * and creates the replacement in one call. Do NOT use PUT and do NOT call DELETE afterwards.
   */
  save(): void {
    this.isSubmitted = true;
    if (!this.medArray.length) { this.showInfo('A template must contain at least one medication'); return; }
    if (this.editForm.invalid) { this.showInfo('Please complete the required fields before saving'); return; }

    const toOrderTemplate = this.medArray.controls.map((c) => this.buildTemplateItem(c));

    const payload: any = this.ePrescriptionService.loadParameters(true, true, true, true);
    payload['Eorderid'] = this.meta.prscrid; // old template id → backend handles deactivate-old + create-new
    payload['TemplateName'] = this.meta.templateName;
    payload['TemplateDesc'] = this.meta.templateDesc || this.meta.templateName;
    payload['Storn'] = '';
    payload['Ordtype'] = this.ordtype;
    payload['TOORDERTEMPLATE'] = toOrderTemplate;

    this.ePrescriptionService.postData('e-prescription/OrderTemplate', payload).subscribe({
      next: () => this.afterUpdateSuccess(),
      error: (error: any) => {
        const message = error && error.error && error.error.error && error.error.error.message ? error.error.error.message.value : 'Unable to update the template';
        this.showInfo(message, 'error');
      }
    });
  }

  private afterUpdateSuccess(): void {
    this.ePrescriptionService.loadAdministrationTemplateData(
      (templates) => {
        Swal.fire({
          title: 'Your Template has been Updated!',
          confirmButtonColor: '#0890c5',
          cancelButtonColor: '#84898c',
          confirmButtonText: 'OK',
          customClass: { popup: 'myalertpopup' },
          icon: 'success'
        } as any).then(() => {
          this.modaleditRef.hide();
          this.onSaved.emit(templates);
        });
      },
      () => {
        this.modaleditRef.hide();
        this.showInfo('The template was updated, but the template list could not be refreshed. Please reopen the list.', 'warning');
      }
    );
  }

  close(): void {
    if (this.modaleditRef) { this.modaleditRef.hide(); }
  }

  private showInfo(text: string, icon: 'error' | 'info' | 'warning' = 'error'): void {
    Swal.fire({
      text,
      confirmButtonColor: '#0890c5',
      cancelButtonColor: '#84898c',
      confirmButtonText: 'OK',
      customClass: { popup: 'myalertpopup' },
      icon
    } as any);
  }
}
