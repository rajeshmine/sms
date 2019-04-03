import React, { Component, Fragment } from 'react';
import Header from 'components/common/header';
import SideNav from 'components/common/sideNav';
import ExamResult from './result';
import { NavLink } from 'react-router-dom';
import { Container } from 'reactstrap';
import Loading from 'components/common/loading';
import Joi from 'joi-browser';
import { Form } from 'informed';
import { Col, Row } from 'reactstrap';
import { CustomSelect } from 'components/common/forms';
import { getselectData } from 'services/userService'
import { getexamname } from 'services/examService'
import { getresultData } from 'services/onlineexamService';
import { rightsData } from 'services/rolesService';
import {
    Breadcrumb,
    BreadcrumbItem
} from 'reactstrap';
import ToastService from 'services/toastService'
import _ from 'lodash'



export default class Result extends Component {
    state = {
        data: { client: '', entity: '', branch: '', department: '', batch: '' },        
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
        examname: [],
        examTable: false,
        isClient: true, isEntity: true, isBranch: true, isDepartment: true, isBatch: true
    }

    async componentDidMount() {

        await this.props.isPageLoadingTrue();
        await this.feildCheck()
        await this.init(this.props, true)
        this.selectoptGet(`clients`, "clientIds")
        const { session } = this.props;
        await this.rightsData(session);
        await this.props.isPageLoadingFalse();
    }

    async componentWillReceiveProps(props) {
        await this.init(props, false)
    }

