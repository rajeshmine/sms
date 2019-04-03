import React, { Fragment, Component } from 'react';
import Joi from 'joi-browser';
import { Col, Row } from 'reactstrap';
import { Form, Scope } from 'informed';

import { Input, CustomSelect } from 'components/common/forms';
import {  saveUser, getsuserListData } from 'services/userService';
import ToastService from 'services/toastService'


export default class ParentForm extends Component {
    state = {
        data: {
            relationship: '', fullName: '', email: '', occupation: '', income: '', contactNo: '',
            parentDetails: [],
        },
        client: "", entity: "", branch: "", department: "", batch: "",
        relationship: [{ id: "Mother", name: "Mother" }, { id: "Father", name: "Father" }, { id: "Guardian", name: "Guardian" }],
        uid: "",
        count: 1,
        errors: {},
    };

    // email: Joi.string().email().required(),
    // mobile: Joi.string().min(10).max(10).regex(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/).required(),
    shortParentSchema = {
        relationship: Joi.string().required(),
        fullName: Joi.string().required(),
        email: Joi.string().email().required().label('Email ID'),
        occupation: Joi.string().required(),
        income: Joi.string().required(),
        contactNo: Joi.string().required(),
    }

    schema = {
        relationship: Joi.string().required().label('Relationship'),
        fullName: Joi.string().required().label('Full Name'),
        email: Joi.string().email().required().label('Email ID'),
        occupation: Joi.string().required().label('Occupation'),
        income: Joi.string().required().label('Income'),
        contactNo: Joi.string().min(10).max(10).regex(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/).required().label('Contact Number'),
        parentDetails: Joi.array().items(Joi.object(this.shortParentSchema)),
    }

    async componentDidMount() {

        const sampleData = await this.getSampleData();
        if (sampleData['parent']) {
            sampleData['parentDetails'] = sampleData['parent']
        } else {
            sampleData['parentDetails'] = [{ relationship: '', fullName: '', email: '', occupation: '', income: '', contactNo: '' }]
        }


        this.formApi.setValues(sampleData);
    }

    getSampleData = async () => {
        const { uid, data } = this.props
        let params = `usersList?uid=${uid}&type=user&client=${data.clientid}&entity=${data.entityid}&branch=${data.branch}`
      
        const userListData = await getsuserListData(params)
      
        if (userListData && userListData.data.statusCode === 1) {
            let userData = userListData.data.data[0]
            this.setState({
                client: userData.client,
                entity: userData.entity,
                branch: userData.branch,
                department: userData.department,
                batch: userData.batch,
                uid: userData.uid
            })
            return userData
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

    addRelation = async (relationship, fullName, email, occupation, income, contactNo) => {
        if (this.state.count <= 2) {
            this.state.count = this.state.count + 1;
            const data = { relationship, fullName, email, occupation, income, contactNo };
            const values = this.formApi.getState().values;
            var parentDetails = values.parentDetails;
            parentDetails.push(data)
            this.formApi.setValues({ ...values, parentDetails: parentDetails });
        }
    }

    removeRelation = async (i) => {
        const values = this.formApi.getState().values;
        let parentDetails = values.parentDetails;
        parentDetails.splice(i, 1);
        this.formApi.setValues({ ...values, parentDetails: parentDetails });
        await this.setState({
            count: this.state.count - 1
        }) 
    }

    onSubmit = async () => {
        const { props } = this.props
        const data = this.formApi.getState().values;
        let params = `client=${data.client}&entity=${data.entity}&branch=${data.branch}&uid=${data.uid}`
        let parentDetails = { "parentDetails": data.parentDetails }
        const res = await saveUser("parent", params, parentDetails)
        if (res.data.statusCode === 1) {
            ToastService.Toast(`Parent Details Updated Successfully`, "default")
            props.history.push(`/${data.client}/${data.entity}/${data.branch}/${data.uid}/edit/other`)
        }
        else if (res.data.statusCode === 0)
            ToastService.Toast(res.data.message, "default")
        else
            ToastService.Toast(`Failed to update Parent Details `, "default")


    }


    render() {
        return (
            <Fragment>
                <div className="content">
                    <Form getApi={this.setFormApi} onSubmit={this.onSubmit}>
                        {({ formApi, formState }) => (
                            <div>

                                <section>
                                    <h6>Parent Details</h6>
                                    <Row className="justify-content-end">
                                        <button className="btn btn-link btn-sm" type="button"
                                            onClick={() => this.addRelation('', '', '', '', '', '')}
                                        >+ Add Parent Details</button>
                                    </Row>
                                    {formState.values.parentDetails && formState.values.parentDetails.map((parentDetails, i) =>
                                        <Scope scope={`parentDetails[${i}]`} key={i}>
                                            <Row>
                                                <Col sm={12} md={4}>
                                                    <CustomSelect field="relationship" label="Relationship Type*" name="relationship" getOptionValue={option => option.id} getOptionLabel={option => option.name} options={this.state.relationship} validateOnBlur validate={e => this.validateProperty('relationship', e)} />
                                                </Col>
                                                <Col sm={12} md={4}>
                                                    <Input field="fullName" label="Full Name*"
                                                        validateOnBlur validate={e => this.validateProperty('fullName', e)} />
                                                </Col>
                                                <Col sm={12} md={4}>
                                                    <Input field="email" label="Email Id*"
                                                        validateOnBlur validate={e => this.validateProperty('email', e)} />
                                                </Col>
                                                <Col sm={12} md={4}>
                                                    <Input field="occupation" label="Occupation *"
                                                        validateOnBlur validate={e => this.validateProperty('occupation', e)} />
                                                </Col>
                                                <Col sm={12} md={4}>
                                                    <Input field="income" label="Income*"
                                                        validateOnBlur validate={e => this.validateProperty('income', e)} />
                                                </Col>
                                                <Col sm={12} md={4}>
                                                    <Input field="contactNo" label="Contact Number*"
                                                        validateOnBlur validate={e => this.validateProperty('contactNo', e)} />
                                                </Col>
                                                {
                                                    formState.values.parentDetails.length > 1 && i !== 0 ?
                                                        <Col sm={12}><button onClick={() => this.removeRelation(i)} className="btn btn-link btn-sm">Remove</button>
                                                        </Col> : ''
                                                }
                                            </Row>
                                        </Scope>
                                    )}
                                </section>
                                <div className="text-right">
                                    <button type="submit" className="btn btn-primary btn-sm">Save & Next</button>
                                </div>

                            </div>
                        )}
                    </Form>
                </div>
            </Fragment>
        );
    }
}



