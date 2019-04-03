import React, { Component, Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import { Container } from 'reactstrap';
import Joi from 'joi-browser';
import { Form } from 'informed';
import { Col, Row } from 'reactstrap';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';
import Loading from 'components/common/loading';
import Header from 'components/common/header';
import SideNav from 'components/common/sideNav';
import ScheduleList from './list';
import Static from 'services/static';
import { CustomSelect } from 'components/common/forms';
import { getselectData } from 'services/userService'
import { getScheduleDetails } from 'services/scheduleService'
import { rightsData } from 'services/rolesService';
import _ from 'lodash';
var classNames = require('classnames');

export default class Schedule extends Component {
  state = {
    data: {}, 
    prefixUrl: "",
    isPageLoading: false,
    isLoading: false,
    type: '',
    client: '',
    entity: '',
    department: '',
    branch: '',
    batch: '',    
    clientIds: [], entityIds: [], branchIds: [],
    isTableLoading: true,
    isClient: true, isEntity: true, isBranch: true, isDepartment: true, isBatch: true
  }

  async componentWillMount() {
    await this.props.isPageLoadingTrue();
  }

  async componentDidMount() {
    await this.feildCheck()
    await this.init(this.props, true)
    this.selectoptGet(`clients`, "clientIds")
    const { session } = this.props;
    await this.rightsData(session);
    await this.props.isPageLoadingFalse();
  }

  async componentWillReceiveProps(props) {
    await this.init(props, false)
  }

  feildCheck = async () => {
    let { session: { data: sessionData } } = this.props;
    const { data } = this.state
    const { userType, userLevel, client, entity, branch } = sessionData;
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
        data['client'] = client;
        data['entity'] = entity;
        data['branch'] = branch;
        await this.setState({ data, isClient: false, isEntity: false, isBranch: false })
        await this.clientDatas('client');
        await this.clientDatas('entity');
        await this.clientDatas('branch');
        await this.formApi.setValues(data);
        await this.onSubmit();
        break;
      default:
        data['client'] = client;
        data['entity'] = entity;
        data['branch'] = branch;
        await this.setState({ data, isClient: false, isEntity: false, isBranch: false, isDepartment: false, isBatch: false })
        await this.formApi.setValues(data);
        await this.onSubmit();
        break;
    }
  }

  rightsData = async (session) => {
   
    let res = await rightsData("schedule", session);
    let excludeModules = [];
    await _.map(_.keys(res), async v => {
      await _.map(_.keys(res[v]), k => {
        if (res[v][k]["value"])
          return excludeModules.push(v.toLowerCase())
      })
    })
    await this.setState({ excludeModules, rightsData: res || {} })
  }

  async init(props, isPageLoading = false) {
   
  }

  setFormApi = (formApi) => {
    this.formApi = formApi
  }

  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };

  schema = {
    branch: Joi.string().required().label("Branch"),
    client: Joi.string().required().label("Client"),
    entity: Joi.string().required().label("Entity")
  };

  handleChange = async ({ currentTarget: Input }) => {
    const { name, value } = Input;
    const { data } = this.state;
    data[name] = value;
    await this.setState({ data })
    await this.clientDatas(name)
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

  renderScheduleForm(scheduleType, data) {
    const {  prefixUrl, rightsData } = this.state;
    return <ScheduleList
      scheduleType={scheduleType}
      prefixUrl={prefixUrl}
      props={this.props}
      data={data}
      rightsData={rightsData}
      refreshTable={this.onSubmit}

    />
  }

  tableHide() {
    this.setState({
      isTableLoading: true
    })
  }

  addNavigation(formType) { //Navigate to Add module Page
    return <NavLink className="btn btn-primary btn-sm btn-right" to={`/schedule/add/${formType}`}>+ Add {formType}</NavLink>
  }


  onSubmit = async () => {
    this.tableHide();
    let data;
    const { scheduleType } = this.props.match.params;
    const { data: { client, entity, branch } } = this.state;

    let params = `client=${client}&entity=${entity}&branch=${branch}&type=${scheduleType}`
    const scheduleDetails = await getScheduleDetails(params)
    if (scheduleDetails.data.statusCode === 1) { //check the datas
      data = scheduleDetails.data.data
      await this.setState({
        tableData: data,
        isTableLoading: false
      })
    } else {
      let data = [];
      await this.setState({
        tableData: data,
        isTableLoading: false
      })
      this.renderScheduleForm(data)
    }

  }

  redirectTo = async () => {
    await this.setState({ isTableLoading: true });
    await this.feildCheck()
    await this.formApi.reset();
  }

  render() {
    const { scheduleType } = this.props.match.params
    const { isPageLoading, isLoading, tableData, clientIds, entityIds, branchIds, rightsData, excludeModules, isTableLoading,
      isClient, isEntity, isBranch, 
    } = this.state;
    let { keys: formTypeKeys, order: formTypeOrder } = Static.scheduleFormTypes();
    const { session } = this.props;
    let _form = _.upperFirst(scheduleType);
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
                    <BreadcrumbItem><NavLink to='/schedule/exam'>schedule</NavLink></BreadcrumbItem>
                    <BreadcrumbItem active>{scheduleType}</BreadcrumbItem>
                  </Breadcrumb>
                  <Container fluid>
                    <div className="mb-4 subnav-div">
                      {formTypeOrder.map((formType) =>
                        <NavLink key={formType} onClick={this.redirectTo} to={{ pathname: `/schedule/${formType}`, query: this.props.location.query }} className={classNames('subnav')} activeClassName="subnav-active" exact={true} >{formTypeKeys[formType]['label']}</NavLink>
                      )}
                    </div>
                    <Form getApi={this.setFormApi} onSubmit={this.onSubmit} >
                      {({ formApi, formState }) => (
                        <div>
                          
                          <div className="d-md-flex align-items-md-center justify-content-md-between">
                                            <h5 className="pg-title">{_form}</h5>
                                            <div style={{ textAlign: 'right' }}>
                            {rightsData && rightsData[_form] && rightsData[_form].create.value &&
                              this.addNavigation(scheduleType)
                            }
                          </div>
                                        </div> 
                          {isBranch && <section>
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

                              <Col sm={6} md={3} style={{ marginTop: "20px" }}>

                              </Col>
                            </Row>
                            <div className="text-right">
                              <button type="submit" className="btn btn-primary btn-sm">Submit</button>
                            </div>

                          </section>

                          }
                        </div>

                      )}
                    </Form>
                    {!isTableLoading && rightsData &&
                      this.renderScheduleForm(scheduleType, tableData)
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
