import { CommonModule, DatePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, TemplateRef } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { EPrescriptionService } from "@services/e-Prescription/e-prescription.service";
import { MedicationOrderTypeEnum, MedicationOrderTypeLabels } from "@services/interfaces/common.enum";
import { StorageService } from "@services/storage.service";
import { getDate } from "@services/utiltiy.service";

const MedicationTabTypes = ['Hospital Medication', 'Discharge Medication'] as const;
type MedicationTabType = typeof MedicationTabTypes[number];

interface IDischargeMedication {
  OrderId: string;
  Dockey: string;
  OrderType: string;
  OrderDesc: string;
  // HomeMedication: boolean;
  OwnMedication: boolean;
  Dose: string;
  Validity: string;
  Route: string;
  Amount: string;
  Rate: string;
  RecommendedTherapy: string;
  OrderingPhysician: string;
  Cycle: string;
}

interface IHospitalMedication {
  EventId: string;
  Dockey: string;
  EventDesc: string;
  Dose: string;
  Validity: string;
  Route: string;
  Rate: string;
  Cycle: string;
}

type MedicationUnion = IDischargeMedication | IHospitalMedication;

export interface IMedicationImportData {
  'Hospital Medication': { applicable: boolean; importedMedications: IHospitalMedication[] };
  'Discharge Medication': { applicable: boolean; importedMedications: IDischargeMedication[] };
}

