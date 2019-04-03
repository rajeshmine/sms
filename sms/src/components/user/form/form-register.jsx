import { Input, CustomSelect } from 'components/common/forms';
import { Form,  } from 'informed';
import Joi from 'joi-browser';
import React, { Component, Fragment } from 'react';
import { Col, Row } from 'reactstrap';
import { getselectData, saveUser, userIdValidate } from 'services/userService';
import ToastService from 'services/toastService'

export default class RegisterForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data: {
                userType: "", uid: "", password: "", firstName: "", email: "", mobile: "",
                parentUid: "", parentPassword: "",
                client: "", entity: "", branch: "", department: "", batch: "",
            },
            clientInput: true,
            entityInput: true,
            branchInput: true,
            departmentInput: true,
            batchInput: true,
            clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [],
            userTypes: [{ id: "student", name: "student" }, { id: "staff", name: "staff" }],
            uid: "",
            errors: {},
            isLoading: true,
            isClient: true, isEntity: true, isBranch: true, isDepartment: true, isBatch: true

        };
    }
    
    schema = {
        userType: Joi.string().required().label("userType"),
        uid: Joi.string().required().label("uid"),
        password: Joi.string().required().label("Password"),
        firstName: Joi.string().required().label("FirstName"),
        email: Joi.string().email().required().label("Email"),
        mobile: Joi.string().min(10).max(10).regex(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/).required().label("Mobile"),
        parentUid: Joi.string().required().label("Parent Uid"),
        parentPassword: Joi.string().required().label("Parent Password"),
        client: Joi.string().required().label("Client"),
        entity: Joi.string().required().label("Entity"),
        branch: Joi.string().required().label("Branch"),
        department: Joi.string().required().label("Department"),
        // batch: Joi.string().required()
    };

    helper = {
        uid: <Fragment>It must be unique id used for login. <b>Eg.</b> Student/Staff registration number </Fragment>,
        parentUid: <Fragment>Use <i><strong>p</strong></i> as prefix before user id <b>Eg.</b>If student user id is <i><strong>s01</strong></i> parent user id can be <i><strong>ps01</strong></i></Fragment>,
        firstName: <Fragment>First name</Fragment>,
        email: <Fragment>Primary Email Id for communication</Fragment>,
        mobile: <Fragment>Primary Mobile Number for communication</Fragment>


    }


    async componentDidMount() {
        this.selectoptGet(`clients`, "clientIds")
        await this.feildCheck()
        const { data } = this.state
        await this.formApi.setValues(data);
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

    validateProperty = (name, value) => {
        const schema = Joi.reach(Joi.object(this.schema), name)
        const { error } = Joi.validate(value, schema);
        return error ? error.details[0].message : null;
    };

    setFormApi = (formApi) => {
        this.formApi = formApi;
    }

    onSubmit = async () => {
        const { props } = this.props
        const data = this.formApi.getState().values       
        var userid = data.uid+"@"+data.client       
        data.uid = userid
        console.log(data)
        let params = `client=${data.client}&entity=${data.entity}&branch=${data.branch}`
        const res = await saveUser("login", params, data)
     
        if (res.data.statusCode === 1) {
            ToastService.Toast(`Registration completed Successfully`, "default")
            props.history.push(`/${data.client}/${data.entity}/${data.branch}/${data.uid}/edit/personal`)
        } else if (res.data.statusCode === 0)
            ToastService.Toast(res.data.message, "default")

        else
            ToastService.Toast(`Registration Failed`, "default")
    }


    handleError = (err) => {
        ToastService.Toast(`Something went Wrong.Please Try again`, "default")
    }
    handleChange = async ({ currentTarget: Input }) => {
        const { name, value } = Input;
        const { data } = this.state;
        data[name] = value;
        this.setState({
            [name]: value
        }, () => {

        })
        this.clientDatas(name)

    }

    async selectoptGet(url, type) {
        const data = await getselectData(url)
     
        if (data.data.statusCode === 1) {
            const Datas = data.data.data
           
            this.setState({ [type]: Datas });
        }
    }

    // User Id Check

    userIdCheck = async ({ currentTarget: Input }) => {
       
        const { data } = this.state;

        const { name, value } = Input;
        let obj = {
            uid: value
        }
        var res = await userIdValidate(obj);
        const { data: { statusCode } } = res;
        if (statusCode === 1) {
            ToastService.Toast(`User Id already Exists!!`, "default")
            data[name] = '';
            this.setState({ data });
            this.formApi.setValues(data)
        }
    }



    render() {
        const {  data: {  userType }, clientIds, entityIds, branchIds, departmentIds, batchIds, userTypes,
            isClient, isEntity, isBranch, isDepartment, isBatch } = this.state;
        return (
            <Fragment>
                <h6>New User</h6>
                <Form getApi={this.setFormApi} onSubmit={this.onSubmit}>
                    {({ formApi, formState }) => (
                        <div>
                             {isBatch && <section>
                                <h6>Client Details</h6>
                                <Row>
                                    {isClient &&
                                        <Col sm={12} md={3}>

                                            <CustomSelect field="client" label="Client*" name="client" getOptionValue={option => option.code}
                                                getOptionLabel={option => option.name} options={clientIds}
                                                validateOnBlur validate={e => this.validateProperty('client', e)} onChange={this.handleChange} />
                                        </Col>
                                    }
                                    {isEntity &&
                                        <Col sm={12} md={3}>
                                            <CustomSelect field="entity" label="Entity*" name="entity" getOptionValue={option => option.code}
                                                getOptionLabel={option => option.name} options={entityIds}
                                                validateOnBlur validate={e => this.validateProperty('entity', e)} onChange={this.handleChange} />
                                        </Col>
                                    }
                                    {isBranch &&
                                        <Col sm={12} md={3}>
                                            <CustomSelect field="branch" label="Branch*" name="branch" getOptionValue={option => option.code}
                                                getOptionLabel={option => option.name} options={branchIds}
                                                validateOnBlur validate={e => this.validateProperty('branch', e)} onChange={this.handleChange} />
                                        </Col>
                                    }
                                    {isDepartment &&
                                        <Col sm={12} md={3}>
                                            <CustomSelect field="department" label="Department*" name="department" getOptionValue={option => option.code}
                                                getOptionLabel={option => option.name} options={departmentIds}
                                                validateOnBlur validate={e => this.validateProperty('department', e)} onChange={this.handleChange} />
                                        </Col>
                                    }
                                    {isBatch &&
                                        <Col sm={12} md={3}>
                                            <CustomSelect field="batch" label="Batch" name="batch" getOptionValue={option => option.code}
                                                getOptionLabel={option => option.name} options={batchIds} onChange={this.handleChange} />
                                        </Col>
                                    }
                                </Row>
                            </section>}
                            <section>
                                <h6>Login Credentials</h6>
                                <Row>
                                    <Col sm={6} md={4}>
                                        <CustomSelect field="userType" label="UserType*" name="userType" getOptionValue={option => option.id}
                                            getOptionLabel={option => option.name} options={userTypes}
                                            validateOnBlur validate={e => this.validateProperty('userType', e)} onChange={this.handleChange} />
                                    </Col>
                                    <Col sm={6} md={4}>
                                        <Input
                                            field="uid" label="User Login Id*" name="uid" helper={this.helper.uid}
                                            validateOnBlur validate={e => this.validateProperty('uid', e)}
                                            onBlur={this.userIdCheck}
                                        />
                                    </Col>
                                    <Col sm={12} md={4}>
                                        <Input
                                            field="password" label=" Password*" name="password"
                                            validateOnBlur validate={e => this.validateProperty('password', e)}
                                        />
                                    </Col>
                                </Row>
                            </section>
                            <section>
                                <h6>Personal Details</h6>
                                <Row>
                                    <Col sm={12} md={4}>
                                        <Input
                                            field="firstName" label="Name*" name="firstName" helper={this.helper.firstName}
                                            validateOnBlur validate={e => this.validateProperty('firstName', e)}
                                        />
                                    </Col>
                                    <Col sm={12} md={4}>
                                        <Input
                                            field="email" label="Email ID*" name="email" helper={this.helper.email}
                                            validateOnBlur validate={e => this.validateProperty('email', e)}
                                        />


                                    </Col>
                                    <Col sm={12} md={4}>
                                        <Input
                                            field="mobile" label="Mobile Number*" helper={this.helper.mobile}
                                            validateOnBlur validate={e => this.validateProperty('mobile', e)}
                                        />

                                    </Col>
                                </Row>
                            </section>
                           
                            {userType === 'student' ?
                                <section>
                                    <h6>Parent Credentials</h6>
                                    <Row>
                                        <Col sm={12} md={4}>
                                            <Input
                                                field="parentUid" label="Parent Login Id*" name="parentUid" helper={this.helper.parentUid}
                                                validateOnBlur validate={e => this.validateProperty('parentUid', e)}
                                            />
                                        </Col>
                                        <Col sm={12} md={4}>
                                            <Input
                                                field="parentPassword" label="Parent Password*" name="parentPassword"
                                                validateOnBlur validate={e => this.validateProperty('parentPassword', e)}
                                            />
                                        </Col>
                                    </Row>
                                </section>
                                : null}
                            <div className="text-right">
                                <button type="submit" className="btn btn-primary btn-sm">Save & Next</button>
                            </div>

                        </div>
                    )}
                </Form>
            </Fragment>
        );
    }
}



