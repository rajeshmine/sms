import React, { Fragment, Component } from 'react';
import _ from 'lodash';
import { Form } from 'informed';
import Joi from 'joi-browser';
import XLSX from 'xlsx';
import XlsExport from 'xlsexport';

import cellEditFactory from 'react-bootstrap-table2-editor';
import { CustomSelect } from 'components/common/forms';
import BootstrapTable from 'react-bootstrap-table-next';
import { Row, Col, Modal, ModalBody, ModalHeader, Container } from 'reactstrap';

import { editHomeworks, addHomeworks, getAssignmentList, getsingleAssignment, getStudentsReport } from 'services/assignmentService';
import { getselectData } from 'services/userService'
import { getSubjectsList } from 'services/scheduleService';
import ToastService from 'services/toastService'

const columns = [
  { text: "User ID", sort: true, hidden: false, dataField: "uid", style: { width: '50px' } },
  { text: "Name", sort: true, dataField: "name", hidden: false, style: { width: '50px' } },
  { text: 'Remarks', dataField: 'remarks', editable: true, style: { width: '80px' } }
];

const editcolumns = [
  { text: "User ID", sort: true, editable: false, hidden: false, dataField: "studentId", style: { width: '50px' } },
  { dataField: 'remarks', text: 'Remarks', editable: true, style: { width: '80px' } },

]
export default class AddHomework extends Component {
  constructor(props) {
    super(props)

    this.state = {
     
      data: {
        department: '',
        batch: '',
        subject: ''
      },  
      clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [], studentList: [],     
      exportData: [],
      selected: [],
      modal: false,
      isTableLoading: true,
      isClient: true, isEntity: true, isBranch: true, isDepartment: true, isBatch: true
    }
  }

  schema = {
    department: Joi.string().required().label("Department"),
    client: Joi.string().required().label("Client"),
    entity: Joi.string().required().label("Entity"),
    branch: Joi.string().required().label("Branch"),
    batch: Joi.string().required().label("Batch"),
    subject: Joi.string().required().label("Subject"),
    homeworks: Joi.string().required().label("Topic"),
    // dob: Joi.string().required()
  };

  async componentDidMount() {

    const { data } = this.state
    var todayDate = new Date().toISOString().slice(0, 10);

    await this.setState({
      todayDate: todayDate
    })
    const { action } = this.props
    this.selectoptGet(`clients`, "clientIds")
    await this.feildCheck()
    this.formApi.setValues(data);

    if (action === "edit") {
      this.setState({ isEditForm: true });
      const { location: { state: { row, details } } } = this.props.props;
      var test = Object.assign(row, details);
      if (test !== undefined) { }
      return this.formStateCheck(test);
    }
  }


