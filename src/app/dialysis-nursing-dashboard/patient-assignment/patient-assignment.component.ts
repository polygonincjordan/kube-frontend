import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { SharedService } from '@services/shared.service';
import { Subject, debounceTime } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-patient-assignment',
  templateUrl: './patient-assignment.component.html',
  styleUrls: ['./patient-assignment.component.scss'],
})
export class PatientAssignmentComponent implements OnInit {
  @ViewChild('drp') drp: ElementRef;

  public dayShift = true;
  // public nightShift = false;
  roomList: any;
  assingedValues: string[] = [];
  fromDate: any;
  toDate: any;
  roomsForm: FormGroup;
  assignedRooms: FormArray;
  nightAssignedRooms: FormArray;

  public searchTerm$ = new Subject<string>();
  private searchTermSubject = new Subject<string>();
  indexofRoom: any;
  dateRange: any =new Date();
  todaysData: any;
  user: any;
  getAssignedRoomList: any;
  isAlready: any = false;
  serchText: any;
  lastOneDate: any;

  constructor(
    private emergancy: EmergencyService,
    private formBuilder: FormBuilder,
    private sharedService: SharedService,
    private datePipe: DatePipe
  ) {
    this.todaysData = new Date();
  }

  ngOnInit(): void {
    this.formInit();
    this.setMinDate()
    this.user = JSON.parse(localStorage.getItem('amc_dev_loggedInUserProfile'));
    this.getRoomDetails();

    this.searchTerm$.pipe(debounceTime(3000)).subscribe((value) => {
      this.emergancy.getEmployeeId(value).subscribe((data: any) => {
        this.updateFormWithEmployeeData(data);
      });
    });
  }
  setMinDate() {
    const today = new Date();
    const lastOnePreviousDay = new Date(today);
    lastOnePreviousDay.setDate(today.getDate() - 1); // Subtract 1 day

    this.lastOneDate = lastOnePreviousDay;
  }

  convertMinlisecond(dateString: any) {
    const dateParts = dateString.split('.');
    const year = parseInt(dateParts[2]);
    const month = parseInt(dateParts[1]) - 1;
    const day = parseInt(dateParts[0]);

    const dateObject = new Date(year, month, day);
    return `\/Date(${dateObject.getTime()})\/`;
  }

  private formatDate(date: Date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const formattedDay = day < 10 ? '0' + day : day;
    const formattedMonth = month < 10 ? '0' + month : month;
    return `${formattedDay}.${formattedMonth}.${year}`;
  }

  private formInit() {
    this.roomsForm = this.formBuilder.group({
      assignedRooms: new FormArray([]),
      nightAssignedRooms: new FormArray([]),
    });
  }

  public pushFormcontrolinArray(list: any, finddata?) {
    this.assignedRooms = this.roomsForm?.get('assignedRooms') as FormArray;
    this.assignedRooms.push(this.formArrayControls(list, finddata));
  }
  public nightPushFormcontrolinArray(list: any, finddata?) {
    this.nightAssignedRooms = this.roomsForm?.get(
      'nightAssignedRooms'
    ) as FormArray;
    this.nightAssignedRooms.push(this.nightFormArrayControls(list, finddata));
  }

  public formArrayControls(list: any, finddata?): FormGroup {
    
    return this.formBuilder.group({
      room: list.Room,
      roomName: list.RoomText,
      assignedTo: finddata ? finddata?.NurseName : '',
      assignedToCode: '',
      Vma: '',
      Usnam: '',
      Name: '',
      NurseName: '',
      Shift: finddata ? finddata.Shift : '',
      isDisabled: finddata ? true : false,
    });
  }
  public nightFormArrayControls(list: any, finddata?): FormGroup {
    return this.formBuilder.group({
      room: list.Room,
      roomName: list.RoomText,
      assignedTo: finddata ? finddata?.NurseName : '',
      assignedToCode: '',
      Vma: '',
      Usnam: '',
      Name: '',
      NurseName: '',
      Shift: finddata ? finddata.Shift : '',
      isDisabled: finddata ? true : false,
    });
  }

