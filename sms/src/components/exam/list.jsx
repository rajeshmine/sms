import _ from 'lodash';
import React, { Component } from 'react';
import update from 'react-addons-update';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { getresultData } from 'services/onlineexamService';


import {
 
  Collapse 

} from 'reactstrap';
import XlsExport from 'xlsexport';

import Joi from 'joi-browser';
import { getselectData } from 'services/userService';
import { deleteSection, deleteExamData, answerKeys } from 'services/examService';
// import { deleteScheduleDetails } from 'services/scheduleService';


import ToastService from 'services/toastService'

export default class ExamList extends Component {
  state = {
    data: {
      client: "", entity: "", branch: "", department: "", batch: "", userType: ""
    },
    columns: [],
    columnHeaders: { "keys": [], "def": {} },
    hideColumns: [],
    sort: [],
    isPageLoading: true,
    isLoading: false,
    modal: false,
    errors: [],
    success: [],
    selected: [],
    exportData: [],
    allKeys: [],
    toggleColumns: false,
    labels: {},
    types: [
      {
        name: 'caste',
        _id: 'caste'
      },
      {
        name: 'category',
        _id: 'category'
      },
      {
        name: 'department',
        _id: 'department'
      },
      {
        name: 'language',
        _id: 'language'
      },
      {
        name: 'religion',
        _id: 'religion'
      },
      {
        name: 'boardtype',
        _id: 'boardtype'
      },
      {
        name: 'batch',
        _id: 'batch'
      },
      {
        name: 'state',
        _id: 'state'
      }
    ],
    studentstaffHeaders: '',
    clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [],
    userTypes: [{ id: "Staff", name: "Staff" }, { id: "Student", name: "Student" }],
    payloadArray: {}, userdataArray: [], userDetails: []
  }

  constructor(props, context) {
    super(props, context);
    this.bulkModalToggle = this.bulkModalToggle.bind(this);
  }

  schema = {
    client: Joi.string().required().label("Client"),
    entity: Joi.string().required().label("Entity"),
    branch: Joi.string().required().label("Branch"),
    // department: Joi.string().required().label("Department"),
    // batch: Joi.string().required().label("Batch"),
    department: Joi.any().optional(),
    batch: Joi.any().optional(),
    userType: Joi.string().required().label("UserType")
  };
 
  async componentDidMount() {
    const labels = this.getDefaultClientLabels();
    const { type,  rightsData, data } = this.props;
    await this.initTableData()
    console.log(data)
    await this.setState({
      data,
      rightsData,
      type, labels,
      isPageLoading: false
    })
    await this.selectoptGet(`clients`, "clientIds");  
  }


  initTableData = async () => {
    const { hideColumns } = this.state;
    const columnHeaders = this.getColumnHeaders(this.props.form, this.props.prefixUrl);
    const columns = this.getColumns('client', columnHeaders, hideColumns);
    await this.setState({ columns, columnHeaders, hideColumns })
  }

  isColumnVisible = (key) => {
    return !_.includes(this.state.hideColumns, key)
  }

  toggleColumn = async (i) => {
    this.setState({ isLoading: true })
    await this.setState(prevState => {
      let hidden = prevState.columns[i] && prevState.columns[i]['hidden'] ? prevState.columns[i]['hidden'] : false
      var index = this.state.hideColumns.indexOf(prevState.columns[i]['text'])
      let hideColumns = this.state.hideColumns
      if (!hidden) {
        hideColumns.push(prevState.columns[i]['text'])
      } else {
        if (index !== -1) {
          hideColumns.splice(index, 1)
        }
      }
      return {
        columns: update(this.state.columns, { [i]: { hidden: { $set: !hidden } } }),
        hideColumns
      }
    })
    this.setState({ isLoading: false })

  }

  handleOnSelect = (row, isSelect) => {
    if (isSelect) {
      this.setState(() => ({
        selected: [...this.state.selected, row._id],
        exportData: [...this.state.exportData, row],
      }));
    } else {
      this.setState(() => ({
        selected: this.state.selected.filter(x => x !== row._id),
        exportData: this.state.exportData.filter(x => x !== row),
      }));
    }
  }

