import React, { Component, Fragment } from 'react';
import { Form, Scope } from 'informed';
import Joi from 'joi-browser';
import { Col, Row } from 'reactstrap';
import moment from 'moment';
import _ from 'lodash';

import { getselectData } from 'services/userService';
import { scheduleInsert, updateScheduleDetails } from 'services/scheduleService';
import { Input, CustomSelect, Textarea } from 'components/common/forms';
import ToastService from 'services/toastService'
import DRP1 from 'components/common/forms/date-range-picker';

const dayList = [];
const weekList = [];

dayList.push("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday");
weekList.push("1st Week", "2nd Week", "3rd Week", "4th Week")

export default class EventForm extends Component {
  state = {
    data: {
      client: "", entity: "", branch: "", department: "", batch: "",
      guest: [], organizer: [], commitee: [],
    },
    organizerImages: [], guestImages: [], membersImages: [],
    clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [],
    EventTypes: [{ id: "Monthly", name: "Monthly" }, { id: "Daily", name: "Daily" }, { id: "Weekly", name: "Weekly" }],
    uid: '',
    errors: {},
    isLoading: true
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
    if (actiontype === "add") {
     
      await this.addCommitee('', '', [])
      await this.addMembers('', '', '', '', 0)
      await this.addGuest('', '', '', '')
      await this.addOrganizer('', '', '', '')
    }
  }

  formStateCheck = async (data) => {
   
    data.description = data.desc;
    data.department = data.clients[0].departmentId;
    data.batch = data.clients[0].batchId;
    data.website = data.event[0].website.url
    data.starttime = data.from.time
    data.endtime = data.to.time
    data.bannerimageurl = data.event[0].banner.type
    data.guest = data.event[0].guest
    data.organizer = data.event[0].organizer
    data.commitee = data.event[0].commitee
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
    } catch (err) { }

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

  schema = {
    client: Joi.string().required().label('Client'),
    entity: Joi.string().required().label('Entity'),
    branch: Joi.string().required().label('Branch'),
    department: Joi.string().required().label('Department'),
    batch: Joi.any().optional().label('Batch'),
    title: Joi.string().required().label('Title'),
    date: Joi.string().required().label('Date'),
    starttime: Joi.string().required().label('StartTime'),
    endtime: Joi.string().required().label('EndTime'),
    eventType: Joi.string().required().label('eventType'),
    website: Joi.string().required().label('WebsiteLink'),
    bannerimage: Joi.string().required().label('BannerImage'),
    description: Joi.string().required(),
  }

  handleChangeFile = async (e) => {
    var file = e.target.files
    await this.setState({
      Bannerimage: file
    })
  }

  handleGuestImage = async (i, { target: { files } }) => {
    const { guestImages } = this.state;
    guestImages.push({ location: i, file: files[0] })
    await this.setState({ guestImages });
  }

  handleOrganizerImage = async (i, { target: { files } }) => {
    const { organizerImages } = this.state;
    organizerImages.push({ location: i, file: files[0] })
    await this.setState({ organizerImages });
  }

  handleMember = async (i, { target: { files } }) => {
    const { membersImages } = this.state;
    membersImages.push({ location: i, file: files[0] })
    await this.setState({ membersImages });
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
    const { actiontype } = this.props
    this.formApi.reset()
    if (actiontype === 'edit') {
      let path = `/schedule/event` //Redirect the page after updated the datas
      this.props.props.history.push({
        pathname: path,
        state: {
        }
      })
    }
  }

