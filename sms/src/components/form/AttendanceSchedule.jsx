import React, { Component, Fragment } from 'react';
import { Form } from 'informed';
import Joi from 'joi-browser';
import { Col, Row } from 'reactstrap';
import moment from 'moment';
import _ from 'lodash';

import { Input, CustomSelect, Textarea } from 'components/common/forms';
import DRP1 from 'components/common/forms/date-range-picker';
import { getselectData } from 'services/userService';
import { scheduleInsert, updateScheduleDetails } from 'services/scheduleService';
import ToastService from 'services/toastService'

export default class AttendanceForm extends Component {
  state = {
    data: {
      client: "", entity: "", branch: "", department: "", batch: "", from: '', to: ''
    },
    clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [],
    uid: '',
    errors: {},
    isLoading: true,
    isEditForm: false,
  };

  async componentDidMount() {
    const { data } = this.state
    this.selectoptGet(`clients`, "clientIds")
    this.formApi.setValues(data);
    const { actiontype } = this.props
    if (actiontype === "edit") {
      this.setState({ isEditForm: true });
      const { location: { state } } = this.props.props;
      if (state !== undefined)
        return this.formStateCheck(state.scheduledata);
    }
  }

  formStateCheck = async (data) => {
   
    data.noOfTimesTaken = data.attendance[0].noOfTimesTaken;
    data.description = data.desc;
    data.department = data.clients[0].departmentId;
    data.batch = data.clients[0].batchId;
    data.startDate = data.from.date;
    data.endDate = data.to.date;
    await this.setState({ data, });
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

  handleChange = async ({ currentTarget: Input }) => {
    const { name, value } = Input;
    const { data } = this.state;
    data[name] = value;
    this.setState({
      [name]: value
    }, () => {
    })
    await this.clientDatas(name);
  }

  clientDatas = async (name) => {// Get the Client,Entity,Branch,Department,Batch,EventName Lists
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
      default:
      break;
    }
  }

  schema = { //validatings all the feilds
    client: Joi.string().required().label('Client'),
    entity: Joi.string().required().label('Entity'),
    branch: Joi.string().required().label('Branch'),
    department: Joi.string().required().label('Department'),
    batch: Joi.string().required().label('Batch'),
    title: Joi.string().required().label('Title'),
    date: Joi.string().required().label('Date'),
    description: Joi.string().empty('').optional(),
    noOfTimesTaken: Joi.string().required().label('NumberOfTimesTaken'),
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
   
    data[field] =  { from: new Date(from).toLocaleDateString(), to: new Date(to).toLocaleDateString() };
    this.formApi.setValues(data);
    const data1 = this.formApi.getState().values;
   
    // data.startDate = 
  

    await _.keys(_.map(data1.entity)).forEach((item) => {
    });
  }

