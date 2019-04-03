import ProtectedRoute from 'components/common/protectedRoute';
import { ToastContainer,  } from 'react-toastify';
import React, { Component } from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import auth from 'services/authService';

import Clients from 'components/client';
import ClientEdit from 'components/client/editForm';
import ClientView from 'components/client/viewForm';

import ForgotPassword from 'components/core/forgotForm';
import Home from 'components/home/Home';
import Login from 'components/core/loginForm';
import Users from 'components/user';
import Profile from 'components/profile';
import UserForm from 'components/user/form';

import ScheduleForm from 'components/schedule/form';
import Schedule from 'components/schedule';

import Exam from 'components/exam/form';
import ExamList from 'components/exam';

import SettingsForm from 'components/settings/form';
import SettingsRoot from 'components/settings';

import AssignmentForm from 'components/assignment/form';
import Assignment from 'components/assignment';

import Dashboard from 'components/dashboard';

import Attendance from 'components/attendance/form';
import AttendanceList from 'components/attendance'

import CredentialsRoot from 'components/clientcredentials';
import CredentialsForm from 'components/clientcredentials/form';

import EventForm from 'components/event/form';
import EventRoot from 'components/event';

import TemplateForm from 'components/template/form'

import Result from 'components/onlineExam/result'
import OnlineExam from 'components/onlineExam';

import Timetable from 'components/timetable/form';
import TimetableList from 'components/timetable';

import FeesForm from 'components/fees/form';
import Fees from 'components/fees';

import CourseRoot from 'components/externalcourse';
import CourseAttendees from 'components/externalcourse/form/';
import SubjectRoot from 'components/subject';
import SubjectForm from 'components/subject/form';
import SyllabusRoot from 'components/syllabus';
import SyllabusForm from 'components/syllabus/form';

import Roles from 'components/roles';
import RolesForm from 'components/roles/form';

import GradeList from 'components/gradesettings';
import GradeForm from 'components/gradesettings/form';

import MarkDataList from 'components/markentry';
import MarkForm from 'components/markentry/form';
// 
import ReportsForm from 'components/reports/form';

import Leave from 'components/leave/form';
import LeaveList from 'components/leave';

import NotificationForm from 'components/notification/form'
import CircularDataList from 'components/circular';
import CircularForm from 'components/circular/form';

import StaffAllocationForm from 'components/staffallocation/form'
import StaffAllocation from 'components/staffallocation'

import ClassList from 'components/class';
import ResheduleRoot from 'components/class/form/';

import Loading from 'components/common/loading';





import 'react-toastify/dist/ReactToastify.css';
// import Timetable from 'components/timetable';
class App extends Component {
  state = {}

  async componentDidMount() {
    await this.init()
  }

  init = async () => {
    const user = await auth.getCurrentUser();
    await this.setState({ session: user })
  }

  isPageLoadingFalse = async () => {
    await this.setState({isPageLoading:false})
  }

  isPageLoadingTrue = async () => {
    await this.setState({isPageLoading:true})
  }



