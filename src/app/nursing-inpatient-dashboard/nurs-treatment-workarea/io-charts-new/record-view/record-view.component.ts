import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';
import { StorageService } from '@services/storage.service';
import { Subscription } from 'rxjs';
declare var $: any;
@Component({
  selector: 'app-record-view-new',
  templateUrl: './record-view.component.html',
  styleUrls: ['./record-view.component.scss'],
})
export class RecordViewComponentNew implements OnInit, AfterViewChecked, OnDestroy {
  @Input() recordViewData: any = null;
  @Input() categoryTypeCodeList: any = null;
  @Input() categoryList: any = null;
  @Output() backevent = new EventEmitter();

  tableData = [
    {
      category: 'Oral',
      date: '01-08-2024',
      time: '17:38',
      enteredBy: 'Saja Oweis',
      subRows: [
        {
          type: 'Food',
          value: '100 mL',
          remarks: 'kevin',
        },
        {
          type: 'Medications',
          value: '250 mL',
          remarks: 'kevin',
        },
      ],
    },
    {
      category: 'Enteral (G)',
      date: '02-08-2024',
      time: '09:15',
      enteredBy: 'Saja Oweis',
      subRows: [
        {
          type: 'Feeding Formula',
          value: '500 mL',
        },
      ],
    },
    {
      category: 'Parenteral',
      date: '03-08-2024',
      time: '14:22',
      enteredBy: 'Fare',
      subRows: [
        {
          type: 'Total Parenteral Nutrition (TPN)',
          value: '250 mL',
        },
      ],
    },
    {
      category: 'IV Fluids',
      date: '04-08-2024',
      time: '11:45',
      enteredBy: 'Fare',
      subRows: [
        {
          type: 'D5W',
          value: '300 mL',
        },
      ],
    },
    {
      category: 'Blood Products',
      date: '05-08-2024',
      time: '16:30',
      enteredBy: 'Saja Oweis',
      subRows: [
        {
          type: 'Platelets',
          value: '200 mL',
        },
      ],
    },
    {
      category: 'Other',
      date: '06-08-2024',
      time: '08:50',
      enteredBy: 'Saja Oweis',
      subRows: [
        {
          type: 'Biscuits',
          value: '500 mL',
        },
      ],
    },
  ];

  tableMainData = [
    {
      category: 'Oral',
      date: '01-08-2024',
      time: '17:38',
      enteredBy: 'Saja Oweis',
      subRows: [
        {
          type: 'Food',
          value: '100 mL',
          remarks: 'kevin',
        },
        {
          type: 'Medications',
          value: '250 mL',
          remarks: 'kevin',
        },
      ],
    },
  ]

  Types = [
    'Fluids',
    'Food',
    'Medications',
    'Supplements',
    'Water',
    'Smashed Food',
    'Feeding Formula',
    'Total Parenteral Nutrition(TPN)',
    'NS 0.9%',
    'Saline 0.45%',
    'D5W',
    'GS 0.9%',
    'GS 0.45%',
    'Saline 3%',
    'LR',
    'Line Flush',
    'Bolus',
    'Hemodialysis',
    'Peritoneal Dialysis',
    'Medications',
    'Electrolytes',
    'Albumin',
    'Whole Blood',
    'PRBCs',
    'FFP',
    'Platelets',
    'Cryoprecipitate',
    'other',
  ];

  dates = [];
  totals = [];
  enteredBy = [];
  searchText = '';
  selectedCategory: string = null;
  selectedType: string = null;
  selectedEnteredBy: string = null;
  selectedDateRange: [Date, Date] = [null, null];
  startTime: string = null;
  endTime: string = null;
  selectedTimeOption: string = null;
  filteredTableData: any[] = [];
  grandTotal = '';
  individualTotals: { [key: string]: string } = {};
  individualEnteredBy: { [key: string]: string } = {};
  paramsObj: any;
  calculationForColumn: any;
  private subscriptions: Subscription[] = [];

  constructor(private emergencyService: EmergencyService, private route: ActivatedRoute, private storageService: StorageService) {
    this.subscriptions[this.subscriptions.length] = this.route.queryParams.subscribe((params) => {
      this.paramsObj = params;
    });
  }

  userProfile = this.storageService.getUserProfile();
  ngOnInit(): void {
    // if (!this.recordViewData.title) {
    //   this.tableData = [];
    // }
    // this.tableData =
    //   this.tableData.length === 0 ? this.tableData : this.recordViewData.data;

    // if (this.tableData.length > 0) {
    //   this.tableData.forEach((item) => {
    //     item.subRows.forEach((subitem) => {
    //       if (subitem.type && !this.Types.includes(subitem.type)) {
    //         this.Types.push(subitem.type);
    //       }
    //     });
    //   });
    // }
    // this.onDateRangeChange([new Date(), new Date()]);
    // this.filteredTableData = [...this.tableData];
    // this.dates = this.extractDates(this.filteredTableData);
    this.ioChartFormDetails()
  }

