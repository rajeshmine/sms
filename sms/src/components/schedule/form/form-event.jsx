import React, { Component, Fragment } from 'react';
import { Form, Scope } from 'informed';
import Joi from 'joi-browser';
import { Col, Row } from 'reactstrap';
import moment from 'moment';
import _ from 'lodash';
import { getselectData } from 'services/userService';
import { scheduleInsert, updateScheduleDetails,academicDateRange } from 'services/scheduleService';
import { Input, CustomSelect, Textarea, MultiSelect, RTimePicker } from 'components/common/forms';
import ToastService from 'services/toastService'
import DRP1 from 'components/common/forms/date-range-picker';
import  { post } from 'axios';
import {apiUrl} from './../../../config.json'


var today = new Date();
var dd = today.getDate();
var mm = today.getMonth() + 1; //January is 0!

var yyyy = today.getFullYear();
if (dd < 10) {
  dd = '0' + dd;
} 
if (mm < 10) {
  mm = '0' + mm;
} 
var todayDate = mm + '/' + dd + '/' + yyyy;


const options = [
  { value: 'Monday', label: 'Monday' },
  { value: 'Tuesday', label: 'Tuesday' },
  { value: 'Wednesday', label: 'Wednesday' },
  { value: 'Thursday', label: 'Thursday' },
  { value: 'Friday', label: 'Friday' },
  { value: 'Saturday', label: 'Saturday' },
];

export default class EventForm extends Component {
  state = {
    data: {
      client: "", entity: "", branch: "", department: "", batch: "",
      guest: [], organizer: [], commitee: [],
    },
    organizerImages: [], guestImages: [], membersImages: [],
    clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [],
    EventTypes: [{ id: "Monthly", name: "Monthly" }, { id: "Daily", name: "Daily" }, { id: "Weekly", name: "Weekly" }],
    week: [{ id: "1st Week", name: "1st Week" }, { id: "2nd Week", name: "2nd Week" }, { id: "3rd Week", name: "3rd Week" }],
    uid: '',
    errors: {},
    isLoading: true,
    isClient: true, isEntity: true, isBranch: true, isDepartment: true, isBatch: true,
    todayDate : todayDate
  };

  async componentDidMount() {
    const { data } = this.state
    this.selectoptGet(`clients`, "clientIds")
    await this.feildCheck()
    this.formApi.setValues(data);
    const { actiontype } = this.props
    if (actiontype === "edit") {
      this.setState({ isEditForm: true });
      const { location: { state } } = this.props.props;
      if (state !== undefined)
        return this.formStateCheck(state.scheduledata);
    }
    if (actiontype === "add") {
      await this.addCommitee('', '', [])
      await this.addMembers('', '', '', '', 0)
      await this.addGuest('', '', '', '')
      await this.addOrganizer('', '', '', '')
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
        await this.setState({ data, isClient: false, isEntity: false, isBranch: false, isDepartment: false, isBatch: false })
        await this.formApi.setValues(data);
        break;
    }
  }

