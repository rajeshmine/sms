import 'styles/user-form.scss';
import React, { Component, Fragment } from 'react';
import _ from 'lodash'
import { NavLink } from 'react-router-dom';
import { Container } from 'reactstrap';
import Static from 'services/static';
import Header from 'components/common/header';
import Loading from 'components/common/loading';
import SideNav from 'components/common/sideNav';
import { Form } from 'informed';
import { Col, Row } from 'reactstrap';
import { Input, CustomSelect, SDP } from 'components/common/forms';
import {

  Breadcrumb,
  BreadcrumbItem
} from 'reactstrap';
// import { getParticularType } from '../../services/settingsService'
import AttendanceList from 'components/attendance/list'
import Joi from 'joi-browser';
import moment from 'moment';
import { getselectData } from 'services/userService'
import { getStudentList } from 'services/assignmentService';
import { getAttendancelist, getHoliday } from 'services/attendanceService';
import { getSubjectsList } from 'services/scheduleService';
import ToastService from 'services/toastService';
import { rightsData } from 'services/rolesService';
var classNames = require('classnames');


export default class Attendance extends Component {
  state = {
    cType: "", cId: "",
    user: {},
    parentData: [],
    prefixUrl: "",
    isPageLoading: false,
    isLoading: false,
    clientIds: [], entityIds: [], branchIds: [],
    data: {
      department: '',
      batch: '',
      client: '',
      entity: '',
      branch: '',
      homeworks: '',
      subject: '',
      date: ''
    },
    isClient: true, isEntity: true, isBranch: true, isDepartment: true, isBatch: true
  }

  async componentWillMount() {
    await this.props.isPageLoadingTrue();
  }
  async componentDidMount() {
    await this.init(this.props, true)
    this.selectoptGet(`clients`, "clientIds")
    const { data } = this.state
    this.formApi.setValues(data);
    const { session } = this.props;
    await this.rightsData(session);
    await this.feildCheck();
    await this.props.isPageLoadingFalse();
  }

  async componentWillReceiveProps(props) {
    await this.init(props, false)
  }

  async init(props, isPageLoading = false) {
    //const { uid, attendanceType } = props.match.params
  }

  rightsData = async (session) => {

    let res = await rightsData("attendance", session);

    let excludeModules = [];
    await _.map(_.keys(res), async v => {
      await _.map(_.keys(res[v]), k => {
        if (res[v][k]["value"])
          return excludeModules.push(v.toLowerCase())
      })
    })

    await this.setState({ excludeModules, rightsData: res || {} })


  }

  setFormApi = (formApi) => {
    this.formApi = formApi;
  }

