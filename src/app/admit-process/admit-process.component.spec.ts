import { of } from 'rxjs';
import Swal from 'sweetalert2';
import { AdmitProcessComponent } from './admit-process.component';

describe('AdmitProcessComponent progress-note navigation', () => {
  let component: AdmitProcessComponent;
  let admissionService: jasmine.SpyObj<any>;

  beforeEach(() => {
    spyOn(AdmitProcessComponent.prototype, 'getBedDetails');
    spyOn(AdmitProcessComponent.prototype, 'phyOrderTableList');
    spyOn(AdmitProcessComponent.prototype, 'occupationalGroupList');

    admissionService = jasmine.createSpyObj('AdmissionService', [
      'tabPanelNavigation',
    ]);
    const storageService = jasmine.createSpyObj('StorageService', [
      'setEinri',
      'setFalnr',
      'setLfdnr',
      'setPatnr',
    ]);
    const route = {
      queryParams: of({ activeValue: '02' }),
    };

    component = new AdmitProcessComponent(
      {} as any,
      {} as any,
      admissionService,
      {} as any,
      {} as any,
      route as any,
      storageService
    );
  });

  it('navigates without warning when the progress note is saved', async () => {
    component.unsavedProgressNote = false;
    const warning = spyOn(Swal, 'fire');

    await component.calltab('Documentation');

    expect(warning).not.toHaveBeenCalled();
    expect(admissionService.tabPanelNavigation).toHaveBeenCalledWith('Documentation');
  });

  it('keeps the warning for genuinely unsaved note text', async () => {
    component.unsavedProgressNote = true;
    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({ isConfirmed: false } as any)
    );

    await component.calltab('Documentation');

    expect(Swal.fire).toHaveBeenCalled();
    expect(admissionService.tabPanelNavigation).not.toHaveBeenCalled();
  });
});
