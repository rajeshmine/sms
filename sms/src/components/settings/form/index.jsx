import 'styles/user-form.scss';
import React, { Component, Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import { Container } from 'reactstrap';
// import Static from 'services/static';
import Header from 'components/common/header';
import Loading from 'components/common/loading';
import SideNav from 'components/common/sideNav';

import AddClientSettings from 'components/settings/form/clientform';
import AddGeneralSettings from 'components/settings/form/generalform';
import {Breadcrumb,BreadcrumbItem} from 'reactstrap';


export default class SettingsForm extends Component {
  state = {

    isPageLoading: true,
    isLoading: true,

  }

  async componentDidMount() {
    await this.init(this.props, true)
  }

  async componentWillReceiveProps(props) {
    await this.init(props, false)
  }

  async init(props, isPageLoading = false) {
    const { uid, formType, action } = props.match.params
    let user = {}

    this.setState({ user: user, uid, formType, action, isPageLoading: false, isLoading: false })
  }

  renderSettingsForm(formType, action) {
  
    if((formType === 'department') || (formType === 'batch') || (formType === 'boardtype')){
      return <AddClientSettings formType={formType} action={action} props={this.props} />
    }
    else{
      return <AddGeneralSettings formType={formType} action={action} props={this.props} />
    }   
  }

  render() {
    const { isPageLoading, isLoading,  formType, action,   } = this.state;
    // const { keys: formTypeKeys, order: formTypeOrder } = Static.settingsFormTypes();
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
                    <BreadcrumbItem><NavLink to='/settings/department'>settings</NavLink></BreadcrumbItem>
                    <BreadcrumbItem active>{action}</BreadcrumbItem>
                    <BreadcrumbItem active>{formType}</BreadcrumbItem>
                  </Breadcrumb>
                  <Container fluid>
                    {/* <div className="mb-4">
                      {action === "edit" && <NavLink to={{ pathname: `/user/new`, query: this.props.location.query }} className={classNames('btn btn-link', { disabled: uid !== 'new' })} activeClassName="btn-primary" exact={true} >Register Details</NavLink>}
                      {formTypeOrder.map((formType) =>
                        uid !== "add" ?
                          <NavLink key={formType} onClick={redirectTo}   to={{ pathname: `/settings/${action}/${formType}`, query: this.props.location.query }} className={classNames('btn btn-link', { disabled: action === 'edit' })} activeClassName="btn-primary" exact={true} >{formTypeKeys[formType]['label']}</NavLink> : <span className="btn btn-link disabled">{formTypeKeys[formType]['label']}</span>
                      )
                      }
                    </div> */}
                    {this.renderSettingsForm(formType, action)}
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
