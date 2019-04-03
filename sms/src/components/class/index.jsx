import React, { Component, Fragment } from 'react';
import { Container, Breadcrumb, BreadcrumbItem, } from 'reactstrap';
import Joi from 'joi-browser';
import { Form } from 'informed';
import { Col, Row } from 'reactstrap';
import { NavLink } from 'react-router-dom';

import { CustomSelect } from 'components/common/forms';
import Loading from 'components/common/loading';
import Header from 'components/common/header';
import SideNav from 'components/common/sideNav';
import ClassTimeTable from './list';
import { getselectData } from 'services/userService'
import { getTimeTable } from 'services/timetableService'
import ToastService from 'services/toastService'
import Static from 'services/static';

var classNames = require('classnames');

export default class ClassList extends Component {
    state = {
        data: [],
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
        clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [],
        timeTable: false,
        Days: [{ id: "Monday", name: "Monday" }, { id: "Tuesday", name: "Tuesday" }, { id: "Wednesday", name: "Wednesday" }, { id: "Thursday", name: "Thursday" }, { id: "Friday", name: "Friday" }, { id: "Saturday", name: "Saturday" }],
    }
    async componentDidMount() {
        await this.init(this.props, true)
        this.selectoptGet(`clients`, "clientIds")
    }
    async componentWillReceiveProps(props) {
        await this.init(props, false)
    }
    async init(props, isPageLoading = false) {

    }
    async selectoptGet(url, type) { //Get Client list
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
    }

    schema = { //Validting All the feilds
        branch: Joi.string().required().label("Department"),
        client: Joi.string().required().label("Client"),
        entity: Joi.string().required().label("Entity"),
        department: Joi.string().required().label("Department"),
        batch: Joi.string().required().label("Batch"),
        days: Joi.string().required().label("Days"),
    };


    handleChange = async ({ currentTarget: Input }) => {//Get client,entity,branch,department,batch list
        const { name, value } = Input;
        const { data } = this.state;
        data[name] = value;
        if (name) {

        }
        this.setState({
            [name]: value,
            timeTable: false,
        }, () => {
        })
        switch (name) {
            case "client":
                this.selectoptGet(`namelist?client=${data.client}&type=client`, "entityIds")
                await this.setState({ timeTable: false, entity: "", branch: "", department: "", batch: "", branchIds: [], departmentIds: [], batchIds: [], scheduleTable: false })
                break;
            case "entity":
                this.selectoptGet(`namelist?client=${data.client}&type=entity&entity=${data.entity}`, "branchIds")
                await this.setState({ timeTable: false, branch: "", department: "", batch: "", departmentIds: [], batchIds: [], scheduleTable: false })
                break;
            case "branch":
                this.selectoptGet(`namelist?client=${data.client}&type=branch&entity=${data.entity}&branch=${data.branch}`, "departmentIds")
                await this.setState({ timeTable: false, department: "", batch: "", batchIds: [], scheduleTable: false })
                break;
            case "department":
                this.selectoptGet(`namelist?client=${data.client}&type=department&entity=${data.entity}&branch=${data.branch}&department=${data.department}`, "batchIds")
                await this.setState({ timeTable: false, batch: "", scheduleTable: false })
                break;
            default:
                break;
        }
    }

    renderClassForm(formTypes, data, days) {
        //Pass data to ClassTimeTable Class         
        return <ClassTimeTable
            formTypes={formTypes}
            data={data}
            days={days}
            props={this.props}
        />
    }

    saveDetails = async (data) => {
        const { days } = data
        let response;
        let params;
        const { client, entity, branch, department, batch, } = this.state
        const { formTypes } = this.props.match.params
        switch (formTypes) {
            case "class":
                params = { "type": "timetable", "batchId": batch, "departmentId": department, "client": client, "entity": entity, "branch": branch }
                break;
            case "rescheduletable":
                params = { "type": "retimetable", "batchId": batch, "departmentId": department, "client": client, "entity": entity, "branch": branch }
                break;
            default:
                break;
        }
        response = await getTimeTable(params) //get the values from the API              
        if (response.data.statusCode === 1) {
            let data = response.data.data
            this.setState({
                data,
                timeTable: true,
                days
            })
        } else {
            ToastService.Toast(`No Data Found!!!`, "default")
        }
    }
    setFormApi = (formApi) => {
        this.formApi = formApi;
      }
    redirectTo = async () => {
        await this.setState({ timeTable: false })       
        await this.formApi.reset();
    }


