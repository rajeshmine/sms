import React from "react";
import FormHelper from "./helper";


const CheckBox = (props) => {

  return (<React.Fragment>
    {props.options.map(option => {
      return (
        <label key={option}>
          <input
            className="form-checkbox"
            id={props.name}
            name={props.name}
            onChange={props.handleChange}
            value={option}

            type="checkbox" /> {option}
        </label>
      );
    })}
    {props.helper && <FormHelper content={props.helper} />}
  </React.Fragment>
  );
}


export default CheckBox;
