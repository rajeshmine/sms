import 'styles/user-form.scss';
import React, { Component, Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import { Container } from 'reactstrap';
import Header from 'components/common/header';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';
import Loading from 'components/common/loading';
import SideNav from 'components/common/sideNav';
import AttendanceForm from 'components/attendance/form/form-attendance';
import HolidayForm from 'components/attendance/form/form-holiday';

export default class Attendance extends Component {
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

  renderAttendanceForm(actiontype, attendanceform) {

    switch (attendanceform) {
      case 'attendance':
        return <AttendanceForm formType={attendanceform} actiontype={actiontype} props={this.props} />
      case 'holiday':
        return <HolidayForm formType={attendanceform} actiontype={actiontype} props={this.props} /> 

      
      default:
        return <AttendanceForm formType={attendanceform} actiontype={actiontype} props={this.props} />
    }
  }
  
  render() {
    const { isPageLoading, isLoading} = this.state;
  
    const { actiontype, attendanceform } = this.props.match.params;
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
                 <BreadcrumbItem><NavLink to='/attendance/attendance'>Attendance</NavLink></BreadcrumbItem>
                 <BreadcrumbItem active>{actiontype}</BreadcrumbItem>
                 <BreadcrumbItem active>{attendanceform}</BreadcrumbItem>
               </Breadcrumb>
                <Container fluid>
                  <div className="mb-4">

                  
                  </div>
                  {this.renderAttendanceForm(actiontype, attendanceform)}
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