  ioChartFormDetails() {
    this.subscriptions[this.subscriptions.length] = this.emergencyService
      .ioChartFullDeatials(this.paramsObj.patnr, this.paramsObj.falnr)
      .subscribe((res: any) => {
        let finalArray = [];
        let headerDate = []
        if (res?.d?.results.length) {
          res?.d?.results.forEach(header => {
            let caseData = header.HEADER_TO_ITEM.results;
            caseData.forEach(item => {
              if (item?.RecdType == this.recordViewData.title.charAt(0)) {
                headerDate.push(new Date(parseInt(header.CreatedOn.match(/\d+/)[0])).toLocaleDateString() + ' ' + this.convertPTTime(header.CreatedAt))
              }
            });
          })
          headerDate = [...new Set(headerDate)];

          res?.d?.results.forEach(header => {
            let caseData = header.HEADER_TO_ITEM.results;
            caseData.forEach(item => {
              if (item?.RecdType == this.recordViewData.title.charAt(0)) {
                let existingCategory = finalArray.find(cat => cat.category === item.Catcode);
                if (existingCategory) {
                  let existingTypeCode = existingCategory.subRows.find(res => res.type == item.Typecode && res.Typedesc == item.Typedesc)
                  let currentItemDate = new Date(parseInt(header.CreatedOn.match(/\d+/)[0])).toLocaleDateString() + ' ' + this.convertPTTime(header.CreatedAt);
                  if (existingTypeCode) {
                    let dateTypecode = existingTypeCode.childRow.find(res => res.date == currentItemDate)
                    dateTypecode.value = dateTypecode?.value ? parseFloat(dateTypecode?.value) + parseFloat(item?.RecdVol) : item?.RecdVol;
                    dateTypecode.remarks = item?.Remarks;
                  } else {
                    let subRowItem = {
                      type: item?.Typecode,
                      Typedesc: item?.Typedesc,
                      childRow: []
                    }

                    headerDate.forEach((res, index) => {
                      let childRowItem = {
                        value: "",
                        remarks: "",
                        date: res,
                      }
                      if (res == currentItemDate) {
                        childRowItem.value = item?.RecdVol;
                        childRowItem.remarks = item?.Remarks;
                      }
                      subRowItem.childRow.push(childRowItem)
                    })

                    existingCategory.subRows.push(subRowItem)
                  }
                } else {
                  let categoryItem: any = {
                    category: item.Catcode,
                    categoryDescri: item.Catdesc,
                    time: header.CreatedAt,
                    enteredBy: item?.enteredBy,
                    subRows: []
                  }
                  let subRowItem: any = {
                    type: item?.Typecode,
                    Itemno: item?.Itemno,
                    Typedesc: item?.Typedesc,
                    childRow: []
                  }

                  let currentItemDate = new Date(parseInt(header.CreatedOn.match(/\d+/)[0])).toLocaleDateString() + ' ' + this.convertPTTime(header.CreatedAt);
                  headerDate.forEach((res, index) => {
                    let childRowItem = {
                      value: "",
                      remarks: "",
                      date: res,
                    }
                    if (res == currentItemDate) {
                      childRowItem.value = item?.RecdVol;
                      childRowItem.remarks = item?.Remarks;
                    }
                    subRowItem.childRow.push(childRowItem);
                  })
                  categoryItem.subRows.push(subRowItem);
                  // existingCategory.subRow = subRow
                  finalArray.push(categoryItem);
                }
              }
            });
          })
        }
        this.dates = headerDate;
        finalArray.forEach((res) => {
          const updatedData = this.groupAndSumByDate(res);
        })
        this.filteredTableData = [...finalArray]
        this.calculationForColumn = this.calculateTotalSummedValues(this.filteredTableData);
      });
  }

  calculateTotalSummedValues(data: any[]) {
    const totalSumsByDate: any = {};
    if (data.length === 0) return [];
    const enteredBy = data[0].enteredBy;
    for (const category of data) {
      const summedValues = category.summedValuesByDate;
      for (const [date, totalValue] of Object.entries(summedValues)) {
        if (!totalSumsByDate[date]) {
          totalSumsByDate[date] = { totalValue: 0, enteredBy }; // Add enteredBy here
        }
        totalSumsByDate[date].totalValue += totalValue;
      }
    }
    let totalArray = Object.keys(totalSumsByDate).map(date => ({
      date,
      totalValue: totalSumsByDate[date].totalValue,
      enteredBy: totalSumsByDate[date].enteredBy // Include enteredBy here
    }));
    this.grandTotal = totalArray.reduce((acc, curr) => acc + curr.totalValue, 0);

    return totalArray;
  }

