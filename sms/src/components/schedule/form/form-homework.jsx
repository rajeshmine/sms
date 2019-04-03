import { Input, CustomSelect, Textarea } from 'components/common/forms';
import DRP1 from 'components/common/forms/date-range-picker';
import { Form } from 'informed';
import Joi from 'joi-browser';
import React, { Component, Fragment } from 'react';
import { Col, Row } from 'reactstrap';
import { getselectData } from 'services/userService';
import { scheduleInsert, getSubjectsList, updateScheduleDetails, getTermList, academicDateRange } from 'services/scheduleService';

import moment from 'moment';
import ToastService from 'services/toastService'

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

export default class HomeworkForm extends Component {
    state = {
        data: {
            client: "", entity: "", branch: "", department: "", batch: "",
        },
        clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [],
        exammode: [{ id: "online", name: "online" }, { id: "offline", name: "offline" }],
        uid: '',
        errors: {},
        isLoading: true,
        isClient: true, isEntity: true, isBranch: true, isDepartment: true, isBatch: true,
        todayDate: todayDate,
        toRange: {}
    };

    schema = {
        client: Joi.string().required().label('Client'),
        entity: Joi.string().required().label('Entity'),
        branch: Joi.string().required().label('Branch'),
        department: Joi.string().required().label("Department"),
        batch: Joi.any().optional(),
        title: Joi.string().required().label('Title'),
        date: Joi.string().required().label('Date'),
        subjectId: Joi.string().required().label('Subject'),
        description: Joi.any().optional(),
        term: Joi.string().required().label("Term"),
    }

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
        data.description = data.desc;
        data.department = data.clients[0].departmentId;
        data.batch = data.clients[0].batchId;
        data.startDate = data.from.date;
        data.endDate = data.to.date;
        data.subjectId = data.subject
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
            if (this.state.branch) {
                this.getSubjects()
            }
            if (this.state.homeworks) {
                this.particularHomework()
            }
        })
        await this.clientDatas(name, Input);
    }


    clientDatas = async (name, Input) => { // Get the Client,Entity,Branch,Department,Batch,EventName Lists
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
                await this.getSubjects(`client=${data.client}&entity=${data.entity}&branch=${data.branch}&type=subject`, "subjects")
                await this.setState({ department: "", batch: "", batchIds: [] })
                break;
            case "department":
                await this.selectoptGet(`namelist?client=${data.client}&type=department&entity=${data.entity}&branch=${data.branch}&department=${data.department}`, "batchIds")
                await this.setState({ batch: "" })
                break;
            case "batch":


                break;

            case "subjectId":
                let formData = this.formApi.getState().values
                var opt = Input.options[Input.selectedIndex];
                formData.subjectName = opt.text
                this.formApi.setValues(formData);
                break;
            default:
                break;
        }
    }
    academicDateRange = async () => {
        const { data: { client, entity } } = this.state;
        let r = await academicDateRange(`client=${client}&entity=${entity}`)

        if (r && r.data && r.data.statusCode === 1) {
            r = r.data.data
            await this.setState({ toRange: r })
        } else {

        }

    }

    async selectoptGet(url, type) {
        const data = await getselectData(url)
        if (data.data.statusCode === 1) {
            const Datas = data.data.data
            this.setState({ [type]: Datas });
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

    dateValue = async (date, field) => { // Get dates from the data range picker
        const data = this.formApi.getState().values;
        const { from, to } = date;
        data[field] = { from: new Date(from).toLocaleDateString(), to: new Date(to).toLocaleDateString() };
        data.startDate = data.date.from;
        data.endDate = data.date.to;
        this.formApi.setValues(data);
    }

    validateProperty = (name, value) => {
        const schema = Joi.reach(Joi.object(this.schema), name)
        const { error } = Joi.validate(value, schema);
        return error ? error.details[0].message : null;
    };

    setFormApi = (formApi) => {
        this.formApi = formApi
    }

    onSubmit = async () => {
        const data = this.formApi.getState().values
        const { actiontype } = this.props
        const { batch, branch, client, department, entity, subjectId, subjectName, title, description } = data
        console.log(this.state.todayDate)

        let params = `client=${client}&entity=${entity}&branch=${branch}`

        if (actiontype === 'add') {
            let scheduleData = {
                "type": "homework",
                "title": title,
                "term": "",
                "desc": description || '',
                "subject": subjectId,
                "subjectName": subjectName,
                "from": { "date": data.startDate || this.state.todayDate },
                "to": { "date": data.endDate || this.state.todayDate },
                "clients": [
                    {
                        "departmentId": department,
                        "batchId": batch
                    }
                ]
            }
            console.log(scheduleData)
            console.log(data)
            let res = await scheduleInsert(params, scheduleData)
            if (res.data.statusCode !== 1) return ToastService.Toast(res.data.message, 'default');
            if (res.data.statusCode === 1) {
                ToastService.Toast(res.data.message, 'default');
                this.props.props.history.push(`/schedule/homework`)
            }
        } else if (actiontype === 'edit') {
            let scheduleData = {
                "type": "homework",
                "title": title,
                "term": "",
                "desc": description || '',
                "subject": subjectId,
                "subjectName": subjectName,
                "from": { "date": data.startDate },
                "to": { "date": data.endDate },
                "clients": [
                    {
                        "departmentId": department,
                        "batchId": batch
                    }
                ]
            }
            console.log(scheduleData)
            console.log(data)
            let res = await updateScheduleDetails(params, scheduleData)
            if (res.data.statusCode !== 1) return ToastService.Toast(res.data.message, 'default');
            if (res.data.statusCode === 1) {
                ToastService.Toast(res.data.message, 'default');
                this.props.props.history.push(`/schedule/homework`)
            }
        }
    }

    async  getSubjects(url, type) {
        var subjectsArray = []
        const subjectList = await getSubjectsList(url)
        let subjects = subjectList.data.data
        for (var i = 0; i < subjects.length; i++) {
            subjectsArray.push({ 'name': subjects[i].displayName, 'code': subjects[i].code })
        }
        this.setState({
            allSubjects: subjectsArray
        })
    }

    resetForm = () => {
        this.formApi.reset()
    }

    render() {
        const { clientIds, entityIds, branchIds, departmentIds, batchIds,
            isClient, isEntity, isBranch, isDepartment, isBatch,toRange
        } = this.state
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
                <h6>Schedule HomeWork</h6>
                <Form getApi={this.setFormApi} onSubmit={this.onSubmit}>
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
                                            <CustomSelect field="department" label="Department*" name="department" getOptionValue={option => option.code}
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
                                <h6>HomeWork Details</h6>
                                <Row>
                                    <Col sm={12} md={3}>
                                        <Input field="title" label="Title*" name="title"
                                            validateOnBlur validate={e => this.validateProperty('title', e)}
                                        />
                                    </Col>
                                    <Col sm={12} md={4}>
                                        <label>Date*</label>
                                        <DRP1 isOutsideRange={isOutsideRange} field="date" label="Date*" id="date" startDate={moment(formState.values.startDate)} endDate={moment(formState.values.endDate)} onChange={(data) => this.dateValue(data, "date")} validate={e => this.validateProperty('date', e)} />
                                    </Col>
                                    <Col sm={12} md={4}>
                                        <CustomSelect field="subjectId" label="Subject*" name="subjectId" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={this.state.allSubjects} validateOnBlur validate={e => this.validateProperty('subjectId', e)} onChange={this.handleChange} />
                                    </Col>
                                </Row><br />

                                <Row>
                                    <Col sm="12" md="12">
                                        <Textarea field="description" label="Description" name="description" validateOnBlur validate={e => this.validateProperty('description', e)} />
                                    </Col>
                                </Row>

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