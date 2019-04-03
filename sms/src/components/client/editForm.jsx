import { Input, PreviewImage, Textarea } from 'components/common/forms';
import { AddressComponent, addressSchema } from 'components/common/forms/address';
import Header from 'components/common/header';
import Loading from 'components/common/loading';
import SideNav from 'components/common/sideNav';
import { Form, Scope } from 'informed';
import Joi from 'joi-browser';
import React, { Component, Fragment } from 'react';
import DRP1 from 'components/common/forms/date-range-picker';
import moment from 'moment';
import { Breadcrumb, BreadcrumbItem, Row, Col } from 'reactstrap';
import { NavLink } from 'react-router-dom';

import _ from 'lodash';

import { saveClient, updateClient } from 'services/clientService'
// import { post } from 'axios';
// import { apiUrl } from './../../config.json'
import {FileUpload} from 'services/Fileupload'

class ClientEdit extends Component {
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
    entityImages: [],
    errors: {},
    isLoading: false
  };

  optionSchema = {
    label: Joi.string().empty('').optional(),
    value: Joi.any().optional()
  }

  rangeDateSchema = {
    from: Joi.string().required(),
    to: Joi.string().required()
  }

  shortEntitySchema = {
    name: Joi.string().required(),
    code: Joi.string().empty('').optional(),

    admission: Joi.object(this.rangeDateSchema),
    vacation: Joi.object(this.rangeDateSchema),
    academic: Joi.object(this.rangeDateSchema),

  }

  schema = {
    cuid: Joi.string().required().label("User id"),
    cpassword: Joi.string().required().label("Password"),
    cemail: Joi.string().required().label("Email"),
    uid: Joi.string().required().label("User id"),
    password: Joi.string().required().label("password"),
    email: Joi.string().required().label("Email"),
    branchId: Joi.any().optional(),
    branchName: Joi.string().required().label("Branch Name"),
    addremail: Joi.string().required().label("Addremail"),
    mobile: Joi.string().required().label("Mobile Number"),
    type: Joi.string().required().label("Type"),
    code: Joi.string().alphanum().min(3).max(30).optional().label("Code"),
    internalCode: Joi.any().optional(),
    name: Joi.string().required().label('Name'),
    shortName: Joi.string().required().label("Short Name"),
    logo: Joi.any().optional(),
    icon: Joi.any().optional(),
    address: Joi.object(addressSchema).label("Address"),
    affiliation: Joi.any().optional(),
    rules: Joi.any().optional(),
    committe: Joi.any().optional(),
    entity: Joi.array().items(Joi.object(this.shortEntitySchema)).label("Entity"),
    ref: Joi.object({
      client: Joi.array().items(Joi.any()).label("Client"),
      entity: Joi.array().items(Joi.any()).label("Entity"),
      branch: Joi.array().items(Joi.any()).label("Branch"),
      department: Joi.array().items(Joi.any()).label("Department"),
      batch: Joi.array().items(Joi.any()).label("Batch")
    })
  };

  async componentDidMount() {
    const { match: { params: { id, type } } } = this.props;
    const { data } = this.state;
    data['type'] = type;
    await this.setState({ data })

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
          street: "",
          logo: ''
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

  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };

  setFormApi = (formApi) => {
    this.formApi = formApi;
  }

  dateValue = async (date, i, feild) => {
    const data = this.formApi.getState().values;
    const { from, to } = date;
    data.entity[i][feild] = { from: new Date(from).toLocaleDateString(), to: new Date(to).toLocaleDateString() };
    this.formApi.setValues(data);


    const data1 = this.formApi.getState().values;

    await _.keys(_.map(data1.entity)).forEach((item) => {

    });
  }

  dateFeildBlur = (e) => {

  }



  saveClient = async (data) => {

    var res = await saveClient(data);

    const { data: { statusCode } } = res;
    if (statusCode !== 1) return alert('Somthing went wrong.Please try again later.');
    this.redirectTo();
  }

  updateClient = async (uid, data) => {

    var res = await updateClient(uid, data);

    const { data: { statusCode } } = res;
    if (statusCode !== 1) return alert('Somthing went wrong.Please try again later.');
    this.redirectTo();
  }

  redirectTo = async () => {
    const { data: { type } } = this.state;
    let url = '';
    switch (type) {
      case "client":
        url = `/client/list`;
        break;
      // case "entity":
      //   url = `/${clientid}/entity/list`;
      //   break;
      // case "branch":
      //   url = `/${clientid}/${entityId}/branch/list`;
      //   break;
      default:
        url = `/client/list`;
        break;
    }
    await this.props.history.push({
      pathname: url
    });
  }

  addShortClient = async () => {
    let from = moment(new Date().toLocaleDateString()),
      to = moment(new Date().toLocaleDateString());

    const data = {
      code: '', name: '', logo: '',
      uid: '', password: '',
      admission: { from, to },
      academic: { from, to },
      vacation: { from, to },
    };
    const values = this.formApi.getState().values;
    var entity = values.entity;
    entity.push(data)

    this.formApi.setValues({ ...values, entity: entity });
  }


  removeShortClient = (i) => {
    const values = this.formApi.getState().values;
    let entity = values.entity;
    entity.splice(i, 1);
    this.formApi.setValues({ ...values, entity: entity });
  }

  handleEntityImage = async (i, { target: { files } }) => {
    const { entityImages } = this.state;   
    await entityImages.push({ location: i, file: await FileUpload(files[0]).then((res) => res.data.name) })
    await this.setState({ entityImages });
  }

  // fileUpload(file) {
  //   const url = `${apiUrl}/uploadfile`;
  //   const formData = new FormData();
  //   formData.append('file', file)
  //   const config = {
  //     headers: { 'content-type': 'multipart/form-data' }
  //   }
  //   return post(url, formData, config)
  // }


  onSubmit = async () => {
    const data = this.formApi.getState().values;
    const { match: { params: { id } } } = this.props;
    const { entityImages } = this.state
    const { entity } = data
    if (entityImages && entityImages.length > 0) {
      await _.map(entity, async (v, i) => {
        let s = await _.filter(entityImages, j => j.location === i)
        if (s && s[0] !== undefined) {
          v["image"] = s[0]["file"];
        }
      });
    }
    console.log("Client Data",data)
    if (id === 'new') return this.saveClient(data);
    this.updateClient(id, data);
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
                    {id !== "new" &&
                      <BreadcrumbItem active>Edit</BreadcrumbItem>
                    }
                  </Breadcrumb>
                  <h6>Client</h6>
                  <Form getApi={this.setFormApi} onSubmit={this.onSubmit}>
                    {/* <FormStateInfo /> */}

                    {({ formApi, formState }) => (
                      <div>
                        <section>

                          <Row>
                            <Col sm={6} md={4}>
                              <Input
                                field="code" label="Client Code"
                                validateOnBlur validate={e => this.validateProperty('code', e)}
                                readonly={id !== "new"} />
                            </Col>
                            <Col sm={6} md={4}>
                              <Input
                                field="internalCode" label="Reference code"
                                validateOnBlur validate={e => this.validateProperty('internalCode', e)}
                              />
                            </Col>
                            <Col sm={12} md={4}>
                              <Input
                                field="shortName" label="Short name*"
                                validateOnBlur validate={e => this.validateProperty('shortName', e)}
                              />
                            </Col>
                            <Col sm={12} md={12}>
                              <Input
                                field="name" label="Name of the institute*"
                                validateOnBlur validate={e => this.validateProperty('name', e)}
                              />
                            </Col>
                          </Row>
                        </section>
                        <section>
                          <h6>Client Credentials</h6>
                          <Row>
                            <Col sm={12} md={2}>
                              <Input
                                field="uid" label="User Id*"
                                validateOnBlur validate={e => this.validateProperty('cuid', e)}
                              />
                            </Col>
                            <Col sm={12} md={4}>
                              <Input
                                field="email" label="Email Id*"
                                validateOnBlur validate={e => this.validateProperty('cemail', e)}
                              />
                            </Col>
                            <Col sm={12} md={4}>
                              <Input
                                field="password" label="Password*"
                                validateOnBlur validate={e => this.validateProperty('cpassword', e)}
                              />
                            </Col>
                          </Row>
                        </section>
                        <section>
                          <h6>Personalization</h6>
                          <Row>
                            <Col sm={12} md={6}>
                              <Input
                                field="logo" label="Header Logo"
                                validateOnBlur validate={e => this.validateProperty('logo', e)}
                              />
                              <PreviewImage
                                src={formState.values.logo}
                                sizes={[["sm", "Tables"], ["md", "Logo"], ["lg", "Login"]]}
                              />
                            </Col>
                            <Col sm={12} md={6}>
                              <Input
                                field="icon" label="Icon"
                                validateOnBlur validate={e => this.validateProperty('icon', e)}
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
                            <button className="btn btn-link btn-sm" type="button" onClick={() => this.addShortClient()}>+ Add Entity</button>
                          </h6>
                          {formState.values.entity && formState.values.entity.map((entity, i) =>
                            <Scope scope={`entity[${i}]`} key={i}>

                              <Row>
                                <Col sm={6} md={2}>
                                  <Input
                                    field="code" label="Entity Code"
                                    validateOnBlur validate={e => this.validateProperty('code', e)}
                                  />
                                </Col>
                                <Col sm={12} md={4}>
                                  <Input
                                    field="name" label="Name of the Entity*"
                                    validateOnBlur validate={e => this.validateProperty('name', e)}
                                  />
                                </Col>
                               
                               
                              </Row>
                              <Row>
                             
                               
                              <Col sm={12} md={6}>
                              <Input
                                    field="logo" label="Entity Logo"
                                    validateOnBlur validate={e => this.validateProperty('logo', e)}
                                  />
                                  <PreviewImage
                                    src={formState.values.entity[i].logo}
                                    sizes={[["sm", "Tables"], ["md", "Logo"], ["lg", "Login"]]}
                                  />
                                </Col> (OR)
                                <Col sm={12} md={4}>
                                  <Input
                                    field="image" type="file" label="Image" name="image"
                                    onChange={(e) => this.handleEntityImage(i, e)}
                                  />
                                </Col>
                                </Row>
                              <Row>
                                <Col sm={6} md={2}>
                                  <Input
                                    field="branchId" label="Branch Id"
                                    validateOnBlur validate={e => this.validateProperty('branchId', e)}
                                  />
                                </Col>
                                <Col sm={12} md={4}>
                                  <Input
                                    field="branchName" label="Branch Name*"
                                    validateOnBlur validate={e => this.validateProperty('branchName', e)}
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
                                    field="uid" label="User Id*"
                                    validateOnBlur validate={e => this.validateProperty('uid', e)}
                                  />
                                </Col>
                                <Col sm={12} md={4}>
                                  <Input
                                    field="email" label="Email Id*"
                                    validateOnBlur validate={e => this.validateProperty('email', e)}
                                  />
                                </Col>
                                <Col sm={12} md={4}>
                                  <Input
                                    field="password" label="Password*"
                                    validateOnBlur validate={e => this.validateProperty('password', e)}
                                  />
                                </Col>
                              </Row>

                              <Row>
                                <Col sm={12} md={4}>
                                  <label>Admission*</label>
                                  <DRP1 field="admission" label="Admission Period" id="addmission" startDate={moment(formState.values.entity[i].admission.from)} endDate={moment(formState.values.entity[i].admission.to)} onChange={(data) => this.dateValue(data, i, "admission")} validate={e => this.validateProperty('admission', e)} />
                                </Col>
                                <Col sm={12} md={4}>
                                  <label>Acadamic*</label>
                                  <DRP1 field="academic" label="Academic Period" id="academic" startDate={moment(formState.values.entity[i].academic.from)} endDate={moment(formState.values.entity[i].academic.to)} onChange={(data) => this.dateValue(data, i, "academic")} validate={e => this.validateProperty('academic', e)} />
                                </Col>
                                <Col sm={12} md={4}>
                                  <label>Vacation*</label>
                                  <DRP1 field="vacation" label="Vacation Period" id="vacation" startDate={moment(formState.values.entity[i].vacation.from)} endDate={moment(formState.values.entity[i].vacation.to)} onChange={(data) => this.dateValue(data, i, "vacation")} validate={e => this.validateProperty('vacation', e)} />
                                </Col>
                              </Row>
                              <br />
                              <section>
                                <h6>Communication Address</h6>
                                <AddressComponent
                                  scope="address"
                                  validateProperty={this.validateProperty}
                                />
                                <Row>
                                  <Col sm={12} md={4}>
                                    <Input
                                      field="addremail" label="Email Id*"
                                      validateOnBlur validate={e => this.validateProperty('addremail', e)}
                                    />
                                  </Col>
                                  <Col sm={12} md={4}>
                                    <Input
                                      field="mobile" label="Mobile No*"
                                      validateOnBlur validate={e => this.validateProperty('mobile', e)}
                                    />
                                  </Col>

                                </Row>
                              </section>

                              <Row>
                                {formState.values.entity.length > 1 && <Col sm={12}><button onClick={() => this.removeShortClient(i)} className="btn btn-link btn-sm">Remove</button></Col>}

                              </Row>
                              <hr />

                            </Scope>
                          )}
                        </section>


                        <section>
                          <h6>Additional Details</h6>
                          <Row>
                            <Col sm={12} md={12}>
                              <Textarea
                                field="rules" label="Rules" rows={10}
                                validateOnBlur validate={e => this.validateProperty('rules', e)}
                              />
                            </Col>
                          </Row>
                        </section>
                        <div className="text-right">
                          <button type="submit" disabled={formState.invalid} className="btn btn-primary btn-sm">Submit</button>
                        </div>


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

export default ClientEdit;