  render() {
    const { session,isPageLoading } = this.state;  
    
    return (
      <Router>
        {(session && session !== null) ?
          <div>
            <ToastContainer />
            {isPageLoading &&
            <Loading ></Loading>}
            <Switch>
              {/* HOME PAGE */}
              <Redirect from="/" to="/login" exact />

              {/* CORE PAGES */}
              <Route path="/login" component={Login} />
              <Route path="/forgotpassword" component={ForgotPassword} />



              {/* DASHBOARD */}
              <ProtectedRoute exact path="/dashboard" render={(props) => <Dashboard {...props} session={session}  isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}  />} />


              {/* USER PAGES */}

              <ProtectedRoute exact path="/:type/:uid/users" render={(props) => <Users {...props} session={session}  isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue} />} />
              <ProtectedRoute exact path="/user/:formType/:uid" render={(props) => <UserForm {...props} session={session}  isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />
              <ProtectedRoute exact path="/user/:uid/edit/:formType" render={(props) => <UserForm {...props} session={session}  isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />

              <ProtectedRoute exact path="/:clientid/:entityid/:branch/:uid/edit/:formType" render={(props) => <UserForm {...props} session={session}  isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />

              <ProtectedRoute exact path="/users" render={(props) => <Users {...props} session={session}  isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />

              {/* PROFILE PAGES */}
              <ProtectedRoute path="/:uid/profile" exact render={(props) => <Profile {...props} session={session}  isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />

              <ProtectedRoute path="/:clientid/:entityid/:branch/:uid/profile" exact render={(props) => <Profile {...props} session={session}  isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />


              {/* External Course */}
              <ProtectedRoute exact path="/course/externalcourse-list" render={(props) => <CourseRoot {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />
              <ProtectedRoute exact path="/course/externalcourse/:actionTypes" render={(props) => <CourseAttendees {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />

              <ProtectedRoute exact path="/course/subject/:actionTypes" render={(props) => <SubjectForm {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />
              <ProtectedRoute exact path="/course/subject-list" render={(props) => <SubjectRoot {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />

              <ProtectedRoute exact path="/course/syllabus/:actionTypes" render={(props) => <SyllabusForm {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />
              <ProtectedRoute exact path="/course/syllabus-list" render={(props) => <SyllabusRoot {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />


              {/* CLIENT CREDENTIAL PAGES */}
              <ProtectedRoute exact path="/credentials/:form/:action" render={(props) => <CredentialsForm {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />
              <ProtectedRoute exact path="/credentials/:form" render={(props) => <CredentialsRoot {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />


              {/* CLIENT PAGES */}

              <ProtectedRoute path="/:type/:id/view" render={(props) => <ClientView {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />
              <ProtectedRoute path="/:type/list" exact render={(props) => <Clients {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />

              <ProtectedRoute path="/:clientid/:type/list" exact render={(props) => <Clients {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />

              <ProtectedRoute path="/:clientid/:entityid/:type/list" exact render={(props) => <Clients {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />

              <ProtectedRoute path="/:clientid/:entityid/:branchid/:type/list" exact render={(props) => <Clients {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />

              <ProtectedRoute path="/:clientid/:entityid/:branchid/:departmentid/:type/list" exact render={(props) => <Clients {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />

              <ProtectedRoute path="/:clientid/:entityid/:branchid/:departmentid/:batchid/:type/list" exact render={(props) => <Clients {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />
              <ProtectedRoute path="/:type/:id/edit" render={(props) => <ClientEdit {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />
              <ProtectedRoute path="/:type/:id/add" render={(props) => <ClientEdit {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />



              <ProtectedRoute exact path="/:clientid/:entityid/:branchid/credentials/:form" render={(props) => <CredentialsForm {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />


              <ProtectedRoute exact path="/settings/:action/:formType" render={(props) => <SettingsForm {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />
              <ProtectedRoute exact path="/:clientid/settings/:action/:formType" render={(props) => <SettingsForm {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />
              <ProtectedRoute exact path="/:clientid/:entityid/settings/:action/:formType" render={(props) => <SettingsForm {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue} />} />

              <ProtectedRoute exact path="/settings/:formType" render={(props) => <SettingsRoot {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />


              {/* SCHEDULE PAGES */}
              <ProtectedRoute exact path="/schedule/:actiontype/:scheduleform" render={(props) => <ScheduleForm {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />

              <ProtectedRoute exact path="/schedule/:scheduleType" render={(props) => <Schedule {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />

            

              <ProtectedRoute exact path="/schedule/:actiontype/:scheduleform" render={(props) => <ScheduleForm {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />


              <ProtectedRoute exact path="/schedule/:scheduleType" render={(props) => <Schedule {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />
             
              <ProtectedRoute exact path="/exam/:action/:examform" render={(props) => <Exam {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />
              <ProtectedRoute exact path="/exam/:form" render={(props) => <ExamList {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />

            

              {/* Assignment Pages */}

              <ProtectedRoute exact path="/assignments/:action/:type" render={(props) => <AssignmentForm {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />
              <ProtectedRoute exact path="/assignments/:type" render={(props) => <Assignment {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />


              {/* Attendance */}
              <ProtectedRoute exact path="/attendance/:actiontype/:attendanceform" render={(props) => <Attendance {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />
              <ProtectedRoute exact path="/attendance/:attendanceType" render={(props) => <AttendanceList {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />


              {/* Event Registration Pages */}

              <ProtectedRoute exact path="/event/:actiontype/:eventform" render={(props) => <EventForm {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />

              <ProtectedRoute exact path="/event/:eventformType" render={(props) => <EventRoot {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>}  />

             

              {/* Syllabus Pages */}
              <ProtectedRoute exact path="/syllabus/:actionTypes" render={(props) => <SyllabusForm {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />

              <ProtectedRoute exact path="/syllabus-list" render={(props) => <SyllabusRoot {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />

              {/* Subject Pages */}
              <ProtectedRoute exact path="/subject/:actionTypes" render={(props) => <SubjectForm {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />

              <ProtectedRoute exact path="/subjectList" render={(props) => <SubjectRoot {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />


              {/* LEAVE PAGES */}

              <ProtectedRoute exact path="/leave/:actiontype/:leaveform" render={(props) => <Leave {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />
              <ProtectedRoute exact path="/leave/:leaveType" render={(props) => <LeaveList {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />

              {/* RESULT PAGE *(ONLINE EXAM) */}
              <ProtectedRoute exact path="/result" render={(props) => <Result {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />

              {/* ONLINE EXAM  */}

              <ProtectedRoute exact path="/onlineExam" render={(props) => <OnlineExam {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />

              {/* TIMETABLE */}
              <ProtectedRoute exact path="/timetable/:action/:form" render={(props) => <Timetable {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />
              <ProtectedRoute exact path="/timetable/:form" render={(props) => <TimetableList {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />


              {/* CLASS */}
              <ProtectedRoute exact path="/classLists/:formTypes" render={(props) => <ClassList {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />

              <ProtectedRoute exact path="/classList/reschedule" render={(props) => <ResheduleRoot {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />


              {/* STAFF ALLOCATION */}
              <ProtectedRoute exact path="/staff/:actiontype/:allocationtype" render={(props) => <StaffAllocationForm {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue} />} />

              <ProtectedRoute exact path="/staff/allocation" render={(props) => <StaffAllocation {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />

              {/* Template */}

              <ProtectedRoute exact path="/notification/:actionType/template" render={(props) => <TemplateForm {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />


              {/* Fees */}
              <ProtectedRoute exact path="/fees/:actiontype/:feesform" render={(props) => <FeesForm {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />
              <ProtectedRoute exact path="/fees/:feesType" render={(props) => <Fees {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />


              {/* ROLES */}
              <ProtectedRoute exact path="/roles/:action" render={(props) => <RolesForm {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />

              <ProtectedRoute exact path="/roles" render={(props) => <Roles {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />

              {/*  Circular */}
              <ProtectedRoute exact path="/circular/:listType" render={(props) => {
                return <CircularDataList {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>;
              }} />
              <ProtectedRoute exact path="/notification/:actionType/:formType" render={(props) => {
                return <CircularForm {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>;
              }} />

              {/* Notification */}
              <ProtectedRoute exact path="/notification/:notificationtype/" render={(props) => <NotificationForm {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>} />


              {/* Grades */}
              <ProtectedRoute exact path="/grade/:action/:formType" render={(props) => {
                return <GradeForm {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>;
              }} />
              <ProtectedRoute exact path="/grade/:listType" render={(props) => {
                return <GradeList {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>;
              }} />


              {/*  Mark Entry */}
              <ProtectedRoute exact path="/mark/:listType" render={(props) => {
                return <MarkDataList {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>;
              }} />
              <ProtectedRoute exact path="/mark/:action/:formType" render={(props) => {
                return <MarkForm {...props} session={session} isPageLoadingFalse={this.isPageLoadingFalse} isPageLoadingTrue={this.isPageLoadingTrue}/>;
              }} />

              {/* REPORT */}
              <ProtectedRoute exact path="/reports/:reporttype" render={(props) => 
              <ReportsForm {...props} 
              session={session} 
              isPageLoadingFalse={this.isPageLoadingFalse} 
              isPageLoadingTrue={this.isPageLoadingTrue}/>} 
              />

            </Switch>
          </div> : <Switch>
            {/* HOME PAGE */}
            <Redirect from="/" to="/login" exact />
            <Route path="/home" component={Home} />
            <Route path="/login" component={Login} />
            <Route path="/forgotpassword" component={ForgotPassword} />            
          </Switch>
        }
      </Router>
    );
  }
}

export default App;
