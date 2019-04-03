import _ from "lodash";
import React, { Component } from "react";
import update from "react-addons-update";
import BootstrapTable from "react-bootstrap-table-next";
import filterFactory, { textFilter } from "react-bootstrap-table2-filter";
import paginationFactory from "react-bootstrap-table2-paginator";

import {
  Breadcrumb,
  BreadcrumbItem,
  Collapse,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
  Container,
  Row,
  Col,
  Modal,
  ModalBody,
  ModalHeader
} from "reactstrap";
import { CSVLink } from "react-csv";
import { NavLink } from "react-router-dom";
import XlsExport from "xlsexport";
import XLSX from "xlsx";
import ToastService from 'services/toastService'

import Joi from "joi-browser";
import { Form } from "informed";
import { CustomSelect } from "components/common/forms";
import {getselectData,saveUsersExcel,deleteUser} from "services/userService";
 

export default class UserList extends Component {
  state = {
    data: {
      client: "",
      entity: "",
      branch: "",
      department: "",
      batch: ""
    },
    formApiData: {
      client: "",
      entity: "",
      branch: "",
      department: "",
      batch: ""
    },
    columns: [],
    columnHeaders: { keys: [], def: {} },
    hideColumns: [
      "Status",
      "Password",
      "AadharNo",
      "BirthPlace",
      "BloodGroup",
      "Caste",
      "Category",
      "DOB",
      "TemporaryAddress",
      "PermanantAddress",
      "Gender",
      "MotherTongue",
      "Nationality",
      "Religion",
      "RollNo"
    ],
    sort: [],
    isPageLoading: true,
    clientInput: true,
    entityInput: true,
    branchInput: true,
    departmentInput: true,
    batchInput: true,
    isLoading: false,
    modal: false,
    errors: [],
    success: [],
    selected: [],
    exportData: [],
    allKeys: [],
    toggleColumns: false,
    labels: {},
    types: [
      {
        name: "caste",
        _id: "caste"
      },
      {
        name: "category",
        _id: "category"
      },
      {
        name: "department",
        _id: "department"
      },
      {
        name: "language",
        _id: "language"
      },
      {
        name: "religion",
        _id: "religion"
      },
      {
        name: "boardtype",
        _id: "boardtype"
      },
      {
        name: "batch",
        _id: "batch"
      },
      {
        name: "state",
        _id: "state"
      }
    ],
    studentstaffHeaders: "",
    clientIds: [],
    entityIds: [],
    branchIds: [],
    departmentIds: [],
    batchIds: [],
    userTypes: [
      { id: "staff", name: "staff" },
      { id: "student", name: "student" }
    ],
    payloadArray: {},
    userdataArray: [],
    userDetails: []
  };

  constructor(props, context) {
    super(props, context);
    this.bulkModalToggle = this.bulkModalToggle.bind(this);
  }

  schema = {
    client: Joi.string()
      .required()
      .label("Client"),
    entity: Joi.string()
      .required()
      .label("Entity"),
    branch: Joi.string()
      .required()
      .label("Branch"),
    // department: Joi.string().required().label("Department"),
    // batch: Joi.string().required().label("Batch"),
    department: Joi.any().optional(),
    batch: Joi.any().optional(),
    userType: Joi.string()
      .required()
      .label("UserType")
  };

  async componentDidMount() {
    const labels = await this.getDefaultClientLabels();
    const { data, type, rightsData } = this.props;
    await this.initTableData();
    await this.setState({
      rightsData,
      data,
      type,
      labels,
      isPageLoading: false
    });
    const { session } = this.props.props;
    await this.userTypecheckFun(session);
    await this.props.props.isPageLoadingFalse();
  }

