
import { Form } from 'informed';
import Joi from 'joi-browser';
import React, { Component, Fragment } from 'react';
import { Col, Row } from 'reactstrap';
import _ from 'lodash';
import moment from 'moment';

import { getselectData } from 'services/userService';
import { scheduleInsert, updateScheduleDetails } from 'services/scheduleService';
import { Input, CustomSelect, Textarea } from 'components/common/forms';
import DRP1 from 'components/common/forms/date-range-picker';
import ToastService from 'services/toastService'

export default class TermForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        client: "", entity: "", branch: "", department: "", batch: "",
      },
      clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [],
      exams: [{ id: "online", name: "online" }, { id: "offline", name: "offline" }],
      uid: '',
      errors: {},
      isLoading: true
    };


  }

  schema = {
    client: Joi.string().required(),
    entity: Joi.string().required(),
    branch: Joi.string().required(),
    department: Joi.string().required().label('Department'),
    batch: Joi.any().optional().label('Batch'),
    title: Joi.string().required(),
    date: Joi.string().required(),
    description: Joi.string().required(),
    starttime: Joi.string().required(),
    endtime: Joi.string().required(),
  }

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
    data.department = data.clients[0].departmentId;
    data.batch = data.clients[0].batchId;
    data.description = data.desc
    data.starttime = data.from.time
    data.endtime = data.to.time
    data.startDate = data.from.date
    data.endDate = data.to.date
    await this.setState({ data });
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

  async selectoptGet(url, type) {
    const data = await getselectData(url)
    if (data.data.statusCode === 1) {
      const Datas = data.data.data
      this.setState({ [type]: Datas });
    }
  }

  dateValue = async (date, field) => {
    const data = this.formApi.getState().values;
    const { from, to } = date;
    data[field] = { from: new Date(from).toLocaleDateString(), to: new Date(to).toLocaleDateString() };
    this.formApi.setValues(data);
    const data1 = this.formApi.getState().values;
    await _.keys(_.map(data1.entity)).forEach((item) => {
    });
  }

  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };

  setFormApi = (formApi) => {
    this.formApi = formApi
  }

  resetForm = () => {
    const { actiontype } = this.props
    this.formApi.reset()
    if (actiontype === 'edit') {
      let path = `/schedule/exam` //Redirect the page after updated the datas
      this.props.props.history.push({
        pathname: path,
        state: {
        }
      })
    }
  }


  onSubmit = async () => {
    const { actiontype } = this.props
    const data = this.formApi.getState().values
    let params, response, scheduleTermData;
    params = `client=${data.client}&entity=${data.entity}&branch=${data.branch}`

    scheduleTermData = {
      "type": "term",
      "clients": [{ "batchId": data.batch, "departmentId": data.department }],
      "title": data.title,
      "desc": data.description,
      "from": {
        "date": data.date.from,
        "time": data.starttime || ''
      },
      "to": { "date": data.date.to, "time": data.endtime || '' },

    }
  
    if (actiontype === "add") {
      response = await scheduleInsert(params, scheduleTermData)
    } else if (actiontype === "edit") {
      response = await updateScheduleDetails(params, scheduleTermData)
    }
    if (response.data.statusCode !== 1) return ToastService.Toast(response.data.message,  'default'); // Check Datas
    if (response.data.statusCode === 1) {
      await ToastService.Toast(response.data.message, 'default');
      this.resetForm();
    }
  }

  render() {
    const { actiontype } = this.props
    const { clientIds, entityIds, branchIds, departmentIds, batchIds } = this.state
    
    return (
      <Fragment>
        <h6>Add Term Schedule</h6>
        <Form getApi={this.setFormApi} onSubmit={this.onSubmit}>
          {({ formApi, formState }) => (
            <div>
              <section>
                <Row>
                  <Col sm={12} md={3}>
                    <CustomSelect field="client" label="Client" name="client" getOptionValue={option => option.code}
                      getOptionLabel={option => option.name} options={clientIds}
                      validateOnBlur validate={e => this.validateProperty('client', e)} onChange={this.handleChange} />
                  </Col>
                  <Col sm={12} md={3}>
                    <CustomSelect field="entity" label="Entity" name="entity" getOptionValue={option => option.code}
                      getOptionLabel={option => option.name} options={entityIds}
                      validateOnBlur validate={e => this.validateProperty('entity', e)} onChange={this.handleChange} />
                  </Col>
                  <Col sm={12} md={3}>
                    <CustomSelect field="branch" label="Branch" name="branch" getOptionValue={option => option.code}
                      getOptionLabel={option => option.name} options={branchIds}
                      validateOnBlur validate={e => this.validateProperty('branch', e)} onChange={this.handleChange} />
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
                        validateOnBlur validate={e => this.validateProperty('title', e)}
                      />
                    </Col>
                  }
                  {actiontype === 'edit' &&
                    <Col sm={12} md={3}>
                      <Input
                        field="title" label="Title*" name="title"
                        validateOnBlur validate={e => this.validateProperty('title', e)}
                        disabled
                      />
                    </Col>
                  }
                  <Col sm={12} md={5}>
                    <label>Date</label>
                    <DRP1 field="date" label="Date" id="date" startDate={moment(formState.values.startDate)} endDate={moment(formState.values.endDate)} onChange={(data) => this.dateValue(data, "date")} validate={e => this.validateProperty('date', e)} />
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
              <button type="submit" className="btn btn-primary btn-sm">Submit</button>
            </div>
          )}
        </Form>
      </Fragment>
    );
  }
}



