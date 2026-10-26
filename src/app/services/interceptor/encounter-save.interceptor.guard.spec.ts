import { HttpRequest } from '@angular/common/http';
import { DefaultUrlSerializer } from '@angular/router';
import { firstValueFrom, of, toArray } from 'rxjs';
import Swal from 'sweetalert2';
import { EncounterSaveInterceptor } from './encounter-save.interceptor.guard';

describe('EncounterSaveInterceptor', () => {
  const serializer = new DefaultUrlSerializer();
  const planned = '/e-kardex?patnr=0000016895&falnr=&einri=1000&lfdnr=00000';
  const url = 'http://api/kube/admission/saveDiagnosisSet';
  let router: any;
  let next: any;
  let interceptor: EncounterSaveInterceptor;

  beforeEach(() => {
    router = { url: planned, parseUrl: (value: string) => serializer.parse(value) };
    next = { handle: jasmine.createSpy().and.returnValue(of('sent')) };
    spyOn(Swal, 'fire').and.stub();
    interceptor = new EncounterSaveInterceptor(router);
  });

  function send(method: string, target: string, body: any = null): Promise<any[]> {
    const req = method === 'GET' || method === 'DELETE'
      ? new HttpRequest<any>(method as any, target)
      : new HttpRequest<any>(method as any, target, body);
    return firstValueFrom(interceptor.intercept(req, next).pipe(toArray()));
  }

  function shown() {
    return JSON.stringify((Swal.fire as jasmine.Spy).calls.mostRecent().args);
  }

  it('stops a case document save on a page with no case, and says why', async () => {
    expect(await send('POST', url, { Patnr: '0000016895', Falnr: '', Lfdnr: '00000' })).toEqual([]);
    expect(next.handle).not.toHaveBeenCalled();
    expect(shown()).toContain('no case in SAP');
  });

  it('stops a save on a case with no movement, and says why', async () => {
    router.url = '/e-kardex?patnr=0000006730&falnr=0000007258&einri=1000&lfdnr=';
    expect(await send('POST', url, { Falnr: '0000007258', Lfdnr: '' })).toEqual([]);
    expect(shown()).toContain('no movement in SAP');
  });

  it('covers modules opened from the sidebar, such as e-prescription', async () => {
    router.url = '/e-prescription/medication?patnr=0000016895&falnr=&einri=1000&lfdnr=00000';
    expect(await send('POST', 'http://api/e-prescription/createPrescription', { Falnr: '' })).toEqual([]);
  });

  for (const body of [
    { d: { results: [{ falnr: '' }] } },
    [{ FALNR: '0000000000' }],
    JSON.stringify({ header: { Falnr: '' } })
  ]) {
    it(`finds the case field at any depth and casing: ${JSON.stringify(body)}`, async () => {
      expect(await send('POST', url, body)).toEqual([]);
    });
  }

  it('reads FormData bodies', async () => {
    const form = new FormData();
    form.append('Falnr', '');
    expect(await send('POST', 'http://api/patientHistory/createAttachmentDoc', form)).toEqual([]);
  });

  it('allows reads, including POST lookups', async () => {
    expect(await send('GET', 'http://api/patient/getDataPatient/1000')).toEqual(['sent']);
    expect(await send('POST', 'http://api/widgetDataFilter', { Falnr: '' })).toEqual(['sent']);
    expect(await send('POST', 'http://api/eHospitalist/postMyPatientSet', { Falnr: '' })).toEqual(['sent']);
    expect(Swal.fire).not.toHaveBeenCalled();
  });

  it('allows writes without a case field, such as user settings', async () => {
    expect(await send('POST', 'http://api/updateUserConfig', { Userid: 'u1', Display: true })).toEqual(['sent']);
  });

  it('allows everything on a complete encounter', async () => {
    router.url = '/e-kardex?patnr=0000006730&falnr=0000007258&einri=1000&lfdnr=00001';
    expect(await send('POST', url, { Falnr: '', Lfdnr: '' })).toEqual(['sent']);
    expect(Swal.fire).not.toHaveBeenCalled();
  });

  it('allows everything on pages whose URL has no case, such as dashboards', async () => {
    for (const page of ['/emr', '/e-kardex?patnr=0000016895']) {
      router.url = page;
      expect(await send('POST', 'http://api/createCheckIn', { Falnr: '' })).toEqual(['sent']);
    }
    expect(Swal.fire).not.toHaveBeenCalled();
  });

  it('matches the write verb on the last path segment, ignoring the query', async () => {
    expect(await send('DELETE', 'http://api/deleteVitalList?Falnr=')).toEqual(['sent']);
    expect(await send('POST', 'http://api/vital/createVitalSigns?x=1', { Falnr: '' })).toEqual([]);
  });
});
