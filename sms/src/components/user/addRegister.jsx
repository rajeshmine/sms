import { Input, SimpleAutoSuggest, Textarea, PreviewImage } from 'components/common/forms';
import Header from 'components/common/header';
import Loading from 'components/common/loading';
import SideNav from 'components/common/sideNav';
import { Form, Scope } from 'informed';
import Joi from 'joi-browser';
import React, { Component, Fragment } from 'react';
import { Col, Row } from 'reactstrap';
import logger from 'services/logService';

import Select from "components/common/select";

export default class AddRegister extends Component {
    state = {
        data: {
          userType: "", uid: "", password: "", fname: "", email: "", mobile: "",
          parentUid: "", parentDefaultPassword: "",
          client: "", entity: "", branch: "", department: "", batch: "",
        },
    
        clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [],
    
        uid: "",
        errors: {},
        isLoading: true
      };
    
      constructor(props) {
        super(props);
    
      }


      schema = {
        userType: Joi.string().required(),
        uid: Joi.string().required(),
        password: Joi.string().required(),
        fname: Joi.string().required(),
        email: Joi.string().email().required(),
        mobile: Joi.string().min(10).max(10).regex(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/).required(),
    
        parentUid: Joi.any().optional(),
        parentDefaultPassword: Joi.any().optional(),
    
        client: Joi.any().optional(),
        entity: Joi.any().optional(),
        branch: Joi.any().optional(),
        department: Joi.any().optional(),
        batch: Joi.any().optional()
      };
  
  componentDidMount() {
   
  
  }

  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
   
    return error ? error.details[0].message : null;
};

setFormApi = (formApi) => {
    this.formApi = formApi;
}

onSubmit = () => {
    const data = this.formApi.getState().values;
    logger.log(data)
}
 


  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  renderSelect(name, label, options, optionid = "id", optionname = "name") {
    const { data, errors } = this.state;

    return (
      <Select
        name={name}
        value={data[name]}
        label={label}
        options={options}
        optionid={optionid}
        optionname={optionname}
        onChange={this.handleChange}
        error={errors[name]}
        helper={this.helper && this.helper[name] || null}
      />
    );
  }
  render() {
    const { isLoading, errors, data: { uid, userType, defaultPassword },clientIds,entityIds, branchIds, departmentIds, batchIds } = this.state;
    // const { clients, entities, branches, departments, batches }
    

    return (
      
                     
                            <Fragment>
                                <h6>New User</h6>
                                <Form getApi={this.setFormApi} onSubmit={this.onSubmit}>
                                    {({ formApi, formState }) => (
                                        <div>
                                            <section>
                                                <Row>
                                                    <Col sm={6} md={4}>
                                                    <label>User Type</label>
                                                    <select field="userType"  class="form-control" type="select"
                                                            name="userType"
                                                            value={this.state.type}
                                                            id="userType"
                                                            onChange={e => this.handleChange(e)}>
                                                        <option value="" selected disabled> Select</option>
                                                            <option value="staff">Staff</option>
                                                            <option value="student">Student</option>
                                                    </select>
                                                       
                                                       
                                                    </Col>
                                                    <Col sm={6} md={4}>
                                                        <Input
                                                            field="uid" label="User Login Id*"
                                                            validateOnBlur validate={e => this.validateProperty('uid', e)}
                                                        />
                                                    </Col>
                                                    <Col sm={12} md={4}>
                                                        <Input
                                                            field="password" label="Default Password*"
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
                                                            field="fname" label="Name*"
                                                            validateOnBlur validate={e => this.validateProperty('fname', e)}
                                                        />
                                                    </Col>
                                                    <Col sm={12} md={4}>
                                                        <Input
                                                            field="email" label="Email*"
                                                            validateOnBlur validate={e => this.validateProperty('email', e)}
                                                        />
                                                    </Col>
                                                    <Col sm={12} md={4}>
                                                        <Input
                                                            field="mobile" label="Mobile*"
                                                            validateOnBlur validate={e => this.validateProperty('mobile', e)}
                                                        />
                                                    </Col>
                                                </Row>
                                            </section>
                                            {this.state.userType === 'staff' || this.state.userType === 'student' ?
                                            <section>
                                                <h6>Client Details</h6>
                                                <Row>
                                                    <Col sm={12} md={3}>
                                                    {this.renderSelect("client", "Client", clientIds, "instituteCode", "instituteName")}
                                                    </Col>
                                                    <Col sm={12} md={3}>
                                                    {this.renderSelect("entity", "Entity", clientIds, "instituteCode", "instituteName")}
                                                    </Col>
                                                    <Col sm={12} md={3}>
                                                    {this.renderSelect("branch", "Branch", clientIds, "instituteCode", "instituteName")}
                                                    </Col>
                                                    <Col sm={12} md={3}>
                                                    {this.renderSelect("department", "department", clientIds, "instituteCode", "instituteName")}
                                                    </Col>
                                                    <Col sm={12} md={3}>
                                                    {this.renderSelect("batch", "Batch", clientIds, "instituteCode", "instituteName")}
                                                    </Col>
                                                </Row>
                                            </section> : null
                                            }
                                            {this.state.userType === 'student' ?
                                            <section>
                                                <h6>Parent Details</h6>
                                                <Row>
                                                    <Col sm={12} md={4}>
                                                        <Input
                                                            field="parentUid" label="Parent Login Id*"
                                                            validateOnBlur validate={e => this.validateProperty('parentUid', e)}
                                                        />
                                                    </Col>
                                                    <Col sm={12} md={4}>
                                                        <Input
                                                            field="parentDefaultPassword" label="Default Password*"
                                                            validateOnBlur validate={e => this.validateProperty('parentDefaultPassword', e)}
                                                        />
                                                    </Col>
                                                    
                                                </Row>
                                            </section>
                                            :null}
                                            <button type="submit" className="btn btn-primary btn-sm">Submit</button>
                                           
                                        </div>
                                    )}
                                </Form>
                            </Fragment>
                      
                    
    );
  }
}



