
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
import React, { Component, Fragment } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import update from 'react-addons-update';
// import { Collapse } from 'reactstrap';
import XlsExport from 'xlsexport';
import _ from 'lodash';

import { deleteCircularInfo } from 'services/circularService';
import ToastService from 'services/toastService';

export default class CircularList extends Component {
  state = {
    data: {
      client: "", entity: "", branch: "", department: "", batch: "", userType: ""
    },
    columns: [],
    columnHeaders: { "keys": [], "def": {} },
    hideColumns: [],
    sort: [],
    isPageLoading: true,
    isLoading: false,
    modal: false,
    selected: [],
    exportData: [],
    allKeys: [],
    toggleColumns: false,
    labels: {},
    clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [],
  }

  constructor(props, context) {
    super(props, context);
    this.bulkModalToggle = this.bulkModalToggle.bind(this);
  }

  async componentDidMount() {
    const labels = this.getDefaultClientLabels();
    const { type } = this.props;
    await this.initTableData()
    await this.setState({
      data: this.props.data,
      type, labels,
      isPageLoading: false
    })
  }

  initTableData = async () => {
    const { hideColumns } = this.state;
    const columnHeaders = this.getColumnHeaders(this.props.form, this.props.prefixUrl);
    const columns = this.getColumns('client', columnHeaders, hideColumns);
    await this.setState({ columns, columnHeaders, hideColumns })
  }

  isColumnVisible = (key) => {
    return !_.includes(this.state.hideColumns, key)
  }

  toggleColumn = async (i) => {
    this.setState({ isLoading: true })
    await this.setState(prevState => {
      let hidden = prevState.columns[i] && prevState.columns[i]['hidden'] ? prevState.columns[i]['hidden'] : false
      var index = this.state.hideColumns.indexOf(prevState.columns[i]['text'])
      let hideColumns = this.state.hideColumns
      if (!hidden) {
        hideColumns.push(prevState.columns[i]['text'])
      } else {
        if (index !== -1) {
          hideColumns.splice(index, 1)
        }
      }
      return {
        columns: update(this.state.columns, { [i]: { hidden: { $set: !hidden } } }),
        hideColumns
      }
    })
    this.setState({ isLoading: false })
  }

  handleOnSelect = (row, isSelect) => {
    if (isSelect) {
      this.setState(() => ({
        selected: [...this.state.selected, row._id],
        exportData: [...this.state.exportData, row],
      }));
    } else {
      this.setState(() => ({
        selected: this.state.selected.filter(x => x !== row._id),
        exportData: this.state.exportData.filter(x => x !== row),
      }));
    }
  }

  handleOnSelectAll = (isSelect, rows) => {
    const ids = rows.map(r => r._id);
    if (isSelect) {
      this.setState(() => ({
        selected: ids,
        exportData: rows
      }));
    } else {
      this.setState(() => ({
        selected: [],
        exportData: []
      }));
    }
  }

  renderButton(name, type, className, funcal) {
    return (
      <button
        type={type}
        className={className}
        onClick={funcal}
      >{name}
      </button>
    );
  }

  toggleColumns = () => {
    this.setState({ toggleColumns: !this.state.toggleColumns });
  }

  bulkModalToggle() {
    this.setState({
      modal: !this.state.modal,
      modalsize: "lg",
    });
  }

  async exceltable(format) {
    let d;
    const { exportData } = this.state
    const { data } = this.props
    if (format === 'selecteduserxls') d = this.downloadxls(exportData)
    if (format === 'alluserxls') d = this.downloadxls(data)
    var xls = new XlsExport(d)
    xls.exportToXLS('UserList.xls')
  }

  downloadxls(data) {
    let dataarr = []
    if (data.length > 0) {
      for (let item of data) {
        let obj = {
          "User ID": item.uid, "Password": item.password, "Email Id": item.email, "Mobile No": item.mobile, "Title": item.title, "Name": item.firstName + item.middleName + item.lastName, "Gender": item.gender, "DOB": item.dob, "BloodGroup": item.bloodGroup, "MotherTongue": item.motherTongue, "Caste": item.caste, "Religion": item.religion, "Aadhaar Number": item.aadharNo, "Nationality": item.nationality, "Role": item.type
        }
        dataarr.push(obj)
      }
      return dataarr
    } else {
      return dataarr
    }
  }