    feildCheck = async () => {
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
                await this.clientDatas('department');
                await this.clientDatas('batch');

                await this.formApi.setValues(data);
                break;
        }
    }

    rightsData = async (session) => {
        let res = await rightsData("schedule", session);
        let excludeModules = [];
        await _.map(_.keys(res), async v => {
            await _.map(_.keys(res[v]), k => {
                if (res[v][k]["value"])
                    return excludeModules.push(v.toLowerCase())
            })
        })
        await this.setState({ excludeModules, rightsData: res || {} })
    }

    async init(props, isPageLoading = false) {

    }

    //select drodown value get according to client entity branch ...
    async selectoptGet(url, type) {
        const data = await getselectData(url)
        if (data.data.statusCode === 1) {
            const Datas = data.data.data
            this.setState({ [type]: Datas });
        } else {
            ToastService.Toast(`${type} Data Not Found!!!`, "default")
        }
    }

    validateProperty = (name, value) => {
        const schema = Joi.reach(Joi.object(this.schema), name)
        const { error } = Joi.validate(value, schema);
        return error ? error.details[0].message : null;
    };

    schema = {
        client: Joi.string().required().label("Client"),
        entity: Joi.string().required().label("Entity"),
        branch: Joi.string().required().label("Branch"),
        department: Joi.string().required().label("Department"),
        batch: Joi.string().required().label("Batch"),
        examname: Joi.string().required().label("Exam Name"),
    };

    //result table render function
    renderResultTable(type, data = []) {
        return <ExamResult type={type} data={data} props={this.props} />
    }
    setFormApi = (formApi) => {
        this.formApi = formApi
    }


    handleChange = async ({ currentTarget: Input }) => {
        let formaData = this.formApi.getState().values;
        await this.setState({ data: formaData })
        const { name, value } = Input;
        const { data } = this.state;
        data[name] = value;
        await this.setState({
            [name]: value,
            resultTable: false
        })
        await this.clientDatas(name);
    }

    clientDatas = async (name) => {
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
                await this.setState({ departmentId: "", batch: "", departmentIds: [] })
                break;
            case "department":
                this.selectoptGet(`namelist?client=${data.client}&type=department&entity=${data.entity}&branch=${data.branch}&department=${data.department}`, "batchIds")
                await this.setState({ batch: "", batchIds: [] })
                this.examnameget(`scheduleTypeId?client=${data.client}&entity=${data.entity}&branch=${data.branch}&type=exam`, "examname");
                break;
            case "batch":
                break;
            default:
                break;
        }
    }

    // select dropdown data get for examname
    async examnameget(url, type) {
        try {
            const data = await getexamname(url)

            if (data.data.statusCode === 1) {
                const Datas = data.data.data
                this.setState({ [type]: Datas });
            }
        } catch (err) {
            this.handleError(err)
        }
    }


    onSubmit = async () => {
        const { userType, uid, studentId } = this.props.session.data;
        const { data: { client, entity, branch, department, batch } } = this.state;
        let params = '';
        if (department)
            params = `client=${client}&entity=${entity}&branch=${branch}&department=${department}`
        if (batch)
            params = `client=${client}&entity=${entity}&branch=${branch}&department=${department}&batch=${batch}`
        try {
            let data = await this.getResultList(params, userType, uid, studentId)
            await this.setState({
                data,
                resultTable: true
            })
            this.renderResultTable(userType, data)
        } catch{
            this.handleError()
        }
    }


    //result details table data generate function
    getResultList = async (params, userType, uid, studentId) => {
        const { data: { examId } } = this.state;
        let resultData = [];

        try {
            let res = await getresultData(params)
            if (res.data.statusCode === 1) {
                let data = res.data.data;
                if (userType === 'student')
                    data = _.filter(data, v => uid === v.studentId)
                if (userType === 'parent')
                    data = _.filter(data, v => studentId === v.studentId)
                if (data.length > 0) {
                    await _.map(data, async s => {
                        if (s.examReport && s.examReport.length > 0) {
                            await _.map(s.examReport, async e => {
                                if (examId === e.id && e.type === 'online') {
                                    let obj = {
                                        examName: e.examName,
                                        examId: e.id,
                                        marks: e.marks,
                                        remarks: e.remarks,
                                        totalMarks: e.totalMarks,
                                        type: e.type,
                                        uid: s.studentId,
                                        name: s.name,
                                    }
                                    await resultData.push(obj)
                                }
                            })
                        }
                    });
                    return resultData
                }

            } else {
                return []
            }
        } catch (err) {
            this.handleError(err)
        }
    }

    handleError(...err) {
        return ToastService.Toast("Somthig went wrong.Please try again later", "default");
    }

    tableHide() {
        this.setState({
            resultTable: false
        })
    }

    render() {

        const { isPageLoading, isLoading, data, clientIds, entityIds, branchIds, departmentIds, batchIds, examname, type, isClient, isEntity, isBranch, isDepartment, isBatch } = this.state;

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
                                <Container fluid>
                                    <Breadcrumb>
                                        <BreadcrumbItem><NavLink to="/dashboard">Dashboard</NavLink></BreadcrumbItem>
                                        <BreadcrumbItem><NavLink to='exam/onlineExam'>Online-Exam</NavLink></BreadcrumbItem>
                                        <BreadcrumbItem active>Result</BreadcrumbItem>
                                    </Breadcrumb>
                                    <h6>Result Details</h6>
                                    <Form getApi={this.setFormApi} onSubmit={this.onSubmit} >
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
                                                            </Col>}
                                                        {isBranch &&
                                                            <Col sm={6} md={3}>
                                                                <CustomSelect field="branch" label="Branch*" name="branch" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('branch', e)} onChange={this.handleChange} options={branchIds} />
                                                            </Col>}
                                                        {isDepartment &&
                                                            <Col sm={12} md={3}>
                                                                <CustomSelect field="department" label="Department*" name="department" getOptionValue={option => option.code}
                                                                    getOptionLabel={option => option.name} options={departmentIds}
                                                                    validateOnBlur validate={e => this.validateProperty('department', e)} onChange={this.handleChange} />
                                                            </Col>}
                                                        {isBatch &&
                                                            <Col sm={12} md={3}>
                                                                <CustomSelect field="batch" label="Batch*" name="batch" getOptionValue={option => option.code}
                                                                    getOptionLabel={option => option.name} options={batchIds}
                                                                    validateOnBlur validate={e => this.validateProperty('batch', e)} onChange={this.handleChange} />
                                                            </Col>}
                                                        <Col sm={12} md={3}>
                                                            <CustomSelect field="examId" label="Exam Name*" name="examname" getOptionValue={option => option._id}
                                                                getOptionLabel={option => option.title} options={examname}
                                                                validateOnBlur validate={e => this.validateProperty('examname', e)} onChange={this.handleChange} />
                                                        </Col>

                                                    </Row>

                                                </section>
                                                <div className="text-right">
                                                    <button type="submit" className="btn btn-primary btn-sm">Submit</button>
                                                </div>

                                            </div>
                                        )}
                                    </Form>
                                    {this.state.resultTable &&
                                        this.renderResultTable(type, data)
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

