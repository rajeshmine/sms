import React, { Component } from 'react';
//import Joi from 'joi-browser';
import Input from 'components/common/input';

import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

import './datepicker.scss';

import { DateRange } from 'react-date-range';
import { format } from 'date-fns';


class Datepicker extends Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            isDatePickerOpen: false,
            date: {},
            errors: {},
            dateRange: {
                selection: {
                    startDate: new Date(),
                    endDate: new Date(),
                    key: 'selection',
                   
                },
               
            },
        };
        this.openDatePicker = this.openDatePicker.bind(this);
    }

    openDatePicker() {
        this.setState({
            isDatePickerOpen: !this.state.isDatePickerOpen
        });
    }

    
    handleRangeChange(which, payload) {
        this.setState({
            [which]: {
                ...this.state[which],
                ...payload,
            },
           
        });
    }
    


    formatDateDisplay(date, defaultText) {
        if (!date) return defaultText;
        return format(date, 'YYYY-MM-DD');
    }



    renderdateInput(name, label, type = "text") {
        const { date, errors } = this.state;
        return (
            <Input
                type={type}
                name={date}
                value={this.formatDateDisplay(this.state.dateRange.selection.startDate) + ' to ' + this.formatDateDisplay(this.state.dateRange.selection.endDate)}
                label={label}
                onClick={this.openDatePicker}
                error={errors[name]}
            />
        );
    }



    renderdaterangeInput() {

        return (
           
              <DateRange
                  onChange={this.handleRangeChange.bind(this, 'dateRange')}
                  moveRangeOnFirstSelection={false}
                  ranges={[this.state.dateRange.selection]}
                  className={'PreviewArea bg-white'}
                />  
        )
    }

    render() {
        return (
 
            <div>
                <div className="col-sm-4">
                    {this.renderdateInput("Date", "Date")}

                    {
                    this.state.isDatePickerOpen ? this.renderdaterangeInput() : ''
                  }
                  
                </div>

            </div>
        )
    }
}

export default Datepicker;
