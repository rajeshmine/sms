import React, { Component } from 'react';
import { Col, Row, Container, Button } from 'reactstrap';


// import './style.scss';

import CustomCard from 'components/common/customCard';
export default class ViewClientDetails extends Component {

  constructor(props) {
    super(props)
    this.state = {
      selectedRowDetails: this.props.location.state.ViewclientData,
      committeeMembersDetails: [],
    }
  }

  componentWillMount() {
    if (this.state.selectedRowDetails) {
      this.getSelectedRowDetails()
    }
  }

  getSelectedRowDetails() {
    var commiteeMembers = this.state.selectedRowDetails.organization[0].commitee[0].members;
    var datas = commiteeMembers.map((res, i) => {
      return (
        <Row className="btmspacediv" key={i}>
          <Col sm="4">
            <Row>
              <Col sm="4">
                <p className="leftside">Name</p>
              </Col>
              <Col sm="8">
                <p className="rightside">: {res.displayName}</p>
              </Col>
            </Row>
          </Col>
          <Col sm="4">
            <Row>
              <Col sm="4">
                <p className="leftside">Title</p>
              </Col>
              <Col sm="8">
                <p className="rightside">:{res.title}</p>
              </Col>
            </Row>
          </Col>
          <Col sm="4">
            <Row>
              <Col sm="4">
                <p className="leftside">Picture</p>
              </Col>
              <Col sm="8">
                <p className="rightside">: {res.pictureUrl}</p>
              </Col>
            </Row>
          </Col>
          <Col sm="4">
            <Row>
              <Col sm="4">
                <p className="leftside">Description</p>
              </Col>
              <Col sm="8">
                <p className="rightside">: {res.desc}</p>
              </Col>
            </Row>
          </Col>
        </Row>
      )
    })
    this.setState({
      committeeMembersDetails: datas
    })
  }


