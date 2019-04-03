import 'styles/App.scss';
import React, { Component, Fragment } from 'react';
import Joi from 'joi-browser';
import { Col, Row, Container, Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { NavLink } from 'react-router-dom';

import { Form, } from 'informed';
import { Input, Textarea, CustomSelect, } from 'components/common/forms';
import { getsubjectname, getexamname, insertSection, updateSection } from 'services/examService';
import { getselectData } from 'services/userService';
import ToastService from 'services/toastService';

export default class SectionForm extends Component {
  state = {
    data: {},
    isEditForm: false,
    clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [], examname: [], subjectname: [],
    examTypes: [
      { code: "MCQ", name: "MCQ" },
      { code: "Short", name: "Short Answer" },
      { code: "Long", name: "Long Answer" },
    ],
    formActionType: false
  }

  async componentDidMount() {
    const { data } = this.state
  
    // await this.selectoptGet(`clients`, "clientIds")
    await this.formApi.setValues(data);
    const { actiontype, } = this.props
    this.setState({ isEditForm: false });
    if (actiontype === 'edit')
      this.setState({ isEditForm: true });


    await this.setState({ formActionType: (actiontype === 'view') })

    const { location: { state } } = this.props.props;
    if (state !== undefined && state.isFromView)
      return this.getSampleData(state);
  }

  schema = {
    instruction: Joi.string().required().label("Instruction"),
    subject: Joi.string().required().label("Subject"),
    type: Joi.string().required().label("Type"),
    name: Joi.string().required().label("Name"),
    noquestion: Joi.number().required().label("No of Questions"),
    marks: Joi.number().required().label("Total Section Marks"),
  }


  getSampleData = async (data) => {
  
    await this.setState({ data });

    try {
      // await this.clientDatas('client');
      // await this.clientDatas('entity');
      // await this.clientDatas('branch');
      // await this.clientDatas('departmentId');
      // await this.clientDatas('batch');


      await this.formApi.setValues(data);
    } catch (err) {
      this.handleError(err);
    }

  }

  handleChange = async ({ currentTarget: Input }) => {
    const { name, value } = Input;

    const { data } = this.state;
    data[name] = value;
    await this.setState({ [name]: value })
    await this.clientDatas(name)
  }

  clientDatas = async (name) => {
    const { data } = this.state;
    switch (name) {
      case "client":
        this.selectoptGet(`namelist?client=${data.client}&type=client`, "entityIds")
        await this.setState({ entity: "", branch: "", department: "", batch: "", branchIds: [], departmentIds: [], batchIds: [] })
        break;
      case "entity":
        this.selectoptGet(`namelist?client=${data.client}&type=entity&entity=${data.entity}`, "branchIds")
        await this.setState({ branch: "", department: "", batch: "", departmentIds: [], batchIds: [] })
        break;
      case "branch":
        this.selectoptGet(`namelist?client=${data.client}&type=branch&entity=${data.entity}&branch=${data.branch}`, "departmentIds")
        await this.setState({ departmentId: "", batch: "", departmentIds: [] })
        break;
      case "departmentId":
        this.selectoptGet(`namelist?client=${data.client}&type=department&entity=${data.entity}&branch=${data.branch}&department=${data.departmentId}`, "batchIds")
        await this.setState({ batch: "", batchIds: [] })
        this.examnameget(`scheduleTypeId?client=${data.client}&entity=${data.entity}&branch=${data.branch}&type=exam`, "examname");
        break;
      case "batch":
        this.subjectnameget(`particularCourse?client=${data.client}&entity=${data.entity}&branch=${data.branch}&department=${data.departmentId}&batch=${data.batch}&type=subject`, "subjectname")
        break;
      default:
        break;
    }
  }


  async selectoptGet(url, type) {
    try {
      const data = await getselectData(url)
      if (data.data.statusCode === 1) {
        const Datas = data.data.data
        await this.setState({ [type]: Datas });
      }
    } catch (err) { this.handleError(err) }
  }

  async examnameget(url, type) {
   
    try {
      const data = await getexamname(url)
     
      if (data.data.statusCode === 1) {
        const Datas = data.data.data
        this.setState({ [type]: Datas });
      }
    } catch (err) {
      this.handleError(err)
    }
  }

  async subjectnameget(url, type) {
  
    try {
      const data = await getsubjectname(url)
     
      if (data.data.statusCode === 1) {
        const Datas = data.data.data
        this.setState({ [type]: Datas });
      }
    } catch (err) {
      this.handleError(err)
    }

  }

  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };


  setFormApi = (formApi) => {
    this.formApi = formApi;
  }

  onSubmit = async () => {
    const { data, isEditForm } = this.state;
    // let formValue = this.formApi.getValues().value;

    var res = '';
    try {
      if (!isEditForm) {
    
        res = await insertSection(data);
      } else {
      
        data['sectionId'] = data['_id']
        res = await updateSection(data);
      }
      const { data: { statusCode, message } } = res;
    
      if (statusCode === 1) {
        await ToastService.Toast(message, "default");
        return this.redirectTo();
      } else {
        return ToastService.Toast("Somthig went wrong.Please try again later", "default");
      }
    } catch (err) {
      this.handleError(err)
    }
  
  }

  redirectTo = async () => {
    const { isEditForm,  } = this.state;
  
    const { props } = this.props;
    if (isEditForm) {
      await props.history.goBack()
    } else {
      await window.location.reload()
      // await props.history.goBack()
    }
  }

  handleError(...err) {
  
    return ToastService.Toast("Somthig went wrong.Please try again later", "default");
  }





  render() {
    const { examTypes, formActionType } = this.state;
    const { actiontype } = this.props;
    return (

      <React.Fragment >

        <Fragment>
          <Container fluid>
            <Breadcrumb>
              <BreadcrumbItem > <NavLink to="/exam/offlineExam">Exam</NavLink></BreadcrumbItem>
              <BreadcrumbItem active>{actiontype} Section</BreadcrumbItem>
            </Breadcrumb>
            <Form getApi={this.setFormApi} onSubmit={this.onSubmit}>
              {({ formApi, formState }) => (
                <div className="page-user">
                  <h6>{actiontype} Section</h6>
                  {/* <section>
                    <Row>
                      <Col sm={12} md={3}>
                        <CustomSelect field="client" label="Client" name="client" getOptionValue={option => option.code}
                          getOptionLabel={option => option.name} options={clientIds}
                          validateOnBlur validate={e => this.validateProperty('client', e)} onChange={this.handleChange} disabled={formActionType} />
                      </Col>
                      <Col sm={12} md={3}>
                        <CustomSelect field="entity" label="Entity" name="entity" getOptionValue={option => option.code}
                          getOptionLabel={option => option.name} options={entityIds}
                          validateOnBlur validate={e => this.validateProperty('entity', e)} onChange={this.handleChange} disabled={formActionType} />
                      </Col>
                      <Col sm={12} md={3}>
                        <CustomSelect field="branch" label="Branch" name="branch" getOptionValue={option => option.code}
                          getOptionLabel={option => option.name} options={branchIds}
                          validateOnBlur validate={e => this.validateProperty('branch', e)} onChange={this.handleChange} disabled={formActionType} />
                      </Col>
                      <Col sm={12} md={3}>
                        <CustomSelect field="departmentId" label="Department" name="department" getOptionValue={option => option.code}
                          getOptionLabel={option => option.name} options={departmentIds}
                          validateOnBlur validate={e => this.validateProperty('department', e)} onChange={this.handleChange} disabled={formActionType} />
                      </Col>
                      <Col sm={12} md={3}>
                        <CustomSelect field="batch" label="Batch" name="batch" getOptionValue={option => option.code}
                          getOptionLabel={option => option.name} options={batchIds}
                          validateOnBlur validate={e => this.validateProperty('batch', e)} onChange={this.handleChange} disabled={formActionType} />
                      </Col>
                    </Row>
                  </section> */}
                  <section>
                    <Row>
                      {/* <Col sm={12} md={3}>
                        <CustomSelect field="examId" label="Exam Name*" name="examname" getOptionValue={option => option._id}
                          getOptionLabel={option => option.title} options={examname}
                          validateOnBlur validate={e => this.validateProperty('examname', e)} onChange={this.handleChange} disabled={formActionType} />

                      </Col>
                      <Col sm={12} md={3}>
                        <CustomSelect field="subjectId" label="Subject*" name="subject" getOptionValue={option => option._id}
                          getOptionLabel={option => option.displayName} options={subjectname}
                          validateOnBlur validate={e => this.validateProperty('subject', e)} onChange={this.handleChange} disabled={formActionType} />
                      </Col>*/}
                      <Col sm={12} md={3}>
                        <CustomSelect field="type" label="Type*" name="type" getOptionValue={option => option.code}
                          getOptionLabel={option => option.name} options={examTypes}
                          validateOnBlur validate={e => this.validateProperty('type', e)} onChange={this.handleChange} disabled={formActionType} />
                      </Col>
                      <Col sm={12} md={3}>
                        <Input field="name" label="Name*" name="name"
                          validateOnBlur validate={e => this.validateProperty('name', e)} onChange={this.handleChange} readOnly={formActionType} />
                      </Col>
                      <Col sm={12} md={3}>
                        <Input field="noquestion" label="No of Questions*" name="noquestion"
                          validateOnBlur validate={e => this.validateProperty('noquestion', e)} onChange={this.handleChange} readOnly={formActionType} />
                      </Col>
                      <Col sm={12} md={3}>
                        <Input field="marks" label="Total Section Mark*" name="marks"
                          validateOnBlur validate={e => this.validateProperty('marks', e)} onChange={this.handleChange} readOnly={formActionType} />
                      </Col>
                    </Row>

                    <Row>
                      <Col sm={12} md={12}>
                        <Textarea
                          field="instruction" label="instruction *" name="instruction"
                          validateOnBlur validate={e => this.validateProperty('instruction', e)}
                          onChange={this.handleChange} readOnly={formActionType}
                        />
                      </Col>
                    </Row>
                  </section>
                  {!formActionType &&
                    <button type="submit" disabled={formState.invalid} className="btn btn-primary btn-sm">Submit</button>}
                </div>
              )}

            </Form>
          </Container>
        </Fragment>

      </React.Fragment >
    );
  }
}

