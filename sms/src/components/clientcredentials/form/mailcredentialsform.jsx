import Joi from 'joi-browser';
import React, { Fragment, Component } from 'react';
import { Col, Row } from 'reactstrap';
import { Form } from 'informed';
import { Input, CustomSelect } from 'components/common/forms';

import { getselectData } from 'services/userService' 
import ToastService from 'services/toastService'
import { addCredentials, editcredentialsDetails } from 'services/clientCredentialService'

export default class MailCredentialsForm extends Component {
    constructor(props) {

        super(props)

        this.state = {
            uid: '',
            data: {
                client: '',
                entity: '',
                branch: '',
                mail: '',
                username: '',
                accesskey: '',

            },
            clientIds: [], entityIds: [], branchIds: [],
            isClient: true, isEntity: true, isBranch: true, isDepartment: true, isBatch: true
        }
    }

    schema = {
        client: Joi.string().required().label("Client"),
        entity: Joi.string().required().label("Entity"),
        branch: Joi.string().required().label("Branch"),
        mail: Joi.string().required().label("Mail"),
        username: Joi.string().required().label("User Name"),
        accesskey: Joi.string().required().label("Access Key")
    };

    async componentDidMount() {
        const { action } = this.props
        await this.selectoptGet(`clients`, "clientIds")
        await this.feildCheck();
        if (action === "edit") {
            this.setState({ isEditForm: true });
            const { location: { state: { data } } } = this.props.props;
        
            if (data !== undefined) { }
            return this.formStateCheck(data);
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
                await this.setState({ data, isClient: false, isEntity: false, isBranch: false, isDepartment: false, isBatch: false })
                await this.formApi.setValues(data);
                break;
        }
    }

    formStateCheck = async (data) => {
     
        data.mail = data.email[0].mail
        data.username = data.email[0].userName
        data.accesskey = data.email[0].accessKey

        await this.setState({ data });
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


    handleError(...err) {      
        return ToastService.Toast("Something went wrong.Please try again later",'default');
    }

    validateProperty = (name, value) => {
        const schema = Joi.reach(Joi.object(this.schema), name)
        const { error } = Joi.validate(value, schema);
        return error ? error.details[0].message : null;
    };

    resetForm = () => {
        this.formApi.reset()
    }


    setFormApi = (formApi) => {
        this.formApi = formApi;
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
            case "batch":
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

    setFormApi = (formApi) => {
        this.formApi = formApi;
    }


    onSubmit = async () => {
        var credentialDetails;
        const { action } = this.props    
        const data = this.formApi.getState().values
        const { accesskey, client, entity, mail, username, branch } = data

        let temp = {
            "mail": mail,
            "userName": username,
            "accessKey": accesskey,
            "type": "email",
            "client": client,
            "entity": entity,
            "branch": branch
        }
    
        if (action === 'edit') {
            credentialDetails = await editcredentialsDetails(temp)
        } else if (action === 'add') {          
            credentialDetails = await addCredentials(temp)          
        }
     
        if (credentialDetails.data.statusCode !== 1) return ToastService.Toast(credentialDetails.data.message,'default');
        if (credentialDetails.data.statusCode === 1) {
            ToastService.Toast(credentialDetails.data.message,'default');
            this.resetForm();
            this.props.props.history.push(`/credentials/mail`)
        }
    }

    render() {
        const { action, form } = this.props
        const {  clientIds, entityIds, branchIds, isClient, isEntity, isBranch} = this.state;
    
        return (
            <Fragment>
                <h6>{action} {form}  Details</h6>
                <Form getApi={this.setFormApi} onSubmit={this.onSubmit} >
                    {({ formApi, formState }) => (
                        <div>
                            <section>
                                {isBranch &&
                                    <Row>
                                        {isClient &&
                                            <Col sm={6} md={3}>
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
                                    </Row>}

                                <Row>
                                    <Col sm={6} md={3}>
                                        <Input field="mail" label="Mail" name="mail" validate={e => this.validateProperty('mail', e)} />
                                    </Col>
                                    <Col sm={6} md={3}>
                                        <Input field="username" label="User Name*" name="username" validate={e => this.validateProperty('username', e)} />
                                    </Col>
                                    <Col sm={6} md={3}>
                                        <Input field="accesskey" label="Access Key*" name="accesskey" validate={e => this.validateProperty('accesskey', e)} />
                                    </Col>
                                </Row>
                            </section>
                            <div className="text-right">
                                <button type="submit" className="btn btn-primary btn-sm">Submit</button>
                            </div>


                        </div>
                    )}
                </Form>
            </Fragment >
        )
    }
}