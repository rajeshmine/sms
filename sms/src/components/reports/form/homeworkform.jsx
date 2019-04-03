import Joi from 'joi-browser';
import React, { Fragment, Component } from 'react';
import _ from 'lodash';
import { Form } from 'informed';
import { CustomSelect } from 'components/common/forms';
import { getStudentList, getAssignmentList, getsingleAssignment, viewHomeworkReport } from 'services/assignmentService';
import { getselectData } from 'services/userService'

import { getSubjectsList } from 'services/scheduleService';
import ToastService from 'services/toastService'
import { Row, Col } from 'reactstrap';
import ReportList from 'components/reports/list'


export default class HomeworkReport extends Component {
    constructor(props) {
        super(props)
        this.state = {
            data: {
                department: '',
                batch: '',
                subject: ''
            },
            clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [],
            isTableLoading: true,
            studentList: [],
            isClient: true, isEntity: true, isBranch: true, isDepartment: true, isBatch: true
        }
    }

    schema = {
        department: Joi.string().required().label("Department"),
        client: Joi.string().required().label("Client"),
        entity: Joi.string().required().label("Entity"),
        branch: Joi.string().required().label("Branch"),
        batch: Joi.string().required().label("Batch"),
        subject: Joi.string().required().label("Subject"),
        homeworks: Joi.string().required().label("Topic")
    };

    async componentWillMount() {
        await this.props.props.isPageLoadingTrue();
    }

