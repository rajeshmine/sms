import React from "react";
import FormHelper from "./helper";

const Select = ({ ...props }) => {
  return (
    <div className="form-group" key={props.name}>
      <label htmlFor={props.name}>{props.label}</label>
      <select name={props.name} id={props.name} {...props} className="form-control form-control-sm">
        <option disabled value="">Select {props.label}</option>
        {props.options.map(option => (
          <option key={option[props.optionid]} value={option[props.optionid]}>
            {option[props.optionname]}
          </option>
        ))}
      </select>
      {props.error && <div className="alert alert-danger">{props.error}</div>}
      {props.helper && <FormHelper content={props.helper} />}

    </div>
  );
};

export default Select;
