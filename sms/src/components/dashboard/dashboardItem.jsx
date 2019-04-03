import React, { Component } from 'react';
import 'styles/App.scss';

import { NavLink } from 'react-router-dom';
import { Col, Row,  } from 'reactstrap';

export default class DashboardItem extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }
    render() {
        const {  title, value, toLink, className,iconclass,icon } = this.props
        return (
            <NavLink to={toLink}>
                {/* <div className={className} style={{ background: 'url(' + bg + ') center / cover', }}>
                    <p>{title}</p>
                    <div class="icon"><FAIcons.FaUsers /> </div>
                    <div className="text-right">

                        <span class="countValue">{value}</span>
                    </div>
                </div> */}
                <div className={className} >
                    <h5>{title}</h5>
                    <Row>
                        <Col sm={6}>
                            <p>{value}</p>
                        </Col>
                        <Col sm={6}>
                            <div className={iconclass}>
                                <i className={icon} aria-hidden="true"></i>
                            </div>
                        </Col>
                    </Row>
                </div>
            </NavLink>
        )
    }
} 