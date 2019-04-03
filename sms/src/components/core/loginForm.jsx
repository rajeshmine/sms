
import Joi from 'joi-browser';
import React, { Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import { Alert, FormGroup } from 'reactstrap';

import auth from 'services/authService';
import Form from 'components/common/form';
import Loading from 'components/common/loading';
// import Logo from 'components/common/logo';


class Login extends Form {

  state = {
    data: { username: "444", password: "123", ref: '', next: '' },
    errors: {},
    isLoading: false
  };

  schema = {
    username: Joi.string().required().label("Email/UserId"),
    password: Joi.string().required().label("Password"),
    ref: Joi.string().empty('').optional(),
    next: Joi.string().empty('').optional()
  };

  doSubmit = async () => {
    try {
      this.setState({ isLoading: true, errors: {} })
      const { data } = this.state;
      const result = await auth.login(data.username, data.password, data.ref, data.next);

      let role = result && result.data && result.data.role;
      let uid = result && result.data && result.data.uid;

      if (role === "sadmin") {
        window.location = `/dashboard`
      } else {
        if (uid)
          window.location = `/${uid}/profile`
        else
          window.location = `/dashboard`
      }
      //window.location = `/dashboard`
    } catch (ex) {
      this.setState({ isLoading: false })
      if (ex.response && ex.response.data) {
        const errors = { ...this.state.errors, ...ex.response.data };
        this.setState({ errors });
      } else {
        const errors = { ...this.state.errors, 'message': "Sorry some error occurred. Please try again", 'class': 'danger' };
        this.setState({ errors });
      }
    }
  };

  render() {
    const { isLoading, errors } = this.state;
    return (
      <Fragment>
        <div className="page-login page-login-bg">
          <div className="container d-flex justify-content-center align-item-center vertical-center">
            <div className="col-sm-10 col-md-4 bg-white p-4 logindivbg">
              <div className="text-center">
                {/* <Logo className="d-block" /> */}
                <label className="loginacctxt">Login to access your account</label>
                <div>
                  <img alt="" className="loginavatar" src="https://cdn4.iconfinder.com/data/icons/men-avatars-icons-set-1/256/6-512.png" />
                </div>
                
              </div>
              <form className="form-container form-container--login" onSubmit={this.handleSubmit}>
                {this.renderInput("username", "UserId / Email *")}
                {this.renderInput("password", "Password *", "password")}
                <FormGroup className="d-flex font-13" >
                  <NavLink to="/forgotpassword" key="Hello">Forgot Password?</NavLink>
                </FormGroup>
                <div className="d-block my-md-3 text-right">
                  {this.renderButton(isLoading ? <Loading color='white' /> : 'Login', 'submit', 'btn btn-primary loginbtn font-13')}
                </div>
                {errors && errors.message &&
                  <Alert color={errors.class}>
                    {errors.message}
                  </Alert>
                }
              </form>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default Login;