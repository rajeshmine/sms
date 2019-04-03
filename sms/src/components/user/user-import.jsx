import React from 'react';
import { Component, Fragment } from 'react';
import { Input, PreviewImage, Textarea, SimpleAutoSuggest } from 'components/common/forms';
import { Row, Col } from 'reactstrap';
import Loading from 'components/common/loading';
import Joi from 'joi-browser';
import { Form, Scope } from 'informed';




class UserImport extends Component {

    state = {
        data: [{
            "name": "ACE",
            "code": "ace"
        },
        {
            "name": "PMC",
            "code": "pmc"
        }
        ],
        errors: {}
    }

    validateProperty = ({ name, value }) => {
        const obj = { [name]: value };
        const schema = { [name]: this.schema[name] };
        const { error } = Joi.validate(obj, schema);
        return error ? error.details[0].message : null;
    };

    handleChange = ({ currentTarget: input }) => {
        const errors = { ...this.state.errors };
        const errorMessage = this.validateProperty(input);
        if (errorMessage) errors[input.name] = errorMessage;
        else delete errors[input.name];

        const data = { ...this.state.data };
        data[input.name] = input.value;

        this.setState({ data, errors });
    };


    render() {

        const { isPageLoading } = this.state;
        const { session } = this.props;
      
        return (
            <Fragment>
                <div className="row">
                    <div className="col-8 col-md-8">
                        <h6>Upload Users</h6>

                        <Form>
                            {({ formApi, formState }) => (
                                <div>
                                    <section>
                                        <h6>Client</h6>
                                        <Row>
                                            <Col sm={6} md={4} >
                                                <Input
                                                    field="client"
                                                    label="Name of the Client"
                                                    validateOnBlur
                                                    validate={e => this.validateProperty('name', e)}
                                                />
                                            </Col>
                                            {/* <SimpleAutoSuggest label='Client' field='clientCode' suggestType='client' getOptionValue={(option)=>(option['name'])} /> */}
                                        </Row>
                                    </section>
                                </div>
                            )}

                        </Form>


                    </div>
                </div>

            </Fragment>
        );
    }
}

export default UserImport;