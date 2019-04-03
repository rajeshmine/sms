import Joi from 'joi-browser';
import _ from 'lodash';
import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { deleteScheduleDetails } from '../../services/scheduleService'
import ToastService from 'services/toastService'

export default class ScheduleList extends Component {

  state = {
    clientIds: [], entityIds: [], branchIds: [],
  }

  async componentWillMount() {
    await this.props.props.isPageLoadingTrue();
  }
  async componentDidMount() {
    const { data, rightsData } = this.props
  
    this.setState({ data, rightsData })
    await this.initTableData();
    await this.props.props.isPageLoadingFalse();
  }

  schema = {
    branch: Joi.string().required().label("Department"),
    client: Joi.string().required().label("Client"),
    entity: Joi.string().required().label("Entity")
  };

  initTableData = async () => {
    const { hideColumns } = this.state;
    const columnHeaders = this.getColumnHeaders(this.props.scheduleType, this.props.prefixUrl);
    const columns = getColumns(columnHeaders, hideColumns);
    await this.setState({ columns, columnHeaders, hideColumns })
  }

  getColumnHeaders(scheduleType, prefixUrl = "") {
    let allKeys = ["Code", "Type", "Title", "NoofDays", "Subject", "Term", "Marks", "Remarks", "Description", "BannerImage", "URL", "Mode", "FromDate", "ToDate", "TotalMark", "NoofTimes", "actions"];
    let excludeKeys = [];
    switch (scheduleType) {
      case "exam":
        excludeKeys = ["NoofDays", "Subject", "BannerImage", "URL", "NoofTimes", "Marks", "Remarks", "Type", "Code"]
        break;
      case "event":
        excludeKeys = ["NoofDays", "Subject", "Marks", "BannerImage", "Remarks", "Mode", "NoofTimes", "TotalMark", "Type", "Code", "Term"]
        break;
      case "attendance":
        excludeKeys = ["NoofDays", "Subject", "BannerImage", "URL", "Mode", "TotalMark", "Marks", "Remarks", "Type", "Code", "Term"]
        break;
      case "assignment":
        excludeKeys = ["NoofDays", "Subject", "BannerImage", "URL", "Mode", "TotalMark", "NoofTimes", "Remarks", "Type", "Code", "Term"]
        break;
      case "timetable":
        excludeKeys = ["NoofDays", "Subject", "Marks", "Remarks", "BannerImage", "URL", "Mode", "TotalMark", "NoofTimes", "Type", "Code", "Term"]
        break;
      case "homework":
        excludeKeys = ["NoofDays", "Subject", "BannerImage", "URL", "Mode", "TotalMark", "NoofTimes", "Remarks", "Marks", "Type", "Code", "Term"]
        break;
      case "course":
        excludeKeys = ["NoofDays", "Subject", "BannerImage", "URL", "Mode", "TotalMark", "NoofTimes", "Remarks", "Marks", "Term"]
        break;
      case "term":
        excludeKeys = ["NoofDays", "Subject", "BannerImage", "URL", "Mode", "TotalMark", "NoofTimes", "Remarks", "Marks", "Code", "Term","Type",]
        break;
      default:
        break;
    }
    let keys = _.filter(allKeys, (v) => !_.includes(excludeKeys, v))
    let def = {
      "sno": { dataField: 'sno', isDummyField: true, text: "S.No", formatter: serialNumberFormatter },
      "Type": { dataField: 'type', text: 'Type', sort: true },
      "Title": { dataField: 'title', text: 'Title', sort: true },
      "NoofDays": { dataField: 'attendance.noOfTimesTaken', text: 'No of Days', sort: true},
      "Subject": { dataField: 'title', text: 'Subject', sort: true },
      "Marks": { dataField: 'assignment[0].mark', text: 'Marks', sort: true },
      "Remarks": { dataField: 'title', text: 'Remarks', sort: true },
      "Description": { dataField: 'desc', text: 'Description', sort: true },
      "BannerImage": { dataField: 'title', text: 'Banner Image', sort: true },
      "URL": { dataField: 'event[0].website.url', text: 'URL', sort: true },
      "Mode": { dataField: 'exam[0].mode', text: 'Mode', sort: true },
      "FromDate": { dataField: 'from.date', text: 'From Date', sort: true },
      "ToDate": { dataField: 'to.date', text: 'To Date', sort: true },
      "Term": { dataField: 'term', text: 'Term', sort: true },
      "TotalMark": { dataField: 'exam[0].outoff', text: 'Total Mark', sort: true },
      "NoofTimes": { dataField: 'attendance[0].noOfTimesTaken', text: 'No of Times', sort: true },
      "Code": { dataField: 'course[0].code', text: 'Code', sort: true },
      "actions": { dataField: 'actions', isDummyField: true, text: "Actions", formatter: this.actionsFormatter }
    }
    return { "keys": keys, "def": def }
  }

