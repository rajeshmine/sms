import React, { Component, Fragment } from 'react';
import Header from 'components/common/header';
import SideNav from 'components/common/sideNav';
import Timetable from './list';
import { rightsData } from 'services/rolesService';
import { getStaffAllocList } from 'services/staffAllocationService';

import {
  Breadcrumb,
  BreadcrumbItem,
  Container, Row, Col,

} from 'reactstrap';
import Static from 'services/static';
import { NavLink } from 'react-router-dom';

import Loading from 'components/common/loading';
import Joi from 'joi-browser';
import { Form } from 'informed';

import { CustomSelect, } from 'components/common/forms';
import { getselectData } from 'services/userService'
import { getExamData, getexamname } from 'services/examService'
import { getTimeTable, getstaffList } from 'services/timetableService'
import ToastService from 'services/toastService';

import _ from 'lodash'
var classNames = require('classnames');
export default class TimetableList extends Component {
  state = {
    data: {
      TabData: [], columns: []
    },    
    isPageLoading: false,
    isLoading: false,
    type: '',
    client: '',
    entity: '',
    department: '',
    branch: '',
    batch: '',     
    clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [], examIds: [],
    timeTable: false,
    finalData: [],
    isClient: true, isEntity: true, isBranch: true, isDepartment: true, isBatch: true
  }

  async componentWillMount() {
    await this.props.isPageLoadingTrue();
  }

  async componentDidMount() {
    const { session } = this.props;
    await this.rightsData(session);
    await this.feildCheck();
    await this.init(this.props, true)
    try {
      await this.selectoptGet(`clients`, "clientIds")
    } catch{
      this.handleError()
    }
    await this.props.isPageLoadingFalse();
  }

  async componentWillReceiveProps(props) {
    await this.init(props, false)
  }

  async componentDidCatch(err) {

  }

  rightsData = async (session) => {

    let res = await rightsData("timetable", session);
    let excludeModules = [];
    await _.map(_.keys(res), async v => {
      await _.map(_.keys(res[v]), k => {
        if (res[v][k]["value"])
          return excludeModules.push(v)
      })
    })
    await this.setState({ excludeModules, rightsData: res || {} })
  }
  async init(props, isPageLoading = false) {

  }

