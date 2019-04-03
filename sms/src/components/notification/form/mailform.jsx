import Joi from 'joi-browser';
import React, { Fragment, Component } from 'react';
import { Form } from 'informed';
import { Row, Col } from 'reactstrap';
import { CustomSelect, Textarea, TestAutoSuggest } from 'components/common/forms';
import { addNotification } from 'services/notificationService';
import { getCredentials } from 'services/clientCredentialService'
import ToastService from 'services/toastService'
import { getselectData, getStudentAutoSuggest } from 'services/userService'
import { ReactMultiEmail } from "react-multi-email";
import "react-multi-email/style.css";
import {  SGTemplates } from 'services/templatesService'

export default class MailNotification extends Component {

    constructor(props) {
        super(props)
        this.state = {
            ccemails: [],
            bccemails: [],
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

            markSystemList: [
                { name: 'CCE', code: 'CCE' },
                { name: 'GPA', code: 'GPA' }
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

    schema = {
        department: Joi.string().required().label("Department"),
        client: Joi.string().required().label("Client"),
        entity: Joi.string().required().label("Entity"),
        branch: Joi.string().required().label("Branch"),
        batch: Joi.string().required().label("Batch"),
        recepientType: Joi.string().required().label("Recepient Type"),
        template: Joi.string().required().label("Template"),

    };

    autoSujestValue = (value) => {
        this.setState({
            studentUid: value
        })
    }

    resetForm = () => {
        this.formApi.reset()
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
                await this.getCredentials()
                break;
            case "entity":
                this.selectoptGet(`namelist?client=${data.client}&type=entity&entity=${data.entity}`, "branchIds")
                await this.setState({ branch: "", department: "", batch: "", departmentIds: [], batchIds: [] })
                await this.getCredentials()
                break;
            case "branch":
                this.selectoptGet(`namelist?client=${data.client}&type=branch&entity=${data.entity}&branch=${data.branch}`, "departmentIds")
                await this.setState({ department: "", batch: "", batchIds: [] })
                await this.getCredentials()
                break;
            case "department":
                this.selectoptGet(`namelist?client=${data.client}&type=department&entity=${data.entity}&branch=${data.branch}&department=${data.department}`, "batchIds")
                await this.setState({ batch: "" })
                break;
            case "recepientType":
                // this.selectoptGet(`templates?client=${data.client}&entity=${data.entity}&branch=${data.branch}`, "categoryType")
                await this.SGTemplates("categoryType");
                await this.setState({})
                await this.getStudentList();
                
                break;
            case "template":
                await this.msgGet("messageType");
                //  await this.selectoptGet(`templates?client=${data.client}&entity=${data.entity}&branch=${data.branch}&type=email&category=${data.template}`, "messageType");
                console.log(this.state)
                let formData = this.formApi.getState().values;
                formData.msg = this.state.messageType[0].name;
                this.formApi.setValues(formData);
                break;
            default:
                break;
        }
    }


    msgGet = async(type)=>{
        const { data: {config, template } } = this.state;
        let url = `https://api.sendgrid.com/v3/templates/${template}`;
        let r = await SGTemplates(url, "GET", "", config);
        console.log(r)
        if (r) {
             await this.setState({
                [type]: r.versions,
            })
        } else {
            ToastService.Toast("Error", "default")
        }

    }
    SGTemplates = async(type)=>{
        const { data: { config } } = this.state;
        if(config){
        let url = 'https://api.sendgrid.com/v3/templates';
        let r = await SGTemplates(url, "GET", "", config);
        console.log(r)
        if (r.templates) {
            await this.setState({
                [type]: r.templates,
            })
        } else {
            await this.setState({
                [type]: [],
               
            })
        }
    }else{
        ToastService.Toast("Error", "default")
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
        if (res.data.statusCode !== 1) return ToastService.Toast(res.data.message, "default")
    }




    // getCredentials = async () => {
    //     let response;
    //     const { client, entity, branch } = this.state
    //     let params = `client=${client}&entity=${entity}&branch=${branch}`
    //     console.log(params)        
    //     response = await getCredentials(params);
    //     console.log(response)
    //     if (response.data.statusCode === 1) {
    //         let _data = response.data.data[0];
    //         console.log(_data)
    //         if (_data.email.length > 0) {
    //             let data = (_data && _data.email && _data.email[0] && _data.email[0].mail) || ''
    //             let userName = (_data && _data.email && _data.email[0] && _data.email[0].userName) || ''
    //             let accessKey = (_data && _data.email && _data.email[0] && _data.email[0].accessKey) || ''
    //             await this.setState({
    //                 mailsender: data,
    //                 mailsenderName: userName,
    //                 accessKey: accessKey
    //             })
    //         } else {
    //             return ToastService.Toast("Fill the Credentials", "default")
    //         }

    //     }
    // }


    getCredentials = async () => {
        const { data: { client, entity, branch }, data } = this.state;
        let res;
        if (client && entity && branch ) {
            if (client !== '' && entity !== '' && branch !== '' ) {                
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
                                },
                                mailsender: d.email[0].mail,
                                mailsenderName: d.email[0].userName,
                                accessKey: d.email[0].accessKey
                            })
                        }
                    }
                
            }
        }
        console.log(this.state)
    }

    validateProperty = (name, value) => {
        const schema = Joi.reach(Joi.object(this.schema), name)
        const { error } = Joi.validate(value, schema);
        return error ? error.details[0].message : null;
    };


    onSubmit = async () => {
        let cc=[],bcc=[];
        const data = this.formApi.getState().values
        const { mailsenderName, accessKey, mailsender,ccemails,bccemails } = this.state
        if(ccemails && ccemails.length > 0 ){
            console.log(ccemails)
            for(let item of ccemails){
                console.log(item)
                cc.push({email : item});
            }
           
        }
        if(bccemails && bccemails.length > 0 ){
            console.log(ccemails)
            for(let item of bccemails){
                console.log(item)
                bcc.push({email : item});
            }
        }
        if ((mailsenderName !== undefined) && (accessKey !== undefined) && (mailsender !== undefined)) {
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
            const { client, entity, branch, recepientType, msg } = data
            console.log(this.state,cc,bcc)
            let temp = {
                "client": client,
                "entity": entity,
                "branch": branch,
                "notificationType": "email",
                "from": this.state.mailsender,
                "uid": this.state.studentUid || '',
                "body": msg,
                "recepientType": recepientType,
                "type": this.state.passType,
                "department": this.state.deptValue || '',
                "value": this.state.value,
                "name": this.state.mailsenderName,
                "accessKey": this.state.accessKey,
                "subject": "Official Information",
                "templateId": "",
                "templateArgs": '',
                "cc":cc,
                "bcc":bcc,
            }
            console.log(temp)
            const r = await addNotification(temp)
            console.log(r)
            if (r.data.statusCode === 1) {
                await this.refreshComponent();
                return ToastService.Toast(r.data.message, "default");
                
            } else {
                return ToastService.Toast(r.data.message, "default");
            }
        } else {
            return ToastService.Toast('Credentials Required', "default");
        }
    }

    refreshComponent = async()=>{
        await this.formApi.reset();
    }
    render() {
        const { clientIds, entityIds, branchIds, departmentIds, batchIds, recepientType, recepientTypes, messageType, studentList, isClient, isEntity, isBranch, ccemails,bccemails } = this.state;
     
        return (
            <Fragment>
                <h6>Mail Notifications</h6>
                <Form getApi={this.setFormApi} onSubmit={this.onSubmit} >
                    {({ formApi, formState }) => (
                        <div>
                            <section>
                                <Row>
                                    {isClient &&
                                        <Col sm={6} md={3}>
                                            <CustomSelect field="client" label="Client*" name="client" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('client', e)} onChange={this.handleChange} options={clientIds} />
                                        </Col>
                                    }
                                    {isEntity &&
                                        <Col sm={6} md={3}>
                                            <CustomSelect field="entity" label="Entity*" name="entity" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('entity', e)} onChange={this.handleChange} options={entityIds} />
                                        </Col>}
                                    {isBranch &&
                                        <Col sm={6} md={3}>
                                            <CustomSelect field="branch" label="Branch*" name="branch" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('branch', e)} onChange={this.handleChange} options={branchIds} />
                                        </Col>
                                    }
                                    <Col sm={6} md={3}>
                                        <CustomSelect field="recepientType" label="Recepient Type*" name="recepientType" getOptionValue={option => option.code} validate={e => this.validateProperty('recepientType', e)} getOptionLabel={option => option.name} options={recepientTypes} onChange={this.handleChange} />
                                    </Col>
                                </Row>
                                <Row>
                                    {
                                        recepientType === 'bulk' &&
                                        <Col sm={6} md={3}>
                                            <CustomSelect field="department" label="Department*" name="department" validate={e => this.validateProperty('department', e)} getOptionValue={option => option.code} getOptionLabel={option => option.name} options={departmentIds} onChange={this.handleChange} />
                                        </Col>
                                    }
                                    {
                                        recepientType === 'bulk' &&
                                        <Col sm={6} md={3}>
                                            <CustomSelect field="batch" validate={e => this.validateProperty('batch', e)} label="Batch*" name="batch" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={batchIds} onChange={this.handleChange} />
                                        </Col>
                                    }
                                    {
                                        recepientType === 'individual' && studentList &&
                                        <Col sm={6} md={3}>
                                            <label>Student Name*</label>
                                            <TestAutoSuggest name="students"  field="students" data={studentList} filterOption="name" getOptionValue={(data) => this.autoSujestValue(data)} validateOnBlur validate={e => this.validateProperty('students', e)} />
                                        </Col>
                                    }
                                    <Col sm={6} md={3}>
                                        <CustomSelect field="template" label="Template*" name="template" getOptionValue={option => option.id} getOptionLabel={option => option.name} options={this.state.categoryType} onChange={this.handleChange} validate={e => this.validateProperty('template', e)} />
                                    </Col>
                                   
                                </Row>
                                {messageType.length > 0 &&
                                <Row>
                               
                                        <Col sm={6} md={12}>
                                            <Textarea field="msg" label="Message" name="msg" />
                                        </Col>
                                          <Col sm={6} md={12}>
                                          <label>CC</label>
                                       <ReactMultiEmail
                                        placeholder="Input your Email Address"
                                        emails={ccemails}
                                        onChange={(_emails: string[]) => {
                                            this.setState({ ccemails: _emails });
                                        }}
                                        getLabel={(
                                            email: string,
                                            index: number,
                                            removeEmail: (index: number) => void
                                        ) => {
                                            return (
                                            <div data-tag key={index}>
                                                {email}
                                                <span data-tag-handle onClick={() => removeEmail(index)}>
                                                ×
                                                </span>
                                            </div>
                                            );
                                        }}
                                        />
                                      </Col>
                                        <Col sm={6} md={12}>
                                        <label>BCC</label>
                                       <ReactMultiEmail
                                        placeholder="Input your Email Address"
                                        emails={bccemails}
                                        onChange={(_emails: string[]) => {
                                            this.setState({ bccemails: _emails });
                                        }}
                                        getLabel={(
                                            email: string,
                                            index: number,
                                            removeEmail: (index: number) => void
                                        ) => {
                                            return (
                                            <div data-tag key={index}>
                                                {email}
                                                <span data-tag-handle onClick={() => removeEmail(index)}>
                                                ×
                                                </span>
                                            </div>
                                            );
                                        }}
                                        />
                                    </Col>
                                 
                                    </Row>
                                       }
                                      
                            </section>
                            <div className="text-right">
                                <button type="submit" id="subbut" className="btn btn-primary btn-sm">Submit</button>
                            </div>

                        </div>
                    )}
                </Form>



            </Fragment >
        )
    }
}