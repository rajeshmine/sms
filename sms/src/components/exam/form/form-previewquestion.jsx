import "styles/App.scss";
import React, { Component, Fragment } from "react";
import { Col, Row, Container } from "reactstrap";
import { Form,  } from "informed";
import { viewQuestions } from 'services/examService';

import ToastService from "services/toastService";
import PHE from 'print-html-element';
export default class PreviewQuestion extends Component {
  constructor(props) {
    super(props);
   
    this.state = {
      data: {
        Questionpaper: []
      },
      isPageLoading: true
    };
  }

  async componentDidMount() {
    const { location: { state } } = this.props.props;
    await this.setState({ data: state })
  
    if (state !== undefined && state.isFromView)
      return this.getQuestions()
  }

  getQuestions = async () => {
    const { data: { client, entity, branch, departmentId, batch, examId, subjectId }, data } = this.state;
    let params = `client=${client}&entity=${entity}&branch=${branch}&departmentId=${departmentId}&batchId=${batch}&examId=${examId}&subjectId=${subjectId}`;
   
    try {
      var res = await viewQuestions(params);
      const { data: { statusCode } } = res;
      if (statusCode === 1 && res.data.data["Questionpaper"].length !== 0 && res.data.data["Exam"].length !== 0) {
        data["Exam"] = res.data.data.Exam
        data["Questionpaper"] = res.data.data.Questionpaper
        await this.setState({ data, isPageLoading: false })
      } else {
        ToastService.Toast("No preview available", "default");
        await this.redirectTo();
        // await this.setState({ isPageLoading: true })
        // ToastService.Toast("Somthig went wrong.Please try again later", "default");
      }
    } catch (err) {
      this.handleError(err)
    }
  };

  handleError(...err) {
  
    return ToastService.Toast("Somthig went wrong.Please try again later", "default");
  }
  printDocument() {
    const input = document.getElementById('divToPrint')
    const opts = {
      printMode: 'A4',
      stylesheets: ["https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"],
      styles: [],
    };
    PHE.printElement(input, opts)
  }

  redirectTo = async () => {
    const { props: { history } } = this.props
    await history.goBack();
  }



  render() {
   
    const { data: { Questionpaper, Exam }, isPageLoading } = this.state;
  

    return (
      <React.Fragment>
        <Fragment>
          <Container fluid>
            <div className="mb5" style={{ textAlign: "right" }}>
              <button
                onClick={this.printDocument}
                className="btn btn-primary btn-sm"
              >
                Download PDF
              </button>
            </div>
            <br />
            <div>
              <Form getApi={this.setFormApi} onSubmit={this.onSubmit}>

                {!isPageLoading && (({ formApi, formState }) => (
                  <div className="d-flex justify-content-center">

                    <div class="questionpaper" id="divToPrint">

                      <section>
                        {/* <Row>
                          <Col sm={12} md={12}>
                            <h5>Question Paper</h5>
                          </Col>
                        </Row> */}
                        <Row>
                          <Col sm={6} md={6} style={{ textAlign: "left" }}>
                            <p>Student REG. NO </p>
                          </Col>
                          <Col sm={6} md={6} style={{ textAlign: "right" }}>
                            <p>SUbject  CODE : 123</p>
                          </Col>
                        </Row>

                        <Row>
                          <Col sm={12} md={12} style={{ textAlign: "center" }}>
                            <h6>Exam Name {Exam[0].examName} </h6>

                            <h5>Subject Name {Exam[0].subjectName} </h5>

                            <p> Syllabus : {Exam[0].syllabus} </p>
                          </Col>
                        </Row>

                        <Row>
                          {/* <Col sm={6} md={6} style={{ textAlign: "left" }}>
                              <h6> 
                                  DATE : {Exam[0].date} , TIME : {Exam[0].time}  
                              </h6>
                            </Col> */}
                          <Col sm={12} md={12} style={{ textAlign: "right" }}>
                            <h6>TOTAL MARKS : 100</h6>
                          </Col>
                        </Row>

                        <div>

                          {Questionpaper.map((item, i) => (

                            <div>
                              <Row>
                                <Col sm={2} md={2} />
                                <Col sm={8} md={8} style={{ textAlign: 'center' }}>
                                  <strong>
                                    <p style={{ textTransform: 'uppercase' }}>{item["name"]}</p>
                                  </strong>

                                  <p style={{ fontStyle: "italic" }}>
                                    {
                                      item["instruction"]
                                    }
                                  </p>
                                </Col>
                                <Col sm={2} md={2} />
                              </Row>
                              <Row>
                                <Col sm={12} md={12} style={{ textAlign: 'right' }}>
                                  <p style={{ textTransform: 'uppercase' }}>Mark : <b>{item["marks"]}</b></p>
                                </Col>
                              </Row>

                              {item.sectionType === 'MCQ' && item.questions.map((dynamicData) => (

                                <div>
                                  <Row>
                                    <Col sm={12} md={12}>
                                      <p>
                                        <b>{dynamicData["questionNo"]} . </b> {dynamicData["question"]}
                                      </p>
                                    </Col>
                                  </Row>
                                  <Row>
                                    <Col sm={1} md={1} />
                                    <Col sm={10} md={10}>
                                      <p> A. {dynamicData["optionA"]}</p>
                                      <p> B. {dynamicData["optionB"]}</p>
                                      <p> C. {dynamicData["optionC"]}</p>
                                      <p> D. {dynamicData["optionD"]}</p>
                                    </Col>
                                    <Col sm={1} md={1} />
                                  </Row>
                                </div>
                              ))}
                              {item.sectionType === 'Short' && item.questions.map((dynamicData) => (
                                <div>
                                  <Row>
                                    <Col sm={12} md={12}>
                                      <p>
                                        <b>{dynamicData["questionNo"]} . </b> {dynamicData["question"]}
                                      </p>
                                    </Col>
                                  </Row>

                                </div>

                              ))}
                              {item.sectionType === 'Long' && item.questions.map((dynamicData, i) => (

                                <div>
                                  <Row>
                                    <Col sm={12} md={12}>
                                      <p>
                                        <b>{dynamicData["questionNo"]} . </b> {dynamicData["question"]}
                                      </p>
                                    </Col>
                                  </Row>

                                </div>
                              ))}
                            </div>

                          ))}


                        </div>



                      </section>

                    </div>






                  </div>
                ))}
              </Form>
            </div>
          </Container>
        </Fragment>

      </React.Fragment>
    );
  }
}
