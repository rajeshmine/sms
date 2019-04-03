import _ from 'lodash';
import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
import Joi from 'joi-browser';

import ToastService from 'services/toastService'
import { deleteFeeallocation } from 'services/feeService'
import { getselectData } from 'services/userService';

export default class FeesList extends Component {
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
    userType: Joi.string().required().label("UserType")
  };

  async componentDidMount() {

    const labels = this.getDefaultClientLabels();
    const { type, rightsData, data } = this.props;
    await this.initTableData()
    await this.setState({
      rightsData,
      data,
      type, labels,
      isPageLoading: false
    })
    this.selectoptGet(`clients`, "clientIds")
  }




  initTableData = async () => {

    const { hideColumns } = this.state;
    const columnHeaders = this.getColumnHeaders(this.props.feesType, this.props.prefixUrl);
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


  adduserNavigation() {
    const { feesType, props: { location: { state } }, data } = this.props;
    // let url = ''
    // {
    //   parentData && parentData.map(d => (
    //     url += d.id + '/'
    //   ))
    // } 
    if (feesType === 'feeallocation' && feesType === 'feecollection')
      return <div className="btn btn-primary btn-sm" onClick={() => this.paymentFun(`/fees/add/feeallocation`, state)}>+ Add Fee Allocation</div>
    if (feesType === 'feecollection' && data.length === 0)
      return <div className="btn btn-primary btn-sm" onClick={() => this.paymentFun(`/fees/add/feecollection`, state)}>+ Add Fee Collection</div>

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
    let allKeys = [
      "Title", "Amount", "From", "To", "Fine Amount", "Description", "Caste", "Excemption", "aloactions", "studentId", "name", "amount", "paidAmount", "paidDate", "remarks", "status", "colactions",
    ]
    let excludeKeys = []
   
    switch (type) {
      case "feeallocation":
        excludeKeys = ["colactions", "studentId", "name", "amount", "paidAmount", "paidDate", "remarks", "status",
        ]

        break;
      case "feecollection":
        excludeKeys = ["Title", "Amount", "From", "To", "Fine Amount", "Description", "Caste", "Excemption", "aloactions",

        ]
        break;

      default:
        break;
    }

    let keys = _.filter(allKeys, (v) => !_.includes(excludeKeys, v))
    let def = {
      "sno": { dataField: 'sno', isDummyField: true, text: "S.No", formatter: this.serialNumberFormatter },
      // Fee Allocation
      "Title": { dataField: 'category', text: 'Fee Type Title', sort: true, filter: this.getTextFilter() },
      "Amount": { dataField: 'amount', text: 'Amount', sort: true, filter: this.getTextFilter() },
      "From": { dataField: 'dueDate.from', text: 'From Date', sort: true, filter: this.getTextFilter() },
      "To": { dataField: 'dueDate.to', text: 'To Date', sort: true, filter: this.getTextFilter() },
      "Fine Amount": { dataField: 'fineAmount', text: 'Fine Amount', sort: true, filter: this.getTextFilter() },
      "Description": { dataField: 'description', text: 'Description', sort: true, filter: this.getTextFilter() },
      "Caste": { dataField: 'caste', text: 'Caste', sort: true, filter: this.getTextFilter() },
      "Excemption": { dataField: 'excemption', text: 'Excemption', sort: true, filter: this.getTextFilter() },
      "aloactions": { dataField: 'actions', isDummyField: true, text: "Actions", formatter: this.allocationactionsFormatter },

      // Fee Collection
      "studentId": { dataField: 'studentId', text: 'StudentId', sort: true, filter: this.getTextFilter() },
      "name": { dataField: 'name', text: 'Name', sort: true, filter: this.getTextFilter() },
      "amount": { dataField: 'feeCollection[0].amount', text: 'Amount', sort: true, filter: this.getTextFilter() },
      "paidAmount": { dataField: 'feeCollection[0].paidAmount', text: ' Paid Amount', sort: true, filter: this.getTextFilter() },
      "paidDate": { dataField: 'feeCollection[0].paidDate', text: 'Paid Date', sort: true, filter: this.getTextFilter() },
      "remarks": { dataField: 'feeCollection[0].remarks', text: 'Remarks', sort: true, filter: this.getTextFilter() },
      "status": { dataField: 'status', isDummyField: true, text: 'Status', formatter: this.amountFormatter },
      "colactions": { dataField: 'actions', isDummyField: true, text: "Actions", formatter: this.collectionactionsFormatter },
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


  allocationactionsFormatter = (cell, row, rowIndex, formatExtraData) => {
    const { rightsData } = this.state;
    const { feesType } = this.props;
    let _form = feesType;
    let links = []
    rightsData && rightsData[_form] && rightsData[_form].edit.value &&
      links.push(<div onClick={() => this.paymentFun(`edit/feeallocation`, row)} className='badge badge-warning'>Edit</div>)

    rightsData && rightsData[_form] && rightsData[_form].delete.value &&
      links.push(<div onClick={() => this.deleteRow(row)} className='badge badge-danger'>Delete</div>)


    return <div className="actions">{links.concat(" ")}</div>
  }

  collectionactionsFormatter = (cell, row, rowIndex, formatExtraData) => {
    let links = []
    if ((row.feeCollection[0].status === 'unpaid') || (row.feeCollection[0].status === 'Pending'))
   
    {
      links.push(<div onClick={() => this.paymentFun(`/fees/add/feecollection`, row)} className='badge badge-success'>Pay</div>)
    }
    if ((row.feeCollection[0].status === 'Paid') || (row.feeCollection[0].status === 'paid')) {
      links.push(<div className='badge badge-danger'>Paid</div>)
    }
    return <div className="actions">{links.concat(" ")}</div>
  }

  amountFormatter = (cell, row, rowIndex, formatExtraData) => {
    const pendingamt = parseInt(row.feeCollection[0].amount) - parseInt(row.feeCollection[0].paidAmount)
  
    if (!_.isNaN(pendingamt) && pendingamt !== 0) return pendingamt + " Pending "
    if (!_.isNaN(pendingamt) && pendingamt === 0) return "paid"
    return row.feeCollection[0].status


  }


  deleteRow = async (row) => {
    let response;
    let params = `client=${row.client}&entity=${row.entity}&branch=${row.branch}&id=${row._id}`
   
    response = await deleteFeeallocation(params)
 
    if (response.data.statusCode !== 1) return ToastService.Toast(response.data.message,  'default');
    if (response.data.statusCode === 1) {
      await ToastService.Toast(response.data.message, 'default');
      this.initTableData()
    }
  }


  paymentFun = (url, data) => {
    let row = data
    let details = this.props.details
    this.props.props.history.push({
      pathname: url,
      state: {
        row,
        details
      }
    })
  }




  render() {
    const { isPageLoading, isLoading, data, columns, } = this.state;

    const { feesType } = this.props;
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

          <h6>{feesType} List</h6>

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

