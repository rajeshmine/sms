import Joi from 'joi-browser';
import React, { Fragment, Component } from 'react';
import { Form } from 'informed';
import { getAssignmentList, getsingleAssignment, getStudentList, viewAssignmentReport } from 'services/assignmentService';
import { getSubjectsList } from 'services/scheduleService';
import { CustomSelect } from 'components/common/forms';
import { getselectData } from 'services/userService'

import ReportList from 'components/reports/list'
import { Row, Col } from 'reactstrap';
import _ from 'lodash';
import ToastService from 'services/toastService';

export default class AssignmentReport extends Component {
  constructor(props) {

    super(props)

    this.state = {
      uid: '',
      data: {
        students: {}
      },
      isEditForm: false,
      clientDetails: '',
      clientnames: [],
      clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [],

      isTableLoading: true,
      studentList: [],
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
    topic: Joi.string().required().label("Topic")
  };

  async componentWillMount() {
    await this.props.props.isPageLoadingTrue();
  }

  async componentDidMount() {
    const { data } = this.state
    await this.selectoptGet(`clients`, "clientIds")
    await this.feildCheck()
    await this.formApi.setValues(data);
    await this.props.props.isPageLoadingFalse();

  }
  feildCheck = async () => {
    let { session: { data: sessionData } } = this.props.props;
    const { data } = this.state
    const { userType, userLevel, client, entity, branch, department, batch, code, branchId, departmentId, batchId, uid, studentId } = sessionData;
    data['uid'] = uid;
    data['studentId'] = studentId;
    data['userType'] = userType;
    data['userLevel'] = userLevel;
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
        await this.clientDatas('client');
        await this.clientDatas('entity');
        await this.clientDatas('branch');
        await this.clientDatas('department');
        await this.clientDatas('batch');
        await this.formApi.setValues(data);
        break;
    }
  }


  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };

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
        return ToastService.Toast("No Assignments Found", 'default');
      }
    } catch (err) {
      this.handleError(err);
    }
  }


  async  particularAssignment() {
    const { data: { client, branch, entity, topic } } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}&type=assignment&title=${topic}`
    try {
      const particularDetails = await getsingleAssignment(params)

      if (particularDetails.data.statusCode === 1) {
        var assId = particularDetails.data.data[0]._id
        var assMark = particularDetails.data.data[0].assignment[0].mark
        await this.setState({
          assignmentId: assId,
          assignmentMark: assMark
        })
      } else {
        return ToastService.Toast("No Assignments Found", 'default');
      }
    } catch (err) {
      this.handleError(err);
    }
  }


  handleChange = async ({ currentTarget: Input }) => {
    await this.tableHide()
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
        await this.selectoptGet(`namelist?client=${data.client}&type=client`, "entityIds")
        await this.setState({ entity: "", branch: "", department: "", batch: "", branchIds: [], departmentIds: [], batchIds: [], isTableLoading: true })
        break;
      case "entity":
        this.selectoptGet(`namelist?client=${data.client}&type=entity&entity=${data.entity}`, "branchIds")
        await this.setState({ branch: "", department: "", batch: "", departmentIds: [], batchIds: [], isTableLoading: true })
        break;
      case "branch":
        await this.selectoptGet(`namelist?client=${data.client}&type=branch&entity=${data.entity}&branch=${data.branch}`, "departmentIds")
        await this.setState({ department: "", batchIds: [], batch: "", isTableLoading: true })
        break;
      case "department":
        this.selectoptGet(`namelist?client=${data.client}&type=department&entity=${data.entity}&branch=${data.branch}&department=${data.department}`, "batchIds")
        await this.setState({ batch: "", isTable: false })
        break;
      case "batch":
        await this.getSubjects()
        await this.getStudentList();
        await this.setState({ isTableLoading: true })
        break;
      case "subject":
        await this.getAssignmentsList()
        await this.setState({ isTableLoading: true })

        break;
      case "topic":
        await this.particularAssignment()
        await this.setState({ isTableLoading: true })

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
        await this.setState({ [type]: Datas });
      }
    } catch (err) {
      await this.handleError(err);
    }
  }

  setFormApi = (formApi) => {
    this.formApi = formApi;
  }


  tableHide() {
    this.setState({ isTableLoading: true })
  }



  // Get Student List
  getStudentList = async () => {
    this.tableHide()
    const { data: { client, branch, entity, department, batch } } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}&department=${department}&batch=${batch}&type=student`
    const res = await getStudentList(params);
    if (res.data.statusCode === 1) {
      var test = res.data.data
      for (var i = 0; i < test.length; i++) {
        var studentList = [{ "name": test[i].name, "uid": test[i].uid, "remarks": "", "mark": "" }]

      }
      await this.setState({ studentList, isTableLoading: false })
    }
    if (res.data.statusCode !== 1) return ToastService.Toast(res.data.message, 'default');

  }

  handleError(...err) {
    return ToastService.Toast("Something went wrong.Please try again later", 'default');
  }

  handleSubmit = async () => {
    const { type } = this.props
    if (type === 'assignment') {
      const { data: { client, branch, entity, department, batch, userType, uid, studentId }, assignmentId } = this.state;
      let params;
      params = `client=${client}&entity=${entity}&branch=${branch}&department=${department}&batch=${batch}&assignmentId=${assignmentId}`
      let assignmentstatus = await viewAssignmentReport(params)
      if (assignmentstatus.data.statusCode === 1) {
        let assigndata = assignmentstatus.data.data       
        if (userType === "student") {
          assigndata = _.filter(assigndata, v => v.studentId === uid);
        }
        if (userType === "parent") {
          assigndata = _.filter(assigndata, v => v.studentId === studentId);
        }
        await this.setState({
          isTableLoading: false,
          assigndata
        }, () => {
          this.viewReport(this.state.assigndata)
        })
      } else {
        return ToastService.Toast("No Details  Found", 'default');
      }
    }
  }
  async viewReport(data) {
    var assignmentView = []
    let temp = [];
    await _.map(data, v => {
      if (v.assignmentReport !== undefined)
        temp.push(v)
    });
    if (temp.length === 0) {
      await this.setState({
        assignmentView: []
      })
    }
    for (let item of data) {
      if (item.assignmentReport) {
        const { topic, subject, marks, totalMarks, remarks } = item.assignmentReport[0]

        const { studentId, name } = item
        assignmentView.push({ "studentId": studentId, "name": name, "topic": topic, "subject": subject, "marks": marks, "totalMarks": totalMarks, "remarks": remarks })
        await this.setState({
          assignmentView: assignmentView
        })
      }
    }
  }

  renderReportsForm(type, data) {
    const { rightsData } = this.props;
    return <ReportList type={type} data={data} rightsData={rightsData} />
  }
  render() {
    const { action, type } = this.props
    const { clientIds, entityIds, branchIds, departmentIds, batchIds, assignmentView, isTableLoading, isClient, isEntity, isBranch, isDepartment, isBatch
    } = this.state;
    return (
      <Fragment>
        <h6>{action} {type} Report</h6>
        <Form getApi={this.setFormApi} onSubmit={this.handleSubmit}  >
          {({ formApi, formState }) => (
            <div>
              <section>
                <Row>
                  {isClient && <Col sm={6} md={3}>
                    <CustomSelect field="client" label="Client*" name="client" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('client', e)} onChange={this.handleChange} options={clientIds} />
                  </Col>}
                  {isEntity && <Col sm={6} md={3}>
                    <CustomSelect field="entity" label="Entity*" name="entity" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('entity', e)} onChange={this.handleChange} options={entityIds} />
                  </Col>}
                  {isBranch && <Col sm={6} md={3}>
                    <CustomSelect field="branch" label="Branch*" name="branch" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('branch', e)} onChange={this.handleChange} options={branchIds} />
                  </Col>}
                  {isDepartment && <Col sm={6} md={3}>
                    <CustomSelect field="department" label="Department*" name="department" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={departmentIds} validateOnBlur validate={e => this.validateProperty('department', e)} onChange={this.handleChange} />
                  </Col>}
                </Row>
                <Row>
                  {isBatch && <Col sm={6} md={3}>
                    <CustomSelect field="batch" label="Batch*" name="batch" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={batchIds} validateOnBlur validate={e => this.validateProperty('batch', e)} onChange={this.handleChange} />
                  </Col>}
                  <Col sm={6} md={3}>
                    <CustomSelect field="subject" label="Subject*" name="subject" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={this.state.allSubjects} validateOnBlur validate={e => this.validateProperty('subject', e)} onChange={this.handleChange} />
                  </Col>
                  <Col sm={6} md={3}>
                    <CustomSelect field="topic" label="Assignments*" name="topic" getOptionValue={option => option.id} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('topic', e)}
                      options={this.state.allAssignments} onChange={this.handleChange} />
                  </Col>

                </Row>

              </section>
              <div className="text-right">
                <button type="submit" className="btn btn-primary btn-sm">Submit</button>
              </div>
            </div>
          )}
        </Form>
        {
          assignmentView && !isTableLoading &&
          this.renderReportsForm(type, assignmentView)
        }
      </Fragment >
    )
  }
}