  formStateCheck = async (data) => {
    data.description = data.desc;
    data.department = data.clients[0].departmentId;
    data.batch = data.clients[0].batchId;
    data.website = data.event[0].website.url
    data.startTime = data.from.time
    data.endTime = data.to.time
    data.bannerimageurl = data.event[0].banner.type
    if (data.event && data.event[0] && data.event[0].guest) {
      for (let item of data.event[0].guest) {
        item.pictureUrl = ''
      }
    }
    if (data.event && data.event[0] && data.event[0].organizer) {
      for (let item of data.event[0].organizer) {
        item.pictureUrl = ''
      }
    }
    if (data.event && data.event[0] && data.event[0].commitee) {
      for (let item of data.event[0].commitee) {
        for (let i of item.members)
          i.pictureUrl = ''
      }
    }
    data.guest = data.event[0].guest
    data.organizer = data.event[0].organizer
    data.commitee = data.event[0].commitee
    data.startDate = data.from.date
    data.endDate = data.to.date
    data.eventType = data.event[0].type
    if (data.event[0].type === 'Monthly') {
      data.weeks = Object.keys(data.event[0].monthly.week)
      let day = data.event[0].monthly.week["1st Week"]
      data.Days = day
    }
    if (data.event[0].type === 'Weekly') {
      data.Days = data.event[0].weekly.days
    }
    await this.setState({ data, eventType: data.event[0].type, options });
    try {
      await this.clientDatas('client');
      await this.clientDatas('entity');
      await this.clientDatas('branch');
      await this.clientDatas('department');
      await this.clientDatas('batch');
      await this.formApi.setValues(data);
    } catch (err) {
    }
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

  clientDatas = async (name) => {// Get the Client,Entity,Branch,Department,Batch,EventName Lists
    const { data } = this.state;
    switch (name) {
      case "client":
        await this.selectoptGet(`namelist?client=${data.client}&type=client`, "entityIds")
        await this.setState({ entity: "", branch: "", department: "", batch: "", branchIds: [], departmentIds: [], batchIds: [] })
        break;
      case "entity":
        await this.academicDateRange();
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
        break;
      default: break;
    }
  }

  academicDateRange = async () =>{
    const { data:{client,entity} } = this.state;
    let r = await academicDateRange(`client=${client}&entity=${entity}`)
   
    if(r && r.data && r.data.statusCode === 1){
      r = r.data.data
      await this.setState({toRange : r})
    }else{

    }
  
  }

  schema = {
    client: Joi.string().required().label('Client'),
    entity: Joi.string().required().label('Entity'),
    branch: Joi.string().required().label('Branch'),
    department: Joi.any().optional(),
    batch: Joi.any().optional(),
    title: Joi.string().required().label('Title'),
    date: Joi.string().required().label('Date'),
    startTime: Joi.string().required().label('StartTime'),
    endTime: Joi.string().required().label('EndTime'),
    eventType: Joi.string().required().label('eventType'),
    website: Joi.string().required().label('WebsiteLink'),
    description: Joi.string().empty('').optional(),
    weeks: Joi.string().required().label('Weeks'),
  }

  handleChangeFile = async ({ target: { files } }) => {
    await this.setState({
      Bannerimage: await this.fileUpload(files[0]).then((res) => res.data.name)
    })
  }

  handleGuestImage = async (i, { target: { files } }) => {
    const { guestImages } = this.state;
    await guestImages.push({ location: i, file: await this.fileUpload(files[0]).then((res) => res.data.name) })
    await this.setState({ guestImages });
  }

  handleOrganizerImage = async (i, { target: { files } }) => {
    const { organizerImages } = this.state;
    await organizerImages.push({ location: i, file: await this.fileUpload(files[0]).then((res) => res.data.name) })
    await this.setState({ organizerImages });
  }

  handleMember = async (i, j, { target: { files } }) => {
    const { membersImages } = this.state;
    await membersImages.push({ cLocation: i, mLocation: j, file: await this.fileUpload(files[0]).then((res) => res.data.name) })
    await this.setState({ membersImages });
  }
  fileUpload(file) {
    const url = `${apiUrl}/uploadfile`;
    const formData = new FormData();
    formData.append('file', file)
    const config = {
        headers: { 'content-type': 'multipart/form-data' }
    }       
    return post(url, formData, config)
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

  timeValue = async (time, field) => { // Get time from the timepicker
    const data = this.formApi.getState().values;
    data[field] = time;
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

  addGuest = async (displayName, pictureUrl, title, desc) => {
    const data = { displayName, pictureUrl, title, desc };
    const values = this.formApi.getState().values;
    var guest = [];
    if (values.guest)
      guest = values.guest;
    guest.push(data)
    this.formApi.setValues({ ...values, guest: guest });
  }

  removeGuest = (i) => {
    const values = this.formApi.getState().values;
    let guest = values.guest;
    guest.splice(i, 1);
    this.formApi.setValues({ ...values, guest: guest });
  }

  addOrganizer = async (displayName, pictureUrl, title, desc) => {
    const data = { displayName, pictureUrl, title, desc };
    const values = this.formApi.getState().values;
    var organizer = [];
    if (values.organizer)
      organizer = values.organizer;
    organizer.push(data)
    this.formApi.setValues({ ...values, organizer: organizer });
  }

  removeOrganizer = (i) => {
    const values = this.formApi.getState().values;
    let organizer = values.organizer;
    organizer.splice(i, 1);
    this.formApi.setValues({ ...values, organizer: organizer });
  }

  addCommitee = async (Name, description, members) => {
    const data = { Name, description, members };
    const values = this.formApi.getState().values;
    var commitee = [];
    if (values.commitee)
      commitee = values.commitee;
    commitee.push(data)
    this.formApi.setValues({ ...values, commitee: commitee });
  }

  removeCommitee = (i) => {
    const values = this.formApi.getState().values;
    let commitee = values.commitee;
    commitee.splice(i, 1);
    this.formApi.setValues({ ...values, commitee: commitee });
  }

  addMembers = async (displayName, title, desc, pictureUrl, index) => {
    const data = { displayName, title, desc, pictureUrl };
    const values = this.formApi.getState().values;
    var commitee = [];
    if (values.commitee && values.commitee[index] && values.commitee[index].members) {
      commitee = values.commitee;
      commitee[index].members.push(data)
    }
    this.formApi.setValues({ ...values, commitee: commitee });
  }

  removeMembers = (i, j) => {
    const values = this.formApi.getState().values;
    let commitee = values.commitee;
    commitee[i].members.splice(j, 1);
    this.formApi.setValues({ ...values, commitee: commitee });
  }

  resetForm = () => {
    this.formApi.reset()
    let path = `/schedule/event`
    this.props.props.history.push({
      pathname: path,
    })
  }

  onSubmit = async () => {
    const { actiontype } = this.props
    const data = this.formApi.getState().values;
    let response, bannerimg;
    let week = {}
    let days = []
    const { organizerImages, guestImages, membersImages, Bannerimage } = this.state
    const { organizer, guest, commitee } = data
    if (Bannerimage) {
      bannerimg = Bannerimage
    } else {
      bannerimg = data.bannerimageurl
    }

    if (guestImages.length > 0) {
      await _.map(guest, async (v, i) => {
        let s = await _.filter(guestImages, j => j.location === i)
        v["pictureUrl"] = s[0]["file"];
      });
    }
    if (organizerImages.length > 0) {
      await _.map(organizer, async (v, i) => {
        let s = await _.filter(organizerImages, j => j.location === i)
        v["pictureUrl"] = s[0]["file"];
      });
    }
    if (membersImages.length > 0) {
      await _.map(commitee, async (v, i) => {
        await _.map(v["members"], async (k, j) => {
          let s = await _.filter(membersImages, m => m.cLocation === i && m.mLocation === j)
          k["pictureUrl"] = s[0]["file"];
        });
      });
    }
    if (data.eventType === "Monthly") {
      week[data.weeks] = data.Days
    } else if (data.eventType === "Weekly") {
      days = data.Days
    }
    let scheduleEventDatas = {
      "to": {
        "date": data.endDate || this.state.todayDate,
        "time": data.endTime || ''
      },
      "desc": data.description,
      "from": {
        "date": data.startDate || this.state.todayDate,
        "time": data.startTime || '',
      },
      "title": data.title,
      "clients": [
        {
          "batchId": data.batch,
          "departmentId": data.department
        }
      ],
      "type": "event",
      "event": {
        "daily": {},
        "commitee": commitee || '',
        "banner": {
          "type": bannerimg || '',
          "url": "",
          "height": "",
          "width": "",
          "title": ""
        },
        "organizer": organizer || '',
        "gallery": [
          {
            "type": "",
            "url": "",
            "height": "",
            "width": "",
            "title": ""
          }
        ],
        "weekly": {
          days
        },
        "website": {
          "url": data.website,
          "target": "_blank"
        },
        "guest": guest || '',
        "type": data.eventType,
        "monthly": {
          week
        }
      }
    }
    let params = `client=${data.client}&entity=${data.entity}&branch=${data.branch}`
    if (actiontype === 'add') {
      response = await scheduleInsert(params, scheduleEventDatas)
    } else if (actiontype === 'edit') {
      response = await updateScheduleDetails(params, scheduleEventDatas)
    }
    if (response.data.statusCode !== 1) return ToastService.Toast(response.data.message, 'default'); // Check Datas
    if (response.data.statusCode === 1) {
      await ToastService.Toast(response.data.message, 'default');
      const { props } = this.props;
      props.history.goBack();
    }
  }

  render() {
    const { actiontype } = this.props
    const { clientIds, entityIds, branchIds, departmentIds, batchIds, EventTypes,
      isClient, isEntity, isBranch, isDepartment, isBatch ,toRange} = this.state
      let range = toRange && toRange[0];   
     
      const isOutsideRange = (day => {
        let dayIsBlocked = false;
        if (moment().diff(day, 'days') > 0) {
          dayIsBlocked = true;
        }
        if(range && range.academic.to !==''){
        if(day > moment(range.academic.to)) {
            dayIsBlocked = true;
        }
      }
        return dayIsBlocked;
      })
  

    return (
      <Fragment>
        <h6>Schedule Event</h6>
        <Form getApi={this.setFormApi} onSubmit={this.onSubmit} >
          {({ formApi, formState }) => (
            <div>
              {isBatch && <section>
                <h6>Client Details</h6>
                <Row>
                  {isClient && <Col sm={12} md={3}>
                    <CustomSelect field="client" label="Client*" name="client" getOptionValue={option => option.code}
                      getOptionLabel={option => option.name} options={clientIds}
                      validateOnBlur validate={e => this.validateProperty('client', e)} onChange={this.handleChange} />
                  </Col>}
                  {isEntity &&
                    <Col sm={12} md={3}>
                      <CustomSelect field="entity" label="Entity*" name="entity" getOptionValue={option => option.code}
                        getOptionLabel={option => option.name} options={entityIds}
                        validateOnBlur validate={e => this.validateProperty('entity', e)} onChange={this.handleChange} />
                    </Col>}
                  {isBranch &&
                    <Col sm={12} md={3}>
                      <CustomSelect field="branch" label="Branch*" name="branch" getOptionValue={option => option.code}
                        getOptionLabel={option => option.name} options={branchIds}
                        validateOnBlur validate={e => this.validateProperty('branch', e)} onChange={this.handleChange} />
                    </Col>}
                  {isDepartment &&
                    <Col sm={12} md={3}>
                      <CustomSelect field="department" label="Department" name="department" getOptionValue={option => option.code}
                        getOptionLabel={option => option.name} options={departmentIds}
                        onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('department', e)} />
                    </Col>}
                  {isBatch &&
                    <Col sm={12} md={3}>
                      <CustomSelect field="batch" label="Batch" name="batch" getOptionValue={option => option.code}
                        getOptionLabel={option => option.name} options={batchIds}
                        onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('batch', e)} />
                    </Col>}
                </Row>
              </section>}
              <section>
                <Row>{
                  actiontype === 'add' &&
                  <Col sm={12} md={3}>
                    <Input
                      field="title" label="Title*" name="title"
                      validate={e => this.validateProperty('title', e)}
                    />
                  </Col>
                }
                  {
                    actiontype === 'edit' &&
                    <Col sm={12} md={3}>
                      <Input
                        field="title" label="Title*" name="title"
                        validate={e => this.validateProperty('title', e)}
                        disabled
                      />
                    </Col>
                  }
                  <Col sm={12} md={5}>
                    <label>Date*</label>
                    <DRP1 isOutsideRange={isOutsideRange} field="date" label="Date*" id="date" startDate={moment(formState.values.startDate)} endDate={moment(formState.values.endDate)} onChange={(data) => this.dateValue(data, "date")} validate={e => this.validateProperty('date', e)} />
                  </Col>
                  <Col sm={12} md={2}>
                    <RTimePicker
                      field="startTime" label="StartTime*" value={moment(formState.values.startTime ? formState.values.startTime : "12:00 am", "h:mm a")} onChange={(data) => this.timeValue(data, "startTime")}
                    />
                  </Col>
                  <Col sm={12} md={2}>
                    <RTimePicker
                      field="endTime" label="EndTime*" value={moment(formState.values.endTime ? formState.values.endTime : "12.00 pm", "h:mm a")} onChange={(data) => this.timeValue(data, "endTime")}
                    />
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
                <h6>Event Details</h6>
                <Row>
                  <Col sm={6} md={3}>
                    <CustomSelect field="eventType" label="Event Occurance Type*" name="eventType" getOptionValue={option => option.code} validateOnBlur validate={e => this.validateProperty('eventType', e)} getOptionLabel={option => option.name} options={EventTypes}
                      onChange={this.handleChange} />
                  </Col>
                  {
                    this.state.eventType === 'Monthly' ?
                      <Col sm={6} md={3}>
                        <CustomSelect field="weeks" label="Weeks*" name="weeks" getOptionValue={option => option.id} getOptionLabel={option => option.name} options={this.state.week} onChange={this.handleChange}
                          validateOnBlur validate={e => this.validateProperty('weeks', e)}
                        />
                      </Col> : null
                  }
                  {
                    this.state.eventType === 'Monthly' || this.state.eventType === 'Weekly' ?
                      <Col sm={6} md={3}>
                        <MultiSelect field="Days" label="Days" name="Days"
                          options={options}
                        />
                      </Col> : null
                  }
                  <Col sm={6} md={3}>
                    <Input
                      field="website" label="WebsiteLink*" name="website"
                      validateOnBlur validate={e => this.validateProperty('website', e)}
                    />
                  </Col>
                  <Col sm={6} md={3}>
                    <Input
                      field="bannerimageurl" label="BannerImageURL" name="bannerimageurl"
                    />
                  </Col>
                  (OR)
                  <Col sm={6} md={3}>
                    <Input
                      field="bannerimage" type="file" label="BannerImage" name="bannerimage"
                      onChange={this.handleChangeFile}
                    />
                  </Col>
                </Row>
              </section>

              <section>
                <h6>Guest Details</h6>
                <Row className="justify-content-end" style={{ marginLeft: '140px' }}>
                  <Col sm={6} md={3}>
                    <button className="btn btn-link btn-sm" type="button"
                      onClick={() => this.addGuest('', '', '', '')}
                    >+ Add Guest</button>
                  </Col>
                </Row>
                {formState.values.guest && formState.values.guest.map((guest, i) =>
                  <Scope scope={`guest[${i}]`} key={i}>
                    <Row>
                      <Col sm={6} md={4}>
                        <Input
                          field="title" label="Title" name="title"
                        />
                      </Col>
                      <Col sm={6} md={4}>
                        <Input
                          field="displayName" label="Name" name="displayName"
                        />
                      </Col>
                      <Col sm={6} md={4}>
                        <Input
                          field="pictureUrl" type="file" label="Image" name="pictureUrl"
                          onChange={(e) => this.handleGuestImage(i, e)}
                        />
                      </Col>
                      <Col sm={6} md={12}>
                        <Textarea
                          field="desc" label="Description" name="desc"
                        />
                      </Col>
                    </Row>
                    <Col sm={12}><button onClick={() => this.removeGuest(i)} className="btn btn-link btn-sm">Remove</button>
                    </Col>
                  </Scope>
                )}
              </section>
              <section>
                <h6>Organizer Details</h6>
                <Row className="justify-content-end" style={{ marginLeft: '140px' }}>
                  <Col sm={6} md={3}>
                    <button className="btn btn-link btn-sm" type="button"
                      onClick={() => this.addOrganizer('', '', '', '')}
                    >+ Add Organizer</button>
                  </Col>
                </Row>
                {formState.values.organizer && formState.values.organizer.map((organizer, i) =>
                  <Scope scope={`organizer[${i}]`} key={i}>
                    <Row>
                      <Col sm={6} md={4}>
                        <Input
                          field="title" label="Title" name="title"
                        />
                      </Col>
                      <Col sm={6} md={4}>
                        <Input
                          field="displayName" label="Name" name="displayName"
                        />
                      </Col>
                      <Col sm={6} md={4}>
                        <Input
                          field="pictureUrl" type="file" label="Image" name="pictureUrl" onChange={(e) => this.handleOrganizerImage(i, e)}
                        />
                      </Col>
                      <Col sm={6} md={12}>
                        <Textarea
                          field="desc" label="Description" name="desc"
                        />
                      </Col>
                    </Row>
                    <Col sm={12}><button onClick={() => this.removeOrganizer(i)} className="btn btn-link btn-sm">Remove</button>
                    </Col>
                  </Scope>
                )}
              </section>
              <section>
                <h6>Commitee Details</h6>
                <Row className="justify-content-end" style={{ marginLeft: '140px' }}>
                  <Col sm={6} md={3}>
                    <button className="btn btn-link btn-sm" type="button"
                      onClick={() => this.addCommitee('', '', [])}
                    >+ Add Commitee</button>
                  </Col>
                </Row>
                {formState.values.commitee && formState.values.commitee.map((commitee, i) =>
                  <Scope scope={`commitee[${i}]`} key={i}>
                    <Row>
                      <Col sm={6} md={4}>
                        <Input
                          field="Name" label="Commitee Name" name="Name"
                        />
                      </Col>
                      <Col sm={6} md={12}>
                        <Textarea
                          field="description" label="Description" name="description"
                        />
                      </Col>
                      <Row className="justify-content-end" style={{ marginLeft: '821px' }}>
                        <button className="btn btn-link btn-sm" type="button"
                          onClick={() => this.addMembers('', '', '', '', i)}
                        >+ Add Member</button>
                      </Row>
                      {formState.values.commitee[i].members && formState.values.commitee[i].members.map((members, j) =>
                        <Scope scope={`members[${j}]`} key={j}>
                          <Col sm={6} md={4}>
                            <Input
                              field="displayName" label="Member Name" name="displayName"
                            />
                          </Col>
                          <Col sm={6} md={4}>
                            <Input
                              field="title" label="Title" name="title"
                            />
                          </Col>
                          <Col sm={6} md={4}>
                            <Input
                              field="pictureUrl" type="file" label="Image" name="pictureUrl" onChange={(e) => this.handleMember(i, j, e)}
                            />
                          </Col>
                          <Col sm={6} md={12}>
                            <Textarea
                              field="desc" label="Description" name="desc"
                            />
                          </Col>
                          <Col sm={12}><button onClick={() => this.removeMembers(i, j)} className="btn btn-link btn-sm">Remove member</button>
                          </Col>
                        </Scope>
                      )}
                    </Row>
                    <br />
                    <Col sm={12}><button onClick={() => this.removeCommitee(i)} className="btn btn-link btn-sm" style={{ marginLeft: '-17px' }}>Remove Commitee</button>
                    </Col>
                  </Scope>
                )}
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



