import React, { Component, Fragment } from 'react'
import { Container } from 'reactstrap';
import Header from 'components/common/header';
import Loading from 'components/common/loading';
import SideNav from 'components/common/sideNav';

import GradeSettings from 'components/gradesettings/form/GradeSettings'
import Scholastics from 'components/gradesettings/form/Scholastics'
import Skills from 'components/gradesettings/form/Skills'
import SubectWeight from 'components/gradesettings/form/SubectWeight'

export default class GradeForm extends Component {

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
      case 'gradeform':
        return <GradeSettings formType={formType} actionType={actionType} props={this.props} />
      case "skill":
        return <Skills formType={formType} actionType={actionType} props={this.props} />
      case "assessmentweitage":
        return <Scholastics formType={formType} actionType={actionType} props={this.props} />
      case 'subjectweitage':
        return <SubectWeight formType={formType} actionType={actionType} props={this.props} />

      default:
        return null;
    }
  }

  render() {
    const { isPageLoading, isLoading } = this.state;
    const { action, formType } = this.props.match.params;
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
                  <Container fluid>
                    <div className="mb-4">

                    </div>
                    <div>
                      {this.renderForm(action, formType)}
                    </div>

                  </Container>
                </Fragment>
              }
            </div>
          </div>
        }
      </Fragment >
    )
  }
}
