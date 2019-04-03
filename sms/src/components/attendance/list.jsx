import _ from 'lodash';
import React, { Component } from 'react';
//import update from 'react-addons-update';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
//import { NavLink } from 'react-router-dom';
import Joi from 'joi-browser';
import ToastService from 'services/toastService'
import { deleteHoliday } from 'services/attendanceService';

import { getselectData } from 'services/userService';
//import { deleteSection, deleteExamData, answerKeys } from 'services/examService';
//import { deleteScheduleDetails } from 'services/scheduleService';

export default class AttendanceList extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      data: {
        client: "", entity: "", branch: "", department: "", batch: "", userType: ""
      },
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
      clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [],
      userTypes: [{ id: "Staff", name: "Staff" }, { id: "Student", name: "Student" }],
      payloadArray: {}, userdataArray: [], userDetails: []
    }


  }

  schema = {
    client: Joi.string().required().label("Client"),
    entity: Joi.string().required().label("Entity"),
    branch: Joi.string().required().label("Branch"),
    // department: Joi.string().required().label("Department"),
    // batch: Joi.string().required().label("Batch"),
    department: Joi.any().optional(),
    batch: Joi.any().optional(),

  };

  async componentDidMount() {

    const labels = this.getDefaultClientLabels();
    const { attendanceType, rightsData } = this.props;
    //this.tableDate()
    await this.initTableData()
    await this.setState({
      data: this.props.data,
      rightsData,
      attendanceType, labels,
      isPageLoading: false
    })
    this.selectoptGet(`clients`, "clientIds")
  }



  initTableData = async () => {
    const { hideColumns } = this.state;
    const columnHeaders = this.getColumnHeaders(this.props.attendanceType, this.props.prefixUrl);
    const columns = this.getColumns('client', columnHeaders, hideColumns);
    await this.setState({ columns, columnHeaders, hideColumns })
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



  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };

  setFormApi = (formApi) => {
    this.formApi = formApi;
  }


  handleChange = async ({ currentTarget: Input }) => {
    const { name, value } = Input;
    const { data } = this.state;
    data[name] = value;

    await this.setState({
      [name]: value
    }, () => {
    })

    switch (name) {
     
      case "client":
        this.selectoptGet(`namelist?client=${data.client}&type=client`, "entityIds")
        await this.setState({ entity: "", branch: "", department: "", batch: "", branchIds: [], departmentIds: [], batchIds: [] })

        break;
      case "entity":
        this.selectoptGet(`namelist?client=${data.client}&type=entity&entity=${data.entity}`, "branchIds")
        await this.setState({ branch: "", department: "", batch: "", departmentIds: [], batchIds: [] })
        break;
      case "branch":
        this.selectoptGet(`namelist?client=${data.client}&type=branch&entity=${data.entity}&branch=${data.branch}`, "departmentIds")
        await this.setState({ department: "", batch: "", batchIds: [] })

        break;
      case "department":
        this.selectoptGet(`namelist?client=${data.client}&type=department&entity=${data.entity}&branch=${data.branch}&department=${data.department}`, "batchIds")
        await this.setState({ batch: "" })
        break;

      case "batch":
        // break;

        break;
      default:
        break;
    }
  }




  async selectoptGet(url, type) {
    try {
      const data = await getselectData(url)
      if (data.data.statusCode === 1) {
        const Datas = data.data.data
        this.setState({ [type]: Datas });
      }
    } catch (err) {
      this.handleError(err)
    }

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
    // "offlineTime", "onlineTime",
    let allKeys = ["Title", "From", "To", "studentId", "status", "period", "name", "actions"]
    let excludeKeys = []
 
    switch (type) {
      case "attendance":
        excludeKeys = ["Title", "From", "To", "actions"
        ]

        break;
      case "holiday":
        excludeKeys = ["studentId", "status", "period", "name"

        ]
        break;

      default:
        break;
    }

    let keys = _.filter(allKeys, (v) => !_.includes(excludeKeys, v))
    let def = {
      "sno": { dataField: 'sno', isDummyField: true, text: "S.No", formatter: this.serialNumberFormatter },
      "Title": { dataField: 'title', text: 'Title ', sort: true, filter: this.getTextFilter() },
      "name": { dataField: 'name', text: 'Name ', sort: true, filter: this.getTextFilter() },
      "studentId": { dataField: 'studentId', text: 'StudentId ', sort: true, filter: this.getTextFilter() },
      "status": { dataField: 'status', text: 'Status ', sort: true, filter: this.getTextFilter() },
      "period": { dataField: 'period', text: 'Period ', sort: true, filter: this.getTextFilter() },
      "From": { dataField: 'holidayDate.from', text: 'From', sort: true, filter: this.getTextFilter() },
      "To": { dataField: 'holidayDate.to', text: 'To', sort: true, filter: this.getTextFilter() },
      "actions": { dataField: 'actions', isDummyField: true, text: "Actions", formatter: this.actionsFormatter }
    }
    return { "keys": keys, "def": def }
  }

  getDefaultClientLabels() {
    return {

    }
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
 
    return ToastService.Toast("Somthig went wrong.Please try again later", "default");
  }

  actionsFormatter = (cell, row, rowIndex, formatExtraData) => {
    const { attendanceType } = this.props;
    const { rightsData } = this.state;
    let _form = _.upperFirst(attendanceType);
    let links = []
    rightsData && rightsData[_form] && rightsData[_form].edit.value && attendanceType === 'holiday' &&
      links.push(<div style={{ cursor: 'pointer' }} onClick={() => this.editFun(`/attendance/edit`, row)} className='badge badge-warning'>Edit</div>)

    rightsData && rightsData[_form] && rightsData[_form].delete.value && attendanceType === 'holiday' &&

      links.push(<div style={{ cursor: 'pointer' }} onClick={() => this.deleteRow(row)} className='badge badge-danger'>Delete</div>)

    return <div className="actions">{links.concat(" ")}</div>
  }


  deleteRow = async (row) => {
    const { refreshTable} = this.props;
    let response;
    let params = `client=${row.client}&entity=${row.entity}&branch=${row.branch}&title=${row._id}`
   
    response = await deleteHoliday(params)
   
    if (response.data.statusCode !== 1) return ToastService.Toast(response.data.message, 'default');
    if (response.data.statusCode === 1) {
      await ToastService.Toast(response.data.message, 'default');
      refreshTable() 
    }
  }


  editFun = (url, data) => {
    const { attendanceType } = this.props
    let path = url + '/' + attendanceType;
    //let row = data 
    let details = this.props.details
    this.props.props.history.push({
      pathname: path,
      state: {
        data,
        details
      }
    })
  }



  render() {
    const { isPageLoading, isLoading, data,  columns, } = this.state;
    // const excludeToggleFields = ["sno", "actions"];
    const { attendanceType } = this.props;

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
      <React.Fragment >
        {!isPageLoading && <React.Fragment>

          <h6>{attendanceType} List</h6>

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
        </React.Fragment>
        }
      </React.Fragment >
    );
  }
}

