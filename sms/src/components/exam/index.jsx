import React, { Component, Fragment } from 'react';
import Header from 'components/common/header';
import SideNav from 'components/common/sideNav';
import ExamList from './list';
import Static from 'services/static';
import { NavLink } from 'react-router-dom';
import { Container, Breadcrumb, BreadcrumbItem } from 'reactstrap';
import Loading from 'components/common/loading';
import Joi from 'joi-browser';
import { Form } from 'informed';
import { Col, Row } from 'reactstrap';
import {  CustomSelect } from 'components/common/forms';
import { getselectData } from 'services/userService'
import { getExamData, getsubjectname, getexamname, getAllSection, getAllQuestions } from 'services/examService';
import { rightsData } from 'services/rolesService';
import ToastService from 'services/toastService'
import _ from 'lodash'

var classNames = require('classnames');


export default class Exam extends Component {
  state = {
    data: {},
    parentData: [],
    prefixUrl: "",
    isPageLoading: false,
    isLoading: false,
    type: '',
    client: '',
    entity: '',
    department: '',
    branch: '',
    batch: '',
    uid: '',
    clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [],
    examname: [],
    examTable: false,
    isClient: true, isEntity: true, isBranch: true, isDepartment: true, isBatch: true
  }

  async componentWillMount(){
    await this.props.isPageLoadingTrue();
  }
  async componentDidMount() {
    const { session } = this.props; 
    await this.rightsData(session);
    await this.props.isPageLoadingFalse();
    await this.init(this.props, true)
    await this.feildCheck();    
    await this.selectoptGet(`clients`, "clientIds")
   
  }


  async componentWillReceiveProps(props) {
    await this.init(props, false)
  }

  rightsData = async (session) => {
   
    let res = await rightsData("exam", session);

    let excludeModules = [];
    await _.map(_.keys(res), async v => {
      await _.map(_.keys(res[v]), k => {
        if (res[v][k]["value"])
          return excludeModules.push(v)
      })
    })

    await this.setState({ excludeModules, rightsData: res || {} })

  }

