import React from 'react';

import 'styles/App.scss'
const typingspinner = {
    width: "100vw",
    height: "100vh",
    position: "fixed",
    background: "#ffffffd1",
    zIndex: "555",
    display: "flex",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    top: 0,
    left: 0,
  }
const Loading = ({ color }) => {
   
    return (
        <div style={typingspinner} className="typing-spinner">
           <div>  <img src="http://www.broadwaybalancesamerica.com/images/ajax-loader.gif"  alt="Loading" />  </div>
           
        </div>
        

    );
};

export default Loading;