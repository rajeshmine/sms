import React from "react";

const Button = ({ ...props }) => {  
   
    return(
        <button 
        {...props} >{props.value}
        </button>)
}

export default Button;