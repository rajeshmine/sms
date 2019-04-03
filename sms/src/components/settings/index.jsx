
import 'styles/user-form.scss';
import React, { Component, Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import { Container } from 'reactstrap';
import Joi from 'joi-browser';
import { Form } from 'informed';
import { Col, Row } from 'reactstrap';
import { getSubLists, getTitleList, getParticularType, getReligionList } from 'services/settingsService';
import Header from 'components/common/header';
import Loading from 'components/common/loading';
import SideNav from 'components/common/sideNav';
import Static from 'services/static';
import { CustomSelect, } from 'components/common/forms';
import { getselectData } from 'services/userService'
import SettingsList from 'components/settings/list'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { rightsData } from 'services/rolesService';
import { ClipLoader } from 'react-spinners';

import _ from 'lodash';
var classNames = require('classnames');

export default class SettingsRoot extends Component {
    state = {
        data: { client: '', entity: '', branch: "" },
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
        clientIds: [], entityIds: [], branchIds: [],
        settingsTable: false,
        titleTable: false,
        languageTable: false,
        casteTable: false,
        subcasteTable: false,
        religionList: false,
        statetable: false,
        addbtn: false,
        isClient: true, isEntity: true, isBranch: true, isDepartment: true, isBatch: true,
        entityLoad:false,
        branchLoad:false,
    }

    async componentWillMount() {
        await this.props.isPageLoadingTrue();
    }
    async componentDidMount() {
        const { session } = this.props;
        await this.rightsData(session);
        await this.feildCheck();
        await this.props.isPageLoadingFalse();
        await this.init(this.props, true)
        await this.getAllDetails()
        await this.selectoptGet(`clients`, "clientIds")
    }

    async componentWillReceiveProps(props) {
        await this.init(props, false)
    }

    async init(props, isPageLoading = false) {

    }

    rightsData = async (session) => {

        let res = await rightsData("setting", session);

        let excludeModules = [];
        await _.map(_.keys(res), async v => {
            await _.map(_.keys(res[v]), k => {
                if (res[v][k]["value"])
                    return excludeModules.push(v.toLowerCase())
            })
        })
        excludeModules = await _.uniq(excludeModules)

        await this.setState({ excludeModules, rightsData: res || {} })
    }

    feildCheck = async () => {

        let { session: { data: sessionData } } = this.props;
        const { data } = this.state
        const { userType, userLevel, client, entity, branch, code, branchId } = sessionData;
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
            default:
                data['client'] = client || code;
                data['entity'] = entity || code;
                data['branch'] = branch || branchId;
                await this.setState({ data, isClient: false, isEntity: false, isBranch: false, isDepartment: false, isBatch: false })
                await this.formApi.setValues(data);
                await this.onSubmit();
                break;
        }
    }

    getAllDetails() {
        this.getLanguageDetails();
        this.casteDetails();
        this.subcasteDetails();
        this.getStateDetails();
        this.titleDetails();
        this.getReligionDetails();
    }

    async getLanguageDetails() {
        let params = `language?type=language`
        let languageList = await getSubLists(params)
        if (languageList.data.statusCode === 1) {
            await this.setState({
                languageList: languageList.data.data,
                languageTable: true
            })
        } else {
            await this.setState({
                languageList: [],
                languageTable: true
            })
        }
    }

    async casteDetails() {
        let params = `caste?type=caste`
        let casteList = await getSubLists(params)
        if (casteList.data.statusCode === 1) {
            await this.setState({
                casteList: casteList.data.data,
                casteTable: true
            })
        } else {
            await this.setState({
                casteList: [],
                casteTable: true
            })
        }
    }

    async subcasteDetails() {
        let params = `caste?type=subcaste`
        let subcasteList = await getSubLists(params)
        if (subcasteList.data.statusCode === 1) {
            await this.setState({
                subcasteList: subcasteList.data.data,
                subcasteTable: true
            })
        } else {
            await this.setState({
                subcasteList: [],
                subcasteTable: true
            })
        }
    }

    async titleDetails() {
        let titleList = await getTitleList()
        if (titleList.data.statusCode === 1) {
            await this.setState({
                titleList: titleList.data.data,
                titleTable: true
            })

        } else {
            await this.setState({
                titleList: [],
                titleTable: true
            })
        }
    }

    async getStateDetails() {
        let params = `country?type=state`
        let stateList = await getSubLists(params)
        if (stateList.data.statusCode === 1) {
            await this.setState({
                stateList: stateList.data.data,
                statetable: true
            })
        } else {
            await this.setState({
                stateList: [],
                statetable: true
            })
        }
    }

    async getReligionDetails() {
        let params = `religion`
        let religionList = await getReligionList(params)
        if (religionList.data.statusCode === 1) {
            await this.setState({
                religionList: religionList.data.data,
                religionTable: true
            })
        } else {
            await this.setState({
                religionList: [],
                religionTable: true
            })
        }
    }

    validateProperty = (name, value) => {
        const schema = Joi.reach(Joi.object(this.schema), name)
        const { error } = Joi.validate(value, schema);
        return error ? error.details[0].message : null;
    };

    schema = {   // Validate all the feilds present in this module
        branch: Joi.string().required().label("Branch"),
        client: Joi.string().required().label("Client"),
        entity: Joi.string().required().label("Entity")
    };

    handleChange = async ({ currentTarget: Input }) => { //Get the Client,Entity,Branch Lists
        // let formaData = this.formApi.getState().values;
        // await this.setState({data:formaData})
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
                await this.setState({entityLoad:true});
                await this.selectoptGet(`namelist?client=${data.client}&type=client`, "entityIds")
                await this.setState({ settingsTable: false, entity: "", branch: "", department: "", batch: "", branchIds: [], departmentIds: [], batchIds: [] })
                break;
            case "entity":
                await this.setState({branchLoad:true})
                await this.selectoptGet(`namelist?client=${data.client}&type=entity&entity=${data.entity}`, "branchIds")
                await this.setState({ settingsTable: false, branch: "", department: "", batch: "", departmentIds: [], batchIds: [] })
                break;
            case "branch":
                
                await this.selectoptGet(`namelist?client=${data.client}&type=branch&entity=${data.entity}&branch=${data.branch}`, "departmentIds")
                await this.setState({ settingsTable: false, department: "", batch: "", batchIds: [] })
                break;

            default:
                break;
        }
    }

    async selectoptGet(url, type) {
        const data = await getselectData(url)
        if (data.data.statusCode === 1) {
            const Datas = data.data.data
            await this.setState({ [type]: Datas,entityLoad:false,branchLoad:false });
        }
    }

    adduserNavigation(formType) { //Navigate to Add module Page
        return <NavLink className="btn btn-primary btn-sm btn-right" to={`/settings/add/${formType}`}>+ Add {formType}</NavLink>
    }

    setFormApi = (formApi) => {
        this.formApi = formApi
    }

    onSubmit = async () => {
        this.tableHide()
        const { formType } = this.props.match.params
        switch (formType) {
            case 'title':
                this.titleDetails()
                break;
            case 'state':
                this.getStateDetails()
                break;
            case 'religion':
                this.getReligionDetails()
                break;
            case 'language':
                this.getLanguageDetails()
                break;
            case 'subcaste':
                this.subcasteDetails()
                break;
            case 'caste':
                this.casteDetails()
                break;
            default:
                let data = '';
                const { data: { client, entity, branch } } = this.state;
                let params = `client=${client}&entity=${entity}&branch=${branch}&type=${formType}`
                const settingsDetails = await getParticularType(params)
                if (settingsDetails.data.statusCode === 1) { //check the datas
                    data = settingsDetails.data.data
                    await this.setState({
                        tabledata: data,
                        settingsTable: true,
                        formType,
                        addbtn: true
                    })
                } else {
                    await this.setState({
                        tabledata: [],
                        settingsTable: true,
                        formType,
                        addbtn: true
                    })
                }
                break;
        }

    }

    renderSettingsForm(formType, data) { //Pass Datas to SettingsList Page
        const { rightsData } = this.state;
        return <SettingsList formType={formType} data={data} props={this.props} refreshTable={this.onSubmit} rightsData={rightsData} />
    }

    tableHide() {
        this.setState({ settingsTable: false, titleTable: false, religionList: false, casteTable: false, subcasteTable: false, statetable: false, religionTable: false, languageTable: false })
    }

    redirectTo = async () => {
        await this.setState({ settingsTable: false, titleTable: false, religionList: false, casteTable: false, subcasteTable: false, statetable: false, religionTable: false, languageTable: false })
        const { session } = this.props;
        await this.rightsData(session);
        await this.feildCheck();
        await this.getAllDetails()
        await this.formApi.reset();
    }

    render() {
        const { isPageLoading, isLoading,  tabledata, clientIds, entityIds, branchIds, languageList, casteList, subcasteList, stateList, titleList, titleTable, religionList, casteTable, subcasteTable, statetable, religionTable, languageTable, rightsData, excludeModules,
            isClient, isEntity, isBranch,entityLoad,branchLoad } = this.state;
        const { formType } = this.props.match.params
        const { session } = this.props;
        let { keys: formTypeKeys, order: formTypeOrder } = Static.settingsFormTypes();
        let _form = _.upperFirst(formType);
        formTypeOrder = _.filter(formTypeOrder, v => _.includes(excludeModules, v))
        console.log(entityLoad,branchLoad)
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
                                        <BreadcrumbItem><NavLink to='/settings/department'>settings</NavLink></BreadcrumbItem>
                                        <BreadcrumbItem active>{formType}</BreadcrumbItem>
                                    </Breadcrumb>
                                    <Container fluid>
                                        <div className="subnav-div"> 
                                            {formTypeOrder.map((formType) =>
                                                <NavLink key={formType} onClick={this.redirectTo} to={{ pathname: `/settings/${formType}`, query: this.props.location.query }} className={classNames('subnav')} activeClassName="subnav-active" exact={true} >{formTypeKeys[formType]['label']}</NavLink>
                                            )}
                                        </div>
                                        <div className="d-md-flex align-items-md-center justify-content-md-between">
                                            <h5 className="pg-title">{_form}</h5>
                                            <div>
                                                {rightsData && rightsData[_form] && rightsData[_form].create.value &&
                                                    this.adduserNavigation(formType)
                                                }

                                            </div>
                                        </div> 
                                        <Form getApi={this.setFormApi} onSubmit={this.onSubmit} >
                                            {({ formApi, formState }) => (
                                                <div>{
                                                    ((formType === 'department' || formType === 'batch' || formType === 'boardtype') && isBranch) ?

                                                        <section>
                                                            <Row>
                                                                {isClient && <Col sm={6} md={3}>
                                                                    <CustomSelect field="client" label="Client*" name="client" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('client', e)} onChange={this.handleChange} options={clientIds} />
                                                                        
                                                                </Col>
                                                                }
                                                                {isEntity && <Col sm={6} md={3}>
                                                                    <CustomSelect field="entity" label="Entity*" name="entity" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('entity', e)} onChange={this.handleChange} options={entityIds} />
                                                                    {/* <div className="selectLoad">
                                                                    <ClipLoader
                                                                        className="override selectLoad"
                                                                        sizeUnit={"px"}
                                                                        size={25}
                                                                        color={'#000'}
                                                                        loading={entityLoad}
                                                                      />
                                                                      </div> */}
                                                                </Col>
                                                                }
                                                                {isBranch &&
                                                                    <Col sm={6} md={3}>
                                                                        <CustomSelect field="branch" label="Branch*" name="branch" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('branch', e)} onChange={this.handleChange} options={branchIds} />
                                                                       
                                                                        {/* <div className="selectLoad">
                                                                        <ClipLoader
                                                                        className="override selectLoad"
                                                                        sizeUnit={"px"}
                                                                        size={25}
                                                                        color={'#000'}
                                                                        loading={branchLoad}
                                                                      />
                                                                      </div> */}
                                                                   
                                                                    </Col>
                                                                }
                                                            </Row>
                                                            <div className="text-right">
                                                                <button type="submit" className="btn btn-primary btn-sm">Submit</button>
                                                            </div>
                                                        </section>

                                                        : ''

                                                }

                                                </div>
                                            )}
                                        </Form>
                                        {this.state.settingsTable && rightsData &&
                                            this.renderSettingsForm(formType, tabledata)
                                        }
                                        {formType === 'language' && languageList && languageTable && rightsData ?
                                            this.renderSettingsForm(formType, languageList) : ''
                                        }
                                        {formType === 'caste' && casteList && casteTable && rightsData ?
                                            this.renderSettingsForm(formType, casteList) : ''
                                        }
                                        {formType === 'subcaste' && subcasteList && subcasteTable && rightsData ?
                                            this.renderSettingsForm(formType, subcasteList) : ''
                                        }
                                        {formType === 'state' && stateList && statetable && rightsData ?
                                            this.renderSettingsForm(formType, stateList) : ''
                                        }

                                        {formType === 'title' && titleList && titleTable && rightsData ?
                                            this.renderSettingsForm(formType, titleList) : ''
                                        }
                                        {formType === 'religion' && religionList && religionTable && rightsData ?
                                            this.renderSettingsForm(formType, religionList) : ''
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



