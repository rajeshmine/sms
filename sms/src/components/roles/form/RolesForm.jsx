import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { Form } from 'informed';
import { Col, Row } from 'reactstrap';

import {  addRoles } from 'services/rolesService';
import { Input, CustomSelect } from 'components/common/forms';
import { getselectData } from 'services/userService';
import { getStudentList } from 'services/assignmentService';
import { assignRoles, updateRoles } from 'services/rolesService';
import ToastService from 'services/toastService';

// New Design
import Static from 'services/static';


export default class RolesForm extends Component {
  state = {
    data: { client: "", entity: "", branch: "" },
    clientIds: [], entityIds: [], branchIds: [],
    modulesDiv: false,
    uid: '',
    errors: {},
    isLoading: true,
    rights: {},
    columns: [], columnHeaders: { "keys": [], "def": {} }, sort: [],
    isPageLoading: true,  selected: [],
    userLevels: [{ name: "client" }, { name: "entity" }, { name: "branch" }, { name: "department" }, { name: "batch" }],
    isClient: true, isEntity: true, isBranch: true, isDepartment: true, isBatch: true

  };

  async componentDidMount() {
    const { action } = this.props
    const { data } = this.state
    let Roledata;
    this.selectoptGet(`clients`, "clientIds")
    await this.initTableData()
    await this.feildCheck()
    this.selectoptGet(`clients`, "clientIds")
    this.formApi.setValues(data);

    if (action === "add") {
      Roledata = await this.roleData();
    
      await this.setState({ Roledata, modulesDiv: true })
    }
    if (action === 'edit') {
      this.setState({ isEditForm: true });
      const { location: { state } } = this.props.props;
      if (state !== undefined) {
        await this.formStateCheck(state.Rolesdata);
        
        Roledata = await this.roleData()
        await this.setState({ Roledata, modulesDiv: true, });
      }
    }
    if (action === 'assign') {
      this.setState({ isEditForm: true });
      const { location: { state } } = this.props.props;
      if (state !== undefined) {
        await this.formStateCheck(state.Rolesdata);
       
        Roledata = await this.roleData()
        await this.setState({ Roledata, modulesDiv: false, isPageLoading: false,isLoading:false });
      }
    }

  }

  //New
  getModules(modules) {
    return _.map(_.keys(modules), m => {
      return <div className="modulediv">
        <h6>{m}</h6>
        <div className="module-flexdiv">
          <div>

          </div>
          <div>
            <p>View</p>
          </div>
          <div>
            <p>Edit</p>
          </div>
          <div>
            <p>Create</p>
          </div>
          <div>
            <p>Delete</p>
          </div>
          <div>
            <p>Import</p>
          </div>
          <div>
            <p>Export</p>
          </div>
          <div>
            <p>Assign</p>
          </div>

        </div>
        {_.map(_.keys(modules[m]), sm => {
          let submodules = modules[m];
          let actions = submodules[sm]

          return <div className="module-flexdiv">
            <div>
              {sm}
            </div>
            <div>
              {actions.view !== undefined ? <input type="checkbox" defaultChecked={actions.view.value} onChange={(e) => this.rightsValueChange(e, m, sm, "view")} /> : '-'}
            </div>
            <div>
              {actions.edit !== undefined ? <input type="checkbox" defaultChecked={actions.edit.value} onChange={(e) => this.rightsValueChange(e, m, sm, "edit")} /> : '-'}
            </div>
            <div>
              {actions.create !== undefined ? <input type="checkbox" defaultChecked={actions.create.value} onChange={(e) => this.rightsValueChange(e, m, sm, "create")} /> : '-'}
            </div>
            <div>
              {actions.delete !== undefined ? <input type="checkbox" defaultChecked={actions.delete.value} onChange={(e) => this.rightsValueChange(e, m, sm, "delete")} /> : '-'}
            </div>
            <div>
              {actions.import !== undefined ? <input type="checkbox" defaultChecked={actions.import.value} onChange={(e) => this.rightsValueChange(e, m, sm, "import")} /> : '-'}
            </div>
            <div>
              {actions.export !== undefined ? <input type="checkbox" defaultChecked={actions.export.value} onChange={(e) => this.rightsValueChange(e, m, sm, "export")} /> : '-'}
            </div>
            <div>
              {actions.assign !== undefined ? <input type="checkbox" defaultChecked={actions.assign.value} onChange={(e) => this.rightsValueChange(e, m, sm, "assign")} /> : '-'}
            </div>

          </div>
        })
        }

      </div>
    });

  }



  rightsValueChange = async ({ currentTarget: Input }, m, sm, a) => {
    let { Roledata } = this.state;
   
    let assignArr = Roledata;
    const { checked } = Input;
    if (a !== 'view') {
      if (assignArr[m][sm] && assignArr[m][sm]['view']) {
        assignArr[m][sm]['view'].value = true;
      }
    }

    assignArr[m][sm][a].value = checked;
    await this.setState({ Roledata: assignArr })
   
  }

