import React, { Component, Fragment } from 'react';
import { Form, Scope } from 'informed';
import Joi from 'joi-browser';
import { Col, Row } from 'reactstrap';

import { CustomSelect, Textarea, Input } from 'components/common/forms';
import { getselectData, } from 'services/userService';
import { addTemplates, updateTemplates, SGTemplates } from 'services/templatesService';
import ToastService from 'services/toastService'
import { getCredentials } from 'services/clientCredentialService'

export default class Template extends Component {
    state = {
        data: { client: "", entity: "", branch: "", type: "sms" },
        clientIds: [], entityIds: [], branchIds: [],
        Templatetype: [{ id: "sms", name: "sms" }, { id: "mail", name: "mail" }],
        isEditForm: false,
    }

    async componentDidMount() {
        const { data } = this.state
        this.selectoptGet(`clients`, "clientIds")//Get the Client Lists
        this.formApi.setValues(data);
        const { actionType } = this.props;
        if (actionType === "add") {
            await this.addVersions('', '', '', '')
        }
        if (actionType === "edit") {
            this.setState({ isEditForm: true });
            const { location: { state } } = this.props.props;
            if (state !== undefined) {
                let tD = state.tD;

                return this.formStateCheck(tD);
            }
        }
    }

    addVersions = async (name, subject, html_content, plain_content) => {
        let obj = {
            name: name,
            subject: subject,
            html_content: html_content,
            plain_content: plain_content
        }
        let versions = [];
        const values = this.formApi.getState().values;
        versions.push(obj);
        values.versions = versions
        this.formApi.setValues({ ...values });
    }

    formStateCheck = async (data) => {
        let r, url;
        const { id, config } = data;
        if (data && data.type === 'mail') {
            url = `https://api.sendgrid.com/v3/templates/${id}`
            r = await SGTemplates(url, "GET", '', config);
            data.category = data.name
            data.versions = r.versions
        }


        await this.setState({ data });
        try {
            await this.clientDatas('client');
            await this.clientDatas('entity');
            await this.clientDatas('branch');
            await this.formApi.setValues(data);
        } catch (err) {
            this.handleError()
        }
    }

    handleError(...err) {
        return ToastService.Toast("Something went wrong.Please try again later", 'default');
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
        await this.setState({
            [name]: value
        })
        await this.clientDatas(name, value);
    }

    clientDatas = async (name, value) => { // Get the Client,Entity,Branch,Department,Batch,EventName Lists
        const { actionType } = this.props;
        const { data } = this.state;
        switch (name) {
            case "client":
                await this.selectoptGet(`namelist?client=${data.client}&type=client`, "entityIds")
                await this.setState({ entity: "", branch: "", department: "", batch: "", branchIds: [], departmentIds: [], batchIds: [] });
                await this.getCredentials();
                break;
            case "entity":
                await this.selectoptGet(`namelist?client=${data.client}&type=entity&entity=${data.entity}`, "branchIds")
                await this.setState({ branch: "", department: "", batch: "", departmentIds: [], batchIds: [] });
                await this.getCredentials();
                break;
            case "branch":
                await this.getCredentials();
                break;
            case "type":
                if (actionType === 'add') {
                    if (value === 'mail')
                        await this.addVersions('', '', '', '')
                }
                await this.getCredentials();
                break;

            default: break;
        }
    }

    getCredentials = async () => {
        const { data: { client, entity, branch, type }, data } = this.state;
        let res;
        if (client && entity && branch && type) {
            if (client !== '' && entity !== '' && branch !== '' && type !== '') {
                if (type === "mail") {
                    let params = `client=${client}&entity=${entity}&branch=${branch}`
                    res = await getCredentials(params);
                    if (res.data && res.data.statusCode === 1) {
                        let d = res.data.data && res.data.data[0];
                        let a = d && d.email[0] && d.email[0].accessKey
                        if (a) {
                            data["config"] = {
                                'authorization': 'Bearer ' + a,
                                'Content-Type': 'application/json',
                            };
                            await this.setState({
                                config: {
                                    'authorization': 'Bearer ' + a,
                                    'Content-Type': 'application/json',
                                }
                            })
                        }
                    }
                }
            }
        }
    }

