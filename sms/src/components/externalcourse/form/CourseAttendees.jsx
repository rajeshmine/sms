import React, { Component, Fragment } from 'react';
import { Form } from 'informed';
import Joi from 'joi-browser';
import { Col, Row } from 'reactstrap';

import { Input, CustomSelect, TestAutoSuggest } from 'components/common/forms';
import { getselectData } from 'services/userService';
import { addCourseAttendees, updateCourseAttendees } from 'services/courseAttendeesService';
import ToastService from 'services/toastService'
import { getStudentAutoSuggest } from 'services/userService';

export default class CourseAttendeesForm extends Component {

    state = {
        data: {
            client: "", entity: "", branch: "", department: '', batch: '',
            studentName: ""
        },
        clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [],
        CourseTypes: [],
        Students: [],
        isEditForm: false,
        isClient: true, isEntity: true, isBranch: true, isDepartment: true, isBatch: true
    }

    async componentDidMount() {
        const { data } = this.state
        this.selectoptGet(`clients`, "clientIds")//Get the Client Lists
        this.formApi.setValues(data);
        const { actionTypes } = this.props;
        await this.feildCheck();
        if (actionTypes === "edit") {
            this.setState({ isEditForm: true });
            const { location: { state } } = this.props.props;
            if (state !== undefined)
                return this.formStateCheck(state.courseDatas);
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
                await this.clientDatas('department');
                await this.clientDatas('batch');
                await this.formApi.setValues(data);
                break;
        }
    }

