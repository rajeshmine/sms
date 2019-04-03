import React, { Component, Fragment } from 'react';
import { Form, Scope } from 'informed';
import Joi from 'joi-browser';
import { Col, Row } from 'reactstrap';

import { Input, CustomSelect, Textarea } from 'components/common/forms';
import { getselectData, } from 'services/userService';
import { addSyllabus, updateSyllabus } from 'services/syllabusService';
import ToastService from 'services/toastService'

export default class Syllabus extends Component {

    state = {
        data: {
            client: "", entity: "", branch: "", department: '', batch: '', children: [],
        },

        SubjectTypes: [],
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
        await this.feildCheck()
        if (actionTypes === "edit") {
            this.setState({ isEditForm: true });
            const { location: { state } } = this.props.props;
            if (state !== undefined)
                return this.formStateCheck(state);
        }
        if (actionTypes === "add") {
            this.addLesson('', '')
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
        data.subjectcode = data.syllabusDatas.refId
        let temp = [];
        await temp.push(data["syllabusDatas"]);
        await delete data["syllabusDatas"]
        data["children"] = temp
        data["lesson"] = temp
        await this.setState({ data });
        try {
            await this.clientDatas('client'); //APIs call
            await this.clientDatas('entity');
            await this.clientDatas('branch');
            await this.clientDatas('department');
            await this.clientDatas('batch');
            await this.formApi.setValues(data);
        } catch (err) {
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
                this.selectoptGet(`particularCourse?client=${data.client}&entity=${data.entity}&branch=${data.branch}&type=subject`, "SubjectTypes")
                await this.setState({})
                break;
            default:
                break;
        }
    }

    schema = { //Validate all the Feilds present in this Modules
        client: Joi.string().required().label('Client'),
        entity: Joi.string().required().label('Entity'),
        branch: Joi.string().required().label('Branch'),
        subjectcode: Joi.string().required().label('Subject Name'),
        chapter: Joi.string().required().label('Chapter'),
        syllabus: Joi.string().required().label('Syllabus'),
    }

    validateProperty = (name, value) => {
        const schema = Joi.reach(Joi.object(this.schema), name)
        const { error } = Joi.validate(value, schema);
        return error ? error.details[0].message : null;
    };

    setFormApi = (formApi) => {
        this.formApi = formApi
    }

    resetForm = () => { //Clear the form values afer the submission              
        this.formApi.reset()
        let path = `/course/syllabus-list` //Redirect the page after updated the datas
        this.props.props.history.push({
            pathname: path,
        })
    }

    addLesson = async (chapter, syllabus) => {
        const data = { chapter, syllabus };
        const values = this.formApi.getState().values;
        var children = values.children;
        children.push(data)
        this.formApi.setValues({ ...values, children: children });
    }

    removeLesson = (i) => {
        const values = this.formApi.getState().values;
        let children = values.children;
        children.splice(i, 1);
        this.formApi.setValues({ ...values, children: children });
    }

    onSubmit = async () => { //Store Datas to the APIs
        const { actionTypes } = this.props;
        let response;
        let data = this.formApi.getState().values;
        if (actionTypes === 'add') {
            let addparams = `client=${data.client}&entity=${data.entity}&branch=${data.branch}`
            let addDatas = { "refId": data.subjectcode, "lesson": data.children }
            response = await addSyllabus(addparams, addDatas)

        } else if (actionTypes === 'edit') {
            let updateDatas = { "lesson": data.children }
            let updateparams = `client=${data.client}&entity=${data.entity}&branch=${data.branch}&refId=${data.lesson[0].refId}&id=${data.lesson[0]._id}`
            delete updateDatas._id
            delete updateDatas.refId
            response = await updateSyllabus(updateparams, updateDatas)
        }
        if (response.data.statusCode !== 1) return ToastService.Toast(response.data.message, 'default'); // Check the response after consumed the API
        if (response.data.statusCode === 1) {
            await ToastService.Toast(response.data.message, 'default');
            this.resetForm();
        }
    }

    render() {
        const { clientIds, entityIds, branchIds, isClient, isEntity, isBranch } = this.state
        return (
            <Fragment>
                <Form getApi={this.setFormApi} onSubmit={this.onSubmit} >
                    {({ formApi, formState }) => (
                        <div>
                            <h6>Syllabus</h6>
                            <section>
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
                                        </Col>
                                    }
                                    {isBranch &&
                                        <Col sm={12} md={3}>
                                            <CustomSelect field="branch" label="Branch*" name="branch" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('branch', e)} options={branchIds}
                                                onChange={this.handleChange} />
                                        </Col>
                                    }

                                    <Col sm={12} md={3}>
                                        <CustomSelect field="subjectcode" label="Subject Name*" name="subjectcode" getOptionValue={option => option.code} getOptionLabel={option => option.displayName} options={this.state.SubjectTypes} validate={e => this.validateProperty('subjectcode', e)}
                                        />
                                    </Col>
                                </Row>
                            </section>

                            <section>
                                <Row className="justify-content-end">
                                    <button className="btn btn-link btn-sm" type="button"
                                        onClick={() => this.addLesson('', '')}
                                    >+ Add Lesson</button>
                                </Row>
                                {formState.values.children && formState.values.children.map((children, i) =>
                                    <Scope scope={`children[${i}]`} key={i}>
                                        <Row>
                                            <Col sm={12} md={3}>
                                                <Input field="chapter" label="Chapter*" name="chapter" validateOnBlur validate={e => this.validateProperty('chapter', e)} />
                                            </Col>
                                            <Col sm={12} md={9}>
                                                <Textarea field="syllabus" label="Syllabus*" name="syllabus" validateOnBlur validate={e => this.validateProperty('syllabus', e)} />
                                            </Col>
                                            {
                                                formState.values.children.length > 1 && i !== 0 ?
                                                    <Col sm={12}><button onClick={() => this.removeLesson(i)} className="btn btn-link btn-sm">Remove</button>
                                                    </Col> : ''
                                            }
                                        </Row>
                                    </Scope>
                                )}
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


