import 'styles/App.scss';
import React, { Component, Fragment } from 'react';
import Joi from 'joi-browser';
import { Container, Row, Col, Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { NavLink } from 'react-router-dom';
import { Form } from 'informed';
import ToastService from 'services/toastService'
import { Input, Textarea, CustomSelect, SDP, RTimePicker } from 'components/common/forms';
import { getsubjectname, getexamname, insertExamData, updateExamData } from 'services/examService';
import { getselectData } from 'services/userService';

import moment from 'moment';
import _ from 'lodash';
export default class ExamForm extends Component {
  state = {
    data: {
      client: "", entity: "", branch: "", department: "", batch: "", subject: "", type: "offline"
    },
    clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [], examIds: [], subjects: [],
    isEditForm: false,
    parentData: [],
    prefixUrl: "",
    type: '',
    isClient: true, isEntity: true, isBranch: true, isDepartment: true, isBatch: true,
    toRange:{}

  }

  async componentDidMount() {
    const { actiontype } = this.props
    this.selectoptGet(`clients`, "clientIds")
    await this.feildCheck()

    if (actiontype === "edit" || actiontype === "view") {
      const { location: { state } } = this.props.props
      this.setState({ isEditForm: true, date: moment(state.date) })
      if (state !== undefined)
        return this.formStateCheck(state);
    }

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
        await this.setState({ data, isClient: false, isEntity: false, isBranch: false, isDepartment: false, isBatch: false });
        await this.clientDatas('branch');
        await this.clientDatas('department');
        await this.clientDatas('batch');
        await this.formApi.setValues(data);
        break;
    }
  }

  formStateCheck = async (data) => {

    data.department = data.departmentId
    data.batch = data.batchId
    data.eventname = data.event
    data.studentName = data.student
    data.startTime = data.time[0].from
    data.endTime = data.time[0].to
    data.examname = data.examName
    await this.setState({ data, department: data.departmentId, batch: data.batchId });
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



  schema = {
    client: Joi.string().required().label("Client"),
    entity: Joi.string().required().label("Entity"),
    branch: Joi.string().required().label("Branch"),
    department: Joi.string().required().label("Department"),
    batch: Joi.string().required().label("Batch"),
    date: Joi.string().required().label("Date"),
    syllabus: Joi.string().required().label("Syllabus"),
    examId: Joi.string().required().label("Exam ID"),
    startTime: Joi.string().required().label("Start Time"),
    endTime: Joi.string().required().label("End Time"),
    subject: Joi.string().required().label("Subject"),
    outoff: Joi.number().required().label("Total Marks"),
  }

 

  handleChange = async ({ currentTarget: Input }) => {
    const { name, value, title } = Input;
    const { data } = this.state;
    data[name] = value;
    data[title] = Input.options[Input.selectedIndex]['text'];
    await this.setState({ [name]: value })
    await this.formApi.setValues(data);
    this.clientDatas(name);
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

        this.examnameget(`scheduleTypeId?client=${data.client}&entity=${data.entity}&branch=${data.branch}&type=exam`, "examIds")
        await this.setState({ department: "", batch: "", batchIds: [] })
        break;
      case "department":
        this.selectoptGet(`namelist?client=${data.client}&type=department&entity=${data.entity}&branch=${data.branch}&department=${data.department}`, "batchIds")
        await this.setState({ batch: "" })
        break;
      case "batch":
        this.subjectnameget(`particularCourse?client=${data.client}&entity=${data.entity}&branch=${data.branch}&department=${data.department}&batch=${data.batch}&type=subject`, "subjects")
        break;
      case "examId":
        const {examId,examIds} = this.state;
        let toRange = _.filter(examIds,e=>e._id === examId )
        await this.setState({toRange});
        console.log(examId,examIds,toRange)
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

  async examnameget(url, type) {

    const data = await getexamname(url)
   
    if (data.data.statusCode === 1) {
      const Datas = data.data.data
      this.setState({ [type]: Datas });
    }
  }

  async subjectnameget(url, type) {

    const data = await getsubjectname(url)

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

  dateValue = (date) => {
    let selectDate = date._d.toISOString().slice(0, 10)
    this.setState({
      date: date
    })

    const data = this.formApi.getState().values;

    data.date = selectDate

    this.formApi.setValues(data);
  }

  timeValue = async (time, field) => { // Get time from the timepicker
    const data = this.formApi.getState().values;
    data[field] = time;
    this.formApi.setValues(data);
  }

  setFormApi = (formApi) => {
    this.formApi = formApi;
  }
  onSubmit = async () => {
    let data = this.formApi.getState().values;

    const { actiontype } = this.props
    data["time"] = { from: data.startTime || '12:00 am', to: data.endTime || '12:00 pm' };

    data["batchId"] = data.batch
    data["departmentId"] = data.department

    let res;
    try {
      if (actiontype === 'add') {

        res = await insertExamData(data)
      } else if (actiontype === 'edit') {

        res = await updateExamData(data)
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


    const { actiontype, props } = this.props
    if (actiontype === 'edit') {
      await props.history.goBack();
    } else {
      window.location.reload();
    }
  }


  render() {
    const { clientIds, entityIds, branchIds, departmentIds, batchIds, examIds, subjects, date,
      isClient, isEntity, isBranch, isDepartment, isBatch,toRange
    } = this.state;
    let range = toRange && toRange[0];   
    const { actiontype } = this.props
    let selectdisabled = false
    if (actiontype === 'view') {
      selectdisabled = true
    } else {
      selectdisabled = false
    }
    const isOutsideRange = (day => {
      let dayIsBlocked = false;
      if (moment().diff(day, 'days') > 0) {
        dayIsBlocked = true;
      }
      if(range && range.to.date !==''){
      if(day > moment(range.to.date)) {
          dayIsBlocked = true;
      }
    }
      return dayIsBlocked;
    })
    return (
      <React.Fragment >
        <Fragment>
          <Container fluid>
            <Breadcrumb>
              <BreadcrumbItem><NavLink to="/dashboard">Dashboard</NavLink></BreadcrumbItem>
              <BreadcrumbItem><NavLink to="/exam/offlineExam">Exam </NavLink>
              </BreadcrumbItem>
              <BreadcrumbItem active>{actiontype} Exam </BreadcrumbItem>
            </Breadcrumb>
            <Form getApi={this.setFormApi} onSubmit={this.onSubmit}>
              {({ formApi, formState }) => (
                <div className="page-user">
                  <h6>{actiontype} Exam</h6>
                  {isBatch && <section>
                    <Row>
                      {isClient && <Col sm={12} md={3}>
                        <CustomSelect field="client" label="Client*" title="clientName" name="client" getOptionValue={option => option.code}
                          getOptionLabel={option => option.name} options={clientIds}
                          validateOnBlur validate={e => this.validateProperty('client', e)} onChange={this.handleChange} disabled={selectdisabled} />
                      </Col>}
                      {isEntity && <Col sm={12} md={3}>
                        <CustomSelect field="entity" label="Entity*" title="entityName" name="entity" getOptionValue={option => option.code}
                          getOptionLabel={option => option.name} options={entityIds}
                          validateOnBlur validate={e => this.validateProperty('entity', e)} onChange={this.handleChange} disabled={selectdisabled} />
                      </Col>}
                      {isBranch && <Col sm={12} md={3}>
                        <CustomSelect field="branch" label="Branch*" title="branchName" name="branch" getOptionValue={option => option.code}
                          getOptionLabel={option => option.name} options={branchIds}
                          validateOnBlur validate={e => this.validateProperty('branch', e)} onChange={this.handleChange} disabled={selectdisabled} />
                      </Col>}
                      {isDepartment && <Col sm={12} md={3}>
                        <CustomSelect field="department" label="Department*" title="departmentName" name="department" getOptionValue={option => option.code}
                          getOptionLabel={option => option.name} options={departmentIds}
                          validateOnBlur validate={e => this.validateProperty('department', e)} onChange={this.handleChange} disabled={selectdisabled} />
                      </Col>}
                      {isBatch && <Col sm={12} md={3}>
                        <CustomSelect field="batch" label="Batch*" name="batch" title="batchName" getOptionValue={option => option.code}
                          getOptionLabel={option => option.name} options={batchIds}
                          validateOnBlur validate={e => this.validateProperty('batch', e)} onChange={this.handleChange} disabled={selectdisabled} />
                      </Col>}
                    </Row>
                  </section>}
                  <section>
                    <Row>
                      <Col sm={12} md={3}>
                        <CustomSelect field="examId" title="examName" label="Exam Name*" name="examId" getOptionValue={option => option._id}
                          getOptionLabel={option => option.title} options={examIds}
                          validateOnBlur validate={e => this.validateProperty('examId', e)} disabled={selectdisabled} onChange={this.handleChange} />

                      </Col>
                      <Col sm={12} md={3}>
                        <CustomSelect field="subjectId" title="subjectName" label="Subject*" name="subject" getOptionValue={option => option._id}
                          getOptionLabel={option => option.displayName} options={subjects}
                          validateOnBlur validate={e => this.validateProperty('subject', e)} onChange={this.handleChange} disabled={selectdisabled} />

                      </Col>

                      <Col sm={12} md={3}>
                        <label>Date*</label>
                        <SDP isOutsideRange={isOutsideRange} field="date" label="Date*" id="date" date={date} validate={e => this.validateProperty('date', e)} onChange={this.dateValue} onBlur={(e) => this.validateProperty('date', e)} numberOfMonths={1} disabled={selectdisabled}></SDP>
                      </Col>
                      <Col sm={12} md={3}>

                        <RTimePicker
                          field="startTime" label="StartTime*" value={moment(formState.values.startTime ? formState.values.startTime : "12:00 am", "h:mm a")} onChange={(data) => this.timeValue(data, "startTime")}
                        />

                      </Col>

                      <Col sm={12} md={3}>


                        <RTimePicker
                          field="endTime" label="EndTime*" value={moment(formState.values.endTime ? formState.values.endTime : "12.00 pm", "h:mm a")} onChange={(data) => this.timeValue(data, "endTime")}
                        />

                      </Col>
                      <Col sm={12} md={3}>
                        <Input
                          field="outoff" label="Total Marks*" name="outoff"
                          validateOnBlur validate={e => this.validateProperty('outoff', e)} disabled={selectdisabled}
                        />

                      </Col>
                    </Row>

                    <Row>
                      <Col sm={12} md={12}>
                        <Textarea
                          field="syllabus" label="Syllabus*" name="syllabus"
                          validateOnBlur validate={e => this.validateProperty('syllabus', e)} disabled={selectdisabled}
                        />

                      </Col>
                    </Row>
                  </section>
                  {actiontype !== 'view' &&
                    <div className="text-right">
                      <button type="submit" className="btn btn-primary btn-sm">Submit</button>
                    </div>
                  }
                </div>
              )}

            </Form>
          </Container>
        </Fragment>

      </React.Fragment >
    );
  }
}

