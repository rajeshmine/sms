import 'styles/user-form.scss';
import React, { Component, Fragment } from 'react';

import { Form } from 'informed';
import { Col, Row } from 'reactstrap';
import { CustomSelect, TestAutoSuggest } from 'components/common/forms';

// import { getParticularType } from '../../services/settingsService'
import MarkReportList from 'components/reports/marklist'
import Joi from 'joi-browser';
import ToastService from 'services/toastService'
import { getStudentAutoSuggest } from 'services/userService';
import { getselectData } from 'services/userService'
import { getAssignmentList } from 'services/assignmentService';
import { getProgressMarkList } from 'services/markReportService';
 
import _ from 'lodash'



export default class MarksReport extends Component {
  state = {
    isPageLoading: false,
    isLoading: false,
    isTableLoading: true,
    clientIds: [], entityIds: [], branchIds: [],
    tableData: {
      'gpa': [],
      'cce': {},
    },
    data: {
      department: '',
      batch: '',
      client: '',
      entity: '',
      branch: '',
      students: ''
    },
    isClient: true, isEntity: true, isBranch: true, isDepartment: true, isBatch: true

  }

  async componentWillMount() {
    await this.props.props.isPageLoadingTrue();
  }

  async componentDidMount() {
    await this.init(this.props, true)
    await this.selectoptGet(`clients`, "clientIds")
    await this.feildCheck();
    const { data } = this.state
    await this.formApi.setValues(data);
    await this.props.props.isPageLoadingFalse();
  }

  async componentWillReceiveProps(props) {
    await this.init(props, false)
  }

  async init(props, isPageLoading = false) {
    //   const { uid, eventformType } = props.match.params
  }

