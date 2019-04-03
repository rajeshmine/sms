
import React, { Component, Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import { Container, Breadcrumb, BreadcrumbItem, } from 'reactstrap';

import 'styles/user-form.scss';
import Static from 'services/static';
import Header from 'components/common/header';
import Loading from 'components/common/loading';
import SideNav from 'components/common/sideNav';
import MailNotification from 'components/notification/form/mailform'
import SmsNotification from 'components/notification/form/smsform'
// import Circular from 'components/circular/form/Circular'
// import Template from 'components/template/form/Template'
import TemplateRoot from 'components/template'

import CircularDataList from 'components/circular'

var classNames = require('classnames');

export default class NotificationForm extends Component {
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

  renderNotificationForm(notificationtype) {
  
    switch (notificationtype) {
      case 'mail':
        return <MailNotification notificationtype={notificationtype}   props={this.props} />
      case 'sms':
        return <SmsNotification notificationtype={notificationtype} props={this.props} />
      case 'circular':
        return <CircularDataList formType={notificationtype}  props={this.props} />
      case 'template':
        return <TemplateRoot formType={notificationtype}   props={this.props} />
      default:
        break;
    }
  }

  render() {
    const { isPageLoading, isLoading } = this.state;
    const { keys: formTypeKeys, order: formTypeOrder } = Static.notificationsFormTypes();
    const { notificationtype} = this.props.match.params;
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
                  <Breadcrumb>
                    <BreadcrumbItem><NavLink to="/dashboard">Dashboard</NavLink></BreadcrumbItem>
                    <BreadcrumbItem><NavLink to={`/notification/sms`}>notification</NavLink></BreadcrumbItem>
                    
                    <BreadcrumbItem active>{notificationtype} </BreadcrumbItem>
                  </Breadcrumb>
                  <Container fluid>
                    <div className="mb-4  subnav-div">
                      {formTypeOrder.map((notificationtype) =>
                        <NavLink key={notificationtype} to={{ pathname: `/notification/${notificationtype}`, query: this.props.location.query }} className={classNames('subnav')} activeClassName="subnav-active" exact={true} >{formTypeKeys[notificationtype]['label']}</NavLink>
                      )}
                    </div>
                    {this.renderNotificationForm(notificationtype)}
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



