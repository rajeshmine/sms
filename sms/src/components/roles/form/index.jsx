import 'styles/user-form.scss';
import React, { Component, Fragment } from 'react';
import { Breadcrumb, BreadcrumbItem, Container } from 'reactstrap';
import { NavLink } from 'react-router-dom';
import Header from 'components/common/header';
import Loading from 'components/common/loading';
import SideNav from 'components/common/sideNav';
import Roles from 'components/roles/form/RolesForm';
export default class RolesForm extends Component {
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

    renderRolesForm(action) {
        return <Roles action={action} props={this.props} />;
    }

    render() {
        const { isPageLoading, isLoading, } = this.state;
        const { action } = this.props.match.params
        const { session } = this.props;
        return (
            <Fragment>
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
                                        <BreadcrumbItem><NavLink to="/roles">Roles</NavLink></BreadcrumbItem>
                                        <BreadcrumbItem active>{action}  </BreadcrumbItem>
                                    </Breadcrumb>
                                    <Container fluid>
                                        {this.renderRolesForm(action)}
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