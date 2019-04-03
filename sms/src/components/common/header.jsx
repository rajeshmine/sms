import React, { Fragment } from 'react';
import * as FAIcons from 'react-icons/fa';
import { Link } from 'react-router-dom';
import {
  Collapse, DropdownItem, DropdownMenu, DropdownToggle, Nav, Navbar,
  NavbarBrand, NavbarToggler, NavItem, NavLink, UncontrolledDropdown, Container,  Modal, ModalBody, ModalHeader, FormGroup, Button,
} from 'reactstrap';
import { ClipLoader } from 'react-spinners';
import Joi from 'joi-browser';
import { Form } from 'informed';
import { Input } from 'components/common/forms';
import { notificationList } from 'services/DashboardService';
import _ from 'lodash';
import ToastService from 'services/toastService'
import { passwordValidate, passwordUpdate } from 'services/authService'

import Logo from './logo';

var $ = require('jquery');

export default class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      isFeildVisible: false,
      isLoading: false,
      btnName: 'Next',

      isOpen: false,
      isNotifyDiv: false
    };
  }

  componentDidMount = async () => {
    this.notificationList();
  }



  schema = {
    password: Joi.string().required(),
    newPassword: Joi.string().required(),
    confirmPassword: Joi.string().required(),
  };


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

  toggle = async () => {

    await this.setState({
      isOpen: !this.state.isOpen, isFeildVisible: false, isLoading: false,
    });
  }

  togglesidebar = () => {
    $(".sidemenu").toggleClass("mobilesidenav");
  }

  // Notification Bar
  toggleNotificationBar = async () => {
    await this.setState({ isNotifyDiv: !this.state.isNotifyDiv })
  }

  notificationList = async () => {
     
    const { session: { uid, data: { client, entity, branch } } } = this.props.props;
    let params = `client=${client}&entity=${entity}&branch=${branch}&uid=${uid}`;
    
    try {
      let res = await notificationList(params)
      const { statusCode } = res.data;
      
      if (statusCode === 1)
        return await this.setState({ data: res.data.data })
      await this.setState({ data: [] })

    } catch (err) {
       
    }
  }

  notificationData = () => {
    const { data } = this.state;
    if (data.length === 0)
      return <img src='/assets/images/notification.png' alt="" style={{ width: '100%' }} />
    return _.map(data, v => {
      return <div className="notify-block">
        <p className="info">{v["name"]} <span>({v["from"]})</span></p>
        <p className="msg-body">{v["body"]}</p>
      </div>
    });
  }


  onSubmit = async () => {
    const { isFeildVisible } = this.state;
    this.setState({ isLoading: true });
    if (!isFeildVisible) return this.passwordValidate();
    if (isFeildVisible) return this.updatePassword();
  }

  passwordValidate = async () => {
    
    const { session: { uid } } = this.props.props;
    const data = await this.formApi.getState().values;
    const { password } = data;
    let params = `uid=${uid}&password=${password}`;
    try {
      let res = await passwordValidate(params)
     
      const { data: { statusCode } } = res;
      if (statusCode) {
        await this.setState({ isFeildVisible: true })
      } else if (!statusCode) {
        ToastService.Toast("Please check your old password", "default");
      }
      await this.setState({ btnName: 'Change Password', isLoading: false })
    } catch (err) {
      this.handleError(err)
    }
  }


  updatePassword = async () => {
    const { session: { uid } } = this.props.props;
    const data = await this.formApi.getState().values;
    const { newPassword, confirmPassword } = data;
    let params = `uid=${uid}&newPassword=${newPassword}&confirmPassword=${confirmPassword}`;
    try {
      let res = await passwordUpdate(params)
      
      const { data: { statusCode } } = res;
      if (statusCode) {
        await this.setState({ isFeildVisible: false })
        await ToastService.Toast("Password changed successfully", "default");
        await this.toggle()
      } else if (!statusCode) {
        ToastService.Toast("Password does not match", "default");
      }
      await this.setState({ btnName: 'Next', isLoading: false })

    } catch (err) {
      this.handleError(err)
    }
  }

  render() {
    const { isNotifyDiv, isLoading, btnName, isOpen, isFeildVisible } = this.state
    const { session } = this.props.props;
    
    let name = '', userType = session && session.data && session.data.userType, profileImageUrl = '', logoUrl = "";
    switch (userType) {
      case "sadmin":
        name = session && session.data && session.data.instituteName;
      
        break;
      case "client":
        name = session && session.data && session.data.name;
        logoUrl = session && session.data && session.data.clientLogo;
       
        break;
      case "entity":
        name = session && session.data && session.data.name;
        logoUrl = session && session.data && session.data.entityLogo;
        
        break;
      default:
        name = session && session.data && session.data.entityName;
        logoUrl = session && session.data && session.data.entityLogo;
        
        break;
    }
    if (session && session.data) {
      let basicData = session.data.basic && session.data.basic[0];
      if (basicData && basicData.profileImageUrl !== '' && basicData.profileImageUrl) {
        profileImageUrl = basicData.profileImageUrl
      } else {
        profileImageUrl = 'https://raw.githubusercontent.com/azouaoui-med/pro-sidebar-template/gh-pages/src/img/user.jpg'
      }
    }   
  
    return (
      <Fragment>
        <Navbar expand="md" className="bg-white nav-eco" >
          <NavbarToggler onClick={this.togglesidebar} className="mr-2">
            <FAIcons.FaBars />
          </NavbarToggler>
          <NavbarBrand href='/dashboard' className="">
            <Logo className="menulogostyle" logoUrl={logoUrl} />
            <span>{name}</span></NavbarBrand>
          <Collapse isOpen={false} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem>
                <NavLink href="#" onClick={this.toggleNotificationBar}> <FAIcons.FaBell /></NavLink>
              </NavItem>
              {session && session.uid &&
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav className="username">
                   <div className="profilePic" style={{ backgroundImage: `url(${profileImageUrl})` }}></div>
                   
                  </DropdownToggle>
                  <DropdownMenu right>
                    <Link to="/dashboard">
                      <DropdownItem>
                        User ID :{session.uid}
                      </DropdownItem>
                    </Link>
                    <DropdownItem divider />
                    <DropdownItem>
                      <Link to={`/${session.uid}/profile`}> Profile</Link>
                    </DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem>
                      <Link to="#" onClick={this.toggle}> Change Password</Link>
                    </DropdownItem>
                    <DropdownItem divider />
                    <Link to="/">
                      <DropdownItem onClick={(e) => { localStorage.clear() }}>
                        Logout
                    </DropdownItem>
                    </Link>
                  </DropdownMenu>
                </UncontrolledDropdown>
              }
            </Nav>
          </Collapse>
        </Navbar>
        {
          isNotifyDiv &&
          <div className="notification-div">
            {this.notificationData()}
          </div>
        }

        <Modal isOpen={isOpen} toggle={this.toggle} className={this.props.className} size={this.state.modalsize}>
          <ModalHeader toggle={this.toggle}>Change Password</ModalHeader>
          <ModalBody>
            <Container>
              <Form getApi={this.setFormApi} onSubmit={this.onSubmit} style={{ width: '100%' }} >
                <Input
                  field="password" label="Old Password" type="password"
                  validateOnBlur validate={e => this.validateProperty('password', e)} readOnly={isFeildVisible} />

                {isFeildVisible && <div>
                  <Input
                    field="newPassword" label="New Password" type="password"
                    validateOnBlur validate={e => this.validateProperty('newPassword', e)} />
                  <Input
                    field="confirmPassword" label="Confirm Password" type="password"
                    validateOnBlur validate={e => this.validateProperty('confirmPassword', e)} />
                </div>}

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
            </Container>
          </ModalBody>
        </Modal>
      </Fragment>

    )
  }
}
