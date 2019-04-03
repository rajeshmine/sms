import React, { Fragment } from 'react'
import ToastService from 'services/toastService'
import Static from 'services/static';
import { CustomSelect } from 'components/common/forms';
import { NavLink } from 'react-router-dom';
import { Container, Row, Col, Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { Form } from 'informed';
import { getselectData } from 'services/userService'
import Joi from 'joi-browser';
import _ from 'lodash'

import Header from 'components/common/header';
import Loading from 'components/common/loading';
import SideNav from 'components/common/sideNav';
import List from './list'

import { getScheduleDetails } from 'services/scheduleService';
import { getexamname, getsubjectname } from 'services/examService';
import { getMarkList } from 'services/markReportService'
import { getRoles, rightsData } from 'services/rolesService';
var classNames = require('classnames')


export default class MarkDataList extends React.Component {

  state = {
    data: { client: '',
    entity: '',
    department: '',
    branch: '',
    batch: '',},
    tableData: {
      'gpa': [],
      'cce': {},
    },
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
    examNameList: [], termList: [], subjectNameList: [],
    isTableLoading: true,
    // Feild Validation
    isClient: true, isEntity: true, isBranch: true, isDepartment: true, isBatch: true
  }

  async componentWillMount(){
    await this.props.isPageLoadingTrue();
  }

  async componentDidMount() {
    const { session } = this.props;
    await this.selectoptGet(`clients`, "clientIds")
    await this.init(this.props, true)
    await this.rightsData(session);
    await this.feildCheck();        
    await this.props.isPageLoadingFalse();
  }

  rightsData = async (session) => {
    let res = await rightsData("grade", session);
    let excludeModules = [];
    await _.map(_.keys(res), async v => {
      await _.map(_.keys(res[v]), k => {
        if (res[v][k]["value"])
          return excludeModules.push(_.lowerFirst(v))
      })
    })
    excludeModules = await _.uniq(excludeModules)
    await this.setState({ excludeModules, rightsData: res || {} })
  }

  async componentWillReceiveProps(props) {
    await this.init(props, false)
  }



  // TODO: Rights Check

  clientRights = async (session) => {
   
    if (session && session.data) {
      if (session.data.userType === 'sadmin' || session.data.userType === 'client' || session.data.userType === 'entity') {
       
        await this.setState({
          clientRights: {
            Clients: {
              view: { value: true },
              edit: { value: true },
              create: { value: true },
              delete: { value: true },
              import: { value: true },
              export: { value: true },
            }
          }
        })
      } else {
       
        let res = await getRoles(`client=${session.data.client}&entity=${session.data.entity}&branch=${session.data.branch}&type=${session.data.roles}`)
       
        if (res && res.data.statusCode === 1) {
          let rightsData = res.data.data[0];
        
          await this.setState({
            clientRights: rightsData.clients
          })
        }
      }
    }
  
  }


  feildCheck = async () => {
   
    let { session: { data: sessionData } } = this.props;
    const { data } = this.state
  
    const { userType, userLevel, client, entity, branch, department, batch,code,branchId,departmentId,batchId } = sessionData;
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
        data['client'] =  client || code;
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
      case 'batch':
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
        await this.clientDatas('feildCheck');
        break;
      default:
        data['client'] = client || code;
        data['entity'] = entity || code;
        data['branch'] = branch || branchId;
        data['department'] = department || departmentId;
        data['batch'] = batch || batchId;
        await this.setState({ data, isClient: false, isEntity: false, isBranch: false, isDepartment: false, isBatch: false })
        await this.formApi.setValues(data);       
        await this.clientDatas('feildCheck');
        break;
    }
  }



  async init(props, isPageLoading = false) {
    // const { location: { state } } = props;  
    //await this.setState({ data: state || {} });
  }

  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };

  setFormApi = (formApi) => {
    this.formApi = formApi;
  }

    schema = {
    client: Joi.string().required().label("Client"),
    entity: Joi.string().required().label("Entity"),
    branch: Joi.string().required().label("Branch"),
    departmentId: Joi.string().required().label("Department"),
    batchId: Joi.string().required().label("Batch"),
    examId: Joi.string().required().label("Exam Name"),
    subject: Joi.string().required().label("Subject"),
    term: Joi.string().required().label("Term"),
  };
 
 
  adduserNavigation() {
    const { match: { params: { listType: form } } } = this.props;
    switch (form) {
      case "gpa":
        return <NavLink className="btn btn-primary btn-sm" to={`/mark/add/gpa`}>+ Add GPA Mark</NavLink>;
      case "cce":
        return <NavLink className="btn btn-primary btn-sm" to={`/mark/add/cce`}>+ Add CCE Mark</NavLink>;
      default:
        return <NavLink className="btn btn-primary btn-sm" to={`/mark/add/gpa`}>+ Add GPA Mark</NavLink>;

    }
  }

  renderListForm(formType, data) {
    return <List form={formType} data={data} clientDetails={this.state.data} props={this.props} refreshTable={this.onSubmit} />
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
        this.selectoptGet(`namelist?client=${data.client}&type=department&entity=${data.entity}&branch=${data.branch}&department=${data.department}`, "batchIds")
        await this.setState({ batch: "", batchIds: [] })
        this.examnameget(`scheduleTypeId?client=${data.client}&entity=${data.entity}&branch=${data.branch}&type=exam`, "examNameList");
        await this.getTermList();
        break;
      case "batch":
        this.subjectnameget(`particularCourse?client=${data.client}&entity=${data.entity}&branch=${data.branch}&department=${data.department}&batch=${data.batch}&type=subject`, "subjectNameList")
        break;
      case "feildCheck":
        await this.getTermList();
        this.examnameget(`scheduleTypeId?client=${data.client}&entity=${data.entity}&branch=${data.branch}&type=exam`, "examNameList");
        this.subjectnameget(`particularCourse?client=${data.client}&entity=${data.entity}&branch=${data.branch}&department=${data.department}&batch=${data.batch}&type=subject`, "subjectNameList")
        return
      default:
        break;
    }
  }

  async selectoptGet(url, type) {
    const data = await getselectData(url)
    if (data.data.statusCode === 1) {
      const Datas = data.data.data
      this.setState({ [type]: Datas });
    } else {
      ToastService.Toast(`${type} Data Not Found!!!`, "default")
    }
  }

  getTermList = async () => {
    const { data: { client, entity, branch } } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}&type=term`
   
    try {
      const res = await getScheduleDetails(params);
      if (res.data.statusCode === 1) {
        let data = res.data.data
      
        await this.setState({ termList: data })
      } else if (res.data.statusCode === 0) {
        await ToastService.Toast(`No Data Found!!!`, "default")
        await this.setState({ termList: [] })
      }
    } catch (err) {
      this.handleError(err)
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

  onSubmit = async () => {
    this.tableHide()
    const { listType } = this.props.match.params
    switch (listType) {
      case 'gpa':
        return this.getGPAMarkList();
      case 'cce':
        await this.getCCEMarkList('Scholastic')
        await this.getCCEMarkList('co-scholastic')
        await this.setState({ isTableLoading: false })
        break;
      default:
        return
    }


  }


  getGPAMarkList = async () => {
    const { data: { client, entity, branch, department, batch, examId, term, subject }, tableData } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}&department=${department}&batch=${batch}&examId=${examId}&term=${term}&subject=${subject}&type=GPA`
   
    try {
      const res = await getMarkList(params);
    
      if (res.data.statusCode === 1) {
        let data = res.data.data
      
        tableData['gpa'] = data;
        await this.setState({
          tableData,
          isTableLoading: false
        })
      } else if (res.data.statusCode === 0) {
       
        tableData['gpa'] = [];
        await this.setState({
          tableData,
          isTableLoading: false
        })
      }
    } catch (err) {
      this.handleError(err)
    }
  }

  getCCEMarkList = async (type) => {
    const { data: { client, entity, branch, department, batch, term, examId, subject }, tableData } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}&department=${department}&batch=${batch}&term=${term}&examId=${examId}&subject=${subject}&type=${type}`;
    try {
      const res = await getMarkList(params);
      if (res.data.statusCode === 1) {
        let data = res.data.data
        tableData['cce'][type] = data;
        await this.setState({ tableData })
      } else if (res.data.statusCode === 0) {
       
        tableData['cce'][type] = [];
        await this.setState({ tableData })
      }
    } catch (err) {
      this.handleError(err)
    }
  }

  handleError(...err) {
  
    return ToastService.Toast("Somthig went wrong.Please try again later", "default");
  }

  tableHide() {
    this.setState({ isTableLoading: true })
  }

  redirectTo = async () => {
    await this.setState({ isTableLoading: true })    
    await this.formApi.reset();
  }
  render() {
    const { listType } = this.props.match.params
    const { isPageLoading, isLoading, clientIds, entityIds, branchIds, departmentIds, batchIds, examNameList, subjectNameList, termList, tableData, isTableLoading,
      isClient, isEntity, isBranch, isDepartment, isBatch

    } = this.state;
    const { keys: formTypeKeys, order: formTypeOrder } = Static.markEntryOptions();
    const { session } = this.props;
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
                    <BreadcrumbItem active> {listType} </BreadcrumbItem>
                  </Breadcrumb>
                  <Container fluid>
                    <div className="mb-4 subnav-div">
                      {formTypeOrder.map((form) =>
                        <NavLink key={form} to={{ pathname: `/mark/${form}`, query: this.props.location.query }} className={classNames('subnav')} activeClassName="subnav-active" exact={true} onClick={() => this.redirectTo()}>{formTypeKeys[form]['label']}</NavLink>
                      )}
                    </div>
                    <div className="d-flex justify-content-end">
                      {
                        this.adduserNavigation()
                      }
                    </div>
                    <Form getApi={this.setFormApi} onSubmit={this.onSubmit} >
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
                              {isDepartment && <Col sm={12} md={3}>
                                <CustomSelect field="department" label="Department" name="department" getOptionValue={option => option.code}
                                  getOptionLabel={option => option.name} options={departmentIds}
                                  validateOnBlur validate={e => this.validateProperty('departmentId', e)} onChange={this.handleChange} />
                              </Col>}
                              {isBatch && <Col sm={6} md={3}>
                                <CustomSelect field="batch" label="Batch*" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('batchId', e)} onChange={this.handleChange} options={batchIds} />
                              </Col>}
                              <Col sm={6} md={3}>
                                <CustomSelect field="term" label="Term *" getOptionValue={option => option._id} getOptionLabel={option => option.title} validateOnBlur validate={e => this.validateProperty('term', e)} onChange={this.handleChange} options={termList} />
                              </Col>

                              <Col sm={6} md={3}>
                                <CustomSelect field="examId" label="Exam Name *" getOptionValue={option => option._id} getOptionLabel={option => option.title} validateOnBlur validate={e => this.validateProperty('examId', e)} onChange={this.handleChange} options={examNameList} />
                              </Col>

                              <Col sm={6} md={3}>
                                <CustomSelect field="subject" label="Subject *" getOptionValue={option => option.code} getOptionLabel={option => option.displayName} validateOnBlur validate={e => this.validateProperty('subject', e)} onChange={this.handleChange} options={subjectNameList} />
                              </Col>


                            </Row>
                          </section>
                          <button type="submit" className="btn btn-primary btn-sm">Submit</button>
                        </div>
                      )}
                    </Form>
                  </Container>

                  <Container fluid>
                    {!isTableLoading &&
                      this.renderListForm(listType, tableData)
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