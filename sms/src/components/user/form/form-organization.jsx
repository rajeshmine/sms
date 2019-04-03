import { Input, CustomSelect, SDP } from 'components/common/forms';

import { Form } from 'informed';
import Joi from 'joi-browser';
import React, { Component, Fragment } from 'react';
import { Col, Row } from 'reactstrap';
import {  saveUser, getsuserListData } from 'services/userService';
import { getParticularType } from 'services/settingsService'
import ToastService from 'services/toastService'

import moment from 'moment';
export default class OrganizationForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        role: '', admissionNo: '', joiningDate: '', department: "", batch: "",
      },
      client: "", entity: "", branch: "", department: "", batch: "",
      roles: [{ id: "student", name: "student" }, { id: "staff", name: "staff" }],
      uid: '',
      errors: {},
      isLoading: true
    };

  }


  schema = {
    role: Joi.string().required().label("Role"),
    admissionNo: Joi.string().required().label("Admission Number"),
    joiningDate: Joi.string().required().label("Joining Date"),
    OrganisationMail: Joi.string().email().lowercase().required().label('Mail'),
    boardType: Joi.string().required().label("Board Type"),
    rollNo: Joi.string().required().label("Roll Number"),
  };

  async componentDidMount() {
    const sampleData = await this.getSampleData()
    this.formApi.setValues(sampleData);
    this.getBoardTypes()
  }

  getSampleData = async () => {
    const { uid, data } = this.props
    let params = `usersList?uid=${uid}&type=user&client=${data.clientid}&entity=${data.entityid}&branch=${data.branch}`
    const userListData = await getsuserListData(params)
    let userData = userListData.data.data[0]

    let organizationData = (userData && userData.organization && userData.organization[0])

    this.setState({
      client: userData.client, entity: userData.entity, branch: userData.branch, department: userData.department, batch: userData.batch, uid: userData.uid, joiningDate: moment((organizationData && organizationData.joiningDate) || new Date()), userType: userData.userType
    })
    return {
      "admissionNo": (organizationData && organizationData.admissionNo) || '',
      "joiningDate": (organizationData && organizationData.joiningDate) || '',
      "role": (organizationData && organizationData.role) || '',
      "department": (organizationData && organizationData.department) || '',
      "batch": (organizationData && organizationData.batch) || '',
      "OrganisationMail": (organizationData && organizationData.email) || '',
      "designation": (organizationData && organizationData.designation),
      "rollNo": (organizationData && organizationData.rollNo) || '',
      "boardType": (organizationData && organizationData.boardType) || ''


    }
  }

  dateValue = (date) => {
    let selectDate = date._d.toISOString().slice(0, 10)
    this.setState({
      joiningDate: date
    })
    const data = this.formApi.getState().values;
    data.joiningDate = selectDate
    this.formApi.setValues(data);
  }

  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };

  setFormApi = (formApi) => {
    this.formApi = formApi
  }

  async  getBoardTypes() {
    var boardtypearr = []
    const { client, entity, branch } = this.state

    let params = `client=${client}&entity=${entity}&branch=${branch}&type=boardtype`
    const settingsDetails = await getParticularType(params)
    if (settingsDetails.data.statusCode === 1) { //check the datas
      let data = settingsDetails.data.data

      for (let item of data) {
        boardtypearr.push({ "id": item.displayName, "name": item.displayName })
      }
      await this.setState({ boardtypes: boardtypearr })
    }
  }



  onSubmit = async () => {
    const { props } = this.props
    const { client, entity, branch, uid } = this.state
    const data = this.formApi.getState().values;

    let params = `client=${client}&entity=${entity}&branch=${branch}&uid=${uid}`
    const res = await saveUser("organisation", params, data)

    if (res.data.statusCode === 1) {
      ToastService.Toast(`Organization Details Updated Successfully`, "default")

      props.history.push(`/${client}/${entity}/${branch}/${uid}/edit/parent`)
    }
    else if (res.data.statusCode === 0)
      ToastService.Toast(res.data.message, "default")
    else
      ToastService.Toast(`Failed to update Organization Details`, "default")
  }



  render() {
    const {  joiningDate, userType} = this.state
    const isOutsideRange = (day => {
      let dayIsBlocked = false;
      if (moment().diff(day, 'days') < 0) {
        dayIsBlocked = true;
      }
      return dayIsBlocked;
    })
    return (
      <Fragment>
        <Form getApi={this.setFormApi} onSubmit={this.onSubmit}>
          {({ formApi, formState }) => (
            <div>
              <section>
                <h6>Organization Details</h6>
                <Row>

                  {userType !== 'student' && <Col sm={6} md={3}>
                    <Input
                      field="role" label="Designation*" name="role"
                      validateOnBlur validate={e => this.validateProperty('role', e)}
                    />
                  </Col>
                  }

                  <Col sm={6} md={3}>
                    <Input
                      field="admissionNo" label="Admission Number*" name="admissionNo"
                      validateOnBlur validate={e => this.validateProperty('admissionNo', e)}
                    />

                  </Col>
                  <Col sm={6} md={3}>
                    <Input
                      field="OrganisationMail" label="Email ID*" name="OrganisationMail" helper="Organization Email ID"
                      validateOnBlur validate={e => this.validateProperty('OrganisationMail', e)}
                    />
                  </Col>

                  <Col sm={6} md={3}>
                    <Input
                      field="rollNo" label="Roll No*" name="rollNo"
                      validateOnBlur validate={e => this.validateProperty('rollNo', e)}
                    />

                  </Col>

                  <Col sm={6} md={3}>

                    <CustomSelect field="boardType" label="Board Type*" name="boardType" getOptionValue={option => option.id} getOptionLabel={option => option.name} options={this.state.boardtypes} validateOnBlur validate={e => this.validateProperty('boardType', e)} />


                  </Col>
                  <Col sm={12} md={3}>
                    <label>Joining Date*</label>
                    <SDP isOutsideRange={isOutsideRange} field="joiningDate" label="Joining Date*" id="joiningDate" date={joiningDate} validate={e => this.validateProperty('joiningDate', e)} onChange={this.dateValue} onBlur={(e) => this.validateProperty('joiningDate', e)} numberOfMonths={1}></SDP>
                  </Col>

                </Row>
              </section>
              <div className="text-right">
                <button type="submit" className="btn btn-primary btn-sm">Save & Next</button>
              </div>
            </div>
          )}
        </Form>
      </Fragment>
    );
  }
}



