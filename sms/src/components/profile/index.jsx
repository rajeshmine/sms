import 'styles/App.scss';
import React, { Component, Fragment } from 'react';
import Header from 'components/common/header';
import SideNav from 'components/common/sideNav';
import { Form, Scope } from 'informed';
import { Input, Textarea } from 'components/common/forms';
import { getCurrentUser } from 'services/authService';
import { getsuserListData } from 'services/userService';

import {
  Breadcrumb,
  BreadcrumbItem,
   Container, Row, Col

} from 'reactstrap';
import { NavLink } from 'react-router-dom';
export default class Profile extends Component {
  state = {
    data: {
    },
  }

  async componentDidMount() {
    const sampleData = await this.getSampleData()
    this.formApi.setValues(sampleData);
  }

  getSampleData = async () => {
    const { uid, clientid, entityid, branch } = this.props.match.params
    let primaryaddress = '', secondaryaddress = '', data, userdata
    if (clientid) {
      let params = `usersList?uid=${uid}&type=user&client=${clientid}&entity=${entityid}&branch=${branch}`
      data = await getsuserListData(params)
      userdata = data.data.data[0]
    } else {
      data = await getCurrentUser()
      userdata = data.data
    }
    let primary = ((userdata.communication && userdata.communication[0] && userdata.communication[0].primary && userdata.communication[0].primary[0] )|| '')
    let secondary = ((userdata.communication && userdata.communication[0] && userdata.communication[0].secondary && userdata.communication[0].primary[0] )|| '')
    if (primary !== '' || secondary !== '') {
      primaryaddress = primary.no + ',' + primary.street + ',' + primary.address1 + ',' + primary.address2 + ',' + primary.city + ',' + primary.state.label + ',' + primary.pincode
      userdata.communication[0] = { primaryaddress, secondaryaddress }
      secondaryaddress = secondary.no + ',' + secondary.street + ',' + secondary.address1 + ',' + secondary.address2 + ',' + secondary.city + ',' + secondary.state.label + ',' + secondary.pincode
      userdata.communication[0] = { primaryaddress, secondaryaddress }
    }
    return userdata
  }

