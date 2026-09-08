import { DatePipe } from '@angular/common';

import { OperationReportComponent } from './operation-report.component';

describe('OperationReportComponent', () => {
  let component: OperationReportComponent;

  beforeEach(() => {
    const route: any = { queryParams: { subscribe: () => undefined } };
    component = new OperationReportComponent(
      {} as any,
      route,
      new DatePipe('en-US'),
      {} as any,
      {} as any
    );
    component.initForm();
  });

  it('leaves the surgery and report times empty on a new document', () => {
    expect(component.inPatientOrrptDataSet.get('TimeOfSurgery').value).toBe('');
    expect(component.inPatientOrrptDataSet.get('TimeOfReportEntry').value).toBe('');
  });

  it('still defaults the surgery and report dates to today', () => {
    const today = new Date().toDateString();
    expect(component.inPatientOrrptDataSet.get('DateOfSurgery').value.toDateString()).toBe(today);
    expect(component.inPatientOrrptDataSet.get('DateOfReportEntry').value.toDateString()).toBe(today);
  });

  it('sends a zero duration when a time is left empty', () => {
    component.onChangeTime('', 'TimeOfSurgery');
    expect(component.inPatientOrrptDataSet.get('TimeOfSurgery').value).toBe('PT00H00M00S');
  });

  it('sends the entered time as an OData duration', () => {
    component.onChangeTime('14:30:05', 'TimeOfReportEntry');
    expect(component.inPatientOrrptDataSet.get('TimeOfReportEntry').value).toBe('PT14H30M05S');
  });
});
