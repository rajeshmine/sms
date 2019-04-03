import React from 'react';

function AnswerOption(props) {

  return (
    <li className="answerOption">
      <button 
        type="button"
        id={props.answerType}
        value={props.index}
        className={(props.selectedAnswer === props.index) ? 'selected-btn' : '' }
        onClick={props.onAnswerSelected}
      > <span className="tickmark">&#10003;</span> {props.answerContent}</button>
    </li>
  );

}

export default AnswerOption;