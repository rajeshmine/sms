import 'styles/user-form.scss';
import React, { Component, Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import { Container } from 'reactstrap';
import Header from 'components/common/header';
import Loading from 'components/common/loading';
import SideNav from 'components/common/sideNav';
import EventForm from 'components/schedule/form/form-event';
import AssignmentForm from 'components/schedule/form/form-assignment';
import HomeworkForm from 'components/schedule/form/form-homework';
import CourseForm from 'components/schedule/form/form-course';
import ExamForm from 'components/schedule/form/form-exam';
import TermForm from 'components/schedule/form/form-term';
import TimeTableForm from 'components/schedule/form/form-timetable';
import AttendanceForm from 'components/schedule/form/form-attendance';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';

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

  renderScheduleForm(actiontype, scheduleform) {

    switch (scheduleform) {
      case 'exam':
        return <ExamForm formType={scheduleform} actiontype={actiontype} props={this.props} />
      case 'event':
        return <EventForm formType={scheduleform} actiontype={actiontype} props={this.props} />
      case 'assignment':
        return <AssignmentForm formType={scheduleform} actiontype={actiontype} props={this.props} />
      case 'homework':
        return <HomeworkForm formType={scheduleform} actiontype={actiontype} props={this.props} />
      case 'course':
        return <CourseForm formType={scheduleform} actiontype={actiontype} props={this.props} />
      case 'timetable':
        return <TimeTableForm formType={scheduleform} actiontype={actiontype} props={this.props} />
      case 'attendance':
        return <AttendanceForm formType={scheduleform} actiontype={actiontype} props={this.props} />
      case 'term':
        return <TermForm formType={scheduleform} actiontype={actiontype} props={this.props} />
      default:
        return <ExamForm formType={scheduleform} actiontype={actiontype} props={this.props} />
    }
  }

  render() {
    const { isPageLoading, isLoading } = this.state;
   
    const { actiontype, scheduleform, } = this.props.match.params
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
                    <BreadcrumbItem><NavLink to='/schedule/exam'>schedule</NavLink></BreadcrumbItem>
                    <BreadcrumbItem active>{actiontype}</BreadcrumbItem>
                    <BreadcrumbItem active>{scheduleform}</BreadcrumbItem>
                  </Breadcrumb>
                  <Container fluid>
                    <div className="mb-4">

                      {
                        //    formTypeOrder.map((scheduleform) =>
                        //   <NavLink key={scheduleform} to={{ pathname: `/schedule/${actiontype}/${scheduleform}`, query: this.props.location.query }} className={classNames('btn btn-link', { disabled: actiontype === 'edit' })} activeClassName="btn-primary" exact={true} >{formTypeKeys[scheduleform]['label']}</NavLink>
                        // )
                      }
                    </div>
                    {this.renderScheduleForm(actiontype, scheduleform)}
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



