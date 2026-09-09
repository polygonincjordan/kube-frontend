import { Component, OnInit } from '@angular/core';
import { HospitalistService } from '@services/e-hospitalist/hospitalist.service';

@Component({
  selector: 'app-my-favorite-patients',
  templateUrl: './my-favorite-patients.component.html',
  styleUrls: ['./my-favorite-patients.component.scss']
})
export class MyFavoritePatientsComponent implements OnInit {

  searchString
  inHospitalistList: any = [];
  navTabBoxActiveValue: string = '09';
  showColumnsListView = {
    VIP: false,
    Treatment_diagnosis: false,
    Study_name: false,
    Speciality: false,
    Isolation: false,
    LOS: false,
    Risk_Factor: false,
    Planned_discharge: false,
    Last_surgery_date: false,
    Financial_Category: false,
    Emergency_Admission: false,
    Doctor: false,
    Days_since_surgery: false,
    Days_for_isolation: false,
    Case: false,
    Allergy: false,
    Admitted_At: false,
    Admission_diagnosis: false,
    VIP_model: false,
    Treatment_diagnosis_model: false,
    Study_name_model: false,
    Speciality_model: false,
    Isolation_model: false,
    LOS_model: false,
    Risk_Factor_model: false,
    Planned_discharge_model: false,
    Last_surgery_date_model: false,
    Financial_Category_model: false,
    Emergency_Admission_model: false,
    Doctor_model: false,
    Days_since_surgery_model: false,
    Days_for_isolation_model: false,
    Case_model: false,
    Allergy_model: false,
    Admitted_At_model: false,
    Admission_diagnosis_model: false,
    DefaultView: '',
    Listview_modal: false,
    Bedview_modal: false,
    Attending_Doctor: false,
    Attending_Doctor_modal: false,
    Case_Diagnosis: false,
    Case_Diagnosis_modal: false,
    Risk_factory: false,
    Risk_factory_modal: false,
  };
  constructor(private hospitalistService: HospitalistService,) { }

  ngOnInit(): void {
    this.initialfilterData()
  }

  reloadTable(event) {

  }
  initialfilterData(ward?, type?, specialtyData?) {
    this.searchString = '';
    let admittedFrom = '';
    let admittedTo = '';
    let wardNo = '';
    let physician = '';
    let speciality = '';
    this.hospitalistService.getIpListSetAPI('09', admittedFrom, admittedTo, wardNo, physician, speciality, '')
      .subscribe((data: any) => {
        this.inHospitalistList = data?.d.results[0].ToIPList.results;
      });
  }

  redirectToeKardex(data) {
    if (this.navTabBoxActiveValue == '02' || this.navTabBoxActiveValue == '03' || this.navTabBoxActiveValue == '09' || this.navTabBoxActiveValue == '20' || this.navTabBoxActiveValue == '08') {
      // this.openModuleAdmissionProcess(data, 'admit-process');
      this.openModuleAdmissionProcess(data, 'patient-treatment');
    } else if (this.navTabBoxActiveValue == '04' || this.navTabBoxActiveValue == '05') {
      this.openModuleAdmissionProcess(data, 'discharge-process')
    } else {
      window.open('radiologist-ekardex?patnr=' + data.Mrn + '&falnr=' + data.CaseNumber + '&einri=' + data.Institute + '&lfdnr=' + data.Lfdnr, '_blank');
    }
  }

  openModuleAdmissionProcess(data, tabName) {


  }

  windowRedirect(tabName, patnr, falnr, einri, ifdnr, admittedFrom, admittedTo, wardNo, physician, speciality, Deptou) {
    window.open(
      tabName + '?patnr=' +
      patnr +
      '&falnr=' +
      falnr
      +
      '&einri=' +
      einri +
      '&lfdnr=' + ifdnr +
      '&admittedFrom=' + admittedFrom +
      '&admittedTo=' + admittedTo +
      '&wardNo=' + wardNo +
      '&physician=' + physician +
      '&speciality=' + speciality +
      '&Deptou=' + Deptou +
      '&activeValue=' + this.navTabBoxActiveValue,
      '_blank'
    );
  }

  onClickNavTabBox(event) {

  }
}
