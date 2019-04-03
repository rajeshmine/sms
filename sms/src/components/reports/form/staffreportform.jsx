import Joi from 'joi-browser';
import React, { Fragment, Component } from 'react';
import { Form } from 'informed';
import { Row, Col } from 'reactstrap';

import { CustomSelect } from 'components/common/forms';
import { getselectData } from 'services/userService'
import { getStaffList,  getMarkReport } from 'services/staffReportService' 
import { getsubjectname, getexamname } from 'services/examService';
import ReportList from 'components/reports/list'
import ToastService from 'services/toastService'

export default class StaffReport extends Component {
  constructor(props) {
    super(props)
    this.state = {      
      data: {
        department: '',
        batch: '',
        subject: ''
      },
      isTableLoading: true,
      clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [],
      staffList: [], tableData: [],
      isClient: true, isEntity: true, isBranch: true, isDepartment: true, isBatch: true
    }
  }

  schema = {
    department: Joi.string().required().label("Department"),
    client: Joi.string().required().label("Client"),
    entity: Joi.string().required().label("Entity"),
    branch: Joi.string().required().label("Branch"),
    batch: Joi.string().required().label("Batch"),

    subject: Joi.string().required().label("Subject"),
    staffId: Joi.string().required(),
    examId: Joi.string().required(),
  };

  async componentWillMount() {
    await this.props.props.isPageLoadingTrue();
  }

  async componentDidMount() {
    await this.selectoptGet(`clients`, "clientIds")
    await this.feildCheck();
    await this.props.props.isPageLoadingFalse();

  }

  feildCheck = async () => {
    let { session: { data: sessionData } } = this.props.props;
    const { data } = this.state
    const { userType, userLevel, client, entity, branch, department, batch, code, branchId, departmentId, batchId } = sessionData;
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
        await this.clientDatas('batch');
        await this.formApi.setValues(data);
        break;
    }
  }

  handleError(...err) {
  
    return ToastService.Toast("Something went Wrong.Please try again later", 'default');
  }

  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };
  setFormApi = (formApi) => {
		this.formApi = formApi;
	}


  resetForm = () => {
    this.formApi.reset()
  }

  handleChange = async ({ currentTarget: Input }) => {
    const { name, value } = Input;
    const { data } = this.state;
    data[name] = value;
    await this.setState({ [name]: value })
    await this.clientDatas(name);
  }


  clientDatas = async (name) => { // Get the Client,Entity,Branch,Department,Batch,EventName Lists
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
        await this.setState({ department: "", batch: "", batchIds: [] })
        break;
      case "department":
        this.selectoptGet(`namelist?client=${data.client}&type=department&entity=${data.entity}&branch=${data.branch}&department=${data.department}`, "batchIds")
        await this.setState({ batch: "" })
        break;
      case "batch":
        await this.getStaffList()
        break;

      case "staffId":
        this.examnameget(`scheduleTypeId?client=${data.client}&entity=${data.entity}&branch=${data.branch}&type=exam`, "examList");
        await this.getSubjects()

        break;
      default:
        break;
    }
  }

  async selectoptGet(url, type) {
    const data = await getselectData(url)
    if (data.data.statusCode === 1) {
      const Datas = data.data.data
      await this.setState({ [type]: Datas });
    }
  }

  renderReportsForm(type, data) {
    const { rightsData } = this.props;
    return <ReportList type={type} data={data} rightsData={rightsData} />
  }

  getStaffList = async () => {
    const { data: { client, branch, entity, department, batch, } } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}&department=${department}&batch=${batch}&type=staff `;
    try {
      const res = await getStaffList(params);
     
      if (res.data.statusCode === 1) {
        var staffList = res.data.data
        await this.setState({ staffList })
      } else if (res.data.statusCode === 0) {
        await ToastService.Toast(`No Data Found!!!`, "default")
      }
    } catch (err) {
      this.handleError(err)
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



  async  getSubjects() {
    const { data: { client, batch, entity, department, branch, staffId } } = this.state
    let params = `particularCourse?client=${client}&entity=${entity}&branch=${branch}&type=subject&departmentId=${department}&batch=${batch}&staffId=${staffId}`
    try {
      const res = await getsubjectname(params);
    
      if (res.data.statusCode === 1) {
        var subjectList = res.data.data
        await this.setState({ subjectList })
      } else if (res.data.statusCode === 0) {
        await ToastService.Toast(`No Data Found!!!`, "default")
      }
    } catch (err) {
      this.handleError(err)
    }
  }

  handleSubmit = async () => {

    await this.getStaffMarkReport()
  }


  getStaffMarkReport = async () => {
    await this.tableHide()
    const { data: { client, batch, entity, department, branch, subject, staffId, examId } } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}&department=${department}&batch=${batch}&subject=${subject}&examId=${examId}&staffId=${staffId}&type=mark`
  
    try {
      const res = await getMarkReport(params);
     
      if (res.data.statusCode === 1) {
        var tableData = res.data.data
       
        await this.setState({ tableData, isTableLoading: false })
      } else if (res.data.statusCode === 0) {
        await this.setState({ tableData: [], isTableLoading: false })
        ToastService.Toast(`No Data Found!!!`, "default")
      }
    } catch (err) {
      this.handleError(err)
    }
  }


  tableHide = async () => {
    await this.setState({ isTableLoading: true })
  }



  render() {
    const { type } = this.props
    const { clientIds, entityIds, branchIds, departmentIds, batchIds, staffList, examList, subjectList, isTableLoading, tableData,
      isClient, isEntity, isBranch, isDepartment, isBatch
    } = this.state;

    return (
      <Fragment>
        <h6> {type} Report</h6>
        <Form getApi={this.setFormApi} onSubmit={this.handleSubmit}  >
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
                {isDepartment &&
                  <Col sm={6} md={3}>
                    <CustomSelect field="department" label="Department*" name="department" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={departmentIds} validateOnBlur validate={e => this.validateProperty('department', e)} onChange={this.handleChange} />
                  </Col>}
              </Row>
              <Row>
                {isBatch && <Col sm={6} md={3}>
                  <CustomSelect field="batch" label="Batch*" name="batch" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={batchIds} validateOnBlur validate={e => this.validateProperty('batch', e)} onChange={this.handleChange} />
                </Col>}
                <Col sm={6} md={3}>
                  <CustomSelect field="staffId" label="Staff Name*" getOptionValue={option => option._id} getOptionLabel={option => option.name} options={staffList} validateOnBlur validate={e => this.validateProperty('batch', e)} onChange={this.handleChange} />
                </Col>
                <Col sm={6} md={3}>
                  <CustomSelect field="examId" label="Exam*" getOptionValue={option => option._id} getOptionLabel={option => option.title} options={examList} validateOnBlur validate={e => this.validateProperty('examId', e)} onChange={this.handleChange} />
                </Col>

                <Col sm={6} md={3}>
                  <CustomSelect field="subject" label="Subject*" getOptionValue={option => option.code} getOptionLabel={option => option.displayName} options={subjectList} validateOnBlur validate={e => this.validateProperty('subject', e)} onChange={this.handleChange} />

                </Col>
              </Row>

            </section>
            <div className="text-right">
              <button type="submit" className="btn btn-primary btn-sm justify-content-end">Submit</button>
            </div>

          </div>
        </Form>
        {
          !isTableLoading &&
          this.renderReportsForm(type, tableData)
        }
      </Fragment >
    )
  }
}



