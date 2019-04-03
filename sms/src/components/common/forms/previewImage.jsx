import React, { Fragment } from 'react';

export const PreviewImage = ({ src, sizes, ...props }) => {
    return (
        <Fragment>
            <div className="preview-image">
                {props.label && <label htmlFor={props.id}>{props.label}</label>}
                {sizes && sizes.map((size, i) =>
                    <div className="item" key={i}>
                        <div className={`holder ${size[0]}`} style={{ backgroundImage: `url(${src})` }}></div>
                        <small>{size[1]}</small>
                    </div>
                )}
                {props.error ? (<small className="text text-danger">{props.error}</small>) : null}
            </div>
        </Fragment>
    );
};