  feildCheck = async () => {
    const { form } = this.props.match.params
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
        await this.clientDatas('batch');
        await this.formApi.setValues(data);
        if (form === "class" || form === "Class")
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

  handleError(...err) {
    return ToastService.Toast("Something went wrong.Please try again later", "default");
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
    department: Joi.string().required().label("Department"),
    batch: Joi.any().optional(),
    examname: Joi.string().required().label("Exam Name"),
    staff: Joi.string().required().label("Staff Name"),
  };

  renderTimeTable(type, data) {
    return <Timetable type={type} data={data} props={this.props} />
  }

  handleChange = async ({ currentTarget: Input }) => {
    //let formaData = this.formApi.getState().values;
    //await this.setState({data:formaData})

    const { name, value } = Input;
    const { data } = this.state;
    data[name] = value;
    await this.setState({
      [name]: value,

    })
    await this.clientDatas(name);
  }

  setFormApi = (formApi) => {
    this.formApi = formApi;
  };

  clientDatas = async (name) => {
    const { data } = this.state;
    console.log(data)
    switch (name) {
      case "client":
        this.selectoptGet(`namelist?client=${data.client}&type=client`, "entityIds")
        await this.setState({ entity: "", branch: "", department: "", batch: "", branchIds: [], departmentIds: [], batchIds: [], timeTable: false })
        break;
      case "entity":
        this.selectoptGet(`namelist?client=${data.client}&type=entity&entity=${data.entity}`, "branchIds")
        await this.setState({ branch: "", department: "", batch: "", departmentIds: [], batchIds: [], timeTable: false })
        break;
      case "branch":
        this.selectoptGet(`namelist?client=${data.client}&type=branch&entity=${data.entity}&branch=${data.branch}`, "departmentIds")
        await this.setState({ department: "", batch: "", batchIds: [], timeTable: false })
        break;
      case "department":
        this.selectoptGet(`namelist?client=${data.client}&type=department&entity=${data.entity}&branch=${data.branch}&department=${data.department}`, "batchIds")
        await this.setState({ examname: '', examIds: [], batch: "", timeTable: false })
        break;
      case "batch":
        this.examnameget(`scheduleTypeId?client=${data.client}&entity=${data.entity}&branch=${data.branch}&department=${data.department}&batch=${data.batch}&type=exam`, "examIds")
        await this.setState({ examname: '', timeTable: false });
        this.getstaffList(`client=${data.client}&entity=${data.entity}&branch=${data.branch}&department=${data.department}&batch=${data.batch}`, "staffs")
        break;
      case "examname":
        await this.setState({ timeTable: false })
        break;
      default:
        break;
    }
  }

  async examnameget(url, type) {
    const data = await getexamname(url)
    if (data.data.statusCode === 1) {
      const Datas = data.data.data
      this.setState({ [type]: Datas });
    } else {
      //ToastService.Toast(`${type} Data Not Found!!!`, "default")
    }
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

  onSubmit = async () => {
    const { data: { client, entity, branch, department, batch, examname } } = this.state
    const { form } = this.props.match.params

    let params = '', Details, response, data;
    switch (form) {
      case 'exam':
      case 'Exam':
        params = `client=${client}&entity=${entity}&branch=${branch}&departmentId=${department}&batchId=${batch}&examId=${examname}`
        Details = await getExamData(params)

        try {
          this.examTimeTable(Details)
        } catch{
          this.handleError()
        }
        break;
      case 'class':
      case 'Class':
        params = {
          "type": "timetable",
          "batchId": batch,
          "departmentId": department,
          "client": client,
          "entity": entity,
          "branch": branch
        }

        Details = await getTimeTable(params)
        try {
          this.classTimeTable(Details)
        } catch{
          this.handleError()
        }
        break;
      case 'staff':
      case 'Staff':
        params = {
          "type": "timetable",
          "client": client,
          "entity": entity,
          "branch": branch
        }
        Details = await getTimeTable(params)
        try {
          this.staffTimeTable(Details)
        } catch{
          this.handleError()
        }
        break;
      case 'WorkAllocation':
      case 'workAllocation':
        if (batch) {
          params = `client=${client}&entity=${entity}&branch=${branch}&department=${department}&batch=${batch}`;
        } else {
          params = `client=${client}&entity=${entity}&branch=${branch}&department=${department}`;
        }
        response = await getStaffAllocList(params)
        if (response.data.statusCode === 1)
          data = response.data.data;
        await this.setState({ data: data, timeTable: true })
        this.renderTimeTable(form, data)
        break;
      default:
        break;
    }

  }

  async examTimeTable(Details) {
    const { form } = this.props.match.params
    if (Details && Details.data.statusCode === 1) {
      let data = Details.data.data

      this.setState({
        data: data,
        timeTable: true
      }, () => {
        this.renderTimeTable(form, data)
      })
    } else {
      ToastService.Toast("No data found!!!", "default");
    }
  }

  async classTimeTable(Details) {

    const { form } = this.props.match.params

    if (Details && Details.data.statusCode === 1) {
      const resData = Details.data.data[0];
      let arr = [];
      let finalTimeTable = [];
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      await _.map(days).forEach(item => { arr.push({ "day": item, time: resData[item] || [] }) })
      let obj = {}
      let temp = {}
      let time;
      await arr.forEach((v, i) => {
        v.time.forEach(g => {
          var starttime = g.starttime.trim();
          var endtime = g.endtime.trim();
          time = starttime + '-' + endtime
          v[time] = g
        })
        finalTimeTable.push(v)
        temp = { ...v, ...obj }
        arr[i] = temp
        obj = {}
      })

      await this.setState({ data: finalTimeTable, timeTable: true })
      this.renderTimeTable(form, finalTimeTable)
    } else {
      ToastService.Toast("No data found!!!", "default");
    }
  }

  async staffTimeTable(Details) {

    const { staff } = this.state
    const { form } = this.props.match.params
    if (Details && Details.data.statusCode === 1) {
      let data = Details.data.data

      if (form === "staff" || form === "Staff") {
        let staffid = staff;
        let stafftimetable = {
          Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: []
        }
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        for (let day of days) {
          for (let item of data) {
            if (item[day]) {
              let periods = item[day]
              for (let period of periods) {
                if (period.staff === staffid) {
                  stafftimetable[day].push(period)
                }
              }
            }
          }
        }
        let timerange = []
        for (let day of days) {
          let data = stafftimetable[day]
          for (let time of data) {
            if (time) {
              var starttime = time.starttime.trim();
              var endtime = time.endtime.trim();
              timerange.push({ time: starttime + '-' + endtime })
            }
          }
        }
        timerange = _.uniqBy(timerange, 'time')
        timerange.sort(function (a, b) {
          return Date.parse('1970/01/01 ' + a.time.slice(0, -2) + ' ' + a.time.slice(-2)) - Date.parse('1970/01/01 ' + b.time.slice(0, -2) + ' ' + b.time.slice(-2))
        });
        let arr = [];
        let finalTimeTable = [];
        await _.map(days).forEach(item => { arr.push({ "day": item, time: stafftimetable[item] || [] }) })
        let obj = {}
        let temp = {}
        let time;
        await arr.forEach((v, i) => {
          v.time.forEach(g => {
            var starttime = g.starttime.trim();
            var endtime = g.endtime.trim();
            time = starttime + '-' + endtime
            v[time] = g
          })
          finalTimeTable.push(v)
          temp = { ...v, ...obj }
          arr[i] = temp
          obj = {}
        })

        await this.setState({ data: finalTimeTable, timeTable: true })
        this.renderTimeTable(form, finalTimeTable)
      } else {
        ToastService.Toast("No data found!!!", "default");
      }
    }
  }

  tableHide() {
    this.formApi.reset();
    this.setState({ timeTable: false })
  }

  redirectTo = async () => {
    await this.setState({ timeTable: false })
    await this.feildCheck()
    await this.formApi.reset();
  }

  render() {
    const { form } = this.props.match.params;
    const { session } = this.props;
    const { isPageLoading, isLoading, data, clientIds, entityIds, branchIds, departmentIds, batchIds, examIds, staffs, rightsData, excludeModules, isClient, isEntity, isBatch, isBranch, isDepartment } = this.state;
    let { keys: formTypeKeys, order: formTypeOrder } = Static.timetableFormTypes();
    let _form = _.upperFirst(form);
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
                    <BreadcrumbItem><NavLink to='/timetable/exam'>TimeTable</NavLink> </BreadcrumbItem>
                    <BreadcrumbItem active>  {form}</BreadcrumbItem>
                  </Breadcrumb>
                  <Container fluid>
                    <div className="mb-4 subnav-div">
                      {formTypeOrder.map((formType) =>
                        <NavLink key={formType} to={{ pathname: `/timetable/${formType}`, query: this.props.location.query }} className={classNames('subnav')} activeClassName="subnav-active" exact={true} onClick={() => this.redirectTo()}>{formTypeKeys[formType]['label']}</NavLink>
                      )}
                    </div>
                    <Form getApi={this.setFormApi} onSubmit={this.onSubmit} >
                      {({ formApi, formState }) => (
                        <div>
                          {(form === 'WorkAllocation' || form === 'workAllocation') && <div style={{ textAlign: 'right' }}>
                            {rightsData && rightsData[_form] && rightsData[_form].create.value &&
                              <NavLink className="btn btn-primary btn-sm btn-right" to={`/staff/add/staffallocation`}>+ Staff Allocation </NavLink>
                            }
                            <br />
                          </div>
                          }
                          {(form === 'class' || form === 'Class') && <div style={{ textAlign: 'right' }}>
                            {rightsData && rightsData[_form] && rightsData[_form].create.value &&
                              <NavLink className="btn btn-primary btn-sm btn-right" to={`/classLists/class`}>+ Class TimeTable List</NavLink>
                            }
                            <br />
                          </div>
                          }
                          {(isBatch || _form !== 'Class') &&
                            <section>
                              <Row>
                                {isClient &&
                                  <Col sm={6} md={3}>
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
                                {isDepartment &&
                                  <Col sm={6} md={3}>
                                    <CustomSelect field="department" label="Department*" name="department" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('department', e)} onChange={this.handleChange} options={departmentIds} />
                                  </Col>
                                }
                                {isBatch &&
                                  <Col sm={6} md={3}>
                                    <CustomSelect field="batch" label="Batch" name="batch" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('batch', e)} onChange={this.handleChange} options={batchIds} />
                                  </Col>
                                }
                                {(form === "exam" || form === "Exam") &&
                                  <Col sm={6} md={3}>
                                    <CustomSelect field="examname" label="Exam Name*" name="examname" getOptionValue={option => option._id}
                                      getOptionLabel={option => option.title} options={examIds}
                                      validateOnBlur validate={e => this.validateProperty('examname', e)} onChange={this.handleChange} />
                                  </Col>
                                }
                                {(form === "staff" || form === "Staff") &&
                                  <Col sm={6} md={3}>
                                    <CustomSelect field="staff" label="Staff Name*" name="staff" getOptionValue={option => option.uid}
                                      getOptionLabel={option => option.name} options={staffs} validate={e => this.validateProperty('staff', e)}
                                      validateOnBlur onChange={this.handleChange} />
                                  </Col>
                                }
                              </Row>
                              <div className="text-right">
                                <button type="submit" className="btn btn-primary btn-sm">Submit</button>
                              </div>
                            </section>
                          }

                        </div>
                      )}
                    </Form>
                    {this.state.timeTable &&
                      this.renderTimeTable(form, data)
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
