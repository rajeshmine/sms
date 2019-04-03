import React, { Fragment, Component } from 'react';
import Joi from 'joi-browser';
import { Col, Row } from 'reactstrap';
import { Form, Scope } from 'informed';
import DRP1 from 'components/common/forms/date-range-picker';
import moment from 'moment';
import _ from 'lodash';

import { Input, Textarea, CustomSelect, MP } from 'components/common/forms';
import { saveUser, getsuserListData } from 'services/userService';
import ToastService from 'services/toastService'

export default class EducationForm extends Component {
  state = {
    data: {
      type: '', percentage: '', name: '', affiliate: '', from: '', to: '', otherDetails: '',
      projectName: '', projectDate: '', associatedWith: '', projectURL: '', projectdescription: '', projectStatus: '',
      educationDetails: [],
      projectDetails: [],
    },
    client: "", entity: "", branch: "", department: "", batch: "",
    courseType: [{ id: "10th", name: "10th" }, { id: "11th", name: "11th" }, { id: "UG", name: "UG" }, { id: "PG", name: "PG" },],
    projectstatus: [{ id: "Completed", name: "Completed" }, { id: "Ongoing", name: "Ongoing" }],
    modal: false,
    uid: "",
    errors: {},
  };

  shortEducationSchema = {
    type: Joi.string().required(),
    percentage: Joi.string().required(),
    name: Joi.string().required(),
    affiliate: Joi.string().required(),
    from: Joi.string().required(),
    to: Joi.string().required(),
    otherDetails: Joi.string().empty('').optional(),
  }

  schema = {
    type: Joi.string().required().label('Type of the course'),
    percentage: Joi.string().required().label('course  Percentage'),
    name: Joi.string().required().label('Name of the Course'),
    affiliate: Joi.string().required().label('Affiliation'),
    from: Joi.string().required().label('From Date'),
    to: Joi.string().required().label('To Date'),
    otherDetails: Joi.string().empty('').optional(),
    educationDetails: Joi.array().items(Joi.object(this.shortEducationSchema)),
    projectName: Joi.string().required().label('projectName'),
    projectDate: Joi.string().required().label('projectDate'),
    associatedWith: Joi.string().required().label('associatedWith'),
    projectURL: Joi.string().required().label('projectURL'),
    projectdescription: Joi.string().empty('').optional(),
    projectStatus: Joi.string().required().label('projectStatus'),
  }

  async componentDidMount() {
    await this.loadUserData();
  }

  loadUserData = async () => {
    const sampleData = await this.getuserData();
    const userData = sampleData.data[0]
    if (userData) {
      let education = userData['education'];
      let projects = userData['projects'];
      userData['educationDetails'] = education;
      userData['projectDetails'] = projects;
      if (education) {
        education.map((education, i) => {
          var fromMonth = education.from.split("/")[0]
          var fromYear = 20 + education.from.split("/")[1]
          var toMonth = education.to.split("/")[0]
          var toYear = 20 + education.to.split("/")[1]

          if (fromMonth) {
            this.setState({
              "toMonth": parseInt(toMonth),
              "toYear": parseInt(toYear),
              "fromMonth": parseInt(fromMonth),
              "fromYear": parseInt(fromYear)
            })
          } else {
            this.setState({
              "toMonth": new Date().getMonth() + 1,
              "toYear": new Date().getFullYear(),
              "fromMonth": new Date().getMonth() + 1,
              "fromYear": new Date().getFullYear()
            })
          }
          return ''
        })
      } else {
        this.setState({
          "toMonth": new Date().getMonth() + 1,
          "toYear": new Date().getFullYear(),
          "fromMonth": new Date().getMonth() + 1,
          "fromYear": new Date().getFullYear()
        })
      }
      this.setState({
        client: userData.client, entity: userData.entity, branch: userData.branch, department: userData.department, batch: userData.batch, uid: userData.uid
      })
      this.formApi.setValues(userData);
    }
    if (!userData.projects) {
      this.addProject('', '', '', '', '', '')
    }
    if (!userData.education) {
      this.addCourse('', '', '', '', '', '', '')
    }
  }

