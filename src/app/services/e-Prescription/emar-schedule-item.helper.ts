import { formatDate } from '@angular/common';
import { Subscription } from 'rxjs';
import swal from 'sweetalert2';
import { EPrescriptionService, MedicationData, MedicationEventData, PrescriptionList } from './e-prescription.service';

export function bindEmarPanelRefresh(
  ePrescriptionService: EPrescriptionService,
  onRefreshed: (list: PrescriptionList) => void
): Subscription {
  return ePrescriptionService.emarPanelRefreshed$.subscribe(onRefreshed);
}

export type EmarScheduleGridItem = {
  Hour?: number;
  Events?: MedicationEventData;
  Color?: string;
  Label?: string;
  SubLabel?: string;
  Userst?: string;
};

export interface ResolveEmarScheduleItemOptions {
  item: EmarScheduleGridItem | null | undefined;
  orderRow: MedicationData | null | undefined;
  allEventData: MedicationEventData[];
  currentDate: Date | null | undefined;
  isPrnOrderRow: (row: MedicationData) => boolean;
  findPrnMasterScheduleItem: (row: MedicationData) => EmarScheduleGridItem | null;
}

export function isEmptyScheduleCell(item: EmarScheduleGridItem | null | undefined): boolean {
  if (item?.Events) {
    return false;
  }
  return item?.Color === 'blank-data' || (!item?.Label && !item?.SubLabel);
}

export function resolveScheduleItemForAdministration(
  options: ResolveEmarScheduleItemOptions
): EmarScheduleGridItem | null {
  const { item, orderRow, allEventData, currentDate, isPrnOrderRow, findPrnMasterScheduleItem } = options;

  if (item?.Events) {
    return item;
  }

  if (orderRow && isPrnOrderRow(orderRow)) {
    const master = findPrnMasterScheduleItem(orderRow);
    if (master?.Events) {
      return master;
    }
  }

  if (item?.Hour != null && orderRow?.Meordid && allEventData?.length) {
    const gridDate = currentDate ?? new Date();
    const dayStr = formatDate(gridDate, 'yyyy-MM-dd', 'en_US');
    const ev = allEventData.find(
      (e) =>
        e.Meordid == orderRow.Meordid &&
        formatDate(e.ParsedDate, 'yyyy-MM-dd', 'en_US') === dayStr &&
        e.Schedule?.Hour === item.Hour
    );
    if (ev) {
      return { ...item, Events: ev };
    }
  }

  return item ?? null;
}

export function showMissingEventDataPopup(): void {
  swal.fire({
    text: 'Unable to open administration: missing event data.',
    icon: 'error',
    confirmButtonText: 'Ok',
    showCloseButton: true,
    allowOutsideClick: false,
    customClass: { popup: 'myalertpopup' },
  } as any);
}
