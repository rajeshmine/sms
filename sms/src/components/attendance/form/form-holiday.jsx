import React, { Component, Fragment } from 'react';
import { Form } from 'informed';
import Joi from 'joi-browser';
import { Col, Row } from 'reactstrap';
import moment from 'moment';
import { Input, CustomSelect } from 'components/common/forms';
import DRP1 from 'components/common/forms/date-range-picker';
import { getselectData } from 'services/userService';
import { addHoliday, updateHoliday } from 'services/attendanceService';
import ToastService from 'services/toastService'


export default class HolidayForm extends Component {
  state = {
    data: {
      client: "", entity: "", branch: "", department: "", batch: "",
    },
    clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [],
    uid: '',
    errors: {},
    isLoading: true,
    isEditForm: false,
    startDate: '',
    endDate: '',
    isClient: true, isEntity: true, isBranch: true, isDepartment: true, isBatch: true

  };

  async componentDidMount() {

    const { data } = this.state
    this.selectoptGet(`clients`, "clientIds")
    await this.feildCheck()

    this.formApi.setValues(data);
    const { actiontype } = this.props.props.match.params

    if (actiontype === "edit") {
      this.setState({ isEditForm: true });
      const { location: { state } } = this.props.props;
      if (state !== undefined)


        return this.formStateCheck(state.data);
    }
  }

  schema = {
    client: Joi.string().required().label('Client'),
    entity: Joi.string().required().label('Entity'),
    branch: Joi.string().required().label('Branch'),
    department: Joi.string().required().label('Department'),
    batch: Joi.any().optional(),
    title: Joi.string().required().label('Title'),
    date: Joi.string().required().label('Date'),
  }

  handleChange = async ({ currentTarget: Input }) => {
    const { name, value } = Input;
    const { data } = this.state;
    data[name] = value;
    this.setState({
      [name]: value
    })
    await this.clientDatas(name);
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

  formStateCheck = async (data) => {

    data.department = data.clients[0].departmentId
    data.batch = data.clients[0].batchId
    data.startDate = data.holidayDate.from
    data.endDate = data.holidayDate.to

    await this.setState({ data, department: data.department, batch: data.batch, startDate: data.holidayDate.from, endDate: data.holidayDate.to });
    try {
      await this.clientDatas('client');
      await this.clientDatas('entity');
      await this.clientDatas('branch');
      await this.clientDatas('department');
      await this.clientDatas('batch');
      await this.formApi.setValues(data);

    } catch (err) {
      this.handleError(err);
    }
  }

  handleError(...err) {
    return ToastService.Toast("Something went wrong.Please try again later", 'default');
  }

  clientDatas = async (name) => { // Get the Client,Entity,Branch,Department,Batch,EventName Lists
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

  async selectoptGet(url, type) {
    const data = await getselectData(url)
    if (data.data.statusCode === 1) {
      const Datas = data.data.data
      this.setState({ [type]: Datas });
    }
  }

  dateValue = async (date, field) => { // Get dates from the data range picker
    const data = this.formApi.getState().values;
    const { from, to } = date;
    data[field] = { from: new Date(from).toLocaleDateString(), to: new Date(to).toLocaleDateString() };
    data.startDate = data.date.from;
    data.endDate = data.date.to;
    this.formApi.setValues(data);

  }

  setFormApi = (formApi) => {
    this.formApi = formApi
  }

  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };

  resetForm = () => {
    this.formApi.reset()
  }



  onSubmit = async () => {
    const { actiontype } = this.props
    const data = this.formApi.getState().values
    let params, response, holidayData;
    params = `client=${data.client}&entity=${data.entity}&branch=${data.branch}&type=subject`

    holidayData = {
      "title": data.title,
      "holidayDate": {
        "from": data.startDate,
        "to": data.endDate

      },
      "clients": [{
        "departmentId": data.department,
        "batchId": data.batch
      }
      ]
    }
    if (actiontype === "add") {
      response = await addHoliday(params, holidayData)
    } else if (actiontype === "edit") {
      response = await updateHoliday(params, holidayData)
    }
    if (response.data.statusCode !== 1) return ToastService.Toast(response.data.message, 'default'); // Check Datas
    if (response.data.statusCode === 1) {
      await ToastService.Toast(response.data.message, 'default');
      const { props } = this.props;
      props.history.goBack();

    }
  }

  render() {
    const { clientIds, entityIds, branchIds, departmentIds, batchIds,
      isClient, isEntity, isBranch, isDepartment, isBatch
    } = this.state

    return (
      <Fragment>
        <h6>Add Holiday</h6>
        <Form getApi={this.setFormApi} onSubmit={this.onSubmit} >
          {({ formApi, formState }) => (


            <div>

              {isBatch && <section>
                <h6>Client Details</h6>

                <Row>
                  {isClient && <Col sm={12} md={3}>
                    <CustomSelect field="client" label="Client*" name="client" getOptionValue={option => option.code} validateOnBlur validate={e => this.validateProperty('client', e)} getOptionLabel={option => option.name} options={clientIds}
                      onChange={this.handleChange} />
                  </Col>}
                  {isEntity && <Col sm={12} md={3}>
                    <CustomSelect field="entity" label="Entity*" name="entity" getOptionValue={option => option.code} validateOnBlur validate={e => this.validateProperty('entity', e)} getOptionLabel={option => option.name} options={entityIds}
                      onChange={this.handleChange} />
                  </Col>}
                  {isBranch && <Col sm={12} md={3}>
                    <CustomSelect field="branch" label="Branch*" name="branch" getOptionValue={option => option.code} validateOnBlur validate={e => this.validateProperty('branch', e)} getOptionLabel={option => option.name} options={branchIds}
                      onChange={this.handleChange} />
                  </Col>}
                  {isDepartment && <Col sm={12} md={3}>
                    <CustomSelect field="department" label="Department*" name="department" getOptionValue={option => option.code}
                      getOptionLabel={option => option.name} options={departmentIds}
                      onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('department', e)} />
                  </Col>}
                  {isBatch && <Col sm={12} md={3}>
                    <CustomSelect field="batch" label="Batch" name="batch" getOptionValue={option => option.code}
                      getOptionLabel={option => option.name} options={batchIds}
                      onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('batch', e)} />
                  </Col>}
                </Row>
              </section>}
              <section>
                <Row>
                  <Col sm={12}>
                    <h6>Holiday Details</h6>
                  </Col>
                </Row>
                <Row>
                  <Col sm={12} md={3}>
                    <Input
                      field="title" label="Title*" name="title" autocomplete="off"
                      validate={e => this.validateProperty('title', e)}
                    />
                  </Col>

                  <Col sm={12} md={5}>
                    <label>Date*</label>
                    <DRP1 field="date" label="Date" id="date" startDate={moment(formState.values.startDate)} endDate={moment(formState.values.endDate)} onChange={(data) => this.dateValue(data, "date")} validate={e => this.validateProperty('date', e)} />
                  </Col>
                </Row>

              </section>

              <div className="text-right">
                <button type="submit" className="btn btn-primary btn-sm">Submit</button>
              </div>
            </div>
          )}
        </Form>
      </Fragment>
    );
  }
}