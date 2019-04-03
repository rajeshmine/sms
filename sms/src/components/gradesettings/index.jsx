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
import List from './list';
import { getGradeList, getScholastics, getSkills, getSubjectWeight } from 'services/gradeService';
import { rightsData } from 'services/rolesService';
var classNames = require('classnames')


export default class GradeList extends React.Component {



  state = {
    data: {},
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
    isTableLoading: true,
    isClient: true, isEntity: true, isBranch: true, isDepartment: true, isBatch: true
  }

  async componentWillMount() {
    await this.props.isPageLoadingTrue();
  }
  async componentDidMount() {
    const { session } = this.props;
    await this.rightsData(session);
    await this.init(this.props, true)
    await this.selectoptGet(`clients`, "clientIds")
    await this.feildCheck();
    await this.props.isPageLoadingFalse();
  }

  async componentWillReceiveProps(props) {
    await this.init(props, false)
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

  feildCheck = async () => {
    const { listType } = this.props.match.params
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
        if (listType !== 'subjectweitagelist')
          await this.onSubmit();
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
        await this.onSubmit();
        break;
      default:
        data['client'] = client || code;
        data['entity'] = entity || code;
        data['branch'] = branch || branchId;
        data['department'] = department || departmentId;
        data['batch'] = batch || batchId;
        await this.setState({ data, isClient: false, isEntity: false, isBranch: false, isDepartment: false, isBatch: false })
        await this.formApi.setValues(data);
        await this.onSubmit();
        break;
    }
  }

  setFormApi = (formApi) => {
    this.formApi = formApi;
  }


  addNavigation() {
    const { match: { params: { listType: form } } } = this.props;
    switch (form) {
      case "grade":
        return <NavLink className="btn btn-primary btn-sm" to={`/grade/add/gradeform`}>+ Add Grade</NavLink>;
      case "assessmentWeitage":
        return <NavLink className="btn btn-primary btn-sm" to={`/grade/add/assessmentweitage`}>+ Add Assessment Weitage</NavLink>;
      case "skills":
        return <NavLink className="btn btn-primary btn-sm" to={`/grade/add/skill`}>+ Add CCE Skill</NavLink>;
      case "subjectWeitage":
        return <NavLink className="btn btn-primary btn-sm" to={`/grade/add/subjectweitage`}>+ Add Subject Weight</NavLink>;
      default:
        return <NavLink className="btn btn-primary btn-sm" to={`/grade/add/gradeform`}>+ Add Grade</NavLink>;
    }
  }

  async init(props, isPageLoading = false) {
   
   
   
    const { location: { state } } = props;
    await this.setState({ data: state || {} });
   
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
    departmentId: Joi.string().required().label("Department"),
  };

  renderGradeForm(formType, data) {
    const { rightsData } = this.state
    return <List form={formType} data={data} props={this.props} refreshTable={this.onSubmit} rightsData={rightsData} />
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


  onSubmit = async () => {
    this.tableHide()
    const { listType } = this.props.match.params
    switch (listType) {
      case 'grade':
        return this.getGradeList()
      case 'assessmentWeitage':
        return this.scholasticsList()
      case 'skills':
        return this.getCCESkills()
      case 'subjectWeitage':
        return this.getSubjectWeight()
      default:
        return
    }


  }


  getGradeList = async () => {
    const { data: { client, entity, branch } } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}`
 
    try {
      const res = await getGradeList(params);
      if (res.data.statusCode === 1) {
        let data = res.data.data
       
        await this.setState({
          tableData: data,
          isTableLoading: false
        })
      } else if (res.data.statusCode === 0) {
       
        await this.setState({
          tableData: [],
          isTableLoading: false
        })
      }
    } catch (err) {
      this.handleError(err)
    }
  }

  scholasticsList = async () => {
    const { data: { client, entity, branch } } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}`
  
    try {
      const res = await getScholastics(params);
      if (res.data.statusCode === 1) {
        let data = res.data.data
      
        await this.setState({
          tableData: data,
          isTableLoading: false
        })
      } else if (res.data.statusCode === 0) {
       
        await this.setState({
          tableData: [],
          isTableLoading: false
        })
      }
    } catch (err) {
      this.handleError(err)
    }
  }

