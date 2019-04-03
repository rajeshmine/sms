import React from 'react';
import Question from 'components/onlineExam/question';
import QuestionCount from 'components/onlineExam/questionCount';
import AnswerOption from 'components/onlineExam/answerOption';

function Quiz(props) {
  
    function renderAnswerOptions(key, index) {
        return (
            <AnswerOption
                index={index}
                key={key.content}
                answerContent={key.content}
                answerType={key.type}
                answer={props.answer}
                questionId={props.questionId}
                selectedAnswer={props.selectedAnswer}
                onAnswerSelected={props.onAnswerSelected}

            />
        );
    }
    const { Exam } = props.props.location.state

    return (
        <div key={props.questionId} className="quiz-story">
            <div className="onlineExamTitle"> <h6>{Exam[0].examName}</h6></div>
            <Question content={props.question} />
            <ul className="answerOptions">
                {props.answerOptions && props.answerOptions.map(renderAnswerOptions)}
            </ul>
            <div className="bottom-footer" >

                {props.counter > 0 ? (<button className="Previous-btn" onClick={props.setPreviousQuestion} >Previous</button>) : (<div></div>)}

                {props.counter < props.questionTotal-1 ? (<button className="next-btn" onClick={props.setNextQuestion} >Next</button>) : (<div></div>)}

            </div>
            <QuestionCount counter={props.counter} viewresults={props.viewresults}
                
                total={props.questionTotal}
            />

        </div>
    );
}


export default Quiz;