import Joi from 'joi-browser';
import React, { Fragment, Component } from 'react';
import _ from 'lodash';
import { Form } from 'informed';
import XlsExport from 'xlsexport';
import { Input, CustomSelect, SDP } from 'components/common/forms';
import { attendanceAdd, editAttendance, getAllreports } from 'services/attendanceService';
import { Row, Col, Modal, ModalBody, ModalHeader, Container } from 'reactstrap';
import moment from 'moment';
import XLSX from 'xlsx';
import cellEditFactory from 'react-bootstrap-table2-editor';
import BootstrapTable from 'react-bootstrap-table-next';


import { getselectData } from 'services/userService'
import { getSubjectsList } from 'services/scheduleService';
import ToastService from 'services/toastService'


const columns = [
    { text: "User ID", sort: true, hidden: false, dataField: "uid",style: { width: '50px' }},
    { text: "Name", sort: true, dataField: "name", hidden: false, style: { width: '50px' } },
    {text: 'Remarks',dataField: 'remarks',  editable: true, style: {width: '80px'}}
];

export default class AddAttendance extends Component {
    constructor(props) {

        super(props)

        this.state = {
            uid: '',
            data: {
                department: '',
                batch: '',
                client: '',
                entity: '',
                branch: '',
                homeworks: '',
                subject: ''
            },
            clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [], studentList: [],
            formValues: [],
            exportData: [],
            selected: [],
            modal: false,
            isClient: true, isEntity: true, isBranch: true, isDepartment: true, isBatch: true
        }
    }

    schema = {
        department: Joi.string().required().label("Department"),
        client: Joi.string().required().label("Client"),
        entity: Joi.string().required().label("Entity"),
        branch: Joi.string().required().label("Branch"),
        batch: Joi.any().optional(),
        subject: Joi.string().required().label("Subject"),
        homeworks: Joi.string().required().label("Topic"),
        period: Joi.string().required().label("Period"),
        date: Joi.string().required(),
    };

    async componentDidMount() {       
        const { data } = this.state
        const { actiontype } = this.props.props.match.params
        this.selectoptGet(`clients`, "clientIds")
        await this.feildCheck()

        this.formApi.setValues(data);
        if (actiontype === "edit") {
            this.setState({ isEditForm: true });
            const { location: { state: { data, details } } } = this.props.props;
            var test = Object.assign(data, details);           
            if (test !== undefined) { }
            return this.formStateCheck(test);
        }
    }