  setFormApi = (formApi) => {
    this.formApi = formApi;
  }
  render() {
  
    const {session} = this.props
    return (
      <React.Fragment >
      {session && 
        <div className="row no-gutters bg-white page-clients">
          <Header props={this.props} />
          <div className="col-3 col-md-2">
            <SideNav props={this.props} />}
          </div>
          <div className="col-9 col-md-10 p-3 content">
            <Fragment>
              <Breadcrumb>
                <BreadcrumbItem><NavLink to="/dashboard">Dashboard</NavLink></BreadcrumbItem>
                <BreadcrumbItem active>Profile</BreadcrumbItem>
              </Breadcrumb>
              <Container fluid>
                <Form getApi={this.setFormApi} onSubmit={this.onSubmit}>
                  {({ formApi, formState }) => (
                    <div className="page-user">
                      <h6>User Profile</h6>
                      <section>
                        <h6>Basic Info</h6>
                        <Row>
                          <Col sm={6} md={3}>
                            <Input
                              field="uid" label="User Login Id" name="uid" readOnly
                            />
                          </Col>
                          <Col sm={6} md={3}>
                            <Input
                              field="email" label="Email Id" name="email" readOnly
                            />
                          </Col>
                          <Col sm={6} md={3}>
                            <Input
                              field="mobile" label="Mobile Number" name="mobile" readOnly
                            />
                          </Col>
                        </Row>
                      </section>
                      {formState.values.basic &&
                        <section>
                          <h6>Personal Details</h6>
                          {formState.values.basic.map((basic, i) =>
                            <Scope scope={`basic[${i}]`} key={i}>
                              <Row>
                                <Col sm={2} md={1}>
                                  <Input
                                    field="title" label="Title" name="title" readOnly
                                  />
                                </Col>
                                <Col sm={6} md={3}>
                                  <Input
                                    field="firstName" label="First Name" name="firstName" readOnly
                                  />
                                </Col>
                                <Col sm={6} md={3}>
                                  <Input
                                    field="middleName" label="Middle Name" name="middleName" readOnly
                                  />
                                </Col>
                                <Col sm={6} md={3}>
                                  <Input
                                    field="lastName" label="Last Name" name="lastName" readOnly
                                  />
                                </Col>
                                <Col sm={4} md={2}>
                                  <Input
                                    field="gender" label="Gender" name="gender" readOnly
                                  />
                                </Col>
                              </Row>
                              <Row>
                                <Col sm={6} md={3}>
                                  <Input
                                    field="dob" label="Date of Birth" name="dob" readOnly
                                  />
                                </Col>
                                <Col sm={6} md={3}>
                                  <Input
                                    field="birthPlace" label="Birth Place" name="birthPlace" readOnly
                                  />
                                </Col>
                                <Col sm={6} md={3}>
                                  <Input
                                    field="bloodGroup" label="Blood Group" name="bloodGroup" readOnly
                                  />
                                </Col>
                                <Col sm={6} md={3}>
                                  <Input
                                    field="motherTongue" label="Mother Tougue" name="motherTongue" readOnly
                                  />
                                </Col>
                              </Row>
                              <Row>
                                <Col sm={6} md={3}>
                                  <Input
                                    field="caste" label="Caste" name="caste" readOnly
                                  />
                                </Col>
                                <Col sm={6} md={3}>
                                  <Input
                                    field="religion" label="Religion" name="religion" readOnly
                                  />
                                </Col>
                                <Col sm={6} md={3}>
                                  <Input
                                    field="aadharNo" label="Aadhar Number" name="aadharNo" readOnly
                                  />
                                </Col>
                                <Col sm={6} md={3}>
                                  <Input
                                    field="nationality" label="Nationality" name="nationality" readOnly
                                  />
                                </Col>
                              </Row>
                            </Scope>
                          )}
                        </section>
                      }
                      {formState.values.communication &&
                        <section>
                          <h6>Address</h6>
                          {formState.values.communication.map((communication, i) =>
                            <Scope scope={`communication[${i}]`} key={i}>
                              <Row>
                                <Col sm="12" md="12">
                                  <Textarea
                                    field="primaryaddress" label="Primary Address" name="primaryaddress" readOnly
                                  />
                                </Col>
                                <Col sm="12" md="12">
                                  <Textarea
                                    field="secondaryaddress" label="Secondary Address" readOnly name="secondaryaddress"
                                  />
                                </Col>
                              </Row>
                            </Scope>
                          )}
                        </section>
                      }
                      {formState.values.education &&
                        <section>
                          <h6>Education Details</h6>
                          {formState.values.education.map((education, i) =>
                            <Scope scope={`education[${i}]`} key={i}>
                              <Row>
                                <Col sm={12} md={2}>
                                  <Input field="type" label="Course Type" name="type" readOnly />

                                </Col>
                                <Col sm={12} md={2}>
                                  <Input field="percentage" label="Percentage" readOnly />
                                </Col>
                                <Col sm={12} md={2}>
                                  <Input field="name" label="Name" readOnly />
                                </Col>
                                <Col sm={12} md={2}>
                                  <Input field="affiliate" label="Affiliate To" readOnly />
                                </Col>
                                <Col sm={12} md={2}>
                                  <Input field="from" label="From" readOnly />
                                </Col>
                                <Col sm={12} md={2}>
                                  <Input field="to" label="To" readOnly />
                                </Col>

                              </Row>
                            </Scope>
                          )}
                        </section>
                      }
                      {formState.values.projects &&
                        <section>
                          <h6>Project Details</h6>
                          {formState.values.projects.map((projects, i) =>
                            <Scope scope={`projects[${i}]`} key={i}>
                              <Row>
                                <Col sm={12} md={3}>
                                  <Input field="projectName" label="Project Name" name="projectName" readOnly />
                                </Col>
                                <Col sm={12} md={3}>
                                  <Input field="projectDate" label="Project Date" readOnly />
                                </Col>
                              </Row>
                              <Row>
                                <Col sm={12} md={3}>
                                  <Input field="projectStatus" label="Project Status" readOnly />
                                </Col>
                              </Row>
                              <Row>
                                <Col sm={12} md={4}>
                                  <Input field="associatedWith" label="Associated With" readOnly />
                                </Col>
                                <Col sm={12} md={8}>
                                  <Input field="projectURL" label="Project URL" readOnly />
                                </Col>
                              </Row>
                              <Row>
                                <Col sm={12} md={12}>
                                  <Textarea field="projectdescription" label="Project Description" readOnly />
                                </Col>
                              </Row>
                            </Scope>
                          )}
                        </section>
                      }
                      {formState.values.organization &&
                        <section>
                          <h6>Organization Details</h6>
                          {formState.values.organization.map((organization, i) =>
                            <Scope scope={`organization[${i}]`} key={i}>
                              <Row>
                                <Col sm={6} md={3}>
                                  <Input
                                    field="role" label="Role" name="role" readOnly
                                  />
                                </Col>
                                <Col sm={6} md={3}>
                                  <Input
                                    field="admissionNo" label="Admission Number" name="admissionNo" readOnly
                                  />
                                </Col>
                                <Col sm={6} md={3}>
                                  <Input
                                    field="email" label="Email ID" name="email" readOnly
                                  />
                                </Col>
                                <Col sm={6} md={3}>
                                  <Input
                                    field="joiningDate" label="Joining Date" name="joiningDate" readOnly
                                  />
                                </Col>
                              </Row>
                            </Scope>
                          )}
                        </section>
                      }
                      {formState.values.parent &&
                        <section>
                          <h6>Parent Details</h6>
                          {formState.values.parent.map((parent, i) =>
                            <Scope scope={`parent[${i}]`} key={i}>
                              <Row>
                                <Col sm={12} md={4}>
                                  <Input field="relationship" label="Relationship Type" name="relationship" readOnly />

                                </Col>
                                <Col sm={12} md={4}>
                                  <Input field="fullName" label="Full Name" readOnly />
                                </Col>
                                <Col sm={12} md={4}>
                                  <Input field="email" label="Email Id" readOnly />
                                </Col>
                                <Col sm={12} md={4}>
                                  <Input field="occupation" label="Occupation To" readOnly />
                                </Col>
                                <Col sm={12} md={4}>
                                  <Input field="income" label="Income" readOnly />
                                </Col>
                                <Col sm={12} md={4}>
                                  <Input field="contactNo" label="Contact Number" readOnly />
                                </Col>

                              </Row>
                            </Scope>
                          )}
                        </section>
                      }
                      {formState.values.extracurricular &&
                        <section>
                          <h6>Extra Details</h6>
                          {formState.values.extracurricular.map((extracurricular, i) =>
                            <Scope scope={`extracurricular[${i}]`} key={i}>
                              <Row>
                                <Col sm={6} md={3}>
                                  <Input
                                    field="title" label="Title" name="title" readOnly
                                  />
                                </Col>
                                <Col sm="12" md="12">
                                  <Textarea
                                    field="description" label="Description" readOnly name="description"
                                  />
                                </Col>
                              </Row>
                            </Scope>
                          )}
                        </section>
                      }
                    </div>
                  )}

                </Form>
              </Container>
            </Fragment>
          </div>
        </div>
      }
      </React.Fragment >
    );
  }
}

