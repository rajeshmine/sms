import React from 'react';

function QuestionCount(props) {

  return (
    <div className="questionCount">
      Question <span>{props.counter}</span> of <span>{props.total}</span>
       {props.counter === props.total ? (<div className="result-link" onClick={props.viewresults}>Submit</div>) : (<div></div>)}
    </div>
  );

}

export default QuestionCount;