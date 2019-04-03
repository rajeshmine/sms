import { Input, PreviewImage, Textarea } from 'components/common/forms';
import { AddressComponent,  } from 'components/common/forms/address';
import Header from 'components/common/header';
import Loading from 'components/common/loading';
import SideNav from 'components/common/sideNav';
import { Form, Scope } from 'informed';
import React, { Component, Fragment } from 'react';
import { Col, Row } from 'reactstrap';
import DRP1 from 'components/common/forms/date-range-picker';
import moment from 'moment';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { NavLink } from 'react-router-dom';

class ClientView extends Component {
  state = {
    data: {
      type: 'client', code: '', internalCode: '',
      name: '', shortName: '',
      logo: '', icon: '',
      address: {
        no: '', street: '',
        address1: '', address2: '',
        city: '', state: '', country: '',
        pincode: '',
        email: '', contactno: '', fax: ''
      },
      affiliation: '',
      rules: '',
      committe: '',
      entity: [],
      ref: { client: [], entity: [], branch: [], department: [], batch: [] },
      status: 'active'
    },
    errors: {},
    isLoading: false
  };


  async componentDidMount() {
    const { match: { params: { id } } } = this.props; 
    let sampleData = {};
    if (id !== 'new') sampleData = await this.getSampleData();
    // this.setState({ data: sampleData })
    if (!sampleData.entity || (sampleData.entity && sampleData.entity.length <= 0)) {
      let from = new Date().toLocaleDateString(), to = new Date().toLocaleDateString();
      sampleData['entity'] = [{
        address: {
          address1: "",
          address2: "",
          city: "",
          no: "",
          pincode: "",
          street: ""
        },
        uid: '', password: '',

        admission: { from, to },
        academic: { from, to },
        vacation: { from, to },
      }];
    }
    this.formApi.setValues(sampleData);
  }


  getSampleData = async () => { 
    let { location: { state: { row } } } = this.props;
    // const { data: { statusCode, data } } = await clientData(id);
    // if (statusCode !== 0) return data[0];
    row['ref'] = { client: [], entity: [], branch: [], department: [], batch: [] }
    row['password'] = row['defaultpassword'];
    return row;
  }


  setFormApi = (formApi) => {
    this.formApi = formApi;
  }