  actionsFormatter = (cell, row, rowIndex, formatExtraData) => {
   
    const { rightsData } = this.state;
    const { scheduleType } = this.props;
    let _form = _.upperFirst(scheduleType);
    let links = [];
    
      rightsData && rightsData[_form] && rightsData[_form].edit.value &&
        links.push(<div onClick={() => this.editFun(`/schedule/edit/`, row)} className='badge badge-warning'>Edit</div>)
    
      rightsData && rightsData[_form] && rightsData[_form].delete.value &&
        row.status === 'active' &&
        links.push(<div onClick={() => this.deleteScheduleTypes(row)} className='badge badge-danger'>Delete</div>)
    
    return <div className="actions">{links.concat(" ")}</div>
  }

  editFun = (url, scheduledata) => {  
    const { scheduleType } = this.props
    let path = url + scheduleType;
    this.props.props.history.push({
      pathname: path,
      state: {
        scheduledata
      }
    })
  }

  deleteScheduleTypes = async (row) => {
    const { refreshTable } = this.props;
    let response;
    let params = `client=${row.client}&entity=${row.entity}&branch=${row.branch}&id=${row._id}`
    response = await deleteScheduleDetails(params)
    if (response.data.statusCode !== 1) return ToastService.Toast(response.data.message, 'default');
    if (response.data.statusCode === 1) {
      await ToastService.Toast(response.data.message, 'default');
      refreshTable();
    }
  }

  render() {
    const options = {
      paginationSize: 4,
      pageStartIndex: 1,
      sizePerPage: 100,
      alwaysShowAllBtns: true,
      hideSizePerPage: true,
      hidePageListOnlyOnePage: true,
      firstPageText: 'First',
      prePageText: 'Back',
      nextPageText: 'Next',
      lastPageText: 'Last',
      nextPageTitle: 'First page',
      prePageTitle: 'Pre page',
      firstPageTitle: 'Next page',
      lastPageTitle: 'Last page',
      showTotal: true
    };
    const { data, columns } = this.state;
    return (
      <React.Fragment >

        {data &&
          <BootstrapTable
            keyField="_id"
            data={data}
            columns={columns}
            bootstrap4
            pagination={paginationFactory(options)}
            classes="table table-bordered table-hover table-sm"
            wrapperClasses="table-responsive"
            filter={filterFactory()}
            noDataIndication={'No data to display here'}

          />
        }
      </React.Fragment>)
  }
}


function getTextFilter(type = "default") {
  return textFilter({
    placeholder: '',
    delay: 1000
  })
}

function serialNumberFormatter(cell, row, rowIndex, formatExtraData) {
  return rowIndex + 1
}

function getColumns(columnsHeaders, hideColumns) {
  let columns = []
  const { keys, def } = columnsHeaders;

  _.forEach(keys, (key) => {
    columns.push({ ...def[key], hidden: _.includes(hideColumns, key) })
  })
  return columns;
}

