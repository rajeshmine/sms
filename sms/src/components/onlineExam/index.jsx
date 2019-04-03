
import 'styles/App.scss';
import 'styles/online-exam.scss';
import React, { Component, Fragment } from 'react';
import Header from 'components/common/header';
import { onlineResult } from 'services/onlineexamService';

// import quizQuestions from 'components/onlineExam/questions';
import Quiz from 'components/onlineExam/exam';
import moment from 'moment';
import ToastService from 'services/toastService'

export default class OnlineExam extends Component {
  constructor() {
    super();
    this.state = {
      time: {},
      timeLeftBlink: '',
      breakRemainingSeconds: '',
      counter: 0,
      questionId: 1,
      question: '',
      answerOptions: [],
      allQuestions: [],
      answer: '',
      selectedAnswers: {},
      result: '',
      quizQuestions: [],
    };
    this.timer = 0;
    this.startTimer = this.startTimer.bind(this);
    this.countDown = this.countDown.bind(this);
  }

  createTime(secs) {
    let hours = Math.floor(secs / 3600);
    secs %= 3600;
    let minutes = Math.floor(secs / 60);
    let seconds = secs % 60;
    let timeObject = {
      "h": hours,
      "m": minutes,
      "s": seconds
    };
    return timeObject;
  }



  async componentDidMount() {
   
    const { Exam } = this.props.location.state
    let startTime = Exam[0].from.time || 1;
    let endTime = Exam[0].to.time || 1;
    var diff = moment(endTime, 'HH:mm A').diff(moment(startTime, 'HH:mm A'), 'minutes');
    diff = diff * 60
    let quizQuestions = await this.questionGet()
   
    if (quizQuestions && quizQuestions.length <= 0) {
      this.props.history.goBack();
    }
    // Initial Question set into the State 
    await this.setState({
      breakRemainingSeconds: diff, quizQuestions, question: quizQuestions && quizQuestions[0] && quizQuestions[0].question,
      answerOptions: quizQuestions && quizQuestions[0] && quizQuestions[0].answers,
      allQuestions: quizQuestions
    })
    let timeLeft = this.createTime(this.state.breakRemainingSeconds);
    this.setState({ time: timeLeft });
    this.startTimer()
  }

  // Question Array Generation from Props Data

  async questionGet() {
    const { AnswerKey } = this.props.location.state
    let questions = AnswerKey && AnswerKey[0] && AnswerKey[0].questions
    let quizQuestions = []
    if (questions) {
      for (let item of questions) {
        let answerindex = ['A', 'B', 'C', 'D']
        let questionNo = 'question' + item.questionNo
        //Question Obj Format     
        let obj = {
          question: item.question,
          answerindex: answerindex.indexOf(item.answer),
          answers: [
            {
              type: questionNo,
              content: item.optionA,
              answer: false
            },
            {
              type: questionNo,
              content: item.optionB,
              answer: false
            },
            {
              type: questionNo,
              content: item.optionC,
              answer: false
            },
            {
              type: questionNo,
              content: item.optionD,
              answer: false
            }
          ]
        }
        quizQuestions.push(obj)
      }
    }
    return quizQuestions

  }


  // Check the current state and potentially (if != 0) start our main function 
  startTimer() {
    if (this.timer === 0) {
      this.timer = setInterval(this.countDown, 1000);
    }
  }

  countDown() {
    // Remove one second, set state so a re-render happens.
    let seconds = this.state.breakRemainingSeconds - 1;
    this.setState({
      time: this.createTime(seconds),
      breakRemainingSeconds: seconds
    });

    // Check if we're at zero, and if so, clear the Interval
    if (seconds === 120) {
      ToastService.Toast(`2 Minutes Left`, "default")
    }
    if (seconds === 60) {
      ToastService.Toast(`1 Minutes Left`, "default")
    }
    if (seconds === 0) {
      ToastService.Toast(`Time Left`, "default")
      // this.props.history.push({
      //     pathname: 'exam/onlineExam',                
      // })     
      clearInterval(this.timer);
    }
  }