  feildCheck = async () => {
   
    let { session: { data: sessionData } } = this.props.props;
    const { data } = this.state
    const { userType, userLevel, client, entity, branch,  code, branchId } = sessionData;
    let switchType = '';
    if (userType === 'staff')
      switchType = userLevel;
    else
      switchType = userType;
   
    switch (switchType) {
      case 'sadmin':
        break;
      case 'client':
        data['client'] = client;
        await this.setState({ data, isClient: false })
        await this.clientDatas('client');
        await this.formApi.setValues(data);
        break;
      case 'entity':
      case 'branch':
        data['client'] = client || code;
        data['entity'] = entity || code;
        data['branch'] = branch || branchId;
        await this.setState({ data, isClient: false, isEntity: false, isBranch: false })
        await this.clientDatas('client');
        await this.clientDatas('entity');
        await this.clientDatas('branch');
        await this.formApi.setValues(data);
        break;
      case 'department':
        data['client'] = client || code;
        data['entity'] = entity || code;
        data['branch'] = branch || branchId;

        await this.setState({ data, isClient: false, isEntity: false, isBranch: false, isDepartment: false })
        await this.clientDatas('client');
        await this.clientDatas('entity');
        await this.clientDatas('branch');

        await this.formApi.setValues(data);
        break;
      default:
        data['client'] = client || code;
        data['entity'] = entity || code;
        data['branch'] = branch || branchId;

        await this.setState({ data, isClient: false, isEntity: false, isBranch: false, isDepartment: false, isBatch: false })
        await this.formApi.setValues(data);
        break;
    }
  }



  formStateCheck = async (data) => {

    await this.setState({ data });
    try {
      await this.clientDatas('client');
      await this.clientDatas('entity');
      await this.clientDatas('branch');
      await this.formApi.setValues(data);
    } catch (err) {
      this.handleError(err);
    }
  }

  handleError(...err) {
    return ToastService.Toast("Somthig went wrong.Please try again later", "default");
  }


  handleChange = async ({ currentTarget: Input }) => {
    const { name, value } = Input;
    const { data } = this.state;
    data[name] = value;
    await this.setState({
      [name]: value
    })
    await this.clientDatas(name);
  }