  handleOnSelectAll = (isSelect, rows) => {
    const ids = rows.map(r => r._id);

    if (isSelect) {
      this.setState(() => ({
        selected: ids,
        exportData: rows
      }));
    } else {
      this.setState(() => ({
        selected: [],
        exportData: []
      }));
    }
  }

  renderButton(name, type, className, funcal) {
    return (
      <button
        type={type}
        className={className}
        onClick={funcal}
      >{name}
      </button>
    );
  }

  toggleColumns = () => {
    this.setState({ toggleColumns: !this.state.toggleColumns });
  }


  bulkModalToggle() {
    this.setState({
      modal: !this.state.modal,
      modalsize: "lg",
    });
  }

  async exceltable(format) {
    let d;
    const { exportData } = this.state
    const { data } = this.props
    if (format === 'selecteduserxls') d = this.downloadxls(exportData)
    if (format === 'alluserxls') d = this.downloadxls(data)
    var xls = new XlsExport(d)
    xls.exportToXLS('UserList.xls')
  }

  downloadxls(data) {
    let dataarr = []
    if (data.length > 0) {
      for (let item of data) {
        let obj = {
          "User ID": item.uid, "Password": item.password, "Email Id": item.email, "Mobile No": item.mobile, "Title": item.title, "Name": item.firstName + item.middleName + item.lastName, "Gender": item.gender, "DOB": item.dob, "BloodGroup": item.bloodGroup, "MotherTongue": item.motherTongue, "Caste": item.caste, "Religion": item.religion, "Aadhaar Number": item.aadharNo, "Nationality": item.nationality, "Role": item.type
        }
        dataarr.push(obj)
      }
      return dataarr
    } else {
      return dataarr
    }
  }

