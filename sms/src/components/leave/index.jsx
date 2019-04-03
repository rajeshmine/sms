import React, { Component, Fragment } from 'react';
import Header from 'components/common/header';
import SideNav from 'components/common/sideNav';
import LeaveList from './list'; 
import { NavLink } from 'react-router-dom';
import { Container } from 'reactstrap';
import Loading from 'components/common/loading';
import Joi from 'joi-browser';
import { Form } from 'informed';
import { Col, Row } from 'reactstrap';
import { CustomSelect } from 'components/common/forms';
import { getselectData } from 'services/userService'
import { getAllLeaves } from 'services/leaveService'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { rightsData } from 'services/rolesService';
import _ from 'lodash';
 
export default class leave extends Component {
  state = {
    data: {

    },
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
    isTableLoading: true,
    clientIds: [], entityIds: [], branchIds: [],
    leaveTable: false,
    isClient: true, isEntity: true, isBranch: true, isDepartment: true, isBatch: true
  }

  async componentWillMount(){
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

  async init(props, isPageLoading = false) {
    //const { uid } = props.match.params     
  }

  tableHide() {
    this.setState({
      isTableLoading: true
    })
  }

  rightsData = async (session) => {
    let res = await rightsData("leave", session);
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
    const { data } = this.state;
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
        await this.formApi.setValues(data);
        await this.onSubmit();
        break;
    }
  }

  setFormApi = (formApi) => {
    this.formApi = formApi;
  }


  async selectoptGet(url, type) {
    const data = await getselectData(url)
    if (data.data.statusCode === 1) {
      const Datas = data.data.data
      this.setState({ [type]: Datas });
    }
  }

  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };

  schema = {
    client: Joi.string().required().label('Client'),
    entity: Joi.string().required().label('Entity'),
    branch: Joi.string().required().label('Branch'),
    department: Joi.string().required().label('Department'),
    batch: Joi.any().optional(),

  };

  renderLeaveForm(data) {
    const { rightsData } = this.state;
    return <LeaveList data={data} rightsData={rightsData} refreshTable={this.onSubmit} />
  }

  handleChange = async ({ currentTarget: Input }) => {
    const { name, value } = Input;
    const { data } = this.state;
    data[name] = value;
    await this.setState({
      [name]: value,
      leaveTable: false
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
        break;
      default:
        break;
    }
  }

  leaveNavigation() { //Navigate to Add module Page
    return <NavLink style={{ marginLeft: '852px' }} className="btn btn-primary btn-sm" to={`/leave/add/leaveForm`}>+ Add Leave</NavLink>
  }

  onSubmit = async () => {
    this.tableHide()
    const { data: { client, entity, branch, department, batch, uid, userType, studentId } } = this.state;
    console.log(this.state)
    let params;


    if (department)
      params = `client=${client}&entity=${entity}&branch=${branch}&department=${department}`
    if (batch)
      params = `client=${client}&entity=${entity}&branch=${branch}&department=${department}&batch=${batch}`
    if (userType === 'student')
      params = `client=${client}&entity=${entity}&branch=${branch}&department=${department}&batch=${batch}&uid=${uid}`
    if (userType === 'parent')
      params = `client=${client}&entity=${entity}&branch=${branch}&department=${department}&batch=${batch}&uid=${studentId}`
    console.log(params)
    const response = await getAllLeaves(params)
  
    console.log(response)
    if (response.data.statusCode === 1) {
      let data = response.data.data
      console.log(data)
      await this.setState({
        tableData: data,
        isTableLoading: false
      })
    } else {
      let data = []
      await this.setState({
        tableData: data,
        isTableLoading: false
      })
    }
  }



  render() {
    const { leaveType } = this.props.match.params

    const { isPageLoading, isLoading,clientIds, entityIds, branchIds, departmentIds, batchIds, rightsData,isClient, isEntity, isBranch, isDepartment, isBatch, tableData,isTableLoading } = this.state;
    // let { keys: formTypeKeys, order: formTypeOrder } = Static.leaveFormTypes();
    const { session } = this.props;
    let _form = _.upperFirst(leaveType);

   
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
                    <BreadcrumbItem active>{leaveType}</BreadcrumbItem>
                  </Breadcrumb>
                  <Container fluid>


                    <div style={{ textAlign: 'right' }}  >
                      {rightsData && rightsData[_form] && rightsData[_form].create.value &&
                        <NavLink className="btn btn-primary btn-sm" to={`add/${leaveType}`}>+ {leaveType} </NavLink>
                      }


                    </div>
                    {isBatch &&
                      <Form getApi={this.setFormApi} onSubmit={this.onSubmit} >
                        {({ formApi, formState }) => (
                          <div>
                            <section>
                              <Row>
                                {isClient && <Col sm={12} md={3}>
                                  <CustomSelect field="client" label="Client*" name="client" getOptionValue={option => option.code}
                                    getOptionLabel={option => option.name} options={clientIds}
                                    validateOnBlur validate={e => this.validateProperty('client', e)} onChange={this.handleChange} />
                                </Col>
                                }
                                {isEntity &&
                                  <Col sm={12} md={3}>
                                    <CustomSelect field="entity" label="Entity*" name="entity" getOptionValue={option => option.code}
                                      getOptionLabel={option => option.name} options={entityIds}
                                      validateOnBlur validate={e => this.validateProperty('entity', e)} onChange={this.handleChange} />
                                  </Col>
                                }
                                {isBranch &&
                                  <Col sm={12} md={3}>
                                    <CustomSelect field="branch" label="Branch*" name="branch" getOptionValue={option => option.code}
                                      getOptionLabel={option => option.name} options={branchIds}
                                      validateOnBlur validate={e => this.validateProperty('branch', e)} onChange={this.handleChange} />
                                  </Col>
                                }
                                {isDepartment &&
                                  <Col sm={12} md={3}>
                                    <CustomSelect field="department" label="Department*" name="department" getOptionValue={option => option.code}
                                      getOptionLabel={option => option.name} options={departmentIds}
                                      validateOnBlur validate={e => this.validateProperty('department', e)} onChange={this.handleChange} />
                                  </Col>
                                }
                                {isBatch &&
                                  <Col sm={12} md={3}>
                                    <CustomSelect field="batch" label="Batch" name="batch" getOptionValue={option => option.code}
                                      getOptionLabel={option => option.name} options={batchIds}
                                      validateOnBlur validate={e => this.validateProperty('batch', e)} onChange={this.handleChange} />
                                  </Col>
                                }
                              </Row>

                            </section>

                            <div className="text-right">
                              <button type="submit" className="btn btn-primary btn-sm">Submit</button>
                            </div>
                          </div>
                        )}
                      </Form>}
                    <br />
                    {!isTableLoading &&  rightsData &&
                      this.renderLeaveForm(tableData)
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