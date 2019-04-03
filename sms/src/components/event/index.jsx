import React, { Component, Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import Joi from 'joi-browser';
import { Form } from 'informed';
import { Container, Row, Col, Modal, ModalBody, ModalHeader, Breadcrumb, BreadcrumbItem, } from 'reactstrap';
import XLSX from 'xlsx';
import _ from 'lodash';
import Static from 'services/static';
import EventList from './list';
import Header from 'components/common/header';
import SideNav from 'components/common/sideNav';
import Loading from 'components/common/loading';
import { CustomSelect, } from 'components/common/forms';
import { getselectData } from 'services/userService'
import { getEvent } from 'services/eventService' 
import { addEvent } from 'services/eventService';
import { rightsData } from 'services/rolesService';
import { getScheduleDetails } from 'services/scheduleService';
import ToastService from 'services/toastService'


var classNames = require('classnames');

export default class EventRoot extends Component {
  constructor(props, context) {
    super(props, context);
    this.bulkModalToggle = this.bulkModalToggle.bind(this);
    this.state = {
      data: {},
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
      EventTypes: [],
      isTableLoading: true,
      modal: false,
      payloadArray: {},
      isClient: true, isEntity: true, isBranch: true, isDepartment: true, isBatch: true
    }
  }

  async componentWillMount(){
    await this.props.isPageLoadingTrue();
  }
  async componentDidMount() {
    const { session } = this.props;
    await this.rightsData(session);
    await this.selectoptGet(`clients`, "clientIds");
    await this.feildCheck();
    await this.props.isPageLoadingFalse();
  }

  rightsData = async (session) => {   
    let res = await rightsData("event", session);
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
    let { session: { data: sessionData } } = this.props;
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
        await this.onSubmit();
        break;
      default:
        data['client'] = client || code;
        data['entity'] = entity || code;
        data['branch'] = branch || branchId;
        await this.setState({ data, isClient: false, isEntity: false, isBranch: false, isDepartment: false, isBatch: false })
        await this.formApi.setValues(data);
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
    client: Joi.string().required().label('Client'),
    entity: Joi.string().required().label('Entity'),
    branch: Joi.string().required().label('Branch'),
  };

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

  setFormApi = (formApi) => {
    this.formApi = formApi
  }

  clientDatas = async (name) => {
    const { data } = this.state;
    switch (name) {
      case "client":
        this.selectoptGet(`namelist?client=${data.client}&type=client`, "entityIds")
        await this.setState({  entity: "", branch: "", department: "", batch: "", branchIds: [], departmentIds: [], batchIds: [] })
        break;
      case "entity":
        this.selectoptGet(`namelist?client=${data.client}&type=entity&entity=${data.entity}`, "branchIds")
        await this.setState({ branch: "", department: "", batch: "", departmentIds: [], batchIds: [] })
        break;
      case "branch":
        this.selectoptGet(`scheduleTypeId?client=${data.client}&type=event&entity=${data.entity}&branch=${data.branch}`, "EventTypes")
        await this.setState({  })
        break;
      default:
        break;
    }
  }

  renderEventForm(eventformType, data, client, entity, branch) {//Pass the datas to the EventList
    const {  prefixUrl, rightsData } = this.state;
    let details = {
      client, entity, branch
    }
    return <EventList
      eventformType={eventformType}
      data={data}
      prefixUrl={prefixUrl}
      props={this.props}
      details={details}
      rightsData={rightsData}
      refreshTable={this.onSubmit}
    />
  }

  addeventNavigation(eventformType) { // navidate to Add Attendees Page        
    return <NavLink onClick={this.redirectTo} className="btn btn-primary btn-sm" to={`/event/add/${eventformType} `}>+ {eventformType} </NavLink>
  }

  bulkModalToggle() {
    this.setState({
      modal: !this.state.modal,
      modalsize: "lg",
    });
  }

  saveDetails(e) {
    if (this.state.ws) {
      if (this.state.ws.length === 0) return ToastService.Toast("You are uploading the empty file!",  'default');
      this.payloadData(this.state.ws, e);
    } else {
      return ToastService.Toast("Upload the  file!",  'default');
    }
  }

  readFile = async (e) => {
    e.persist();
    this.setState({ payloadArray: [], payloadData: [], studentstaffHeaders: '' })
    if (e.target.files[0].size <= 2000000) {
      const rABS = true;
      const files = e.target.files;
      const f = files[0];
      const reader = new FileReader();
      reader.onload = async (e) => {
        var data = e.target.result;
        if (!rABS) data = new Uint8Array(data);
        const wb = XLSX.read(data, { type: rABS ? 'binary' : 'array', cellDates: true })
        const wsname = wb.SheetNames[1];
        const ws = wb.Sheets[wsname];
        data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        this.setState({
          studentstaffHeaders: data[0]
        })
        const datas = XLSX.utils.sheet_to_json(ws, { range: 1, header: this.state.studentstaffHeaders });
        await this.setState({ ws: datas, file: f }, () => {
        });
      };
      if (rABS) reader.readAsBinaryString(f); else reader.readAsArrayBuffer(f);
    } else {
      alert("File size can not exceed 2 MB");
    }
  }

  async payloadData(data, values) {
    
    this.setState({ payloadArray: [], userdataArray: [] })
    const { branch, client, entity, eventname } = values
    let addParams = `client=${client}&entity=${entity}&branch=${branch}`
    await _.map(data).forEach(async (item) => {
      const { StudentName, StudentId, Fee, DepartmentCode, BatchCode } = item;
      let eventBulkdata = {
        "departmentId": DepartmentCode, "event": eventname,
        "student": StudentId, "batchId": BatchCode,
        "fee": Fee, "studentName": StudentName
      }
       await addEvent(addParams, eventBulkdata)
    });
  }

  onSubmit = async () => {
    this.tableHide();
    const { eventformType } = this.props.match.params
    let data = '';
    const { data: { client, entity, branch } } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}`
    let eventparams = `client=${client}&entity=${entity}&branch=${branch}&type=event`
    if (eventformType === 'addAttendees') {
      const eventDetails = await getEvent(params)
      if (eventDetails.data.statusCode === 1) { //check the datas
        data = eventDetails.data.data
        await this.setState({
          tableData: data,
        isTableLoading: false,
          client, entity, branch,
        })
      }else {
        let data = [];
        await this.setState({
            tableData: data,
            isTableLoading: false
        })
        this.renderEventForm(data)
    }

    }
    if (eventformType === "gallery") {
      const res = await getScheduleDetails(eventparams)
      if (res.data.statusCode === 1) { //check the datas
        data = res.data.data
        await this.setState({
          tableData: data,
          isTableLoading: false,
          client, entity, branch,

        })
      }else {
        let data = [];
        await this.setState({
            tableData: data,
            isTableLoading: false
        })
        this.renderEventForm(data)
    }

    }
  }


  
  tableHide() {
    this.setState({
        isTableLoading: true
    })
}




redirectTo = async () => {
  await this.setState({ isTableLoading: true })
  await this.feildCheck()
  await this.formApi.reset();
}
  render() {
    const { eventformType } = this.props.match.params
    const { isPageLoading, isLoading, isTableLoading,tableData, clientIds, entityIds, branchIds, client, entity, branch, rightsData, excludeModules,
      isClient, isEntity, isBranch } = this.state;
    let { keys: formTypeKeys, order: formTypeOrder } = Static.eventFormTypes();
    const { session } = this.props;
    let _form = eventformType;
    formTypeOrder = _.filter(formTypeOrder, v => _.includes(excludeModules, v))
    return (
      <Fragment >
        {session &&
          <div>
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
                      <BreadcrumbItem><NavLink to="/event/addAttendees">event</NavLink></BreadcrumbItem>
                      <BreadcrumbItem active>{eventformType}  </BreadcrumbItem>
                    </Breadcrumb>
                    <Container fluid>
                      <div className="mb-4 subnav-div">
                        {formTypeOrder.map((eventformType) =>
                          <NavLink key={eventformType} onClick={this.redirectTo} to={{ pathname: `/event/${eventformType}`, query: this.props.location.query }} className={classNames('subnav')} activeClassName="subnav-active" exact={true} >{formTypeKeys[eventformType]['label']}</NavLink>
                        )}
                      </div>

                      {eventformType === 'addAttendees' &&
                        <div onClick={this.bulkModalToggle} style={{ float: "right", marginTop: "-32px" }}>
                          {rightsData && rightsData[_form] && rightsData[_form].import.value &&
                            <button style={{ marginRight: "10px" }} className="btn btn-outline-secondary btn-sm" onClick={this.bulkModalToggle}>Bulk Upload</button>
                          }
                          {rightsData && rightsData[_form] && rightsData[_form].create.value &&
                            this.addeventNavigation(eventformType)
                          }
                        </div>
                      }
                      {eventformType === 'gallery' &&
                        <div style={{ textAlign: "right" }}>
                          {rightsData && rightsData[_form] && rightsData[_form].create.value &&
                            this.addeventNavigation(eventformType)
                          }
                        </div>

                      }
                      {isBranch && <Form getApi={this.setFormApi} onSubmit={this.onSubmit} >
                        {({ formApi, formState }) => (
                          <div>
                            <section>
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
                                <Col sm={6} md={3} style={{
                                  marginTop: "24px",
                                }}>
                                  <button type="submit" className="btn btn-primary btn-sm">Submit</button>
                                </Col>
                              </Row>
                            </section>
                          </div>
                        )}
                      </Form>
                      }
                      <br />
                      {!isTableLoading && rightsData &&
                        this.renderEventForm(eventformType, tableData, client, entity, branch)
                      }
                    </Container>
                  </Fragment>
                }
              </div>
            </div>
            <Fragment>
              <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className} size={this.state.modalsize}>
                <ModalHeader toggle={this.toggle}>Import / Export</ModalHeader>
                <ModalBody>
                  <Container>
                    <Form getApi={this.setFormApi} onSubmit={(e) => this.saveDetails(e)} >
                      {({ formApi, formState }) => (
                        <div>
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
                              <Col sm={12} md={3}>
                                <CustomSelect field="eventname" label="Event Name*" name="eventname" getOptionValue={option => option.title} getOptionLabel={option => option.title} options={this.state.EventTypes}
                                />
                              </Col>
                            </Row>
                          </section>
                          <br />
                          <section>
                            <Col sm={6} md={6} >
                              <input id="upload" ref="upload" type="file" onChange={(event) => { this.readFile(event) }} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
                            </Col>
                            <Row className="justify-content-end" >
                              <button type="button" className="btn btn-warning cancel" onClick={this.bulkModalToggle} style={{ marginRight: '20px' }} >Cancel</button>
                              <button type="submit" className="btn btn-primary btn-sm" onSubmit={(e) => this.saveDetails(e)} >Save</button>
                            </Row>
                          </section>
                          <section>
                            <h6>Download Formats</h6>
                            <Row>
                              <Col sm={6} md={6} >
                                <div>
                                  <a href="../assets/xlsformats/event-list.xls" download>Sample format </a>
                                </div><br />
                              </Col>
                            </Row>
                          </section>
                        </div>
                      )}
                    </Form>
                  </Container>
                </ModalBody>
              </Modal>
            </Fragment>
          </div>
        }
      </Fragment >
    );
  }
}

// function redirectTo() {
//   return window.location.reload()
// }