    handleError(...err) {      
        return ToastService.Toast("Something went wrong.Please try again later",  'default');
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
                await this.clientDatas('department');
                await this.clientDatas('batch');
                await this.formApi.setValues(data);
                break;
        }
    }


    formStateCheck = async (data) => {      
        await this.setState({
            editValues: data,
            //date:data.date
        })

        await this.setState({ data: data });
        try {
            await this.clientDatas('client');
            await this.clientDatas('entity');
            await this.clientDatas('branch');
            await this.clientDatas('department');
            await this.clientDatas('batch');
            await this.formApi.setValues(data);
        } catch (err) {
            this.handleError(err);
        }
    }

    getSampleData = async () => {
        const { attendanceaction } = this.props
       
        if (attendanceaction === 'edit') {
            let basicData = this.props.props.location.state.row
            this.setState({
                basicData
            })
            let userData = this.props.props.location.details.details
      
            this.setState({
                client: userData.client, entity: userData.entity, branch: userData.branch, department: userData.department, batch: userData.batch
            })
          
            return {
                "subject": basicData.subject,
                "branch": userData.branch,
                "entity": userData.entity,
                "client": userData.client,
                "department": userData.department,
                "batch": userData.batch,
                "studentId": basicData.studentId,
                "date": basicData.date,
                "period": basicData.period,
                "status": basicData.status
            }
        }
    }

    dateValue = (date) => {
        let selectDate = date._d.toISOString().slice(0, 10)
        this.setState({
            date: date
        })
        const data = this.formApi.getState().values;
        data.date = selectDate
        this.formApi.setValues(data);       
    }

    validateProperty = (name, value) => {
        const schema = Joi.reach(Joi.object(this.schema), name)
        const { error } = Joi.validate(value, schema);
        return error ? error.details[0].message : null;
    };

    resetForm = () => {
        this.formApi.reset()
    }


    setFormApi = (formApi) => {
        this.formApi = formApi;
    }

    async getSubjects() {
        var subjectsArray = []
        const { data: { client, batch, entity, department, branch } } = this.state
        let params = `client=${client}&entity=${entity}&branch=${branch}&type=subject&departmentId=${department}&batchId=${batch}`;
        try {
            const subjectList = await getSubjectsList(params)
            let subjects = subjectList.data.data
            for (var i = 0; i < subjects.length; i++) {
                subjectsArray.push({ 'name': subjects[i].displayName, 'code': subjects[i].code })
            }
            this.setState({
                allSubjects: subjectsArray
            })
        } catch (err) {
            this.handleError(err);
        }
    }

    handleChange = async ({ currentTarget: Input }) => {
        const { name, value } = Input;
        const { data } = this.state;
        data[name] = value;
        this.setState({
            [name]: value
        })
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
                this.getSubjects()
                break;
            case "batch":
                // this.getStudentList()
                break;
            default:
                break;
        }
    }

    async selectoptGet(url, type) {
        const data = await getselectData(url)
        if (data.data.statusCode === 1) {
            const Datas = data.data.data
            this.setState({ [type]: Datas });
        }
    }

    setFormApi = (formApi) => {
        this.formApi = formApi;
    }

    async  homeworkReport(data = []) {
        const { attendanceaction } = this.props;
        const formdata = this.formApi.getState().values; 

        let temp = [];
        await _.map(data).forEach(async (item) => {
            const { uid, remarks } = item;
            temp.push({ "studentId": uid, "remark": remarks, status: "P" })
        });

        if (attendanceaction === 'edit') {
            this.updateAttendance(temp);
        } else {
            if (data.length !== 0) {
                let obj = {
                    "date": formdata.date,
                    "period": formdata.period,
                    "subject": formdata.subject,
                    "department": formdata.department,
                    "batch": formdata.batch,
                    "client": formdata.client,
                    "entity": formdata.entity,
                    "branch": formdata.branch,
                    'students': temp
                }

                const attendanceStatus = await attendanceAdd(obj)
                if (attendanceStatus.data.statusCode === 1) return ToastService.Toast(attendanceStatus.data.message, 'default')
            }
        }
    }

    async updateAttendance(data) {
        const formdata = this.formApi.getState().values
        let edittemp = {
            "date": formdata.date,
            "period": formdata.period,
            "subject": formdata.subject,
            "department": formdata.department,
            "batch": formdata.batch,
            "client": formdata.client,
            "entity": formdata.entity,
            "branch": formdata.branch,
            'students': data
        }

        const updateAttDetails = await editAttendance(edittemp)

        if (updateAttDetails.data.statusCode === 1) return ToastService.Toast(updateAttDetails.data.message, 'default')
        if (updateAttDetails.data.statusCode !== 1) return ToastService.Toast(updateAttDetails.data.message,'default')

    }

    handleOnSelect = (row, isSelect) => {
        if (isSelect) {
            this.setState(() => ({
                selected: [...this.state.selected, row.uid],
                exportData: [...this.state.exportData, row],
            }));
        } else {
            this.setState(() => ({
                selected: this.state.selected.filter(x => x !== row.uid),
                exportData: this.state.exportData.filter(x => x !== row),
            }));
        }
    }

    handleOnSelectAll = (isSelect, rows) => {
        const ids = rows.map(r => r.uid);
        if (isSelect) {
            this.setState({
                selected: ids,
                exportData: rows
            });
        } else {
            this.setState({
                selected: [],
                exportData: []
            });
        }
    }

    checkRemarks(data) {
        if (data.length === 0) return ToastService.Toast("Fill the Status", 'default')
        this.homeworkReport(this.state.exportData)
    }

    bulkModalToggle() {
        this.setState({
            modal: !this.state.modal,
            modalsize: "lg",
        });
    }

    onSubmit() {
        this.checkRemarks(this.state.exportData);
    }

    async getStudentList(data) {
        var studentList = []

        let params = `client=${data.client}&entity=${data.entity}&branch=${data.branch}&department=${data.department}&batch=${data.batch}&type=attendanceReport&date=${data.date}`

        const res = await getAllreports(params);
        if (res.data.statusCode === 1) {
            var test = res.data.data
            for (var i = 0; i < test.length; i++) {
                studentList.push({ "name": test[i].name, "uid": test[i].studentId, "remarks": "", "mark": "" })
            }
            await this.setState({ studentList })
        }
        if (res.data.statusCode !== 1) return ToastService.Toast(res.data.message, 'default');
    }

    handleSubmit = async () => {
        const formdata = this.formApi.getState().values
        await this.setState({
            period: formdata.period
        })
        await this.getStudentList(formdata);
    }


    downloaddata = async () => {
        const { studentList } = this.state
        console.log(studentList)
        let dataarr = []
        if (studentList && studentList.length > 0) {
            for (let item of studentList) {
                let obj = {
                    "UserID": item.uid, "StudentName": item.name, "Status": "", "Remarks": item.remarks
                }
                dataarr.push(obj)
            }
            var xls = new XlsExport(dataarr)
            xls.exportToXLS('Attendance.xls')
        }
    }


    readFile = async (e) => {
        e.persist();
        this.setState({ payloadArray: [], payloadData: [], studentstaffHeaders: '' })
        if (e.target.files[0].size <= 2000000) {
            const rABS = true;
            const files = e.target.files;
            const f = files[0];
            const reader = new FileReader();
            reader.onload = async (e) => {
                var data = e.target.result;
                if (!rABS) data = new Uint8Array(data);
                const wb = XLSX.read(data, { type: rABS ? 'binary' : 'array', cellDates: true })
                // const wsname = wb.SheetNames[1];
                const wsname = wb.SheetNames[0];

                const ws = wb.Sheets[wsname];
                data = XLSX.utils.sheet_to_json(ws, { header: 1 });
                this.setState({
                    studentstaffHeaders: data[0]
                })
                const datas = XLSX.utils.sheet_to_json(ws, { range: 1, header: this.state.studentstaffHeaders });
                await this.setState({ ws: datas, file: f });
            };
            if (rABS) reader.readAsBinaryString(f); else reader.readAsArrayBuffer(f);
        } else {
            alert("File size can not exceed 2 MB");
        }
    }

    saveDetails(e) {
        if (this.state.ws) {
            if (this.state.ws.length === 0) return ToastService.Toast("You are uploading the empty file!",'default');
            this.payloadData(this.state.ws);
        } else {
            return ToastService.Toast("Upload the  file!", 'default');
        }
    }


    async payloadData(data) {


        this.setState({ payloadArray: [], userdataArray: [] })
        const formdata = this.formApi.getState().values
        let tempdata = [];
        await _.map(data).forEach(async (item) => {
            const { UserId, Status } = item;
            if (Status && UserId) {
                var sts = Status.toLowerCase();
                var postUser = UserId.toString();

                var postStatus = ''
                if (sts === "present" || sts === "p") {
                    postStatus = 'P'
                } else if (sts === "absent" || sts === "a") {
                    postStatus = 'A'
                }
                tempdata.push({ "studentId": postUser, "remark": '', status: postStatus })
            }

        });

        let temp = {
            "date": formdata.date,
            "period": formdata.period,
            "subject": formdata.subject,
            "department": formdata.department,
            "batch": formdata.batch,
            "client": formdata.client,
            "entity": formdata.entity,
            "branch": formdata.branch,
            'students': tempdata
        }

        console.log(temp)
        const attendanceStatus = await attendanceAdd(temp)
        if (attendanceStatus.data.statusCode === 1) {
            ToastService.Toast(attendanceStatus.data.message, 'default')
            this.props.props.history.push(`/attendance/attendance`)
        }
    }

    render() {
        const cellEdit = cellEditFactory({
            mode: 'click',
            blurToSave: true             
        });


        const selectedRow = {
            mode: 'checkbox',            
            clickToExpand: true,
            selected: this.state.selected,
            onSelect: this.handleOnSelect,
            onSelectAll: this.handleOnSelectAll,
            bgColor: '#b7e4ff',
            selectionHeaderRenderer: ({ mode, checked, indeterminate, ...rest }) => {
                return (
                    <div className="custom-control custom-control-inline mr-0  custom-checkbox">
                        <input type={mode} className="custom-control-input" checked={checked} indeterminate={indeterminate ? indeterminate.toString() : "false"} {...rest} />
                        <label className="custom-control-label"></label>
                    </div>
                )
            },
            selectionRenderer: ({ mode, ...rest }) => (
                <div className="custom-control custom-control-inline mr-0 custom-checkbox">
                    <input type={mode} className="custom-control-input" {...rest} />
                    <label className="custom-control-label"></label>
                </div>
            )
        }

       
        var editarray = []
     
        const { clientIds, entityIds, branchIds, departmentIds, batchIds, studentList, date, editValues,isClient, isEntity, isBranch, isDepartment, isBatch} = this.state;
      
        const isOutsideRange = (day => {
            let dayIsBlocked = false;
            if (moment().diff(day, 'days') < 0) {
                dayIsBlocked = true;
            }
            return dayIsBlocked;
        })
        
        editarray.push(editValues)
        
        return (
            <Fragment>
                <h6>Add Attendance</h6>
                <Form getApi={this.setFormApi} onSubmit={this.handleSubmit}  >
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
                                </Row>
                                <Row>
                                    {isBatch && <Col sm={6} md={3}>
                                        <CustomSelect field="batch" label="Batch" name="batch" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={batchIds} validateOnBlur validate={e => this.validateProperty('batch', e)} onChange={this.handleChange} />
                                    </Col>}

                                    <Col sm={6} md={3}>
                                        <label>Attendance Date*</label>
                                        <SDP field="date" isOutsideRange={isOutsideRange} id="date" date={moment(date)} validate={e => this.validateProperty('date', e)} onChange={this.dateValue} onBlur={(e) => this.validateProperty('date', e)} numberOfMonths={1}></SDP>
                                    </Col>
                                    <Col sm={6} md={3}>
                                        <CustomSelect field="subject" label="Subject*" name="subject" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={this.state.allSubjects} validateOnBlur validate={e => this.validateProperty('subject', e)} onChange={this.handleChange} />

                                    </Col>
                                    <Col sm={6} md={3}>
                                        <Input
                                            field="period" label="Period*" name="period" validate={e => this.validateProperty('period', e)} />
                                    </Col>

                                </Row>
                            </section>
                            <div className="text-right">
                                <button type="submit" className="btn btn-primary btn-sm">Submit</button>
                            </div>
                        </div>
                    )}

                </Form>
                {
                    studentList.length > 0 && this.state.period ?
                        <section>
                            <Form>
                                <Row>
                                    <Col sm={12} md={6}>
                                        <h6>Instructions</h6>
                                        <div style={{ fontSize: "12px" }}>
                                            <p>1. Click on the Check Box to mark the attendance</p>
                                            <p>2. Click on the Remarks Column to enter the remarks.</p>
                                        </div>
                                    </Col>
                                    <Col sm={12} md={6} style={{ textAlign: 'right' }}>
                                        <button className="btn btn-outline-secondary btn-sm" onClick={() => this.bulkModalToggle()}>Bulk Upload</button> &nbsp;
                                 </Col>
                                </Row>
                                <Row>
                                    <Col sm={12} md={8}></Col>
                                    <Col sm={12} md={4} style={{ textAlign: 'left' }}>
                                        <Row>
                                            <Col sm={12} md={5}></Col>
                                            <Col sm={12} md={3}>
                                                <div className="custom-control custom-control-inline mr-0  custom-checkbox">
                                                    <input type="checkbox" className="custom-control-input" />
                                                    <label className="custom-control-label"> Absent</label>
                                                </div>

                                            </Col>
                                            <Col sm={12} md={3}>
                                                <div className="custom-control custom-control-inline mr-0  custom-checkbox">
                                                    <input type="checkbox" className="custom-control-input" checked={true} />
                                                    <label className="custom-control-label">Present</label>
                                                </div>
                                            </Col>
                                            <Col sm={12} md={1}></Col>
                                        </Row>
                                    </Col>
                                </Row>

                            </Form>
                            <br />
                            <Row>
                                <BootstrapTable
                                    keyField="uid"
                                    data={this.state.studentList}
                                    columns={columns}
                                    bootstrap4
                                    classes="table table-bordered table-hover table-sm"
                                    wrapperClasses="table-responsive"
                                    // filter={filterFactory()}
                                    // pagination={paginationFactory(options)}
                                    selectRow={selectedRow}
                                    cellEdit={cellEdit}
                                />
                            </Row>
                            <Row>
                                <Col md={12} className="d-flex justify-content-center">
                                    <button type="submit" onClick={() => this.onSubmit()} className="btn btn-primary btn-sm">Submit</button>
                                </Col>
                            </Row>
                        </section>
                        : null
                }

                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className} size={this.state.modalsize}>
                    <ModalHeader toggle={this.toggle}>Import / Export</ModalHeader>
                    <ModalBody>
                        <Container>
                            <Form onSubmit={(e) => this.saveDetails(e)}>
                                <div>
                                    <section>
                                        <h6>Attendance Status</h6>
                                        <Row>
                                            <Col sm={6} md={6} >
                                                <input id="upload" ref="upload" type="file" onChange={(event) => { this.readFile(event) }} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
                                            </Col>
                                            <Row className="justify-content-end" >
                                                <button type="button" className="btn btn-warning cancel" onClick={() => this.bulkModalToggle()} style={{ marginRight: '20px' }} >Cancel</button>
                                                <button type="submit" className="btn btn-primary btn-sm" onSubmit={(e) => this.saveDetails(e)} >Save</button>
                                            </Row>
                                        </Row>
                                    </section><br />
                                    <section>
                                        <h6>Download Format</h6><br />
                                        <Row>
                                            <Col sm={6} md={6} >
                                                <div >
                                                    {/* <a href="../../assets/xlsformats/Attendance-List.xls" download>Attendance Lists </a> */}
                                                    <p onClick={() => this.downloaddata()}>Attendance Lists</p>

                                                </div>
                                            </Col>
                                        </Row>
                                    </section>
                                </div>
                            </Form>
                        </Container>
                    </ModalBody>
                </Modal>
            </Fragment >
        )
    }
}