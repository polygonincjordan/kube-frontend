import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { HeaderComponent } from './header.component';

describe('Header case-list navigation', () => {
  let header: any;
  let response: Subject<any>;
  beforeEach(() => {
    response = new Subject();
    header = Object.create(HeaderComponent.prototype);
    header.caseEncounterService = { resolve: jasmine.createSpy().and.returnValue(response) };
    header.storageService = { setCheckinData: jasmine.createSpy() };
    header._dataServices = { widgetResponseSet: jasmine.createSpy() };
    header.redirectToTreatment = jasmine.createSpy();
    spyOn(localStorage, 'setItem');
    spyOn(Swal, 'fire');
  });

  it('waits for the selected encounter and ignores repeat clicks while loading', () => {
    header.openPatientSearch({ Case: '20' }, 'caseList', { PATNR: '10', EINRI: '1000' });
    header.openPatientSearch({ Case: '21' }, 'caseList', { PATNR: '10', EINRI: '1000' });
    expect(header.caseEncounterService.resolve).toHaveBeenCalledTimes(1);
    expect(header.caseEncounterService.resolve).toHaveBeenCalledWith('10', '1000', '20');
    expect(header.redirectToTreatment).not.toHaveBeenCalled();
    expect(header.storageService.setCheckinData).not.toHaveBeenCalled();
    const encounter = { Patnr: '0000000010', Einri: '1000', Falnr: '0000000020', Lfdnr: '00002' };
    response.next(encounter);
    expect(header.redirectToTreatment).toHaveBeenCalledWith(encounter);
    expect(header.storageService.setCheckinData).toHaveBeenCalledWith(encounter);
    expect(header._dataServices.widgetResponseSet).not.toHaveBeenCalled();
    expect(header.openingCase).toBe(false);
  });

  it('shows an error without replacing patient context or navigating on failure', () => {
    header.openPatientSearch({ Case: '20' }, 'caseList', { PATNR: '10', EINRI: '1000' });
    response.error(new Error('Unavailable'));
    expect(Swal.fire).toHaveBeenCalled();
    expect(header.redirectToTreatment).not.toHaveBeenCalled();
    expect(header.storageService.setCheckinData).not.toHaveBeenCalled();
    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(header.openingCase).toBe(false);
  });
});
