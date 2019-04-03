
import 'styles/App.scss';
import 'styles/user-form.scss';
import React, { Component, Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import Static from 'services/static';
import Header from 'components/common/header';
import Loading from 'components/common/loading';
import SideNav from 'components/common/sideNav';
import CommunicationForm from './form-communication';
import LoginForm from 'components/user/form/form-login';
import PersonalForm from 'components/user/form/form-personal';
import RegisterForm from 'components/user/form/form-register';
import OrganizationForm from 'components/user/form/form-organization';
import ExtracurricularForm from 'components/user/form/form-extracurricular';
import EducationForm from 'components/user/form/form-education';
import ParentForm from 'components/user/form/form-parent';
import {
  Breadcrumb,
  BreadcrumbItem,
  Container

} from 'reactstrap';
var classNames = require('classnames');

export default class UserForm extends Component {
  state = {
    cType: "", cId: "",
    user: {},
    parentData: [],
    prefixUrl: "",
    isPageLoading: true,
    isLoading: true,
    clientid: '',
    entityid: '',

  }

  async componentDidMount() {
    await this.init(this.props, true)
  }

  async componentWillReceiveProps(props) {
    await this.init(props, false)
  }

  async init(props, isPageLoading = false) {
    const { uid, formType, clientid, entityid } = props.match.params
    let user = {}
    if (uid !== "new") {
      if (user.email === undefined) {
        user = this.state.user
      } else {
        user = this.state.user
      }
    }
    this.setState({ user: user, uid, clientid, entityid, formType, isPageLoading: false, isLoading: false })
  }

  renderUserForm(uid, formType, clientid, entityid, branch) {
    let data = {
      "clientid": clientid,
      "entityid": entityid,
      "branch": branch
    }
    switch (formType) {
      case 'register':
        return <RegisterForm formType={formType} uid={uid} data={data} props={this.props} />
      case 'login':
        return <LoginForm formType={formType} uid={uid} data={data} props={this.props} />
      case 'communication':
        return <CommunicationForm formType={formType} uid={uid} data={data} props={this.props} />
      case 'personal':
        return <PersonalForm formType={formType} uid={uid} data={data} props={this.props} />
      case 'organization':
        return <OrganizationForm formType={formType} uid={uid} data={data} props={this.props} />
      case 'education':
        return <EducationForm formType={formType} uid={uid} data={data} props={this.props} />
      case 'parent':
        return <ParentForm formType={formType} uid={uid} data={data} props={this.props} />
      case 'other':
        return <ExtracurricularForm formType={formType} uid={uid} data={data} props={this.props} />
      default:
        return <LoginForm formType={formType} uid={uid} data={data} props={this.props} />
    }
  }

  render() {
    const { isPageLoading, isLoading } = this.state;
    const { keys: formTypeKeys, order: formTypeOrder } = Static.userFormTypes();
    const { uid, formType, clientid, entityid, branch } = this.props.match.params
    const { session } = this.props
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
                  <Breadcrumb>
                    <BreadcrumbItem><NavLink to="/dashboard">Dashboard</NavLink></BreadcrumbItem>
                    <BreadcrumbItem><NavLink to="/users">User</NavLink></BreadcrumbItem>
                    <BreadcrumbItem>{uid}</BreadcrumbItem>
                    <BreadcrumbItem active>{formType}</BreadcrumbItem>
                  </Breadcrumb>
                  <Container fluid>
                    <div className="mb-4 subnav-div">
                      {uid === "new" && <NavLink to={{ pathname: `/user/new`, query: this.props.location.query }} className={classNames('subnav', { disabled: uid !== 'new' })} activeClassName="subnav-active" exact={true} >Registration</NavLink>}
                      {formTypeOrder.map((formType) =>
                        uid !== "new" ?
                          <NavLink key={formType} to={{ pathname: `/${clientid}/${entityid}/${branch}/${uid}/edit/${formType}`, query: this.props.location.query }} className={classNames('subnav', { disabled: uid === 'new' })} activeClassName="subnav-active" exact={true} >{formTypeKeys[formType]['label']}</NavLink> : <span className="btn btn-link disabled">{formTypeKeys[formType]['label']}</span>
                      )
                      }
                    </div>
                    {this.renderUserForm(uid, formType, clientid, entityid, branch)}
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