  editFormData(index: number) {
    let formArray = this.roomsForm.get('assignedRooms') as FormArray;
    formArray.at(index).patchValue({
      isDisabled: false,
    });
  }

  updateFormWithEmployeeData(data) {
    if (data?.d?.results[0]?.Name && this.dayShift) {
      let formArray = this.roomsForm.get('assignedRooms') as FormArray;
      formArray
        .at(this.indexofRoom)
        .patchValue({
          assignedTo: data?.d?.results[0]?.Name,
          assignedToCode: data?.d?.results[0]?.Empid,
          Vma: data?.d?.results[0]?.Vma,
          Usnam: data?.d?.results[0]?.Usnam,
          isDisabled: true,
        });
    } else if (data?.d?.results[0]?.Name && !this.dayShift) {
      let formArray = this.roomsForm.get('nightAssignedRooms') as FormArray;
      formArray
        .at(this.indexofRoom)
        .patchValue({
          assignedTo: data?.d?.results[0]?.Name,
          assignedToCode: data?.d?.results[0]?.Empid,
          Vma: data?.d?.results[0]?.Vma,
          Usnam: data?.d?.results[0]?.Usnam,
          isDisabled: true,
        });
    }
  }

  getRoomDetails() {
    let roomType = 'EMEEUAMC';
    this.emergancy.getPetientRoom(roomType).subscribe(async (data: any) => {
      this.roomList = data?.d?.results;
      this.roomList?.forEach((item: any) => {
        this.pushFormcontrolinArray(item, '');
        this.nightPushFormcontrolinArray(item, '');

      });
      
      await this.getAssignedRoomDetails(this.dateRange);
    });
  }
  async getAssignedRoomDetails(dateRange: any) {
    let fromDate = this.sharedService.getDateRangeFormat(dateRange);
    let toDate = this.sharedService.getDateRangeFormat(dateRange);

    this.emergancy.getAssignedRoom(fromDate, toDate).subscribe((data: any) => {
      this.getAssignedRoomList = data?.d?.results;

      if (this.isAlready) {
        this.roomList.forEach((item: any, index: number) => {
          this.getAssignedRoomList.forEach((res) => {
            if (item.Room === res.Room) {              
              if (res.Shift == 'S1') {
                let formArray = this.roomsForm.get(
                  'assignedRooms'
                ) as FormArray;
                formArray.at(index).patchValue({
                  assignedTo: res?.NurseName,
                  isDisabled: true,
                  Shift: res.Shift,
                  assignedToCode: res?.Empid,
                  Vma: res?.Vma,
                  Usnam: res?.Usnam,
                });
              }
              if (res.Shift == 'S2') {
                let formArray = this.roomsForm.get(
                  'nightAssignedRooms'
                ) as FormArray;
                formArray
                  .at(index)
                  .patchValue({
                    assignedTo: res?.NurseName,
                    isDisabled: true,
                    Shift: res.Shift,
                    assignedToCode: res?.Empid,
                    Vma: res?.Vma,
                    Usnam: res?.Usnam,
                  });
              }
            }
          });
        });
      } else {
        this.roomList?.forEach((item: any, index: number) => {
          this.getAssignedRoomList?.forEach((res: any) => {
            if (item.Room === res.Room) {
              if (res.Shift == 'S1') {
                
                let formArray = this.roomsForm.get(
                  'assignedRooms'
                ) as FormArray;
                formArray.at(index).patchValue({
                  assignedTo: res?.NurseName,
                  isDisabled: true,
                  Shift: res.Shift,
                  assignedToCode: res?.Empid,
                  Vma: res?.Vma,
                  Usnam: res?.Usnam,
                  room: item?.Room,
                  roomName: item?.RoomText,
                });
              }
              if (res.Shift == 'S2') {
                let formArray = this.roomsForm.get(
                  'nightAssignedRooms'
                ) as FormArray;
                formArray
                  .at(index)
                  .patchValue({
                    assignedTo: res?.NurseName,
                    isDisabled: true,
                    Shift: res.Shift,
                    assignedToCode: res?.Empid,
                    Vma: res?.Vma,
                    Usnam: res?.Usnam,
                    room: item?.Room,
                    roomName: item?.RoomText,
                  });
              }
            }
          });
        });
      }
      this.isAlready = true;
    });
  }