  feildCheck = async () => {
    let { session: { data: sessionData } } = this.props.props;
    const { data } = this.state
    const { userType, userLevel, client, entity, branch, department, batch, code, branchId, departmentId, batchId } = sessionData;
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
        data['department'] = department || departmentId;
        await this.setState({ data, isClient: false, isEntity: false, isBranch: false, isDepartment: false })
        await this.clientDatas('client');
        await this.clientDatas('entity');
        await this.clientDatas('branch');
        await this.clientDatas('department');
        await this.formApi.setValues(data);
        break;
      default:
        data['client'] = client || code;
        data['entity'] = entity || code;
        data['branch'] = branch || branchId;
        data['department'] = department || departmentId;
        data['batch'] = batch || batchId;
        await this.setState({ data, isClient: false, isEntity: false, isBranch: false, isDepartment: false, isBatch: false })
        await this.formApi.setValues(data);
        break;
    }
  }

  formStateCheck = async (data) => {
    await this.setState({
      editValues: data
    })
    data.homeworks = data.topic
    await this.setState({ data: data });
    try {
      await this.clientDatas('client');
      await this.clientDatas('entity');
      await this.clientDatas('branch');
      await this.clientDatas('department');
      await this.clientDatas('batch');
      await this.clientDatas('subject');
      await this.clientDatas('topic');
      await this.formApi.setValues(data);
    } catch (err) {
      this.handleError(err);
    }
  }

  handleError(...err) {
    return ToastService.Toast("Something went Wrong.Please try again later",  'default');
  }

  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };

  resetForm = () => {
    this.formApi.reset()
  }

  tableHide() {
    this.setState({ isTableLoading: true })
  }

  setFormApi = (formApi) => {
    this.formApi = formApi;
  }

  async  getSubjects() {
    var subjectsArray = []
    const { data: { client, batch, entity, department, branch } } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}&type=subject&departmentId=${department}&batchId=${batch}`
    try {
      const subjectList = await getSubjectsList(params)
      if (subjectList.data.statusCode === 1) {
        let subjects = subjectList.data.data
        for (var i = 0; i < subjects.length; i++) {
          subjectsArray.push({ 'name': subjects[i].displayName, 'code': subjects[i].code })
        }
        this.setState({
          allSubjects: subjectsArray
        })
      } else {
        ToastService.Toast("Subjects not found", "default");
        this.setState({
          allSubjects: []
        })
      }
    } catch (err) {
      this.handleError(err);
    }
  }

  async getHomeworksList() {
    var homeworksArray = []
    const { data: { client, branch, entity, department, batch, subject } } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}&departmentId=${department}&batchId=${batch}&subject=${subject}&type=homework`
    const homeworkList = await getAssignmentList(params)
    if (homeworkList.data.statusCode === 1) {
      let homeworks = homeworkList.data.data
      for (var i = 0; i < homeworks.length; i++) {
        homeworksArray.push({ 'name': homeworks[i].title, 'code': homeworks[i]._id })
      }
      this.setState({
        allHomeworks: homeworksArray
      })
    } else {
      return ToastService.Toast("No Homeworks Found",  'default');
    }
  }

  async  particularHomework() {
    const { data: { client, branch, entity, homeworks } } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}&type=homework&title=${homeworks}`
    const particularDetails = await getsingleAssignment(params)
    if (particularDetails.data.statusCode === 1) {
      var hwId = particularDetails.data.data[0]._id
      this.setState({ homeworkId: hwId })
    } else {
      return ToastService.Toast("No Details  Found",  'default');
    }
  }

  handleChange = async ({ currentTarget: Input }) => {
    this.tableHide()
    const { name, value } = Input;
    const { data } = this.state;
    data[name] = value;
    this.setState({
      [name]: value
    })
    await this.clientDatas(name);
  }


  clientDatas = async (name) => { // Get the Client,Entity,Branch,Department,Batch,EventName Lists
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
      case "department":
        this.selectoptGet(`namelist?client=${data.client}&type=department&entity=${data.entity}&branch=${data.branch}&department=${data.department}`, "batchIds")
        await this.setState({ batch: "" })
        break;
      case "batch":
        this.getSubjects()
        break;
      case "subject":
        this.getHomeworksList()
        break;
      case "homeworks":
        this.particularHomework();
        break;
      default: break;
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
    this.formApi = formApi;
  }

  async  homeworkReport(data = []) {
    const formdata = this.formApi.getState().values
    let temp = [];
    await _.map(data).forEach(async (item) => {
      const { uid, remarks } = item;
      temp.push({ uid, remarks, status: "Completed" })
    });

    if (data.length !== 0) {
      let obj = {
        "date": this.state.todayDate,
        "batch": formdata.batch,
        "department": formdata.department,
        "homeworkId": this.state.homeworkId,
        "client": formdata.client,
        "entity": formdata.entity,
        "branch": formdata.branch,
        "subject": formdata.subject,
        "topic": formdata.homeworks,
        "students": temp
      }

      const addedDetails = await addHomeworks(obj)
      if (addedDetails.data.statusCode === 1) {
        ToastService.Toast(addedDetails.data.Message,'default');
      }
    }
  }

  oneditSubmit() {
    if (this.state.storeStudentMarks !== undefined) {
      this.updateAssignment(this.state.storeStudentMarks)
    } else {
      return ToastService.Toast("None of the feilds edited",'default');
    }
  }

  async storeDetails(data) {
    await this.setState({
      storeStudentMarks: data
    })
  }

  async updateAssignment(data) {
    const formdata = this.formApi.getState().values
    let basicData = this.props.props.location.state.row
    if (this.state.storeStudentMarks !== undefined) {
      var changedData = this.state.storeStudentMarks

      let edittemp = {
        "date": this.state.todayDate,
        "batch": formdata.batch,
        "department": formdata.department,
        "homeworkId": changedData.ID,
        "client": formdata.client,
        "entity": formdata.entity,
        "branch": formdata.branch,
        "subject": formdata.subject,
        "topic": formdata.topic,
        "students": [{ uid: basicData.studentId, remarks: changedData.remarks, status: "Completed" }]
      }

      const updateDetails = await editHomeworks(edittemp)
      if (updateDetails.data.statusCode === 1) {
        ToastService.Toast(updateDetails.data.Message, 'default');
        this.props.props.history.push(`/assignments/homework`)
      }
    }
  }

  handleOnSelect = (row, isSelect) => {
    if (isSelect) {
      this.setState(() => ({
        selected: [...this.state.selected, row.uid],
        exportData: [...this.state.exportData, row],
      }));
    } else {
      this.setState(() => ({
        selected: this.state.selected.filter(x => x !== row.uid),
        exportData: this.state.exportData.filter(x => x !== row),
      }));
    }
  }

  handleOnSelectAll = (isSelect, rows) => {
    const ids = rows.map(r => r.uid);
    if (isSelect) {
      this.setState({
        selected: ids,
        exportData: rows
      });
    } else {
      this.setState({
        selected: [],
        exportData: []
      });
    }
  }


  checkRemarks(data) {
    if (data.length === 0) return ToastService.Toast("Fill the Status",  'default')
    for (var i = 0; i < data.length; i++) {
      if (data[i].remarks === '') return ToastService.Toast("Fill the Remarks", 'default');
    }
    this.homeworkReport(this.state.exportData)
  }

  bulkModalToggle() {
    this.setState({
      modal: !this.state.modal,
      modalsize: "lg",
    });
  }

  onSubmit() {
    this.checkRemarks(this.state.exportData);
  }

  getStudentList = async () => {
    var studentList = []
    const { data: { client, branch, entity, department, batch } } = this.state
    const { homeworkId } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}&department=${department}&batch=${batch}&id=${homeworkId}&type=homeWorkReport`
    const res = await getStudentsReport(params);
    if (res.data.statusCode === 1) {
      var test = res.data.data
      for (var i = 0; i < test.length; i++) {       
        studentList.push({ "name": test[i].name, "uid": test[i].studentId, "remarks": "", "mark": "" })
      }
      this.setState({ studentList, isTableLoading: false })
    } else if (res.data.statusCode === 0) {
      this.setState({ studentList: [], isTableLoading: false })
      return ToastService.Toast(res.data.Message,  'default');
    }
    if (res.data.statusCode !== 1) return ToastService.Toast(res.data.message,  'default');

  }

  handleSubmit = async () => {
    this.tableHide()
    this.getStudentList()
  }

  readFile = async (e) => {
    e.persist();
    this.setState({ payloadArray: [], payloadData: [], studentstaffHeaders: '' })
    if (e.target.files[0].size <= 2000000) {
      const rABS = true;
      const files = e.target.files;
      const f = files[0];
      const reader = new FileReader();
      reader.onload = async (e) => {
        var data = e.target.result;
        if (!rABS) data = new Uint8Array(data);           
        const wb = XLSX.read(data, { type: rABS ? 'binary' : 'array', cellDates: true })
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        this.setState({
          studentstaffHeaders: data[0]
        })
        const datas = XLSX.utils.sheet_to_json(ws, { range: 1, header: this.state.studentstaffHeaders });
        await this.setState({ ws: datas, file: f });
        console.log(this.state.ws)
      };
      if (rABS) reader.readAsBinaryString(f); else reader.readAsArrayBuffer(f);
    } else {
      alert("File size can not exceed 2 MB");
    }
  }

  saveDetails(e) {
    if (this.state.ws) {
      if (this.state.ws.length === 0) return ToastService.Toast("You are uploading the empty file!",  'default');
      this.payloadData(this.state.ws);
    } else {
      return ToastService.Toast("Upload the  file!",  'default');
    }
  }

  async payloadData(data) {
    this.setState({ userDetails: [], payloadArray: [], userdataArray: [] })
    const formdata = this.formApi.getState().values
    let tempdata = [];
    await _.map(data).forEach(async (item) => {
      const { UserID, Status, Remarks } = item;      
      if (Status && Remarks && UserID) {        
        var postUser = UserID.toString();
        tempdata.push({ "uid": postUser, "status": Status, "remarks": Remarks })        
      }
    });

    let temp = {
      "date": this.state.todayDate,
      "batch": formdata.batch,
      "department": formdata.department,
      "homeworkId": this.state.homeworkId,
      "client": formdata.client,
      "entity": formdata.entity,
      "branch": formdata.branch,
      "subject": formdata.subject,
      "topic": formdata.homeworks,
      "students": tempdata
    }
  
    const addedDetails = await addHomeworks(temp)
    if (addedDetails.data.statusCode === 1) {
      ToastService.Toast(addedDetails.data.Message, 'default');
      this.props.props.history.push(`/assignments/homework`)
    }
  }

  
  downloaddata = async () => {
    const { studentList } = this.state
    console.log(studentList)
    let dataarr = []
    if (studentList && studentList.length > 0) {
      for (let item of studentList) {
        let obj = {
          "UserID": item.uid, "StudentName": item.name, "Status": "", "Remarks": item.remarks
        }
        dataarr.push(obj)
      }
      var xls = new XlsExport(dataarr)
      xls.exportToXLS('Homework.xls')
    }
  }

  render() {
    const cellEdit = cellEditFactory({
      mode: 'click',
      blurToSave: true,
      afterSaveCell: (oldValue, newValue, row, column) => {
        this.storeDetails(row)
      }
    });

    const selectedRow = {
      mode: 'checkbox',    
      clickToExpand: true,
      selected: this.state.selected,
      onSelect: this.handleOnSelect,
      onSelectAll: this.handleOnSelectAll,
      bgColor: '#b7e4ff',
      selectionHeaderRenderer: ({ mode, checked, indeterminate, ...rest }) => {
        return (
          <div className="custom-control custom-control-inline mr-0  custom-checkbox">
            <input type={mode} className="custom-control-input" checked={checked} indeterminate={indeterminate ? indeterminate.toString() : "false"} {...rest} />
            <label className="custom-control-label"></label>
          </div>
        )
      },
      selectionRenderer: ({ mode, ...rest }) => (
        <div className="custom-control custom-control-inline mr-0 custom-checkbox">
          <input type={mode} className="custom-control-input" {...rest} />
          <label className="custom-control-label"></label>
        </div>
      )
    }
    var editarray = []
    const { action, type } = this.props
    const { clientIds, entityIds, branchIds, departmentIds, batchIds, studentList, isTableLoading, editValues,isClient, isEntity, isBranch, isDepartment, isBatch} = this.state;
    editarray.push(editValues)
 
    return (
      <Fragment>
        <h6>{action} {type} Status</h6>
        <Form getApi={this.setFormApi} onSubmit={this.handleSubmit}  >
          {({ formApi, formState }) => (
            <div>
              <section>
                <Row>
                  {isClient &&
                    <Col sm={6} md={3}>
                      <CustomSelect field="client" label="Client*" name="client" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('client', e)} onChange={this.handleChange} options={clientIds} />
                    </Col>}
                  {isEntity &&
                    <Col sm={6} md={3}>
                      <CustomSelect field="entity" label="Entity*" name="entity" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('entity', e)} onChange={this.handleChange} options={entityIds} />
                    </Col>}
                  {isBranch &&
                    <Col sm={6} md={3}>
                      <CustomSelect field="branch" label="Branch*" name="branch" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('branch', e)} onChange={this.handleChange} options={branchIds} />
                    </Col>}
                  {isDepartment &&
                    <Col sm={6} md={3}>
                      <CustomSelect field="department" label="Department*" name="department" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={departmentIds} validateOnBlur validate={e => this.validateProperty('department', e)} onChange={this.handleChange} />
                    </Col>}
                </Row>
                <Row>
                  {isBatch &&
                    <Col sm={6} md={3}>
                      <CustomSelect field="batch" label="Batch*" name="batch" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={batchIds} validateOnBlur validate={e => this.validateProperty('batch', e)} onChange={this.handleChange} />
                    </Col>}
                  <Col sm={6} md={3}>
                    <CustomSelect field="subject" label="Subject*" name="subject" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={this.state.allSubjects} validateOnBlur validate={e => this.validateProperty('subject', e)} onChange={this.handleChange} />
                  </Col>
                  <Col sm={6} md={3}>
                    <CustomSelect field="homeworks" label="Homeworks*" name="homeworks" getOptionValue={option => option.id} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('homeworks', e)}
                      options={this.state.allHomeworks} onChange={this.handleChange} />
                  </Col>
                </Row>

                {
                  action === 'add' &&
                  <div className="text-right">
                    <button type="submit" className="btn btn-primary btn-sm">Submit</button>
                  </div>
                }
              </section>
            </div>
          )}

        </Form>
        {          
          !isTableLoading && studentList.length > 0 &&
          <section>
            <Form>
              <Row>
                <Col sm={12} md={6}>
                  <h6>Instructions</h6>
                  <div style={{ fontSize: "12px" }}>
                    <p>1. Click on the Marks Column to enter the Assignment Marks</p>
                    <p>2. Click on the Remarks Column to give the remark for the Student(Optional)</p>
                    <p>3. Use the Checkbox to fill the status of Completion</p>
                    <Row>
                      <Col sm={12} md={6}>
                        <div className="custom-control custom-control-inline mr-0  custom-checkbox">
                          <input type="checkbox" className="custom-control-input" />
                          <label className="custom-control-label"> Not Completed</label>
                        </div>

                      </Col>
                      <Col sm={12} md={6}>
                        <div className="custom-control custom-control-inline mr-0  custom-checkbox">
                          <input type="checkbox" className="custom-control-input" checked={true} />
                          <label className="custom-control-label">Completed</label>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Col>
                <Col sm={12} md={6} style={{ textAlign: 'right' }}>
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => this.bulkModalToggle()}>Bulk Upload</button> &nbsp;
									</Col>
              </Row>

            </Form>
            <br />
            <div>
              {
                studentList.length > 0 &&
                <BootstrapTable
                  keyField="uid"
                  data={this.state.studentList}
                  columns={columns}
                  bootstrap4
                  classes="table table-bordered table-hover table-sm"
                  wrapperClasses="table-responsive"
                  // filter={filterFactory()}
                  // pagination={paginationFactory(options)}
                  selectRow={selectedRow}
                  cellEdit={cellEdit}
                />
              }

            </div>
            <Row>
              <Col md={12} className="d-flex justify-content-end">
                <button type="submit" onClick={() => this.onSubmit()} className="btn btn-primary btn-sm">Submit</button>
              </Col>
            </Row>
          </section>
          // : null
        }

        {
          action === 'edit' && editValues ?
            <section>
              <BootstrapTable
                keyField="uid"
                data={editarray}
                columns={editcolumns}
                bootstrap4
                classes="table table-bordered table-hover table-sm"
                wrapperClasses="table-responsive"
                // filter={filterFactory()}
                // pagination={paginationFactory(options)}
                // selectRow={selectedRow}
                cellEdit={cellEdit}
              />
              <Row>
                <Col md={12} className="d-flex justify-content-end">
                  <button type="submit" onClick={() => this.oneditSubmit()} className="btn btn-primary btn-sm">Subdmit</button>
                </Col>
              </Row>

            </section>
            : ''
        }

        <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className} size={this.state.modalsize}>
          <ModalHeader toggle={this.toggle}>Import / Export</ModalHeader>
          <ModalBody>
            <Container>
              <Form onSubmit={(e) => this.saveDetails(e)}>
                <div>
                  <section>
                    <h6>Home Work Status</h6>
                    <Row>
                      <Col sm={6} md={6} >
                        <input id="upload" ref="upload" type="file" onChange={(event) => { this.readFile(event) }} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
                      </Col>
                      <Row className="justify-content-end" >
                        <button type="button" className="btn btn-warning cancel" onClick={() => this.bulkModalToggle()} style={{ marginRight: '20px' }} >Cancel</button>
                        <button type="submit" className="btn btn-primary btn-sm" onSubmit={(e) => this.saveDetails(e)} >Save</button>
                      </Row>
                    </Row>
                  </section><br />
                  <section>
                    <h6>Download Format</h6><br />
                    <Row>
                      <Col sm={6} md={6} >
                        <div >
                          {/* <a href="../../assets/xlsformats/Homework-List.xls" download>HomeWork Lists </a> */}
                          <p onClick={() => this.downloaddata()}>HomeWork Lists</p>
                        </div>
                      </Col>
                    </Row>
                  </section>
                </div>

              </Form>
            </Container>
          </ModalBody>
        </Modal>
      </Fragment >
    )
  }
}