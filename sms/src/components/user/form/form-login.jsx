import { Input,  } from 'components/common/forms';
import { Form,  } from 'informed';
import Joi from 'joi-browser';
import React, { Component, Fragment } from 'react';
import { Col, Row } from 'reactstrap';
import {  changeUser, getsuserListData } from 'services/userService';
import ToastService from 'services/toastService'


var generator = require('generate-password');


export default class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
    data: {
      userType: "", uid: "", password: "", firstName: "", email: "", mobile: "",
      parentUid: "", parentPassword: "",
      client: "", entity: "", branch: "", department: "", batch: "",
    },
    clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [],
    userTypes: [{ id: "Student", name: "Student" }, { id: "Staff", name: "Staff" }],
    uid: "",
    errors: {},
    isLoading: true
  };
  
    
  }
  

  
  schema = {
    userType: Joi.string().required().label("User Type"),
    uid: Joi.string().required().label("user Id"),
    password: Joi.string().required().label("Password"),
    firstName: Joi.string().required().label("FirstName"),
    email: Joi.string().email().required().label("Email"),
    mobile: Joi.string().min(10).max(10).regex(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/).required().label("Mobile Number"),
    parentUid: Joi.any().optional().label("Parent Id"),
    parentPassword: Joi.any().optional().label("Parent Password"),
  };


  async componentDidMount() {

    const sampleData = await this.getSampleData()
    this.formApi.setValues(sampleData);
  }

  async generatePassword(fieldName) {
    const sampleData = this.formApi.getState().values;
    var password = generator.generate({
      length: 10,
      numbers: true
    });
    sampleData[fieldName] = password
    this.formApi.setValues(sampleData);
  }


  helper = {
    uid: <Fragment>It must be unique id. <b>Ex.</b> Student/Staff registration number</Fragment>,
    password: <div>Generate Password</div>
  }

  getSampleData = async () => {
    const { uid, data } = this.props
    let params = `usersList?uid=${uid}&type=user&client=${data.clientid}&entity=${data.entityid}&branch=${data.branch}`
    const userListData = await getsuserListData(params)
    let userData = userListData.data.data[0]
    this.setState({
      userType: userData.type
    })
    return {
      "client": userData.client,
      "entity": userData.entity,
      "branch": userData.branch,
      "department": userData.department,
      "batch": userData.batch,
      "uid": userData.uid,
      "password": userData.defaultPassword || '',
      "firstName": userData.firstName || '',
      "email": userData.email || '',
      "mobile": userData.mobile || '',
      "parentUid": userData.parentUid || '',
      "parentPassword": userData.defaultparentPassword || '',
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
    let sampleData = {
      "mobile": data.mobile, "email": data.email, "firstName": data.firstName, "department": data.department, "batch": data.batch, "password": data.password, "parentPassword": data.parentPassword
    }
   
    let params = `client=${data.client}&entity=${data.entity}&branch=${data.branch}&uid=${data.uid}`
    const res = await changeUser("login", params, sampleData)
    if (res.data.statusCode === 1) {
      ToastService.Toast(`Login Details Updated Successfully`, "default")
      props.history.push(`/${data.client}/${data.entity}/${data.branch}/${data.uid}/edit/personal`)
    }
    else if (res.data.statusCode === 0)
      ToastService.Toast(res.data.message, "default")
    else
      ToastService.Toast(`Failed to update Login Details`, "default")
  }






  render() {
    const { userType } = this.state
    return (
      <Fragment>
        <Form getApi={this.setFormApi} onSubmit={this.onSubmit}>
          {({ formApi, formState }) => (
            <div>
              <section>
                <h6>Login Credentials</h6>
                <Row>
                  <Col sm={6} md={4}>
                    <Input
                      field="uid" label="User Login Id*" name="uid" helper={this.helper.uid}
                      validateOnBlur validate={e => this.validateProperty('uid', e)} readOnly
                    />

                  </Col>
                  <Col sm={12} md={4}>
                    <Input
                      field="password" label="Password*" name="password"
                      validateOnBlur validate={e => this.validateProperty('password', e)}
                    />
                    <small className="form-text text-muted cursor-pointer" onClick={() => this.generatePassword('password')}>
                      Generate Password
                    </small>
                  </Col>
                </Row>
              </section>
              <section>
                <h6>Personal Details</h6>
                <Row>
                  <Col sm={12} md={4}>
                    <Input
                      field="firstName" label="Name*" name="firstName" helper="First Name"
                      validateOnBlur validate={e => this.validateProperty('firstName', e)}
                    />
                  </Col>
                  <Col sm={12} md={4}>
                    <Input
                      field="email" label="Email ID*" name="email" helper="Primary Email ID for communication"
                      validateOnBlur validate={e => this.validateProperty('email', e)}
                    />
                  </Col>
                  <Col sm={12} md={4}>
                    <Input
                      field="mobile" label="Mobile Number*" name="mobile" helper="Primary Mobile Number for communication"
                      validateOnBlur validate={e => this.validateProperty('mobile', e)}
                    />
                  </Col>
                </Row>
              </section>
              {userType === 'Student' || userType === 'student' ?
                <section>
                  <h6>Parent Credentials</h6>
                  <Row>
                    <Col sm={12} md={4}>
                      <Input
                        field="parentUid" label="Parent Login Id*" name="parentUid"
                        validateOnBlur validate={e => this.validateProperty('parentUid', e)} readOnly
                      />
                    </Col>
                    <Col sm={12} md={4}>
                      <Input
                        field="parentPassword" label="Parent Password*" name="parentPassword"
                        validateOnBlur validate={e => this.validateProperty('parentPassword', e)}
                      />
                      <small className="form-text text-muted cursor-pointer" onClick={() => this.generatePassword('parentPassword')}>
                        Generate Password
                    </small>
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



