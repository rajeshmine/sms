import Joi from 'joi-browser';
import _ from 'lodash';
import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
//import { NavLink } from 'react-router-dom';
import { updateLeaves } from 'services/leaveService';
import ToastService from 'services/toastService';

export default class LeaveList extends Component {

  state = {

    clientIds: [], entityIds: [], branchIds: [],
  }

  async componentDidMount() { 
 
    const { data ,rightsData} = this.props; 
    
      this.setState({ data, rightsData })
    await this.initTableData()
  }


  schema = {
    client: Joi.string().required(),
    entity: Joi.string().required(),
    branch: Joi.string().required(),
    department: Joi.string().required(),
    batch: Joi.string().optional(),

  };



  initTableData = async () => {
    console.log(this.props.data)
    const { hideColumns } = this.state;
    const columnHeaders = this.getColumnHeaders(this.props.prefixUrl);
    const columns = this.getColumns(columnHeaders, hideColumns);
    await this.setState({ columns, columnHeaders, hideColumns })
  }


  getColumnHeaders(prefixUrl = "") {

    let allKeys = ["uid", "name", "fromDate", "endDate", "reason", "status", "actions",];
    let excludeKeys = [];
    let keys = _.filter(allKeys, (v) => !_.includes(excludeKeys, v))
    let def = {
      "sno": { dataField: 'sno', isDummyField: true, text: "S.No", formatter: this.serialNumberFormatter },
      "uid": { dataField: 'uid', text: 'Uid', sort: true, filter: this.getTextFilter() }, 
      "name": { dataField: 'name', text: 'name', sort: true, filter: this.getTextFilter() }, 
      "fromDate": { dataField: 'fromDate', text: 'FromDate', sort: true },
      "endDate": { dataField: 'endDate', text: 'EndDate', sort: true },
      "reason": { dataField: 'reason', text: 'Reason', sort: true },
      "status": { dataField: 'status', text: 'Status', sort: true },
      "actions": { dataField: 'actions', isDummyField: true, text: "Actions", formatter: this.actionsFormatter }
    }
    return { "keys": keys, "def": def }
  }

  // actions Approve and Reject Functionality

  actionsFormatter = (cell, row, rowIndex, formatExtraData) => { 
    const { rightsData } = this.state;
    let _form = _.upperFirst("leave"); 
    let links = [];
    rightsData && rightsData[_form] && rightsData[_form].edit.value && row.status === 'request' &&
      links.push(<div onClick={() => this.updateLeave(row, 'Approved')} className='badge badge-success' style={{ cursor: 'pointer' }}>Approve</div>)
    rightsData && rightsData[_form] && rightsData[_form].edit.value && row.status === 'request' &&
      links.push(<div onClick={() => this.updateLeave(row, 'Rejected')} className='badge badge-danger' style={{ cursor: 'pointer' }}>Reject</div>) 
      
    if (row.status === 'Approved') {
      links.push(<div className='badge badge-success'>Approved</div>)
    }
    if (row.status === 'Rejected') {
      links.push(<div className='badge badge-danger'>Rejected</div>)
    }
    return <div className="actions">{links.concat(" ")}</div>
  }



  getTextFilter(type = "default") {
    return textFilter({
      placeholder: '',
      delay: 1000
    })
  }


  // Update Leave API 
    updateLeave = async (row, status) => {
      const { refreshTable } = this.props;
    const { client, entity, branch, department, batch, reason, uid, fromDate, endDate } = row
    let params = `client=${client}&entity=${entity}&branch=${branch}&department=${department}&batch=${batch}&uid=${uid}&status=${status}&reason=${reason}&fromDate=${fromDate}&endDate=${endDate}`
    console.log(params)
    let res = await updateLeaves(params)
    if (res.data.statusCode === 1) {
      ToastService.Toast(`Leave ${status} Successfully `, "default")
      refreshTable()
    } else {
      ToastService.Toast(`Data Updated Failed!!!`, "default")
    }
    console.log(res)

  }


  serialNumberFormatter(cell, row, rowIndex, formatExtraData) {
    return rowIndex + 1
  }

  getColumns(columnsHeaders, hideColumns) {
    let columns = []
    const { keys, def } = columnsHeaders;

    _.forEach(keys, (key) => {
      columns.push({ ...def[key], hidden: _.includes(hideColumns, key) })
    })
    return columns;
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
      <React.Fragment>
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
