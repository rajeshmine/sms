import React, { Component,Fragment } from 'react';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import MonthPickerInput from 'react-month-picker-input';
import 'react-month-picker-input/dist/react-month-picker-input.css';
import { DateRangePicker, SingleDatePicker } from 'react-dates';
import { asField} from 'informed';
import moment from 'moment'

export class DRP extends Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: null,
            endDate: null,
            focusedInput: null,
        };
    }
    render() {
        const { value, onChange, onBlur, ...rest } = this.props;
        return (
            <div className="App">
                <DateRangePicker
                
                    {...rest}
                    showClearDates
                    small
                    displayFormat="MMM D"
                    startDateId="startDate"
                    endDateId="endDate"
                    // startDate={this.state.startDate}
                    // endDate={this.state.endDate}
                    onDatesChange={({ startDate, endDate }) => {
                        onChange({ startDate, endDate })
                    }}
                    focusedInput={this.state.focusedInput}
                    onFocusChange={(focusedInput) => {
                        this.setState({ focusedInput });
                        onBlur(focusedInput);
                    }}
                />
            </div>
        );
    }
}
export class SDP extends Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: null,
            endDate: null,
            focused: null,
        };
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
        const { id, value, onChange, onBlur, numberOfMonths, ...rest } = this.props;
     
        return (
            <div className="App">
                <SingleDatePicker                   
                    {...rest}
                    //showClearDate
                    small
                    displayFormat="YYYY MMM D"
                    id={id}
                    renderMonthElement={this.renderMonthElement}
                    // numberOfMonths={numberOfMonths ? numberOfMonths : 1}
                    onDateChange={date => {
                        onChange(date)
                    }}
                    focused={this.state.focused}
                    onFocusChange={({ focused }) => {
                        this.setState({ focused });
                        onBlur(focused);
                    }}
                />
            </div>
        );
    }
}

export const MP = asField(({ fieldState, fieldApi, ...props }) => {
    const { value } = fieldState;
    const { setValue } = fieldApi;
    const { field, label, onChange, ...rest } = props;
    
    return (
        <Fragment>
            <div>
                {label && <label htmlFor={label}>{label}</label>}
                <MonthPickerInput
                    {...rest}
                    id={field}
                    name={field}
                    value={value}
                    monthFormat={'short'}
                    closeOnSelect={true}
                    onChange={e => {
                        setValue(e, value);
                    }}
                />
            </div>
        </Fragment>
    )
})