  readFile = async e => {
    e.persist();
    this.setState({
      payloadArray: [],
      payloadData: [],
      studentstaffHeaders: ""
    });
    if (e.target.files[0].size <= 2000000) {
      const rABS = true;
      const files = e.target.files;
      const f = files[0];
      const reader = new FileReader();
      reader.onload = async e => {
        var data = e.target.result;
        if (!rABS) data = new Uint8Array(data);
        //  const wb = XLSX.read(data, { type: rABS ? 'binary' : 'array',cellDates: true, dateNF: 'yyyy/mm/dd;@' })
        const wb = XLSX.read(data, {
          type: rABS ? "binary" : "array",
          cellDates: true
        });
        const wsname = wb.SheetNames[1];
        const ws = wb.Sheets[wsname];
        data = XLSX.utils.sheet_to_json(ws, { header: 2 });
        this.setState({
          studentstaffHeaders: data[0]
        });
        const datas = XLSX.utils.sheet_to_json(ws, {
          range: 1,
          header: this.state.studentstaffHeaders
        });
        await this.setState({ ws: datas, file: f });
      };
      if (rABS) reader.readAsBinaryString(f);
      else reader.readAsArrayBuffer(f);
    } else {
      alert("File size can not exceed 2 MB");
    }
  };

  async payloadData() {
    this.setState({ userDetails: [], payloadArray: [], userdataArray: [] });
    const { userType, client, entity, branch, department, batch } = this.state;

    let temp = {
      userType: userType,
      department: department,
      batch: batch,
      entity: entity,
      client: client,
      branch: branch
    };

    if (userType === "staff") {
      var objt = this.state.ws.forEach(item => {
        objt = { ...item, ...this.state.payloadArray };
        temp = {
          userType: userType,
          department: department,
          batch: batch,
          entity: entity,
          client: client,
          branch: branch,
          OfficialMailId: objt.OfficialMailId,
          Designation: objt.Designation
        };
      });
    }

    await this.setState({ payloadArray: temp });

    var mytestarr = [];
    var obj = this.state.ws.forEach(item => {
      obj = { ...item, ...this.state.payloadArray };

      mytestarr.push(obj);

      this.setState({
        merged: mytestarr
      });
    });

    await this.state.merged.forEach((item, index) => {
      this.state.userdataArray.push(item);

      this.sendtoAPI();
    });
  }
  async sendtoAPI() {
    await this.state.userdataArray.map(async item => {
      let result = await saveUsersExcel(item);

      if (result.data.statusCode !== 1)
        return ToastService.Toast(result.data.message,'default');
      ToastService.Toast("Details Uploaded Successfully.", 'default');
      this.bulkModalToggle();
      this.setState({
        userType: "",
        client: "",
        entity: "",
        branch: "",
        department: "",
        batch: ""
      });
    });
    await this.initTableData();
  }

  saveDetails(e) {
    if (this.state.ws) {
      if (this.state.ws.length === 0)
        return ToastService.Toast("You are uploading the empty file!",'default');
      this.payloadData();
    } else {
      return ToastService.Toast("Upload the  file!", 'default');
    }
  }

  initTableData = async () => {
    const { hideColumns } = this.state;
    const columnHeaders = this.getColumnHeaders(
      this.props.type,
      this.props.prefixUrl
    );
    const columns = this.getColumns("client", columnHeaders, hideColumns);
    await this.setState({ columns, columnHeaders, hideColumns });
  };

  isColumnVisible = key => {
    return !_.includes(this.state.hideColumns, key);
  };

  toggleColumn = async i => {
    this.setState({ isLoading: true });
    await this.setState(prevState => {
      let hidden =
        prevState.columns[i] && prevState.columns[i]["hidden"]
          ? prevState.columns[i]["hidden"]
          : false;
      var index = this.state.hideColumns.indexOf(prevState.columns[i]["text"]);
      let hideColumns = this.state.hideColumns;
      if (!hidden) {
        hideColumns.push(prevState.columns[i]["text"]);
      } else {
        if (index !== -1) {
          hideColumns.splice(index, 1);
        }
      }

      return {
        columns: update(this.state.columns, {
          [i]: { hidden: { $set: !hidden } }
        }),
        hideColumns
      };
    });
    this.setState({ isLoading: false });
  };