  calculateSummedValues(data: any[]) {
    const sums = {};
    for (let category of data) {
      category.summedValuesByDate.forEach((entry) => {
        const { date, totalValue } = entry;
        if (!sums[date]) {
          sums[date] = 0;
        }
        sums[date] += totalValue;
      });
    }

    // Convert the sums object into an array
    return Object.keys(sums).map((date) => ({
      date,
      totalValue: sums[date]
    }));
  }

  groupAndSumByDate(data) {
    const dateSums = {};
    data.subRows.forEach(subRow => {
      subRow.childRow.forEach(child => {
        const date = child.date;
        const value = parseFloat(child.value) || 0;
        if (dateSums[date]) {
          dateSums[date] += value;
        } else {
          dateSums[date] = value;
        }
      });
    });
    data.summedValuesByDate = dateSums;
    return data;
  }


  getChildRowDates(data: any[]): string[] {
    const childRowDates: string[] = [];

    // Iterate through the main data array
    data.forEach(row => {
      row.subRows.forEach(subRow => {
        childRowDates.push(subRow.date); // Add childRow dates to the array
      });
    });

    return childRowDates;
  }
  ngAfterViewChecked() {
    // Initialize Bootstrap tooltips
    // $(function () {
    //   $('[data-toggle="tooltip"]').tooltip();
    // });
  }

  isCollapsed: { [key: string]: boolean } = {
    or1: true,
  };

  toggleCollapse(row) {
    row.isCollapsed = !row.isCollapsed;
  }

  back() {
    this.backevent.emit();
  }

  onDateRangeChange(selectedRange: any) {
    try {
      if (selectedRange && selectedRange.length === 2) {
        selectedRange[0].setHours(0, 0, 0, 0);
        selectedRange[1].setHours(0, 0, 0, 0);
        this.selectedDateRange = selectedRange;
      }
    } catch (error) { }
  }

  applyFilter() {
    try {
      const [startDate, endDate] = this.selectedDateRange.map((date) =>
        new Date(date).getTime()
      );

      this.filteredTableData = this.tableData.filter((row) => {
        const [day, month, year] = row.date.split('.').map(Number);
        const date = new Date(year, month - 1, day);
        const timestamp = date.getTime();

        // Date range filter
        const matchesDate =
          (!this.selectedDateRange[0] && !this.selectedDateRange[1]) ||
          (timestamp >= startDate && timestamp <= endDate);

        // Category filter
        const matchesCategory =
          !this.selectedCategory || row.category === this.selectedCategory;

        // Type filter
        const matchesType =
          !this.selectedType ||
          row.subRows.some((subRow) => subRow.type === this.selectedType);

        // Entered By filter
        const matchesEnteredBy =
          !this.selectedEnteredBy || row.enteredBy === this.selectedEnteredBy;

        // Search text filter
        const matchesSearchText =
          !this.searchText ||
          row.subRows.some((subRow) =>
            subRow.type.toLowerCase().includes(this.searchText.toLowerCase())
          ) ||
          row.category.toLowerCase().includes(this.searchText.toLowerCase());

        const timeMatch =
          (!this.startTime && !this.endTime) ||
          (this.timeToMinutes(row.time) >= this.timeToMinutes(this.startTime) &&
            this.timeToMinutes(row.time) <= this.timeToMinutes(this.endTime));

        // Time range filter
        const matchesTimeRange =
          !this.selectedTimeOption ||
          this.isTimeInOption(row.time, this.selectedTimeOption);

        return (
          matchesCategory &&
          timeMatch &&
          matchesDate &&
          matchesTimeRange &&
          matchesType &&
          matchesEnteredBy &&
          matchesSearchText
        );
      });
      // setTimeout(() => {
      //   this.dates = this.extractDates(this.filteredTableData);
      //   // this.filterTableDataByType();
      //   this.calculateTotalsAndEnteredBy();
      // }, 10);
    } catch (error) { }
  }

  filterTableDataByType() {
    const tableData = this.filteredTableData
      .map((item) => {
        // Filter subRows by the searchType
        const filteredSubRows = item.subRows.filter((subRow) =>
          subRow.type.includes(this.searchText)
        );

        // If there are matches, return a new object with the required structure
        if (filteredSubRows.length > 0) {
          return {
            category: item.category,
            date: item.date,
            time: item.time,
            enteredBy: item.enteredBy,
            subRows: filteredSubRows, // Only include the matching subRows
          };
        }
        return null; // If no matches, return null
      })
      .filter((item) => item !== null); // Filter out null values
    this.filteredTableData = tableData;
  }

