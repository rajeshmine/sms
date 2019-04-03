import React, { Component, Fragment } from 'react';

import ToastService from 'services/toastService'
import { Container, Row, Col, Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { NavLink } from 'react-router-dom';
import { Form } from 'informed';
import { getselectData } from 'services/userService'
import { addScholastics, updateScholastics, getSkills } from 'services/gradeService'

import Joi from 'joi-browser';

import { CustomSelect, Input } from 'components/common/forms';

export default class Scholastics extends Component {

  constructor(props) {
    super(props)
    this.state = {
      data: {},
      isEditForm: false,
      formActionType: false,
      clientIds: [], entityIds: [], branchIds: [],
      types: [
        { name: 'Scholastic Assessment', code: 'scholastics' },
        { name: 'Co-Scholastic Assessment', code: 'co-scholastics' }
      ],
      testModes: [],
      isClient: true, isEntity: true, isBranch: true, isDepartment: true, isBatch: true

    }
  }

  async componentDidMount() {
    await this.init();
    await this.feildCheck()

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
    type: Joi.string().required().label("Type"),
    mode: Joi.string().required().label("Assessment Name"),
    weightage: Joi.string().required().label("Weightage")
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
      await this.clientDatas('type');

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
      case "type":
        await this.getCCESkills()
        break;
      default:
        break;
    }
  }

  feildCheck = async () => {
    let { session: { data: sessionData } } = this.props.props;
    const { data } = this.state
    const { userType, userLevel, client, entity, branch, code, branchId} = sessionData;
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

        await this.setState({ data, isClient: false, isEntity: false, isBranch: false, isDepartment: false })
        await this.clientDatas('client');
        await this.clientDatas('entity');
        await this.clientDatas('branch');

        await this.formApi.setValues(data);
        break;
      default:
        data['client'] = client || code;
        data['entity'] = entity || code;
        data['branch'] = branch || branchId;

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
    } else {
      ToastService.Toast(`${type} Data Not Found!!!`, "default")
    }
  }

  getCCESkills = async () => {
    const { data: { client, entity, branch, type } } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}&type=${type}`;
    try {
      const res = await getSkills(params);
      if (res.data.statusCode === 1) {
        let data = res.data.data;
        await this.setState({ testModes: data })
      } else if (res.data.statusCode === 0) {
        await ToastService.Toast(`No Data Found!!!`, "default")
        await this.setState({ testModes: [] })
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
        res = await addScholastics(data);
      } else {
        data['id'] = data['_id']
        res = await updateScholastics(data);
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
    const { clientIds, entityIds, branchIds, formActionType, types,  isClient, isEntity, isBranch } = this.state
    const { actionType } = this.props
    return (


      <Fragment>
        <Container fluid>
          <Breadcrumb>
            <BreadcrumbItem><NavLink to="/dashboard">Dashboard</NavLink></BreadcrumbItem>
            <BreadcrumbItem><NavLink to="/grade/assessmentWeitage">Assessment Weitage</NavLink></BreadcrumbItem>
            <BreadcrumbItem active>{actionType} Assessment Weitage</BreadcrumbItem>
          </Breadcrumb>
          <div className="mb-4">
            <h6>{actionType} Assessment Weightage</h6>
          </div>
          <Form getApi={this.setFormApi} onSubmit={this.onSubmit} >
            {({ formApi, formState }) => (
              <div>
                {isBranch &&
                  <section>
                    <Row>
                      {isClient &&
                        <Col sm={6} md={3}>
                          <CustomSelect field="client" label="Client*" name="client" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('client', e)} onChange={this.handleChange} options={clientIds} disabled={formActionType} />
                        </Col>
                      }
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
                    </Row>
                  </section>
                }
                <section>
                  <Row>
                    <Col sm={6} md={3}>
                      <CustomSelect field="type" label="Type *" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('type', e)} onChange={this.handleChange} options={types} disabled={formActionType} />
                    </Col>
                    <Col sm={6} md={3}>
                      <Input field="mode" label="Assessment Name *" validateOnBlur validate={e => this.validateProperty('weightage', e)} readOnly={formActionType} />
                    </Col>
                    <Col sm={6} md={3}>
                      <Input field="weightage" label="Weightage *" validateOnBlur validate={e => this.validateProperty('weightage', e)} readOnly={formActionType} />
                    </Col>
                  </Row>
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