  handleOnSelect = (row, isSelect) => {
    if (isSelect) {
      this.setState(() => ({
        selected: [...this.state.selected, row.uid],
        exportData: [...this.state.exportData, row]
      }));
    } else {
      this.setState(() => ({
        selected: this.state.selected.filter(x => x !== row.uid),
        exportData: this.state.exportData.filter(x => x !== row)
      }));
    }
  };

  handleOnSelectAll = (isSelect, rows) => {
    const ids = rows.map(r => r.uid);

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
  };

  toggleColumns = () => {
    this.setState({ toggleColumns: !this.state.toggleColumns });
  };

  bulkModalToggle() {
    this.setState({
      modal: !this.state.modal,
      modalsize: "lg"
    });
  }

  async exceltable(format) {
    let d;
    const { exportData } = this.state;
    const { data } = this.props;

    if (
      format === "selecteduserxls" &&
      exportData !== undefined &&
      exportData.length === 0
    )
      d = this.downloadxls(exportData);
    else
      return ToastService.Toast("Please select the columns to download","default");
    if (format === "alluserxls" && data !== undefined && data.length === 0)
      d = this.downloadxls(data);
    else
      return ToastService.Toast("Please select the columns to download","default");

    var xls = new XlsExport(d);
    xls.exportToXLS("UserList.xls");
  }

  downloadxls(data) {
    let dataarr = [];
    if (data.length > 0) {
      for (let item of data) {
        let obj = {
          "User Id": item.uid,
          Password: item.password,
          "Email Id": item.email,
          "Mobile No": item.mobile,
          Title: item.title,
          Name: item.name,
          Gender: item.gender,
          DOB: item.dob,
          BloodGroup: item.bloodGroup,
          MotherTongue: item.motherTongue,
          Caste: item.caste,
          Religion: item.religion,
          "Aadhaar Number": item.aadharNo,
          Nationality: item.nationality,
          Role: item.type
        };
        dataarr.push(obj);
      }
      return dataarr;
    } else {
      return dataarr;
    }
  }

