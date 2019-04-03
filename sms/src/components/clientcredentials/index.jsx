
import 'styles/user-form.scss';
import React, { Component, Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import Static from 'services/static';
import Header from 'components/common/header';
import Loading from 'components/common/loading';
import SideNav from 'components/common/sideNav';
import Joi from 'joi-browser';
import { Form } from 'informed';
import { Col, Row } from 'reactstrap';

import { CustomSelect, } from 'components/common/forms';
import { getselectData } from 'services/userService'
import CredentialsList from 'components/clientcredentials/list'
import { getCredentials } from '../../services/clientCredentialService'
import { Container, Breadcrumb, BreadcrumbItem, } from 'reactstrap';

var classNames = require('classnames');

export default class CredentialsRoot extends Component {
    state = {
        data: {},
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
        isTableLoading: true,
        clientIds: [], entityIds: [], branchIds: [],

        isClient: true, isEntity: true, isBranch: true, isDepartment: true, isBatch: true
    }

    async componentWillMount() {
        await this.props.isPageLoadingTrue();
    }

    async componentDidMount() {
        await this.selectoptGet(`clients`, "clientIds");
        await this.feildCheck();
        await this.props.isPageLoadingFalse();
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
                await this.onSubmit();
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
                await this.onSubmit();
                break;
            default:
                data['client'] = client || code;
                data['entity'] = entity || code;
                data['branch'] = branch || branchId;
                data['department'] = department || departmentId;
                data['batch'] = batch || batchId;
                await this.setState({ data, isClient: false, isEntity: false, isBranch: false, isDepartment: false, isBatch: false })
                await this.formApi.setValues(data);
                await this.onSubmit();
                break;
        }
    }

    setFormApi = (formApi) => {
        this.formApi = formApi;
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
        branch: Joi.string().required().label("Branch"),
        client: Joi.string().required().label("Client"),
        entity: Joi.string().required().label("Entity")
    };

    handleChange = async ({ currentTarget: Input }) => {
        // let formaData = this.formApi.getState().values;
        // await this.setState({ data: formaData })
        const { name, value } = Input;
        const { data } = this.state;
        data[name] = value;
        await this.setState({
            [name]: value
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
                await this.setState({ department: "", batch: "", batchIds: [] })
                break;
            default:
                break;
        }
    }
    renderCredentialsForm(form, data) {
        const {  prefixUrl, } = this.state;
        return <CredentialsList form={form} data={data} refreshTable={this.onSubmit} prefixUrl={prefixUrl} props={this.props}
        />
    }

    addNavigation(form) {
        if (form === 'mail') {
            return <NavLink className="btn btn-primary btn-sm" to={`/credentials/mail/add`}>+ Add {form} </NavLink>
        } else {
            return <NavLink className="btn btn-primary btn-sm" to={`/credentials/sms/add`}>+ Add {form} </NavLink>
        }
    }

    tableHide() {
        this.setState({
            isTableLoading: true
        })
    }

    onSubmit = async () => {       
        this.tableHide()
        let response;
        const { data: { client, entity, branch } } = this.state
        let params = `client=${client}&entity=${entity}&branch=${branch}`
        response = await getCredentials(params)  
       
        if (response.data.statusCode === 1) {
            let data = response.data.data;           
            await this.setState({
                tableData: data,
                isTableLoading: false
            })
        } else {
            let data = []
            await this.setState({
                tableData: data,
                isTableLoading: false
            })
        }
    }
    redirectTo=async()=>{
        await this.setState({ isTableLoading: true })
        await this.feildCheck()
        await this.formApi.reset();
    }
    render() {
        const { form } = this.props.match.params;
        const { isPageLoading, isTableLoading, tableData, isLoading,  clientIds, entityIds, branchIds, isClient, isEntity, isBranch } = this.state;
        const { keys: formTypeKeys, order: formTypeOrder } = Static.crendentialsFormTypes();
        const { session } = this.props;
        return (
            <Fragment >
                {session &&
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
                                        <BreadcrumbItem><NavLink to="/credentials/mailform">credentials</NavLink></BreadcrumbItem>
                                        <BreadcrumbItem active>{form}  </BreadcrumbItem>
                                    </Breadcrumb>
                                    <Container fluid>
                                        <div className="mb-4 subnav-div">
                                            {formTypeOrder.map((form) =>
                                                <NavLink key={form} onClick={()=>this.redirectTo()} to={{ pathname: `/credentials/${form}`, query: this.props.location.query }} className={classNames('subnav')} activeClassName="subnav-active" exact={true} >{formTypeKeys[form]['label']}</NavLink>
                                            )}
                                        </div>

                                        <div className="text-right">
                                            {
                                                this.addNavigation(form)
                                            }
                                        </div>

                                        {isBranch &&
                                            <Form getApi={this.setFormApi} onSubmit={this.onSubmit} >
                                                {({ formApi, formState }) => (
                                                    <div>
                                                        <section>
                                                            <Row>
                                                                {isClient && <Col sm={6} md={3}>
                                                                    <CustomSelect field="client" label="Client*" name="client" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('client', e)} onChange={this.handleChange} options={clientIds} />
                                                                </Col>
                                                                }
                                                                {isEntity &&
                                                                    <Col sm={6} md={3}>
                                                                        <CustomSelect field="entity" label="Entity*" name="entity" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('entity', e)} onChange={this.handleChange} options={entityIds} />
                                                                    </Col>
                                                                }
                                                                {isBranch &&
                                                                    <Col sm={6} md={3}>
                                                                        <CustomSelect field="branch" label="Branch*" name="branch" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('branch', e)} onChange={this.handleChange} options={branchIds} />
                                                                    </Col>
                                                                }
                                                            </Row>
                                                        </section>
                                                        <div className="text-right">
                                                            <button type="submit" className="btn btn-primary btn-sm">Submit</button>
                                                        </div>

                                                    </div>
                                                )}
                                            </Form>
                                        }
                                        <br />
                                        {!isTableLoading &&
                                            this.renderCredentialsForm(form, tableData)
                                        }

                                    </Container>
                                </Fragment>
                            }
                        </div>
                    </div>
                }
            </Fragment >
        );
    }
}

// function redirectTo() {
//     return window.location.reload()
// }