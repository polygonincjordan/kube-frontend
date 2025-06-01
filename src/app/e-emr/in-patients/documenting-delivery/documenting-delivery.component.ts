import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { StorageService } from '@services/storage.service';
@Component({
  selector: 'app-documenting-delivery',
  templateUrl: './documenting-delivery.component.html',
  styleUrls: ['./documenting-delivery.component.scss']
})
export class DocumentingDeliveryComponent implements OnInit {
  activeTab: string = 'deliverydata'; // Default tab
  public delvTypes = [
    { value: 'K', label: 'C/S' },
    { value: 'V', label: 'Forceps VD' },
    { value: 'N', label: 'Normal VD' },
    { value: 'S', label: 'Not Stated' },
    { value: 'Z', label: 'Vacuum VE' }
  ];
  
  public sexes = [
    { value: '1', label: 'Male' },
    { value: '2', label: 'Female' },
    { value: '3', label: 'Unknown' }
  ];
  public apgar = [
    { value: '0', label: '0 = Very Bad' },
    { value: '10',label: '10 = Very Good' },
 
  ];
  
  public delOutcomes = [
    { value: 'L', label: 'Live' },
    { value: 'M', label: 'Miscarriage' },
    { value: 'O', label: 'Other' },
    { value: 'S', label: 'Stillbirth' }
  ];
  
  public birthplaces = [
    { value: '1', label: 'Ambulance' },
    { value: '13', label: 'Cath Lab' },
    { value: '8', label: 'Day Case Unit' },
    { value: '16', label: 'Dialysis Unit' },
    { value: '19', label: 'Dining Area' },
    { value: '9', label: 'Endoscopy Unit' },
    { value: '4', label: 'ER' },
    { value: '18', label: 'General waiting area' },
    { value: '21', label: 'Hospital Parking' },
    { value: '6', label: 'ICU/CCU/HDU' },
    { value: '11', label: 'Infusion Bays Unit' },
    { value: '7', label: 'Inpatient Ward' },
    { value: '15', label: 'Laboratory' },
    { value: '23', label: 'LDR' },
    { value: '10', label: 'Lithotripsy Unit' },
    { value: '26', label: 'NICU' },
    { value: '20', label: 'Nursery' },
    { value: '12', label: 'OP Clinics' },
    { value: '5', label: 'OR' },
    { value: '24', label: 'Other transport' },
    { value: '27', label: 'Others' },
    { value: '25', label: 'PACU' },
    { value: '17', label: 'Pharmacy Area' },
    { value: '14', label: 'Radiology' },
    { value: '3', label: 'Upon Arrival to Hospital' },
    { value: '2', label: 'While transfer to other center' }
  ]
  getProfilePatientProfile:any
  isFormDisable:boolean = false;
  documentingForm:FormGroup;
  @Input() someInput:any
  headerData:any
  constructor(public activeModal: NgbActiveModal,public storageService:StorageService) { }

  ngOnInit(): void {

    this.headerData = this.someInput
    this.getProfilePatientProfile = this.storageService.getUserProfile();
    if(this.getProfilePatientProfile?.KubeRule === 'SeniorPhysician'){
     this.isFormDisable = true
    }else{
      this.isFormDisable = false
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

    getGenderFromPatname(patname: string): string {
    const match = patname.match(/\((M|F),/);
    if (!match) return '';
    return match[1] === 'F' ? 'Female' : 'Male';
  }

  getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }

}