  adduserNavigation() {
    const { parentData } = this.props;
    let url = "";

    parentData && parentData.map(d => (url += d.id + "/"));

    return (
      <NavLink
        className="btn btn-primary btn-sm"
        to={`/${url}user/register/new`}
      >
        + Add User
      </NavLink>
    );
  }

  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name);
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };

  setFormApi = formApi => {
    this.formApi = formApi;
  };

  userTypecheckFun = async data => {
    data = data.data;
    let userType = data.userType;

    switch (userType) {
      case "sadmin":
        try {
          await this.selectoptGet(`clients`, "clientIds");
        } catch (err) {
          this.handleError(err);
        }
        break;
      case "client":
        await this.setState({
          formApiData: { client: data.client },
          clientInput: false
        });
        try {
          await this.clientDatas("client");
        } catch (err) {
          this.handleError(err);
        }
        break;
      case "entity":
        await this.setState({
          formApiData: { client: data.client, entity: data.code },
          clientInput: false,
          entityInput: false
        });
        try {
          await this.clientDatas("entity");
        } catch (err) {
          this.handleError(err);
        }
        break;
      default:
        break;
    }
  };

  clientDatas = async name => {
    // Get the Client,Entity,Branch,Department,Batch,EventName Lists
    const { formApiData } = this.state;

    switch (name) {
      case "client":
        this.selectoptGet(
          `namelist?client=${formApiData.client}&type=client`,
          "entityIds"
        );
        await this.setState({
          entity: "",
          branch: "",
          department: "",
          batch: "",
          branchIds: [],
          departmentIds: [],
          batchIds: []
        });
        break;
      case "entity":
        this.selectoptGet(
          `namelist?client=${formApiData.client}&type=entity&entity=${
          formApiData.entity
          }`,
          "branchIds"
        );
        await this.setState({
          branch: "",
          department: "",
          batch: "",
          departmentIds: [],
          batchIds: []
        });
        break;
      case "branch":
        this.selectoptGet(
          `namelist?client=${formApiData.client}&type=branch&entity=${
          formApiData.entity
          }&branch=${formApiData.branch}`,
          "departmentIds"
        );
        await this.setState({ department: "", batch: "", batchIds: [] });
        break;
      case "department":
        this.selectoptGet(
          `namelist?client=${formApiData.client}&type=department&entity=${
          formApiData.entity
          }&branch=${formApiData.branch}&department=${formApiData.department}`,
          "batchIds"
        );
        await this.setState({ batch: "" });
        break;
      default:
        break;
    }
  };

  async selectoptGet(url, type) {
    const data = await getselectData(url);

    if (data.data.statusCode === 1) {
      const Datas = data.data.data;

      this.setState({ [type]: Datas });
    }
  }

  handleChange = async ({ currentTarget: Input }) => {
    const { name, value } = Input;
    const { formApiData } = this.state;
    formApiData[name] = value;

    await this.setState(
      {
        [name]: value
      },
      () => { }
    );

    this.clientDatas(name);
  };

  previewClient = {
    renderer: row => (
      <div>
        <h6>{row.name}</h6>
        {row.address && <p>{row.address}</p>}
      </div>
    )
  };

  getColumns(type, columnsHeaders, hideColumns) {
    let columns = [];
    const { keys, def } = columnsHeaders;

    _.forEach(keys, key => {
      columns.push({ ...def[key], hidden: _.includes(hideColumns, key) });
    });
    return columns;
  }

  getColumnHeaders(type, prefixUrl = "", dynamicLabels = {}) {
    let labels = dynamicLabels["user"]
      ? dynamicLabels
      : this.getDefaultClientLabels();

    let allKeys = [
      "Client",
      "Entity",
      "Branch",
      "Department",
      "Batch",
      "UserID",
      "Name",
      "Mobile",
      "Email",
      "Status",
      "Password",
      "AadharNo",
      "BirthPlace",
      "BloodGroup",
      "Caste",
      "Category",
      "DOB",
      "TemporaryAddress",
      "PermanantAddress",
      "Gender",
      "MotherTongue",
      "Nationality",
      "Religion",
      "RollNo",
      "actions"
    ];
    let excludeKeys = [];

    switch (type) {
      case "sadmin":
        excludeKeys = [""];
        break;
      case "client":
        excludeKeys = ["Client"];
        break;
      case "entity":
        excludeKeys = ["Client", "Entity"];
        break;
      case "branch":
        excludeKeys = ["Client", "Entity", "Branch"];
        break;
      case "department":
        excludeKeys = ["Client", "Entity", "Branch", "Department"];
        break;
      case "batch":
        excludeKeys = ["Client", "Entity", "Branch", "Department", "Batch"];
        break;
      case "uid":
        excludeKeys = [
          "Client",
          "Entity",
          "Branch",
          "Department",
          "Batch",
          "UserID"
        ];
        break;
      default:
        break;
    }

    let keys = _.filter(allKeys, v => !_.includes(excludeKeys, v));
    let def = {
      sno: {
        dataField: "sno",
        isDummyField: true,
        text: "S.No",
        formatter: this.serialNumberFormatter
      },
      Client: {
        dataField: "clientName",
        text: `${labels["Client"][1]}`,
        filter: this.getTextFilter(),
        sort: true
      },
      Entity: {
        dataField: "entityName",
        text: `${labels["Entity"][1]}`,
        filter: this.getTextFilter(),
        sort: true
      },
      Branch: {
        dataField: "branchName",
        text: `${labels["Branch"][1]}`,
        filter: this.getTextFilter(),
        sort: true
      },
      Department: {
        dataField: "departmentName",
        text: `${labels["Department"][1]}`,
        filter: this.getTextFilter(),
        sort: true
      },
      Batch: {
        dataField: "batch",
        text: `${labels["Batch"][1]}`,
        filter: this.getTextFilter(),
        sort: true
      },
      UserID: {
        dataField: "uid",
        text: `${labels["UserID"][1]}`,
        filter: this.getTextFilter(),
        sort: true
      },
      Name: {
        dataField: "name",
        text: `${labels["Name"][1]}`,
        filter: this.getTextFilter(),
        sort: true
      },
      Mobile: {
        dataField: "mobile",
        text: `${labels["Mobile"][1]}`,
        
        sort: true
      },
      Email: {
        dataField: "email",
        text: `${labels["Email"][1]}`,
        
        sort: true
      },
      Status: {
        dataField: "status",
        text: `${labels["Status"][1]}`,
        
        sort: true
      },
      Password: {
        dataField: "defaultPassword",
        text: `${labels["Password"][1]}`,
        
        sort: true
      },
      AadharNo: {
        dataField: "basic[0].aadharNo",
        text: `${labels["AadharNo"][1]}`,
        
        sort: true
      },
      BirthPlace: {
        dataField: "basic[0].birthPlace",
        text: `${labels["BirthPlace"][1]}`,
        
        sort: true
      },
      BloodGroup: {
        dataField: "basic[0].bloodGroup",
        text: `${labels["BloodGroup"][1]}`,
        
        sort: true
      },
      Caste: {
        dataField: "basic[0].caste",
        text: `${labels["Caste"][1]}`,
      
        sort: true
      },
      Category: {
        dataField: "basic[0].category",
        text: `${labels["Category"][1]}`,
        
        sort: true
      },
      DOB: {
        dataField: "basic[0].dob",
        text: `${labels["DOB"][1]}`,
       
        sort: true
      },
      Gender: {
        dataField: "basic[0].gender",
        text: `${labels["Gender"][1]}`,
        
        sort: true
      },
      MotherTongue: {
        dataField: "basic[0].motherTongue",
        text: `${labels["MotherTongue"][1]}`,
        
        sort: true
      },
      Nationality: {
        dataField: "basic[0].nationality",
        text: `${labels["Nationality"][1]}`,
        
        sort: true
      },
      TemporaryAddress: {
        dataField: "communication[0].primary[0].displayFullAddress",
        text: `${labels["TemporaryAddress"][1]}`,
        
        sort: true
      },
      PermanantAddress: {
        dataField: "communication[0].secondary[0].displayFullAddress",
        text: `${labels["PermanantAddress"][1]}`,
        
        sort: true
      },
      Religion: {
        dataField: "basic[0].religion",
        text: `${labels["Religion"][1]}`,
        
        sort: true
      },
      RollNo: {
        dataField: "basic[0].rollNo",
        text: `${labels["RollNo"][1]}`,
        
        sort: true
      },
      actions: {
        dataField: "actions",
        isDummyField: true,
        text: "Actions",
        formatter: this.actionsFormatter
      }
    };
    return { keys: keys, def: def };
  }

  getDefaultClientLabels() {
    return {
      client: ["client", "client"],
      entity: ["Entity", "Entity"],
      branch: ["branch", "branch"],
      department: ["department", "department"],
      batch: ["batch", "batch"],
      staff:["staff","staff"],
      Client: ["Client", "Client"],
      Entity: ["Entity", "Entity"],
      Branch: ["Branch", "Branch"],
      Department: ["Department", "Department"],
      Batch: ["Batch", "Batch"],
      UserID: ["UserID", "UserID"],
      Name: ["Name", "Name"],
      Mobile: ["Mobile", "Mobile"],
      Email: ["Email", "Email"],
      Status: ["Status", "Status"],
      Password: ["Password", "Password"],
      AadharNo: ["AadharNo", "AadharNo"],
      BirthPlace: ["BirthPlace", "BirthPlace"],
      BloodGroup: ["BloodGroup", "BloodGroup"],
      Caste: ["Caste", "Caste"],
      Category: ["Category", "Category"],
      DOB: ["DOB", "DOB"],
      TemporaryAddress: ["TemporaryAddress", "TemporaryAddress"],
      PermanantAddress: ["PermanantAddress", "PermanantAddress"],
      Gender: ["Gender", "Gender"],
      MotherTongue: ["MotherTongue", "MotherTongue"],
      Nationality: ["Nationality", "Nationality"],
      Religion: ["Religion", "Religion"],
      RollNo: ["RollNo", "RollNo"],
      sadmin: ["All", "All"]
    };
  }

  serialNumberFormatter(cell, row, rowIndex, formatExtraData) {
    return rowIndex + 1;
  }

  getTextFilter(type = "default") {
    return textFilter({
      placeholder: "",
      delay: 1000
    });
  }

  async deleteUserbyId(row, status) {
    const { client, entity, branch, uid } = row;
    let params = `client=${client}&entity=${entity}&branch=${branch}&uid=${uid}&status=${status}`;

    const res = await deleteUser("login", params);

    if (res.status) {
      this.props.checkLoggedIn()
      console.log(this.props)
      
    }
  }

  actionsFormatter = (cell, row, rowIndex, formatExtraData) => {
    const { rightsData } = this.state;
    let _form = "Users";
    let links = [];


    rightsData &&
      rightsData[_form] &&
      rightsData[_form].view.value &&
      links.push(
        <NavLink
          to={`/${row.client}/${row.entity}/${row.branch}/${row.uid}/profile`}
          className="badge badge-success"
        >
          View
          </NavLink>
      );


    
      rightsData &&
        rightsData[_form] &&
        rightsData[_form].edit.value &&
        links.push(
          <NavLink
            to={`/${row.client}/${row.entity}/${row.branch}/${
              row.uid
              }/edit/login`}
            className="badge badge-warning"
          >
            Edit
          </NavLink>
        );
    
    
      rightsData &&
        rightsData[_form] &&
        rightsData[_form].delete.value &&
        row.status === "active"
        ? links.push(
          <div
            onClick={() => this.deleteUserbyId(row, "block")}
            className="badge badge-danger"
          >
            Block
            </div>
        )
        : links.push(
          <div
            onClick={() => this.deleteUserbyId(row, "active")}
            className="badge badge-danger"
          >
            Unblock
            </div>
        );
    

    return <div className="actions">{links.concat(" ")}</div>;
  };

  render() {
    const {
      isPageLoading,
      isLoading,
     
      type,
      labels,
      data,
      columnHeaders: { keys: colKeys, def: colDef },
      columns,
      clientIds,
      entityIds,
      branchIds,
      departmentIds,
      batchIds,
      userTypes,
      clientInput,
      entityInput,
      branchInput,
      departmentInput,
      batchInput,
      rightsData
    } = this.state;
    let _form = "Users";
    const excludeToggleFields = ["sno", "actions"];
    const { parentData } = this.props;
    const selectRow = {
      mode: "checkbox",
      selected: this.state.selected,
      onSelect: this.handleOnSelect,
      onSelectAll: this.handleOnSelectAll,
      bgColor: "#b7e4ff",
      selectionHeaderRenderer: ({ mode, checked, indeterminate, ...rest }) => {
        return (
          <div className="custom-control custom-control-inline mr-0  custom-checkbox">
            <input
              type={mode}
              className="custom-control-input"
              checked={checked}
              indeterminate={indeterminate ? indeterminate.toString() : "false"}
              {...rest}
            />
            <label className="custom-control-label" />
          </div>
        );
      },
      selectionRenderer: ({ mode, ...rest }) => (
        <div className="custom-control custom-control-inline mr-0 custom-checkbox">
          <input type={mode} className="custom-control-input" {...rest} />
          <label className="custom-control-label" />
        </div>
      )
    };

    const options = {
      paginationSize: 4,
      pageStartIndex: 1,
      sizePerPage: 100,
      alwaysShowAllBtns: true,
      hideSizePerPage: true,
      hidePageListOnlyOnePage: true,
      firstPageText: "First",
      prePageText: "Back",
      nextPageText: "Next",
      lastPageText: "Last",
      nextPageTitle: "First page",
      prePageTitle: "Pre page",
      firstPageTitle: "Next page",
      lastPageTitle: "Last page",
      showTotal: true
    };

    return (
      <React.Fragment>
        {!isPageLoading && (
          <React.Fragment>
            <Breadcrumb>
              <BreadcrumbItem>
                <NavLink to="/dashboard">Dashboard</NavLink>
              </BreadcrumbItem>
              {parentData &&
                parentData.map(d => (
                  <BreadcrumbItem>
                    <NavLink to={`/${d.type}/${d.id}`}>{d.id}</NavLink>
                  </BreadcrumbItem>
                ))}
              <BreadcrumbItem active>Users </BreadcrumbItem>
            </Breadcrumb>
            <div className="d-md-flex align-items-md-center justify-content-md-between">
              <h6>Users</h6>
              <div>
                <button
                  className="btn btn-outline-info btn-sm"
                  onClick={this.toggleColumns}
                >
                  Columns
                </button>{" "}
                &nbsp;
                {rightsData &&
                  rightsData[_form] &&
                  rightsData[_form].export.value && (
                    <UncontrolledButtonDropdown>
                      <DropdownToggle
                        caret
                        className="btn btn-outline-secondary btn-sm"
                        style={{ color: "#fff" }}
                      >
                        Download
                      </DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem header>Excel Format</DropdownItem>
                        <DropdownItem
                          onClick={() => {
                            this.exceltable("alluserxls");
                          }}
                        >
                          {labels[type][0]} Users
                        </DropdownItem>
                        <DropdownItem
                          onClick={() => {
                            this.exceltable("selecteduserxls");
                          }}
                        >
                          Selected users
                        </DropdownItem>
                        <DropdownItem divider />
                        <DropdownItem header>CSV Format</DropdownItem>
                        <DropdownItem>
                          <CSVLink
                            data={this.downloadxls(this.props.data)}
                            filename={"User.csv"}
                          >
                            {" "}
                            {labels[type][0]} Users
                          </CSVLink>
                        </DropdownItem>
                        <DropdownItem>
                          <CSVLink
                            data={this.downloadxls(this.state.exportData)}
                            filename={"User.csv"}
                          >
                            Selected Users
                          </CSVLink>
                        </DropdownItem>
                      </DropdownMenu>
                    </UncontrolledButtonDropdown>
                  )}{" "}
                &nbsp;
                {rightsData &&
                  rightsData[_form] &&
                  rightsData[_form].import.value && (
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={this.bulkModalToggle}
                    >
                      Bulk Upload
                    </button>
                  )}{" "}
                &nbsp;
                {rightsData &&
                  rightsData[_form] &&
                  rightsData[_form].create.value &&
                  this.adduserNavigation()}
              </div>
            </div>

            <Collapse isOpen={this.state.toggleColumns}>
              <div className="alert alert-info alert-sm">
                <div className="d-flex align-items-center justify-content-between">
                  <h6>Show/Hide Columns </h6>
                  {/* <button className="btn btn-link btn-sm" onClick={this.initTableData}>Reset to default visible columns</button> */}
                </div>
                {colKeys.map((k, i) => {
                  if (excludeToggleFields.indexOf(k) > -1) return '';

                  return (
                    <div
                      key={`toggle_${k}`}
                      className="custom-control custom-control-inline col-6 col-md-2 custom-checkbox"
                    >
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        checked={this.isColumnVisible(k)}
                        onChange={e => this.toggleColumn(i)}
                        id={`toggle_${k}`}
                      />
                      <label
                        className="custom-control-label"
                        htmlFor={`toggle_${k}`}
                      >
                        {colDef[k]["desc"]
                          ? colDef[k]["desc"]
                          : colDef[k]["text"]}
                      </label>
                    </div>
                  );
                })}
              </div>
            </Collapse>
            {!isLoading && (
              <div>
                <BootstrapTable
                  keyField="uid"
                  data={data}
                  columns={columns}
                  bootstrap4
                  classes="table table-bordered table-hover table-sm"
                  wrapperClasses="table-responsive"
                  filter={filterFactory()}
                  pagination={paginationFactory(options)}
                  selectRow={selectRow}
                  expandRow={this.previewClient}
                  noDataIndication={"No data to display here"}
                />
              </div>
            )}
          </React.Fragment>
        )}
        <Modal
          isOpen={this.state.modal}
          toggle={this.toggle}
          className={this.props.className}
          size={this.state.modalsize}
        >
          <ModalHeader toggle={this.toggle}>Import / Export</ModalHeader>
          <ModalBody>
            <Container>
              <Form
                getApi={this.setFormApi}
                onSubmit={e => this.saveDetails(e)}
              >
                {({ formApi, formState }) => (
                  <div>
                    <section>
                      <h6>User Details</h6>

                      <Row>
                        {clientInput && (
                          <Col sm={12} md={4}>
                            <CustomSelect
                              field="client"
                              label="Client"
                              name="client"
                              getOptionValue={option => option.code}
                              getOptionLabel={option => option.name}
                              options={clientIds}
                              validateOnBlur
                              validate={e => this.validateProperty("client", e)}
                              onChange={this.handleChange}
                            />
                          </Col>
                        )}
                        {entityInput && (
                          <Col sm={12} md={4}>
                            <CustomSelect
                              field="entity"
                              label="Entity"
                              name="entity"
                              getOptionValue={option => option.code}
                              getOptionLabel={option => option.name}
                              options={entityIds}
                              validateOnBlur
                              validate={e => this.validateProperty("entity", e)}
                              onChange={this.handleChange}
                            />
                          </Col>
                        )}
                        {branchInput && (
                          <Col sm={12} md={4}>
                            <CustomSelect
                              field="branch"
                              label="Branch"
                              name="branch"
                              getOptionValue={option => option.code}
                              getOptionLabel={option => option.name}
                              options={branchIds}
                              validateOnBlur
                              validate={e => this.validateProperty("branch", e)}
                              onChange={this.handleChange}
                            />
                          </Col>
                        )}
                        {departmentInput && (
                          <Col sm={12} md={4}>
                            <CustomSelect
                              field="department"
                              label="Department"
                              name="department"
                              getOptionValue={option => option.code}
                              getOptionLabel={option => option.name}
                              options={departmentIds}
                              validateOnBlur
                              validate={e =>
                                this.validateProperty("department", e)
                              }
                              onChange={this.handleChange}
                            />
                          </Col>
                        )}
                        {batchInput && (
                          <Col sm={12} md={4}>
                            <CustomSelect
                              field="batch"
                              label="Batch"
                              name="batch"
                              getOptionValue={option => option.code}
                              getOptionLabel={option => option.name}
                              options={batchIds}
                              validateOnBlur
                              validate={e => this.validateProperty("batch", e)}
                              onChange={this.handleChange}
                            />
                          </Col>
                        )}

                        <Col sm={12} md={4}>
                          <CustomSelect
                            field="userType"
                            label="User Type"
                            name="userType"
                            getOptionValue={option => option.id}
                            getOptionLabel={option => option.name}
                            options={userTypes}
                            validateOnBlur
                            validate={e => this.validateProperty("userType", e)}
                            onChange={this.handleChange}
                          />
                        </Col>

                        <Col sm={6} md={6}>
                          <input
                            id="upload"
                            ref="upload"
                            type="file"
                            onChange={event => {
                              this.readFile(event);
                            }}
                            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                          />
                        </Col>
                        <Row className="justify-content-end">
                          <button
                            type="button"
                            className="btn btn-warning cancel"
                            onClick={this.bulkModalToggle}
                            style={{ marginRight: "20px" }}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="btn btn-primary btn-sm"
                            onSubmit={e => this.saveDetails(e)}
                          >
                            Save
                          </button>
                        </Row>
                      </Row>
                    </section>
                    <br />
                    <section>
                      <h6>Download Formats</h6>
                      <br />

                      <Row>
                        <Col sm={6} md={6}>
                          <div>
                            <a
                              href="./assets/xlsformats/Student-Details.xls"
                              download
                            >
                              Student format{" "}
                            </a>
                          </div>
                          <br />
                        </Col>

                        <Col sm={6} md={6}>
                          <div>
                            <a
                              href="./assets/xlsformats/Staff-Details.xls"
                              download
                            >
                              Staff format{" "}
                            </a>
                          </div>
                        </Col>
                      </Row>
                    </section>
                  </div>
                )}
              </Form>
            </Container>
          </ModalBody>
        </Modal>
      </React.Fragment>
    );
  }
}
