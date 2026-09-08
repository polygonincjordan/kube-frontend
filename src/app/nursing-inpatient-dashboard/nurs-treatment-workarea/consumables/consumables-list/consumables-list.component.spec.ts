import { FormBuilder } from '@angular/forms';
import { SimpleChange } from '@angular/core';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { ConsumablesListComponent } from './consumables-list.component';

describe('ConsumablesListComponent', () => {
  let component: ConsumablesListComponent;
  let consumableService: jasmine.SpyObj<any>;

  beforeEach(() => {
    consumableService = jasmine.createSpyObj('ConsumableService', [
      'getMaterialDetails',
      'saveConsumableDataSet',
    ]);

    component = new ConsumablesListComponent(
      consumableService,
      { filterType$: of(null) } as any,
      { queryParams: of({ einri: '1000', falnr: 'case-1' }) } as any,
      new FormBuilder(),
      { patientData: { deptOrgUnit: 'WARD', Treatmentou: 'ROOM' } } as any,
      {} as any
    );
    component.ngOnInit();
  });

  function fillSelectedRow(): void {
    component.resultsFormArray.at(0).patchValue({
      Matnr: '14000433',
      Arktx: 'Syringe, Disp. Size 5 ml',
      Stock: '9982',
      Menge: '1',
      Meins: 'EA',
      isSelected: true,
    });
  }

  function saveChange(previousValue: any, currentValue: any): void {
    component.ngOnChanges({
      postitem: new SimpleChange(previousValue, currentValue, false),
    });
  }

  it('keeps entered rows after a failed save and allows another save trigger', async () => {
    const saveError = {
      error: {
        error: {
          innererror: {
            errordetails: [
              { code: 'LOCKED', message: 'The material is locked.' },
            ],
          },
        },
      },
    };
    consumableService.saveConsumableDataSet.and.returnValue(
      throwError(() => saveError)
    );
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ value: true } as any));
    spyOn(component.postitemReset, 'emit');
    fillSelectedRow();

    saveChange(null, 'Save');
    await Promise.resolve();

    expect(component.resultsFormArray.at(0).value).toEqual(
      jasmine.objectContaining({
        Matnr: '14000433',
        Arktx: 'Syringe, Disp. Size 5 ml',
        Menge: '1',
        isSelected: true,
      })
    );
    expect(component.postitemReset.emit).toHaveBeenCalled();

    saveChange('Save', null);
    saveChange(null, 'Save');

    expect(consumableService.saveConsumableDataSet).toHaveBeenCalledTimes(2);
    expect(component.resultsFormArray.at(0).value.Matnr).toBe('14000433');
  });

  it('clears and restores the default rows for an explicit reset', () => {
    fillSelectedRow();

    saveChange(null, 'Reset');

    expect(component.resultsFormArray.length).toBe(10);
    expect(component.resultsFormArray.at(0).value.Matnr).toBe('');
    expect(component.resultsFormArray.at(0).value.isSelected).toBe(false);
  });

  it('clears entries after a successful save is confirmed', async () => {
    consumableService.saveConsumableDataSet.and.returnValue(of({}));
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ value: true } as any));
    fillSelectedRow();

    saveChange(null, 'Save');
    await Promise.resolve();

    expect(component.resultsFormArray.at(0).value.Matnr).toBeNull();
    expect(component.resultsFormArray.at(0).value.isSelected).toBeNull();
  });
});
