
import _ from 'lodash';
import React, { Component, Fragment } from 'react';
import update from 'react-addons-update';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';

import { NavLink } from 'react-router-dom';
import XlsExport from 'xlsexport';

import ToastService from 'services/toastService'

export default class MarkList extends Component {
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
    success: [],
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
    const { type, form, data } = this.props;
    await this.initTableData();
    if (form === 'gpa')
      return await this.setState({
        data: data[form],
        type, labels,
        isPageLoading: false
      })
    return await this.setState({
      data: data["cce"]['Scholastic'],
      cdata: data["cce"]['co-scholastic'],
      type, labels,
      isPageLoading: false
    })

  }

  initTableData = async () => {
   
    const { hideColumns } = this.state;
    let { form } = this.props;
    let columnHeaders;
    if (form === 'cce')
      form = 'Scholastic';
    columnHeaders = this.getColumnHeaders(form, this.props.prefixUrl);
    const columns = this.getColumns('client', columnHeaders, hideColumns);
    const t = this.getColumnHeaders('co-scholastic', this.props.prefixUrl);
    const coColumns = this.getColumns('client', t, hideColumns); 
    await this.setState({ columns, coColumns: coColumns || [], columnHeaders, hideColumns })



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

  adduserNavigation() {
    const { form } = this.props;


    switch (form) {
      case "gpa":
        return <NavLink className="btn btn-primary btn-sm" to={`/mark/add/gpa`}>+ Add GPA Mark</NavLink>;
      case "cce":
        return <NavLink className="btn btn-primary btn-sm" to={`/mark/add/cce`}>+ Add CCE Mark</NavLink>;
      default:
        return <NavLink className="btn btn-primary btn-sm" to={`/mark/add/gpa`}>+ Add GPA Mark</NavLink>;

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
    // "offlineTime", "onlineTime",
    let allKeys = [
      "Client", "Entity", "Branch", 'name', 'skill', 'mark', 'remarks', 'actions', 'co-actions'

    ]
    let excludeKeys = [] 
    switch (type) {
      case 'gpa':
        excludeKeys = ["Client", "Entity", "Branch", "skill", 'co-actions'];
        break;
      case 'Scholastic':
        excludeKeys = ["Client", "Entity", "Branch", "skill", 'actions'];
        break;
      case 'co-scholastic':
        excludeKeys = ["Client", "Entity", "Branch", 'actions'];
        break;

      default:
        excludeKeys = ["Client", "Entity", "Branch"];
        break;
    }


    let keys = _.filter(allKeys, (v) => !_.includes(excludeKeys, v))
    let def = {
      "sno": { dataField: 'sno', isDummyField: true, text: "S.No", formatter: this.serialNumberFormatter },
      "Client": {
        dataField: 'client', text: `Client`, filter: this.getTextFilter(), sort: true
      },
      "Entity": { dataField: 'entity', text: `Entity`, filter: this.getTextFilter(), sort: true },
      "Branch": { dataField: 'branch', text: `Branch`, filter: this.getTextFilter(), sort: true },

      "name": { dataField: 'name', text: `Name`, filter: this.getTextFilter(), sort: true },

      "mark": { dataField: 'mark', text: `Mark`, sort: true },
      "remarks": { dataField: 'remarks', text: `Remarks`, sort: true },
      "skill": { dataField: 'skillName', text: `Skill`, sort: true },

      "actions": { dataField: 'actions', isDummyField: true, text: "Actions", formatter: this.actionFormater },

      "co-actions": { dataField: 'actions', isDummyField: true, text: "Actions", formatter: this.coActionFormater },
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

  // function pictureurlFormatter(cell, row, rowIndex, formatExtraData) {
  //   return (
  //     <div className="clientpicture">
  //       <img src={row.pictureUrl} />

  //     </div>
  //   )
  // }

  // function clientNameFormatter(cell, row, rowIndex, formatExtraData) {
  //   return (
  //     <div className="clientName">
  //       <div className="icon" style={{ backgroundImage: `url(${row.icon})` }}></div>
  //       {cell}
  //     </div>
  //   )
  // }

  // function clientLinkFormatter(cell, row, rowIndex, formatExtraData) {
  //   let links = []
  //   let { type, prefixUrl } = formatExtraData;
  //  
  //   prefixUrl = prefixUrl === "" ? row.id : prefixUrl;
  //   switch (type) {
  //     case "entity":
  //       links.push(<NavLink to={`/${prefixUrl}/entities`} className='badge badge-light'>{cell}</NavLink>)
  //       break;
  //     case "branch":
  //       links.push(<NavLink to={`/${prefixUrl}/branches`} className='badge badge-light'>{cell}</NavLink>)
  //       break;
  //     case "department":
  //       links.push(<NavLink to={`/${prefixUrl}/departments`} className='badge badge-light'>{cell}</NavLink>)
  //       break;
  //     case "batch":
  //       links.push(<NavLink to={`/${prefixUrl}/batches`} className='badge badge-light'>{cell}</NavLink>)
  //       break;
  //     default:
  //       links.push(cell)

  //   }
  //   return <div className="">{links.concat(" ")}</div>
  // }

  getTextFilter(type = "default") {
    return textFilter({
      placeholder: '',
      delay: 1000
    })
  }

  handleError(...err) {
  
    return ToastService.Toast("Somthig went wrong.Please try again later", "default");
  }

  markrangeFormater = (cell, row, rowIndex, formatExtraData) => {
    const { from, to } = cell
    return `${from} - ${to}`;
  }


  actionFormater = (cell, row, rowIndex, formatExtraData) => {
    let links = []
    links.push(<div onClick={() => this.scholasticMarkEdit(`/mark/view/gpa`, row)} className='badge badge-success'>View</div>)
    // links.push(<NavLink to={`/user/${row.uid}/edit/login`} className='badge badge-warning'>Edit</NavLink>)
    links.push(<div onClick={() => this.scholasticMarkEdit(`/mark/edit/gpa`, row)} className='badge badge-warning'>Edit</div>)
    // links.push(<div onClick={() => this.gradeDelete(row)} className='badge badge-danger'>Delete</div>) 
    return <div className="actions">{links.concat(" ")}</div>
  }


  coActionFormater = (cell, row, rowIndex, formatExtraData) => {
    let links = []
    links.push(<div onClick={() => this.scholasticMarkEdit(`/mark/view/cce`, row)} className='badge badge-success'>View</div>)
    // links.push(<NavLink to={`/user/${row.uid}/edit/login`} className='badge badge-warning'>Edit</NavLink>)
    links.push(<div onClick={() => this.scholasticMarkEdit(`/mark/edit/cce`, row)} className='badge badge-warning'>Edit</div>)
    // links.push(<div onClick={() => this.gradeDelete(row)} className='badge badge-danger'>Delete</div>) 
    return <div className="actions">{links.concat(" ")}</div>
  }


  editFun = (url, row) => {
   
    row["isFromView"] = true;
   
    this.props.props.history.push({
      pathname: url,
      state: row
    })
  }

  scholasticMarkEdit = async (url, row) => {
   
    const { clientDetails } = this.props;
    const { mark, name, remarks, studentId } = row;
    await delete row.name;
    await delete row.mark;
    await delete row.remarks;
    await delete row.studentId;
    let tempArr = [];
    tempArr.push({ name, mark, remarks, studentId });

    row["studentList"] = tempArr;
    row["isFromView"] = true;
    let obj = await _.merge(clientDetails, row)

    this.props.props.history.push({
      pathname: url,
      state: obj
    })

  }


  


  render() {
    const { isPageLoading, isLoading, data, columns, coColumns, cdata } = this.state;

    const { form } = this.props;

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
              {form === 'gpa' &&
                <h6> GPA Mark List</h6>
              }
              {form === 'cce' &&
                <h6> Scholastic Mark List</h6>
              }
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
              />
              <br /><br />
              {form === 'cce' &&

                <h6>Co-Scholastic Mark List</h6>
              }
              {form === 'cce' &&
                <BootstrapTable
                  keyField="_id"
                  data={cdata}
                  columns={coColumns}
                  bootstrap4
                  classes="table table-bordered table-hover table-sm"
                  wrapperClasses="table-responsive"
                  filter={filterFactory()}
                  pagination={paginationFactory(options)}
                  noDataIndication={'No data to display here'}
                />
              }


            </div>



          }
        </Fragment>
        }
      </Fragment >
    );
  }
}

