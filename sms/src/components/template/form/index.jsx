import 'styles/user-form.scss';
import React, { Component, Fragment } from 'react';
import { Container, Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { NavLink } from 'react-router-dom';
// import Static from 'services/static';

import Header from 'components/common/header';
import Loading from 'components/common/loading';
import SideNav from 'components/common/sideNav';
import Template from 'components/template/form/Template';
 

export default class TemplateForm extends Component {
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
        const { uid, formTypes, clientid, entityid } = props.match.params
        let user = {}
        if (uid !== "new") {
            if (user.email === undefined) {
                user = this.state.user
            } else {
                user = this.state.user
            }
        }
        this.setState({ user: user, uid, clientid, entityid, formTypes, isPageLoading: false, isLoading: false })
    }

    renderSmsTemplateForm(actionType) {
        return <Template actionType={actionType} props={this.props} />;
    }

    render() {
        const { isPageLoading, isLoading, } = this.state;
        const { actionType } = this.props.match.params
        
        return (
            <Fragment>
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
                                    <BreadcrumbItem active>template </BreadcrumbItem>
                                </Breadcrumb>
                                <Container fluid>
                                    {this.renderSmsTemplateForm(actionType)}
                                </Container>
                            </Fragment>
                        }
                    </div>
                </div>
            </Fragment >
        );
    }
}



