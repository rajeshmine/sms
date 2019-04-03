import classnames from 'classnames';
import { RadioGroup, Radio, asField } from 'informed';
import React, {  Fragment } from 'react';

export const CustomRadio = asField(({ fieldState, fieldApi, ...props }) => {
    const { value } = fieldState;

    const {  setTouched } = fieldApi;
    const { field, onChange, onBlur, initialValue, forwardedRef, options, getOptionValue, getOptionLabel, radioInline, ...rest } = props;

    return (
        <Fragment>
            <div className="form-group">
                {props.label && <label htmlFor={field}>{props.label}</label>}
                <div>
                    <RadioGroup
                        {...rest}
                        id={field}
                        field={field}
                        value={value}
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
                        {options && options.map((option, i) =>
                            <div className={classnames('custom-control custom-radio', { 'custom-control-inline': radioInline })} key={i}>
                                <Radio value={getOptionValue ? getOptionValue : (option.value ? option.value : option)} id={`${field}-${i}`} className="custom-control-input" />
                                <label className="custom-control-label" htmlFor={`${field}-${i}`}>{getOptionLabel ? getOptionLabel : (option.label ? option.label : option)}</label>
                            </div>
                        )}
                    </RadioGroup>
                </div>
                {fieldState.error ? (<div className="invalid-field">{fieldState.error}</div>) : null}
            </div>
        </Fragment>
    );
});
