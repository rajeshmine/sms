import 'styles/user-form.scss';
import React, { Component, Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import { Container } from 'reactstrap';
import Header from 'components/common/header';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';
import Loading from 'components/common/loading';
import SideNav from 'components/common/sideNav';
import LeaveForm from 'components/leave/form/form-leave';

export default class Leave extends Component {
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

  renderLeaveForm(actiontype, leaveform) {

    switch (leaveform) {
      case 'leave':
        return <LeaveForm formType={leaveform} actiontype={actiontype} props={this.props} />
      
      default:
        return <LeaveForm formType={leaveform} actiontype={actiontype} props={this.props} />
    }
  }
  
  render() {
    const { isPageLoading, isLoading} = this.state;
  
    const { actiontype, leaveform } = this.props.match.params;
    const { session } = this.props;
    return (
      <Fragment >
        {session && 
        <div className="row no-gutters bg-white page-user">
          <Header props={this.props}/>
          <div className="col-3 col-md-2">
            <SideNav props={this.props}/>
          </div>
          <div className="col-9 col-md-10 p-3 content">
            {isPageLoading && <Loading />}
            {!isPageLoading && !isLoading &&
              <Fragment>
                <Breadcrumb>
                 <BreadcrumbItem><NavLink to="/dashboard">Dashboard</NavLink></BreadcrumbItem> 
                   <BreadcrumbItem><NavLink to='/leave/leave'>Leave</NavLink></BreadcrumbItem>
                 <BreadcrumbItem active>{actiontype}</BreadcrumbItem>
                 <BreadcrumbItem active>{leaveform}</BreadcrumbItem>
               </Breadcrumb>
                <Container fluid> 
                  {this.renderLeaveForm(actiontype, leaveform)}
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