  handleAnswerSelected = (e) => {
    var _self = this;
    var obj = _self.state.selectedAnswers;
    var index = parseInt(e.target.value);
   
    var Qindex = (_self.state.counter)
    // create map and store all selecred answers with quiz Questions
    obj[Qindex] = index;
    _self.setState({ selectedAnswers: obj })

  }

  componentWillMount() {
   
  }

  setNextQuestion = () => {
    const { quizQuestions } = this.state
    const counter = this.state.counter + 1;
    const questionId = this.state.questionId + 1;
    this.setState({
      counter: counter,
      questionId: questionId,
      question: quizQuestions[counter].question,
      answerOptions: quizQuestions[counter].answers,
      answer: ''
    });
  }
  setPreviousQuestion = () => {
    const { quizQuestions } = this.state
    const counter = this.state.counter - 1;
    const questionId = this.state.questionId - 1;
    this.setState({
      counter: counter,
      questionId: questionId,
      question: quizQuestions[counter].question,
      answerOptions: quizQuestions[counter].answers,
      answer: ''
    });
  }

  getResults = () => {
    const answersCount = this.state.answersCount;
    const answersCountKeys = Object.keys(answersCount);
    const answersCountValues = answersCountKeys.map((key) => answersCount[key]);
    const maxAnswerCount = Math.max.apply(null, answersCountValues);
    return answersCountKeys.filter((key) => answersCount[key] === maxAnswerCount);
  }

  setResults = (result) => {
    if (result.length === 1) {
      this.setState({ result: result[0] });
    } else {
      this.setState({ result: 'Undetermined' });
    }
  }

  renderQuiz = () => {
    const { quizQuestions, answerOptions, selectedAnswers, counter, answer, questionId, question } = this.state
    return (
      <Quiz viewresults={this.viewresults}
        setNextQuestion={this.setNextQuestion}
        counter={counter}
        setPreviousQuestion={this.setPreviousQuestion}
        answer={answer}
        selectedAnswer={selectedAnswers[this.state.counter]}
        answerOptions={answerOptions}
        questionId={questionId}
        question={question}
        questionTotal={quizQuestions.length}
        onAnswerSelected={this.handleAnswerSelected}
        props={this.props}
      />
    );
  }

  renderResult = () => {


  }
  handleError(...err) {
    return ToastService.Toast("Somthig went wrong.Please try again later", "default");
  }

  viewresults = async (e) => {
    e.preventDefault();
    await this.onlineResultInsert()
    this.setState({ result: true })
  }

  async onlineResultInsert() {
    const { Exam } = this.props.location.state;
    const { session: { data: sessionData } } = this.props;
   
    let remarks
    let result = await this.totalMarks()
    if (result >= Exam[0].cutoff) {
      remarks = 'Very Good'

    } else {
      remarks = 'Low Marks'
    }
   
    let data = {
      "entity": sessionData.entity,
      "department": sessionData.department,
      "batch": sessionData.batch,
      "examId": Exam[0].examId,
      "examName": Exam[0].examName,
      "marks": result,
      "totalMarks": Exam[0].outoff,
      "remarks": remarks,
      "branch": sessionData.branch,
      "client": sessionData.client,
      "studentId": sessionData.uid
    }
   
    try {
      let res = await onlineResult(data)
      
      if (res.data.statusCode === 1) {
        ToastService.Toast("Successfully Attend the Test", "default");
        this.props.history.push({
          pathname: "/result",
        })
      } else {
        this.handleError()
      }
    } catch{
      this.handleError()
    }
  }

  totalMarks = () => {
    const { allQuestions, selectedAnswers } = this.state
    let result = 0
    allQuestions.map((_data, index) => {
      if ((selectedAnswers[index] + 1) === _data.answerindex)
        result += 1
      return ''
    })
    return result
  }

  render() {
    const { time } = this.state
    return (
      <Fragment >
        <Header props={this.props} />
        {this.state.result ?
          null :
          <div className="onlineExamTimer" >{time.m} : {time.s}</div>
        }
        {this.state.result ? this.renderResult() : this.renderQuiz()}
      </Fragment >
    );
  }
}
