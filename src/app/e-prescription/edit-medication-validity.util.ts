import { FormGroup } from '@angular/forms';
import { formatDate } from 'ngx-bootstrap/chronos';
import swal from 'sweetalert2';

export interface EditMedicationValidity {
  duration: number;
  unit: string;
  end: number;
}

export function getEditMedicationValidity(form: FormGroup): EditMedicationValidity {
  const { Pdur, Pduru, EndD } = form.value;
  return {
    duration: Number(Pdur),
    unit: Pduru,
    end: EndD ? new Date(EndD).getTime() : NaN,
  };
}

export function needsEditMedicationValidityReminder(
  form: FormGroup, automaticValidity: EditMedicationValidity
): boolean {
  const current = getEditMedicationValidity(form);
  return !!automaticValidity && Number.isFinite(current.duration) && current.duration > 0 &&
    !!current.unit && Number.isFinite(current.end) &&
    current.duration === automaticValidity.duration && current.unit === automaticValidity.unit &&
    current.end === automaticValidity.end;
}

export function showEditMedicationValidityReminder(form: FormGroup, durationUnitText: string): Promise<boolean> {
  const { Result_Drug_Name, Meordid, Pdur, Pduru, EndD } = form.value;
  return swal.fire({
    title: 'Confirm order validity',
    text: `The order ${Result_Drug_Name || Meordid || ''} has a duration of ${Pdur} ${durationUnitText || Pduru} and is valid to ${formatDate(EndD, 'DD.MM.YYYY HH:mm:ss')}. Are you sure you want to continue?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#0890c5',
    cancelButtonColor: '#84898c',
    confirmButtonText: 'Yes',
    cancelButtonText: 'No',
    customClass: { popup: 'myalertpopup' },
  }).then(result => result.isConfirmed);
}
