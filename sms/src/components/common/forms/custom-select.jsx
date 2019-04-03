import { asField, Option, Select } from 'informed';
import React, {  Fragment } from 'react';

export const CustomSelect = asField(({ fieldState, fieldApi, ...props }) => {
    const { value } = fieldState;

    const {  setTouched } = fieldApi;
    const { field, onChange, onBlur, initialValue, forwardedRef,
        excludeEmptyOption, emptyValue, emptyLabel,
        options, getOptionValue, getOptionLabel, radioInline, ...rest } = props;

    return (
        <Fragment>
            <div className="form-group">
                {props.label && <label htmlFor={field}>{props.label}</label>}
                <div>
                    <Select
                        {...rest}
                        id={field}
                        field={field}
                        value={value}
                        className="custom-select custom-select-sm"
                        onChange={e => {
                            // setValue(e.target.value);
                           
                            if (onChange) {
                                onChange(e, value);
                            }
                        }}
                        onBlur={e => {
                            setTouched();
                            if (onBlur) {
                                onBlur(e);
                            }
                        }}
                    >
                        {!excludeEmptyOption &&
                            <Option value={emptyValue ? emptyValue : ""} className="custom-control-input">{emptyLabel ? emptyLabel : 'Select the option'}</Option>
                        }
                        {options && options.map((option, i) =>
                            <Option value={getOptionValue ? getOptionValue(option) : (option.value ? option.value : option)} id={`${field}-${i}`} className="custom-control-input" key={i}>{getOptionLabel ? getOptionLabel(option) : (option.label ? option.label : option)}</Option>
                        )}
                    </Select>
                </div>
                {fieldState.error ? (<div className="invalid-field">{fieldState.error}</div>) : null}
            </div>
        </Fragment>
    );
});
