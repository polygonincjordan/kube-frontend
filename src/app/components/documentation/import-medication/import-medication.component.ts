import { CommonModule, DatePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input, OnInit, TemplateRef } from "@angular/core";
import { EPrescriptionService } from "@services/e-Prescription/e-prescription.service";
import { StorageService } from "@services/storage.service";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { getDate } from "@services/utiltiy.service";
import { MedicationOrderTypeLabels, MedicationOrderTypeEnum } from "@services/interfaces/common.enum";
import { FormsModule } from "@angular/forms";
import { take } from "rxjs";

const MedicationTabTypes = ['Hospital Medication', 'Discharge Medication'] as const;
type MedicationTabType = typeof MedicationTabTypes[number];

interface IMedication {
  OrderId: string;
  DocKey: string;
  OrderType: string;
  OrderDesc: string;
  Status: string;
  HomeMedication: boolean;
  OwnMedication: boolean;
  Prn: boolean;
  Dose: string;
  Validity: string;
  Route: string;
  Amount: string;
  Rate: string;
  RecommendedTherapy: string;
  OrderingPhysician: string;
  Cycle: string;
}

export interface IMedicationImportData extends Record<MedicationTabType, { applicable: boolean; importedMedications: IMedication[] }> {}

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

  readonly medicationTabTypes = MedicationTabTypes;
  readonly noMedicationApplicableLabels: Record<MedicationTabType, string> = {
    'Hospital Medication': 'No Medication Order Applicable',
    'Discharge Medication': 'No Discharge Medication Order Applicable',
  };
  
  patientName: string;
  selectedTab: MedicationTabType = 'Hospital Medication';

  private modalRef: BsModalRef;
  private medications: Record<MedicationTabType, IMedication[]>;
  private selectedMedications: Record<MedicationTabType, Set<string>>;

  get noMedicationApplicable(): boolean {
    return this.data[this.selectedTab].applicable;
  }

  set noMedicationApplicable(value: boolean) {
    this.data[this.selectedTab].applicable = value;
  }

  get importedMedications(): IMedication[] {
    return this.data[this.selectedTab].importedMedications;
  }

  set importedMedications(imported: IMedication[]) {
    this.data[this.selectedTab].importedMedications = imported;
  }

  get activeTabMedications(): IMedication[] {
    return this.medications[this.selectedTab];
  }

  get activeTabSelectedMedications(): Set<string> {
    return this.selectedMedications[this.selectedTab];
  }

  constructor(
    private modalService: BsModalService, 
    private ePrescriptionService: EPrescriptionService,
    private storageService: StorageService) {
  }

  ngOnInit(): void {
    this.init();
    this.loadMedicationHistoryData();
  };

  isSelected(medication: IMedication): boolean {
    return this.activeTabSelectedMedications.has(medication.OrderId);
  }

  toggleSelection(medication: IMedication): void {
    const id = medication.OrderId;
    if (this.activeTabSelectedMedications.has(id))
      this.activeTabSelectedMedications.delete(id);
    else 
      this.activeTabSelectedMedications.add(id);
  }

  isAllSelected(): boolean {
    return this.activeTabMedications.every(med => this.activeTabSelectedMedications.has(med.OrderId));
  }

  toggleAll(): void {
    if (this.isAllSelected())
      this.activeTabSelectedMedications.clear();
    else
      this.activeTabMedications.forEach(medication => this.activeTabSelectedMedications.add(medication.OrderId));
  }

  medicationImport() {
    const selectedMedications = this.activeTabMedications.filter(medication => this.activeTabSelectedMedications.has(medication.OrderId));
    this.importedMedications = selectedMedications;
    this.modalRef?.hide();
  }

  openModal(template: TemplateRef<any>) {
    const config: ModalOptions = { class: 'modal-dialog modal-dialog-centered medication-order-case modal-xl' };
    this.modalRef = this.modalService.show(template, config);
    
    this.modalRef.onHide.pipe(take(1)).subscribe(() => {
      this.setSelectedMedicationsToImports();
    });
  }

  private init() {
    // get patient name from storage service
    this.patientName = this.storageService.patientData.name;

    // if no data, initialize with default values
    if (!this.data) {
      this.data = {
        "Hospital Medication": { applicable: false, importedMedications: [] },
        "Discharge Medication": { applicable: false, importedMedications: [] },
      };
    }

    // set selected medications based on input data
    this.setSelectedMedicationsToImports();
  }

  private setSelectedMedicationsToImports() {
    this.selectedMedications = {
      'Hospital Medication': new Set<string>(this.data?.['Hospital Medication']?.importedMedications?.map(med => med.OrderId) ?? []),
      'Discharge Medication': new Set<string>(this.data?.['Discharge Medication']?.importedMedications?.map(med => med.OrderId) ?? []),
    };
  }

  private loadMedicationHistoryData() {
    const entitySet = `e-prescription/OrderHistorylist?Einri=${this.ePrescriptionService.parameters.einri}&Falnr=${this.ePrescriptionService.parameters.falnr}`;
    this.ePrescriptionService
      .loadData(entitySet, false, false, false, false)
      .subscribe((res: any) => {
        // if no data, return
        if (!res?.body?.d?.results?.length) return;
        
        // map returned data to medication items, and filter out null items
        const medicationItems: IMedication[] = res.body.d.results
          ?.map((medication: any) => this.mapMedication(medication))
          ?.filter((medication: IMedication) => !!medication);
        
        // initialize medications record
        this.medications = {
          'Hospital Medication': [ ...medicationItems?.filter(item => !this.isDischargeType(item))],
          'Discharge Medication': [ ...medicationItems?.filter(item => this.isDischargeType(item))],
        };

        debugger
      });
  }

  private isDischargeType(medication: IMedication): boolean {
    return medication?.OrderType === MedicationOrderTypeLabels[MedicationOrderTypeEnum.Discharge];
  }

  private mapMedication(medication: any): IMedication {
    if (!medication) return null;

    return {
      OrderId: medication.Meordid,
      DocKey: '',
      OrderType: MedicationOrderTypeLabels[medication.MotypId],
      OrderDesc: `${medication.Descrlt}, ${medication.Quan}, ${medication.Quanunit}, ${medication.Routedescr}, ${medication.N1id}`,
      Status: medication.MosidDesc,
      HomeMedication: medication.MotypId ? medication.MotypId === MedicationOrderTypeEnum.Anamnesis : true,
      OwnMedication: medication.Pom === '1',
      Prn: medication.Prn,
      Dose: `${medication.Quan} ${medication.Quanunit}`,
      Validity: this.getValidityDate(medication),
      Route: medication.Routedescr,
      Amount: '',
      Rate: '',
      RecommendedTherapy: '00000',
      OrderingPhysician: medication.EmpRespNm,
      Cycle: medication.N1id,
    };
  }

  private getValidityDate(element: any) {
    const from = new DatePipe('en-US').transform(getDate(element.StartD), 'dd.MM.yyyy');
    const to = new DatePipe('en-US').transform(getDate(element.EndD), 'dd.MM.yyyy');

    let date = `${from}`;
    if (to) date += ` - ${to}`;

    return date;
  }
}