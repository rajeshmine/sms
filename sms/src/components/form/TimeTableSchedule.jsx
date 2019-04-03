import React, { Component, Fragment } from 'react';
import { Form } from 'informed';
import Joi from 'joi-browser';
import { Col, Row } from 'reactstrap';
import moment from 'moment';
import _ from 'lodash';

import { Input, CustomSelect, Textarea } from 'components/common/forms';
import DRP1 from 'components/common/forms/date-range-picker';
import { getselectData, } from 'services/userService';
import { scheduleInsert, updateScheduleDetails, getTermList } from 'services/scheduleService';
import ToastService from 'services/toastService'

export default class TimeTableForm extends Component {
    state = {
        data: {
            client: "", entity: "", branch: "", department: "", batch: "",
        },
        clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [],
        category: [{ id: "Class", name: "Class" },],
        uid: '',
        errors: {},
        isLoading: true
    };

    async componentDidMount() { //Get client Lists
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

    formStateCheck = async (data) => { //Get Datas for edit
        data.description = data.desc;
        data.department = data.clients[0].departmentId;
        data.batch = data.clients[0].batchId;
        data.days = data.timetable[0].category.days
        data.category = data.timetable[0].category.name
        data.classteacher = data.timetable[0].classTeacher
        data.startDate = data.from.date
        data.endDate = data.to.date 
        await this.setState({ data, });
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

    schema = { //validating all the feilds
        client: Joi.string().required().label('Client'),
        entity: Joi.string().required().label('Entity'),
        branch: Joi.string().required().label('Branch'),
        department: Joi.string().required().label('Department'),
        batch: Joi.string().required().label('Batch'),
        title: Joi.string().required().label('Title'),
        date: Joi.string().required().label('Date'),
        description: Joi.string().empty('').optional(),
        days: Joi.string().required().label('Days'),
        category: Joi.string().required().label('Category'),
        classteacher: Joi.string().required().label('Class Teacher'),
        term: Joi.string().required().label("Term"),
    }

    dateValue = async (date, field) => { //Get dete Picker values
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

    resetForm = () => {
        const { actiontype } = this.props
        this.formApi.reset()
        if (actiontype === 'edit') {
            let path = `/schedule/timetable` //Redirect the page after updated the datas
            this.props.props.history.push({
                pathname: path,
                state: {
                }
            })
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
				return ToastService.Toast("No Terms Found", 'default');
			}

		} catch (err) {
			this.handleError(err);
		}
	}

    onSubmit = async () => {
        let response;
        const { actiontype } = this.props
        const data = this.formApi.getState().values;
        let scheduleTimeTableDatas = {
            "type": "timetable",
            "title": data.title,
            "term": data.term,
            "desc": data.description,
            "from": { "date": data.date.from },
            "to": { "date": data.date.to },
            "timetable": {
                "classTeacher": data.classteacher,
                "category": { "name": data.category, "days": data.days, }
            },
            "clients": [{
                "batchId": data.batch,
                "departmentId": data.department
            }]
        }
        let params = `client=${data.client}&entity=${data.entity}&branch=${data.branch}`
        if (actiontype === 'add')
            response = await scheduleInsert(params, scheduleTimeTableDatas)
        else if (actiontype === 'edit')
            response = await updateScheduleDetails(params, scheduleTimeTableDatas)
        if (response.data.statusCode !== 1) return ToastService.Toast(response.data.message,   'default'); // Check Datas
        if (response.data.statusCode === 1) {
            await ToastService.Toast(response.data.message, 'default');
            this.resetForm();
        }
    }

    render() {
        const { actiontype } = this.props
        const { clientIds, entityIds, branchIds, departmentIds, batchIds} = this.state
        return (
            <Fragment>
                <Form getApi={this.setFormApi} onSubmit={this.onSubmit} >
                    {({ formApi, formState }) => (
                        <div>
                            <section>
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
                                <Row>
                                    {actiontype === 'add' &&
                                        < Col sm={12} md={3}>
                                            <Input
                                                field="title" label="Title*" name="title"
                                                validate={e => this.validateProperty('title', e)}
                                            />
                                        </Col>}

                                    {actiontype === 'edit' &&
                                        < Col sm={12} md={3}>
                                            <Input
                                                field="title" label="Title*" name="title"
                                                validate={e => this.validateProperty('title', e)}
                                                disabled
                                            />
                                        </Col>}
                                    <Col sm={12} md={5}>
                                        <label>Date</label>
                                        <DRP1 field="date" label="Date*" id="date" startDate={moment(formState.values.startDate)} endDate={moment(formState.values.endDate)} onChange={(data) => this.dateValue(data, "date")} validate={e => this.validateProperty('date', e)} />
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
                                    <Col sm={12} md={4}>
                                        <CustomSelect field="category" label="Category *" name="category" getOptionValue={option => option.id} getOptionLabel={option => option.name} options={this.state.category} validateOnBlur validate={e => this.validateProperty('category', e)} />
                                    </Col>
                                    <Col sm={12} md={4}>
                                        <Input
                                            field="days" label="Days*" name="days"
                                            validate={e => this.validateProperty('days', e)}
                                        />

                                    </Col>
                                    <Col sm={12} md={4}>
                                        <Input
                                            field="classteacher" label="Class Teacher*" name="classteacher"
                                            validate={e => this.validateProperty('classteacher', e)}
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