    formStateCheck = async (data) => {

        data.courseid = data.courseId
        data.fee = data.fees;
        await this.setState({ data, department: data.department, batch: data.batch, studeName: data.studentName, studentUid: data.uid, });
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

    async selectoptGet(url, type) {
        const data = await getselectData(url)
        if (data.data.statusCode === 1) {
            const Datas = data.data.data
            this.setState({ [type]: Datas });
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
        await this.clientDatas(name, Input);
    }

    clientDatas = async (name, Input) => { // Get the Client,Entity,Branch,Department,Batch,EventName Lists
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
                this.getStudentList()
                break;
            case "batch":
                this.selectoptGet(`scheduleTypeId?client=${data.client}&type=course&entity=${data.entity}&branch=${data.branch}`, "CourseTypes")
                await this.setState({})
                break;
            case "courseId":
                let formData = this.formApi.getState().values
                var opt = Input.options[Input.selectedIndex];
                formData.courseName = opt.text
                this.formApi.setValues(formData);
                break;
            default: break;
        }
    }

    schema = { //Validate all the Feilds present in this Modules
        client: Joi.string().required().label('Client'),
        entity: Joi.string().required().label('Entity'),
        branch: Joi.string().required().label('Branch'),
        department: Joi.string().required().label('Department'),
        batch: Joi.string().required().label('Batch'),
        courseId: Joi.string().required().label('Course Name'),
        fee: Joi.number().required().label('Fees'),
        studentName: Joi.string().required().label('Student Name'),
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
        //Clear the form values afer the submission
        this.formApi.reset()
        let path = `/course/externalcourse-list` //Redirect the page after updated the datas
        this.props.props.history.push({
            pathname: path,
        })
    }

    getStudentList = async () => {
        var studentList = []
        const { data: { client, branch, entity } } = this.state
        let params = `client=${client}&entity=${entity}&branch=${branch}&type=student`
        const res = await getStudentAutoSuggest(params);
        if (res.data.statusCode === 1) {
            var test = res.data.data
            for (var i = 0; i < test.length; i++) {
                studentList.push({ "name": test[i].name, "code": test[i].uid })
            }
            await this.setState({ studentList })
        }
        if (res.data.statusCode !== 1) return ToastService.Toast(res.data.message, 'default');
    }

    autoSujestValue = (id, name) => {

        this.setState({
            studentUid: id,
            studeName: name
        })
    }

    onSubmit = async () => { //Store Datas to the APIs    
        const { actionTypes } = this.props;
        let response;
        const data = this.formApi.getState().values;
        const { studentUid, studeName } = this.state
        var addparams = {
            "client": data.client, "entity": data.entity, "branch": data.branch,
            "uid": studentUid, "department": data.department, "batch": data.batch,
            "fees": data.fee, "courseId": data.courseId, "courseName": data.courseName, "studentName": studeName
        };
        if (actionTypes === 'edit') {
            addparams['refId'] = data._id;
        }
        if (actionTypes === 'add') {
            response = await addCourseAttendees(addparams)
        } else if (actionTypes === 'edit') {
            response = await updateCourseAttendees(addparams)
        }
        if (response.data.statusCode !== 1) return ToastService.Toast(response.data.message, 'default'); // Check the response after consumed the API
        if (response.data.statusCode === 1) {
            await ToastService.Toast(response.data.message, 'default');
            this.resetForm();
        }
    }

    render() {
        const { clientIds, entityIds, branchIds, departmentIds, batchIds, studentList, data: { studentName }, isClient, isEntity, isBranch, isDepartment, isBatch } = this.state
        return (
            <Fragment>
                <Form getApi={this.setFormApi} onSubmit={this.onSubmit} >
                    {({ formApi, formState }) => (
                        <div>
                            <h6>External Course</h6>
                            {isDepartment && <section>
                                <Row>
                                    {isClient &&
                                        <Col sm={12} md={3}>
                                            <CustomSelect field="client" label="Client*" name="client" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={clientIds}
                                                validateOnBlur validate={e => this.validateProperty('client', e)} onChange={this.handleChange} />
                                        </Col>
                                    }
                                    {isEntity &&
                                        <Col sm={12} md={3}>
                                            <CustomSelect field="entity" label="Entity*" name="entity" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('entity', e)} options={entityIds}
                                                onChange={this.handleChange} />
                                        </Col>}
                                    {isBranch &&
                                        <Col sm={12} md={3}>
                                            <CustomSelect field="branch" label="Branch*" name="branch" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('branch', e)} options={branchIds}
                                                onChange={this.handleChange} />
                                        </Col>
                                    }
                                    {isDepartment &&
                                        <Col sm={12} md={3}>
                                            <CustomSelect field="department" label="Department*" name="department" getOptionValue={option => option.code}
                                                getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('department', e)} options={departmentIds}
                                                onChange={this.handleChange} />
                                        </Col>
                                    }
                                </Row>
                            </section>}
                            <section>
                                <Row>
                                    {isBatch &&
                                        <Col sm={12} md={3}>
                                            <CustomSelect field="batch" label="Batch*" name="batch" getOptionValue={option => option.code}
                                                getOptionLabel={option => option.name} options={batchIds} validateOnBlur validate={e => this.validateProperty('batch', e)}
                                                onChange={this.handleChange} />
                                        </Col>
                                    }
                                    <Col sm={12} md={3}>
                                        <CustomSelect field="courseId" label="Course Name*" name="courseId" getOptionValue={option => option.course[0].code} getOptionLabel={option => option.title} options={this.state.CourseTypes} validateOnBlur validate={e => this.validateProperty('courseId', e)} onChange={this.handleChange}
                                        />
                                    </Col>
                                    <Col sm={12} md={3}>
                                        <Input
                                            field="fee" label="Fee*" name="fee"
                                            validateOnBlur validate={e => this.validateProperty('fee', e)}
                                        />
                                    </Col>
                                    <Col sm={12} md={3} style={{ marginTop: '23px' }}>
                                        {
                                            studentList &&
                                            <div>
                                                <label>StudentName*</label>
                                                <TestAutoSuggest label="Students" name="studentName" field="studentName" data={studentList} filterOption="name" getOptionValue={(id, name) => this.autoSujestValue(id, name)} validateOnBlur value={studentName} validate={e => this.validateProperty('studentName', e)}
                                                    onChange={this.handleChange}
                                                />
                                            </div>

                                        }
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
        )
    }
}


