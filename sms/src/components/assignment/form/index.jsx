
import React, { Component, Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import { Container } from 'reactstrap';
import {Breadcrumb,  BreadcrumbItem} from 'reactstrap';

import Header from 'components/common/header';
import Loading from 'components/common/loading';
import SideNav from 'components/common/sideNav';
import AddAssignment from 'components/assignment/form/assignmentform'
import AddHomework from 'components/assignment/form/homeworkform'
import 'styles/user-form.scss';

export default class AssignmentForm extends Component {
  state = {
    isPageLoading: false,
    isLoading: false
  }

  async componentDidMount() {
    await this.init(this.props, true)
  }

  async componentWillReceiveProps(props) {
    await this.init(props, false)
  }

  async init(props, isPageLoading = false) {
  //  const { uid, formType, action } = props.match.params  
  }

  renderUserForm(type, action) {
    switch (type) {
      case 'homework':
        return <AddHomework type={type} action={action} props={this.props} />
      case 'assignment':
        return <AddAssignment type={type} action={action} props={this.props} />
      default:
        return <AddAssignment type={type} action={action} props={this.props} />
    }
  }

  render() {
    const { isPageLoading, isLoading } = this.state;
    const { action, type } = this.props.match.params;
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
                    <BreadcrumbItem><NavLink to='/assignments/assignment'>assignments</NavLink></BreadcrumbItem>
                    <BreadcrumbItem active>{action}</BreadcrumbItem>
                    <BreadcrumbItem active>{type}</BreadcrumbItem>
                  </Breadcrumb>
                  <Container fluid>                     
                    {this.renderUserForm(type, action)}
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