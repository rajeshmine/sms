import React, { Component, Fragment } from 'react';
import Joi from 'joi-browser';
import { Col, Row, Container } from 'reactstrap';
import moment from 'moment';

import 'styles/App.scss';
import { Form } from 'informed';
import { CustomSelect, SDP, RTimePicker } from 'components/common/forms';
import { getselectData } from 'services/userService';
import { rescheduleTimetable } from 'services/timetableService'
import Service from 'services/service';

export default class Reschedule extends Component {
    state = {
        data: {
            client: "", entity: "", branch: "", department: "", batch: "",
        },
        clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [], days: [],
        subjects: [], staffs: [],
        parentData: [],
        prefixUrl: "",
        type: '',
        Days: [{ id: "Monday", name: "Monday" }, { id: "Tuesday", name: "Tuesday" }, { id: "Wednesday", name: "Wednesday" }, { id: "Thursday", name: "Thursday" }, { id: "Friday", name: "Friday" }, { id: "Saturday", name: "Saturday" }],
        StaffNames: [],
        Subject: [],
    }

    async componentDidMount() {
      
        await this.selectoptGet(`clients`, "clientIds")
       
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
                await this.setState({ batch: "" });
                break;
            case "batch":
                this.selectoptGet(`students?client=${data.client}&entity=${data.entity}&branch=${data.branch}&department=${data.department}&batch=${data.batch}&type=staff
                `, "StaffNames")
                await this.setState({})
                break;
            case "days":
                this.selectoptGet(`particularCourse?client=${data.client}&entity=${data.entity}&branch=${data.branch}&type=subject`, "Subject")
                await this.setState({})
                break;
            default:
                break;
        }
    }

    handleChange = async ({ currentTarget: Input }) => {
        const { name, value } = Input;
        const { data } = this.state;
        data[name] = value;
        await this.setState({
            [name]: value
        }, () => {
        })
        await this.clientDatas(name);
    }
    timeValue = async (time, field) => { // Get time from the timepicker
        const data = this.formApi.getState().values;
        data[field] = time;
        this.formApi.setValues(data);
    }

    async selectoptGet(url, type) {
        const data = await getselectData(url)
        if (data.data.statusCode === 1) {
            const Datas = data.data.data
            this.setState({ [type]: Datas });
        } else {
        }
    }

    schema = { // Validating All the feilds
        client: Joi.string().required().label("Client"),
        entity: Joi.string().required().label("Entity"),
        branch: Joi.string().required().label("Branch"),
        department: Joi.string().required().label("Department"),
        batch: Joi.string().required().label("Batch"),
        SelectedDate: Joi.number().required().label("Date"),
        days: Joi.string().required().label("Days"),
        subjectName: Joi.string().required().label("Subject Name"),
        staff: Joi.string().required().label("Staff Name"),
    }

    validateProperty = (name, value) => {
        const schema = Joi.reach(Joi.object(this.schema), name)
        const { error } = Joi.validate(value, schema);
        return error ? error.details[0].message : null;
    };

    dateValue = (date) => { //single date value
        let selectDate = date._d.toISOString().slice(0, 10)
        this.setState({
            SelectedDate: date
        })
        const data = this.formApi.getState().values;
        data.SelectedDate = selectDate
        this.formApi.setValues(data);
    }

    setFormApi = (formApi) => {
        this.formApi = formApi;
    }

    resetForm = () => {
        this.formApi.reset()
        let path = `/classLists/rescheduletable` //Redirect the page after updated the datas
        this.props.props.history.push({
            pathname: path,
        })
    }

    onSubmitttt = async () => { //Consuming APIs              
        let response;
        let data = this.formApi.getState().values;
        let values = {
            "type": "retimetable",
            "day": data.days,
            "date": data.SelectedDate,
            "batchId": data.batch,
            "departmentId": data.department,
            "timetable": {
                "starttime": data.startTime,
                "endtime": data.endTime,
                "subjectName": data.subjectName,
                "staff": data.staff
            },
            "client": data.client, "entity": data.entity, "branch": data.branch
        }
        response = await rescheduleTimetable(values)
        if (response.data.statusCode !== 1) return Service.showAlert(response.data.message, '', 'Failed'); // Check Datas
        if (response.data.statusCode === 1) {
            await Service.showAlert(response.data.message, '', 'Success');
            this.resetForm();
        }
    }

    render() {
        const { SelectedDate, clientIds, entityIds, branchIds, departmentIds, batchIds, Subject, StaffNames,  } = this.state
        const isOutsideRange = (day => {
            let dayIsBlocked = false;
            if (moment().diff(day, 'days') < 0) {
                dayIsBlocked = true;
            }
            return dayIsBlocked;
        })
        return (
            <React.Fragment>
                <Fragment>
                    <Container fluid>
                        <Form getApi={this.setFormApi} onSubmit={this.onSubmitttt}>
                            {({ formApi, formState }) => (
                                <div className="page-user">
                                    <h6>Reshedule TimeTable</h6>
                                    <section>
                                        <h6>Client Details</h6>
                                        <Row>
                                            <Col sm={12} md={3}>
                                                <CustomSelect field="client" label="Client*" name="client" getOptionValue={option => option.code}
                                                    getOptionLabel={option => option.name} options={clientIds}
                                                    validateOnBlur validate={e => this.validateProperty('client', e)} onChange={this.handleChange} />
                                            </Col>
                                            <Col sm={12} md={3}>
                                                <CustomSelect field="entity" label="Entity*" name="entity" getOptionValue={option => option.code}
                                                    getOptionLabel={option => option.name} options={entityIds}
                                                    validateOnBlur validate={e => this.validateProperty('entity', e)} onChange={this.handleChange} />
                                            </Col>
                                            <Col sm={12} md={3}>
                                                <CustomSelect field="branch" label="Branch*" name="branch" getOptionValue={option => option.code}
                                                    getOptionLabel={option => option.name} options={branchIds}
                                                    validateOnBlur validate={e => this.validateProperty('branch', e)} onChange={this.handleChange} />
                                            </Col>
                                            <Col sm={12} md={3}>
                                                <CustomSelect field="department" label="Department*" name="department" getOptionValue={option => option.code}
                                                    getOptionLabel={option => option.name} options={departmentIds}
                                                    validateOnBlur validate={e => this.validateProperty('department', e)} onChange={this.handleChange} />
                                            </Col>
                                            <Col sm={12} md={3}>
                                                <CustomSelect field="batch" label="Batch*" name="batch" getOptionValue={option => option.code}
                                                    getOptionLabel={option => option.name} options={batchIds}
                                                    validateOnBlur validate={e => this.validateProperty('batch', e)} onChange={this.handleChange} />
                                            </Col>
                                        </Row>
                                    </section>
                                    <section>
                                        <Row>
                                            <Col sm={6} md={3}>
                                                <label>Date *</label>
                                                <SDP field="SelectedDate" isOutsideRange={isOutsideRange} id="SelectedDate" date={SelectedDate} onChange={this.dateValue}
                                                    onBlur={(e) => this.validateProperty('SelectedDate', e)} numberOfMonths={1}></SDP>
                                            </Col>
                                            <Col sm={6} md={3}>
                                                <CustomSelect field="days" label="Days*" name="days" getOptionValue={option => option.id} getOptionLabel={option => option.name} options={this.state.Days} validateOnBlur validate={e => this.validateProperty('days', e)}
                                                    onChange={this.handleChange}
                                                />
                                            </Col>
                                            <Col sm={6} md={3}>
                                                <CustomSelect field="subjectName" label="Subject Name*" name="subjectName" getOptionValue={option => option.displayName} getOptionLabel={option => option.displayName} options={Subject}
                                                    validateOnBlur validate={e => this.validateProperty('subjectName', e)}
                                                />
                                            </Col>
                                            <CustomSelect field="staff" label="Staff Name*" name="staff" getOptionValue={option => option.name} getOptionLabel={option => option.name} options={StaffNames} validateOnBlur validate={e => this.validateProperty('staff', e)}
                                            />
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
                                    </section>
                                    <button type="submit" className="btn btn-primary btn-sm">Submit</button>
                                </div>
                            )}
                        </Form>
                    </Container>
                </Fragment>
            </React.Fragment >
        );
    }
}

