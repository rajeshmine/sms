import 'styles/user-form.scss';
import React, { Component, Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import { Container } from 'reactstrap';
import Static from 'services/static';
import Header from 'components/common/header';
import Loading from 'components/common/loading';
import SideNav from 'components/common/sideNav';

import AssignmentReport from 'components/reports/form/assignmentform'
import HomeworkReport from 'components/reports/form/homeworkform'
import AttendanceReport from 'components/reports/form/attendanceform'
import FeeReport from 'components/reports/form/feesform'
import StaffReport from 'components/reports/form/staffreportform'
import MarksReport from 'components/reports/form/markreportform'
import { rightsData } from 'services/rolesService';
import _ from 'lodash';
import {

  Breadcrumb,
  BreadcrumbItem
} from 'reactstrap';

var classNames = require('classnames');

export default class ReportsForm extends Component {
  state = {

    isPageLoading: false,
    isLoading: false
  }

  async componentDidMount() {
    const { session } = this.props;
    await this.rightsData(session);
    await this.init(this.props, true)
  }

  async componentWillReceiveProps(props) {
    await this.init(props, false)
  }



  async init(props, isPageLoading = false) {

  }

  rightsData = async (session) => {
  
    let res = await rightsData("report", session);
   
    let excludeModules = [];
    await _.map(_.keys(res), async v => {
      await _.map(_.keys(res[v]), k => {
        if (res[v][k]["value"])
          return excludeModules.push(v.toLowerCase())
      })
    })
    
    await this.setState({ excludeModules, rightsData: res || {} })

  }

  renderReportsForm(type) {
    const {rightsData} = this.state;
    switch (type) {
      case 'homework':
        return <HomeworkReport type={type} props={this.props} rightsData={rightsData}/>
      case 'assignment':
        return <AssignmentReport type={type} props={this.props} rightsData={rightsData}/>
      case 'attendance':
        return <AttendanceReport type={type} props={this.props} rightsData={rightsData}/>
      case 'fees':
        return <FeeReport type={type} props={this.props} rightsData={rightsData}/>
      case 'staff':
        return <StaffReport type={type} props={this.props} rightsData={rightsData}/>
      case 'mark':
        return <MarksReport type={type} props={this.props} rightsData={rightsData}/>
      default:
        return <AttendanceReport type={type} props={this.props} rightsData={rightsData}/>

    }
  }
  redirectTo = ()=>{
    
  }
  render() {
    const { isPageLoading, isLoading,  rightsData, excludeModules,
       } = this.state;
    let { keys: formTypeKeys, order: formTypeOrder } = Static.reportFormTypes();
    const { reporttype } = this.props.match.params;
    const { session } = this.props;
    formTypeOrder =   _.filter(formTypeOrder, v => _.includes(excludeModules, v))
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
                    <BreadcrumbItem><NavLink to='/reports/attendance'>reports</NavLink></BreadcrumbItem>

                    <BreadcrumbItem >{reporttype}</BreadcrumbItem>
                  </Breadcrumb>
                  <Container fluid>
                    <div className="mb-4 subnav-div">
                      {formTypeOrder.map((reporttype) =>
                        <NavLink key={reporttype} to={{ pathname: `/reports/${reporttype}`, query: this.props.location.query }} onClick={this.redirectTo} className={classNames('subnav')} activeClassName="subnav-active" exact={true} >{formTypeKeys[reporttype]['label']}</NavLink>
                      )}
                    </div>
                    {rightsData && this.renderReportsForm(reporttype)}
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

// function redirectTo() {
//   return window.location.reload()
// }