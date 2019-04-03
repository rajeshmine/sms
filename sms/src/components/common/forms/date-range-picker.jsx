import React, { Component } from 'react';

import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';


import PropTypes from 'prop-types';
import momentPropTypes from 'react-moment-proptypes';
import moment from 'moment';
import omit from 'lodash/omit';

import { DateRangePicker } from 'react-dates';

const propTypes = {

    autoFocus: PropTypes.bool,
    autoFocusEndDate: PropTypes.bool,
    stateDateWrapper: PropTypes.func,
    initialStartDate: momentPropTypes.momentObj,
    initialEndDate: momentPropTypes.momentObj,
    
};

const START_DATE = 'startDate';
const END_DATE = 'endDate';

const defaultProps = {

    autoFocus: false,
    autoFocusEndDate: false,
    initialStartDate: null,
    initialEndDate: null,
    minimumNights:0,
    // input related props
    startDateId: START_DATE,
    startDatePlaceholderText: 'Start Date',
    endDateId: END_DATE,
    endDatePlaceholderText: 'End Date',
    displayFormat: () => moment.localeData().longDateFormat('L'),
    monthFormat: 'MMMM YYYY',

    stateDateWrapper: date => date,
    
}
class DRP1 extends Component {


    constructor(props) {
        super(props);
        let focusedInput = null;
        if (props.autoFocus) {
            focusedInput = START_DATE;
        } else if (props.autoFocusEndDate) {
            focusedInput = END_DATE;
        }
      
        this.state = {
            focusedInput,
            startDate: props.startDate,
            endDate: props.endDate,
        };

        // this.onDatesChange = this.onDatesChange.bind(this);
        this.onFocusChange = this.onFocusChange.bind(this);
    }

    onFocusChange(focusedInput) {
        this.setState({ focusedInput });
    }

    returnYears = () => {
        let years = []
        for(let i = moment().year() - 100; i <= moment().year(); i++) {
            years.push(<option value={i}>{i}</option>);
        }
        return years;
    }

    renderMonthElement = ({ month, onMonthSelect, onYearSelect }) =>
    <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div>
            <select
                value={month.month()}
                onChange={(e) => onMonthSelect(month, e.target.value)}
            >
                {moment.months().map((label, value) => (
                    <option value={value}>{label}</option>
                ))}
            </select>
        </div>
        <div>
            <select value={month.year()} onChange={(e) => onYearSelect(month, e.target.value)}>
                {this.returnYears()}
            </select>
        </div>
    </div>

    render() {

        const { focusedInput, startDate, endDate } = this.state;
        const { value, onChange, onBlur, ...rest } = this.props;

        // autoFocus, autoFocusEndDate, initialStartDate and initialEndDate are helper props for the
        // example wrapper but are not props on the SingleDatePicker itself and
        // thus, have to be omitted.
        const props = omit(this.props, [
            'autoFocus',
            'autoFocusEndDate',
            'stateDateWrapper',
        ]);

        return (
            <div>
                <DateRangePicker
                    {...props}
                    onDatesChange={({ startDate, endDate }) => {
                        const { stateDateWrapper } = this.props;
                        this.setState({
                            startDate: startDate && stateDateWrapper(startDate),
                            endDate: endDate && stateDateWrapper(endDate),
                        });
                        console.log(startDate,endDate)
                       
                        onChange({ from: startDate, to: endDate })
                    }}

                    // renderMonthElement={this.renderMonthElement}
                    onFocusChange={this.onFocusChange}
                    focusedInput={focusedInput}
                    startDate={startDate}
                    endDate={endDate}
                    {...rest}

                />
            </div>
        );
    }

}

DRP1.propTypes = propTypes;
DRP1.defaultProps = defaultProps;

export default DRP1;