@Component({
  standalone: true,
  selector: "app-import-medication",
  templateUrl: "./import-medication.component.html",
  styleUrls: ["./import-medication.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
})
export class ImportMedicationComponent implements OnInit {
  @Input() data: IMedicationImportData;
  @Output() dataChange = new EventEmitter<IMedicationImportData>();

  readonly medicationTabTypes = MedicationTabTypes;
  readonly noMedicationApplicableLabels: Record<MedicationTabType, string> = {
    'Hospital Medication': 'No Medication Order Applicable',
    'Discharge Medication': 'No Discharge Medication Order Applicable',
  };

  patientName: string;
  selectedTab: MedicationTabType = 'Hospital Medication';

  private modalRef: BsModalRef;
  private allMedications: Record<MedicationTabType, MedicationUnion[]>;
  private availableMedications: Record<MedicationTabType, MedicationUnion[]>;
  private selectedForImport: Record<MedicationTabType, Set<string>>;
  private medicationStatusMap: Map<string, string> = new Map();

  constructor(
    private modalService: BsModalService,
    private ePrescriptionService: EPrescriptionService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.patientName = this.storageService.patientData.name;
    this.initializeData();
    this.initializeSelections();
    this.loadMedicationHistoryData();
  }

  get noMedicationApplicable(): boolean {
    return this.data[this.selectedTab].applicable;
  }

  set noMedicationApplicable(value: boolean) {
    this.data[this.selectedTab].applicable = value;
    this.dataChange.emit(this.data);
  }

  get importedMedications(): MedicationUnion[] {
    return this.data[this.selectedTab].importedMedications as MedicationUnion[];
  }

  get activeTabMedications(): MedicationUnion[] {
    return this.availableMedications?.[this.selectedTab] ?? [];
  }

  get activeTabSelections(): Set<string> {
    if (!this.selectedForImport) {
      this.initializeSelections();
    }
    return this.selectedForImport[this.selectedTab];
  }


  isSelected(medication: MedicationUnion): boolean {
    return this.activeTabSelections.has(this.getIdentifier(medication));
  }

  toggleSelection(medication: MedicationUnion): void {
    const identifier = this.getIdentifier(medication);
    const selections = this.activeTabSelections;

    if (selections.has(identifier)) {
      selections.delete(identifier);
    } else {
      selections.add(identifier);
    }
  }

  isAllSelected(): boolean {
    const medications = this.activeTabMedications;
    if (medications.length === 0) return false;

    return medications.every(med => this.activeTabSelections.has(this.getIdentifier(med)));
  }

  toggleAll(): void {
    const medications = this.activeTabMedications;
    if (medications.length === 0) return;

    const selections = this.activeTabSelections;
    const allSelected = this.isAllSelected();

    medications.forEach(med => {
      const identifier = this.getIdentifier(med);
      allSelected ? selections.delete(identifier) : selections.add(identifier);
    });
  }

  openModal(template: TemplateRef<any>): void {
    this.initializeSelections();
    const config: ModalOptions = { 
      class: 'modal-dialog modal-dialog-centered medication-order-case modal-xl' 
    };
    this.modalRef = this.modalService.show(template, config);
  }

  medicationImport(): void {
    const selectedMedications = this.activeTabMedications.filter(med =>
      this.activeTabSelections.has(this.getIdentifier(med))
    );

    const existingImported = this.data[this.selectedTab].importedMedications || [];
    this.data[this.selectedTab].importedMedications = [
      ...existingImported,
      ...selectedMedications
    ] as any;

    this.emitDataChange();
    this.activeTabSelections.clear();
    this.updateAvailableMedications();
    this.modalRef?.hide();
  }

  deleteMedication(medication: MedicationUnion): void {
    const identifier = this.getIdentifier(medication);
    const filteredMedications = this.importedMedications.filter(
      med => this.getIdentifier(med) !== identifier
    );

    this.data[this.selectedTab].importedMedications = filteredMedications as any;
    this.emitDataChange();
    this.updateAvailableMedications();
  }

  getDischargeMedication(medication: MedicationUnion): IDischargeMedication {
    return medication as IDischargeMedication;
  }

  getHospitalMedication(medication: MedicationUnion): IHospitalMedication {
    return medication as IHospitalMedication;
  }

  getMedicationStatus(medication: MedicationUnion): string {
    const id = this.getIdentifier(medication);
    return this.medicationStatusMap.get(id) || '';
  }

  private getIdentifier(medication: MedicationUnion): string {
    return this.selectedTab === 'Hospital Medication'
      ? (medication as IHospitalMedication).EventId
      : (medication as IDischargeMedication).OrderId;
  }

  private emitDataChange(): void {
    this.dataChange.emit(this.data);
  }

  private initializeData(): void {
    if (!this.data) {
      this.data = {
        'Hospital Medication': { applicable: false, importedMedications: [] },
        'Discharge Medication': { applicable: false, importedMedications: [] },
      };
    }
  }

  private initializeSelections(): void {
    this.selectedForImport = {
      'Hospital Medication': new Set<string>(),
      'Discharge Medication': new Set<string>(),
    };
  }

  private loadMedicationHistoryData(): void {
    const { einri, falnr } = this.ePrescriptionService.parameters;
    const entitySet = `e-prescription/OrderHistorylist?Einri=${einri}&Falnr=${falnr}`;

    this.ePrescriptionService.loadData(entitySet, false, false, false, false).subscribe((res: any) => {
      const results = res?.body?.d?.results;
      if (!results?.length) return;

      const isDischarge = (med: any) => med?.MotypId === MedicationOrderTypeEnum.Discharge;

      this.allMedications = {
        'Discharge Medication': results
          .filter(isDischarge)
          .map((med: any) => this.mapToDischargeMedication(med))
          .filter(Boolean),
        'Hospital Medication': results
          .filter((med: any) => !isDischarge(med))
          .map((med: any) => this.mapToHospitalMedication(med))
          .filter(Boolean),
      } as any;
      this.updateAvailableMedications();
    });
  }

  private updateAvailableMedications(): void {
    const getImportedIds = (tab: MedicationTabType) => {
      const medications = this.data[tab].importedMedications;
      return tab === 'Hospital Medication'
        ? new Set((medications as IHospitalMedication[]).map(m => m.EventId))
        : new Set((medications as IDischargeMedication[]).map(m => m.OrderId));
    };

    const filterAvailable = (tab: MedicationTabType): MedicationUnion[] => {
      const importedIds = getImportedIds(tab);
      return (this.allMedications?.[tab] ?? []).filter(med => {
        const id = this.selectedTab === tab ? this.getIdentifier(med) : 
          tab === 'Hospital Medication' 
            ? (med as IHospitalMedication).EventId 
            : (med as IDischargeMedication).OrderId;
        return !importedIds.has(id);
      });
    };

    this.availableMedications = {
      'Hospital Medication': filterAvailable('Hospital Medication'),
      'Discharge Medication': filterAvailable('Discharge Medication'),
    } as any;
  }

  private mapToDischargeMedication(med: any): IDischargeMedication | null {
    if (!med) return null;

    const { Meordid, Dockey, MotypId, Descrlt, Quan, Quanunit, Routedescr, N1id, Pom, EmpRespNm, MosidDesc } = med;

    if (Meordid && MosidDesc) {
      this.medicationStatusMap.set(Meordid, MosidDesc);
    }

    return {
      OrderId: Meordid,
      Dockey: Dockey || '',
      OrderType: MedicationOrderTypeLabels[MotypId],
      OrderDesc: `${Descrlt}, ${Quan}, ${Quanunit}, ${Routedescr}, ${N1id}`,
      // HomeMedication: MotypId === MedicationOrderTypeEnum.Anamnesis,
      OwnMedication: !!Pom,
      Dose: `${Quan} ${Quanunit}`,
      Validity: this.formatValidityDate(med),
      Route: Routedescr,
      Amount: '',
      Rate: '',
      RecommendedTherapy: '00000',
      OrderingPhysician: EmpRespNm,
      Cycle: N1id,
    };
  }

  private mapToHospitalMedication(med: any): IHospitalMedication | null {
    if (!med) return null;

    const { Meordid, Dockey, Descrlt, Quan, Quanunit, Routedescr, N1id, } = med;

    return {
      EventId: Meordid,
      Dockey: Dockey || '',
      EventDesc: Descrlt || '',
      Dose: `${Quan} ${Quanunit}`,
      Validity: this.formatValidityDate(med),
      Route: Routedescr,
      Rate: '',
      Cycle: N1id,
    };
  }
  

  private formatValidityDate(med: any): string {
    const datePipe = new DatePipe('en-US');
    const formatDate = (date: any) => datePipe.transform(getDate(date), 'dd.MM.yyyy');
    
    const fromDate = formatDate(med.StartD);
    const toDate = formatDate(med.EndD);
    
    return toDate ? `${fromDate} - ${toDate}` : fromDate;
  }
}