  feildCheck = async () => {

    let { session: { data: sessionData } } = this.props;
    const { data } = this.state
    const { userType, userLevel, client, entity, branch,  code, branchId} = sessionData;
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
        await this.onSubmit();
        
        break;
      default:
        data['client'] = client || code;
        data['entity'] = entity || code;
        data['branch'] = branch || branchId;
        await this.setState({ data, isClient: false, isEntity: false, isBranch: false, isDepartment: false, isBatch: false })
        await this.formApi.setValues(data);
        await this.onSubmit();
        
        break;
    }
  }


  async init(props, isPageLoading = false) {
    this.tableHide()
    const {  form } = props.match.params
    const { location: { state } } = props;
    await this.setState({ data: state || {} });
  
    if (form === "section") return await this.sectionDataList();
    if (form === "viewQuestions") return await this.questionsList()

  }



  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };

  schema = {
    client: Joi.string().required().label("Client"),
    entity: Joi.string().required().label("Entity"),
    branch: Joi.string().required().label("Branch"),
    department: Joi.string().required().label("Department"),
    batch: Joi.string().required().label("Batch"),
    examname: Joi.string().required(),
    subject: Joi.string().required(),
    sectionId: Joi.string().required(),
  };

  adduserNavigation() {
    const { match: { params: { form } }, location: { state }, data } = this.props;
    if (form === "offlineExam" && form !== 'section' && form !== 'viewQuestions')
      return <NavLink className="btn btn-primary btn-sm" to={`/exam/add/exam`}>+ Add Exam</NavLink>
    if (form === 'section')
      return <div className="btn btn-primary btn-sm" onClick={() => this.editFun(`/exam/add/section`, state)}>+ Add Section</div>
    if (form === 'viewQuestions' && data.length === 0)
      return <div className="btn btn-primary btn-sm" onClick={() => this.editFun(`/exam/add/questionForm`, state)}>+ Add Question</div>
  }


  renderUserForm(OfflineExam, data) {
    const { rightsData } = this.state;
    return <ExamList form={OfflineExam} data={data} props={this.props} refreshTable={this.onSubmit} rightsData={rightsData} />
  }

  handleChange = async ({ currentTarget: Input }) => {
    const { name, value } = Input;
    const { data } = this.state;
    data[name] = value;
    this.setState({ [name]: value })
    this.clientDatas(name);
  }

  clientDatas = async (name) => {
    const { data } = this.state;
    switch (name) {
      case "client":
        await this.selectoptGet(`namelist?client=${data.client}&type=client`, "entityIds")
        await this.setState({ entity: "", branch: "", department: "", batch: "", branchIds: [], departmentIds: [], batchIds: [] })
        break;
      case "entity":
        await this.selectoptGet(`namelist?client=${data.client}&type=entity&entity=${data.entity}`, "branchIds")
        await this.setState({ branch: "", department: "", batch: "", departmentIds: [], batchIds: [] })
        break;
      case "branch":
        await this.selectoptGet(`namelist?client=${data.client}&type=branch&entity=${data.entity}&branch=${data.branch}`, "departmentIds")
        await this.setState({ departmentId: "", batch: "", })
        break;
      case "department":
        await this.selectoptGet(`namelist?client=${data.client}&type=department&entity=${data.entity}&branch=${data.branch}&department=${data.department}`, "batchIds")
        await this.setState({ batch: "", })
        this.examnameget(`scheduleTypeId?client=${data.client}&entity=${data.entity}&branch=${data.branch}&type=exam`, "examname");
        break;
      case "batch":
        await this.subjectnameget(`particularCourse?client=${data.client}&entity=${data.entity}&branch=${data.branch}&department=${data.department}&batch=${data.batch}&type=subject`, "subjectname")
        break;
      case "subjectId":
        this.sectionList();
        break;
      default:
        break
    }
  }

  async selectoptGet(url, type) {
    const data = await getselectData(url);
    if (data.data.statusCode === 1) {
      const Datas = data.data.data
      this.setState({ [type]: Datas });
    } else {
      ToastService.Toast(`${type} Data Not Found!!!`, "default")
    }
  }

  async examnameget(url, type) {
    try {
      const data = await getexamname(url)
      if (data.data.statusCode === 1) {
        const Datas = data.data.data
        this.setState({ [type]: Datas });
      }
    } catch (err) {
      this.handleError(err)
    }
  }

  setFormApi = (formApi) => {
    this.formApi = formApi;
  };

  async subjectnameget(url, type) {
    try {
      const data = await getsubjectname(url)
      if (data.data.statusCode === 1) {
        const Datas = data.data.data
        this.setState({ [type]: Datas });
      }
    } catch (err) {
      this.handleError(err)
    }

  }

  sectionList = async () => {
    const { data: { client, entity, branch, department, batch, examId } } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}&departmentId=${department}&examId=${examId}&batch=${batch}`
    try {
      const res = await getAllSection(params)
      if (res.data.statusCode === 1) {
        let sectionLists = res.data.data
        await this.setState({ sectionLists })
      } else {
        ToastService.Toast(`No Data Found!!!`, "default")
      }
    } catch (err) {
      this.handleError(err)
    }
  }


  onSubmit = async () => {
    this.tableHide()
    const { form } = this.props.match.params
    if (form === "offlineExam" || form === "offlineexam") return this.examList("offline")
    if (form === "onlineExam" || form === "onlineExam") return this.examList("online")
    if (form === "section") return this.sectionDataList();
    if (form === "viewQuestions") return this.questionsList()
  }

  examList = async (type) => {
    const { data: { client, entity, branch } } = this.state;
    let params = `client=${client}&entity=${entity}&branch=${branch}&type=${type}`
    try {
      const res = await getExamData(params)
      if (res.data.statusCode === 1) {
        let data = res.data.data
        this.setState({
          tableData: data,
          examTable: true
        })
      } else {
        this.setState({
          tableData: [],
          examTable: true
        })
      }
    } catch (err) {
      this.handleError(err)
    }
  }

  sectionDataList = async () => {
    this.tableHide()
    const { data: { client, entity, branch, departmentId, batchId, examId } } = this.state;
    let params = `client=${client}&entity=${entity}&branch=${branch}&departmentId=${departmentId}&examId=${examId}&batchId=${batchId}`

    try {
      const res = await getAllSection(params)
      if (res.data.statusCode === 1) {
        let data = res.data.data
        this.setState({
          tableData: data,
          examTable: true
        })
      } else if (res.data.statusCode === 0) {
        await ToastService.Toast(`No Data Found!!!`, "default")
        this.setState({
          tableData: [],
          examTable: true
        })

      }
    } catch (err) {
      this.handleError(err)
    }
  }

  questionsList = async () => {
    this.tableHide()
    const { data: { client, entity, branch, departmentId,  examId, subjectId, _id } } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}&departmentId=${departmentId}&batchId=${departmentId}&examId=${examId}&subjectId=${subjectId}&sectionId=${_id}`
    try {
      const res = await getAllQuestions(params)
      if (res.data.statusCode === 1) {
        let data = res.data.data[0].questions
        this.setState({
          tableData: data,
          examTable: true
        })
      } else if (res.data.statusCode === 0) {
        await ToastService.Toast(`No Data Found!!!`, "default")
        this.setState({
          tableData: [],
          examTable: true
        })
      }
    } catch (err) {
      this.handleError(err)
    }
  }

  handleError(...err) {
    return ToastService.Toast("Somthig went wrong.Please try again later", "default");
  }

  tableHide() {
    this.setState({ examTable: false })
  }

  redirectTo = async () => {
    await this.setState({ examTable: false })
    await this.feildCheck()
    await this.formApi.reset();
  }
  render() {
    const { form } = this.props.match.params;
    const { isPageLoading, isLoading,  clientIds, entityIds, branchIds,  tableData, examTable, rightsData, excludeModules, isClient, isEntity, isBranch } = this.state;
    let { keys: formTypeKeys, order: formTypeOrder } = Static.examTypes();
    const { session } = this.props;
    let _form = form;
    formTypeOrder = _.filter(formTypeOrder, v => _.includes(excludeModules, v));
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
                    {/* <BreadcrumbItem><NavLink to="/grade/grade-list">Grade</NavLink></BreadcrumbItem> */}
                    {(form === "section" || form === "viewQuestions") && <BreadcrumbItem><NavLink to="/exam/offlineExam" title="Exam Id">Exam</NavLink></BreadcrumbItem>}
                    <BreadcrumbItem active>{form}</BreadcrumbItem>
                  </Breadcrumb>
                  {(form === "onlineExam" || form === "offlineExam") ?
                    <Container fluid>
                      <div className="mb-4  subnav-div">
                        {formTypeOrder.map((form) =>
                          <NavLink key={form} to={{ pathname: `/exam/${form}`, query: this.props.location.query }} className={classNames('subnav')} activeClassName="subnav-active" exact={true} onClick={() => this.redirectTo()}>{formTypeKeys[form]['label']}</NavLink>
                        )}
                      </div>
                      <div className="d-md-flex align-items-md-center justify-content-md-between">
                                            <h5 className="pg-title">{_form}</h5>
                                            <div className="d-flex justify-content-end">
                        {rightsData && rightsData[_form] && rightsData[_form].create.value &&
                          this.adduserNavigation()
                        }
                        {form === "onlineExam" &&
                          < NavLink className="btn btn-primary btn-sm" to={`/result`}>View Result</NavLink>}
                      </div>
                                        </div> 
                     
                      {isBranch && <Form getApi={this.setFormApi} onSubmit={this.onSubmit} >
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
                              </Row>
                              <div className="text-right">
                <button type="submit" className="btn btn-primary btn-sm">Submit</button>
              </div>
                            </section>
                             
                          </div>
                        )}
                      </Form>}
                    </Container>
                    : ""}
                  <Container fluid>
                    {examTable && rightsData &&
                      this.renderUserForm(form, tableData)
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