  clientDatas = async (name) => {
    const { data } = this.state;
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
      default:
        break;
    }
  }

  async selectoptGet(url, type) {
    const data = await getselectData(url)
    if (data.data.statusCode === 1) {
      const Datas = data.data.data
      this.setState({ [type]: Datas });
    }
  }

  setFormApi = (formApi) => {
    this.formApi = formApi
  }

  roleData = async () => {
    const { action } = this.props;
    const { location: { state } } = this.props.props;
    let res, modules;

    if (action === 'add') {
      modules = Static.getModules();
      return modules;
    }
    if (action === 'edit') {
      modules = state.Rolesdata;
     
      let delArr = ["client", "createdAt", "entity", "next", "refid", "status", "type", "_id", "branch", "createdBy"];
      await _.forEach(delArr, (delObj) => {
        delete modules[delObj];
      })

      return modules;
    }

    if (action === 'assign') {
      res = state.Rolesdata;
      let data = await getStudentList(`client=${res.client}&entity=${res.entity}&branch=${res.branch}&type=staff`);

      if (data.data.statusCode === 1) {
        let arr = data.data.data;
       
        return arr;
      } else {
        return [];
      }

    }

  }






  initTableData = async () => {
    const columnHeaders = this.getColumnHeaders(this.props.prefixUrl);
    const hideColumns = this.state.hideColumns;
    const columns = this.getColumns('client', columnHeaders, hideColumns);
    await this.setState({ columns, columnHeaders, hideColumns })
  }

  getColumnHeaders(prefixUrl = "", dynamicLabels = {}) {
    const { action } = this.props;
    let allKeys = ["name", "Create", "View", "Edit", "Delete", "Import", "Export", "assignCheckbox", "assignName", "assignType", "assignEmail", "assignUid"];
    let excludeKeys = [];
    switch (action) {
      case "add":
        excludeKeys = ["assignCheckbox", "assignName", "assignType", "assignEmail", "assignUid"];
        break;
      case "edit":
        excludeKeys = ["assignCheckbox", "assignName", "assignType", "assignEmail", "assignUid"];
        break;
      case "assign":
        excludeKeys = ["name", "Create", "View", "Edit", "Delete", "Import", "Export"];
        break;
      default:
        break;
    }

    let keys = _.filter(allKeys, (v) => !_.includes(excludeKeys, v))
    let def = {
      "sno": { dataField: 'sno', isDummyField: true, text: "S.No", formatter: serialNumberFormatter },
      "name": { dataField: 'name', text: `Name`, formatter: clientNameFormatter, filter: getTextFilter(), sort: true },
      "Create": { dataField: 'Create', isDummyField: true, text: "Create", formatter: this.createFormatter },
      "View": { dataField: 'View', isDummyField: true, text: "View", formatter: this.viewFormatter },
      "Edit": { dataField: 'Edit', isDummyField: true, text: "Edit", formatter: this.editFormatter },
      "Delete": { dataField: 'Delete', isDummyField: true, text: "Delete", formatter: this.deleteFormatter },
      "Import": { dataField: 'Import', isDummyField: true, text: "Import", formatter: this.importFormatter },
      "Export": { dataField: 'Export', isDummyField: true, text: "Export", formatter: this.exportFormatter },
      "assignCheckbox": { dataField: 'Export', isDummyField: true, text: "", formatter: this.assignCheckboxFormatter },
      "assignUid": { dataField: 'uid', text: "User ID" },
      "assignName": { dataField: 'name', text: "Name" },
      "assignType": { dataField: 'userType', text: "Type" },
      "assignEmail": { dataField: 'email', text: "Email" },


    }
    return { "keys": keys, "def": def }
  }



  assignCheckboxFormatter = (cell, row, rowIndex, formatExtraData) => {
    const { data } = this.state;
    if (data.type === row.roles) {
      return <input type="checkbox" name="roles" onClick={(e) => this.handleOnSelect(e, row, rowIndex)} defaultChecked="true" />
    } else {
      return <input type="checkbox" name="roles" onClick={(e) => this.handleOnSelect(e, row, rowIndex)} />
    }


  }

  handleOnSelect = async (e, row, rowIndex) => {

    if (e.target.checked) {
      await this.setState(() => ({
        selected: [...this.state.selected, row.uid],

      }));
    } else {
      await this.setState(() => ({
        selected: this.state.selected.filter(x => x !== row.uid),

      }));
    }

  }



  getColumns(type, columnsHeaders, hideColumns = []) {
    let columns = []
    const { keys, def } = columnsHeaders;
    _.forEach(keys, (key) => {
      columns.push({ ...def[key], hidden: _.includes(hideColumns, key) })
    })
    return columns;
  }

  createFormatter = (cell, row, rowIndex, formatExtraData) => {
   
    // if (row.action && row.action.insert === true) {
    return <input type="checkbox" name="insert" defaultChecked={row.action.insert} onClick={(e) => this.createCheck(e, row, rowIndex)} />
    // } else {
    //   return <input type="checkbox" name="insert" onClick={(e) => this.createCheck(e, row, rowIndex)} />
    // }
  }

  viewFormatter = (cell, row, rowIndex, formatExtraData) => {
    if (row.action && row.action.get === true) {
      return <input type="checkbox" name="get" defaultChecked={row.action.insert} checked onClick={(e) => this.createCheck(e, row, rowIndex)} />
    } else {
      return <input type="checkbox" name="get" onClick={(e) => this.createCheck(e, row, rowIndex)} />
    }

  }

  editFormatter = (cell, row, rowIndex, formatExtraData) => {
    if (row.action && row.action.update === true) {
      return <input type="checkbox" name="update" defaultChecked={row.action.update} onClick={(e) => this.createCheck(e, row, rowIndex)} />
    } else {
      return <input type="checkbox" name="update" onClick={(e) => this.createCheck(e, row, rowIndex)} />
    }

  }
  deleteFormatter = (cell, row, rowIndex, formatExtraData) => {
    if (row.action && row.action.delete === true) {
      return <input type="checkbox" name="delete" defaultChecked={row.action.delete} onClick={(e) => this.createCheck(e, row, rowIndex)} />
    } else {
      return <input type="checkbox" name="delete" onClick={(e) => this.createCheck(e, row, rowIndex)} />
    }

  }
  importFormatter = (cell, row, rowIndex, formatExtraData) => {
    if (row.action && row.action.import === true) {
      return <input type="checkbox" name="import" defaultChecked={row.action.import} onClick={(e) => this.createCheck(e, row, rowIndex)} />
    } else {
      return <input type="checkbox" name="import" onClick={(e) => this.createCheck(e, row, rowIndex)} />
    }

  }
  exportFormatter = (cell, row, rowIndex, formatExtraData) => {
    if (row.action && row.action.export === true) {
      return <input type="checkbox" name="export" defaultChecked={row.action.export} onClick={(e) => this.createCheck(e, row, rowIndex)} />
    } else {
      return <input type="checkbox" name="export" onClick={(e) => this.createCheck(e, row, rowIndex)} />
    }

  }

  async createCheck(e, row, rowIndex) {
    const { name, checked } = e.target;
    let { Roledata } = this.state;
    if (Roledata && Roledata[rowIndex]) {
      let action = Roledata[rowIndex].action;
      action[name] = checked
    }

    await this.setState({ Roledata })
  }

  payloadData = (data) => {
    let temp = {};
    _.forEach(data, v => {
      temp[v.name] = [{ action: v.action && v.action }]
    })
    return temp
  }

  onSubmit = async () => {
    const { action } = this.props
    const data = this.formApi.getState().values;
    const { Roledata, selected } = this.state
    
    if (action === 'add') {
      let params = `client=${data.client}&entity=${data.entity}&branch=${data.branch}&type=${data.type}`;
     
      let res = await addRoles(params, Roledata);
      if(res.data.statusCode === 1){
        ToastService.Toast("Success", "default");
        window.location.reload();
      }else{
        ToastService.Toast("Failed", "default");
        window.location.reload();
      }
    }
    if (action === 'edit') {
      let params = `client=${data.client}&entity=${data.entity}&branch=${data.branch}&type=${data.type}&refid=${data._id}`;
      let res = await updateRoles(params, Roledata)
      if(res.data.statusCode === 1){
        ToastService.Toast("Success", "default");
        this.props.props.history.goBack();
      }else{
        ToastService.Toast("Failed", "default");
        this.props.props.history.goBack();
      }
     
    }
   


    if (action === 'assign') {
    
      if (selected.length > 0) {
        _.forEach(selected, async v => {
         
          let obj = {
            "uid": v,
            "roles": data.type,
            "client": data.client,
            "entity": data.entity,
            "branch": data.branch,
            "userLevel": data.userLevel,
          }
          await assignRoles(obj);

        })
        this.props.props.history.goBack();
      } else {
        this.props.props.history.goBack();
      }

    }
  }



  render() {
    const { clientIds, entityIds, branchIds, isPageLoading, isLoading, Roledata, columns,  modulesDiv, userLevels, isClient, isEntity, isBranch} = this.state;
    const { action } = this.props;
    let readOnly = "";
   
    if (action === "assign") {
      readOnly = "readOnly";
    }

    const options = {
      paginationSize: 4,
      pageStartIndex: 1,
      sizePerPage: 50,
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
      <Fragment>

        <Form getApi={this.setFormApi}  >
          {({ formApi, formState }) => (
            <div>

              <section>
                <h6>Roles</h6>
                <Row>
                  {isClient && <Col sm={12} md={3}>
                    <CustomSelect field="client" label="Client*"  name="client" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={clientIds} onChange={this.handleChange} />
                  </Col>}
                  {isEntity &&
                    <Col sm={12} md={3}>
                      <CustomSelect field="entity" label="Entity*"  name="entity" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={entityIds} onChange={this.handleChange} />
                    </Col>}
                  {isBranch &&
                    <Col sm={12} md={3}>
                      <CustomSelect field="branch" label="Branch*"  name="branch" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={branchIds} onChange={this.handleChange} />
                    </Col>}
                  <Col sm={12} md={3}>
                    <Input field="type" label="Enter Name*"  name="type" onChange={this.handleChange} readOnly={readOnly}/>
                  </Col>
                  {action === 'assign' && <Col sm={12} md={3}>
                    <CustomSelect field="userLevel" label="User Level*" name="userLevel" getOptionValue={option => option.name} getOptionLabel={option => option.name} options={userLevels} onChange={this.handleChange} />
                  </Col>}
                </Row>
              </section>
              {modulesDiv &&
                <div>
                  <h6>Modules</h6>
                  {this.getModules(Roledata)}
                </div>
              }
            </div>
          )}
        </Form>
        <br />
        {!isPageLoading && <React.Fragment>
          {!isLoading &&
            <div>
              <BootstrapTable
                keyField="id"
                data={Roledata}
                columns={columns}
                bootstrap4
                classes="table table-bordered table-hover table-sm"
                wrapperClasses="table-responsive"
                filter={filterFactory()}
                pagination={paginationFactory(options)}

              />
            </div>
          }
        </React.Fragment>
        }
       
        <div className="text-right">
                <button type="submit"  onClick={this.onSubmit} className="btn btn-primary btn-sm">Submit</button>
              </div>
      </Fragment>
    );
  }
}
function serialNumberFormatter(cell, row, rowIndex, formatExtraData) {
  return rowIndex + 1
}
function clientNameFormatter(cell, row, rowIndex, formatExtraData) {
  return (
    <div className="clientName">
      <div className="icon" style={{ backgroundImage: `url(${row.icon})` }}></div>
      {cell}
    </div>
  )
}
function getTextFilter(type = "default") {
  return textFilter({
    placeholder: '',
    delay: 1000
  })
}




