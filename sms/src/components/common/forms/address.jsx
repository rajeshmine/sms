import { Input, SimpleAutoSuggest } from 'components/common/forms';
import { Scope } from 'informed';
import Joi from 'joi-browser';
import React, { Component, Fragment } from 'react';
import { Col, Row } from 'reactstrap';

export const addressSchema = {

    no: Joi.string().empty('').optional(),
    street: Joi.string().empty('').optional(),
    address1: Joi.string().required().label("Address Line 1"),
    address2: Joi.string().empty('').optional(),
    // city: Joi.object(this.optionSchema).label("City"),
    //    state: Joi.object(this.optionSchema).label("State"),
    // country: Joi.object(this.optionSchema).label("Country"),
    city: Joi.string().required().label("City"),
    state: Joi.object().required().label("State"),
    country: Joi.string().required().label("Country"),
    pincode: Joi.number().required().label("Pin code"),
    email: Joi.string().required().label("Email ID"),
    contactno: Joi.string().required().label("Contact Number"),
    fax: Joi.string().empty('').optional()
}

export class AddressComponent extends Component {
    render() {
        const { scope, validateProperty, ...rest } = this.props;
        return <Fragment>
            <Scope scope={scope}>
                <Row>
                    <Col sm={12} md={3}>
                        <Input label="No" field="no" validateOnBlur validate={e => validateProperty(`${scope}.no`, e)} {...rest} />
                    </Col>
                    <Col sm={12} md={9}>
                        <Input label="Street" field="street" validateOnBlur validate={e => validateProperty(`${scope}.street`, e)} {...rest} />
                    </Col>
                </Row>
                <Input label="Address Line 1*" field="address1" validateOnBlur validate={e => this.props.validateProperty(`${scope}.address1`, e)} {...rest} />
                <Input label="Address Line 2" field="address2" validateOnBlur validate={e => this.props.validateProperty(`${scope}.address2`, e)} {...rest} />
                <Row>
                    <Col sm={12} md={6}>
                        {/* <SimpleAutoSuggest label="City" field="city" suggestType="city" validateOnBlur validate={e => validateProperty(`${scope}.city`, e)} /> */}
                        <Input label="City*" field="city" validateOnBlur validate={e => this.props.validateProperty(`${scope}.city`, e)} {...rest} />
                    </Col>
                    <Col sm={12} md={4}>
                        <SimpleAutoSuggest label="State*" field="state" suggestType="state" getOptionValue={(option) => (option['label'])} validateOnBlur validate={e => validateProperty(`${scope}.state`, e)} {...rest} />
                    </Col>
                    <Col sm={12} md={2}>
                        <Input label="Pin Code*" field="pincode" validateOnBlur validate={e => validateProperty(`${scope}.pincode`, e)} {...rest} />
                    </Col>

                </Row>
            </Scope>
        </Fragment>
    }
}