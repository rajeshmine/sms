import Joi from 'joi-browser';
import React, { Fragment, Component } from 'react';
import { Form } from 'informed';
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory from 'react-bootstrap-table2-editor';
import { Container, Row, Col, Modal, ModalBody, ModalHeader } from 'reactstrap';
import XLSX from 'xlsx';
import XlsExport from 'xlsexport';
import _ from 'lodash';

import { getSubjectsList } from 'services/scheduleService';
import { addAssignments, getAssignmentList, getsingleAssignment, editAssignments, getStudentsReport } from 'services/assignmentService';
import { CustomSelect } from 'components/common/forms';
import { getselectData } from 'services/userService'
import ToastService from 'services/toastService'

const columns = [
  { text: "User ID", sort: true, hidden: false, dataField: "uid", style: { width: '50px' } },
  { text: "Name", sort: true, dataField: "name", hidden: false, style: { width: '50px' } },
  { dataField: 'remarks', text: 'Remarks', editable: true, style: { width: '80px' } },
  { dataField: 'mark', text: 'Marks', editable: true, style: { width: '80px' } }
];

const editcolumns = [
  { text: "User ID", sort: true, editable: false, hidden: false, dataField: "studentId", style: { width: '50px' } },
  { dataField: 'remarks', text: 'Remarks', editable: true, style: { width: '80px' } },
  { dataField: 'marks', text: 'Marks', editable: true, style: { width: '80px' } }
]

