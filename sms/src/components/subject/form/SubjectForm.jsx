import React, { Component, Fragment } from 'react';
import { Form, Scope } from 'informed';
import Joi from 'joi-browser';
import { Col, Row } from 'reactstrap';

import { Input, CustomSelect, Textarea } from 'components/common/forms';
import { getselectData, } from 'services/userService';
import { addSubject, updateSubject } from 'services/subjectService';
import ToastService from 'services/toastService'

export default class Subjects extends Component {

    state = {
        data: {
            client: "", entity: "", branch: "", department: '', batch: '', author: [],
        },
        clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [],
        CourseTypes: [],
        Students: [],
        isEditForm: false,
    }

    async componentDidMount() {
        const { data } = this.state
        this.selectoptGet(`clients`, "clientIds")//Get the Client Lists
        this.formApi.setValues(data);
        const { actionTypes } = this.props;
        if (actionTypes === "edit") {
            this.setState({ isEditForm: true });
            const { location: { state } } = this.props.props;
            if (state !== undefined)
                return this.formStateCheck(state.subjectDatas);
        }
        if (actionTypes === "add") {
            this.addAuthor('', '', '', '')
        }

    }

    formStateCheck = async (data) => {
        data.department = data.clients[0].departmentId
        data.batch = data.clients[0].batchId
        data.name = data.displayName;
        data.description = data.subject[0].desc
        await this.setState({ data, department: data.department, batch: data.batch });
        try {
            await this.clientDatas('client');
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
                this.selectoptGet(`namelist?client=${data.client}&type=branch&entity=${data.entity}&branch=${data.branch}`, "departmentIds")
                await this.setState({ department: "", batch: "", batchIds: [] })
                break;
            case "department":
                this.selectoptGet(`namelist?client=${data.client}&type=department&entity=${data.entity}&branch=${data.branch}&department=${data.department}`, "batchIds")
                await this.setState({ batch: "" })
                break;
            default:
                break;
        }
    }

    schema = { //Validate all the Feilds present in this Modules
        client: Joi.string().required().label('Client'),
        entity: Joi.string().required().label('Entity'),
        branch: Joi.string().required().label('Branch'),
        department: Joi.string().required().label('Department'),
        batch: Joi.any().optional(),
        code: Joi.string().required().label('Code'),
        shortName: Joi.string().required().label('ShortName'),
        displayName: Joi.string().required().label('Name'),
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
        let path = `/course/subject-list` //Redirect the page after updated the datas
        this.props.props.history.push({
            pathname: path,
        })
    }

    addAuthor = async (title, displayName, pictureUrl, desc) => {
        const data = { title, displayName, pictureUrl, desc };
        const values = this.formApi.getState().values;
        var author = values.author;
        author.push(data)
        this.formApi.setValues({ ...values, author: author });
    }

    removeAuthor = (i) => {
        const values = this.formApi.getState().values;
        let author = values.author;
        author.splice(i, 1);
        this.formApi.setValues({ ...values, author: author });
    }

    onSubmit = async () => { //Store Datas to the APIs
        const { actionTypes } = this.props;
        let response;
        const data = this.formApi.getState().values;
        let params = `client=${data.client}&entity=${data.entity}&branch=${data.branch}`
        let addDatas = {
            "type": "subject",
            "code": data.code,
            "internalCode": data.internalCode,
            "shortName": data.shortName,
            "displayName": data.displayName,
            "author": data.author,
            "subject": [{
                "title": data.displayName,
                "desc": data.description
            }],
            "children": [{}],
            "clients": [{
                "departmentId": data.department,
                "batchId": data.batch
            }]
        }
        let updateDatas = {
            "displayName": data.displayName,
            "clients": data.clients,
            "internalCode": data.internalCode,
            "author": data.author,
            "code": data.code,
            "subject": [{
                "title": data.displayName,
                "desc": data.description
            }],
            "type": "subject",
            "shortName": data.shortName,
        }
        if (actionTypes === 'add') {
            response = await addSubject(params, addDatas)
        } else if (actionTypes === 'edit') {
            response = await updateSubject(params, updateDatas)
        }
        if (response.data.statusCode !== 1) return ToastService.Toast(response.data.message, 'default'); // Check the response after consumed the API
        if (response.data.statusCode === 1) {
            await ToastService.Toast(response.data.message, 'default')
            this.resetForm();
        }
    }

