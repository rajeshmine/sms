import classnames from 'classnames';
import { Checkbox, asField } from 'informed';
import React, {  Fragment } from 'react';

export const CustomCheckBox = asField(({ fieldState, fieldApi, ...props }) => {
    const { value } = fieldState;

    const {  setTouched } = fieldApi;
    const { field, onChange, onBlur, initialValue, forwardedRef, checkboxLabel, options, getOptionValue, getOptionLabel, radioInline, ...rest } = props;

    return (
        <Fragment>
            <div className="form-group">
                {props.label && <label htmlFor={field}>{props.label}</label>}
                <div className="custom-control custom-checkbox">
                    <Checkbox
                        {...rest}
                        id={field}
                        field={field}
                        ref={forwardedRef}
                        value={value ? value : false}
                        className={classnames("custom-control-input")}
                        onChange={e => {
                            // setValue(e.target.value);
                            if (onChange) {
                                onChange(e);
                            }
                        }}
                        onBlur={e => {
                            setTouched();
                            if (onBlur) {
                                onBlur(e);
                            }
                        }}
                    />
                    <label className="custom-control-label" htmlFor={field}>{checkboxLabel ? checkboxLabel : ''}</label>
                </div>

                {fieldState.error ? (<div className="invalid-field">{fieldState.error}</div>) : null}
            </div>
        </Fragment>
    );
});