  getuserData = async () => {
    const { uid, data } = this.props
    let params = `usersList?uid=${uid}&type=user&client=${data.clientid}&entity=${data.entityid}&branch=${data.branch}`
    const userListData = await getsuserListData(params)
    let userData = userListData.data
    return userData
  }

  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };

  setFormApi = (formApi) => {
    this.formApi = formApi;
  }

  addCourse = async (type, percentage, name, affiliate, from, to, otherDetails, projectDetails) => {
    const data = { type, percentage, name, affiliate, from, to, otherDetails, projectDetails };
    const values = this.formApi.getState().values;
    var educationDetails = [];
    if (values.educationDetails)
      educationDetails = values.educationDetails;
    educationDetails.push(data)
    this.formApi.setValues({ ...values, educationDetails: educationDetails });
  }

  removeCourse = (i) => {
    const values = this.formApi.getState().values;
    let educationDetails = values.educationDetails;
    educationDetails.splice(i, 1);
    this.formApi.setValues({ ...values, educationDetails: educationDetails });
  }

  addProject = async (projectName, projectDate, projectStatus, associatedWith, projectURL, projectdescription) => {
    const data = { projectName, projectDate, projectStatus, associatedWith, projectURL, projectdescription };
    const values = this.formApi.getState().values;
    let projectsDetails = [];
    if (values.projectDetails)
      projectsDetails = values.projectDetails;
    projectsDetails.push(data)
    this.formApi.setValues({ ...values, projectDetails: projectsDetails });
  }

  removeProject = (i) => {
    const values = this.formApi.getState().values;
    let projectsDetails = values.projectDetails;
    projectsDetails.splice(i, 1);
    this.formApi.setValues({ ...values, projectsDetails: projectsDetails });
  }

  toggle = async () => {
    this.setState({
      modal: !this.state.modal,
      modalsize: "lg",
    });
  }

  onSubmit = async () => {
    const { props } = this.props
    const data = this.formApi.getState().values;
    let params = `client=${data.client}&entity=${data.entity}&branch=${data.branch}&uid=${data.uid}`;
    let obj = {
      "education": data.educationDetails,
      "projects": data.projectDetails
    }
    for (let item of obj.education) {
      if (item && item.from && item !== '') {
        var before = item.from;
        var after = item.to
        var beforeInMoment = moment.utc(before, "MM/YY");
        var afterInMoment = moment.utc(after, "MM/YY");
        if (beforeInMoment.isBefore(afterInMoment)) {
          const res = await saveUser("education", params, obj)
          if (res.data.statusCode === 1) {
            ToastService.Toast(`Education Details Updated Successfully`, "default")
            props.history.push(`/${data.client}/${data.entity}/${data.branch}/${data.uid}/edit/organization`)
          }
          else if (res.data.statusCode === 0)
            ToastService.Toast(res.data.message, "default")
          else
            ToastService.Toast(`Failed to update Education Details`, "default")
        } else {
          ToastService.Toast(`Check the Month Values `, "default")
        }
      }
    }
  }

  dateValue = async (date, i, feild) => {
    const data = this.formApi.getState().values;
    const { from, to } = date;
    data.projectDetails[i][feild] = { from: new Date(from).toLocaleDateString(), to: new Date(to).toLocaleDateString() };
    this.formApi.setValues(data);
    const data1 = this.formApi.getState().values;
    await _.keys(_.map(data1.projectDetails)).forEach((item) => {
    });
  }

  render() {
    const { toMonth, toYear, fromMonth, fromYear } = this.state;
    return (
      <Fragment>
        <div className="">
          <Form getApi={this.setFormApi} onSubmit={this.onSubmit}>
            {({ formApi, formState }) => (
              <div>
                <section>
                  <h6>Education Details</h6>
                  <Row className="justify-content-end">
                    <button className="btn btn-link btn-sm" type="button"
                      onClick={() => this.addCourse('', '', '', '', '', '', '')}
                    >+ Add Course</button>
                  </Row>
                  {formState.values.educationDetails && formState.values.educationDetails.map((educationDetails, i) =>
                    <Scope scope={`educationDetails[${i}]`} key={i}>
                      <Row>
                        <Col sm={12} md={4}>
                          <CustomSelect field="type" label="Course Type*" name="type" getOptionValue={option => option.id} getOptionLabel={option => option.name} options={this.state.courseType} validateOnBlur validate={e => this.validateProperty('type', e)} />
                        </Col>
                        <Col sm={12} md={4}>
                          <Input field="percentage" label="Percentage*"
                            validateOnBlur validate={e => this.validateProperty('percentage', e)} />
                        </Col>
                        <Col sm={12} md={4}>
                          <Input field="name" label="Course Name*"
                            validateOnBlur validate={e => this.validateProperty('name', e)} />
                        </Col>
                        <Col sm={12} md={4}>
                          <Input field="affiliate" label="Affiliated To*"
                            validateOnBlur validate={e => this.validateProperty('affiliate', e)} />
                        </Col>
                        <Col sm={12} md={4}>
                          <MP field="from" label="From*" name="from" year={parseInt(fromYear)} month={parseInt(fromMonth - 1)}
                          ></MP>
                        </Col>
                        <Col sm={12} md={4}>
                          <MP field="to" label="To*" name="to" year={parseInt(toYear)} month={parseInt(toMonth - 1)}
                          ></MP>
                        </Col>
                        <Col sm={12} md={12}>
                          <Textarea
                            field="otherDetails" label="Description"
                            validateOnBlur validate={e => this.validateProperty('otherDetails', e)} />
                        </Col>
                        {
                          formState.values.educationDetails.length > 1 && i !== 0 ?
                            <Col sm={12}><button onClick={() => this.removeCourse(i)} className="btn btn-link btn-sm">Remove</button>
                            </Col> : ''
                        }
                      </Row>
                    </Scope>
                  )}
                </section>
                {
                  !this.state.modal ?
                    <section>
                      <Row>
                        <Col sm={12}>
                          <div style={{ fontSize: "10pt" }}>
                            <span style={{ color: '#e91e63', cursor: "pointer" }} onClick={this.toggle}>Click Here</span> to add Project Details
                           </div>
                        </Col>
                      </Row>
                    </section> : null
                }
                {this.state.modal ?
                  <section>
                    <h6>Add Project Details</h6>
                    <Row className="justify-content-end">
                      <button className="btn btn-link btn-sm" type="button"
                        onClick={() => this.addProject('', '', '', '', '', '')}
                      >+ Add Project</button>
                    </Row>
                    {formState.values.projectDetails && formState.values.projectDetails.map((projectDetails, i) =>
                      <Scope scope={`projectDetails[${i}]`} key={i}>
                        <Row>
                          <Col sm={4}>
                            <Input field="projectName" label="Project Name*"
                              validateOnBlur validate={e => this.validateProperty('projectName', e)} /> </Col>
                          <Col sm={12} md={4}>
                            <label>Project Date*</label>
                            <DRP1 field="projectDate" label="Project Date*" id="projectDate" startDate={moment(formState.values.projectDetails[i].projectDate.from)} endDate={moment(formState.values.projectDetails[i].projectDate.to)} onChange={(data) => this.dateValue(data, i, "projectDate")} />
                          </Col>
                        </Row>
                        <Row>
                          <Col sm={4}>
                            <CustomSelect field="projectStatus" label="Project Status*" name="type" getOptionValue={option => option.id} getOptionLabel={option => option.name} options={this.state.projectstatus} validateOnBlur validate={e => this.validateProperty('projectStatus', e)} />

                          </Col>
                        </Row><br />
                        <Row>
                          <Col sm={4}>
                            <CustomSelect field="associatedWith" label="Associated With*" name="associatedWith" getOptionValue={option => option.id} getOptionLabel={option => option.name} options={this.state.courseType} validateOnBlur validate={e => this.validateProperty('associatedWith', e)} />
                          </Col>
                          <Col sm={4}>
                            <Input field="projectURL" label="Project URL*"
                              validateOnBlur validate={e => this.validateProperty('projectURL', e)}
                            />
                          </Col>
                        </Row>
                        <Row>
                          <Col sm={12}>
                            <Textarea
                              field="projectdescription" label="Description"
                              validateOnBlur validate={e => this.validateProperty('projectdescription', e)}
                            />
                          </Col>
                        </Row>
                        {
                          i !== 0 ?
                            <Col sm={12}><button onClick={() => this.removeProject(i)} className="btn btn-link btn-sm">Remove</button>
                            </Col> : ''
                        }
                      </Scope>
                    )}
                  </section>
                  : null}
                <div className="text-right">
                  <button type="submit" className="btn btn-primary btn-sm">Save & Next</button>
                </div>
              </div>
            )}
          </Form>
        </div>
      </Fragment>
    );
  }
}
