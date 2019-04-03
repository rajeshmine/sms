import Joi from 'joi-browser';
import React, { Fragment, Component } from 'react';
import { Form } from 'informed';
import { Row, Col, } from 'reactstrap';

import { CustomSelect } from 'components/common/forms';
import { getselectData } from 'services/userService'
import ReportList from 'components/reports/list'
import ToastService from 'services/toastService';
import { getfeesDetails, getfeecategory } from 'services/feecollectionService'

export default class FeeReport extends Component {

    constructor(props) {
        super(props)
        this.state = {     
            data: {
                department: '',
                batch: '',
                subject: ''
            },
            clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [],
            isClient: true, isEntity: true, isBranch: true, isDepartment: true, isBatch: true
        }
    }

    schema = {
        department: Joi.string().required().label("Department"),
        client: Joi.string().required().label("Client"),
        entity: Joi.string().required().label("Entity"),
        branch: Joi.string().required().label("Branch"),
        batch: Joi.string().required().label("Batch"),
        category: Joi.string().required().label("Category")
    };

    async componentDidMount() {   

        this.selectoptGet(`clients`, "clientIds")
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


    handleError(...err) {
      
        return ToastService.Toast("Something went Wrong.Please try again later", 'default');
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

    renderReportsForm(type, data) {
        const { rightsData } = this.props;
        return <ReportList type={type} data={data} rightsData={rightsData} />

    }


    handleChange = async ({ currentTarget: Input }) => {
        const { name, value } = Input;
        const { data } = this.state;
        data[name] = value;
        this.setState({
            [name]: value
        }, () => {
            if (this.state.homeworks) {
                this.particularHomework()
            }
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
                this.getCategory()
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



    handleSubmit = async () => {
        const { type } = this.props
        if (type === 'fees') {
            const { data: { client, entity, branch, department, category } } = this.state
            let params = `client=${client}&entity=${entity}&branch=${branch}&departmentId=${department}&feeid=${category}`
            try {
                const feeDetails = await getfeesDetails(params)
                if (feeDetails.data.statusCode === 1) {
                    let fees = feeDetails.data.data
                    await this.setState({
                        fees
                    }, () => { this.viewReport(this.state.fees) })

                } else {
                    return ToastService.Toast("Something went wrong.Please try again later", "default");
                }

            } catch (err) {
                this.handleError(err);
            }

        }
    }

    async  viewReport(data) {
        var feesView = []
        for (let item of data) {
            if (item.feeCollection) {
                const { amount, paidAmount, paidDate, status, fineAmount, remarks } = item.feeCollection[0]

                const { studentId, name } = item
                feesView.push({ "studentId": studentId, "name": name, "amount": amount, "paidAmount": paidAmount, "status": status, "remarks": remarks, "paidDate": paidDate, "fineAmount": fineAmount })
                await this.setState({ feesView: feesView }, () => { })
            } else {
                return ToastService.Toast('No Fee Reports found', 'default')
            }
        }
    }

    async getCategory() {
        var categoriesArray = []
        const { data: { client, batch, entity, department, branch } } = this.state
        let params = `client=${client}&entity=${entity}&branch=${branch}&departmentId=${department}&batchId=${batch}`;
        try {
            const feeCategory = await getfeecategory(params)
            if (feeCategory.data.statusCode === 1) {
                let data = feeCategory.data.data
                for (var i = 0; i < data.length; i++) {
                    categoriesArray.push({ 'name': data[i].category, 'code': data[i]._id })
                }
                await this.setState({
                    allCategories: categoriesArray
                })

            } else {
                return ToastService.Toast("Something went wrong.Please try again later", "default");
            }

        } catch (err) {
            this.handleError(err);
        }
    }





    render() {


        const { action, type } = this.props
        const { clientIds, entityIds, branchIds, departmentIds, batchIds, feesView,
            isClient, isEntity, isBranch, isDepartment, isBatch
        } = this.state;

        return (
            <Fragment>
                <h6>{action} {type} Report</h6>
                <Form getApi={this.setFormApi} onSubmit={this.handleSubmit}  >
                    {({ formApi, formState }) => (
                        <div>
                            <section>
                                <Row>
                                    {isClient && <Col sm={12} md={3}>
                                        <CustomSelect field="client" label="Client" name="client" getOptionValue={option => option.code}
                                            getOptionLabel={option => option.name} options={clientIds}
                                            validateOnBlur validate={e => this.validateProperty('client', e)} onChange={this.handleChange} />
                                    </Col>}
                                    {isEntity && <Col sm={12} md={3}>
                                        <CustomSelect field="entity" label="Entity" name="entity" getOptionValue={option => option.code}
                                            getOptionLabel={option => option.name} options={entityIds}
                                            validateOnBlur validate={e => this.validateProperty('entity', e)} onChange={this.handleChange} />
                                    </Col>}
                                    {isBranch && <Col sm={12} md={3}>
                                        <CustomSelect field="branch" label="Branch" name="branch" getOptionValue={option => option.code}
                                            getOptionLabel={option => option.name} options={branchIds}
                                            validateOnBlur validate={e => this.validateProperty('branch', e)} onChange={this.handleChange} />
                                    </Col>}
                                    {isDepartment && <Col sm={12} md={3}>
                                        <CustomSelect field="department" label="Department" name="department" getOptionValue={option => option.code}
                                            getOptionLabel={option => option.name} options={departmentIds}
                                            validateOnBlur validate={e => this.validateProperty('department', e)} onChange={this.handleChange} />
                                    </Col>}
                                    {isBatch && <Col sm={12} md={3}>
                                        <CustomSelect field="batch" label="Batch" name="batch" getOptionValue={option => option.code}
                                            getOptionLabel={option => option.name} options={batchIds}
                                            validateOnBlur validate={e => this.validateProperty('batch', e)} onChange={this.handleChange} />
                                    </Col>}
                                    <Col sm={12} md={3}>
                                        <CustomSelect field="category" label="Fee Category*" name="category" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={this.state.allCategories} validateOnBlur validate={e => this.validateProperty('category', e)} onChange={this.handleChange} />
                                    </Col>
                                </Row>

                            </section>

                            <div className="text-right">
                                <button type="submit" className="btn btn-primary btn-sm">Submit</button>
                            </div>
                        </div>
                    )}

                </Form>
                {
                    feesView &&
                    this.renderReportsForm(type, feesView)
                }



            </Fragment >
        )
    }
}



