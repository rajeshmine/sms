import React, { Component, Fragment } from 'react';

import ToastService from 'services/toastService'
import { Container, Row, Col, Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { NavLink } from 'react-router-dom';
import { Form, Scope } from 'informed';
import { getselectData } from 'services/userService'
import { addSubjectWeight, updateSubjectWeight } from 'services/gradeService'
import { getSubjectsList } from 'services/scheduleService'

import Joi from 'joi-browser';
import _ from 'lodash'

import { CustomSelect, Input } from 'components/common/forms';

export default class SubjectWeight extends Component {

  constructor(props) {
    super(props)
    this.state = {
      data: {
        credits: [],
      },
      isEditForm: false,
      formActionType: false,
      clientIds: [], entityIds: [], branchIds: [],
      isClient: true, isEntity: true, isBranch: true, isDepartment: true, isBatch: true

    }
  }

  async componentDidMount() {
    await this.init();
    await this.feildCheck();
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
    displayName: Joi.string().required().label("DisplayName"),
    creditPoint: Joi.string().required().label("Credit Point"),
  };

  init = async () => {
    const { data } = this.state
    await this.selectoptGet(`clients`, "clientIds")
    await this.formApi.setValues(data);
    const { actionType } = this.props
    this.setState({ isEditForm: false });
    if (actionType === 'edit')
      this.setState({ isEditForm: true });


    await this.setState({ formActionType: (actionType === 'view') })

    const { location: { state } } = this.props.props;
    if (state !== undefined && state.isFromView)
      return this.getSampleData(state);

  }

  getSampleData = async (data) => {

    await this.setState({ data });

    try {
      await this.clientDatas('client');
      await this.clientDatas('entity');
      await this.clientDatas('branch');

      await this.formApi.setValues(data);
    } catch (err) {
      this.handleError(err);
    }

  }
  setFormApi = (formApi) => {
    this.formApi = formApi;
  }

  handleChange = async ({ currentTarget: Input }) => {
    const { name, value } = Input;
    const { data } = this.state;
    data[name] = value;
    this.setState({ [name]: value })

    this.clientDatas(name);
  }

  clientDatas = async (name) => {
    const { data} = this.state;
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
      case "departmentId":
        await this.subjectList();
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

  subjectList = async () => {
    try {
      const { data: { client, entity, branch, departmentId }, data } = this.state
      let params = `client=${client}&entity=${entity}&branch=${branch}&type=subject&departmentId=${departmentId}`;

      let res = await getSubjectsList(params);

      const { data: { statusCode } } = res;
      if (statusCode === 1) {

        let credits = [];
        await _.map(res.data.data, v => { credits.push({ displayName: v["displayName"], subject: v['code'], creditPoint: '' }) });
        data["credits"] = credits;
        await this.setState({ data })
        await this.formApi.setValues(data);
      } else {
        return ToastService.Toast("Somthig went wrong.Please try again later", "default");
      }
    } catch (err) {
      this.handleError(err)
    }
  }



  onSubmit = async () => {
    const { isEditForm } = this.state;
    let data = this.formApi.getState().values;
    var res = '';
    try {
      if (!isEditForm) {
        res = await addSubjectWeight(data);
      } else {
        res = await updateSubjectWeight(data);
      }
      const { data: { statusCode, message } } = res;
      if (statusCode === 1) {
        await ToastService.Toast(message, "default");
        return this.redirectTo();
      } else {
        return ToastService.Toast("Somthig went wrong.Please try again later", "default");
      }
    } catch (err) {
      this.handleError(err)
    }
  }

  redirectTo = async () => {
    const { isEditForm } = this.state;
    const { props } = this.props;

    if (isEditForm) {
      await props.history.goBack();
    } else {
      window.location.reload();
    }
  }

  handleError(...err) {
    return ToastService.Toast("Somthig went wrong.Please try again later", "default");
  }




  render() {
    const { clientIds, entityIds, branchIds, departmentIds, formActionType,isClient, isEntity, isBranch, isDepartment } = this.state
    const { actionType } = this.props
    return (
      <Fragment>
        <Container fluid>
          <Breadcrumb>
            <BreadcrumbItem><NavLink to="/dashboard">Dashboard</NavLink></BreadcrumbItem>
            <BreadcrumbItem><NavLink to="/grade/subjectWeitage">Subject Weitage</NavLink></BreadcrumbItem>
            <BreadcrumbItem active>{actionType} Subject Weitage</BreadcrumbItem>
          </Breadcrumb>
          <div className="mb-4">
            <h6>{actionType} Subject Weitage</h6>
          </div>
          <Form getApi={this.setFormApi} onSubmit={this.onSubmit} >
            {({ formApi, formState }) => (
              <div>
                {isDepartment &&
                <section>
                  <Row>
                    {isClient &&
                    <Col sm={6} md={3}>
                      <CustomSelect field="client" label="Client*" name="client" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('client', e)} onChange={this.handleChange} options={clientIds} disabled={formActionType} />
                    </Col>}
                    {isEntity &&
                    <Col sm={6} md={3}>
                      <CustomSelect field="entity" label="Entity*" name="entity" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('entity', e)} onChange={this.handleChange} options={entityIds} disabled={formActionType} />
                    </Col>
                    }
                    {isBranch &&
                    <Col sm={6} md={3}>
                      <CustomSelect field="branch" label="Branch*" name="branch" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('branch', e)} onChange={this.handleChange} options={branchIds} disabled={formActionType} />
                    </Col>
                    }
                    {isDepartment &&
                    <Col sm={12} md={3}>
                      <CustomSelect field="departmentId" label="Department*" name="department" getOptionValue={option => option.code}
                        getOptionLabel={option => option.name} options={departmentIds}
                        validateOnBlur validate={e => this.validateProperty('departmentId', e)} onChange={this.handleChange} />
                    </Col>
                    }
                  </Row>
                </section>}
                <section>
                  {formState.values.credits && formState.values.credits.map((subject, i) =>
                    <Scope scope={`credits[${i}]`} key={i}>
                      <Row>
                        <Col sm={6} md={6}>
                          <Input field="displayName" label="Subject Name*" validateOnBlur validate={e => this.validateProperty('displayName', e)} readOnly />
                        </Col>
                        <Col sm={12} md={4}>
                          <Input
                            field="creditPoint" label="Credit Point*"
                            validateOnBlur validate={e => this.validateProperty('creditPoint', e)}
                          />
                        </Col>
                      </Row>
                      <hr></hr>
                    </Scope>
                  )}

                </section>
                {!formActionType && <button type="submit" className="btn btn-primary btn-sm">Submit</button>}

              </div>
            )}
          </Form>
        </Container>


      </Fragment>
    )
  }
}
