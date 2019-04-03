import {
    Col, Row, Container, Progress,  TabContent, TabPane, Nav, NavItem, NavLink,
} from 'reactstrap'
import React, { Component, Fragment } from 'react'
import DashboardItem from 'components/dashboard/dashboardItem'
import { getClients,  } from 'services/clientService'
import { getsuserListData } from 'services/userService'
import * as FAIcons from 'react-icons/fa';
import { getTimeTable,  } from 'services/timetableService'
import { holiday, circular,  scheduleTypeId, feeCollection, studentAttendance } from 'services/DashboardService'
import _ from 'lodash';
import BootstrapTable from 'react-bootstrap-table-next';
import 'styles/App.scss'
import 'styles/dashboard.scss'
import classnames from 'classnames';

import { Pie } from 'react-chartjs-2';

const timetableColumns = [{
    dataField: 'time',
    text: 'Time'
}, {
    dataField: 'subjectName',
    text: 'Subject Name'
}, {
    dataField: 'staffName',
    text: 'Staff Name'
}];

const eventColumns = [{
    dataField: 'title',
    text: 'Event Name'
}, {
    dataField: 'desc',
    text: 'Description'
}, {
    dataField: 'from.date',
    text: 'From Date'
}, {
    dataField: 'to.date',
    text: 'To Date'
}, {
    dataField: 'event[0].website.url',
    text: 'Website'
}
];
const holidayColumns = [{
    dataField: 'holidayDate.from',
    text: 'From Date'
}, {
    dataField: 'holidayDate.to',
    text: 'To Date'
}, {
    dataField: 'title',
    text: 'Reason'
}]




