import React, { Component, Fragment } from 'react'
import { Container } from 'reactstrap';
import Header from 'components/common/header';
import Loading from 'components/common/loading';
import SideNav from 'components/common/sideNav';

import GPA from 'components/markentry/form/gpa'
import CCE from 'components/markentry/form/cce'

export default class MarkForm extends Component {

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
      case 'gpa':
        return <GPA formType={formType} actionType={actionType} props={this.props} />
      case "cce":
        return <CCE formType={formType} actionType={actionType} props={this.props} />
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