  onDateChange(event: any) {
    this.roomsForm.reset();
    while (this.items.length !== 0) {
      this.items.removeAt(0);
    }
    while (this.nightItems.length !== 0) {
      this.nightItems.removeAt(0);
    }
    this.dateRange = event;
    // this.getAssignedRoomDetails(event);
    this.getRoomDetails();
  }

  get items(): FormArray {
    return this.roomsForm.get('assignedRooms') as FormArray;
  }
  get nightItems(): FormArray {
    return this.roomsForm.get('nightAssignedRooms') as FormArray;
  }
  onRefresh(){
    this.dateRange = new Date()
    this.getAssignedRoomDetails(this.dateRange);

  }
  changeEvents(shiftValue) {
    if (shiftValue === 'day') {
      this.dayShift = true;
    } else {
      this.dayShift = false;
    }
  }
  onSearchChange(event, i) {
    this.indexofRoom = i;
    const empId = event.target.value;
    this.searchTerm$.next(empId);
  }
  onSearch(event) {
    this.serchText = event.target.value;
  }
  filteredItems() {
    if (!this.serchText || typeof this.serchText !== 'string') {
      return this.roomsForm.get('assignedRooms')['controls'];
    }
    return this.roomsForm
      .get('assignedRooms')
      ['controls'].filter((item) =>
        item.roomName.toLowerCase().includes(this.serchText.toLowerCase())
      );
  }

  isdToMilisecond(dateString) {
    const dateObject = new Date(dateString);
    return dateObject.getTime();
  }

  convertDateFormat(inputDate: string): string {
    const parsedDate = new Date(
      inputDate.replace(/(\d{2})\.(\d{2})\.(\d{4})/, '$2/$1/$3')
    );
    const endDate = new Date(
      parsedDate.getFullYear(),
      parsedDate.getMonth(),
      parsedDate.getDate(),
      23,
      59,
      0
    );
    return this.datePipe.transform(endDate, 'yyyy-MM-ddTHH:mm:ss');
  }
  convertDateToMilliseconds(dateTimeString: string) {
    const milliseconds = new Date(dateTimeString).getTime();
    return `\/Date(${milliseconds})\/`;
  }

  saveList() {
    let finalData: any = this.roomsForm.value.assignedRooms.filter(
      (item: any) => {
        item.Shift = 'S1';
        return item.assignedTo !== '';
      }
    );
    let nightfinalData: any = this.roomsForm.value.nightAssignedRooms.filter(
      (item: any) => {
        item.Shift = 'S2';
        return item.assignedTo !== '';
      }
    );
    let mainArray = [...finalData, ...nightfinalData];

    let fromDate = this.convertDateFormat(this.formatDate(this.dateRange));
    let toDate = this.convertDateFormat(this.formatDate(this.dateRange));

    let results = mainArray.map((item: any) => {
      return {
        Room: item.room,
        Fdate: this.convertDateToMilliseconds(fromDate),
        Tdate: this.convertDateToMilliseconds(toDate),
        Shift: item.Shift,
        Empid: item.assignedToCode,
        Nurse: item.Vma,
        Usnam: item.Usnam,
        // FromTime:"" ,
        // ToTime:"",
        NurseName: item.assignedTo,
        RoomName: item.roomName,
      };
    });

    let payload = {
      Id: '',
      ToRoom: { results },
    };
    this.emergancy.saveAssignedRoom(payload).subscribe(
      (_success: any) => {
        Swal.fire({
          text: 'Room assigned successfully',
          icon: 'success',
          confirmButtonText: 'Ok',
          customClass: 'myalertpopup',
        });
      },
      (_error: any) => {
        console.log(_error);
      }
    );
  }
}
