import React, { Component, Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import { Container } from 'reactstrap';
import Joi from 'joi-browser';
import { Form } from 'informed';
import { Col, Row } from 'reactstrap';
import {
 
  Breadcrumb,
  BreadcrumbItem
} from 'reactstrap';
import ToastService from 'services/toastService';
import Static from 'services/static';
import FeesList from './list';
import Header from 'components/common/header';
import SideNav from 'components/common/sideNav';
import Loading from 'components/common/loading';
import { CustomSelect, } from 'components/common/forms';
import { getselectData } from 'services/userService'
import { getfeesDetails, getfeecategory } from 'services/feeService'
import { getFeeallocation } from 'services/feeService';
import { rightsData } from 'services/rolesService';
import _ from 'lodash';
var classNames = require('classnames');


export default class Fees extends Component {
  state = {
    data: [],
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
    clientIds: [], entityIds: [], branchIds: [],
    eventTable: false,
    isClient: true, isEntity: true, isBranch: true, isDepartment: true, isBatch: true
  }

  async componentWillMount() {
    await this.props.isPageLoadingTrue();
  }

  async componentDidMount() {
    const { session } = this.props;
    await this.rightsData(session);
    await this.selectoptGet(`clients`, "clientIds")
    await this.feildCheck();
    await this.props.isPageLoadingFalse();
  }

  rightsData = async (session) => {
    let res = await rightsData("fee", session);
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
    const { feesType } = this.props.match.params
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
        if (feesType === "feeallocation")
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
        if (feesType === "feeallocation")
          await this.onSubmit();
        break;
      default:
        data['client'] = client || code;
        data['entity'] = entity || code;
        data['branch'] = branch || branchId;
        data['department'] = department || departmentId;
        data['batch'] = batch || batchId;
        await this.setState({ data, isClient: false, isEntity: false, isBranch: false, isDepartment: false, isBatch: false });
        await this.setState({ data, isClient: false, isEntity: false, isBranch: false, isDepartment: false });
        await this.clientDatas('branch');
        await this.clientDatas('department');
        await this.clientDatas('batch');

        await this.formApi.setValues(data);
        if (feesType === "feeallocation")
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
    category: Joi.any().required().label('Category'),
  };

  async getCategory() {
    var categoriesArray = []
    const { data: { client, entity, branch } } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}`;
    try {
      const feeCategory = await getfeecategory(params)
      if (feeCategory.data.statusCode === 1) {
        let data = feeCategory.data.data
        for (var i = 0; i < data.length; i++) {
          categoriesArray.push({ 'name': data[i].category, 'code': data[i]._id })
        }
        await this.setState({
          allCategories: categoriesArray
        })
      } else {
        return ToastService.Toast("Somthig went wrong.Please try again later", "default");
      }
    } catch (err) {
      this.handleError(err);
    }
  }

  handleChange = async ({ currentTarget: Input }) => {
    const { name, value } = Input;
    const { data } = this.state;
    data[name] = value;
    await this.setState({
      [name]: value
    });
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
        await this.setState({ department: "", batch: "", batchIds: [] })
        await this.getCategory()
        break;
      case "department":
        await this.selectoptGet(`namelist?client=${data.client}&type=department&entity=${data.entity}&branch=${data.branch}&department=${data.department}`, "batchIds")
        await this.setState({ batch: "" })
        break;
      case "batch":

        break;
      default:
        break;
    }
  }


  onSubmit = async () => {
    const { feesType } = this.props.match.params
    if (feesType === "feeallocation") return this.feeallocationList("feeallocation")
    if (feesType === "feecollection") return this.feecollectionList("feecollection")
  }


  feeallocationList = async () => {
    let data = '';
    const { data: { client, entity, branch } } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}`
    const FeeallocationDetails = await getFeeallocation(params)
    if (FeeallocationDetails.data.statusCode === 1) { //check the datas
      data = FeeallocationDetails.data.data
      await this.setState({
        tableData: data,
        feesTable: true,
        client, entity, branch
      })
    } else {
      ToastService.Toast(`No Data Found!!!`, "default")
    }
  }

  feecollectionList = async () => {

    const { data: { client, entity, branch, department, category } } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}&departmentId=${department}&feeid=${category}`;
    const feeDetails = await getfeesDetails(params)
    let data = feeDetails.data.data;
    this.setState({
      tableData: data,
      feesTable: true
    })
  }

  renderFeesForm(feesType, data) {//Pass the datas to the FeeallocationList
    const { rightsData } = this.state;
    return <FeesList
      feesType={feesType}
      data={data} props={this.props} details={this.state.data}
      rightsData={rightsData}
    />
  }

  redirectTo = async () => {
    await this.setState({ feesTable: false })
    await this.feildCheck()
    await this.formApi.reset();
  }

  render() {
    const { feesType } = this.props.match.params
   
    const { isPageLoading, isLoading,  tableData, client, entity, branch, clientIds, entityIds, branchIds, departmentIds, batchIds, rightsData, excludeModules,
      isClient, isEntity, isBranch, isDepartment, isBatch } = this.state;
    let { keys: formTypeKeys, order: formTypeOrder } = Static.feesFormTypes();
    const { session } = this.props;
    let _form = feesType;
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
                    <BreadcrumbItem><NavLink to='/fees/feeallocation'>Fees</NavLink></BreadcrumbItem>
                    <BreadcrumbItem active>{feesType}</BreadcrumbItem>
                  </Breadcrumb>
                  <Container fluid>



                    <div className="mb-4 subnav-div">
                      {formTypeOrder.map((feesType) =>
                        <NavLink key={feesType} onClick={this.redirectTo} to={{ pathname: `/fees/${feesType}`, query: this.props.location.query }} className={classNames('subnav')} activeClassName="subnav-active" exact={true} >{formTypeKeys[feesType]['label']}</NavLink>
                      )}
                    </div>

                    {feesType !== "feecollection" ?

                      <div style={{ textAlign: 'right' }}  >
                        {rightsData && rightsData[_form] && rightsData[_form].create.value &&
                          <NavLink className="btn btn-primary btn-sm" to={`add/${feesType}`}>+ {feesType} </NavLink>
                        }

                      </div>

                      : ''}

                    <Form getApi={this.setFormApi} onSubmit={this.onSubmit} >
                      {({ formApi, formState }) => (
                        <div>
                          {(isBranch || feesType !== 'feeallocation') &&
                            <section>
                              <Row>

                                <Col sm={12}>
                                  <h6>CLIENT DETAILS</h6>
                                </Col>
                              </Row>
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
                                {
                                  isDepartment && feesType !== 'feeallocation' ?
                                    <Col sm={6} md={3}>
                                      <CustomSelect field="department" label="Department" name="department" getOptionValue={option => option.code}
                                        getOptionLabel={option => option.name} options={departmentIds}
                                        validateOnBlur validate={e => this.validateProperty('department', e)} onChange={this.handleChange} />
                                    </Col> :
                                    ''}

                              </Row>
                              {
                                feesType !== 'feeallocation' ?
                                  <Row>
                                    {isBatch &&
                                      <Col sm={6} md={3}>
                                        <CustomSelect field="batch" label="Batch" name="batch" getOptionValue={option => option.code}
                                          getOptionLabel={option => option.name} options={batchIds}
                                          validateOnBlur validate={e => this.validateProperty('batch', e)} onChange={this.handleChange} />
                                      </Col>
                                    }
                                    <Col sm={6} md={3}>
                                      <CustomSelect field="category" label="Fee Category*" name="category" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={this.state.allCategories} validateOnBlur validate={e => this.validateProperty('category', e)} onChange={this.handleChange} />
                                    </Col>
                                  </Row> :
                                  ''}

                              <Row>


                                <Col sm={12} md={12} style={{ textAlign: 'right' }}>
                                  <button type="submit" className="btn btn-primary btn-sm">Submit</button>
                                </Col>

                              </Row>

                            </section>
                          }
                        </div>
                      )}
                    </Form>
                    <br />
                    {this.state.feesTable && rightsData &&
                      this.renderFeesForm(feesType, tableData, client, entity, branch)
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
