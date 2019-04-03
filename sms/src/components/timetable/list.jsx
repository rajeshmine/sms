import _ from 'lodash';
import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import { textFilter } from 'react-bootstrap-table2-filter';
import * as FAIcons from 'react-icons/fa';
import { deleteStaffAllocation } from 'services/staffAllocationService';

import ToastService from 'services/toastService';

import PHE from 'print-html-element';
export default class Timetable extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      data: {

      },
      columns: [],
      columnHeaders: { "keys": [], "def": {} },
      hideColumns: [],
      sort: [],
      isPageLoading: true,
      isLoading: false,
      modal: false,
      errors: [],
      success: [],
      selected: [],
      exportData: [],
      allKeys: [],
      toggleColumns: false,
      labels: {},
      TabData: [],
    }

  }


  async componentDidMount() {
    const { type, } = this.props;
    await this.initTableData()
    await this.setState({
      data: this.props.data,
      type,
      isPageLoading: false
    })
  }

  initTableData = async () => {
    const { hideColumns } = this.state;
    const columnHeaders = await this.getColumnHeaders(this.props.type, this.props.prefixUrl);
    const columns = await this.getColumns('client', columnHeaders, hideColumns);
    await this.setState({ columns, columnHeaders, hideColumns })
  }

  previewClient = {
    renderer: row => (
      <div>
        <h6>{row.name}</h6>
        {row.address && <p>{row.address}</p>}
      </div>
    )
  };

  getColumns(type, columnsHeaders, hideColumns) {
    let columns = []
    const { keys, def } = columnsHeaders;
    _.forEach(keys, (key) => {
      columns.push({ ...def[key], hidden: _.includes(hideColumns, key) })
    })
    return columns;
  }

  async getColumnHeaders(type, prefixUrl = "", dynamicLabels = {}) {
    let tableType = this.props.type;

    const { data } = this.props
    let allKeys = ["Time", "Syllabus", "SubjectId", "StaffName", "StaffID", "Day", "StartTime", "EndTime", "Date", "Description", "actions"];
    let def = {};
    if (tableType === 'exam' || tableType === 'Exam') {
      def = {
        "Date": { dataField: 'date', text: `Date`, sort: true, formatter: this.examdateFormatter },
        "Time": { dataField: 'time', text: `Time`, sort: true, formatter: this.examtimeFormatter },
        "Syllabus": { dataField: 'syllabus', text: `Syllabus`, sort: true },
        "SubjectId": { dataField: 'subjectName', text: `Subject`, sort: true },
      }
    }
    if (tableType === 'WorkAllocation' || tableType === 'workAllocation') {
      def = {
        "StaffName": { dataField: 'staffName', text: `Staff Name`, sort: true, },
        "StaffID": { dataField: 'staffId', text: `Staff Id`, sort: true, },
        "Day": { dataField: 'day', text: `Day`, sort: true, },
        "StartTime": { dataField: 'startTime', text: `StartTime`, sort: true, },
        "EndTime": { dataField: 'endTime', text: `EndTime`, sort: true, },
        "Description": { dataField: 'description', text: `Description`, sort: true, },
        "Date": { dataField: 'date', text: `Date`, sort: true, },
        "actions": { dataField: 'actions', isDummyField: true, text: "Actions", formatter: this.actionsFormatter }
      }
    }
    if ((tableType === 'class' || tableType === 'Class') || (tableType === 'staff' || tableType === 'Staff')) {
      def["day"] = { dataField: 'day', text: `Day`, sort: true };
      await _.map(data, v => { allKeys.push(_.keys(v)) })
      allKeys = await _.uniq([].concat.apply([], allKeys))
      allKeys.splice(allKeys.indexOf('time'), 1);
      def = {
        "day": { dataField: 'day', text: `Day`, sort: true },
      }
      _.map(allKeys, v => {
        if (v !== 'day' && v !== 'time') {
          def[v] = { dataField: data[v], text: v, sort: true, formatter: this.classtimetableFormatter, formatExtraData: v }
        }
      })
    }
    let excludeKeys = [];
    switch (tableType) {
      case "exam":
      case "Exam":
        excludeKeys = ["SubjectId", "StaffName", "StaffID", "Day", "StartTime", "EndTime", "Description", "actions"]
        break;

      case "staff":
      case "Staff":
        excludeKeys = ["Date", "Time", "Syllabus", "SubjectId", "StaffName", "StaffID", "Day", "StartTime", "EndTime", "Description", "Date", "actions"]
        break;
      case "class":
      case "Class":
        excludeKeys = ["Date", "Time", "Syllabus", "SubjectId", "StaffName", "StaffID", "Day", "StartTime", "EndTime",  "Description", "Date", "actions"]
        break;
      case "WorkAllocation":
      case "workAllocation":
        excludeKeys = ["Time", "Syllabus", "SubjectId"]
        break;
      default:
        break;
    }
    let keys = _.filter(allKeys, (v) => !_.includes(excludeKeys, v))



    return { "keys": keys, "def": def }
  }



  serialNumberFormatter(cell, row, rowIndex, colIndex, formatExtraData) {
    return rowIndex + 1
  }

  getTextFilter(type = "default") {
    return textFilter({
      placeholder: '',
      delay: 1000
    })
  }


  actionsFormatter = (cell, row, rowIndex, formatExtraData) => {
    let links = []
    links.push(<div onClick={() => this.editFun(`/staff/edit/staffallocation/`, row)} className='badge badge-warning'>Edit</div>)
    links.push(<div onClick={() => this.deleteFun(row)} className='badge badge-danger'>Delete</div>)
    return <div className="actions">{links.concat(" ")}</div>
  }
  editFun = (url, data) => {
    let row = data
    this.props.props.history.push({
      pathname: url,
      state: {
        row
      }
    })
  }

  deleteFun = async (row) => {
    let params;
    if (row.batch) {
      params = `client=${row.client}&entity=${row.entity}&branch=${row.branch}&department=${row.department}&batch=${row.batch}&staffId=${row.staffId}`
    } else {
      params = `client=${row.client}&entity=${row.entity}&branch=${row.branch}&department=${row.department}&staffId=${row.staffId}`
    }
    let res = await deleteStaffAllocation(params)
    if (res.data.statusCode === 1) return ToastService.Toast(res.data.message, 'default')
  }

  examdateFormatter = (cell, row, rowIndex, formatExtraData) => {

    const { date } = row
    return <div>{date}</div>
  }

  examtimeFormatter = (cell, row, rowIndex, formatExtraData) => {
    const { time } = row
    return <div>{time && time[0] && time[0].from}-{time && time[0] && time[0].to}</div>
  }

  classtimetableFormatter = (cell, row, rowIndex, formatExtraData) => {
    if (row[formatExtraData]) {
      const { staffName, subjectName } = row[formatExtraData]
      if (staffName && subjectName) {
        return <div><span className='badge badge-primary'>{staffName}</span ><span className='badge badge-blue'>{subjectName}</span></div>
      } else {
        return ''
      }
    } else {
      return ''
    }
  }




  printDocument() {
    const input = document.getElementById('divToPrint')
    const opts = {
      printMode: 'A4',
      stylesheets: ["https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"],
      styles: [],
    };
    PHE.printElement(input, opts)
  }


  render() {
    const { isPageLoading, isLoading,  data,  columns } = this.state;
  
   

    return (
      <React.Fragment >
        <div className="mb5">
          <button onClick={this.printDocument} className="btn btn-primary btn-sm"><FAIcons.FaPrint /> Print</button>
        </div>
        {!isPageLoading && <React.Fragment>
          {!isLoading &&
            <div id="divToPrint">

              {data && data[0] && <h6>
                {data[0].examName}
              </h6>
              }
              <BootstrapTable
                keyField="_id"
                data={data}
                columns={columns}
                bootstrap4
                classes="table table-bordered table-hover table-sm"
                wrapperClasses="table-responsive"
                noDataIndication={'No data to display here'}
              />
            </div>
          }
        </React.Fragment>
        }
      </React.Fragment >
    );
  }
}

