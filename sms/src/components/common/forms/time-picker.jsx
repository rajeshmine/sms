import 'rc-time-picker/assets/index.css';
import React, {  Fragment } from 'react';
import { asField } from 'informed';
// import TimePicker from 'react-time-picker';
import moment from 'moment';
import TimePicker from 'rc-time-picker';


export const RTimePicker = asField(({ fieldState, fieldApi, ...props }) => {

   
    const { field, label, onChange, ...rest } = props;
   
    const format = "h:mm a";
    const showSecond = false;

    return (
        <Fragment>
            <div>
                {label && <label htmlFor={label}>{label}</label>}
                <TimePicker
                    {...rest}
                    id={field}
                    name={field}
                    showSecond={showSecond}
                    defaultValue={moment()}
                    
                    className="xxx"
                    onChange={time => {
                        onChange(time.format(format))
                        
                        
                    }}
                    use12Hours
                    inputReadOnly


                />
            </div>
        </Fragment>
    )
})