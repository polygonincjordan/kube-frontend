import { Component, OnInit, ViewChild } from '@angular/core';
import { PhysicianAllergyComponent } from './physician-allergy/physician-allergy.component';
import Swal from 'sweetalert2';
import { commonKeyValuePariExt0, commonKeyValuePariExt3 } from '@services/e-kardex/interfaces/documents.interface';
import { DatePipe } from '@angular/common';
import { GlosGowCommaScalePopupComponent } from './glos-gow-comma-scale/glos-gow-comma-scale-popup.component';
import { FacePainScalePopupComponent } from './face-pain-scale/face-pain-scale-popup.component';
import { NumericRatingScalePopupComponent } from './numeric-rating-scale/numeric-rating-scale-popup.component';
import { SharedService } from '@services/shared.service';

@Component({
  selector: 'app-nursing-admission-assessment',
  templateUrl: './nursing-admission-assessment.component.html',
  styleUrls: ['./nursing-admission-assessment.component.scss'],
})
export class NursingAdmissionAssessmentComponent implements OnInit {
  @ViewChild('createAllergyId') createAllergyId: PhysicianAllergyComponent;
  @ViewChild('scalesGlosgow') scalesGlosgow: GlosGowCommaScalePopupComponent;
  @ViewChild('scalesFacePain') scalesFacePain: FacePainScalePopupComponent;
  @ViewChild('scalesNumericRating')
  scalesNumericRating: NumericRatingScalePopupComponent;
  toAllergyArr: any = [];
  duplicates: any[];

  public psychologicalHistory: boolean = false;
  public socialHistory: boolean = true;
  public noHabitApplicable: boolean = false;


  public scalesList: commonKeyValuePariExt3[] = [
    {
      ScaleType: 'Glasgow Coma Scale',
      LastScore: '',
      description: '',
      Datetimee: '',
      value: '1',
      Dockey: '',
    },
    {
      ScaleType: 'Face pain scale',
      LastScore: '',
      description: '',
      Datetimee: '',
      value: '2',
      Dockey: '',
    },
    {
      ScaleType: 'Numeric rating scale(more than 8 years)',
      LastScore: '',
      description: '',
      Datetimee: '',
      value: '3',
      Dockey: '',
    },
  ];

  public socialHistoryList: commonKeyValuePariExt0[] = [
    { Habitid: '', value: '0', label: 'Alcohol', Status: '', Quantity: '', Duration: '', Year: '', DateFrom: null, },
    { value: '1', label: 'Drugs', Status: '', Quantity: '', Duration: '', Year: '', DateFrom: null, Habitid: '', },
    { value: '2', label: 'Tobacco', Status: '', Quantity: '', Duration: '', Year: '', DateFrom: null, Habitid: '', },
    { value: '3', label: 'Other', Status: '', Quantity: '', Duration: '', Year: '', DateFrom: null, Habitid: '', },
  ];
  noScaleAppicable: any;
  constructor(private sharedService: SharedService) {}

  ngOnInit(): void {}

  public deleteFromAllergy(item, index) {
    this.toAllergyArr.splice(index, 1);
  }

  public openModalForAllergy() {
    this.createAllergyId.openModalForAllergy();
  }