  getCCESkills = async () => {
    const { data: { client, entity, branch } } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}`
  
    try {
      const res = await getSkills(params);
      if (res.data.statusCode === 1) {
        let data = res.data.data
       
        await this.setState({
          tableData: data,
          isTableLoading: false
        })
      } else if (res.data.statusCode === 0) {
        
        await this.setState({
          tableData: [],
          isTableLoading: false
        })
      }
    } catch (err) {
      this.handleError(err)
    }
  }

  getSubjectWeight = async () => {
    const { data: { client, entity, branch, departmentId } } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}&departmentId=${departmentId}`
   
    try {
      const res = await getSubjectWeight(params);
      if (res.data.statusCode === 1) {
        let data = res.data.data
      
        let tableData = [];

        await _.map(data, async (v) => {
          await _.map(v.credits, s => {
            s["client"] = v['client'];
            s["entity"] = v['entity'];
            s["branch"] = v['branch'];
            s["departmentId"] = v['departmentId'];
            tableData.push(s)
          })
        })
       
        await this.setState({
          tableData,
          isTableLoading: false
        })
      } else if (res.data.statusCode === 0) {
        
        await this.setState({
          tableData: [],
          isTableLoading: false
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
    this.setState({
      isTableLoading: true
    })
  }
  redirectTo= async ()=>{
    await this.setState({ isTableLoading: true })
    await this.feildCheck()
    await this.formApi.reset();    
  }
  render() {
    const { listType } = this.props.match.params
    const { isPageLoading, isLoading, clientIds, entityIds, branchIds, departmentIds, tableData, isTableLoading, rightsData, excludeModules,
      isClient, isEntity, isBranch, isDepartment } = this.state;
    let { keys: formTypeKeys, order: formTypeOrder } = Static.CCEOptions();
    const { session } = this.props;
    let _form = _.upperFirst(listType);
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
                    <BreadcrumbItem active> {listType} </BreadcrumbItem>
                  </Breadcrumb>
                  <Container fluid>
                    <div className="mb-4  subnav-div">
                      {formTypeOrder.map((form) =>
                        <NavLink key={form} to={{ pathname: `/grade/${form}`, query: this.props.location.query }} className={classNames('subnav')} activeClassName="subnav-active" exact={true} onClick={() => this.redirectTo()}>{formTypeKeys[form]['label']}</NavLink>
                      )}
                    </div>
                    <div className="d-flex justify-content-end">

                      {rightsData && rightsData[_form] && rightsData[_form].create.value &&
                        this.addNavigation()
                      }

                    </div>
                    {listType !== 'subjectweitagelist' && isBranch &&
                      <Form getApi={this.setFormApi} onSubmit={this.onSubmit} >
                        {({ formApi, formState }) => (
                          <div>
                            <section>
                              <Row>
                                {isClient && <Col sm={6} md={3}>
                                  <CustomSelect field="client" label="Client*" name="client" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('client', e)} onChange={this.handleChange} options={clientIds} />
                                </Col>}
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
                                {listType === 'subjectweitagelist' && isDepartment && <Col sm={12} md={3}>
                                  <CustomSelect field="departmentId" label="Department" name="department" getOptionValue={option => option.code}
                                    getOptionLabel={option => option.name} options={departmentIds}
                                    validateOnBlur validate={e => this.validateProperty('departmentId', e)} onChange={this.handleChange} />
                                </Col>}

                              </Row>
                              <div className="text-right">
                                <button type="submit" className="btn btn-primary btn-sm">Submit</button>
                              </div>

                            </section>


                          </div>
                        )}
                      </Form>}
                  </Container>

                  <Container fluid>
                    {!isTableLoading && rightsData &&
                      this.renderGradeForm(listType, tableData)
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