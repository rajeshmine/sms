import React, { Component } from 'react';
import { Col, Row, Button, FormGroup, Container } from 'reactstrap';
import { ClipLoader } from 'react-spinners';
import Joi from 'joi-browser';
import { Form } from 'informed';
import ToastService from 'services/toastService'
import { Input } from 'components/common/forms';

import Service from 'services/service';

import { forgotPassword, otpValidate, passwordUpdate } from 'services/authService'



import Logo from 'components/common/logo';

class ForgotForm extends Component {

  constructor(props) {
   
    super(props);
    this.state = {

      data: {},

      isReadonly: false,
      isFeildVisible: false,
      isEmailValid: false,
      isOTPValid: false,
      isLoading: false,
      btnName: 'Next',


    }

  }

  schema = {
    uid: Joi.string().required(),
    otp: Joi.string().required(),
    newPsw: Joi.string().required(),
    confirmPsw: Joi.string().required(),

  }
  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };

  handleChange = async ({ currentTarget: Input }) => {
    const { name, value } = Input;
    const { data } = this.state;
    data[name] = value;
    await this.setState({ data, [name]: value })
    await this.formApi.setValues(data);
  }

  setFormApi = (formApi) => {
    this.formApi = formApi;
  }


  onSubmit = async () => {
    const { isEmailValid, isOTPValid } = this.state;
    this.setState({ isLoading: true });
    if (!isEmailValid) return this.forgotPassword();
    if (!isOTPValid && isEmailValid) return this.otpValidation();
    if (isEmailValid) return this.updatePassword();
  }

  forgotPassword = async () => {
    const data = await this.formApi.getState().values;
    const { uid } = data;
    let params = `uid=${uid}`;
    try {
      let res = await forgotPassword(params)
      const { data: { statusCode } } = res;
   
      if (statusCode) {
        await this.setState({ isEmailValid: true })
      } else if (!statusCode) {
        ToastService.Toast("Please chech your uid / email", "default");
        Service.showAlert("Please check your uid / email", '', 'Failed');
      }
      await this.setState({ isReadonly: true, isLoading: false })
    } catch (err) {
      this.handleError(err)
    }
  }

  otpValidation = async () => {
    const data = await this.formApi.getState().values;
    const { uid, otp } = data;
    let params = `uid=${uid}&otp=${otp}`;
    try {
      let res = await otpValidate(params)
     
      const { data: { statusCode } } = res;
      if (statusCode) {
        await this.setState({ isOTPValid: true, isFeildVisible: true, })
      } else if (!statusCode) {
        ToastService.Toast("Please check your OTP", "default");
        Service.showAlert("Please check your OTP", '', 'Failed');
      }
      await this.setState({ btnName: 'Change Password', isLoading: false })
    } catch (err) {
      this.handleError(err)
    }
  }

  updatePassword = async () => {
    const data = await this.formApi.getState().values;
    const { uid, newPsw, confirmPsw } = data;
    let params = `uid=${uid}&newPassword=${newPsw}&confirmPassword=${confirmPsw}`;
    try {
      let res = await passwordUpdate(params)
    
      const { data: { statusCode } } = res;
      if (statusCode) {
        await this.setState({ isOTPValid: true, isFeildVisible: true, })
        await Service.showAlert("Password changed successfully", '', 'Success');

        this.props.history.push('/');
      } else if (!statusCode) {
        ToastService.Toast("Password does not match", "default");
        Service.showAlert("Password does not match", '', 'Failed');
      }
      await this.setState({ btnName: 'Next', isLoading: false })

    } catch (err) {
      this.handleError(err)
    }
  }


  handleError = (...err) => {
  
  }

  render() {
    const { isEmailValid, isOTPValid, isFeildVisible, btnName, isLoading } = this.state;
    return (
      <Container fluid>
        <Row >
          <Col sm="12" >
            <div className="flexdiv d-flex align-items-center flex-column justify-content-center" style={{ minHeight: '100vh' }}>
              <div className="d-flex align-items-center flex-column justify-content-center bg-white customdiv" style={{ padding: '20px' }}>
                <Logo className="d-block text-center" />
                <label>Enter credentials to change your password</label>
                <Form getApi={this.setFormApi} onSubmit={this.onSubmit} style={{ width: '100%' }} >
                  <Input
                    field="uid" label="email Id / uid"
                    validateOnBlur validate={e => this.validateProperty('uid', e)} readOnly={isEmailValid} />
                  {isEmailValid && !isOTPValid && <Input
                    field="otp" label="OTP"
                    validateOnBlur validate={e => this.validateProperty('otp', e)} />
                  }
                  {isFeildVisible && <div>
                    <Input
                      field="newPsw" label="Password"
                      validateOnBlur validate={e => this.validateProperty('newPsw', e)} />

                    <Input
                      field="confirmPsw" label="Confirm Password"
                      validateOnBlur validate={e => this.validateProperty('confirmPsw', e)} />

                  </div>
                  }

                  <FormGroup className="text-center" >
                    <Button color="primary" type="submit" disabled={isLoading} style={{ width: '100% ' }}>
                      {!isLoading ? btnName : <ClipLoader
                        className="override"
                        sizeUnit={"px"}
                        size={25}
                        color={'#ffffff'}
                        loading={isLoading}
                      />}

                    </Button>
                  </FormGroup>
                </Form>
              </div>
            </div>
          </Col>

        </Row>
      </Container >
    );
  }
}

export default ForgotForm;