export default class AddAssignment extends Component {
  constructor(props) {

    super(props)

    this.state = {
      data: {
        students: {}
      },
      isEditForm: false,
      clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [],
      isTableLoading: true,
      studentList: [],
      modal: false,
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
    topic: Joi.string().required().label("Topic"),
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

  bulkModalToggle() {
    this.setState({
      modal: !this.state.modal,
      modalsize: "lg",
    });
  }

  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };

  resetForm = () => {
    this.formApi.reset()
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

  async getAssignmentsList() {
    var assignmentsArray = []
    const { data: { client, branch, entity, department, batch, subject } } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}&departmentId=${department}&batchId=${batch}&subject=${subject}&type=assignment`;
    try {
      const assignmentList = await getAssignmentList(params)
      if (assignmentList.data.statusCode === 1) {
        let assignments = assignmentList.data.data
        for (var i = 0; i < assignments.length; i++) {
          assignmentsArray.push({ 'name': assignments[i].title, 'code': assignments[i]._id })
        }
        await this.setState({
          allAssignments: assignmentsArray
        })
      } else {
        ToastService.Toast("No Assignments Found", 'default');
        window.location.reload()
      }
    } catch (err) {
      this.handleError(err);
    }
  }

  async  particularAssignment() {
    const { data: { client, branch, entity, topic } } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}&type=assignment&title=${topic}`
    const particularDetails = await getsingleAssignment(params)
    console.log(particularDetails)
    if (particularDetails.data.statusCode === 1) {
      var assId = particularDetails.data.data[0]._id
      var assMark = particularDetails.data.data[0].assignment[0].mark
      await this.setState({
        assignmentId: assId,
        assignmentMark: assMark
      })
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
        await this.setState({ department: "", batch: "", departmentIds: [] })
        break;
      case "department":
        this.selectoptGet(`namelist?client=${data.client}&type=department&entity=${data.entity}&branch=${data.branch}&department=${data.department}`, "batchIds")
        await this.setState({ batch: "", batchIds: [] })
        break;
      case "batch":
        this.getSubjects();
        break;
      case "subject":
        this.getAssignmentsList()
        break;
      case "topic":
        this.particularAssignment();
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
      this.handleError(err);
    }
  }

  setFormApi = (formApi) => {
    this.formApi = formApi;
  }

  // Get Student List
  getStudentList = async () => {
    var studentList = []
    this.tableHide()
    const { data: { client, branch, entity, department, batch } } = this.state
    const { assignmentId } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}&department=${department}&batch=${batch}&id=${assignmentId}&type=assignmentReport`
    try {
      const res = await getStudentsReport(params);
      if (res.data.statusCode === 1) {
        var test = res.data.data
        for (var i = 0; i < test.length; i++) {
          studentList.push({ "name": test[i].name, "uid": test[i].studentId, "remarks": "", "mark": "" })
        }
        await this.setState({ studentList, isTableLoading: false })
      } else if (res.data.statusCode === 0) {
        await this.setState({ studentList: [], isTableLoading: false })
      }
      if (res.data.statusCode !== 1) return ToastService.Toast('No Students Found', 'default');
    } catch (err) {
      this.handleError(err);
    }
  }

  handleError(...err) {
    return ToastService.Toast("Something went wrong.Please try again later", 'default');
  }

  actionsFormatter = (cell, row, rowIndex, formatExtraData) => {
    let links = []
    // links.push(<div className='badge badge-success'>View</div>);
    links.push(<div className='badge badge-warning'>Edit</div>);
    return <div className="actions">{links.concat(" ")}</div>
  }

  handleSubmit = async () => {
    this.getStudentList();
  }

  tableHide() {
    this.setState({ isTableLoading: true })
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
        //  const wb = XLSX.read(data, { type: rABS ? 'binary' : 'array',cellDates: true, dateNF: 'yyyy/mm/dd;@' })     
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


  downloaddata = async () => {
    const { studentList } = this.state
    console.log(studentList)
    let dataarr = []
    if (studentList && studentList.length > 0) {
      for (let item of studentList) {
        let obj = {
          "UserID": item.uid, "StudentName": item.name, "Status": "", "Marks": item.mark, "Remarks": item.remarks
        }
        dataarr.push(obj)
      }
      var xls = new XlsExport(dataarr)
      xls.exportToXLS('Assignment.xls')
    }
  }

  saveDetails(e) {
    if (this.state.ws) {
      if (this.state.ws.length === 0) return ToastService.Toast("You are uploading the empty file!", 'default');
      this.payloadData(this.state.ws);
    } else {
      return ToastService.Toast("Upload the  file!", 'default');
    }
  }

  async payloadData(data) {
    this.setState({ userDetails: [], payloadArray: [], userdataArray: [] })
    const formdata = this.formApi.getState().values
    let tempdata = [];

    await _.map(data).forEach(async (item) => {
      const { UserID, Status, Marks, Remarks } = item;
      console.log(UserID, Status, Marks, Remarks)
      if (Status && Marks && Remarks && UserID) {
        console.log("df")
        var postUser = UserID.toString();
        tempdata.push({ "uid": postUser, "status": Status, "mark": Marks, "remarks": Remarks })

        console.log(tempdata)
      }
    });
   
    let temp = {
      "date": this.state.todayDate,
      "batch": formdata.batch,
      "department": formdata.department,
      "assignmentId": this.state.assignmentId,
      "client": formdata.client,
      "entity": formdata.entity,
      "branch": formdata.branch,
      "subject": formdata.subject,
      "topic": formdata.topic,
      "totalMark": this.state.assignmentMark,
      "students": tempdata
    }
    console.log(temp)
    const addedDetails = await addAssignments(temp)
    if (addedDetails.data.statusCode === 1) {
      ToastService.Toast(addedDetails.data.Message, 'default');
      this.props.props.history.push(`/assignments/assignment`)
    }
  }

  checkRemarks(data) {
    for (var i = 0; i < data.length; i++) {
      if (data[i].mark === '') return ToastService.Toast("Fill the Marks", 'default');
    }
    this.assignmentReport(data)
  }

  onSubmit() {
    this.checkRemarks(this.state.studentList);
  }


  async  assignmentReport(data = []) {
    const formdata = this.formApi.getState().values
    let temp = [];
    await _.map(data).forEach(async (item) => {
      const { uid, remarks, mark } = item;
      temp.push({ uid, remarks, status: "Completed", mark })
    });
    if (data.length !== 0) {
      let obj = {
        "date": this.state.todayDate,
        "batch": formdata.batch,
        "department": formdata.department,
        "assignmentId": this.state.assignmentId,
        "client": formdata.client,
        "entity": formdata.entity,
        "branch": formdata.branch,
        "subject": formdata.subject,
        "topic": formdata.topic,
        "totalMark": this.state.assignmentMark,
        "students": temp
      }
      const addedDetails = await addAssignments(obj)
      if (addedDetails.data.statusCode === 1) {
        ToastService.Toast(addedDetails.data.Message, 'default');
      }
    }
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
        "assignmentId": this.state.assignmentId,
        "client": formdata.client,
        "entity": formdata.entity,
        "branch": formdata.branch,
        "subject": formdata.subject,
        "topic": formdata.topic,
        "totalMark": this.state.assignmentMark,
        "students": [{ uid: basicData.studentId, remarks: changedData.remarks, status: "Completed", mark: changedData.marks }]
      }
      const updateDetails = await editAssignments(edittemp)
      if (updateDetails.data.statusCode === 1) {
        ToastService.Toast(updateDetails.data.Message, 'default');
        this.props.props.history.push(`/assignments/assignment`)
      }
    }
  }

  oneditSubmit() {
    if (this.state.storeStudentMarks !== undefined) {
      this.updateAssignment(this.state.storeStudentMarks)
    } else {
      return ToastService.Toast("None of the feilds edited", 'default');
    }
  }

  async storeDetails(data) {
    await this.setState({
      storeStudentMarks: data
    })
  }

  render() {
    const cellEdit = cellEditFactory({
      mode: 'click',
      blurToSave: true,
      afterSaveCell: (oldValue, newValue, row, column) => {
        this.storeDetails(row)

      }
    });

    const { action, type } = this.props

    var editarray = []
    const { clientIds, entityIds, branchIds, departmentIds, batchIds, studentList, isTableLoading, editValues, isClient, isEntity, isBranch, isDepartment, isBatch } = this.state;
    editarray.push(editValues)
    return (
      <Fragment>
        <h6>{action} {type} Details</h6>
        <Form getApi={this.setFormApi} onSubmit={this.handleSubmit} >
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
                    <CustomSelect field="topic" label="Assignments*" name="topic" getOptionValue={option => option.name} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('topic', e)}
                      options={this.state.allAssignments} onChange={this.handleChange} />
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
          !isTableLoading && this.state.topic && studentList.length > 0 ?
            <section>
              <Form>
                <Row>
                  <Col sm={12} md={6}>
                    <h6>Instructions</h6>
                    <div style={{ fontSize: "12px" }}>
                      <p>1. Click on the Marks Column to enter the Assignment Marks</p>
                      <p>2. Click on the Remarks Column to give the remark for the Student(Optional)</p>
                    </div>
                  </Col>
                  <Col sm={12} md={6} style={{ textAlign: 'right' }}>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => this.bulkModalToggle()}>Bulk Upload</button> &nbsp;
									</Col>
                </Row>
              </Form>
              <br />
              <div>
                {!isTableLoading &&
                  <BootstrapTable
                    keyField="uid"
                    data={this.state.studentList}
                    columns={columns}
                    bootstrap4
                    classes="table table-bordered table-hover table-sm"
                    wrapperClasses="table-responsive"
                    // filter={filterFactory()}
                    // pagination={paginationFactory(options)}

                    cellEdit={cellEdit}
                  />}
              </div>
              <Row>
                <Col md={12} className="d-flex justify-content-end">
                  <button type="submit" onClick={() => this.onSubmit()} className="btn btn-primary btn-sm">Submit</button>
                </Col>
              </Row>
            </section>
            : null
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
                    <h6>Assignment Status</h6>
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
                          {/* <a href="../../assets/xlsformats/Assignment-List.xls" download>Assignment Lists </a> */}
                          <p onClick={() => this.downloaddata()}>Assignment Lists</p>
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