  isTimeInOption(time: string, option: string): any {
    const [hours, minutes] = time.split(':').map(Number);
    const timeMinutes = hours * 60 + minutes;
    switch (option) {
      case '7AM - 7PM':
        return (
          timeMinutes >= this.timeToMinutes('07:00') &&
          timeMinutes < this.timeToMinutes('19:00')
        );
      case '7PM - 7AM':
        return (
          timeMinutes >= this.timeToMinutes('19:00') ||
          timeMinutes < this.timeToMinutes('07:00')
        );
      case '7AM - 3PM':
        return (
          timeMinutes >= this.timeToMinutes('07:00') &&
          timeMinutes < this.timeToMinutes('15:00')
        );
      case '3PM - 11PM':
        return (
          timeMinutes >= this.timeToMinutes('15:00') &&
          timeMinutes < this.timeToMinutes('23:00')
        );
      case '11PM - 7AM':
        return (
          timeMinutes >= this.timeToMinutes('23:00') ||
          timeMinutes < this.timeToMinutes('07:00')
        );
      default:
        return true;
    }
  }

  timeToMinutes(time: string): number {
    try {
      const [hours, minutes] = time?.split(':').map(Number);
      return hours * 60 + minutes;
    } catch (error) { }
  }

  extractDates(data: any[]) {
    const dateSet = new Set<string>(); // To avoid duplicates
    const result: { date: string; time: string }[] = [];

    data.forEach((item) => {
      const key = `${item.date + '  ' + this.convertTo12HourFormat(item.time)}`; // Create a unique key for Set

      if (!dateSet.has(key)) { // Add only if not already present
        dateSet.add(key);
        result.push({ date: item.date, time: this.convertPTTime(item.time) });
      }
    });

    return result;
  }

  extractDates1(data: any[]): string[] {
    const dateSet = new Set<string>();
    data.forEach((item) => {
      dateSet.add(item.date);
    });
    return Array.from(dateSet);
  }

  convertPTTime(time) {
    let hours = time.match(/(\d+)H/)?.[1] || "00";
    let minutes = time.match(/(\d+)M/)?.[1] || "00";
    let seconds = time.match(/(\d+)S/)?.[1] || "00";

    let formattedTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    return formattedTime
  }

  convertTo12HourFormat(time: string): string {
    try {
      const [hours, minutes] = time?.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const adjustedHours = hours % 12 || 12; // Convert 0 hours to 12 for AM and handle 12 PM correctly
      const formattedMinutes = minutes.toString().padStart(2, '0');
      return `${adjustedHours}:${formattedMinutes} ${period}`;
    } catch (error) { }
  }

  getEntryForDate(entries, subRow, date) {
    try {
      let value = '--';
      const entryTime =
        subRow.date;
      if (entryTime === date) {
        value = subRow.value;
      } else {
        value = '--';
      }
      return value;
    } catch (error) { }
  }

  getEntryTotal(entries, date) {
    try {
      let total = 0;
      const entryTime =
        entries.date;
      if (entryTime === date) {
        entries.subRows.forEach((sub) => {
          const value = Number(sub.value.split(' ')[0]);
          total += value;
        });
      }
      return total;
    } catch (error) { }
  }

  calculateTotalsAndEnteredBy() {
    const totalVolumes = {};
    this.filteredTableData.forEach((category) => {
      category.subRows.forEach((subRow) => {
        const entryTime =
          subRow.date;
        if (!totalVolumes[entryTime]) {
          totalVolumes[entryTime] = 0;
        }
        if (subRow.value !== '--') {
          totalVolumes[entryTime] += parseInt(subRow.value);
        }
      });
    });
    let grandTotal = 0;
    this.dates.forEach((date) => {
      this.individualTotals[date] = totalVolumes[date]
        ? `${totalVolumes[date]} mL`
        : '--';
      if (totalVolumes[date]) {
        grandTotal += totalVolumes[date];
      }
    });
    this.grandTotal = `${grandTotal} mL`;
    this.dates.forEach((category) => {
      const entryTime =
        category
      this.individualEnteredBy[entryTime] = category.enteredBy;
    });
  }


  getCategoryName(categoryCode: string) {
    return this.categoryList.find(res => res.Categorycode === categoryCode)?.Description
  }

  getCategoryTypeName(typeCode: string) {
    return this.categoryTypeCodeList.find(res => res.TypeCode === typeCode)?.Description
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}