export default class DashboardList extends Component {
    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);
        this.state = {
            activeTab: 'holiday',
            
            circulardiv: false,
            coursediv: false,
        };
    }

    toggle(tab) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    // state = {
    //     holidayTable: false,
    //     circulardiv: false,
    //     coursediv: false,  

    // }
    async componentDidMount() {
        const { session: { data } } = this.props.props;

        await this.setState({
            data,
        })
        if (data) {
            await this.initFun(data)
            if (data.userType !== 'sadmin') {
                await this.AttendanceData(data)
                await this.HolidayData(data)
                await this.circularGeneration(data)
            }
        }
        await this.props.props.isPageLoadingFalse();
    }
    async initFun(data) {
        let userType;
        userType = data.userType;
        if (data && data.userLevel && data.userLevel !== '')
            userType = data.userLevel;

        switch (userType) {
            case "sadmin":
                try {
                    await this.userCountGeneratefun(data)

                } catch (err) {
                    this.handleError(err)
                }
                break;
            case "client":
                try {
                    await this.userCountGeneratefun(data);

                } catch (err) {
                    this.handleError(err)
                }
                break;
            case "entity":
                try {
                    await this.userCountGeneratefun(data)
                    await this.feeCollection(data);
                } catch (err) {
                    this.handleError(err)
                }
                break;
            case "staff":
                try {
                    await this.courseDataGeneration(data)
                    await this.ScheduleType(data)
                    await this.currentdateTimetable(data)
                    //await this.BirthdayData(data)
                } catch (err) {
                    this.handleError(err)
                }
                break;
            case "student":
                try {
                    await this.courseDataGeneration(data)
                    await this.HomeworkData(data)
                    await this.assignmentDataGeneration(data)
                    await this.ScheduleType(data)
                    await this.currentdateTimetable(data)
                } catch (err) {
                    this.handleError(err)
                }
                break;
            default:
                break;
        }
    }
    userCountGeneratefun = async (data) => {
        const { userType, client } = data
        let clientData;

        switch (userType) {
            case 'sadmin':
                clientData = await getClients('type=sadmin');
                if (clientData.data.statusCode === 1) {
                    let _data = clientData.data.data;
                    let countObj = await this.countFun(_data);
                    await this.setState({
                        countObj
                    })


                } else {
                    let countObj = await this.countFun([]);
                    await this.setState({
                        countObj
                    })
                }
                break
            case 'client':
            case 'entity':
            case 'branch':
            case 'department':
            case 'batch':
                clientData = await getClients('type=sadmin')

                if (clientData.data.statusCode === 1) {
                    let _data = clientData.data.data;
                    _data = await _.filter(_data, v => v.id === client)
                    let countObj = await this.countFun(_data);
                    await this.setState({
                        countObj
                    })

                } else {
                    let countObj = await this.countFun([]);
                    await this.setState({
                        countObj
                    })
                }

                break

            default:
                break;
        }


    }

    countFun = async (_data) => {
        let noClient = 0, noEntity = 0, noBranch = 0, noDepartment = 0, noBatch = 0, noStudent = 0, noStaff = 0;
        if (_data.length > 0) {
            noClient = _data.length;
            await _data.map((d, i) => {
                noEntity += d.Entity.length;
                noBranch += d.Branch.length;
                noDepartment += d.Department.length;
                noBatch += d.Batch.length;
                noStudent += d.Student.length;
                noStaff += d.Staff.length;
                return { noClient: noClient, noEntity: noEntity, noBranch: noBranch, noDepartment: noDepartment, noBatch: noBatch, noStudent: noStudent, noStaff: noStaff }
            });
            return { noClient: noClient, noEntity: noEntity, noBranch: noBranch, noDepartment: noDepartment, noBatch: noBatch, noStudent: noStudent, noStaff: noStaff }
        } else {
            return { noClient: noClient, noEntity: noEntity, noBranch: noBranch, noDepartment: noDepartment, noBatch: noBatch, noStudent: noStudent, noStaff: noStaff }
        }
    }


    //FeeCollection Amount ,No of Transactions
    feeCollection = async (data) => {
        const { userType, client, code } = data;
        let params, Details, collectAmount = 0, dueAmount = 0, noofTransaction = 0, totalAmount = 0;
        if (userType === 'entity') {
            params = `entity=${code}&client=${client}&date=2019-02-15&type=dashboard`
            try {
                Details = await feeCollection(params);
                if (Details.data.statusCode === 1) {
                    let feesData = Details.data.data;
                    noofTransaction = feesData.length;
                    feesData.map((_data, i) => {
                        _data.feeCollection.map((_amount, i) => {
                            collectAmount += parseInt(_amount.paidAmount);
                            dueAmount += parseInt(_amount.amount) - parseInt(_amount.paidAmount);
                            totalAmount += parseInt(_amount.amount);
                            return ''
                        })
                        return ''
                    });
                }
                await this.setState({ fees: { noofTransaction, dueAmount, collectAmount, totalAmount }, feeCollectionDiv: true });
            } catch (err) {
                this.handleError(err)
            }
        }
    }


    feeCollectionDiv = () => {
        const { fees } = this.state;
        return <div className="feeCollectionDiv tableCard todo">

            <h5>Fees</h5>

            <div className="feedesc">
                <div className="progresscolor-1">
                    <FAIcons.FaDotCircle /> No of Transaction - <span>{fees.noofTransaction} Nos</span>
                </div>
                <div className="progresscolor-2">
                    <FAIcons.FaDotCircle /> Total Amount - <span> ₹ {fees.totalAmount} </span>
                </div>
                <div className="progresscolor-3">
                    <FAIcons.FaDotCircle /> Collected Amount - <span> ₹ {fees.collectAmount} </span>
                </div>
                <div className="progresscolor-4">
                    <FAIcons.FaDotCircle /> Due Amount - <span> ₹ {fees.dueAmount} </span>
                </div>
            </div>
            <Progress multi>
                <Progress bar striped value={fees.noofTransaction}>{fees.noofTransaction}</Progress>
                <Progress bar striped color="info" value={fees.totalAmount}>{fees.totalAmount}</Progress>
                <Progress bar striped color="success" value={fees.collectAmount}>{fees.collectAmount}</Progress>
                <Progress bar striped color="danger" value={fees.dueAmount}>{fees.dueAmount}</Progress>
            </Progress>
        </div >
    }


    //timetable generate Current Date 
    currentdateTimetable = async (data) => {

        const { userType, client, entity, branch, department, batch } = data
        let params, Details;
        if (userType === 'staff') {
            params = { "type": "timetable", "client": client, "entity": entity, "branch": branch }
            try {
                Details = await getTimeTable(params)
                if (Details.data.statusCode === 1) {
                    this.StaffTimetable(Details.data.data)
                } else {
                    await this.setState({
                        TimetableData: [],
                        TimeTable: true
                    })
                }
            } catch (err) {
                this.handleError(err)
            }
        }
        if (userType === 'student') {
            params = { "type": "timetable", "batchId": batch, "departmentId": department, "client": client, "entity": entity, "branch": branch }
            try {
                Details = await getTimeTable(params)

                if (Details.data.statusCode === 1) {
                    this.StudentTimeTable(Details.data.data)
                  
                } else {
                    await this.setState({
                        TimetableData: [],
                        TimeTable: true
                    })
                }
            } catch (err) {
                this.handleError(err)
            }
        }
    }
    //class(student) timetable for current day
    StudentTimeTable = async (data) => {
        var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var d = new Date();
        var dayName = days[d.getDay()];
        let studentTimeData = []
        await data.forEach((v, i) => {
            if (Array.isArray(v[dayName])) {
                v[dayName].forEach(g => {
                    studentTimeData.push(g)
                })
            }
        })
        if (studentTimeData.length > 0) {
            await this.setState({
                TimetableData: studentTimeData,
                TimeTable: true
            })
        } else {
            await this.setState({
                TimetableData: [],
                TimeTable: true
            })
        }
      
    }
    //staff timetable for current day
    StaffTimetable = async (data) => {
        var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var d = new Date();
        var dayName = days[d.getDay()];
        let staffTimeData = []
        let staff = 'rajesh'
        // var dayName = "Friday";
        await data.forEach((v, i) => {
            if (Array.isArray(v[dayName])) {
                v[dayName].forEach(g => {
                    if (staff === g.staff)
                        staffTimeData.push(g)
                })
            }
        })
        if (staffTimeData.length > 0) {
            await this.setState({
                TimetableData: staffTimeData,
                TimeTable: true
            })
        } else {
            await this.setState({
                TimetableData: [],
                TimeTable: true
            })
        }


    }


    //Holiday Data Generation 
    HolidayData = async (data) => {
        const {  client, entity, branch,  } = data
        try {
            let params = `client=${client}&entity=${entity}&branch=${branch}`
            let res = await holiday(params)
            if (res && res.data.statusCode === 1) {
                let holidayData = res.data.data
                this.setState({
                    holidayData: holidayData,
                    holidayTable: true
                })
            } else {
                // ToastService.Toast("No Data Found", "default");
            }
        } catch{
            this.handleError()
        }
    }



    AttendanceData = async (data) => {

        const { client, entity, branch, department, uid, batch } = data
        let today = new Date(), year = today.getFullYear(),
            month = today.getMonth() + 1;

        try {
            let params = `client=${client}&entity=${entity}&branch=${branch}&department=${department}&batch=${batch}&uid=${uid}&month=${month}&year=${year}`
          
            let res = await studentAttendance(params)
            if (res && res.data.statusCode === 1) {
                let studentAttendance = res.data.data
              
                this.setState({
                    studentAttendance: studentAttendance
                })
            } else {
                return [{
                    absent: 0,
                    name: "",
                    present: 0,
                    studentId: "",
                    total: 0
                }
                ]
            }
        } catch{
            this.handleError()
        }
    }



    //Homework Data Generation 
    HomeworkData = async (data) => {
        const {  client, entity, branch, department, batch } = data
       
        try {
            let params = `client=${client}&entity=${entity}&branch=${branch}&department=${department}&batch=${batch}&type=homework`
            let res = await scheduleTypeId(params)
          
            if (res && res.data.statusCode === 1) {
                let holidayData = res.data.data
                this.setState({
                    homeworkData: holidayData,
                    homeworkTable: true
                })
            } else {
                // ToastService.Toast("No Data Found", "default");
            }
        } catch{
            this.handleError()
        }
    }

    //Event Data Generation 
    ScheduleType = async (data) => {
        const {  client, entity, branch, department, batch } = data
        try {
            let params = `client=${client}&entity=${entity}&branch=${branch}&department=${department}&batch=${batch}&type=event`
            let res = await scheduleTypeId(params)
            if (res && res.data.statusCode === 1) {
                let eventData = res.data.data
                this.setState({
                    eventData: eventData,
                    eventTable: true
                })
            } else {
                // ToastService.Toast("No Data Found", "default");
            }
        } catch{
            this.handleError()
        }
    }
    //circular data get from api
    circularGeneration = async (data) => {
        const { userType, client, entity, branch } = data;
        let params;
        try {
            if (userType === "entity") {
                params = `client=${client}&entity=${entity}`;
            } else {
                params = `client=${client}&entity=${entity}&branch=${branch}`;
            }
            let res = await circular(params);
            if (res && res.data && res.data.statusCode === 1) {
                let circular = res.data.data;
              
                await this.setState({
                    circularData: circular,
                    circulardiv: true
                })
            } else {
                await this.setState({
                    circularData: [],
                    circulardiv: true
                })

            }
        }
        catch{
            this.handleError()
        }
    }

    //circular div creation 
    circulardata() {
        const { circularData } = this.state;
        if (circularData.length > 0) {
            return circularData.map((_data, index) => {
                return <tr className="circularcontentDiv" >
                    <td>
                        <div className="d-flex align-items-center">
                            <div className="mr-3">
                                <span className="btn bg-primary-400 rounded-round btn-icon btn-sm">
                                    <span className="letter-icon"><FAIcons.FaFileAlt /></span>
                                </span>
                            </div>
                            <div>
                                <span className="text-default font-weight-semibold letter-icon-title title">{_data.title}</span>
                                <div className="text-muted font-size-sm description"><i className="icon-checkmark3 font-size-sm mr-1"></i>{_data.description}</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span className="text-muted font-size-sm date">{_data.from}</span>
                    </td>
                    <td>
                        <span className="text-muted font-size-sm date">{_data.to}</span>
                    </td>
                </tr>
            })
        } else {
            return <div className="circularcontentDiv">
                <p className="noDatatext">No Data Available!</p>
            </div>
        }
    }


    //course data get from api
    courseDataGeneration = async (data) => {
        const { client, entity, branch, department, batch } = data
        try {
            let params = `client=${client}&entity=${entity}&branch=${branch}&department=${department}&batch=${batch}&type=course`;
          
            let res = await scheduleTypeId(params);
          
            if (res && res.data.statusCode === 1) {
                let courseData = res.data.data
                await this.setState({
                    courseData: courseData,
                    coursediv: true
                })
            } else {
                await this.setState({
                    courseData: [],
                    coursediv: true
                })
            }
        } catch{
            this.handleError()
        }
    }


    courseData() {
        const { courseData } = this.state;
      
        if (courseData.length > 0) {
            return courseData.map((_data, index) => {
                return <Container fluid>
                    <Row>
                        <Col sm={12}>

                            <Row className="coursediv">
                                <Col sm={12}>
                                    <div className="d-flex align-items-center">
                                        <div className="mr-3">
                                            <span className="btn bg-primary-400 btn-icon btn-sm">
                                                <span className="letter-icon">{index + 1}</span>
                                            </span>
                                        </div>
                                        <div>
                                            <span className="coursetitle">{_data.title}</span>
                                            <div className="coursedescription"><p>{_data.desc} </p></div>
                                        </div>
                                    </div>
                                </Col>
                                <Col sm={12} style={{ textAlign: 'right', margin: '0px', padding: '0px', }}>
                                    <FAIcons.FaCalendarAlt style={{ color: '#607d8bba' }} /> <span className="text-muted font-size-sm date">{_data.from.date}   - {_data.to.date}</span>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Container>
            })
        } else {

        }
    }


    //course data get from api
    assignmentDataGeneration = async (data) => {
        const { client, entity, branch, department, batch } = data
        try {
            let params = `client=${client}&entity=${entity}&branch=${branch}&department=${department}&batch=${batch}&type=assignment`;
         
            let res = await scheduleTypeId(params);
           
            if (res && res.data.statusCode === 1) {
                let assignmentData = res.data.data
                await this.setState({
                    assignmentData: assignmentData,
                    assignmentdiv: true
                })
            } else {
                await this.setState({
                    assignmentData: [],
                    assignmentdiv: true
                })
            }
        } catch{
            this.handleError()
        }
    }


    assignmentData() {
        const { assignmentData } = this.state;
     
        if (assignmentData.length > 0) {
            return assignmentData.map((_data, index) => {
                return <Container fluid>
                    <Row>
                        <Col sm={12}>

                            <Row className="assignmentdiv">
                                <Col sm={12}>
                                    <div className="d-flex align-items-center">
                                        <div className="mr-3">
                                            <span className="btn bg-primary-400 btn-icon btn-sm">
                                                <span className="letter-icon">{index + 1}</span>
                                            </span>
                                        </div>
                                        <div>
                                            <span className="coursetitle">{_data.title}</span>
                                            <div className="coursedescription"><p>{_data.desc} </p></div>
                                        </div>
                                    </div>
                                </Col>
                                <Col sm={12} style={{ textAlign: 'right', margin: '0px', padding: '0px', }}>
                                    <FAIcons.FaCalendarAlt style={{ color: '#607d8bba' }} /> <span className="text-muted font-size-sm date">{_data.from.date}   - {_data.to.date}</span>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Container>
            })
        } else {

        }
    }

    //Birthday list
    BirthdayData = async (data) => {
        const { userType, client, entity, branch, department, batch,  } = data
        try {
            let params = `usersList?client=${client}&type=${userType}&entity=${entity}&branch=${branch}&department=${department}&batch=${batch}`;

            let res = await getsuserListData(params);
            if (res && res.data && res.data.statusCode === 1) {
              

            } else {
                // ToastService.Toast("No Data Found", "default");
            }

        } catch (err) {
            this.handleError(err)
        }
    }

    handleError(...err) {
        //return ToastService.Toast("Somthig went wrong.Please try again later", "default");
    }
    render() {
        const { data, countObj, holidayData, holidayTable, coursediv, eventTable, eventData, TimetableData, TimeTable, feeCollectionDiv, studentAttendance, assignmentdiv } = this.state
       
        let userType = data && data.userType;
        let toClientPage1, toClientPage2, toClientPage3, toClientPage4, toClientPage5;
        switch (userType) {
            case "sadmin":
                toClientPage1 = "client/list";
                toClientPage2 = "client/list";
                toClientPage3 = "client/list";
                toClientPage4 = "client/list";
                toClientPage5 = "client/list";
                break;
            case "client":
                toClientPage1 = "client/list";
                toClientPage2 = `${data.client}/entity/list`;
                toClientPage3 = "/dashboard";
                toClientPage4 = "/dashboard";
                toClientPage5 = "/dashboard";
                break;
            case "entity":
                toClientPage1 = "client/list";
                toClientPage2 = "/dashboard";
                toClientPage3 = `${data.client}/${data.entity}/branch/list`;
                toClientPage4 = "/dashboard";
                toClientPage5 = "/dashboard";
                break;
            case "branch":
                toClientPage1 = "client/list";
                toClientPage2 = "/dashboard";
                toClientPage3 = "/dashboard";
                toClientPage4 = `${data.client}/${data.entity}/${data.branch}/department/list`;
                toClientPage5 = "/dashboard";
                break;

            default:
                break;
        }

        const piedata = {
            labels: [
                'Absent',
                'Present',
                'Total'
            ],
            datasets: [{
                data: [studentAttendance && studentAttendance[0].absent, studentAttendance && studentAttendance[0].present, studentAttendance && studentAttendance[0].total

                ],
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56'
                ],
                hoverBackgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56'
                ]
            }]
        }
        var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var d = new Date();
        var dayName = days[d.getDay()];

        return (
            <Fragment >
                {data && data.userType !== 'student' && data.userType !== 'staff' && data.userType !== 'parent' &&
                    <div className="dashboardflexdiv">
                        {data.userType !== 'client' && data.userType !== 'entity' &&
                            <DashboardItem value={countObj && countObj.noClient} title="Total Client" icon="fa fa-list-alt" props={this.props} toLink={toClientPage1} className="myCard todo" iconclass="iconstyle iconbgclr1" />
                        }
                        {data.userType !== 'entity' &&
                            <DashboardItem value={countObj && countObj.noEntity} title="Total Entity" icon="fa fa-list-ul" props={this.props} toLink={toClientPage2} className="myCard todo" iconclass="iconstyle iconbgclr2" />
                        }
                        <DashboardItem value={countObj && countObj.noBranch} title="Total Branch" icon="fa fa-address-card-o" props={this.props} toLink={toClientPage3} className="myCard todo" iconclass="iconstyle iconbgclr3" />

                        <DashboardItem value={countObj && countObj.noDepartment} title="Total Department" icon="fa fa-users" props={this.props} toLink={toClientPage4} className="myCard todo" iconclass="iconstyle iconbgclr4" />

                        <DashboardItem value={countObj && countObj.noBatch} title="Total Batch" icon="fa fa-users" props={this.props} toLink={toClientPage5} className="myCard todo" iconclass="iconstyle iconbgclr5" />

                        <DashboardItem value={countObj && countObj.noStaff} title="Total Staffs" icon="fa fa-users" props={this.props} toLink="/users" className="myCard todo" iconclass="iconstyle iconbgclr6" />

                        <DashboardItem value={countObj && countObj.noStudent} title="Total Students" icon="fa fa-users" props={this.props} toLink="/users" className="myCard todo" iconclass="iconstyle iconbgclr7" />
                    </div>
                }
                <Container fluid>
                    {data && data.userType !== 'staff' && data.userType !== 'parent' && data.userType !== 'sadmin' &&
                        <Row>
                            <Col sm={7}>

                                {coursediv &&
                                    <section>

                                        <div className="todo">
                                            <div className="courseheadDiv">
                                                <h5>Course Details</h5>
                                                {/* <Row className="coursehead">
                                            <Col sm={7}><p>Title</p></Col>
                                            <Col sm={5}><p>Date</p></Col>
                                        </Row> */}
                                                {this.courseData()}
                                            </div>


                                        </div>
                                    </section>
                                }


                            </Col>
                            <Col sm={5}>


                                {studentAttendance &&
                                    <section>
                                        <div className="todo">
                                            <div className="courseheadDiv">
                                                <h5>Student Attendance Data</h5>
                                            </div>
                                            <Pie data={piedata} />
                                        </div>
                                    </section>
                                }


                            </Col>
                        </Row>

                    }

                    {data && data.userType !== 'parent' && data.userType !== 'sadmin' && data.userType !== 'client' &&

                        <div>
                            <Nav tabs>
                                <NavItem>
                                    <NavLink
                                        className={classnames({ active: this.state.activeTab === 'holiday' })}
                                        onClick={() => { this.toggle('holiday'); }}
                                    >
                                        Holiday
                            </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        className={classnames({ active: this.state.activeTab === 'event' })}
                                        onClick={() => { this.toggle('event'); }}
                                    >
                                        Event
                            </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        className={classnames({ active: this.state.activeTab === 'timetable' })}
                                        onClick={() => { this.toggle('timetable'); }}
                                    >
                                        Time Table
                            </NavLink>
                                </NavItem>
                            </Nav>
                            <br />
                            <TabContent activeTab={this.state.activeTab}>
                                <TabPane tabId="holiday">
                                    <Row>
                                        <Col sm="12">


                                            {holidayTable &&
                                                <section>
                                                    <div className="todo">
                                                        <h5>Holiday</h5>
                                                        <BootstrapTable keyField='id' data={holidayData} columns={holidayColumns} noDataIndication={'No data to display here'} />
                                                    </div>
                                                </section>

                                            }


                                        </Col>
                                    </Row>
                                </TabPane>
                                <TabPane tabId="event">
                                    <Row>
                                        <Col sm="12">

                                            {eventTable &&
                                                <section>
                                                    <div className="todo">
                                                        <h5>Events</h5>
                                                        <BootstrapTable keyField='id' data={eventData} columns={eventColumns} noDataIndication={'No data to display here'} />
                                                    </div>
                                                </section>
                                            }

                                        </Col>
                                    </Row>
                                </TabPane>
                                <TabPane tabId="timetable">
                                    <Row>
                                        <Col sm="12">

                                            {TimeTable &&
                                                <section>
                                                    <div className="todo">
                                                        <div className="timetableheadDiv">
                                                            <h5>TimeTable ({dayName}) </h5>
                                                        </div>
                                                        <BootstrapTable keyField='id' data={TimetableData} columns={timetableColumns} noDataIndication={'No data to display here'} />
                                                    </div>
                                                </section>
                                            }

                                        </Col>
                                    </Row>
                                </TabPane>
                            </TabContent>
                        </div>
                    }

                    <div>
                        <Row>
                            <Col sm={12}>

                                {assignmentdiv &&
                                    <section>

                                        <div className="todo">
                                            <div className="courseheadDiv">
                                                <h5>Assignment Details</h5>
                                                {this.assignmentData()}
                                            </div>


                                        </div>
                                    </section>
                                }

                                {feeCollectionDiv &&
                                    <section>
                                        this.feeCollectionDiv()
                            </section>

                                }

                            </Col>
                        </Row>
                    </div>

                </Container>
            </Fragment >
        );
    }
}

