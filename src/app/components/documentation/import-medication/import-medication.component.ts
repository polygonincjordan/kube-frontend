import { CommonModule, DatePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, TemplateRef } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { EPrescriptionService } from "@services/e-Prescription/e-prescription.service";
import { MedicationOrderTypeEnum, MedicationOrderTypeLabels } from "@services/interfaces/common.enum";
import { StorageService } from "@services/storage.service";
import { getDate } from "@services/utiltiy.service";

const MedicationTabTypes = ['Hospital Medication', 'Discharge and Home Medication'] as const;
type MedicationTabType = typeof MedicationTabTypes[number];
// const DischargeMedicationOrderTypes = ['Discharge Medication', 'Home Medication'] as const;
// type DischargeMedicaionTabType = typeof DischargeMedicationOrderTypes[number];

interface IDischargeMedication {
  OrderId: string;
  Dockey: string;
  OrderType: string;
  OrderDesc: string;
  Description: string;
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
  Descr: string;
  Dose: string;
  Validity: string;
  Route: string;
  Rate: string;
  Cycle: string;
}

type MedicationUnion = IDischargeMedication | IHospitalMedication;

export interface IMedicationImportData {
  'Hospital Medication': { applicable: boolean; importedMedications: IHospitalMedication[] };
  'Discharge and Home Medication': { applicable: boolean; importedMedications: IDischargeMedication[] };
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
  @Input() data!: IMedicationImportData;
  @Output() dataChange = new EventEmitter<IMedicationImportData>();

  readonly medicationTabTypes = MedicationTabTypes;
  readonly noMedicationApplicableLabels: Record<MedicationTabType, string> = {
    'Hospital Medication': 'No Medication Order Applicable',
    'Discharge and Home Medication': 'No Discharge and home Medication Order Applicable',
  };

  // readonly dischargeTabTypes = DischargeMedicationOrderTypes;
  // readonly noMedicationApplicableLabels: Record<MedicationTabType, string> = {
  //   'Hospital Medication': 'No Medication Order Applicable',
  //   'Discharge and Home Medication': 'No Discharge and home Medication Order Applicable',
  // };
  // selectedChildTab: DischargeMedicaionTabType = 'Discharge Medication';

  selectedOrderType: 'Discharge Medication' | 'Home Medication' = 'Discharge Medication';

  filteredMedications: any[] = [];

  patientName!: string;
  selectedTab: MedicationTabType = 'Hospital Medication';

  private modalRef!: BsModalRef;
  private allMedications!: Record<MedicationTabType, MedicationUnion[]>;
  private availableMedications!: Record<MedicationTabType, MedicationUnion[]>;
  private selectedForImport!: Record<MedicationTabType, Set<string>>;
  private medicationStatusMap: Map<string, string> = new Map();

