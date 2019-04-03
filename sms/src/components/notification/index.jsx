
import 'styles/user-form.scss';
import React, { Component, Fragment } from 'react';
import { Container } from 'reactstrap';
import { Col, Row } from 'reactstrap';
import Joi from 'joi-browser';
import { Form } from 'informed';
import { NavLink } from 'react-router-dom';

import Header from 'components/common/header';
import Loading from 'components/common/loading';
import SideNav from 'components/common/sideNav';
import { CustomSelect } from 'components/common/forms';
import Static from 'services/static';
import { getselectData } from 'services/userService'
import NotificationList from './list';
var classNames = require('classnames');


export default class Notification extends Component {
  state = {
    isPageLoading: false,
    isLoading: false,
    roleTable: false,
    clientIds: [], entityIds: [], branchIds: [],
    data: {
      client: '',
      entity: '',
      branch: '',
    },
    isClient: true, isEntity: true, isBranch: true, isDepartment: true, isBatch: true
  }

  async componentWillMount() {
    await this.props.isPageLoadingTrue();
  }

  async componentDidMount() {
    await this.init(this.props, true)
    await this.selectoptGet(`clients`, "clientIds")
    const { data } = this.state
    await this.formApi.setValues(data);
    await this.feildCheck();
    await this.props.isPageLoadingFalse();
  }

  async componentWillReceiveProps(props) {
    await this.init(props, false)
  }

  async init(props, isPageLoading = false) {

  }

  setFormApi = (formApi) => {
    this.formApi = formApi;
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
        await this.setState({ data, isClient: false, isEntity: false, isBranch: false, isDepartment: false, isBatch: false })
        await this.formApi.setValues(data);

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

  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };

  schema = {
    branch: Joi.string().required().label("Branch"),
    client: Joi.string().required().label("Client"),
    entity: Joi.string().required().label("Entity"),

  };

  handleChange = async ({ currentTarget: Input }) => {
    const { name, value } = Input;
    const { data } = this.state;
    data[name] = value;
    this.setState({
      [name]: value
    }, () => {
      if (this.state.batch) {
        this.getStudentList()
      }
    })

    switch (name) {
      case "client":
        this.selectoptGet(`namelist?client=${data.client}&type=client`, "entityIds")
        await this.setState({ roleTable: false, entity: "", branch: "", department: "", batch: "", branchIds: [], departmentIds: [], batchIds: [] })
        break;
      case "entity":
        this.selectoptGet(`namelist?client=${data.client}&type=entity&entity=${data.entity}`, "branchIds")
        await this.setState({ roleTable: false, branch: "", department: "", batch: "", departmentIds: [], batchIds: [] })
        break;
      default: break;
    }
  }

  onSubmit = async () => {
      
  }

  renderNotificationForm(notificationtype, data) {
    return <NotificationList data={data} notificationtype={notificationtype} props={this.props} />
  }

  render() {
    console.log(this.props)
    const { notificationtype } = this.props.match.params
    console.log(notificationtype)
    const { isPageLoading, isLoading, clientIds, entityIds, branchIds, roleTable, roles } = this.state;
    const { keys: formTypeKeys, order: formTypeOrder } = Static.notificationsFormTypes();
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
                  <Container fluid>
                    <div className="mb-4 subnav-div">
                      {formTypeOrder.map((notificationtype) =>

                        <NavLink key={notificationtype} onClick={redirectTo} to={{ pathname: `/notification/${notificationtype}`, query: this.props.location.query }} className={classNames('subnav')} activeClassName="subnav-active" exact={true} >{formTypeKeys[notificationtype]['label']}</NavLink>
                      )}
                    </div>
                    <Form getApi={this.setFormApi} onSubmit={this.onSubmit} >
                      {({ formApi, formState }) => (
                        <div>
                          <section>
                            <Row>
                              <Col sm={6} md={3}>
                                <CustomSelect field="client" label="Client*" name="client" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('client', e)} onChange={this.handleChange} options={clientIds} />
                              </Col>
                              <Col sm={6} md={3}>
                                <CustomSelect field="entity" label="Entity*" name="entity" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('entity', e)} onChange={this.handleChange} options={entityIds} />
                              </Col>
                              <Col sm={6} md={3}>
                                <CustomSelect field="branch" label="Branch*" name="branch" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('branch', e)} onChange={this.handleChange} options={branchIds} />
                              </Col>       
                              <Col sm={6} md={3} style={{ textAlign: "center", marginTop: "23px" }}>
                                <button type="submit" className="btn btn-primary btn-sm">Submit</button>
                              </Col>
                            </Row>
                          </section>
                        </div>
                      )}
                    </Form>
                    {roles && roleTable &&
                      this.renderNotificationForm(notificationtype)
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

function redirectTo() {
  return window.location.reload()
}
