import React from "react";
import FormHelper from "./helper";

const Input = ({ ...props }) => {

  return (
    <div className="form-group">
      <label htmlFor={props.name}>{props.label}</label>
      <input {...props} className="form-control form-control-sm" />
      {props.error && <div className="alert alert-danger">{props.error}</div>}
      {props.helper && <FormHelper content={props.helper} />}
    </div>
  );
};

export default Input;
