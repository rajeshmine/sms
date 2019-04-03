import React, { Component } from 'react';
import './style.scss'


export default class DashboardItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            bg: this.props.bg,
            title: this.props.title,
            value: this.props.value
        };
    }


    render() {
        return (
            <div className="itembox bg-white" style={{ background: 'url(' + this.state.bg + ') center / cover', }}>
                <p>{this.state.title}</p>
                <div className="text-right">
                    <span>{this.state.value}</span>
                </div>
            </div>
        )
    }
} 