    render() {
        const { actionTypes } = this.props;
        const { clientIds, entityIds, branchIds, departmentIds, batchIds } = this.state
        return (
            <Fragment>
                <Form getApi={this.setFormApi} onSubmit={this.onSubmit} >
                    {({ formApi, formState }) => (
                        <div>
                            <h6>Subjects</h6>
                            <section>
                                <Row>
                                    <Col sm={12} md={3}>
                                        <CustomSelect field="client" label="Client*" name="client" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={clientIds}
                                            validateOnBlur validate={e => this.validateProperty('client', e)} onChange={this.handleChange} />
                                    </Col>
                                    <Col sm={12} md={3}>
                                        <CustomSelect field="entity" label="Entity*" name="entity" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('entity', e)} options={entityIds}
                                            onChange={this.handleChange} />
                                    </Col>
                                    <Col sm={12} md={3}>
                                        <CustomSelect field="branch" label="Branch*" name="branch" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('branch', e)} options={branchIds}
                                            onChange={this.handleChange} />
                                    </Col>
                                    <Col sm={12} md={3}>
                                        <CustomSelect field="department" label="Department*" name="department" getOptionValue={option => option.code}
                                            getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('department', e)} options={departmentIds}
                                            onChange={this.handleChange} />
                                    </Col>
                                </Row>
                            </section>
                            <section>
                                <Row>
                                    <Col sm={12} md={3}>
                                        <CustomSelect field="batch" label="Batch" name="batch" getOptionValue={option => option.code}
                                            getOptionLabel={option => option.name} options={batchIds} validateOnBlur validate={e => this.validateProperty('batch', e)}
                                            onChange={this.handleChange} />
                                    </Col>
                                    <Col sm={12} md={3}>
                                        {actionTypes === 'add' &&
                                            <Input
                                                field="code" label="Code*" name="code"
                                                validateOnBlur validate={e => this.validateProperty('code', e)}
                                            />}

                                        {actionTypes === 'edit' &&
                                            <Input
                                                field="code" label="Code*" name="code"
                                                validateOnBlur validate={e => this.validateProperty('code', e)}
                                                disabled
                                            />}
                                    </Col>
                                    <Col sm={12} md={3}>
                                        <Input
                                            field="internalCode" label="Internal Code" name="internalCode"
                                        />
                                    </Col>
                                    <Col sm={12} md={3}>
                                        <Input
                                            field="displayName" label="Name*" name="displayName"
                                            validateOnBlur validate={e => this.validateProperty('displayName', e)}
                                        />
                                    </Col>
                                    <Col sm={12} md={3}>
                                        <Input
                                            field="shortName" label="ShortName*" name="shortName"
                                            validateOnBlur validate={e => this.validateProperty('shortName', e)}
                                        />
                                    </Col>
                                    <Col sm={12} md={9}>
                                        <Textarea
                                            field="description" label="Description" name="description"
                                        />
                                    </Col>
                                </Row>
                            </section>
                            <section>
                                <Row className="justify-content-end">
                                    <button className="btn btn-link btn-sm" type="button"
                                        onClick={() => this.addAuthor('', '', '', '')}
                                    >+ Add Author</button>
                                </Row>
                                {formState.values.author && formState.values.author.map((author, i) =>
                                    <Scope scope={`author[${i}]`} key={i}>
                                        <Row>
                                            <Col sm={12} md={4}>
                                                <Input field="title" label="Title"
                                                    name="title" />
                                            </Col>
                                            <Col sm={12} md={4}>
                                                <Input field="displayName" label="Name"
                                                    name="displayName" />
                                            </Col>
                                            <Col sm={12} md={12}>
                                                <Textarea
                                                    field="desc" label="Description" name="desc"
                                                />
                                            </Col>
                                            {
                                                formState.values.author.length > 1 && i !== 0 ?
                                                    <Col sm={12}><button onClick={() => this.removeAuthor(i)} className="btn btn-link btn-sm">Remove</button>
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