    schema = { //Validate all the Feilds present in this Modules
        client: Joi.string().required().label('Client'),
        entity: Joi.string().required().label('Entity'),
        branch: Joi.string().required().label('Branch'),
        msg: Joi.string().required().label('Message'),
        type: Joi.string().required().label('Type'),
        category: Joi.string().required().label('Category'),
        name: Joi.string().required().label('Name'),
    }


    validateProperty = (name, value) => {
        const schema = Joi.reach(Joi.object(this.schema), name)
        const { error } = Joi.validate(value, schema);
        return error ? error.details[0].message : null;
    };

    setFormApi = (formApi) => {
        this.formApi = formApi
    }

    resetForm = (Type) => { //Reset the values after Submission
        const { actionType } = this.props
        this.formApi.reset()
        if (actionType === 'edit') {
            let path = `/templatesList/${Type}` //Redirect the page after updated the datas
            this.props.props.history.push({
                pathname: path,
                state: {
                }
            })
        }
    }

    // onSubmit = async () => { //Store Datas to the APIs
    //     const { actionType } = this.props;
    //     let response, params, temp;
    //     const data = this.formApi.getState().values;
    //     const { category, msg, templateargs, client, entity, branch, type, templateId, templatename } = data
    //     if (type === 'mail') {
    //         temp = {
    //             "templateId": templateId || '',
    //             "templateName": templatename || '',
    //             "templateArgs": templateargs || '',
    //             "type": type,
    //             "msg": msg,
    //             "category": category
    //         }
    //     } else if (type === 'sms') {
    //         temp = {
    //             "type": type,
    //             "msg": data.msg,
    //             "category": data.category
    //         }
    //     }
    //     params = `client=${client}&entity=${entity}&branch=${branch}`
    //     if (actionType === 'edit') {
    //         temp["id"] = data._id
    //     }
    //     if (actionType === 'add') {
    //         response = await addTemplates(params, temp)           
    //     } else if (actionType === 'edit') {
    //         response = await updateTemplates(params, temp)
    //     }
    //     if (response.data.statusCode !== 1) return ToastService.Toast(response.data.message, 'default');
    //     if (response.data.statusCode === 1) {
    //         await ToastService.Toast(response.data.message, 'default');
    //         this.resetForm(type);
    //         this.props.props.history.push(`/notification/template`);
    //     }
    // }

    onSubmit = async () => {
        let r, data, url, params;
        const { actionType } = this.props;
        const fD = this.formApi.getState().values;
        const { client, entity, branch, category, msg, versions } = fD;
        console.log(fD)
        const { data: { id, type, config } } = this.state;
        if (type === 'mail') {
            data =
                {
                    "name": versions[0].name,
                    "html_content": versions[0].html_content,
                    "plain_content": versions[0].plain_content,
                    "subject": versions[0].subject
                }
            if (actionType === 'add') {
                url = 'https://api.sendgrid.com/v3/templates';
                if (config && config !== '') {
                    r = await SGTemplates(url, "POST", { "name": versions[0].name }, config);
                    if (r && r.id) {
                        url = `https://api.sendgrid.com/v3/templates/${r.id}/versions`
                        r = await SGTemplates(url, "POST", data, config);
                    }
                     await ToastService.Toast("Success", 'default');
                     this.props.props.history.push(`/notification/template`);
                }
            }
            if (actionType === 'edit') {
                url = `https://api.sendgrid.com/v3/templates/${id}`
                r = await SGTemplates(url, "PATCH", { "name": versions[0].name }, config);               
                url = `https://api.sendgrid.com/v3/templates/${id}/versions/${versions[0].id}`
                r = await SGTemplates(url, "PATCH", data, config);
                await ToastService.Toast("Success", 'default');
                this.props.props.history.push(`/notification/template`);
            }
        }
        if (type === 'sms') {
            data = {
                "type": type,
                "msg": msg,
                "category": category
            }
            params = `client=${client}&entity=${entity}&branch=${branch}`
            if (actionType === 'edit') {
                data["id"] = data._id
            }
            if (actionType === 'add') {
                r = await addTemplates(params, data)
            } else if (actionType === 'edit') {
                r = await updateTemplates(params, data)
            }
            if (r.data.statusCode !== 1) return ToastService.Toast(r.data.message, 'default');
            if (r.data.statusCode === 1) {
                await ToastService.Toast(r.data.message, 'default');
                this.resetForm(type);
                this.props.props.history.push(`/notification/template`);
            }

        }


    }