  constructor(
    private modalService: BsModalService,
    private ePrescriptionService: EPrescriptionService,
    private storageService: StorageService
  ) { }

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
    let medications = this.activeTabMedications;
    if (this.selectedOrderType === 'Discharge Medication') {
      medications = medications.filter(
        (medication: any) => medication.OrderType === 'Discharge'
      );
    } else if (this.selectedOrderType === 'Home Medication') {
      medications = medications.filter(
        (medication: any) => medication.OrderType === 'Home'
      );
    }
    if (medications.length === 0) {
      return false;
    }
    return medications.every(med =>
      this.activeTabSelections.has(this.getIdentifier(med))
    );
  }

  toggleAll(): void {
    let medications: any[] = [];
    if (this.selectedTab === 'Hospital Medication') {
      medications = this.activeTabMedications;
    } else {
      const cleanedType = this.selectedOrderType?.replace(/medication/gi, '').trim();
      medications = this.activeTabMedications.filter(
        (medication: any) => medication.OrderType === cleanedType
      );
    }
    if (medications.length === 0) return;
    const selections = this.activeTabSelections;
    const allSelected = this.isAllSelected();

    medications.forEach((med: any) => {
      const identifier = this.getIdentifier(med);
      if (allSelected) {
        selections.delete(identifier);
      } else {
        selections.add(identifier);
      }
    });
  }

  openModal(template: TemplateRef<any>): void {
    this.initializeSelections();
    this.filterMedicationsByOrderType('Discharge')
    const config: ModalOptions = {
      class: 'modal-dialog modal-dialog-centered medication-order-case modal-xl',
      ignoreBackdropClick: false, // Set true if you want to force action before closing
      keyboard: true,             // Enables ESC key to close
      animated: true
    };
    this.modalRef = this.modalService.show(template, config);
    // Optional: Subscribe to hide event for cleanup actions
    this.modalService.onHide.subscribe((reason: string | number) => {
      this.selectedOrderType = 'Discharge Medication';
      this.filterMedicationsByOrderType('Discharge')
    });
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
    // this.selectedOrderType = 'Discharge Medication';
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

  private getIdentifier(medication: MedicationUnion): any {
    if ('EventId' in medication) {
      return (medication as IHospitalMedication).EventId;
    } else if ('OrderId' in medication) {
      return (medication as IDischargeMedication).OrderId;
    }
  }

  private emitDataChange(): void {
    this.dataChange.emit(this.data);
  }

  private initializeData(): void {
    if (!this.data) {
      this.data = {
        'Hospital Medication': { applicable: false, importedMedications: [] },
        'Discharge and Home Medication': { applicable: false, importedMedications: [] },
      };
    }
  }

  private initializeSelections(): void {
    this.selectedForImport = {
      'Hospital Medication': new Set<string>(),
      'Discharge and Home Medication': new Set<string>(),
    };
  }

  private dataReturn(): any {
    return {
      d: {
        results: [
          {
            __metadata: {
              id: "http://amcqaemr01.ach.jo:8000/sap/opu/odata/sap/ZNISHMEDORDER_HIST_SRV/OrderHistorySet('0000011266')",
              uri: "http://amcqaemr01.ach.jo:8000/sap/opu/odata/sap/ZNISHMEDORDER_HIST_SRV/OrderHistorySet('0000011266')",
              type: "ZNISHMEDORDER_HIST_SRV.OrderHistory"
            },
            Meordid: "0000011266",
            Einri: "1000",
            Falnr: "6980",
            Agentid: "",
            Drugid: "000C298BC8581ED99EAFD89AF0E7E576",
            Descrlt: "PANADOL ADVANCE 500 MG ORAL TABLETAM",
            Phformid: "01C",
            Formatdescr: "tablet",
            Aprouteid: "00T",
            Routedescr: "oral",
            Pdur: "5.000",
            Pduru: "TAG",
            Durunittxt: "Days",
            Quan: "2.000",
            Quanunit: "EA",
            Quantunittxt: "each",
            N1znr: "0000000062",
            N1id: "QID",
            N1ztxt: "",
            Prn: true,
            Prncond: "when needed test Discharge",
            EmpResp: "9000000050",
            EmpRespNm: "Saja Oweis",
            Physicin: "9000000059",
            Physicinnm: "Abu Nimeh, Alaa",
            Lfdnr: "00000",
            MotypId: "40",
            Descr: "",
            Orgfa: "CARMDAMC",
            OrgfaNm: "CARDIOLOGY",
            Orgpf: "F3CIUAMC",
            OrgpfNm: "3rd Floor IDU",
            StartD: "/Date(1786320000000)/",
            StartT: "PT11H54M00S",
            EndD: "/Date(1786752000000)/",
            EndT: "PT11H54M00S",
            AddDose: "",
            Complex: "",
            Pom: "",
            PomTxt: "",
            Priority: "000",
            PriorityTxt: "",
            Mosid: "200",
            MosidDesc: "Active",
            Indisdos: "Null",
            Purpose: "1",
            ValidationDate: null,
            ValidationTime: "PT00H00M00S",
            ValidationVma: "",
            ValidationNm: "",
            Dosdef: ""
          },
          {
            __metadata: {
              id: "http://amcqaemr01.ach.jo:8000/sap/opu/odata/sap/ZNISHMEDORDER_HIST_SRV/OrderHistorySet('0000011265')",
              uri: "http://amcqaemr01.ach.jo:8000/sap/opu/odata/sap/ZNISHMEDORDER_HIST_SRV/OrderHistorySet('0000011265')",
              type: "ZNISHMEDORDER_HIST_SRV.OrderHistory"
            },
            Meordid: "0000011265",
            Einri: "1000",
            Falnr: "6980",
            Agentid: "",
            Drugid: "000C298BC8581EEA83D042F66B201F25",
            Descrlt: "Revanin DS 250 Mg/5 Ml Oral Suspension",
            Phformid: "001",
            Formatdescr: "suspension",
            Aprouteid: "00T",
            Routedescr: "oral",
            Pdur: "0.000",
            Pduru: "",
            Durunittxt: "",
            Quan: "15.000",
            Quanunit: "ML",
            Quantunittxt: "ml",
            N1znr: "0000000062",
            N1id: "QID",
            N1ztxt: "",
            Prn: false,
            Prncond: "",
            EmpResp: "9000000050",
            EmpRespNm: "Saja Oweis",
            Physicin: "9000000059",
            Physicinnm: "Abu Nimeh, Alaa",
            Lfdnr: "00000",
            MotypId: "40",
            Descr: "",
            Orgfa: "CARMDAMC",
            OrgfaNm: "CARDIOLOGY",
            Orgpf: "F3CIUAMC",
            OrgpfNm: "3rd Floor IDU",
            StartD: "/Date(1786320000000)/",
            StartT: "PT11H52M00S",
            EndD: null,
            EndT: "PT00H00M00S",
            AddDose: "",
            Complex: "",
            Pom: "",
            PomTxt: "",
            Priority: "000",
            PriorityTxt: "",
            Mosid: "200",
            MosidDesc: "Active",
            Indisdos: "Null",
            Purpose: "3",
            ValidationDate: null,
            ValidationTime: "PT00H00M00S",
            ValidationVma: "",
            ValidationNm: "",
            Dosdef: ""
          },
          {
            __metadata: {
              id: "http://amcqaemr01.ach.jo:8000/sap/opu/odata/sap/ZNISHMEDORDER_HIST_SRV/OrderHistorySet('0000011264')",
              uri: "http://amcqaemr01.ach.jo:8000/sap/opu/odata/sap/ZNISHMEDORDER_HIST_SRV/OrderHistorySet('0000011264')",
              type: "ZNISHMEDORDER_HIST_SRV.OrderHistory"
            },
            Meordid: "0000011264",
            Einri: "1000",
            Falnr: "6980",
            Agentid: "",
            Drugid: "000C298BC8581ED996D9C2D47BB48364",
            Descrlt: "cefTRIAXone 1 g injection",
            Phformid: "013",
            Formatdescr: "powder for injection",
            Aprouteid: "00O",
            Routedescr: "intravenous",
            Pdur: "0.000",
            Pduru: "",
            Durunittxt: "",
            Quan: "1.000",
            Quanunit: "G",
            Quantunittxt: "each",
            N1znr: "0000000056",
            N1id: "BID",
            N1ztxt: "",
            Prn: false,
            Prncond: "",
            EmpResp: "9000000050",
            EmpRespNm: "Saja Oweis",
            Physicin: "9000000059",
            Physicinnm: "Abu Nimeh, Alaa",
            Lfdnr: "00000",
            MotypId: "40",
            Descr: "",
            Orgfa: "CARMDAMC",
            OrgfaNm: "CARDIOLOGY",
            Orgpf: "F3CIUAMC",
            OrgpfNm: "3rd Floor IDU",
            StartD: "/Date(1786320000000)/",
            StartT: "PT11H52M00S",
            EndD: null,
            EndT: "PT00H00M00S",
            AddDose: "",
            Complex: "",
            Pom: "",
            PomTxt: "",
            Priority: "000",
            PriorityTxt: "",
            Mosid: "200",
            MosidDesc: "Active",
            Indisdos: "Null",
            Purpose: "3",
            ValidationDate: null,
            ValidationTime: "PT00H00M00S",
            ValidationVma: "",
            ValidationNm: "",
            Dosdef: ""
          },
          {
            __metadata: {
              id: "http://amcqaemr01.ach.jo:8000/sap/opu/odata/sap/ZNISHMEDORDER_HIST_SRV/OrderHistorySet('0000011263')",
              uri: "http://amcqaemr01.ach.jo:8000/sap/opu/odata/sap/ZNISHMEDORDER_HIST_SRV/OrderHistorySet('0000011263')",
              type: "ZNISHMEDORDER_HIST_SRV.OrderHistory"
            },
            Meordid: "0000011263",
            Einri: "1000",
            Falnr: "6980",
            Agentid: "",
            Drugid: "000C298BC8581ED99EAFD89AF0E7E577",
            Descrlt: "AMOXICILLIN 500 MG CAPSULE",
            Phformid: "01C",
            Formatdescr: "capsule",
            Aprouteid: "00T",
            Routedescr: "oral",
            Pdur: "7.000",
            Pduru: "TAG",
            Durunittxt: "Days",
            Quan: "1.000",
            Quanunit: "EA",
            Quantunittxt: "each",
            N1znr: "0000000062",
            N1id: "TID",
            N1ztxt: "",
            Prn: false,
            Prncond: "",
            EmpResp: "9000000050",
            EmpRespNm: "Saja Oweis",
            Physicin: "9000000059",
            Physicinnm: "Abu Nimeh, Alaa",
            Lfdnr: "00000",

            // Home Medication
            MotypId: "30",

            Descr: "",
            Orgfa: "CARMDAMC",
            OrgfaNm: "CARDIOLOGY",
            Orgpf: "F3CIUAMC",
            OrgpfNm: "3rd Floor IDU",
            StartD: "/Date(1786320000000)/",
            StartT: "PT12H00M00S",
            EndD: "/Date(1786924800000)/",
            EndT: "PT12H00M00S",
            AddDose: "",
            Complex: "",
            Pom: "",
            PomTxt: "",
            Priority: "000",
            PriorityTxt: "",
            Mosid: "200",
            MosidDesc: "Active",
            Indisdos: "Null",
            Purpose: "4",
            ValidationDate: null,
            ValidationTime: "PT00H00M00S",
            ValidationVma: "",
            ValidationNm: "",
            Dosdef: ""
          },
          {
            __metadata: {
              id: "http://amcqaemr01.ach.jo:8000/sap/opu/odata/sap/ZNISHMEDORDER_HIST_SRV/OrderHistorySet('0000011262')",
              uri: "http://amcqaemr01.ach.jo:8000/sap/opu/odata/sap/ZNISHMEDORDER_HIST_SRV/OrderHistorySet('0000011262')",
              type: "ZNISHMEDORDER_HIST_SRV.OrderHistory"
            },
            Meordid: "0000011262",
            Einri: "1000",
            Falnr: "6980",
            Agentid: "",
            Drugid: "000C298BC8581ED99EAFD89AF0E7E578",
            Descrlt: "IBUPROFEN 400 MG TABLET",
            Phformid: "01C",
            Formatdescr: "tablet",
            Aprouteid: "00T",
            Routedescr: "oral",
            Pdur: "5.000",
            Pduru: "TAG",
            Durunittxt: "Days",
            Quan: "1.000",
            Quanunit: "EA",
            Quantunittxt: "each",
            N1znr: "0000000062",
            N1id: "BID",
            N1ztxt: "",
            Prn: true,
            Prncond: "For pain if required",
            EmpResp: "9000000050",
            EmpRespNm: "Saja Oweis",
            Physicin: "9000000059",
            Physicinnm: "Abu Nimeh, Alaa",
            Lfdnr: "00000",

            // Home Medication
            MotypId: "30",

            Descr: "",
            Orgfa: "CARMDAMC",
            OrgfaNm: "CARDIOLOGY",
            Orgpf: "F3CIUAMC",
            OrgpfNm: "3rd Floor IDU",
            StartD: "/Date(1786320000000)/",
            StartT: "PT12H10M00S",
            EndD: "/Date(1786752000000)/",
            EndT: "PT12H10M00S",
            AddDose: "",
            Complex: "",
            Pom: "",
            PomTxt: "",
            Priority: "000",
            PriorityTxt: "",
            Mosid: "200",
            MosidDesc: "Active",
            Indisdos: "Null",
            Purpose: "4",
            ValidationDate: null,
            ValidationTime: "PT00H00M00S",
            ValidationVma: "",
            ValidationNm: "",
            Dosdef: ""
          },
          {
            __metadata: {
              id: "http://amcqaemr01.ach.jo:8000/sap/opu/odata/sap/ZNISHMEDORDER_HIST_SRV/OrderHistorySet('0000011261')",
              uri: "http://amcqaemr01.ach.jo:8000/sap/opu/odata/sap/ZNISHMEDORDER_HIST_SRV/OrderHistorySet('0000011261')",
              type: "ZNISHMEDORDER_HIST_SRV.OrderHistory"
            },
            Meordid: "0000011261",
            Einri: "1000",
            Falnr: "6980",
            Agentid: "",
            Drugid: "000C298BC8581ED99EAFD89AF0E7E579",
            Descrlt: "VITAMIN D3 1000 IU TABLET",
            Phformid: "01C",
            Formatdescr: "tablet",
            Aprouteid: "00T",
            Routedescr: "oral",
            Pdur: "30.000",
            Pduru: "TAG",
            Durunittxt: "Days",
            Quan: "1.000",
            Quanunit: "EA",
            Quantunittxt: "each",
            N1znr: "0000000062",
            N1id: "OD",
            N1ztxt: "",
            Prn: false,
            Prncond: "",
            EmpResp: "9000000050",
            EmpRespNm: "Saja Oweis",
            Physicin: "9000000059",
            Physicinnm: "Abu Nimeh, Alaa",
            Lfdnr: "00000",

            // Home Medication
            MotypId: "30",

            Descr: "",
            Orgfa: "CARMDAMC",
            OrgfaNm: "CARDIOLOGY",
            Orgpf: "F3CIUAMC",
            OrgpfNm: "3rd Floor IDU",
            StartD: "/Date(1786320000000)/",
            StartT: "PT12H15M00S",
            EndD: "/Date(1788912000000)/",
            EndT: "PT12H15M00S",
            AddDose: "",
            Complex: "",
            Pom: "",
            PomTxt: "",
            Priority: "000",
            PriorityTxt: "",
            Mosid: "200",
            MosidDesc: "Active",
            Indisdos: "Null",
            Purpose: "4",
            ValidationDate: null,
            ValidationTime: "PT00H00M00S",
            ValidationVma: "",
            ValidationNm: "",
            Dosdef: ""
          }
        ]
      }
    };
  }

  private loadMedicationHistoryData(): void {
    const { einri, falnr } = this.ePrescriptionService.parameters;
    const entitySet = `e-prescription/OrderHistorylist?Einri=${einri}&Falnr=${falnr}`;
    this.ePrescriptionService.loadData(entitySet, false, false, false, false).subscribe((res: any) => {
      const results = res?.body?.d?.results ?? [];
      // const customResults = this.dataReturn().d.results;
      // results.push(...customResults);
      if (!results?.length) return;
      // const isDischarge = (med: any) => med?.MotypId === MedicationOrderTypeEnum.Discharge;
      // const isHomeMedicaion = (med: any) => med?.MotypId === '40';
      this.allMedications = {
        'Discharge and Home Medication': results
          .filter((med: any) => ['30', '00'].includes(String(med.MotypId)))
          .map((med: any) => this.mapToDischargeMedication(med))
          .filter(Boolean),

        'Hospital Medication': results
          .filter((med: any) => String(med.MotypId) === '20')
          .map((med: any) => this.mapToHospitalMedication(med))
          .filter(Boolean)
      } as any;
      // this.allMedications = {
      //   'Discharge and Home Medication': results
      //     .filter(isDischarge)
      //     .map((med: any) => this.mapToDischargeMedication(med))
      //     .filter(Boolean)
      //     .filter((med: any) => this.getMedicationStatus(med)?.toLowerCase() === 'active'),
      //   'Hospital Medication': results
      //     .filter((med: any) => !isDischarge(med))
      //     .map((med: any) => this.mapToHospitalMedication(med))
      //     .filter(Boolean),
      // } as any;
      this.updateAvailableMedications();
      // this.filterMedicationsByOrderType('Discharge')
    });
  }

  public isImport: boolean = true;
  filterMedicationsByOrderType(filterValue: string): void {
    const medications = this.isImport ? this.activeTabMedications : this.importedMedications;
    if (!filterValue || filterValue === 'All') {
      this.filteredMedications = [...medications];
    } else {
      this.filteredMedications = medications.filter((medication: any) => {
        return this.getDischargeMedication(medication).OrderType === filterValue;
      });
    }
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
      'Discharge and Home Medication': filterAvailable('Discharge and Home Medication'),
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
      Description: `${Descrlt}, ${Quan}, ${Quanunit}, ${Routedescr}, ${N1id}`,
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
      Descr: Descrlt || '',
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