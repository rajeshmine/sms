
import 'styles/user-form.scss';
import React, { Component, Fragment } from 'react';
import { Container } from 'reactstrap';
import Header from 'components/common/header';
import Loading from 'components/common/loading';
import SideNav from 'components/common/sideNav';
import { Form } from 'informed';
import { Col, Row } from 'reactstrap';
import { CustomSelect, } from 'components/common/forms';
// import { getParticularType } from '../../services/settingsService'
import StaffAllocationList from 'components/staffallocation/list'
import Joi from 'joi-browser';
import { getselectData } from 'services/userService'
import { getStaffAllocList, } from 'services/staffAllocationService';

import ToastService from 'services/toastService';


export default class StaffAllocation extends Component {
    state = {
        cType: "", cId: "",
        user: {},

        parentData: [],
        prefixUrl: "",
        isPageLoading: false,
        isLoading: false,
        clientIds: [], entityIds: [], branchIds: [],
        data: {
            department: '',
            batch: '',
            client: '',
            entity: '',
            branch: '',
            homeworks: '',
            subject: ''
        },
    }

    async componentDidMount() {
        await this.init(this.props, true)
        this.selectoptGet(`clients`, "clientIds")
        const { data } = this.state
        this.formApi.setValues(data);
    }

    async componentWillReceiveProps(props) {
        await this.init(props, false)
    }

    async init(props, isPageLoading = false) {

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
        department: Joi.string().required().label("Department"),
        client: Joi.string().required().label("Client"),
        entity: Joi.string().required().label("Entity"),
        branch: Joi.string().required().label("Branch"),
        batch: Joi.string().required().label("Batch"),
        subject: Joi.string().required().label("Subject"),
        homeworks: Joi.string().required().label("Topic"),

        period: Joi.string().required().label("Period"),
        dob: Joi.string().required(),
    };

    dateValue = (date) => {
        let selectDate = date._d.toISOString().slice(0, 10)
        this.setState({
            dob: date
        })
        const data = this.formApi.getState().values;
        data.dob = selectDate
        this.formApi.setValues(data);
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

    onSubmit = async () => {
        const { data: { client, batch, entity, department, branch } } = this.state
        let params = `client=${client}&entity=${entity}&branch=${branch}&department=${department}&batch=${batch}`;
        try {
            const res = await getStaffAllocList(params)
            const { data: { statusCode } } = res;

            if (statusCode === 1) {
                await this.setState({ staffData: res.data.data })
            } else {
                return ToastService.Toast("Somthig went wrong.Please try again later", "default");
            }
        } catch (err) {
            this.handleError(err);
        }
    }

    renderUserForm(data) {
        return <StaffAllocationList data={data} props={this.props} />
    }

    render() {
        const { isPageLoading, isLoading,  clientIds, entityIds, branchIds, departmentIds, batchIds,  } = this.state;
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
                                    <Container fluid>
                                        <h6>Staff Allocation</h6>
                                        <Form getApi={this.setFormApi} onSubmit={this.onSubmit} >
                                            {({ formApi, formState }) => (
                                                <div>
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
                                                                <CustomSelect field="department" label="Department*" name="department" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={departmentIds} validateOnBlur validate={e => this.validateProperty('department', e)} onChange={this.handleChange} />
                                                            </Col>
                                                        </Row>
                                                        <Row>

                                                            <Col sm={6} md={3}>
                                                                <CustomSelect field="batch" label="Batch*" name="batch" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={batchIds} validateOnBlur validate={e => this.validateProperty('batch', e)} onChange={this.handleChange} />
                                                            </Col>


                                                        </Row>

                                                        <Row>
                                                            <Col md={12} className="d-flex justify-content-end">
                                                                <button type="submit" className="btn btn-primary btn-sm">Submit</button>
                                                            </Col>
                                                        </Row>

                                                    </section>

                                                </div>
                                            )}
                                        </Form>
                                        {this.state.staffData &&
                                            this.renderUserForm(this.state.staffData)
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