  adduserNavigation() {
    const {  form, props: { location: { state } }, data } = this.props;

    if (form === 'section')
      return <div className="btn btn-primary btn-sm" onClick={() => this.editFun(`/exam/add/section`, state)}>+ Add Section</div>
    if (form === 'viewQuestions' && data.length === 0)
      return <div className="btn btn-primary btn-sm" onClick={() => this.editFun(`/exam/add/questionForm`, state)}>+ Add Question</div>
    return '';
  }

  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };

  setFormApi = (formApi) => {
    this.formApi = formApi;
  }


  handleChange = async ({ currentTarget: Input }) => {
    const { name, value } = Input;
    const { data } = this.state;
    data[name] = value;
    await this.setState({
      [name]: value
    }, () => {
    })

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
        // break;

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
        this.setState({ [type]: Datas });
      }
    } catch (err) {
      this.handleError(err)
    }

  }

  previewClient = {
    renderer: row => (
      <div>
        <h6>{row.name}</h6>
        {row.address && <p>{row.address}</p>}
      </div>
    )
  };

  getColumns(type, columnsHeaders, hideColumns) {
    let columns = []
    const { keys, def } = columnsHeaders;

    _.forEach(keys, (key) => {
      columns.push({ ...def[key], hidden: _.includes(hideColumns, key) })
    })
    return columns;
  }

  getColumnHeaders(type, prefixUrl = "", dynamicLabels = {}) {
    // "offlineTime", "onlineTime",
    let allKeys = [
      "Client", "Entity", "Branch", "Department", "Batch",
      "offlineExamId", "offlineDate", "offlineSyllabus", "offlineSubjectId",
      "onlineExamname", "onlineDate", "offlineactions", "onlineactions",
      "SecExamId", "SecSubjectId", "SecName", "SecType", "SecInstruction", "SecMarks", "SecNoQuestions", "sessionactions",
      "QustionNo", "QusName", "QusAnswer", "QusOptionA", "QusOptionB", "QusOptionC", "QusOptionD", "QusAction"
    ]
    let excludeKeys = []
    switch (type) {
      case "onlineExam":
        excludeKeys = ["Client", "Entity", "Branch", "Batch", "offlineExamId", "offlineDate", "offlineTime", "offlineSyllabus", "offlineSubjectId", "offlineactions",
          "SecType", "SecSubjectId", "SecInstruction", "SecName", "SecMarks", "SecExamId", "SecNoQuestions", "sessionactions",
          "QustionNo", "QusName", "QusAnswer", "QusOptionA", "QusOptionB", "QusOptionC", "QusOptionD", "QusAction"

        ]
        break;
      case "offlineExam":
        excludeKeys = ["Client", "Entity", "Branch", "onlineExamname", "onlineDate", "onlineTime", "onlineactions",
          "SecType", "SecSubjectId", "SecInstruction", "SecName", "SecMarks", "SecExamId", "SecNoQuestions", "sessionactions",
          "QustionNo", "QusName", "QusAnswer", "QusOptionA", "QusOptionB", "QusOptionC", "QusOptionD", "QusAction"
        ]
        break;

      case "section":
        excludeKeys = ["Client", "Entity", "Branch", "offlineExamId", "offlineDate", "offlineTime", "offlineSyllabus", "offlineSubjectId", "offlineactions", "Client", "Entity", "Branch", "onlineExamname", "onlineDate", "onlineTime", "onlineactions",
          "SecSubjectId", "Batch",
          "QustionNo", "QusName", "QusAnswer", "QusOptionA", "QusOptionB", "QusOptionC", "QusOptionD", "QusAction"
        ]
        break;
      case "viewQuestions":
        excludeKeys = ["Client", "Entity", "Branch", "Department", "Batch", "offlineExamId", "offlineDate", "offlineTime", "offlineSyllabus", "offlineSubjectId", "offlineactions", "Client", "Entity", "Branch", "onlineTitle", "onlineExamname", "onlineDate", "onlineTime", "onlineactions",
          "SecType", "SecSubjectId", "SecInstruction", "SecName", "SecMarks", "SecExamId", "SecNoQuestions", "sessionactions", "batch"
        ]
        break;
      default:
        break;
    }

    let keys = _.filter(allKeys, (v) => !_.includes(excludeKeys, v))
    let def = {
      "sno": { dataField: 'sno', isDummyField: true, text: "S.No", formatter: this.serialNumberFormatter },
      "Client": {
        dataField: 'client', text: `clientName`, filter: this.getTextFilter(), sort: true
      },
      "Entity": { dataField: 'entityName', text: `Entity`, filter: this.getTextFilter(), sort: true },
      "Branch": { dataField: 'branchName', text: `Branch`, filter: this.getTextFilter(), sort: true },
      "Department": { dataField: 'departmentName', text: `Department`, filter: this.getTextFilter(), sort: true },
      "Batch": { dataField: 'batchName', text: `Batch`, filter: this.getTextFilter(), sort: true },


      "offlineExamId": { dataField: 'examName', text: `Exam Name`, filter: this.getTextFilter(), sort: true },
      "offlineDate": { dataField: 'date', text: `Date`, sort: true },
      // "offlineTime": { dataField: 'time', text: `Time`, formatter: this.onlinetimeFormatter, sort: true },
      "offlineSyllabus": { dataField: 'syllabus', text: `Syllabus`, filter: this.getTextFilter(), sort: true },
      "offlineSubjectId": { dataField: 'subjectName', text: `SubjectId`, filter: this.getTextFilter(), sort: true },


      "onlineExamname": { dataField: 'examName', text: `Exam Name`, filter: this.getTextFilter(), sort: true },
      "onlineDate": { dataField: 'Date', text: `date`, formatter: this.onlinedateFormatter, sort: true },
      // "onlineTime": { dataField: 'Time', text: `time`, formatter: this.onlinetimeFormatter, sort: true },
      "offlineactions": { dataField: 'actions', isDummyField: true, text: "Actions", formatter: this.offlineactionsFormatter },
      "onlineactions": { dataField: 'actions', isDummyField: true, text: "Actions", formatter: this.onlineactionsFormatter },

      // Section
      "SecExamId": { dataField: 'examName', text: `Exam Name`, filter: this.getTextFilter(), sort: true },
      "SecSubjectId": { dataField: 'subjectName', text: `Subject`, filter: this.getTextFilter(), sort: true },
      "SecName": { dataField: 'name', text: `Section Name`, filter: this.getTextFilter(), sort: true },
      "SecType": { dataField: 'type', text: `Type`, filter: this.getTextFilter(), sort: true },
      "SecInstruction": { dataField: 'instruction', text: `Instruction`, filter: this.getTextFilter(), sort: true },
      "SecNoQuestions": { dataField: 'noquestion', text: `No of Questions`, filter: this.getTextFilter(), sort: true },
      "SecMarks": { dataField: 'marks', text: `Section Mark`, filter: this.getTextFilter(), sort: true },
      "sessionactions": { dataField: 'actions', isDummyField: true, text: "Actions", formatter: this.sectionactionsFormatter },

      // Questions
      "QustionNo": { dataField: 'questionNo', text: `Question No`, sort: true },
      "QusName": { dataField: 'question', text: `Question`, filter: this.getTextFilter(), sort: true },
      "QusAnswer": { dataField: 'answer', text: `Answer`, filter: this.getTextFilter(), sort: true },
      "QusOptionA": { dataField: 'optionA', text: `Option A`, filter: this.getTextFilter(), sort: true },
      "QusOptionB": { dataField: 'optionB', text: `Option B`, filter: this.getTextFilter(), sort: true },
      "QusOptionC": { dataField: 'optionC', text: `Option C`, filter: this.getTextFilter(), sort: true },
      "QusOptionD": { dataField: 'optionD', text: `Option D`, filter: this.getTextFilter(), sort: true },
      "QusAction": { dataField: 'actions', isDummyField: true, text: "Actions", formatter: this.qusActionsFormatter },
    }
    return { "keys": keys, "def": def }
  }

  getDefaultClientLabels() {
    return {

    }
  }

  serialNumberFormatter(cell, row, rowIndex, formatExtraData) {
    return rowIndex + 1
  }
  onlinedateFormatter(cell, row, rowIndex, formatExtraData) {
    return row.from.date + '-' + row.to.date
  }
  onlinetimeFormatter(cell, row, rowIndex, formatExtraData) {
    return row.from.time + '-' + row.to.time
  }

  getTextFilter(type = "default") {
    return textFilter({
      placeholder: '',
      delay: 1000
    })
  }

  handleError(...err) {
    return ToastService.Toast("Somthig went wrong.Please try again later", "default");
  }


  offlineactionsFormatter = (cell, row, rowIndex, formatExtraData) => {
    const { rightsData } = this.state;
    let _form = "offlineExam";
    let links = [];
    rightsData && rightsData[_form] && rightsData[_form].view.value &&
      links.push(<div onClick={() => this.editFun(`/exam/view/exam`, row)} className='badge badge-success' > View</div >)
    rightsData && rightsData[_form] && rightsData[_form].edit.value &&
      links.push(<div onClick={() => this.editFun(`/exam/edit/exam`, row)} className='badge badge-warning'>Edit</div>)
    rightsData && rightsData[_form] && rightsData[_form].delete.value &&
      links.push(<div onClick={() => this.offlineExamdeleteFun(row)} className='badge badge-danger'>Delete</div>)
    rightsData && rightsData["section"] && rightsData["section"].view.value &&
      links.push(<div onClick={() => this.editFun(`/exam/section`, row)} className='badge badge-success'>View Section</div>)
    rightsData && rightsData["previewQuestion"] && rightsData["previewQuestion"].view.value &&
      links.push(<div onClick={() => this.editFun(`/exam/view/previewQuestion`, row)} className='badge badge-dark'>Preview Question</div>)
    rightsData && rightsData["previewAnswer"] && rightsData["previewAnswer"].view.value &&
      links.push(<div onClick={() => this.editFun(`/exam/view/previewAnswer`, row)} className='badge badge-blue'>View Answer Key</div>)
    return <div className="actions">{links.concat(" ")}</div>
  }

  onlineactionsFormatter = (cell, row, rowIndex, formatExtraData) => {

    const { userType } = this.props.props.session.data;
    let sessionData = this.props.props.session.data;
    const { rightsData } = this.state;
    let _form = "onlineExam";
    let links = []
    if (userType === "student") {
      if (sessionData.client === row.client && sessionData.entity === row.entity && sessionData.branch === row.branch && sessionData.department === row.departmentId) {
        links.push(<div onClick={() => this.onlineExamAttend(`/onlineExam`, row)} className='badge badge-danger'>Attend</div>)
      }
    } else {
      rightsData && rightsData[_form] && rightsData[_form].edit.value && row.status !== 'active' &&
        links.push(<div onClick={() => this.onlineExamdeleteFun(row, 'active')} className='badge badge-danger'>Delete</div>)
      rightsData && rightsData["section"] && rightsData["section"].view.value &&
        links.push(<div onClick={() => this.editFun(`/exam/section`, row)} className='badge badge-success'>View Section</div>)
    }
    return <div className="actions">{links.concat(" ")}</div>
  }



  sectionactionsFormatter = (cell, row, rowIndex, formatExtraData) => {
    let links = [];
    const { rightsData } = this.state;
    let _form = "section";
    rightsData && rightsData[_form] && rightsData[_form].view.value &&
      links.push(<div onClick={() => this.editFun(`/exam/view/section`, row)} className='badge badge-success'>View</div>)
    rightsData && rightsData[_form] && rightsData[_form].edit.value &&
      links.push(<div onClick={() => this.editFun(`/exam/edit/section`, row)} className='badge badge-warning'>Edit</div>)
    rightsData && rightsData[_form] && rightsData[_form].delete.value &&
      links.push(<div onClick={() => this.SessiondeleteFun(row)} className='badge badge-danger'>Delete</div>)
    rightsData && rightsData["previewQuestion"] && rightsData["previewQuestion"].view.value &&
      links.push(<div onClick={() => this.editFun(`/exam/viewQuestions`, row)} className='badge badge-success'>View Qestions</div>)
    return <div className="actions">{links.concat(" ")}</div>
  }

  qusActionsFormatter = (cell, row, rowIndex, formatExtraData) => {
    let links = [];
    const { rightsData } = this.state;
    rightsData && rightsData["previewQuestion"] && rightsData["previewQuestion"].edit.value &&
      links.push(<div onClick={() => this.quesionEdit(`/exam/edit/questionForm`, row)} className='badge badge-warning'>Edit</div>)


    return <div className="actions">{links.concat(" ")}</div>
  }



  editFun = (url, row) => {
    row["isFromView"] = true;
    this.props.props.history.push({
      pathname: url,
      state: row
    })

  }





  onlineExamAttend = async (url, row) => {
    let count = await this.noofTimesCountFun(row);
    if (count < row.noOfTimes) {
      let params = `branch=${row.branch}&client=${row.client}&departmentId=${row.departmentId}&entity=${row.entity}&examId=${row.examId}&sectionId=5c57f642cd9c8613d4e7a43d`
      try {
        let res = await answerKeys(params)
        if (res.data.statusCode === 1) {
          let data = res.data.data
          this.props.props.history.push({
            pathname: url,
            state: data
          })
        } else {
          //ToastService.Toast("No Details Found!!!", "default")
        }
      } catch (err) {
        this.handleError(err)
      }
    }else{
      ToastService.Toast(`You reached the Maximam attend Limit ${row.noOfTimes}`, "default")
    }
  }


  noofTimesCountFun = async (row) => {
    const { session: { data: { uid, userType, studentId } } } = this.props.props;
    const { client, entity, branch, department, examId } = row;
    let params = `client=${client}&entity=${entity}&branch=${branch}&department=${department}`;
    let resultData = [];
    try {
      let res = await getresultData(params)
      if (res.data.statusCode === 1) {
        let data = res.data.data;
        if (userType === 'student')
          data = _.filter(data, v => uid === v.studentId)
        if (userType === 'parent')
          data = _.filter(data, v => studentId === v.studentId)
        if (data.length > 0) {
          await _.map(data, async s => {
            if (s.examReport && s.examReport.length > 0) {
              await _.map(s.examReport, async e => {
                if (examId === e.id && e.type === 'online') {
                  let obj = {
                    examName: e.examName,
                    examId: e.id,
                    marks: e.marks,
                    remarks: e.remarks,
                    totalMarks: e.totalMarks,
                    type: e.type,
                    uid: s.studentId,
                    name: s.name,
                  }
                  await resultData.push(obj)
                }
              })
            }

          });
          return resultData.length
        }

      } else {
        return 0
      }
   
    } catch (err) {
      ToastService.Toast("Something Went Wrong! Try after sometimes", "default")
    }
  }

  onlineExamdeleteFun = async (row, status) => {
    const { refreshTable } = this.props
    const { client, entity, branch, departmentId, examId } = row;
    
    let params = `client=${client}&entity=${entity}&branch=${branch}&departmentId=${departmentId}&examId=${examId}`
    let res = await deleteExamData(params)

    if (res.data.statusCode === 1) {
      ToastService.Toast("Deleted Successfully!!!", "default")
      refreshTable()
    } else {
      ToastService.Toast("Deleted Failed!!!", "default")

    }
  }

  offlineExamdeleteFun = async (row) => {
    const { refreshTable } = this.props
    const { client, entity, branch, departmentId, batchId, examId } = row;
    let params = `client=${client}&entity=${entity}&branch=${branch}&departmentId=${departmentId}&batchId=${batchId}&examId=${examId}`
    let res = await deleteExamData(params)

    if (res.data.statusCode === 1) {
      ToastService.Toast("Deleted Successfully!!!", "default")
      refreshTable()
    } else {
      ToastService.Toast("Deleted Failed!!!", "default")

    }
  }

  SessiondeleteFun = async (row) => {
    const { refreshTable } = this.props
    const { client, entity, branch, departmentId, batch, examId, _id } = row;
    let params = `client=${client}&entity=${entity}&branch=${branch}&departmentId=${departmentId}&batch=${batch}&examId=${examId}&sectionId=${_id}`;
    try {
      let res = await deleteSection(params);
      if (res.data.statusCode === 1) {
        ToastService.Toast("Section deleted Successfully!!!", "default")
        refreshTable()
      } else {
        ToastService.Toast("Deleted Failed!!!", "default")

      }
    } catch (err) {
      this.handleError(err)
    }

  }

  quesionEdit = async (url, row) => {
    let { location: { state } } = this.props.props;
    let temp = []
    temp.push(row)
    state["questions"] = temp;
    this.props.props.history.push({
      pathname: url,
      state: state
    })
  }




  render() {
    const { isPageLoading, isLoading,  data,  columns,  rightsData, 
      } = this.state;
   
    const { form } = this.props;
    let _form = form;
  

    const options = {
      paginationSize: 4,
      pageStartIndex: 1,
      sizePerPage: 100,
      alwaysShowAllBtns: true,
      hideSizePerPage: true,
      hidePageListOnlyOnePage: true,
      firstPageText: 'First',
      prePageText: 'Back',
      nextPageText: 'Next',
      lastPageText: 'Last',
      nextPageTitle: 'First page',
      prePageTitle: 'Pre page',
      firstPageTitle: 'Next page',
      lastPageTitle: 'Last page',
      showTotal: true
    };

    return (
      <React.Fragment >
        {!isPageLoading && <React.Fragment>

          <div className="d-md-flex align-items-md-center justify-content-md-between">
            <h6>{form} List</h6>
            <div>

              {rightsData && rightsData[_form] && rightsData[_form].create.value &&
                this.adduserNavigation()
              }

            </div>
          </div>

          <Collapse isOpen={this.state.toggleColumns}>
            <div className="alert alert-info alert-sm">
              <div className="d-flex align-items-center justify-content-between">
                <h6>Show/Hide Columns </h6>

              </div>

            </div>
          </Collapse>
          {!isLoading &&
            <div>
              <BootstrapTable
                keyField="_id"
                data={data}
                columns={columns}
                bootstrap4
                classes="table table-bordered table-hover table-sm"
                wrapperClasses="table-responsive"
                filter={filterFactory()}
                pagination={paginationFactory(options)}
                noDataIndication={'No data to display here'}
              // selectRow={selectRow}
              // expandRow={this.previewClient}
              />

            </div>
          }
        </React.Fragment>
        }
      </React.Fragment >
    );
  }
}