    // onSubmit = async () => { //Store Datas to the APIs
    //     const { actionType } = this.props;
    //     let response, params, temp;
    //     const data = this.formApi.getState().values;
    //     const { category, msg, templateargs, client, entity, branch, type, templateId, templatename } = data;
    //     if (type === 'mail') {
    //         temp = {
    //             "name": category,
    //             "html_content": msg
    //         }


    //     } else if (type === 'sms') {
    //         temp = {
    //             "type": type,
    //             "msg": data.msg,
    //             "category": data.category
    //         }
    //     }
    //     params = `client=${client}&entity=${entity}&branch=${branch}`
    //     if (actionType === 'edit') {
    //         temp["id"] = data._id
    //     }
    //     if (actionType === 'add') {
    //         let url = 'https://api.sendgrid.com/v3/templates';
    //         response = await SGTemplates(url, "POST", temp);
    //         console.log(response);
    //     } else if (actionType === 'edit') {
    //         response = await updateTemplates(params, temp)
    //     }

    // }





    render() {
        const { actionType } = this.props;
        const { clientIds, entityIds, branchIds,  data: { type } } = this.state;
        let disabled;
        if (actionType === 'edit')
            disabled = true

        if (actionType === 'add')
            disabled = false

        return (
            <Fragment>
                <Form getApi={this.setFormApi} onSubmit={this.onSubmit} >
                    {({ formApi, formState }) => (
                        <div>
                            <h6>Template</h6>
                            <section>
                                <Row>
                                    <Col sm={12} md={3}>
                                        <CustomSelect field="client" label="Client*" name="client" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={clientIds}
                                            validateOnBlur validate={e => this.validateProperty('client', e)} onChange={this.handleChange} disabled={disabled} />
                                    </Col>
                                    <Col sm={12} md={3}>
                                        <CustomSelect field="entity" label="Entity*" name="entity" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('entity', e)} options={entityIds}
                                            onChange={this.handleChange} disabled={disabled} />
                                    </Col>
                                    <Col sm={12} md={3}>
                                        <CustomSelect field="branch" label="Branch*" name="branch" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('branch', e)} options={branchIds}
                                            onChange={this.handleChange} disabled={disabled} />
                                    </Col>
                                    <Col sm={6} md={3}>
                                        <CustomSelect field="type" label="Type *" name="type" getOptionValue={option => option.id} getOptionLabel={option => option.name} options={this.state.Templatetype} onChange={this.handleChange}
                                            disabled={disabled}
                                        />
                                    </Col>
                                </Row>
                            </section>
                            {
                                type === 'sms' &&
                                <section>
                                    <Row>

                                        <Col sm={12} md={3}>
                                            <Input field="category" label="Category*" name="category" validateOnBlur validate={e => this.validateProperty('category', e)} />
                                        </Col>


                                        <Col sm={12} md={12}>
                                            <Textarea
                                                field="msg" label="Message*" name="msg"
                                                validateOnBlur validate={e => this.validateProperty('msg', e)}
                                            />
                                        </Col>

                                    </Row>

                                </section>
                            }
                            {

                                type === 'mail' &&
                                <section>
                                    {formState.values.versions && formState.values.versions.map((v, i) =>
                                        <Scope scope={`versions[${i}]`} key={i}>
                                            <Row>
                                                <Col sm={12} md={3}>
                                                    <Input field="name" label="Name*" name="name" validateOnBlur validate={e => this.validateProperty('name', e)} />
                                                </Col>


                                                <Col sm={12} md={12}>
                                                    <Input field="subject" label="Subject" name="subject" />
                                                </Col>
                                                <Col sm={12} md={12}>
                                                    <Textarea
                                                        field="html_content" label="Html Content" name="html_content" rows="5"
                                                    />
                                                </Col>

                                                <Col sm={12} md={12}>
                                                    <Textarea
                                                        field="plain_content" label="Plain Content" name="plain_content" rows="5"
                                                    />
                                                </Col>
                                            </Row>
                                        </Scope>
                                    )}
                                </section>
                            }
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