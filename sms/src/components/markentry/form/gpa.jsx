import React, { Component, Fragment } from 'react';

import ToastService from 'services/toastService'
import { Container, Row, Col, Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { NavLink } from 'react-router-dom';
import { Form } from 'informed';
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory from 'react-bootstrap-table2-editor';

import { getselectData } from 'services/userService'
import { getScholastics } from 'services/gradeService'
import { getScheduleDetails } from 'services/scheduleService';
import { addMarkReport, updateMarkReport, studentDataList } from 'services/markReportService'
import { getsubjectname, getexamname } from 'services/examService';

import Joi from 'joi-browser';
import _ from 'lodash'

import { CustomSelect } from 'components/common/forms';

export default class GPA extends Component {

  constructor(props) {
    super(props)
    this.state = {
      data: {
        students: {},
        studentList: [],
        markSystem: 'GPA',
        type: 'GPA'

      },
      isEditForm: false,
      formActionType: false,
      isTableLoading: true,
      clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [],
      examNameList: [], subjectNameList: [], assessmentList: [],
      // Feild Validation
      isClient: true, isEntity: true, isBranch: true, isDepartment: true, isBatch: true


    }
  }

  async componentDidMount() {
    await this.feildCheck()
    await this.init()
  }

  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };

  schema = {
    client: Joi.string().required().label("Client"),
    entity: Joi.string().required().label("Entity"),
    branch: Joi.string().required().label("Branch"),

    department: Joi.string().required(),
    batch: Joi.string().required(),

    term: Joi.string().required(),
    examName: Joi.string().required(),
    subject: Joi.string().required(),
  };


  feildCheck = async () => {
    let { session: { data: sessionData } } = this.props.props;
    const { data } = this.state
    const { userType, userLevel, client, entity, branch, department, batch } = sessionData;
    let switchType = '';
    if (userType === 'staff')
      switchType = userLevel;
    else
      switchType = userType;
    switch (switchType) {
      case 'sadmin':
        break;
      case 'client':
        data['client'] = client;
        await this.setState({ data, isClient: false })
        await this.clientDatas('client');
        await this.formApi.setValues(data);
        break;
      case 'entity':
      case 'branch':
        data['client'] = client;
        data['entity'] = entity;
        data['branch'] = branch;
        await this.setState({ data, isClient: false, isEntity: false, isBranch: false })
        await this.clientDatas('client');
        await this.clientDatas('entity');
        await this.clientDatas('branch');
        await this.formApi.setValues(data);
        break;
      case 'department':
        data['client'] = client;
        data['entity'] = entity;
        data['branch'] = branch;
        data['department'] = department;
        await this.setState({ data, isClient: false, isEntity: false, isBranch: false, isDepartment: false })
        await this.clientDatas('client');
        await this.clientDatas('entity');
        await this.clientDatas('branch');
        await this.clientDatas('department');
        await this.formApi.setValues(data);
        break;
      case 'batch':
        data['client'] = client;
        data['entity'] = entity;
        data['branch'] = branch;
        data['department'] = department;
        data['batch'] = batch;
        await this.setState({ data, isClient: false, isEntity: false, isBranch: false, isDepartment: false, isBatch: false })
        await this.clientDatas('client');
        await this.clientDatas('entity');
        await this.clientDatas('branch');
        await this.clientDatas('department');
        await this.clientDatas('batch');
        await this.formApi.setValues(data);
        break;
      default:
        data['client'] = client;
        data['entity'] = entity;
        data['branch'] = branch;
        data['department'] = department;
        data['batch'] = batch;
        await this.setState({ data, isClient: false, isEntity: false, isBranch: false, isDepartment: false, isBatch: false })
        await this.formApi.setValues(data); 
        await this.clientDatas('type');
        break;
    }
  }

  init = async () => {

    const { data } = this.state
    await this.selectoptGet(`clients`, "clientIds")
    await this.formApi.setValues(data);
    const { actionType } = this.props
    this.setState({ isEditForm: false });
    if (actionType === 'edit')
      this.setState({ isEditForm: true });


    await this.setState({ formActionType: (actionType === 'view') })

    const { location: { state } } = this.props.props;
    if (state !== undefined && state.isFromView)
      return this.getSampleData(state);

  }

  getSampleData = async (data) => {
   
    data["students"] = {}
    data["markSystem"] = 'GPA';
    await this.setState({ data, isTableLoading: false, formActionType: true });

    try {
      await this.clientDatas('client');
      await this.clientDatas('entity');
      await this.clientDatas('branch');
      await this.clientDatas('department');
      await this.clientDatas('batch');
      await this.clientDatas('type');

      await this.formApi.setValues(data);
    } catch (err) {
      this.handleError(err);
    }

  }
  setFormApi = (formApi) => {
    this.formApi = formApi;
  }

  handleChange = async ({ currentTarget: Input }) => {
    this.tableHide();

    const { name, value, title } = Input;
    const { data } = this.state;
    data[name] = value;
    data[title] = Input.options[Input.selectedIndex]['text'];
    await this.setState({ [name]: value })
    await this.formApi.setValues(data);
    this.clientDatas(name);
  }

  clientDatas = async (name) => {
    const { data } = this.state;
    switch (name) {
      case "client":
        await this.selectoptGet(`namelist?client=${data.client}&type=client`, "entityIds")
        await this.setState({ entity: "", branch: "", department: "", batch: "", branchIds: [], departmentIds: [], batchIds: [] })
        break;
      case "entity":
        await this.selectoptGet(`namelist?client=${data.client}&type=entity&entity=${data.entity}`, "branchIds")
        await this.setState({ branch: "", department: "", batch: "", departmentIds: [], batchIds: [] })
        break;
      case "branch":
        await this.selectoptGet(`namelist?client=${data.client}&type=branch&entity=${data.entity}&branch=${data.branch}`, "departmentIds")
        await this.setState({ department: "", batch: "", })
        break;
      case "department":
        this.selectoptGet(`namelist?client=${data.client}&type=department&entity=${data.entity}&branch=${data.branch}&department=${data.department}`, "batchIds")
        await this.setState({ batch: "", batchIds: [] })
        this.examnameget(`scheduleTypeId?client=${data.client}&entity=${data.entity}&branch=${data.branch}&type=exam`, "examNameList");
        break;
      case "batch":
        this.getAssessmentName();
        this.subjectnameget(`particularCourse?client=${data.client}&entity=${data.entity}&branch=${data.branch}&department=${data.department}&batch=${data.batch}&type=subject`, "subjectNameList")
        await this.getTermList();
        break;
      case "type":
        await this.getTermList();
        this.getAssessmentName();
        await this.examnameget(`scheduleTypeId?client=${data.client}&entity=${data.entity}&branch=${data.branch}&type=exam`, "examNameList");
        await this.subjectnameget(`particularCourse?client=${data.client}&entity=${data.entity}&branch=${data.branch}&department=${data.department}&batch=${data.batch}&type=subject`, "subjectNameList")
        break;
      case "subject":
        return this.getStudentList();
      default:
        break;
    }
  }

  async selectoptGet(url, type) {
    const data = await getselectData(url)
    if (data.data.statusCode === 1) {
      const Datas = data.data.data
      this.setState({ [type]: Datas });
    } else {
      ToastService.Toast(`${type} Data Not Found!!!`, "default")
    }
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

  getTermList = async () => {
    const { data: { client, entity, branch } } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}&type=term`
    try {
      const res = await getScheduleDetails(params);
      if (res.data.statusCode === 1) {
        let data = res.data.data
        await this.setState({ termList: data })
      } else if (res.data.statusCode === 0) {
        await ToastService.Toast(`No Data Found!!!`, "default")
        await this.setState({ termList: [] })
      }
    } catch (err) {
      this.handleError(err)
    }
  }

  getAssessmentName = async () => {
    const { data: { client, entity, branch } } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}&type=scholastics`
    try {
      const res = await getScholastics(params);
      if (res.data.statusCode === 1) {
        let assessmentList = res.data.data
        await this.setState({ assessmentList })
      } else if (res.data.statusCode === 0) {
        await ToastService.Toast(`No Data Found!!!`, "default")
      }
    } catch (err) {
      this.handleError(err)
    }
  }

  getStudentList = async () => {
    const { data: { client, branch, entity, department, batch, subject, term, examId, type }, data } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}&department=${department}&batch=${batch}&subject=${subject}&id=${examId}&term=${term}&type=examReport&examtype=${type}`;
    try {
      const res = await studentDataList(params);
     
      if (res.data.statusCode === 1) {
        var studentList = res.data.data
        data["studentList"] = studentList;
        await this.setState({ data, isTableLoading: false })
      } else if (res.data.statusCode === 0) {
        data["studentList"] = [];
        await this.setState({ data, isTableLoading: false })
        await ToastService.Toast(`No Data Found!!!`, "default")
      }
    } catch (err) {
      this.handleError(err)
    }
  }

  tableEditData = async (rowData) => {
    const { mark, studentId, remarks } = rowData;
    const { data } = this.state;
    let tempId = studentId.toString();
    if ((mark !== undefined && mark !== "")) {
      data["students"][tempId] = {
        mark: +mark, remarks: remarks || "", uid: studentId
      }
      await this.setState({ data });
     
    }
  }


  onSubmit = async () => {
    const { isEditForm } = this.state;
    let data = this.formApi.getState().values;
    const { data: { students } } = this.state
    var res = '';
    data['students'] = _.values(students);

    try {
      if (!isEditForm) {
      
        res = await addMarkReport(data);
      } else {
       
        res = await updateMarkReport(data);
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
    const { isEditForm } = this.state;
   
    const { props } = this.props;
    if (isEditForm) {
      await props.history.goBack();
    } else {
      window.location.reload();
    }

  }

  handleError(...err) {
    
    return ToastService.Toast("Somthig went wrong.Please try again later", "default");
  }


  tableHide = async () => {
    await this.setState({ isTableLoading: true })
  }



  render() {
    const { clientIds, entityIds, branchIds, departmentIds, batchIds, formActionType, examNameList, subjectNameList, termList, isTableLoading, data: { studentList },
      isClient, isEntity, isBranch, isDepartment, isBatch

    } = this.state
    const { actionType } = this.props

    const columns = [
      { dataField: "name", text: "Name", editable: false, sort: true, },
      { dataField: 'mark', text: 'Mark', editable: (actionType !== 'view'), },
      { dataField: 'remarks', text: 'Remarks', editable: (actionType !== 'view'), },
    ];


    const cellEdit = cellEditFactory({
      mode: 'click',
      blurToSave: true,
      afterSaveCell: (oldValue, newValue, row, column) => {
       
        this.tableEditData(row)
      }
    });
    return (
      <Fragment>
        <Container fluid>
          <Breadcrumb>
            <BreadcrumbItem><NavLink to="/dashboard">Dashboard</NavLink></BreadcrumbItem>
            <BreadcrumbItem><NavLink to="/mark/gpa">GPA Mark List</NavLink>
            </BreadcrumbItem>
            <BreadcrumbItem active>{actionType} GPA Mark </BreadcrumbItem>
          </Breadcrumb>
          <div className="mb-4">
            <h6>{actionType} GPA Mark</h6>
          </div>
          <Form getApi={this.setFormApi} onSubmit={this.onSubmit} >
            {({ formApi, formState }) => (
              <div>
                {isBatch && <section>
                  <Row>
                    {isClient &&
                      <Col sm={6} md={3}>
                        <CustomSelect field="client" label="Client*" name="client" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('client', e)} onChange={this.handleChange} options={clientIds} disabled={formActionType} />
                      </Col>
                    }
                    {isEntity &&
                      <Col sm={6} md={3}>
                        <CustomSelect field="entity" label="Entity*" name="entity" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('entity', e)} onChange={this.handleChange} options={entityIds} disabled={formActionType} />
                      </Col>}
                    {isBranch &&
                      <Col sm={6} md={3}>
                        <CustomSelect field="branch" label="Branch*" name="branch" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('branch', e)} onChange={this.handleChange} options={branchIds} disabled={formActionType} />
                      </Col>}
                    {isDepartment &&
                      <Col sm={6} md={3}>
                        <CustomSelect field="department" label="Department*" title="departmentName" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('department', e)} onChange={this.handleChange} options={departmentIds} disabled={formActionType} />
                      </Col>}
                    {isBatch &&
                      <Col sm={6} md={3}>
                        <CustomSelect field="batch" label="Batch*" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('batch', e)} onChange={this.handleChange} options={batchIds} disabled={formActionType} />
                      </Col>}
                  </Row>
                </section>}
                <section>
                  <Row>
                    <Col sm={6} md={3}>
                      <CustomSelect field="term" title="termName" label="Term *" getOptionValue={option => option._id} getOptionLabel={option => option.title} validateOnBlur validate={e => this.validateProperty('term', e)} onChange={this.handleChange} options={termList} disabled={formActionType} />
                    </Col>
                    <Col sm={6} md={3}>
                      <CustomSelect field="examId" title="examName" label="Exam Name *" getOptionValue={option => option._id} getOptionLabel={option => option.title} validateOnBlur validate={e => this.validateProperty('examName', e)} onChange={this.handleChange} options={examNameList} disabled={formActionType} />
                    </Col>
                    <Col sm={6} md={3}>
                      <CustomSelect field="subject" title="subjectName" label="Subject *" getOptionValue={option => option.code} getOptionLabel={option => option.displayName} validateOnBlur validate={e => this.validateProperty('subject', e)} onChange={this.handleChange} options={subjectNameList} disabled={formActionType} />
                    </Col>

                  </Row>
                </section>
                {!isTableLoading &&


                  <BootstrapTable
                    keyField="studentId"
                    data={studentList}
                    columns={columns}
                    bootstrap4
                    classes="table table-bordered table-hover table-sm"
                    wrapperClasses="table-responsive"
                    noDataIndication={'No data to display here'}
                    cellEdit={cellEdit}
                  />

                }
                {actionType !== 'view' &&
                  <button type="submit" className="btn btn-primary btn-sm">Submit</button>
                }
              </div>
            )}
          </Form>
        </Container>
      </Fragment>
    )
  }
}