    async componentDidMount() {
        await this.selectoptGet(`clients`, "clientIds")
        await this.feildCheck();
        await this.props.props.isPageLoadingFalse();
    }
    feildCheck = async () => {
        let { session: { data: sessionData } } = this.props.props;
        const { data } = this.state
        const { userType, userLevel, client, entity, branch, department, batch, code, branchId, departmentId, batchId, uid, studentId } = sessionData;
        data['uid'] = uid;
        data['studentId'] = studentId;
        data['userType'] = userType;
        data['userLevel'] = userLevel;
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
                await this.clientDatas('client');
                await this.clientDatas('entity');
                await this.clientDatas('branch');
                await this.clientDatas('department');
                await this.clientDatas('batch');
                await this.formApi.setValues(data);
                break;
        }
    }

    handleError(...err) {

        return ToastService.Toast("Something went Wrong.Please try again later", 'default');
    }

    validateProperty = (name, value) => {
        const schema = Joi.reach(Joi.object(this.schema), name)
        const { error } = Joi.validate(value, schema);
        return error ? error.details[0].message : null;
    };

    resetForm = () => {
        this.formApi.reset()
    }

    tableHide() {
        this.setState({ isTableLoading: true })
    }

    async  getSubjects() {
        var subjectsArray = []
        const { data: { client, batch, entity, department, branch } } = this.state
        let params = `client=${client}&entity=${entity}&branch=${branch}&type=subject&departmentId=${department}&batchId=${batch}`
        try {
            const subjectList = await getSubjectsList(params)

            if (subjectList.data.statusCode === 1) {
                let subjects = subjectList.data.data
                for (var i = 0; i < subjects.length; i++) {
                    subjectsArray.push({ 'name': subjects[i].displayName, 'code': subjects[i].code })
                }
                this.setState({
                    allSubjects: subjectsArray
                })
            } else {
                ToastService.Toast("Subjects not found", "default");
                this.setState({
                    allSubjects: []
                })
            }

        } catch (err) {
            this.handleError(err);
        }
    }

    async getHomeworksList() {
        var homeworksArray = []
        const { data: { client, batch, entity, department, branch, subject } } = this.state
        let params = `client=${client}&entity=${entity}&branch=${branch}&departmentId=${department}&batchId=${batch}&subject=${subject}&type=homework`;
        const homeworkList = await getAssignmentList(params)
        if (homeworkList.data.statusCode === 1) {
            let homeworks = homeworkList.data.data
            for (var i = 0; i < homeworks.length; i++) {
                homeworksArray.push({ 'name': homeworks[i].title, 'code': homeworks[i]._id })
            }
            this.setState({
                allHomeworks: homeworksArray
            })
        } else {
            return ToastService.Toast("No Homeworks Found", 'default');
        }
    }

    async  particularHomework() {
        const { data: { client, branch, entity, homeworks } } = this.state
        let params = `client=${client}&entity=${entity}&branch=${branch}&type=homework&title=${homeworks}`
        const particularDetails = await getsingleAssignment(params)
        var hwId = particularDetails.data.data[0]._id
        this.setState({ homeworkId: hwId })
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

    setFormApi = (formApi) => {
        this.formApi = formApi;
    }

    clientDatas = async (name) => { // Get the Client,Entity,Branch,Department,Batch,EventName Lists
        const { data } = this.state;
        switch (name) {
            case "client":
                this.selectoptGet(`namelist?client=${data.client}&type=client`, "entityIds")
                await this.setState({ entity: "", branch: "", department: "", batch: "", branchIds: [], departmentIds: [], batchIds: [], isTableLoading: true })
                break;
            case "entity":
                this.selectoptGet(`namelist?client=${data.client}&type=entity&entity=${data.entity}`, "branchIds")
                await this.setState({ branch: "", department: "", batch: "", departmentIds: [], batchIds: [], isTableLoading: true })
                break;
            case "branch":
                this.selectoptGet(`namelist?client=${data.client}&type=branch&entity=${data.entity}&branch=${data.branch}`, "departmentIds")
                await this.setState({ department: "", batch: "", batchIds: [], isTableLoading: true })
                break;
            case "department":
                this.selectoptGet(`namelist?client=${data.client}&type=department&entity=${data.entity}&branch=${data.branch}&department=${data.department}`, "batchIds")
                await this.setState({ batch: "", isTableLoading: true })
                break;
            case "batch":
                this.getSubjects()
                this.getStudentList()
                await this.setState({ isTableLoading: true })
                break;
            case "subject":
                this.getHomeworksList()
                await this.setState({ isTableLoading: true })
                break;
            case "homeworks":
                this.particularHomework()
                await this.setState({ isTableLoading: true })
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

    renderReportsForm(type, data) {
        const { rightsData } = this.props;
        return <ReportList type={type} data={data} rightsData={rightsData} />
    }

    getStudentList = async () => {
        const { data: { client, branch, entity, department, batch } } = this.state
        let params = `client=${client}&entity=${entity}&branch=${branch}&department=${department}&batch=${batch}&type=student`
        const res = await getStudentList(params);
        if (res.data.statusCode === 1) {
            var test = res.data.data
            for (var i = 0; i < test.length; i++) {
                var studentList = [{ "name": test[i].name, "uid": test[i].uid, "remarks": "" }]
            }
            this.setState({ studentList, isTableLoading: false })
        }
        if (res.data.statusCode !== 1) return ToastService.Toast(res.data.message, 'default');
    }

    handleSubmit = async () => {
        const { type } = this.props
        if (type === 'homework') {
            const { data: { client, entity, branch, department, batch, userType, uid, studentId }, homeworkId } = this.state; let params = `client=${client}&entity=${entity}&branch=${branch}&department=${department}&batch=${batch}&homeworkId=${homeworkId}`
            const homeworkstatus = await viewHomeworkReport(params)
            console.log(homeworkstatus, uid, studentId)
            if (homeworkstatus.data.statusCode === 1) {
                let hwstsdata = homeworkstatus.data.data
                if (userType === "student") {
                    hwstsdata = _.filter(hwstsdata, v => v.studentId === uid);
                }
                if (userType === "parent") {
                    hwstsdata = _.filter(hwstsdata, v => v.studentId === studentId);
                }
                await this.setState({
                    hwstsdata, isTableLoading: false
                }, () => {
                    this.viewReport(this.state.hwstsdata)
                })
            } else {
                return ToastService.Toast("No Details  Found", 'default');
            }
        }
    }

    async  viewReport(data) {

        var homeworkView = []
        let temp = [];
        await _.map(data, v => {

            if (v.homeWorkReport !== undefined)
                temp.push(v)
        });

        if (temp.length === 0) {
            await this.setState({ homeworkView: [] })
        }
        for (let item of data) {
            if (item.homeWorkReport) {
                const { status, subject, topic, remarks } = item.homeWorkReport[0]

                const { studentId, name } = item
                homeworkView.push({ "studentId": studentId, "name": name, "topic": topic, "subject": subject, "status": status, "remarks": remarks })
                await this.setState({ homeworkView: homeworkView })
            }
        }
    }

    render() {
        const { type } = this.props
        const { clientIds, entityIds, branchIds, departmentIds, batchIds, homeworkView, isTableLoading, isClient, isEntity, isBranch, isDepartment, isBatch } = this.state;

        return (
            <Fragment>
                <h6> {type} Report</h6>
                <Form getApi={this.setFormApi} onSubmit={this.handleSubmit}  >
                    <div>
                        <section>
                            <Row>
                                {isClient && <Col sm={6} md={3}>
                                    <CustomSelect field="client" label="Client*" name="client" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('client', e)} onChange={this.handleChange} options={clientIds} />
                                </Col>}
                                {isEntity && <Col sm={6} md={3}>
                                    <CustomSelect field="entity" label="Entity*" name="entity" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('entity', e)} onChange={this.handleChange} options={entityIds} />
                                </Col>}
                                {isBranch && <Col sm={6} md={3}>
                                    <CustomSelect field="branch" label="Branch*" name="branch" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('branch', e)} onChange={this.handleChange} options={branchIds} />
                                </Col>}
                                {isDepartment && <Col sm={6} md={3}>
                                    <CustomSelect field="department" label="Department*" name="department" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={departmentIds} validateOnBlur validate={e => this.validateProperty('department', e)} onChange={this.handleChange} />
                                </Col>}
                            </Row>
                            <Row>
                                {isBatch && <Col sm={6} md={3}>
                                    <CustomSelect field="batch" label="Batch*" name="batch" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={batchIds} validateOnBlur validate={e => this.validateProperty('batch', e)} onChange={this.handleChange} />
                                </Col>}
                                <Col sm={6} md={3}>
                                    <CustomSelect field="subject" label="Subject*" name="subject" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={this.state.allSubjects} validateOnBlur validate={e => this.validateProperty('subject', e)} onChange={this.handleChange} />
                                </Col>
                                <Col sm={6} md={3}>
                                    <CustomSelect field="homeworks" label="Homeworks*" name="homeworks" getOptionValue={option => option.id} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('homeworks', e)}
                                        options={this.state.allHomeworks} onChange={this.handleChange} />
                                </Col>

                            </Row>
                        </section>

                        <div className="text-right">
                            <button type="submit" className="btn btn-primary btn-sm">Submit</button>
                        </div>
                    </div>
                </Form>
                {
                    homeworkView && !isTableLoading &&
                    this.renderReportsForm(type, homeworkView)
                }
            </Fragment >
        )
    }
}



