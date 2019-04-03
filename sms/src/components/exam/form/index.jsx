import 'styles/user-form.scss';
import React, { Component, Fragment } from 'react';
import { Container } from 'reactstrap';
import Header from 'components/common/header';
import Loading from 'components/common/loading';
import SideNav from 'components/common/sideNav';
import ExamForm from 'components/exam/form/form-exam';
import SectionForm from 'components/exam/form/form-section';
import QuestionForm from 'components/exam/form/form-question';
import PreviewQuestion from 'components/exam/form/form-previewquestion';
import PreviewAnswer from 'components/exam/form/form-answerkeys';



export default class Exam extends Component {
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

  renderUserForm(actiontype, formType) {
    switch (formType) {
      case 'exam':
        return <ExamForm formType={formType} actiontype={actiontype} props={this.props} />
      case 'section':
        return <SectionForm formType={formType} actiontype={actiontype} props={this.props} />
      case 'questionForm':
        return <QuestionForm formType={formType} actiontype={actiontype} props={this.props} />
      case 'previewQuestion':
        return <PreviewQuestion formType={formType} actiontype={actiontype} props={this.props} />
      case 'previewAnswer':
        return <PreviewAnswer formType={formType} actiontype={actiontype} props={this.props} />
      default:
        return <ExamForm formType={formType} actiontype={actiontype} props={this.props} />
    }
  }

  render() {
    const { isPageLoading, isLoading } = this.state;
    
    const { action, examform, } = this.props.match.params;
    const { session } = this.props;
    return (
      <Fragment >
        { session && 
        <div className="row no-gutters bg-white page-user">
          <Header props={this.props}/>
          <div className="col-3 col-md-2">
            <SideNav props={this.props}/>
          </div>
          <div className="col-9 col-md-10 p-3 content">
            {isPageLoading && <Loading />}
            {!isPageLoading && !isLoading &&
              <Fragment>
                <Container fluid>
                  <div className="mb-4">
                  </div>
                  {this.renderUserForm(action, examform)}
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



