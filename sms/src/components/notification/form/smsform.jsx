import Joi from 'joi-browser';
import React, { Fragment, Component } from 'react';
import { Form } from 'informed';
import { Row, Col } from 'reactstrap';
import { getStudentAutoSuggest } from 'services/userService';

import { CustomSelect, Textarea, TestAutoSuggest } from 'components/common/forms';
import { getselectData } from 'services/userService'
import { getCredentials } from 'services/clientCredentialService'
import { addNotification } from 'services/notificationService'
import ToastService from 'services/toastService'


export default class SmsNotification extends Component {
    constructor(props) {
        super(props)
        this.state = {
            uid: '',
            data: {
                department: '',
                batch: '',
                client: '',
                entity: '',
                branch: '',
            },
            clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [], categoryType: [],
            messageType: [],
            recepientTypes: [
                { code: "individual", name: "individual" },
                { code: "bulk", name: "bulk" }
            ],
            isClient: true, isEntity: true, isBranch: true, isDepartment: true, isBatch: true

        }
    }

    async componentDidMount() {
        const { data } = this.state
        this.selectoptGet(`clients`, "clientIds")
        this.formApi.setValues(data);
        await this.feildCheck()
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

    autoSujestValue = (value) => {
        this.setState({
            studentUid: value
        })
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

    clientDatas = async (name) => {
        const { data, } = this.state;
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
            case "recepientType":
                this.selectoptGet(`templates?client=${data.client}&entity=${data.entity}&branch=${data.branch}`, "categoryType")
                await this.setState({})
                await this.getStudentList();
                await this.getCredentials()
                break;
            case "template":
                await this.selectoptGet(`templates?client=${data.client}&entity=${data.entity}&branch=${data.branch}&type=email&category=${data.template}`, "messageType");
                let formData = this.formApi.getState().values;
                formData.msg = this.state.messageType[0].msg;
                this.formApi.setValues(formData);
                break;
            default:
                break;
        }
    }

    schema = {
        client: Joi.string().required().label("Client"),
        entity: Joi.string().required().label("Entity"),
        branch: Joi.string().required().label("Branch"),
        recepientType: Joi.string().required().label("Recepient Type"),
        template: Joi.string().required().label("Template"),
    };

    validateProperty = (name, value) => {
        const schema = Joi.reach(Joi.object(this.schema), name)
        const { error } = Joi.validate(value, schema);
        return error ? error.details[0].message : null;
    };

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

    resetForm = () => {
        this.formApi.reset()
    }


    getCredentials = async () => {
        let response;
        const { client, entity, branch } = this.state
        let params = `client=${client}&entity=${entity}&branch=${branch}`
        response = await getCredentials(params);
      
        if (response.data.statusCode === 1) {
            let _data = response.data.data[0];
            if (_data.sms.length > 0) {
                let userName = (_data && _data.sms && _data.sms[0] && _data.sms[0].userName) || ''
                let accessKey = (_data && _data.sms && _data.sms[0] && _data.sms[0].accessKey) || ''
                let senderId = (_data && _data.sms && _data.sms[0] && _data.sms[0].senderId) || ''
                let url = (_data && _data.sms && _data.sms[0] && _data.sms[0].url) || ''
                await this.setState({
                    userName,
                    senderId,
                    accessKey,
                    url
                })
            } else {
                return ToastService.Toast("Fill the Credentials", "default")
            }

        }
    }

    onSubmit = async () => {
        let temp, finialResponse;
        const data = this.formApi.getState().values
        const { userName, senderId, accessKey, url } = this.state
        if ((userName !== undefined) && (accessKey !== undefined) && (senderId !== undefined) && (url !== undefined)) {
            if (this.state.batch) {
                this.setState({
                    passType: "batch",
                    value: data.batch,
                    deptValue: data.department
                })
            } else if (this.state.department) {
                this.setState({
                    passType: "department",
                    value: data.department
                })
            } else {
                this.setState({
                    passType: '',
                    value: ''
                })
            }
            temp = {
                "client": data.client,
                "entity": data.entity,
                "branch": data.branch,
                "notificationType": "sms",
                "from": senderId,
                "to": this.state.studentUid || '',
                "msg": data.msg,
                "recepientType": data.recepientType,
                "url": url,
                "accessKey": accessKey,
            }
            if (data.recepientType === 'bulk') {
                temp["type"] = this.state.passType
                temp["value"] = this.state.value
                temp["department"] = this.state.deptValue || ''
                delete temp.to
            }
          
            finialResponse = await addNotification(temp)
            if (finialResponse.data.statusCode === 1) {
                await ToastService.Toast(finialResponse.data.message, 'default');
                this.resetForm();
            }
        } else {
            return ToastService.Toast('Credentials Required', "default");
        }
    }

    render() {
        const { clientIds, entityIds, branchIds, departmentIds, batchIds, recepientType, recepientTypes,  messageType, studentList, isClient, isEntity, isBranch, } = this.state;
      
        return (
            <Fragment>
                <h6>Sms Notifications</h6>
                <Form getApi={this.setFormApi} onSubmit={this.onSubmit} >
                    {({ formApi, formState }) => (
                        <div>
                            <section>
                                <Row>
                                    {isClient &&
                                        <Col sm={6} md={3}>
                                            <CustomSelect field="client" label="Client*" name="client" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur onChange={this.handleChange} options={clientIds}
                                                 validate={e => this.validateProperty('client', e)} />
                                        </Col>}
                                    {isEntity &&
                                        <Col sm={6} md={3}>
                                            <CustomSelect field="entity" label="Entity*" name="entity" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur onChange={this.handleChange} options={entityIds}
                                                 validate={e => this.validateProperty('entity', e)} />
                                        </Col>}
                                    {isBranch &&
                                        <Col sm={6} md={3}>
                                            <CustomSelect field="branch" label="Branch*" name="branch" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur onChange={this.handleChange} options={branchIds}
                                                 validate={e => this.validateProperty('branch', e)} />
                                        </Col>}
                                    <Col sm={6} md={3}>
                                        <CustomSelect field="recepientType" label="Recepient Type*" name="recepientType" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={recepientTypes} onChange={this.handleChange}
                                            validate={e => this.validateProperty('recepientType', e)} />
                                    </Col>
                                </Row>
                                <Row>
                                    {
                                        recepientType === 'bulk' &&
                                        <Col sm={6} md={3}>
                                            <CustomSelect field="department" label="Department*" name="department" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={departmentIds} onChange={this.handleChange} />
                                        </Col>
                                    }
                                    {
                                        recepientType === 'bulk' &&
                                        <Col sm={6} md={3}>
                                            <CustomSelect field="batch" label="Batch*" name="batch" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={batchIds} onChange={this.handleChange} />
                                        </Col>
                                    }
                                    {
                                        recepientType === 'individual' && studentList &&
                                        <Col sm={6} md={3}>
                                            <label>Student Name</label>
                                            <TestAutoSuggest name="students" field="students" data={studentList} filterOption="name" getOptionValue={(data) => this.autoSujestValue(data)} />
                                        </Col>
                                    }
                                    <Col sm={6} md={3}>
                                        <CustomSelect field="template" label="Template*" name="template" getOptionValue={option => option.category} getOptionLabel={option => option.category} options={this.state.categoryType} onChange={this.handleChange}
                                            validate={e => this.validateProperty('template', e)} />
                                    </Col>
                                    {messageType.length > 0 &&
                                        <Col sm={6} md={12}>
                                            <Textarea field="msg" label="Message" name="msg" />
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
            </Fragment >
        )
    }
}