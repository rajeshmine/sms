import React from "react";

const TextArea = ({ ...props }) => {

    return (
        <div className="form-group">
            <label htmlFor={props.name}>{props.label}</label>
            <textarea
                className="form-control"
                {...props}
            />
            {props.error && <div className="alert alert-danger">{props.error}</div>}
        </div>
    );
};

export default TextArea;