  setFormApi = (formApi) => {
    this.formApi = formApi;
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

  getColumnHeaders(type, prefixUrl = "", dynamicLabels = {}) {
    let allKeys = [
      "Client", "Entity", "Branch", 'Department', 'Batch', 'title', 'date', 'description', 'actions'
    ]
    let excludeKeys = []
    switch (type) {
      case 'circular':
        excludeKeys = ["Client", "Entity", "Branch", "Department", "Batch"];
        break;
      default:
        excludeKeys = ["Client", "Entity", "Branch"];
        break;
    }
    let keys = _.filter(allKeys, (v) => !_.includes(excludeKeys, v))
    let def = {
      "sno": { dataField: 'sno', isDummyField: true, text: "S.No", formatter: this.serialNumberFormatter },
      "Client": {dataField: 'client', text: `Client`, filter: this.getTextFilter(), sort: true},
      "Entity": { dataField: 'entity', text: `Entity`, filter: this.getTextFilter(), sort: true },
      "Branch": { dataField: 'branch', text: `Branch`, filter: this.getTextFilter(), sort: true },
      "Dapartment": { dataField: 'department', text: `Department`, filter: this.getTextFilter(), sort: true },
      "title": { dataField: 'title', text: `Title`, filter: this.getTextFilter(), sort: true },
      "date": {dataField: 'from', text: `Date`, filter: this.getTextFilter(), formatter: this.dateFormater, sort: true},
      "description": {dataField: 'description', text: `Description`, filter: this.getTextFilter(), sort: true},
      "actions": { dataField: 'actions', isDummyField: true, text: "Actions", formatter: this.actionFormater },
    }
    return { "keys": keys, "def": def }
  }

  getDefaultClientLabels() {
    return {}
  }

  serialNumberFormatter(cell, row, rowIndex, formatExtraData) {
    return rowIndex + 1
  }

  onlinedateFormatter(cell, row, rowIndex, formatExtraData) {
    return row.from.date + '-' + row.to.date
  }

  onlinetimeFormatter(cell, row, rowIndex, formatExtraData) {
    return row.from.time + '-' + row.to.time
  }

  getTextFilter(type = "default") {
    return textFilter({
      placeholder: '',
      delay: 1000
    })
  }

  handleError(...err) {

    return ToastService.Toast("Something went wrong.Please try again later", "default");
  }

  markrangeFormater = (cell, row, rowIndex, formatExtraData) => {
    const { from, to } = cell
    return `${from} - ${to}`;
  }

  dateFormater = (cell, row, rowIndex, formatExtraData) => {
    return <div >{row.from} - {row.to}</div>
  }

  actionFormater = (cell, row, rowIndex, formatExtraData) => {
    let links = []
    links.push(<div onClick={() => this.editFun(`/notification/view/circular`, row)} className='badge badge-success'>View</div>)
    links.push(<div onClick={() => this.editFun(`/notification/edit/circular`, row)} className='badge badge-warning'>Edit</div>)
    links.push(<div onClick={() => this.circularDelete(row)} className='badge badge-danger'>Delete</div>)
    return <div className="actions">{links.concat(" ")}</div>
  }

  editFun = (url, row) => {
    console.log(url, row)
    row["isFromView"] = true;
    this.props.props.props.history.push({
      pathname: url,
      state: row
    })
  }

  circularDelete = async (row) => {
    try {
      const { client, entity, branch, department, batch, _id } = row;
      const { refreshTable } = this.props;
      let params = `client=${client}&entity=${entity}&branch=${branch}&department=${department}$batch=${batch}&id=${_id}`;
      let res = await deleteCircularInfo(params);
      const { data: { statusCode } } = res;
      if (statusCode === 1) {
        await ToastService.Toast("Deleted Successfully", "default");
        refreshTable();
      } else {
        return ToastService.Toast("Something went wrong.Please try again later", "default");
      }
    } catch (err) {
      this.handleError(err)
    }
  }

  render() {
    const { isPageLoading, isLoading, data, columns, } = this.state;
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

    return (
      <Fragment >
        {!isPageLoading && <Fragment>

         
        
          {!isLoading &&
            <div>
              <BootstrapTable
                keyField="_id"
                data={data}
                columns={columns}
                bootstrap4
                classes="table table-bordered table-hover table-sm"
                wrapperClasses="table-responsive"
                filter={filterFactory()}
                pagination={paginationFactory(options)}
                noDataIndication={'No data to display here'}
              // selectRow={selectRow}
              // expandRow={this.previewClient}
              />
            </div>
          }
        </Fragment>
        }
      </Fragment >
    );
  }
}

