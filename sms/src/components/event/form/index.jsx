import 'styles/user-form.scss';
import React, { Component, Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import { Container, Breadcrumb, BreadcrumbItem, } from 'reactstrap';
import Header from 'components/common/header';
import Loading from 'components/common/loading';
import SideNav from 'components/common/sideNav';
import AddGalaryForm from 'components/event/form/form-gallery';
import EventAttendeesForm from 'components/event/form/EventAttendees';

export default class EventForm extends Component {
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

    renderEventAttendeesForm(actiontype, eventform) {  
        eventform = eventform.trim();
        if(eventform === "gallery" ){         
            return <AddGalaryForm formType={eventform} actiontype={actiontype} props={this.props} />;
        }else{
            return <EventAttendeesForm formType={eventform} actiontype={actiontype} props={this.props} />
        }       
    }

    render() {
        const { isPageLoading, isLoading } = this.state;

        const { actiontype, eventform, } = this.props.match.params;
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
                                        <BreadcrumbItem><NavLink to={{ pathname: `/event/${eventform}` }}> {eventform}</NavLink></BreadcrumbItem>
                                        <BreadcrumbItem active>{actiontype}  </BreadcrumbItem>
                                    </Breadcrumb>
                                    <Container fluid>
                                        <div className="mb-4">
                                            {/* {formTypeOrder.map((eventform) =>
                                                <NavLink key={eventform} to={{ pathname: `/event/${actiontype}/${eventform}`, query: this.props.location.query }} className={classNames('btn btn-link')} activeClassName="btn-primary" exact={true} >{formTypeKeys[eventform]['label']}</NavLink>
                                            )
                                            } */}
                                        </div>
                                        {this.renderEventAttendeesForm(actiontype, eventform)}
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



