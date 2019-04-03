import React, { Component, Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import { Container } from 'reactstrap';
import Joi from 'joi-browser';
import { Form } from 'informed';
import { Col, Row } from 'reactstrap';

// import Loading from 'components/common/loading';
// import Header from 'components/common/header';
// import SideNav from 'components/common/sideNav';
import TemplateList from './list';
// import Static from 'services/static';
import { CustomSelect, } from 'components/common/forms';
import { getselectData } from 'services/userService'
import { gettemplates, SGTemplates } from 'services/templatesService'
import { getCredentials } from 'services/clientCredentialService'

// import ToastService from 'services/toastService';
// var classNames = require('classnames');

export default class TemplateRoot extends Component {
    state = {
        data: {},
        parentData: [],
        prefixUrl: "",
        isPageLoading: false,
        isLoading: false,
        type: '',
        client: '',
        entity: '',
        branch: '',
        uid: '',
        clientIds: [], entityIds: [], branchIds: [],
        templateTable: false,
        isTableLoading: true,
        Types: [{ id: "sms", name: "sms" }, { id: "mail", name: "mail" }],
    }

    async componentDidMount() {
        await this.selectoptGet(`clients`, "clientIds")
    }

    async componentWillReceiveProps(props) {
        await this.init(props, false)
    }

    async init(props, isPageLoading = false) {
    }

    async selectoptGet(url, type) {
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
    };

    schema = {
        branch: Joi.string().required().label("Department"),
        client: Joi.string().required().label("Client"),
        entity: Joi.string().required().label("Entity"),
        type: Joi.string().required().label("Type")
    };

    setFormApi = (formApi) => {
        this.formApi = formApi
    }

    handleChange = async ({ currentTarget: Input }) => {
        const { name, value } = Input;
        const { data } = this.state;
        data[name] = value;
        this.setState({
            [name]: value
        }, () => {
        })

        switch (name) {
            case "client":
                this.selectoptGet(`namelist?client=${data.client}&type=client`, "entityIds")
                await this.setState({ templateTable: false, entity: "", branch: "", department: "", batch: "", branchIds: [], departmentIds: [], batchIds: [] })
                break;
            case "entity":
                this.selectoptGet(`namelist?client=${data.client}&type=entity&entity=${data.entity}`, "branchIds")
                await this.setState({ templateTable: false, branch: "", department: "", batch: "", departmentIds: [], batchIds: [] })
                break;
            case "branch":
                this.selectoptGet(`namelist?client=${data.client}&type=branch&entity=${data.entity}&branch=${data.branch}`, "departmentIds")
                await this.setState({ templateTable: false, department: "", batch: "", batchIds: [] })
                break;
            default:
                break;
        }
    }

    renderTemplatesForm(notificationtype, tD) {
        const { prefixUrl, data: pD } = this.state;
        return <TemplateList
            notificationtype={notificationtype}
            prefixUrl={prefixUrl}
            props={this.props}
            data={tD}
            pD={pD}
            onSubmit={this.onSubmit}
            refreshTable={this.onSubmit}
        />
    }

    addNavigation(formType) { //Navigate to Add module Page
        return <NavLink style={{ marginLeft: '852px' }} className="btn btn-primary btn-sm" to={`/notification/add/template`}>+ {formType}</NavLink>
    }

    // onSubmit = async () => {
    //     this.tableHide()
    //     let data;
    //     const formData = this.formApi.getState().values;
    //     const { client, entity, branch, } = this.state
    //     const { Type } = formData
    //     let params = `client=${client}&entity=${entity}&branch=${branch}&type=${Type}`
    //     let templateDetails = await gettemplates(params)
    //     if (templateDetails.data.statusCode === 1 && templateDetails.data.data.length !== 0) {
    //         data = templateDetails.data.data
    //         await this.setState({
    //             tableData: data,
    //             isTableLoading: false
    //         })
    //     } else {
    //         let data = [];
    //         await this.setState({
    //             tableData: data,
    //             isTableLoading: false
    //         })
    //         this.renderTemplatesForm(data)
    //     }
    // }

    onSubmit = async () => {
        await this.tableHide();
        await this.getCredentials()
        const { data: { client, entity, branch, type, config } } = this.state;
        if (type === 'mail') {
            let url = 'https://api.sendgrid.com/v3/templates';
            let r = await SGTemplates(url, "GET", "", config);
            if (r.templates) {
                await this.setState({
                    tableData: r.templates,
                    isTableLoading: false
                })
            } else {
                await this.setState({
                    tableData: [],
                    isTableLoading: false
                })
            }
        }
        if (type === 'sms') {
            let params = `client=${client}&entity=${entity}&branch=${branch}&type=${type}`
            let r = await gettemplates(params)
            if (r.data.statusCode === 1 && r.data.data.length !== 0) {
                r = r.data.data
                await this.setState({
                    tableData: r,
                    isTableLoading: false
                })
            } else {
               
                await this.setState({
                    tableData: [],
                    isTableLoading: false
                })
                await this.renderTemplatesForm(type,r)
            }
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



    tableHide() {
        this.setState({
            isTableLoading: true
        })
    }

    render() {
        const { notificationtype } = this.props.props.match.params
        const {  tableData, clientIds, entityIds, branchIds, isTableLoading } = this.state;
        return (
            <Fragment>
                <Container fluid>
                    <Form getApi={this.setFormApi} onSubmit={this.onSubmit} >
                        {({ formApi, formState }) => (
                            <div>
                                <div style={{ textAlign: 'right' }}>
                                    {
                                        this.addNavigation(notificationtype)
                                    }
                                </div>
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
                                            <CustomSelect field="type" label="Type*" name="type" getOptionValue={option => option.id} getOptionLabel={option => option.name} options={this.state.Types}
                                                onChange={this.handleChange}
                                            />
                                        </Col>

                                    </Row>
                                    <div className="text-right">
                                        <button type="submit" id="subbut" className="btn btn-primary btn-sm">Submit</button>
                                    </div>
                                </section>

                            </div>
                        )}
                    </Form>
                    {!isTableLoading &&
                        this.renderTemplatesForm(notificationtype, tableData)
                    }
                </Container>
            </Fragment>

        );
    }
}

// function redirectTo() {
//     return window.location.reload()
// }
