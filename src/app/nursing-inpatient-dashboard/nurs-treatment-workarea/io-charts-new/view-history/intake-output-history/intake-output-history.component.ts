import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EmergencyService } from '@services/emergency-dashboard/emergency-service';

@Component({
  selector: 'app-intake-output-history-new',
  templateUrl: './intake-output-history.component.html',
  styleUrls: ['./intake-output-history.component.scss']
})
export class IntakeOutputHistoryComponentNew implements OnInit {
  @Output() backeventHistory = new EventEmitter();

  @Input() itemNumber
  filteredTableData: any[] = [];
  dates = [];
  calculationForColumn: any = [];
  grandTotal: any;
  tabIndex = 0
  ioChartHistorylist: any = [];

  constructor(private emergencyService: EmergencyService) { }

  ngOnInit(): void {
    this.ioChartFormDetails();
  }

  toggleCollapse(row) {
    row.isCollapsed = !row.isCollapsed;
  }

  ioChartFormDetails() {
    this.emergencyService
      .ioChartViewHistorySap(this.itemNumber)
      .subscribe((res: any) => {
        this.ioChartHistorylist = res?.d?.results;
        this.changeTab(0)
      })
  }

  back() {
    this.backeventHistory.next(true)
  }

  changeTab(index) {
    this.tabIndex = index;
    let recordType = this.tabIndex === 0 ? 'I' : 'O';
    let headerDate = []
    let finalArray = []
    this.calculationForColumn = []
    this.filteredTableData = [];

    let existingCategory: any = {}
    let existingTypeCode: any = {}
    
    this.ioChartHistorylist.forEach(item => {
      if (item.RecdType === recordType) {
        headerDate.push(new Date(parseInt(item.createdon.match(/\d+/)[0])).toLocaleDateString() + ' ' + this.convertPTTime(item.createdat))
      }
    });
    headerDate = [...new Set(headerDate)];

    this.ioChartHistorylist.forEach(item => {
      if (item.RecdType == recordType) {
          existingCategory = finalArray.find(cat => cat.category === item.Catcode);
        if (existingCategory) {
          existingTypeCode = existingCategory.subRows.find(res => res.type == item.Typecode && res.Typedesc == item.Typedesc)
          let currentItemDate = new Date(parseInt(item.createdon.match(/\d+/)[0])).toLocaleDateString() + ' ' + this.convertPTTime(item.createdat)
          if (existingTypeCode) {
            let dateTypecode = existingTypeCode.childRow.find(res => res.date == currentItemDate)
            dateTypecode.value = dateTypecode?.value ? parseFloat(dateTypecode?.value) + parseFloat(item?.RecdVol) : item?.RecdVol;
            dateTypecode.remarks = item.Remarks;
          } else {
            let subRowItem = {
              type: item.Typecode,
              Typedesc: item.Typedesc,
              childRow: []
            }

            headerDate.forEach((res, index) => {
              let childRowItem = {
                value: "",
                remarks: "",
                date: res,
              }
              if (res == currentItemDate) {
                childRowItem.value = item.RecdVol;
                childRowItem.remarks = item.Remarks;
              }
              subRowItem.childRow.push(childRowItem)
            })

            existingCategory.subRows.push(subRowItem)
          }
        } else {
          let categoryItem = {
            category: item.Catcode,
            categoryDescri: item.Catdesc,
            time: new Date(parseInt(item.createdon.match(/\d+/)[0])).toLocaleDateString() + ' ' + this.convertPTTime(item.createdat),
            enteredBy: item?.Createdby,
            subRows: []
          }
          let subRowItem = {
            type: item.Typecode,
            Typedesc: item.Typedesc,
            childRow: []
          }

          let currentItemDate = new Date(parseInt(item.createdon.match(/\d+/)[0])).toLocaleDateString() + ' ' + this.convertPTTime(item.createdat);
          headerDate.forEach((res, index) => {
            let childRowItem = {
              value: "",
              remarks: "",
              date: res,
            }
            if (res == currentItemDate) {
              childRowItem.value = item.RecdVol;
              childRowItem.remarks = item.Remarks;
            }
            subRowItem.childRow.push(childRowItem);
          })
          categoryItem.subRows.push(subRowItem);
          // existingCategory.subRow = subRow
          finalArray.push(categoryItem);
        }
      }
    });

    this.dates = headerDate;
    finalArray.forEach((res) => {
      const updatedData = this.groupAndSumByDate(res);
    })
    this.filteredTableData = [...finalArray]
    this.calculationForColumn = this.calculateTotalSummedValues(this.filteredTableData);
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

  convertPTTime(time) {
    let hours = time.match(/(\d+)H/)?.[1] || "00";
    let minutes = time.match(/(\d+)M/)?.[1] || "00";
    let seconds = time.match(/(\d+)S/)?.[1] || "00";

    let formattedTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    return formattedTime
  }

}