  render() {
    return (
      <Container fluid>
        <br />
        <Row>
          <h6>View Client Details</h6>
        </Row>
        <Row>
          <Col sm="12">
            <CustomCard>
              <Row className="myhdr">
                <h5>Institution Details</h5>
              </Row>
              <Row className="btmspacediv">
                <Col sm="4">
                  <Row>
                    <Col sm="4">
                      <p className="leftside">Type</p>
                    </Col>
                    <Col sm="8">
                      <p className="rightside">: {this.state.selectedRowDetails.type}</p>
                    </Col>
                  </Row>
                </Col>
                <Col sm="4">
                  <Row>
                    <Col sm="4">
                      <p className="leftside">Code</p>
                    </Col>
                    <Col sm="8">
                      <p className="rightside">: {this.state.selectedRowDetails.code}</p>
                    </Col>
                  </Row>
                </Col>
                <Col sm="4">
                  <Row>
                    <Col sm="4">
                      <p className="leftside">International Code</p>
                    </Col>
                    <Col sm="8">
                      <p className="rightside">: {this.state.selectedRowDetails.internalCode}</p>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row className="btmspacediv">
                <Col sm="4">
                  <Row>
                    <Col sm="4">
                      <p className="leftside">Name</p>
                    </Col>
                    <Col sm="8">
                      <p className="rightside">: {this.state.selectedRowDetails.displayName}</p>
                    </Col>
                  </Row>
                </Col>

                <Col sm="4">
                  <Row>
                    <Col sm="4">
                      <p className="leftside">Short Name</p>
                    </Col>
                    <Col sm="8">
                      <p className="rightside">: {this.state.selectedRowDetails.shortName}</p>
                    </Col>
                  </Row>
                </Col>
                <Col sm="4">
                  <Row>
                    <Col sm="4">
                      <p className="leftside">Logo</p>
                    </Col>
                    <Col sm="8">
                      :<img style={{ width: "50px" }} src={this.state.selectedRowDetails.organization[0].logo.url} alt="logo" />

                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row className="btmspacediv">
                <Col sm="4">
                  <Row>
                    <Col sm="4">
                      <p className="leftside">Academic Year</p>
                    </Col>
                    <Col sm="8">
                      <p className="rightside">: {this.state.selectedRowDetails.year.academicYear.from} to   {this.state.selectedRowDetails.year.academicYear.to} </p>
                    </Col>
                  </Row>
                </Col>
                <Col sm="4">
                  <Row>
                    <Col sm="4">
                      <p className="leftside">Session Year  </p>
                    </Col>
                    <Col sm="8">
                      <p className="rightside" >: {this.state.selectedRowDetails.year.sessionPeriod.from} to {this.state.selectedRowDetails.year.sessionPeriod.to}</p>
                    </Col>
                  </Row>
                </Col>
                <Col sm="4">
                  <Row>
                    <Col sm="4">
                      <p className="leftside">Vacation Year</p>
                    </Col>
                    <Col sm="8">
                      <p className="rightside">: {this.state.selectedRowDetails.year.vacationPeriod.from} to {this.state.selectedRowDetails.year.vacationPeriod.to}</p>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row className="btmspacediv">
                <Col sm="4">
                  <Row>
                    <Col sm="4">
                      <p className="leftside">Admission Year</p>
                    </Col>
                    <Col sm="8">
                      <p className="rightside">: {this.state.selectedRowDetails.year.admissionPeriod.from} to {this.state.selectedRowDetails.year.admissionPeriod.to}</p>
                    </Col>
                  </Row>
                </Col>
                <Col sm="4">
                  <Row>
                    <Col sm="4">
                      <p className="leftside"> Category  </p>
                    </Col>
                    <Col sm="8">
                      <p className="rightside">: {this.state.selectedRowDetails.organization[0].category[0].name}</p>
                    </Col>
                  </Row>
                </Col>
                <Col sm="4">
                  <Row>
                    <Col sm="4">
                      <p className="leftside"> Affiliation</p>
                    </Col>
                    <Col sm="8">
                      <p className="rightside">: {this.state.selectedRowDetails.organization[0].affiliation.university}</p>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row className="btmspacediv">
                <Col sm="4">
                  <Row>
                    <Col sm="4">
                      <p className="leftside"> Rules </p>
                    </Col>
                    <Col sm="8">
                      <p className="rightside">: {this.state.selectedRowDetails.rules}</p>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row className="myhdr">
                <h5>Communication Details</h5>
              </Row>
              <Row className="btmspacediv">
                <Col sm="4">
                  <Row>
                    <Col sm="4">
                      <p className="leftside">Email Id</p>
                    </Col>
                    <Col sm="8">
                      <p className="rightside">: {this.state.selectedRowDetails.email.primary}</p>
                    </Col>
                  </Row>
                </Col>
                <Col sm="4">
                  <Row>
                    <Col sm="4">
                      <p className="leftside">Mobile Number</p>
                    </Col>
                    <Col sm="8">
                      <p className="rightside">: {this.state.selectedRowDetails.contactNo.primary}</p>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row className="btmspacediv">
                <Col sm="4">
                  <Row>
                    <Col sm="4">
                      <p className="leftside">Door Number</p>
                    </Col>
                    <Col sm="8">
                      <p className="rightside">: {this.state.selectedRowDetails.address[0].address1}</p>
                    </Col>
                  </Row>
                </Col>
                <Col sm="4">
                  <Row>
                    <Col sm="4">
                      <p className="leftside">Landmark</p>
                    </Col>
                    <Col sm="8">
                      <p className="rightside">: {this.state.selectedRowDetails.address[0].landmark}</p>
                    </Col>
                  </Row>
                </Col>
                <Col sm="4">
                  <Row>
                    <Col sm="4">
                      <p className="leftside">Country</p>
                    </Col>
                    <Col sm="8">
                      <p className="rightside">: {this.state.selectedRowDetails.address[0].country}</p>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row className="btmspacediv">
                <Col sm="4">
                  <Row>
                    <Col sm="4">
                      <p className="leftside">Sate</p>
                    </Col>
                    <Col sm="8">
                      <p className="rightside">:  {this.state.selectedRowDetails.address[0].state}</p>
                    </Col>
                  </Row>
                </Col>
                <Col sm="4">
                  <Row>
                    <Col sm="4">
                      <p className="leftside">City</p>
                    </Col>
                    <Col sm="8">
                      <p className="rightside">: {this.state.selectedRowDetails.address[0].city}</p>
                    </Col>
                  </Row>
                </Col>
                <Col sm="4">
                  <Row>
                    <Col sm="4">
                      <p className="leftside">Pincode</p>
                    </Col>
                    <Col sm="8">
                      <p className="rightside">: {this.state.selectedRowDetails.address[0].pincode}</p>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row className="btmspacediv">
                <Col sm="4">
                  <Row>
                    <Col sm="4">
                      <p className="leftside">Fax</p>
                    </Col>
                    <Col sm="8">
                      <p className="rightside">: {this.state.selectedRowDetails.address[0].fax}</p>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row className="myhdr">
                <h5>Committee Details</h5>
              </Row>
              <Row className="btmspacediv">
                <Col sm="4">
                  <Row>
                    <Col sm="4">
                      <p className="leftside">Name</p>
                    </Col>
                    <Col sm="8">
                      <p className="rightside">: {this.state.selectedRowDetails.organization[0].commitee[0].Name}</p>
                    </Col>
                  </Row>
                </Col>
                <Col sm="4">
                  <Row>
                    <Col sm="4">
                      <p className="leftside">Description</p>
                    </Col>
                    <Col sm="8">
                      <p className="rightside">: {this.state.selectedRowDetails.organization[0].commitee[0].desc}</p>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row className="myhdr">
                <h6>Committee Members Details</h6>
              </Row>
              {this.state.committeeMembersDetails}
              <Button style={{ float: "right", marginTop: '-37px' }} color="primary" onClick={() => this.props.history.push('/exterior/view_client')}> Go Back</Button>
            </CustomCard>
          </Col>
        </Row>
      </Container>
    );
  }
}


