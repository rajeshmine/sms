
import { Form } from 'informed';
import Joi from 'joi-browser';
import React, { Component, Fragment } from 'react';
import { Col, Row } from 'reactstrap';
import _ from 'lodash';
import moment from 'moment';

import { getselectData } from 'services/userService';
import { scheduleInsert, updateScheduleDetails, getTermList } from 'services/scheduleService';
import { Input, CustomSelect, Textarea } from 'components/common/forms';
import DRP1 from 'components/common/forms/date-range-picker';
import ToastService from 'services/toastService'

export default class ExamForm extends Component {
  state = {
    data: {
      client: "", entity: "", branch: "", department: "", batch: ""  },
    clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [],
    exams: [{ id: "online", name: "online" }, { id: "offline", name: "offline" }],
    uid: '',
    errors: {},
    isLoading: true
  };
  
  schema = {
    client: Joi.string().required(),
    entity: Joi.string().required(),
    branch: Joi.string().required(),
    department: Joi.string().required().label('Department'),
    batch: Joi.any().optional().label('Batch'),
    title: Joi.string().required(),
    date: Joi.string().required(),
    description: Joi.string().required(),
    exammode: Joi.string().required(),
    syllabus: Joi.string().required(),
    correct: Joi.any().required(),
    wrong: Joi.string().required(),
    unanswered: Joi.string().required(),
    outoff: Joi.string().required(),
    starttime: Joi.string().required(),
    endtime: Joi.string().required(),
    cutoff: Joi.string().required(),
    noOfTimes: Joi.string().required(),
    term: Joi.string().required().label("Term"),
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
				return ToastService.Toast("No Terms Found", '', 'Failed');
			}

		} catch (err) {
			this.handleError(err);
		}
	}



  formStateCheck = async (data) => {
    let Exam = data.exam[0];
    data.department = data.clients[0].departmentId;
    data.batch = data.clients[0].batchId;
    data.description = data.desc
    data.correct = Exam.score.correct
    data.wrong = Exam.score.unanswered
    data.unanswered = Exam.score.wrong
    data.noOfTimes = Exam.noOfTimes
    data.cutoff = Exam.cutoff
    data.outoff = Exam.outoff
    data.term = Exam.term
    data.starttime = data.from.time
    data.endtime = data.to.time
    data.exammode = Exam.mode
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
        case "batch":
				this.getTermsList() 

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
    let params, response, scheduleExamData;
    params = `client=${data.client}&entity=${data.entity}&branch=${data.branch}`

    scheduleExamData = {
      "type": "exam",
      "clients": [{ "batchId": data.batch, "departmentId": data.department }],
      "title": data.title,
      "term":data.term,
      "desc": data.description,
      "from": {
        "date": data.date.from,
        "time": data.starttime || ''
      },
      "to": { "date": data.date.to, "time": data.endtime || '' },
      "exam": {
        "mode": data.exammode,
        "outoff": data.outoff,
        "cutoff": data.cutoff,
        "noOfTimes": data.noOfTimes,
        "score": {
          "correct": data.correct,
          "unanswered": data.unanswered,
          "wrong": data.wrong
        }
      }
    }
    if (actiontype === "add") {
      response = await scheduleInsert(params, scheduleExamData)
    } else if (actiontype === "edit") {
      response = await updateScheduleDetails(params, scheduleExamData)
    }
    if (response.data.statusCode !== 1) return ToastService.Toast(response.data.message,  'default'); // Check Datas
    if (response.data.statusCode === 1) {
      await ToastService.Toast(response.data.message,  'default');
      this.resetForm();
    }
  }

  render() {
    const { actiontype } = this.props
    const { clientIds, entityIds, branchIds, departmentIds, batchIds, exams, data: { exammode } } = this.state
     
    return (
      <Fragment>
        <h6>Add Exam Schedule</h6>
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
                  <Col sm={6} md={3}>
                      <CustomSelect field="term" label="Terms*" name="term" getOptionValue={option => option.id} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('term', e)}
                          options={this.state.allTerms} onChange={this.handleChange} />
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
              <section>
                <Row>
                  <Col sm={12} md={3}>
                    <CustomSelect field="exammode" label="Exam Mode*" name="exammode" getOptionValue={option => option.id}
                      getOptionLabel={option => option.name} options={exams}
                      validateOnBlur validate={e => this.validateProperty('exammode', e)} onChange={this.handleChange} />
                  </Col>
                  <Col sm={12} md={3}>
                    <Input
                      field="outoff" label="Total Marks*" name="outoff"
                      validateOnBlur validate={e => this.validateProperty('outoff', e)}
                    />
                  </Col>
                </Row>
                {exammode === 'online' &&
                  <Row>
                    <Col sm={12} md={3}>
                      <CustomSelect field="department" label="Department*" name="department" getOptionValue={option => option.code}
                        getOptionLabel={option => option.name} options={departmentIds}
                        validateOnBlur validate={e => this.validateProperty('department', e)} onChange={this.handleChange} />
                    </Col>
                    <Col sm={12} md={2}>
                      <Input
                        field="starttime" label="Start Time*" name="starttime"
                        validateOnBlur validate={e => this.validateProperty('starttime', e)}
                      />
                    </Col>
                    <Col sm={12} md={2}>
                      <Input
                        field="endtime" label="End Time*" name="endtime"
                        validateOnBlur validate={e => this.validateProperty('endtime', e)}
                      />
                    </Col>
                    <Col sm={12} md={2}>
                      <Input
                        field="cutoff" label="Cutoff Marks*" name="cutoff"
                        validateOnBlur validate={e => this.validateProperty('cutoff', e)}
                      />
                    </Col>
                    <Col sm={12} md={2}>
                      <Input
                        field="noOfTimes" label="No Of Times*" name="noOfTimes"
                        validateOnBlur validate={e => this.validateProperty('noOfTimes', e)}
                      />
                    </Col>
                  </Row>}
                <Row>
                  <Col sm={12} md={3}>
                    <Input
                      field="correct" label="Correct* (Score Type)" name="correct"
                      validateOnBlur validate={e => this.validateProperty('correct', e)}
                    />
                  </Col>
                  <Col sm={12} md={3}>

                    <Input
                      field="wrong" label="Wrong* (Score Type)" name="wrong"
                      validateOnBlur validate={e => this.validateProperty('wrong', e)}
                    />
                  </Col>
                  <Col sm={12} md={3}>
                    <Input
                      field="unanswered" label="Unanswered* (Score Type)" name="unanswered"
                      validateOnBlur validate={e => this.validateProperty('unanswered', e)}
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



