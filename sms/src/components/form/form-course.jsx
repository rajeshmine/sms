import React, { Component, Fragment } from 'react';
import { Form } from 'informed';
import Joi from 'joi-browser';
import { Col, Row } from 'reactstrap';

import moment from 'moment';
import _ from 'lodash';
import ToastService from 'services/toastService'
import { getselectData } from 'services/userService';
import { scheduleInsert, updateScheduleDetails, getTermList } from 'services/scheduleService';
import { Input, CustomSelect, Textarea } from 'components/common/forms';
import DRP1 from 'components/common/forms/date-range-picker';

const dayList = [];
const weekList = [];

dayList.push("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday");
weekList.push("1st Week", "2nd Week", "3rd Week", "4th Week")

export default class CourseForm extends Component {
  state = {
    data: {
      client: "", entity: "", branch: "", department: "", batch: "",
    },
    clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [],
    EventTypes: [{ id: "Monthly", name: "Monthly" }, { id: "Daily", name: "Daily" }, { id: "Weekly", name: "Weekly" }],
    uid: '',
    errors: {},
    isLoading: true
  };

  async componentDidMount() {
   
    const { actiontype } = this.props
    const { data } = this.state
    this.selectoptGet(`clients`, "clientIds")
    this.formApi.setValues(data);
    if (actiontype === "edit") {
      this.setState({ isEditForm: true });
      const { location: { state: { scheduledata } } } = this.props.props;
     
      if (scheduledata !== undefined) { }
      return this.formStateCheck(scheduledata);
    }
  }



  formStateCheck = async (data) => {
  
    data.description = data.desc
    data.starttime = data.from.time
    data.endtime = data.to.time
    data.code = data.course[0].code
    data.department = data.clients[0].departmentId;
    data.batch = data.clients[0].batchId;
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
    bannerimage: Joi.string().required().label('BannerImage'),
    description: Joi.string().required(),
    code: Joi.string().required().label('BannerImage'),
    term: Joi.string().required().label("Term"),
    // links: Joi.string().required().label('BannerImage')
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
				this.getTermsList() 

			break;
      default:
      break;
    }
  }

  handleChangeFile = async (e) => {
    const data = this.formApi.getState().values
    data.bannerimageURL = e.target.files
    await this.formApi.setValues(data)
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

  async getTermsList() {
		var termssArray = []
		const { data: { client, branch, entity, department, batch } } = this.state
		let params = `client=${client}&entity=${entity}&branch=${branch}&department=${department}&batch=${batch}&type=term`;
	
		try {
			const termList = await getTermList(params)

			if (termList.data.statusCode === 1) {
				let terms = termList.data.data
			
				for (var i = 0; i < terms.length; i++) {
					termssArray.push({ 'name': terms[i].title, 'code': terms[i]._id })
				}
				await this.setState({
					allTerms: termssArray
				})
			} else {
				return ToastService.Toast("No Terms Found", 'default');
			}

		} catch (err) {
			this.handleError(err);
		}
	}




  onSubmit = async () => {
    const { actiontype } = this.props

    const data = this.formApi.getState().values;
  

    const { title,term, description, starttime, department, bannerimageurl, endtime, batch, entity, branch, client, code } = data

    let params = `client=${client}&entity=${entity}&branch=${branch}`


    if (actiontype === 'add') {
    let scheduleCourseDatas = {
      "type": "course",
      "title": title,
      "term": term,
      "desc": description,
      "from": { "date": data.date.from, "time": starttime },
      "to": { "date": data.date.to, "time": endtime },
      "course": {
        "code": code,
        "website": {
          "url": bannerimageurl,
          "target": "_blank"
        }
      },
      "clients": [
        {
          "departmentId": department,
          "batchId": batch
        }
      ]
    }
   
      let res = await scheduleInsert(params, scheduleCourseDatas)
     
      if (res.data.statusCode !== 1) return ToastService.Toast(res.data.message, 'default');
      if (res.data.statusCode === 1) {
        ToastService.Toast(res.data.message, 'default');
        this.props.props.history.push(`/schedule/course`)
        // this.resetForm();
      }

     
    
  }else if(actiontype === 'edit'){

    let scheduleCourseDatas = {
      "type": "course",
      "title": title,
      "term": term,
      "desc": description,
      "from": { "date": data.from.date, "time": starttime },
      "to": { "date": data.to.date, "time": endtime },
      "course": {
        "code": code,
        "website": {
          "url": bannerimageurl,
          "target": ""
        }
      },
      "clients": [
        {
          "departmentId": department,
          "batchId": batch
        }
      ]
    }


    let res = await updateScheduleDetails(params, scheduleCourseDatas)
  
    if (res.data.statusCode !== 1) return ToastService.Toast(res.data.message, 'default');
    if (res.data.statusCode === 1) {
      ToastService.Toast(res.data.message, 'default');
      this.props.props.history.push(`/schedule/course`)
      // this.resetForm();
    }
  }


}

  resetForm = () => {
    this.formApi.reset()
  }
  render() {
    const { clientIds, entityIds, branchIds, departmentIds, batchIds } = this.state
    const { actiontype } = this.props
    return (
      <Fragment>
        <h6>Schedule Course</h6>
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
                   <Col sm={6} md={3}>
                        <CustomSelect field="term" label="Terms*" name="term" getOptionValue={option => option.id} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('term', e)}
                        options={this.state.allTerms} onChange={this.handleChange} />
                    </Col>
                </Row>
              </section>
              <section>
                <h6>Course Details</h6>
                <Row>
                {
                    actiontype === 'edit' &&
                    <Col sm={12} md={3}>
                      <Input
                        field="code" label="Code*" name="code" disabled
                        validate={e => this.validateProperty('code', e)}
                      />
                    </Col>
                  }
                  <Col sm={12} md={3}>
                    <Input
                      field="code" label="Code*" name="code"
                      validate={e => this.validateProperty('code', e)}
                    />
                  </Col>
                  <Col sm={12} md={3}>
                    <Input
                      field="title" label="Title*" name="title"
                      validate={e => this.validateProperty('title', e)}
                    />
                  </Col>
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
                  <Col sm={12} md={3}>
                    {/* <Input
                      field="links" label="Links" name="links"
                      validateOnBlur validate={e => this.validateProperty('links', e)}
                    /> */}
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
                <Row>
                  <Col sm={6} md={3}>
                    <Input
                      field="bannerimageurl" label="BannerImageURL*" name="bannerimage"
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
              <button type="submit" className="btn btn-primary btn-sm">Submit </button>
            </div>
          )}
        </Form>
      </Fragment>
    );
  }
}



