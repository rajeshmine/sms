import classnames from 'classnames';
import { asField } from 'informed';
import React, {  Fragment } from 'react';
import AsyncSelect from 'react-select/lib/Async';
import { autoSuggest } from 'services/autoSuggest';

// import AsyncCreatableSelect from 'react-select/lib/AsyncCreatable';
const promiseOptions = async (searchTerm, type) => {
    const { data: { items } } = await autoSuggest(type, searchTerm)
   
    return items
}

const colourStyles = {
    container: styles => ({ ...styles, padding: 0 }),
    dropdownIndicator: styles => ({ ...styles, padding: '0 5px', margin: 0 }),
    indicatorSeparator: styles => ({ ...styles, padding: 0, margin: 0, backgroundColor: 'transparent' }),
    control: styles => ({ ...styles, padding: 0, paddingLeft: '4px', borderColor: '#dcdcdc', margin: 0, minHeight: '30px', fontSize: '10pt' }),
    input: styles => ({ ...styles, padding: 0, margin: 0 }),
    placeholder: styles => ({ ...styles, padding: 0, margin: 0 }),
    singleValue: (styles, { data }) => ({ ...styles, padding: 0, margin: 0 }),
    valueContainer: styles => ({ ...styles, padding: 0, margin: 0 }),

};

export const SimpleAutoSuggest = asField(({ fieldState, fieldApi, ...props }) => {
    const { value } = fieldState;
    const { setValue, setTouched } = fieldApi;
    const { field, onChange, onBlur, initialValue, forwardedRef, ...rest } = props;

    return (
        <Fragment>
            <div className="form-group">
                {props.label && <label htmlFor={field}>{props.label}</label>}
                {/* , "is-valid": fieldState.touched && !fieldState.error */}
                <AsyncSelect
                    {...rest}
                    id={field}
                    ref={forwardedRef}
                    styles={colourStyles}
                    theme={(theme) => ({
                        ...theme,
                        borderRadius: 0
                    })}
                    value={!value && value !== 0 ? '' : value}
                    className={classnames({ "is-invalid": fieldState.error })}
                    cacheOptions
                    defaultOptions
                    loadOptions={(e) => promiseOptions(e, props.suggestType)}
                        
                    onChange={e => {
                        setValue(e);
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
                {fieldState.error ? (<div className="invalid-field">{fieldState.error}</div>) : null}
            </div>
        </Fragment>
    );
});