  onSubmit = async () => {
    const { actiontype } = this.props
    const data = this.formApi.getState().values;
    let response;
    let week = {}
    let days = []
    if (data.eventType === "Monthly") {
      week[data.weeks] = data.Days
    } else if (data.eventType === "Weekly") {
      days = data.Days
    }
    let scheduleEventDatas = {
      "to": {
        "date": data.date.to,
        "time": data.endtime
      },
      "desc": data.description,
      "from": {
        "date": data.date.from,
        "time": data.starttime
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
        "commitee": data.commitee,
        "banner": {
          "type": data.bannerimageurl,
          "url": "",
          "height": "",
          "width": "",
          "title": ""
        },
        "organizer": data.organizer,
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
        "guest": data.guest,
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
    if (response.data.statusCode !== 1) return ToastService.Toast(response.data.message,   'default'); // Check Datas
    if (response.data.statusCode === 1) {
      await ToastService.Toast(response.data.message,  'default');
      this.resetForm();
    }
  }

  render() {
    const { actiontype } = this.props
    const { clientIds, entityIds, branchIds, departmentIds, batchIds, EventTypes } = this.state
  
    return (
      <Fragment>
        <Form getApi={this.setFormApi} onSubmit={this.onSubmit} >
          {({ formApi, formState }) => (

            <div>
              <section>
                <h6>Client Details</h6>
                <Row>
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
                    <label>Date</label>
                    <DRP1 field="date" label="Date*" id="date" startDate={moment(formState.values.startDate)} endDate={moment(formState.values.endDate)} onChange={(data) => this.dateValue(data, "date")} validate={e => this.validateProperty('date', e)} />
                  </Col>
                  <Col sm={12} md={2}>
                    <Input
                      field="starttime" label="StartTime*" name="starttime"
                      validateOnBlur validate={e => this.validateProperty('starttime', e)}
                    />
                  </Col>
                  <Col sm={12} md={2}>
                    <Input
                      field="endtime" label="EndTime*" name="endtime"
                      validateOnBlur validate={e => this.validateProperty('endtime', e)}
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
                        <Input
                          field="weeks" label="weeks*" name="weeks"
                        />
                      </Col> : null
                  }
                  {
                    this.state.eventType === 'Monthly' || this.state.eventType === 'Weekly' ?
                      <Col sm={6} md={3}>
                        <Input
                          field="Days" label="Days*" name="Days"
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
                      field="bannerimageurl" label="BannerImageURL*" name="bannerimageurl"
                    />
                  </Col>
                  (OR)
                  <Col sm={6} md={3}>
                    <Input
                      field="bannerimage" type="file" label="BannerImage*" name="bannerimage"
                      onChange={this.handleChangeFile}
                    />
                  </Col>
                </Row>
              </section>
              <section>
                <Row className="justify-content-end" >
                  <Col sm={6} md={3}>
                    <button className="btn btn-link btn-sm btn-right" type="button"
                      onClick={() => this.addGuest('', '', '', '')}
                    >+ Add Guest</button>
                  </Col>
                </Row>
                {formState.values.guest && formState.values.guest.map((guest, i) =>
                  <Scope scope={`guest[${i}]`} key={i}>
                    <Row>
                      <Col sm={6} md={4}>
                        <Input
                          field="title" label="Title*" name="title"
                        />
                      </Col>
                      <Col sm={6} md={4}>
                        <Input
                          field="displayName" label="Name*" name="displayName"
                        />
                      </Col>
                      <Col sm={6} md={4}>
                        <Input
                          field="pictureUrl" type="file" label="Image*" name="pictureUrl"
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
                <Row className="justify-content-end" >
                  <Col sm={6} md={3}>
                    <button className="btn btn-link btn-sm btn-right" type="button"
                      onClick={() => this.addOrganizer('', '', '', '')}
                    >+ Add organizer</button>
                  </Col>
                </Row>
                {formState.values.organizer && formState.values.organizer.map((organizer, i) =>
                  <Scope scope={`organizer[${i}]`} key={i}>
                    <Row>
                      <Col sm={6} md={4}>
                        <Input
                          field="title" label="Title*" name="title"
                        />
                      </Col>
                      <Col sm={6} md={4}>
                        <Input
                          field="displayName" label="Name*" name="displayName"
                        />
                      </Col>
                      <Col sm={6} md={4}>
                        <Input
                          field="pictureUrl" type="file" label="Image*" name="pictureUrl" onChange={(e) => this.handleOrganizerImage(i, e)}
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
                          field="Name" label="Commitee Name*" name="Name"
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
                              field="displayName" label="Member Name*" name="displayName"
                            />
                          </Col>
                          <Col sm={6} md={4}>
                            <Input
                              field="title" label="Title*" name="title"
                            />
                          </Col>
                          <Col sm={6} md={4}>
                            <Input
                              field="pictureUrl" type="file" label="Image*" name="pictureUrl" onChange={(e) => this.handleMember(j, e)}
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
              <br />
              <button type="submit" className="btn btn-primary btn-sm">Submit </button>
            </div>
          )}
        </Form>
      </Fragment>
    );
  }
}