  public importAllergyData(data) {
    data.forEach((el) => {
      this.toAllergyArr = this.toAllergyArr.concat({
        Dockey: '',
        Agroup: el.AllergenGrp,
        Description: el.Allergen,
      });
    });
    this.duplicates = [];
    this.duplicates = this.findDuplicatesAllergy();
    this.toAllergyArr = this.toAllergyArr.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.Description === value.Description)
    );
    if (this.duplicates.length > 0) {
      this.errorMsgForDuplicatesAllergy();
    }
  }

  private findDuplicatesAllergy() {
    let tempArr = [];
    const lookup = this.toAllergyArr.reduce((a, e) => {
      a[e.Description] = ++a[e.Description] || 0;
      return a;
    }, {});
    tempArr = this.toAllergyArr.filter((e) => lookup[e.Description]);
    return tempArr.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.Description === value.Description)
    );
  }

  private errorMsgForDuplicatesAllergy() {
    let codeArr = [];
    this.duplicates.forEach((element) => {
      codeArr.push(element.Description);
    });

    Swal.fire({
      text: `${codeArr.toString()} is/are already Imported `,
      icon: 'warning',
      confirmButtonText: 'Ok',
      customClass: 'myalertpopup',
    });
  }

  public glasgowValue(event) {
    this.scalesList[0].LastScore = event?.totalScore.toString();
    this.scalesList[0].description = event?.description;
    this.scalesList[0].Dockey = event?.dockey;
    this.scalesList[0].Datetimee = `${new DatePipe('en-US').transform(
      event?.date,
      'dd.MM.yyyy'
    )}/${event?.time}`;
  }

  public facePainValue(event) {
    this.scalesList[1].LastScore = event?.totalScore;
    this.scalesList[1].description = event?.description;
    this.scalesList[1].Dockey = event?.dockey;
    this.scalesList[1].Datetimee = `${new DatePipe('en-US').transform(
      event?.date,
      'dd.MM.yyyy'
    )}/${event?.time}`;
  }

  public numericValue(event) {
    this.scalesList[2].LastScore = event?.totalScore;
    this.scalesList[2].description = event?.description;
    this.scalesList[2].Dockey = event?.dockey;
    this.scalesList[2].Datetimee = `${new DatePipe('en-US').transform(
      event?.date,
      'dd.MM.yyyy'
    )}/${event?.time}`;
  }

  public openGlosgowComaModel(item: any) {
    if (this.noScaleAppicable) return;
    this.scalesEditConfirmationMsg(item);
  }

  private scalesEditConfirmationMsg(item: { value: string }) {
    Swal.fire({
      text: 'Are you sure you want to edit scale',
      icon: 'warning',
      confirmButtonText: 'Yes',
      showCancelButton: true,
      cancelButtonText: 'No',
      customClass: 'myalertpopup',
    }).then((res) => {
      if (res.isConfirmed) {
        if (item.value == '1') {
          this.scalesGlosgow.openModalForGlosgow('');
        } else if (item.value == '2') {
          this.scalesFacePain.openModalForFacePain('');
        } else if (item.value == '3') {
          this.scalesNumericRating.openModalForNumericRating('');
        }
      }
    });
  }

  public viewGlosgowModel(item) {
    if (this.noScaleAppicable) return;
    if (item.value == '1') {
      if (item.Dockey) {
        this.scalesGlosgow.openModalForGlosgow(item.Dockey);
      } else {
        this.sharedService.waringSwallModel('No data found');
      }
    } else if (item.value == '2') {
      if (item.Dockey) {
        this.scalesFacePain.openModalForFacePain(item.Dockey);
      } else {
        this.sharedService.waringSwallModel('No data found');
      }
    } else if (item.value == '3') {
      if (item.Dockey) {
        this.scalesNumericRating.openModalForNumericRating(item.Dockey);
      } else {
        this.sharedService.waringSwallModel('No data found');
      }
    }
  }

  public socialAndPsychologicalTabs(tab: string) {
    if (tab == 'social') {
      this.socialHistory = true;
      this.psychologicalHistory = false;
    } else {
      this.socialHistory = false;
      this.psychologicalHistory = true;
    }
  }

  // public openModelForAddHabitSocial(index: any, item: any) {
  //   if (item.Status) {
  //     this.swallConfirmation(item.label, index);
  //   } else {
  //     this.socialAddHabit.openModalForAddHabit(item.label, this.selectedTableDetails, this.patientDetails, item);
  //   }
  // }

  // public swallConfirmation(habitType: string, index, habitNoConsume?: any) {
  //   Swal.fire({
  //     text: 'Are you sure you want to edit this Habit?',
  //     icon: 'warning',
  //     confirmButtonText: 'Yes',
  //     showCancelButton: true,
  //     cancelButtonText: 'Cancel',
  //     customClass: 'myalertpopup',
  //   }).then((res) => {
  //     if (res.isConfirmed) {
  //       if (habitNoConsume == 'noConsume') {
  //         if (habitType == 'Alcohol') this.saveAlcoholWithNoDrink();
  //         if (habitType == 'Tobacco') this.saveTabaccolWithNoSmoke();
  //         if (habitType == 'Drugs') this.saveDrugsWithNoDrugs();
  //         if (habitType == 'Other') this.saveOtherWithNoOther();
  //       } else {
  //         this.socialAddHabit.openModalForAddHabit(
  //           habitType,
  //           this.selectedTableDetails,
  //           this.patientDetails,
  //           this.socialHistoryList[index]
  //         );
  //       }
  //     }
  //   });
  // }

  public getDate(value) {
    if (value) {
      var str = value;
      var num = parseInt(str.replace(/[^0-9]/g, ''));
      var date = new Date(num);
      return date;
    }
  }

  public parseTime(data: string) {
    // Check if data is valid and matches the expected format
    if (!data || data.length !== 11 || data[4] !== 'H' || data[7] !== 'M' || data[10] !== 'S') {
      return null;
    }

    // Extract hours, minutes, and seconds from the input string
    const hours = parseInt(data.slice(2, 4), 10);
    const minutes = parseInt(data.slice(5, 7), 10);
    const seconds = parseInt(data.slice(8, 10), 10);

    // Check if extracted values are valid numbers
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
      return null;
    }

    // Format hours, minutes, and seconds with leading zeros if necessary
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    // Construct the formatted time string
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    return null;
  }
}