  render() {
    const { isPageLoading } = this.state;

    const { session, match: { params: { id } } } = this.props;
    return (
      <Fragment>
        {session &&
          <div className="row no-gutters bg-white page-client">
            <Header props={this.props} />
            <div className="col-3 col-md-2 sidemenu-wrapper">
              <SideNav props={this.props} />
            </div>
            <div className="col-9 col-md-10 p-3 content">
              {isPageLoading && <Loading />}
              {!isPageLoading &&
                <Fragment>
                  <Breadcrumb>
                    <BreadcrumbItem><NavLink to="/dashboard">Dashboard</NavLink></BreadcrumbItem>
                    <BreadcrumbItem><NavLink to="/client/list">Client</NavLink></BreadcrumbItem>
                    <BreadcrumbItem active>{id}</BreadcrumbItem>

                    <BreadcrumbItem active>View</BreadcrumbItem>

                  </Breadcrumb>
                  
                  <Form getApi={this.setFormApi} onSubmit={this.onSubmit}>
                    {/* <FormStateInfo /> */}

                    {({ formApi, formState }) => (
                      <div>
                        <section>
                        <h6>Client Details</h6>
                          <Row>
                            <Col sm={6} md={4}>
                              <Input
                                field="code" label="Client Code"
                                readOnly />
                            </Col>
                            <Col sm={6} md={4}>
                              <Input field="internalCode" label="Reference code" readOnly />
                            </Col>
                            <Col sm={12} md={4}>
                              <Input
                                field="shortName" label="Short name" readOnly

                              />
                            </Col>
                            <Col sm={12} md={12}>
                              <Input
                                field="name" label="Name of the institute" readOnly

                              />
                            </Col>
                          </Row>
                        </section>
                        <section>
                          <h6>Client Credentials</h6>
                          <Row>
                            <Col sm={12} md={2}>
                              <Input
                                field="uid" label="User Id*" readOnly

                              />
                            </Col>
                            <Col sm={12} md={4}>
                              <Input
                                field="email" label="Email Id*" readOnly />
                            </Col>
                            <Col sm={12} md={4}>
                              <Input
                                field="password" label="Password*" readOnly />
                            </Col>
                          </Row>
                        </section>
                        <section>
                          <h6>Personalization</h6>
                          <Row>
                            <Col sm={12} md={6}>
                              <Input
                                field="logo" label="Header Logo" readOnly

                              />
                              <PreviewImage
                                src={formState.values.logo}
                                sizes={[["sm", "Tables"], ["md", "Logo"], ["lg", "Login"]]}
                              />
                            </Col>
                            <Col sm={12} md={6}>
                              <Input
                                field="icon" label="Icon" readOnly

                              />
                              <PreviewImage
                                src={formState.values.icon}
                                sizes={[["xs", "Icon/Browser tab"], ["sm", "Metadata"]]}
                              />

                            </Col>
                          </Row>
                        </section>

                        <section>
                          <h6>
                            <span>Entities</span>

                          </h6>
                          {formState.values.entity && formState.values.entity.map((entity, i) =>
                            <Scope scope={`entity[${i}]`} key={i}>

                              <Row>
                                <Col sm={6} md={2}>
                                  <Input field="code" label="Entity Code" readOnly />
                                </Col>
                                <Col sm={12} md={4}>
                                  <Input
                                    field="name" label="Name of the Entity" readOnly

                                  />
                                </Col>
                              </Row>
                              <Row>
                                <Col sm={6} md={2}>
                                  <Input
                                    field="branchId" label="Branch Id" readOnly

                                  />
                                </Col>
                                <Col sm={12} md={4}>
                                  <Input
                                    field="branchName" label="Branch Name*" readOnly

                                  />
                                </Col>
                              </Row>
                              <Row>
                                <Col>
                                  <h6>
                                    <span>Entity Credentials</span>
                                  </h6>
                                </Col>
                              </Row>
                              <Row>
                                <Col sm={12} md={2}>
                                  <Input
                                    field="uid" label="User Id*" readOnly

                                  />
                                </Col>
                                <Col sm={12} md={4}>
                                  <Input
                                    field="email" label="Email Id*" readOnly

                                  />
                                </Col>
                                <Col sm={12} md={4}>
                                  <Input
                                    field="password" label="Password*" readOnly

                                  />
                                </Col>
                              </Row>
                              <Row>
                                <Col sm={12} md={4}>
                                  <label>Admission</label>
                                  <DRP1 field="admission" label="Admission Period" id="addmission" startDate={moment(formState.values.entity[i].admission.from)} endDate={moment(formState.values.entity[i].admission.to)} disabled />
                                </Col>
                                <Col sm={12} md={4}>
                                  <label>Acadamic</label>
                                  <DRP1 field="academic" label="Academic Period" id="academic" startDate={moment(formState.values.entity[i].academic.from)} endDate={moment(formState.values.entity[i].academic.to)} disabled />
                                </Col>
                                <Col sm={12} md={4}>
                                  <label>Vacation</label>
                                  <DRP1 field="vacation" label="Vacation Period" id="vacation" startDate={moment(formState.values.entity[i].vacation.from)} endDate={moment(formState.values.entity[i].vacation.to)} disabled />
                                </Col>
                              </Row>
                              <br />
                              <section>
                                <h6>Communication Address</h6>
                                <AddressComponent
                                  scope="address" readOnly isDisabled

                                />
                              </section>


                              <hr />

                            </Scope>
                          )}
                        </section>


                        <section>
                          <h6>Additional Details</h6>
                          <Row>
                            <Col sm={12} md={12}>
                              <Textarea
                                field="rules" label="Rules" rows={10} readOnly

                              />
                            </Col>
                          </Row>
                        </section>


                      </div>
                    )}
                  </Form>
                </Fragment>
              }
            </div>
          </div>
        }
      </Fragment >
    );
  }
}

export default ClientView;