    render() {
        const { isPageLoading, isLoading, data, clientIds, entityIds, branchIds, departmentIds, batchIds, days } = this.state;
        const { formTypes } = this.props.match.params
        
        const { keys: formTypeKeys, order: formTypeOrder } = Static.classTimeTable();
        return (
            <Fragment >
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
                                    <BreadcrumbItem><NavLink to='/timetable/Exam'>TimeTable</NavLink> </BreadcrumbItem>
                                    <BreadcrumbItem><NavLink to='/timetable/Exam'>Class</NavLink> </BreadcrumbItem>
                                    <BreadcrumbItem active> {formTypes}</BreadcrumbItem>
                                </Breadcrumb>
                                <Container fluid>
                                    <div className="mb-4">
                                        {formTypeOrder.map((formTypes) =>
                                            <NavLink key={formTypes} onClick={this.redirectTo} to={{ pathname: `/classLists/${formTypes}`, query: this.props.location.query }} className={classNames('btn btn-link')} activeClassName="btn-primary" exact={true} >{formTypeKeys[formTypes]['label']}</NavLink>
                                        )}
                                    </div>
                                    {formTypes === 'class' &&
                                        <NavLink className="btn btn-primary btn-sm btn-right" to={`/timetable/add/class`}>+Add Period</NavLink>
                                    }

                                    {formTypes === 'rescheduletable' &&
                                        <NavLink className="btn btn-primary btn-sm btn-right" to={`/classList/reschedule`}>+ ReSchedule TimeTable</NavLink>
                                    }
                                    <br />
                                    <Form getApi={this.setFormApi} onSubmit={(e) => this.saveDetails(e)} >
                                        {({ formApi, formState }) => (
                                            <div>
                                                <section>
                                                    <Row>
                                                        <Col sm={6} md={3}>
                                                            <CustomSelect field="client" label="Client*" name="client" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('client', e)} onChange={this.handleChange} options={clientIds} />
                                                        </Col>
                                                        <Col sm={6} md={3}>
                                                            <CustomSelect field="entity" label="Entity*" name="entity" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('entity', e)} onChange={this.handleChange} options={entityIds} />
                                                        </Col>
                                                        <Col sm={6} md={3}>
                                                            <CustomSelect field="branch" label="Branch*" name="branch" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('branch', e)} onChange={this.handleChange} options={branchIds} />
                                                        </Col>
                                                        <Col sm={6} md={3}>
                                                            <CustomSelect field="department" label="Department*" name="department" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('department', e)} onChange={this.handleChange} options={departmentIds} />
                                                        </Col>
                                                        <Col sm={6} md={3}>
                                                            <CustomSelect field="batch" label="Batch*" name="batch" getOptionValue={option => option.code} getOptionLabel={option => option.name} onChange={this.handleChange} options={batchIds} />
                                                        </Col>
                                                        <Col sm={6} md={3}>
                                                            <CustomSelect field="days" label="Days*" name="days" getOptionValue={option => option.id} getOptionLabel={option => option.name} options={this.state.Days}
                                                                onChange={this.handleChange}
                                                            />
                                                        </Col>
                                                        <Col sm={6} md={3}>
                                                            <button style={{ marginTop: "25px", marginLeft: "399px" }} type="submit" className="btn btn-primary btn-sm">Submit</button>
                                                        </Col>
                                                    </Row>
                                                </section>
                                            </div>
                                        )}
                                    </Form>
                                    {this.state.timeTable &&
                                        this.renderClassForm(formTypes, data, days)
                                    }
                                </Container>
                            </Fragment>
                        }
                    </div>
                </div>
            </Fragment >
        );
    }
}

// function redirectTo() {
//     return window.location.reload()
// }