  setFormApi = (formApi) => {
    this.formApi = formApi
  }

  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };

  resetForm = () => { //Reset the values after Submission
    const { actiontype } = this.props
    this.formApi.reset()
    if (actiontype === 'edit') {
        let path = `/schedule/attendance` //Redirect the page after updated the datas
        this.props.props.history.push({
            pathname: path,
            state: {
            }
        })
    }
  }

  onSubmit = async () => {
    let response;
    const { actiontype } = this.props
    const data = this.formApi.getState().values
    let scheduleAttendanceDatas = {
      "to": { "date": data.date.to },
      "attendance": { "noOfTimesTaken": data.noOfTimesTaken },
      "desc": data.description,
      "from": { "date": data.date.from },
      "title": data.title,
      "clients": [{
        "batchId": data.batch,
        "departmentId": data.department
      }],
      "type": "attendance",
    }
    let params = `client=${data.client}&entity=${data.entity}&branch=${data.branch}`
    if (actiontype === 'add')
      response = await scheduleInsert(params, scheduleAttendanceDatas)
    else if (actiontype === 'edit')
      response = await updateScheduleDetails(params, scheduleAttendanceDatas)
    if (response.data.statusCode !== 1) return ToastService.Toast(response.data.message,  'default'); // Check Datas
    if (response.data.statusCode === 1) {
      await ToastService.Toast(response.data.message,  'default');
      this.resetForm();
    }
  }

  render() {
    const { actiontype } = this.props
    const { clientIds, entityIds, branchIds, departmentIds, batchIds,  } = this.state

    return (
      <Fragment>
        <Form getApi={this.setFormApi} onSubmit={this.onSubmit} >
          {({ formApi, formState }) => (
            <div>
              <section>
                <Row>
                  <p>{formState.values.startDate}</p>
                  {/* <br/>
                  <p>{formState.values.createdAt}</p> */}

                  {/* <p>{formState.values.from.date}</p> */}

                  <Col sm={12} md={3}>
                    <CustomSelect field="client" label="Client*" name="client" getOptionValue={option => option.code} validateOnBlur validate={e => this.validateProperty('client', e)} getOptionLabel={option => option.name} options={clientIds}
                      onChange={this.handleChange} />
                  </Col>
                  <Col sm={12} md={3}>
                    <CustomSelect field="entity" label="Entity*" name="entity" getOptionValue={option => option.code} validateOnBlur validate={e => this.validateProperty('entity', e)} getOptionLabel={option => option.name} options={entityIds}
                      onChange={this.handleChange} />
                  </Col>
                  <Col sm={12} md={3}>
                    <CustomSelect field="branch" label="Branch*" name="branch" getOptionValue={option => option.code} validateOnBlur validate={e => this.validateProperty('branch', e)} getOptionLabel={option => option.name} options={branchIds}
                      onChange={this.handleChange} />
                  </Col>
                  <Col sm={12} md={3}>
                    <CustomSelect field="department" label="Department*" name="department" getOptionValue={option => option.code}
                      getOptionLabel={option => option.name} options={departmentIds}
                      onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('department', e)} />
                  </Col>
                  <Col sm={12} md={3}>
                    <CustomSelect field="batch" label="Batch*" name="batch" getOptionValue={option => option.code}
                      getOptionLabel={option => option.name} options={batchIds}
                      onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('batch', e)} />
                  </Col>
                </Row>
              </section>
              <section>
                <Row>
                  {actiontype === 'add' &&
                    <Col sm={12} md={3}>
                      <Input
                        field="title" label="Title*" name="title"
                        validate={e => this.validateProperty('title', e)}
                      />
                    </Col>}
                  {actiontype === 'edit' &&
                    <Col sm={12} md={3}>
                      <Input
                        field="title" label="Title*" name="title"
                        validate={e => this.validateProperty('title', e)}
                        disabled
                      />
                    </Col>}
                  <Col sm={12} md={5}>
                    <label>Date</label>
                    {/* <DRP1 field="date" label="Date*" id="date" onChange={(data) => this.dateValue(data, "date")}  validate={e => this.validateProperty('date', e)} /> */}
                    <DRP1 field="date" label="Date*" id="date" startDate={moment(formState.values.startDate)} endDate={moment(formState.values.endDate)} onChange={(data) => this.dateValue(data, "date")} validate={e => this.validateProperty('date', e)} />
                  </Col>
                </Row>
                <Row>
                  <Col sm="12" md="12">
                    <Textarea
                      field="description" label="Description" name="description"
                      validateOnBlur validate={e => this.validateProperty('description', e)}
                    />
                  </Col>
                </Row>
              </section>
              <section>
                <Col sm={12} md={3}>
                  <Input
                    field="noOfTimesTaken" label="NumberOfTimesTaken*" name="noOfTimesTaken"
                    validate={e => this.validateProperty('noOfTimesTaken', e)}
                  />
                </Col>
              </section>
              <button type="submit" className="btn btn-primary btn-sm">Submit </button>
            </div>
          )}
        </Form>
      </Fragment>
    );
  }
}



