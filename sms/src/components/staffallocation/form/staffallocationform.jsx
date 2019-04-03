import Joi from 'joi-browser';
import React, { Fragment, Component } from 'react';
import { Form } from 'informed';
import { Row, Col, } from 'reactstrap';
import moment from 'moment';

import {  CustomSelect, SDP, Textarea, RTimePicker } from 'components/common/forms';
import { getselectData } from 'services/userService'
import { getSubjectsList } from 'services/scheduleService';
import { InsertStaffAlloc, getStaffAllocList, editStaffAllocation } from 'services/staffAllocationService';
import ToastService from 'services/toastService';
import { getstaffList } from 'services/timetableService'

export default class AddStaffAllocation extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: {},
      clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [], studentList: [],
      staffData: [],
      formValues: [],
      isEditForm: false,
      days: [{ code: "Monday", name: "Monday" }, { code: "Tuesday", name: "Tuesday" }, { code: "Wednesday", name: "Wednesday" }, { code: "Thursday", name: "Thursday" }, { code: "Friday", name: "Friday" }, { code: "Saturday", name: "Saturday" }],
    }
  }

  schema = {
    department: Joi.string().required().label("Department"),
    client: Joi.string().required().label("Client"),
    entity: Joi.string().required().label("Entity"),
    branch: Joi.string().required().label("Branch"),
    batch: Joi.string().required().label("Batch"),
    staffId: Joi.string().required().label("Staff Name"),
    date: Joi.string().required().label("Date"),
    description: Joi.any().optional(),
    subject: Joi.string().required().label("Subject"),
    day: Joi.string().required().label("Day"),
  };


  async componentDidMount() {
    const { data } = this.state
    const { actiontype } = this.props
    this.selectoptGet(`clients`, "clientIds")
    this.formApi.setValues(data);
    if (actiontype === "edit") {
      this.setState({ isEditForm: true });
      const { location: { state: { row, details } } } = this.props.props;
      if (details !== undefined) { }
      return this.formStateCheck(row, details);
    }
  }

  formStateCheck = async (data) => {

    data.date = data.dob
    data.staffName = data.staff
    this.setState({
      description: data.description,
      date: data.dob, staffName: data.staff, day: data.day,
      hour: data.hour
    })

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

  editFun = (url, data) => {
    let row = data
    this.props.props.history.push({
      pathname: url,
      state: {
        row
      }
    })
  }

  dateValue = (date) => {
    let selectDate = date._d.toISOString().slice(0, 10)
    this.setState({
      dob: date
    })
    const data = this.formApi.getState().values;
    data.dob = selectDate
    this.formApi.setValues(data);
  }

  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };

  resetForm = () => {
    this.formApi.reset()
  }


  setFormApi = (formApi) => {
    this.formApi = formApi;
  }

  async getSubjects() {
    var subjectsArray = []
    const { data: { client, batch, entity, department, branch } } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}&type=subject&departmentId=${department}&batchId=${batch}`;
    try {
      const subjectList = await getSubjectsList(params)
      let subjects = subjectList.data.data
      for (var i = 0; i < subjects.length; i++) {
        subjectsArray.push({ 'name': subjects[i].displayName, 'code': subjects[i].code })
      }
      this.setState({
        allSubjects: subjectsArray
      })
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
    await this.clientDatas(name, Input);

  }

  clientDatas = async (name, Input) => { // Get the Client,Entity,Branch,Department,Batch,EventName Lists
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
        this.getstaffList(`client=${data.client}&entity=${data.entity}&branch=${data.branch}&department=${data.department}&batch=${data.batch}`, "staffs")
        this.getSubjects()

        this.getStaffAllocList()
        break;
      case "staffId":
        let formData = this.formApi.getState().values
        var opt = Input.options[Input.selectedIndex];
        formData.staffName = opt.text
        this.formApi.setValues(formData);
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

  setFormApi = (formApi) => {
    this.formApi = formApi;
  }


  getStaffAllocList = async () => {
    const { data: { client, batch, entity, department, branch } } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}&department=${department}&batch=${batch}`;
    try {
      const res = await getStaffAllocList(params)
      const { data: { statusCode } } = res;

      if (statusCode === 1) {
        await this.setState({ staffData: res.data.data })
      } else {
        return ToastService.Toast("Somthig went wrong.Please try again later", "default");
      }
    } catch (err) {
      this.handleError(err);
    }
  }

  onSubmit() {
    this.checkRemarks(this.state.exportData);
  }

  async getstaffList(params, type) {
    let url = `students?${params}&type=staff`
    const data = await getstaffList(url);
    if (data.data.statusCode === 1) {
      const Datas = data.data.data
      this.setState({ [type]: Datas });
    } else {
      //ToastService.Toast(`${type} Data Not Found!!!`, "default")
    }
  }

  timeValue = async (time, field) => { // Get time from the timepicker
    const data = this.formApi.getState().values;
    data[field] = time;
    this.formApi.setValues(data);
  }

    handleSubmit = async () => {
    const { actiontype } = this.props
    const formdata = this.formApi.getState().values
    const { batch, branch, client, day, department, description, dob, entity, staffId, staffName, startTime, endTime } = formdata

    let temp = {
      "department": department,
      "batch": batch,
      "entity": entity,
      "branch": branch,
      "client": client,
      "staffId": staffId,
      "date": dob,
      "day": day,
      "startTime": startTime,
      "endTime": endTime,
      "description": description,
      "staffName": staffName
    }
    var res = '';
    try {
      if (actiontype === 'add') {
        res = await InsertStaffAlloc(temp);
      } else if (actiontype === 'edit') {
        res = await editStaffAllocation(temp)
      }
      const { data: { statusCode } } = res;
      if (statusCode === 1) {
        this.resetForm()
        return ToastService.Toast(res.data.message, 'default')
      } else {
        return ToastService.Toast("Something went wrong.Please try again later", "default");
      }
    } catch (err) {
      this.handleError(err)
    }
  }

  resetForm = () => {
    // this.formApi.reset()
    let path = `/timetable/WorkAllocation` //Redirect the page after updated the datas
    this.props.props.history.push({
      pathname: path,
    })
  }

  handleError(...err) {
    return ToastService.Toast("Something went wrong.Please try again later", "default");
  }

  render() {

    const { clientIds, entityIds, branchIds, departmentIds, batchIds, dob, staffs } = this.state;

    const isOutsideRange = (day => {
      let dayIsBlocked = false;
      if (moment().diff(day, 'days') < 0) {
        dayIsBlocked = true;
      }
      return dayIsBlocked;
    })

    return (
      <Fragment>
        <Form getApi={this.setFormApi} onSubmit={this.handleSubmit}  >
          {({ formApi, formState }) => (
            <div>
              <h6>Staff Allocation</h6>
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
                  <Col sm={6} md={3}>
                    <CustomSelect field="department" label="Department*" name="department" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={departmentIds} validateOnBlur validate={e => this.validateProperty('department', e)} onChange={this.handleChange} />
                  </Col>
                </Row>
                <Row>
                  <Col sm={6} md={3}>
                    <CustomSelect field="batch" label="Batch*" name="batch" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={batchIds} validateOnBlur validate={e => this.validateProperty('batch', e)} onChange={this.handleChange} />
                  </Col>

                  <Col sm={6} md={3}>
                    <label> Date*</label>
                    <SDP field="date" isOutsideRange={isOutsideRange} id="date" date={dob} validate={e => this.validateProperty('date', e)} onChange={this.dateValue} onBlur={(e) => this.validateProperty('date', e)} numberOfMonths={1}></SDP>
                  </Col>
                  <Col sm={6} md={3}>
                    <CustomSelect field="staffId" label="Staff*" name="staffId" getOptionValue={option => option.uid} getOptionLabel={option => option.name} options={staffs} validateOnBlur onChange={this.handleChange} />

                  </Col>
                  <Col sm={6} md={3}>
                    <RTimePicker
                      field="startTime" label="StartTime*" value={moment(formState.values.startTime ? formState.values.startTime : "12:00 am", "h:mm a")} onChange={(data) => this.timeValue(data, "startTime")}
                    />
                  </Col>
                  <Col sm={6} md={3}>
                    <RTimePicker
                      field="endTime" label="EndTime*" value={moment(formState.values.endTime ? formState.values.endTime : "12.00 pm", "h:mm a")} onChange={(data) => this.timeValue(data, "endTime")}
                    />
                  </Col>
                  <Col sm={6} md={3}>
                    <CustomSelect field="day" label="Day" name="day" getOptionValue={option => option.id} getOptionLabel={option => option.name} options={this.state.days} validateOnBlur validate={e => this.validateProperty('day', e)} />
                  </Col>
                </Row>
                <Row>
                  <Col sm={12} md={12}>
                    <Textarea
                      field="description" label="Description*" validate={e => this.validateProperty('description', e)} />
                  </Col>
                </Row>
                <Row>
                  <Col md={12} className="d-flex justify-content-end">
                    <button type="submit" className="btn btn-primary btn-sm">Submit</button>
                  </Col>
                </Row>
              </section>
            </div>
          )}
        </Form>
      </Fragment >
    )
  }
}