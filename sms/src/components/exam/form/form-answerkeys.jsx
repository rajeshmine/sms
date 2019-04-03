import 'styles/App.scss';
import React, { Component, Fragment } from 'react';
import { Col, Row, Container } from 'reactstrap';
import { Form,  } from 'informed';
import { answerKeys } from 'services/examService';

import ToastService from 'services/toastService';
import PHE from 'print-html-element';
export default class PreviewAnswer extends Component {

  constructor(props) {
    super(props);
  
    this.state = {
      data: {
        AnswerKey: []
      },
      isPageLoading: true
    };
  }

  async componentDidMount() {
    const { location: { state } } = this.props.props;
    await this.setState({ data: state })
   
    if (state !== undefined && state.isFromView)
      return this.getAnswerKeys()
  }

  getAnswerKeys = async () => {
    const { data: { client, entity, branch, departmentId, batch, examId, subjectId }, data } = this.state;
    let params = `client=${client}&entity=${entity}&branch=${branch}&departmentId=${departmentId}&batchId=${batch}&examId=${examId}&subjectId=${subjectId}`;
  
    try {
      var res = await answerKeys(params);
      const { data: { statusCode } } = res;
      if (statusCode === 1 && res.data.data["AnswerKey"].length !== 0 && res.data.data["Exam"].length !== 0) {
        data["Exam"] = res.data.data.Exam
        data["AnswerKey"] = res.data.data.AnswerKey
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
  
    const { data: { AnswerKey, Exam }, isPageLoading } = this.state;
  

    return (

      <React.Fragment >

        <Fragment>
          <Container fluid>
            <div className="mb5" style={{ textAlign: 'right' }}>
              <button onClick={this.printDocument} className="btn btn-primary btn-sm">Download PDF</button>
            </div>
            <br />
            <div>
              <Form getApi={this.setFormApi} onSubmit={this.onSubmit}>
                {!isPageLoading && (({ formApi, formState }) => (
                  <div className="d-flex justify-content-center">
                    <div class="questionpaper" id="divToPrint">
                      <section>
                        <Row>
                          <Col sm={12} md={12} style={{ textAlign: 'center' }}>

                            <h5>ANSWER KEY </h5>
                          </Col>
                        </Row>
                        <Row>
                          <Col sm={6} md={6} >
                            <p><b>Exam Name :</b> {Exam[0].examName}  </p>
                            <p><b>Subject Name :</b> {Exam[0].subjectName}   </p>
                            <p><b>Syllabus :</b> {Exam[0].syllabus}  </p>
                          </Col>
                          <Col sm={6} md={6} style={{ textAlign: 'right' }} >
                            <p><b>TOTAL MARKS : </b> 100  </p>
                          </Col>
                        </Row>
                        <div>
                          {AnswerKey.map((item, i) => (
                            <div>
                              <Row>
                                <Col sm={12} md={12}>
                                  <h6 style={{ textTransform: 'uppercase', textAlign: 'center' }}><b>{item["name"]}</b> ( Mark : {item["marks"]} )</h6>
                                </Col>
                              </Row>
                              {item.questions.map((dynamicData) => (
                                <div>
                                  <Row>
                                    <Col sm={12} md={12}>
                                      <p>
                                        <b>{dynamicData["questionNo"]} . </b> {dynamicData["answer"]}
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

      </React.Fragment >
    );
  }
}