  feildCheck = async () => {
    const { attendanceType } = this.props.match.params
    let { session: { data: sessionData } } = this.props;
    const { data } = this.state
    const { userType, userLevel, client, entity, branch, department, batch, code, branchId, departmentId, batchId, uid } = sessionData;
    data['uid'] = uid;
    data['userType'] = userType;
    data['userLevel'] = userLevel;
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
        if (attendanceType === 'holiday')
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
        if (attendanceType === 'holiday')
          await this.onSubmit();
        break;
      default:
        data['client'] = client || code;
        data['entity'] = entity || code;
        data['branch'] = branch || branchId;
        data['department'] = department || departmentId;
        data['batch'] = batch || batchId;
        await this.setState({ data, isClient: false, isEntity: false, isBranch: false, isDepartment: false, isBatch: false });
        await this.clientDatas('client');
        await this.clientDatas('entity');
        await this.clientDatas('branch');
        await this.clientDatas('department');
        await this.clientDatas('batch');
        await this.formApi.setValues(data);
        if (attendanceType === 'holiday')
          await this.onSubmit();
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
    department: Joi.string().required().label("Department"),
    client: Joi.string().required().label("Client"),
    entity: Joi.string().required().label("Entity"),
    branch: Joi.string().required().label("Branch"),
    batch: Joi.any().optional(),
    subject: Joi.string().required().label("Subject"),
    homeworks: Joi.string().required().label("Topic"),
    period: Joi.string().required().label("Period"),
    date: Joi.string().required().label("Date"),
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

  handleChange = async ({ currentTarget: Input }) => {
    const { name, value } = Input;
    const { data } = this.state;
    data[name] = value;
    this.setState({
      [name]: value,
      AttendanceTable: false,
    })
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
        break;
      case "department":
        await this.selectoptGet(`namelist?client=${data.client}&type=department&entity=${data.entity}&branch=${data.branch}&department=${data.department}`, "batchIds")
        await this.setState({ batch: "" })
        await this.getSubjects()
        await this.getStudentList()
        break;
      case "batch":

        break;
      default:
        break;
    }
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
      await this.setState({
        allSubjects: subjectsArray
      })
    } catch (err) {
      this.handleError(err);
    }
  }

  handleError (err){
    ToastService.Toast("Something went wrong!!! Try after Sometimes", 'default');
  }

  getStudentList = async () => {
    const { data: { client, branch, entity, department, batch } } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}&department=${department}&batch=${batch}&type=student`
    const res = await getStudentList(params);

    if (res.data.statusCode === 1) {
      var test = res.data.data
      for (var i = 0; i < test.length; i++) {
        var studentList = [{ "name": test[i].name, "uid": test[i].uid, "remarks": "" }]

      }
      this.setState({ studentList })
    }
    if (res.data.statusCode !== 1) return ToastService.Toast(res.data.message, 'default');

  }




  onSubmit = async () => {
    const { attendanceType } = this.props.match.params
    if (attendanceType === "attendance") return this.attendanceList("attendance")
    if (attendanceType === "holiday") return this.holidayList("holiday")
  }

  // branch=123&entity=222&client=999&department=170&batch=123&subject=789&period=8&date=2019-02-09



  //http://192.168.1.23:5000/attendance?department=170&entity=222&client=999&branch=123&batch=123&date=2018-03-11&uid=265

  //date=2019-02-26&department=IT12&batch=B1&entity=oxe1&client=OX01&branch=HSR01&subject=EVSE01&period=1&uid=oxs10

  attendanceList = async () => {
    const formdata = this.formApi.getState().values;
    const { data: { client, entity, branch, department, batch } } = this.state;
    const { date, subject, period, userType, uid } = formdata;
    let params = '';
    params = `date=${date}&department=${department}&batch=${batch}&entity=${entity}&client=${client}&branch=${branch}&subject=${subject}&period=${period}`
    if (userType === 'student' || userType === "parent")
      params = `date=${date}&department=${department}&batch=${batch}&entity=${entity}&client=${client}&branch=${branch}&subject=${subject}&period=${period}&uid=${uid}`

    const attendancestatus = await getAttendancelist(params);
    if (attendancestatus.data.statusCode === 1) {
      let temp = attendancestatus.data.data
      let attendata = [];
      _.map(temp, item => {
        _.map(_.keys(item), v => {
          if (typeof item[v] === 'object') {
            let obj = { name: item["name"], studentId: item["studentId"] }
            return attendata.push(_.merge(obj, item[v]))
          }
        })
      });
      await this.setState({
        attendata,
        AttendanceTable: true,
        client, entity, branch, formdata
      })
    } else {
      await this.setState({
        attendata: [],
        AttendanceTable: true,
        client, entity, branch, formdata
      })
    }
  }

  holidayList = async () => {
    const { data: { client, entity, branch } } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}&type=subject`
    const HolidayDetails = await getHoliday(params)
    if (HolidayDetails.data.statusCode === 1) { //check the datas
      let attendata = HolidayDetails.data.data
      await this.setState({ AttendanceTable: false })
      await this.setState({
        attendata,
        AttendanceTable: true,
        client, entity, branch
      })

    } else {
      await this.setState({ AttendanceTable: false })
      await this.setState({
        attendata: [],
        AttendanceTable: true,
        client, entity, branch
      })
    }
  }



  renderAttendanceForm(attendanceType, data, client, entity, branch, department, batch) {//Pass the datas to the Attendance List

    const { rightsData } = this.state;
    let details = {
      client, entity, branch, department, batch
    }

    return <AttendanceList
      attendanceType={attendanceType}
      data={data} props={this.props} details={details} rightsData={rightsData} refreshTable = {this.holidayList}
    />
  }

  redirectTo = async () => {
    await this.setState({ AttendanceTable: false })
    await this.feildCheck()
    await this.formApi.reset();
  }

  render() {
    const { attendanceType } = this.props.match.params

    const { isPageLoading, isLoading, clientIds, entityIds, branchIds, departmentIds, batchIds, date, attendata, client, entity, branch, department, batch, rightsData, excludeModules,
      isClient, isEntity, isBranch, isDepartment, isBatch } = this.state;
    let { keys: formTypeKeys, order: formTypeOrder } = Static.attendanceFormTypes();
    const { session } = this.props;
    const isOutsideRange = (day => {
      let dayIsBlocked = false;
      if (moment().diff(day, 'days') < 0) {
        dayIsBlocked = true;
      }
      return dayIsBlocked;
    })
    let _form = _.upperFirst(attendanceType);
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
                    <BreadcrumbItem><NavLink to='/attendance/attendance'>Attendance</NavLink></BreadcrumbItem>
                    <BreadcrumbItem active>{attendanceType}</BreadcrumbItem>
                  </Breadcrumb>
                  <Container fluid>
                    <div className="mb-4 subnav-div">
                      {formTypeOrder.map((attendanceType) =>
                        <NavLink key={attendanceType} onClick={this.redirectTo} to={{ pathname: `/attendance/${attendanceType}`, query: this.props.location.query }} className={classNames('subnav')} activeClassName="subnav-active" exact={true} >{formTypeKeys[attendanceType]['label']}</NavLink>
                      )}
                    </div>

                    <div style={{ textAlign: 'right' }}  >
                      {rightsData && rightsData[_form] && rightsData[_form].create.value &&
                        <NavLink className="btn btn-primary btn-sm" to={`add/${attendanceType}`}>+ {attendanceType} </NavLink>
                      }



                    </div>

                    <Form getApi={this.setFormApi} onSubmit={this.onSubmit} >
                      {({ formApi, formState }) => (
                        <div>


                          {(isBranch || attendanceType !== 'holiday') &&

                            <section>
                              <Row>

                                <Col sm={12}>
                                  {/* <h6>CLIENT DETAILS</h6> */}
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
                                  attendanceType !== 'holiday' && isDepartment ?
                                    <Col sm={6} md={3}>
                                      <CustomSelect field="department" label="Department*" name="department" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={departmentIds} validateOnBlur validate={e => this.validateProperty('department', e)} onChange={this.handleChange} />
                                    </Col> :
                                    ''}
                              </Row>
                              {
                                attendanceType !== 'holiday' ?
                                  <Row>
                                    {isBatch && <Col sm={6} md={3}>
                                      <CustomSelect field="batch" label="Batch" name="batch" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={batchIds} validateOnBlur validate={e => this.validateProperty('batch', e)} onChange={this.handleChange} />
                                    </Col>
                                    }
                                    <Col sm={6} md={3}>
                                      <label>Attendance Date*</label>
                                      <SDP field="date" isOutsideRange={isOutsideRange} id="date" date={moment(date)} validate={e => this.validateProperty('date', e)} onChange={this.dateValue} onBlur={(e) => this.validateProperty('date', e)} numberOfMonths={1}></SDP>
                                    </Col>
                                    <Col sm={6} md={3}>
                                      <CustomSelect field="subject" label="Subject*" name="subject" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={this.state.allSubjects} validateOnBlur validate={e => this.validateProperty('subject', e)} onChange={this.handleChange} />

                                    </Col>
                                    <Col sm={6} md={3}>
                                      <Input
                                        field="period" label="Period*" name="period" validate={e => this.validateProperty('period', e)} />
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
                    {this.state.AttendanceTable && rightsData &&
                      this.renderAttendanceForm(attendanceType, attendata, client, entity, branch, department, batch)
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
