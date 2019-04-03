import React from "react";


const RadioButton = (props) => {
   
    return( <div>
       
          {props.options.map(option => {
            return (
              <label key={option}>
                <input
                  className="form-checkbox"
                  id = {props.name}
                  name={props.name}
                  onChange={props.handleChange}
                  value={option}                  
                  type="radio" /> {option}
              </label>
            );
          })}
       
      </div>
    );
}


export default RadioButton;
