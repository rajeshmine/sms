import React from 'react';


const Logo = ({ ...props }) => {
  
    if (props.logoUrl)
        return (<img src={`${props.logoUrl}`} className={`logo ${props.className}`}  alt="Logo" />)
    return (<img src="/assets/images/logo.png" className={`logo ${props.className}`}  alt="Logo" />)
}

export default Logo;