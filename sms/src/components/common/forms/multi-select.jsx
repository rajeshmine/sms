import 'rc-time-picker/assets/index.css';
import React, {  Fragment } from 'react';
import { asField } from 'informed';

import Select from 'react-select';

export const MultiSelect = asField(({ fieldState, fieldApi, ...props }) => {

    const { value } = fieldState;
    const { setValue, } = fieldApi;
    const { field, label, options, onChange, ...rest } = props;   
    return (
        <Fragment>
            <div>
                {label && <label htmlFor={label}>{label}</label>}
                <Select
                    {...rest}
                    id={field}
                    name={field}
                    options={options}
                    value={value}
                    isMulti
                    className="basic-multi-select"
                    classNamePrefix="select"
                    onChange={selectedOption => {
                        setValue(selectedOption, value);
                    }}
                />
            </div>
        </Fragment>
    )
})