import React, { Component, Fragment } from 'react'
import { Container, Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { NavLink } from 'react-router-dom';

import Header from 'components/common/header';
import Loading from 'components/common/loading';
import SideNav from 'components/common/sideNav';
import Circular from 'components/circular/form/Circular'

export default class CircularForm extends Component {

  state = {
    data: {},
    isPageLoading: true,
    isLoading: true,
  }

  componentDidMount = async () => {
    this.setState({ isLoading: false, isPageLoading: false })
  }

  renderForm = (actionType, formType) => {    
    switch (formType) {
      case 'circular':
        return <Circular formType={formType} actionType={actionType} props={this.props} />
      default:
        return null;
    }
  }

  render() {  
    const { isPageLoading, isLoading } = this.state;
    const { actionType, formType } = this.props.match.params
    return (
      <Fragment >
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
                  <BreadcrumbItem active> {actionType} </BreadcrumbItem>
                  <BreadcrumbItem active>circular </BreadcrumbItem>
                </Breadcrumb>
                <Container fluid>
                  <div>
                    {this.renderForm(actionType, formType)}
                  </div>
                </Container>
              </Fragment>
            }
          </div>
        </div>
      </Fragment >
    )
  }
}