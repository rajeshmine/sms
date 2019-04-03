import Joi from 'joi-browser';
import _ from 'lodash';
import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';

import ToastService from 'services/toastService'

export default class ClassTimeTable extends Component {

  constructor(props) {
    super(props)
    this.state = {
      clientIds: [], entityIds: [], branchIds: [], classTeacher: '',
      isTableLoading: true
    }
  }

  async componentDidMount() {
    await this.initTableData()
    let tableData = [];
    const { data, days, formTypes } = this.props
    if (formTypes === 'rescheduletable') { 
      await _.map(data, async v => {
        if (v[days] !== undefined)
          tableData.push(v[days][0])
      })
      tableData = await [].concat.apply([], tableData)
      if (tableData.length === 0)
        return ToastService.Toast(`No Data Found!!!`, "default")
      await this.setState({ tableData, classTeacher: data[0].classTeacher, days, isTableLoading: false })
    } else { 
      await _.map(data, async v => {
        if (v[days] !== undefined)
          tableData.push(v[days])
      })
      tableData = await [].concat.apply([], tableData)
      if (tableData.length === 0)
        return ToastService.Toast(`No Data Found!!!`, "default")
      await this.setState({ tableData, classTeacher: data[0].classTeacher, days, isTableLoading: false })
    }
  }

  schema = { //validating All the feilds
    branch: Joi.string().required().label("Department"),
    client: Joi.string().required().label("Client"),
    entity: Joi.string().required().label("Entity")
  };

  initTableData = async () => {
    const { hideColumns } = this.state;
    const columnHeaders = this.getColumnHeaders(this.props.formTypes, this.props.prefixUrl);
    const columns = getColumns(columnHeaders, hideColumns);
    await this.setState({ columns, columnHeaders, hideColumns })
  }

  getColumnHeaders(formTypes, prefixUrl = "") { //dynamic headers 
    let allKeys = ["Staff Name", "Staff", "Subject Name", "StartTime", "EndTime", "actions"];
    let excludeKeys = [];
    switch (formTypes) { //Display Headers based on formTypes
      case "class":
        excludeKeys = ["actions", "Staff",]
        break;
      case "rescheduletable":
        excludeKeys = ["Staff Name", "actions"]
        break;
      default:
        break;
    }
    let keys = _.filter(allKeys, (v) => !_.includes(excludeKeys, v))
    let def = {
      "sno": { dataField: 'sno', isDummyField: true, text: "S.No", formatter: serialNumberFormatter },
      "Staff Name": { dataField: 'staffName', text: 'Staff Name ', sort: true, filter: getTextFilter() },
      "Staff": { dataField: 'staff', text: 'Staff', sort: true, filter: getTextFilter() },
      "Subject Name": { dataField: 'subjectName', text: 'Subject Name ', sort: true, filter: getTextFilter() },

      "StartTime": { dataField: 'starttime', text: 'StartTime', sort: true, filter: getTextFilter() },
      "EndTime": { dataField: 'endtime', text: 'EndTime', sort: true, filter: getTextFilter() },
      "actions": { dataField: 'actions', isDummyField: true, text: "Actions", formatter: this.actionsFormatter }
    }
    return { "keys": keys, "def": def }
  }

  actionsFormatter = (cell, row, rowIndex, formatExtraData) => {
    let links = []
    if (row.status === 'active') {
      links.push(<div className='badge badge-danger'>Delete</div>)
    }
    return <div className="actions">{links.concat(" ")}</div>
  }
  editFun = (url, ClassTT, ) => {
    const { data, days } = this.props
    let clients = data[0].clients[0]
    let path = url;
    this.props.props.history.push({
      pathname: path,
      state: {
        ClassTT,
        "day": days,
        "client": data[0].client,
        "entity": data[0].entity,
        "branch": data[0].branch,
        "department": clients.departmentId,
        "batch": clients.batchId,
      }
    })
  }

  render() {
    const { formTypes } = this.props
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
    const { tableData, columns, isTableLoading } = this.state; 
    return (
      <React.Fragment >
        {tableData !== undefined && formTypes !== 'rescheduletable' ?
          <span>Class Teacher Name:<b>&nbsp;&nbsp;{this.state.classTeacher}</b>  </span> : ''
        }
        <br />
        {!isTableLoading &&
          <BootstrapTable
            keyField="staff"
            data={tableData}
            columns={columns}
            bootstrap4
            pagination={paginationFactory(options)}
            classes="table table-bordered table-hover table-sm"
            wrapperClasses="table-responsive"
            filter={filterFactory()}
          />
        }
        {formTypes === 'class' &&
          <button onClick={() => this.editFun(`/timetable/edit/class`, tableData)} style={{ marginTop: "25px", marginLeft: "399px" }} type="submit" className="btn btn-primary btn-sm">Edit</button>
        }
      </React.Fragment>)
  }
}

function getTextFilter(type = "default") { //Bootstrap filter
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