  feildCheck = async () => {   
    let { session: { data: sessionData } } = this.props.props;
    const { data } = this.state
    const { userType, userLevel, client, entity, branch, department, batch, code, branchId, departmentId, batchId, uid, } = sessionData;
    data['uid'] = uid;
    data['userType'] = userType;
    data['userLevel'] = userLevel;
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
        data['client'] = client || code;
        data['entity'] = entity || code;
        data['branch'] = branch || branchId;
        await this.setState({ data, isClient: false, isEntity: false, isBranch: false })
        await this.clientDatas('client');
        await this.clientDatas('entity');
        await this.clientDatas('branch');
        await this.formApi.setValues(data);
        break;
      case 'department':
        data['client'] = client || code;
        data['entity'] = entity || code;
        data['branch'] = branch || branchId;
        data['department'] = department || departmentId;
        await this.setState({ data, isClient: false, isEntity: false, isBranch: false, isDepartment: false })
        await this.clientDatas('client');
        await this.clientDatas('entity');
        await this.clientDatas('branch');
        await this.clientDatas('department');
        await this.formApi.setValues(data);
        break;
      default:
        data['client'] = client || code;
        data['entity'] = entity || code;
        data['branch'] = branch || branchId;
        data['department'] = department || departmentId;
        data['batch'] = batch || batchId;
        await this.setState({ data, isClient: false, isEntity: false, isBranch: false, isDepartment: false, isBatch: false });
        await this.clientDatas('client');
        await this.clientDatas('entity');
        await this.clientDatas('branch');
        await this.clientDatas('department');
        await this.clientDatas('batch');
        await this.formApi.setValues(data);
        break;
    }
  }

  setFormApi = (formApi) => {
    this.formApi = formApi;
  }

  async selectoptGet(url, type) {
    const data = await getselectData(url)
    if (data.data.statusCode === 1) {
      const Datas = data.data.data
      this.setState({ [type]: Datas });
    }
  }

  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };

  schema = {
    department: Joi.string().required().label("Department"),
    client: Joi.string().required().label("Client"),
    entity: Joi.string().required().label("Entity"),
    branch: Joi.string().required().label("Branch"),
    batch: Joi.string().required().label("Batch"),
    students: Joi.any().required().label("Students"),
    term: Joi.any().required().label("Term"),
  };

  dateValue = (date) => {
    let selectDate = date._d.toISOString().slice(0, 10)
    this.setState({
      dob: date
    })
    const data = this.formApi.getState().values;
    data.dob = selectDate
    this.formApi.setValues(data);
  }

  handleChange = async ({ currentTarget: Input }) => {
    this.tableHide()
    const { name, value } = Input;
    const { data } = this.state;
    data[name] = value;
    await this.setState({
      [name]: value
    })

    await this.clientDatas(name);

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
        await this.setState({ department: "", batch: "", batchIds: [] })
        break;
      case "department":
        await this.selectoptGet(`namelist?client=${data.client}&type=department&entity=${data.entity}&branch=${data.branch}&department=${data.department}`, "batchIds")
        await this.setState({ batch: "" })
        break;
      case "batch":
        await this.getStudentList()
        await this.getTermsList();
        break;
      default:
        return
    }
  }

  async getTermsList() {
    var termssArray = []
    const { data: { client, branch, entity, department, batch } } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}&department=${department}&batch=${batch}&type=term`;
  
    try {
      const termList = await getAssignmentList(params)

      if (termList.data.statusCode === 1) {
        let terms = termList.data.data

        for (var i = 0; i < terms.length; i++) {
          termssArray.push({ 'name': terms[i].title, 'code': terms[i]._id })
        }
        await this.setState({
          allTerms: termssArray, isTableLoading: false
        })
      } else {
        return ToastService.Toast("No Terms Found", 'default');
      }

    } catch (err) {
      this.handleError(err);
    }
  }


  getStudentList = async () => {
    var studentList = []
    this.tableHide()
    const { data: { client, branch, entity } } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}&type=student`
    const res = await getStudentAutoSuggest(params);
    if (res.data.statusCode === 1) {
      var test = res.data.data
   
      for (var i = 0; i < test.length; i++) {
        studentList.push({ "name": test[i].name, "code": test[i].uid })

      }
      await this.setState({ studentList })
    }
    if (res.data.statusCode !== 1) return ToastService.Toast(res.data.message, 'default');
  }



  tableHide() {
    this.setState({ isTableLoading: true })
  }


  onSubmit = async () => {

    // var data = [
    //   {
    //     "subjects": [
    //       {
    //         "mark": 78,
    //         "remarks": "v Good",
    //         "grade": "B1",
    //         "subject": "ABC12",
    //         "subjectName": "maths"
    //       },
    //       {
    //         "mark": 78,
    //         "remarks": "v Good",
    //         "grade": "B1",
    //         "subject": "ABC2",
    //         "subjectName": "physics"
    //       },
    //       {
    //         "mark": 78,
    //         "remarks": "v Good",
    //         "grade": "B1",
    //         "subject": "ABC1",
    //         "subjectName": "chemistry"
    //       }
    //     ],
    //     "grade": "B1",
    //     "term": "5c67bb3ecd9c860cd4ec0893",
    //     "markSystem": "CCE",
    //     "type": "Scholastic",
    //     "totalMarks": "100",
    //     "id": "5c655519cd9c860ba4102e82",
    //     "name": "Chutki",
    //     "assessmentName": "FA2",
    //     "total": 78,
    //     "examName": "mid term"
    //   },
    //   {
    //     "subjects": [
    //       {
    //         "mark": 80,
    //         "remarks": "bad",
    //         "grade": "B12"
    //       }
    //     ],
    //     "grade": "B1",
    //     "skill": "5c629d53cd9c862da4014ab5",
    //     "markSystem": "CCE",
    //     "term": "5c67bb3ecd9c860cd4ec0893",
    //     "type": "co-scholastic",
    //     "name": "Chutki",
    //     "total": 80
    //   }
    // ]
    //await this.setState({ report: data, isTableLoading: false })

    const formdata = this.formApi.getState().values
 
    await this.setState({
      formdata,studentUid:formdata.uid
    })
    const { type } = this.props
    if (type === 'mark') {
      const { client, entity, branch, department, batch, term, uid,  userType,studentId } = formdata
      let params = '';
      params = `uid=${this.state.studentUid}&batch=${batch}&department=${department}&client=${client}&entity=${entity}&branch=${branch}&term=${term}`
      if (userType === "student")
        params = `uid=${uid}&batch=${batch}&department=${department}&client=${client}&entity=${entity}&branch=${branch}&term=${term}`
      if (userType === "parent")
        params = `uid=${studentId}&batch=${batch}&department=${department}&client=${client}&entity=${entity}&branch=${branch}&term=${term}`
      const markReport = await getProgressMarkList(params)
    
      if (markReport.data.statusCode === 1) {
        let data = markReport.data.data
        await this.tableDataPrepare(data)
      } else {
        return ToastService.Toast("No Details  Found", 'default');
      }
    }
  }

  tableDataPrepare = async (data) => {

    let sCCE = [];
    let cCCE = [];
    let gpa = [];

    let obj = {}
    let cobj = {}
    let gObj = {}

    sCCE = _.filter(data, v => v.markSystem === 'CCE' && v.type === 'Scholastic');
    cCCE = _.filter(data, v => v.markSystem === 'CCE' && v.type === 'co-scholastic');
    gpa = _.filter(data, v => v.markSystem === 'GPA');
    // CCE Scholastic
    await _.map(sCCE, async  v => {
      await _.map(v.subjects, async s => {
        obj[s.subject] = obj[s.subject] || {};
        obj[s.subject]['subjectName'] = s.subjectName;
        obj[s.subject][v.assessmentName] = s.mark;
      });
    })
    // co-Scholastic
    await _.map(cCCE, async  v => {
      cobj[v.skill] = cobj[v.skill] || {};
      cobj[v.skill]["skillName"] = v.skillName;
      cobj[v.skill]["mark"] = v.subjects[0].mark;
      cobj[v.skill]["remark"] = v.subjects[0].remarks;
    })

    // GPA
    await _.map(gpa, async  v => {
      await _.map(v.subjects, async s => {
        gObj[s.subject] = gObj[s.subject] || {};
        gObj[s.subject]['subjectName'] = s.subjectName;
        // gObj[s.subject]['grade'] = s.grade;

        gObj[s.subject][v.examName] = s.mark;
      });
    })

    const { tableData } = this.state;

    tableData['cce'] = { Scholastic: _.values(obj), 'co-scholastic': _.values(cobj) }
    tableData['gpa'] = _.values(gObj)

    await this.setState({ tableData, markSystem: data[0]['markSystem'].toLocaleLowerCase(), isTableLoading: false })

  }



  renderReportsForm(data, formData, studentUid) {
    const { rightsData } = this.props;
    const { markSystem } = this.state;
    return <MarkReportList form={markSystem} data={data} formData={formData} rightsData={rightsData} studentUid={studentUid} />
  }



  autoSujestValue = (value) => {
  
    this.setState({
      studentUid: value
    })
  }


  render() {
    const {  clientIds, entityIds, branchIds, departmentIds, batchIds, studentList, formdata,  isTableLoading, isClient, isEntity, isBranch, isDepartment, tableData, isBatch, studentUid, data: { userType } } = this.state;
    return (
      <Fragment >
        <Form getApi={this.setFormApi} onSubmit={this.onSubmit} >
          {({ formApi, formState }) => (
            <div>
              <section>
                <Row>
                  {isClient && <Col sm={6} md={3}>
                    <CustomSelect field="client" label="Client*" name="client" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('client', e)} onChange={this.handleChange} options={clientIds} />
                  </Col>}
                  {isEntity && <Col sm={6} md={3}>
                    <CustomSelect field="entity" label="Entity*" name="entity" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('entity', e)} onChange={this.handleChange} options={entityIds} />
                  </Col>}
                  {isBranch && <Col sm={6} md={3}>
                    <CustomSelect field="branch" label="Branch*" name="branch" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('branch', e)} onChange={this.handleChange} options={branchIds} />
                  </Col>}
                  {isDepartment && <Col sm={6} md={3}>
                    <CustomSelect field="department" label="Department*" name="department" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={departmentIds} validateOnBlur validate={e => this.validateProperty('department', e)} onChange={this.handleChange} />
                  </Col>}
                  {isBatch && <Col sm={6} md={3}>
                    <CustomSelect field="batch" label="Batch*" name="batch" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={batchIds} validateOnBlur validate={e => this.validateProperty('batch', e)} onChange={this.handleChange} />
                  </Col>}
                  <Col sm={6} md={3}>
                    <CustomSelect field="term" label="Terms*" name="term" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('term', e)}
                      options={this.state.allTerms} onChange={this.handleChange} />
                  </Col>
                  {
                    (studentList && (userType !== "student" && userType !== "parent")) &&
                    < Col sm={6} md={3}>
                      <label>Students</label>
                      <TestAutoSuggest label="Students" name="students" field="students" data={studentList} filterOption="name" getOptionValue={(data) => this.autoSujestValue(data)} validateOnBlur validate={e => this.validateProperty('students', e)} onChange={this.handleChange} />
                    </Col>
                  }

                </Row>
              </section>

              <div className="text-right">
                <button type="submit" className="btn btn-primary btn-sm">Submit</button>
              </div>
            </div>
          )}
        </Form>

        {
          !isTableLoading && formdata && studentUid &&
          this.renderReportsForm(tableData, formdata, studentUid)
        }


      </Fragment >
    );
  }
}
