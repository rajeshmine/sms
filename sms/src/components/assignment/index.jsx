
import React, { Component, Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import { Container, Col, Row, Breadcrumb, BreadcrumbItem } from 'reactstrap';
import _ from 'lodash';
import { Form } from 'informed';
import Joi from 'joi-browser';

import { CustomSelect } from 'components/common/forms';
import { getSubjectsList } from 'services/scheduleService';
import AssignmentList from 'components/assignment/list'
import { getAssignmentList, getsingleAssignment, viewHomeworkReport, viewAssignmentReport } from 'services/assignmentService';
import { getselectData } from 'services/userService'
import { rightsData } from 'services/rolesService';
import ToastService from 'services/toastService'
import Static from 'services/static';
import Header from 'components/common/header';
import Loading from 'components/common/loading';
import SideNav from 'components/common/sideNav';
import 'styles/user-form.scss';
var classNames = require('classnames');

export default class Assignment extends Component {
  state = {
    data: [],
    parentData: [],
    isPageLoading: false,
    isTableLoading: true,
    isLoading: false,
    clientIds: [], entityIds: [], branchIds: [],
    isClient: true, isEntity: true, isBranch: true, isDepartment: true, isBatch: true
  }

  async componentWillMount() {
    await this.props.isPageLoadingTrue();
  }

  async componentDidMount() {
    await this.init(this.props, true)
    this.selectoptGet(`clients`, "clientIds");
    const { session } = this.props;
    await this.rightsData(session);
    await this.feildCheck()
    await this.props.isPageLoadingFalse();
  }

  async componentWillReceiveProps(props) {
    await this.init(props, false)
  }

  async init(props, isPageLoading = false) {
  }

  rightsData = async (session) => {
    let res = await rightsData("assignment", session);
    let excludeModules = [];
    await _.map(_.keys(res), async v => {
      await _.map(_.keys(res[v]), k => {
        if (res[v][k]["value"])
          return excludeModules.push(v.toLowerCase())
      })
    })
    await this.setState({ excludeModules, rightsData: res || {} })

  }

  feildCheck = async () => {
    let { session: { data: sessionData } } = this.props;
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
        await this.setState({ data, isClient: false, isEntity: false, isBranch: false, isDepartment: false, isBatch: false });
        await this.clientDatas('client');
        await this.clientDatas('entity');
        await this.clientDatas('branch');
        await this.clientDatas('department');
        await this.clientDatas('batch');
        await this.formApi.setValues(data);
        break;
    }
  }

  setFormApi = (formApi) => {
    this.formApi = formApi;
  }

  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };

  schema = {
    branch: Joi.string().required().label("Branch"),
    client: Joi.string().required().label("Client"),
    entity: Joi.string().required().label("Entity"),
    department: Joi.string().required().label("Department"),
    batch: Joi.string().required().label("Batch"),
    subject: Joi.string().required().label("Subject"),
    homeworks: Joi.string().required().label("Home Work"),
    assignments: Joi.string().required().label("Assignments"),

  };

  handleChange = async ({ currentTarget: Input }) => {
    this.tableHide();
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
      case "department":
        this.selectoptGet(`namelist?client=${data.client}&type=department&entity=${data.entity}&branch=${data.branch}&department=${data.department}`, "batchIds")
        await this.setState({ batch: "" })
        break;
      case "batch":
        await this.getSubjects();
        break;
      case "homeworks":
        await this.particularHomework()
        break;
      case "assignments":
        await this.particularAssignment()
        break;
      case "subject":
        await this.getAssignmentsList()
        await this.getHomeworksList()
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
    const { data: { client, batch, entity, department, branch, subject } } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}&departmentId=${department}&batchId=${batch}&subject=${subject}&type=homework`;
    try {
      const homeworkList = await getAssignmentList(params)
      if (homeworkList.data.statusCode === 1) {
        let homeworks = homeworkList.data.data
        for (var i = 0; i < homeworks.length; i++) {
          homeworksArray.push({ 'name': homeworks[i].title, 'code': homeworks[i]._id })
        }
        await this.setState({
          allHomeworks: homeworksArray
        })
      } else {
        return ToastService.Toast("No Home Works  Found", 'default');
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

  handleError(...err) {
    return ToastService.Toast("Something went wrong.Please try again later", 'default');
  }

  async  particularHomework() {
    const { data: { client, branch, entity }, homeworks } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}&type=homework&title=${homeworks}`
    try {
      const particularDetails = await getsingleAssignment(params)
      if (particularDetails.data.statusCode === 1) {
        var hwId = particularDetails.data.data[0]._id
        await this.setState({
          homeworkId: hwId
        })
      } else {
        return ToastService.Toast("No Assignments Found", 'default');
      }
    } catch (err) {
      this.handleError(err);
    }
  }

  async  particularAssignment() {
    const { data: { client, branch, entity }, assignments } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}&type=assignment&title=${assignments}`
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

  onSubmit = async () => {
    const { type } = this.props.match.params
    if (type === 'homework') {
      const { data: { client, entity, branch, department, batch }, homeworkId } = this.state
      let params = `client=${client}&entity=${entity}&branch=${branch}&department=${department}&batch=${batch}&homeworkId=${homeworkId}`
      const homeworkstatus = await viewHomeworkReport(params)
      if (homeworkstatus.data.statusCode === 1) {
        let hwstsdata = homeworkstatus.data.data
        await this.setState({
          hwstsdata,
          isTableLoading: false
        })
      } else {
        return ToastService.Toast("No Details  Found", 'default');
      }
    } else if (type === 'assignment') {
      const { data: { client, entity, branch, department, batch }, assignmentId } = this.state
      let params = `client=${client}&entity=${entity}&branch=${branch}&department=${department}&batch=${batch}&assignmentId=${assignmentId}`

      const assignmentstatus = await viewAssignmentReport(params)
      if (assignmentstatus.data.statusCode === 1) {
        let assigndata = assignmentstatus.data.data
        await this.setState({
          assigndata,
          isTableLoading: false
        })
      } else {
        return ToastService.Toast("No Details  Found", 'default');
      }
    }
  }

  tableHide = async () => {
    await this.setState({ isTableLoading: true })
  }

  addAssignmentNavigation(type) { //Navigate to Add module Page
    return <NavLink className="btn btn-primary btn-sm btn-right" to={`/assignments/add/${type}`}>+ Add {type}</NavLink>
  }

  renderAssignmentForm(type, data, client, entity, branch, department, batch, heading, ID) {
    const { rightsData } = this.state;
    let details = { client, entity, branch, department, batch, heading, ID }
    return <AssignmentList type={type} data={data} props={this.props} details={details} rightsData={rightsData} />
  }

  redirectTo = async () => {
    await this.setState({ isTableLoading: true })
    await this.feildCheck()
    await this.formApi.reset();
  }
  render() {
    const { isPageLoading, isLoading, hwstsdata, clientIds, entityIds, branchIds, departmentIds, batchIds, assigndata, rightsData, excludeModules, isTableLoading, isClient, isEntity, isBranch, isDepartment, isBatch } = this.state;
    let { keys: formTypeKeys, order: formTypeOrder } = Static.assignmentFormTypes();
    const { type } = this.props.match.params;
    const { session } = this.props;
    let _form = _.upperFirst(type);
    formTypeOrder = _.filter(formTypeOrder, v => _.includes(excludeModules, v))

    return (
      <Fragment >
        {session &&
          <div className="row no-gutters bg-white page-user">
            <Header props={this.props} />
            <div className="col-3 col-md-2">
              <SideNav props={this.props} />
            </div>
            <div className="col-9 col-md-10 p-3 content">
              {isPageLoading && <Loading />}
              {!isPageLoading && !isLoading &&
                <Fragment>
                  <Breadcrumb>
                    <BreadcrumbItem><NavLink to="/dashboard">Dashboard</NavLink></BreadcrumbItem>
                    <BreadcrumbItem><NavLink to='/assignments/assignment'>assignments</NavLink></BreadcrumbItem>
                    <BreadcrumbItem active>{type}</BreadcrumbItem>
                  </Breadcrumb>
                  <Container fluid>
                    <div className="mb-4 subnav-div">
                      {formTypeOrder.map((type) =>
                        <NavLink key={type} to={{ pathname: `/assignments/${type}`, query: this.props.location.query }} onClick={this.redirectTo} className={classNames('subnav')} activeClassName="subnav-active" exact={true} >{formTypeKeys[type]['label']}</NavLink>
                      )}
                    </div>
                    <div>
                      {rightsData && rightsData[_form] && rightsData[_form].create.value &&
                        this.addAssignmentNavigation(type)
                      }

                    </div>
                    <br />
                    <Form getApi={this.setFormApi} onSubmit={this.onSubmit} >
                      {({ formApi, formState }) => (
                        <div>
                          <section>
                            <Row>
                              {isClient && <Col sm={6} md={3}>
                                <CustomSelect field="client" label="Client*" name="client" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('client', e)} onChange={this.handleChange} options={clientIds} />
                              </Col>
                              }
                              {isEntity &&
                                <Col sm={6} md={3}>
                                  <CustomSelect field="entity" label="Entity*" name="entity" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('entity', e)} onChange={this.handleChange} options={entityIds} />
                                </Col>
                              }
                              {isBranch &&
                                <Col sm={6} md={3}>
                                  <CustomSelect field="branch" label="Branch*" name="branch" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('branch', e)} onChange={this.handleChange} options={branchIds} />
                                </Col>
                              }
                              {isDepartment &&
                                <Col sm={6} md={3}>
                                  <CustomSelect field="department" label="Department*" name="department" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={departmentIds} validateOnBlur validate={e => this.validateProperty('department', e)} onChange={this.handleChange} />
                                </Col>
                              }
                              {isBatch &&
                                <Col sm={6} md={3}>
                                  <CustomSelect field="batch" label="Batch*" name="batch" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={batchIds} validateOnBlur validate={e => this.validateProperty('batch', e)} onChange={this.handleChange} />
                                </Col>
                              }
                              <Col sm={6} md={3}>
                                <CustomSelect field="subject" label="Subject*" name="subject" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={this.state.allSubjects} validateOnBlur validate={e => this.validateProperty('subject', e)} onChange={this.handleChange} />
                              </Col>
                              {
                                type === 'homework' &&

                                <Col sm={6} md={3}>
                                  <CustomSelect field="homeworks" label="Homeworks*" name="homeworks" getOptionValue={option => option.id} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('homeworks', e)}
                                    options={this.state.allHomeworks} onChange={this.handleChange} />
                                </Col>
                              }

                              {
                                type === 'assignment' &&
                                <Col sm={6} md={3}>
                                  <CustomSelect field="assignments" label="assignments*" name="assignments" getOptionValue={option => option.id} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('assignments', e)} options={this.state.allAssignments} onChange={this.handleChange} />
                                </Col>
                              }
                            </Row>
                            <div className="text-right">
                              <button type="submit" className="btn btn-primary btn-sm">Submit</button>
                            </div>
                          </section>

                        </div>
                      )}
                    </Form>
                    {type === 'homework' && !isTableLoading && hwstsdata && rightsData &&
                      this.renderAssignmentForm(type, hwstsdata, this.state.client, this.state.entity, this.state.branch, this.state.department, this.state.batch, this.state.homeworks, this.state.homeworkId)
                    }
                    {type === 'assignment' && !isTableLoading && assigndata && rightsData &&
                      this.renderAssignmentForm(type, assigndata, this.state.client, this.state.entity, this.state.branch, this.state.department, this.state.batch, this.state.assignments, this.state.assignmentId)
                    }
                  </Container>
                </Fragment>
              }
            </div>
          </div>
        }
      </Fragment >
    );
  }
}

// function redirectTo() {
//   return window.location.reload()
// }